import { Request, Response } from "express";
import { pool } from "../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const register = async (req: Request, res: Response): Promise<void> => {
  const { nome, email, senha } = req.body;
  const senhaHash = await bcrypt.hash(senha, 10);

  try {
    await pool.query(
      "INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3)",
      [nome, email, senhaHash]
    );
    res.status(201).json({ mensagem: "Usuário registrado" });
  } catch (err: any) {
    res.status(400).json({ erro: "Erro ao registrar", detalhes: err.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, senha } = req.body;

  const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [
    email,
  ]);

  if (result.rows.length === 0) {
    res.status(401).json({ erro: "Usuário não encontrado" });
    return;
  }

  const usuario = result.rows[0];
  const senhaOk = await bcrypt.compare(senha, usuario.senha_hash);

  if (!senhaOk) {
    res.status(401).json({ erro: "Senha inválida" });
    return;
  }

  const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, {
    expiresIn: "1d",
  });

  res.json({ token, nome: usuario.nome });
};
