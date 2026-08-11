import "./Orders.css";
import { useEffect, useState } from "react";
import { getAllOrders } from "../../services/orderService";
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

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

  // 1. Atualizar o status do pedido no Firestore
  async function handleStatusChange(orderId, newStatus) {
    setUpdatingOrderId(orderId);
    try {
      const orderRef = doc(db, "pedidos", orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

      // Atualiza a lista local sem precisar recarregar tudo
      setOrders((prevOrders) =>
        prevOrders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }

      alert(`Status do pedido alterado para "${newStatus}" com sucesso!`);
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      alert("Erro ao atualizar status do pedido no Firestore.");
    } finally {
      setUpdatingOrderId(null);
    }
  }

  // 2. Disparo de teste com dados completos para etiqueta de envio
  async function handleTestEmail(e) {
    if (e) e.stopPropagation();
    setIsSendingTest(true);

    try {
      const testOrder = {
        cliente: {
          nome: "Maria da Silva Teste",
          email: "marcoseduc2019@gmail.com",
          telefone: "(14) 99888-7766",
          cpf: "123.456.789-00",
          endereco: {
            rua: "Rua das Flores",
            numero: "123",
            complemento: "Apto 42",
            bairro: "Centro",
            cidade: "Marília",
            estado: "SP",
            cep: "17500-000",
          },
        },
        produtos: [
          { nome: "Camiseta Estampada UTA", quantidade: 2, preco: 89.90 },
          { nome: "Caneca Personalizada", quantidade: 1, preco: 20.10 },
        ],
        valorTotal: 199.90,
        status: "Pendente",
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "pedidos"), testOrder);
      console.log("🧪 Pedido de teste criado no Firestore ID:", docRef.id);

      alert("🚀 Pedido de teste gerado com dados completos para etiqueta!");
      loadOrders();
    } catch (error) {
      console.error("Erro ao disparar pedido de teste:", error);
      alert("Erro ao criar pedido de teste.");
    } finally {
      setIsSendingTest(false);
    }
  }

  return (
    <div className="orders-admin">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>📦 Pedidos (Admin)</h1>

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
          }}
        >
          {isSendingTest ? "Criando Teste..." : "🧪 Gerar Pedido de Teste (Enviar E-mail)"}
        </button>
      </div>

      <div className="orders-grid">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <h2>Pedido #{order.id.substring(0, 8).toUpperCase()}</h2>
            <p><strong>Cliente:</strong> {clients[order.id] || "Carregando..."}</p>
            <p><strong>E-mail:</strong> {order.cliente?.email || "Sem email"}</p>
            <p><strong>Itens:</strong> {order.produtos?.length || 0} produto(s)</p>
            <h3>
              R${" "}
              {Number(order.valorTotal || 0).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </h3>

            {/* Seletor para alterar o status direto no card */}
            <div style={{ margin: "10px 0" }}>
              <label style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Status do Pedido:</label>
              <select
                value={order.status || "Pendente"}
                disabled={updatingOrderId === order.id}
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                style={{
                  padding: "6px",
                  borderRadius: "4px",
                  width: "100%",
                  fontWeight: "bold",
                }}
              >
                <option value="Pendente">⏳ Pendente</option>
                <option value="Em Processamento">⚙️ Em Processamento</option>
                <option value="Enviado">🚚 Enviado</option>
                <option value="Entregue">✅ Entregue</option>
                <option value="Cancelado">❌ Cancelado</option>
              </select>
            </div>

            <button 
              onClick={() => setSelectedOrder(order)}
              style={{ width: "100%", marginTop: "5px", padding: "8px" }}
            >
              Visualizar Detalhes
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
              <p><strong>Cliente:</strong> {selectedOrder.cliente?.nome || clients[selectedOrder.id] || "Não informado"}</p>
              <p><strong>E-mail:</strong> {selectedOrder.cliente?.email || "Não informado"}</p>
              <p><strong>Telefone:</strong> {selectedOrder.cliente?.telefone || "Não informado"}</p>
              <p><strong>CPF/CNPJ:</strong> {selectedOrder.cliente?.cpf || selectedOrder.cliente?.cnpj || "Não informado"}</p>

              {selectedOrder.cliente?.endereco && (
                <div style={{ margin: "10px 0", background: "#f9f9f9", padding: "8px", borderRadius: "4px" }}>
                  <p style={{ margin: "0 0 4px 0" }}><strong>Endereço de Entrega:</strong></p>
                  <p style={{ margin: 0 }}>
                    {selectedOrder.cliente.endereco.rua}, Nº {selectedOrder.cliente.endereco.numero}
                    {selectedOrder.cliente.endereco.complemento ? `, ${selectedOrder.cliente.endereco.complemento}` : ""}
                  </p>
                  <p style={{ margin: 0 }}>
                    {selectedOrder.cliente.endereco.bairro} - {selectedOrder.cliente.endereco.cidade} / {selectedOrder.cliente.endereco.estado}
                  </p>
                  <p style={{ margin: 0 }}><strong>CEP:</strong> {selectedOrder.cliente.endereco.cep}</p>
                </div>
              )}
              
              <div style={{ margin: "15px 0" }}>
                <strong>Alterar Status no Modal: </strong>
                <select
                  value={selectedOrder.status || "Pendente"}
                  disabled={updatingOrderId === selectedOrder.id}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  style={{ padding: "6px", borderRadius: "4px", marginLeft: "8px" }}
                >
                  <option value="Pendente">⏳ Pendente</option>
                  <option value="Em Processamento">⚙️ Em Processamento</option>
                  <option value="Enviado">🚚 Enviado</option>
                  <option value="Entregue">✅ Entregue</option>
                  <option value="Cancelado">❌ Cancelado</option>
                </select>
              </div>

              <h4>Produtos:</h4>
              <ul>
                {selectedOrder.produtos && selectedOrder.produtos.length > 0 ? (
                  selectedOrder.produtos.map((item, index) => (
                    <li key={index}>
                      {item.nome || item.title || "Produto"} - Qtd: {item.quantidade || item.qtd || 1} {item.preco ? `(R$ ${Number(item.preco).toFixed(2)})` : ""}
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

            <div className="modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
              <button onClick={() => setSelectedOrder(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}