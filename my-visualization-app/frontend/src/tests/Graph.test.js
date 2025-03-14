import Graph from '../components/graph/Graph';
import GraphStyle from '../components/graph/GraphStyle';
import { chartCategories } from '../components/graph/ChartCategories';

jest.mock('../components/graph/GraphStyle');
jest.mock('../components/graph/ChartCategories');

describe('Graph class', () => {
  let graph;
  let mockDataset;
  const datasetId = 1;
  const id = '1234';
  const name = 'VisuX Graph';
  const dataset = { a: [1, 2, 3], b: [10, 20, 30], c: [100, 200, 300], d: [400, 500, 600] };
  const type = 'scatter';
  const selectedFeatures = ['a', 'b'];

  beforeEach(() => {
    mockDataset = dataset;
    graph = new Graph(datasetId, id, name, mockDataset, type, selectedFeatures);
  });

  test('should correctly initialize a graph object', () => {
    expect(graph.id).toBe(id);
    expect(graph.name).toBe(name);
    expect(graph.dataset).toBe(mockDataset);
    expect(graph.type).toBe(type);
    expect(graph.selectedFeatures).toEqual(selectedFeatures);
    expect(graph.xAxis).toBe(selectedFeatures[0]);
    expect(graph.yAxis).toBe(selectedFeatures[1]);
    expect(graph.zAxis).toBe(selectedFeatures[2]);
    expect(graph.style).toBeInstanceOf(GraphStyle);
    expect(graph.metadata).toEqual({});
    expect(graph.createdAt).toBeInstanceOf(Date);
    expect(graph.updatedAt).toBeInstanceOf(Date);
    expect(graph.visible).toBe(true);
    expect(graph.fittedCurve).toBeNull();
    expect(graph.datasetId).toBe(datasetId);
    expect(graph.showedDatapoints).toEqual([1, 2, 3]);
    expect(graph.moreYAxes).toEqual([]);
  });

  test('should change color correctly', () => {
    const newColor = 'red';
    graph.changeColor(newColor);
    expect(graph.style.setColorScheme).toHaveBeenCalledWith(newColor);
    expect(graph.updatedAt).not.toBe(graph.createdAt);
  });

  test('should toggle visibility correctly', () => {
    const initialVisibility = graph.visible;
    graph.toggleVisibility();
    expect(graph.visible).toBe(!initialVisibility);
    expect(graph.updatedAt).not.toBe(graph.createdAt);
  });

  test('should set X axis correctly', () => {
    const newXAxis = 'c';
    graph.setXAxis(newXAxis);
    expect(graph.xAxis).toBe(newXAxis);
    expect(graph.selectedFeatures[0]).toBe(newXAxis);
  });

  test('should set Y axis correctly', () => {
    const newYAxis = 'd';
    graph.setYAxis(newYAxis);
    expect(graph.yAxis).toBe(newYAxis);
    expect(graph.selectedFeatures[1]).toBe(newYAxis);
  });

  test('should set Z axis correctly', () => {
    const newZAxis = 'a';
    graph.setZAxis(newZAxis);
    expect(graph.zAxis).toBe(newZAxis);
    expect(graph.selectedFeatures[2]).toBe(newZAxis);
  });

  test('should set fitted curve correctly', () => {
    const fittedCurve = { data: [1, 2, 3] };
    graph.setFittedCurve(fittedCurve);
    expect(graph.fittedCurve).toEqual(fittedCurve);
    expect(graph.updatedAt).not.toBe(graph.createdAt);
  });

  test('should set more Y axes correctly', () => {
    const moreYAxes = ['y1', 'y2'];
    graph.setMoreYAxes(moreYAxes);
    expect(graph.moreYAxes).toEqual(moreYAxes);
  });

  test('should get more Y axes correctly', () => {
    const moreYAxes = ['y1', 'y2'];
    graph.setMoreYAxes(moreYAxes);
    expect(graph.getMoreYAxes()).toEqual(moreYAxes);
  });

  test('should update graph type and features', () => {
    chartCategories['area'] = [{ type: 'area', requiredFeatures: 3 }];
    graph.setType('area');
    expect(graph.type).toBe('area');
    });

    test('should exclude range correctly', () => {
    graph.excludeRange(1, 2);
    expect(graph.showedDatapoints).toEqual([3]);
  });

  test('should restore range correctly', () => {
    graph.excludeRange(1, 2);
    graph.restoreRange(1, 2);
    expect(graph.showedDatapoints).toEqual([3, 1, 2]);
  });

  test('should return the correct required features for a graph type', () => {
    chartCategories['scatter'] = [{ type: 'scatter', requiredFeatures: 2 }];
    expect(graph.getRequiredFeatures('scatter')).toBe(2);
  });
});
