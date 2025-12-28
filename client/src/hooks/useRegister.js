import { useState, useEffect, useRef } from 'react';
import { registerUser, validateEmail } from '../services/auth.Service';

export function useRegister() {
    const [roles, setRoles] = useState([]);
    const [formData, setFormData] = useState({ nome: '', email: '', password: '', role_id: '' });
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const [status, setStatus] = useState({ message: '', type: '' });
    const [submitting, setSubmitting] = useState(false);
    const hasAlerted = useRef(false);

    // useEffect(() => {
    //     const initializePage = async () => {
    //         if (!isAdmin() && !hasAlerted.current) {
    //             hasAlerted.current = true;
    //             alert("Acesso negado! Apenas administradores podem aceder a esta página.");
    //             window.location.href = '/views/index.html';
    //             return;
    //         }
    //         setAuthorized(true);
    //         try {
    //             const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/roles`);
    //             if (!response.ok) throw new Error('Erro ao carregar perfis');
    //             const data = await response.json();
    //             setRoles(data);
    //         } catch (error) {
    //             setStatus({ message: 'Erro ao carregar cargos.', type: 'error' });
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //     initializePage();
    // }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ message: '', type: '' });

        // Validações Manuais
        if (formData.nome.trim().length < 3) {
            setStatus({ message: 'O nome deve ter pelo menos 3 caracteres.', type: 'error' });
            return;
        }
        if (!formData.email.trim()) {
            setStatus({ message: 'O campo de e-mail não pode estar vazio.', type: 'error' });
            return;
        }

        if (!validateEmail(formData.email)) {
            setStatus({ message: 'Por favor, introduza um e-mail num formato válido (ex: utilizador@email.com).', type: 'error' });
            return;
        }
        if (formData.password.length < 6) {
            setStatus({ message: 'A password deve ter no mínimo 6 caracteres.', type: 'error' });
            return;
        }
        if (!formData.role_id) {
            setStatus({ message: 'Selecione um perfil.', type: 'error' });
            return;
        }
        //Fim das validações manuais

        setSubmitting(true);
        try {
            await registerUser(formData);
            setStatus({ message: 'Utilizador criado com sucesso!', type: 'success' });
            setFormData({ nome: '', email: '', password: '', role_id: '' });
        } catch (error) {
            setStatus({ message: error.message || 'Erro na criação.', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    // Retornamos tudo o que o componente vai precisar
    return {
        roles,
        formData,
        setFormData,
        loading,
        authorized,
        status,
        submitting,
        handleSubmit,
        setRoles,
        setLoading,
        setAuthorized,
        setStatus
    };
}