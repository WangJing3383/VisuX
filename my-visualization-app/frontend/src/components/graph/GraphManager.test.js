import GraphManager from "./GraphManager";
jest.mock("./Graph");

describe("GraphManager Class", () => {
  let mockGraph;
  
  beforeEach(() => {
    GraphManager.graphs.clear();

    mockGraph = {
      id: "graph_1",
      changeColor: jest.fn(),
      setXAxis: jest.fn(),
      setYAxis: jest.fn(),
      setZAxis: jest.fn(),
      setType: jest.fn(),
      setFittedCurve: jest.fn(),
      excludeRange: jest.fn(),
      restoreRange: jest.fn(),
      setMoreYAxes: jest.fn(),
      getMoreYAxes: jest.fn().mockReturnValue([])
    };
  });

  test("should create a graph and add it to the map", () => {
    const graphInfo = {
      datasetId: 1,
      graphName: "Test Graph",
      graphType: "scatter",
      dataset: {
        features: ["a", "b", "c", "d"],
        records: [{a: [1, 2, 3]}, {b: [10, 20, 30]}, {c: [100, 200, 300]}, {d: [400, 500, 600] }],
      },
      selectedFeatures: ["a", "b"]
    };

    const newGraph = GraphManager.createGraph(graphInfo);
    expect(newGraph).not.toBeNull();
  });

  test("should delete a graph successfully", () => {
    GraphManager.graphs.set("graph_1", mockGraph);
    expect(GraphManager.deleteGraph("graph_1")).toBe(true);
    expect(GraphManager.getGraphById("graph_1")).toBeNull();
  });

  test("should return null if graph ID not found", () => {
    expect(GraphManager.getGraphById("nonexistent_graph")).toBeNull();
  });

  test("should change graph color", () => {
    GraphManager.graphs.set("graph_1", mockGraph);
    expect(GraphManager.changeGraphColor("graph_1", "red")).toBe(true);
    expect(mockGraph.changeColor).toHaveBeenCalledWith("red");
  });

  test("should change graph axis", () => {
    GraphManager.graphs.set("graph_1", mockGraph);
    expect(GraphManager.changeAxis("graph_1", "x", "newFeature")).toBe(true);
    expect(mockGraph.setXAxis).toHaveBeenCalledWith("newFeature");
  });

  test("should apply curve fitting", () => {
    GraphManager.graphs.set("graph_1", mockGraph);
    expect(GraphManager.applyCurveFitting("graph_1", [1, 2, 3])).toBe(true);
    expect(mockGraph.setFittedCurve).toHaveBeenCalledWith([1, 2, 3]);
  });

  test("should exclude and restore range", () => {
    GraphManager.graphs.set("graph_1", mockGraph);
    expect(GraphManager.excludeRangeToGraph("graph_1", 1, 2)).toBe(true);
    expect(mockGraph.excludeRange).toHaveBeenCalledWith(1, 2);
    
    expect(GraphManager.restoreRangeToGraph("graph_1", 1, 2)).toBe(true);
    expect(mockGraph.restoreRange).toHaveBeenCalledWith(1, 2);
  });

  test("should add more Y axes", () => {
    GraphManager.graphs.set("graph_1", mockGraph);
    expect(GraphManager.addMoreYAxis("graph_1", "y2")).toBe(true);
    expect(mockGraph.setMoreYAxes).toHaveBeenCalledWith(["y2"]);
  });

  test("should handle event listeners correctly", () => {
    const callback = jest.fn();
    GraphManager.onChange(callback);
    GraphManager.notify({ type: "graphUpdated" });
    expect(callback).toHaveBeenCalledWith({ type: "graphUpdated" });
    
    GraphManager.offChange(callback);
    GraphManager.notify({ type: "graphUpdated" });
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
