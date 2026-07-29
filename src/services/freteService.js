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


                peso,


                pacote:{


                    cepOrigem:

                    config.cepOrigem,


                    altura:

                    config.altura,


                    largura:

                    config.largura,


                    comprimento:

                    config.comprimento


                }


            })


        }


    );






    const data = await response.json();





    if(!Array.isArray(data)){


        throw new Error(

            "Erro ao consultar Melhor Envio"

        );


    }






    const tokenDoc = await getDoc(
    doc(
        db,
        "configuracoes",
        "melhorEnvio"
    )
);


const tokenData = tokenDoc.data();



}