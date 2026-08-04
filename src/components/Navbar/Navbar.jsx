import { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar({ isAdmin }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function toggleMobileMenu() {
    setMobileMenuOpen((prev) => !prev);
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* BOUTÃO HAMBÚRGUER MOBILE 
            Renderiza APENAS no site normal. No Admin ele é totalmente removido. */}
        {!isAdmin && (
          <button
            className="navbar-hamburger"
            onClick={toggleMobileMenu}
            aria-label="Abrir Menu"
          >
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
          </button>
        )}

        {/* LOGO DA LOJA */}
        <div className="navbar-logo">
          <Link to="/" onClick={closeMobileMenu}>
            <h2>SUA LOJA</h2>
          </Link>
        </div>

        {/* LINKS PRINCIPAIS (DESKTOP) */}
        {!isAdmin && (
          <nav className="navbar-desktop-links">
            <Link to="/">Início</Link>
            <Link to="/produtos">Produtos</Link>
            <Link to="/meus-pedidos">Meus Pedidos</Link>
          </nav>
        )}

        {/* ÍCONES DA BARRA SUPERIOR (MANTIDOS TANTO NO SITE QUANTO NO ADMIN) */}
        <div className="navbar-actions">
          <Link to="/carrinho" className="navbar-icon-btn" title="Carrinho">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </Link>

          <Link to="/perfil" className="navbar-icon-btn" title="Meu Perfil">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </Link>
        </div>
      </div>

      {/* GAVETA / MENU LATERAL MOBILE DA LOJA PÚBLICA
          Só renderiza se NÃO for rota Admin e se o menu estiver aberto */}
      {!isAdmin && mobileMenuOpen && (
        <>
          <div className="navbar-overlay" onClick={closeMobileMenu} />
          <aside className="navbar-drawer">
            <div className="drawer-header">
              <h3>Menu</h3>
              <button onClick={closeMobileMenu} className="drawer-close-btn">
                ✕
              </button>
            </div>
            <nav className="drawer-links">
              <Link to="/" onClick={closeMobileMenu}>
                Início
              </Link>
              <Link to="/produtos" onClick={closeMobileMenu}>
                Produtos
              </Link>
              <Link to="/meus-pedidos" onClick={closeMobileMenu}>
                Meus Pedidos
              </Link>
              <Link to="/perfil" onClick={closeMobileMenu}>
                Minha Conta
              </Link>
            </nav>
          </aside>
        </>
      )}
    </header>
  );
}