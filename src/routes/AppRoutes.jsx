import { Routes, Route } from "react-router-dom";

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
import Categories from "../pages/Admin/Categories";
import Customers from "../pages/Admin/Customers";

import StoreProducts from "../pages/Products/Products";
import CategoryProducts from "../pages/Categories/CategoryProducts";
import Promotions from "../pages/Promotions/Promotions";
import Contact from "../pages/Contact/Contact"; // <-- Importação da página de contato

import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";

import Profile from "../pages/Profile/Profile";
import EditProfile from "../pages/Profile/EditProfile";

import MelhorEnvioCallback from "../pages/MelhorEnvioCallback/MelhorEnvioCallback";

import Product from "../pages/Product/Product";
import Cart from "../pages/Cart/Cart";
import MyOrders from "../pages/MyOrders/MyOrders";

export default function AppRoutes() {
  return (
    <Routes>
      {/* TODAS AS ROTAS ABAIXO USAM O LAYOUT (NAVBAR + CARTMESSAGE) */}
      <Route element={<Layout />}>
        <Route path="/oauth/callback" element={<MelhorEnvioCallback />} />

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/editar-perfil"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />

        <Route path="/produtos" element={<StoreProducts />} />

        {/* Ambas as rotas usam a mesma página de categorias */}
        <Route path="/categorias" element={<CategoryProducts />} />
        <Route path="/categoria/:nomeCategoria" element={<CategoryProducts />} />

        {/* Rota da página de promoções */}
        <Route path="/promocoes" element={<Promotions />} />

        {/* Rota da página de contato */}
        <Route path="/contato" element={<Contact />} />

        <Route path="/produto/:id" element={<Product />} />

        <Route path="/carrinho" element={<Cart />} />

        <Route
          path="/meus-pedidos"
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          }
        />

        {/* PAINEL ADMIN (DENTRO DO LAYOUT) */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="produtos" element={<AdminProducts />} />
          <Route path="categorias" element={<Categories />} />
          <Route path="clientes" element={<Customers />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="pedidos" element={<Orders />} />
          <Route path="configuracoes" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  );
}