import React, { useState, useEffect } from "react";
import { Card, Select, Button, Dropdown, Space, Menu, Input, Divider } from "antd";
import { ChromePicker } from "react-color";
import GraphManager from "./GraphManager";
import CurveFittingModal from "../modal/CurveFittingModal";
import { chartCategories } from "./ChartCategories";
import "./EditGraphPanel.css"; 

const EditGraphPanel = () => {
  const [graphDetails, setGraphDetails] = useState([]); //holds the graph details of the graph to be edited
  const [selectedGraphForEdit, setSelectedGraphForEdit] = useState(null); // the actual graph currently selected for editing
  const [editColor, setEditColor] = useState("#ffffff"); // color of the selected graph
  const [selectedX, setSelectedX] = useState(null); // x-axis of the selected graph
  const [selectedY, setSelectedY] = useState(null); // y-axis of the selected graph
  const [selectedZ, setSelectedZ] = useState(null); // z-axis of the selected graph
  const [selectedType, setSelectedType] = useState(null);
  const [curveFitVisible, setCurveFitVisible] = useState(false); // curve fitting line of the selected graph
  const [additionalYAxes, setAdditionalYAxes] = useState([]); // more y axes of the selected graph
  const [filterData, setFilterData] = useState({
    include: [], //include filter for data points/ x-axis
    exclude: []  //exclude filter for data points/ y-axis
  });

  // Fetching information from graph and synchronize on change
  useEffect(() => {
    const fetchGraphs = () => {
      const graphs = GraphManager.getAllGraphs().map((graph) => ({
        graphId: graph.id,
        graphName: graph.name,
        graphType: graph.type,
        graphFeatures: graph.selectedFeatures,
        xColumn: graph.xAxis,
        yColumn: graph.yAxis,
        zColumn: graph.ZAxis,
        dataset: graph.dataset || {},
        color: graph.style?.colorScheme || "#ffffff",
        style: graph.style,
        graphObject: graph, // original graph object to ensure that graph is actualy a "graph" object
        graphDatasetId: graph.datasetId,
      }));
      setGraphDetails(graphs);
    };

    fetchGraphs();

    const handleGraphChange = () => fetchGraphs();
    GraphManager.onChange(handleGraphChange);

    return () => GraphManager.offChange(handleGraphChange);
  }, []);

  const handleGraphSelect = (graphId) => {
    setSelectedGraphForEdit(graphId);
    const graph = graphDetails.find((g) => g.graphId === graphId);
    setEditColor(graph ? graph.color : "#ffffff");
    setSelectedX(graph?.graphFeatures[0] || null);
    setSelectedY(graph?.graphFeatures[1] || null);
    setSelectedZ(graph?.graphFeatures[2] || null);
    // Instead of resetting additionalYAxes to empty, synchronize it with the graph's moreYAxes array
    const moreYAxes = graph?.graphObject?.getMoreYAxes();
    setAdditionalYAxes(moreYAxes || []);
    setSelectedType(graph?.graphType);
  };

  const handleColorChange = (color) => {
    setEditColor(color.hex);
  };

  const handleEditGraphSubmit = () => {
    if (!selectedGraphForEdit) return;
    GraphManager.changeGraphColor(selectedGraphForEdit, editColor);

    setGraphDetails((prevState) =>
      prevState.map((graph) =>
        graph.graphId === selectedGraphForEdit
          ? { ...graph, color: editColor, style: { ...graph.style, colorScheme: editColor } }
          : graph
      )
    );
  };

  const handleFilterChange = (type, startValue, endValue) => {
    const start = Number(startValue);
    const end = Number(endValue);
    if (start && end && start <= end) {
      setFilterData((prevData) => {
        const newFilters = { ...prevData };
        if (newFilters[type]) {
          newFilters[type] = newFilters[type].filter(
            (filter) => !(filter.start === start && filter.end === end)
          );
        }
        newFilters[type] = [...(newFilters[type] || []), { start, end }];
        return newFilters;
      });

      if (selectedGraphForEdit) {
        const graph = GraphManager.getGraphById(selectedGraphForEdit);
        if (!graph) return;
        if (type === "include") {
          GraphManager.restoreRangeToGraph(selectedGraphForEdit, start, end);
          console.log("include");
        } else if (type === "exclude") {
          GraphManager.excludeRangeFromGraph(selectedGraphForEdit, start, end);
        }
      }
    }
  };

  const selectedGraph = graphDetails.find(
    (graph) => graph.graphId === selectedGraphForEdit
  );

  const handleAxisChange = (axis, newFeature) => {
    if (!selectedGraphForEdit) return;
    if (axis === "x") setSelectedX(newFeature);
    if (axis === "y") setSelectedY(newFeature);
    if (axis === "z") setSelectedZ(newFeature);
    GraphManager.changeAxis(selectedGraphForEdit, axis, newFeature);
  };

  // Common select component for original axes (X, Y, Z)
  const renderFeatureSelect = (axis, selectedValue, setSelectedValue) => {
    const dataset =
      selectedGraph?.graphObject?.getDataset &&
      selectedGraph.graphObject.getDataset();

    if (!dataset) {
      return (
        <Select disabled placeholder="No Features Available" style={{ width: 200 }} />
      );
    }

    return (
      <Select
        showSearch
        style={{ width: 200 }}
        placeholder={`Select ${axis.toUpperCase()} Axis`}
        optionFilterProp="children"
        value={selectedValue}
        onChange={(value) => {
          setSelectedValue(value);
          handleAxisChange(axis, value);
        }}
        onSearch={(value) => console.log(`Search ${axis}:`, value)}
      >
        {Object.keys(dataset).map((feature) => (
          <Select.Option key={feature} value={feature}>
            {feature}
          </Select.Option>
        ))}
      </Select>
    );
  };

  // Additional Y axes: select component with a delete button
  const renderAdditionalYAxis = (axisValue, index) => {
    const dataset =
      selectedGraph?.graphObject?.getDataset &&
      selectedGraph.graphObject.getDataset();
    if (!dataset) {
      return (
        <Select disabled placeholder="No Features Available" style={{ width: 200 }} />
      );
    }
    return (
      <div
        key={index}
        style={{
          marginBottom: "10px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <label style={{ marginRight: "8px" }}>Additional Y Axis {index + 1}:</label>
        <Select
          showSearch
          style={{ width: 200 }}
          placeholder="Select Y Axis Feature"
          optionFilterProp="children"
          value={axisValue}
          onChange={(value) => handleAdditionalYAxisChange(index, value)}
          onSearch={(value) => console.log("Search Y:", value)}
        >
          {Object.keys(dataset).map((feature) => (
            <Select.Option key={feature} value={feature}>
              {feature}
            </Select.Option>
          ))}
        </Select>
        <Button
          type="text"
          danger
          onClick={() => handleRemoveAdditionalYAxis(index)}
          style={{ marginLeft: "8px" }}
        >
          X
        </Button>
      </div>
    );
  };

  // Update additional Y axis value in both local state and GraphManager
  const handleAdditionalYAxisChange = (index, newValue) => {
    const newAdditionalYAxes = [...additionalYAxes];
    newAdditionalYAxes[index] = newValue;
    setAdditionalYAxes(newAdditionalYAxes);

    const graph = GraphManager.getGraphById(selectedGraphForEdit);
    if (graph) {
      let currentAxes = graph.getMoreYAxes();
      currentAxes[index] = newValue;
      graph.setMoreYAxes(currentAxes);
      GraphManager.notify({ type: "graphUpdated" });
    }
  };

  // Remove an additional Y axis from both local state and GraphManager
  const handleRemoveAdditionalYAxis = (index) => {
    const newAdditionalYAxes = additionalYAxes.filter((_, i) => i !== index);
    setAdditionalYAxes(newAdditionalYAxes);

    const graph = GraphManager.getGraphById(selectedGraphForEdit);
    if (graph) {
      let currentAxes = graph.getMoreYAxes();
      currentAxes.splice(index, 1);
      graph.setMoreYAxes(currentAxes);
      GraphManager.notify({ type: "graphUpdated" });
    }
  };

  const handleTypeChange = (newType) => {
    if (!selectedGraphForEdit) return;
    GraphManager.changeType(selectedGraphForEdit, newType);

    const updatedGraph = graphDetails.find(
      (graph) => graph.graphId === selectedGraphForEdit
    );
    if (updatedGraph) {
      setSelectedX(updatedGraph.graphFeatures[0] || null);
      setSelectedY(updatedGraph.graphFeatures[1] || null);
      setSelectedZ(updatedGraph.graphFeatures[2] || null);
      setSelectedType(newType);
    }
  };

  // When "Add Multiple Y" button is clicked, add an additional Y axis.
  const handleAddMultipleYClick = () => {
    if (!selectedGraphForEdit) return;
    if (selectedGraph?.graphType === "line" || selectedGraph?.graphType === "bar" || selectedGraph.graphType === "area") {
      const newAxis = null;
      setAdditionalYAxes([...additionalYAxes, newAxis]);
      GraphManager.addMoreYAxis(selectedGraphForEdit, newAxis);
      console.log("Added new Y axis");
    }
  };

  const renderShowedDatapoints = () => {
    if (!selectedGraph) return null;
    const showedDatapoints = selectedGraph.graphObject.showedDatapoints || [];

    if (showedDatapoints.length === 0) return null;

    const sortedPoints = [...showedDatapoints].sort((a, b) => a - b);
    let ranges = [];
    let start = sortedPoints[0];
    let prev = sortedPoints[0];

    sortedPoints.slice(1).forEach((num) => {
      if (num === prev + 1) {
        prev = num;
      } else {
        ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
        start = num;
        prev = num;
      }
    });

    ranges.push(start === prev ? `${start}` : `${start}-${prev}`);

    return (
      <div style={{ marginTop: "10px" }}>
        <label>Showing Data Points: </label>
        <p>{ranges.join(", ")}</p>
      </div>
    );
  };

  const renderChartCategories = () => (
    <Menu>
      {Object.entries(chartCategories).map(([category, charts]) => (
        <Menu.SubMenu key={category} title={category}>
          {charts.map((chart) => (
            <Menu.Item key={chart.type} onClick={() => handleTypeChange(chart.type)}>
              <Space>
                {chart.icon} {chart.name}
              </Space>
            </Menu.Item>
          ))}
        </Menu.SubMenu>
      ))}
    </Menu>
  );

  return (
    <Card title="Edit Graph" style={{ width: "100%" }}>
      <div style={{ marginBottom: "10px" }}>
        <label style={{ marginRight: "8px" }}>Graph: </label>
        <Select
          style={{ width: 400 }}
          placeholder="Select a graph"
          value={selectedGraphForEdit}
          onChange={handleGraphSelect}
        >
          {graphDetails.map((graph) => (
            <Select.Option key={graph.graphId} value={graph.graphId}>
              {`${graph.graphName} - ${graph.graphType} - (${graph.graphFeatures?.join(", ")})`}
            </Select.Option>
          ))}
        </Select>
      </div>

      <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ marginRight: "8px" }}>X Axis: </label>
            {renderFeatureSelect("x", selectedX, setSelectedX)}
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label style={{ marginRight: "8px" }}>Y Axis: </label>
            {renderFeatureSelect("y", selectedY, setSelectedY)}
          </div>

          {/* Render additional Y axes based on the additionalYAxes state */}
          {additionalYAxes.map((axisValue, index) =>
            renderAdditionalYAxis(axisValue, index)
          )}

          <div style={{ marginBottom: "10px" }}>
            <Button
              type="default"
              onClick={handleAddMultipleYClick}
              style={{
                marginTop: "10px",
                backgroundColor: selectedGraph && !(selectedGraph.graphType === "line" || selectedGraph.graphType === "bar" || selectedGraph.graphType === "area") ? "#d9d9d9" : "",
              }}
              disabled={selectedGraph && !( selectedGraph.graphType === "line" || selectedGraph.graphType === "bar" || selectedGraph.graphType === "area") }
            >
              Add Multiple Y
            </Button>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label style={{ marginRight: "8px" }}>Z Axis: </label>
            {renderFeatureSelect("z", selectedZ, setSelectedZ)}
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label style={{ marginRight: "8px" }}>Select Chart Type: </label>
            <Dropdown overlay={renderChartCategories}>
              <Button>Select Chart Type</Button>
            </Dropdown>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: "200px"}}>
          <div style={{ marginBottom: "10px", width: "150px" }}>
            <label style={{ marginRight: "8px" }}>Color: </label>
            <div style={{ width: "25px" }}>
      <ChromePicker color={editColor} onChange={handleColorChange} disableAlpha />
    </div>
          </div>
          <Button type="primary" onClick={handleEditGraphSubmit}>
            Recolour Graph
          </Button>
          <Button type="default" onClick={() => setCurveFitVisible(true)}>
            Fit Curve
          </Button>
        </div>
      </div>

      {renderShowedDatapoints()}
      <Divider />

      <div style={{ marginBottom: "10px" }}>
        <label style={{ marginRight: "8px" }}>Include Filter (Start - End): </label>
        <Input.Group compact>
          <Input
            style={{ width: "120px" }}
            placeholder="Start"
            onChange={(e) => setFilterData({ ...filterData, start: e.target.value })}
          />
          <Input
            style={{ width: "120px" }}
            placeholder="End"
            onChange={(e) => setFilterData({ ...filterData, end: e.target.value })}
          />
          <Button
            type="default"
            onClick={() => handleFilterChange("include", filterData.start, filterData.end)}
          >
            Apply Include
          </Button>

          <Button
      type="default"
      onClick={() => {
        const dataset = selectedGraph?.graphObject.dataset;
        const featureKey = selectedGraph?.graphObject.selectedFeatures[0];
        if (dataset && featureKey) {
          handleFilterChange("include", 1, dataset[featureKey]?.length);
        }
      }}
    >
      Include All
    </Button>
        </Input.Group>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label style={{ marginRight: "8px" }}>Exclude Filter (Start - End): </label>
        <Input.Group compact>
          <Input
            style={{ width: "120px" }}
            placeholder="Start"
            onChange={(e) => setFilterData({ ...filterData, start: e.target.value })}
          />
          <Input
            style={{ width: "120px" }}
            placeholder="End"
            onChange={(e) => setFilterData({ ...filterData, end: e.target.value })}
          />
          <Button
            type="default"
            onClick={() => handleFilterChange("exclude", filterData.start, filterData.end)}
          >
            Apply Exclude
          </Button>

          <Button
      type="default"
      onClick={() => {
        const dataset = selectedGraph?.graphObject.dataset;
        const featureKey = selectedGraph?.graphObject.selectedFeatures[0];
        if (dataset && featureKey) {
          handleFilterChange("exclude", 1, dataset[featureKey]?.length);
        }
      }}
    >
      Exclude All
    </Button>
        </Input.Group>
      </div>

      {curveFitVisible && selectedGraph && (
        <CurveFittingModal
          visible={curveFitVisible}
          onCancel={() => setCurveFitVisible(false)}
          graph={selectedGraph}
        />
      )}
    </Card>
  );
};

export default EditGraphPanel;
