const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER || "seu-email-admin@gmail.com",
    pass: process.env.GMAIL_APP_PASSWORD || "sua-senha-de-app-16-letras",
  },
});

exports.notifyAdminOnNewOrder = onDocumentCreated(
    "pedidos/{orderId}",
    async (event) => {
      const snap = event.data;
      if (!snap) {
        console.log("Nenhum dado encontrado no evento.");
        return;
      }

      const order = snap.data() || {};
      const orderId = event.params.orderId;

      const clienteNome = order.cliente && order.cliente.nome ?
        order.cliente.nome :
        "Não informado";

      const clienteEmail = order.cliente && order.cliente.email ?
        order.cliente.email :
        "Não informado";

      const valorTotal = Number(order.valorTotal || 0).toFixed(2);

      const mailOptions = {
        from: "\"UTA Store\" <seu-email-admin@gmail.com>",
        to: "seu-email-admin@gmail.com",
        subject:
        `🔔 Novo Pedido Recebido: #${orderId.substring(0, 8).toUpperCase()}`,
        html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>🛒 Novo Pedido Confirmado!</h2>
          <p><strong>ID do Pedido:</strong> ${orderId}</p>
          <hr />
          <h3>Dados do Cliente:</h3>
          <p><strong>Nome:</strong> ${clienteNome}</p>
          <p><strong>E-mail:</strong> ${clienteEmail}</p>
          <hr />
          <h3>Resumo financeiro:</h3>
          <p><strong>Valor Total:</strong> R$ ${valorTotal}</p>
        </div>
      `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ E-mail enviado para o pedido #${orderId}`);
      } catch (error) {
        console.error("❌ Erro ao enviar e-mail:", error);
      }
    },
);
