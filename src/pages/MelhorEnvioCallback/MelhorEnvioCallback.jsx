import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
    doc,
    setDoc
} from "firebase/firestore";

import {
    db
} from "../../firebase/firebaseConfig";


export default function MelhorEnvioCallback(){


    const navigate = useNavigate();



    useEffect(()=>{


        async function salvarToken(){


            const params = new URLSearchParams(
                window.location.search
            );


            const code = params.get("code");



            if(!code){

                console.log(
                    "Código não encontrado"
                );

                return;

            }




            try{



                const response = await fetch(

                    "/.netlify/functions/melhorEnvioAuth",

                    {

                    method:"POST",

                    headers:{

                        "Content-Type":
                        "application/json"

                    },

                    body:JSON.stringify({

                        code

                    })

                    }

                );





                const data = await response.json();



                console.log(
                    "Token recebido:",
                    data
                );






                await setDoc(

                    doc(

                        db,

                        "configuracoes",

                        "melhorEnvio"

                    ),

                    {


                    access_token:
                    data.access_token,


                    refresh_token:
                    data.refresh_token,


                    atualizadoEm:
                    new Date()


                    }

                );




                alert(
                    "Melhor Envio conectado com sucesso!"
                );



                navigate(
                    "/admin/configuracoes"
                );



            }catch(error){


                console.log(
                    error
                );


                alert(
                    "Erro ao salvar Melhor Envio"
                );


            }



        }




        salvarToken();



    },[]);






    return(


        <main>


            <h1>

                Conectando Melhor Envio...

            </h1>


        </main>


    )


}