import {
    initializeApp,
    cert,
    getApps
} from "firebase-admin/app";

import {
    getFirestore
} from "firebase-admin/firestore";




// ==============================
// Firebase Admin
// ==============================

if (!getApps().length) {

    const privateKey =
        process.env.FIREBASE_PRIVATE_KEY;


    if (
        process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_CLIENT_EMAIL &&
        privateKey
    ) {


        initializeApp({

            credential: cert({

                projectId:
                process.env.FIREBASE_PROJECT_ID,


                clientEmail:
                process.env.FIREBASE_CLIENT_EMAIL,


                privateKey:
                privateKey.replace(
                    /\\n/g,
                    "\n"
                )

            })

        });


    } else {


        console.error(
            "Variáveis Firebase ausentes"
        );


    }

}



const db = getFirestore();








export async function handler(event) {


    try {


        const method =
            event.requestContext?.http?.method
            ||
            event.httpMethod
            ||
            "UNKNOWN";



        console.log(
            "Método recebido:",
            method
        );





        // ==============================
        // TESTE NO NAVEGADOR
        // ==============================


        if(method === "GET"){


            return {


                statusCode:200,


                headers:{

                    "Content-Type":
                    "application/json"

                },


                body:JSON.stringify({

                    funcionando:true,

                    mensagem:
                    "calcularFrete online"

                })


            };


        }







        if(method !== "POST"){


            return {


                statusCode:405,


                headers:{

                    "Content-Type":
                    "application/json"

                },


                body:JSON.stringify({

                    erro:
                    "Método não permitido",

                    metodo:
                    method

                })


            };


        }








        const bodyRecebido =
        JSON.parse(
            event.body || "{}"
        );



        const {

            cepDestino,

            pacote

        } = bodyRecebido;







        if(
            !cepDestino ||
            !pacote
        ){


            return {


                statusCode:400,


                body:JSON.stringify({

                    erro:
                    "CEP ou pacote ausente"

                })


            };


        }






        console.log(
            "CEP destino:",
            cepDestino
        );


        console.log(
            "Pacote:",
            pacote
        );









        // ==============================
        // TOKEN MELHOR ENVIO
        // ==============================


        const tokenSnap =
        await db

        .collection(
            "configuracoes"
        )

        .doc(
            "melhorEnvio"
        )

        .get();








        if(!tokenSnap.exists){


            return {


                statusCode:400,


                body:JSON.stringify({

                    erro:
                    "Melhor Envio não conectado"

                })


            };


        }







        const config =
        tokenSnap.data();





        console.log(
            "Token existe:",
            !!config.access_token
        );








        if(!config.access_token){


            return {


                statusCode:401,


                body:JSON.stringify({

                    erro:
                    "Token Melhor Envio inválido"

                })


            };


        }









        const envio = {


            from:{

                postal_code:
                String(
                    pacote.cepOrigem
                )

            },


            to:{

                postal_code:
                String(
                    cepDestino
                )

            },


            package:{


                height:
                Number(
                    pacote.altura
                ),


                width:
                Number(
                    pacote.largura
                ),


                length:
                Number(
                    pacote.comprimento
                ),


                weight:
                Number(
                    pacote.peso
                )


            }


        };







        console.log(
            "Enviando Melhor Envio:"
        );


        console.log(
            JSON.stringify(
                envio,
                null,
                2
            )
        );









        const response =
        await fetch(


            "https://www.melhorenvio.com.br/api/v2/me/shipment/calculate",


            {


                method:
                "POST",


                headers:{


                    Authorization:

                    `Bearer ${config.access_token}`,


                    Accept:

                    "application/json",


                    "Content-Type":

                    "application/json",


                    "User-Agent":

                    "UTA Store"


                },


                body:

                JSON.stringify(
                    envio
                )


            }


        );









        const resposta =
        await response.text();








        console.log(
            "STATUS MELHOR ENVIO:",
            response.status
        );


        console.log(
            resposta
        );








        return {


            statusCode:
            response.status,


            headers:{


                "Content-Type":
                "application/json"

            },


            body:
            resposta


        };







    } catch(error){



        console.error(
            "ERRO FUNCTION:",
            error
        );




        return {


            statusCode:500,


            headers:{


                "Content-Type":
                "application/json"

            },


            body:
            JSON.stringify({

                erro:
                error.message

            })


        };


    }


}