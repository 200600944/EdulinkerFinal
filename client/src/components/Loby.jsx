import { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { authService } from '../services/auth.Service';
import DrawingCanvas from './DrawingCanvas'; // Importa o teu componente Konva

function Lobby() {
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const hasAlerted = useRef(false);
    const API_BASE = import.meta.env.VITE_API_URL;
    
    const userLogado = JSON.parse(localStorage.getItem('user') || '{}');
    const isProfessor = userLogado.role === 'professor';

    const { conversas, mensagens, salaAtiva, setSalaAtiva, enviarMensagem, carregarSalas } = useChat();
    const [texto, setTexto] = useState("");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        authService.initializePage({
            checkFunc: () => !!userLogado.id,
            hasAlertedRef: hasAlerted,
            setAuthorized,
            setLoading,
        });
    }, [userLogado.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [mensagens]);

    const handleCreateRoom = async () => {
        const payload = { name: `Aula de ${userLogado.nome}`, owner_id: userLogado.id };
        try {
            const response = await fetch(`${API_BASE}/chat/create-room`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                const novaSala = await response.json();
                if (carregarSalas) carregarSalas(); 
                setSalaAtiva({ room_id: novaSala.id, room_name: novaSala.name });
            }
        } catch (error) { console.error("Erro:", error); }
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!texto.trim() || !salaAtiva) return;
        enviarMensagem(texto, userLogado.id, userLogado.role);
        setTexto("");
    };

    if (loading) return <div className="p-10 text-center italic text-gray-500">A carregar...</div>;

    return (
        <div className="w-full h-full bg-white rounded-2xl shadow-xl border-2 border-dashed border-gray-200 overflow-hidden">
            {!salaAtiva ? (
                /* --- VISTA DE LISTA (LOBBY) --- */
                <div className="p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="mb-8 flex justify-between items-center">
                        <div className="bg-blue-50 px-6 py-2 rounded-2xl border border-blue-100">
                            <span className="text-sm font-bold text-blue-600">
                                {conversas.length} Salas Disponíveis
                            </span>
                        </div>
                        {isProfessor && (
                            <button onClick={handleCreateRoom} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 shadow-lg flex items-center gap-2 active:scale-95 transition-all">
                                <span>+</span> Criar Nova Aula
                            </button>
                        )}
                    </div>

                    <div className="grid gap-4">
                        {conversas.length === 0 ? (
                            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                                <p className="text-gray-400 font-medium">Nenhuma sala ativa de momento.</p>
                            </div>
                        ) : (
                            conversas.map((chat) => (
                                <div key={chat.room_id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md hover:border-blue-200 transition-all group">
                                    <div className="flex items-center gap-5">
                                        <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                            {chat.room_name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-lg">{chat.room_name}</h3>
                                            <p className="text-gray-500 text-sm truncate max-w-md italic">
                                                ID da Sala: {chat.room_id} • Clique para participar
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSalaAtiva(chat)} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-sm active:scale-95">
                                        Entrar na Aula
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ) : (
                /* --- VISTA DE DASHBOARD UNIFICADO (CANVAS + CHAT) --- */
                <div className="flex flex-col h-screen max-h-[85vh]">
                    {/* Header do Dashboard */}
                    <div className="p-4 bg-white border-b flex justify-between items-center shadow-sm">
                        <button onClick={() => setSalaAtiva(null)} className="text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded-xl transition-all flex items-center">
                            <span className="mr-2">←</span> Sair da Aula
                        </button>
                        <div className="text-center">
                            <h2 className="font-extrabold text-gray-800 uppercase tracking-tight">{salaAtiva.room_name}</h2>
                            <span className="text-[10px] text-green-500 font-bold animate-pulse">Sessão em Tempo Real</span>
                        </div>
                        <div className="w-32"></div>
                    </div>

                    {/* Área Principal: Dois Lados */}
                    <div className="flex flex-1 overflow-hidden">
                        {/* Lado Esquerdo: Quadro de Desenho */}
                        <div className="flex-[2] bg-gray-200 p-4 border-r overflow-hidden flex flex-col">
                            <div className="bg-white rounded-xl shadow-inner h-full overflow-hidden border-2 border-gray-300">
                                <DrawingCanvas salaId={salaAtiva.room_id} />
                            </div>
                        </div>

                        {/* Lado Direito: Chat da Sala */}
                        <div className="flex-1 flex flex-col bg-gray-50 max-w-[400px]">
                            <div className="flex-1 p-4 overflow-y-auto space-y-3">
                                {mensagens.map((msg, idx) => {
                                    const isMe = Number(msg.user_id) === Number(userLogado.id);
                                    return (
                                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`p-3 rounded-2xl shadow-sm max-w-[90%] ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'}`}>
                                                <span className={`text-[9px] font-bold block mb-1 uppercase ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                                    {isMe ? 'Eu' : (msg.user_nome || 'Utilizador')}
                                                </span>
                                                <p className="text-sm font-medium leading-tight">{msg.content}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input do Chat */}
                            <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2">
                                <input className="flex-1 p-2 bg-gray-50 border rounded-xl outline-none text-sm focus:ring-2 focus:ring-blue-500" placeholder="Escrever..." value={texto} onChange={(e) => setTexto(e.target.value)} />
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all active:scale-95">
                                    Enviar
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Lobby;