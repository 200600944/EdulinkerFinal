import { useState, useRef, useEffect, useCallback } from 'react';
import { useChat } from '../hooks/useChat';
import { authService } from '../services/auth.Service';
import DrawingCanvas from './DrawingCanvas';

function Lobby() {
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const hasAlerted = useRef(false);
    const API_BASE = import.meta.env.VITE_API_URL;

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isProfessor = user.role === 'professor';

    // Adicionado onlineUsers que vem do teu hook useChat atualizado
    const { mensagens, salaAtiva, setSalaAtiva, enviarMensagem, onlineUsers } = useChat();
    const [rooms, setrooms] = useState([]);
    const [texto, setTexto] = useState("");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        authService.initializePage({
            checkFunc: () => !!user.id,
            hasAlertedRef: hasAlerted,
            setAuthorized,
            setLoading,
        });
    }, [user.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [mensagens]);

    const handleCreateClass = async () => {
        const payload = {
            name: `Aula de ${user.nome}`,
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
                if (carregarSalas) carregarSalas();
                setSalaAtiva({ room_id: novaSala.id, room_name: novaSala.name, room_type: novaSala.room_type });
            }
        } catch (error) { console.error("Erro:", error); }
    };

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

    const handleSend = (e) => {
        e.preventDefault();
        if (!texto.trim() || !salaAtiva) return;
        enviarMensagem(texto, user.id, user.role);
        setTexto("");
    };

    const handleSairDaAula = () => {
        if (salaAtiva) {
            const { socket } = useChat;
        }
        setSalaAtiva(null);
    };


    useEffect(() => {
        carregarSalas();
    }, [carregarSalas]);

    if (loading) return <div className="p-10 text-center italic text-gray-500">A carregar...</div>;

    return (
        <div className="w-full h-full bg-white rounded-2xl shadow-xl border-2 border-dashed border-gray-200 overflow-hidden">
            {!salaAtiva ? (
                /* --- VISTA DE LISTA (LOBBY) --- */
                <div className="p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="mb-8 flex justify-between items-center">
                        <div className="bg-blue-50 px-6 py-2 rounded-2xl border border-blue-100">
                            <span className="text-sm font-bold text-blue-600">
                                {rooms.filter(chat => {
                                    const isClass = chat.room_type === 'class';
                                    if (isProfessor) {
                                        return isClass && Number(chat.room_created_by) === Number(user.id);
                                    }
                                    return isClass;
                                }).length} Salas Disponíveis
                            </span>
                        </div>
                    </div>
                    <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {isProfessor && (
                            <button
                                onClick={handleCreateClass}
                                className="group w-full p-6 bg-white border-2 border-dashed rounded-2xl flex items-center justify-center gap-3 text-blue-600 font-bold hover:border-blue-500 hover:bg-blue-50 transition-all shadow-sm"
                            >
                                <span className="text-2xl group-hover:scale-125 transition-transform">+</span>
                                Criar uma nova sala de aula
                            </button>
                        )}
                    </div>
                    <div className="grid gap-4 mt-4">
                        {rooms.filter(chat => {
                            const isClass = chat.room_type === 'class';
                            if (isProfessor) return isClass && Number(chat.room_created_by) === Number(user.id);
                            return isClass;
                        }).length === 0 ? (
                            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                                <p className="text-gray-400 font-medium">Nenhuma sala ativa de momento.</p>
                            </div>
                        ) : (
                            rooms.filter(chat => {
                                const isClass = chat.room_type === 'class';
                                if (isProfessor) return isClass && Number(chat.room_created_by) === Number(user.id);
                                return isClass;
                            }).map((chat) => (
                                <div key={chat.room_id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md hover:border-blue-200 transition-all group">
                                    <div className="flex items-center gap-5">
                                        <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                            {chat.room_name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-lg">{chat.room_name}</h3>
                                            <p className="text-gray-500 text-sm truncate max-w-md italic">• Clique para participar</p>
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
                /* --- VISTA DE DASHBOARD UNIFICADO (ALUNOS + CANVAS + CHAT) --- */
                <div className="flex flex-col h-screen max-h-[85vh]">
                    <div className="p-4 bg-white border-b flex justify-between items-center shadow-sm">
                        <button onClick={handleSairDaAula} className="text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded-xl transition-all flex items-center">
                            <span className="mr-2">←</span> Sair da Aula
                        </button>
                        <div className="text-center">
                            <h2 className="font-extrabold text-gray-800 uppercase tracking-tight">{salaAtiva.room_name}</h2>
                            <span className="text-[10px] text-green-500 font-bold animate-pulse uppercase tracking-widest">● {onlineUsers?.length || 0} Online</span>
                        </div>
                        <div className="w-32"></div>
                    </div>

                    <div className="flex flex-1 overflow-hidden">

                        {/* NOVO: COLUNA ESQUERDA - LISTA DE ALUNOS */}
                        <div className="w-48 bg-gray-50 border-r flex flex-col p-4 overflow-y-auto">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Presentes</h3>
                            <div className="space-y-3">
                                {onlineUsers?.map((u) => (
                                    <div key={u.userId} className="flex items-center gap-2 group">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm border-2 border-white ${u.role === 'professor' ? 'bg-purple-600 text-white' : 'bg-blue-500 text-white'}`}>
                                            {u.nome?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[11px] font-bold text-gray-700 truncate">{u.nome}</span>
                                            <span className={`text-[8px] font-black uppercase ${u.role === 'professor' ? 'text-purple-500' : 'text-blue-400'}`}>{u.role}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Lado Central: Quadro de Desenho */}
                        <div className="flex-[2] bg-gray-200 p-4 border-r overflow-hidden flex flex-col">
                            <div className="bg-white rounded-xl shadow-inner h-full overflow-hidden border-2 border-gray-300">
                                <DrawingCanvas salaId={salaAtiva.room_id} />
                            </div>
                        </div>

                        {/* Lado Direito: Chat da Sala */}
                        <div className="flex-1 flex flex-col bg-gray-50 max-w-[400px]">
                            <div className="flex-1 p-4 overflow-y-auto space-y-3">
                                {mensagens.map((msg, idx) => {
                                    const isMe = Number(msg.user_id) === Number(user.id);
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