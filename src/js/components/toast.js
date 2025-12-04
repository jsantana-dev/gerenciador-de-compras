class Toast {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  }

  /**
   * Exibe uma notificação toast
   * @param {string} message - Mensagem a ser exibida
   * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
   * @param {number} duration - Duração em ms (padrão: 3000)
   */

  show(message, type = 'info', duration = 3000) {
    const toast = this.create(message, type);
    this.container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast--show');
    }, 10);

    const timeoutId = setTimeout(() => {
      this.remove(toast);
    }, duration);

    const closeBtn = toast.querySelector('.toast__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        clearTimeout(timeoutId);
        this.remove(toast);
      });
    }

    return toast;
  }

  create(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;

    const icon = this.getIcon(type);
    
    toast.innerHTML = `
      <span class="toast__icon">${icon}</span>
      <span class="toast__message">${this.escapeHtml(message)}</span>
      <button class="toast__close" aria-label="Fechar">×</button>
    `;

    return toast;
  }

  remove(toast) {
    toast.classList.remove('toast--show');
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  getIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  }

  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  success(message, duration) {
    return this.show(message, 'success', duration);
  }

  error(message, duration) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration) {
    return this.show(message, 'info', duration);
  }

  clearAll() {
    const toasts = this.container.querySelectorAll('.toast');
    toasts.forEach(toast => this.remove(toast));
  }
}

const toast = new Toast();

export default toast;