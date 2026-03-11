import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

router.get("/dashboard", requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, "..", "private", "dashboard.html"));
});

export default router;