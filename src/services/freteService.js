import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

// Buscar configuração do pacote no Firestore
async function getFreteConfig() {
  const ref = doc(db, "configuracoes", "frete");
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new Error("Configuração de frete não encontrada no Firestore");
  }

  return snap.data();
}

export async function calcularMelhorEnvio({ cepDestino, peso }) {
  const config = await getFreteConfig();

  // Garante limites mínimos aceitos pelas transportadoras/Melhor Envio
  const pacote = {
    cepOrigem: String(config.cepOrigem || "").replace(/\D/g, ""),
    altura: Math.max(Number(config.altura) || 0, 4),
    largura: Math.max(Number(config.largura) || 0, 11),
    comprimento: Math.max(Number(config.comprimento) || 0, 16),
    peso: Number(peso) || 0.5,
    valor: 1,
  };

  console.log("PACOTE GERADO:", pacote);

  const response = await fetch("/.netlify/functions/calcularFrete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      cepDestino,
      pacote,
    }),
  });

  // 1. Tratamento para evitar o crash de 'Unexpected end of JSON input'
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`ERRO HTTP ${response.status}:`, errorText);
    
    if (response.status === 404) {
      throw new Error(
        "Função de frete não encontrada (404). Se estiver rodando localmente, execute o projeto usando 'netlify dev'."
      );
    }

    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.erro || errorJson.message || "Erro na consulta de frete");
    } catch {
      throw new Error(`Falha no servidor de frete (${response.status})`);
    }
  }

  // 2. Apenas faz o parse caso o status HTTP seja de sucesso (200-299)
  const data = await response.json();

  console.log("RETORNO MELHOR ENVIO:", data);

  // O Melhor Envio pode devolver objeto único ou array
  const lista = Array.isArray(data) ? data : [data];

  return lista.map((item) => ({
    id: item.id,
    servico: item.name || "Frete",
    transportadora: item.company?.name || "",
    valor: Number(item.price || 0),
    prazo: item.delivery_time
      ? `${item.delivery_time} dias úteis`
      : "Prazo não informado",
  }));
}