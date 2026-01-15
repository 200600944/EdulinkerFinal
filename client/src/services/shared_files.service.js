const API_BASE = import.meta.env.VITE_API_URL;

export const sharedFilesService = {
  // Envia um ficheiro para o servidor utilizando FormData para suportar o envio de binários
  async upload(file, roomId, userId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('roomId', roomId);
    formData.append('userId', userId);

    const response = await fetch(`${API_BASE}/shared_files/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Falha ao carregar o ficheiro para o servidor');
    }

    return response.json();
  },

  // Procura no servidor a lista de ficheiros associados a uma sala específica
  async getFilesByRoom(roomId) {
    const response = await fetch(`${API_BASE}/shared_files/room/${roomId}`);
    
    if (!response.ok) {
      throw new Error('Não foi possível obter a lista de ficheiros');
    }

    return response.json();
  },

  // Constrói o URL completo para permitir o download de um ficheiro específico
  getDownloadUrl(fileUrl) {
    // Retorna o endpoint do backend responsável pelo streaming do ficheiro
    return `${API_BASE}/shared_files/download/${fileUrl}`;
  }
};