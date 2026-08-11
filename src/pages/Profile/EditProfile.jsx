import "./EditProfile.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import useAuth from "../../hooks/useAuth";
import { getUserProfile } from "../../services/userService";

export default function EditProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      if (user) {
        const data = await getUserProfile(user.uid);
        if (data) {
          // Garante estrutura padrão de dados
          const enderecoAtual = data.enderecoEnvio || data.endereco || {};
          setForm({
            nome: data.nome || "",
            cpfCnpj: data.cpfCnpj || "",
            telefone: data.telefone || "",
            enderecoEnvio: {
              cep: enderecoAtual.cep || "",
              rua: enderecoAtual.rua || "",
              numero: enderecoAtual.numero || "",
              complemento: enderecoAtual.complemento || "",
              referencia: enderecoAtual.referencia || "",
              bairro: enderecoAtual.bairro || "",
              cidade: enderecoAtual.cidade || "",
              estado: enderecoAtual.estado || ""
            }
          });
        }
      }
    }
    loadProfile();
  }, [user]);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  function handleAddressChange(e) {
    setForm({
      ...form,
      enderecoEnvio: {
        ...form.enderecoEnvio,
        [e.target.name]: e.target.value
      }
    });
  }

  // Busca de endereço automática no ViaCEP ao preencher/mudar o CEP
  async function buscarCep(cep) {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        alert("CEP não encontrado");
        return;
      }

      setForm((prev) => ({
        ...prev,
        enderecoEnvio: {
          ...prev.enderecoEnvio,
          rua: data.logradouro || prev.enderecoEnvio.rua,
          bairro: data.bairro || prev.enderecoEnvio.bairro,
          cidade: data.localidade || prev.enderecoEnvio.cidade,
          estado: data.uf || prev.enderecoEnvio.estado
        }
      }));
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);

      const dadosAtualizados = {
        nome: form.nome,
        cpfCnpj: form.cpfCnpj.replace(/\D/g, ""),
        telefone: form.telefone.replace(/\D/g, ""),
        enderecoEnvio: {
          ...form.enderecoEnvio,
          cep: form.enderecoEnvio.cep.replace(/\D/g, ""),
          estado: form.enderecoEnvio.estado.toUpperCase()
        }
      };

      await updateDoc(doc(db, "usuarios", user.uid), dadosAtualizados);

      alert("Dados atualizados com sucesso!");
      navigate("/perfil");
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar dados.");
    } finally {
      setSaving(false);
    }
  }

  if (!form) {
    return <div className="profile-loading">Carregando dados...</div>;
  }

  return (
    <div className="edit-profile">
      <form className="edit-card" onSubmit={handleSubmit}>
        <h1>Editar Informações</h1>

        <h2>Dados Pessoais</h2>

        <input
          type="text"
          name="nome"
          value={form.nome}
          onChange={handleChange}
          placeholder="Nome completo do destinatário"
          required
        />

        <input
          type="text"
          name="cpfCnpj"
          value={form.cpfCnpj}
          onChange={handleChange}
          placeholder="CPF ou CNPJ (obrigatório para frete)"
          required
        />

        <input
          type="text"
          name="telefone"
          value={form.telefone}
          onChange={handleChange}
          placeholder="Telefone / WhatsApp"
          required
        />

        <h2>Endereço de Entrega</h2>

        <input
          type="text"
          name="cep"
          value={form.enderecoEnvio.cep}
          onChange={handleAddressChange}
          onBlur={(e) => buscarCep(e.target.value)}
          placeholder="CEP (somente números)"
          required
        />

        <input
          type="text"
          name="rua"
          value={form.enderecoEnvio.rua}
          onChange={handleAddressChange}
          placeholder="Rua / Avenida / Logradouro"
          required
        />

        <div className="edit-row">
          <input
            type="text"
            name="numero"
            value={form.enderecoEnvio.numero}
            onChange={handleAddressChange}
            placeholder="Número"
            required
          />

          <input
            type="text"
            name="complemento"
            value={form.enderecoEnvio.complemento}
            onChange={handleAddressChange}
            placeholder="Complemento (Apto, Bloco, etc.)"
          />
        </div>

        <input
          type="text"
          name="referencia"
          value={form.enderecoEnvio.referencia}
          onChange={handleAddressChange}
          placeholder="Ponto de referência"
        />

        <input
          type="text"
          name="bairro"
          value={form.enderecoEnvio.bairro}
          onChange={handleAddressChange}
          placeholder="Bairro"
          required
        />

        <div className="edit-row">
          <input
            type="text"
            name="cidade"
            value={form.enderecoEnvio.cidade}
            onChange={handleAddressChange}
            placeholder="Cidade"
            required
          />

          <input
            type="text"
            name="estado"
            maxLength={2}
            value={form.enderecoEnvio.estado}
            onChange={handleAddressChange}
            placeholder="UF (Ex: SP)"
            required
          />
        </div>

        <div className="edit-actions">
          <button type="submit" disabled={saving} className="save-button">
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>

          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate("/perfil")}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}