// client/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        // Sem isto, o Vite não "vê" os teus ficheiros dentro de views
        main: resolve(__dirname, 'views/index.html'),
        register: resolve(__dirname, 'views/register.html'),
        home: resolve(__dirname, 'views/home.html'),
        professorchat: resolve(__dirname, 'views/professorchat.html'),
        studentchat: resolve(__dirname, 'views/studentchat.html')
      },
    },
  },
  server: {
    // Isto garante que ao abrir localhost:5173 ele vai ao sítio certo
    open: '/views/index.html'
  }
})