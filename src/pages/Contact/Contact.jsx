import { useState } from "react";
import "./Contact.css";

export default function Contact() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    assunto: "",
    mensagem: "",
  });
  const [enviado, setEnviado] = useState(false);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    console.log("Dados do formulário de contato:", formData);
    setEnviado(true);
    setFormData({ nome: "", email: "", assunto: "", mensagem: "" });
  }

  return (
    <main className="store-contact-page">
      <div className="contact-header">
        <h1>Fale Conosco</h1>
        <p>
          Tem alguma dúvida, sugestão ou precisa de ajuda? Entre em contato conosco!
        </p>
      </div>

      <div className="contact-container">
        {/* Informações de Contato */}
        <div className="contact-info">
          <h2>Informações</h2>
          <p>
            Nossa equipe está pronta para te atender de segunda a sexta, das 9h às 18h.
          </p>

          <div className="info-item">
            <span className="info-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            <div>
              <strong>Endereço</strong>
              <p>Rua Exemplo, 123 - Centro, São Paulo - SP</p>
            </div>
          </div>

          <div className="info-item">
            <span className="info-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </span>
            <div>
              <strong>Telefone / WhatsApp</strong>
              <p>(11) 99999-9999</p>
            </div>
          </div>

          <div className="info-item">
            <span className="info-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
            <div>
              <strong>E-mail</strong>
              <p>contato@sualoja.com</p>
            </div>
          </div>
        </div>

        {/* Formulário de Mensagem */}
        <div className="contact-form-wrapper">
          <h2>Envie sua Mensagem</h2>

          {enviado && (
            <div className="contact-success-msg">
              ✓ Mensagem enviada com sucesso! Retornaremos em breve.
            </div>
          )}

          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="nome">Seu Nome</label>
              <input
                id="nome"
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                placeholder="Digite seu nome completo"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Seu E-mail</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="seu@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="assunto">Assunto</label>
              <input
                id="assunto"
                type="text"
                name="assunto"
                value={formData.assunto}
                onChange={handleChange}
                required
                placeholder="Sobre o que deseja falar?"
              />
            </div>

            <div className="form-group">
              <label htmlFor="mensagem">Mensagem</label>
              <textarea
                id="mensagem"
                name="mensagem"
                rows="5"
                value={formData.mensagem}
                onChange={handleChange}
                required
                placeholder="Escreva sua mensagem aqui..."
              ></textarea>
            </div>

            <button type="submit" className="submit-contact-btn">
              Enviar Mensagem
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}