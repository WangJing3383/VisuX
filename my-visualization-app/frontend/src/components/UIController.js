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

  getModalController() {
    return this.modalController;
  }

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
