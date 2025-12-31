import { useLoby } from '../hooks/useLoby';
import DrawingCanvas from './DrawingCanvas'; 
import GlobalChat from './GlobalChat';
function Lobby() {
    const {
        authorized, loading, user, isProfessor,
        rooms, isCreating, setIsCreating, novoNomeSala, setNovoNomeSala,
        texto, setTexto, mensagens, salaAtiva, setSalaAtiva,
        onlineUsers, socket, messagesEndRef,
        handleCreateClass, handleSend, handleSairDaAula
    } = useLoby();

    if (loading) return <div className="p-10 text-center italic text-gray-500">A carregar...</div>;
    if (!authorized) return null;
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
                                    <div key={u.id || u.socketId} className="flex items-center gap-2 group">
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
                              <DrawingCanvas salaId={salaAtiva.room_id} socket={socket} userRole={user.role}/>
                            </div>
                        </div>

                        {/* Lado Direito: Chat da Sala */}
                        <GlobalChat
                            mensagens={mensagens}
                            user={user}
                            texto={texto}
                            setTexto={setTexto}
                            handleSend={handleSend}
                            messagesEndRef={messagesEndRef}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Lobby;