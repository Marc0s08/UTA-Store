import "./ProductCard.css";
import { Link } from "react-router-dom";
import { calculateDiscount } from "../../utils/discount";

export default function ProductCard({ product }) {
    const hasDiscount = product.precoPromocional > 0;

    return (
        <div className="store-product-card" key={product.id}>
            {hasDiscount && (
                <div className="discount-badge">
                    -{calculateDiscount(product.preco, product.precoPromocional)}%
                </div>
            )}

            {product.imagens && product.imagens.length > 0 && (
                <img
                    src={product.imagens[0]}
                    alt={product.nome}
                    className="store-product-image"
                />
            )}

            <div className="store-product-info">
                <h2>{product.nome}</h2>
                <p className="category">{product.categoria}</p>

                {hasDiscount ? (
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

                <p className="stock">
                    Estoque: {product.estoque}
                </p>

                <Link
                    to={`/produto/${product.id}`}
                    className="view-button"
                >
                    Ver produto
                </Link>
            </div>
        </div>
    );
}