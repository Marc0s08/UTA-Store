import {
    useState
} from "react";


import "./Navbar.css";


import Logo from "./Logo";
import SearchBar from "./SearchBar";
import FavoriteButton from "./FavoriteButton";
import CartButton from "./CartButton";
import UserMenu from "./UserMenu";
import NavMenu from "./NavMenu";
import OrdersButton from "./OrdersButton";
import AdminButton from "./AdminButton";


export default function Navbar(){


    const [menu,setMenu] = useState(false);



    return(


        <header className="navbar">



            <div className="navbar-top">



                <button

                className="menu-mobile"

                onClick={()=>setMenu(!menu)}

                >

                    ☰

                </button>





                <Logo/>






                <SearchBar/>







                <div className="navbar-actions">


                    <FavoriteButton/>


                    <OrdersButton/>


                    <AdminButton/>


                    <CartButton/>


                    <UserMenu/>


                </div>




            </div>







            <div

            className={

                menu

                ?

                "nav-mobile active"

                :

                "nav-mobile"

            }

            >

                <NavMenu/>

            </div>







            <div className="nav-desktop">

                <NavMenu/>

            </div>





        </header>


    )

}