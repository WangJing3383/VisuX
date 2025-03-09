import ModalController from './modal/ModalController';
import GraphManager from './graph/GraphManager';
import GraphWindowController from './graph/GraphWindowController';
import ToolManager from './tool/ToolManager';
import LogManager from "./log/LogManager";
import TableManager from "./table/TableManager";
import datasetManager from "./file/DatasetManager";

class UIController {
  constructor() {
    this.modalController = new ModalController(); // Manage modal windows
    this.graphManager = GraphManager; // Ensure the use of the singleton model
    this.graphWindowController = new GraphWindowController(this.graphManager); // Import GraphManager instance
    this.toolManager = new ToolManager(this);
    this.logManager = new LogManager();
    this.tableManager = new TableManager(this);
    this.datasetManager = datasetManager;
  }

  /**
   * handle user actions
   */
  handleUserAction(action) {
    console.log(`Handling action: ${action.type}`, action);

    switch (action.type) {
      case 'OPEN_MODAL':
        this.modalController.openModal(action.modalType, action.data);
        break;

      case 'CLOSE_MODAL':
        this.modalController.closeModal();
        break;

      case 'OPEN_GRAPH_WINDOW':
        this.graphWindowController.openGraphWindow(action.graphData);
        break;

      case 'CLOSE_GRAPH_WINDOW':
        this.graphWindowController.closeGraphWindow(action.windowId);
        break;

      case 'DISPLAY_ERROR':
        alert(`Error: ${action.errorDetails}`);
        break;

      case 'DISPATCH_REQUEST':
        console.log('Dispatching request to backend:', action);
        break;

      case 'CREATE_GRAPH': {
        console.log('Creating new graph:', action.graphInfo);

        // Create a new Graph instance
        const newGraph = this.graphManager.createGraph(action.graphInfo);
        if (!newGraph) {
          console.error("Failed to create graph.");
          return;
        }

        console.log(`Graph created: ${newGraph.id}`);

        // Open the Graph window and pass in the new graphData
        //this.graphWindowController.openGraphWindow(newGraph);

        break;
      }

      case 'EXECUTE_TOOL':
        this.toolManager.executeTool(
          action.data.toolName,
          action.data.datasetId,
          action.data.params
        );
        break;

      default:
        console.warn(`Unhandled action: ${action.type}`, action);
    }
  }

  // /**
  //  * Send POST request (supports timeout)
  //  */
  // async postRequest(url, data, headers = {}) {
  //   try {
  //     console.log(`📡 Sending POST request to: ${url}`, data);
  //
  //     // Getting a CSRF Token (for Django)
  //     const csrfToken = this.getCSRFToken();
  //     if (csrfToken) {
  //       headers["X-CSRFToken"] = csrfToken;
  //     }
  //
  //     // Request Timeout Control
  //     const controller = new AbortController();
  //     const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
  //
  //     const response = await fetch(url, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         ...headers,
  //       },
  //       body: JSON.stringify(data),
  //       credentials: "include",
  //       signal: controller.signal,
  //     });
  //
  //     clearTimeout(timeoutId);
  //
  //     if (!response.ok) {
  //       const errorMessage = await response.text();
  //       console.error(`API request failed: ${url} (${response.status})`, errorMessage);
  //       throw new Error(`Request failed: ${response.status} - ${errorMessage}`);
  //     }
  //
  //     const responseData = await response.json();
  //     console.log(`Response received from ${url}:`, responseData);
  //     return responseData;
  //   } catch (error) {
  //     console.error(`Network/API error for ${url}:`, error);
  //     return { error: error.message };
  //   }
  // }

  // /**
  //  * Getting a CSRF Token (for Django)
  //  */
  // getCSRFToken() {
  //   let cookieValue = null;
  //   if (document.cookie) {
  //     document.cookie.split(";").forEach((cookie) => {
  //       const [name, value] = cookie.trim().split("=");
  //       if (name === "csrftoken") {
  //         cookieValue = decodeURIComponent(value);
  //       }
  //     });
  //   }
  //   return cookieValue;
  // }

  /* ============== GETTERS & SETTERS ============== */

  // setModalController(modalController) {
  //   this.modalController = modalController;
  // }
  //
  // setGraphWindowController(graphWindowController) {
  //   this.graphWindowController = graphWindowController;
  // }
  //
  // setToolManager(toolManager) {
  //   this.toolManager = toolManager;
  // }
  //
  // setImageDisplayArea(imageDisplayArea) {
  //   this.imageDisplayArea = imageDisplayArea;
  // }

  getModalController() {
    return this.modalController;
  }

  // getGraphWindowController() {
  //   return this.graphWindowController;
  // }
  //
  // getToolManager() {
  //   return this.toolManager;
  // }
  //
  // getImageDisplayArea() {
  //   return this.imageDisplayArea;
  // }
  //
  // openGraphWindow(graphId) {
  //   return this.graphWindowController.openGraphWindowById(graphId);
  // }
  //
  // closeGraphWindow(windowId) {
  //   return this.graphWindowController.closeGraphWindow(windowId);
  // }
  //
  // getGraphWindows() {
  //   return this.graphWindowController.getGraphWindows();
  // }

  getLogManager() {
    return this.logManager;
  }

  getDatasetManager() {
    return this.datasetManager;
  }

  getTableManager() {
    return this.tableManager;
  }
}

export default UIController;
