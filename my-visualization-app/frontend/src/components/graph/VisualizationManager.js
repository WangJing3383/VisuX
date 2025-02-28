import { chartCategories } from "./ChartCategories";

//main class to generate Plotly data from Graph Attributes
class VisualizationManager {

  EMPTY_ARRAY_LENGTH = 0;
  TO_BE_X_AXIS = 0;
  TO_BE_Y_AXIS = 1;
  TO_BE_Z_AXIS = 2;
  TO_BE_RADIUS = 0;
  TO_BE_ANGLE = 1;
  DEFAULT_MARKER_SIZE = 8;
  LINE_WIDTH = 2;
  CURVEFITTING_DONT_EXIST = 0;
  NON_EMPTY_X = 0;
  NON_EMPTY_Y = 0;
  X_AND_Y_LENGTH = 2;
  X_Y_AND_Z_LENGTH = 3;
  MORE_TRACES_EXIST = 0;
  NO_DATA_SHOWING = 0;
  MARGIN_PLACE = 50;
  ONE_FOR_NOT_STARTING_FROM_ZERO = 1;
  OBJECT = "object";
  UNVALID_ARRAY_ERROR = "Error: One or more selected features are not valid arrays.";
  SCATTER_TYPE = "scatter";
  BAR_TYPE = "bar";
  LINE_TYPE = "line";
  SCATTERPOLAR_TYPE = "scatterpolar";
  HEATMAP_TYPE = "heatmap";
  SCATTER3D_TYPE = "scatter3d";
  PIE_TYPE = "pie";
  AREA_TYPE = "area";
  UNVALID_TYPE_ERROR = "Unsupported graph type:";
  MARKERS_MODE = "markers";
  LINES_MODE = "lines";
  LINES_MARKERS_MODE = "lines+markers";
  DEFAULT_GRAPH_COLOR = "blue";
  CIRCLE_FOR_LINE = "circle";
  VIRIDIS_COLOR_SCALE = "Viridis";
  TOZEROY_FILL = "tozeroy";
  ORANGE_HEX = "#FF7F0E";
  BLUE_HEX = "#1F77B4";
  GREEN_HEX = "#2CA02C";
  RED_HEX = "#D62728";
  PURPLE_HEX = "#9467BD";
  GREY_HEX = "#DDDDDD";
  DARK_GREY_HEX = "#BBBBBB";
  BACKGROUND_GREY = "rgba(245, 245, 245, 0.9)";
  BACKGROUND_WHITE = "white";
  CURVEFITTING_NAME = "Fitted Curve";
  CURVEFITTING_ERROR = "No valid fitted curve data found.";
  X_NAME = "X";
  Y_NAME = "Y";
  Z_NAME = "Z";

  chartCategories = chartCategories; // Defining chart categories for graph type functions

  // Main method that visualizes the graph by using smaller methods and connecting them
  visualize(graph) {
    const { dataset, type, selectedFeatures = [], fittedCurve} = graph;

    // Checking the type and dataset to see if the graph object is valid
    if (!type || !dataset || typeof dataset !== this.OBJECT) {
      return null;
    }

    // Taking data values of related features from the dataset
    const featureData = this.#extractFeatureData(dataset, selectedFeatures);
    if (!featureData) return null;

    // Filtering data points by numbers 
    const filteredData = this.#filterDataByShowedDatapoints(
      featureData,
      graph.showedDatapoints
    );

    // Creating the plot data and making it first trace for plotly rendering
    let plotData = this.#applyGraphStyle(graph, filteredData);
    let traces = [plotData];

    // Curve fitting
    let fittedTrace = this.#applyFittedCurve(fittedCurve);
    if (fittedTrace) {
      traces.push(fittedTrace);
    }

    // Creating more traces if user selected more than one feature for Y Axis
    const moreTraces = this.#applyMoreTraces(graph);
    if (moreTraces && moreTraces.length > this.MORE_TRACES_EXIST) {
      traces = traces.concat(moreTraces);
    }

    // Creating the layout of visualized graph
    const layout = this.#buildLayout(selectedFeatures);

