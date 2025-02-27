// import React, { useState } from "react";
// import WindowManager from "../windows/WindowManager";
// import CreateGraphWindow from "../windows/CreateGraphWindow"; 
// import VisualizationManager from "../graphs/VisualizationManager";

// const CreateGraphModal = ({ onClose }) => {
//   const [inputValue, setInputValue] = useState("");
//   const [file, setFile] = useState(null);
//   const [features, setFeatures] = useState([]);
//   const [csvContent, setCsvContent] = useState(null);
//   const [selectedFeatureIndices, setSelectedFeatureIndices] = useState([]);

//   const handleFileChange = (event) => {
//     const selectedFile = event.target.files[0];
//     if (selectedFile && selectedFile.name.endsWith(".csv")) {
//       setFile(selectedFile);
//       VisualizationManager.extractFeaturesFromCSV(selectedFile)
//         .then((features) => {
//           setFeatures(features);
//           const reader = new FileReader();
//           reader.onload = (e) => {
//             const content = e.target.result;
//             setCsvContent(content);
//           };
//           reader.readAsText(selectedFile);
//         })
//         .catch((err) => {
//           alert(err);
//         });
//     } else {
//       alert("Please upload a valid CSV file.");
//     }
//   };

//   const handleCheckboxChange = (index) => {
//     if (selectedFeatureIndices.includes(index)) {
//       setSelectedFeatureIndices(selectedFeatureIndices.filter(i => i !== index));
//     } else {
//       if (selectedFeatureIndices.length < 2) {
//         setSelectedFeatureIndices([...selectedFeatureIndices, index]);
//       } else {
//         alert("You can only choose two features.");
//       }
//     }
//   };

//   const handleSubmit = () => {
//     if (!inputValue.trim()) {
//       alert("Please enter a name for the chart.");
//       return;
//     }
//     if (!file || !csvContent || features.length === 0) {
//       alert("Please upload a valid CSV file and make sure the features are pulled.");
//       return;
//     }
//     if (selectedFeatureIndices.length !== 2) {
//       alert("Please select two features.");
//       return;
//     }

//     // Use the new visualize function to create the graph script
//     const graphScript = VisualizationManager.visualize(csvContent, selectedFeatureIndices, inputValue);
//     VisualizationManager.createGraph(inputValue, csvContent, selectedFeatureIndices, graphScript);
//     // Create the window content and open the window
//     const windowContent = CreateGraphWindow(inputValue, file.name, csvContent, selectedFeatureIndices);
//     WindowManager.openWindow(windowContent, graphScript, "Create Graph Window");

//     // Reset states and close the modal
//     setInputValue("");
//     setFile(null);
//     setFeatures([]);
//     setCsvContent(null);
//     setSelectedFeatureIndices([]);
//     onClose();
//   };

//   return (
//     <div style={styles.overlay}>
//       <div style={styles.modal}>
//         <h2>Create Graph</h2>
//         <div>
//           <label>Enter graph name:</label>
//           <input
//             type="text"
//             value={inputValue}
//             onChange={(e) => setInputValue(e.target.value)}
//             placeholder="Graph name"
//           />
//         </div>

//         <div>
//           <label>Upload a CSV file.</label>
//           <input
//             type="file"
//             accept=".csv"
//             onChange={handleFileChange}
//           />
//         </div>

//         {features.length > 0 && (
//           <div>
//             <h3>Pick two features for visualization:</h3>
//             <div style={styles.gridContainer}>
//               {features.map((feature, index) => (
//                 <div key={index} style={styles.gridItem}>
//                   <input
//                     type="checkbox"
//                     checked={selectedFeatureIndices.includes(index)}
//                     onChange={() => handleCheckboxChange(index)}
//                   />
//                   <label>{feature}</label>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         <button onClick={handleSubmit}>OK</button>
//         <button onClick={onClose}>Close</button>
//       </div>
//     </div>
//   );
// };

// const styles = {
//   overlay: {
//     position: "fixed",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modal: {
//     backgroundColor: "white",
//     padding: "20px",
//     borderRadius: "10px",
//     boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
//     textAlign: "center",
//     width: "400px",
//     maxHeight: "90vh",
//     overflowY: "auto",
//   },
//   gridContainer: {
//     display: "grid",
//     gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
//     gap: "10px",
//     textAlign: "left",
//     marginTop: "10px",
//   },
//   gridItem: {
//     display: "flex",
//     alignItems: "center",
//     gap: "5px",
//   },
// };

// export default CreateGraphModal;

