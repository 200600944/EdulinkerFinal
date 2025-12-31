import { useState, useCallback, useEffect } from 'react';
import { sharedFileService } from '../services/shared_file.service';

export const useSharedFiles = (roomId) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const fetchFiles = useCallback(async () => {
    if (!roomId) {
      setFiles([]);
      return;
    }
    try {
      const data = await sharedFileService.getFilesByRoom(roomId);
      setFiles(data);
    } catch (error) {
      console.error("Erro ao procurar ficheiros na sala:", error);
    }
  }, [roomId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleUpload = async (file, userId) => {
    if (!file || !roomId) return;
    
    setUploading(true);
    try {
      await sharedFileService.upload(file, roomId, userId);
      await fetchFiles(); // Recarrega a lista automaticamente após o sucesso
    } catch (err) {
      console.error("Erro no upload:", err);
      alert("Erro ao enviar o ficheiro.");
    } finally {
      setUploading(false);
    }
  };

  return { files, uploading, handleUpload, refresh: fetchFiles };
};