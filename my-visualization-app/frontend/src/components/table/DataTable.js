import React, { useState, useEffect } from "react";
import { Card, Table, Button, message, Tooltip } from "antd";
import datasetManager from "../file/DatasetManager"; // Import dataset manager

const DataTable = () => {
  const [data, setData] = useState([]); // Stores dataset records
  const [columns, setColumns] = useState([]); // Stores dataset features
  const [selectedColumns, setSelectedColumns] = useState(new Set()); // Stores selected columns
  const [loading, setLoading] = useState(false);
  const datasetId = datasetManager.getCurrentDatasetId();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 5 });

  /**
   * Fetch dataset from API on mount or after deletion
   */
  useEffect(() => {
    if (!datasetId) {
      message.warning("No dataset ID found. Please upload a dataset.");
      return;
    }

    setLoading(true);
    fetch(`http://127.0.0.1:8000/api/datasets/${datasetId}/`)
      .then((response) => response.json())
      .then((result) => {
        if (!result || result.error) {
          message.error("Failed to load dataset.");
          return;
        }

        const features = result.features ?? []; // Ensure features exist
        const records = result.records ?? []; // Ensure records exist

        if (features.length === 0 || records.length === 0) {
          message.warning("Dataset is empty or has no features.");
          return;
        }

        setColumns(formatColumns(features)); // Format feature columns
        setData(records); // Store dataset records
      })
      .catch((error) => {
        console.error("Error fetching dataset:", error);
        message.error("Error loading dataset.");
      })
      .finally(() => setLoading(false));
  }, [datasetId]); // Reload data when datasetId changes

  /**
   * Format table columns with selectable headers
   */
  const formatColumns = (features) => {
    return [
      {
        title: "No.",
        dataIndex: "index",
        key: "index",
        width: 60,
        fixed: "left",
        align: "center",
        render: (_, __, index) =>
          (pagination.current - 1) * pagination.pageSize + index + 1, // ✅ Keep real row numbers
        onHeaderCell: () => ({
          style: { backgroundColor: "#f0f0f0", fontWeight: "bold" }, // ✅ Fixed background
        }),
      },
      ...features.map((feature) => ({
        title: (
          <Tooltip title={feature}>
            <span
              style={{
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: "4px",
                backgroundColor: selectedColumns.has(feature) ? "#ffcccc" : "transparent", // ✅ Highlight selected column
              }}
              onClick={() => toggleColumnSelection(feature)}
            >
              {feature.length > 15 ? `${feature.slice(0, 15)}...` : feature}
            </span>
          </Tooltip>
        ),
        dataIndex: feature,
        key: feature,
        width: 180, // ✅ Adjust column width
        ellipsis: true,
      })),
    ];
  };

  /**
   * Toggle column selection for deletion
   */
  const toggleColumnSelection = (columnKey) => {
    setSelectedColumns((prev) => {
      const newSelection = new Set(prev);
      newSelection.has(columnKey) ? newSelection.delete(columnKey) : newSelection.add(columnKey);
      return newSelection;
    });
  };

  /**
   * Handle column deletion
   */
  const handleDelete = () => {
  if (!selectedColumns.size) {
    message.warning("Please select columns to delete.");
    return;
  }

  fetch("http://127.0.0.1:8000/api/delete_feature/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dataset_id: datasetId, features_to_remove: [...selectedColumns] }),
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        message.error("Failed to delete features.");
        return;
      }

      message.success("Features deleted successfully.");
      setSelectedColumns(new Set()); // ✅ Clear selected columns


      fetch(`http://127.0.0.1:8000/api/datasets/${datasetId}/`)
        .then((response) => response.json())
        .then((updatedResult) => {
          setColumns(formatColumns(updatedResult.features ?? []));
          setData(updatedResult.records ?? []);
        });
    })
    .catch((error) => {
      console.error("Error deleting features:", error);
      message.error("Error deleting features.");
    });
};


  return (
    <Card title="Data Table" style={{ width: "100%", minHeight: "400px" }}>
      <Table
        rowKey={(record, index) => index}
        columns={columns.map((col) => ({
          ...col,
          onCell: (_, rowIndex) => ({
            style: {
              backgroundColor: selectedColumns.has(col.key) ? "#ffcccc" : "transparent", // ✅ Full-column highlight
            },
          }),
        }))}
        dataSource={data}
        pagination={{
          ...pagination,
          total: data.length,
          showSizeChanger: false,
          onChange: (page) => setPagination({ current: page, pageSize: 5 }),
        }}
        scroll={{ x: "max-content", y: 300 }}
        size="small"
        loading={loading}
      />
      <Button
        type="primary"
        danger
        onClick={handleDelete}
        disabled={!selectedColumns.size}
        style={{ marginTop: "10px" }}
      >
        Delete Selected Features
      </Button>
    </Card>
  );
};

export default DataTable;
