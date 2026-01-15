import { useState, useEffect, useCallback, useRef } from 'react';
import { authService } from '../services/auth.Service';
import { useChat } from './useChat';

export const useLoby = () => {
    // Gestão de estados de acesso e carregamento inicial da página
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const hasAlerted = useRef(false);
    const API_BASE = import.meta.env.VITE_API_URL;

    // Controlo da interface para criação de novas salas e listagem local
    const [isCreating, setIsCreating] = useState(false);
    const [newRoomName, setNewRoomName] = useState("");
    const [rooms, setRooms] = useState([]);
    const [messageText, setMessageText] = useState("");
    const messagesEndRef = useRef(null);

    // Recuperação dos dados da sessão para lógica de permissões baseada no papel (role)
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isProfessorUser = user.role === 'professor';

    // Desestruturação das funcionalidades de comunicação em tempo real vindas do useChat
    const { 
        messages, 
        activeRoom, 
        setActiveRoom, 
        sendMessage, 
        onlineUsers, 
        socket 
    } = useChat();

    // Validação de segurança para garantir que o utilizador tem permissão de acesso ao lobby
    useEffect(() => {
        authService.initializePage({
            checkFunc: () => authService.isProfessor() || authService.isStudent(),
            hasAlertedRef: hasAlerted,
            setAuthorized,
            setLoading,
        });
    }, [user.id]);

    // Procura na base de dados as salas de aula que estão ativas (is_active = 1)
    const loadRooms = useCallback(async () => {
        if (!user.id) return;
        try {
            const response = await fetch(`${API_BASE}/chat/class-rooms`);
            if (response.ok) {
                const data = await response.json();
                setRooms(data);
            }
        } catch (error) {
            console.error("Erro ao carregar salas:", error);
        }
    }, [user.id, API_BASE]);

    // Carregamento inicial das salas após a confirmação da autorização
    useEffect(() => {
        if (authorized) loadRooms();
    }, [authorized, loadRooms]);

    // Mantém o scroll do chat focado na mensagem mais recente
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Regista uma nova sala na base de dados e entra automaticamente nela
    const handleCreateClass = async () => {
        if (!newRoomName || newRoomName.trim() === "") {
            alert("Por favor, insira um nome para a sala.");
            return;
        }

        const payload = {
            name: newRoomName,
            owner_id: user.id,
            room_type: 'class'
        };

        try {
            const response = await fetch(`${API_BASE}/chat/create-room`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                const novaSala = await response.json();
                await loadRooms(); // Atualiza a lista local
                setIsCreating(false);
                setNewRoomName(""); 
                
                // Define a sala ativa para redirecionar o utilizador para a aula criada
                setActiveRoom({
                    room_id: novaSala.id,
                    room_name: novaSala.name,
                    room_type: novaSala.room_type
                });
            }
        } catch (error) {
            console.error("Erro ao criar sala:", error);
        }
    };

    // Encapsula o envio de mensagens de texto através do WebSocket
    const handleSend = (e) => {
        if (e) e.preventDefault();
        if (!messageText.trim() || !activeRoom) return;
        sendMessage(messageText, user.id, user.role, user.nome);
        setMessageText("");
    };

    // Notifica o servidor da saída da sala e limpa o estado da sala ativa
    const handleLeaveRoom = () => {
        if (activeRoom && socket) {
            socket.emit('leave_room', { roomId: activeRoom.room_id, userId: user.id });
        }
        setActiveRoom(null);
    };

    // Executa a desativação lógica (Soft Delete) de uma sala no servidor
    const handleDeleteRoom = async (roomId) => {
        if (!window.confirm("Desejas mesmo encerrar esta sala de aula?")) return;

        try {
            const response = await fetch(`${API_BASE}/chat/deactivate-room/${roomId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                // Remove a sala da lista local para atualização imediata da UI
                setRooms(prev => prev.filter(r => r.room_id !== roomId));
            } else {
                alert("Erro ao desativar a sala.");
            }
        } catch (error) {
            console.error("Erro ao comunicar com o servidor:", error);
        }
    };

    // Exportação dos estados e funções para o componente Lobby.jsx
    return {
        authorized,
        loading,
        user,
        isProfessor: isProfessorUser,
        rooms,
        isCreating,
        setIsCreating,
        novoNomeSala: newRoomName,
        setNovoNomeSala: setNewRoomName,
        texto: messageText,
        setTexto: setMessageText,
        mensagens: messages,
        salaAtiva: activeRoom,
        setSalaAtiva: setActiveRoom,
        onlineUsers,
        socket,
        messagesEndRef,
        handleCreateClass,
        handleSend,
        handleSairDaAula: handleLeaveRoom,
        handleDeleteRoom,
        carregarSalas: loadRooms
    };
};