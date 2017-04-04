from flask import Flask
from flask import render_template

import numpy as np
import random
import json
import pandas as pd
import math

from scipy.spatial.distance import cdist
from sklearn.preprocessing import normalize, MinMaxScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn import metrics
from sklearn.manifold import MDS


def find_best_k():
    no_of_cluster = range(1, 25)
    clusters_list = list()
    centroid_list = list()
    euclidean_distance_list = list()
    min_distance_list = list()
    average_squared_sum_list = list()
    elbow_list = list()


    # Create clusters with different k values
    for cluster in no_of_cluster:
        clusters_list.append(KMeans(n_clusters=cluster).fit(premier_league_data.values))

    # Find the centroid of each cluster
    for cluster in clusters_list:
        centroid_list.append(cluster.cluster_centers_)

    # Compute the distance between centroid of a cluster and each value
    for centroid in centroid_list:
        euclidean_distance_list.append(cdist(premier_league_data.values, centroid, 'euclidean'))

    # Find the minimum distance column wise for each distance in the euclidean_distance_list
    for distance in euclidean_distance_list:
        min_distance_list.append(np.min(distance, axis=1))

    # Calculate the average squared sum for each distance
    for dist in min_distance_list:
        average_squared_sum_list.append(sum(dist) / premier_league_data.values.shape[0])

    for cluster in no_of_cluster:
        elbow_dict = dict()
        elbow_dict[cluster] = {'K': cluster, 'AvgSS': average_squared_sum_list[cluster-1]}
        elbow_list.append(elbow_dict[cluster])

    return elbow_list


def find_scree_values(no_of_columns, sample_of_players, components):
    scree_value_list = list()
    scree_features_list = list()
    ssloading_list = list()
    loading_dict = dict()

    for i in range(1, len(list(sample_of_players))):
        scree_feature_dict = dict()
        ssloading = 0
        #ssloading = math.log(float(components[0][i-1]**2 + components[1][i-1]**2))
        for j in range(0, len(components)):
            ssloading = ssloading + float(components[j][i - 1] ** 2)
        ssloading_list.append(ssloading)
        loading_dict[ssloading] = list(sample_of_players)[i-1]

        scree_feature_dict[i] = {'Column': list(sample_of_players)[i-1], 'SSLoadings': ssloading}
        scree_features_list.append(scree_feature_dict[i])

    top_3_features_loadings = sorted(ssloading_list, reverse=True)[:3]
    for loading in loading_dict:
        if top_3_features_loadings[0] == loading:
            first_col = loading_dict[loading]
        elif top_3_features_loadings[1] == loading:
            second_col = loading_dict[loading]
        elif top_3_features_loadings[2] == loading:
            third_col = loading_dict[loading]

    top_loadings = [first_col, second_col, third_col]
    pca = PCA(n_components=no_of_columns).fit(sample_of_players)
    for i in range(1, no_of_columns):
        scree_dict = dict()
        scree_dict[i] = {'PCA': i, 'Variance': pca.explained_variance_ratio_[i-1]*100}
        scree_value_list.append(scree_dict[i])

    return scree_value_list, scree_features_list, top_loadings


def random_sampling():
    samples_required = len(premier_league_data) * sample_percent
    sample_of_players = random.sample(premier_league_data.index, int(samples_required))
    return premier_league_data.ix[sample_of_players]


def adaptive_sampling(no_of_clusters):
    cluster_features = list()

    # Perform K-Means Clustering
    clusters = KMeans(n_clusters=no_of_clusters).fit(premier_league_data)

    # Add a column called 'cluster_no' in the data frame
    premier_league_data['cluster_no'] = clusters.labels_

    for i in range(no_of_clusters):
        # Get the number of samples in that particular cluster based on the sample percent
        samples_required = len(premier_league_data[premier_league_data['cluster_no'] == i]) * sample_percent
        # Find the samples(rows) that are a part of the i'th cluster. Run for all the features in a cluster
        data_from_cluster = premier_league_data[premier_league_data['cluster_no'] == i]
        # Get a random sample of the players from a particular cluster
        cluster_features.append(premier_league_data.ix[random.sample(data_from_cluster.index, int(samples_required))])

    # Combine the data for a particular player from all the features (columns) selected
    adaptive_sample_data = pd.concat(cluster_features)

    # Delete column 'cluster_no' from the data frame
    del adaptive_sample_data['cluster_no']

    return adaptive_sample_data


