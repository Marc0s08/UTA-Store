const {
  onDocumentCreated,
  onDocumentUpdated,
} = require("firebase-functions/v2/firestore");
const firebaseAdmin = require("firebase-admin");
const nodemailer = require("nodemailer");

firebaseAdmin.initializeApp();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER ||
      "marcoseduc2019@gmail.com",
    pass: process.env.GMAIL_APP_PASSWORD ||
      "sua-senha-de-app-16-letras",
  },
});

exports.notifyAdminOnNewOrder = onDocumentCreated(
    "pedidos/{orderId}",
    async (event) => {
      const snap = event.data;
      if (!snap) return;

      const order = snap.data() || {};
      const orderId = event.params.orderId;

      const clienteNome = order.cliente &&
        order.cliente.nome ?
        order.cliente.nome : "Não informado";
      const clienteEmail = order.cliente &&
        order.cliente.email ?
        order.cliente.email : "Não informado";
      const valorTotal = Number(
          order.valorTotal || 0,
      ).toFixed(2);
      const shortId = orderId.substring(0, 8)
          .toUpperCase();

      try {
        const usuariosSnapshot = await firebaseAdmin
            .firestore()
            .collection("usuarios")
            .get();

        const adminEmails = [];

        usuariosSnapshot.forEach((doc) => {
          const userData = doc.data();
          const tipoUser = userData.tipo ?
            String(userData.tipo).trim()
                .toLowerCase() : "";

          if (tipoUser === "admin") {
            if (userData.email) {
              adminEmails.push(userData.email);
            }
          }
        });

        if (adminEmails.length === 0) {
          adminEmails.push(
              process.env.GMAIL_USER ||
              "marcoseduc2019@gmail.com",
          );
        }

        const mailOptions = {
          from: "\"UTA Store\" <" +
            (process.env.GMAIL_USER ||
            "marcoseduc2019@gmail.com") + ">",
          to: adminEmails.join(", "),
          subject: `🔔 Novo Pedido: #${shortId}`,
          html: `
          <div style="font-family: Arial; padding: 20px;">
            <h2>🛒 Novo Pedido Confirmado!</h2>
            <p><strong>ID:</strong> ${orderId}</p>
            <hr />
            <h3>Cliente:</h3>
            <p><strong>Nome:</strong> ${clienteNome}</p>
            <p><strong>E-mail:</strong> ${clienteEmail}</p>
            <hr />
            <h3>Total:</h3>
            <p><strong>R$</strong> ${valorTotal}</p>
          </div>
        `,
        };

        await transporter.sendMail(mailOptions);
        console.log(
            "🚀 E-mail enviado para: [" +
            adminEmails.join(", ") + "]",
        );
      } catch (error) {
        console.error(
            "❌ Erro ao enviar e-mail para admins:",
            error,
        );
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
        const clienteEmail = afterData.cliente &&
          afterData.cliente.email;
        const clienteNome =
          (afterData.cliente &&
          afterData.cliente.nome) || "Cliente";

        if (!clienteEmail) return;

        const shortId = orderId.substring(0, 8)
            .toUpperCase();

        const mailOptions = {
          from: "\"UTA Store\" <" +
            (process.env.GMAIL_USER ||
            "marcoseduc2019@gmail.com") + ">",
          to: clienteEmail,
          subject: `📦 Pedido #${shortId}: ${newStatus}`,
          html: `
          <div style="font-family: Arial; padding: 20px;">
            <h2>Olá, ${clienteNome}!</h2>
            <p>O status do pedido <strong>#${shortId}</strong> 
               foi atualizado para:</p>
            <p style="color: #2b7a78; font-size: 16px;">
               <strong>${newStatus}</strong></p>
          </div>
        `,
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log(
              "🚀 E-mail de status enviado para: [" +
              clienteEmail + "]",
          );
        } catch (error) {
          console.error(
              "❌ Erro ao enviar e-mail ao cliente:",
              error,
          );
        }
      }
    },
);
