import "./Promotions.css";
import { useEffect, useState } from "react";
import { getProducts } from "../../services/productService";
import ProductCard from "../../components/ProductCard/ProductCard";

export default function Promotions() {
    const [categorizedPromos, setCategorizedPromos] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadPromotions() {
            try {
                setLoading(true);
                const allProducts = await getProducts();
                const validProducts = allProducts || [];

                // Filtra produtos que possuem preço promocional e desconto > 1%
                const promoProducts = validProducts.filter(p => {
                    const preco = Number(p.preco) || 0;
                    const precoPromocional = Number(p.precoPromocional) || 0;

                    if (precoPromocional <= 0 || precoPromocional >= preco) return false;

                    // Calcula a porcentagem de desconto
                    const discount = ((preco - precoPromocional) / preco) * 100;
                    return discount > 1;
                });

                // Agrupa os produtos promocionais por categoria
                const grouped = promoProducts.reduce((acc, product) => {
                    const cat = product.categoria || "Outros";
                    if (!acc[cat]) {
                        acc[cat] = [];
                    }
                    acc[cat].push(product);
                    return acc;
                }, {});

                setCategorizedPromos(grouped);
            } catch (error) {
                console.error("Erro ao carregar promoções:", error);
            } finally {
                setLoading(false);
            }
        }

        loadPromotions();
    }, []);

    if (loading) {
        return (
            <div className="promotions-loading">
                Carregando promoções...
            </div>
        );
    }

    const categories = Object.keys(categorizedPromos);

    return (
        <main className="store-promotions-page">
            <div className="promotions-header">
                <h1>🔥 Ofertas Imperdíveis</h1>
                <p>Aproveite descontos especiais em diversas categorias</p>
            </div>

            {categories.length === 0 ? (
                <div className="empty-promotions">
                    <p>Nenhuma promoção ativa no momento. Volte em breve!</p>
                </div>
            ) : (
                categories.map((category) => (
                    <section key={category} className="promo-category-section">
                        <h2>{category}</h2>
                        <div className="store-product-grid">
                            {categorizedPromos[category].map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </section>
                ))
            )}
        </main>
    );
}