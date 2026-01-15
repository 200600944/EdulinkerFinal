import { useState, useEffect, useCallback } from 'react';
import { sharedFilesService } from '../services/shared_files.service';

export const useSharedFiles = (roomId) => {
  // Estados para armazenamento da lista de ficheiros e controlo do progresso de upload
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Procura no servidor todos os ficheiros associados a uma sala específica
  const fetchFiles = useCallback(async () => {
    // Se não houver um ID de sala, limpamos a lista local
    if (!roomId) {
      setFiles([]);
      return;
    }
    
    try {
      const data = await sharedFilesService.getFilesByRoom(roomId);
      // Garante que o estado recebe sempre um Array, mesmo que a API falhe
      setFiles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao procurar ficheiros na sala:", error);
      setFiles([]);
    }
  }, [roomId]);

  // Efeito para carregar automaticamente os ficheiros sempre que o roomId mudar
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Gere o processo de envio de um novo ficheiro para o servidor
  const handleUpload = async (file, userId) => {
    if (!file || !roomId) return;
    
    setUploading(true);
    try {
        // Envia o ficheiro físico e os metadados (sala e autor) para o backend
        await sharedFilesService.upload(file, roomId, userId);
        
        // Atualiza a lista local imediatamente após o upload bem-sucedido
        await fetchFiles(); 
    } catch (err) {
        console.error("Erro no processo de upload:", err);
    } finally {
        setUploading(false);
    }
  };

  // Exportação dos dados e funções para o componente FileManager.jsx
  return { 
    files, 
    uploading, 
    handleUpload, 
    refresh: fetchFiles 
  };
};