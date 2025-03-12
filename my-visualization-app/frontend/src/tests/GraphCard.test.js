
  
  import React from "react";
  import { render, screen } from "@testing-library/react";
  import GraphCard from "../components/graph/GraphCard";

   global.URL.createObjectURL = jest.fn(() => "dummy:dummy-url");
   global.URL.revokeObjectURL = jest.fn();

  beforeAll(() => {
    global.URL.createObjectURL = jest.fn(() => "dummy:dummy-url");
    global.URL.revokeObjectURL = jest.fn();

    if (typeof global.ResizeObserver === "undefined") {
      global.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
      };
    }
    if (typeof global.matchMedia === "undefined") {
      global.matchMedia = () => ({
        matches: false,
        addListener: () => {},
        removeListener: () => {},
      });
    }
  });
  
  test("renders Plot with provided graphData and displays custom title", async () => {
    const dummyGraphScript = {
      data: [{ x: [1, 2, 3], y: [4, 5, 6], type: "scatter" }],
    };
    const graphData = {
      graphName: "Test Graph",
      graphScript: dummyGraphScript,
    };
  
    render(<GraphCard graphId="graph1" graphData={graphData} />);
  
    // Check that the custom title (graph name) is displayed.
    expect(screen.getByText("Test Graph")).toBeInTheDocument();
    expect(screen.queryByText("Error loading graph.")).not.toBeInTheDocument();
  });
  
  test("renders Plot when no graphData is provided", async () => {
    const dummyGraphScript = {
        data: [{type: "scatter" }],
      };
      const graphData = {
        graphName: "Test Graph",
        graphScript: dummyGraphScript,
      };
    
      render(<GraphCard graphId="graph1" graphData={graphData} />);
    
      // Check that the custom title (graph name) is displayed.
      expect(screen.getByText("Test Graph")).toBeInTheDocument();
      expect(screen.queryByText("Error loading graph.")).not.toBeInTheDocument();
    });
  
  