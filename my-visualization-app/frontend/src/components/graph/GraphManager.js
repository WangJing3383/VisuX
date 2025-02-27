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

  deleteGraph(graphId) {
    if (this.graphs.has(graphId)) {
      this.graphs.delete(graphId);
      return true;
    }
    return false;
  }

  getGraphById(graphId) {
    const graph = this.graphs.get(graphId);
    if (!graph) {
      console.warn(`Graph ID ${graphId} not found.`);
    }
    return graph || null;
  }

  getAllGraphs() {
    return Array.from(this.graphs.values());
  }

  changeGraphColor(graphId, newColor) {
    const graph = this.graphs.get(graphId);
    if (graph) {
      graph.changeColor(newColor);
      this.notify({ type: "graphUpdated" });
      return true;
    }
    return false;
  }

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

 changeVisibility(graphId) {
  const graph = this.graphs.get(graphId);
  if (graph) {
    graph.toggleVisibility();
    console.log(`Graph (ID: ${graphId}) changed visibility.`);
  } else {
    console.warn(`GraphManager: Graph ID ${graphId} not found.`);
}

 }

 excludeRangeFromGraph(graphId, min, max) {
    const graph = this.graphs.get(graphId);
    if (!graph) {
      console.warn(`Graph ID ${graphId} not found.`);
      return false;
    }

    graph.showedDatapoints = graph.showedDatapoints.filter(num => num < min || num > max);
    this.notify({ type: "graphUpdated", graphId });
    return true;
  }

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
  notify(data) {
    console.log("GraphManager triggered", data);
    this.eventListeners.forEach((callback) => callback(data));
  }

  onChange(callback) {
    this.eventListeners.push(callback);
  }

  offChange(callback) {
    this.eventListeners = this.eventListeners.filter((fn) => fn !== callback);
  }
}

const graphManagerInstance = new GraphManager();
export default graphManagerInstance;
export { GraphManager };
