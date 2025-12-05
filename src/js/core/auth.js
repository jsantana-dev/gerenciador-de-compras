import storage from './storage.js';
import Toast from '../components/toast.js';

class AuthManager {
  constructor() {
    this.USUARIO_KEY = 'usuario';
    this.SESSION_KEY = 'sessao';
  }

  isAuthenticated() {
    return storage.has(this.SESSION_KEY);
  }

  getCurrentUser() {
    return storage.get(this.SESSION_KEY);
  }

  getCurrentUserName() {
    const user = this.getCurrentUser();
    return user ? user.nome : null;
  }

  register(nome, email, senha) {
    if (!nome || !email || !senha) {
      Toast.show('Preencha todos os campos', 'error');
      return false;
    }

    if (senha.length < 6) {
      Toast.show('A senha deve ter no mínimo 6 caracteres', 'error');
      return false;
    }

    if (!this._validateEmail(email)) {
      Toast.show('Email inválido', 'error');
      return false;
    }

    if (storage.has(this.USUARIO_KEY)) {
      Toast.show('Já existe um usuário cadastrado. Faça login.', 'error');
      return false;
    }

    const usuario = {
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      senha: senha,
      dataCriacao: new Date().toISOString()
    };

    if (storage.set(this.USUARIO_KEY, usuario)) {
      Toast.show('Cadastro realizado com sucesso!', 'success');
      return true;
    }

    Toast.show('Erro ao cadastrar usuário', 'error');
    return false;
  }

  login(email, senha) {
    if (!email || !senha) {
      Toast.show('Preencha email e senha', 'error');
      return false;
    }

    const usuario = storage.get(this.USUARIO_KEY);

    if (!usuario) {
      Toast.show('Nenhum usuário cadastrado. Crie uma conta primeiro.', 'error');
      return false;
    }

    if (
      usuario.email === email.trim().toLowerCase() &&
      usuario.senha === senha
    ) {
      const sessao = {
        nome: usuario.nome,
        email: usuario.email,
        loginAt: new Date().toISOString()
      };

      storage.set(this.SESSION_KEY, sessao);
      Toast.show(`Bem-vindo(a), ${usuario.nome}!`, 'success');
      
      setTimeout(() => {
        window.location.href = 'src/pages/dashboard.html';
      }, 1000);
      
      return true;
    }

    Toast.show('Email ou senha incorretos', 'error');
    return false;
  }

  logout() {
    storage.remove(this.SESSION_KEY);
    Toast.show('Você saiu da sua conta', 'info');
    
    setTimeout(() => {
      window.location.href = '../../index.html';
    }, 1000);
  }

  updateUser(nome, senha = null) {
    const usuario = storage.get(this.USUARIO_KEY);
    const sessao = this.getCurrentUser();

    if (!usuario || !sessao) {
      Toast.show('Usuário não encontrado', 'error');
      return false;
    }

    if (nome && nome.trim()) {
      usuario.nome = nome.trim();
      sessao.nome = nome.trim();
    }

    if (senha && senha.trim()) {
      if (senha.length < 6) {
        Toast.show('A senha deve ter no mínimo 6 caracteres', 'error');
        return false;
      }
      usuario.senha = senha;
    }

    if (storage.set(this.USUARIO_KEY, usuario) && storage.set(this.SESSION_KEY, sessao)) {
      Toast.show('Perfil atualizado com sucesso!', 'success');
      return true;
    }

    Toast.show('Erro ao atualizar perfil', 'error');
    return false;
  }

  deleteAccount() {
    storage.remove(this.USUARIO_KEY);
    storage.remove(this.SESSION_KEY);
    Toast.show('Conta excluída com sucesso', 'success');
    
    setTimeout(() => {
      const isInPages = window.location.pathname.includes('/pages/');
      window.location.href = isInPages ? '../../index.html' : 'index.html';
    }, 1500);
  }

  requireAuth() {
    if (!this.isAuthenticated()) {
      Toast.show('Você precisa estar logado', 'warning');
      setTimeout(() => {
        const isInPages = window.location.pathname.includes('/pages/');
        window.location.href = isInPages ? '../../index.html' : 'index.html';
      }, 1000);
      return false;
    }
    return true;
  }

  _validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
}

const auth = new AuthManager();

export default auth;