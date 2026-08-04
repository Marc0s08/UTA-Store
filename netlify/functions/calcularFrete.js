import {
    initializeApp,
    cert,
    getApps
} from "firebase-admin/app";

import {
    getFirestore
} from "firebase-admin/firestore";



if(!getApps().length){

    initializeApp({

        credential: cert({

            projectId:
            process.env.FIREBASE_PROJECT_ID,

            clientEmail:
            process.env.FIREBASE_CLIENT_EMAIL,

            privateKey:
            process.env.FIREBASE_PRIVATE_KEY.replace(
                /\\n/g,
                "\n"
            )

        })

    });

}



const db = getFirestore();





export async function handler(event){


    try{


        const body =
        JSON.parse(event.body);



        const {
            cepDestino,
            pacote
        } = body;




        if(!cepDestino || !pacote){


            return {

                statusCode:400,

                body:JSON.stringify({

                    erro:
                    "Dados incompletos"

                })

            };

        }





        const tokenDoc =
        await db
        .collection("configuracoes")
        .doc("melhorEnvio")
        .get();




        if(!tokenDoc.exists){


            return {

                statusCode:400,

                body:JSON.stringify({

                    erro:
                    "Melhor Envio não conectado"

                })

            };


        }




        const token =
        tokenDoc.data().access_token;





        const envio = {


            from:{

                postal_code:
                pacote.cepOrigem

            },


            to:{

                postal_code:
                cepDestino

            },


            products:[

                {

                    id:"1",

                    width:
                    Number(pacote.largura),


                    height:
                    Number(pacote.altura),


                    length:
                    Number(pacote.comprimento),


                    weight:
                    Number(pacote.peso),


                    insurance_value:1,


                    quantity:1

                }

            ]

        };







        const resposta =
        await fetch(

            "https://www.melhorenvio.com.br/api/v2/me/shipment/calculate",

            {

                method:"POST",

                headers:{

                    Authorization:
                    `Bearer ${token}`,

                    Accept:
                    "application/json",

                    "Content-Type":
                    "application/json",

                    "User-Agent":
                    "UTA Store"

                },


                body:
                JSON.stringify(envio)

            }

        );







        const dados =
        await resposta.json();







        console.log(
            "Melhor Envio:",
            dados
        );







        return {

            statusCode:200,

            headers:{

                "Content-Type":
                "application/json"

            },


            body:
            JSON.stringify(dados)

        };





    }catch(error){


        console.log(error);


        return {


            statusCode:500,


            body:JSON.stringify({

                erro:
                error.message

            })


        };


    }


}