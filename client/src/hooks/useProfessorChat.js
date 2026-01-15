import { useState, useEffect, useRef } from 'react';
import { authService } from '../services/auth.Service';
import { useChat } from './useChat';

export const useProfessorChat = () => {
    // Estados para controlo de autorização e carregamento da página
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const hasAlerted = useRef(false);
    const [messageText, setMessageText] = useState("");

    // Consome a lógica base de sockets e mensagens do useChat
    const { 
        conversations, 
        messages, 
        activeRoom, 
        setActiveRoom, 
        sendMessage 
    } = useChat();

    // Recupera os dados do professor do armazenamento local
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const professorName = user.nome || 'Professor';

    // Validação de segurança: Garante que apenas utilizadores com perfil 'professor' acedem
    useEffect(() => {
        authService.initializePage({
            checkFunc: authService.isProfessor,
            hasAlertedRef: hasAlerted,
            setAuthorized,
            setLoading,
        });
    }, []);

    // Lógica de envio de mensagens com a role específica para marcar dúvidas como respondidas
    const handleSend = (e) => {
        if (e) e.preventDefault();
        if (!messageText.trim() || !activeRoom) return;
        
        // Enviamos o cargo 'professor' para que o backend atualize o status da dúvida
        sendMessage(messageText, user.id, 'professor', professorName);
        setMessageText("");
    };

    // Exportação dos dados uniformizados para o componente ProfessorChat.jsx
    return {
        authorized,
        loading,
        conversas: conversations,
        mensagens: messages,
        salaAtiva: activeRoom,
        setSalaAtiva: setActiveRoom,
        texto: messageText,
        setTexto: setMessageText,
        handleSend,
        user,
        nomeDoProfessor: professorName
    };
};