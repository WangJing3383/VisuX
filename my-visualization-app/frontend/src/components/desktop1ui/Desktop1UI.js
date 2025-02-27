// import React, { useState, useRef, useEffect } from "react";
// import Papa from "papaparse";
// import GraphManager from "../graphs/GraphManager"; 
// import ToolManager from "../tools/ToolManager"; 
// import ModalController from "../modals/ModalController"; 
// import VisualizationManager from "../graphs/VisualizationManager"; 
// import "./Desktop1UI.css";

// const ToolList = ({ tools, onToolClick }) => {
//   return (
//     <div className="tool-list">
//       {tools.map((tool) => (
//         <button
//           key={tool.name}
//           onClick={() => onToolClick(tool)}
//           className="tool-button"
//         >
//           {tool.name}
//         </button>
//       ))}
//     </div>
//   );
// };

// const FeatureTable = ({ features, data, selectedFeatures, onFeatureClick }) => {
//   return (
//     <div className="feature-table">
//       <h3>Feature List</h3>
//       <table>
//         <thead>
//           <tr>
//             <th>Feature Name</th>
//             {[...Array(8)].map((_, index) => (
//               <th key={index}>Data {index + 1}</th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {features.map((feature, featureIndex) => (
//             <tr
//               key={featureIndex}
//               className={selectedFeatures.includes(featureIndex) ? 'selected-feature' : ''}
//               onClick={() => onFeatureClick(featureIndex)}
//             >
//               <td>{feature}</td>
//               {data.slice(0, 8).map((row, dataIndex) => (
//                 <td key={dataIndex}>{row[feature]}</td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// const Desktop1UI = () => {
//   const [fileData, setFileData] = useState(null);
//   const [graphNames, setGraphNames] = useState([]);
//   const [activeGraph, setActiveGraph] = useState(null);
//   const [graphScript, setGraphScript] = useState(null); // Script received from VisualizationManager
//   const [activeTool, setActiveTool] = useState(null);
//   const [features, setFeatures] = useState([]);  // All features from the CSV
//   const [selectedFeatures, setSelectedFeatures] = useState([0, 1]);  // Default the first two features
//   const [dropdownValues, setDropdownValues] = useState([]);

//   const fileInputRef = useRef(null);

//   const toolManager = new ToolManager();

//   useEffect(() => {
//     const interval = setInterval(() => {
//       const graphs = GraphManager.getAllGraphs();
//       setGraphNames(graphs.map(graph => graph.name));
//     }, 1000); 

//     return () => clearInterval(interval);
//   }, []);

//   // Update the graph when activeGraph changes
//   useEffect(() => {
//     if (activeGraph) {
//       const selectedGraph = GraphManager.getGraph(activeGraph);
//       if (selectedGraph) {
//         setFileData(selectedGraph.csvContent);
  
//         // Parse the CSV to get both the header and the data content
//         Papa.parse(selectedGraph.csvContent, {
//           header: true,
//           skipEmptyLines: true,
//           complete: (result) => {
//             const featureNames = result.meta.fields;  // Feature names (headers)
//             const rowData = result.data;              // Data rows
  
//             setFeatures(featureNames);
//             setFileData(rowData); // Store data to send to FeatureTable
//           },
//         });
  
//         // Create the graph with the selected features
//         const initialFeatures = selectedGraph.selectedFeatures || [0, 1];
//         setSelectedFeatures(initialFeatures);
  
//         const script = VisualizationManager.visualize(
//           selectedGraph.csvContent,
//           initialFeatures,
//           activeGraph
//         );
//         setGraphScript(script);
//       }
//     }
//   }, [activeGraph]);
  
//   // Run the script to create the Plotly graph when graphScript changes
//   useEffect(() => {
//     if (graphScript) {
//       // Ensure the "graph" div is ready
//       try {
//         // Caution: using eval can pose security risks. It is used here to demonstrate the logic.
//         // An alternative such as new Function() can be used.
//         eval(graphScript);
//       } catch (err) {
//         console.error("Error creating the graph:", err);
//       }
//     }
//   }, [graphScript]);

//   const handleToolClick = (tool) => {
//     setActiveTool(tool.name);
//   };

//   const handleModalClose = () => {
//     setActiveTool(null);
//   };

//   const handleCreateGraph = ({ graphName, selectedXFeature, selectedYFeature }) => {
//     console.log(`Graph Created: ${graphName} - X: ${selectedXFeature} Y: ${selectedYFeature}`);
//     handleModalClose();
//   };

//   const handleUploadClick = () => {
//     fileInputRef.current.click();
//   };

//   const handleFeatureClick = (index) => {
//     let updatedFeatures = [];
  
//     // If the clicked feature is already selected, bring it to the front and reorder the others
//     if (selectedFeatures.includes(index)) {
//       updatedFeatures = [index, ...selectedFeatures.filter(f => f !== index)];
//     } else {
//       // If it's a new feature, bring it to the front and add the others in order
//       updatedFeatures = [index, ...selectedFeatures];
//     }
  
