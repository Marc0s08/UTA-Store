import "./Sidebar.css";


import {
    Dashboard,
    Inventory,
    Category,
    ShoppingCart,
    People,
    LocalOffer,
    Image,
    Settings
} from "@mui/icons-material";


import {
    Link
} from "react-router-dom";



export default function Sidebar(){


    return (


        <aside className="admin-sidebar">


            <div className="admin-logo">


                UTA STORE


                <span>

                    ADMIN

                </span>


            </div>





            <nav>



                <Link to="/admin">

                    <Dashboard/>

                    Dashboard

                </Link>





                <Link to="/admin/produtos">

                    <Inventory/>

                    Produtos

                </Link>





                <Link to="/admin/categorias">

                    <Category/>

                    Categorias

                </Link>





                <Link to="/admin/pedidos">

                    <ShoppingCart/>

                    Pedidos

                </Link>





                <Link to="/admin/clientes">

                    <People/>

                    Clientes

                </Link>





                <Link to="/admin/cupons">

                    <LocalOffer/>

                    Cupons

                </Link>





                <Link to="/admin/banners">

                    <Image/>

                    Banners

                </Link>





                <Link to="/admin/configuracoes">

                    <Settings/>

                    Configurações

                </Link>





            </nav>



        </aside>


    );


}