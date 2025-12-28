import { useState } from 'react';
import { login, validateEmail } from '../services/auth.Service';

export function useLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState({ message: '', type: '' });
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        
        // Validações Manuais
        if (!email.trim()) {
            setStatus({ message: 'O campo de e-mail não pode estar vazio.', type: 'error' });
            return;
        }

        if (!validateEmail(email)) {
           setStatus({ message: 'Por favor, introduza um e-mail num formato válido (ex: utilizador@email.com).', type: 'error' });
            return;
        }

        if (password.length < 6) {
            setStatus({ message: 'A password deve ter pelo menos 6 caracteres.', type: 'error' });
            return;
        }
        //Fim das validações manuais

        setLoading(true);
        setStatus({ message: '', type: '' });

        try {
            const data = await login(email, password);
            setStatus({ message: 'Login efetuado! Redirecionando...', type: 'success' });

            setTimeout(() => {
                window.location.href = '/views/home.html';
            }, 1000);
        } catch (err) {
            setStatus({ message: err.message || 'Erro ao realizar login.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return {
        email, setEmail,
        password, setPassword,
        status, loading,
        handleLogin
    };
}