    return { data: traces, layout };
  }

  // Extracts data from the dataset related to the selected features
  #extractFeatureData(dataset, selectedFeatures) {
    //Mapping the selected features to their corresponding data values, so that each feature is properly mapped from the dataset.
    const featureData = selectedFeatures.map(
      (feature) => dataset?.[feature] || []
    );

    //Controlling that all features are valid arrays and not empty. It prevents errors if the data is malformed somehow.
    if (!featureData.every(Array.isArray) 
      || featureData.some((arr) => arr.length === this.EMPTY_ARRAY_LENGTH) //using "some" so it would catch even if one array is not valid
    ) {
      console.error( this.UNVALID_ARRAY_ERROR, featureData );
      return null;
    }
    return featureData;
  }

  // Filtering the dataset based on the data points chosen by the user that should be shown
  #filterDataByShowedDatapoints(featureData, showedDatapoints) {
    return featureData.map((feature) => {
      // user chooses the showable data points starting from 1 so "index + 1 " is used
      // "_" corresponds to data point
      return feature.filter((_, index) => showedDatapoints.includes(index + 1));
    });
  }

  // Method that returns a style depending on the graph type because every type needs different values
  #applyGraphStyle(graph, featureData) {
    switch (graph.type) {
      case this.SCATTER_TYPE:
        return this.#scatterPlot(featureData, graph);
      case this.BAR_TYPE:
        return this.#barChart(featureData, graph);
      case this.LINE_TYPE:
        return this.#lineChart(featureData, graph);
      case this.SCATTERPOLAR_TYPE:
        return this.#polarChart(featureData, graph);
      case this.HEATMAP_TYPE:
        return this.#heatmapChart(featureData, graph);
      case this.SCATTER3D_TYPE:
        return this.#scatter3DPlot(featureData, graph);
      case this.PIE_TYPE:
        return this.#pieChart(featureData, graph);
      case this.AREA_TYPE:
        return this.#areaChart(featureData, graph);
      default:
        console.warn(this.UNVALID_ARRAY_ERROR, graph.type);
        return null;
    }
  }

  #scatterPlot(featureData, graph) {
    return {
      type: this.SCATTER_TYPE,
      mode: this.MARKERS_MODE,
      x: featureData[this.TO_BE_X_AXIS],
      y: featureData[this.TO_BE_Y_AXIS],
      marker: {
        color: graph.style?.getMarkerStyle()?.color || this.DEFAULT_GRAPH_COLOR,
        size: graph.style?.getMarkerStyle()?.size || this.DEFAULT_MARKER_SIZE,
      },
    };
  }

  #barChart(featureData, graph) {
    return {
      type: this.BAR_TYPE,
      x: featureData[this.TO_BE_X_AXIS],
      y: featureData[this.TO_BE_Y_AXIS],
      marker: {
        color: graph.style?.getMarkerStyle()?.color || this.DEFAULT_GRAPH_COLOR,
      },
    };
  }

  #lineChart(featureData, graph) {
    return {
      type: this.SCATTER_TYPE,
      mode: this.LINES_MARKERS_MODE,
      x: featureData[this.TO_BE_X_AXIS],
      y: featureData[this.TO_BE_Y_AXIS],
      line: {
        color: graph.style?.getMarkerStyle()?.color || this.DEFAULT_GRAPH_COLOR,
        width: this.LINE_WIDTH,
      },
      marker: {
        color: graph.style?.getMarkerStyle()?.color,
        size: this.DEFAULT_GRAPH_COLOR,
        symbol: this.CIRCLE_FOR_LINE, //circle for clearly showing each data point
      },
      name: graph.selectedFeatures[this.TO_BE_Y_AXIS],
    };
  }

  #polarChart(featureData, graph) {
    return {
      type: this.SCATTERPOLAR_TYPE,
      r: featureData[this.TO_BE_RADIUS],
      theta: featureData[this.TO_BE_ANGLE],
      marker: {
        color: graph.style?.getMarkerStyle()?.color || this.DEFAULT_GRAPH_COLOR,
        size: graph.style?.getMarkerStyle()?.size || this.DEFAULT_MARKER_SIZE,
      },
    };
  }

  #scatter3DPlot(featureData, graph) {
    return {
      type: this.SCATTER3D_TYPE,
      mode: this.MARKERS_MODE,
      x: featureData[this.TO_BE_X_AXIS],
      y: featureData[this.TO_BE_Y_AXIS],
      z: featureData[this.TO_BE_Z_AXIS],
      marker: {
        color: graph.style?.getMarkerStyle()?.color || this.DEFAULT_GRAPH_COLOR,
        size: graph.style?.getMarkerStyle()?.size || this.DEFAULT_MARKER_SIZE,
      },
    };
  }

  #heatmapChart(featureData, graph) {
    return {
      type: this.HEATMAP_TYPE,
      x: featureData[this.TO_BE_X_AXIS],
      y: featureData[this.TO_BE_Y_AXIS],
      z: featureData[this.TO_BE_Z_AXIS],
      colorscale: this.VIRIDIS_COLOR_SCALE,
    };
  }

  #pieChart(featureData, graph) {
    const labels = featureData[this.TO_BE_X_AXIS] || [];
    const values = featureData[this.TO_BE_X_AXIS] || [];
    return {
      type: this.PIE_TYPE,
      labels: labels,
      values: values,
      marker: {
        colors:
          graph.style?.getMarkerStyle()?.color ||
          [
            this.ORANGE_HEX,
            this.BLUE_HEX,
            this.GREEN_HEX,
            this.PURPLE_HEX,
            this.RED_HEX,
          ],
      },
    };
  }

  #areaChart(featureData, graph) {
    return {
      type: this.SCATTER_TYPE,
      mode: this.LINES_MODE,
      fill: this.TOZEROY_FILL,
      x: featureData[this.TO_BE_X_AXIS],
      y: featureData[this.TO_BE_Y_AXIS],
      line: {
        color: graph.style?.getMarkerStyle()?.color || this.DEFAULT_GRAPH_COLOR,
        width: this.LINE_WIDTH,
      },
    };
  }

  //showing a red "curve fitting" line on the graph
  #applyFittedCurve(fittedCurve) {
    let fittedX = [];
    let fittedY = [];

    //only contine if fittedCurve is a valid array
    if (Array.isArray(fittedCurve) && fittedCurve.length > this.CURVEFITTING_DONT_EXIST) {
      //mapping the datav to seperate x and y
      fittedX = fittedCurve.map((point) => point.x);
      fittedY = fittedCurve.map((point) => point.y);
    }

    //creating the plotly data if every array is valid
    if (fittedX.length > this.NON_EMPTY_X && fittedY.length > this.NON_EMPTY_Y) {
      return {
        type: this.SCATTER_TYPE,
        mode: this.LINES_MODE,
        x: fittedX,
        y: fittedY,
        line: { color: this.RED_HEX, width: this.LINE_WIDTH },
        name: this.CURVEFITTING_NAME,
      };
    } else {
      console.warn(this.CURVEFITTING_ERROR);
      return null;
    }
  }

  //building layout by adjusting the axises, placing them and havng a darker background
  #buildLayout(selectedFeatures) {
    const layout = {
      xaxis: {
        title: selectedFeatures[this.TO_BE_X_AXIS] || this.X_NAME,
        gridcolor: this.GREY_HEX,
        zerolinecolor: this.DARK_GREY_HEX,
      },
      ...(selectedFeatures.length >= this.X_AND_Y_LENGTH && {
        yaxis: {
          title: selectedFeatures[this.TO_BE_Y_AXIS] || this.Y_NAME,
          gridcolor: this.GREY_HEX,
          zerolinecolor: this.DARK_GREY_HEX,
        },
      }),
      ...(selectedFeatures.length === this.X_Y_AND_Z_LENGTH && {
        zaxis: {
          title: selectedFeatures[this.TO_BE_Z_AXIS] || this.Z_NAME,
          gridcolor: this.GREY_HEX,
          zerolinecolor: this.DARK_GREY_HEX,
        },
      }),
      plot_bgcolor: this.BACKGROUND_GREY,
      paper_bgcolor: this.BACKGROUND_WHITE,
      margin: { l: this.MARGIN_PLACE, r: this.MARGIN_PLACE, t: this.MARGIN_PLACE, b: this.MARGIN_PLACE },
    };

    return layout;
  }

  //Applying multiple y axes by adding more traces
  #applyMoreTraces(graph) {
    const additionalTraces = [];
    // applying only if graph has more than 1 Y axes
    if (graph.moreYAxes && Array.isArray(graph.moreYAxes)) {
      graph.moreYAxes.forEach((axisName) => {
        // taking the related data values from the features
        if (graph.dataset && graph.dataset[axisName]) {
          let axisData = graph.dataset[axisName];
          if (
            // only showing the data points chosen by user
            graph.showedDatapoints &&
            Array.isArray(graph.showedDatapoints) &&
            graph.showedDatapoints.length > this.NO_DATA_SHOWING
          ) {
            // starting from + 1 because data points are starting getting numbered from 1(not 0)
            axisData = axisData.filter((_, index) =>
              graph.showedDatapoints.includes(index + this.ONE_FOR_NOT_STARTING_FROM_ZERO)
            );
          }
          const xFeature = graph.selectedFeatures[this.TO_BE_X_AXIS];
          const xData = graph.dataset[xFeature] || [];

          let trace = null;

          // adjusting the plotly data depending on the graph type
          switch (graph.type) {
            case this.SCATTER_TYPE:
            case this.LINE_TYPE:
              trace = {
                type: this.SCATTER_TYPE,
                mode: this.LINES_MARKERS_MODE,
                x: xData,
                y: axisData,
                line: {
                  // so that each trace looks clearly
                  color: `hsl(${Math.random() * 360}, 100%, 50%)`,
                  width: this.LINE_WIDTH,
                },
                marker: {
                  size: this.DEFAULT_MARKER_SIZE,
                },
                name: axisName,
              };
              break;
            case this.BAR_TYPE:
              trace = {
                type: this.BAR_TYPE,
                x: xData,
                y: axisData,
                marker: {
                  // so that each trace looks clearly
                  color: `hsl(${Math.random() * 360}, 100%, 50%)`,
                },
                name: axisName,
              };
              break;
            case this.AREA_TYPE:
              trace = {
                type: this.SCATTER_TYPE,
                mode: this.LINES_MODE,
                fill: this.TOZEROY_FILL,
                x: xData,
                y: axisData,
                line: {
                  // so that each trace looks clearly
                  color: `hsl(${Math.random() * 360}, 100%, 50%)`,
                  width: this.LINE_WIDTH,
                },
                name: axisName,
              };
              break;
            default:
              console.warn(this.UNVALID_TYPE_ERROR, graph.type);
              return;
          }
          //adding every extra Y axis by "for each" from the start of the function
          additionalTraces.push(trace);
        }
      });
    }
    return additionalTraces;
  }

}

export default VisualizationManager;
