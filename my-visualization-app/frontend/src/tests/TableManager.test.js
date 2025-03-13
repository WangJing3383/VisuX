import TableManager from "../components/table/TableManager";
describe('TableManager', () => {
  let datasetManagerMock;
  let tableManager;

  beforeEach(() => {
    datasetManagerMock = {};
    tableManager = new TableManager(datasetManagerMock);
  });

  it('should update table dataset when old dataset exists', () => {
    const oldDatasetId = 'oldId';
    const newDatasetId = 'newId';
    const mockTable = { data: 'mock data' };

    tableManager.tables.set(oldDatasetId, mockTable);
    const logSpy = jest.spyOn(console, 'log').mockImplementation();
    tableManager.updateTableDataset(oldDatasetId, newDatasetId);

    expect(tableManager.tables.has(oldDatasetId)).toBe(false);
    expect(tableManager.tables.has(newDatasetId)).toBe(true);
    expect(tableManager.tables.get(newDatasetId)).toEqual(mockTable);

    expect(logSpy).toHaveBeenCalledWith(`Table updated: ${oldDatasetId} -> ${newDatasetId}`);

    logSpy.mockRestore();
  });

  it('should not update table dataset when old dataset does not exist', () => {
    const oldDatasetId = 'oldId';
    const newDatasetId = 'newId';

    const logSpy = jest.spyOn(console, 'log').mockImplementation();
    tableManager.updateTableDataset(oldDatasetId, newDatasetId);

    expect(tableManager.tables.has(oldDatasetId)).toBe(false);
    expect(tableManager.tables.has(newDatasetId)).toBe(false);
    expect(logSpy).not.toHaveBeenCalled();
    logSpy.mockRestore();
  });
});
