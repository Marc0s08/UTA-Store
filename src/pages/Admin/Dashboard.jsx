import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";; // Ajuste o caminho se necessário
import "./Dashboard.css";

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    produtos: 0,
    pedidos: 0,
    clientes: 0,
    faturamento: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);

        // 1. Busca Produtos
        const produtosSnap = await getDocs(collection(db, "produtos"));
        const totalProdutos = produtosSnap.size;

        // 2. Busca Pedidos
        const pedidosSnap = await getDocs(collection(db, "pedidos"));
        const totalPedidos = pedidosSnap.size;

        // Calcula o faturamento total percorrendo os pedidos
        let totalFaturamento = 0;
        pedidosSnap.forEach((doc) => {
          const data = doc.data();
          // Soma se tiver o campo 'total' ou 'valorTotal'
          const valor = Number(data.total || data.valorTotal || 0);
          totalFaturamento += valor;
        });

        // 3. Busca Clientes / Usuários
        let totalClientes = 0;
        try {
          // Tenta buscar da coleção 'usuarios' ou 'clientes'
          const clientesSnap = await getDocs(collection(db, "usuarios"));
          totalClientes = clientesSnap.size;
        } catch {
          // Fallback caso a coleção se chame 'clientes'
          const clientesSnap = await getDocs(collection(db, "clientes"));
          totalClientes = clientesSnap.size;
        }

        setMetrics({
          produtos: totalProdutos,
          pedidos: totalPedidos,
          clientes: totalClientes,
          faturamento: totalFaturamento,
        });
      } catch (error) {
        console.error("Erro ao carregar dados do Dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Formata o valor numérico para Moeda (R$)
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Carregando métricas...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Visão geral do desempenho da sua loja em tempo real.</p>
      </div>

      <div className="dashboard-cards">
        {/* Card Produtos */}
        <div className="card">
          <div className="card-header">
            <h3>Produtos</h3>
            <span className="card-icon">📦</span>
          </div>
          <strong>{metrics.produtos}</strong>
        </div>

        {/* Card Pedidos */}
        <div className="card">
          <div className="card-header">
            <h3>Pedidos</h3>
            <span className="card-icon">🛍️</span>
          </div>
          <strong>{metrics.pedidos}</strong>
        </div>

        {/* Card Clientes */}
        <div className="card">
          <div className="card-header">
            <h3>Clientes</h3>
            <span className="card-icon">👥</span>
          </div>
          <strong>{metrics.clientes}</strong>
        </div>

        {/* Card Faturamento */}
        <div className="card card-highlight">
          <div className="card-header">
            <h3>Faturamento</h3>
            <span className="card-icon">💰</span>
          </div>
          <strong>{formatCurrency(metrics.faturamento)}</strong>
        </div>
      </div>
    </div>
  );
}