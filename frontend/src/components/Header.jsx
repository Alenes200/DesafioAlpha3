import { AppBar, Toolbar, Typography } from "@mui/material";

export default function Header() {
  return (
    <AppBar position="static" color="default" elevation={0}>
      <Toolbar>
        <Typography variant="h6" color="inherit" noWrap>
          Assistente de Manutenção
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
