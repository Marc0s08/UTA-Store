import "./Products.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductForm from "../../components/ProductForm/ProductForm";
import { getProducts, deleteProduct } from "../../services/productService";
import { calculateDiscount } from "../../utils/discount";

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadProducts() {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.log("Erro ao carregar produtos:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleDelete(id) {
    const confirmDelete = window.confirm(
      "Deseja realmente excluir este produto?"
    );

    if (!confirmDelete) return;

    await deleteProduct(id);
    loadProducts();
  }

  function handleEdit(product) {
    setEditingProduct(product);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <main className="products-admin">
      <header className="products-admin-header">
        <div>
          <h1>Gerenciar Produtos</h1>
          <p className="subtitle">
            Cadastre, edite e organize o catálogo da sua loja
          </p>
        </div>
      </header>

      {/* Formulário de Produto */}
      <div className="form-container-card">
        <ProductForm
          productEdit={editingProduct}
          onSaved={() => {
            setEditingProduct(null);
            loadProducts();
          }}
        />
      </div>

      {/* Lista de Produtos */}
      <section className="products-list-section">
        <div className="section-title-bar">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h2>Produtos Cadastrados</h2>
            <span className="products-count">{products.length} itens</span>
          </div>

          {/* Opção para gerenciar/cadastrar categorias integrada à listagem */}
          <button
            className="manage-categories-btn"
            onClick={() => navigate("/admin/categorias")}
          >
            ➕ Gerenciar / Cadastrar Categorias
          </button>
        </div>

        {loading ? (
          <div className="products-skeleton">Carregando produtos...</div>
        ) : products.length === 0 ? (
          <div className="empty-products-state">
            <p>Nenhum produto cadastrado ainda.</p>
          </div>
        ) : (
          <div className="product-list">
            {products.map((product) => (
              <article className="product-card" key={product.id}>
                {/* Badge de Desconto */}
                {product.precoPromocional > 0 && (
                  <div className="discount-badge">
                    -
                    {calculateDiscount(
                      product.preco,
                      product.precoPromocional
                    )}
                    %
                  </div>
                )}

                {/* Imagem do Produto */}
                <div className="product-image-wrapper">
                  {product.imagens && product.imagens.length > 0 ? (
                    <img
                      src={product.imagens[0]}
                      alt={product.nome}
                      className="product-thumbnail"
                      loading="lazy"
                    />
                  ) : (
                    <div className="no-image-placeholder">
                      <span>Sem imagem</span>
                    </div>
                  )}

                  {/* Status do Produto sobreposto na imagem */}
                  <span
                    className={
                      product.ativo
                        ? "status-pill active"
                        : "status-pill inactive"
                    }
                  >
                    <span className="dot"></span>
                    {product.ativo ? "Ativo" : "Inativo"}
                  </span>
                </div>

                {/* Informações do Produto */}
                <div className="product-card-body">
                  <span className="product-category">
                    {product.categoria || "Geral"}
                  </span>
                  <h3 className="product-title">{product.nome}</h3>

                  <p className="product-code">
                    Cód: <strong>{product.codigoProduto || "N/A"}</strong>
                  </p>

                  <div className="price-area">
                    {product.precoPromocional > 0 ? (
                      <>
                        <span className="old-price">
                          R${" "}
                          {Number(product.preco).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                        <span className="new-price">
                          R${" "}
                          {Number(product.precoPromocional).toLocaleString(
                            "pt-BR",
                            {
                              minimumFractionDigits: 2,
                            }
                          )}
                        </span>
                      </>
                    ) : (
                      <span className="new-price">
                        R${" "}
                        {Number(product.preco).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    )}
                  </div>

                  <div className="stock-info">
                    <span>Estoque disponível:</span>
                    <strong
                      className={
                        product.estoque > 0 ? "in-stock" : "out-of-stock"
                      }
                    >
                      {product.estoque} un.
                    </strong>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="product-actions">
                  <button
                    className="action-btn edit-button"
                    onClick={() => handleEdit(product)}
                    aria-label="Editar Produto"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Editar
                  </button>

                  <button
                    className="action-btn delete-button"
                    onClick={() => handleDelete(product.id)}
                    aria-label="Excluir Produto"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Excluir
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}