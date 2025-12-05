import auth from './core/auth.js';
import Toast from './components/toast.js';
import Loader from './components/loader.js';
import Modal from './components/modal.js';
import comprasManager from './modules/compras.js';
import wishlistManager from './modules/wishlist.js';
import currencyConverter from './modules/currency.js';
import { 
  formatDate, 
  debounce, 
  getInitials 
} from './utils/helpers.js';
import {
  validateForm,
  displayFormErrors,
  clearFormErrors
} from './utils/validators.js';

function getCurrentPage() {
  const path = window.location.pathname;
  const page = path.substring(path.lastIndexOf('/') + 1);
  
  if (!page || page === '/src/pages/index.html') return 'auth';
  if (page === '/src/pages/dashboard.html') return 'dashboard';
  if (page === '/src/pages/perfil.html') return 'perfil';
  
  return 'unknown';
}

function initAuthPage() {
  console.log('Inicializando página de autenticação...');

  if (auth.isAuthenticated()) {
    window.location.href = '/src/pages/dashboard.html'; 
    return;
  }

  const loginSection = document.getElementById('login-section');
  const registerSection = document.getElementById('register-section');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const showRegisterBtn = document.getElementById('show-register-btn');
  const showLoginBtn = document.getElementById('show-login-btn');
  const forgotPasswordLink = document.getElementById('forgot-password-link');

  showRegisterBtn?.addEventListener('click', () => {
    loginSection.style.display = 'none';
    registerSection.style.display = 'block';
  });

  showLoginBtn?.addEventListener('click', () => {
    registerSection.style.display = 'none';
    loginSection.style.display = 'block';
  });

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFormErrors(loginForm);

    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-password').value;

    const validation = validateForm(loginForm);
    if (!validation.isValid) {
      displayFormErrors(loginForm, validation.errors);
      return;
    }

    Loader.show();
    
    await new Promise(resolve => setTimeout(resolve, 500));

    if (auth.login(email, senha)) {
      setTimeout(() => {
        window.location.href = '/src/pages/dashboard.html';
      }, 1000);
    } else {
      Loader.hide();
    }
  });

  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFormErrors(registerForm);

    const nome = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const senha = document.getElementById('register-password').value;

    const validation = validateForm(registerForm);
    if (!validation.isValid) {
      displayFormErrors(registerForm, validation.errors);
      return;
    }

    Loader.show();

    await new Promise(resolve => setTimeout(resolve, 500));

    if (auth.register(nome, email, senha)) {
      registerForm.reset();
      setTimeout(() => {
        registerSection.style.display = 'none';
        loginSection.style.display = 'block';
        Loader.hide();
      }, 1500);
    } else {
      Loader.hide();
    }
  });

  forgotPasswordLink?.addEventListener('click', (e) => {
    e.preventDefault();
    Modal.alert(
      'Funcionalidade não implementada',
      'Em um sistema real, você receberia um email para redefinir sua senha.'
    );
  });
}

