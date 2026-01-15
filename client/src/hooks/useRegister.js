import { useState, useCallback } from 'react';
import { registerUser, validateEmail, authService } from '../services/auth.Service';

export function useRegister() {
    // Estados para gestão de perfis (roles), formulário e carregamento
    const [roles, setRoles] = useState([]);
    const [formData, setFormData] = useState({ nome: '', email: '', password: '', role_id: '' });
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const [status, setStatus] = useState({ message: '', type: '' });
    const [submitting, setSubmitting] = useState(false);
    const [users, setUsers] = useState([]);

    // Procura a lista atualizada de utilizadores na base de dados
    const loadUsers = useCallback(async () => {
        try {
            const data = await authService.getUsers();
            setUsers(data);
        } catch (error) {
            console.error("Erro ao carregar lista de utilizadores:", error);
        }
    }, []);

    // Gere a submissão do formulário de registo e validações de negócio
    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setStatus({ message: '', type: '' });

        // Validação: Comprimento mínimo do nome
        if (formData.nome.trim().length < 3) {
            setStatus({ message: 'O nome deve ter pelo menos 3 caracteres.', type: 'error' });
            return;
        }

        // Validação: Verificação de campo de email vazio
        if (!formData.email.trim()) {
            setStatus({ message: 'O campo de e-mail não pode estar vazio.', type: 'error' });
            return;
        }

        // Validação: Formato de email válido (Regex)
        if (!validateEmail(formData.email)) {
            setStatus({ message: 'Introduza um e-mail válido (ex: utilizador@email.com).', type: 'error' });
            return;
        }

        // Validação: Segurança mínima da palavra-passe
        if (formData.password.length < 6) {
            setStatus({ message: 'A password deve ter no mínimo 6 caracteres.', type: 'error' });
            return;
        }

        // Validação: Seleção obrigatória de um cargo
        if (!formData.role_id) {
            setStatus({ message: 'Selecione um perfil de acesso.', type: 'error' });
            return;
        }

        setSubmitting(true);
        try {
            // Chamada ao serviço para persistir o novo utilizador no servidor
            await registerUser(formData);
            
            setStatus({ message: 'Utilizador criado com sucesso!', type: 'success' });
            
            // Limpa o formulário após sucesso
            setFormData({ nome: '', email: '', password: '', role_id: '' });
            
            // Atualiza a lista visual de utilizadores
            await loadUsers();
        } catch (error) {
            setStatus({ message: error.message || 'Erro ao criar utilizador.', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    // Exportação dos estados e funções para o componente Register.jsx
    return {
        roles,
        setRoles,
        formData,
        setFormData,
        loading,
        setLoading,
        authorized,
        setAuthorized,
        status,
        setStatus,
        submitting,
        handleSubmit,
        users,
        loadUsers
    };
}