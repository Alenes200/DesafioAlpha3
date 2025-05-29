import { useState, useEffect } from "react";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserDashboard from "./pages/UserDashboard";

export default function App() {
  const [pagina, setPagina] = useState("home");
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const nome = localStorage.getItem("nome");
    if (token && nome) {
      setUsuario({ token, nome });
      setPagina("dashboard");
    }
  }, []);

  const sair = () => {
    localStorage.clear();
    setUsuario(null);
    setPagina("home");
  };

  return (
    <>
      {pagina === "home" && (
        <HomePage
          onLogin={() => setPagina("login")}
          onRegister={() => setPagina("register")}
        />
      )}
      {pagina === "login" && (
        <LoginPage
          onVoltar={() => setPagina("home")}
          onLoginSucesso={(dados) => {
            setUsuario(dados);
            setPagina("dashboard");
          }}
        />
      )}
      {pagina === "register" && (
        <RegisterPage
          onVoltar={() => setPagina("home")}
          onRegistroSucesso={() => setPagina("login")}
        />
      )}
      {pagina === "dashboard" && (
        <UserDashboard usuario={usuario} onSair={sair} />
      )}
    </>
  );
}
