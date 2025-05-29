import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./src/routes/authRoutes";
import ativoRoutes from "./src/routes/ativoRoutes";
import manutencaoRoutes from "./src/routes/manutencaoRoutes";
import dashboardRoutes from "./src/routes/dashboardRoutes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/ativos", ativoRoutes);
app.use("/api/manutencoes", manutencaoRoutes);
app.use("/api/dashboard", dashboardRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
