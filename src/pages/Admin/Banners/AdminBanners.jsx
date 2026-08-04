import { useState, useEffect, useRef } from "react";
import "./AdminBanners.css";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { db, storage } from "../../../firebase/firebaseConfig";

export default function AdminBanners() {
  const previewRef = useRef(null);

  const [banners, setBanners] = useState([]);
  const [carregando, setCarregando] = useState(false);

  // IMAGEM
  const [imagem, setImagem] = useState(null);
  const [preview, setPreview] = useState("");

  // CONTEÚDO
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");

  // BOTÃO
  const [botaoTexto, setBotaoTexto] = useState("Comprar agora");
  const [botaoLink, setBotaoLink] = useState("");
  const [botao, setBotao] = useState({
    x: 50,
    y: 78,
    cor: "#8BC34A",
    textoCor: "#111111",
    tamanho: 18,
    raio: 30,
    sombra: true
  });

  // TEXTO
  const [texto, setTexto] = useState({
    x: 50,
    y: 40,
    tamanho: 32, // Reduzido padrão para se adaptar melhor a telas menores
    cor: "#ffffff",
    sombra: true
  });

  // OVERLAY
  const [overlay, setOverlay] = useState({
    ativo: true,
    intensidade: 0.35
  });

  // ARRASTE
  const [arrastando, setArrastando] = useState(null);

  async function carregarBanners() {
    try {
      const snapshot = await getDocs(collection(db, "banners"));
      const lista = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data()
      }));
      setBanners(lista);
    } catch (error) {
      console.log("Erro ao carregar banners:", error);
    }
  }

  useEffect(() => {
    carregarBanners();
  }, []);

  function selecionarImagem(e) {
    const arquivo = e.target.files[0];
    if (!arquivo) return;

    setImagem(arquivo);
    setPreview(URL.createObjectURL(arquivo));
  }

  async function uploadImagem() {
    if (!imagem) return "";

    const nome = `${Date.now()}-${imagem.name}`;
    const imagemRef = ref(storage, `banners/${nome}`);

    await uploadBytes(imagemRef, imagem);
    return await getDownloadURL(imagemRef);
  }

  function iniciarArraste(tipo, e) {
    setArrastando(tipo);
  }

  function moverElemento(e) {
    if (!arrastando) return;

    const area = previewRef.current;
    if (!area) return;

    const rect = area.getBoundingClientRect();

    // Captura coordenadas de Mouse ou Touch
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    let x = ((clientX - rect.left) / rect.width) * 100;
    let y = ((clientY - rect.top) / rect.height) * 100;

    x = Math.max(5, Math.min(95, x));
    y = Math.max(5, Math.min(95, y));

    if (arrastando === "texto") {
      setTexto((prev) => ({ ...prev, x, y }));
    }

    if (arrastando === "botao") {
      setBotao((prev) => ({ ...prev, x, y }));
    }
  }

  function finalizarArraste() {
    setArrastando(null);
  }

  function atualizarTexto(campo, valor) {
    setTexto((prev) => ({ ...prev, [campo]: valor }));
  }

  function atualizarBotao(campo, valor) {
    setBotao((prev) => ({ ...prev, [campo]: valor }));
  }

  async function salvarBanner() {
    if (!imagem) {
      alert("Selecione uma imagem para o banner");
      return;
    }

    try {
      setCarregando(true);
      const urlImagem = await uploadImagem();

      await addDoc(collection(db, "banners"), {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        imagem: urlImagem,
        texto: {
          x: Number(texto.x),
          y: Number(texto.y),
          tamanho: Number(texto.tamanho),
          cor: texto.cor,
          sombra: texto.sombra
        },
        botao: {
          texto: botaoTexto,
          link: botaoLink,
          x: Number(botao.x),
          y: Number(botao.y),
          cor: botao.cor,
          textoCor: botao.textoCor,
          tamanho: Number(botao.tamanho),
          raio: Number(botao.raio),
          sombra: botao.sombra
        },
        overlay: {
          ativo: overlay.ativo,
          intensidade: Number(overlay.intensidade)
        },
        ativo: true,
        ordem: banners.length + 1,
        criadoEm: serverTimestamp()
      });

      alert("Banner salvo com sucesso!");

      // Limpar campos
      setTitulo("");
      setDescricao("");
      setBotaoTexto("Comprar agora");
      setBotaoLink("");
      setImagem(null);
      setPreview("");
      setTexto({
        x: 50,
        y: 40,
        tamanho: 32,
        cor: "#ffffff",
        sombra: true
      });
      setBotao({
        x: 50,
        y: 75,
        cor: "#8BC34A",
        textoCor: "#111111",
        tamanho: 18,
        raio: 25,
        sombra: true
      });

      carregarBanners();
    } catch (error) {
      console.log("Erro ao salvar banner:", error);
      alert("Erro ao salvar banner");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="admin-banners">
      <h1>🎞 Editor de Banner</h1>

      <div className="admin-banners-grid">
        {/* ÁREA DE PREVIEW */}
        <section className="banner-editor">
          <div
            className="banner-preview-editor"
            ref={previewRef}
            onMouseMove={moverElemento}
            onMouseUp={finalizarArraste}
            onMouseLeave={finalizarArraste}
            onTouchMove={moverElemento}
            onTouchEnd={finalizarArraste}
          >
            <img
              src={
                preview ||
                "https://placehold.co/1200x400/111/FFF?text=Banner"
              }
              alt="Banner preview"
            />

            {overlay.ativo && (
              <div
                className="banner-overlay-preview"
                style={{
                  background: `rgba(0,0,0,${overlay.intensidade})`
                }}
              />
            )}

            <div
              className={`banner-text-preview ${texto.sombra ? "shadow" : ""}`}
              onMouseDown={(e) => iniciarArraste("texto", e)}
              onTouchStart={(e) => iniciarArraste("texto", e)}
              style={{
                left: `${texto.x}%`,
                top: `${texto.y}%`,
                color: texto.cor,
                fontSize: `${texto.tamanho}px`
              }}
            >
              <h2>{titulo || "Título do banner"}</h2>
              <p>{descricao || "Descrição da promoção"}</p>
            </div>

            <button
              className={`banner-button-preview ${botao.sombra ? "shadow" : ""}`}
              onMouseDown={(e) => iniciarArraste("botao", e)}
              onTouchStart={(e) => iniciarArraste("botao", e)}
              style={{
                left: `${botao.x}%`,
                top: `${botao.y}%`,
                background: botao.cor,
                color: botao.textoCor,
                fontSize: `${botao.tamanho}px`,
                borderRadius: `${botao.raio}px`
              }}
            >
              {botaoTexto}
            </button>
          </div>
        </section>

        {/* PAINEL DE CONTROLES */}
        <aside className="banner-controls-panel">
          <section className="banner-controls">
            <h3>🎨 Customização</h3>

            <label>
              Imagem do banner
              <input type="file" accept="image/*" onChange={selecionarImagem} />
            </label>

            <label>
              Tamanho texto ({texto.tamanho}px)
              <input
                type="range"
                min="14"
                max="60"
                value={texto.tamanho}
                onChange={(e) => atualizarTexto("tamanho", e.target.value)}
              />
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={texto.sombra}
                onChange={(e) => atualizarTexto("sombra", e.target.checked)}
              />
              Sombra no texto
            </label>

            <label>
              Cor texto
              <input
                type="color"
                value={texto.cor}
                onChange={(e) => atualizarTexto("cor", e.target.value)}
              />
            </label>

            <hr />

            <h3>🔘 Botão</h3>

            <label>
              Texto do botão
              <input
                type="text"
                value={botaoTexto}
                onChange={(e) => setBotaoTexto(e.target.value)}
              />
            </label>

            <div className="color-group">
              <label>
                Fundo
                <input
                  type="color"
                  value={botao.cor}
                  onChange={(e) => atualizarBotao("cor", e.target.value)}
                />
              </label>
              <label>
                Texto
                <input
                  type="color"
                  value={botao.textoCor}
                  onChange={(e) => atualizarBotao("textoCor", e.target.value)}
                />
              </label>
            </div>

            <label>
              Tamanho do botão ({botao.tamanho}px)
              <input
                type="range"
                min="10"
                max="30"
                value={botao.tamanho}
                onChange={(e) => atualizarBotao("tamanho", e.target.value)}
              />
            </label>

            <label>
              Arredondamento ({botao.raio}px)
              <input
                type="range"
                min="0"
                max="50"
                value={botao.raio}
                onChange={(e) => atualizarBotao("raio", e.target.value)}
              />
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={botao.sombra}
                onChange={(e) => atualizarBotao("sombra", e.target.checked)}
              />
              Sombra botão
            </label>

            <hr />

            <label>
              Escurecimento de fundo
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.05"
                value={overlay.intensidade}
                onChange={(e) =>
                  setOverlay({
                    ...overlay,
                    intensidade: Number(e.target.value)
                  })
                }
              />
            </label>
          </section>

          <section className="banner-form">
            <h3>📝 Informações do Banner</h3>

            <input
              type="text"
              placeholder="Título do banner"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />

            <textarea
              placeholder="Descrição do banner"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
            />

            <input
              type="text"
              placeholder="Link do botão (ex: /produtos)"
              value={botaoLink}
              onChange={(e) => setBotaoLink(e.target.value)}
            />

            <button disabled={carregando} onClick={salvarBanner} className="btn-primary">
              {carregando ? "Salvando..." : "Salvar Banner"}
            </button>
          </section>
        </aside>
      </div>

      {/* LISTA DE BANNERS */}
      <section className="banner-list">
        <h2>Banners Cadastrados</h2>
        <div className="banner-cards-grid">
          {banners.map((item) => (
            <div className="banner-card" key={item.id}>
              <div className="banner-card-img">
                <img src={item.imagem} alt={item.titulo} />
              </div>

              <div className="banner-card-info">
                <h3>{item.titulo || "Sem título"}</h3>
                <p>{item.descricao}</p>
                <span className={`status-badge ${item.ativo ? "ativo" : "inativo"}`}>
                  {item.ativo ? "Ativo" : "Desativado"}
                </span>
              </div>

              <div className="banner-card-actions">
                <button
                  className="btn-secondary"
                  onClick={async () => {
                    await updateDoc(doc(db, "banners", item.id), {
                      ativo: !item.ativo
                    });
                    carregarBanners();
                  }}
                >
                  {item.ativo ? "Desativar" : "Ativar"}
                </button>

                <button
                  className="btn-danger"
                  onClick={async () => {
                    const confirmar = window.confirm("Excluir este banner?");
                    if (!confirmar) return;

                    await deleteDoc(doc(db, "banners", item.id));
                    carregarBanners();
                  }}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}