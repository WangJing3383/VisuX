import React, {useEffect, useState} from "react";
import {Modal, Button, Select, message, Table, InputNumber, Radio} from "antd";

const EMPTY_DATA_NUMBER = 0;
const FIRST_ELEMENT_INDEX = 0;

// Get CSRF Token（fit Django）
// function getCSRFToken() {
//     let cookieValue = null;
//     if (document.cookie) {
//         document.cookie.split(";").forEach((cookie) => {
//             const [name, value] = cookie.trim().split("=");
//             if (name === "csrftoken") {
//                 cookieValue = decodeURIComponent(value);
//             }
//         });
//     }
//     return cookieValue;
// }

const InterpolationModal = ({visible, onCancel, uiController, logAction, onUpdateDataset, onClose}) => {
    const [method, setMethod] = useState("linear");
    const [datasetId, setDatasetId] = useState(null);
    const [xColumn, setXColumn] = useState(null);
    const [yColumn, setYColumn] = useState(null);
    const [interpolatedData, setInterpolatedData] = useState([]);
    const [numPoints, setNumPoints] = useState(null);
    const [minValue, setMinValue] = useState(null);
    const [maxValue, setMaxValue] = useState(null);
    const [inputMode, setInputMode] = useState("auto"); // "auto" or "manual"
    const [newDatasetId, setNewDatasetId] = useState(null);

    const [columns, setColumns] = useState([]); // Store column names
    const [showResultModal, setShowResultModal] = useState(false); // Control result modal visibility

    const datasetManager = uiController.getDatasetManager();
    const availableDatasets = datasetManager.getAllDatasetsId();

    useEffect(() => {
        if (!datasetId) {
            setColumns([]);
            return;
        }

        const fetchColumns = async () => {
            const cols = await datasetManager.getDatasetColumns(datasetId);
            setColumns(cols);
        };

        fetchColumns();
    }, [datasetId]); // Dependent on `datasetId`, triggered on change

    const handleInterpolate = async () => {
        if (!datasetId || !xColumn || !yColumn) {
            message.error("Please select a dataset and two columns!");
            return;
        }

        const requestData = {
            dataset_id: datasetId,
            x_feature: xColumn,
            y_feature: yColumn,
            kind: method,
            numPoints: numPoints,
            minValue: minValue,
            maxValue: maxValue,
        };
        try {
            const result = await fetch("http://127.0.0.1:8000/api/interpolate/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    //"X-CSRFToken": getCSRFToken(),  // send CSRF Token
                },
                body: JSON.stringify(requestData),
                credentials: "include", // allow to include Cookie
            });

            const resultData = await result.json();
            setInterpolatedData(resultData.interpolated_data);
            setNewDatasetId(resultData.new_dataset_id);
            message.success("Interpolation started!");
            setShowResultModal(true); // Display result modal when data is ready
            logAction(datasetManager.getDatasetNameById(datasetManager.getCurrentDatasetId()) + "_" + method, "Interpolate")
        } catch (error) {
            message.error(`Error: ${error.message}`);
        }
    };

    // apply result
    const handleApplyInterpolate = async () => {
        const requestData = {
            dataset_id: datasetId,
            features: [xColumn, yColumn],
            records: interpolatedData,
            new_dataset_name: datasetManager.getDatasetNameById(datasetManager.getCurrentDatasetId())+"_Interpolated_" + method
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
        setNewDatasetId(resultData.new_dataset_id);
        if (!resultData.new_dataset_id || !interpolatedData) {
            message.error("No reduced dataset available to apply.");
            return;
        }
        datasetManager.addDatasetId(resultData.new_dataset_id, resultData.name);
        datasetManager.setCurrentDatasetId(resultData.new_dataset_id);
        onUpdateDataset(interpolatedData, resultData.new_dataset_id);
        message.success("Interpolate applied successfully!");
        logAction(`new_dataset_id_${resultData.new_dataset_id}`,"Apply Interpolation");
        setShowResultModal(false);
        onClose();
    };

    const handleCreateGraph = () => {
        if (!xColumn || !yColumn) {
            message.error("Please select X and Y columns before creating a graph!");
            return;
        }

        if (!Array.isArray(interpolatedData) || interpolatedData.length === EMPTY_DATA_NUMBER) {
            message.error("Interpolated data is empty or not properly structured!");
            return;
        }

        console.log("interpolatedData structure:", interpolatedData);

        // Take the first piece of data and make sure that xColumn and yColumn exist.
        const firstEntry = interpolatedData[FIRST_ELEMENT_INDEX];
        if (!firstEntry) {
            message.error("Interpolated data is empty!");
            return;
        }

        if (!(xColumn in firstEntry) || !(yColumn in firstEntry)) {
            console.error("Mismatch between selected columns and data structure:", firstEntry);
            message.error(`Columns "${xColumn}" and/or "${yColumn}" do not exist in the dataset!`);
            return;
        }

        // build dataset
        const dataset = {
            features: [xColumn, yColumn],
            records: interpolatedData.map(dataPoint => ({
                [xColumn]: dataPoint[xColumn],
                [yColumn]: dataPoint[yColumn],
            })),
        };

        console.log("Final dataset:", dataset);

        if (!dataset.records.length) {
            message.error("No valid data available for creating a graph.");
            return;
        }

        const graphInfo = {
            graphName: "Interpolation Graph",
            graphType: "line",
            dataset: dataset,
            selectedFeatures: [xColumn, yColumn],
        };

        uiController.handleUserAction({
            type: "CREATE_GRAPH",
            graphInfo,
        });

        message.success("Graph created successfully!");
    };

    const renderTable = () => {
        if (!interpolatedData || !Array.isArray(interpolatedData) || interpolatedData.length === EMPTY_DATA_NUMBER) {
            return <p style={{textAlign: "center", color: "gray"}}>No data available</p>;
        }

        const firstRow = interpolatedData[FIRST_ELEMENT_INDEX] || {};
        const columns = Object.keys(firstRow).map((key) => ({
            title: key,
            dataIndex: key,
            key: key,
        }));

        const dataSource = interpolatedData.map((row, index) => ({
            key: index,
            ...row,
        }));

        console.log("Generated Table Columns:", columns);
        console.log("Rendering table with dataSource:", dataSource);

        return <Table dataSource={dataSource} columns={columns} pagination={{pageSize: 10}}/>;
    };

    return (
        <>
            <Modal title="Interpolation" open={visible} onCancel={onCancel} footer={null}>
                <Select
                    style={{width: "100%"}}
                    placeholder="Choose a dataset"
                    onChange={(value) => setDatasetId(value)}
                >
                    {availableDatasets.map((id) => (
                        <Select.Option key={id} value={id}>{datasetManager.getDatasetNameById(id)}</Select.Option>
                    ))}
                </Select>

                <Select
                    style={{width: "100%", marginTop: "10px"}}
                    placeholder="Select X Column"
                    disabled={!datasetId}
                    onChange={setXColumn}
                >
                    {columns.map((col) => (
                        <Select.Option key={col} value={col}>{col}</Select.Option>
                    ))}
                </Select>

                <Select
                    style={{width: "100%", marginTop: "10px"}}
                    placeholder="Select Y Column"
                    disabled={!datasetId}
                    onChange={setYColumn}
                >
                    {columns.map((col) => (
                        <Select.Option key={col} value={col}>{col}</Select.Option>
                    ))}
                </Select>

                <Select defaultValue="linear" onChange={setMethod} style={{width: "100%", marginTop: "10px"}}>
                    <Select.Option value="linear">Linear</Select.Option>
                    <Select.Option value="polynomial">Polynomial</Select.Option>
                    <Select.Option value="spline">Spline</Select.Option>
                </Select>

                {/* Input Mode Selection */}
                <Radio.Group
                    value={inputMode}
                    onChange={(e) => setInputMode(e.target.value)}
                    style={{marginTop: "10px", width: "100%"}}
                >
                    <Radio.Button value="auto">Auto(100 points based on dataset)</Radio.Button>
                    <Radio.Button value="manual">Manual Input</Radio.Button>
                </Radio.Group>

                {/* Manual Input Fields */}
                {inputMode === "manual" && (
                    <>
                        <InputNumber
                            style={{width: "100%", marginTop: "10px"}}
                            placeholder="Number of Points"
                            min={1}
                            value={numPoints}
                            onChange={setNumPoints}
                        />
                        <InputNumber
                            style={{width: "100%", marginTop: "10px"}}
                            placeholder="Min Value"
                            value={minValue}
                            onChange={setMinValue}
                        />
                        <InputNumber
                            style={{width: "100%", marginTop: "10px"}}
                            placeholder="Max Value"
                            value={maxValue}
                            onChange={setMaxValue}
                        />
                    </>
                )}


                <Button type="primary" onClick={handleInterpolate} block style={{marginTop: "10px"}}>
                    Run Interpolation
                </Button>
            </Modal>

            {/* Results Show Modal */}
            <Modal title="Interpolation Results" open={showResultModal} onCancel={() => setShowResultModal(false)}
                   footer={null} width={600}>
                {interpolatedData && renderTable()}
                <Button onClick={handleCreateGraph} style={{marginTop: "10px", marginRight: "10px"}}>
                    Create Graph
                </Button>
                <Button type="primary" onClick={handleApplyInterpolate} style={{marginTop: "10px"}}>
                    Apply Interpolation
                </Button>
            </Modal>
        </>
    );
};

export default InterpolationModal;