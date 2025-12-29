import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { chatService } from '../services/chat.service';

const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL); 

export function useChat() {
    const [conversas, setConversas] = useState([]);
    const [mensagens, setMensagens] = useState([]);
    const [salaAtiva, setSalaAtiva] = useState(null);
    // NOVO: Estado para utilizadores online na sala
    const [onlineUsers, setOnlineUsers] = useState([]);

    const userLogado = JSON.parse(localStorage.getItem('user') || '{}');

    const atualizarListaConversas = useCallback(async () => {
        try {
            const data = await chatService.getRooms();
            setConversas(data);
        } catch (error) {
            console.error("Erro ao atualizar lista:", error);
        }
    }, []);

    useEffect(() => {
        atualizarListaConversas();
        socket.on('refresh_chat_list', () => {
            atualizarListaConversas();
        });

        return () => socket.off('refresh_chat_list');
    }, [atualizarListaConversas]);

    useEffect(() => {
        if (!salaAtiva || !socket) {
            setOnlineUsers([]); 
            return;
        }

        const roomId = String(salaAtiva.room_id);

        // NOVO: Agora enviamos um objeto com o ID da sala e os dados do utilizador
        socket.emit('join_room', { 
            roomId: roomId, 
            user: { 
                id: userLogado.id, 
                nome: userLogado.nome,
                role: userLogado.role 
            } 
        });

        // Ouve a lista atualizada de utilizadores enviada pelo Gateway
        socket.on('update_user_list', (users) => {
            setOnlineUsers(users);
        });

        chatService.getChatHistory(roomId)
            .then(data => setMensagens(data))
            .catch(err => console.error("Erro ao carregar histórico:", err));

        const handleReceiveMessage = (novaMsg) => {
            if (String(novaMsg.room_id) === roomId) {
                setMensagens((prev) => {
                    if (prev.find(m => m.id === novaMsg.id)) return prev;
                    return [...prev, novaMsg];
                });
            }
        };

        socket.on('receive_message', handleReceiveMessage);

        return () => {
            socket.off('receive_message');
            socket.off('update_user_list');
            if (salaAtiva) {
                socket.emit('leave_room', { roomId: salaAtiva.room_id, userId: userLogado.id });
            }
        };
    }, [salaAtiva]); 

    const enviarMensagem = (conteudo, userId, role) => {
        if (!salaAtiva || !conteudo.trim()) return;

        const payload = {
            room_id: salaAtiva.room_id,
            user_id: userId,
            content: conteudo,
            user_role: role 
        };

        socket.emit('send_message', payload);
    };

    return {
        conversas,
        mensagens,
        salaAtiva,
        setSalaAtiva,
        enviarMensagem,
        onlineUsers, 
        socket,
        carregarSalas: atualizarListaConversas 
    };
}