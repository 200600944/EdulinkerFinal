import { useLoby } from '../hooks/useLoby';
import DrawingCanvas from './DrawingCanvas';
import GlobalChat from './GlobalChat';

function Lobby() {
    // Importação de estados e funções do hook personalizado para gestão da lógica do lobby
    const {
        authorized, loading, user, isProfessor, rooms, isCreating, setIsCreating, 
        novoNomeSala, setNovoNomeSala, texto, setTexto, mensagens, salaAtiva, 
        setSalaAtiva, onlineUsers, socket, messagesEndRef, handleCreateClass, 
        handleSairDaAula, handleDeleteRoom
    } = useLoby();

    // Renderização de estado de carregamento enquanto valida a autenticação
    if (loading) return <div className="p-10 text-center italic text-gray-500">A carregar...</div>;
    
    // Bloqueio de renderização caso o utilizador não tenha permissões
    if (!authorized) return null;

    return (
        <div className="w-full h-full bg-white rounded-2xl shadow-xl border-2 border-dashed border-gray-200 overflow-hidden">
            
            {!salaAtiva ? (
                /* --- VISTA DE LISTA (LOBBY): Listagem de salas disponíveis para entrar ou criar --- */
                <div className="p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    
                    {/* Contador visual de salas ativas baseadas no perfil do utilizador */}
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

                    <div className="w-full transition-all duration-300">
                        {!isCreating ? (
                            /* Botão de ação inicial para o Professor expandir o formulário de criação */
                            <button
                                onClick={() => {
                                    setIsCreating(true);
                                    setNovoNomeSala('');
                                }}
                                className="group w-full p-6 bg-white border-2 border-dashed rounded-2xl flex items-center justify-center gap-3 text-blue-600 font-bold hover:border-blue-500 hover:bg-blue-50 transition-all shadow-sm"
                            >
                                <span className="text-2xl group-hover:scale-125 transition-transform">+</span>
                                Criar uma nova sala de aula
                            </button>
                        ) : (
                            /* Formulário dinâmico para definir o nome da nova sala */
                            <div className="w-full p-6 bg-blue-50 border-2 border-blue-200 rounded-2xl animate-in zoom-in-95 duration-200">
                                <label className="block text-sm font-bold text-blue-800 mb-2">Nome da Sala de Aula:</label>
                                <div className="flex gap-3">
                                    <input
                                        autoFocus
                                        type="text"
                                        value={novoNomeSala}
                                        onChange={(e) => setNovoNomeSala(e.target.value)}
                                        className="flex-1 p-3 rounded-xl border-2 border-blue-100 outline-none focus:border-blue-500 transition-all font-medium"
                                        placeholder="Ex: Aula de Matemática - 10ºA"
                                    />
                                    <button
                                        onClick={handleCreateClass}
                                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md"
                                    >
                                        Confirmar
                                    </button>
                                    <button
                                        onClick={() => setIsCreating(false)}
                                        className="bg-white text-gray-500 px-6 py-3 rounded-xl font-bold border border-gray-200 hover:bg-gray-100 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mapeamento e renderização das salas de aula ativas vindas da base de dados */}
                    <div className="grid gap-4 mt-4">
                        {rooms.filter(chat => {
                            const isClass = chat.room_type === 'class';
                            if (isProfessor) return isClass && Number(chat.room_created_by) === Number(user.id);
                            return isClass;
                        }).length === 0 ? (
                            /* Feedback visual caso não existam salas para mostrar */
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
                                    
                                    {/* Botões de interação com a sala específica */}
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setSalaAtiva(chat)} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-sm active:scale-95">
                                            Entrar na Aula
                                        </button>
                                        
                                        {/* Botão de fechar sala visível apenas para o professor dono da sala */}
                                        {isProfessor && Number(chat.room_created_by) === Number(user.id) && (
                                            <button onClick={() => handleDeleteRoom(chat.room_id)} className="bg-red-50 text-red-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-red-600 hover:text-white transition-all border border-red-100">
                                                Fechar Sala
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ) : (
                /* --- VISTA DE DASHBOARD UNIFICADO: Interface ativa após entrar numa sala específica --- */
                <div className="flex flex-col h-screen max-h-[85vh]">
                    
                    {/* Barra superior com controlos de saída e estatísticas da sala atual */}
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

                        {/* Coluna Esquerda: Listagem em tempo real dos utilizadores presentes na sala */}
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

                        {/* Área Central: Quadro interativo para desenhos e esquemas em tempo real */}
                        <div className="flex-[2] bg-gray-200 p-4 border-r overflow-hidden flex flex-col">
                            <div className="bg-white rounded-xl shadow-inner h-full overflow-hidden border-2 border-gray-300">
                                <DrawingCanvas roomId={salaAtiva.room_id} socket={socket} userRole={user.role} />
                            </div>
                        </div>

                        {/* Coluna Direita: Chat global para comunicação textual entre professor e alunos */}
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