const BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${BASE_URL}/chat`;

export const chatService = {
  // Procura a lista de todas as conversas ativas (usado principalmente pela vista do Professor)
  // Devolve: room_id, last_content, aluno_nome, is_ansured, etc.
  getRooms: async () => {
    try {
      const response = await fetch(`${API_URL}/rooms`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar a lista de conversas');
      }
      
      return await response.json();
    } catch (error) {
      console.error("Erro no chatService.getRooms:", error);
      throw error;
    }
  },

  // Procura o histórico completo de mensagens trocadas dentro de uma sala específica
  getChatHistory: async (roomId) => {
    try {
      const response = await fetch(`${API_URL}/messages/${roomId}`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar o histórico do chat');
      }
      
      return await response.json();
    } catch (error) {
      console.error("Erro no chatService.getChatHistory:", error);
      throw error;
    }
  }
};