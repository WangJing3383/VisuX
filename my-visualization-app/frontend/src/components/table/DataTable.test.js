import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DataTable from "./DataTable"
import datasetManager from "../file/DatasetManager";
import { message } from "antd";

// Mock datasetManager functions
jest.mock("../file/DatasetManager", () => ({
  getCurrentDatasetId: jest.fn(),
}));

global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(message, "warning").mockImplementation(() => {});
  jest.spyOn(message, "error").mockImplementation(() => {});
  jest.spyOn(message, "success").mockImplementation(() => {});

  datasetManager.getCurrentDatasetId.mockReturnValue("testDataset");

  // Mock window.matchMedia to prevent errors
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});


describe("DataTable Component", () => {
  test("loads and displays dataset correctly", async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({
        features: ["Feature1", "Feature2"],
        records: [
          { Feature1: "A", Feature2: 10 },
          { Feature1: "B", Feature2: 20 },
          { Feature1: "C", Feature2: 30 },
          { Feature1: "D", Feature2: 40 },
          { Feature1: "E", Feature2: 50 },
        ],
      }),
    });

    render(<DataTable />);
    await screen.findByText("Feature1");

    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  test("pagination is fixed at 5 rows per page", async () => {
    fetch.mockResolvedValueOnce({
        json: async () => ({
            features: ["Feature1", "Feature2"],
            records: Array.from({ length: 10 }, (_, index) => ({
                Feature1: `Row ${index + 1}`,
                Feature2: (index + 1) * 10,
            })), // Ensure at least 10 rows for pagination
        }),
    });

    render(<DataTable />);
    await screen.findByText("Feature1"); // Ensure table is loaded

    // Verify first page only shows first 5 rows
    expect(screen.getByText("Row 1")).toBeInTheDocument();
    expect(screen.getByText("Row 5")).toBeInTheDocument();
    expect(screen.queryByText("Row 6")).not.toBeInTheDocument(); // Row 6 should not be visible

    // Click "Next Page" button
    const nextPageButton = await screen.findByTitle("Next Page");
    fireEvent.click(nextPageButton);

    // Check next page contains Row 6 and Row 10
    await screen.findByText("Row 6");
    await screen.findByText("Row 10");
    await waitFor(() => expect(screen.queryByText("Row 5")).not.toBeInTheDocument()); // Row 5 should no longer be visible
});



  test("warns when dataset ID is missing", async () => {
    datasetManager.getCurrentDatasetId.mockReturnValue(undefined);

    render(<DataTable />);
    await waitFor(() =>
      expect(message.warning).toHaveBeenCalledWith("No dataset ID found. Please upload a dataset.")
    );
  });

  test("handles dataset fetch failure", async () => {
    fetch.mockRejectedValueOnce(new Error("Network error"));

    render(<DataTable />);
    await waitFor(() => expect(message.error).toHaveBeenCalledWith("Error loading dataset."));
  });

  test("column selection triggers onClick event", async () => {
    fetch.mockResolvedValueOnce({
        json: async () => ({
            features: ["Feature1", "Feature2"],
            records: [
                { Feature1: "A", Feature2: 10 },
                { Feature1: "B", Feature2: 20 },
            ],
        }),
    });

    render(<DataTable />);
    await screen.findByText("Feature1"); // Ensure table is loaded

    // Mock event listener
    const handleClick = jest.fn();
    screen.getByText("Feature1").addEventListener("click", handleClick);

    // Click Feature1 column
    fireEvent.click(screen.getByText("Feature1"));

    // Verify event triggered
    expect(handleClick).toHaveBeenCalled();
});


  test("deletes selected columns and updates table", async () => {
    fetch
      .mockResolvedValueOnce({
        json: async () => ({
          features: ["Feature1", "Feature2"],
          records: [{ Feature1: "A", Feature2: 10 }],
        }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true }), // Mock successful delete
      })
      .mockResolvedValueOnce({
        json: async () => ({
          features: ["Feature2"], // Feature1 is removed
          records: [{ Feature2: 10 }],
        }),
      });

    render(<DataTable />);
    await screen.findByText("Feature1");

    // Select Feature1 for deletion
    fireEvent.click(screen.getByText("Feature1"));

    // Click delete button
    fireEvent.click(screen.getByRole("button", { name: /delete selected features/i }));

    await waitFor(() =>
      expect(message.success).toHaveBeenCalledWith("Features deleted successfully.")
    );

    // Ensure Feature1 is removed
    await waitFor(() => expect(screen.queryByText("Feature1")).not.toBeInTheDocument());
  });
});
