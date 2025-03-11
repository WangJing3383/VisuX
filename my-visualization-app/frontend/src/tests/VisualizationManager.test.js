import VisualizationManager from '../components/graph/VisualizationManager';

describe('VisualizationManager', () => {
  let visualizationManager;

  beforeEach(() => {
    visualizationManager = new VisualizationManager();
  });

  // Test case for checking graph visualization with valid data
  it('should return valid graph data for scatter plot', () => {
    const graph = {
      dataset: { a: [1, 2, 3], b: [4, 5, 6] },
      type: 'scatter',
      selectedFeatures: ['a', 'b'],
      showedDatapoints: [1, 2, 3],
      style: { getMarkerStyle: () => ({ color: 'red', size: 10 }) },
    };

    const result = visualizationManager.visualize(graph);

    expect(result).not.toBeNull();
    expect(result.data).toHaveLength(1); // One trace for scatter
    expect(result.data[0].type).toBe('scatter');
    expect(result.data[0].mode).toBe('markers');
    expect(result.data[0].x).toEqual([1, 2, 3]);
    expect(result.data[0].y).toEqual([4, 5, 6]);
    expect(result.data[0].marker.color).toBe('red');
  });

  // Test case for invalid graph (missing dataset)
  it('should return null when dataset is missing', () => {
    const graph = { type: 'scatter' }; // Missing dataset

    const result = visualizationManager.visualize(graph);

    expect(result).toBeNull();
  });

  // Test case for invalid graph (missing type)
  it('should return null when type is missing', () => {
    const graph = { dataset: { a: [1, 2], b: [3, 4] } }; // Missing type

    const result = visualizationManager.visualize(graph);

    expect(result).toBeNull();
  });

  // Test case for invalid selected features (invalid array)
  it('should return null if selectedFeatures is invalid', () => {
    const graph = {
      dataset: { a: [1, 2, 3], BarProp: [4, 5, 6] },
      type: 'scatter',
      selectedFeatures: ['a', 'invalidFeature'], // Invalid feature
      showedDatapoints: [1, 2, 3],
    };

    const result = visualizationManager.visualize(graph);

    expect(result).toBeNull();
  });

  // Test case for curve fitting
  it('should add fitted curve to the graph when valid fitted curve data is provided', () => {
    const graph = {
      dataset: { a: [1, 2, 3], b: [4, 5, 6] },
      type: 'scatter',
      selectedFeatures: ['a', 'b'],
      fittedCurve: [{ x: 1, y: 4 }, { x: 2, y: 5 }, { x: 3, y: 6 }],
      showedDatapoints: [1, 2, 3],
    };

    const result = visualizationManager.visualize(graph);

    expect(result).not.toBeNull();
    expect(result.data).toHaveLength(2); // One trace for scatter, one for curve
    expect(result.data[1].name).toBe('Fitted Curve');
    expect(result.data[1].line.color).toBe('#D62728'); // Red curve
  });

  // Test case for missing fitted curve
  it('should not add fitted curve when no valid fitted curve data is provided', () => {
    const graph = {
      dataset: { a: [1, 2, 3], b: [4, 5, 6] },
      type: 'scatter',
      selectedFeatures: ['a', 'b'],
      fittedCurve: [], // Invalid fitted curve
      showedDatapoints: [1, 2, 3],
    };

    const result = visualizationManager.visualize(graph);

    expect(result).not.toBeNull();
    expect(result.data).toHaveLength(1); // Only the scatter plot trace
  });

  // Test case for applying additional Y axes (multiple traces)
  it('should apply additional Y axes and create more traces', () => {
    const graph = {
      dataset: { a: [1, 2, 3], b: [4, 5, 6], y1: [7, 8, 9] },
      type: 'scatter',
      selectedFeatures: ['a', 'b'],
      moreYAxes: ['y1'], // Additional Y axis
      showedDatapoints: [1, 2, 3],
    };

    const result = visualizationManager.visualize(graph);

    expect(result).not.toBeNull();
    expect(result.data).toHaveLength(2); // One trace for Y and one for Z
    expect(result.data[1].name).toBe('y1');
    expect(result.data[1].y).toEqual([7, 8, 9]);
  });

  // Test case for invalid graph type
  it('should return null for unsupported graph type', () => {
    const graph = {
      dataset: { a: [1, 2], b: [3, 4] },
      type: 'unsupported', // Unsupported type
      selectedFeatures: ['a', 'b'],
    };

    const result = visualizationManager.visualize(graph);

    expect(result).toBeNull();
  });
});
