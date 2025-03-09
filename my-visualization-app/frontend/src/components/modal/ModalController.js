class ModalController {
  constructor() {
    this.modalActive = false;
    this.activeModal = null;
    this.data = null;
  }

  openModal(modalType, data = null) {
    this.modalActive = true;
    this.activeModal = modalType;
    this.data = data;
    console.log(`Opened modal: ${modalType}`, data);
  }

  closeModal() {
    this.modalActive = false;
    this.activeModal = null;
    this.data = null;
    console.log('Closed modal');
  }

  isModalActive(modalType) {
    return this.modalActive && this.activeModal === modalType;
  }

  getModalData() {
    return this.data;
  }
}

export default ModalController;
