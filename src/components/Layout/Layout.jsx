import "./Layout.css";
import Navbar from "../Navbar/Navbar";
import CartMessage from "../CartMessage/CartMessage";
import { Outlet, useLocation } from "react-router-dom";

export default function Layout() {
  const location = useLocation();

  // Identifica se a URL atual pertence ao Admin
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {/* Passa a propriedade isAdmin para controlar a exibição do menu lateral mobile */}
      <Navbar isAdmin={isAdminRoute} />

      {/* Oculta mensagens promocionais/carrinho enquanto navega no painel Admin */}
      {!isAdminRoute && <CartMessage />}

      <main className="layout-content">
        <Outlet />
      </main>
    </>
  );
}