import { useEffect } from "react";


export default function MelhorEnvioCallback(){


    useEffect(()=>{


        async function conectar(){


            const params =
            new URLSearchParams(
                window.location.search
            );


            const code =
            params.get("code");



            if(!code)
                return;



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




            const data =
            await response.json();




            console.log(
                "TOKEN MELHOR ENVIO:",
                data
            );



        }



        conectar();


    },[]);



    return(

        <h1>

            Conectando Melhor Envio...

        </h1>

    )


}