function initDashboardPage() {
  console.log('Inicializando dashboard...');

  if (!auth.requireAuth()) return;

  const userGreeting = document.getElementById('user-greeting');
  const logoutBtn = document.getElementById('logout-btn');
  const compraForm = document.getElementById('compra-form');
  const tabelaCompras = document.getElementById('tabela-compras');
  const buscaInput = document.getElementById('busca-input');
  const moedaSelect = document.getElementById('moeda-select');
  const btnToggleSelect = document.getElementById('btn-toggle-select');
  const btnEdit = document.getElementById('btn-edit');
  const btnDelete = document.getElementById('btn-delete');
  const totalGasto = document.getElementById('total-gasto');
  const btnCarregarProdutos = document.getElementById('btn-carregar-produtos');
  const filtroProdutos = document.getElementById('filtro-produtos');
  const produtosContainer = document.getElementById('produtos-container');
  const btnVerWishlist = document.getElementById('btn-ver-wishlist');
  const wishlistContainer = document.getElementById('wishlist-container');

  comprasManager.load();
  wishlistManager.load();

  const userName = auth.getCurrentUserName();
  if (userGreeting && userName) {
    userGreeting.innerHTML = `Olá, <strong>${userName}</strong>`;
  }

  logoutBtn?.addEventListener('click', () => {
    Modal.confirm(
      'Confirmar saída',
      'Deseja realmente sair da sua conta?',
      () => auth.logout(),
      { confirmText: 'Sair', cancelText: 'Cancelar' }
    );
  });

  renderTabela();
  updateTotal();

  compraForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const produto = document.getElementById('produto').value;
    const quantidade = document.getElementById('quantidade').value;
    const preco = document.getElementById('preco').value;
    const prioridade = compraForm.querySelector('input[name="prioridade"]:checked').value;

    const validation = validateForm(compraForm);
    if (!validation.isValid) {
      displayFormErrors(compraForm, validation.errors);
      return;
    }

    if (comprasManager.editingId) {
      comprasManager.update(comprasManager.editingId, {
        produto,
        quantidade: Number(quantidade),
        preco: Number(preco),
        prioridade
      });
      comprasManager.editingId = null;
      document.getElementById('form-submit-text').textContent = 'Adicionar Compra';
    } else {
      comprasManager.add(produto, quantidade, preco, prioridade);
    }

    compraForm.reset();
    compraForm.querySelector('input[name="prioridade"][value="Média"]').checked = true;
    clearFormErrors(compraForm);
    renderTabela();
    updateTotal();
  });

  const debouncedSearch = debounce((term) => {
    const filtradas = comprasManager.filter(term);
    renderTabela(filtradas);
  }, 300);

  buscaInput?.addEventListener('input', (e) => {
    debouncedSearch(e.target.value);
  });

  moedaSelect?.addEventListener('change', async (e) => {
    const currency = e.target.value;
    const result = await currencyConverter.setCurrency(currency);

    if (result) {
      const taxaInfo = document.getElementById('taxa-info');
      if (taxaInfo) {
        taxaInfo.textContent = result.formatted;
      }
      comprasManager.setCurrency(currency, result.rate);
      renderTabela();
      updateTotal();
    }
  });

  btnToggleSelect?.addEventListener('click', () => {
    const isSelectMode = comprasManager.toggleSelectMode();
    btnToggleSelect.textContent = isSelectMode ? 'Cancelar' : 'Selecionar';
    renderTabela();
  });

  btnEdit?.addEventListener('click', () => {
    const selected = Array.from(comprasManager.selectedIds);
    if (selected.length === 1) {
      const compra = comprasManager.getById(selected[0]);
      if (compra) {
        document.getElementById('produto').value = compra.produto;
        document.getElementById('quantidade').value = compra.quantidade;
        document.getElementById('preco').value = compra.preco;
        compraForm.querySelector(`input[name="prioridade"][value="${compra.prioridade}"]`).checked = true;

        comprasManager.editingId = compra.id;
        document.getElementById('form-submit-text').textContent = 'Atualizar Compra';
        
        comprasManager.isSelectMode = false;
        comprasManager.clearSelection();
        btnToggleSelect.textContent = 'Selecionar';
        renderTabela();

        compraForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });

  btnDelete?.addEventListener('click', () => {
    const count = comprasManager.selectedIds.size;
    
    Modal.confirm(
      'Confirmar exclusão',
      `Deseja realmente excluir ${count} ${count === 1 ? 'compra' : 'compras'}?`,
      () => {
        comprasManager.delete(Array.from(comprasManager.selectedIds));
        renderTabela();
        updateTotal();
      },
      { danger: true }
    );
  });

  let todosProdutos = [];

  btnCarregarProdutos?.addEventListener('click', async () => {
    Loader.show();
    
    try {
      const response = await fetch('https://fakestoreapi.com/products');
      const produtos = await response.json();
      todosProdutos = produtos;
      
      renderProdutos(produtos);
      filtroProdutos.style.display = 'block';
      Toast.success('Produtos carregados com sucesso!');
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      Toast.error('Erro ao carregar produtos');
    } finally {
      Loader.hide();
    }
  });

  const debouncedFilterProdutos = debounce((term) => {
    const filtrados = todosProdutos.filter(p =>
      p.title.toLowerCase().includes(term.toLowerCase()) ||
      p.category.toLowerCase().includes(term.toLowerCase())
    );
    renderProdutos(filtrados);
  }, 300);

  filtroProdutos?.addEventListener('input', (e) => {
    debouncedFilterProdutos(e.target.value);
  });

  btnVerWishlist?.addEventListener('click', () => {
    renderWishlist();
  });

  function renderTabela(compras = null) {
    const lista = compras || comprasManager.compras;

    if (lista.length === 0) {
      tabelaCompras.innerHTML = `
        <tr class="empty-state">
          <td colspan="6">
            <div class="empty-message">
              <span class="empty-icon">📦</span>
              <p>Nenhuma compra cadastrada</p>
              <small>Adicione sua primeira compra acima</small>
            </div>
          </td>
        </tr>
      `;
      
      if (btnToggleSelect) btnToggleSelect.style.display = 'none';
      updateSelectionToolbar();
      return;
    }

    if (btnToggleSelect) btnToggleSelect.style.display = 'inline-flex';

    tabelaCompras.innerHTML = lista.map(compra => {
      const isSelected = comprasManager.selectedIds.has(compra.id);
      
      return `
        <tr class="${isSelected ? 'selected' : ''}">
          <td style="display: ${comprasManager.isSelectMode ? 'table-cell' : 'none'}">
            <input 
              type="checkbox" 
              class="compra-checkbox" 
              data-id="${compra.id}"
              ${isSelected ? 'checked' : ''}
            />
          </td>
          <td data-label="Produto">${compra.produto}</td>
          <td data-label="Quantidade">${compra.quantidade}</td>
          <td data-label="Preço">${comprasManager.formatPrice(compra.preco)}</td>
          <td data-label="Prioridade">${compra.prioridade}</td>
          <td data-label="Data">${formatDate(compra.dataCriacao)}</td>
        </tr>
      `;
    }).join('');

    const thSelect = document.getElementById('th-select');
    if (thSelect) {
      thSelect.style.display = comprasManager.isSelectMode ? 'table-cell' : 'none';
    }

    document.querySelectorAll('.compra-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const id = e.target.dataset.id;
        comprasManager.toggleSelect(id);
        updateSelectionToolbar();
        renderTabela();
      });
    });

    updateSelectionToolbar();
  }

  function updateSelectionToolbar() {
    const toolbar = document.getElementById('selection-toolbar');
    const count = document.getElementById('selection-count');
    const selectedCount = comprasManager.selectedIds.size;

    if (comprasManager.isSelectMode && selectedCount > 0) {
      toolbar.style.display = 'flex';
      count.textContent = `${selectedCount} ${selectedCount === 1 ? 'item selecionado' : 'itens selecionados'}`;
      
      btnEdit.disabled = selectedCount !== 1;
      btnDelete.disabled = false;
    } else {
      toolbar.style.display = 'none';
      btnEdit.disabled = true;
      btnDelete.disabled = true;
    }
  }

  function updateTotal() {
    if (totalGasto) {
      const total = comprasManager.getTotalValue();
      totalGasto.textContent = `Total Gasto: ${comprasManager.formatPrice(total)}`;
    }
  }

  function renderProdutos(produtos) {
    if (produtos.length === 0) {
      produtosContainer.innerHTML = '<p class="empty-message">Nenhum produto encontrado</p>';
      return;
    }

    produtosContainer.innerHTML = produtos.map(produto => `
      <div class="card-produto">
        <img src="${produto.image}" alt="${produto.title}">
        <h3>${produto.title}</h3>
        <p><strong>R$ ${produto.price.toFixed(2)}</strong></p>
        <p class="categoria">${produto.category}</p>
        <button class="btn btn-sm btn-primary btn-add-wishlist" data-produto='${JSON.stringify(produto).replace(/'/g, "&apos;")}'>
          + Wishlist
        </button>
      </div>
    `).join('');

    document.querySelectorAll('.btn-add-wishlist').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const produto = JSON.parse(e.target.dataset.produto.replace(/&apos;/g, "'"));
        wishlistManager.add(produto);
      });
    });
  }

  function renderWishlist() {
    const wishlist = wishlistManager.getAll();

    if (wishlist.length === 0) {
      wishlistContainer.innerHTML = `
        <div class="empty-message">
          <span class="empty-icon">❤️</span>
          <p>Sua wishlist está vazia</p>
          <small>Adicione produtos da seção acima</small>
        </div>
      `;
      return;
    }

    wishlistContainer.innerHTML = wishlist.map(produto => `
      <div class="card-produto">
        <img src="${produto.image}" alt="${produto.title}">
        <h3>${produto.title}</h3>
        <p><strong>R$ ${produto.price.toFixed(2)}</strong></p>
        <p class="categoria">${produto.category}</p>
        <button class="btn btn-sm btn-danger btn-remove-wishlist" data-id="${produto.id}">
          Remover
        </button>
      </div>
    `).join('');

    document.querySelectorAll('.btn-remove-wishlist').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = Number(e.target.dataset.id);
        wishlistManager.remove(id);
        renderWishlist();
      });
    });
  }
}

