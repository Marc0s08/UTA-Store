import "./CategoryProducts.css";
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getProductsByCategory } from "../../services/productService";
import { calculateDiscount } from "../../utils/discount";

export default function CategoryProducts() {
    const { nomeCategoria } = useParams();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const categoriaDecodificada = decodeURIComponent(nomeCategoria || "");

    async function loadCategoryProducts() {
        try {
            setLoading(true);
            const data = await getProductsByCategory(categoriaDecodificada);
            const activeProducts = data.filter(product => product.ativo);
            setProducts(activeProducts);
        } catch (error) {
            console.error("Erro ao carregar produtos da categoria:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (nomeCategoria) {
            loadCategoryProducts();
        }
    }, [nomeCategoria]);

    if (loading) {
        return <div className="products-loading">Carregando produtos...</div>;
    }

    return (
        <main className="store-products">
            <div className="category-header-bar">
                <button onClick={() => navigate(-1)} className="back-btn-category">
                    ← Voltar
                </button>
                <h1>{categoriaDecodificada}</h1>
            </div>

            {products.length === 0 ? (
                <div className="empty-category-message">
                    <p>Nenhum produto ativo encontrado nesta categoria.</p>
                </div>
            ) : (
                <div className="store-product-grid">
                    {products.map(product => (
                        <div className="store-product-card" key={product.id}>
                            {product.precoPromocional > 0 && (
                                <div className="discount-badge">
                                    -{calculateDiscount(product.preco, product.precoPromocional)}%
                                </div>
                            )}

                            {product.imagens && product.imagens.length > 0 && (
                                <img src={product.imagens[0]} alt={product.nome} className="store-product-image" />
                            )}

                            <div className="store-product-info">
                                <h2>{product.nome}</h2>
                                <p className="category">{product.categoria}</p>

                                {product.precoPromocional > 0 ? (
                                    <div className="price-area">
                                        <span className="old-price">
                                            R$ {Number(product.preco).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </span>
                                        <strong className="promo-price">
                                            R$ {Number(product.precoPromocional).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </strong>
                                    </div>
                                ) : (
                                    <strong className="normal-price">
                                        R$ {Number(product.preco).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                    </strong>
                                )}

                                <p className="stock">Estoque: {product.estoque}</p>

                                <Link to={`/produto/${product.id}`} className="view-button">
                                    Ver produto
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}