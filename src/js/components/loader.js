class Loader {
  constructor() {
    this.element = document.getElementById('global-loader');
  }

  show() {
    if (this.element) {
      this.element.style.display = 'flex';
    }
  }

  hide() {
    if (this.element) {
      this.element.style.display = 'none';
    }
  }
}

const loader = new Loader();
export default loader;