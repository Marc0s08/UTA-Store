import {
    doc,
    setDoc,
    getDoc
} from "firebase/firestore";

import {
    db
} from "../firebase/firebaseConfig";

export async function createUserProfile(uid, data) {
    // Captura o objeto de endereço, seja ele vindo como 'enderecoEnvio' ou 'endereco'
    const endereco = data.enderecoEnvio || data.endereco || {};

    // Mapeamento blindado com fallbacks ("") para evitar 'undefined' no Firestore
    const perfilFormatado = {
        nome: data.nome || "",
        email: data.email || "",
        cpfCnpj: data.cpfCnpj || "",
        telefone: data.telefone || "",
        tipo: data.tipo || "cliente",
        emailVerificado: data.emailVerificado ?? false,
        criadoEm: data.criadoEm || new Date().toISOString(),

        // Salva na estrutura padronizada 'enderecoEnvio'
        enderecoEnvio: {
            cep: endereco.cep || data.cep || "",
            rua: endereco.rua || data.rua || "",
            numero: endereco.numero || data.numero || "",
            complemento: endereco.complemento || data.complemento || "",
            referencia: endereco.referencia || data.referencia || "",
            bairro: endereco.bairro || data.bairro || "",
            cidade: endereco.cidade || data.cidade || "",
            estado: (endereco.estado || data.estado || "").toUpperCase()
        }
    };

    await setDoc(
        doc(db, "usuarios", uid),
        perfilFormatado
    );
}

export async function getUserProfile(uid) {
    const userRef = doc(db, "usuarios", uid);
    const snapshot = await getDoc(userRef);

    if (snapshot.exists()) {
        return snapshot.data();
    }

    return null;
}