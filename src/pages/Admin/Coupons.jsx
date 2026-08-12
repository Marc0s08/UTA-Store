import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import "./Coupons.css";

export default function Coupons() {
  const [cupons, setCupons] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados do formulário de criação de cupom
  const [codigo, setCodigo] = useState("");
  const [tipo, setTipo] = useState("porcentagem"); // "porcentagem" ou "fixo"
  const [valor, setValor] = useState("");
  const [validade, setValidade] = useState("");

  // Estados para atribuição de cupom a cliente
  const [clienteSelecionado, setClienteSelecionado] = useState("");
  const [cupomSelecionado, setCupomSelecionado] = useState("");

  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setLoading(true);

      // Carrega cupons
      const cuponsSnap = await getDocs(collection(db, "cupons"));
      const listaCupons = cuponsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCupons(listaCupons);

      // Carrega clientes (tenta 'usuarios' e fallback 'clientes')
      let listaClientes = [];
      try {
        const clientesSnap = await getDocs(collection(db, "usuarios"));
        listaClientes = clientesSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch {
        const clientesSnap = await getDocs(collection(db, "clientes"));
        listaClientes = clientesSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      }
      setClientes(listaClientes);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }

  // 1. Criar novo cupom
  async function handleCriarCupom(e) {
    e.preventDefault();
    setMensagemSucesso("");
    setMensagemErro("");

    if (!codigo || !valor) {
      setMensagemErro("Preencha o código e o valor do desconto.");
      return;
    }

    try {
      const codigoFormatado = codigo.trim().toUpperCase();

      const novoCupom = {
        codigo: codigoFormatado,
        tipo,
        valor: Number(valor),
        validade: validade || null,
        criadoEm: serverTimestamp(),
      };

      await addDoc(collection(db, "cupons"), novoCupom);
      setMensagemSucesso(`Cupom "${codigoFormatado}" criado com sucesso!`);

      // Limpa campos
      setCodigo("");
      setValor("");
      setValidade("");

      carregarDados();
    } catch (error) {
      console.error("Erro ao criar cupom:", error);
      setMensagemErro("Ocorreu um erro ao criar o cupom.");
    }
  }

  // 2. Dar cupom para um cliente específico
  async function handleAtribuirCupom(e) {
    e.preventDefault();
    setMensagemSucesso("");
    setMensagemErro("");

    if (!clienteSelecionado || !cupomSelecionado) {
      setMensagemErro("Selecione um cliente e um cupom.");
      return;
    }

    try {
      const cupomObj = cupons.find((c) => c.id === cupomSelecionado);
      if (!cupomObj) return;

      // Atualiza o documento do cliente adicionando o cupom à lista de 'cupons' do cliente
      // Coleção de usuários (ajuste para 'clientes' se necessário)
      const userRef = doc(db, "usuarios", clienteSelecionado);

      await updateDoc(userRef, {
        cuponsRecebidos: arrayUnion({
          codigo: cupomObj.codigo,
          tipo: cupomObj.tipo,
          valor: cupomObj.valor,
          atribuidoEm: new Date().toISOString(),
          usado: false,
        }),
      });

      const clienteObj = clientes.find((c) => c.id === clienteSelecionado);
      const nomeCliente = clienteObj?.nome || clienteObj?.email || "Cliente";

      setMensagemSucesso(
        `Cupom "${cupomObj.codigo}" enviado para ${nomeCliente}!`
      );
      setClienteSelecionado("");
      setCupomSelecionado("");
    } catch (error) {
      console.error("Erro ao atribuir cupom:", error);
      setMensagemErro("Falha ao atribuir cupom ao cliente.");
    }
  }

  // 3. Deletar cupom
  async function handleExcluirCupom(id, codigoCupom) {
    if (!window.confirm(`Tem certeza que deseja excluir o cupom ${codigoCupom}?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, "cupons", id));
      setCupons(cupons.filter((c) => c.id !== id));
      setMensagemSucesso(`Cupom ${codigoCupom} removido.`);
    } catch (error) {
      console.error("Erro ao excluir cupom:", error);
      setMensagemErro("Erro ao excluir cupom.");
    }
  }

  if (loading) {
    return (
      <div className="coupons-loading">
        <div className="spinner"></div>
        <p>Carregando cupons e clientes...</p>
      </div>
    );
  }

  return (
    <div className="coupons-page">
      <div className="coupons-header">
        <h1>Gestão de Cupons</h1>
        <p>Crie novos cupons de desconto e atribua diretamente aos seus clientes.</p>
      </div>

      {mensagemSucesso && <div className="alert alert-success">{mensagemSucesso}</div>}
      {mensagemErro && <div className="alert alert-danger">{mensagemErro}</div>}

      <div className="coupons-grid">
        {/* Formulário 1: Criar Cupom */}
        <div className="coupons-card">
          <h2>Criar Novo Cupom</h2>
          <form onSubmit={handleCriarCupom} className="coupons-form">
            <div className="form-group">
              <label>Código do Cupom</label>
              <input
                type="text"
                placeholder="Ex: DESCONTO10"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tipo de Desconto</label>
                <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                  <option value="porcentagem">Porcentagem (%)</option>
                  <option value="fixo">Valor Fixo (R$)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Valor</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder={tipo === "porcentagem" ? "Ex: 10 (%)" : "Ex: 25.00 (R$)"}
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Data de Validade (Opcional)</label>
              <input
                type="date"
                value={validade}
                onChange={(e) => setValidade(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-submit">
              + Criar Cupom
            </button>
          </form>
        </div>

        {/* Formulário 2: Dar Cupom a Cliente */}
        <div className="coupons-card">
          <h2>Enviar Cupom a um Cliente</h2>
          <form onSubmit={handleAtribuirCupom} className="coupons-form">
            <div className="form-group">
              <label>Selecione o Cliente</label>
              <select
                value={clienteSelecionado}
                onChange={(e) => setClienteSelecionado(e.target.value)}
                required
              >
                <option value="">-- Escolha um cliente --</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome ? `${c.nome} (${c.email || "Sem e-mail"})` : c.email || c.id}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Selecione o Cupom</label>
              <select
                value={cupomSelecionado}
                onChange={(e) => setCupomSelecionado(e.target.value)}
                required
              >
                <option value="">-- Escolha um cupom --</option>
                {cupons.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.codigo} - {c.tipo === "porcentagem" ? `${c.valor}%` : `R$ ${c.valor}`}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn-submit btn-secondary">
              🎁 Enviar Cupom ao Cliente
            </button>
          </form>
        </div>
      </div>

      {/* Tabela / Lista de Cupons Ativos */}
      <div className="coupons-card table-card">
        <h2>Cupons Cadastrados</h2>
        {cupons.length === 0 ? (
          <p className="no-data">Nenhum cupom cadastrado até o momento.</p>
        ) : (
          <div className="table-responsive">
            <table className="coupons-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Tipo</th>
                  <th>Desconto</th>
                  <th>Validade</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {cupons.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span className="badge-code">{c.codigo}</span>
                    </td>
                    <td>{c.tipo === "porcentagem" ? "Porcentagem" : "Valor Fixo"}</td>
                    <td className="highlight-val">
                      {c.tipo === "porcentagem" ? `${c.valor}%` : `R$ ${c.valor.toFixed(2)}`}
                    </td>
                    <td>{c.validade ? new Date(c.validade).toLocaleDateString("pt-BR") : "Sem expiração"}</td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => handleExcluirCupom(c.id, c.codigo)}
                        title="Excluir Cupom"
                      >
                        🗑️ Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}