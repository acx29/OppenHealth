import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    server: {
        // Dev-only: forwards /api/* to the NestJS server so the browser sees one
        // origin and the auth cookie flows without any CORS/SameSite issues
        proxy: {
            "/api": "http://localhost:3000"
        }
    }
});
