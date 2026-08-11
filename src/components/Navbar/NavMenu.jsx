import { NavLink } from "react-router-dom";
import "./NavMenu.css";

export default function NavMenu({ onItemClick }) {
  return (
    <ul className="nav-menu">
      <li>
        <NavLink to="/" end onClick={onItemClick}>
          Início
        </NavLink>
      </li>
      <li>
        <NavLink to="/produtos" onClick={onItemClick}>
          Produtos
        </NavLink>
      </li>
      <li>
        <NavLink to="/categorias" onClick={onItemClick}>
          Categorias
        </NavLink>
      </li>
      <li>
        <NavLink to="/promocoes" onClick={onItemClick}>
          Promoções
        </NavLink>
      </li>
      <li>
        <NavLink to="/contato" onClick={onItemClick}>
          Contato
        </NavLink>
      </li>
    </ul>
  );
}