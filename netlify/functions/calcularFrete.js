import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
    initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
        })
    });
}

const db = getFirestore();

export async function handler(event) {

    try {

        if (event.httpMethod !== "POST") {
            return {
                statusCode: 405,
                body: JSON.stringify({
                    erro: "Método não permitido"
                })
            };
        }

        const { cepDestino, pacote } = JSON.parse(event.body);

        const configSnap = await db
            .collection("configuracoes")
            .doc("melhorEnvio")
            .get();

        if (!configSnap.exists) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    erro: "Melhor Envio não conectado."
                })
            };
        }

        const config = configSnap.data();

        console.log("=== TOKEN ===");
        console.log("Conectado:", config.conectado);
        console.log("Possui token:", !!config.access_token);
        console.log("Primeiros 40 caracteres:", config.access_token.substring(0,40));

        const body = {
            from: {
                postal_code: pacote.cepOrigem
            },
            to: {
                postal_code: cepDestino
            },
            products: [
                {
                    id: "1",
                    width: Number(pacote.largura),
                    height: Number(pacote.altura),
                    length: Number(pacote.comprimento),
                    weight: Number(pacote.peso),
                    insurance_value: 1,
                    quantity: 1
                }
            ]
        };

        const response = await fetch(
            "https://www.melhorenvio.com.br/api/v2/me/shipment/calculate",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${config.access_token}`,
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "User-Agent": "UTA Store (marcoseduc2019@gmail.com)"
                },
                body: JSON.stringify(body)
            }
        );

        const text = await response.text();

        console.log("==================================");
        console.log("STATUS:", response.status);
        console.log("BODY:");
        console.log(text);
        console.log("==================================");

        return {
            statusCode: response.status,
            body: text
        };

    } catch (e) {

        console.error(e);

        return {
            statusCode: 500,
            body: JSON.stringify({
                erro: e.message,
                stack: e.stack
            })
        };

    }

}