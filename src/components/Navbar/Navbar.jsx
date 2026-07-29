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

  return (

    <header className="navbar">

      <div className="navbar-top">

        <Logo />

        <SearchBar />

        <div className="navbar-actions">

          <FavoriteButton />
            <OrdersButton/>
            <AdminButton/>
          <CartButton />

          <UserMenu />

        </div>

      </div>

      <NavMenu />

    </header>

  );

}