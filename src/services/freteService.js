import {
    doc,
    getDoc
} from "firebase/firestore";


import {
    db
} from "../firebase/firebaseConfig";





export async function calcularMelhorEnvio({

    cepDestino,

    peso

}){



    const configSnap =
    await getDoc(

        doc(
            db,
            "configuracoes",
            "frete"
        )

    );




    if(!configSnap.exists()){

        throw new Error(
            "Configuração de frete não encontrada"
        );

    }




    const config =
    configSnap.data();






    const resposta =
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


                pacote:{


                    cepOrigem:
                    config.cepOrigem,


                    altura:
                    config.altura,


                    largura:
                    config.largura,


                    comprimento:
                    config.comprimento,


                    peso


                }


            })


        }

    );







    const fretes =
    await resposta.json();







    console.log(
        "Fretes:",
        fretes
    );







    let lista = [];



// Caso venha lista
if(Array.isArray(fretes)){


    lista = fretes;


}



// Caso venha apenas um frete
else if(fretes.id){


    lista = [fretes];


}



else{


    console.log(
        "Resposta inválida:",
        fretes
    );


    throw new Error(
        "Erro retornando fretes"
    );


}






return lista.map(item=>({


    id:

    item.id,



    empresa:

    item.company?.name || "",



    logo:

    item.company?.picture || "",



    servico:

    item.name || "Frete",



    valor:

    Number(
        item.price || 0
    ),



    prazo:


    item.delivery_time

    ?

    `${item.delivery_time} dias úteis`

    :

    "Prazo não informado"



}));

}