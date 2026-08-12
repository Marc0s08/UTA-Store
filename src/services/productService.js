import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    doc,
    getDoc,
    serverTimestamp,
    query,
    where // Import necessário para o filtro
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";
import { generateProductCode } from "../utils/generateProductCode";

const productCollection = collection(db, "produtos");

export async function createProduct(data) {
    const docRef = await addDoc(productCollection, {
        ...data,
        codigoProduto: "",
        criadoEm: serverTimestamp()
    });

    const codigo = generateProductCode(docRef.id);

    await updateDoc(docRef, {
        codigoProduto: codigo
    });

    return docRef;
}

export async function getProducts() {
    const snapshot = await getDocs(productCollection);
    return snapshot.docs.map(item => ({
        id: item.id,
        ...item.data()
    }));
}

// 🚀 NOVA FUNÇÃO: Busca produtos filtrados por categoria
export async function getProductsByCategory(categoriaNome) {
    try {
        // Cria a consulta filtrando pelo campo 'categoria'
        const q = query(
            productCollection, 
            where("categoria", "==", categoriaNome)
        );
        
        const snapshot = await getDocs(q);
        
        return snapshot.docs.map(item => ({
            id: item.id,
            ...item.data()
        }));
    } catch (error) {
        console.error("Erro ao buscar produtos por categoria:", error);
        return [];
    }
}

export async function getProductById(id) {
    console.log("Buscando produto ID:", id);
    const ref = doc(db, "produtos", id);
    const snap = await getDoc(ref);

    console.log("Produto existe:", snap.exists());

    if (snap.exists()) {
        return {
            id: snap.id,
            ...snap.data()
        };
    }
    return null;
}

export async function deleteProduct(id) {
    await deleteDoc(doc(db, "produtos", id));
}

export async function updateProduct(id, data) {
    await updateDoc(doc(db, "produtos", id), data);
}