import React from "react";
import Draggable from "react-draggable";
import { Card, Button } from "antd";
import GraphComponent from "./GraphComponent";

const GraphWindow = ({ graph, onClose }) => {
  
    if (!graph) {
    console.error("GraphWindow received undefined graphData");
    return <p style={{ color: "red" }}>Error: No Graph Data</p>;
  }

  return (
    <Draggable handle=".drag-handle">
      <Card
        title={<div className="drag-handle">{graph.name}</div>}
        extra={<Button onClick={onClose} />}
        style={{
          position: "absolute",
          left: 100,
          top: 100,
          width: "400px",
          height: "300px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        }}
      >
        <GraphComponent graph={graph} />
      </Card>
    </Draggable>
  );
};

export default GraphWindow;
