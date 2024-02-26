import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: '../releases/web',
  },
  server: {
    port: 3000,
  },
  plugins: [react()],
  define: {
    global: {},
  },
});
