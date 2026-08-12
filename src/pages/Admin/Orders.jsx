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
  const [searchTerm, setSearchTerm] = useState("");

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
        atualizadoEm: serverTimestamp(),
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

  // 2. Disparo de teste atualizado para o novo formato
  async function handleTestEmail(e) {
    if (e) e.stopPropagation();
    setIsSendingTest(true);

    try {
      const testOrder = {
        cliente: {
          nome: "Maria da Silva Teste",
          email: "marcoseduc2019@gmail.com",
          telefone: "14998887766",
          cpfCnpj: "123.456.789-00",
        },
        enderecoEntrega: {
          logradouro: "Rua das Flores",
          complemento: "Apto 42",
          bairro: "Centro",
          localidade: "Marília",
          estado: "São Paulo",
          uf: "SP",
          cep: "17500-000",
        },
        produtos: [
          { nome: "Camiseta Estampada UTA", quantidade: 1, preco: 89, imagem: "" },
        ],
        frete: {
          servico: "SEDEX",
          valor: 15.00,
          prazo: "3 dias úteis"
        },
        valores: {
          produtos: 89,
          frete: 15.00,
          total: 104.00,
        },
        status: "Pendente",
        criadoEm: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "pedidos"), testOrder);
      console.log("🧪 Pedido de teste criado no Firestore ID:", docRef.id);

      alert("🚀 Pedido de teste gerado com sucesso!");
      loadOrders();
    } catch (error) {
      console.error("Erro ao disparar pedido de teste:", error);
      alert("Erro ao criar pedido de teste.");
    } finally {
      setIsSendingTest(false);
    }
  }

  // Filtra os pedidos com base na barra de pesquisa (Código ou Nome do Cliente)
  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase();
    const shortId = order.id.substring(0, 8).toLowerCase();
    const fullId = order.id.toLowerCase();
    const clientName = (order.cliente?.nome || clients[order.id] || "").toLowerCase();

    return shortId.includes(term) || fullId.includes(term) || clientName.includes(term);
  });

  return (
    <div className="orders-admin">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
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
          {isSendingTest ? "Criando Teste..." : "🧪 Gerar Pedido de Teste"}
        </button>
      </div>

      {/* Barra de Pesquisa */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="🔍 Pesquisar por código do pedido ou nome do cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "15px",
          }}
        />
      </div>

      <div className="orders-grid">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const valorTotal = order.valores?.total || 0;
            const qtdItens = order.produtos?.reduce((acc, item) => acc + Number(item.quantidade || 0), 0) || 0;

            return (
              <div key={order.id} className="order-card">
                <h2>Pedido #{order.id.substring(0, 8).toUpperCase()}</h2>
                <p><strong>Cliente:</strong> {order.cliente?.nome || clients[order.id] || "Carregando..."}</p>
                <p><strong>E-mail:</strong> {order.cliente?.email || "Sem email"}</p>
                <p><strong>Itens:</strong> {qtdItens} produto(s)</p>
                <h3 style={{ color: "#8bc34a", margin: "8px 0" }}>
                  {Number(valorTotal).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
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
                    <option value="Separando">📦 Separando</option>
                    <option value="Enviado">🚚 Enviado</option>
                    <option value="Entregue">✅ Entregue</option>
                    <option value="Cancelado">❌ Cancelado</option>
                  </select>
                </div>

                <button 
                  onClick={() => setSelectedOrder(order)}
                  style={{ width: "100%", marginTop: "5px", padding: "8px", cursor: "pointer" }}
                >
                  Visualizar Detalhes
                </button>
              </div>
            );
          })
        ) : (
          <p style={{ textAlign: "center", gridColumn: "1 / -1", color: "#777" }}>Nenhum pedido encontrado.</p>
        )}
      </div>

      {/* MODAL DE DETALHES DO PEDIDO */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalhes do Pedido #{selectedOrder.id.substring(0, 8).toUpperCase()}</h2>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}>✕</button>
            </div>

            <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: "5px" }}>
              <p><strong>ID Completo:</strong> {selectedOrder.id}</p>
              <p><strong>Cliente:</strong> {selectedOrder.cliente?.nome || clients[selectedOrder.id] || "Não informado"}</p>
              <p><strong>E-mail:</strong> {selectedOrder.cliente?.email || "Não informado"}</p>
              <p><strong>Telefone:</strong> {selectedOrder.cliente?.telefone || "Não informado"}</p>
              <p><strong>CPF/CNPJ:</strong> {selectedOrder.cliente?.cpfCnpj || "Não informado"}</p>

              {selectedOrder.enderecoEntrega && (
                <div style={{ margin: "10px 0", background: "#f9f9f9", padding: "10px", borderRadius: "6px" }}>
                  <p style={{ margin: "0 0 4px 0" }}><strong>Endereço de Entrega:</strong></p>
                  <p style={{ margin: 0 }}>
                    {selectedOrder.enderecoEntrega.logradouro}
                    {selectedOrder.enderecoEntrega.complemento ? `, ${selectedOrder.enderecoEntrega.complemento}` : ""}
                  </p>
                  <p style={{ margin: 0 }}>
                    {selectedOrder.enderecoEntrega.bairro} - {selectedOrder.enderecoEntrega.localidade} / {selectedOrder.enderecoEntrega.uf || selectedOrder.enderecoEntrega.estado}
                  </p>
                  <p style={{ margin: 0 }}><strong>CEP:</strong> {selectedOrder.enderecoEntrega.cep}</p>
                </div>
              )}

              {selectedOrder.frete && (
                <div style={{ margin: "10px 0", background: "#f1f8e9", padding: "10px", borderRadius: "6px" }}>
                  <p style={{ margin: "0 0 4px 0" }}><strong>Frete Escolhido:</strong> {selectedOrder.frete.servico || "Entrega"} ({selectedOrder.frete.prazo || ""})</p>
                  <p style={{ margin: 0 }}><strong>Valor do Frete:</strong> R$ {Number(selectedOrder.frete.valor || 0).toFixed(2)}</p>
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
                  <option value="Separando">📦 Separando</option>
                  <option value="Enviado">🚚 Enviado</option>
                  <option value="Entregue">✅ Entregue</option>
                  <option value="Cancelado">❌ Cancelado</option>
                </select>
              </div>

              <h4>Produtos:</h4>
              <ul style={{ paddingLeft: "20px" }}>
                {selectedOrder.produtos && selectedOrder.produtos.length > 0 ? (
                  selectedOrder.produtos.map((item, index) => (
                    <li key={index} style={{ marginBottom: "6px" }}>
                      <strong>{item.nome || item.title || "Produto"}</strong> — Qtd: {item.quantidade || 1} — R$ {Number(item.preco || 0).toFixed(2)} cada
                    </li>
                  ))
                ) : (
                  <li>Nenhum produto listado</li>
                )}
              </ul>

              <div style={{ marginTop: "15px", background: "#fafafa", padding: "10px", borderRadius: "6px", border: "1px solid #eee" }}>
                <p style={{ margin: "2px 0" }}>Subtotal Produtos: R$ {Number(selectedOrder.valores?.produtos || 0).toFixed(2)}</p>
                <p style={{ margin: "2px 0" }}>Frete: R$ {Number(selectedOrder.valores?.frete || 0).toFixed(2)}</p>
                <h3 style={{ marginTop: "8px", color: "#8bc34a" }}>
                  Total Geral: R$ {Number(selectedOrder.valores?.total || 0).toFixed(2)}
                </h3>
              </div>
            </div>

            <div className="modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
              <button onClick={() => setSelectedOrder(null)} style={{ padding: "8px 16px", cursor: "pointer" }}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}