def calculate_mds(pca, sample_of_players, distance_metric, sampling_method):
    distance_matrix = metrics.pairwise_distances(sample_of_players, metric=distance_metric)
    mds = MDS(n_components=2, dissimilarity='precomputed')
    mds = mds.fit_transform(distance_matrix)

    sample_player_names = list()
    for value in sample_of_players.index.values:
        sample_player_names.append(player_names[value])

    se = pd.DataFrame(sample_player_names)
    mds = np.concatenate((mds, se), axis=1)

    mds_values = pd.DataFrame(mds)
    mds_values.columns = ['MDS1', 'MDS2', 'Name']
    # print mds_values

    json_values = mds_values.to_json(orient='records')

    if distance_metric is 'euclidean' and sampling_method is 'adaptive':
        with open('static/mdsjson/mds_euclidean_adaptive_json.json', 'w') as f:
            f.write(json_values)
    elif distance_metric is 'correlation' and sampling_method is 'adaptive':
        with open('static/mdsjson/mds_correlation_adaptive_json.json', 'w') as f:
            f.write(json_values)
    elif distance_metric is 'euclidean' and sampling_method is 'random':
        with open('static/mdsjson/mds_euclidean_random_json.json', 'w') as f:
            f.write(json_values)
    elif distance_metric is 'correlation' and sampling_method is 'random':
        with open('static/mdsjson/mds_correlation_random_json.json', 'w') as f:
            f.write(json_values)


app = Flask(__name__)


@app.route("/")
def index():
    return render_template('index.html')


@app.route("/randomsampling")
def randomsampling():
    random_json = []

    # Implement random sampling
    random_sample_of_players = random_sampling()
    # json_random_sample = random_sample_of_players.to_json(orient='records')
    # with open('static/samplingjson/random.json', 'w') as f:
    #     json.dump(json_random_sample, f)

    # Perform PCA on the sampled data based on best PCA attributes
    pca = PCA(n_components=2).fit(random_sample_of_players)

    # Find best value from Scree plot
    scree_values, scree_features, top_cols = find_scree_values(len(random_sample_of_players.columns), random_sample_of_players
                                                     , pca.components_)
    with open('static/screejson/scree_random_json.json', 'w') as f:
        json.dump(scree_values, f)

    with open('static/screejson/scree_features_random_json.json', 'w') as f:
        json.dump(scree_features, f)

    pca = pca.transform(random_sample_of_players)

    calculate_mds(pca, random_sample_of_players, 'euclidean', 'random')
    calculate_mds(pca, random_sample_of_players, 'correlation', 'random')

    sample_player_names = list()
    for value in random_sample_of_players.index.values:
        sample_player_names.append(player_names[value])

    se = pd.DataFrame(sample_player_names)
    pca = np.concatenate((pca, se), axis=1)
    #print pca

    pca_values = pd.DataFrame(pca)
    pca_values.columns = ['PCA1', 'PCA2', 'Name']
    json_values = pca_values.to_json(orient='records')

    with open('static/playerjson/pca_values_random_json.json', 'w') as f:
        f.write(json_values)

    # Create JSON for plotting scatterplot matrix
    # scatterplot_matrix_pca = PCA(n_components=3).fit(random_sample_of_players)
    # scatterplot_matrix_pca = scatterplot_matrix_pca.transform(random_sample_of_players)
    scatterplot_matrix_pca_values = pd.read_csv("Premier League 2011-12.csv", header=0,
               usecols=top_cols)
    scatterplot_matrix_pca_values.columns = top_cols
    json_values = scatterplot_matrix_pca_values.to_json(orient='records')

    with open('static/scatterplotmatrixjson/scatterplot_matrix_random.json', 'w') as f:
        f.write(json_values)

    # with open("static/samplingjson/random.json") as json_file:
    #     random_data = json.load(json_file)
    #     for data in random_data:
    #         random_json.append(data)
    #     random_json = json.dumps(random_json)
    return ('', 204)


