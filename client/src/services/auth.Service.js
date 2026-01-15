const BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${BASE_URL}/auth`;

// Valida se o formato do email é aceite através de uma expressão regular
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Realiza o login do utilizador e gere o armazenamento da sessão no localStorage
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Lança erro com a mensagem específica vinda do NestJS
      throw new Error(data.message || 'Erro ao realizar login');
    } else {
      // Limpa dados antigos e guarda o novo objeto de utilizador para persistir a sessão
      localStorage.clear();
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Regista um novo utilizador na base de dados (Ação restrita ao Admin no fluxo da app)
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erro ao gravar utilizador');
    return data;
  } catch (error) {
    throw error;
  }
};

export const authService = {
  // Recupera o objeto do utilizador logado do armazenamento local
  getUser() {
    return JSON.parse(localStorage.getItem('user') || '{}');
  },

  // Verificadores de permissões (Roles) baseados no objeto de sessão
  isAdmin() { return this.getUser().role === 'admin'; },
  isProfessor() { return this.getUser().role === 'professor'; },
  isStudent() { return this.getUser().role === 'aluno'; },

  // Inicializa a página: valida permissões, gere alertas de acesso e carrega dados iniciais (roles)
  async initializePage({ 
    checkFunc,      
    hasAlertedRef,  
    setAuthorized, 
    setRoles, 
    setStatus, 
    setLoading 
  }) {
    // Valida se o utilizador tem permissão para estar na página atual
    if (!checkFunc.call(this) && !hasAlertedRef.current) {
      hasAlertedRef.current = true;
      alert("Acesso negado! Não tens permissão para aceder a esta página.");
      window.location.href = '/views/index.html';
      return;
    }

    if (setAuthorized) setAuthorized(true);

    try {
      // Carrega a lista de perfis disponíveis se o componente necessitar (ex: no Registo)
      if (setRoles) {
        const response = await fetch(`${API_URL}/roles`);
        if (!response.ok) throw new Error('Erro ao carregar perfis');
        const data = await response.json();
        setRoles(data);
      }
    } catch (error) {
      if (setStatus) setStatus({ message: 'Erro ao carregar metadados.', type: 'error' });
    } finally {
      if (setLoading) setLoading(false);
    }
  },

  // Obtém a lista completa de utilizadores (Vista de Gestão)
  async getUsers() {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) throw new Error('Erro ao listar utilizadores');
    return response.json();
  }
};

// Exportações individuais para uso rápido em componentes e hooks
export const isAdmin = () => authService.isAdmin();
export const isProfessor = () => authService.isProfessor();
export const isStudent = () => authService.isStudent();