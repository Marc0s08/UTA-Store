const { Resend } = require("resend");

// Inicializa o Resend com a chave gravada nas variáveis de ambiente do Netlify
const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async (event, context) => {
  // Aceita apenas requisições do tipo POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Método não permitido" }),
    };
  }

  try {
    const { orderId, valorTotal, clientName, clientEmail, adminEmails } = JSON.parse(event.body);

    if (!adminEmails || adminEmails.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Nenhum e-mail de admin fornecido." }),
      };
    }

    const valorFormatado = Number(valorTotal || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    // Envia o e-mail para todos os admins recebidos
    const data = await resend.emails.send({
      from: "UTA Store <onboarding@resend.dev>", // Altere para seu e-mail/domínio configurado no Resend
      to: adminEmails,
      subject: `🚨 Novo Pedido Aprovado! #${orderId.substring(0, 8).toUpperCase()}`,
      html: `
        <div style="font-family: sans-serif; background-color: #161618; color: #ffffff; padding: 24px; border-radius: 12px;">
          <h2 style="color: #8bc34a; margin-top: 0;">🎉 Novo Pedido Pago!</h2>
          <p>Um novo pedido teve o pagamento confirmado e precisa ser processado.</p>
          <hr style="border: 0; border-top: 1px solid #27272a; margin: 16px 0;" />
          <p><strong>ID do Pedido:</strong> #${orderId}</p>
          <p><strong>Cliente:</strong> ${clientName || "Não informado"} (${clientEmail || "Sem e-mail"})</p>
          <p><strong>Valor Total:</strong> <span style="color: #8bc34a; font-weight: bold;">${valorFormatado}</span></p>
          <hr style="border: 0; border-top: 1px solid #27272a; margin: 16px 0;" />
          <p style="font-size: 12px; color: #a1a1aa;">Acesse o painel administrativo da UTA Store para conferir os detalhes.</p>
        </div>
      `,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "E-mail de notificação enviado com sucesso!", data }),
    };
  } catch (error) {
    console.error("Erro ao enviar e-mail via Netlify Function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};