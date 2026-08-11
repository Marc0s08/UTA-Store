import "./Profile.css";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import useAuth from "../../hooks/useAuth";
import { getUserProfile } from "../../services/userService";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (user) {
        const data = await getUserProfile(user.uid);
        setProfile(data);
      }
      setLoading(false);
    }
    loadProfile();
  }, [user]);

  async function handleLogout() {
    await signOut(auth);
    navigate("/login");
  }

  if (loading) {
    return <div className="profile-loading">Carregando perfil...</div>;
  }

  // Garante compatibilidade tanto com 'enderecoEnvio' quanto 'endereco'
  const endereco = profile?.enderecoEnvio || profile?.endereco;

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h1>Minha Conta</h1>

        {profile && (
          <>
            <section className="profile-section">
              <h2>Dados Pessoais</h2>

              <p>
                <strong>Nome:</strong> {profile.nome || "Não informado"}
              </p>

              <p>
                <strong>CPF/CNPJ:</strong> {profile.cpfCnpj || "Não informado"}
              </p>

              <p>
                <strong>E-mail:</strong> {profile.email || user?.email}
                {user?.emailVerified ? (
                  <span className="badge verified">Verificado</span>
                ) : (
                  <span className="badge unverified">E-mail não verificado</span>
                )}
              </p>

              <p>
                <strong>Telefone:</strong> {profile.telefone || "Não informado"}
              </p>
            </section>

            <section className="profile-section">
              <h2>Endereço de Entrega</h2>

              {endereco ? (
                <>
                  <p>
                    <strong>Logradouro:</strong> {endereco.rua}, Nº {endereco.numero}
                  </p>

                  {endereco.complemento && (
                    <p>
                      <strong>Complemento:</strong> {endereco.complemento}
                    </p>
                  )}

                  {endereco.referencia && (
                    <p>
                      <strong>Referência:</strong> {endereco.referencia}
                    </p>
                  )}

                  <p>
                    <strong>Bairro:</strong> {endereco.bairro}
                  </p>

                  <p>
                    <strong>Cidade/UF:</strong> {endereco.cidade} - {endereco.estado}
                  </p>

                  <p>
                    <strong>CEP:</strong> {endereco.cep}
                  </p>
                </>
              ) : (
                <p className="no-address">Nenhum endereço cadastrado.</p>
              )}
            </section>
          </>
        )}

        <div className="profile-actions">
          <Link to="/" className="btn-action home-button">
            Voltar para loja
          </Link>

          <Link to="/editar-perfil" className="btn-action edit-button">
            Editar informações
          </Link>

          <Link to="/meus-pedidos" className="btn-action orders-button">
            Meus Pedidos 📦
          </Link>

          <button onClick={handleLogout} className="btn-action logout-button">
            Sair da conta
          </button>
        </div>
      </div>
    </div>
  );
}