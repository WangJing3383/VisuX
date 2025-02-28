import React, { useState, useEffect } from "react";
import { Card, Select, Button, Dropdown, Space, Menu, Input, Divider } from "antd";
import { ChromePicker } from "react-color";
import GraphManager from "./GraphManager";
import CurveFittingModal from "../modal/CurveFittingModal";
import { chartCategories } from "./ChartCategories";
import "./EditGraphPanel.css"; 

// everything seen on editing screen
const EditGraphPanel = () => {
  const [graphDetails, setGraphDetails] = useState([]); //holds the graph details of the graph to be edited (empty at first because no graph is selected yet)
  const [selectedGraphForEdit, setSelectedGraphForEdit] = useState(null); // the actual graph currently selected for editing
  const [editColor, setEditColor] = useState("#ffffff"); // color of the selected graph (white when no graph available)
  //axes have a seperate use states for updating related buttons dynamically
  const [selectedX, setSelectedX] = useState(null); // x-axis of the selected graph
  const [selectedY, setSelectedY] = useState(null); // y-axis of the selected graph
  const [selectedZ, setSelectedZ] = useState(null); // z-axis of the selected graph
  const [curveFitVisible, setCurveFitVisible] = useState(false); // curve fitting line of the selected graph
  const [additionalYAxes, setAdditionalYAxes] = useState([]); // more y axes of the selected graph (empty array isntead of null because there can be more than 1 additional axes)
  //for filtering and showing data points from x axes
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
        color: graph.style?.colorScheme,
        style: graph.style,
        graphObject: graph, // original graph object to ensure that graph is actualy a "graph" object
        graphDatasetId: graph.datasetId,
      }));
      setGraphDetails(graphs);
    };

    fetchGraphs(); //using this to fetch graph info when Edit Graph Screen is opened

    const handleGraphChange = () => fetchGraphs();
    GraphManager.onChange(handleGraphChange); //for getting updated by graph changes

    return () => GraphManager.offChange(handleGraphChange); //when it is not on the screen anymore it doesn't have to listen graph updates
  }, [graphDetails]);


  //finding the true graph from GraphDetails
  const selectedGraph = graphDetails.find(
    (graph) => graph.graphId === selectedGraphForEdit
  );

  const handleGraphSelect = (graphId) => {
    setSelectedGraphForEdit(graphId);
    //finding selected graph from Graph Details list
    const graph = graphDetails.find((g) => g.graphId === graphId);
    setEditColor(graph ? graph.color : "#ffffff"); //coloring it white in case of any error
    setSelectedX(graph?.graphFeatures[0] || null);
    setSelectedY(graph?.graphFeatures[1] || null);
    setSelectedZ(graph?.graphFeatures[2] || null);
    // Instead of resetting additionalYAxes to empty, synchronize it with the graph's moreYAxes array
    const moreYAxes = graph?.graphObject?.getMoreYAxes();
    setAdditionalYAxes(moreYAxes || []);
    // setSelectedType(graph?.graphType);
  };

  const handleColorChange = (color) => {
    setEditColor(color.hex);
  };

  const handleEditGraphSubmit = () => {
    //name is edit graph submit because at first user had to click submit before seeing any change
    //but now only has to click "Recolour" for color updates
    if (!selectedGraphForEdit) return;
    GraphManager.changeGraphColor(selectedGraphForEdit, editColor);

    //taking the previous state of graph details to handle graph without missing any change
    setGraphDetails((prevState) =>
      prevState.map((graph) =>
        graph.graphId === selectedGraphForEdit
          ? { ...graph, color: editColor, style: { ...graph.style, colorScheme: editColor } }
          : graph
      )
    );
  };

  // type: include or exclude
  const handleFilterChange = (type, startValue, endValue) => {
    const start = Number(startValue);
    const end = Number(endValue);

    //to not handle if numbers are not valid
    if (start && end && start <= end) {

      //filter numbers were null at first but now saves until closing Edit Graph screen
      setFilterData((prevData) => {
        const newFilters = { ...prevData };


        if (newFilters[type]) {
          newFilters[type] = newFilters[type].filter(
            (filter) => !(filter.start === start && filter.end === end)
          );
        }

        //if the type is new it starts with an empty array
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
          GraphManager.excludeRangeToGraph(selectedGraphForEdit, start, end);
        }
      }
    }
  };

  // for selecting a new feature for axis(one at a time from X, Y, Z)
  const handleAxisChange = (axis, newFeature) => {
    if (!selectedGraphForEdit) return;
    if (axis === "x") setSelectedX(newFeature);
    if (axis === "y") setSelectedY(newFeature);
    if (axis === "z") setSelectedZ(newFeature);
    GraphManager.changeAxis(selectedGraphForEdit, axis, newFeature);
  };

  // Rendering of axes(X, Y, Z) and scroll down menu
  const renderFeatureSelect = (axis, selectedValue, setSelectedValue) => {
    const dataset =
      selectedGraph?.graphObject?.getDataset &&
      selectedGraph.graphObject.getDataset();

      //if dataset doesnt exist there are no features to select
    if (!dataset) {
      return (
        <Select disabled placeholder="No Features Available" style={{ width: 200 }} />
      );
    }

    return (

      // for selecting exactly one feature
      <Select
        showSearch //typing for searching specific feature
        style={{ width: 200 }}
        placeholder={`Select ${axis.toUpperCase()} Axis`}
        optionFilterProp="children" //he search will filter the options by their visible text (the children)
        value={selectedValue}
        onChange={(value) => {
          setSelectedValue(value);
          handleAxisChange(axis, value);
        }}
        onSearch={(value) => console.log(`Search ${axis}:`, value)}
      >
      
        {Object.keys(dataset).map((feature) => ( // Iterates through dataset keys and displays them as options
          <Select.Option key={feature} value={feature}>
            {feature}
          </Select.Option>
        ))}
      </Select>
    );
  };

  
  const renderAdditionalYAxis = (axisValue, index) => {
    const dataset =
      selectedGraph?.graphObject?.getDataset &&
      selectedGraph.graphObject.getDataset();
      // If no dataset is available, display a disabled select box with a placeholder
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
          showSearch //typing for searching specific feature
          style={{ width: 200 }}
          placeholder="Select Y Axis Feature"
          optionFilterProp="children"  //he search will filter the options by their visible text (the children)
          value={axisValue}
          onChange={(value) => handleAdditionalYAxisChange(index, value)}
          onSearch={(value) => console.log("Search Y:", value)}
        >
          {Object.keys(dataset).map((feature) => ( // Iterates through dataset keys and displays them as options
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

   // When "Add Multiple Y" button is clicked, add an additional Y axis.
   const handleAddMultipleYClick = () => {
    if (!selectedGraphForEdit) return;
    if (selectedGraph?.graphType === "line" || selectedGraph?.graphType === "bar" || selectedGraph.graphType === "area") {
      const newAxis = null; //when firstly created its empty then user selects it with handleAdditionalYAxisChange
      setAdditionalYAxes([...additionalYAxes, newAxis]);
      GraphManager.addMoreYAxis(selectedGraphForEdit, newAxis);
      console.log("Added new Y axis");
    }
  };

  // Remove an additional Y axis from both local state and GraphManager
  // index: additional Y axis number
  const handleRemoveAdditionalYAxis = (index) => {

    // 1. Update by filtering the Y-axis at the specified index
    const newAdditionalYAxes = additionalYAxes.filter((_, i) => i !== index);
    setAdditionalYAxes(newAdditionalYAxes);

    const graph = GraphManager.getGraphById(selectedGraphForEdit);
    if (graph) {
      let currentAxes = graph.getMoreYAxes(); // Get the current list of additional Y-axes
      currentAxes.splice(index, 1); // Remove the Y-axis at the specified index from the array
      graph.setMoreYAxes(currentAxes);
      GraphManager.notify({ type: "graphUpdated" });
    }
  };

  const handleTypeChange = (newType) => {
    if (!selectedGraphForEdit) return;
    GraphManager.changeType(selectedGraphForEdit, newType);

    //finding the correct graph from graphDetails
    const updatedGraph = graphDetails.find(
      (graph) => graph.graphId === selectedGraphForEdit
    );
    if (updatedGraph) {
      setSelectedX(updatedGraph.graphFeatures[0] || null);
      setSelectedY(updatedGraph.graphFeatures[1] || null);
      setSelectedZ(updatedGraph.graphFeatures[2] || null);
      //setSelectedType(newType);
    }
  };


  //for showing the data points in a format like "1-20, 60-238"
  const renderShowedDatapoints = () => {
    if (!selectedGraph) return null;
    const showedDatapoints = selectedGraph.graphObject.showedDatapoints || [];

    //If there are no showed datapoints, nothing to display
    if (showedDatapoints.length === 0) return null;

    //Sort the datapoints in ascending order
    const sortedPoints = [...showedDatapoints].sort((a, b) => a - b);
    let ranges = [];
    let start = sortedPoints[0];
    let prev = sortedPoints[0];

    //Iterating through sorted points, grouping into ranges
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

  //for rendering change graph type button(when you hover the mouse categories will show up)
  const renderChartCategories = () => (
    <Menu>
      {Object.entries(chartCategories).map(([category, charts]) => (
        //sub menu because it was divided like basic and advanced at first
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
      {/* Graph Selection Dropdown */}
      <div style={{ marginBottom: "10px" }}>
        <label style={{ marginRight: "8px" }}>Graph: </label>
        <Select
          style={{ width: 400 }}
          placeholder="Select a graph"
          value={selectedGraphForEdit}
          onChange={handleGraphSelect}
        >
          {/* Dynamically showing attributes for each available graph */}
          {graphDetails.map((graph) => (
            <Select.Option key={graph.graphId} value={graph.graphId}>
              {`${graph.graphName} - ${graph.graphType} - (${graph.graphFeatures?.join(", ")})`}
            </Select.Option>
          ))}
        </Select>
      </div>

      <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
           {/* X Axis selection */}
          <div style={{ marginBottom: "10px" }}>
            <label style={{ marginRight: "8px" }}>X Axis: </label>
            {renderFeatureSelect("x", selectedX, setSelectedX)}
          </div>

            {/* Y Axis selection */}
          <div style={{ marginBottom: "10px" }}>
            <label style={{ marginRight: "8px" }}>Y Axis: </label>
            {renderFeatureSelect("y", selectedY, setSelectedY)}
          </div>

          {/* Render additional Y axes based on the additionalYAxes state */}
          {additionalYAxes.map((axisValue, index) =>
            renderAdditionalYAxis(axisValue, index)
          )}
            
          {/* for more additional Y Axes */}
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

            {/* Z Axis selection */}
          <div style={{ marginBottom: "10px" }}>
            <label style={{ marginRight: "8px" }}>Z Axis: </label>
            {renderFeatureSelect("z", selectedZ, setSelectedZ)}
          </div>

            {/* Graph Type dropdown */}
          <div style={{ marginBottom: "10px" }}>
            <label style={{ marginRight: "8px" }}>Select Graph Type: </label>
            <Dropdown overlay={renderChartCategories}>
              <Button>Select Graph Type</Button>
            </Dropdown>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: "200px"}}>
          <div style={{ marginBottom: "10px", width: "150px" }}>

            {/* Color Picker */}
            <label style={{ marginRight: "8px" }}>Color: </label>
            <div style={{ width: "25px" }}>
      <ChromePicker color={editColor} onChange={handleColorChange} disableAlpha />
    </div>
          </div>
          <Button type="primary" onClick={handleEditGraphSubmit}>
            Recolour Graph
          </Button>
          {/* Curve Fitting */}
          <Button type="default" onClick={() => setCurveFitVisible(true)}>
            Fit Curve
          </Button>
        </div>
      </div>

        {/* showing data points (based on X axis) */}
      {renderShowedDatapoints()}
      <Divider />

         {/* Include Filter section */}
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
            

             {/* Include All */}
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
        {/* Exclude Filter section */}
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

             {/* Exclude All */}
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
