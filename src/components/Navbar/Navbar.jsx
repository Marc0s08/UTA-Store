import { useState, useEffect, useRef } from "react";
import "./Navbar.css";

import Logo from "./Logo";
import SearchBar from "./SearchBar";
import CartButton from "./CartButton";
import UserMenu from "./UserMenu";
import NavMenu from "./NavMenu";
import OrdersButton from "./OrdersButton";
import AdminButton from "./AdminButton";

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef(null);

  const toggleDrawer = () => setDrawerOpen((prev) => !prev);
  const closeDrawer = () => setDrawerOpen(false);

  // Fecha ao pressionar ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Trava scroll quando a gaveta está aberta
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClick(event) {
      if (
        drawerOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(event.target)
      ) {
        closeDrawer();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [drawerOpen]);

  return (
    <>
      <header className="navbar">
        <div className="navbar-container">
          {/* LOGO ESQUERDA */}
          <div className="navbar-logo">
            <Logo />
          </div>

          {/* BARRA DE PESQUISA AMAPLIADA */}
          <div className="navbar-center">
            <SearchBar />
          </div>

          {/* BOTÃO DA GAVETA */}
          <div className="navbar-right">
            <button
              className="drawer-toggle-btn"
              onClick={toggleDrawer}
              aria-label="Abrir Menu"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* OVERLAY ESCURO */}
      <div
        className={`navbar-overlay ${drawerOpen ? "active" : ""}`}
        onClick={closeDrawer}
      />

      {/* GAVETA LATERAL DIREITA */}
      <aside
        ref={drawerRef}
        className={`mobile-drawer ${drawerOpen ? "active" : ""}`}
      >
        <div className="drawer-header">
          <h3>Menu</h3>
          <button className="drawer-close" onClick={closeDrawer}>
            ✕
          </button>
        </div>

        <div className="drawer-content">
          {/* Categorias / Navegação */}
          <nav className="drawer-nav">
            <NavMenu onItemClick={closeDrawer} />
          </nav>

          <div className="drawer-divider" />

          {/* ÍCONES ORGANIZADOS VERTICALMENTE */}
          <div className="drawer-icons-list">
            <div className="drawer-icon-item">
              <UserMenu />
            </div>
            <div className="drawer-icon-item">
              <CartButton />
            </div>
            <div className="drawer-icon-item">
              <OrdersButton />
            </div>
            <div className="drawer-icon-item">
              <AdminButton />
            </div>
          </div>
        </div>

        <div className="drawer-footer">
          <p>UTA STORE © {new Date().getFullYear()}</p>
          <small>Equipamentos • Airsoft • Acessórios</small>
        </div>
      </aside>
    </>
  );
}