//     // Limit the selected features to a maximum of 2
//     if (updatedFeatures.length > 2) {
//       updatedFeatures = updatedFeatures.slice(0, 2);
//     }
  
//     setSelectedFeatures(updatedFeatures);
  
//     // Update the graph
//     const selectedGraph = GraphManager.getGraph(activeGraph);
//     if (selectedGraph) {
//       const script = VisualizationManager.visualize(
//         selectedGraph.csvContent,
//         updatedFeatures,
//         activeGraph
//       );
//       setGraphScript(script);
//     }
//   };
  
//   const handleFeatureChange = (featureIndex, newFeature) => {
//     let updatedFeatures = [...selectedFeatures];
//     updatedFeatures[featureIndex] = newFeature;
  
//     setSelectedFeatures(updatedFeatures);
  
//     // Update the graph
//     const selectedGraph = GraphManager.getGraph(activeGraph);
//     if (selectedGraph) {
//       const script = VisualizationManager.visualize(
//         selectedGraph.csvContent,
//         updatedFeatures,
//         activeGraph
//       );
//       setGraphScript(script);
//     }
//   };
  
//   const handleFileChange = (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     if (!file.name.endsWith(".csv")) {
//       alert("Please upload only csv now");
//       return;
//     }

//     Papa.parse(file, {
//       complete: (result) => {
//         const data = result.data;
//         if (data.length < 2) {
//           alert("Not enough data");
//           return;
//         }

//         const columns = data[0];
//         const rows = data.slice(1).map((row) => row.map(Number));

//         const mean = columns.map((_, i) =>
//           rows.reduce((sum, row) => sum + row[i], 0) / rows.length
//         );
//         const std = columns.map((_, i) => {
//           const avg = mean[i];
//           const variance =
//             rows.reduce((sum, row) => sum + Math.pow(row[i] - avg, 2), 0) /
//             rows.length;
//           return Math.sqrt(variance);
//         });

//         const graphName = `Graph ${GraphManager.getAllGraphs().length + 1}`;
//         // Add to GraphManager while including the csvContent information
//         GraphManager.addGraph({ name: graphName, csvContent: data.join("\n"), data: { columns, mean, std } });

//         setFileData({ columns, mean, std });
//         setActiveGraph(graphName);
//       },
//       header: false,
//       skipEmptyLines: true,
//     });
//   };

//   const handleGraphClick = (graphName) => {
//     setActiveGraph(graphName);  // Update the selected graph
//   };

//   const FeatureDropdown = ({ featureIndex }) => {
//     return (
//       <select
//         value={selectedFeatures[featureIndex] || ""}
//         onChange={(e) => handleFeatureChange(featureIndex, parseInt(e.target.value))}
//       >
//         {features.map((feature, index) => (
//           <option key={index} value={index}>
//             {feature}
//           </option>
//         ))}
//       </select>
//     );
//   };
  

//   return (
//     <div className="desktop1-container">
//       {/* Navigator */}
//       <div className="navbar">
//         <span className="title">VisuX</span>
//       </div>

//       {/* Main Content */}
//       <div className="main-content">
//         {/* Sidebar */}
//         <div className="sidebar">
//           <img className="upload-folder" src="/image/folder.png" alt="Upload Folder" onClick={handleUploadClick} />
//           <input type="file" accept=".csv" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />

//           {/* Tools */}
//           <ToolList tools={toolManager.getTools()} onToolClick={handleToolClick} />
//         </div>

//         {/* Content */}
//         <div className="content">
//           <span className="content-title">Graph List</span>
//           <ul className="graph-list">
//             {graphNames.map((graphName, index) => (
//               <li
//                 key={index}
//                 onClick={() => handleGraphClick(graphName)}
//                 className={activeGraph === graphName ? "active-graph" : ""}
//               >
//                 {graphName}
//               </li>
//             ))}
//           </ul>

//           {/* Feature Table */}
//           {activeGraph && (
//           <FeatureTable
//           features={features}
//           data={fileData}
//           selectedFeatures={selectedFeatures}
//           onFeatureClick={handleFeatureClick}
//           />
//           )}

// <div className="dropdown-container">
//   {selectedFeatures.map((_, index) => (
//     <FeatureDropdown key={index} featureIndex={index} />
//   ))}
// </div>


//           {/* Graph Visualization */}
//           <div className="plot-container">
//             {/* The div where the VisualizationManager's script will run */}
//             <div id="graph" style={{ width: "100%", height: "100%" }}></div>
//           </div>
//         </div>
//       </div>

//       {/* Modal Controller */}
//       <ModalController activeTool={activeTool} onClose={handleModalClose} onCreate={handleCreateGraph} />
//     </div>
//   );
// };

// export default Desktop1UI;
