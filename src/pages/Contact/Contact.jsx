import "./Contact.css";
import { useState } from "react";

export default function Contact() {
    const [formData, setFormData] = useState({
        nome: "",
        email: "",
        assunto: "",
        mensagem: ""
    });
    const [enviado, setEnviado] = useState(false);

    function handleChange(e) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    function handleSubmit(e) {
        e.preventDefault();
        // Aqui você pode integrar com EmailJS, Firestore ou apenas simular o envio
        console.log("Dados do formulário de contato:", formData);
        setEnviado(true);
        setFormData({ nome: "", email: "", assunto: "", mensagem: "" });
    }

    return (
        <main className="store-contact-page">
            <div className="contact-header">
                <h1>Fale Conosco</h1>
                <p>Tem alguma dúvida, sugestão ou precisa de ajuda? Entre em contato conosco!</p>
            </div>

            <div className="contact-container">
                {/* Informações de Contato */}
                <div className="contact-info">
                    <h2>Informações</h2>
                    <p>Nossa equipe está pronta para te atender de segunda a sexta, das 9h às 18h.</p>
                    
                    <div className="info-item">
                        <span className="info-icon">📍</span>
                        <div>
                            <strong>Endereço</strong>
                            <p>Rua Exemplo, 123 - Centro, São Paulo - SP</p>
                        </div>
                    </div>

                    <div className="info-item">
                        <span className="info-icon">📞</span>
                        <div>
                            <strong>Telefone / WhatsApp</strong>
                            <p>(11) 99999-9999</p>
                        </div>
                    </div>

                    <div className="info-item">
                        <span className="info-icon">✉️</span>
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
                            Mensagem enviada com sucesso! Retornaremos em breve.
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="contact-form">
                        <div className="form-group">
                            <label>Seu Nome</label>
                            <input 
                                type="text" 
                                name="nome" 
                                value={formData.nome} 
                                onChange={handleChange} 
                                required 
                                placeholder="Digite seu nome completo"
                            />
                        </div>

                        <div className="form-group">
                            <label>Seu E-mail</label>
                            <input 
                                type="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                required 
                                placeholder="seu@email.com"
                            />
                        </div>

                        <div className="form-group">
                            <label>Assunto</label>
                            <input 
                                type="text" 
                                name="assunto" 
                                value={formData.assunto} 
                                onChange={handleChange} 
                                required 
                                placeholder="Sobre o que deseja falar?"
                            />
                        </div>

                        <div className="form-group">
                            <label>Mensagem</label>
                            <textarea 
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