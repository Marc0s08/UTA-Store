import "./MyOrders.css";

import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import { getOrdersByUser } from "../../services/orderService";

export default function MyOrders() {

    const { user } = useAuth();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        async function loadOrders() {

            if (!user) {
                setLoading(false);
                return;
            }

            try {

                const data = await getOrdersByUser(user.uid);

                setOrders(data);

            } catch (error) {

                console.log(error);

            }

            setLoading(false);

        }

        loadOrders();

    }, [user]);



    function formatDate(timestamp) {

        if (!timestamp) return "";

        const date = timestamp.toDate();

        return date.toLocaleString("pt-BR");

    }



    function statusClass(status) {

        switch (status) {

            case "Pendente":
                return "pending";

            case "Separando":
                return "preparing";

            case "Enviado":
                return "shipping";

            case "Entregue":
                return "delivered";

            case "Cancelado":
                return "cancelled";

            default:
                return "pending";

        }

    }



    if (loading) {

        return (

            <main className="orders-page">

                <h1>Carregando pedidos...</h1>

            </main>

        );

    }



    return (

        <main className="orders-page">

            <h1>📦 Meus Pedidos</h1>

            {

                orders.length === 0 && (

                    <div className="empty-orders">

                        Você ainda não realizou nenhuma compra.

                    </div>

                )

            }

            {

                orders.map(order => (

                    <div
                        className="order-card"
                        key={order.id}
                    >

                        <div className="order-header">

                            <div>

                                <h2>

                                    Pedido #

                                    {order.id.substring(0, 8).toUpperCase()}

                                </h2>

                                <small>

                                    {formatDate(order.criadoEm)}

                                </small>

                            </div>

                            <span className={`status ${statusClass(order.status)}`}>

                                {order.status}

                            </span>

                        </div>

                        <div className="order-products">

                            {

                                order.produtos?.map((item, index) => (

                                    <div
                                        className="order-item"
                                        key={index}
                                    >

                                        <img
                                            src={item.imagem}
                                            alt={item.nome}
                                        />

                                        <div className="item-info">

                                            <h3>

                                                {item.nome}

                                            </h3>

                                            <p>

                                                Quantidade:

                                                <strong>

                                                    {" "}

                                                    {item.quantidade}

                                                </strong>

                                            </p>

                                        </div>

                                        <div className="item-price">

                                            R$ {Number(item.preco).toFixed(2)}

                                        </div>

                                    </div>

                                ))

                            }

                        </div>

                        <div className="order-footer">

                            <div>

                                <strong>

                                    Total

                                </strong>

                            </div>

                            <div className="total-price">

                                R$ {Number(order.valorTotal).toFixed(2)}

                            </div>

                        </div>

                    </div>

                ))

            }

        </main>

    );

}