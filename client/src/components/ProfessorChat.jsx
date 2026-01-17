import { useRef, useEffect } from 'react';
import { useProfessorChat } from '../hooks/useProfessorChat';

function ProfessorChat() {
    const {
        authorized,
        loading,
        conversas: conversations,
        mensagens: messages,
        salaAtiva: activeRoom,
        setSalaAtiva: setActiveRoom,
        texto: messageText,
        setTexto: setMessageText,
        handleSend,
        user,
        nomeDoProfessor: professorName
    } = useProfessorChat();

    const messagesEndRef = useRef(null);

    // Gere o scroll automático para a última mensagem recebida ou enviada
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Ecrã de carregamento inicial
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    // Bloqueio de acesso caso não autorizado
    if (!authorized) return null;

    return (
        <div className="w-full h-fit bg-white rounded-2xl shadow-xl border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
            <div className="p-4">
                
                {/* CABEÇALHO: Exibe o total de conversas pendentes ou ativas */}
                <div className="mb-8 flex justify-between items-center">
                    <div className="bg-white px-6 py-2 rounded-2xl shadow-sm border border-gray-200">
                        <span className="text-sm font-bold text-gray-600">
                            {conversations.length} Conversas Ativas
                        </span>
                    </div>
                </div>

                {!activeRoom ? (
                    /* --- LISTA DE TICKETS (ALUNOS): Vista onde o professor escolhe a dúvida a responder --- */
                    <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {conversations.map((chat) => (
                            <div
                                key={chat.room_id}
                                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all group"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl border border-blue-100">
                                        {chat.aluno_nome?.charAt(0).toUpperCase()}
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-gray-800 text-lg">{chat.aluno_nome}</h3>
                                            {/* Indicador visual de status da dúvida (Resolvida vs Pendente) */}
                                            {!chat.is_ansured ? (
                                                <span className="bg-red-500 h-2.5 w-2.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
                                            ) : (
                                                <span className="bg-green-500 h-2.5 w-2.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                                            )}
                                        </div>
                                        <p className="text-gray-500 text-sm mt-0.5 truncate max-w-md italic">
                                            {chat.last_content || "Sem mensagens ainda..."}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                                        {chat.created_at ? new Date(chat.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </span>

                                    <button
                                        onClick={() => setActiveRoom(chat)}
                                        className={`px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-sm transform active:scale-95 ${
                                            !chat.is_ansured
                                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                        }`}
                                    >
                                        {!chat.is_ansured ? 'Responder' : 'Ver Chat'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* --- JANELA DE CHAT ATIVA: Interface de conversação direta com o aluno --- */
                    <div className="flex flex-col h-[70vh]">
                        
                        {/* Header da Janela de Chat */}
                        <div className="p-5 bg-white border-b flex justify-between items-center rounded-t-2xl">
                            <button
                                onClick={() => setActiveRoom(null)}
                                className="flex items-center text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded-xl transition-all"
                            >
                                <span className="mr-2">←</span> Voltar à Lista
                            </button>
                            <div className="text-center">
                                <p className="font-extrabold text-gray-800 text-lg">
                                    {activeRoom.aluno_nome || "Aluno"}
                                </p>
                                <div className="flex items-center justify-center gap-1.5">
                                    <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                                    <span className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Sessão de Dúvida</span>
                                </div>
                            </div>
                            <div className="w-28"></div>
                        </div>

                        {/* Área de Visualização das Mensagens */}
                        <div className="flex-1 p-6 bg-gray-50 overflow-y-auto space-y-4 flex flex-col">
                            {messages.map((msg, index) => {
                                // Compara o ID do autor com o ID do professor logado
                                const isMe = Number(msg.user_id) === Number(user.id);

                                return (
                                    <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`p-4 rounded-2xl shadow-sm max-w-[70%] ${
                                            isMe
                                                ? 'bg-blue-600 text-white rounded-tr-none'
                                                : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                                        }`}>
                                            <span className={`text-[10px] font-extrabold uppercase tracking-wider mb-1 px-2 block ${
                                                isMe ? 'text-white' : 'text-gray-500'
                                            }`}>
                                                {isMe ? professorName : (activeRoom.aluno_nome || 'Aluno')}
                                            </span>
                                            <p className="text-sm leading-relaxed font-medium">{msg.content}</p>
                                            <span className={`text-[9px] mt-2 block ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Campo de Texto para envio de resposta */}
                        <form onSubmit={handleSend} className="p-6 border-t bg-white flex gap-3 rounded-b-2xl">
                            <input
                                className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-700 font-medium"
                                placeholder="Escreva aqui a sua resposta para o aluno..."
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                autoFocus
                            />
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 shadow-lg transition-all active:scale-95 disabled:opacity-50"
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

export default ProfessorChat;