import React, {useEffect, useState} from "react";
import { Modal, Button, InputNumber, Select, message, Table } from "antd";

const DEFAULT_OVERSAMPLE_FACTOR = 2;
const VALID_OVERSAMPLE_FACTOR = 0;

const OversampleModal = ({ visible, onCancel, uiController ,logAction, onUpdateDataset}) => {
  const [method, setMethod] = useState("smote"); // Select oversampling method
  const [datasetId, setDatasetId] = useState(null);
  const [xColumn, setXColumn] = useState(null);
  const [yColumn, setYColumn] = useState(null);
  const [factor, setOversamplingFactor] = useState(DEFAULT_OVERSAMPLE_FACTOR); // Default oversampling multiplier

  const [columns, setColumns] = useState([]); // Store column names
  const [originalData, setOriginalData] = useState([]);
  const [oversampledData, setOversampledData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [newDatasetId, setNewDatasetId] = useState(null);
  const [oversampledFeature, setOversampledFeature] = useState(null);
  const [oversampledRecord, setOversampledRecord] = useState(null);
  const [showTable, setShowTable] = useState(true);

  const datasetManager = uiController.getDatasetManager();
  const availableDatasets = datasetManager.getAllDatasetsId();

  // **Get column names when the user selects a dataset**
  useEffect(() => {
    if (!datasetId) {
      setColumns([]);
      setNewDatasetId(null);
      setOversampledData(null);
      return;
    }

    const fetchColumns = async () => {
      const cols = await datasetManager.getDatasetColumns(datasetId);
      setColumns(cols);
    };

    fetchColumns();
  }, [datasetId]); // Dependent on `datasetId`, triggered on change

  const handleOversample = async () => {
    if (!datasetId || !xColumn || !yColumn) {
      alert("Please select a dataset and two columns.");
      return;
    }
    if(factor <= VALID_OVERSAMPLE_FACTOR || factor > 10) {
      alert("Please give a valid oversample factor. The oversample factor should be between 1 and 10! The output dataset is the dataset oversampled with factor 2.")
      alert("test")
    }
    const requestData = {
      datasetId: datasetId,
      params:{
        xColumn: xColumn,
        yColumn: yColumn,
        method: method,
        factor: factor
      }
    }

    const currentDatasetId = datasetId || datasetManager.getCurrentDatasetId();
        if (!currentDatasetId) {
            message.error("No valid dataset ID found. Please upload a dataset first.");
            return;
        }

    console.log("Request data:", requestData);
    setLoading(true);
    try {
      const result = await fetch("http://127.0.0.1:8000/api/oversample_data/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
      credentials: "include", // allow to include Cookie
      });

      const resultData = await result.json();
      const {oversampled_features, oversampled_records} = resultData;
      if (Array.isArray(oversampled_records) && oversampled_records.length) {
        setOversampledFeature(oversampled_features)
        setOversampledRecord(oversampled_records)
    } else {
        setOversampledData(null);
    }
      console.log(oversampled_records)
      if (resultData.error) {
        message.error(`Oversampling failed: ${resultData.error}`);
        return
      }  

      setOriginalData(resultData.original_data); // Store original data
      setOversampledData(oversampled_records);

      message.success("Oversampling completed!");
      logAction(datasetManager.getDatasetNameById(datasetManager.getCurrentDatasetId()) + "_" + method, method.toUpperCase())
      setShowResultModal(true);
      } catch (error) {
          message.error(`Error: ${error.message}`);
      } finally {
          setLoading(false);
      }

      
  };

  const handleCloseResultModal = () => {
    setShowResultModal(false);
  };

    // apply result
    const handleApply = async () => {
        const requestData = {
            dataset_id: datasetManager.getCurrentDatasetId(), 
            features: oversampledFeature,
            records: oversampledRecord,
            new_dataset_name: datasetManager.getDatasetNameById(datasetManager.getCurrentDatasetId()) + "_Oversampled_" + method + "_" + factor
            + datasetManager.getSuffix(datasetManager.getDatasetNameById(datasetManager.getCurrentDatasetId()))
          };
          const result = await fetch("http://127.0.0.1:8000/api/create_dataset/", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                //"X-CSRFToken": getCSRFToken(),  // send CSRF Token
              },
              body: JSON.stringify(requestData),
              credentials: "include", // allow to include Cookie
            });
          const resultData = await result.json();
          console.log(result)
          console.log(resultData)
          setNewDatasetId(resultData.new_dataset_id);
          console.log(resultData.new_dataset_id)
        if (!resultData.new_dataset_id || !oversampledFeature) {
            message.error("No oversampled dataset available to apply.");
            return;
        }

        datasetManager.addDatasetId(resultData.new_dataset_id, resultData.name);
        datasetManager.setCurrentDatasetId(resultData.new_dataset_id);
        onUpdateDataset(oversampledRecord, resultData.new_dataset_id);
        message.success("Oversampling applied successfully!");
        setShowTable(false)
        logAction(`new_dataset_id_${resultData.new_dataset_id}`,"Apply Oversample");
        onCancel();
    };

    const resultColumns = [
      { title: xColumn || "X Value", dataIndex: xColumn, key: xColumn },
      { title: yColumn || "Y Value", dataIndex: yColumn, key: yColumn },
    ];

  return (
    <>
      <Modal title="Oversampling" open={visible} onCancel={onCancel} footer={null}>
        <Select
          style={{ width: "100%" }}
          placeholder="Choose a dataset"
          onChange={setDatasetId}
        >
          {availableDatasets.map((id) => (
            <Select.Option key={id} value={id}>{datasetManager.getDatasetNameById(id)}</Select.Option>
          ))}
        </Select>

        <Select
          style={{ width: "100%", marginTop: "10px" }}
          placeholder="Select X Column"
          disabled={!datasetId}
          onChange={setXColumn}
        >
          {columns.map((col) => (
            <Select.Option key={col} value={col}>{col}</Select.Option>
          ))}
        </Select>

        <Select
          style={{ width: "100%", marginTop: "10px" }}
          placeholder="Select Y Column"
          disabled={!datasetId}
          onChange={setYColumn}
        >
          {columns.map((col) => (
            <Select.Option key={col} value={col}>{col}</Select.Option>
          ))}
        </Select>

        {/* Selection of oversampling method */}
        <Select defaultValue="smote" onChange={setMethod} style={{ width: "100%", marginTop: "10px" }}>
          <Select.Option value="smote">SMOTE</Select.Option>
          <Select.Option value="random">Random Oversampling</Select.Option>
        </Select>

        {/* Input oversampling multiplier */}
        <label>
        <InputNumber
          addonBefore = "Oversample Factor"
          min={1}
          max={10}
          value={factor}
          onChange={setOversamplingFactor}
          style={{ width: "100%", marginTop: "10px" }}
        />
        </label>

        <Button type="primary" onClick={handleOversample} block style={{ marginTop: "10px" }}>
          Run Oversampling
        </Button>
      </Modal>

      {showTable && (
      <Modal
        title="Oversample Results"
        visible={showResultModal}
        onCancel={handleCloseResultModal}
        footer={null}
      >

        {/* Confirm, Apply button */}
        <div style={{textAlign: "right", marginBottom: "15px"}}>
        <Button onClick={onCancel} style={{marginRight: 10}}>Cancel</Button>
        <Button type="primary" onClick={handleOversample} loading={loading}
                style={{marginRight: 10}}>Confirm</Button>
        {oversampledData && <Button type="primary" onClick={handleApply}>Save dataset</Button>}
        </div>
       
        {showTable&&(<Table
          columns={resultColumns}
          dataSource={oversampledData}
          rowKey="x"
          pagination={false}
          size="small"
        />
        )}
      </Modal>
      )}
    </>
  );
};

export default OversampleModal;
