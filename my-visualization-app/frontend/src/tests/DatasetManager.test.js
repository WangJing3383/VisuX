import datasetManager from "../components/file/DatasetManager";
import '@testing-library/jest-dom';

describe("DatasetManager", () => {
  beforeEach(() => {
    // Empty data to ensure tests run independently
    datasetManager.datasetMap.clear();
    datasetManager.datasetIds.clear();
    datasetManager.datasetNames.clear();
    datasetManager.currentDatasetId = null;
  });

  test("should add dataset ID correctly", () => {
    datasetManager.addDatasetId("123", "Dataset1");
    expect(datasetManager.datasetIds.has("123")).toBe(true);
    expect(datasetManager.getDatasetNameById("123")).toBe("Dataset1");
  });

  test("should not add an empty dataset ID", () => {
    console.warn = jest.fn();
    datasetManager.addDatasetId("", "Dataset1");
    expect(console.warn).toHaveBeenCalledWith("Cannot add an empty dataset ID.");
  });

  test("should return correct dataset name by ID", () => {
    datasetManager.addDatasetId("456", "Dataset2");
    expect(datasetManager.getDatasetNameById("456")).toBe("Dataset2");
    expect(datasetManager.getDatasetNameById("999")).toBe("Not Found");
  });

  test("should return correct suffix for dataset names", () => {
    datasetManager.addDatasetId("1", "TestDataset");
    datasetManager.addDatasetId("2", "TestDataset");
    expect(datasetManager.getSuffix("TestDataset")).toBe("(1)");
  });

  test("should set and get current dataset ID", () => {
    datasetManager.addDatasetId("789", "Dataset3");
    datasetManager.setCurrentDatasetId("789");
    expect(datasetManager.getCurrentDatasetId()).toBe("789");
  });

  test("should not set current dataset ID if ID does not exist", () => {
    console.warn = jest.fn();
    datasetManager.setCurrentDatasetId("999");
    expect(console.warn).toHaveBeenCalledWith("Dataset ID 999 does not exist in the manager.");
  });

  test("should get all dataset IDs", () => {
    datasetManager.addDatasetId("101", "Dataset4");
    datasetManager.addDatasetId("102", "Dataset5");
    expect(datasetManager.getAllDatasetsId()).toEqual(["101", "102"]);
  });

  test("should fetch dataset columns", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ columns: ["col1", "col2", "col3"] }),
      })
    );

    const columns = await datasetManager.getDatasetColumns("123");
    expect(columns).toEqual(["col1", "col2", "col3"]);
    expect(fetch).toHaveBeenCalledWith("http://127.0.0.1:8000/api/dataset/123/columns/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
  });

  test("should handle API errors in getDatasetColumns", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        text: () => Promise.resolve("Not Found"),
      })
    );

    const columns = await datasetManager.getDatasetColumns("999");
    expect(columns).toEqual([]);
  });

  test("should fetch dataset by ID and transform data", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            features: ["feature1", "feature2"],
            records: [
              { feature1: 1, feature2: "A" },
              { feature1: 2, feature2: "B" },
            ],
          }),
      })
    );

    const dataset = await datasetManager.getDatasetById("321");
    expect(dataset.data).toEqual({
      feature1: [1, 2],
      feature2: ["A", "B"],
    });
  });
});
