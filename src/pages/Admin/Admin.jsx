import "./Admin.css";

import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Admin(){

    return(

        <div className="admin-layout">

            <Sidebar/>

            <main className="admin-content">

                <Outlet/>

            </main>

        </div>

    );

}