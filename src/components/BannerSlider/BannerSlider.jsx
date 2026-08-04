import { useEffect, useState } from "react";
import "./BannerSlider.css";
import { collection, getDocs, where, query } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

export default function BannerSlider() {
  const [banners, setBanners] = useState([]);
  const [atual, setAtual] = useState(0);

  async function carregarBanners() {
    try {
      const q = query(
        collection(db, "banners"),
        where("ativo", "==", true)
      );

      const snapshot = await getDocs(q);

      const lista = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      // Ordena os banners pela propriedade 'ordem'
      lista.sort((a, b) => (a.ordem || 0) - (b.ordem || 0));

      setBanners(lista);
    } catch (error) {
      console.log("Erro ao carregar banners:", error);
    }
  }

  useEffect(() => {
    carregarBanners();
  }, []);

  // Transição automática de slides (5 segundos)
  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      setAtual((prev) => (prev + 1 >= banners.length ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(timer);
  }, [banners]);

  function anterior() {
    setAtual(atual === 0 ? banners.length - 1 : atual - 1);
  }

  function proximo() {
    setAtual(atual + 1 >= banners.length ? 0 : atual + 1);
  }

  if (banners.length === 0) return null;

  const banner = banners[atual];

  return (
    <section className="banner-slider">
      {/* Imagem do Banner */}
      <img
        className="banner-image"
        src={banner.imagem}
        alt={banner.titulo || "Banner promocional"}
      />

      {/* Camada de Overlay / Escurecimento */}
      {banner.overlay?.ativo && (
        <div
          className="banner-overlay"
          style={{
            background: `rgba(0,0,0,${banner.overlay.intensidade || 0.4})`,
          }}
        />
      )}

      {/* Bloco do Conteúdo (Texto e Botão) */}
      <div
        className={
          banner.texto?.sombra
            ? "banner-content sombra"
            : "banner-content"
        }
        style={{
          "--custom-x": `${banner.texto?.x ?? 50}%`,
          "--custom-y": `${banner.texto?.y ?? 50}%`,
          "--custom-size": `${banner.texto?.tamanho ?? 42}px`,
          color: banner.texto?.cor || "#ffffff",
        }}
      >
        {banner.titulo && <h2>{banner.titulo}</h2>}

        {banner.descricao && <p>{banner.descricao}</p>}

        {banner.botao?.texto && (
          <a href={banner.botao.link || "#"}>
            <button>{banner.botao.texto}</button>
          </a>
        )}
      </div>

      {/* Navegação por Setas e Pontos (Apenas se houver mais de 1 banner) */}
      {banners.length > 1 && (
        <>
          <button
            className="banner-arrow left"
            onClick={anterior}
            aria-label="Banner anterior"
          >
            ❮
          </button>

          <button
            className="banner-arrow right"
            onClick={proximo}
            aria-label="Próximo banner"
          >
            ❯
          </button>

          <div className="banner-dots">
            {banners.map((_, index) => (
              <span
                key={index}
                className={index === atual ? "active" : ""}
                onClick={() => setAtual(index)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}