import React, {useState, useEffect} from "react";
import {Layout, Menu, message} from "antd";
import {
    BarChartOutlined,
    TableOutlined,
    FileTextOutlined, SlidersOutlined, FundOutlined, LineChartOutlined,
} from "@ant-design/icons";
import datasetManager from "../file/DatasetManager";
import DimReductionModal from "../modal/DimReductionModal";
import NewGraphModal from "../modal/NewGraphModal";
import CurveFittingModal from "../modal/CurveFittingModal";
import InterpolationModal from "../modal/InterpolationModal";
import ExtrapolationModal from "../modal/ExtrapolationModal";
import OversampleModal from "../modal/OversampleModal";
import CorrelationModal from "../modal/CorrelationModal";
import GraphManager from "../graph/GraphManager";

const {Sider} = Layout;
const {SubMenu} = Menu;

const Sidebar = ({
                     uiController,
                     setShowGraph,
                     setShowData,
                     setShowLog,
                     setShowTable,
                     setShowGraphEdit,
                     showGraph,
                     showData,
                     showLog,
                     showTable,
                     showGraphEdit,
                 }) => {
    // Control Tool Window
    const [openKeys, setOpenKeys] = useState(["graphManager", "dataProcessing"]);
    const [newGraphModalVisible, setNewGraphModalVisible] = useState(false);
    const [dimReductionModalVisible, setDimReductionModalVisible] = useState(false);
    const [curveFittingModalVisible, setCurveFittingModalVisible] = useState(false);
    const [interpolationModalVisible, setInterpolationModalVisible] = useState(false);
    const [extrapolationModalVisible, setExtrapolationModalVisible] = useState(false);
    const [oversampleModalVisible, setOversampleModalVisible] = useState(false);
    const [correlationModalVisible, setCorrelationModalVisible] = useState(false);
    
    const [logAction, setLogAction] = useState(() => {
        const logManager = uiController.getLogManager();
        return (message, method) => {
          const newLog = {
            timestamp: new Date().toLocaleTimeString(),
            tool: method, // which method type is used
            params: message, // detailed information
          };
          logManager.addLog(newLog);
        };
      });

    useEffect(() => {
        const handleGraphUpdate = (event) => {
            if (event.type === "graphUpdated") {
                setShowGraph(false);
                setTimeout(() => setShowGraph(true), 100);
            }
        };

        GraphManager.onChange(handleGraphUpdate);
        return () => {
            GraphManager.eventListeners = GraphManager.eventListeners.filter(cb => cb !== handleGraphUpdate);
        };
    }, []);

    // Processing Menu Expansion
    const handleOpenChange = (keys) => {
        setOpenKeys(keys);
    };

    // Deal with dimensionality reduction
    const handleDimensionalityReduction = () => {
        const datasetId = datasetManager.getCurrentDatasetId();
        if (!datasetId) {
            message.error("⚠️ No dataset available. Please upload a dataset first.");
            return;
        }
        setDimReductionModalVisible(true);
    };

    return (
        <Sider width={220} style={{background: "#fff"}}>
            <Menu
                mode="inline"
                openKeys={openKeys}
                onOpenChange={handleOpenChange}
                defaultSelectedKeys={["graphOverview"]}
                style={{height: "100%", borderRight: 0}}
            >

                {/* Open/Close a window（Graph / DataTable / Log /preview plot） */}
                <Menu.Item
                    key="toggleDataTable"
                    icon={<TableOutlined/>}
                    onClick={() => setShowTable(!showTable)}
                    style={{
                        backgroundColor: showTable ? "#1890ff" : "#f0f0f0",
                        color: showTable ? "white" : "black",
                        borderRadius: "5px",
                        transition: "background-color 0.3s, color 0.3s",
                    }}
                >
                    {showTable ? "Close Data Table" : "Open Data Table"}
                </Menu.Item>

                <Menu.Item
                    key="toggleGraph"
                    icon={<BarChartOutlined/>}
                    onClick={() => setShowGraph(!showGraph)}
                    style={{
                        backgroundColor: showGraph ? "#1890ff" : "#f0f0f0",
                        color: showGraph ? "white" : "black",
                        borderRadius: "5px",
                        transition: "background-color 0.3s, color 0.3s",
                    }}
                >
                    {showGraph ? "Close Graph Window" : "Open Graph Window"}
                </Menu.Item>

                <Menu.Item
                    key="toggleDataPlot"
                    icon={<LineChartOutlined/>}
                    onClick={() => setShowData(!showData)}
                    style={{
                        backgroundColor: showData ? "#1890ff" : "#f0f0f0",
                        color: showData ? "white" : "black",
                        borderRadius: "5px",
                        transition: "background-color 0.3s, color 0.3s",
                    }}
                >
                    {showData ? "Close Data Plot" : "Open Data Plot"}
                </Menu.Item>

                <Menu.Item
                    key="toggleLog"
                    icon={<FileTextOutlined/>}
                    onClick={() => setShowLog(!showLog)}
                    style={{
                        backgroundColor: showLog ? "#1890ff" : "#f0f0f0",
                        color: showLog ? "white" : "black",
                        borderRadius: "5px",
                        transition: "background-color 0.3s, color 0.3s",
                    }}
                >
                    {showLog ? "Close Log Window" : "Open Log Window"}
                </Menu.Item>


                {/* Graph Manager */}
                <SubMenu key="graphManager" icon={<FundOutlined/>} title="Graph Manager">

                    <Menu.Item
                        key="newGraph" onClick={() => setNewGraphModalVisible(true)}>New Graph
                    </Menu.Item>
                    <Menu.Item //new graph edit
                        key="editGraph"
                        onClick={() => setShowGraphEdit(!showGraphEdit)}>
                        {showGraphEdit ? "Close Graph Edit" : "Edit Graph"}
                    </Menu.Item>
                    <Menu.Item
                        key="Correlate Data" onClick={() => setCorrelationModalVisible(true)}>Correlate Data
                    </Menu.Item>

                </SubMenu>

                {/* Data Processing */}
                <SubMenu key="dataProcessing" icon={<SlidersOutlined/>} title="Data Processing">

                    <Menu.Item
                        key="dimReduction" onClick={handleDimensionalityReduction}>
                        Dim Reduction
                    </Menu.Item>
                    <Menu.Item
                        key="Interpolate Data" onClick={() => setInterpolationModalVisible(true)}>Interpolate Data
                    </Menu.Item>
                    <Menu.Item
                        key="Extrapolate Data" onClick={() => setExtrapolationModalVisible(true)}>Extrapolate Data
                    </Menu.Item>
                    <Menu.Item
                        key="Oversample Data" onClick={() => setOversampleModalVisible(true)}>Oversample Data
                    </Menu.Item>



                </SubMenu>

            </Menu>

            {/* modal area */}

            {/* Modal of new Graph */}
            <NewGraphModal visible={newGraphModalVisible} onCancel={() => setNewGraphModalVisible(false)}
                           uiController={uiController}/>

            {/* curve fitting Modal */}
            <CurveFittingModal visible={curveFittingModalVisible} onCancel={() => setCurveFittingModalVisible(false)}
                               uiController={uiController}
                               logAction={logAction}/>

            {/* interpolation Modal */}
            <InterpolationModal visible={interpolationModalVisible} onCancel={() => setInterpolationModalVisible(false)}
                                uiController={uiController}
                                logAction={logAction}
                                onClose={() => setInterpolationModalVisible(false)}
                                onUpdateDataset={(newData, newDatasetId) => {
                                    if (newDatasetId) {
                                        datasetManager.setCurrentDatasetId(newDatasetId);
                                        console.log(`Current dataset updated to ID: ${newDatasetId}`);
                                    }
                                    console.log("Interpolation result received:", newData);
                }}/>

            {/* extrapolation Modal */}
            <ExtrapolationModal visible={extrapolationModalVisible} onCancel={() => setExtrapolationModalVisible(false)}
                                uiController={uiController}
                                logAction={logAction}
                                onClose={() => setExtrapolationModalVisible(false)}
                                onUpdateDataset={(newData, newDatasetId) => {
                                    if (newDatasetId) {
                                        datasetManager.setCurrentDatasetId(newDatasetId);
                                        console.log(`Current dataset updated to ID: ${newDatasetId}`);
                                    }
                                    console.log("Extrapolation result received:", newData);
                                }}/>

            {/* oversample data Modal */}
            <OversampleModal visible={oversampleModalVisible} onCancel={() => setOversampleModalVisible(false)}
                             uiController={uiController}
                             logAction={logAction}
                             onUpdateDataset={(newData, newDatasetId) => {
                                if (newDatasetId) {
                                    datasetManager.setCurrentDatasetId(newDatasetId);
                                    console.log(`Current dataset updated to ID: ${newDatasetId}`);
                                }
                                console.log("Oversampling result received:", newData);
                            }}/>

            {/* correlate data 的 Modal */}
            <CorrelationModal visible={correlationModalVisible} onCancel={() => setCorrelationModalVisible(false)}
                              uiController={uiController}
                              logAction={logAction}/>

            {/* dimensionality reduction Modal */}
            <DimReductionModal
                visible={dimReductionModalVisible}
                logAction={logAction}
                onClose={() => setDimReductionModalVisible(false)}
                onUpdateDataset={(newData, newDatasetId) => {
                    if (newDatasetId) {
                        datasetManager.setCurrentDatasetId(newDatasetId);
                        console.log(`Current dataset updated to ID: ${newDatasetId}`);
                    }
                    console.log("Dimensionality reduction result received:", newData);
                }}
            />


        </Sider>
    );
};

export default Sidebar;
