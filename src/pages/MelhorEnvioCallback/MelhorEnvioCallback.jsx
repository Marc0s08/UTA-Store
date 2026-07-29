import { useEffect } from "react";


export default function MelhorEnvioCallback(){


    useEffect(()=>{


        async function conectar(){


            console.log(
                "Callback Melhor Envio iniciado"
            );



            console.log(
                "URL atual:",
                window.location.href
            );



            const params =
            new URLSearchParams(
                window.location.search
            );



            const code =
            params.get("code");



            console.log(
                "Código recebido:",
                code
            );



            if(!code){


                console.log(
                    "Nenhum código encontrado"
                );


                return;

            }




            try{


                const response =
                await fetch(

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





                console.log(
                    "Status Function:",
                    response.status
                );





                const data =
                await response.json();





                console.log(
                    "Resposta Melhor Envio:",
                    data
                );



            }catch(error){


                console.log(
                    "Erro callback:",
                    error
                );


            }


        }



        conectar();



    },[]);




    return(

        <main>

            <h1>

                Conectando Melhor Envio...

            </h1>

        </main>

    );


}