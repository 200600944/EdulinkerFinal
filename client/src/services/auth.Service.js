const BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${BASE_URL}/auth`;

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Lança um erro com a mensagem vinda do backend
      throw new Error(data.message || 'Erro ao realizar login');
    }
    else {
      //Aqui adiciono o user a local storage para depois garantir no acesso as outras paginas que o user esta logado
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data; // Retorna os dados de sucesso (user, message, etc.)
  } catch (error) {
    // Re-lança o erro para ser capturado pelo componente
    throw error;
  }
};

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
    // Helpers para ler o role
    getUser() {
        return JSON.parse(localStorage.getItem('user') || '{}');
    },
    isAdmin() { return this.getUser().role === 'admin'; },
    isProfessor() { return this.getUser().role === 'professor'; },
    isAluno() { return this.getUser().role === 'aluno'; },

    // A FUNÇÃO GENÉRICA
    async initializePage({ 
        checkFunc,      
        hasAlertedRef,  
        setAuthorized, 
        setRoles, 
        setStatus, 
        setLoading 
    }) {
        // Verifica a permissão usando a função passada (passamos o contexto 'this')
        if (!checkFunc.call(this) && !hasAlertedRef.current) {
            hasAlertedRef.current = true;
            alert("Acesso negado! Não tens permissão para aceder a esta página.");
            window.location.href = '/views/index.html';
            return;
        }

        if (setAuthorized) setAuthorized(true);

        try {
            // Só faz o fetch de roles se a função setRoles tiver sido passada
            if (setRoles) {
                const response = await fetch(`${API_URL}/roles`);
                if (!response.ok) throw new Error('Erro ao carregar perfis');
                const data = await response.json();
                setRoles(data);
            }
        } catch (error) {
            if (setStatus) setStatus({ message: 'Erro ao carregar dados.', type: 'error' });
        } finally {
            if (setLoading) setLoading(false);
        }
    },

    async getUsers() {
        const response = await fetch(`${API_URL}/users`, { // Ajusta a rota conforme o teu NestJS
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) throw new Error('Erro ao listar utilizadores');
        return response.json();
    }
};

// Função para verificar se é Admin (Segurança no Frontend)
export const isAdmin = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user && user.role === 'admin';
};

export const isProfessor = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user && user.role === 'professor';
};

export const isStudent = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user && user.role === 'aluno';
};


