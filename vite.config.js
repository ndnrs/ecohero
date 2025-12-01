import { defineConfig } from 'vite';

export default defineConfig({
    // Base para GitHub Pages
    base: './',

    // Configuração do build
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        minify: 'terser'
    },

    // Servidor de desenvolvimento
    server: {
        port: 5173,
        open: true
    }
});
