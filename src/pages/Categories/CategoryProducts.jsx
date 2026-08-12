import "./CategoryProducts.css";
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { getProducts } from "../../services/productService";
import ProductCard from "../../components/ProductCard/ProductCard";

export default function CategoryProducts() {
    const { nomeCategoria } = useParams();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [categoriesWithData, setCategoriesWithData] = useState([]);
    const [loading, setLoading] = useState(true);

    const categoriaDecodificada = decodeURIComponent(nomeCategoria || "");

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);

                // 1. Busca todos os produtos cadastrados na loja
                const allProducts = await getProducts();
                const validProducts = allProducts || [];

                if (nomeCategoria) {
                    // Se o usuário clicou em uma categoria específica, filtra os produtos dela
                    const filtered = validProducts.filter(
                        p => p.categoria && p.categoria.toLowerCase() === categoriaDecodificada.toLowerCase()
                    );
                    setProducts(filtered);
                } else {
                    // 2. Se está na rota geral (/categorias), busca as categorias cadastradas pelo Admin no Firestore
                    const categoriesSnapshot = await getDocs(collection(db, "categorias"));
                    const categoriesList = categoriesSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    // 3. Conta quantos produtos existem para cada categoria cadastrada
                    const categoriesWithCount = categoriesList.map(cat => {
                        const count = validProducts.filter(
                            p => p.categoria && p.categoria.toLowerCase() === cat.nome.toLowerCase()
                        ).length;

                        return {
                            ...cat,
                            productCount: count
                        };
                    });

                    setCategoriesWithData(categoriesWithCount);
                }
            } catch (error) {
                console.error("Erro ao carregar dados da categoria:", error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [nomeCategoria]);

    if (loading) {
        return (
            <div className="products-loading" style={{ color: 'white', textAlign: 'center', padding: '50px' }}>
                Carregando...
            </div>
        );
    }

    // SE NÃO HOUVER CATEGORIA NA URL: Mostra a grade de categorias cadastradas pelo Admin (com imagem e contador)
    if (!nomeCategoria) {
        return (
            <main className="store-category-products">
                <h1>Categorias</h1>
                {categoriesWithData.length === 0 ? (
                    <div className="empty-category-message" style={{ color: 'white', textAlign: 'center', padding: '40px' }}>
                        <p>Nenhuma categoria cadastrada no painel admin.</p>
                    </div>
                ) : (
                    <div className="store-category-grid-admin">
                        {categoriesWithData.map((cat) => (
                            <Link 
                                key={cat.id} 
                                to={`/categoria/${encodeURIComponent(cat.nome)}`}
                                className="store-category-box"
                            >
                                {cat.imagem && (
                                    <div className="category-img-container">
                                        <img src={cat.imagem} alt={cat.nome} />
                                    </div>
                                )}
                                <div className="category-box-info">
                                    <h2>{cat.nome}</h2>
                                    <p>{cat.productCount} {cat.productCount === 1 ? 'produto' : 'produtos'}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        );
    }

    // SE HOUVER CATEGORIA NA URL: Mostra os produtos filtrados daquela categoria
    return (
        <main className="store-category-products">
            <div className="category-header-bar">
                <button onClick={() => navigate(-1)} className="back-btn-category">
                    ← Voltar
                </button>
                <h1>{categoriaDecodificada}</h1>
            </div>

            {products.length === 0 ? (
                <div className="empty-category-message" style={{ color: 'white', textAlign: 'center', padding: '40px' }}>
                    <p>Nenhum produto encontrado nesta categoria.</p>
                </div>
            ) : (
                <div className="store-product-grid">
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </main>
    );
}