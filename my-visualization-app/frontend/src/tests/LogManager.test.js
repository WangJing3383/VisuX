import LogManager from "../components/log/LogManager";

describe("LogManager", () => {
  let logManager;

  beforeEach(() => {
    logManager = new LogManager(); // Create a new instance of LogManager before each test.
  });

  test("should log an operation correctly", () => {
    const tool = "SomeEngineTool";
    const params = { param1: 12 };
    const datasetBefore = "old123";
    const datasetAfter = "new123";

    logManager.logOperation(tool, params, datasetBefore, datasetAfter);

    // Check if logs array has one entry
    expect(logManager.getLogs()).toHaveLength(1);

    const log = logManager.getLogs()[0];
    expect(log.tool).toBe(tool);
    expect(log.params).toEqual(params);
    expect(log.datasetBefore).toBe(datasetBefore);
    expect(log.datasetAfter).toBe(datasetAfter);
    expect(log.timestamp).toBeDefined();
  });

  test("should clear the redo stack after logging an operation", () => {
    logManager.redoStack = ["somePreviousState"];

    const tool = "SomeEngineTool";
    const params = { param1: 12 };
    const datasetBefore = "old123";
    const datasetAfter = "new123";

    logManager.logOperation(tool, params, datasetBefore, datasetAfter);
    expect(logManager.redoStack).toHaveLength(0);
  });

  test("should store dataset version after each operation", () => {
    const tool = "SomeEngineTool";
    const params = { param1: 12 };
    const datasetBefore = "old123";
    const datasetAfter = "new123";

    logManager.logOperation(tool, params, datasetBefore, datasetAfter);

    // Check if datasetVersions contains the latest version
    expect(logManager.datasetVersions).toContain(datasetAfter);
  });

  test("should return the correct logs", () => {
    const tool1 = "Tool1";
    const params1 = { param1: 12 };
    const datasetBefore1 = "dataset1";
    const datasetAfter1 = "dataset2";
    logManager.logOperation(tool1, params1, datasetBefore1, datasetAfter1);

    const tool2 = "Tool2";
    const params2 = { param2: 34 };
    const datasetBefore2 = "dataset2";
    const datasetAfter2 = "dataset3";
    logManager.logOperation(tool2, params2, datasetBefore2, datasetAfter2);

    expect(logManager.getLogs()).toHaveLength(2);
    expect(logManager.getLogs()[0].tool).toBe(tool1);
    expect(logManager.getLogs()[1].tool).toBe(tool2);
  });

  test("should add a log at the start of the logs array", () => {
    const newLog = {
      tool: "NewTool",
      params: { param3: 56 },
      datasetBefore: "datasetBefore",
      datasetAfter: "datasetAfter",
      timestamp: new Date().toISOString(),
    };

    // Add a new log to the start of the array
    logManager.addLog(newLog);

    // Ensure the new log is the first entry
    expect(logManager.getLogs()[0]).toBe(newLog);
  });

  test("should handle empty logs correctly", () => {
    // Check if logs are empty initially
    expect(logManager.getLogs()).toHaveLength(0);
  });
});
