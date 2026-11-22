import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `npm run build` writes ../static/dist/app.js and app.css under fixed names, so
// templates/index.html can link them directly and deployment needs no Node step.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "../static/dist",
    emptyOutDir: true,
    // Ship the stylesheet as written (no minifier rewrites or vendor-prefix changes).
    cssMinify: false,
    rollupOptions: {
      input: "src/main.jsx",
      output: {
        entryFileNames: "app.js",
        chunkFileNames: "[name].js",
        assetFileNames: "app[extname]",
      },
    },
  },
  // `npm run dev` serves frontend/index.html and forwards API calls to Flask.
  server: {
    proxy: {
      "/api": "http://127.0.0.1:5001",
    },
  },
});
