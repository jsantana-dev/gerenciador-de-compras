/**
 * Currency Module - Conversor de moedas
 * Busca taxas de câmbio e converte valores
 */

import Toast from '../components/toast.js';
import Loader from '../components/loader.js';

class CurrencyConverter {
  constructor() {
    this.apiUrl = 'https://api.exchangerate.host/latest';
    this.currentRate = 1;
    this.currentCurrency = 'BRL';
    this.cache = new Map();
    this.cacheExpiry = 3600000; // 1 hora em ms
  }

  /**
   * Busca a taxa de câmbio para uma moeda
   */
  async fetchRate(currency) {
    if (currency === 'BRL') {
      return 1;
    }

    // Verifica cache
    const cached = this.getFromCache(currency);
    if (cached !== null) {
      return cached;
    }

    try {
      const response = await fetch(`${this.apiUrl}?base=BRL&symbols=${currency}`);
      
      if (!response.ok) {
        throw new Error('Erro na requisição');
      }

      const data = await response.json();
      const rate = data.rates[currency];

      if (!rate) {
        throw new Error('Taxa não encontrada');
      }

      // Salva no cache
      this.saveToCache(currency, rate);

      return rate;
    } catch (error) {
      console.error('Erro ao buscar taxa de câmbio:', error);
      Toast.error('Erro ao buscar taxa de câmbio. Usando valor padrão.');
      return 1;
    }
  }

  /**
   * Converte um valor para a moeda atual
   */
  convert(value) {
    return value * this.currentRate;
  }

  /**
   * Define a moeda atual e busca a taxa
   */
  async setCurrency(currency) {
    if (currency === this.currentCurrency) {
      return;
    }

    Loader.show();

    try {
      const rate = await this.fetchRate(currency);
      this.currentRate = rate;
      this.currentCurrency = currency;

      return {
        currency,
        rate,
        formatted: this.formatRate(rate, currency)
      };
    } catch (error) {
      Toast.error('Erro ao alterar moeda');
      return null;
    } finally {
      Loader.hide();
    }
  }

  /**
   * Formata a taxa de câmbio para exibição
   */
  formatRate(rate, currency) {
    if (currency === 'BRL') {
      return '';
    }
    return `1 BRL ≈ ${rate.toFixed(4)} ${currency}`;
  }

  /**
   * Formata um valor na moeda atual
   */
  format(value) {
    const converted = this.convert(value);

    if (this.currentCurrency === 'BRL') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(converted);
    }

    const symbol = this.getCurrencySymbol(this.currentCurrency);
    return `${symbol} ${converted.toFixed(2)}`;
  }

  /**
   * Obtém o símbolo da moeda
   */
  getCurrencySymbol(currency) {
    const symbols = {
      BRL: 'R$',
      USD: '$',
      EUR: '€',
      GBP: '£'
    };
    return symbols[currency] || currency;
  }

  /**
   * Salva taxa no cache
   */
  saveToCache(currency, rate) {
    this.cache.set(currency, {
      rate,
      timestamp: Date.now()
    });
  }

  /**
   * Busca taxa do cache
   */
  getFromCache(currency) {
    const cached = this.cache.get(currency);

    if (!cached) {
      return null;
    }

    // Verifica se expirou
    if (Date.now() - cached.timestamp > this.cacheExpiry) {
      this.cache.delete(currency);
      return null;
    }

    return cached.rate;
  }

  /**
   * Limpa o cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Reseta para BRL
   */
  reset() {
    this.currentRate = 1;
    this.currentCurrency = 'BRL';
  }
}

// Exporta uma instância singleton
const currencyConverter = new CurrencyConverter();

export default currencyConverter;