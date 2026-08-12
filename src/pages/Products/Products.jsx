import "./Products.css";
import { useEffect, useState } from "react";
import { getProducts } from "../../services/productService";
import ProductCard from "../../components/ProductCard/ProductCard";

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    async function loadProducts() {
        try {
            const data = await getProducts();
            const activeProducts = data.filter(product => product.ativo);
            setProducts(activeProducts);
        } catch (error) {
            console.log("Erro ao carregar produtos:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadProducts();
    }, []);

    if (loading) {
        return (
            <div className="products-loading">
                Carregando produtos...
            </div>
        );
    }

    return (
        <main className="store-products">
            <h1>Produtos</h1>

            <div className="store-product-grid">
                {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </main>
    );
}