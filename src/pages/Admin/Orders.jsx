import "./Orders.css";
import { useEffect, useState } from "react";
import { getAllOrders } from "../../services/orderService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { notifyAdminsOnPayment } from "../../utils/sendNotification";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null); // Estado para controlar o modal
  const [isSendingTest, setIsSendingTest] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  async function getClientName(order) {
    if (order.cliente?.nome) return order.cliente.nome;
    if (!order.usuarioId) return "Sem nome";

    try {
      const ref = doc(db, "usuarios", order.usuarioId);
      const snap = await getDoc(ref);
      return snap.exists() ? snap.data().nome || "Sem nome" : "Sem nome";
    } catch {
      return "Sem nome";
    }
  }

  async function loadOrders() {
    const data = await getAllOrders();
    setOrders(data);

    // Carrega os nomes em paralelo
    const names = {};
    for (const order of data) {
      names[order.id] = await getClientName(order);
    }
    setClients(names);
  }

  // Disparo manual de teste de e-mail
  async function handleTestEmail(e, order) {
    e.stopPropagation();
    setIsSendingTest(true);

    const targetOrder = order || {
      id: "TESTE-" + Math.floor(Math.random() * 10000),
      valorTotal: 199.90,
      cliente: {
        nome: "Cliente de Teste",
        email: "cliente@exemplo.com",
      },
    };

    console.log("🧪 Disparando e-mail de teste para o pedido:", targetOrder.id);

    await notifyAdminsOnPayment(targetOrder);

    setIsSendingTest(false);
    alert("Notificação enviada! Confira o console (F12) e a caixa de entrada dos admins.");
  }

  return (
    <div className="orders-admin">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>📦 Pedidos</h1>

        <button
          onClick={(e) => handleTestEmail(e, null)}
          disabled={isSendingTest}
          style={{
            padding: "10px 18px",
            backgroundColor: isSendingTest ? "#666" : "#8bc34a",
            color: "#101010",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: isSendingTest ? "not-allowed" : "pointer",
          }}
        >
          {isSendingTest ? "Enviando..." : "🧪 Testar E-mail para Admins"}
        </button>
      </div>

      <div className="orders-grid">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <h2>Pedido #{order.id.substring(0, 8).toUpperCase()}</h2>
            <p>Cliente: {clients[order.id] || "Carregando..."}</p>
            <p>{order.cliente?.email || "Sem email"}</p>
            <p>{order.produtos?.length || 0} produto(s)</p>
            <h3>
              R${" "}
              {Number(order.valorTotal || 0).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </h3>

            <span className={`status ${(order.status || "pendente").toLowerCase()}`}>
              {order.status || "Pendente"}
            </span>

            {/* Ação do botão Visualizar */}
            <button onClick={() => setSelectedOrder(order)}>
              Visualizar
            </button>
          </div>
        ))}
      </div>

      {/* MODAL DE DETALHES DO PEDIDO */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalhes do Pedido #{selectedOrder.id.substring(0, 8).toUpperCase()}</h2>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}>✕</button>
            </div>

            <div className="modal-body">
              <p><strong>ID Completo:</strong> {selectedOrder.id}</p>
              <p><strong>Cliente:</strong> {clients[selectedOrder.id] || "Não informado"}</p>
              <p><strong>E-mail:</strong> {selectedOrder.cliente?.email || "Não informado"}</p>
              <p><strong>Status:</strong> {selectedOrder.status}</p>
              
              <h4>Produtos:</h4>
              <ul>
                {selectedOrder.produtos && selectedOrder.produtos.length > 0 ? (
                  selectedOrder.produtos.map((item, index) => (
                    <li key={index}>
                      {item.nome || item.title || "Produto"} - Qtd: {item.quantidade || item.qtd || 1}
                    </li>
                  ))
                ) : (
                  <li>Nenhum produto listado</li>
                )}
              </ul>

              <h3 style={{ marginTop: "15px", color: "#8bc34a" }}>
                Total: R$ {Number(selectedOrder.valorTotal || 0).toFixed(2)}
              </h3>
            </div>

            <div className="modal-footer" style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button 
                onClick={(e) => handleTestEmail(e, selectedOrder)}
                style={{ backgroundColor: "#8bc34a", color: "#000", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
              >
                Disparar E-mail Deste Pedido
              </button>
              <button onClick={() => setSelectedOrder(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}