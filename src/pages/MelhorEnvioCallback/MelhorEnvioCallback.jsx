import { useEffect } from "react";


export default function MelhorEnvioCallback(){


    useEffect(()=>{


        const params =
        new URLSearchParams(
            window.location.search
        );


        const code =
        params.get("code");



        if(code){


            console.log(
                "Código Melhor Envio:",
                code
            );


            /*
            Depois vamos enviar
            esse código para Firebase Function
            */


        }



    },[]);



    return(

        <main>

            <h1>
                Conectando Melhor Envio...
            </h1>

        </main>

    );


}