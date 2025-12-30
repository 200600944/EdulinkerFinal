import { useState, useEffect, useRef } from 'react';
import { authService } from '../services/auth.Service';
import { useChat } from './useChat';

export const useProfessorChat = () => {
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const hasAlerted = useRef(false);
    const [texto, setTexto] = useState("");

    // Consumimos o motor do socket e conversas
    const { conversas, mensagens, salaAtiva, setSalaAtiva, enviarMensagem } = useChat();

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const nomeDoProfessor = user.nome || 'Professor';

    // 1. Validação de acesso exclusiva para Professor
    useEffect(() => {
        authService.initializePage({
            checkFunc: authService.isProfessor,
            hasAlertedRef: hasAlerted,
            setAuthorized,
            setLoading,
        });
    }, []);

    // 2. Lógica de envio com a role 'professor'
    const handleSend = (e) => {
        if (e) e.preventDefault();
        if (!texto.trim() || !salaAtiva) return;

        // O papel 'professor' no backend garante que a dúvida é marcada como respondida
        enviarMensagem(texto, user.id, 'professor');
        setTexto("");
    };

    return {
        authorized,
        loading,
        conversas,
        mensagens,
        salaAtiva,
        setSalaAtiva,
        texto,
        setTexto,
        handleSend,
        user,
        nomeDoProfessor
    };
};