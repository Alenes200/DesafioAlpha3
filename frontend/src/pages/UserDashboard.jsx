import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  Modal,
  TextField,
  Stack,
  Paper,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BuildIcon from "@mui/icons-material/Build";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import EventNoteIcon from "@mui/icons-material/EventNote";
import CloseIcon from "@mui/icons-material/Close";

const API_BASE_URL = "http://localhost:3001";

// Função helper para chamadas API
const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = {
        erro: `Erro na API: ${response.statusText} (Status: ${response.status})`,
        detalhes: "Não foi possível obter detalhes do erro.",
      };
    }
    const error = new Error(
      errorData.erro || `Erro na API: ${response.statusText}`
    );
    error.response = response;
    error.data = errorData;
    throw error;
  }

  if (
    response.status === 204 ||
    response.headers.get("content-length") === "0"
  ) {
    return null;
  }
  try {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }
    return null;
  } catch (e) {
    console.warn(
      "Resposta da API não era JSON válido, mas status OK:",
      response.status,
      url
    );
    return null;
  }
};

// ESTILOS SUAVES E SEM ROLAGEM EXCESSIVA
const styleModal = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "98%", sm: 500, md: 600 },
  bgcolor: "background.paper",
  borderRadius: 4,
  boxShadow: 24,
  p: { xs: 3, sm: 4, md: 5 },
  outline: "none",
  maxHeight: "90vh",
  overflowY: "auto",
};

const styleModalManutencoes = {
  ...styleModal,
  width: { xs: "98%", sm: "90%", md: "900px" },
};

