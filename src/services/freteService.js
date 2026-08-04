import {
    doc,
    getDoc
} from "firebase/firestore";


import {
    db
} from "../firebase/firebaseConfig";







// Busca configuração do frete no Firebase
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











// Calcula frete pelo Melhor Envio
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


        cepOrigem:

        config.cepOrigem,



        altura:

        Number(config.altura),



        largura:

        Number(config.largura),



        comprimento:

        Number(config.comprimento),



        peso:

        Number(peso)



    };









    console.log(

        "Pacote enviado:",

        pacote

    );









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


                pacote


            })



        }


    );









    const data = await response.json();







    console.log(

        "Fretes recebidos:",

        data

    );









    if(!response.ok){


        throw new Error(


            data.message ||

            data.erro ||

            "Erro ao consultar Melhor Envio"


        );


    }









    if(!Array.isArray(data)){


        throw new Error(

            "Resposta inválida do Melhor Envio"

        );


    }









    // Retorna todos os fretes
    return data.map(frete => ({



        id:

        frete.id || null,



        empresa:

        frete.empresa ||



        frete.company?.name ||



        "",





        logo:

        frete.logo ||



        frete.company?.picture ||



        "",





        valor:


        Number(

            frete.valor ??

            frete.price ??

            0

        ),






        servico:


        frete.servico ||



        frete.name ||



        "Frete",






        prazo:


        frete.prazo ||



        (

            frete.delivery_time

            ?

            `${frete.delivery_time} dias úteis`

            :

            "Prazo não informado"

        )




    }));


}