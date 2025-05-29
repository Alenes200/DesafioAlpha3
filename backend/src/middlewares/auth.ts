import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const autenticarToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    res.status(401).json({ erro: "Token não fornecido" });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, usuario: any) => {
    if (err) {
      res.status(403).json({ erro: "Token inválido" });
      return;
    }
    (req as any).user = { id: usuario.id, email: usuario.email };
    next();
  });
};
