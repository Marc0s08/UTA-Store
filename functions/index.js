const {
  onDocumentCreated,
  onDocumentUpdated,
} = require("firebase-functions/v2/firestore");
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
      if (!snap) return;

      const order = snap.data() || {};
      const orderId = event.params.orderId;

      const clienteNome = order.cliente && order.cliente.nome ?
        order.cliente.nome : "Não informado";
      const clienteEmail = order.cliente && order.cliente.email ?
        order.cliente.email : "Não informado";
      const valorTotal = Number(order.valorTotal || 0).toFixed(2);
      const shortId = orderId.substring(0, 8).toUpperCase();

      const mailOptions = {
        from: "\"UTA Store\" <seu-email-admin@gmail.com>",
        to: "seu-email-admin@gmail.com",
        subject: `🔔 Novo Pedido Recebido: #${shortId}`,
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
        console.log(`✅ E-mail de novo pedido enviado para #${orderId}`);
      } catch (error) {
        console.error("❌ Erro ao enviar e-mail:", error);
      }
    },
);

exports.notifyCustomerOnStatusChange = onDocumentUpdated(
    "pedidos/{orderId}",
    async (event) => {
      const beforeData = event.data.before.data();
      const afterData = event.data.after.data();
      const orderId = event.params.orderId;

      const oldStatus = beforeData.status || "Pendente";
      const newStatus = afterData.status || "Pendente";

      if (oldStatus !== newStatus) {
        const clienteEmail = afterData.cliente && afterData.cliente.email;
        const clienteNome =
          (afterData.cliente && afterData.cliente.nome) || "Cliente";

        if (!clienteEmail) {
          console.log("Cliente sem e-mail cadastrado neste pedido.");
          return;
        }

        const shortId = orderId.substring(0, 8).toUpperCase();

        const mailOptions = {
          from: "\"UTA Store\" <seu-email-admin@gmail.com>",
          to: clienteEmail,
          subject: `📦 Atualização no pedido #${shortId}: ${newStatus}`,
          html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Olá, ${clienteNome}!</h2>
            <p>O status do seu pedido 
               <strong>#${shortId}</strong> 
               foi atualizado.</p>
            <div style="background-color: #f4f4f4; 
                        padding: 15px; border-radius: 5px; 
                        margin: 15px 0;">
              <p style="margin: 0; font-size: 16px;">
                <strong>Novo Status:</strong> 
                <span style="color: #2b7a78;">${newStatus}</span>
              </p>
            </div>
            <p>Acompanhe acessando a aba 
               <strong>Meus Pedidos</strong> em nossa loja.</p>
            <hr />
            <p style="font-size: 12px; color: #777;">
               Obrigado por comprar na UTA Store!</p>
          </div>
        `,
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log(`✅ E-mail enviado para ${clienteEmail}`);
        } catch (error) {
          console.error("❌ Erro ao enviar e-mail:", error);
        }
      }
    },
);
