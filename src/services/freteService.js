import {
    doc,
    getDoc
} from "firebase/firestore";

import {
    db
} from "../firebase/firebaseConfig";

export async function getFreteConfig() {

    const ref = doc(
        db,
        "configuracoes",
        "frete"
    );

    const snapshot = await getDoc(ref);

    if (snapshot.exists()) {
        return snapshot.data();
    }

    return null;
}

export async function calcularMelhorEnvio({

    cepDestino,

    peso

}) {

    const config = await getFreteConfig();

    if (!config) {
        throw new Error("Configuração de frete não encontrada");
    }

    const response = await fetch(
        "/.netlify/functions/calcularFrete",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({

                cepDestino,

                pacote: {

                    cepOrigem: config.cepOrigem,

                    altura: Number(config.altura),

                    largura: Number(config.largura),

                    comprimento: Number(config.comprimento),

                    peso: Number(peso) + Number(config.pesoBase || 0)

                }

            })
        }
    );

    const data = await response.json();

    console.log("Resposta Melhor Envio:", data);

    if (!response.ok) {
        throw new Error(data.erro || "Erro ao consultar Melhor Envio");
    }

    if (!Array.isArray(data)) {
        throw new Error("Resposta inválida do Melhor Envio");
    }

    const melhorOpcao = data
        .filter(item => !item.error)
        .sort((a, b) => Number(a.price) - Number(b.price))[0];

    if (!melhorOpcao) {
        throw new Error("Nenhuma transportadora disponível.");
    }

    return {

        servico: melhorOpcao.name,

        valor: Number(melhorOpcao.price),

        prazo: `${melhorOpcao.delivery_time} dias úteis`

    };

}