import React from "react";
import { render, screen } from "@testing-library/react";
import LogHistory from "../components/log/LogHistory";

// Polyfills for browser APIs used by Ant Design's Table component
beforeAll(() => {
   //Watches an element’s size and reacts when it changes (e.g., resizing a box).
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

describe("LogHistory Component", () => {
  test("renders table with provided logs", () => {
    const logs = [
      {
        key: "1",
        timestamp: "2025-03-12 12:00",
        tool: "Test Tool",
        params: { a: 1 },
      },
      {
        key: "2",
        timestamp: "2025-03-12 13:00",
        tool: "Another Tool",
        params: { b: 2 },
      },
    ];

    render(<LogHistory logs={logs} />);

    // Check that table headers are rendered
    expect(screen.getByText("Timestamp")).toBeTruthy();
    expect(screen.getByText("Tool")).toBeTruthy();
    expect(screen.getByText("Params")).toBeTruthy();

    // First log row
    expect(screen.getByText("2025-03-12 12:00")).toBeTruthy();
    expect(screen.getByText("Test Tool")).toBeTruthy();
    expect(screen.getByText(JSON.stringify({ a: 1 }))).toBeTruthy();

    // Second log row
    expect(screen.getByText("2025-03-12 13:00")).toBeTruthy();
    expect(screen.getByText("Another Tool")).toBeTruthy();
    expect(screen.getByText(JSON.stringify({ b: 2 }))).toBeTruthy();
  });

  test("renders fallback row when logs is empty", () => {
    render(<LogHistory logs={[]} />);
    expect(screen.getByText("No Logs")).toBeTruthy();
  });
});
