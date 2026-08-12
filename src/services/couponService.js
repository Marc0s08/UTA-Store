import { 
  collection, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from "firebase/firestore";
import { db } from "./firebase"; // Ajuste o caminho do seu firebase.js se necessário

const COUPONS_COLLECTION = "cupons";

/**
 * Valida se um cupom existe, está ativo, dentro da validade e atinge o valor mínimo do carrinho.
 */
export async function validateCoupon(codigo, totalCarrinho) {
  if (!codigo) throw new Error("Informe o código do cupom.");

  const codigoFormatado = codigo.trim().toUpperCase();
  const q = query(collection(db, COUPONS_COLLECTION), where("codigo", "==", codigoFormatado));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error("Cupom inválido.");
  }

  const docData = querySnapshot.docs[0];
  const cupom = { id: docData.id, ...docData.data() };

  // 1. Verifica se está ativo
  if (cupom.ativo === false) {
    throw new Error("Este cupom não está mais ativo.");
  }

  // 2. Verifica a validade (se houver data de expiração)
  if (cupom.validade) {
    const dataExpiracao = new Date(cupom.validade);
    const hoje = new Date();
    if (hoje > dataExpiracao) {
      throw new Error("Este cupom já expirou.");
    }
  }

  // 3. Verifica o valor mínimo de compra (se houver)
  if (cupom.valorMinimo && totalCarrinho < Number(cupom.valorMinimo)) {
    throw new Error(
      `O valor mínimo para usar este cupom é R$ ${Number(cupom.valorMinimo).toFixed(2).replace(".", ",")}.`
    );
  }

  return cupom;
}

/**
 * Busca todos os cupons (Usado no Painel Admin)
 */
export async function getCoupons() {
  const querySnapshot = await getDocs(collection(db, COUPONS_COLLECTION));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

/**
 * Cria um novo cupom (Usado no Painel Admin)
 */
export async function createCoupon(data) {
  const docRef = await addDoc(collection(db, COUPONS_COLLECTION), {
    ...data,
    codigo: data.codigo.trim().toUpperCase(),
    ativo: data.ativo ?? true,
    criadoEm: new Date(),
  });
  return docRef.id;
}

/**
 * Atualiza um cupom (Usado no Painel Admin)
 */
export async function updateCoupon(id, data) {
  const couponRef = doc(db, COUPONS_COLLECTION, id);
  if (data.codigo) {
    data.codigo = data.codigo.trim().toUpperCase();
  }
  await updateDoc(couponRef, data);
}

/**
 * Deleta um cupom (Usado no Painel Admin)
 */
export async function deleteCoupon(id) {
  const couponRef = doc(db, COUPONS_COLLECTION, id);
  await deleteDoc(couponRef);
}