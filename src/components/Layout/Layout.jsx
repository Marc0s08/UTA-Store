import "./Layout.css";
import Navbar from "../Navbar/Navbar";
import CartMessage from "../CartMessage/CartMessage";
import { Outlet, useLocation } from "react-router-dom";

export default function Layout() {
  const location = useLocation();

  // Verifica se a rota atual começa com "/admin"
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {/* Esconde a Navbar principal se estiver no Admin */}
      {!isAdminRoute && <Navbar />}

      {/* Esconde a mensagem do carrinho se estiver no Admin */}
      {!isAdminRoute && <CartMessage />}

      <main className="layout-content">
        <Outlet />
      </main>
    </>
  );
}