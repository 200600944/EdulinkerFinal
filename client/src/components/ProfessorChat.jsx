import { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { authService } from '../services/auth.Service';

function ProfessorChat() {
    // Estados para controlo de acesso (semelhante ao register)
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const hasAlerted = useRef(false);
    const userLogado = JSON.parse(localStorage.getItem('user') || '{}');
    const nomeDoProfessor = userLogado.nome || 'Professor';
    // Extraímos toda a lógica do nosso Hook personalizado
    const { conversas, mensagens, salaAtiva, setSalaAtiva, enviarMensagem } = useChat();
    const [texto, setTexto] = useState("");
    const messagesEndRef = useRef(null);

    //Validação de acesso a pagina
    useEffect(() => {
        authService.initializePage({
            checkFunc: authService.isProfessor,
            hasAlertedRef: hasAlerted,
            setAuthorized,
            setLoading,
        });
    }, []);

    //Scroll automático sempre que o array de mensagens mudar
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [mensagens]);

    // Função para lidar com o envio da mensagem
    const handleSend = (e) => {
        e.preventDefault();
        if (!texto.trim() || !salaAtiva) return;

        const user = JSON.parse(localStorage.getItem('user') || '{}');

        // Passamos o texto, o ID do professor e o papel 'professor'
        // O papel é importante para o backend saber que deve marcar a dúvida como respondida
        enviarMensagem(texto, user.id, 'professor');
        setTexto("");
    };
    return (
        <div className="w-full h-full bg-white rounded-2xl shadow-xl border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
            <div className="">
                {/* CABEÇALHO PRINCIPAL */}
                <div className="mb-8 flex justify-between items-center">
                    <div className="bg-white px-6 py-2 rounded-2xl shadow-sm border border-gray-200">
                        <span className="text-sm font-bold text-gray-600">
                            {conversas.length} Conversas Ativas
                        </span>
                    </div>
                </div>

                {!salaAtiva ? (
                    /* --- LISTA DE TICKETS (ALUNOS) --- */
                    <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {conversas.map((chat) => (
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
                                            {!chat.respondida && (
                                                <span className="bg-red-500 h-2.5 w-2.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
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
                                        onClick={() => setSalaAtiva(chat)}
                                        className={`px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-sm transform active:scale-95 ${!chat.respondida
                                            ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200'
                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                            }`}
                                    >
                                        {!chat.respondida ? 'Responder' : 'Ver Chat'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* JANELA DE CHAT ATIVA */
                    <div className="">
                        {/* Header da Janela - AGORA COM NOME DO ALUNO DINÂMICO */}
                        <div className="p-5 bg-white border-b flex justify-between items-center z-10">
                            <button
                                onClick={() => setSalaAtiva(null)}
                                className="flex items-center text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded-xl transition-all"
                            >
                                <span className="mr-2">←</span> Sair do Chat
                            </button>
                            <div className="text-center">
                                {/* Exibe o nome do aluno da sala selecionada */}
                                <p className="font-extrabold text-gray-800 text-lg">
                                    {salaAtiva.aluno_nome || "Aluno"}
                                </p>
                                <div className="flex items-center justify-center gap-1.5">
                                    <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                                    <span className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Dúvida em Aberto</span>
                                </div>
                            </div>
                            <div className="w-28"></div>
                        </div>
                        {/* Área de Mensagens */}
                        <div className="flex-1 p-6 bg-gray-50 overflow-y-auto space-y-4 flex flex-col">
                            {mensagens.map((msg, index) => {
                                // Recuperamos o utilizador logado para comparar IDs
                                const user = JSON.parse(localStorage.getItem('user') || '{}');

                                // Se o ID de quem enviou a mensagem (msg.user_id) for o MEU ID, eu sou o autor
                                const isMe = Number(msg.user_id) === Number(user.id);

                                return (
                                    <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`p-4 rounded-2xl shadow-sm max-w-[70%] ${isMe
                                            ? 'bg-blue-600 text-white rounded-tr-none' // Minha mensagem (Direita/Azul)
                                            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none' // Mensagem do Aluno (Esquerda/Branco)
                                            }`}>
                                            <span className={`text-[10px] font-extrabold uppercase tracking-wider mb-1 px-2 ${isMe ? 'text-white' : 'text-gray-500'
                                                }`}>
                                                {/* Se isMe for true, mostra o nome do Professor. Se false, mostra o do Aluno */}
                                                {isMe ? nomeDoProfessor : (salaAtiva.aluno_nome || 'Aluno')}
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
                        {/* Input de Mensagem */}
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

export default ProfessorChat;