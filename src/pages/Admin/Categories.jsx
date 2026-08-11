import "./Categories.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Subindo 3 níveis para chegar na pasta 'services'
import { 
  getCategories, 
  createCategory, 
  deleteCategory, 
  uploadCategoryIcon 
} from "../../services/categoryService";

export default function Categories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  async function loadCategories() {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data || []);
    } catch (error) {
      alert("Erro ao carregar categorias.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nome.trim()) {
      alert("Por favor, preencha o nome da categoria.");
      return;
    }

    try {
      setSubmitting(true);
      let imageUrl = "";

      if (imageFile) {
        imageUrl = await uploadCategoryIcon(imageFile);
      }

      await createCategory({
        nome: nome.trim(),
        descricao: descricao.trim(),
        imagem: imageUrl,
        criadoEm: new Date().toISOString()
      });

      alert("Categoria cadastrada com sucesso!");
      
      setNome("");
      setDescricao("");
      setImageFile(null);
      setImagePreview("");
      
      loadCategories();
    } catch (error) {
      alert("Erro ao salvar categoria.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (window.confirm("Deseja realmente excluir esta categoria?")) {
      await deleteCategory(id);
      loadCategories();
    }
  }

  return (
    <main className="categories-page">
      <header className="categories-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Voltar
        </button>
        <h1>Gerenciar Categorias</h1>
      </header>

      {/* Formulário de Cadastro de Categoria */}
      <section className="category-form-card">
        <h2>Nova Categoria</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome da Categoria *</label>
            <input
              type="text"
              placeholder="Ex: Camisetas, Calçados..."
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Breve Descrição</label>
            <textarea
              placeholder="Ex: Roupas masculinas e femininas de algodão"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Imagem / Ícone da Categoria</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {imagePreview && (
              <div className="category-preview">
                <img src={imagePreview} alt="Pré-visualização" />
              </div>
            )}
          </div>

          <button type="submit" disabled={submitting} className="save-category-btn">
            {submitting ? "Salvando..." : "Cadastrar Categoria"}
          </button>
        </form>
      </section>

      {/* Listagem de Categorias */}
      <section className="categories-list-section">
        <h2>Categorias Existentes ({categories.length})</h2>

        {loading ? (
          <p style={{ color: "#aaa" }}>Carregando categorias...</p>
        ) : categories.length === 0 ? (
          <p style={{ color: "#aaa" }}>Nenhuma categoria cadastrada ainda.</p>
        ) : (
          <div className="categories-grid">
            {categories.map((cat) => (
              <div key={cat.id} className="category-item-card">
                {cat.imagem ? (
                  <img src={cat.imagem} alt={cat.nome} className="category-card-img" />
                ) : (
                  <div className="no-cat-img">Sem imagem</div>
                )}
                <div className="category-card-info">
                  <h3>{cat.nome}</h3>
                  <p>{cat.descricao || "Sem descrição"}</p>
                </div>
                <button 
                  className="delete-cat-btn" 
                  onClick={() => handleDelete(cat.id)}
                >
                  Excluir
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}