const API_BASE = import.meta.env.VITE_API_URL;

export const sharedFilesService = {
  async upload(file, roomId, userId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('roomId', roomId);
    formData.append('userId', userId);

    const res = await fetch(`${API_BASE}/shared_files/upload`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },

  async getFilesByRoom(roomId) {
    const res = await fetch(`${API_BASE}/shared_files/room/${roomId}`);
    return res.json();
  },

  getDownloadUrl(fileUrl) {
    return `${API_BASE}/shared_files/download/${fileUrl}`;
  }
};