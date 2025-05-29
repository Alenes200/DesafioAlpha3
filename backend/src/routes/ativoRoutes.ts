import express from "express";
import {
  listarAtivos,
  criarAtivo,
  atualizarAtivo,
  deletarAtivo,
} from "../controllers/ativoController";
import { autenticarToken } from "../middlewares/auth";

const router = express.Router();

router.use(autenticarToken);
router.get("/", listarAtivos);
router.post("/", criarAtivo);
router.put("/:id", atualizarAtivo);
router.delete("/:id", deletarAtivo);

export default router;
