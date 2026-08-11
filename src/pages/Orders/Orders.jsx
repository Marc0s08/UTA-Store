import "./Orders.css";
import { useEffect, useState } from "react";
import { getAllOrders } from "../../services/orderService";
import { notifyAdminsOnPayment } from "../../utils/sendNotification";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [isSendingTest, setIsSendingTest] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    const data = await getAllOrders();
    setOrders(data);
  }

  // Função para testar o envio de e-mail manualmente
  async function handleTestEmail() {
    setIsSendingTest(true);
    console.log("🧪 Disparando e-mail de teste...");

    await notifyAdminsOnPayment({
      id: "TESTE-" + Math.floor(Math.random() * 10000),
      valorTotal: 199.90,
      cliente: {
        nome: "Cliente de Teste",
        email: "cliente.teste@exemplo.com",
      },
    });

    setIsSendingTest(false);
    alert("Solicitação enviada! Verifique o console do navegador (F12) e a caixa de entrada dos admins.");
  }

  return (
    <div className="orders-admin">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>📦 Pedidos</h1>

        {/* Botão para testar a notificação manualmente */}
        <button
          onClick={handleTestEmail}
          disabled={isSendingTest}
          style={{
            padding: "10px 18px",
            backgroundColor: isSendingTest ? "#666" : "#8bc34a",
            color: "#101010",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: isSendingTest ? "not-allowed" : "pointer",
            transition: "0.2s",
          }}
        >
          {isSendingTest ? "Enviando..." : "🧪 Testar E-mail para Admins"}
        </button>
      </div>

      <div className="orders-grid">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <h2>Pedido #{order.id?.substring(0, 8)}</h2>
            <p>Cliente: {order.cliente?.nome || "Sem nome"}</p>
            <p>{order.cliente?.email || "Sem e-mail"}</p>
            <p>{order.produtos?.length || 0} produto(s)</p>
            <h3>R$ {Number(order.valorTotal || 0).toFixed(2)}</h3>

            <span className={`status ${(order.status || "pendente").toLowerCase()}`}>
              {order.status || "Pendente"}
            </span>

            <button>Visualizar</button>
          </div>
        ))}
      </div>
    </div>
  );
}