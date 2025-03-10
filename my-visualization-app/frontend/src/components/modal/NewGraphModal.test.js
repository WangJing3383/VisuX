import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NewGraphModal from "./NewGraphModal";
import datasetManager from "../file/DatasetManager";
import { message } from "antd";

// --- Mocks --- //
jest.mock("../file/DatasetManager", () => ({
  getCurrentDatasetId: jest.fn(),
  getDatasetColumns: jest.fn(),
  getDatasetById: jest.fn(),
}));

jest.mock("../graph/ChartCategories", () => ({
  chartCategories: {
    "Bar Charts": [
      { type: "bar", requiredFeatures: 2, icon: "📊", name: "Bar Chart" },
    ],
    "Line Charts": [
      { type: "line", requiredFeatures: 1, icon: "📈", name: "Line Chart" },
    ],
  },
}));

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  window.matchMedia = jest.fn().mockImplementation(() => ({
    matches: false,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  }));
});

describe("NewGraphModal Component", () => {
  test("fetches and displays features when modal is visible", async () => {
    datasetManager.getCurrentDatasetId.mockReturnValue("testDataset");
    datasetManager.getDatasetColumns.mockResolvedValue(["Feature1", "Feature2"]);
    
    render(
      <NewGraphModal
        visible={true}
        onCancel={jest.fn()}
        uiController={{ handleUserAction: jest.fn() }}
      />
    );
    
    // While features are loading, a loading message is displayed.
    expect(screen.getByText(/Loading dataset features/i)).toBeInTheDocument();
    
    // Wait for loading to finish
    await waitFor(() =>
      expect(screen.queryByText(/Loading dataset features/i)).not.toBeInTheDocument()
    );
    
    // Check that the tabs are rendered (e.g. the "Bar Charts" tab)
    expect(screen.getByText("Bar Charts")).toBeInTheDocument();
  });

  test("warns when no dataset id is found", async () => {
    datasetManager.getCurrentDatasetId.mockReturnValue(undefined);
    const warningSpy = jest.spyOn(message, "warning").mockImplementation(() => {});

    render(
      <NewGraphModal
        visible={true}
        onCancel={jest.fn()}
        uiController={{ handleUserAction: jest.fn() }}
      />
    );

    await waitFor(() =>
      expect(warningSpy).toHaveBeenCalledWith("No dataset ID found. Please upload a dataset.")
    );
  });

  test("updates selected graph type and required features on chart selection", async () => {
    datasetManager.getCurrentDatasetId.mockReturnValue("testDataset");
    datasetManager.getDatasetColumns.mockResolvedValue(["Feature1", "Feature2", "Feature3"]);

    render(
      <NewGraphModal
        visible={true}
        onCancel={jest.fn()}
        uiController={{ handleUserAction: jest.fn() }}
      />
    );

    await waitFor(() =>
      expect(screen.queryByText(/Loading dataset features/i)).not.toBeInTheDocument()
    );
    
    // Simulate user clicking on the "Bar Chart" card (which requires 2 features)
    fireEvent.click(screen.getByText("Bar Chart"));
    
    // Now the UI should indicate that 2 features must be selected.
    expect(screen.getByText(/Select 2 Features:/i)).toBeInTheDocument();
  });

  test("enables confirm button only when correct number of features are selected and handles confirm action", async () => {
    const mockOnCancel = jest.fn();
    const mockHandleUserAction = jest.fn();
  
    datasetManager.getCurrentDatasetId.mockReturnValue("testDataset");
    datasetManager.getDatasetColumns.mockResolvedValue(["Feature1", "Feature2", "Feature3"]);
    datasetManager.getDatasetById.mockResolvedValue({ id: "testDataset", name: "Test Dataset" });
  
    render(
      <NewGraphModal
        visible={true}
        onCancel={mockOnCancel}
        uiController={{ handleUserAction: mockHandleUserAction }}
      />
    );
  
    await waitFor(() =>
      expect(screen.queryByText(/Loading dataset features/i)).not.toBeInTheDocument()
    );
  
    // Update the graph name input
    fireEvent.change(screen.getByPlaceholderText("Enter a name for your graph"), {
      target: { value: "My Graph" },
    });
  
    // Select the "Bar Chart" which requires 2 features
    fireEvent.click(screen.getByText("Bar Chart"));
  
    // The Confirm button should be disabled until 2 features are selected
    const confirmButton = screen.getByRole("button", { name: /Confirm/i });
    expect(confirmButton).toBeDisabled();
  
    // Select two features by clicking on the checkboxes
    // (Using getByLabelText to select checkboxes based on the feature name)
    fireEvent.click(screen.getByLabelText("Feature1"));
    fireEvent.click(screen.getByLabelText("Feature2"));
  
    // Now the Confirm button should be enabled
    expect(confirmButton).toBeEnabled();
  
    // Click the confirm button
    fireEvent.click(confirmButton);
  
    // Wait for user action to be triggered and verify it
    await waitFor(() => {
      expect(mockHandleUserAction).toHaveBeenCalled();
    });
  
    // Check if the handleUserAction was called with correct arguments
    expect(mockHandleUserAction).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "CREATE_GRAPH",
        graphInfo: expect.objectContaining({
          graphName: "My Graph",
          graphType: "bar",
          selectedFeatures: ["Feature1", "Feature2"],
          datasetId: "testDataset",
          dataset: { id: "testDataset", name: "Test Dataset" },
        }),
      })
    );
  
    // Check if onCancel was called after the confirm button is clicked
    expect(mockOnCancel).toHaveBeenCalled();
  });
  

  test("calls onCancel when cancel button is clicked", async () => {
    const mockOnCancel = jest.fn();

    datasetManager.getCurrentDatasetId.mockReturnValue("testDataset");
    datasetManager.getDatasetColumns.mockResolvedValue(["Feature1"]);

    render(
      <NewGraphModal
        visible={true}
        onCancel={mockOnCancel}
        uiController={{ handleUserAction: jest.fn() }}
      />
    );

    await waitFor(() =>
      expect(screen.queryByText(/Loading dataset features/i)).not.toBeInTheDocument()
    );

    const cancelButton = screen.getByRole("button", { name: /Cancel/i });
    fireEvent.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalled();
  });

  test("updates graph name input field", async () => {
    datasetManager.getCurrentDatasetId.mockReturnValue("testDataset");
    datasetManager.getDatasetColumns.mockResolvedValue(["Feature1"]);

    render(
      <NewGraphModal
        visible={true}
        onCancel={jest.fn()}
        uiController={{ handleUserAction: jest.fn() }}
      />
    );

    await waitFor(() =>
      expect(screen.queryByText(/Loading dataset features/i)).not.toBeInTheDocument()
    );

    const input = screen.getByPlaceholderText("Enter a name for your graph");
    fireEvent.change(input, { target: { value: "New Graph" } });
    expect(input.value).toBe("New Graph");
  });
});
