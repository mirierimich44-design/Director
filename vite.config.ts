import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    // Express already serves /videos, /images, /audio directly from disk.
    // Setting publicDir:false prevents Vite from copying those files into dist/
    // during production builds (which would exhaust disk space on large projects).
    publicDir: false,
    server: {
        port: 5174,
        proxy: {
            '/api':    { target: 'http://127.0.0.1:3002', changeOrigin: true },
            '/audio':  { target: 'http://127.0.0.1:3002', changeOrigin: true },
            '/videos': { target: 'http://127.0.0.1:3002', changeOrigin: true },
            '/images': { target: 'http://127.0.0.1:3002', changeOrigin: true },
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: false,
    },
});
