import { useState, useEffect, useCallback, useRef } from 'react';
import { useChat } from '../hooks/useChat';
import { authService } from '../services/auth.Service';

function StudentChat() {
  // Estados para controlo de acesso (semelhante ao register)
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const hasAlerted = useRef(false);

  // Hook customizado para lógica de Socket.io
  const { mensagens, enviarMensagem, setSalaAtiva, salaAtiva } = useChat();
  const [conversas, setConversas] = useState([]);
  const [texto, setTexto] = useState("");

  // Referência para o scroll automático
  const messagesEndRef = useRef(null);

  const API_BASE = import.meta.env.VITE_API_URL;
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const userLogado = JSON.parse(localStorage.getItem('user') || '{}');
  const nomeDoAluno = userLogado.nome || 'Aluno';

  //Validação de acesso a pagina
  useEffect(() => {
    authService.initializePage({
      checkFunc: authService.isAluno,
      hasAlertedRef: hasAlerted,
      setAuthorized,
      setLoading,
    });
  }, []);

  //Carrega as salas 
  const carregarSalas = useCallback(async () => {
    if (!user.id) return;
    try {
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
    carregarSalas();
  }, [carregarSalas]);

  //Scroll automático sempre que o array de mensagens mudar
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  //Criar uma nova sala fisicamente na BD
  const iniciarNovaDuvida = async () => {
    const payload = {
      name: `Dúvida de ${user.nome}`,
      owner_id: user.id,
      room_type:'chat'
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
          aluno_nome: user.nome
        });

        // Recarrega a lista lateral para a nova sala aparecer
        carregarSalas();
      }
    } catch (error) {
      console.error("Erro ao criar sala na BD:", error);
    }
  };

  // Envio de mensagem via Socket
  const handleSend = (e) => {
    e.preventDefault();
    if (!texto.trim() || !salaAtiva) return;

    // Passamos 'aluno' para o Gateway saber que is_ansured deve ser false
    enviarMensagem(texto, user.id, 'aluno');
    setTexto("");
  };

  return (
    <div className="w-full h-full bg-white rounded-2xl shadow-xl border-2 border-dashed border-gray-200  hover:border-blue-300 transition-colors">
      <div className="">
        {!salaAtiva ? (
          /* LISTA DE CONVERSAS */
          <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={iniciarNovaDuvida}
              className="group w-full p-6 bg-white border-2 border-dashed border-blue-300 rounded-2xl flex items-center justify-center gap-3 text-blue-600 font-bold hover:border-blue-500 hover:bg-blue-50 transition-all shadow-sm"
            >
              <span className="text-2xl group-hover:scale-125 transition-transform">+</span>
              Fazer uma nova pergunta ao Professor
            </button>

            {conversas.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-gray-400 font-medium italic">Ainda não tens conversas ativas.</p>
              </div>
            ) : (
              conversas.map(chat => (
                <div
                  key={chat.room_id}
                  onClick={() => setSalaAtiva(chat)}
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md hover:border-blue-200 transition-all flex justify-between items-center group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-3 w-3 rounded-full ${Number(chat.is_ansured) === 1 ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`}></div>
                    <div>
                      <p className="font-bold text-gray-800">{chat.room_name || "Suporte Académico"}</p>
                      <p className="text-sm text-gray-500 truncate max-w-xs italic">
                        {chat.last_content ? chat.last_content : "Nova sala criada. Envia a tua dúvida!"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-[10px] uppercase tracking-widest font-extrabold px-3 py-1 rounded-lg ${Number(chat.is_ansured) === 1 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                      {Number(chat.is_ansured) === 1 ? 'Respondida' : 'Pendente'}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-2 font-bold">
                      {chat.room_created_at ? new Date(chat.room_created_at).toLocaleDateString() : 'Hoje'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* JANELA DE CHAT ATIVA */
          <div className="">
            <div className="p-5 border-b bg-white flex items-center justify-between">
              <button
                onClick={() => setSalaAtiva(null)}
                className="text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded-xl transition-all flex items-center gap-2"
              >
                <span>←</span> Voltar
              </button>
              <div className="text-center">
                <span className="font-extrabold text-gray-800">{salaAtiva.room_name || "Conversa"}</span>
                <p className="text-[10px] text-blue-500 font-bold uppercase tracking-tighter animate-pulse">Ligado ao Professor</p>
              </div>
              <div className="w-20"></div>
            </div>

            {/* ÁREA DE MENSAGENS */}
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50 space-y-4 flex flex-col">
              {mensagens.map((msg, i) => {
                const isMe = Number(msg.user_id) === Number(user.id);
                return (
                  <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-4 rounded-2xl shadow-sm max-w-[75%] ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                      }`}>
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider mb-1 px-2 ${isMe ? 'text-white' : 'text-gray-500'
                        }`}>
                        {/* Se isMe for true, mostra o nome do Professor. Se false, mostra o do Aluno */}
                        {isMe ? nomeDoAluno : (msg.user?.nome || 'Professor')}
                      </span>
                      <p className="text-sm font-medium">{msg.content}</p>
                      <span className={`text-[9px] mt-2 block ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                        {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'A enviar...'}
                      </span>
                    </div>
                  </div>
                );
              })}
              {/* Âncora para o scroll automático */}
              <div ref={messagesEndRef} />
            </div>

            {/* FORMULÁRIO DE ENVIO */}
            <form onSubmit={handleSend} className="p-6 border-t bg-white flex gap-3">
              <input
                className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-700 font-medium"
                placeholder="Escreve a tua dúvida aqui..."
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                autoFocus
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 shadow-lg hover:shadow-blue-300 transition-all active:scale-95 disabled:opacity-50"
                disabled={!texto.trim()}
              >
                Enviar
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentChat;