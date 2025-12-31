import { useState, useCallback, useEffect } from 'react';
import { sharedFilesService } from '../services/shared_files.service';

export const useSharedFiles = (roomId) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const fetchFiles = useCallback(async () => {
    if (!roomId) {
      setFiles([]);
      return;
    }
    try {
      const data = await sharedFilesService.getFilesByRoom(roomId);
      setFiles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao procurar ficheiros na sala:", error);
      setFiles([]);
    }
  }, [roomId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleUpload = async (file, userId) => {
    if (!file || !roomId) return;
    
    setUploading(true);
    try {
        // Envia o ficheiro, a sala e o ID do utilizador que está a fazer o upload
        await sharedFilesService.upload(file, roomId, userId);
        
        // Recarrega a lista para que o novo ficheiro apareça logo com o nome
        await fetchFiles(); 
    } catch (err) {
        console.error("Erro no upload:", err);
    } finally {
        setUploading(false);
    }
  };

  return { files, uploading, handleUpload, refresh: fetchFiles };
};