import express from "express";
import {
  listarManutencoes,
  criarManutencao,
  atualizarManutencao,
  deletarManutencao,
} from "../controllers/manutencaoController";
import { autenticarToken } from "../middlewares/auth";

const router = express.Router();

router.use(autenticarToken);
router.get("/ativo/:ativoId", listarManutencoes);
router.post("/", criarManutencao);
router.put("/:id", atualizarManutencao);
router.delete("/:id", deletarManutencao);

export default router;
