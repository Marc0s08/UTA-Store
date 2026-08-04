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
            "Firebase não configurado"
        );


    }


}



const db = getFirestore();









export async function handler(event){


    try {



        const method =

        event.requestContext?.http?.method

        ||

        event.httpMethod

        ||

        "UNKNOWN";





        console.log(
            "Método:",
            method
        );





        // teste navegador

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


                body:JSON.stringify({

                    erro:
                    "Método não permitido",

                    metodo:
                    method

                })


            };


        }








        const {

            cepDestino,

            pacote

        } = JSON.parse(

            event.body || "{}"

        );








        if(
            !cepDestino ||
            !pacote
        ){


            return {


                statusCode:400,


                body:JSON.stringify({

                    erro:
                    "Dados incompletos"

                })


            };


        }









        // ==========================
        // Buscar token
        // ==========================


        const tokenSnap = await db

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







        if(!config.access_token){


            return {


                statusCode:401,


                body:JSON.stringify({

                    erro:
                    "Token ausente"

                })


            };


        }










        // ==========================
        // Dados envio
        // ==========================


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



            products:[


                {


                    id:"1",


                    width:

                    Number(
                        pacote.largura
                    ),



                    height:

                    Number(
                        pacote.altura
                    ),



                    length:

                    Number(
                        pacote.comprimento
                    ),



                    weight:

                    Number(
                        pacote.peso
                    ),



                    insurance_value:

                    Number(
                        pacote.valor || 1
                    ),



                    quantity:1


                }


            ]


        };










        console.log(
            "Enviando:",
            JSON.stringify(
                envio,
                null,
                2
            )
        );









        const response = await fetch(


            "https://www.melhorenvio.com.br/api/v2/me/shipment/calculate",


            {


                method:"POST",


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








        const data = await response.json();







        console.log(
            "Status Melhor Envio:",
            response.status
        );






        console.log(
            data
        );









        if(!response.ok){


            return {


                statusCode:
                response.status,


                body:
                JSON.stringify(data)


            };


        }










        // ==========================
        // FORMATAR TODOS OS FRETES
        // ==========================


        const fretes = data.map(item=>({



            id:
            item.id,



            servico:

            item.name,



            empresa:

            item.company?.name || "",



            logo:

            item.company?.picture || "",



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



        }));









        return {


            statusCode:200,


            headers:{


                "Content-Type":

                "application/json"


            },


            body:

            JSON.stringify(
                fretes
            )


        };









    }catch(error){



        console.error(
            "Erro:",
            error
        );



        return {


            statusCode:500,


            body:JSON.stringify({

                erro:
                error.message

            })


        };


    }


}