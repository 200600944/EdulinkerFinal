import { useState, useEffect, useCallback, useRef } from 'react';
import { authService } from '../services/auth.Service';
import { useChat } from './useChat';

export const useStudentChat = () => {
  // Estados de controlo e interface
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [texto, setTexto] = useState("");
  const [conversas, setConversas] = useState([]); // Lista local para salas do aluno
  const hasAlerted = useRef(false);

  // Consumimos o useChat original (Socket + Mensagens)
  const { mensagens, enviarMensagem, setSalaAtiva, salaAtiva } = useChat();

  const API_BASE = import.meta.env.VITE_API_URL;
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const nomeDoAluno = user.nome || 'Aluno';

  // 1. Validação de acesso
  useEffect(() => {
    authService.initializePage({
      checkFunc: authService.isStudent,
      hasAlertedRef: hasAlerted,
      setAuthorized,
      setLoading,
    });
  }, []);

  // 2. Carregar as salas específicas deste aluno (Diferente do Professor)
  const carregarSalas = useCallback(async () => {
    if (!user.id) return;
    try {
      // Endpoint específico do aluno que já deve filtrar por room_type: 'chat' no backend
      const response = await fetch(`${API_BASE}/chat/student-rooms/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setConversas(data);
      }
    } catch (error) {
      console.error("Erro ao carregar salas do aluno:", error);
    }
  }, [user.id, API_BASE]);

  useEffect(() => {
    if (authorized) carregarSalas();
  }, [authorized, carregarSalas]);

  // 3. Criar nova sala (Dúvida)
  const iniciarNovaDuvida = async () => {
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
        const novaSala = await response.json();
        setSalaAtiva({
          room_id: novaSala.id,
          room_name: novaSala.name,
          aluno_nome: user.nome
        });
        carregarSalas(); // Atualiza a lista para mostrar a nova sala
      }
    } catch (error) {
      console.error("Erro ao criar sala na BD:", error);
    }
  };

  // 4. Lógica de Envio
  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!texto.trim() || !salaAtiva) return;

    enviarMensagem(texto, user.id, 'aluno',nomeDoAluno);
    setTexto("");
  };

  return {
    authorized,
    loading,
    conversas,
    mensagens,
    texto,
    setTexto,
    salaAtiva,
    setSalaAtiva,
    iniciarNovaDuvida,
    handleSend,
    user,
    nomeDoAluno
  };
};