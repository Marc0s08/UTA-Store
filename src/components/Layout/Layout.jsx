import "./Layout.css";

import Navbar from "../Navbar/Navbar";

import CartMessage from "../CartMessage/CartMessage";

import {
    Outlet
} from "react-router-dom";



export default function Layout(){


    return(

        <>

            <Navbar/>

            <CartMessage/>


            <main className="layout-content">

                <Outlet/>

            </main>


        </>

    )


}