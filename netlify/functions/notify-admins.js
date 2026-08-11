import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function handler(event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 455,
      body: JSON.stringify({ message: "Método não permitido" }),
    };
  }

  try {
    const { order } = JSON.parse(event.body || "{}");

    // E-mail dos administradores que receberão o aviso
    const adminEmail = process.env.ADMIN_EMAIL || "seu-email@exemplo.com";

    const data = await resend.emails.send({
      from: "UTA Store <marcoseduc2019@gmail.com>", // Ou seu domínio verificado
      to: [adminEmail],
      subject: `🔔 Novo Pedido Recebido: #${order?.id?.substring(0, 8).toUpperCase()}`,
      html: `
        <h2>Novo Pedido Confirmado!</h2>
        <p><strong>ID do Pedido:</strong> ${order?.id}</p>
        <p><strong>Cliente:</strong> ${order?.cliente?.nome || "Não informado"}</p>
        <p><strong>E-mail:</strong> ${order?.cliente?.email || "Não informado"}</p>
        <p><strong>Valor Total:</strong> R$ ${Number(order?.valorTotal || 0).toFixed(2)}</p>
      `,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data }),
    };
  } catch (error) {
    console.error("Erro na Netlify Function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}