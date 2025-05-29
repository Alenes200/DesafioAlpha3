import { Request, Response } from "express";
import { pool } from "../config/db";

// Interface para tipar a linha retornada pela query
interface AlertaRow {
  nome_ativo: string;
  servico: string;
  proxima_manutencao_data: string; // Esperamos 'YYYY-MM-DD' do banco
}

export const obterAlertas = async (
  req: Request,
  res: Response
): Promise<void> => {
  const usuarioId = (req as any).user.id;

  try {
    const result = await pool.query<AlertaRow>(
      `
      SELECT 
        a.nome AS nome_ativo, 
        m.servico, 
        TO_CHAR(m.proxima_manutencao_data, 'YYYY-MM-DD') AS proxima_manutencao_data 
      FROM ativos a
      JOIN manutencoes m ON a.id = m.ativo_id
      WHERE a.usuario_id = $1 AND m.proxima_manutencao_data IS NOT NULL
      ORDER BY m.proxima_manutencao_data ASC
    `,
      [usuarioId]
    );

    // Obter a data atual em UTC, zerando horas, minutos, segundos e milissegundos
    const agora = new Date();
    const hojeUTC = new Date(
      Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate())
    );

    const vencidas: AlertaRow[] = [];
    const proximas: AlertaRow[] = [];

    for (const row of result.rows) {
      // row.proxima_manutencao_data é uma string 'YYYY-MM-DD'
      if (!row.proxima_manutencao_data) {
        continue;
      }

      // Parse da string 'YYYY-MM-DD' para um objeto Date em UTC (meia-noite UTC)
      const [year, month, day] = row.proxima_manutencao_data
        .split("-")
        .map(Number);
      const dataManutencaoUTC = new Date(Date.UTC(year, month - 1, day)); // Mês é 0-indexado para Date.UTC

      // Comparação baseada em milissegundos (ambas são datas UTC na meia-noite)
      const diffTime = dataManutencaoUTC.getTime() - hojeUTC.getTime();
      // Converte a diferença para dias. Math.floor é crucial.
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        // Se a data da manutenção for antes de hoje (negativo)
        vencidas.push(row);
      } else if (diffDays >= 0 && diffDays <= 7) {
        // Se for hoje (0) ou nos próximos 7 dias
        proximas.push(row);
      }
    }

    res.json({ vencidas, proximas });
  } catch (error) {
    console.error("Erro ao obter alertas:", error);
    res.status(500).json({ erro: "Erro interno ao buscar alertas." });
  }
};
