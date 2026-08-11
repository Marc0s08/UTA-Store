import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from "firebase/firestore";
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "firebase/storage";
import { db, storage } from "../firebase/firebaseConfig";

const CATEGORIES_COLLECTION = "categorias";

// Buscar todas as categorias
export async function getCategories() {
  try {
    const q = query(collection(db, CATEGORIES_COLLECTION), orderBy("nome", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    throw error;
  }
}

// Upload da imagem da categoria no Firebase Storage
export async function uploadCategoryIcon(file) {
  if (!file) return "";
  const storageRef = ref(storage, `categorias/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

// Criar nova categoria
export async function createCategory(categoryData) {
  try {
    const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), categoryData);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    throw error;
  }
}

// Excluir categoria
export async function deleteCategory(id) {
  try {
    await deleteDoc(doc(db, CATEGORIES_COLLECTION, id));
  } catch (error) {
    console.error("Erro ao excluir categoria:", error);
    throw error;
  }
}