class StorageManager {
  constructor(prefix = 'gc') {
    this.prefix = prefix;
  }

  _getKey(key) {
    return `${this.prefix}_${key}`;
  }

  set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(this._getKey(key), serialized);
      return true;
    } catch (error) {
      console.error(`Erro ao salvar '${key}' no localStorage:`, error);
      return false;
    }
  }

  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(this._getKey(key));
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Erro ao recuperar '${key}' do localStorage:`, error);
      return defaultValue;
    }
  }

  remove(key) {
    try {
      localStorage.removeItem(this._getKey(key));
      return true;
    } catch (error) {
      console.error(`Erro ao remover '${key}' do localStorage:`, error);
      return false;
    }
  }

  clear() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(`${this.prefix}_`)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Erro ao limpar localStorage:', error);
      return false;
    }
  }

  has(key) {
    return localStorage.getItem(this._getKey(key)) !== null;
  }

  keys() {
    const allKeys = Object.keys(localStorage);
    return allKeys
      .filter(key => key.startsWith(`${this.prefix}_`))
      .map(key => key.replace(`${this.prefix}_`, ''));
  }

  size() {
    let total = 0;
    this.keys().forEach(key => {
      const value = localStorage.getItem(this._getKey(key));
      if (value) {
        total += value.length + key.length;
      }
    });
    return total;
  }
}

const storage = new StorageManager('gerenciador_compras');

export default storage;