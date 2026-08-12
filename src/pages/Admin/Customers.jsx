import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Customers.css";

// Importações do Firebase Firestore
import { 
  collection, 
  getDocs, 
  doc, 
  deleteDoc,
  writeBatch
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

import {
  Search,
  PersonRemove,
  ShoppingBag,
  Close,
  Save
} from "@mui/icons-material";

export default function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("Todos");

  // Rastreia os IDs dos usuários com alterações pendentes de tipo
  const [pendingChanges, setPendingChanges] = useState(new Set());

  // Estados do Modal
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // 1. Carregar Clientes e Pedidos do Firebase
  async function loadCustomersData() {
    try {
      setLoading(true);

      // Busca Usuários
      const usersRef = collection(db, "usuarios");
      const usersSnap = await getDocs(usersRef);

      // Busca Pedidos para calcular estatísticas por cliente
      const ordersRef = collection(db, "orders");
      const ordersSnap = await getDocs(ordersRef);

      const allOrders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const loadedCustomers = usersSnap.docs.map(userDoc => {
        const userData = userDoc.data();
        const userId = userDoc.id;

        // Filtra os pedidos pertencentes a este cliente (por userId ou email)
        const userOrders = allOrders.filter(
          o => o.userId === userId || o.userEmail === userData.email
        );

        // Ordena pedidos por data (mais recente primeiro)
        userOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        // Calcula total gasto
        const totalGasto = userOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);

        // Pega última compra
        const ultimaCompra = userOrders.length > 0 ? userOrders[0].createdAt : null;

        // Consolida os itens comprados em todos os pedidos
        const historicoItens = [];
        userOrders.forEach(order => {
          if (Array.isArray(order.items)) {
            order.items.forEach(item => {
              historicoItens.push({
                id: item.id || item.productId,
                nome: item.nome || item.name || "Produto sem nome",
                qtd: item.quantity || item.qtd || 1,
                preco: item.price || item.preco || 0
              });
            });
          }
        });

        return {
          id: userId,
          nome: userData.nome || userData.name || userData.displayName || "Sem Nome",
          email: userData.email || "Sem e-mail",
          telefone: userData.telefone || userData.phone || "Não informado",
          tipo: userData.tipo || userData.role || "Cliente",
          ultimaCompra: ultimaCompra,
          comprasRealizadas: userOrders.length,
          totalGasto: totalGasto,
          historicoItens: historicoItens
        };
      });

      setCustomers(loadedCustomers);
      setPendingChanges(new Set());
    } catch (error) {
      console.error("Erro ao carregar clientes do Firebase:", error);
      alert("Erro ao carregar lista de clientes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomersData();
  }, []);

  // 2. Atualizar Tipo do Cliente Localmente e marcar como pendente de salvamento
  function handleTypeChange(id, newType) {
    setCustomers(prev =>
      prev.map(c => (c.id === id ? { ...c, tipo: newType } : c))
    );

    setPendingChanges(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }

  // 3. Salvar no Firebase todas as alterações pendentes
  async function handleSaveChanges() {
    if (pendingChanges.size === 0) return;

    try {
      setSaving(true);
      const batch = writeBatch(db);

      pendingChanges.forEach((userId) => {
        const customer = customers.find(c => c.id === userId);
        if (customer) {
          const userRef = doc(db, "usuarios", userId);
          batch.update(userRef, { tipo: customer.tipo });
        }
      });

      await batch.commit();
      setPendingChanges(new Set());
      alert("Alterações salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar alterações:", error);
      alert("Erro ao salvar alterações no Firebase.");
    } finally {
      setSaving(false);
    }
  }

  // 4. Excluir Cliente no Firebase (na coleção "usuarios")
  async function handleDelete(id, nome) {
    if (window.confirm(`Deseja realmente remover o usuário "${nome}"?`)) {
      try {
        await deleteDoc(doc(db, "usuarios", id));
        setCustomers(prev => prev.filter(c => c.id !== id));
        setPendingChanges(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        if (selectedCustomer?.id === id) setShowHistoryModal(false);
      } catch (error) {
        console.error("Erro ao remover cliente:", error);
        alert("Erro ao excluir cliente no banco de dados.");
      }
    }
  }

  // Formatadores
  const formatDate = (dateString) => {
    if (!dateString) return "Nenhuma compra";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Nenhuma compra";
    
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value || 0);
  };

  const openHistoryModal = (customer) => {
    setSelectedCustomer(customer);
    setShowHistoryModal(true);
  };

  // Filtragem local
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType =
      filterType === "Todos" || customer.tipo === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <main className="customers-page">
      <header className="customers-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Voltar
        </button>
        <h1>Gerenciar Clientes</h1>

        {/* Botão de Salvar no Cabeçalho */}
        <button
          className={`save-btn ${pendingChanges.size > 0 ? "active" : ""}`}
          onClick={handleSaveChanges}
          disabled={pendingChanges.size === 0 || saving}
          title={pendingChanges.size > 0 ? "Salvar alterações pendentes" : "Nenhuma alteração pendente"}
        >
          <Save fontSize="small" />
          <span>
            {saving
              ? "Salvando..."
              : pendingChanges.size > 0
              ? `Salvar (${pendingChanges.size})`
              : "Salvar"}
          </span>
        </button>
      </header>

      {/* Controles e Filtros */}
      <section className="customers-controls-card">
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-box">
          <label>Tipo:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="Todos">Todos os Tipos</option>
            <option value="Cliente">Cliente</option>
            <option value="admin">admin</option>
          </select>
        </div>
      </section>

      {/* Lista de Clientes */}
      <section className="customers-list-section">
        <h2>
          Usuários Cadastrados <span>({filteredCustomers.length})</span>
        </h2>

        {loading ? (
          <div className="empty-state">Carregando usuários do Firebase...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="empty-state">Nenhum usuário encontrado.</div>
        ) : (
          <div className="customers-table-wrapper">
            <table className="customers-table">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Tipo</th>
                  <th>Última Compra</th>
                  <th>Total Gasto</th>
                  <th>Itens</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => {
                  const isModified = pendingChanges.has(customer.id);
                  return (
                    <tr key={customer.id} className={isModified ? "row-modified" : ""}>
                      <td>
                        <div className="customer-info-cell">
                          <div className="customer-avatar">
                            {customer.nome ? customer.nome.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <strong>{customer.nome}</strong>
                            <small>{customer.email}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <select
                          className={`type-badge-select badge-${(customer.tipo || "cliente").toLowerCase()}`}
                          value={customer.tipo || "Cliente"}
                          onChange={(e) =>
                            handleTypeChange(customer.id, e.target.value)
                          }
                        >
                          <option value="Cliente">Cliente</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>

                      <td>{formatDate(customer.ultimaCompra)}</td>

                      <td className="highlight-price">
                        {formatCurrency(customer.totalGasto)}
                      </td>

                      <td>
                        <button
                          className="view-items-btn"
                          onClick={() => openHistoryModal(customer)}
                          title="Ver histórico de compras"
                        >
                          <ShoppingBag fontSize="small" />
                          <span>Ver Itens</span>
                        </button>
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button
                            className="delete-customer-btn"
                            onClick={() => handleDelete(customer.id, customer.nome)}
                            title="Excluir Usuário"
                          >
                            <PersonRemove fontSize="small" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal de Histórico de Itens */}
      {showHistoryModal && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <div>
                <h2>Histórico de Compra</h2>
                <p>{selectedCustomer.nome} ({selectedCustomer.email})</p>
              </div>
              <button
                className="close-modal-btn"
                onClick={() => setShowHistoryModal(false)}
              >
                <Close />
              </button>
            </header>

            <div className="modal-body">
              <div className="customer-summary-bar">
                <div>
                  <span>Tipo:</span> <strong>{selectedCustomer.tipo}</strong>
                </div>
                <div>
                  <span>Última Compra:</span>{" "}
                  <strong>{formatDate(selectedCustomer.ultimaCompra)}</strong>
                </div>
                <div>
                  <span>Total Acumulado:</span>{" "}
                  <strong className="neon-text">
                    {formatCurrency(selectedCustomer.totalGasto)}
                  </strong>
                </div>
              </div>

              <h3>Itens Adquiridos Recentemente</h3>

              {selectedCustomer.historicoItens &&
              selectedCustomer.historicoItens.length > 0 ? (
                <ul className="purchased-items-list">
                  {selectedCustomer.historicoItens.map((item, idx) => (
                    <li key={idx} className="purchased-item-card">
                      <div className="item-details">
                        <h4>{item.nome}</h4>
                        <span className="item-qty">Qtd: {item.qtd}</span>
                      </div>
                      <div className="item-price">
                        {formatCurrency(item.preco * item.qtd)}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-items">Este usuário ainda não realizou compras.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}