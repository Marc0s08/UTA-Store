import "./EditProfile.css";

import {
    useEffect,
    useState
} from "react";


import {
    useNavigate
} from "react-router-dom";


import {
    doc,
    updateDoc
} from "firebase/firestore";


import {
    db
} from "../../firebase/firebaseConfig";


import useAuth from "../../hooks/useAuth";


import {
    getUserProfile
} from "../../services/userService";



export default function EditProfile(){


    const {
        user
    } = useAuth();


    const navigate = useNavigate();


    const [form,setForm] = useState(null);



    useEffect(()=>{


        async function loadProfile(){


            const data =
            await getUserProfile(
                user.uid
            );


            setForm(data);


        }


        loadProfile();


    },[user]);




    function handleChange(e){


        setForm({

            ...form,

            [e.target.name]:
            e.target.value

        });


    }




    function handleAddressChange(e){


        setForm({

            ...form,

            endereco:{

                ...form.endereco,

                [e.target.name]:
                e.target.value

            }

        });


    }





    async function saveProfile(){


        try{


            await updateDoc(

                doc(
                    db,
                    "usuarios",
                    user.uid
                ),

                form

            );


            alert(
                "Dados atualizados com sucesso!"
            );


            navigate("/perfil");



        }catch(error){


            console.log(error);

            alert(
                "Erro ao atualizar dados"
            );


        }


    }





    if(!form){

        return (

            <div className="profile-loading">

                Carregando...

            </div>

        )

    }




    return(


        <div className="edit-profile">


            <div className="edit-card">


                <h1>
                    Editar informações
                </h1>



                <h2>
                    Dados pessoais
                </h2>



                <input

                type="text"

                name="nome"

                value={form.nome || ""}

                onChange={handleChange}

                placeholder="Nome completo"

                />



                <input

                type="text"

                name="telefone"

                value={form.telefone || ""}

                onChange={handleChange}

                placeholder="Telefone"

                />





                <h2>
                    Endereço
                </h2>



                <input

                type="text"

                name="cep"

                value={form.endereco?.cep || ""}

                onChange={handleAddressChange}

                placeholder="CEP"

                />



                <input

                type="text"

                name="rua"

                value={form.endereco?.rua || ""}

                onChange={handleAddressChange}

                placeholder="Rua / Avenida"

                />




                <div className="edit-row">


                    <input

                    type="text"

                    name="numero"

                    value={form.endereco?.numero || ""}

                    onChange={handleAddressChange}

                    placeholder="Número"

                    />



                    <input

                    type="text"

                    name="complemento"

                    value={form.endereco?.complemento || ""}

                    onChange={handleAddressChange}

                    placeholder="Complemento"

                    />


                </div>





                <input

                type="text"

                name="bairro"

                value={form.endereco?.bairro || ""}

                onChange={handleAddressChange}

                placeholder="Bairro"

                />




                <div className="edit-row">


                    <input

                    type="text"

                    name="cidade"

                    value={form.endereco?.cidade || ""}

                    onChange={handleAddressChange}

                    placeholder="Cidade"

                    />



                    <input

                    type="text"

                    name="estado"

                    value={form.endereco?.estado || ""}

                    onChange={handleAddressChange}

                    placeholder="Estado"

                    />


                </div>




                <button
                onClick={saveProfile}
                >

                    Salvar alterações

                </button>



            </div>


        </div>


    )

}