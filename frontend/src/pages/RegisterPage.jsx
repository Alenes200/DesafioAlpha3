import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from "@mui/material";

export default function RegisterPage({ onVoltar, onRegistroSucesso }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const registrar = async () => {
    setErro("");
    try {
      const res = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErro(data.erro || "Erro ao registrar");
        return;
      }

      onRegistroSucesso();
    } catch {
      setErro("Erro ao conectar com o servidor");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Registrar
      </Typography>
      {erro && <Alert severity="error">{erro}</Alert>}
      <TextField
        fullWidth
        label="Nome"
        margin="normal"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />
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
        <Button variant="contained" onClick={registrar}>
          Registrar
        </Button>
        <Button sx={{ ml: 2 }} onClick={onVoltar}>
          Voltar
        </Button>
      </Box>
    </Container>
  );
}
