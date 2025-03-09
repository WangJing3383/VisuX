class TableManager {
    constructor(datasetManager) {
        this.datasetManager = datasetManager;
        this.tables = new Map(); // Record the form on the UI
    }

    updateTableDataset(oldDatasetId, newDatasetId) {
        if (this.tables.has(oldDatasetId)) {
            this.tables.set(newDatasetId, this.tables.get(oldDatasetId));
            this.tables.delete(oldDatasetId);
            console.log(`Table updated: ${oldDatasetId} -> ${newDatasetId}`);
        }
    }

}

export default TableManager;
