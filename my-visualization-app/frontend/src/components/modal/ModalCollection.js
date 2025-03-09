import React from "react";
import { Modal, Select, Progress} from "antd";

const ModalCollection = ({ uiController }) => {
  const modalController = uiController.getModalController();
  const modalData = modalController.getModalData();

  return (
    <>
      {/* Modal for downloading files */}
      <Modal
        title="Select Download Format"
        visible={modalController.isModalActive("download")}
        onOk={() => {
          modalController.closeModal();
          uiController.downloadFile(modalData?.format || "csv");
        }}
        onCancel={() => modalController.closeModal()}
      >
        <Select
          defaultValue={modalData?.format || "csv"}
          style={{ width: "100%" }}
          onChange={(value) => modalData.format = value}
        >
          <Select.Option value="csv">CSV</Select.Option>
          <Select.Option value="json">JSON</Select.Option>
          <Select.Option value="xlsx">Excel</Select.Option>
        </Select>
      </Modal>

      {/* Modal for uploading progress */}
      <Modal
        title="Uploading File"
        visible={modalController.isModalActive("uploadProgress")}
        footer={null}
        closable={false}
      >
        <Progress percent={modalData?.progress || 0} />
      </Modal>

      {/* Delete confirmed Modal */}
      <Modal
        title="Confirm Deletion"
        visible={modalController.isModalActive("deleteConfirmation")}
        onOk={() => {
          modalController.closeModal();
          modalData?.onConfirm();
        }}
        onCancel={() => modalController.closeModal()}
      >
        <p>{modalData?.message || "Are you sure you want to delete this item?"}</p>
      </Modal>
    </>
  );
};

export default ModalCollection;
