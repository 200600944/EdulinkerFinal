import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { chatService } from '../services/chat.service';


const API_URL = import.meta.env.VITE_API_URL;
// Ligação ao servidor de Socket.io
const socket = io(API_URL); 

export function useChat() {
    const [conversas, setConversas] = useState([]);
    const [mensagens, setMensagens] = useState([]);
    const [salaAtiva, setSalaAtiva] = useState(null);

    // 1. Função para carregar/atualizar a lista lateral de conversas
    const atualizarListaConversas = useCallback(async () => {
        try {
            const data = await chatService.getRooms();
            setConversas(data);
        } catch (error) {
            console.error("Erro ao atualizar lista:", error);
        }
    }, []);

    // 2. Efeito Inicial: Carrega a lista e ouve eventos globais
    useEffect(() => {
        atualizarListaConversas();

        // Ouve o evento 'refresh_chat_list' enviado pelo Gateway do NestJS
        socket.on('refresh_chat_list', () => {
            atualizarListaConversas();
        });

        return () => socket.off('refresh_chat_list');
    }, [atualizarListaConversas]);

    // 3. Efeito de Sala: Quando o professor abre uma conversa específica
   useEffect(() => {
    if (!salaAtiva || !socket) return;

    const roomId = String(salaAtiva.room_id);

    // 1. Entra na sala (importante garantir que o ID é string)
    socket.emit('join_room', roomId);

    // 2. Carrega o histórico
    chatService.getChatHistory(roomId)
        .then(data => {
            setMensagens(data);
        })
        .catch(err => console.error("Erro ao carregar histórico:", err));

    // 3. Ouve novas mensagens
    const handleReceiveMessage = (novaMsg) => {
        // Validação extra: Só adiciona se a mensagem for para a sala que tenho aberta
        if (String(novaMsg.room_id) === roomId) {
            setMensagens((prev) => {
                // Evita duplicados (caso o socket envie a mesma msg duas vezes)
                if (prev.find(m => m.id === novaMsg.id)) return prev;
                return [...prev, novaMsg];
            });
        }
    };

    socket.on('receive_message', handleReceiveMessage);

    
    return () => {
        socket.off('receive_message', handleReceiveMessage);
    };
}, [salaAtiva, socket]); 

    // 4. Função para enviar mensagem
    const enviarMensagem = (conteudo, professorId) => {
        debugger
        if (!salaAtiva || !conteudo.trim()) return;

        const payload = {
            room_id: salaAtiva.room_id,
            user_id: professorId,
            content: conteudo,
            user_role: 'professor' // Importante para o Gateway marcar como is_ansured: true
        };

        socket.emit('send_message', payload);
    };

    return {
        conversas,
        mensagens,
        salaAtiva,
        setSalaAtiva,
        enviarMensagem,
        socket
    };
}