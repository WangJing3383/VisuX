// import Graph from "./Graph";
// import GraphManager from "./GraphManager";

// class VisualizationManager {

//   // A function that analyzes the file and extracts feature names
//   static extractFeaturesFromCSV(file) {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
      
//       reader.onload = (e) => {
//         const content = e.target.result;
//         const rows = content.split("\n").map(row => row.trim());
        
//         // Get the column names in the first row
//         const header = rows[0].split(",");
//         resolve(header); //Returning the feature names
//       };
      
//       reader.onerror = (err) => {
//         reject("Error reading file");
//       };
      
//       reader.readAsText(file);
//     });
//   }

//   // New function for generating graph script
//   static visualize(csvContent, selectedFeatureIndices, inputValue) {
//     // Split the content of the CSV file into rows and columns
//     const rows = csvContent.split("\n").map(row => row.trim().split(","));
    
//     // Get the data rows (skip the header)
//     const dataRows = rows.slice(1);
    
//     // Extract x and y values based on selected feature indices
//     const xIndex = selectedFeatureIndices[0];
//     const yIndex = selectedFeatureIndices[1];

//     const xValues = dataRows.map(row => parseFloat(row[xIndex]));
//     const yValues = dataRows.map(row => parseFloat(row[yIndex]));

//     // Generate the graph script (Plotly format)
//     const graphScript = `
//       Plotly.newPlot('graph', [{
//         x: ${JSON.stringify(xValues)},
//         y: ${JSON.stringify(yValues)},
//         type: 'scatter',
//         mode: 'lines+markers',
//         marker: { color: 'red' }
//       }], {
//         title: '${inputValue}'
//       });
//     `;
    
//     return graphScript;
//   }

//   static createGraph(graphName, csvContent, selectedFeatures, graphScript) {
//     console.log("createGraph called with:", graphName, selectedFeatures);
//     const newGraph = new Graph(graphName, csvContent, selectedFeatures);
//     GraphManager.addGraph(newGraph);
//     return newGraph;
//   }
  
// }

// export default VisualizationManager;
