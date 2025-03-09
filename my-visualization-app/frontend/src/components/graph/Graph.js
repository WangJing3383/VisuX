import GraphStyle from "./GraphStyle";
import { chartCategories } from "./ChartCategories";

class Graph {
  constructor(datasetId, id, name, dataset, type, selectedFeatures, style = new GraphStyle()) {
    console.log("Graph constructor received dataset:", dataset);
    this.id = id;
    this.name = name;
    this.dataset = dataset; // { x: [...], y: [...] }
    this.type = type; // 'scatter', 'bar', 'line', etc.
    this.selectedFeatures = selectedFeatures;
    this.xAxis = selectedFeatures[0];
    this.yAxis = selectedFeatures[1];
    this.zAxis = selectedFeatures[2];
    this.style = style instanceof GraphStyle ? style : new GraphStyle();
    this.metadata = {};
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.visible = true;
    this.fittedCurve = null; // Stores curve-fitting data
    this.datasetId = datasetId;
    this.showedDatapoints = Array.from({ length: this.dataset[selectedFeatures[0]].length }, (v, i) => i + 1);
    this.moreYAxes = [];
  }

  changeColor(newColor) {
    this.style.setColorScheme(newColor);
    this.updatedAt = new Date();
  }

  toggleVisibility() {
    this.visible = !this.visible;
    this.updatedAt = new Date();
  }

  setXAxis(xAxis) {
    this.selectedFeatures[0] = xAxis;
    this.xAxis = xAxis;
  }

  setYAxis(yAxis) {
    this.selectedFeatures[1] = yAxis;
    this.yAxis = yAxis;
  }

  setZAxis(zAxis) {
    this.selectedFeatures[2] = zAxis;
    this.zAxis = zAxis;
  }

  getDataset() {
    return this.dataset;
  }

  setFittedCurve(fittedCurve) {
    this.fittedCurve = fittedCurve;
    this.updatedAt = new Date();
  }

  setMoreYAxes(newMoreYAxes) {
    this.moreYAxes = newMoreYAxes;
  }

  getMoreYAxes() {
    return this.moreYAxes;
  }

  setType(newType) {
    const oldType = this.type;

    const oldRequiredFeatures = this.getRequiredFeatures(oldType);
    const newRequiredFeatures = this.getRequiredFeatures(newType);

    if (newRequiredFeatures > oldRequiredFeatures) {
      for (let i = 0; i < newRequiredFeatures - oldRequiredFeatures; i++) {
        this.selectedFeatures.push(this.selectedFeatures[0]);
      }
    } else if (newRequiredFeatures < oldRequiredFeatures) {
      this.selectedFeatures = this.selectedFeatures.slice(0, newRequiredFeatures);
    }

    this.type = newType;
  }

  /**
   * 
   * @param {*} graphType graph type to search
   * @returns required amount of features (0 if not found)
   */
  getRequiredFeatures(graphType) {
    for (let category in chartCategories) {
      const searchedType = chartCategories[category].find((searchedType) => searchedType.type === graphType);
      if (searchedType) return searchedType.requiredFeatures;
    }
    return 0;
  }

  excludeRange(min, max) {
    this.showedDatapoints = this.showedDatapoints.filter(num => num < min || num > max);
  }

  restoreRange(min, max) {
    for (let i = min; i <= max; i++) {
      if (!this.showedDatapoints.includes(i)) {
        this.showedDatapoints.push(i);
      }
    }
  }


}

export default Graph;
