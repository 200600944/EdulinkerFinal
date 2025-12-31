const API_BASE = import.meta.env.VITE_API_URL;

export const sharedFileService = {
  async upload(file, roomId, userId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('roomId', roomId);
    formData.append('userId', userId);

    const res = await fetch(`${API_BASE}/shared_file/upload`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },

  async getFilesByRoom(roomId) {
    const res = await fetch(`${API_BASE}/shared_file/room/${roomId}`);
    return res.json();
  },

  getDownloadUrl(fileUrl) {
    return `${API_BASE}/shared_file/download/${fileUrl}`;
  }
};