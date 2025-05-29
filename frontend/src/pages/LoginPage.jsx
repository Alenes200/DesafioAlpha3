import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from "@mui/material";

export default function LoginPage({ onVoltar, onLoginSucesso }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const logar = async () => {
    setErro("");
    try {
      const res = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErro(data.erro || "Erro ao fazer login");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("nome", data.nome);
      onLoginSucesso({ token: data.token, nome: data.nome });
    } catch {
      setErro("Erro ao conectar com o servidor");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      {erro && <Alert severity="error">{erro}</Alert>}
      <TextField
        fullWidth
        label="Email"
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        fullWidth
        label="Senha"
        type="password"
        margin="normal"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      />
      <Box sx={{ mt: 2 }}>
        <Button variant="contained" onClick={logar}>
          Entrar
        </Button>
        <Button sx={{ ml: 2 }} onClick={onVoltar}>
          Voltar
        </Button>
      </Box>
    </Container>
  );
}
