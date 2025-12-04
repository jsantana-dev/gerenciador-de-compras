/**
 * Wishlist Module - Gerenciamento de lista de desejos
 * Adiciona e remove produtos da wishlist
 */

import storage from '../core/storage.js';
import Toast from '../components/toast.js';

class WishlistManager {
  constructor() {
    this.wishlist = [];
  }

  /**
   * Carrega a wishlist do storage
   */
  load() {
    this.wishlist = storage.get('wishlist', []);
    return this.wishlist;
  }

  /**
   * Salva a wishlist no storage
   */
  save() {
    return storage.set('wishlist', this.wishlist);
  }

  /**
   * Adiciona um produto à wishlist
   */
  add(produto) {
    // Verifica se já existe
    const exists = this.wishlist.find(item => item.id === produto.id);
    
    if (exists) {
      Toast.warning('Produto já está na wishlist');
      return false;
    }

    this.wishlist.push({
      ...produto,
      addedAt: new Date().toISOString()
    });

    this.save();
    Toast.success('Produto adicionado à wishlist!');
    
    return true;
  }

  /**
   * Remove um produto da wishlist
   */
  remove(produtoId) {
    const sizeBefore = this.wishlist.length;
    this.wishlist = this.wishlist.filter(item => item.id !== produtoId);
    
    if (this.wishlist.length < sizeBefore) {
      this.save();
      Toast.success('Produto removido da wishlist');
      return true;
    }

    Toast.error('Produto não encontrado na wishlist');
    return false;
  }

  /**
   * Verifica se um produto está na wishlist
   */
  has(produtoId) {
    return this.wishlist.some(item => item.id === produtoId);
  }

  /**
   * Obtém todos os itens da wishlist
   */
  getAll() {
    return this.wishlist;
  }

  /**
   * Conta itens na wishlist
   */
  count() {
    return this.wishlist.length;
  }

  /**
   * Limpa toda a wishlist
   */
  clear() {
    this.wishlist = [];
    this.save();
    Toast.info('Wishlist limpa');
  }

  /**
   * Obtém estatísticas da wishlist
   */
  getStats() {
    const total = this.wishlist.reduce((sum, item) => sum + item.price, 0);
    
    return {
      count: this.wishlist.length,
      totalValue: total,
      avgValue: this.wishlist.length > 0 ? total / this.wishlist.length : 0
    };
  }
}

// Exporta uma instância singleton
const wishlistManager = new WishlistManager();

export default wishlistManager;