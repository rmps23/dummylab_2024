"use client";
import { Chakra_Petch } from "next/font/google";
import { createTheme } from "@mui/material/styles";

const chakra = Chakra_Petch({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const theme = createTheme({
  typography: {
    fontFamily: chakra.style.fontFamily,
  },
  palette: {
    mode: "dark",
  },
});

export default theme;
