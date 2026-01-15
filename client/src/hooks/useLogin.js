import { useState } from 'react';
import { login, validateEmail } from '../services/auth.Service';

export function useLogin() {
    // Estados para controlo de input, feedback de status e carregamento
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState({ message: '', type: '' });
    const [loading, setLoading] = useState(false);

    // Gere o processo de submissão do formulário e validação de credenciais
    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        
        // Validação: Verifica se o campo de e-mail está preenchido
        if (!email.trim()) {
            setStatus({ message: 'O campo de e-mail não pode estar vazio.', type: 'error' });
            return;
        }

        // Validação: Verifica se o formato do e-mail é aceite (Regex)
        if (!validateEmail(email)) {
            setStatus({ message: 'Introduza um e-mail válido (ex: utilizador@email.com).', type: 'error' });
            return;
        }

        // Validação: Comprimento mínimo da palavra-passe para segurança básica
        if (password.length < 6) {
            setStatus({ message: 'A password deve ter pelo menos 6 caracteres.', type: 'error' });
            return;
        }

        setLoading(true);
        setStatus({ message: '', type: '' });

        try {
            // Chamada ao serviço de autenticação para validar dados no servidor
            const data = await login(email, password);
            setStatus({ message: 'Login efetuado! A redirecionar...', type: 'success' });

            // Pequeno atraso para o utilizador ver a mensagem de sucesso antes de mudar de página
            setTimeout(() => {
                window.location.href = '/views/home.html';
            }, 1000);
        } catch (err) {
            // Captura erros de credenciais erradas ou falhas de servidor
            setStatus({ message: err.message || 'Erro ao realizar login.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Exportação dos estados e da função de submissão para o componente Login.jsx
    return {
        email, 
        setEmail,
        password, 
        setPassword,
        status, 
        loading,
        handleLogin
    };
}