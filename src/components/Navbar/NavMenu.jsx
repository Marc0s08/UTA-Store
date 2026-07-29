import { NavLink } from "react-router-dom";

export default function NavMenu() {

  return (

    <nav className="nav-menu">

      <NavLink to="/">Início</NavLink>

      <NavLink to="/produtos">Produtos</NavLink>

      <NavLink to="/categorias">Categorias</NavLink>

      <NavLink to="/promocoes">Promoções</NavLink>

      <NavLink to="/contato">Contato</NavLink>

    </nav>

  );

}