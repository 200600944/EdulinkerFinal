import React, { useState } from 'react';
import { useLoby } from '../hooks/useLoby';
import { useSharedFiles } from '../hooks/useSharedFiles';
import { sharedFilesService } from '../services/shared_files.service';

function FileManager() {
  // Hook customizado para obter as salas disponíveis e permissões do utilizador
  const { rooms, user, isProfessor, loading: loadingRooms } = useLoby();
  const [activeRoom, setActiveRoom] = useState(null);
  
  // Resolve o ID da sala ativa de forma segura (suporta diferentes nomenclaturas de API)
  const currentRoomId = activeRoom?.room_id || activeRoom?.id;

  // Hook customizado para gerir a lógica de ficheiros da sala selecionada
  const { files, uploading, handleUpload } = useSharedFiles(currentRoomId);

  // Ecrã de carregamento enquanto as salas são obtidas do servidor
  if (loadingRooms) {
    return <div className="p-10 text-center italic text-gray-500">A carregar aulas...</div>;
  }

  return (
    <div className="flex h-[85vh] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden m-4">
      
      {/* Sidebar: Listagem de aulas para seleção de repositório */}
      <div className="w-80 bg-slate-50 border-r flex flex-col">
        <div className="p-6 bg-white border-b border-slate-100 shadow-sm">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">Repositório</h2>
          <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Selecione uma aula</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {rooms.map(room => (
            <div 
              key={room.room_id || room.id}
              onClick={() => setActiveRoom(room)}
              className={`p-4 rounded-2xl cursor-pointer transition-all border-2 font-bold ${
                (activeRoom?.room_id || activeRoom?.id) === (room.room_id || room.id)
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                : 'bg-white border-transparent hover:border-blue-100 text-slate-600'
              }`}
            >
              {room.room_name || room.name}
            </div>
          ))}
        </div>
      </div>

      {/* Área Principal: Gestão e visualização de ficheiros da aula ativa */}
      <div className="flex-1 flex flex-col bg-white">
        {activeRoom ? (
          <>
            {/* Cabeçalho da pasta de materiais */}
            <div className="p-6 border-b flex justify-between items-center bg-slate-50/30">
              <div>
                <h2 className="text-2xl font-black text-slate-800 uppercase italic">
                  {activeRoom.room_name || activeRoom.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                  <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Pasta de Materiais Ativa</p>
                </div>
              </div>

              {/* Controlo de Upload: Visível apenas para perfis de Professor */}
              {isProfessor && (
                <label className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] cursor-pointer transition-all shadow-xl active:scale-95">
                  {uploading ? 'A enviar...' : 'Novo Material'}
                  <input 
                    type="file" 
                    className="hidden" 
                    disabled={uploading}
                    onChange={(e) => handleUpload(e.target.files[0], user.id)} 
                  />
                </label>
              )}
            </div>

            {/* Grelha de Ficheiros: Exibe os materiais disponíveis para download */}
            <div className="flex-1 p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 content-start bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px]">
              {files.map((file) => (
                <div key={file.id} className="bg-white p-5 rounded-[2rem] border-2 border-slate-100 flex flex-col gap-4 hover:border-blue-400 hover:shadow-2xl transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-blue-50 transition-colors shadow-inner">
                       {file.file_name.toLowerCase().endsWith('.pdf') ? '📕' : '📄'}
                    </div>
                    <div className="truncate flex-1">
                      <p className="font-black text-slate-800 truncate text-xs uppercase tracking-tight">{file.file_name}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase">{file.file_size} KB</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase">{new Date(file.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Link de Download: Disponível para Alunos e Professores */}
                  <a 
                    href={sharedFilesService.getDownloadUrl(file.file_url)} 
                    download={file.file_name}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>Transferir</span>
                    <span className="text-lg">⬇</span>
                  </a>
                </div>
              ))}
              
              {/* Estado Vazio: Quando a sala selecionada não possui ficheiros */}
              {files.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-24 opacity-30">
                  <div className="text-7xl mb-4">📭</div>
                  <p className="font-black text-slate-800 uppercase tracking-[0.3em] text-xs">Pasta Vazia</p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Estado Inicial: Quando nenhuma aula foi selecionada na sidebar */
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50">
             <div className="text-9xl mb-6 grayscale opacity-10 animate-pulse">📂</div>
             <p className="font-black text-slate-400 uppercase tracking-[0.5em] text-sm">Selecione uma aula</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FileManager;