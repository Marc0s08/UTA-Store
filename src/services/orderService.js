import {
    collection,
    addDoc,
    serverTimestamp,
    query,
    where,
    getDocs,
    getDoc,
    updateDoc,
    doc
} from "firebase/firestore";

import {
    db
} from "../firebase/firebaseConfig";

const ordersCollection = collection(
    db,
    "pedidos"
);



// ===========================
// Criar pedido
// ===========================

export async function createOrder(order){

    const docRef = await addDoc(

        ordersCollection,

        {

            ...order,

            status:"Pendente",

            criadoEm:serverTimestamp(),

            atualizadoEm:serverTimestamp()

        }

    );

    return docRef.id;

}



// ===========================
// Pedidos do usuário
// ===========================

export async function getOrdersByUser(userId){

    const q = query(

        ordersCollection,

        where(

            "usuarioId",

            "==",

            userId

        )

    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc=>({

        id:doc.id,

        ...doc.data()

    }));

}



// ===========================
// Todos os pedidos (ADMIN)
// ===========================

export async function getAllOrders(){

    const snapshot = await getDocs(
        ordersCollection
    );

    return snapshot.docs.map(doc=>({

        id:doc.id,

        ...doc.data()

    }));

}



// ===========================
// Buscar pedido por ID
// ===========================

export async function getOrderById(id){

    const ref = doc(
        db,
        "pedidos",
        id
    );

    const snap = await getDoc(ref);

    if(snap.exists()){

        return{

            id:snap.id,

            ...snap.data()

        };

    }

    return null;

}



// ===========================
// Alterar status
// ===========================

export async function updateOrderStatus(id,status){

    const ref = doc(
        db,
        "pedidos",
        id
    );

    await updateDoc(

        ref,

        {

            status,

            atualizadoEm:serverTimestamp()

        }

    );

}



// ===========================
// Atualizar pedido
// ===========================

export async function updateOrder(id,data){

    const ref = doc(
        db,
        "pedidos",
        id
    );

    await updateDoc(

        ref,

        {

            ...data,

            atualizadoEm:serverTimestamp()

        }

    );

}