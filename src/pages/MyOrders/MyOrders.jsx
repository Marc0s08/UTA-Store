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
                console.error("Erro ao carregar pedidos:", error);
            }

            setLoading(false);
        }

        loadOrders();
    }, [user]);

    function formatDate(timestamp) {
        if (!timestamp) return "";
        // Se for um Timestamp do Firestore, converte. Se for data comum, trata.
        const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString("pt-BR");
    }

    function statusClass(status) {
        switch (status?.toLowerCase()) {
            case "pendente":
            case "aguardando pagamento":
                return "pending";
            case "separando":
                return "preparing";
            case "enviado":
                return "shipping";
            case "entregue":
                return "delivered";
            case "cancelado":
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

            {orders.length === 0 && (
                <div className="empty-orders">
                    Você ainda não realizou nenhuma compra.
                </div>
            )}

            {orders.map((order) => {
                // Compatibilidade com diferentes estruturas salvas no banco
                const valorTotalPedido = order.valores?.total ?? order.valorTotal ?? 0;

                return (
                    <div className="order-card" key={order.id}>
                        <div className="order-header">
                            <div>
                                <h2>
                                    Pedido #{order.id.substring(0, 8).toUpperCase()}
                                </h2>
                                <small>
                                    {formatDate(order.criadoEm || order.createdAt)}
                                </small>
                            </div>
                            <span className={`status ${statusClass(order.status)}`}>
                                {order.status}
                            </span>
                        </div>

                        <div className="order-products">
                            {order.produtos?.map((item, index) => {
                                const precoItem = Number(item.preco || 0);
                                const qtdItem = Number(item.quantidade || 1);

                                return (
                                    <div className="order-item" key={index}>
                                        <img
                                            src={item.imagem || "/placeholder.png"}
                                            alt={item.nome || "Produto"}
                                        />

                                        <div className="item-info">
                                            <h3>{item.nome}</h3>
                                            <p>
                                                Quantidade: <strong>{qtdItem}</strong>
                                            </p>
                                        </div>

                                        <div className="item-price">
                                            R$ {(precoItem * qtdItem).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="order-footer">
                            <div>
                                <strong>Total do Pedido (com frete)</strong>
                            </div>
                            <div className="total-price">
                                R$ {Number(valorTotalPedido).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>
                );
            })}
        </main>
    );
}