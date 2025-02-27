import { useState, useEffect } from "react";
import { Modal, Tabs, Card, Row, Col, Button, Checkbox, message, Input } from "antd";
import datasetManager from "../file/DatasetManager";
import { chartCategories } from "../graph/ChartCategories";

const { TabPane } = Tabs;

// Define chart categories

const NewGraphModal = ({ visible, onCancel, uiController }) => {
  const [features, setFeatures] = useState([]);
  const [selectedGraphType, setSelectedGraphType] = useState(null);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [selectedName, setSelectedName] = useState("");
  const [numFeatures, setNumFeatures] = useState(0);
  const [loading, setLoading] = useState(false);

  // Get the feature columns of the current dataset
  useEffect(() => {
    const fetchFeatures = async () => {
      const datasetId = datasetManager.getCurrentDatasetId();
      if (!datasetId) {
        message.warning("No dataset ID found. Please upload a dataset.");
        return;
      }

      setLoading(true);
      try {
        const columns = await datasetManager.getDatasetColumns(datasetId);
        setFeatures(columns);
      } catch (error) {
        message.error("Failed to load dataset features.");
      } finally {
        setLoading(false);
      }
    };

    if (visible) {
      fetchFeatures();
    }
  }, [visible]);

  // Get the number of features needed for the selected charts
  const getRequiredFeatures = (graphType) => {
    for (let category in chartCategories) {
      const chart = chartCategories[category].find((chart) => chart.type === graphType);
      if (chart) return chart.requiredFeatures;
    }
    return 0; // default
  };

  // Listen for changes in the selected chart type and update the number of features required
  useEffect(() => {
    if (selectedGraphType) {
      const required = getRequiredFeatures(selectedGraphType);
      console.log(`🔄 Updated numFeatures for ${selectedGraphType}: ${required}`);
      setNumFeatures(required);
      setSelectedFeatures([]); // Clear feature selection when switching charts
    }
  }, [selectedGraphType]);

  // Ensure that `selectedGraphType` is recorded.
  const handleGraphSelection = (graphType) => {
    console.log(`User selected graph type: ${graphType}`);
    setSelectedGraphType(graphType);
  };

  // Make sure `graphType` is passed correctly in `handleConfirm`.
  const handleConfirm = async () => {
    console.log("Creating graph with info:", {
      graphName: selectedName,
      graphType: selectedGraphType,
      datasetId: datasetManager.getCurrentDatasetId(),
      selectedFeatures,
    });

    if (!selectedGraphType) {
      console.error("No graph type selected! selectedGraphType:", selectedGraphType);
      return;
    }

    const datasetId = datasetManager.getCurrentDatasetId();
    if (!datasetId) {
      message.error("No dataset available.");
      return;
    }

    const dataset = await datasetManager.getDatasetById(datasetId);
    if (!dataset) {
      message.error("Failed to load dataset.");
      return;
    }

    const graphInfo = {
      graphName: selectedName,
      graphType: selectedGraphType, // Ensure that graphType is passed correctly
      dataset,
      selectedFeatures,
      datasetId: datasetId,
    };

    console.log("Sending graphInfo to UIController:", graphInfo);

    uiController.handleUserAction({
      type: "CREATE_GRAPH",
      graphInfo,
    });

    onCancel();
  };

  // Processing Feature Selection
  const handleFeatureSelect = (checkedValues) => {
    setSelectedFeatures(checkedValues);
  };

  return (
    <Modal
      title="Create New Graph"
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="confirm" type="primary" disabled={!selectedGraphType || selectedFeatures.length !== numFeatures} onClick={handleConfirm}>
          Confirm
        </Button>,
      ]}
    >
      {loading ? (
        <p>Loading dataset features...</p>
      ) : (
        <>
         <div style={{ marginBottom: '16px' }}>
            <h4>Graph Name:</h4>
            <Input 
              placeholder="Enter a name for your graph" 
              value={selectedName} 
              onChange={(e) => setSelectedName(e.target.value)} 
            />
          </div>

          <Tabs defaultActiveKey="1">
            {Object.entries(chartCategories).map(([category, charts]) => (
              <TabPane tab={category} key={category}>
                <Row gutter={[16, 16]}>
                  {charts.map((chart) => (
                    <Col span={8} key={chart.type}>
                      <Card
                        hoverable
                        style={{
                          textAlign: "center",
                          width: "100%",
                          minHeight: "140px",
                          border: selectedGraphType === chart.type ? "2px solid #1890ff" : "1px solid #ccc",
                        }}
                        onClick={() => handleGraphSelection(chart.type)}
                      >
                        <div style={{ fontSize: "24px", marginBottom: "8px" }}>{chart.icon}</div>
                        <p>{chart.name}</p>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </TabPane>
            ))}
          </Tabs>

          {selectedGraphType && (
              <div>
                <br/>
                <h3>Select {numFeatures} Features:</h3>
                <Checkbox.Group
                    options={features.map((feature) => ({label: feature, value: feature}))}
                    value={selectedFeatures}
                    onChange={handleFeatureSelect}
                />
              </div>
          )}
        </>
      )}
    </Modal>
  );
};

export default NewGraphModal;
