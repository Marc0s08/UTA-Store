import "./Register.css";

import { useState } from "react";

import {
    createUserWithEmailAndPassword
} from "firebase/auth";

import {
    auth
} from "../../firebase/firebaseConfig";

import {
    createUserProfile
} from "../../services/userService";

import {
    Link,
    useNavigate
} from "react-router-dom";


export default function Register(){


    const navigate = useNavigate();


    const [loading,setLoading] = useState(false);


    const [form,setForm] = useState({

        nome:"",

        email:"",

        senha:"",

        confirmarSenha:"",

        telefone:"",

        cep:"",

        rua:"",

        numero:"",

        complemento:"",

        bairro:"",

        cidade:"",

        estado:""

    });



    function handleChange(e){

        setForm({

            ...form,

            [e.target.name]:e.target.value

        });

    }



    async function buscarCep(cep){


        const cepLimpo =
        cep.replace(/\D/g,"");


        if(cepLimpo.length !== 8){

            return;

        }


        try{


            const response =
            await fetch(
                `https://viacep.com.br/ws/${cepLimpo}/json/`
            );


            const data =
            await response.json();



            if(data.erro){

                alert("CEP não encontrado");

                return;

            }



            setForm({

                ...form,

                cep:cep,

                rua:data.logradouro,

                bairro:data.bairro,

                cidade:data.localidade,

                estado:data.uf

            });



        }catch(error){

            console.log(error);

            alert(
                "Erro ao consultar CEP"
            );

        }


    }




    async function handleRegister(e){


        e.preventDefault();



        if(
            form.senha !== 
            form.confirmarSenha
        ){

            alert(
                "As senhas não conferem"
            );

            return;

        }



        if(form.senha.length < 6){

            alert(
                "A senha precisa ter pelo menos 6 caracteres"
            );

            return;

        }



        try{


            setLoading(true);



            const userCredential =
            await createUserWithEmailAndPassword(

                auth,

                form.email,

                form.senha

            );



            const user =
            userCredential.user;



            await createUserProfile(

                user.uid,

                form

            );



            alert(
                "Cadastro realizado com sucesso!"
            );



            navigate("/login");



        }catch(error){


            console.log(error);



            if(error.code === "auth/email-already-in-use"){

                alert(
                    "Este email já está cadastrado"
                );

            }else{


                alert(
                    "Erro ao criar cadastro"
                );


            }



        }finally{


            setLoading(false);


        }


    }





    return(


        <div className="register-page">


            <form
            onSubmit={handleRegister}
            >


                <h1>
                    Criar Conta
                </h1>



                <h3>
                    Dados pessoais
                </h3>


                <input

                name="nome"

                type="text"

                placeholder="Nome completo"

                value={form.nome}

                onChange={handleChange}

                required

                />



                <input

                name="telefone"

                type="tel"

                placeholder="Telefone / WhatsApp"

                value={form.telefone}

                onChange={handleChange}

                required

                />




                <h3>
                    Acesso
                </h3>



                <input

                name="email"

                type="email"

                placeholder="Email"

                value={form.email}

                onChange={handleChange}

                required

                />



                <input

                name="senha"

                type="password"

                placeholder="Senha"

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




                <h3>
                    Endereço
                </h3>



                <input

                name="cep"

                type="text"

                placeholder="CEP"

                value={form.cep}

                onChange={handleChange}

                onBlur={
                    e=>buscarCep(e.target.value)
                }

                required

                />



                <input

                name="rua"

                type="text"

                placeholder="Rua / Avenida"

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

                    placeholder="Complemento"

                    value={form.complemento}

                    onChange={handleChange}

                    />


                </div>




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

                    placeholder="UF"

                    value={form.estado}

                    onChange={handleChange}

                    required

                    />


                </div>




                <button
                disabled={loading}
                >

                    {
                        loading
                        ?
                        "Criando..."
                        :
                        "Criar conta"
                    }

                </button>




                <div className="login-link">


                    Já possui conta?


                    <Link to="/login">

                        Entrar

                    </Link>


                </div>



            </form>


        </div>


    );

}