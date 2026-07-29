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


export default function Sidebar(){

    return (

        <aside className="admin-sidebar">

            <div className="admin-logo">

                UTA STORE

                <span>ADMIN</span>

            </div>


            <nav>


                <a href="/admin">
                    <Dashboard/>
                    Dashboard
                </a>


                <a href="/admin/produtos">
                    <Inventory/>
                    Produtos
                </a>


                <a href="/admin/categorias">
                    <Category/>
                    Categorias
                </a>


                <a href="/admin/pedidos">
                    <ShoppingCart/>
                    Pedidos
                </a>


                <a href="/admin/clientes">
                    <People/>
                    Clientes
                </a>


                <a href="/admin/cupons">
                    <LocalOffer/>
                    Cupons
                </a>


                <a href="/admin/banners">
                    <Image/>
                    Banners
                </a>


                <a href="/admin/configuracoes">
                    <Settings/>
                    Configurações
                </a>


            </nav>


        </aside>

    )

}