/**
 * Compras Module - Gerenciamento de compras
 * CRUD completo de compras com seleção e filtros
 */

import storage from '../core/storage.js';
import Toast from '../components/toast.js';
import { formatCurrency, generateId } from '../utils/helpers.js';

class ComprasManager {
  constructor() {
    this.compras = [];
    this.selectedIds = new Set();
    this.isSelectMode = false;
    this.editingId = null;
    this.currentCurrency = 'BRL';
    this.exchangeRate = 1;
  }

  /**
   * Carrega as compras do storage
   */
  load() {
    this.compras = storage.get('compras', []);
    return this.compras;
  }

  /**
   * Salva as compras no storage
   */
  save() {
    return storage.set('compras', this.compras);
  }

  /**
   * Adiciona uma nova compra
   */
  add(produto, quantidade, preco, prioridade = 'Média') {
    const compra = {
      id: generateId(),
      produto: produto.trim(),
      quantidade: Number(quantidade),
      preco: Number(preco),
      prioridade,
      dataCriacao: new Date().toISOString()
    };

    this.compras.unshift(compra); // Adiciona no início
    this.save();
    Toast.success('Compra adicionada com sucesso!');
    
    return compra;
  }

  /**
   * Atualiza uma compra existente
   */
  update(id, data) {
    const index = this.compras.findIndex(c => c.id === id);
    
    if (index === -1) {
      Toast.error('Compra não encontrada');
      return false;
    }

    this.compras[index] = {
      ...this.compras[index],
      ...data,
      id // Mantém o ID original
    };

    this.save();
    Toast.success('Compra atualizada!');
    
    return true;
  }

  /**
   * Exclui uma ou mais compras
   */
  delete(ids) {
    if (!Array.isArray(ids)) {
      ids = [ids];
    }

    this.compras = this.compras.filter(c => !ids.includes(c.id));
    this.selectedIds.clear();
    this.save();
    
    const count = ids.length;
    Toast.success(`${count} ${count === 1 ? 'compra excluída' : 'compras excluídas'}`);
    
    return true;
  }

  /**
   * Busca uma compra por ID
   */
  getById(id) {
    return this.compras.find(c => c.id === id);
  }

  /**
   * Filtra compras por termo de busca
   */
  filter(searchTerm) {
    if (!searchTerm || !searchTerm.trim()) {
      return this.compras;
    }

    const term = searchTerm.toLowerCase();
    return this.compras.filter(c =>
      c.produto.toLowerCase().includes(term)
    );
  }

  /**
   * Calcula o total gasto
   */
  getTotalValue() {
    return this.compras.reduce((total, c) =>
      total + (c.preco * c.quantidade), 0
    );
  }

  /**
   * Obtém estatísticas
   */
  getStats() {
    return {
      total: this.compras.length,
      valorTotal: this.getTotalValue(),
      porPrioridade: {
        alta: this.compras.filter(c => c.prioridade === 'Alta').length,
        media: this.compras.filter(c => c.prioridade === 'Média').length,
        baixa: this.compras.filter(c => c.prioridade === 'Baixa').length
      }
    };
  }

  /**
   * Alterna modo de seleção
   */
  toggleSelectMode() {
    this.isSelectMode = !this.isSelectMode;
    if (!this.isSelectMode) {
      this.selectedIds.clear();
    }
    return this.isSelectMode;
  }

  /**
   * Seleciona/deseleciona uma compra
   */
  toggleSelect(id) {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  /**
   * Seleciona todas as compras
   */
  selectAll() {
    this.compras.forEach(c => this.selectedIds.add(c.id));
  }

  /**
   * Limpa seleção
   */
  clearSelection() {
    this.selectedIds.clear();
  }

  /**
   * Define moeda e taxa de câmbio
   */
  setCurrency(currency, rate) {
    this.currentCurrency = currency;
    this.exchangeRate = rate;
  }

  /**
   * Formata preço com conversão de moeda
   */
  formatPrice(value) {
    const converted = value * this.exchangeRate;
    
    if (this.currentCurrency === 'BRL') {
      return formatCurrency(converted);
    }

    return `${this.currentCurrency} ${converted.toFixed(2)}`;
  }

  /**
   * Limpa todos os dados
   */
  clearAll() {
    this.compras = [];
    this.selectedIds.clear();
    this.save();
    Toast.info('Todas as compras foram removidas');
  }
}

// Exporta uma instância singleton
const comprasManager = new ComprasManager();

export default comprasManager;