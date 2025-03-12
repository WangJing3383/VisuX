import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import LogWindow from "../components/log/LogWindow";

// Mock log data for testing
const sampleLogs = [
  { timestamp: "13:29:01", tool: "ToolA", params: { foo: "bar" } },
  { timestamp: "13:34:03", tool: "ToolB", params: { foo: "baz" } },
];

// Before all tests, providing a mock URL and adjust sizing
beforeAll(() => {
  global.URL.createObjectURL = jest.fn(() => "dummy:dummy-url");
  global.URL.revokeObjectURL = jest.fn();

  //Watches an element’s size and reacts when it changes
  if (typeof global.ResizeObserver === "undefined") {
    global.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
  // Checks the screen size to determine which layout to display.
  if (typeof global.matchMedia === "undefined") {
    global.matchMedia = () => ({
      matches: false,
      addListener: () => {},
      removeListener: () => {},
    });
  }
});

describe("LogWindow Component", () => {
  test("renders table with provided logs and empty rows up to 5 rows", () => {
    render(<LogWindow logs={sampleLogs} />);
    
    const rows = screen.getAllByRole("row");
    //1 header row + 5 data rows = 6 rows total
    expect(rows.length).toBe(6);
    expect(screen.getByText("13:29:01")).toBeInTheDocument();
    expect(screen.getAllByText("-").length).toBeGreaterThanOrEqual(1);
  });

  test("clicking export button triggers download", () => {

    const createElementSpy = jest.spyOn(document, "createElement");
    render(<LogWindow logs={sampleLogs} />);
    const exportButton = screen.getByRole("button", { name: /Export Logs/i });
    fireEvent.click(exportButton);
    expect(createElementSpy).toHaveBeenCalledWith("a");
    
    createElementSpy.mockRestore();
  });
});
