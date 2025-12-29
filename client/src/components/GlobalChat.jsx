import { useState, useEffect, useCallback, useRef } from 'react';
import { useChat } from '../hooks/useChat';
import { authService } from '../services/auth.Service';

function GlobalChat() {
  // 1. Estados de Controlo e Auth
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const hasAlerted = useRef(false);
  const messagesEndRef = useRef(null);
  const [texto, setTexto] = useState("");

  // 2. Hook de Socket (Garante que mensagens e enviarMensagem vêm daqui)
  const { mensagens, enviarMensagem, setSalaAtiva, salaAtiva } = useChat();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const nomeUsuario = user.nome || 'Utilizador';

  // 3. Validação de Acesso (Segurança)
  useEffect(() => {
    authService.initializePage({
      checkFunc: () => !!user.id, // Verifica se está logado
      hasAlertedRef: hasAlerted,
      setAuthorized,
      setLoading,
    });
  }, [user.id]);

  // 4. ATIVAÇÃO AUTOMÁTICA DA SALA
  const iniciarNovaDuvida = async () => {
    const payload = {
      name: `Dúvida de ${user.nome}`,
      owner_id: user.id
    };

    try {
      const response = await fetch(`${API_BASE}/chat/create-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const novaSala = await response.json();

        // Ativamos a sala com o ID real gerado pelo MySQL (novaSala.id)
        setSalaAtiva({
          room_id: novaSala.id,
          room_name: novaSala.name,
        });

    }
    } catch (error) {
      console.error("Erro ao criar sala na BD:", error);
    }
  };


  useEffect(() => {
    if (authorized) {
      iniciarNovaDuvida();
    }
  }, [authorized]);

  // 5. Scroll Automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  // 6. Envio de Mensagem
  const handleSend = (e) => {
    e.preventDefault();
    if (!texto.trim() || !salaAtiva) return;

    // Envia via socket (ajusta o cargo conforme o user logado)
    enviarMensagem(texto, user.id, user.cargo || 'estudante');
    setTexto("");
  };

  if (loading) return <div className="p-5 text-gray-500 italic">A carregar chat...</div>;
  if (!authorized) return <div className="p-5 text-red-500">Não autorizado.</div>;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* CABEÇALHO DO CHAT */}
      <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
        <div>
          <span className="font-extrabold text-gray-800 text-sm uppercase tracking-wider">Chat Global</span>
          <p className="text-[10px] text-green-500 font-bold uppercase animate-pulse">Online na Turma</p>
        </div>
      </div>

      {/* ÁREA DE MENSAGENS (Histórico) */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4 flex flex-col">
        {mensagens.map((msg, i) => {
          const isMe = Number(msg.user_id) === Number(user.id);
          return (
            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-2xl shadow-sm max-w-[85%] ${
                isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
              }`}>
                {/* Quem escreveu */}
                <span className={`text-[9px] font-extrabold uppercase tracking-wider mb-1 block ${
                  isMe ? 'text-blue-100 text-right' : 'text-gray-500'
                }`}>
                  {isMe ? 'Eu' : (msg.user?.nome || 'Colega')}
                </span>
                
                <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                
                {/* Hora */}
                <span className={`text-[8px] mt-1 block ${isMe ? 'text-blue-200 text-right' : 'text-gray-400'}`}>
                  {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* FORMULÁRIO DE ENVIO */}
      <form onSubmit={handleSend} className="p-4 border-t bg-white flex gap-2">
        <input
          className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
          placeholder="Diz algo à turma..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <button
          type="submit"
          disabled={!texto.trim()}
          className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 text-sm"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}

export default GlobalChat;