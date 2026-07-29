import {
    doc,
    setDoc,
    getDoc
} from "firebase/firestore";


import {
    db
} from "../firebase/firebaseConfig";



export async function createUserProfile(uid, data){


    await setDoc(

        doc(
            db,
            "usuarios",
            uid
        ),

        {

            nome:data.nome,

            email:data.email,

            telefone:data.telefone,


            endereco:{


                cep:data.cep,

                rua:data.rua,

                numero:data.numero,

                complemento:data.complemento,

                bairro:data.bairro,

                cidade:data.cidade,

                estado:data.estado

            },


            tipo:"cliente",


            criadoEm:new Date()

        }

    );

}



export async function getUserProfile(uid){


    const userRef =
    doc(
        db,
        "usuarios",
        uid
    );


    const snapshot =
    await getDoc(userRef);



    if(snapshot.exists()){

        return snapshot.data();

    }


    return null;

}