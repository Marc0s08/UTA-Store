import "./Orders.css";
import { useEffect, useState } from "react";
import { getAllOrders } from "../../services/orderService";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadUserOrders();
  }, []);

  async function loadUserOrders() {
    try {
      setLoading(true);
      const data = await getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="user-orders-container">
      <div className="orders-header">
        <h1>🛍️ Meus Pedidos</h1>
        <p>Acompanhe o histórico e o status das suas compras</p>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Carregando seus pedidos...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-orders-card">
          <div className="empty-icon">📦</div>
          <h3>Você ainda não fez nenhum pedido</h3>
          <p>Aproveite nossas ofertas e faça sua primeira compra!</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const statusClass = (order.status || "pendente").toLowerCase();

            return (
              <div key={order.id} className="user-order-card">
                <div className="card-top">
                  <div className="order-info">
                    <span className="order-number">
                      Pedido #{order.id?.substring(0, 8).toUpperCase()}
                    </span>
                    <span className={`status-badge ${statusClass}`}>
                      {order.status || "Pendente"}
                    </span>
                  </div>
                  <div className="order-total-preview">
                    <span>Total</span>
                    <strong>
                      R$ {Number(order.valorTotal || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                </div>

                <div className="card-middle">
                  <p className="item-count">
                    📦 <strong>{order.produtos?.length || 0}</strong> {order.produtos?.length === 1 ? "produto" : "produtos"}
                  </p>
                </div>

                <div className="card-bottom">
                  <button 
                    className="btn-details"
                    onClick={() => setSelectedOrder(order)}
                  >
                    Ver detalhes do pedido
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE DETALHES DO PEDIDO PARA O CLIENTE */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="user-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Detalhes do Pedido</h2>
                <span className="order-id-sub">#{selectedOrder.id?.substring(0, 8).toUpperCase()}</span>
              </div>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}>✕</button>
            </div>

            <div className="modal-body">
              {/* Status e Alerta */}
              <div className="status-banner">
                <span>Status da Compra:</span>
                <span className={`status-badge ${(selectedOrder.status || "pendente").toLowerCase()}`}>
                  {selectedOrder.status || "Pendente"}
                </span>
              </div>

              {/* Lista de Itens Comprados */}
              <div className="items-section">
                <h3>Itens Comprados</h3>
                <div className="items-list">
                  {selectedOrder.produtos && selectedOrder.produtos.length > 0 ? (
                    selectedOrder.produtos.map((item, index) => (
                      <div key={index} className="item-row">
                        <div className="item-details">
                          <span className="item-name">{item.nome || item.title || "Produto"}</span>
                          <span className="item-qtd">Qtd: {item.quantidade || item.qtd || 1}</span>
                        </div>
                        <span className="item-price">
                          R$ {Number(item.preco || item.price || 0).toFixed(2)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="no-items">Nenhum detalhe de item encontrado.</p>
                  )}
                </div>
              </div>

              {/* Resumo Financeiro */}
              <div className="summary-section">
                <div className="summary-row total">
                  <span>Total Pago:</span>
                  <strong>
                    R$ {Number(selectedOrder.valorTotal || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </strong>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-close-modal" onClick={() => setSelectedOrder(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}