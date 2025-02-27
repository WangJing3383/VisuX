// import React, { useState } from "react";

// const AddDatasetModal = ({ onClose, onCreate }) => {
//   const [datasetName, setDatasetName] = useState("");

//   const handleAddClick = () => {
//     if (datasetName) {
//       onCreate({ datasetName });
//       onClose();
//     } else {
//       alert("Please enter a dataset name");
//     }
//   };

//   return (
//     <div style={styles.overlay}>
//       <div style={styles.modal}>
//         <span style={styles.close} onClick={onClose}>&times;</span>
//         <h2>Add Dataset</h2>
//         <label>
//           Dataset Name:
//           <input
//             type="text"
//             value={datasetName}
//             onChange={(e) => setDatasetName(e.target.value)}
//             style={styles.input}
//           />
//         </label>
//         <br />
//         <button onClick={handleAddClick}>Add</button>
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
//     alignItems: "center", // Modal'ı ekranın ortasında yerleştiriyoruz
//   },
//   modal: {
//     backgroundColor: "white",
//     padding: "20px",
//     borderRadius: "5px",
//     boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
//     textAlign: "center",
//     width: "300px", // Modal genişliği
//   },
//   close: {
//     position: "absolute",
//     top: "10px",
//     right: "10px",
//     fontSize: "20px",
//     cursor: "pointer",
//   },
//   input: {
//     padding: "5px",
//     margin: "10px 0",
//     borderRadius: "4px",
//     border: "1px solid #ccc",
//     width: "100%",
//   },
// };

// export default AddDatasetModal;
