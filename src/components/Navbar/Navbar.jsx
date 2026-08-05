import { useState } from "react";
import "./Navbar.css";

import Logo from "./Logo";
import SearchBar from "./SearchBar";
import FavoriteButton from "./FavoriteButton";
import CartButton from "./CartButton";
import UserMenu from "./UserMenu";
import NavMenu from "./NavMenu";
import OrdersButton from "./OrdersButton";
import AdminButton from "./AdminButton";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Função para fechar o menu mobile ao clicar em um item
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-top">
        <button
          className="menu-mobile"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <div className="navbar-brand">
          <Logo />
        </div>

        <div className="search-bar-wrapper">
          <SearchBar />
        </div>

        <div className="navbar-actions">
          <FavoriteButton />
          <OrdersButton />
          <AdminButton />
          <CartButton />
          <UserMenu />
        </div>
      </div>

      {/* Menu Mobile Dropped Down (passando a prop onItemClick para fechar o menu) */}
      <div className={`nav-mobile ${menuOpen ? "active" : ""}`}>
        <NavMenu onItemClick={closeMenu} />
      </div>

      {/* Menu Desktop Tradicional */}
      <nav className="nav-desktop">
        <NavMenu />
      </nav>
    </header>
  );
}