import ModalController from "../components/modal/ModalController";

describe('ModalController', () => {
  let modalController;

  beforeEach(() => {
    modalController = new ModalController();
  });

  it('should open a modal and store the correct state and data', () => {
    const modalType = 'infoModal';
    const modalData = { message: 'This is a test message' };
    const logSpy = jest.spyOn(console, 'log').mockImplementation();
    modalController.openModal(modalType, modalData);

    expect(modalController.modalActive).toBe(true);
    expect(modalController.activeModal).toBe(modalType);
    expect(modalController.data).toEqual(modalData);

    expect(logSpy).toHaveBeenCalledWith(`Opened modal: ${modalType}`, modalData);

    logSpy.mockRestore();
  });

  it('should close the modal and reset the state', () => {
    const modalType = 'infoModal';
    const modalData = { message: 'This is a test message' };

    modalController.openModal(modalType, modalData);

    const logSpy = jest.spyOn(console, 'log').mockImplementation();
    modalController.closeModal();
    expect(modalController.modalActive).toBe(false);
    expect(modalController.activeModal).toBeNull();
    expect(modalController.data).toBeNull();
    expect(logSpy).toHaveBeenCalledWith('Closed modal');
    logSpy.mockRestore();
  });

  it('should correctly identify if a modal is active', () => {
    const modalType = 'infoModal';
    expect(modalController.isModalActive(modalType)).toBe(false);

    modalController.openModal(modalType);
    expect(modalController.isModalActive(modalType)).toBe(true);

    modalController.closeModal();
    expect(modalController.isModalActive(modalType)).toBe(false);
  });

  it('should return the correct modal data', () => {
    const modalData = { message: 'This is a test message' };

    modalController.openModal('infoModal', modalData);
    expect(modalController.getModalData()).toEqual(modalData);

    modalController.closeModal();
    expect(modalController.getModalData()).toBeNull();
  });
});
