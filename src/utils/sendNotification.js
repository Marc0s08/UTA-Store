import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export async function notifyAdminsOnPayment(order) {
  try {
    // 1. Busca no Firestore os e-mails dos usuários onde tipo == "Admin"
    const q = query(collection(db, "usuarios"), where("tipo", "==", "admin"));
    const querySnapshot = await getDocs(q);

    const adminEmails = [];
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.email) adminEmails.push(userData.email);
    });

    if (adminEmails.length === 0) {
      console.warn("Nenhum administrador cadastrado para receber notificações.");
      return;
    }

    // 2. Chama a Netlify Function criada
    const response = await fetch("/.netlify/functions/notify-admins", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId: order.id,
        valorTotal: order.valorTotal || order.total || 0,
        clientName: order.cliente?.nome || order.userName || "Cliente",
        clientEmail: order.cliente?.email || order.userEmail || "",
        adminEmails: adminEmails,
      }),
    });

    const result = await response.json();
    console.log("Notificação para admins enviada:", result);
  } catch (error) {
    console.error("Erro ao solicitar envio de e-mail:", error);
  }
}