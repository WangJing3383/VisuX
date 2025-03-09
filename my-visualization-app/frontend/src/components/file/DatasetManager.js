const COUNT = 0;
const ONE_SAME_DATASET_NAME = 1;


class DatasetManager {

  constructor() {
    if (!DatasetManager.instance) {
      this.datasetMap = new Map();
      this.datasetIds = new Set(); // Store all dataset IDs
      this.datasetNames = new Set(); // Store all dataset names
      this.currentDatasetId = null; // Dataset ID of the current operation
      DatasetManager.instance = this; // preserve the singleton case (computing)
    }
    return DatasetManager.instance; // Return Example
  }

  // Add data set ID
  addDatasetId(datasetId, datasetName) {
    if (!datasetId) {
      console.warn("Cannot add an empty dataset ID.");
      return;
    }
    this.datasetIds.add(datasetId);
    this.datasetNames.add(datasetName);
    this.datasetMap.set(datasetId, datasetName);
    if (!this.currentDatasetId) {
      this.currentDatasetId = datasetId; // If the current ID is not set, it is selected by default
    }
    console.log(`Dataset ID ${datasetId} added. Current IDs:`, Array.from(this.datasetIds));
  }

   // Get dataset name by id
   getDatasetNameById(datasetId) {
    return this.datasetMap.get(datasetId) || "Not Found";
  }

  //Get the number of datasets with the same name.
  getSuffix(name) {
    let count = COUNT
    for(const datasetName of this.datasetMap.values()){
      if(datasetName === name){
        count++;
      }
    }
    if(count === ONE_SAME_DATASET_NAME){
      return ""
    }else{
      return "(" + count.toString() + ")"
    }
  }

  // Set the current dataset ID
  setCurrentDatasetId(datasetId) {
    if (!datasetId || !this.datasetIds.has(datasetId)) {
      console.warn(`Dataset ID ${datasetId} does not exist in the manager.`);
      return;
    }
    this.currentDatasetId = datasetId;
    console.log(`Current dataset updated to ID: ${datasetId}`);
  }

  // Get the current latest dataset ID
  getCurrentDatasetId() {
    if (!this.currentDatasetId) {
      console.warn("No current dataset selected. Returning last available dataset.");
      return this.datasetIds.size > 0 ? [...this.datasetIds].pop() : null;
    }
    return this.currentDatasetId;
  }

  // Delete dataset ID
  removeDatasetId(datasetId) {
    if (this.datasetIds.has(datasetId)) {
      this.datasetIds.delete(datasetId);
      console.log(`Dataset ID ${datasetId} removed.`);
      // If you are deleting the current dataset, reset the currentDatasetId.
      if (this.currentDatasetId === datasetId) {
        this.currentDatasetId = this.datasetIds.size > 0 ? [...this.datasetIds].pop() : null;
      }
    } else {
      console.warn(`Dataset ID ${datasetId} not found.`);
    }
  }

  // Get all dataset IDs
  getAllDatasetsId() {
    return Array.from(this.datasetIds);
  }

  //Get all dataset names
  getAllDatasetsName() {
    return Array.from(this.datasetMap.values());
  }


  // Get the column names of the dataset
  async getDatasetColumns(datasetId) {
    if (!datasetId) {
      console.warn("Cannot fetch columns. Dataset ID is missing.");
      return [];
    }

    try {
      console.log(`Fetching columns for dataset ID ${datasetId}...`);

      const url = `http://127.0.0.1:8000/api/dataset/${datasetId}/columns/`;
      console.log(`Requesting: ${url}`);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Server Response: ${errorText}`);
        throw new Error(`Failed to fetch dataset columns (HTTP ${response.status})`);
      }

      const data = await response.json();
      console.log(`Columns for dataset ID ${datasetId}:`, data.columns);
      return data.columns || [];
    } catch (error) {
      console.error(`Error fetching columns for dataset ${datasetId}:`, error);
      return [];
    }
  }

  // Access to data set data
  async getDatasetById(datasetId) {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/datasets/${datasetId}/`);
      if (!response.ok) {
        throw new Error(`Failed to fetch dataset: ${response.statusText}`);
      }
      const dataset = await response.json();

      // Conversion of records format
      const transformedDataset = {};
      dataset.features.forEach(feature => {
        transformedDataset[feature] = dataset.records.map(record => record[feature]);
      });

      console.log(`Transformed dataset for ID ${datasetId}:`, transformedDataset);
      return { ...dataset, data: transformedDataset };
    } catch (error) {
      console.error("Error fetching dataset:", error);
      return null;
    }
  }
}

// Exported single case
const datasetManager = new DatasetManager();
export default datasetManager;
