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




    const pacote = {


        from:{

            postal_code:
            config.cepOrigem

        },


        to:{

            postal_code:
            cepDestino

        },



        package:{


            height:
            config.altura,


            width:
            config.largura,


            length:
            config.comprimento,


            weight:

            Number(peso) +

            Number(config.pesoBase)


        }


    };





    /*
    
    AQUI ENTRA O TOKEN DO MELHOR ENVIO
    
    */


    console.log(

        "Pacote enviado:",

        pacote

    );



    return {


        servico:"PAC",

        valor:25.90,

        prazo:"7 dias úteis"


    };


}