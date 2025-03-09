// // class WindowManager {
// //   static openWindow(content, script = "", title = "New Window", width = 500, height = 500) {
// //     const newWindow = window.open("", title, `width=${width},height=${height}`);
// //     if (newWindow) {
// //       newWindow.document.write(`
// //         <html>
// //           <head>
// //             <title>${title}</title>
// //             <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
// //           </head>
// //           <body>
// //             <div id="root">${content}</div>
// //             <script>${script}</script>
// //           </body>
// //         </html>
// //       `);
// //       newWindow.document.close();
// //     }
// //   }
// // }
//
// // export default WindowManager;
//
//
//
// // class WindowManager {
// //   static openWindow(content, script = "", title = "New Window", width = 500, height = 500, onClose) {
// //     const newWindow = window.open("", title, `width=${width},height=${height}`);
// //     if (newWindow) {
// //       newWindow.document.write(`
// //         <html>
// //           <head>
// //             <title>${title}</title>
// //             <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
// //           </head>
// //           <body>
// //             <div id="root">${content}</div>
// //             <script>
// //               // onClose defined as global variable
// //               const onClose = ${onClose};
// //               ${script}
// //             </script>
// //           </body>
// //         </html>
// //       `);
// //       newWindow.document.close();
// //     }
// //   }
// // }
//
// // export default WindowManager;
// class WindowManager {
//   static openWindow(content, script = "", title = "New Window", width = 500, height = 500, onClose) {
//     const newWindow = window.open("", title, `width=${width},height=${height}`);
//     if (newWindow) {
//       newWindow.document.write(`
//         <html>
//           <head>
//             <title>${title}</title>
//             <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
//             <script>
//               // createGraph fonksiyonunu global window objesine ekliyoruz
//               window.createGraph = function(graphName, csvContent, selectedFeatures) {
//                 console.log("createGraph called with:", graphName, selectedFeatures);
//                 const graphDiv = document.getElementById('graph');
//                 if (graphDiv) {
//                   Plotly.newPlot(graphDiv, [{
//                     x: [1, 2, 3],
//                     y: [10, 15, 13],
//                     type: 'scatter'
//                   }], {
//                     title: graphName
//                   });
//                 } else {
//                   console.error("Graph div not found.");
//                 }
//               };
//             </script>
//           </head>
//           <body>
//             <div id="root">${content}</div>
//             <script>
//               const onClose = ${onClose};
//               ${script}
//             </script>
//           </body>
//         </html>
//       `);
//       newWindow.document.close();
//     }
//   }
// }
//
// export default WindowManager;
