import "./Profile.css";

import {
    Link,
    useNavigate
} from "react-router-dom";


import {
    useEffect,
    useState
} from "react";


import {
    signOut
} from "firebase/auth";


import {
    auth
} from "../../firebase/firebaseConfig";


import useAuth from "../../hooks/useAuth";


import {
    getUserProfile
} from "../../services/userService";




export default function Profile(){


    const {

        user

    } = useAuth();



    const navigate = useNavigate();



    const [

        profile,

        setProfile

    ] = useState(null);



    const [

        loading,

        setLoading

    ] = useState(true);








    useEffect(()=>{



        async function loadProfile(){



            if(user){



                const data = await getUserProfile(

                    user.uid

                );



                setProfile(data);



            }



            setLoading(false);



        }



        loadProfile();



    },[user]);









    async function handleLogout(){



        await signOut(auth);



        navigate("/login");


    }







    if(loading){



        return(


            <div className="profile-loading">


                Carregando...


            </div>


        )


    }








    return(



        <div className="profile-page">





            <div className="profile-card">





                <h1>

                    Minha Conta

                </h1>







                {

                profile &&

                <>





                <section>


                    <h2>

                        Dados pessoais

                    </h2>





                    <p>

                        <strong>

                        Nome:

                        </strong>


                        {" "}

                        {profile.nome}


                    </p>






                    <p>

                        <strong>

                        Email:

                        </strong>


                        {" "}

                        {profile.email}


                    </p>






                    <p>

                        <strong>

                        Telefone:

                        </strong>


                        {" "}

                        {profile.telefone}


                    </p>



                </section>









                <section>


                    <h2>

                        Endereço

                    </h2>







                    {

                    profile.endereco &&

                    <>



                    <p>


                        {profile.endereco.rua}

                        ,

                        {" "}

                        {profile.endereco.numero}


                    </p>





                    <p>


                        {profile.endereco.bairro}


                    </p>







                    <p>


                        {profile.endereco.cidade}


                        {" - "}


                        {profile.endereco.estado}


                    </p>







                    <p>


                        CEP:

                        {" "}

                        {profile.endereco.cep}


                    </p>




                    </>


                    }





                </section>







                </>

                }









                <div className="profile-actions">







                    <Link to="/">



                        <button className="home-button">


                            Voltar para loja



                        </button>



                    </Link>








                    <Link to="/editar-perfil">



                        <button className="edit-button">


                            Editar informações



                        </button>



                    </Link>









                    <Link to="/meus-pedidos">



                        <button className="orders-button">


                            Meus Pedidos 📦



                        </button>



                    </Link>









                    <button

                    onClick={handleLogout}

                    className="logout-button"

                    >



                        Sair da conta



                    </button>








                </div>







            </div>







        </div>


    )


}