@app.route("/adaptivesampling")
def adaptivesampling():
    adaptive_json = []
    # Implement adaptive sampling
    # Find best value of k by elbow method
    elbow_values = find_best_k()
    with open('static/kmeansjson/kmeans_json.json', 'w') as f:
        json.dump(elbow_values, f)

    # No. of clusters is obtained from find_best_k()
    no_of_clusters = 5
    adaptive_sample_of_players = adaptive_sampling(no_of_clusters)
    #json_adaptive_sample = adaptive_sample_of_players.to_json(orient='records')
    # with open('static/samplingjson/adaptive.json', 'w') as f:
    #     json.dump(json_adaptive_sample, f)

    # Perform PCA on the sampled data based on best PCA attributes
    pca = PCA(n_components=5).fit(adaptive_sample_of_players)

    # Find best value from Scree plot
    scree_values, scree_features, top_cols = find_scree_values(len(adaptive_sample_of_players.columns),
                                                     adaptive_sample_of_players, pca.components_)
    with open('static/screejson/scree_adaptive_json.json', 'w') as f:
        json.dump(scree_values, f)

    with open('static/screejson/scree_features_adaptive_json.json', 'w') as f:
        json.dump(scree_features, f)

    pca = pca.transform(adaptive_sample_of_players)

    calculate_mds(pca, adaptive_sample_of_players, 'euclidean', 'adaptive')
    calculate_mds(pca, adaptive_sample_of_players, 'correlation', 'adaptive')

    sample_player_names = list()
    for value in adaptive_sample_of_players.index.values:
        sample_player_names.append(player_names[value])

    se = pd.DataFrame(sample_player_names)
    pca = np.concatenate((pca, se), axis=1)

    pca_values = pd.DataFrame(pca)
    pca_values.columns = ['PCA1', 'PCA2', 'PCA3', 'PCA4', 'PCA5', 'Name']
    json_values = pca_values.to_json(orient='records')

    with open('static/playerjson/pca_values_adaptive_json.json', 'w') as f:
        f.write(json_values)

    # Create JSON for plotting scatterplot matrix
    #scatterplot_matrix_pca = PCA(n_components=3).fit(adaptive_sample_of_players)
    #scatterplot_matrix_pca = scatterplot_matrix_pca.transform(adaptive_sample_of_players)
    scatterplot_matrix_pca_values = pd.read_csv("Premier League 2011-12.csv", header=0,
                                                usecols=top_cols)
    scatterplot_matrix_pca_values.columns = top_cols
    #scatterplot_matrix_pca_values = pd.DataFrame(scatterplot_matrix_pca)
    #scatterplot_matrix_pca_values.columns = ['PCA1', 'PCA2', 'PCA3']


    json_values = scatterplot_matrix_pca_values.to_json(orient='records')

    with open('static/scatterplotmatrixjson/scatterplot_matrix_adaptive.json', 'w') as f:
        f.write(json_values)

    # with open("static/samplingjson/adaptive.json") as json_file:
    #     adaptive_data = json.load(json_file)
    #     for data in adaptive_data:
    #         adaptive_json.append(data)
    # adaptive_json = json.dumps(adaptive_json)
    return ('', 204)


@app.route("/kmeans")
def kmeans():
    kmeans_json = []
    with open("static/kmeansjson/kmeans_json.json") as json_file:
        kmeans_data = json.load(json_file)
        for data in kmeans_data:
            kmeans_json.append(data)
    kmeans_json = json.dumps(kmeans_json)
    return kmeans_json


@app.route("/scree")
def scree():
    scree_json = []
    with open("static/screejson/scree_json.json") as json_file:
        scree_data = json.load(json_file)
        for data in scree_data:
            scree_json.append(data)
    scree_json = json.dumps(scree_json)
    return scree_json


@app.route("/players")
def players():
    players_json = []
    with open("static/playerjson/pca_values_json.json") as json_file:
        pca_data = json.load(json_file)
        for data in pca_data:
            players_json.append(data)
    players_json = json.dumps(players_json)
    return players_json


@app.route("/euclideanmds")
def euclideanmds():
    euclidean_mds_json = []
    with open("static/mdsjson/mds_euclidean_json.json") as json_file:
        mds_data = json.load(json_file)
        for data in mds_data:
            euclidean_mds_json.append(data)
    euclidean_mds_json = json.dumps(euclidean_mds_json)
    return euclidean_mds_json


@app.route("/correlationmds")
def correlationmds():
    correlation_mds_json = []
    with open("static/mdsjson/mds_correlation_json.json") as json_file:
        mds_data = json.load(json_file)
        for data in mds_data:
            correlation_mds_json.append(data)
    correlation_mds_json = json.dumps(correlation_mds_json)
    return correlation_mds_json


@app.route("/scatterplotmatrix")
def scatterplotmatrix():
    scatterplot_matrix_json = []
    with open("static/scatterplotmatrixjson/scatterplot_matrix.json") as json_file:
        scatterplot_matrix_data = json.load(json_file)
        for data in scatterplot_matrix_data:
            scatterplot_matrix_json.append(data)
    scatterplot_matrix_json = json.dumps(scatterplot_matrix_json)
    return scatterplot_matrix_json


if __name__ == "__main__":
    premier_league_data = pd.read_csv("Premier League 2011-12.csv", header=0, index_col=0,
                                      usecols=['Player Surname', 'Time Played', 'Goals', 'Assists', 'Clean Sheets',
                                             'Saves from Penalty', 'Saves Made', 'Yellow Cards', 'Red Cards',
                                             'Successful Dribbles', 'Shots Off Target inc woodwork',
                                             'Shots On Target inc goals', 'Key Passes', 'Big Chances',
                                             'Successful crosses in the air', 'Total Clearances', 'Blocks',
                                             'Interceptions', 'Recoveries', 'Tackles Won', 'Winning Goal',
                                             'Total Successful Passes All', 'Penalties Conceded',
                                             'Error leading to Goal', 'Error leading to Attempt',
                                             'Tackles Lost', 'Total Fouls Conceded', 'Offsides'])

    sample_percent = 0.5
    player_names = list(premier_league_data.index.values)
    premier_league_data.index.names = ['Player Name']
    premier_league_data.columns.names = ['Attributes']
    scaler = MinMaxScaler()
    premier_league_data = pd.DataFrame(scaler.fit_transform(premier_league_data), columns=premier_league_data.columns)

    app.run(host='0.0.0.0', port=8086, debug=True, use_reloader=False)