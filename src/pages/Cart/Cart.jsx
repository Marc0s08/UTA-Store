import "./Cart.css";
import { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { createOrder } from "../../services/orderService";
import { getUserProfile } from "../../services/userService";
import { calcularMelhorEnvio } from "../../services/freteService";
import { validateCoupon } from "../../services/couponService"; // <-- Importação do serviço de cupons
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [usarEnderecoCadastro, setUsarEnderecoCadastro] = useState(true);
  const [fretes, setFretes] = useState([]);
  const [freteSelecionado, setFreteSelecionado] = useState(null);
  const [calculando, setCalculando] = useState(false);

  // Estados para Cupom de Desconto
  const [cupomInput, setCupomInput] = useState("");
  const [cupomAplicado, setCupomAplicado] = useState(null);
  const [desconto, setDesconto] = useState(0);
  const [mensagemCupom, setMensagemCupom] = useState({ texto: "", erro: false });
  const [validandoCupom, setValidandoCupom] = useState(false);

  useEffect(() => {
    async function carregarPerfil() {
      if (!user) return;
      try {
        const dados = await getUserProfile(user.uid);
        setPerfil(dados);
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      }
    }
    carregarPerfil();
  }, [user]);

  // Recalcula o desconto se o total do carrinho mudar (ex: alteração de quantidade)
  useEffect(() => {
    if (cupomAplicado) {
      if (cupomAplicado.valorMinimo && total < cupomAplicado.valorMinimo) {
        setCupomAplicado(null);
        setDesconto(0);
        setMensagemCupom({
          texto: `Cupom removido. Valor mínimo de R$ ${cupomAplicado.valorMinimo} não atingido.`,
          erro: true,
        });
        return;
      }

      let valorDesconto = 0;
      if (cupomAplicado.tipo === "porcentagem") {
        valorDesconto = (total * Number(cupomAplicado.valor)) / 100;
      } else {
        valorDesconto = Number(cupomAplicado.valor);
      }

      // Desconto não pode ser maior que o subtotal dos produtos
      if (valorDesconto > total) valorDesconto = total;
      setDesconto(valorDesconto);
    }
  }, [total, cupomAplicado]);

  const pesoTotal = cart.reduce((soma, item) => {
    return soma + Number(item.peso || 0) * Number(item.quantidade || 1);
  }, 0);

  async function calcularFrete() {
    try {
      setCalculando(true);
      setFretes([]);
      setFreteSelecionado(null);

      let cepDestino = usarEnderecoCadastro ? perfil?.endereco?.cep : cep;
      const cepLimpo = cepDestino?.replace(/\D/g, "");

      if (!cepLimpo || cepLimpo.length !== 8) {
        alert("Digite um CEP válido ou verifique se o seu endereço cadastrado possui CEP.");
        return;
      }

      const buscaCep = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const dadosCep = await buscaCep.json();

      if (dadosCep.erro) {
        alert("CEP não encontrado");
        return;
      }

      setEndereco(dadosCep);

      const retorno = await calcularMelhorEnvio({
        cepDestino: cepLimpo,
        peso: pesoTotal,
      });

      const lista = Array.isArray(retorno) ? retorno : [retorno];

      setFretes(lista);

      if (lista.length > 0 && lista[0]) {
        setFreteSelecionado(lista[0]);
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao calcular frete");
    } finally {
      setCalculando(false);
    }
  }

  async function handleAplicarCupom() {
    if (!cupomInput.trim()) {
      setMensagemCupom({ texto: "Digite o código do cupom.", erro: true });
      return;
    }

    try {
      setValidandoCupom(true);
      setMensagemCupom({ texto: "", erro: false });

      const cupomValido = await validateCoupon(cupomInput.trim(), total);

      setCupomAplicado(cupomValido);

      let valorDesconto = 0;
      if (cupomValido.tipo === "porcentagem") {
        valorDesconto = (total * Number(cupomValido.valor)) / 100;
      } else {
        valorDesconto = Number(cupomValido.valor);
      }

      if (valorDesconto > total) valorDesconto = total;
      setDesconto(valorDesconto);

      setMensagemCupom({ texto: "Cupom aplicado com sucesso!", erro: false });
    } catch (error) {
      console.error("Erro ao aplicar cupom:", error);
      setCupomAplicado(null);
      setDesconto(0);
      setMensagemCupom({
        texto: error.message || "Cupom inválido ou expirado.",
        erro: true,
      });
    } finally {
      setValidandoCupom(false);
    }
  }

  function handleRemoverCupom() {
    setCupomAplicado(null);
    setDesconto(0);
    setCupomInput("");
    setMensagemCupom({ texto: "", erro: false });
  }

  async function handleCheckout() {
    if (!user) {
      alert("Faça login para finalizar a compra.");
      navigate("/login");
      return;
    }

    if (!endereco) {
      alert("Calcule o frete antes de finalizar.");
      return;
    }

    if (!freteSelecionado) {
      alert("Selecione uma opção de entrega.");
      return;
    }

    try {
      const profile = await getUserProfile(user.uid);
      const valorFrete = Number(freteSelecionado.valor || 0);
      const totalFinal = Math.max(0, total - desconto + valorFrete);

      const pedido = {
        usuarioId: user.uid,
        cliente: {
          nome: profile?.nome || user.displayName || user.email.split("@")[0],
          email: user.email,
          telefone: profile?.telefone || "",
          cpfCnpj: profile?.cpfCnpj || "",
        },
        enderecoEntrega: {
          ...(usarEnderecoCadastro && profile?.endereco ? profile.endereco : endereco),
          cep: usarEnderecoCadastro ? profile?.endereco?.cep : cep,
        },
        produtos: cart.map((item) => ({
          id: item.id,
          nome: item.nome,
          imagem: item.imagens?.[0] || "",
          quantidade: item.quantidade,
          peso: Number(item.peso || 0),
          preco: Number(item.precoPromocional > 0 ? item.precoPromocional : item.preco),
        })),
        frete: {
          id: freteSelecionado.id || null,
          servico: freteSelecionado.servico || freteSelecionado.name || "Frete",
          empresa: freteSelecionado.empresa || freteSelecionado.company?.name || "",
          valor: valorFrete,
          prazo: freteSelecionado.prazo || freteSelecionado.delivery_time || "",
        },
        cupom: cupomAplicado
          ? {
              codigo: cupomAplicado.codigo,
              descontoAplicado: desconto,
            }
          : null,
        valores: {
          produtos: Number(total),
          desconto: Number(desconto),
          frete: valorFrete,
          total: totalFinal,
        },
        status: "aguardando pagamento",
        criadoEm: new Date(),
      };

      await createOrder(pedido);

      clearCart();
      setFretes([]);
      setFreteSelecionado(null);
      setEndereco(null);
      setCupomAplicado(null);
      setDesconto(0);

      alert("Pedido realizado com sucesso!");
      navigate("/meus-pedidos");
    } catch (error) {
      console.error("Erro ao finalizar:", error);
      alert("Erro ao finalizar pedido.");
    }
  }

  if (cart.length === 0) {
    return (
      <main className="cart-page">
        <h1>Seu carrinho está vazio</h1>
        <p>Adicione produtos para continuar.</p>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <h1>Carrinho de compras</h1>

      <section className="cart-container">
        <div className="cart-products">
          {cart.map((product) => (
            <div className="cart-item" key={product.id}>
              <img src={product.imagens?.[0] || "/placeholder.png"} alt={product.nome} />

              <div className="cart-info">
                <h2>{product.nome}</h2>
                <p>
                  R${" "}
                  {Number(product.precoPromocional > 0 ? product.precoPromocional : product.preco).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </p>

                <div className="quantity">
                  <button onClick={() => decreaseQuantity(product.id)}>-</button>
                  <span>{product.quantidade}</span>
                  <button onClick={() => increaseQuantity(product.id)}>+</button>
                </div>
              </div>

              <button className="remove-button" onClick={() => removeFromCart(product.id)}>
                Remover
              </button>
            </div>
          ))}
        </div>

        <aside className="cart-summary">
          <h2>Entrega</h2>

          <label>
            <input type="radio" checked={usarEnderecoCadastro} onChange={() => setUsarEnderecoCadastro(true)} />
            Usar endereço cadastrado
          </label>

          <label>
            <input type="radio" checked={!usarEnderecoCadastro} onChange={() => setUsarEnderecoCadastro(false)} />
            Digitar outro CEP
          </label>

          {usarEnderecoCadastro && perfil?.endereco && (
            <div className="address-box">
              <p>
                {perfil.endereco.rua}, {perfil.endereco.numero}
              </p>
              <p>{perfil.endereco.bairro}</p>
              <p>
                {perfil.endereco.cidade} - {perfil.endereco.estado}
              </p>
              <p>CEP: {perfil.endereco.cep}</p>
            </div>
          )}

          {!usarEnderecoCadastro && (
            <input type="text" placeholder="Digite o CEP" value={cep} onChange={(e) => setCep(e.target.value)} />
          )}

          <button className="frete-button" onClick={calcularFrete}>
            {calculando ? "Calculando..." : "Calcular frete"}
          </button>

          {endereco && (
            <div className="cep-result">
              <p>{endereco.logradouro}</p>
              <p>{endereco.bairro}</p>
              <p>
                {endereco.localidade} - {endereco.uf}
              </p>
            </div>
          )}

          {fretes.length > 0 && (
            <div className="fretes-box">
              <h3>Opções de entrega</h3>
              {fretes.map((frete, index) => (
                <label key={frete.id || index} className="frete-option">
                  <input
                    type="radio"
                    name="frete"
                    checked={freteSelecionado?.id === frete.id}
                    onChange={() => setFreteSelecionado(frete)}
                  />
                  <div>
                    <strong>{frete.servico || frete.name || "Frete"}</strong>
                    <br />
                    {frete.empresa && <span>{frete.empresa}</span>}
                    <p>
                      R$ {Number(frete.valor || frete.price || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                    <small>{frete.prazo || "Prazo não informado"}</small>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* SEÇÃO DO CUPOM DE DESCONTO */}
          <h2>Cupom de Desconto</h2>
          <div className="coupon-box">
            {!cupomAplicado ? (
              <div className="coupon-input-group">
                <input
                  type="text"
                  placeholder="Código do cupom"
                  value={cupomInput}
                  onChange={(e) => setCupomInput(e.target.value.toUpperCase())}
                />
                <button onClick={handleAplicarCupom} disabled={validandoCupom}>
                  {validandoCupom ? "..." : "Aplicar"}
                </button>
              </div>
            ) : (
              <div className="coupon-applied">
                <span>
                  Cupom <strong>{cupomAplicado.codigo}</strong> aplicado!
                </span>
                <button onClick={handleRemoverCupom} className="remove-coupon-btn">
                  Remover
                </button>
              </div>
            )}

            {mensagemCupom.texto && (
              <p className={`coupon-message ${mensagemCupom.erro ? "error" : "success"}`}>
                {mensagemCupom.texto}
              </p>
            )}
          </div>

          <h2>Resumo</h2>

          <p>
            Peso: <strong> {pesoTotal.toFixed(3)}kg</strong>
          </p>

          <h3>
            Produtos:
            <span>R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
          </h3>

          {desconto > 0 && (
            <h3 className="discount-text">
              Desconto:
              <span>- R$ {desconto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            </h3>
          )}

          <h3>
            Frete:
            <span>
              R$ {Number(freteSelecionado?.valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </h3>

          <h3>
            Total:
            <span>
              R${" "}
              {Math.max(0, total - desconto + Number(freteSelecionado?.valor || 0)).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </span>
          </h3>

          <button className="checkout-button" onClick={handleCheckout}>
            Finalizar compra
          </button>
        </aside>
      </section>
    </main>
  );
}