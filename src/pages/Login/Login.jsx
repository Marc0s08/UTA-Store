import "./Login.css";
import { Link, useNavigate } from "react-router-dom";

import {
    useState
} from "react";


import {
    signInWithEmailAndPassword
} from "firebase/auth";


import {
    auth
} from "../../firebase/firebaseConfig";


export default function Login(){

    const navigate = useNavigate();
    const [email,setEmail]=useState("");

    const [password,setPassword]=useState("");



    async function handleLogin(e){

    e.preventDefault();


    console.log("Email:", email);

    console.log("Senha:", password);


    try{


        await signInWithEmailAndPassword(

            auth,

            email.trim(),

            password

        );


        navigate("/perfil");


    }catch(error){


        console.log("ERRO FIREBASE:", error);

        console.log("CODIGO:", error.code);


    }

}



    return (

        <div className="login-page">


            <form onSubmit={handleLogin}>


                <h1>
                    UTA Store
                </h1>


                <input

                type="email"

                placeholder="Email"

                value={email}

                onChange={
                    e=>setEmail(e.target.value)
                }

                />



                <input

                type="password"

                placeholder="Senha"

                value={password}

                onChange={
                    e=>setPassword(e.target.value)
                }

                />



                <button>

                    Entrar

                </button>
<div className="register-link">

    <span>
        Ainda não possui conta?
    </span>


    <Link to="/register">

        Criar cadastro

    </Link>

</div>

            </form>


        </div>

    )

}