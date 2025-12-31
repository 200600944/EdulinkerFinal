import { useState, useEffect, useCallback, useRef } from 'react';
import { authService } from '../services/auth.Service';
import { useChat } from './useChat';

export const useLoby = () => {
    // 1. Estados de Autenticação e Loading
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const hasAlerted = useRef(false);
    const API_BASE = import.meta.env.VITE_API_URL;

    // 2. Estados de UI (Criação de Sala e Chat)
    const [isCreating, setIsCreating] = useState(false);
    const [novoNomeSala, setNovoNomeSala] = useState("");
    const [rooms, setrooms] = useState([]);
    const [texto, setTexto] = useState("");
    const messagesEndRef = useRef(null);

    // 3. Dados do Utilizador
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isProfessor = user.role === 'professor';

    // 4. Integração com useChat (Socket e Mensagens)
    const { mensagens, salaAtiva, setSalaAtiva, enviarMensagem, onlineUsers, socket } = useChat();

    // 5. Validação de Acesso
    useEffect(() => {
        authService.initializePage({
            checkFunc: () => authService.isProfessor() || authService.isStudent(),
            hasAlertedRef: hasAlerted,
            setAuthorized,
            setLoading,
        });
    }, [user.id]);

    // 6. Carregar Salas de Aula
    const carregarSalas = useCallback(async () => {
        if (!user.id) return;
        try {
            const response = await fetch(`${API_BASE}/chat/class-rooms`);
            if (response.ok) {
                const data = await response.json();
                setrooms(data);
            }
        } catch (error) {
            console.error("Erro ao carregar salas do aluno:", error);
        }
    }, [user.id, API_BASE]);

    useEffect(() => {
        if (authorized) carregarSalas();
    }, [authorized, carregarSalas]);

    // 7. Scroll Automático no Chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [mensagens]);

    // 8. Handlers (Ações)
    const handleCreateClass = async () => {
        if (!novoNomeSala || novoNomeSala.trim() === "") {
            alert("Por favor, insira um nome para a sala.");
            return;
        }

        const payload = {
            name: novoNomeSala,
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
                await carregarSalas();
                setIsCreating(false);
                setNovoNomeSala(""); // Limpa o input após criar
                setSalaAtiva({ 
                    room_id: novaSala.id, 
                    room_name: novaSala.name, 
                    room_type: novaSala.room_type 
                });
            }
        } catch (error) {
            console.error("Erro:", error);
        }
    };

    const handleSend = (e) => {
        debugger
        if (e) e.preventDefault();
        if (!texto.trim() || !salaAtiva) return;
        enviarMensagem(texto, user.id, user.role, user.nome);
        setTexto("");
    };

    const handleSairDaAula = () => {
        if (salaAtiva && socket) {
            socket.emit('leave_room', { roomId: salaAtiva.room_id, userId: user.id });
        }
        setSalaAtiva(null);
    };

    // 9. Retorno de tudo o que o componente precisa
    return {
        authorized,
        loading,
        user,
        isProfessor,
        rooms,
        isCreating,
        setIsCreating,
        novoNomeSala,
        setNovoNomeSala,
        texto,
        setTexto,
        mensagens,
        salaAtiva,
        setSalaAtiva,
        onlineUsers,
        socket,
        messagesEndRef,
        handleCreateClass,
        handleSend,
        handleSairDaAula,
        carregarSalas
    };
};