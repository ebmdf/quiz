import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente baseadas no modo atual (development/production)
  // O terceiro argumento '' permite carregar todas as variáveis, não apenas as com prefixo VITE_
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    base: './', // Garante caminhos relativos para GitHub Pages
    build: {
      outDir: 'dist',
      sourcemap: false
    },
    define: {
      // Injeta a variável API_KEY para que 'process.env.API_KEY' funcione no código
      // Tenta ler de VITE_API_KEY ou API_KEY
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || env.API_KEY || '')
    }
  }
})