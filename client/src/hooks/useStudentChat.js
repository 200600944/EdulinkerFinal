import { useState, useEffect, useCallback, useRef } from 'react';
import { authService } from '../services/auth.Service';
import { useChat } from './useChat';

export const useStudentChat = () => {
    // Estados de controlo de acesso e interface do chat de dúvidas
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const [messageText, setMessageText] = useState("");
    const [conversations, setConversations] = useState([]); // Lista local de tickets do aluno
    const hasAlerted = useRef(false);

    // Consome a lógica base de sockets e mensagens do hook genérico useChat
    const { 
        messages, 
        sendMessage, 
        setActiveRoom, 
        activeRoom 
    } = useChat();

    const API_BASE = import.meta.env.VITE_API_URL;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const studentName = user.nome || 'Aluno';

    // Validação de segurança: Garante que apenas utilizadores com perfil 'student' acedem a esta área
    useEffect(() => {
        authService.initializePage({
            checkFunc: authService.isStudent,
            hasAlertedRef: hasAlerted,
            setAuthorized,
            setLoading,
        });
    }, []);

    // Procura as salas de chat (tickets de dúvida) específicas deste aluno no servidor
    const loadConversations = useCallback(async () => {
        if (!user.id) return;
        try {
            // Endpoint que filtra por owner_id e room_type: 'chat'
            const response = await fetch(`${API_BASE}/chat/student-rooms/${user.id}`);
            if (response.ok) {
                const data = await response.json();
                setConversations(data);
            }
        } catch (error) {
            console.error("Erro ao carregar conversas do aluno:", error);
        }
    }, [user.id, API_BASE]);

    // Recarrega a lista de dúvidas sempre que a autorização é confirmada
    useEffect(() => {
        if (authorized) loadConversations();
    }, [authorized, loadConversations]);

    // Cria uma nova sala de dúvida (ticket) na base de dados e entra nela automaticamente
    const startNewDoubt = async () => {
        const payload = {
            name: `Dúvida de ${user.nome}`,
            owner_id: user.id,
            room_type: 'chat'
        };

        try {
            const response = await fetch(`${API_BASE}/chat/create-room`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const newRoom = await response.json();
                // Define a sala recém-criada como ativa para abrir a janela de chat
                setActiveRoom({
                    room_id: newRoom.id,
                    room_name: newRoom.name,
                    aluno_nome: user.nome
                });
                loadConversations(); // Atualiza a lista em segundo plano
            }
        } catch (error) {
            console.error("Erro ao criar ticket de dúvida:", error);
        }
    };

    // Gere o envio de mensagens do aluno através do gateway de sockets
    const handleSend = (e) => {
        if (e) e.preventDefault();
        if (!messageText.trim() || !activeRoom) return;

        // Envia com a role 'aluno' para que o sistema identifique o remetente
        sendMessage(messageText, user.id, 'aluno', studentName);
        setMessageText("");
    };

    // Exportação dos dados e funções para o componente StudentChat.jsx
    return {
        authorized,
        loading,
        conversas: conversations,
        mensagens: messages,
        texto: messageText,
        setTexto: setMessageText,
        salaAtiva: activeRoom,
        setSalaAtiva: setActiveRoom,
        iniciarNovaDuvida: startNewDoubt,
        handleSend,
        user,
        nomeDoAluno: studentName
    };
};