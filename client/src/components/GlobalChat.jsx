import React from 'react';

function GlobalChat({ messages, user, text, setText, handleSend, messagesEndRef }) {
  return (
    <div className="flex-1 flex flex-col bg-gray-50 max-w-[400px] border-l">
      
      {/* CABEÇALHO DO CHAT */}
      <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
        <div>
          <span className="font-extrabold text-gray-800 text-sm uppercase tracking-wider">Chat Global</span>
          <p className="text-[10px] text-green-500 font-bold uppercase animate-pulse">Online na Turma</p>
        </div>
      </div>

      {/* ÁREA DE MENSAGENS: Lista as mensagens enviadas e recebidas */}
      <div className="flex-1 p-6 overflow-y-auto bg-gray-50 space-y-4 flex flex-col">
        {messages.map((msg, i) => {
          // Verifica se a mensagem foi enviada pelo utilizador atual
          const isMe = Number(msg.user_id) === Number(user.id);
          
          // Define o nome a exibir (prioriza dados do objeto user da mensagem)
          const displayName = msg.user?.nome || msg.nome || (isMe ? user.nome : "Utilizador");

          return (
            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-4 rounded-2xl shadow-sm max-w-[75%] ${
                isMe 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
              }`}>
                {/* Nome do remetente */}
                <span className={`text-[10px] font-extrabold uppercase tracking-wider mb-1 px-2 block ${
                  isMe ? 'text-white' : 'text-gray-500'
                }`}>
                  {displayName}
                </span>

                {/* Conteúdo da mensagem */}
                <p className="text-sm font-medium">{msg.content}</p>

                {/* Hora da mensagem: Formata para HH:MM */}
                <span className={`text-[9px] mt-2 block ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                  {msg.created_at
                    ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'A enviar...'}
                </span>
              </div>
            </div>
          );
        })}
        {/* Referência para o scroll automático ao fundo da conversa */}
        <div ref={messagesEndRef} />
      </div>

      {/* FORMULÁRIO DE ENVIO: Permite escrever e submeter novas mensagens */}
      <form onSubmit={handleSend} className="p-6 border-t bg-white flex gap-3">
        <input
          className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-700 font-medium"
          placeholder="Escreve a tua dúvida aqui..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 shadow-lg transition-all active:scale-95 disabled:opacity-50"
          disabled={!text.trim()}
        >
          Enviar
        </button>
      </form>
    </div>
  );
}

export default GlobalChat;