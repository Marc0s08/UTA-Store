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







    if(!Array.isArray(fretes)){


        throw new Error(

            fretes.message ||

            "Erro retornando fretes"

        );


    }







    return fretes.map(item=>({


        id:
        item.id,


        empresa:
        item.company?.name,


        servico:
        item.name,


        valor:
        Number(item.price),


        prazo:

        `${item.delivery_time} dias úteis`


    }));


}