function initPerfilPage() {
  console.log('Inicializando página de perfil...');

  // Verifica autenticação
  if (!auth.requireAuth()) return;

  const perfilForm = document.getElementById('perfil-form');
  const avatarInitials = document.getElementById('avatar-initials');
  const btnCancelar = document.getElementById('btn-cancelar');
  const btnLimparDados = document.getElementById('btn-limpar-dados');
  const btnExcluirConta = document.getElementById('btn-excluir-conta');
  const statTotalCompras = document.getElementById('stat-total-compras');
  const statTotalGasto = document.getElementById('stat-total-gasto');
  const statWishlist = document.getElementById('stat-wishlist');

  // Carrega dados do usuário
  const user = auth.getCurrentUser();
  if (user) {
    document.getElementById('perfil-nome').value = user.nome;
    document.getElementById('perfil-email').value = user.email;
    
    if (avatarInitials) {
      avatarInitials.textContent = getInitials(user.nome);
    }
  }

  // Carrega estatísticas
  comprasManager.load();
  wishlistManager.load();

  if (statTotalCompras) {
    statTotalCompras.textContent = comprasManager.compras.length;
  }
  
  if (statTotalGasto) {
    const total = comprasManager.getTotalValue();
    statTotalGasto.textContent = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(total);
  }
  
  if (statWishlist) {
    statWishlist.textContent = wishlistManager.count();
  }

  // Salvar perfil
  perfilForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFormErrors(perfilForm);

    const nome = document.getElementById('perfil-nome').value;
    const senha = document.getElementById('perfil-senha').value;

    const validation = validateForm(perfilForm);
    if (!validation.isValid) {
      displayFormErrors(perfilForm, validation.errors);
      return;
    }

    if (auth.updateUser(nome, senha || null)) {
      // Atualiza avatar
      if (avatarInitials) {
        avatarInitials.textContent = getInitials(nome);
      }
      
      // Limpa senha
      document.getElementById('perfil-senha').value = '';
    }
  });

  btnCancelar?.addEventListener('click', () => {
    window.location.href = '/src/pages/dashboard.html';
  });

  // Limpar dados
  btnLimparDados?.addEventListener('click', () => {
    Modal.confirm(
      '⚠️ Limpar Dados',
      'Isto irá remover todas as suas compras e wishlist. Esta ação não pode ser desfeita!',
      () => {
        comprasManager.clearAll();
        wishlistManager.clear();
        Toast.success('Dados limpos com sucesso');
        
        // Atualiza estatísticas
        if (statTotalCompras) statTotalCompras.textContent = '0';
        if (statTotalGasto) statTotalGasto.textContent = 'R$ 0,00';
        if (statWishlist) statWishlist.textContent = '0';
      },
      { danger: true, confirmText: 'Limpar Tudo' }
    );
  });

  // Excluir conta
  btnExcluirConta?.addEventListener('click', () => {
    Modal.confirm(
      '⚠️ Excluir Conta',
      'Isto irá excluir permanentemente sua conta e todos os dados. Esta ação não pode ser desfeita!',
      () => {
        comprasManager.clearAll();
        wishlistManager.clear();
        auth.deleteAccount();
      },
      { danger: true, confirmText: 'Excluir Conta' }
    );
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const currentPage = getCurrentPage();
  
  console.log(`Página atual: ${currentPage}`);

  switch (currentPage) {
    case 'auth':
      initAuthPage();
      break;
    case 'dashboard':
      initDashboardPage();
      break;
    case 'perfil':
      initPerfilPage();
      break;
    default:
      console.warn('Página desconhecida');
  }
});