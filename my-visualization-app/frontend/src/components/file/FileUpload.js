import React, { useState } from "react";
import { Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";

// Get CSRF Token (fit Django)
// function getCSRFToken() {
//   let cookieValue = null;
//   if (document.cookie) {
//     document.cookie.split(";").forEach((cookie) => {
//       const [name, value] = cookie.trim().split("=");
//       if (name === "csrftoken") {
//         cookieValue = decodeURIComponent(value);
//       }
//     });
//   }
//   return cookieValue;
// }

const FileUpload = ({ datasetManager }) => {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("No file selected");

  const handleUpload = async (file) => {
    if (!file) {
      message.error("Please select a file first.");
      return;
    }

    setFileName(file.name);
    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/upload/", {
        method: "POST",
        // headers: { "X-CSRFToken": getCSRFToken() },
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("Upload response:", data);

      if (data.dataset_id) {
        datasetManager.addDatasetId(data.dataset_id, data.name);
        message.success(`File uploaded successfully. Dataset ID: ${data.dataset_id}`);
      } else {
        message.warning("No dataset ID returned from backend.");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      message.error("File upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isSupportedFormat = ["csv", "xlsx"].includes(file.name.split(".").pop().toLowerCase());
      if (!isSupportedFormat) {
        message.error("Only CSV and XLSX files are supported.");
        return false;
      }
      if (file.size === 0) {
        message.error("File is empty.");
        return false;
      }
      handleUpload(file); // Auto upload after selecting file
      return false;
    },
    showUploadList: false,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span
          style={{
            minWidth: "250px",
            maxWidth: "400px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {fileName}
        </span>
        <Upload {...uploadProps} maxCount={1}>
          <Button type="primary" icon={<UploadOutlined />} loading={uploading}>
            {uploading ? "Uploading..." : "Upload File"}
          </Button>
        </Upload>
      </div>
    </div>
  );
};

export default FileUpload;