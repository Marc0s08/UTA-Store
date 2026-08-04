import {
    Routes,
    Route
} from "react-router-dom";


import Layout from "../components/Layout/Layout";


import Home from "../pages/Home/Home";
import Admin from "../pages/Admin/Admin";


import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import AdminRoute from "../components/AdminRoute/AdminRoute";
import AdminBanners from "../pages/Admin/Banners/AdminBanners";

import AdminProducts from "../pages/Admin/Products";
import Dashboard from "../pages/Admin/Dashboard";
import Orders from "../pages/Admin/Orders";
import Settings from "../pages/Admin/Settings";


import StoreProducts from "../pages/Products/Products";


import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";


import Profile from "../pages/Profile/Profile";
import EditProfile from "../pages/Profile/EditProfile";


import MelhorEnvioCallback 
from "../pages/MelhorEnvioCallback/MelhorEnvioCallback";


import Product from "../pages/Product/Product";
import Cart from "../pages/Cart/Cart";
import MyOrders from "../pages/MyOrders/MyOrders";



export default function AppRoutes(){


    return(


        <Routes>



            {/* SITE PRINCIPAL */}

            <Route element={<Layout/>}>


                <Route

                    path="/oauth/callback"

                    element={<MelhorEnvioCallback/>}

                />



                <Route

                    path="/"

                    element={<Home/>}

                />



                <Route

                    path="/login"

                    element={<Login/>}

                />



                <Route

                    path="/register"

                    element={<Register/>}

                />



                <Route

                    path="/perfil"

                    element={

                        <ProtectedRoute>

                            <Profile/>

                        </ProtectedRoute>

                    }

                />



                <Route

                    path="/editar-perfil"

                    element={

                        <ProtectedRoute>

                            <EditProfile/>

                        </ProtectedRoute>

                    }

                />



                <Route

                    path="/produtos"

                    element={<StoreProducts/>}

                />



                <Route

                    path="/produto/:id"

                    element={<Product/>}

                />



                <Route

                    path="/carrinho"

                    element={<Cart/>}

                />



                <Route

                    path="/meus-pedidos"

                    element={

                        <ProtectedRoute>

                            <MyOrders/>

                        </ProtectedRoute>

                    }

                />



            </Route>





            {/* PAINEL ADMIN */}



            <Route

                path="/admin"

                element={

                    <AdminRoute>

                        <Admin/>

                    </AdminRoute>

                }

            >



                <Route

                    index

                    element={<Dashboard/>}

                />



                <Route

                    path="produtos"

                    element={<AdminProducts/>}

                />


<Route
 path="banners"
 element={<AdminBanners/>}
/>
                <Route

                    path="pedidos"

                    element={<Orders/>}

                />



                <Route

                    path="configuracoes"

                    element={<Settings/>}

                />



            </Route>



        </Routes>


    );


}