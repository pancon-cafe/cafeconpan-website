import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const anthropicKey = env.VITE_ANTHROPIC_KEY || process.env.VITE_ANTHROPIC_KEY || ''

  return {
    server: { port: 5173, strictPort: true },
    plugins: [react()],
    define: {
      'import.meta.env.VITE_ANTHROPIC_KEY': JSON.stringify(anthropicKey),
    },
  }
})
