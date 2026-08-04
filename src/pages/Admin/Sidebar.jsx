import { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

import {
  Dashboard,
  Inventory,
  Category,
  ShoppingCart,
  People,
  LocalOffer,
  Image,
  Settings,
  Menu as MenuIcon,
  Close as CloseIcon
} from "@mui/icons-material";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Botão Hambúrguer visível apenas em telas menores */}
      <button 
        className="mobile-toggle-btn" 
        onClick={toggleSidebar}
        aria-label="Abrir Menu"
      >
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/* Overlay escuro de fundo no mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      <aside className={`admin-sidebar ${isOpen ? "open" : ""}`}>
        <div className="admin-logo">
          UTA STORE
          <span>ADMIN</span>
        </div>

        <nav>
          <NavLink to="/admin" end onClick={closeSidebar}>
            <Dashboard />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/admin/produtos" onClick={closeSidebar}>
            <Inventory />
            <span>Produtos</span>
          </NavLink>

          <NavLink to="/admin/categorias" onClick={closeSidebar}>
            <Category />
            <span>Categorias</span>
          </NavLink>

          <NavLink to="/admin/pedidos" onClick={closeSidebar}>
            <ShoppingCart />
            <span>Pedidos</span>
          </NavLink>

          <NavLink to="/admin/clientes" onClick={closeSidebar}>
            <People />
            <span>Clientes</span>
          </NavLink>

          <NavLink to="/admin/cupons" onClick={closeSidebar}>
            <LocalOffer />
            <span>Cupons</span>
          </NavLink>

          <NavLink to="/admin/banners" onClick={closeSidebar}>
            <Image />
            <span>Banners</span>
          </NavLink>

          <NavLink to="/admin/configuracoes" onClick={closeSidebar}>
            <Settings />
            <span>Configurações</span>
          </NavLink>
        </nav>
      </aside>
    </>
  );
}