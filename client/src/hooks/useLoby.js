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
    const [novoNomeSala, setNovoNomeSala] = useState("");
    const [rooms, setRooms] = useState([]); // Nota: Corrigido o nome do setter para camelCase
    const [texto, setTexto] = useState("");
    const messagesEndRef = useRef(null);

    // Recuperação dos dados da sessão para lógica de permissões baseada no papel (role)
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isProfessor = user.role === 'professor';

    // Desestruturação das funcionalidades de comunicação em tempo real via Socket.io
    const { mensagens, salaAtiva, setSalaAtiva, enviarMensagem, onlineUsers, socket } = useChat();

    // Validação de segurança ao montar o componente para garantir que o utilizador tem permissão de acesso
    useEffect(() => {
        authService.initializePage({
            checkFunc: () => authService.isProfessor() || authService.isStudent(),
            hasAlertedRef: hasAlerted,
            setAuthorized,
            setLoading,
        });
    }, [user.id]);

    // Função para procurar na base de dados apenas as salas que estão com a flag is_active = 1
    const carregarSalas = useCallback(async () => {
        if (!user.id) return;
        try {
            const response = await fetch(`${API_BASE}/chat/class-rooms`);
            if (response.ok) {
                const data = await response.json();
                setRooms(data);
            }
        } catch (error) {
            console.error("Erro ao carregar salas do aluno:", error);
        }
    }, [user.id, API_BASE]);

    // Carregamento inicial das salas assim que a autorização é confirmada
    useEffect(() => {
        if (authorized) carregarSalas();
    }, [authorized, carregarSalas]);

    // Mantém a visualização do chat focada na última mensagem recebida
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [mensagens]);

    // Criação de uma nova sala de aula: regista na BD e entra automaticamente na nova sala criada
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
                await carregarSalas(); // Atualiza a lista geral
                setIsCreating(false);
                setNovoNomeSala(""); 
                // Define a sala ativa para redirecionar o utilizador para dentro da aula criada
                setSalaAtiva({
                    room_id: novaSala.id,
                    room_name: novaSala.name,
                    room_type: novaSala.room_type
                });
            }
        } catch (error) {
            console.error("Erro ao criar sala:", error);
        }
    };

    // Encapsula o envio de mensagens de texto através do gateway de sockets
    const handleSend = (e) => {
        if (e) e.preventDefault();
        if (!texto.trim() || !salaAtiva) return;
        enviarMensagem(texto, user.id, user.role, user.nome);
        setTexto("");
    };

    // Notifica o servidor que o utilizador saiu da sala e limpa o estado local
    const handleSairDaAula = () => {
        if (salaAtiva && socket) {
            socket.emit('leave_room', { roomId: salaAtiva.room_id, userId: user.id });
        }
        setSalaAtiva(null);
    };

    // Executa um Soft Delete no servidor (muda is_active para 0) e atualiza o estado local para esconder a sala
    const handleDeleteRoom = async (roomId) => {
        if (!window.confirm("Desejas mesmo encerrar esta sala de aula?")) return;

        try {
            const response = await fetch(`${API_BASE}/chat/deactivate-room/${roomId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                // Filtra a lista localmente para refletir a alteração sem necessidade de novo fetch
                setRooms(prev => prev.filter(r => r.room_id !== roomId));
            } else {
                alert("Erro ao desativar a sala.");
            }
        } catch (error) {
            console.error("Erro na comunicação com o servidor:", error);
        }
    };

    // Exportação dos estados e funções para serem utilizados no componente Lobby.jsx
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
        handleDeleteRoom,
        carregarSalas
    };
};