import ToolManager from "../components/tool/ToolManager";

//Mock methods
const datasetManager = { addDatasetId: jest.fn() };
const logManager = { logOperation: jest.fn() };
const graphManager = { createGraph: jest.fn(), updateGraphsForDataset: jest.fn() };
const tableManager = { updateTableDataset: jest.fn() };

// Mock UIController
const mockUiController = {
  postRequest: jest.fn(),
  notifyUser: jest.fn(),
  getDatasetManager: () => datasetManager,
  getLogManager: () => logManager,
  getGraphManager: () => graphManager,
  getTableManager: () => tableManager,
};

describe("ToolManager", () => {
  let toolManager;
  beforeEach(() => {
    // Reset call counts on mocks and creates a new instance of ToolManager before each test
    jest.clearAllMocks();
    toolManager = new ToolManager(mockUiController);
  });

  test("executes tool and updates dataset when new dataset is returned", async () => {
    mockUiController.postRequest.mockResolvedValue({ new_dataset_id: "new123" });
    await toolManager.executeTool("SomeTool", "old123", { param1: 42 });

    expect(mockUiController.postRequest).toHaveBeenCalledWith("/api/tools/SomeTool", {
      dataset_id: "old123",
      params: { param1: 42 },
    });
    expect(datasetManager.addDatasetId).toHaveBeenCalledWith("new123", undefined);
    expect(logManager.logOperation).toHaveBeenCalledWith("SomeTool", { param1: 42 }, "old123", "new123");
    expect(mockUiController.notifyUser).toHaveBeenCalledWith("Dataset updated successfully! New dataset ID: new123");
  });

  test("executes tools and displays generated results for different tools", async () => {
    const testCases = [
      { toolName: "Curve Fitting", expectedTitle: "Curve Fitting Result" },
      { toolName: "Correlation", expectedTitle: "Correlation Analysis" },
      { toolName: "Extrapolation", expectedTitle: "Extrapolated Data" },
      { toolName: "Interpolation", expectedTitle: "Interpolated Data" },
      { toolName: "Oversampling", expectedTitle: "Oversampled Data" },
    ];

    for (const { toolName, expectedTitle } of testCases) {
      mockUiController.postRequest.mockResolvedValue({ generated_data: [1, 2, 3] });
      await toolManager.executeTool(toolName, "old123", { param: 1 });

      expect(graphManager.createGraph).toHaveBeenCalledWith([1, 2, 3], expectedTitle);
      jest.clearAllMocks();
    }
  });

  test("executes tool and handles unsupported tool names", async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockUiController.postRequest.mockResolvedValue({ generated_data: [1, 2, 3] });
  
    // Execute tool with an unsupported name
    await toolManager.executeTool("UnknownTool", "old123", { param: 1 });

    expect(warnSpy).toHaveBeenCalledWith('No specific visualization for tool: UnknownTool');
    warnSpy.mockRestore();
  });
  
  
  test("executes tool but fails and notifies user on error", async () => {
    mockUiController.postRequest.mockRejectedValue(new Error("API error"));
    await toolManager.executeTool("SomeTool", "old123", { param: 1 });

    expect(mockUiController.notifyUser).toHaveBeenCalledWith("Tool execution failed.");
  });
});