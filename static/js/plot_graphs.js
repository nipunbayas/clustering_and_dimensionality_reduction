    /**
     * Created by Nipun on 25-03-2017.
     */

    getRandomSamples();
    getAdaptiveSamples();

    var screeFile = 'static/screejson/scree_adaptive_json.json',
        screeFeaturesFile = 'static/screejson/scree_features_adaptive_json.json',
        kmeansFile = 'static/kmeansjson/kmeans_json.json',
        pcaFile = 'static/playerjson/pca_values_adaptive_json.json',
        scatterplotMatrixFile = 'static/scatterplotmatrixjson/scatterplot_matrix_adaptive.json',
        euclideanMdsFile = 'static/mdsjson/mds_euclidean_adaptive_json.json',
        correlationMdsFile = 'static/mdsjson/mds_correlation_adaptive_json.json';

    // d3.select('#sampling').on('change', function() {
    //     var samplingType = d3.event.target.value;
    //     if(samplingType === 'random_sampling') {
    //         document.getElementById('kmeanstab').style.visibility = 'hidden';
    //         performRandomSamplingActions();
    //     }
    //     else if(samplingType === 'adaptive_sampling') {
    //         document.getElementById('kmeanstab').style.visibility = 'visible';
    //         performAdaptiveSamplingActions();
    //     }
    //
    // });

    function getRandomSamples() {
        queue()
            .defer(d3.json, "/randomsampling");
    }

    function performRandomSamplingActions() {
        document.getElementById('kmeanstab').style.visibility = 'hidden';

        screeFile = 'static/screejson/scree_random_json.json',
        screeFeaturesFile = 'static/screejson/scree_features_random_json.json',
        pcaFile = 'static/playerjson/pca_values_random_json.json',
        scatterplotMatrixFile = 'static/scatterplotmatrixjson/scatterplot_matrix_random.json',
        euclideanMdsFile = 'static/mdsjson/mds_euclidean_random_json.json',
        correlationMdsFile = 'static/mdsjson/mds_correlation_random_json.json';

        makeScatterPlot();
        }

    function getAdaptiveSamples() {
        queue()
            .defer(d3.json, "/adaptivesampling");
    }

    function performAdaptiveSamplingActions() {
        document.getElementById('kmeanstab').style.visibility = 'visible';

        screeFile = 'static/screejson/scree_adaptive_json.json',
        screeFeaturesFile = 'static/screejson/scree_features_adaptive_json.json',
        kmeansFile = 'static/kmeansjson/kmeans_json.json',
        pcaFile = 'static/playerjson/pca_values_adaptive_json.json',
        scatterplotMatrixFile = 'static/scatterplotmatrixjson/scatterplot_matrix_adaptive.json',
        euclideanMdsFile = 'static/mdsjson/mds_euclidean_adaptive_json.json',
        correlationMdsFile = 'static/mdsjson/mds_correlation_adaptive_json.json';

        makeScatterPlot();
        }


    function checkTab(evt, tabName) {
        // Declare all variables
        var i, tabcontent, tabStyles;

        // Get all elements with class="tabcontent" and hide them
        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }

        // Get all elements with class="tabStyle" and remove the class "active"
        tabStyles = document.getElementsByClassName("tabStyle");
        for (i = 0; i < tabStyles.length; i++) {
            tabStyles[i].className = tabStyles[i].className.replace(" active", "");
        }

        // Show the current tab, and add an "active" class to the button that opened the tab
        document.getElementById(tabName).style.display = "block";
        evt.currentTarget.className += " active";

        if(tabName === 'scatter') {
            makeScatterPlot();
        }
        else if(tabName === 'kmeans') {
            makeKmeansPlot();
        }
        else if(tabName === 'mds') {
            makeMdsPlot();
        }
        else if(tabName === 'scatter3d') {
            make3DScatterPlot();
        }
        else {
            makeScreePlot();
        }
    }

    var margin = {top: 20, right: 20, bottom: 30, left: 60},
        width = 960 - margin.left - margin.right,
        height = 430 - margin.top - margin.bottom;

    function makeScatterPlot() {

        queue()
        .defer(d3.json, pcaFile)
        .await(drawScatterPlot);

        d3.select("#canvas").remove();

        var xValue = function(d) { return d.PCA1; };
        var xScale = d3.scale.linear().domain([-2, 2]).range([0, width]);
        var xMap = function(d) { return xScale(xValue(d)); };
        var xAxis = d3.svg.axis().scale(xScale).orient("bottom");

        var yValue = function(d) { return d.PCA2; };
        var yScale = d3.scale.linear().domain([-2, 2]).range([height, 0]);
        var yMap = function(d) { return yScale(yValue(d)); };
        var yAxis = d3.svg.axis().scale(yScale).orient("left");

        var color = d3.scale.category10();

        var svg = d3.select("#makeScatter").append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .attr("id", "canvas")
                    .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var tooltip = d3.select("#makeScatter").append("div")
                        .attr("class", "tooltip")
                        .style("opacity", 0);


        function drawScatterPlot(error, playersJson) {
            var playersData = playersJson;

            if(Math.abs(d3.min(playersData, xValue)) > d3.max(playersData, xValue))
                xScale.domain([d3.min(playersData, xValue)-0.2, -d3.min(playersData, xValue)+0.2]);
            else
                xScale.domain([-d3.max(playersData, xValue)-0.2, d3.max(playersData, xValue)+0.2]);

            if(Math.abs(d3.min(playersData, yValue)) > d3.max(playersData, yValue))
                yScale.domain([d3.min(playersData, yValue)-0.2, -d3.min(playersData, yValue)+0.2]);
            else
                yScale.domain([-d3.max(playersData, yValue)-0.2, d3.max(playersData, yValue)+0.2]);

            // Draw the X-Axis
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + yScale(0) + ")")
                .call(xAxis)
                .append("text")
                    .attr("class", "label")
                    .attr("x", width)
                    .attr("y", -6)
                    .style("text-anchor", "end")
                    .style("font-weight", "bold")
                    .style("font-size", "1.2em")
                    .text("PCA-1");

            // Draw the Y-Axis
            svg.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate("+ xScale(0) + ", 0)")
                .call(yAxis)
                .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("x", 10)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end")
                    .style("font-weight", "bold")
                    .style("font-size", "1.2em")
                    .text("PCA-2");

            var points = svg.selectAll(".points")
                            .data(playersData);
            points.enter().append("circle")
                    .attr("class", "dot")
                    .transition()
                    .duration(1000)
                    .ease("backOut")
                    .attr("r", 3.5)
                    .attr("cx", xMap)
                    .attr("cy", yMap)
                    .style("fill", function(d) { return color(d); });

            points.on("mouseover", function(d) {
                        tooltip.transition()
                            .duration(200)
                            .style("opacity", .9);
                        tooltip.html(d.Name + " (" + xValue(d) + ", " + yValue(d) + ")")
                            .style("left", (d3.event.pageX + 5) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                    })
                    .on("mouseout", function(d) {
                        tooltip.transition()
                            .duration(500)
                            .style("opacity", 0);
                    });
        }

    }


    function makeKmeansPlot() {

        queue()
        .defer(d3.json, kmeansFile)
        .await(drawKmeansPlot);

        d3.select("#canvas").remove();

        var xValue = function(d) { return d.K; };
        var xScale = d3.scale.linear().range([0, width]);
        var xMap = function(d) { return xScale(xValue(d)); };
        var xAxis = d3.svg.axis().scale(xScale).orient("bottom");

        var yValue = function(d) { return d.AvgSS; };
        var yScale = d3.scale.linear().range([height, 0]);
        var yMap = function(d) { return yScale(yValue(d)); };
        var yAxis = d3.svg.axis().scale(yScale).orient("left");

        var color = d3.scale.category10();

        var valueLine = d3.svg.line()
                            .x(function(d) { return xScale(d.K); })
                            .y(function(d) { return yScale(d.AvgSS); });

        var svg = d3.select("#makeKmeans").append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .attr("id", "canvas")
                        .append("g")
                            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var g = svg.append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var tooltip = d3.select("#makeKmeans").append("div")
                        .attr("class", "tooltip")
                        .style("opacity", 0);

        function drawKmeansPlot(error, kmeansJson) {
            if(error) throw error;
            var kmeansData = kmeansJson;

            xScale.domain([d3.min(kmeansData, xValue) - 1, d3.max(kmeansData, xValue) + 1])
            yScale.domain([d3.min(kmeansData, yValue)-0.1, d3.max(kmeansData, yValue)+0.1])

            // Draw the X-Axis
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .append("text")
                .attr("class", "label")
                .attr("x", width)
                .attr("y", 20)
                .style("text-anchor", "end")
                .style("font-weight", "bold")
                .style("font-size", "1.2em")
                .text("K");

            // Draw the Y-Axis
            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("x", 10)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .style("font-weight", "bold")
                .style("font-size", "1.1em")
                .text("Average SS");

            var path = svg.append("path")
                .attr("class", "line")
                .attr("d", valueLine(kmeansData));

            var totalLength = path.node().getTotalLength();

            path.attr("stroke-dasharray", totalLength + " " + totalLength)
                .attr("stroke-dashoffset", totalLength)
                .transition()
                .duration(1000)
                .ease("linear")
                .tween("line", function () {
                    var interp = d3.interpolateNumber(totalLength, 0);
                    var self = d3.select(this);
                    return function (t) {
                        var offset = interp(t);
                        self.attr("stroke-dashoffset", offset);
                        var xPos = this.getPointAtLength(totalLength - offset).x;
                        g.selectAll(".point").each(function () {
                            var point = d3.select(this);
                            if (xPos > (+point.attr('cx'))) {
                                point.style('opacity', 1);
                            }
                        })
                    };
                });

            var points = svg.selectAll(".points")
                            .data(kmeansData);
            points.enter().append("circle")
                    .attr("class", "dot")
                    .attr("r", function(d) { if(xValue(d) == 5) { return 5.5; } else return 3.5; })
                    .attr("cx", xMap)
                    .attr("cy", yMap)
                    .style("fill", function(d) { if(xValue(d) == 5) { return "red"; } else return "blue"; });

            points.on("mouseover", function(d) {
                        tooltip.transition()
                            .duration(200)
                            .style("opacity", .9);
                        tooltip.html("(" + xValue(d) + ", " + yValue(d) + ")")
                            .style("left", (d3.event.pageX + 5) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
            })
                .on("mouseout", function(d) {
                        tooltip.transition()
                            .duration(500)
                            .style("opacity", 0);
                });

            svg.append("line")
                .style("stroke", "black")
                .style("stroke-dasharray", ("3, 3"))
                .attr("x1", xScale(5))
                .attr("y1", height)
                .attr("x2", xScale(5))
                .attr("y2", yScale(xScale(5)));
        }
    }

    function makeScreePlot() {

        queue()
        .defer(d3.json, screeFile)
        .defer(d3.json, screeFeaturesFile)
        .await(drawScreePlot);

        d3.select("#canvas").remove();
        d3.select("#canvas2").remove();

        var width = 640 - margin.left- margin.right;
        var height = 460 - margin.top - margin.bottom;

        var xValue = function(d) { return d.PCA; };
        var xScale = d3.scale.linear().range([0, width]);
        var xMap = function(d) { return xScale(xValue(d)); };
        var xAxis = d3.svg.axis().scale(xScale).orient("bottom");

        var yValue = function(d) { return d.Variance; };
        var yScale = d3.scale.linear().range([height, 0]);
        var yMap = function(d) { return yScale(yValue(d)); };
        var yAxis = d3.svg.axis().scale(yScale).orient("left");

        var xValueFeatures = function(d) { return d.Column; };
        var xScaleFeatures = d3.scale.ordinal().domain(function(d) { return d.Column; }).rangeRoundBands([0, width], .05);
        var xMapFeatures = function(d) { return xScaleFeatures(xValueFeatures(d)); };
        var xAxisFeatures = d3.svg.axis().scale(xScaleFeatures).orient("bottom");

        var yValueFeatures = function(d) { return d.SSLoadings; };
        var yScaleFeatures = d3.scale.linear().range([height, 110]);
        var yMapFeatures = function(d) { return yScaleFeatures(yValueFeatures(d)); };
        var yAxisFeatures = d3.svg.axis().scale(yScaleFeatures).orient("left");

        var color = d3.scale.category10();

        var valueLine = d3.svg.line()
                            .x(function(d) { return xScale(d.PCA); })
                            .y(function(d) { return yScale(d.Variance); });

        var chart1 = d3.select("#makeScree").append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .attr("id", "canvas")
                        .append("g")
                            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var g = chart1.append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var chart2 = d3.select("#makeScree").append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .attr("id", "canvas2")
                        .append("g")
                            .attr("transform", "translate(" + (margin.left) + "," + (margin.top-110) + ")");

        var g2 = chart2.append("g")
                        .attr("transform", "translate(" + margin.left + "," + (margin.top-110) + ")");

        var tooltip = d3.select("#makeScree").append("div")
                        .attr("class", "tooltip")
                        .style("opacity", 0);

        function drawScreePlot(error, screeJson, screeFeaturesJson) {
            if(error) throw error;

            var screeData = screeJson;
            var screeFeaturesData = screeFeaturesJson;

            xScale.domain([d3.min(screeData, xValue)-1, d3.max(screeData, xValue)+1]);
            yScale.domain([d3.min(screeData, yValue), d3.max(screeData, yValue)+10]);

            xScaleFeatures.domain(screeFeaturesData.map(function(d) { return d.Column; }));
            yScaleFeatures.domain([d3.min(screeFeaturesData, yValueFeatures), d3.max(screeFeaturesData, yValueFeatures)]);

            // Draw the X-Axis
            chart1.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .append("text")
                .attr("class", "label")
                .attr("x", width)
                .attr("y", -6)
                .style("text-anchor", "end")
                .style("font-weight", "bold")
                .style("font-size", "1.1em")
                .text("PCA");

            // Draw the Y-Axis
            chart1.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", -46)
                .attr("x", 10)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .style("font-weight", "bold")
                .style("font-size", "1.1em")
                .text("Variance Ratio (%)");

            var path = chart1.append("path")
                .attr("class", "line")
                .attr("d", valueLine(screeData));

            var totalLength = path.node().getTotalLength();

            path.attr("stroke-dasharray", totalLength + " " + totalLength)
                .attr("stroke-dashoffset", totalLength)
                .transition()
                .duration(2000)
                .ease("linear")
                .tween("line", function () {
                    var interp = d3.interpolateNumber(totalLength, 0);
                    var self = d3.select(this);
                    return function (t) {
                        var offset = interp(t);
                        self.attr("stroke-dashoffset", offset);
                        var xPos = this.getPointAtLength(totalLength - offset).x;
                        g.selectAll(".point").each(function () {
                            var point = d3.select(this);
                            if (xPos > (+point.attr('cx'))) {
                                point.style('opacity', 1);
                            }
                        })
                    };
                });

            var points = chart1.selectAll(".points")
                            .data(screeData);
            points.enter().append("circle")
                    .attr("class", "dot")
                    .attr("r", function(d) { if(xValue(d) == 5) { return 5.5; } else return 3.5; })
                    .attr("cx", xMap)
                    .attr("cy", yMap)
                    .style("fill", function(d) { if(xValue(d) == 5) { return "red"; } else return "blue"; });
            points.on("mouseover", function(d) {
                        tooltip.transition()
                            .duration(200)
                            .style("opacity", .9);
                        tooltip.html("(" + xValue(d) + ", " + yValue(d) + ")")
                            .style("left", (d3.event.pageX - 5) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
            })
                .on("mouseout", function(d) {
                        tooltip.transition()
                            .duration(500)
                            .style("opacity", 0);
                });

            chart1.append("line")
                .style("stroke", "black")
                .style("stroke-dasharray", ("3, 3"))
                .attr("x1", xScale(5))
                .attr("y1", height)
                .attr("x2", xScale(5))
                .attr("y2", yScale(xScale(5)));

            // Draw the X-Axis for Features Plot
            chart2.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxisFeatures)
                .selectAll("text")
                    .attr("transform", "rotate(-65)")
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em")
                    .style("font-size", "0.7em");

            // Draw the Y-Axis
            chart2.append("g")
                .attr("class", "y axis")
                .call(yAxisFeatures)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", -55)
                .attr("x", -110)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .style("font-weight", "bold")
                .style("font-size", "1.0em")
                .text("Sum of Square Loadings");

            var bars = chart2.selectAll(".bar")
                        .data(screeFeaturesData);

            bars.enter()
                .append("rect")
                .style("fill", "steelblue")
                .attr("x", function(d){ return xScaleFeatures(d["Column"]); } )
                .attr("width", xScaleFeatures.rangeBand())
                .attr("y", height - margin.top - margin.bottom)
                .attr("height", 0)
                .transition()
                    .duration(700)
                    .ease("quad")
                    .attr("y", function(d){ return yScaleFeatures(d["SSLoadings"])+49; })
                    .attr("height", function(d) { return height - margin.top - margin.bottom - yScaleFeatures(d["SSLoadings"]); });

        }
    }


    function makeMdsPlot() {
        queue()
        .defer(d3.json, euclideanMdsFile)
        .defer(d3.json, correlationMdsFile)
        .await(drawMDSPlot);

        d3.select("#canvas").remove();
        d3.select("#canvasEuclid").remove();
        d3.select("#canvasCorr").remove();

        var width = 640 - margin.left- margin.right;
        var height = 460 - margin.top - margin.bottom;

        var xValue = function(d, i) { return d.MDS1; };
        var xScale = d3.scale.linear().range([0, width]);
        var xMap = function(d) { return xScale(xValue(d)); };
        var xAxis = d3.svg.axis().scale(xScale).orient("bottom");

        var yValue = function(d) { return d.MDS2; };
        var yScale = d3.scale.linear().range([height, 0]);
        var yMap = function(d) { return yScale(yValue(d)); };
        var yAxis = d3.svg.axis().scale(yScale).orient("left");

        var xValueCorr = function(d, i) { return d.MDS1; };
        var xScaleCorr = d3.scale.linear().range([0, width]);
        var xMapCorr = function(d) { return xScaleCorr(xValueCorr(d)); };
        var xAxisCorr = d3.svg.axis().scale(xScaleCorr).orient("bottom");

        var yValueCorr = function(d) { return d.MDS2; };
        var yScaleCorr = d3.scale.linear().range([height, 0]);
        var yMapCorr = function(d) { return yScaleCorr(yValueCorr(d)); };
        var yAxisCorr = d3.svg.axis().scale(yScaleCorr).orient("left");

        var color = d3.scale.category10();

        var svgEuclidean = d3.select("#makeMds").append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .attr("id", "canvasEuclid")
                    .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var svgCorrelation = d3.select("#makeMds").append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .attr("id", "canvasCorr")
                    .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var tooltip = d3.select("#makeMds").append("div")
                        .attr("class", "tooltip")
                        .style("opacity", 0);


        function drawMDSPlot(error, euclideanMDSJson, correlationMDSJson) {
            if(error) throw error;

            var euclideanMDSData = euclideanMDSJson;
            var correlationMDSData = correlationMDSJson;
            console.log(correlationMDSData);

            if(Math.abs(d3.min(euclideanMDSData, xValue)) > d3.max(euclideanMDSData, xValue))
                xScale.domain([d3.min(euclideanMDSData, xValue)-0.2, -d3.min(euclideanMDSData, xValue)+0.2]);
            else
                xScale.domain([-d3.max(euclideanMDSData, xValue)-0.2, d3.max(euclideanMDSData, xValue)+0.2]);

            if(Math.abs(d3.min(euclideanMDSData, yValue)) > d3.max(euclideanMDSData, yValue))
                yScale.domain([d3.min(euclideanMDSData, yValue)-0.2, -d3.min(euclideanMDSData, yValue)+0.2]);
            else
                yScale.domain([-d3.max(euclideanMDSData, yValue)-0.2, d3.max(euclideanMDSData, yValue)+0.2]);

            if(Math.abs(d3.min(correlationMDSData, xValueCorr) > d3.max(correlationMDSData, xValueCorr)))
                xScaleCorr.domain([d3.min(correlationMDSData, xValueCorr)-0.7, -d3.min(correlationMDSData, xValueCorr)+0.7]);
            else
                xScaleCorr.domain([-d3.max(correlationMDSData, xValueCorr)-0.7, d3.max(correlationMDSData, xValueCorr)+0.7]);

            if(Math.abs(d3.min(correlationMDSData, yValueCorr)) > d3.max(correlationMDSData, yValueCorr))
                yScaleCorr.domain([d3.min(correlationMDSData, yValueCorr)-0.2, -d3.min(correlationMDSData, yValueCorr)+0.2]);
            else
                yScaleCorr.domain([-d3.max(correlationMDSData, yValueCorr)-0.2, d3.max(correlationMDSData, yValueCorr)+0.2]);

            // Draw the X-Axis
            svgEuclidean.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + yScale(0) + ")")
                .call(xAxis)
                .append("text")
                    .attr("class", "label")
                    .attr("x", width)
                    .attr("y", -6)
                    .style("text-anchor", "end")
                    .style("font-weight", "bold")
                    .style("font-size", "1em")
                    .text("MDS-1");

            // Draw the Y-Axis
            svgEuclidean.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate(" + xScale(0) + ", 0)")
                .call(yAxis)
                .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("x", 10)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end")
                    .style("font-weight", "bold")
                    .style("font-size", "1em")
                    .text("MDS-2");

            var points = svgEuclidean.selectAll(".points")
                            .data(euclideanMDSData);
            points.enter().append("circle")
                    .attr("class", "dot")
                    .transition()
                    .duration(1000)
                    .ease("backOut")
                    .attr("r", 3.5)
                    .attr("cx", xMap)
                    .attr("cy", yMap)
                    .style("fill", function(d) { return color(d); });

            points.on("mouseover", function(d) {
                        tooltip.transition()
                            .duration(200)
                            .style("opacity", .9);
                        tooltip.html(d.Name + "(" + xValue(d) + ", " + yValue(d) + ")")
                            .style("left", (d3.event.pageX + 5) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                    })
                    .on("mouseout", function(d) {
                        tooltip.transition()
                            .duration(500)
                            .style("opacity", 0);
                    });

            // Draw the Correlation X-Axis
            svgCorrelation.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + yScaleCorr(0) + ")")
                .call(xAxisCorr)
                .append("text")
                    .attr("class", "label")
                    .attr("x", width)
                    .attr("y", -6)
                    .style("text-anchor", "end")
                    .style("font-weight", "bold")
                    .style("font-size", "1em")
                    .text("MDS-1");

            // Draw the Y-Axis
            svgCorrelation.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate(" + xScaleCorr(0) + ", 0)")
                .call(yAxisCorr)
                .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("x", 10)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end")
                    .style("font-weight", "bold")
                    .style("font-size", "1em")
                    .text("MDS-2");

            var pointsCorr = svgCorrelation.selectAll(".pointsCorr")
                            .data(correlationMDSData);
            pointsCorr.enter().append("circle")
                    .attr("class", "dot")
                    .transition()
                    .duration(1000)
                    .ease("backOut")
                    .attr("r", 3.5)
                    .attr("cx", xMapCorr)
                    .attr("cy", yMapCorr)
                    .style("fill", "#fc8b0a");

            pointsCorr.on("mouseover", function(d) {
                        tooltip.transition()
                            .duration(200)
                            .style("opacity", .9);
                        tooltip.html(d.Name + " (" + xValueCorr(d) + ", " + yValueCorr(d) + ")")
                            .style("left", (d3.event.pageX + 5) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                    })
                    .on("mouseout", function(d) {
                        tooltip.transition()
                            .duration(500)
                            .style("opacity", 0);
                    });
        }
    }


function make3DScatterPlot() {
        queue()
        .defer(d3.json, scatterplotMatrixFile)
        .await(drawScatterPlotMatrix);

        d3.select("#canvas").remove();

        var width = 960,
        size = 240,
        padding = 45;

    var x = d3.scale.linear().range([padding / 2, size - padding / 2]);
    var y = d3.scale.linear().range([size - padding / 2, padding / 2]);

    var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(6);
    var yAxis = d3.svg.axis().scale(y).orient("left").ticks(6);

    var color = d3.scale.category10();

    function drawScatterPlotMatrix(error, scatterplotMatrixJson) {
      if (error) throw error;

      var scatterplotMatrixData = scatterplotMatrixJson;

      var pcaLoadedAttributes = {},
          components = d3.keys(scatterplotMatrixData[0]),
          n = components.length;

        var col1 = components[0],
            col2 = components[1],
            col3 = components[2]
      components.forEach(function(component) {
        pcaLoadedAttributes[component] = d3.extent(scatterplotMatrixData, function(d) { return d[component]; });
      });

      xAxis.tickSize(size * n);
      yAxis.tickSize(-size * n);

      var svg = d3.select("#makeScatter3d").append("svg")
          .attr("width", size * n + padding)
          .attr("height", size * n + padding)
          .attr("id", "canvas")
        .append("g")
          .attr("transform", "translate(" + padding + "," + padding / 2 + ")");

        var tooltip = d3.select("#makeScatter3d").append("div")
                        .attr("class", "tooltip")
                        .style("opacity", 0)
                        .style("color", "black");

      svg.selectAll(".x.axis2")
          .data(components)
        .enter().append("g")
          .attr("class", "x axis2")
          .attr("transform", function(d, i) { return "translate(" + (n - i - 1) * size + ",0)"; })
          .each(function(d) { x.domain(pcaLoadedAttributes[d]); d3.select(this).call(xAxis); });

        svg.selectAll(".x.axis2")
            .selectAll("text")
            .style("font-size","10px");
            // .attr("transform","rotate(-90)");


      svg.selectAll(".y.axis2")
          .data(components)
        .enter().append("g")
          .attr("class", "y axis2")
          .attr("transform", function(d, i) { return "translate(0," + i * size + ")"; })
          .each(function(d) { y.domain(pcaLoadedAttributes[d]); d3.select(this).call(yAxis); });

      svg.selectAll(".y.axis2")
            .selectAll("text")
            .style("font-size","12px");

      var cell = svg.selectAll(".cell")
          .data(cross(components, components))
        .enter().append("g")
          .attr("class", "cell")
          .attr("transform", function(d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
          .each(plot);

      // Titles for the diagonal.
      cell.filter(function(d) { return d.i === d.j; }).append("text")
          .attr("x", padding)
          .attr("y", padding)
          .attr("dy", ".71em")
          .text(function(d) { return d.x; });

      function plot(p) {
        var cell = d3.select(this);

        x.domain(pcaLoadedAttributes[p.x]);
        y.domain(pcaLoadedAttributes[p.y]);

        cell.append("rect")
            .attr("class", "frame2")
            .attr("x", padding / 2)
            .attr("y", padding / 2)
            .attr("width", size - padding)
            .attr("height", size - padding);

        var points = cell.selectAll("circle")
            .data(scatterplotMatrixData)
          .enter().append("circle")
            .attr("cx", function(d) { return x(d[p.x]); })
            .attr("cy", function(d) { return y(d[p.y]); })
            .attr("r", 4)
            .style("fill", function(d) {
                if ((p.x === col1 && p.y === col2) ||
                        (p.x === col2 && p.y === col1)) {
                    return "red";
                }
                else if ((p.x === col2 && p.y === col3) ||
                        (p.x === col3 && p.y === col2)) {
                    return "blue";
                }
                else if ((p.x === col1 && p.y === col3) || (p.x === col3 && p.y === col1)) {
                    return "green";
                }
                else {
                    return "orange";
                }
            });

          points.on("mouseover", function(d) {
                        tooltip.transition()
                            .duration(200)
                            .style("opacity", .9);
                        tooltip.html("(" + x(d[p.x]) + ", " + y(d[p.y]) + ")")
                            .style("left", (d3.event.pageX + 5) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
          })
          .on("mouseout", function(d) {
                        tooltip.transition()
                            .duration(500)
                            .style("opacity", 0);
          });
      }
    }

    function cross(a, b) {
      var c = [], n = a.length, m = b.length, i, j;
      for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
      return c;
    }

}