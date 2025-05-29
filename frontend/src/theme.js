import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#A27B5C",
    },
    secondary: {
      main: "#3F4E4F",
    },
    background: {
      default: "#DCD7C9",
      paper: "#ffffff",
    },
    text: {
      primary: "#2C3639",
    },
  },
  typography: {
    fontFamily: "Arial, sans-serif",
  },
});

export default theme;
