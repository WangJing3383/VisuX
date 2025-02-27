// // import Graph from './Graph';
// // class GraphManager {
// //     constructor() {
// //         this.graphs = [];
// //     }

// //     addGraph(title, data, type) {
// //         const newGraph = new Graph(title, data, type);  // Graph sınıfından yeni bir grafik oluşturuyoruz
// //         this.graphs.push(newGraph);  // Grafiği graphs dizisine ekliyoruz
// //     }

// //     deleteGraph(graphId) {
// //         this.graphs = this.graphs.filter(graph => graph.id !== graphId);
// //     }

// //     getGraphs() {
// //         return this.graphs;
// //     }
// // }

// // export default GraphManager;

// import Graph from './Graph';

// class GraphManager {
//   constructor() {
//     if (GraphManager.instance) {
//       return GraphManager.instance;  // Daha önce oluşturulmuşsa onu döndür
//     }
    
//     this.graphs = [];
//     GraphManager.instance = this;  // Yeni oluşturulan örneği sakla
//   }

//   addGraph(graph) {
//     if (graph instanceof Graph) {
//       this.graphs.push(graph);
//     } else {
//       console.error('Only Graph instances can be added.');
//     }
//   }

//   getGraph(name) {
//     return this.graphs.find(graph => graph.name === name);
//   }

//   getAllGraphs() {
//     return this.graphs;
//   }
// }

// const instance = new GraphManager();
// Object.freeze(instance);  // Örneği değiştirilemez hale getirir

// export default instance;
