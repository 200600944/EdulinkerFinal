import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { chatService } from '../services/chat.service';

const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL);

export function useChat() {
    // Estados para gestão de conversas, mensagens e presenças em tempo real
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activeRoom, setActiveRoom] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);

    // Recupera os dados do utilizador do armazenamento local para identificação no Socket
    const loggedUser = JSON.parse(localStorage.getItem('user') || '{}');

    // Função para procurar a lista de salas disponíveis via API
    const updateConversationList = useCallback(async () => {
        try {
            const data = await chatService.getRooms();
            setConversations(data);
        } catch (error) {
            console.error("Erro ao atualizar lista de conversas:", error);
        }
    }, []);

    // Efeito para carregar as salas inicialmente e ouvir atualizações globais
    useEffect(() => {
        updateConversationList();
        
        // Ouve eventos do servidor que solicitam a atualização da lista (ex: nova sala criada)
        socket.on('refresh_chat_list', () => {
            updateConversationList();
        });

        return () => socket.off('refresh_chat_list');
    }, [updateConversationList]);

    // Efeito principal para gestão da sala ativa (Join/Leave e histórico)
    useEffect(() => {
        if (!activeRoom || !socket) {
            setOnlineUsers([]);
            return;
        }

        const roomId = String(activeRoom.room_id);

        // Notifica o servidor da entrada na sala para começar a receber eventos específicos
        socket.emit('join_room', {
            roomId: roomId,
            user: {
                id: loggedUser.id,
                nome: loggedUser.nome,
                role: loggedUser.role
            }
        });

        // Sincroniza a lista de utilizadores que estão atualmente na mesma sala
        socket.on('update_user_list', (users) => {
            setOnlineUsers(users);
        });

        // Procura o histórico de mensagens da base de dados ao entrar na sala
        chatService.getChatHistory(roomId)
            .then(data => setMessages(data))
            .catch(err => console.error("Erro ao carregar histórico de mensagens:", err));

        // Processa a chegada de novas mensagens via WebSocket
        const handleReceiveMessage = (newMessage) => {
            if (String(newMessage.room_id) === roomId) {
                setMessages((prev) => {
                    // Evita duplicados caso a mensagem já exista no estado local
                    if (prev.find(m => m.id === newMessage.id)) return prev;

                    // Normaliza o objeto da mensagem para garantir compatibilidade com o GlobalChat
                    const messageToRender = {
                        ...newMessage,
                        user: newMessage.user || {
                            nome: newMessage.nome,
                            role: newMessage.role || "student"
                        }
                    };

                    return [...prev, messageToRender];
                });
            }
        };

        socket.on('receive_message', handleReceiveMessage);

        // Limpeza ao sair da sala ou desmontar o componente
        return () => {
            socket.off('receive_message');
            socket.off('update_user_list');
            if (activeRoom) {
                socket.emit('leave_room', { 
                    roomId: activeRoom.room_id, 
                    userId: loggedUser.id 
                });
            }
        };
    }, [activeRoom]);

    // Função para emitir uma nova mensagem para o servidor via Socket
    const sendMessage = (content, userId, role, userName) => {
        if (!activeRoom || !content.trim()) return;

        const payload = {
            room_id: activeRoom.room_id,
            user_id: userId,
            nome: userName,
            content: content,
            user_role: role
        };

        socket.emit('send_message', payload);
    };

    return {
        conversations,
        messages,
        activeRoom,
        setActiveRoom,
        sendMessage,
        onlineUsers,
        socket,
        loadRooms: updateConversationList
    };
}