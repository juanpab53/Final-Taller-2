import "dotenv/config";
import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5500"
}));

app.use(express.json());

const publicPath = path.join(__dirname, "..", "..", "frontend", "public");
const adminPath = path.join(__dirname, "..", "..", "frontend", "admin");
const sharedPath = path.join(__dirname, "..", "..", "frontend", "shared");

app.use("/admin", express.static(adminPath));
app.use("/shared", express.static(sharedPath));
app.use("/", express.static(publicPath));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Frontend público: http://localhost:${PORT}`);
  console.log(`Panel admin:      http://localhost:${PORT}/admin`);
  console.log(`Recursos compartidos: http://localhost:${PORT}/shared`);
  console.log(`API health:       http://localhost:${PORT}/api/health`);
});
