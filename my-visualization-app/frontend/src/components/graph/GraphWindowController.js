import VisualizationManager from "./VisualizationManager";

class GraphWindowController {
  constructor(graphManager) {
    this.graphManager = graphManager; // Make it accessible to the GraphManager
    this.windows = new Map(); // Store all windows
    this.visualizationManager = new VisualizationManager();
  }

  /**
   * Creating a New Chart Window
   */
  openGraphWindow(graphData) {
    if (!graphData || !graphData.id) {
      console.error("Invalid graphData. Missing ID.");
      return null;
    }

    const windowId = `graph_window_${graphData.id}`;
    console.log(`Creating Graph Window for ID: ${windowId}`);

    if (document.getElementById(windowId)) {
      console.warn(`Graph window ${windowId} already exists.`);
      return;
    }

    const graphContainer = document.createElement("div");
    graphContainer.id = windowId;
    graphContainer.className = "graph-window";
    graphContainer.style.position = "absolute";
    graphContainer.style.top = "100px";
    graphContainer.style.left = "250px";
    graphContainer.style.width = "600px";
    graphContainer.style.height = "400px";
    graphContainer.style.background = "#fff";
    graphContainer.style.border = "1px solid #ccc";
    graphContainer.style.boxShadow = "2px 2px 10px rgba(0, 0, 0, 0.2)";
    graphContainer.style.padding = "10px";
    graphContainer.style.zIndex = "1000";

    // close button
    const closeButton = document.createElement("button");
    closeButton.innerText = "×";
    closeButton.style.position = "absolute";
    closeButton.style.top = "5px";
    closeButton.style.right = "10px";
    closeButton.style.background = "red";
    closeButton.style.color = "white";
    closeButton.style.border = "none";
    closeButton.style.cursor = "pointer";
    closeButton.onclick = () => this.closeGraphWindow(windowId);

    graphContainer.appendChild(closeButton);

    // render plotly chart
    const graphContent = document.createElement("div");
    graphContent.id = `plot_${graphData.id}`;
    graphContent.style.width = "100%";
    graphContent.style.height = "90%";
    graphContainer.appendChild(graphContent);

    document.body.appendChild(graphContainer);

    // Call VisualizationManager to render the diagram
    setTimeout(() => {
      this.visualizationManager.renderChart(graphData);
    }, 200);

    // Storage window
    const newWindow = {
      id: windowId,
      graphData,
      isOpen: true,
      element: graphContainer,
    };
    this.windows.set(windowId, newWindow);
    return newWindow;
  }

  /**
   * Close the window and remove the DOM
   */
  closeGraphWindow(windowId) {
    if (this.windows.has(windowId)) {
      const windowData = this.windows.get(windowId);
      document.body.removeChild(windowData.element);
      this.windows.delete(windowId);
      console.log(`Closed Graph Window (ID: ${windowId})`);
      return true;
    }
    console.warn(`Cannot close window. ID ${windowId} not found.`);
    return false;
  }
}

export default GraphWindowController;
