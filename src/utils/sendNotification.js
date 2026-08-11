// Substitua o conteúdo do arquivo por este:

export async function notifyAdminsOnPayment(order) {
  // Agora o envio de e-mail para o admin é feito automaticamente 
  // pela Firebase Cloud Function quando o pedido é criado no Firestore.
  console.log("ℹ️ Pedido processado. A notificação via Cloud Function é automática para o ID:", order?.id);
}