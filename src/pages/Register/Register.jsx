import "./Register.css";
import { useState } from "react";
import { 
  createUserWithEmailAndPassword, 
  sendEmailVerification 
} from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { createUserProfile } from "../../services/userService";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState({
    nome: "",
    cpfCnpj: "",
    telefone: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    referencia: "",
    bairro: "",
    cidade: "",
    estado: ""
  });

  function handleChange(e) {
    setErrorMessage(""); // Limpa mensagem de erro ao digitar
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  // Busca de endereço automática via ViaCEP
  async function buscarCep(cep) {
    const cepLimpo = (cep || "").replace(/\D/g, "");

    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        setErrorMessage("CEP não encontrado. Por favor, verifique o número.");
        return;
      }

      setErrorMessage("");
      setForm((prev) => ({
        ...prev,
        rua: data.logradouro || prev.rua,
        bairro: data.bairro || prev.bairro,
        cidade: data.localidade || prev.cidade,
        estado: data.uf || prev.estado
      }));
    } catch (error) {
      console.error("Erro na busca por CEP:", error);
      setErrorMessage("Erro ao consultar CEP. Preencha o endereço manualmente.");
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setErrorMessage("");

    // 1. Validações de Senha
    if (form.senha !== form.confirmarSenha) {
      setErrorMessage("As senhas não conferem!");
      return;
    }

    if (form.senha.length < 6) {
      setErrorMessage("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    // 2. Validações de Documento e Telefone
    const cpfCnpjLimpo = (form.cpfCnpj || "").replace(/\D/g, "");
    if (cpfCnpjLimpo.length !== 11 && cpfCnpjLimpo.length !== 14) {
      setErrorMessage("Por favor, digite um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.");
      return;
    }

    const telefoneLimpo = (form.telefone || "").replace(/\D/g, "");
    if (telefoneLimpo.length < 10) {
      setErrorMessage("Por favor, digite um número de telefone/WhatsApp válido com DDD.");
      return;
    }

    // 3. Validação de Endereço Básico
    const cepLimpo = (form.cep || "").replace(/\D/g, "");
    if (cepLimpo.length !== 8) {
      setErrorMessage("Informe um CEP válido com 8 dígitos.");
      return;
    }

    if (!form.nome || !form.email || !form.rua || !form.numero || !form.bairro || !form.cidade || !form.estado) {
      setErrorMessage("Preencha todos os campos obrigatórios do formulário.");
      return;
    }

    try {
      setLoading(true);

      // 1. Criar usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.senha
      );

      const user = userCredential.user;

      // 2. Enviar e-mail de verificação
      await sendEmailVerification(user);

      // 3. Montar objeto sem propriedades 'undefined'
      const dadosPerfil = {
        uid: user.uid,
        nome: form.nome || "",
        cpfCnpj: cpfCnpjLimpo,
        telefone: telefoneLimpo,
        email: form.email || "",
        enderecoEnvio: {
          cep: cepLimpo,
          rua: form.rua || "",
          numero: form.numero || "",
          complemento: form.complemento || "",
          referencia: form.referencia || "",
          bairro: form.bairro || "",
          cidade: form.cidade || "",
          estado: (form.estado || "").toUpperCase()
        },
        emailVerificado: false,
        criadoEm: new Date().toISOString()
      };

      await createUserProfile(user.uid, dadosPerfil);

      alert(
        "Cadastro realizado com sucesso! Enviamos um e-mail de verificação. Por favor, confirme seu e-mail antes de fazer o login."
      );

      navigate("/login");
    } catch (error) {
      console.error("Erro no cadastro:", error);

      // Tratamento de mensagens de erro do Firebase Auth
      switch (error.code) {
        case "auth/email-already-in-use":
          setErrorMessage("Este e-mail já está cadastrado. Tente fazer login.");
          break;
        case "auth/invalid-email":
          setErrorMessage("O e-mail digitado é inválido.");
          break;
        case "auth/weak-password":
          setErrorMessage("A senha digitada é muito fraca.");
          break;
        case "auth/network-request-failed":
          setErrorMessage("Erro de conexão com a internet. Tente novamente.");
          break;
        default:
          setErrorMessage("Erro ao criar cadastro: " + (error.message || "Tente novamente."));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-page">
      <form onSubmit={handleRegister}>
        <h1>Criar Conta</h1>

        {/* Exibição dinâmica de erros no formulário */}
        {errorMessage && (
          <div className="error-message">
            ⚠️ {errorMessage}
          </div>
        )}

        <h3>Dados Pessoais (Para Emissão de Nota/Etiqueta)</h3>

        <input
          name="nome"
          type="text"
          placeholder="Nome completo do destinatário"
          value={form.nome}
          onChange={handleChange}
          required
        />

        <input
          name="cpfCnpj"
          type="text"
          placeholder="CPF ou CNPJ (obrigatório para envio)"
          value={form.cpfCnpj}
          onChange={handleChange}
          required
        />

        <input
          name="telefone"
          type="tel"
          placeholder="Telefone / WhatsApp (com DDD)"
          value={form.telefone}
          onChange={handleChange}
          required
        />

        <h3>Acesso</h3>

        <input
          name="email"
          type="email"
          placeholder="E-mail"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          name="senha"
          type="password"
          placeholder="Senha (mínimo 6 caracteres)"
          value={form.senha}
          onChange={handleChange}
          required
        />

        <input
          name="confirmarSenha"
          type="password"
          placeholder="Confirmar senha"
          value={form.confirmarSenha}
          onChange={handleChange}
          required
        />

        <h3>Endereço de Entrega</h3>

        <input
          name="cep"
          type="text"
          placeholder="CEP (somente números)"
          value={form.cep}
          onChange={handleChange}
          onBlur={(e) => buscarCep(e.target.value)}
          required
        />

        <input
          name="rua"
          type="text"
          placeholder="Rua / Avenida / Logradouro"
          value={form.rua}
          onChange={handleChange}
          required
        />

        <div className="address-row">
          <input
            name="numero"
            type="text"
            placeholder="Número"
            value={form.numero}
            onChange={handleChange}
            required
          />

          <input
            name="complemento"
            type="text"
            placeholder="Apto / Bloco / Sala (Opcional)"
            value={form.complemento}
            onChange={handleChange}
          />
        </div>

        <input
          name="referencia"
          type="text"
          placeholder="Ponto de referência (Ex: Próximo à padaria X)"
          value={form.referencia}
          onChange={handleChange}
        />

        <input
          name="bairro"
          type="text"
          placeholder="Bairro"
          value={form.bairro}
          onChange={handleChange}
          required
        />

        <div className="address-row">
          <input
            name="cidade"
            type="text"
            placeholder="Cidade"
            value={form.cidade}
            onChange={handleChange}
            required
          />

          <input
            name="estado"
            type="text"
            maxLength={2}
            placeholder="UF (Ex: SP)"
            value={form.estado}
            onChange={handleChange}
            required
          />
        </div>

        <button disabled={loading} type="submit">
          {loading ? "Criando conta..." : "Criar conta e Enviar Verificação"}
        </button>

        <div className="login-link">
          Já possui conta? <Link to="/login">Entrar</Link>
        </div>
      </form>
    </div>
  );
}