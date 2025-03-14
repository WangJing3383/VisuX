import UIController from "../components/UIController";
import ModalController from "../components/modal/ModalController";
import LogManager from "../components/log/LogManager";
import datasetManager from "../components/file/DatasetManager";
import TableManager from "../components/table/TableManager";

// Mock the dependent modules
jest.mock('../components/modal/ModalController');
jest.mock('../components/graph/GraphManager');
jest.mock('../components/graph/GraphWindowController');
jest.mock('../components/tool/ToolManager');
jest.mock('../components/log/LogManager');
jest.mock('../components/table/TableManager');
jest.mock('../components/file/DatasetManager');

describe('./UIController', () => {
  let uiController;

  // Create a new instance of UIController before each test
  beforeEach(() => {
    uiController = new UIController();
  });

  test('should open a modal when the OPEN_MODAL action is triggered', () => {
    const action = { type: 'OPEN_MODAL', modalType: 'testModal', data: { test: 'data' } };

    // Spy on the openModal method to check if it gets called
    const openModalSpy = jest.spyOn(uiController.modalController, 'openModal');

    uiController.handleUserAction(action);

    // Check that openModal was called with the correct arguments
    expect(openModalSpy).toHaveBeenCalledWith(action.modalType, action.data);
  });

  test('should close the modal when the CLOSE_MODAL action is triggered', () => {
    const action = { type: 'CLOSE_MODAL' };

    // Spy on the closeModal method to check if it gets called
    const closeModalSpy = jest.spyOn(uiController.modalController, 'closeModal');

    uiController.handleUserAction(action);

    // Check that closeModal was called
    expect(closeModalSpy).toHaveBeenCalled();
  });

  test('should open a graph window when the OPEN_GRAPH_WINDOW action is triggered', () => {
    const action = { type: 'OPEN_GRAPH_WINDOW', graphData: { graphId: 'graph1', data: 'testData' } };
    
    // Spy on the openGraphWindow method to check if it gets called
    const openGraphWindowSpy = jest.spyOn(uiController.graphWindowController, 'openGraphWindow');

    uiController.handleUserAction(action);

    // Check that openGraphWindow was called with the correct arguments
    expect(openGraphWindowSpy).toHaveBeenCalledWith(action.graphData);
  });

  test('should close a graph window when the CLOSE_GRAPH_WINDOW action is triggered', () => {
    const action = { type: 'CLOSE_GRAPH_WINDOW', windowId: 'graph1' };
    
    // Spy on the closeGraphWindow method to check if it gets called
    const closeGraphWindowSpy = jest.spyOn(uiController.graphWindowController, 'closeGraphWindow');

    uiController.handleUserAction(action);

    // Check that closeGraphWindow was called with the correct windowId
    expect(closeGraphWindowSpy).toHaveBeenCalledWith(action.windowId);
  });

  test('should log the dispatch request message when the DISPATCH_REQUEST action is triggered', () => {
    const action = { type: 'DISPATCH_REQUEST', requestData: { key: 'value' } };

    // Spy on console.log to verify if the message is logged to check if it gets called
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    uiController.handleUserAction(action);

    // Check that console.log was called with the correct message
    expect(consoleLogSpy).toHaveBeenCalledWith('Dispatching request to backend:', action);

    // Restoring the original console.log after the test
    consoleLogSpy.mockRestore();
  });


  test('should create a new graph when the CREATE_GRAPH action is triggered', () => {
    const action = { type: 'CREATE_GRAPH', graphInfo: { name: 'New Graph' } };

    // Mock the graph creation method to return a mock graph object
    const createGraphMock = jest.spyOn(uiController.graphManager, 'createGraph').mockReturnValue({ id: 'graph1', name: 'New Graph' });

    uiController.handleUserAction(action);

    // Check that createGraph was called with the correct arguments
    expect(createGraphMock).toHaveBeenCalledWith(action.graphInfo);
  });

  test('should log the failure message when the CREATE_GRAPH action fails', () => {
    const action = { type: 'CREATE_GRAPH', graphInfo: { graphName: 'testGraph' } };

    // Spy on console.log and console.error to verify if the correct messages are logged
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const createGraphSpy = jest.spyOn(uiController.graphManager, 'createGraph').mockReturnValue(null);
    uiController.handleUserAction(action);

    // Check that the error log message was printed
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to create graph.');

    // Restore the original console.log and console.error after the test
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    createGraphSpy.mockRestore();
  });

  test('should handle the DISPLAY_ERROR action by showing an alert', () => {
    const action = { type: 'DISPLAY_ERROR', errorDetails: 'Something went wrong' };

    // Spy on the alert function to check if it gets called
    const alertSpy = jest.spyOn(global, 'alert').mockImplementation(() => {});

    // Call the handleUserAction method
    uiController.handleUserAction(action);

    // Check that the alert was called with the correct message
    expect(alertSpy).toHaveBeenCalledWith(`Error: ${action.errorDetails}`);
  });

  test('should execute a tool when the EXECUTE_TOOL action is triggered', () => {
    const action = {
      type: 'EXECUTE_TOOL',
      data: { toolName: 'Tool1', datasetId: 'dataset1', params: { param: 'value1' } }
    };

    // Spy on the executeTool method to check if it gets called
    const executeToolSpy = jest.spyOn(uiController.toolManager, 'executeTool');

    // Call the handleUserAction method
    uiController.handleUserAction(action);

    // Check that executeTool was called with the correct arguments
    expect(executeToolSpy).toHaveBeenCalledWith(action.data.toolName, action.data.datasetId, action.data.params);
  });

  test('should log an unhandled action when an unknown action type is passed', () => {
    const action = { type: 'UNKNOWN_ACTION' };

    // Spy on the console.warn method
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    uiController.handleUserAction(action);

    // Check that console.warn was called with the unhandled action
    expect(consoleWarnSpy).toHaveBeenCalledWith('Unhandled action: UNKNOWN_ACTION', action);
  });

  test('should return the modalController instance from getModalController', () => {
    const modalControllerInstance = uiController.getModalController();
    expect(modalControllerInstance).toBeInstanceOf(ModalController);
  });

  test('should return the logManager instance from getLogManager', () => {
    const logManagerInstance = uiController.getLogManager();
    expect(logManagerInstance).toBeInstanceOf(LogManager);
  });

  test('should return the datasetManager instance from getDatasetManager', () => {
    const datasetManagerInstance = uiController.getDatasetManager();
    expect(datasetManagerInstance).toBe(datasetManager);
  });

  test('should return the tableManager instance from getTableManager', () => {
    const tableManagerInstance = uiController.getTableManager();
    expect(tableManagerInstance).toBeInstanceOf(TableManager);
  });
});