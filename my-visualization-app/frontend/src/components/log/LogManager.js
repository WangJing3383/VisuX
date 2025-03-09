class LogManager {
  constructor() {
    this.logs = [];
    this.redoStack = [];
    this.lastSyncTime = null;
    this.datasetVersions = []; // Store all data versions
  }

  logOperation(tool, params, datasetBefore, datasetAfter) {
    const logEntry = {
      tool,
      params,
      datasetBefore,
      datasetAfter,
      timestamp: new Date().toISOString(),
    };
    this.logs.push(logEntry);
    this.datasetVersions.push(datasetAfter); // Store the data version
    this.redoStack = [];

    console.log("Logged operation:", logEntry);
  }

  getLogs(){
      return this.logs;
  }

  addLog(newLog){
    this.logs.unshift(newLog);
  }

}
export default LogManager;