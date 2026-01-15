import { useRef, useEffect } from 'react';
import { useStudentChat } from '../hooks/useStudentChat';

function StudentChat() {
  const {
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
  } = useStudentChat();

  const messagesEndRef = useRef(null);

  // Garante que o chat faz scroll automático para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Ecrã de carregamento
  if (loading) return (
    <div className="p-10 text-center italic text-gray-500 animate-pulse">
      A carregar as tuas dúvidas...
    </div>
  );

  // Bloqueia acesso se não autorizado
  if (!authorized) return null;

  return (
    <div className="w-full h-full bg-white rounded-2xl shadow-xl border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
      <div className="h-full flex flex-col">
        {!activeRoom ? (
          /* --- LISTA DE CONVERSAS: Histórico de dúvidas do aluno --- */
          <div className="p-6 grid gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Botão para criar um novo ticket de dúvida */}
            <button
              onClick={startNewDoubt}
              className="group w-full p-6 bg-white border-2 border-dashed border-blue-300 rounded-2xl flex items-center justify-center gap-3 text-blue-600 font-bold hover:border-blue-500 hover:bg-blue-50 transition-all shadow-sm"
            >
              <span className="text-2xl group-hover:scale-125 transition-transform">+</span>
              Fazer uma nova pergunta ao Professor
            </button>

            {conversations.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-3xl border border-gray-100">
                <p className="text-gray-400 font-medium italic">Ainda não tens conversas ativas.</p>
              </div>
            ) : (
              conversations.map(chat => (
                <div
                  key={chat.room_id}
                  onClick={() => setActiveRoom(chat)}
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md hover:border-blue-200 transition-all flex justify-between items-center group"
                >
                  <div className="flex items-center gap-4">
                    {/* Indicador de status: Verde para respondida, Laranja pulsante para pendente */}
                    <div className={`h-3 w-3 rounded-full ${Number(chat.is_ansured) === 1 ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`}></div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-800 truncate">{chat.room_name || "Suporte Académico"}</p>
                      <p className="text-sm text-gray-500 truncate max-w-xs italic">
                        {chat.last_content ? chat.last_content : "Nova sala criada. Envia a tua dúvida!"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <span className={`text-[10px] uppercase tracking-widest font-extrabold px-3 py-1 rounded-lg ${
                      Number(chat.is_ansured) === 1 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
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
          /* --- JANELA DE CHAT ATIVA: Conversa em tempo real com o professor --- */
          <div className="flex flex-col h-[75vh]">
            <div className="p-5 border-b bg-white flex items-center justify-between rounded-t-2xl">
              <button
                onClick={() => setActiveRoom(null)}
                className="text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded-xl transition-all flex items-center gap-2"
              >
                <span>←</span> Voltar
              </button>
              <div className="text-center">
                <span className="font-extrabold text-gray-800">{activeRoom.room_name || "Conversa"}</span>
                <p className="text-[10px] text-blue-500 font-bold uppercase tracking-tighter animate-pulse">Ligado ao Professor</p>
              </div>
              <div className="w-20"></div>
            </div>

            {/* Listagem Dinâmica de Mensagens */}
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50 space-y-4 flex flex-col">
              {messages.map((msg, i) => {
                const isMe = Number(msg.user_id) === Number(user.id);
                // Determina o nome a exibir na bolha de chat
                const displayName = msg.user?.nome || msg.nome || (isMe ? studentName : "Professor");
                
                return (
                  <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-4 rounded-2xl shadow-sm max-w-[75%] ${
                      isMe 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                    }`}>
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider mb-1 px-2 block ${
                        isMe ? 'text-white' : 'text-gray-500'
                      }`}>
                        {displayName}
                      </span>
                      <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                      <span className={`text-[9px] mt-2 block ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                        {msg.created_at 
                          ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                          : 'A enviar...'}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input para envio de novas mensagens/dúvidas */}
            <form onSubmit={handleSend} className="p-6 border-t bg-white flex gap-3 rounded-b-2xl">
              <input
                className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-700 font-medium"
                placeholder="Escreve a tua dúvida detalhadamente..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                autoFocus
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 shadow-lg hover:shadow-blue-300 transition-all active:scale-95 disabled:opacity-50"
                disabled={!messageText.trim()}
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