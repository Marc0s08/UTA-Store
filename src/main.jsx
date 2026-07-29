import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter } from "react-router-dom";

import { ThemeProvider } from "@mui/material/styles";

import CssBaseline from "@mui/material/CssBaseline";

import theme from "./styles/theme";

import "./styles/global.css";

import "@fontsource/poppins";

import App from "./App";
import {AuthProvider} from "./context/AuthContext";
import {
    CartProvider
} from "./context/CartContext";

ReactDOM.createRoot(document.getElementById("root")).render(

    <BrowserRouter>

        <ThemeProvider theme={theme}>

            <CssBaseline/>

            <AuthProvider>

    <CartProvider>

        <App/>

    </CartProvider>

</AuthProvider>
        </ThemeProvider>

    </BrowserRouter>

);