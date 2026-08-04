import {
    doc,
    getDoc
} from "firebase/firestore";

import {
    db
} from "../firebase/firebaseConfig";





export async function getFreteConfig(){


    const ref = doc(
        db,
        "configuracoes",
        "frete"
    );


    const snapshot = await getDoc(ref);



    if(snapshot.exists()){

        return snapshot.data();

    }


    return null;

}







export async function calcularMelhorEnvio({

    cepDestino,
    peso

}){


    const config = await getFreteConfig();



    if(!config){

        throw new Error(
            "Configuração de frete não encontrada"
        );

    }





    const response = await fetch(

        "/.netlify/functions/calcularFrete",

        {

            method:"POST",

            headers:{

                "Content-Type":
                "application/json"

            },


            body:JSON.stringify({

                cepDestino,


                pacote:{


                    cepOrigem:
                    config.cepOrigem,


                    altura:
                    config.altura,


                    largura:
                    config.largura,


                    comprimento:
                    config.comprimento,


                    peso:
                    Number(peso)

                }

            })

        }

    );





    const data = await response.json();




    console.log(
        "Resposta Melhor Envio:",
        data
    );





    if(!response.ok){

        throw new Error(

            data.message ||
            "Erro ao consultar Melhor Envio"

        );

    }







    // Caso venha apenas 1 serviço

    if(!Array.isArray(data)){


        return [data];


    }







    return data;


}