import React from "react";
import { Container, Typography, Button, Box, Stack } from "@mui/material";

export default function HomePage({ onLogin, onRegister }) {
  return (
    <Box
      sx={{
        backgroundColor: "#DCD7C9",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 4,
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          backgroundColor: "#fff",
          borderRadius: 2,
          padding: 4,
          boxShadow: 4,
          textAlign: "center",
        }}
      >
        <Typography variant="h3" fontWeight="bold" gutterBottom color="primary">
          Assistente de Manutenção
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Registre seus equipamentos, cadastre manutenções e receba alertas.
        </Typography>
        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          sx={{ mt: 4 }}
        >
          <Button variant="contained" onClick={onRegister}>
            Criar Conta
          </Button>
          <Button variant="outlined" onClick={onLogin}>
            Login
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
