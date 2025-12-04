class Modal {
  constructor() {
    this.currentModal = null;
    this.confirmCallback = null;
  }

  confirm(title, message, onConfirm, options = {}) {
    const {
      confirmText = 'Confirmar',
      cancelText = 'Cancelar',
      danger = false
    } = options;

    this.confirmCallback = onConfirm;

    let modal = document.getElementById('confirm-modal');
    
    if (!modal) {
      modal = this.createModal();
      document.body.appendChild(modal);
    }

    const titleEl = modal.querySelector('#modal-title');
    const messageEl = modal.querySelector('#modal-message');
    const confirmBtn = modal.querySelector('#modal-confirm');
    const cancelBtn = modal.querySelector('#modal-cancel');

    if (titleEl) titleEl.textContent = title;
    if (messageEl) messageEl.textContent = message;
    if (confirmBtn) {
      confirmBtn.textContent = confirmText;
      confirmBtn.className = danger ? 'btn btn-danger' : 'btn btn-primary';
    }
    if (cancelBtn) cancelBtn.textContent = cancelText;

    this.attachEventListeners(modal);

    this.show(modal);
    this.currentModal = modal;
  }

  createModal() {
    const modal = document.createElement('div');
    modal.id = 'confirm-modal';
    modal.className = 'modal';
    modal.style.display = 'none';
    
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3 id="modal-title">Confirmar</h3>
          <button class="modal-close" aria-label="Fechar">×</button>
        </div>
        <div class="modal-body">
          <p id="modal-message">Tem certeza?</p>
        </div>
        <div class="modal-footer">
          <button id="modal-cancel" class="btn btn-outline">Cancelar</button>
          <button id="modal-confirm" class="btn btn-primary">Confirmar</button>
        </div>
      </div>
    `;

    return modal;
  }

  attachEventListeners(modal) {
    const newModal = modal.cloneNode(true);
    modal.parentNode?.replaceChild(newModal, modal);
    modal = newModal;

    const overlay = modal.querySelector('.modal-overlay');
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('#modal-cancel');
    const confirmBtn = modal.querySelector('#modal-confirm');

    const closeModal = () => this.close(modal);
    
    overlay?.addEventListener('click', closeModal);
    closeBtn?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', closeModal);
    
    confirmBtn?.addEventListener('click', () => {
      if (this.confirmCallback) {
        this.confirmCallback();
      }
      this.close(modal);
    });

    const escHandler = (e) => {
      if (e.key === 'Escape' && this.currentModal) {
        this.close(this.currentModal);
      }
    };
    
    document.addEventListener('keydown', escHandler);
    modal.dataset.escHandler = 'attached';
  }

  show(modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
      const cancelBtn = modal.querySelector('#modal-cancel');
      cancelBtn?.focus();
    }, 100);
  }

  close(modal) {
    if (!modal) return;
    
    modal.style.display = 'none';
    document.body.style.overflow = '';
    this.confirmCallback = null;
    this.currentModal = null;
  }

  alert(title, message) {
    return new Promise((resolve) => {
      this.confirm(title, message, resolve, {
        confirmText: 'OK',
        cancelText: ''
      });
      const modal = document.getElementById('confirm-modal');
      const cancelBtn = modal?.querySelector('#modal-cancel');
      if (cancelBtn) {
        cancelBtn.style.display = 'none';
      }
    });
  }
}

const modal = new Modal();

export default modal;