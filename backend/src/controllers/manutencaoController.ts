import { Request, Response } from "express";
import { pool } from "../config/db";

export const listarManutencoes = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { ativoId } = req.params;
  const usuarioId = (req as any).user.id;

  const ativo = await pool.query(
    "SELECT * FROM ativos WHERE id = $1 AND usuario_id = $2",
    [ativoId, usuarioId]
  );

  if (ativo.rows.length === 0) {
    res.status(403).json({ erro: "Sem permissão" });
    return;
  }

  const manutencoes = await pool.query(
    "SELECT * FROM manutencoes WHERE ativo_id = $1 ORDER BY data_realizada DESC",
    [ativoId]
  );
  res.json(manutencoes.rows);
};

export const criarManutencao = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    ativo_id,
    servico,
    data_realizada,
    descricao,
    proxima_manutencao_data,
    proxima_manutencao_descricao,
  } = req.body;
  const usuarioId = (req as any).user.id;

  const ativo = await pool.query(
    "SELECT * FROM ativos WHERE id = $1 AND usuario_id = $2",
    [ativo_id, usuarioId]
  );

  if (ativo.rows.length === 0) {
    res.status(403).json({ erro: "Sem permissão" });
    return;
  }

  await pool.query(
    `INSERT INTO manutencoes (ativo_id, servico, data_realizada, descricao, proxima_manutencao_data, proxima_manutencao_descricao)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      ativo_id,
      servico,
      data_realizada,
      descricao,
      proxima_manutencao_data,
      proxima_manutencao_descricao,
    ]
  );
  res.status(201).json({ mensagem: "Manutenção registrada" });
};

export const atualizarManutencao = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const {
    servico,
    data_realizada,
    descricao,
    proxima_manutencao_data,
    proxima_manutencao_descricao,
  } = req.body;

  const m = await pool.query(
    "SELECT m.*, a.usuario_id FROM manutencoes m JOIN ativos a ON m.ativo_id = a.id WHERE m.id = $1",
    [id]
  );

  if (m.rows.length === 0 || m.rows[0].usuario_id !== (req as any).user.id) {
    res.status(403).json({ erro: "Sem permissão" });
    return;
  }

  await pool.query(
    `UPDATE manutencoes SET servico=$1, data_realizada=$2, descricao=$3, proxima_manutencao_data=$4, proxima_manutencao_descricao=$5 WHERE id=$6`,
    [
      servico,
      data_realizada,
      descricao,
      proxima_manutencao_data,
      proxima_manutencao_descricao,
      id,
    ]
  );
  res.json({ mensagem: "Manutenção atualizada" });
};

export const deletarManutencao = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const m = await pool.query(
    "SELECT m.*, a.usuario_id FROM manutencoes m JOIN ativos a ON m.ativo_id = a.id WHERE m.id = $1",
    [id]
  );

  if (m.rows.length === 0 || m.rows[0].usuario_id !== (req as any).user.id) {
    res.status(403).json({ erro: "Sem permissão" });
    return;
  }

  await pool.query("DELETE FROM manutencoes WHERE id = $1", [id]);
  res.json({ mensagem: "Manutenção excluída" });
};
