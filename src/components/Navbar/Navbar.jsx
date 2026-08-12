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
  const [scrolled, setScrolled] = useState(false);
  const drawerRef = useRef(null);

  const toggleDrawer = () => setDrawerOpen((prev) => !prev);
  const closeDrawer = () => setDrawerOpen(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === "Escape") closeDrawer(); };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

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
      <header className={`navbar-modern ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-container">
          
          {/* LOGO */}
          <div className="navbar-logo-area">
            <Logo />
          </div>

          {/* MENU DESKTOP */}
          <nav className="navbar-desktop-nav">
            <NavMenu />
          </nav>

          {/* ÁREA DIREITA DESKTOP */}
          <div className="navbar-actions-area">
            <div className="navbar-search-desktop">
              <SearchBar />
            </div>

            <div className="navbar-action-icons">
              <div className="nav-icon-wrapper" title="Meus Pedidos">
                <OrdersButton />
              </div>
              <div className="nav-icon-wrapper" title="Carrinho">
                <CartButton />
              </div>
              <div className="nav-icon-wrapper" title="Minha Conta">
                <UserMenu />
              </div>
              <div className="nav-icon-wrapper" title="Painel Admin">
                <AdminButton />
              </div>
            </div>

            {/* BOTÃO HAMBÚRGUER MOBILE */}
            <button
              className="navbar-hamburger-btn"
              onClick={toggleDrawer}
              aria-label="Abrir Menu"
            >
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </button>
          </div>
        </div>
      </header>

      {/* OVERLAY ESCURO COM BLUR */}
      <div
        className={`navbar-overlay ${drawerOpen ? "active" : ""}`}
        onClick={closeDrawer}
      />

      {/* GAVETA MOBILE MODERNA */}
      <aside
        ref={drawerRef}
        className={`navbar-mobile-drawer ${drawerOpen ? "active" : ""}`}
      >
        {/* CABEÇALHO */}
        <div className="drawer-header-mobile">
          <div className="drawer-brand">
            <Logo />
          </div>
          <button className="drawer-close-btn" onClick={closeDrawer} aria-label="Fechar Menu">
            ✕
          </button>
        </div>

        {/* CAMPO DE BUSCA */}
        <div className="drawer-search-container">
          <SearchBar placeholder="O que você procura hoje?" />
        </div>

        {/* CONTEÚDO ROLÁVEL */}
        <div className="drawer-body-content">
          
          {/* BOTÕES DE AÇÃO SOMENTE COM ÍCONES (IGUAL DESKTOP) */}
          <div className="drawer-quick-actions">
            <div className="nav-icon-wrapper" title="Carrinho" onClick={closeDrawer}>
              <CartButton />
            </div>
            <div className="nav-icon-wrapper" title="Pedidos" onClick={closeDrawer}>
              <OrdersButton />
            </div>
            <div className="nav-icon-wrapper" title="Minha Conta" onClick={closeDrawer}>
              <UserMenu />
            </div>
            <div className="nav-icon-wrapper" title="Painel Admin" onClick={closeDrawer}>
              <AdminButton />
            </div>
          </div>

          <div className="drawer-section-divider" />

          {/* LISTA DE NAVEGAÇÃO / CATEGORIAS */}
          <div className="drawer-nav-section">
            <span className="drawer-section-label">Categorias</span>
            <nav className="drawer-nav-menu">
              <NavMenu onItemClick={closeDrawer} />
            </nav>
          </div>
        </div>

        {/* RODAPÉ FIXO DO MENU */}
        <div className="drawer-footer-mobile">
          <p>UTA STORE © {new Date().getFullYear()}</p>
          <small>Airsoft & Equipamentos Táticos</small>
        </div>
      </aside>
    </>
  );
}