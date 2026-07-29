import "./Admin.css";

import Sidebar from "./Sidebar";

import {
    Outlet
} from "react-router-dom";


export default function Admin(){


    return (


        <div className="admin-layout">


            <Sidebar/>



            <main className="admin-content">


                <Outlet/>


            </main>



        </div>


    );


}