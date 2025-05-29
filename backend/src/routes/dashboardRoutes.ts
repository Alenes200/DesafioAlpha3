import express from "express";
import { obterAlertas } from "../controllers/dashboardController";
import { autenticarToken } from "../middlewares/auth";

const router = express.Router();

router.get("/alertas", autenticarToken, obterAlertas);

export default router;
