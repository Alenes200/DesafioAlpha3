import { Request, Response } from "express";
import { pool } from "../config/db";

export const listarAtivos = async (
  req: Request,
  res: Response
): Promise<void> => {
  const usuarioId = (req as any).user.id;
  const result = await pool.query(
    "SELECT * FROM ativos WHERE usuario_id = $1",
    [usuarioId]
  );
  res.json(result.rows);
};

export const criarAtivo = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { nome, descricao } = req.body;
  const usuarioId = (req as any).user.id;

  await pool.query(
    "INSERT INTO ativos (usuario_id, nome, descricao) VALUES ($1, $2, $3)",
    [usuarioId, nome, descricao]
  );
  res.status(201).json({ mensagem: "Ativo criado" });
};

export const atualizarAtivo = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { nome, descricao } = req.body;
  const usuarioId = (req as any).user.id;

  await pool.query(
    "UPDATE ativos SET nome = $1, descricao = $2 WHERE id = $3 AND usuario_id = $4",
    [nome, descricao, id, usuarioId]
  );
  res.json({ mensagem: "Ativo atualizado" });
};

export const deletarAtivo = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const usuarioId = (req as any).user.id;

  await pool.query("DELETE FROM ativos WHERE id = $1 AND usuario_id = $2", [
    id,
    usuarioId,
  ]);
  res.json({ mensagem: "Ativo excluído" });
};
