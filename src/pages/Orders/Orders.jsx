import "./Orders.css";

import { useEffect, useState } from "react";

import {

    getAllOrders

} from "../../services/orderService";

export default function Orders(){

    const [orders,setOrders]=useState([]);

    useEffect(()=>{

        loadOrders();

    },[]);

    async function loadOrders(){

        const data=await getAllOrders();

        setOrders(data);

    }

    return(

        <div className="orders-admin">

            <h1>

                📦 Pedidos

            </h1>

            <div className="orders-grid">

                {

                orders.map(order=>(

                    <div

                    key={order.id}

                    className="order-card"

                    >

                        <h2>

                            Pedido #

                            {order.id.substring(0,8)}

                        </h2>

                        <p>

                            Cliente:

                            {order.cliente.nome || "Sem nome"}

                        </p>

                        <p>

                            {order.cliente.email}

                        </p>

                        <p>

                            {order.produtos.length}

                            produto(s)

                        </p>

                        <h3>

                            R$

                            {

                            Number(order.valorTotal)

                            .toFixed(2)

                            }

                        </h3>

                        <span

                        className={`status ${order.status.toLowerCase()}`}

                        >

                            {order.status}

                        </span>

                        <button>

                            Visualizar

                        </button>

                    </div>

                ))

                }

            </div>

        </div>

    );

}