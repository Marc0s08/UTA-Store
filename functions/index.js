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
    user: process.env.GMAIL_USER || "marcoseduc2019@gmail.com",
    pass: process.env.GMAIL_APP_PASSWORD || "orddzjyoxoicmmbc",
  },
});

exports.notifyAdminOnNewOrder = onDocumentCreated(
    "pedidos/{orderId}",
    async (event) => {
      const snap = event.data;
      if (!snap) return;
      const order = snap.data() || {};
      const id = event.params.orderId;
      const c = order.cliente || {};
      const end = c.endereco || {};
      const vTotal = Number(order.valorTotal || 0).toFixed(2);
      const sId = id.substring(0, 8).toUpperCase();
      const prods = Array.isArray(order.produtos) ? order.produtos : [];
      const prodsHtml = prods.map((i) => {
        const p = Number(i.preco || i.price || 0).toFixed(2);
        return `<li>${i.nome || "Prod"} - Qtd: ${i.quantidade || 1} - ` +
               `R$ ${p}</li>`;
      }).join("");

      try {
        const snapU = await firebaseAdmin.firestore()
            .collection("usuarios").get();
        const admins = [];
        snapU.forEach((doc) => {
          const d = doc.data();
          const t = d.tipo ? String(d.tipo).trim().toLowerCase() : "";
          if (t === "admin" && d.email) admins.push(d.email);
        });

        const mailOpts = {
          from: "\"UTA Store\" <marcoseduc2019@gmail.com>",
          to: admins.length > 0 ? admins.join(", ") :
              "marcoseduc2019@gmail.com",
          subject: `🔔 Novo Pedido: #${sId}`,
          html: `<div style="font-family: Arial; padding: 20px;">` +
                `<h2>🛒 Novo Pedido!</h2><p><strong>ID:</strong> ${id}</p>` +
                `<h3>Dados do Cliente:</h3>` +
                `<p>Nome: ${c.nome || "N/A"} | Email: ${c.email || "N/A"}</p>` +
                `<p>Tel: ${c.telefone || "N/A"} | CPF: ${c.cpf || "N/A"}</p>` +
                `<h3>Endereço:</h3>` +
                `<p>${end.rua || ""}, ${end.numero || "S/N"} - ` +
                `${end.cidade || ""}/${end.estado || ""}</p>` +
                `<h3>Itens:</h3><ul>${prodsHtml}</ul>` +
                `<p><strong>Total: R$ ${vTotal}</strong></p></div>`,
        };
        await transporter.sendMail(mailOpts);
      } catch (e) {
        console.error("Erro:", e);
      }
    },
);

exports.notifyCustomerOnStatusChange = onDocumentUpdated(
    "pedidos/{orderId}",
    async (event) => {
      const b = event.data.before.data();
      const a = event.data.after.data();
      const id = event.params.orderId;

      if (b.status !== a.status && a.cliente && a.cliente.email) {
        const mailOpts = {
          from: "\"UTA Store\" <marcoseduc2019@gmail.com>",
          to: a.cliente.email,
          subject: `📦 Pedido #${id.substring(0, 8).toUpperCase()}: ` +
                   `${a.status}`,
          html: `<div style="font-family: Arial; padding: 20px;">` +
                `<h2>Olá, ${a.cliente.nome || "Cliente"}!</h2>` +
                `<p>Status atualizado para: <strong>${a.status}</strong></p>` +
                `</div>`,
        };
        try {
          await transporter.sendMail(mailOpts);
        } catch (e) {
          console.error("Erro:", e);
        }
      }
    },
);
