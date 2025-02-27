import React, { useState, useEffect } from "react";
import { Card, Row, Col, Spin, List, Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import GraphManager from "./GraphManager";
import VisualizationManager from "./VisualizationManager";

const visualizationManager = new VisualizationManager();

// in GraphCard.js show individual graphs
const GraphSection = ({ updateGraphCards }) => {
    const [graphDetails, setGraphDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    // const [combineGraphs, setCombineGraphs] = useState(false);

    const [visibleGraphs, setVisibleGraphs] = useState(() => {
        const savedState = localStorage.getItem("visibleGraphs");
        return savedState ? JSON.parse(savedState) : {};
    });

    useEffect(() => {
        const handleGraphChange = (data) => {
            if (data.type === "graphUpdated" || data.type === "curveFittingUpdated") {
                setGraphDetails((prevState) =>
                    prevState.map((graph) => {
                        if (graph.graphId === data.graphId) {
                            const updatedGraph = GraphManager.getGraphById(graph.graphId);
                            return {
                                ...graph,
                                graphScript: visualizationManager.visualize(updatedGraph),
                                key: Math.random(),
                            };
                        }
                        return graph;
                    })
                );
            }
        };

        GraphManager.onChange(handleGraphChange);

        const graphs = GraphManager.getAllGraphs();
        const validGraphDetails = graphs.map((graph) => {
            const graphScript = visualizationManager.visualize(graph);
            if (graphScript) {
                return {
                    graphId: graph.id,
                    graphName: graph.name,
                    graphType: graph.type,
                    selectedFeatures: graph.selectedFeatures,
                    graphScript: graphScript,
                    visible: graph.visible,
                    color: graph.style?.colorScheme || "#ffffff",
                    style: graph.style,
                };
            }
            return null;
        }).filter((graph) => graph !== null);

        setGraphDetails(validGraphDetails);


        setVisibleGraphs((prevState) => {
            const newState = { ...prevState };
            validGraphDetails.forEach(graph => {
                if (!(graph.graphId in newState)) {
                    newState[graph.graphId] = true; // new graph open
                }
            });
            localStorage.setItem("visibleGraphs", JSON.stringify(newState));
            return newState;
        });

        setLoading(false);

        return () => {
            GraphManager.offChange(handleGraphChange);
        };
    }, []);

    // update `updateGraphCards` and `visibleGraphs`
    useEffect(() => {
        updateGraphCards((prevCards) => {
            const newCards = { ...prevCards };
            graphDetails.forEach(graph => {
                if (visibleGraphs[graph.graphId]) {
                    newCards[graph.graphId] = graph;
                } else {
                    delete newCards[graph.graphId];
                }
            });
            return newCards;
        });
    }, [visibleGraphs, graphDetails]);

    // `GraphCard` on/off
    const toggleGraphVisibility = (graphId) => {
        setVisibleGraphs((prevState) => {
            const newState = { ...prevState, [graphId]: !prevState[graphId] };
            localStorage.setItem("visibleGraphs", JSON.stringify(newState));
            return newState;
        });
    };


    const deleteGraph = (graphId) => {
    setGraphDetails((prevGraphs) => prevGraphs.filter(graph => graph.graphId !== graphId));
    GraphManager.deleteGraph(graphId);

    // delete data in `visibleGraphs`
    setVisibleGraphs((prevState) => {
        const newState = { ...prevState };
        delete newState[graphId];
        localStorage.setItem("visibleGraphs", JSON.stringify(newState));
        return newState;
    });

    updateGraphCards((prevCards) => {
        const newCards = { ...prevCards };
        delete newCards[graphId];  // delete `GraphCard`
        return newCards;
    });
};



    // const handleLayerGraphs = () => {
    //     setCombineGraphs((prevCombine) => {
    //         const newCombineState = !prevCombine;

    //         if (newCombineState) {
    //             // combine data
    //             const combinedData = graphDetails
    //                 .filter(graph => visibleGraphs[graph.graphId])
    //                 .map((graph, index) => ({
    //                     ...graph.graphScript?.data[0],
    //                     name: graph.graphName,
    //                     line: { color: graph.color || `hsl(${(index * 50) % 360}, 100%, 50%)` },
    //                 }));

    //             const layout = {
    //                 title: "Combined Graphs",
    //                 xaxis: { title: graphDetails[0]?.xAxis || "X-axis" },
    //                 yaxis: { title: graphDetails[0]?.yAxis || "Y-axis" },
    //                 showlegend: true,
    //             };

    //             updateGraphCards({ combinedGraph: { graphId: "combinedGraph", graphScript: { data: combinedData, layout } } });

    //             // hide `GraphCard`
    //             setVisibleGraphs(() => {
    //                 const newState = {};
    //                 graphDetails.forEach(graph => {
    //                     newState[graph.graphId] = false;
    //                 });
    //                 localStorage.setItem("visibleGraphs", JSON.stringify(newState));
    //                 return newState;
    //             });

    //         } else {
    //             // show `GraphCard`
    //             updateGraphCards((prevCards) => {
    //                 const newCards = { ...prevCards };
    //                 delete newCards["combinedGraph"];

    //                 graphDetails.forEach(graph => {
    //                     if (visibleGraphs[graph.graphId]) {
    //                         newCards[graph.graphId] = graph;
    //                     }
    //                 });

    //                 return newCards;
    //             });


    //             setVisibleGraphs(() => {
    //                 const newState = {};
    //                 graphDetails.forEach(graph => {
    //                     newState[graph.graphId] = true;
    //                 });
    //                 localStorage.setItem("visibleGraphs", JSON.stringify(newState));
    //                 return newState;
    //             });
    //         }

    //         return newCombineState;
    //     });
    // };

    return (
        <Card style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            {/* <Button onClick={handleLayerGraphs} style={{ marginBottom: "20px" }}>
                {combineGraphs ? "Show Individual Graphs" : "Layer Graphs"}
            </Button> */}

            {loading ? <Spin size="large" /> : (
                <Row style={{ width: "100%" }}>
                    <Col span={24}>
                        <List
                            size="large"
                            bordered
                            dataSource={graphDetails}
                            renderItem={(graph) => (
                                <List.Item style={{ display: "flex", alignItems: "center" }}>
                                    <span style={{ cursor: "pointer" }} onClick={() => toggleGraphVisibility(graph.graphId)}>
                                        {`${graph.graphName || "Graph"} - ${graph.graphType} - (${graph.selectedFeatures?.join(", ")})`}
                                    </span>
                                    <Button onClick={() => toggleGraphVisibility(graph.graphId)} style={{ marginLeft: "auto" }}>
                                        {visibleGraphs[graph.graphId] ? "Hide" : "Show"}
                                    </Button>
                                    <Button type="primary" danger icon={<CloseOutlined />} onClick={() => deleteGraph(graph.graphId)} />
                                </List.Item>
                            )}
                        />
                    </Col>
                </Row>
            )}
        </Card>
    );
};

export default GraphSection;