export default function UserDashboard({ usuario, onSair }) {
  // Alertas
  const [alertasVencidas, setAlertasVencidas] = useState([]);
  const [alertasProximas, setAlertasProximas] = useState([]);
  const [loadingAlertas, setLoadingAlertas] = useState(true);
  const [erroAlertas, setErroAlertas] = useState("");

  // Ativos
  const [ativos, setAtivos] = useState([]);
  const [loadingAtivos, setLoadingAtivos] = useState(true);
  const [erroAtivos, setErroAtivos] = useState("");

  // Modal Criar Ativo
  const [modalCriarAtivoAberto, setModalCriarAtivoAberto] = useState(false);
  const [novoAtivoNome, setNovoAtivoNome] = useState("");
  const [novoAtivoDescricao, setNovoAtivoDescricao] = useState("");
  const [erroModalCriarAtivo, setErroModalCriarAtivo] = useState("");
  const [submittingModalCriarAtivo, setSubmittingModalCriarAtivo] =
    useState(false);

  // Modal Editar Ativo
  const [modalEditarAtivoAberto, setModalEditarAtivoAberto] = useState(false);
  const [ativoParaEditar, setAtivoParaEditar] = useState(null);
  const [editarAtivoNome, setEditarAtivoNome] = useState("");
  const [editarAtivoDescricao, setEditarAtivoDescricao] = useState("");
  const [erroModalEditarAtivo, setErroModalEditarAtivo] = useState("");
  const [submittingModalEditarAtivo, setSubmittingModalEditarAtivo] =
    useState(false);

  // Modal Deletar Ativo
  const [modalDeletarAtivoAberto, setModalDeletarAtivoAberto] = useState(false);
  const [ativoParaDeletar, setAtivoParaDeletar] = useState(null);
  const [submittingModalDeletarAtivo, setSubmittingModalDeletarAtivo] =
    useState(false);
  const [erroModalDeletarAtivo, setErroModalDeletarAtivo] = useState("");

  // Modal Manutenções do Ativo (Listagem)
  const [modalManutencoesAberto, setModalManutencoesAberto] = useState(false);
  const [ativoSelecionadoManutencoes, setAtivoSelecionadoManutencoes] =
    useState(null);
  const [manutencoesDoAtivo, setManutencoesDoAtivo] = useState([]);
  const [loadingManutencoesAtivo, setLoadingManutencoesAtivo] = useState(false);
  const [erroManutencoesAtivo, setErroManutencoesAtivo] = useState("");

  // Modal Criar/Editar Manutenção (Unificado)
  const [modalFormManutencaoAberto, setModalFormManutencaoAberto] =
    useState(false);
  const initialFormManutencao = {
    servico: "",
    data_realizada: "",
    descricao: "",
    proxima_manutencao_data: "",
    proxima_manutencao_descricao: "",
  };
  const [formManutencao, setFormManutencao] = useState(initialFormManutencao);
  const [manutencaoParaEditar, setManutencaoParaEditar] = useState(null);
  const [erroModalFormManutencao, setErroModalFormManutencao] = useState("");
  const [submittingModalFormManutencao, setSubmittingModalFormManutencao] =
    useState(false);

  // Modal Deletar Manutenção
  const [modalDeletarManutencaoAberto, setModalDeletarManutencaoAberto] =
    useState(false);
  const [manutencaoParaDeletar, setManutencaoParaDeletar] = useState(null);
  const [
    submittingModalDeletarManutencao,
    setSubmittingModalDeletarManutencao,
  ] = useState(false);
  const [erroModalDeletarManutencao, setErroModalDeletarManutencao] =
    useState("");

  // --- Funções de Busca ---
  const fetchAlertas = useCallback(async () => {
    setLoadingAlertas(true);
    setErroAlertas("");
    try {
      const data = await apiFetch("/api/dashboard/alertas");
      setAlertasVencidas(data.vencidas || []);
      setAlertasProximas(data.proximas || []);
    } catch (error) {
      setErroAlertas(error.data?.erro || "Falha ao buscar alertas.");
    } finally {
      setLoadingAlertas(false);
    }
  }, []);

  const fetchAtivos = useCallback(async () => {
    setLoadingAtivos(true);
    setErroAtivos("");
    try {
      const data = await apiFetch("/api/ativos");
      setAtivos(data || []);
    } catch (error) {
      setErroAtivos(error.data?.erro || "Falha ao buscar ativos.");
    } finally {
      setLoadingAtivos(false);
    }
  }, []);

  useEffect(() => {
    if (usuario?.token) {
      fetchAlertas();
      fetchAtivos();
    }
  }, [usuario, fetchAlertas, fetchAtivos]);

  // --- Funções Auxiliares de Data ---
  const formatarDataParaInput = (dataIso) => {
    if (!dataIso) return "";
    return dataIso.split("T")[0];
  };

  const formatarDataParaExibicao = (dataStringYYYYMMDD) => {
    if (!dataStringYYYYMMDD) return "N/A";
    const [year, month, day] = dataStringYYYYMMDD.split("-");
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    ).toLocaleDateString("pt-BR", { timeZone: "UTC" });
  };

  // --- CRUD Ativos ---
  const abrirModalCriarAtivo = () => {
    setNovoAtivoNome("");
    setNovoAtivoDescricao("");
    setErroModalCriarAtivo("");
    setModalCriarAtivoAberto(true);
  };
  const fecharModalCriarAtivo = () => setModalCriarAtivoAberto(false);
  const handleCriarAtivo = async () => {
    if (!novoAtivoNome.trim()) {
      setErroModalCriarAtivo("O nome do ativo é obrigatório.");
      return;
    }
    setErroModalCriarAtivo("");
    setSubmittingModalCriarAtivo(true);
    try {
      await apiFetch("/api/ativos", {
        method: "POST",
        body: JSON.stringify({
          nome: novoAtivoNome,
          descricao: novoAtivoDescricao,
        }),
      });
      fecharModalCriarAtivo();
      fetchAtivos();
      fetchAlertas();
    } catch (error) {
      setErroModalCriarAtivo(error.data?.erro || "Falha ao criar ativo.");
    } finally {
      setSubmittingModalCriarAtivo(false);
    }
  };

  const abrirModalEditarAtivo = (ativo) => {
    setAtivoParaEditar(ativo);
    setEditarAtivoNome(ativo.nome);
    setEditarAtivoDescricao(ativo.descricao || "");
    setErroModalEditarAtivo("");
    setModalEditarAtivoAberto(true);
  };
  const fecharModalEditarAtivo = () => setModalEditarAtivoAberto(false);
  const handleEditarAtivo = async () => {
    if (!editarAtivoNome.trim()) {
      setErroModalEditarAtivo("O nome do ativo é obrigatório.");
      return;
    }
    setErroModalEditarAtivo("");
    setSubmittingModalEditarAtivo(true);
    try {
      await apiFetch(`/api/ativos/${ativoParaEditar.id}`, {
        method: "PUT",
        body: JSON.stringify({
          nome: editarAtivoNome,
          descricao: editarAtivoDescricao,
        }),
      });
      fecharModalEditarAtivo();
      fetchAtivos();
      fetchAlertas();
    } catch (error) {
      setErroModalEditarAtivo(error.data?.erro || "Falha ao editar ativo.");
    } finally {
      setSubmittingModalEditarAtivo(false);
    }
  };

  const abrirModalDeletarAtivo = (ativo) => {
    setAtivoParaDeletar(ativo);
    setErroModalDeletarAtivo("");
    setModalDeletarAtivoAberto(true);
  };
  const fecharModalDeletarAtivo = () => setModalDeletarAtivoAberto(false);
  const handleDeletarAtivo = async () => {
    if (!ativoParaDeletar) return;
    setSubmittingModalDeletarAtivo(true);
    setErroModalDeletarAtivo("");
    try {
      await apiFetch(`/api/ativos/${ativoParaDeletar.id}`, {
        method: "DELETE",
      });
      fecharModalDeletarAtivo();
      fetchAtivos();
      fetchAlertas();
    } catch (error) {
      setErroModalDeletarAtivo(error.data?.erro || "Falha ao deletar ativo.");
    } finally {
      setSubmittingModalDeletarAtivo(false);
    }
  };

  // --- Manutenções ---
  const fetchManutencoesDoAtivo = useCallback(async (ativoId) => {
    setLoadingManutencoesAtivo(true);
    setErroManutencoesAtivo("");
    setManutencoesDoAtivo([]);
    try {
      const data = await apiFetch(`/api/manutencoes/ativo/${ativoId}`);
      setManutencoesDoAtivo(data || []);
    } catch (error) {
      setErroManutencoesAtivo(
        error.data?.erro || "Falha ao buscar manutenções."
      );
    } finally {
      setLoadingManutencoesAtivo(false);
    }
  }, []);

  const abrirModalManutencoes = (ativo) => {
    setAtivoSelecionadoManutencoes(ativo);
    fetchManutencoesDoAtivo(ativo.id);
    setModalManutencoesAberto(true);
  };
  const fecharModalManutencoes = () => {
    setModalManutencoesAberto(false);
    setAtivoSelecionadoManutencoes(null);
  };

  const handleChangeFormManutencao = (e) =>
    setFormManutencao({ ...formManutencao, [e.target.name]: e.target.value });

  const abrirModalFormManutencao = (manutencao = null) => {
    setManutencaoParaEditar(manutencao);
    if (manutencao) {
      setFormManutencao({
        servico: manutencao.servico,
        data_realizada: formatarDataParaInput(manutencao.data_realizada),
        descricao: manutencao.descricao || "",
        proxima_manutencao_data: formatarDataParaInput(
          manutencao.proxima_manutencao_data
        ),
        proxima_manutencao_descricao:
          manutencao.proxima_manutencao_descricao || "",
      });
    } else {
      setFormManutencao(initialFormManutencao);
    }
    setErroModalFormManutencao("");
    setModalFormManutencaoAberto(true);
  };
  const fecharModalFormManutencao = () => {
    setModalFormManutencaoAberto(false);
    setManutencaoParaEditar(null);
  };

  const handleSalvarManutencao = async () => {
    const { servico, data_realizada } = formManutencao;
    if (!ativoSelecionadoManutencoes || !servico.trim() || !data_realizada) {
      setErroModalFormManutencao("Serviço e Data Realizada são obrigatórios.");
      return;
    }
    setErroModalFormManutencao("");
    setSubmittingModalFormManutencao(true);
    const payload = {
      ...formManutencao,
      ativo_id: manutencaoParaEditar
        ? undefined
        : ativoSelecionadoManutencoes.id,
      proxima_manutencao_data: formManutencao.proxima_manutencao_data || null,
      proxima_manutencao_descricao:
        formManutencao.proxima_manutencao_descricao || null,
    };

    try {
      if (manutencaoParaEditar) {
        await apiFetch(`/api/manutencoes/${manutencaoParaEditar.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/manutencoes", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      fecharModalFormManutencao();
      if (ativoSelecionadoManutencoes)
        fetchManutencoesDoAtivo(ativoSelecionadoManutencoes.id);
      fetchAlertas();
    } catch (error) {
      setErroModalFormManutencao(
        error.data?.erro || "Falha ao salvar manutenção."
      );
    } finally {
      setSubmittingModalFormManutencao(false);
    }
  };

  const abrirModalDeletarManutencao = (manutencao) => {
    setManutencaoParaDeletar(manutencao);
    setErroModalDeletarManutencao("");
    setModalDeletarManutencaoAberto(true);
  };
  const fecharModalDeletarManutencao = () =>
    setModalDeletarManutencaoAberto(false);
  const handleDeletarManutencao = async () => {
    if (!manutencaoParaDeletar) return;
    setSubmittingModalDeletarManutencao(true);
    setErroModalDeletarManutencao("");
    try {
      await apiFetch(`/api/manutencoes/${manutencaoParaDeletar.id}`, {
        method: "DELETE",
      });
      fecharModalDeletarManutencao();
      if (ativoSelecionadoManutencoes)
        fetchManutencoesDoAtivo(ativoSelecionadoManutencoes.id);
      fetchAlertas();
    } catch (error) {
      setErroModalDeletarManutencao(
        error.data?.erro || "Falha ao deletar manutenção."
      );
    } finally {
      setSubmittingModalDeletarManutencao(false);
    }
  };

  // --- Renderização ---
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontSize: { xs: "2rem", sm: "2.3rem" },
              fontWeight: 700,
              color: "primary.main",
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            Bem-vindo!
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontSize: { xs: "1.2rem", sm: "1.4rem" },
              color: "text.secondary",
              mt: 1,
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            {usuario?.nome || "Usuário"}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="secondary"
          onClick={onSair}
          size="large"
          sx={{
            px: 4,
            py: 1,
            fontSize: "1.1rem",
            borderRadius: 2,
          }}
        >
          Sair
        </Button>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Alertas */}
      <Typography
        variant="h4"
        component="h2"
        sx={{
          fontSize: { xs: "1.5rem", sm: "1.7rem" },
          fontWeight: 600,
          color: "text.primary",
          mb: 2,
          textAlign: { xs: "center", sm: "left" },
        }}
      >
        Alertas de Manutenção
      </Typography>
      {loadingAlertas && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
          <CircularProgress size={40} />
        </Box>
      )}
      {erroAlertas && (
        <Alert severity="error" sx={{ my: 2, fontSize: "1.1rem" }}>
          {erroAlertas}
        </Alert>
      )}
      {!loadingAlertas && !erroAlertas && (
        <Grid
          container
          spacing={3}
          sx={{
            flexWrap: "nowrap",
            overflowX: "auto",
            mb: 2,
            // Para garantir que os cards fiquem lado a lado mesmo em telas menores
          }}
        >
          <Grid item xs={12} sm={6} md={6} lg={6}>
            <Card elevation={3} sx={{ p: 2, minHeight: 320 }}>
              <CardContent>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ color: "error.main", mb: 1 }}
                >
                  <WarningAmberIcon sx={{ fontSize: 38 }} />
                  <Typography
                    variant="h6"
                    sx={{ fontSize: "1.5rem", fontWeight: 700 }}
                  >
                    Vencidas ({alertasVencidas.length})
                  </Typography>
                </Stack>
                {alertasVencidas.length === 0 ? (
                  <Typography
                    sx={{ mt: 2, fontSize: "1.2rem" }}
                    color="text.secondary"
                  >
                    Nenhuma manutenção vencida.
                  </Typography>
                ) : (
                  <List
                    sx={{
                      maxHeight: 240,
                      minHeight: 180,
                      overflow: "hidden",
                      mt: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    {alertasVencidas.slice(0, 4).map((alerta, index) => (
                      <ListItem
                        key={`vencida-${index}-${alerta.nome_ativo}-${alerta.servico}`}
                        sx={{ py: 1, alignItems: "flex-start" }}
                      >
                        <ListItemText
                          primary={
                            <span
                              style={{ fontSize: "1.25rem", fontWeight: 700 }}
                            >
                              {alerta.nome_ativo} - {alerta.servico}
                            </span>
                          }
                          secondary={
                            <span style={{ fontSize: "1.1rem" }}>
                              Venceu em:{" "}
                              {formatarDataParaExibicao(
                                alerta.proxima_manutencao_data
                              )}
                            </span>
                          }
                        />
                      </ListItem>
                    ))}
                    {alertasVencidas.length > 4 && (
                      <ListItem sx={{ py: 1 }}>
                        <ListItemText
                          primary={
                            <span style={{ fontSize: "1.1rem", color: "#888" }}>
                              ...e mais {alertasVencidas.length - 4} vencida(s)
                            </span>
                          }
                        />
                      </ListItem>
                    )}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={6}>
            <Card elevation={3} sx={{ p: 2, minHeight: 320 }}>
              <CardContent>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ color: "warning.main", mb: 1 }}
                >
                  <EventNoteIcon sx={{ fontSize: 38 }} />
                  <Typography
                    variant="h6"
                    sx={{ fontSize: "1.5rem", fontWeight: 700 }}
                  >
                    Próximas ({alertasProximas.length})
                  </Typography>
                </Stack>
                {alertasProximas.length === 0 ? (
                  <Typography
                    sx={{ mt: 2, fontSize: "1.2rem" }}
                    color="text.secondary"
                  >
                    Nenhuma manutenção nos próximos 7 dias.
                  </Typography>
                ) : (
                  <List
                    sx={{
                      maxHeight: 240,
                      minHeight: 180,
                      overflow: "hidden",
                      mt: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    {alertasProximas.slice(0, 4).map((alerta, index) => (
                      <ListItem
                        key={`proxima-${index}-${alerta.nome_ativo}-${alerta.servico}`}
                        sx={{ py: 1, alignItems: "flex-start" }}
                      >
                        <ListItemText
                          primary={
                            <span
                              style={{ fontSize: "1.25rem", fontWeight: 700 }}
                            >
                              {alerta.nome_ativo} - {alerta.servico}
                            </span>
                          }
                          secondary={
                            <span style={{ fontSize: "1.1rem" }}>
                              Próxima em:{" "}
                              {formatarDataParaExibicao(
                                alerta.proxima_manutencao_data
                              )}
                            </span>
                          }
                        />
                      </ListItem>
                    ))}
                    {alertasProximas.length > 4 && (
                      <ListItem sx={{ py: 1 }}>
                        <ListItemText
                          primary={
                            <span style={{ fontSize: "1.1rem", color: "#888" }}>
                              ...e mais {alertasProximas.length - 4} próxima(s)
                            </span>
                          }
                        />
                      </ListItem>
                    )}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Divider sx={{ my: 3 }} />

      {/* Seção de Ativos */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 3,
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{
            fontSize: { xs: "2rem", sm: "2.2rem" },
            fontWeight: 800,
            color: "text.primary",
          }}
        >
          Meus Ativos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddCircleOutlineIcon sx={{ fontSize: 32 }} />}
          onClick={abrirModalCriarAtivo}
          color="primary"
          size="large"
          sx={{
            fontSize: "1.3rem",
            px: 4,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 700,
          }}
        >
          Criar Novo Ativo
        </Button>
      </Box>
      {loadingAtivos && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
          <CircularProgress size={40} />
        </Box>
      )}
      {erroAtivos && (
        <Alert severity="error" sx={{ my: 2, fontSize: "1.1rem" }}>
          {erroAtivos}
        </Alert>
      )}
      {!loadingAtivos && !erroAtivos && (
        <>
          {ativos.length === 0 ? (
            <Typography
              color="text.secondary"
              sx={{ textAlign: "center", mt: 3, fontSize: "1.2rem" }}
            >
              Você ainda não cadastrou nenhum ativo.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {ativos.map((ativo) => (
                <Grid item xs={12} sm={6} md={4} key={ativo.id}>
                  <Card
                    elevation={3}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                      p: 2,
                      borderRadius: 3,
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="h6"
                        component="div"
                        color="secondary.main"
                        sx={{ fontSize: "1.5rem", fontWeight: 800, mb: 1 }}
                      >
                        {ativo.nome}
                      </Typography>
                      <Typography
                        sx={{ fontSize: "1.15rem", mb: 1 }}
                        color="text.secondary"
                        gutterBottom
                      >
                        ID: {ativo.id}
                      </Typography>
                      <Typography variant="body1" sx={{ fontSize: "1.2rem" }}>
                        {ativo.descricao || "Sem descrição."}
                      </Typography>
                    </CardContent>
                    <CardActions
                      sx={{
                        justifyContent: "space-around",
                        borderTop: "1px solid #eee",
                        pt: 1,
                      }}
                    >
                      <Tooltip title="Gerenciar Manutenções">
                        <Button
                          size="large"
                          startIcon={<BuildIcon sx={{ fontSize: 26 }} />}
                          onClick={() => abrirModalManutencoes(ativo)}
                          sx={{ fontSize: "1.1rem", fontWeight: 700 }}
                        >
                          Manutenções
                        </Button>
                      </Tooltip>
                      <Tooltip title="Editar Ativo">
                        <IconButton
                          size="large"
                          onClick={() => abrirModalEditarAtivo(ativo)}
                          color="primary"
                        >
                          <EditIcon sx={{ fontSize: 26 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir Ativo">
                        <IconButton
                          size="large"
                          onClick={() => abrirModalDeletarAtivo(ativo)}
                          color="error"
                        >
                          <DeleteIcon sx={{ fontSize: 26 }} />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Modais de Ativos */}
      <Modal
        open={modalCriarAtivoAberto}
        onClose={submittingModalCriarAtivo ? undefined : fecharModalCriarAtivo}
        aria-labelledby="modal-criar-ativo-titulo"
      >
        <Paper sx={styleModal}>
          <Typography
            id="modal-criar-ativo-titulo"
            variant="h4"
            component="h2"
            sx={{
              mb: 2,
              color: "primary.main",
              fontSize: "1.7rem",
              fontWeight: 700,
            }}
          >
            Criar Novo Ativo
          </Typography>
          {erroModalCriarAtivo && (
            <Alert severity="error" sx={{ mb: 2, fontSize: "1.1rem" }}>
              {erroModalCriarAtivo}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Nome do Ativo"
            margin="normal"
            value={novoAtivoNome}
            onChange={(e) => setNovoAtivoNome(e.target.value)}
            disabled={submittingModalCriarAtivo}
            autoFocus
            InputProps={{ style: { fontSize: "1.2rem", padding: 14 } }}
            InputLabelProps={{ style: { fontSize: "1.1rem" } }}
          />
          <TextField
            fullWidth
            label="Descrição (opcional)"
            margin="normal"
            multiline
            rows={3}
            value={novoAtivoDescricao}
            onChange={(e) => setNovoAtivoDescricao(e.target.value)}
            disabled={submittingModalCriarAtivo}
            InputProps={{ style: { fontSize: "1.2rem", padding: 14 } }}
            InputLabelProps={{ style: { fontSize: "1.1rem" } }}
          />
          <Stack
            direction="row"
            spacing={2}
            sx={{ mt: 3 }}
            justifyContent="flex-end"
          >
            <Button
              onClick={fecharModalCriarAtivo}
              disabled={submittingModalCriarAtivo}
              color="secondary"
              sx={{ fontSize: "1.1rem", px: 3, py: 1 }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleCriarAtivo}
              disabled={submittingModalCriarAtivo || !novoAtivoNome.trim()}
              color="primary"
              sx={{ fontSize: "1.1rem", px: 3, py: 1 }}
            >
              {submittingModalCriarAtivo ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Salvar"
              )}
            </Button>
          </Stack>
        </Paper>
      </Modal>
      <Modal
        open={modalEditarAtivoAberto}
        onClose={
          submittingModalEditarAtivo ? undefined : fecharModalEditarAtivo
        }
        aria-labelledby="modal-editar-ativo-titulo"
      >
        <Paper sx={styleModal}>
          <Typography
            id="modal-editar-ativo-titulo"
            variant="h4"
            component="h2"
            sx={{
              mb: 2,
              color: "primary.main",
              fontSize: "1.7rem",
              fontWeight: 700,
            }}
          >
            Editar Ativo
          </Typography>
          {erroModalEditarAtivo && (
            <Alert severity="error" sx={{ mb: 2, fontSize: "1.1rem" }}>
              {erroModalEditarAtivo}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Nome do Ativo"
            margin="normal"
            value={editarAtivoNome}
            onChange={(e) => setEditarAtivoNome(e.target.value)}
            disabled={submittingModalEditarAtivo}
            autoFocus
            InputProps={{ style: { fontSize: "1.2rem", padding: 14 } }}
            InputLabelProps={{ style: { fontSize: "1.1rem" } }}
          />
          <TextField
            fullWidth
            label="Descrição (opcional)"
            margin="normal"
            multiline
            rows={3}
            value={editarAtivoDescricao}
            onChange={(e) => setEditarAtivoDescricao(e.target.value)}
            disabled={submittingModalEditarAtivo}
            InputProps={{ style: { fontSize: "1.2rem", padding: 14 } }}
            InputLabelProps={{ style: { fontSize: "1.1rem" } }}
          />
          <Stack
            direction="row"
            spacing={2}
            sx={{ mt: 3 }}
            justifyContent="flex-end"
          >
            <Button
              onClick={fecharModalEditarAtivo}
              disabled={submittingModalEditarAtivo}
              color="secondary"
              sx={{ fontSize: "1.1rem", px: 3, py: 1 }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleEditarAtivo}
              disabled={submittingModalEditarAtivo || !editarAtivoNome.trim()}
              color="primary"
              sx={{ fontSize: "1.1rem", px: 3, py: 1 }}
            >
              {submittingModalEditarAtivo ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </Stack>
        </Paper>
      </Modal>
      <Modal
        open={modalDeletarAtivoAberto}
        onClose={
          submittingModalDeletarAtivo ? undefined : fecharModalDeletarAtivo
        }
        aria-labelledby="modal-deletar-ativo-titulo"
      >
        <Paper sx={styleModal}>
          <Typography
            id="modal-deletar-ativo-titulo"
            variant="h4"
            component="h2"
            sx={{ mb: 2, fontSize: "1.7rem", fontWeight: 700 }}
          >
            Confirmar Exclusão
          </Typography>
          {erroModalDeletarAtivo && (
            <Alert severity="error" sx={{ mb: 2, fontSize: "1.1rem" }}>
              {erroModalDeletarAtivo}
            </Alert>
          )}
          <Typography sx={{ fontSize: "1.1rem" }}>
            Tem certeza que deseja excluir o ativo "{ativoParaDeletar?.nome}"?
          </Typography>
          <Typography
            variant="caption"
            display="block"
            color="text.secondary"
            sx={{ mt: 2, fontSize: "1rem" }}
          >
            Esta ação não pode ser desfeita e excluirá todas as manutenções
            associadas.
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            sx={{ mt: 3 }}
            justifyContent="flex-end"
          >
            <Button
              onClick={fecharModalDeletarAtivo}
              disabled={submittingModalDeletarAtivo}
              color="secondary"
              sx={{ fontSize: "1.1rem", px: 3, py: 1 }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleDeletarAtivo}
              disabled={submittingModalDeletarAtivo}
              color="error"
              sx={{ fontSize: "1.1rem", px: 3, py: 1 }}
            >
              {submittingModalDeletarAtivo ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Excluir"
              )}
            </Button>
          </Stack>
        </Paper>
      </Modal>

      {/* Modal Lista de Manutenções */}
      {ativoSelecionadoManutencoes && (
        <Modal
          open={modalManutencoesAberto}
          onClose={fecharModalManutencoes}
          aria-labelledby="modal-manutencoes-titulo"
        >
          <Paper sx={styleModalManutencoes}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
                borderBottom: "1px solid #ddd",
                pb: 1,
              }}
            >
              <Typography
                id="modal-manutencoes-titulo"
                variant="h4"
                component="h2"
                color="primary.main"
                sx={{ fontSize: "1.5rem", fontWeight: 700 }}
              >
                Manutenções de: {ativoSelecionadoManutencoes?.nome}
              </Typography>
              <IconButton onClick={fecharModalManutencoes} size="large">
                <CloseIcon sx={{ fontSize: 28 }} />
              </IconButton>
            </Box>
            {erroManutencoesAtivo && (
              <Alert severity="error" sx={{ mb: 2, fontSize: "1.1rem" }}>
                {erroManutencoesAtivo}
              </Alert>
            )}
            <Button
              variant="contained"
              startIcon={<AddCircleOutlineIcon sx={{ fontSize: 22 }} />}
              onClick={() => abrirModalFormManutencao()}
              sx={{ mb: 2, fontSize: "1.1rem", px: 3, py: 1 }}
              size="large"
            >
              Adicionar Manutenção
            </Button>
            {loadingManutencoesAtivo && (
              <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
                <CircularProgress size={32} />
              </Box>
            )}
            {!loadingManutencoesAtivo && !erroManutencoesAtivo && (
              <>
                {manutencoesDoAtivo.length === 0 ? (
                  <Typography
                    color="text.secondary"
                    sx={{ textAlign: "center", mt: 2, fontSize: "1.1rem" }}
                  >
                    Nenhuma manutenção registrada.
                  </Typography>
                ) : (
                  <List>
                    {manutencoesDoAtivo.map((manutencao) => (
                      <ListItem
                        key={manutencao.id}
                        divider
                        sx={{ py: 1.5 }}
                        secondaryAction={
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Editar Manutenção">
                              <IconButton
                                edge="end"
                                size="large"
                                onClick={() =>
                                  abrirModalFormManutencao(manutencao)
                                }
                              >
                                <EditIcon sx={{ fontSize: 22 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Excluir Manutenção">
                              <IconButton
                                edge="end"
                                size="large"
                                onClick={() =>
                                  abrirModalDeletarManutencao(manutencao)
                                }
                              >
                                <DeleteIcon fontSize="medium" color="error" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        }
                      >
                        <ListItemText
                          primary={
                            <span
                              style={{ fontSize: "1.2rem", fontWeight: 600 }}
                            >
                              {manutencao.servico} -{" "}
                              {formatarDataParaExibicao(
                                formatarDataParaInput(manutencao.data_realizada)
                              )}
                            </span>
                          }
                          secondary={
                            <>
                              <Typography
                                component="span"
                                variant="body1"
                                color="text.primary"
                                sx={{ display: "block", fontSize: "1rem" }}
                              >
                                {manutencao.descricao ||
                                  "Sem descrição detalhada."}
                              </Typography>
                              {manutencao.proxima_manutencao_data && (
                                <Typography
                                  component="span"
                                  variant="caption"
                                  color={
                                    new Date(
                                      formatarDataParaInput(
                                        manutencao.proxima_manutencao_data
                                      )
                                    ) <
                                    new Date(
                                      new Date().toISOString().split("T")[0]
                                    )
                                      ? "error"
                                      : "text.secondary"
                                  }
                                  sx={{
                                    display: "block",
                                    mt: 1,
                                    fontSize: "0.95rem",
                                  }}
                                >
                                  Próxima:{" "}
                                  {formatarDataParaExibicao(
                                    formatarDataParaInput(
                                      manutencao.proxima_manutencao_data
                                    )
                                  )}
                                  {manutencao.proxima_manutencao_descricao
                                    ? ` - ${manutencao.proxima_manutencao_descricao}`
                                    : ""}
                                </Typography>
                              )}
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </>
            )}
          </Paper>
        </Modal>
      )}

      {/* Modal Criar/Editar Manutenção */}
      <Modal
        open={modalFormManutencaoAberto}
        onClose={
          submittingModalFormManutencao ? undefined : fecharModalFormManutencao
        }
        aria-labelledby="modal-manutencao-form-titulo"
      >
        <Paper sx={styleModal}>
          <Typography
            id="modal-manutencao-form-titulo"
            variant="h4"
            component="h2"
            sx={{
              mb: 2,
              color: "primary.main",
              fontSize: "1.7rem",
              fontWeight: 700,
            }}
          >
            {manutencaoParaEditar ? "Editar Manutenção" : "Nova Manutenção"}{" "}
            para: {ativoSelecionadoManutencoes?.nome}
          </Typography>
          {erroModalFormManutencao && (
            <Alert severity="error" sx={{ mb: 2, fontSize: "1.1rem" }}>
              {erroModalFormManutencao}
            </Alert>
          )}
          <TextField
            fullWidth
            name="servico"
            label="Serviço Realizado *"
            margin="dense"
            value={formManutencao.servico}
            onChange={handleChangeFormManutencao}
            disabled={submittingModalFormManutencao}
            autoFocus
            InputProps={{ style: { fontSize: "1.2rem", padding: 14 } }}
            InputLabelProps={{ style: { fontSize: "1.1rem" } }}
          />
          <TextField
            fullWidth
            name="data_realizada"
            label="Data Realizada *"
            type="date"
            InputLabelProps={{ shrink: true, style: { fontSize: "1.1rem" } }}
            margin="dense"
            value={formManutencao.data_realizada}
            onChange={handleChangeFormManutencao}
            disabled={submittingModalFormManutencao}
            InputProps={{ style: { fontSize: "1.2rem", padding: 14 } }}
          />
          <TextField
            fullWidth
            name="descricao"
            label="Descrição Detalhada"
            margin="dense"
            multiline
            rows={3}
            value={formManutencao.descricao}
            onChange={handleChangeFormManutencao}
            disabled={submittingModalFormManutencao}
            InputProps={{ style: { fontSize: "1.2rem", padding: 14 } }}
            InputLabelProps={{ style: { fontSize: "1.1rem" } }}
          />
          <TextField
            fullWidth
            name="proxima_manutencao_data"
            label="Próxima Manutenção (Data)"
            type="date"
            InputLabelProps={{ shrink: true, style: { fontSize: "1.1rem" } }}
            margin="dense"
            value={formManutencao.proxima_manutencao_data}
            onChange={handleChangeFormManutencao}
            disabled={submittingModalFormManutencao}
            InputProps={{ style: { fontSize: "1.2rem", padding: 14 } }}
          />
          <TextField
            fullWidth
            name="proxima_manutencao_descricao"
            label="Próxima Manutenção (Descrição)"
            margin="dense"
            value={formManutencao.proxima_manutencao_descricao}
            onChange={handleChangeFormManutencao}
            disabled={submittingModalFormManutencao}
            InputProps={{ style: { fontSize: "1.2rem", padding: 14 } }}
            InputLabelProps={{ style: { fontSize: "1.1rem" } }}
          />
          <Stack
            direction="row"
            spacing={2}
            sx={{ mt: 3 }}
            justifyContent="flex-end"
          >
            <Button
              onClick={fecharModalFormManutencao}
              disabled={submittingModalFormManutencao}
              color="secondary"
              sx={{ fontSize: "1.1rem", px: 3, py: 1 }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleSalvarManutencao}
              disabled={
                submittingModalFormManutencao ||
                !formManutencao.servico.trim() ||
                !formManutencao.data_realizada
              }
              color="primary"
              sx={{ fontSize: "1.1rem", px: 3, py: 1 }}
            >
              {submittingModalFormManutencao ? (
                <CircularProgress size={24} color="inherit" />
              ) : manutencaoParaEditar ? (
                "Salvar Alterações"
              ) : (
                "Salvar Manutenção"
              )}
            </Button>
          </Stack>
        </Paper>
      </Modal>

      {/* Modal Deletar Manutenção */}
      {manutencaoParaDeletar && (
        <Modal
          open={modalDeletarManutencaoAberto}
          onClose={
            submittingModalDeletarManutencao
              ? undefined
              : fecharModalDeletarManutencao
          }
          aria-labelledby="modal-deletar-manutencao-titulo"
        >
          <Paper sx={styleModal}>
            <Typography
              id="modal-deletar-manutencao-titulo"
              variant="h4"
              component="h2"
              sx={{ mb: 2, fontSize: "1.7rem", fontWeight: 700 }}
            >
              Confirmar Exclusão
            </Typography>
            {erroModalDeletarManutencao && (
              <Alert severity="error" sx={{ mb: 2, fontSize: "1.1rem" }}>
                {erroModalDeletarManutencao}
              </Alert>
            )}
            <Typography sx={{ fontSize: "1.1rem" }}>
              Tem certeza que deseja excluir a manutenção "
              {manutencaoParaDeletar?.servico}" realizada em{" "}
              {formatarDataParaExibicao(
                formatarDataParaInput(manutencaoParaDeletar?.data_realizada)
              )}
              ?
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              sx={{ mt: 3 }}
              justifyContent="flex-end"
            >
              <Button
                onClick={fecharModalDeletarManutencao}
                disabled={submittingModalDeletarManutencao}
                color="secondary"
                sx={{ fontSize: "1.1rem", px: 3, py: 1 }}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={handleDeletarManutencao}
                disabled={submittingModalDeletarManutencao}
                color="error"
                sx={{ fontSize: "1.1rem", px: 3, py: 1 }}
              >
                {submittingModalDeletarManutencao ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Excluir"
                )}
              </Button>
            </Stack>
          </Paper>
        </Modal>
      )}
    </Container>
  );
}
