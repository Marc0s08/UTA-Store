import {
    doc,
    setDoc,
    getDoc
} from "firebase/firestore";


import {
    db
} from "../firebase/firebaseConfig";





// SALVAR CONFIGURAÇÃO DO MELHOR ENVIO

export async function salvarTokenMelhorEnvio(data){


    if(!data.access_token){


        throw new Error(
            "Token Melhor Envio inválido"
        );


    }





    const referencia = doc(

        db,

        "configuracoes",

        "melhorEnvio"

    );







    await setDoc(

        referencia,

        {


            access_token:

            data.access_token,



            refresh_token:

            data.refresh_token || "",



            expires_in:

            data.expires_in || 0,



            token_type:

            data.token_type || "Bearer",



            conectado:

            true,



            atualizadoEm:

            new Date()


        },

        {

            merge:true

        }


    );



    console.log(
        "Melhor Envio salvo no Firebase"
    );


}







// BUSCAR CONFIGURAÇÃO

export async function buscarTokenMelhorEnvio(){



    const referencia = doc(

        db,

        "configuracoes",

        "melhorEnvio"

    );




    const snapshot = await getDoc(

        referencia

    );





    if(!snapshot.exists()){


        return null;


    }





    return snapshot.data();



}