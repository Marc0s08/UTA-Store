const {
  onDocumentCreated,
  onDocumentUpdated,
} = require("firebase-functions/v2/firestore");

const firebaseAdmin = require("firebase-admin");
const nodemailer = require("nodemailer");

firebaseAdmin.initializeApp();

const db = firebaseAdmin.firestore();

const GMAIL_USER = process.env.GMAIL_USER || "marcoseduc2019@gmail.com";
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || "orddzjyoxoicmmbc";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

/**
 * Escapa caracteres especiais de HTML para segurança.
 * @param {string} valor O valor a ser escapado.
 * @return {string} O valor tratado.
 */
function escaparHtml(valor) {
  if (valor === undefined || valor === null) {
    return "";
  }
  return String(valor)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}

/**
 * Formata um número para o padrão de moeda brasileira (BRL).
 * @param {number} valor O valor numérico.
 * @return {string} O valor formatado em reais.
 */
function dinheiro(valor) {
  const numero = Number(valor || 0);
  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Retorna os 8 primeiros caracteres de um ID em maiúsculo.
 * @param {string} id O ID completo.
 * @return {string} O ID curto formatado.
 */
function obterIdCurto(id) {
  return String(id || "")
      .substring(0, 8)
      .toUpperCase();
}

/**
 * Busca os e-mails dos usuários cadastrados como administradores.
 * @return {Promise<string[]>} Lista de e-mails de administradores.
 */
async function buscarEmailsAdmins() {
  try {
    const snapshot = await db
        .collection("usuarios")
        .get();

    const admins = [];

    snapshot.forEach((documento) => {
      const dados = documento.data() || {};
      const tipo = dados.tipo ?
        String(dados.tipo).trim().toLowerCase() : "";
      const email = dados.email ?
        String(dados.email).trim() : "";

      if (tipo === "admin" && email) {
        admins.push(email);
      }
    });

    if (admins.length === 0 && GMAIL_USER) {
      admins.push(GMAIL_USER);
    }

    return [...new Set(admins)];
  } catch (error) {
    console.error(
        "Erro ao buscar administradores:",
        error,
    );
    return GMAIL_USER ? [GMAIL_USER] : [];
  }
}

/**
 * Monta a listagem de produtos em HTML para o e-mail.
 * @param {Array} produtos Lista de produtos do pedido.
 * @return {string} O HTML gerado dos produtos.
 */
function montarProdutosHtml(produtos) {
  if (!Array.isArray(produtos) || produtos.length === 0) {
    return `
      <tr>
        <td
          colspan="4"
          style="
            padding:15px;
            text-align:center;
            color:#777;
          "
        >
          Nenhum produto encontrado.
        </td>
      </tr>
    `;
  }

  return produtos
      .map((produto) => {
        const nome = escaparHtml(
            produto.nome || "Produto",
        );
        const quantidade = Number(
            produto.quantidade || 1,
        );
        const preco = Number(
            produto.preco || 0,
        );
        const subtotal = preco * quantidade;
        const imagem = produto.imagem || "";

        return `
        <tr>
          <td
            style="
              padding:12px;
              border-bottom:1px solid #eeeeee;
            "
          >
            ${
  imagem ?
    `
                <img
                  src="${imagem}"
                  alt="${nome}"
                  style="
                    width:55px;
                    height:55px;
                    object-fit:cover;
                    border-radius:8px;
                    vertical-align:middle;
                    margin-right:10px;
                  "
                />
              ` :
    ""
}
            <strong>
              ${nome}
            </strong>
          </td>
          <td
            style="
              padding:12px;
              text-align:center;
              border-bottom:1px solid #eeeeee;
            "
          >
            ${quantidade}
          </td>
          <td
            style="
              padding:12px;
              text-align:right;
              border-bottom:1px solid #eeeeee;
            "
          >
            ${dinheiro(preco)}
          </td>
          <td
            style="
              padding:12px;
              text-align:right;
              border-bottom:1px solid #eeeeee;
            "
          >
            <strong>
              ${dinheiro(subtotal)}
            </strong>
          </td>
        </tr>
      `;
      })
      .join("");
}

exports.notifyAdminOnNewOrder = onDocumentCreated(
    "pedidos/{orderId}",
    async (event) => {
      const snap = event.data;
      if (!snap) {
        console.log("Documento do pedido não encontrado.");
        return;
      }

      const order = snap.data() || {};
      const orderId = event.params.orderId;

      const cliente = order.cliente || {};
      const endereco = order.enderecoEntrega || {};
      const frete = order.frete || {};
      const valores = order.valores || {};
      const produtos = Array.isArray(order.produtos) ?
        order.produtos : [];

      const nomeCliente = cliente.nome || "Cliente";
      const emailCliente = cliente.email || "Não informado";
      const telefone = cliente.telefone ||
        cliente.celular || "Não informado";
      const cpf = cliente.cpfCnpj || "Não informado";

      const logradouro = endereco.logradouro || "";
      const bairro = endereco.bairro || "";
      const cep = endereco.cep || "";
      const cidade = endereco.localidade || "";
      const estado = endereco.estado || "";
      const uf = endereco.uf || "";
      const complemento = endereco.complemento || "";

      const valorProdutos = Number(valores.produtos || 0);
      const valorFrete = Number(
          frete && frete.valor !== undefined ?
            frete.valor : (valores.frete || 0),
      );
      const valorTotal = Number(
          valores.total !== undefined ?
            valores.total : (valorProdutos + valorFrete),
      );

      const empresaFrete = frete.empresa || "Não informado";
      const servicoFrete = frete.servico || "Não informado";
      const prazoFrete = frete.prazo || "Não informado";
      const status = order.status || "Pendente";

      const produtosHtml = montarProdutosHtml(produtos);
      const admins = await buscarEmailsAdmins();

      if (admins.length === 0) {
        console.error(
            "Nenhum administrador encontrado para receber o e-mail.",
        );
        return;
      }

      const mailOptions = {
        from: `"UTA Store" <${GMAIL_USER}>`,
        to: admins.join(", "),
        subject: `🛒 Novo Pedido #${obterIdCurto(orderId)}`,
        html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
</head>
<body
  style="
    margin:0;
    padding:0;
    background:#f4f4f4;
    font-family:Arial,Helvetica,sans-serif;
    color:#222;
  "
>
<div
  style="
    max-width:700px;
    margin:30px auto;
    background:#ffffff;
    border-radius:14px;
    overflow:hidden;
    box-shadow:0 4px 20px rgba(0,0,0,.08);
  "
>
  <div
    style="
      background:#556B2F;
      color:#ffffff;
      padding:25px;
    "
  >
    <h1
      style="
        margin:0 0 8px 0;
        font-size:26px;
      "
    >
      🛒 Novo Pedido!
    </h1>
    <p
      style="
        margin:0;
        opacity:.9;
      "
    >
      Um novo pedido foi realizado na UTA Store.
    </p>
  </div>
  <div style="padding:25px;">
    <div
      style="
        background:#f7f7f7;
        border-radius:10px;
        padding:15px;
        margin-bottom:20px;
      "
    >
      <strong>Pedido:</strong> #${obterIdCurto(orderId)}
      <br>
      <strong>Status:</strong> ${escaparHtml(status)}
    </div>
    <h2
      style="
        color:#556B2F;
        font-size:20px;
      "
    >
      👤 Cliente
    </h2>
    <div
      style="
        background:#fafafa;
        border:1px solid #eeeeee;
        border-radius:10px;
        padding:15px;
        line-height:1.7;
      "
    >
      <strong>Nome:</strong> ${escaparHtml(nomeCliente)}
      <br>
      <strong>E-mail:</strong> ${escaparHtml(emailCliente)}
      <br>
      <strong>Telefone:</strong> ${escaparHtml(telefone)}
      <br>
      <strong>CPF:</strong> ${escaparHtml(cpf)}
    </div>
    <h2
      style="
        color:#556B2F;
        font-size:20px;
        margin-top:25px;
      "
    >
      📍 Endereço de Entrega
    </h2>
    <div
      style="
        background:#fafafa;
        border:1px solid #eeeeee;
        border-radius:10px;
        padding:15px;
        line-height:1.7;
      "
    >
      <strong>Logradouro:</strong> ${escaparHtml(logradouro)}
      <br>
      ${
  complemento ?
    `
        <strong>Complemento:</strong> ${escaparHtml(complemento)}
        <br>
      ` :
    ""
}
      <strong>Bairro:</strong> ${escaparHtml(bairro)}
      <br>
      <strong>Cidade:</strong> ${escaparHtml(cidade)} - 
      ${escaparHtml(uf || estado)}
      <br>
      <strong>CEP:</strong> ${escaparHtml(cep)}
    </div>
    <h2
      style="
        color:#556B2F;
        font-size:20px;
        margin-top:25px;
      "
    >
      🛍 Produtos
    </h2>
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="
        border-collapse:collapse;
        font-size:14px;
      "
    >
      <thead>
        <tr
          style="
            background:#f2f2f2;
          "
        >
          <th
            style="
              padding:12px;
              text-align:left;
            "
          >
            Produto
          </th>
          <th
            style="
              padding:12px;
              text-align:center;
            "
          >
            Qtd.
          </th>
          <th
            style="
              padding:12px;
              text-align:right;
            "
          >
            Preço
          </th>
          <th
            style="
              padding:12px;
              text-align:right;
            "
          >
            Subtotal
          </th>
        </tr>
      </thead>
      <tbody>
        ${produtosHtml}
      </tbody>
    </table>
    <h2
      style="
        color:#556B2F;
        font-size:20px;
        margin-top:25px;
      "
    >
      🚚 Entrega
    </h2>
    <div
      style="
        background:#fafafa;
        border:1px solid #eeeeee;
        border-radius:10px;
        padding:15px;
        line-height:1.7;
      "
    >
      <strong>Serviço:</strong> ${escaparHtml(servicoFrete)}
      <br>
      <strong>Transportadora:</strong> ${escaparHtml(empresaFrete)}
      <br>
      <strong>Prazo:</strong> ${escaparHtml(prazoFrete)}
      <br>
      <strong>Frete:</strong> ${dinheiro(valorFrete)}
    </div>
    <div
      style="
        margin-top:25px;
        background:#556B2F;
        color:#ffffff;
        border-radius:12px;
        padding:20px;
      "
    >
      <div
        style="
          display:flex;
          justify-content:space-between;
          margin-bottom:8px;
        "
      >
        <span>Produtos</span>
        <strong>${dinheiro(valorProdutos)}</strong>
      </div>
      <div
        style="
          display:flex;
          justify-content:space-between;
          margin-bottom:12px;
        "
      >
        <span>Frete</span>
        <strong>${dinheiro(valorFrete)}</strong>
      </div>
      <hr
        style="
          border:0;
          border-top:1px solid rgba(255,255,255,.3);
        "
      >
      <div
        style="
          display:flex;
          justify-content:space-between;
          font-size:22px;
          margin-top:12px;
        "
      >
        <strong>TOTAL</strong>
        <strong>${dinheiro(valorTotal)}</strong>
      </div>
    </div>
  </div>
  <div
    style="
      background:#f5f5f5;
      padding:18px;
      text-align:center;
      color:#777;
      font-size:12px;
    "
  >
    UTA Store<br>
    Notificação automática de pedido.
  </div>
</div>
</body>
</html>
      `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`E-mail de novo pedido enviado: ${orderId}`);
      } catch (error) {
        console.error("Erro ao enviar e-mail do novo pedido:", error);
      }
    },
);

exports.notifyCustomerOnStatusChange = onDocumentUpdated(
    "pedidos/{orderId}",
    async (event) => {
      const before = event.data && event.data.before ?
        event.data.before.data() : null;
      const after = event.data && event.data.after ?
        event.data.after.data() : null;

      if (!before || !after) {
        return;
      }

      const orderId = event.params.orderId;

      if (before.status === after.status) {
        return;
      }

      const cliente = after.cliente || {};
      const email = cliente.email ?
        String(cliente.email).trim() : "";

      if (!email) {
        console.log(`Pedido ${orderId} sem e-mail do cliente.`);
        return;
      }

      const nome = cliente.nome || "Cliente";
      const status = after.status || "Atualizado";
      const valor = after.valores && after.valores.total ?
        after.valores.total : 0;

      const mailOptions = {
        from: `"UTA Store" <${GMAIL_USER}>`,
        to: email,
        subject: `📦 Pedido #${obterIdCurto(orderId)} - ${status}`,
        html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
</head>
<body
  style="
    margin:0;
    padding:0;
    background:#f4f4f4;
    font-family:Arial,Helvetica,sans-serif;
  "
>
<div
  style="
    max-width:600px;
    margin:30px auto;
    background:#ffffff;
    border-radius:14px;
    overflow:hidden;
    box-shadow:0 4px 20px rgba(0,0,0,.08);
  "
>
  <div
    style="
      background:#556B2F;
      color:#ffffff;
      padding:25px;
      text-align:center;
    "
  >
    <h1
      style="
        margin:0;
      "
    >
      📦 Atualização do Pedido
    </h1>
  </div>
  <div
    style="
      padding:30px;
    "
  >
    <h2>
      Olá, ${escaparHtml(nome)}!
    </h2>
    <p
      style="
        color:#555;
        font-size:16px;
        line-height:1.6;
      "
    >
      Temos uma atualização sobre o seu pedido.
    </p>
    <div
      style="
        background:#f7f7f7;
        border-radius:12px;
        padding:20px;
        margin:25px 0;
      "
    >
      <p>
        <strong>Pedido:</strong>
        #${obterIdCurto(orderId)}
      </p>
      <p>
        <strong>Novo status:</strong>
        ${escaparHtml(status)}
      </p>
      <p>
        <strong>Total:</strong>
        ${dinheiro(valor)}
      </p>
    </div>
    <p
      style="
        color:#777;
        line-height:1.6;
      "
    >
      Acompanhe o andamento do seu pedido
      através da sua conta na UTA Store.
    </p>
  </div>
  <div
    style="
      background:#f5f5f5;
      padding:18px;
      text-align:center;
      color:#777;
      font-size:12px;
    "
  >
    UTA Store<br>
    Esta é uma mensagem automática.
  </div>
</div>
</body>
</html>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(
            `Status do pedido ${orderId} atualizado para ${status}. ` +
            `E-mail enviado para ${email}.`,
        );
      } catch (error) {
        console.error(
            "Erro ao enviar atualização ao cliente:",
            error,
        );
      }
    },
);
