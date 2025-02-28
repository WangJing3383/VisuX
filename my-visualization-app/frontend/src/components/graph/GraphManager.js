import { enableMock, mockGraphs } from "./mockData";
import VisualizationManager from "./VisualizationManager";
import Graph from "./Graph";

class GraphManager {
  constructor() {
    if (!GraphManager.instance) {
      this.graphs = new Map();
      this.visualizationManager = new VisualizationManager();
      this.eventListeners = [];
      GraphManager.instance = this;
    }
    return GraphManager.instance;
  }

  /**
   * Create a new graph and add it to the graph map.
   */
  createGraph(graphInfo) {
    const graphId = `graph_${Date.now()}`;

    if (!graphInfo.graphType) {
      console.error("Missing `graphType` in graphInfo.");
      return null;
    }

    const transformedDataset = {};
    if (graphInfo.dataset && graphInfo.dataset.records && graphInfo.dataset.features) {
      graphInfo.dataset.features.forEach((feature) => {
        transformedDataset[feature] = graphInfo.dataset.records.map((record) => record[feature]);
      });
    } else {
      console.error("Invalid dataset structure.");
      return null;
    }

    const newGraph = new Graph(
      graphInfo.datasetId,
      graphId,
      graphInfo.graphName || graphId,
      transformedDataset,
      graphInfo.graphType,
      graphInfo.selectedFeatures || [],
      {}
    );

    this.#addGraphToMap(newGraph);
    this.notify({ type: "graphUpdated" });
    return newGraph;
  }

  /**
   * Add a graph object to the internal graph map.
   */
  #addGraphToMap(graph) {
    if (!(graph instanceof Graph)) {
      console.error("Invalid Graph object.");
      return false;
    }
    if (this.graphs.has(graph.id)) {
      console.warn(`Graph with ID ${graph.id} already exists.`);
      return false;
    }
    this.graphs.set(graph.id, graph);
    return true;
  }

  /**
   * Apply curve fitting to a graph and notify listeners.
   */
  applyCurveFitting(graphId, fittedData) {
    const graph = this.graphs.get(graphId);
    if (!graph) {
      console.warn(`Graph ID ${graphId} not found.`);
      return false;
    }
    graph.setFittedCurve(fittedData);
    this.notify({ type: "graphUpdated", graphId });
    return true;
  }

  /**
   * 
   * @param {*} graphId graphId to be deleted
   * @returns true if deleted succesfully, false if graph not found
   */
  deleteGraph(graphId) {
    if (this.graphs.has(graphId)) {
      this.graphs.delete(graphId);
      return true;
    }
    return false;
  }

  /**
   * 
   * @param {*} graphId graph to be searched
   * @returns if found graph, null if not found
   */
  getGraphById(graphId) {
    const graph = this.graphs.get(graphId);
    if (!graph) {
      console.warn(`Graph ID ${graphId} not found.`);
    }
    return graph || null;
  }

  /**
   * 
   * @returns all graphs
   */
  getAllGraphs() {
    return Array.from(this.graphs.values());
  }

  /**
   * 
   * @param {*} graphId graph to be colored
   * @param {*} newColor new color of graph
   * @returns true if correctly colored, false otherwise
   */
  changeGraphColor(graphId, newColor) {
    const graph = this.graphs.get(graphId);
    if (graph) {
      graph.changeColor(newColor);
      this.notify({ type: "graphUpdated" });
      return true;
    }
    return false;
  }

  /**
   * 
   * @param {*} graphId graph to be changed
   * @param {*} selectedAxis x,y or z
   * @param {*} newFeature new feature that will be associated with selectedAxis
   * @returns  true if axis correctly changed, false otherwise
   */
  changeAxis(graphId, selectedAxis, newFeature) {
    const graph = this.graphs.get(graphId);
    if (graph) {
      if (selectedAxis === "x") graph.setXAxis(newFeature);
      if (selectedAxis === "y") graph.setYAxis(newFeature);
      if (selectedAxis === "z") graph.setZAxis(newFeature);
      this.notify({ type: "graphUpdated" });
      return true;
    }
    return false;
  }

  /**
   * 
   * @param {*} graphId graph to be changed
   * @param {*} newType new graph type (one from ChartCategories)
   */
  changeType(graphId, newType) {
    const graph = this.graphs.get(graphId);
    if (graph) {
      graph.setType(newType);
      console.log(`Graph (ID: ${graphId}) changed type to ${newType}`);
        this.notify({ type: "graphUpdated" });
    } else {
      console.warn(`GraphManager: Graph ID ${graphId} not found.`);
  }
 }

 /**
  * 
  * @param {*} graphId graph to hide/show
  */
 changeVisibility(graphId) {
  const graph = this.graphs.get(graphId);
  if (graph) {
    graph.toggleVisibility();
    console.log(`Graph (ID: ${graphId}) changed visibility.`);
  } else {
    console.warn(`GraphManager: Graph ID ${graphId} not found.`);
}

 }

  /**
   * 
   * @param {*} graphId graph that its datapoints to be changed
   * @param {*} min  number starting to include
   * @param {*} max  number ending to include
   * @returns 
   */
  restoreRangeToGraph(graphId, min, max) {
    const graph = this.graphs.get(graphId);
    if (!graph) {
      console.warn(`Graph ID ${graphId} not found.`);
      return false;
    }
    graph.restoreRange(min, max);

    this.notify({ type: "graphUpdated", graphId });
    return true;
  }

   
  /**
   * 
   * @param {*} graphId graph that its datapoints to be changed
   * @param {*} min number starting to exclude
   * @param {*} max  number ending to exclude
   * @returns 
   */
   excludeRangeToGraph(graphId, min, max) {
    const graph = this.graphs.get(graphId);
    if (!graph) {
      console.warn(`Graph ID ${graphId} not found.`);
      return false;
    }
    graph.excludeRange(min, max);

    this.notify({ type: "graphUpdated", graphId });
    return true;
  }

  /**
   * 
   * @param {*} graphId graph to be changed
   * @param {*} newAxis new feature for new Y axes
   * @returns 
   */
  addMoreYAxis(graphId, newAxis) {
    const graph = this.graphs.get(graphId);
    if (!graph) {
      console.warn(`Graph ID ${graphId} not found.`);
      return false;
    }
    const currentAxes = graph.getMoreYAxes();
    graph.setMoreYAxes([...currentAxes, newAxis]);
    return true;
  }

  /**
   * 
   * @param {*} graphId graph to be changed
   * @param {*} axisToRemove feature of the axis to be removed
   * @returns 
   */
  removeMoreYAxis(graphId, axisToRemove) {
    const graph = this.graphs.get(graphId);
    if (!graph) {
      console.warn(`Graph ID ${graphId} not found.`);
      return false;
    }
    const updatedAxes = graph.getMoreYAxes().filter(axis => axis !== axisToRemove);
    graph.setMoreYAxes(updatedAxes);
    return true;
  }

  //these 3 are all related to notifying other claasses about changes

  /**
   * 
   * @param {*} data updating data
   */
  notify(data) {
    console.log("GraphManager triggered", data);
    this.eventListeners.forEach((callback) => callback(data));
  }

  /**
   * 
   * @param {*} callback new listener
   */
  onChange(callback) {
    this.eventListeners.push(callback);
  }

  /**
   * 
   * @param {*} callback listener to be removed
   */
  offChange(callback) {
    this.eventListeners = this.eventListeners.filter((fn) => fn !== callback);
  }
}

const graphManagerInstance = new GraphManager();
export default graphManagerInstance;
export { GraphManager };
