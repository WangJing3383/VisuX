import React, { useEffect, useState } from "react";
import { Modal, Button, Select, message, Typography, Spin, Slider, List } from "antd";
import Plot from "react-plotly.js";

// function getCSRFToken() {
//   let cookieValue = null;
//   if (document.cookie) {
//     document.cookie.split(";").forEach((cookie) => {
//       const [name, value] = cookie.trim().split("=");
//       if (name === "csrftoken") {
//         cookieValue = decodeURIComponent(value);
//       }
//     });
//   }
//   return cookieValue;
// }

const CorrelationModal = ({ visible, onCancel, uiController}) => {
  const [method, setMethod] = useState("pearson");
  const [datasetId, setDatasetId] = useState(null);
  const [selectedColumns, setSelectedColumns] = useState([]); // User-selected features
  const [columns, setColumns] = useState([]); // All available columns in the dataset
  const [correlationMatrix, setCorrelationMatrix] = useState(null);
  const [recommendedFeatures, setRecommendedFeatures] = useState([]); // Features recommended for removal
  const [threshold, setThreshold] = useState(0.8); // Correlation threshold
  const [loading, setLoading] = useState(false);

  const datasetManager = uiController.getDatasetManager();
  const availableDatasets = datasetManager.getAllDatasetsId();
  const availableDatasetsName = datasetManager.getAllDatasetsName();

  // **when user select a dataset, get the column**
  useEffect(() => {
    if (!datasetId) {
      setColumns([]);
      setSelectedColumns([]);
      return;
    }

    const fetchColumns = async () => {
      const cols = await datasetManager.getDatasetColumns(datasetId);
      setColumns(cols);
    };

    fetchColumns();
  }, [datasetId]);  // rely on `datasetId`，will be triggered if changed

  // ** Detect highly correlated features among the selected features **
  useEffect(() => {
    if (!correlationMatrix) return;

    const { values, columns } = correlationMatrix;
    const featureSet = new Set(selectedColumns);
    const highlyCorrelatedFeatures = new Set();

    for (let i = 0; i < values.length; i++) {
      for (let j = i + 1; j < values[i].length; j++) {
        if (Math.abs(values[i][j]) >= threshold) {
          if (featureSet.has(columns[i]) && featureSet.has(columns[j])) {
            highlyCorrelatedFeatures.add(columns[j]); // Add feature to the removal list
          }
        }
      }
    }

    setRecommendedFeatures([...highlyCorrelatedFeatures]);
  }, [correlationMatrix, threshold, selectedColumns]);

  const handleCorrelate = async () => {
    if (!datasetId || selectedColumns.length < 2) {
      message.error("Please select a dataset and at least two columns!");
      return;
    }

    const requestData = {
      dataset_id: datasetId,
      features: selectedColumns,// multiple
      method: method,
    };

    setLoading(true); //

    try {
      const result = await fetch("http://127.0.0.1:8000/api/correlation/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          //"X-CSRFToken": getCSRFToken(), //  CSRF Token
        },
        body: JSON.stringify(requestData),
        credentials: "include",// Cookie
      });

      const resultData = await result.json();
      setCorrelationMatrix(resultData.correlation_matrix);
      message.success("Correlation matrix generated!");
    } catch (error) {
      message.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Correlation Matrix" open={visible} onCancel={onCancel} footer={null} width={750}>
      {/* Dataset Selection */}
      <Select
        style={{ width: "100%" }}
        placeholder="Choose a dataset"
        onChange={setDatasetId}
      >
        {availableDatasets.map((id) => (
          <Select.Option key={id} value={id}>{datasetManager.getDatasetNameById(id)}</Select.Option>
        ))}
      </Select>

      {/* Feature Selection */}
      <Select
        mode="multiple" // allow multiple
        style={{ width: "100%", marginTop: "10px" }}
        placeholder="Select Columns"
        disabled={!datasetId}
        value={selectedColumns}
        onChange={setSelectedColumns}
      >
        {columns.map((col) => (
          <Select.Option key={col} value={col}>{col}</Select.Option>
        ))}
      </Select>

      {/* Correlation Method Selection */}
      <Select defaultValue="pearson" onChange={setMethod} style={{ width: "100%", marginTop: "10px" }}>
        <Select.Option value="pearson">Pearson</Select.Option>
        <Select.Option value="spearman">Spearman</Select.Option>
        <Select.Option value="kendall">Kendall</Select.Option>
      </Select>

      <Button type="primary" onClick={handleCorrelate} block style={{ marginTop: "10px" }}>
        Run Correlation
      </Button>

      {/* Loading Spinner */}
      {loading && <Spin size="large" style={{ display: "block", margin: "20px auto" }} />}

      {/* Correlation Heatmap */}
      {correlationMatrix && (
        <div style={{ marginTop: "20px" }}>
          <Typography.Title level={4}>Correlation Heatmap</Typography.Title>
          <Plot
              key={JSON.stringify(correlationMatrix)}
              data={[
                  {
                    z: [...correlationMatrix.values],// correlation values
                    x: [...correlationMatrix.columns],
                    y: [...correlationMatrix.columns],
                    type: "heatmap",
                    colorscale: "Viridis",
                    text: correlationMatrix.values.map(row => row.map(value => value.toFixed(2))),
                    texttemplate: "%{text}",
                    showscale: true, // display color scale
                  },
              ]}
              layout={{
                title: "Feature Correlation Heatmap",
                width: 650,
                height: 500,
              }}
          />
        </div>
      )}

      {/* Threshold Selection */}
      {correlationMatrix && (
        <div style={{ marginTop: "20px" }}>
          <Typography.Title level={4}>Select Correlation Threshold</Typography.Title>
          <Slider
            min={0}
            max={1}
            step={0.05}
            value={threshold}
            onChange={setThreshold}
            marks={{ 0: "0", 0.5: "0.5", 1: "1" }}
          />
        </div>
      )}

      {/* Recommended Features for Removal */}
      {recommendedFeatures.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <Typography.Title level={4}>Recommended Features to Remove</Typography.Title>
          <List
            bordered
            dataSource={recommendedFeatures}
            renderItem={(feature) => (
              <List.Item>
                <Typography.Text>{feature}</Typography.Text>
              </List.Item>
            )}
          />
        </div>
      )}
    </Modal>
  );
};

export default CorrelationModal;
