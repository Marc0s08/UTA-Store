import {
    doc,
    getDoc
} from "firebase/firestore";

import {
    db
} from "../firebase/firebaseConfig";




// Buscar configuração do pacote
async function getFreteConfig(){


    const ref = doc(
        db,
        "configuracoes",
        "frete"
    );


    const snap = await getDoc(ref);



    if(!snap.exists()){

        throw new Error(
            "Configuração de frete não encontrada"
        );

    }


    return snap.data();


}







export async function calcularMelhorEnvio({

    cepDestino,

    peso


}){


    const config =
    await getFreteConfig();





    const pacote = {


        cepOrigem:

        String(
            config.cepOrigem
        ),



        altura:

        Number(
            config.altura
        ),



        largura:

        Number(
            config.largura
        ),



        comprimento:

        Number(
            config.comprimento
        ),



        peso:

        Number(
            peso
        ),



        valor:

        1

    };





    console.log(
        "PACOTE GERADO:",
        pacote
    );





    const response =
    await fetch(

        "/.netlify/functions/calcularFrete",

        {


            method:"POST",


            headers:{


                "Content-Type":
                "application/json"

            },


            body:JSON.stringify({


                cepDestino,

                pacote


            })


        }


    );





    const data =
    await response.json();





    console.log(
        "RETORNO MELHOR ENVIO:",
        data
    );





    if(!response.ok){


        throw new Error(

            data.erro ||

            "Erro no Melhor Envio"

        );


    }






    // Melhor Envio pode devolver objeto único
    // ou lista

    const lista = Array.isArray(data)

    ?

    data

    :

    [data];






    return lista.map(item=>(


        {


            id:item.id,


            servico:

            item.name || "Frete",



            transportadora:

            item.company?.name || "",



            valor:

            Number(
                item.price
            ),



            prazo:

            item.delivery_time

            ?

            `${item.delivery_time} dias úteis`

            :

            "Prazo não informado"


        }


    ));



}