export async function handler(event){


    try{


        const body = JSON.parse(event.body);



        console.log(
            "Body recebido:",
            body
        );



        const {

            pacote,

            token


        } = body;





        if(!token){


            return {

                statusCode:401,

                body:JSON.stringify({

                    erro:"TOKEN AUSENTE"

                })

            };


        }






        const response = await fetch(


            "https://melhorenvio.com.br/api/v2/me/shipment/calculate",


            {

                method:"POST",


                headers:{


                    Authorization:

                    `Bearer ${token}`,


                    "Content-Type":

                    "application/json",


                    Accept:

                    "application/json",


                    "User-Agent":

                    "UTA Store"


                },


                body:

                JSON.stringify(pacote)


            }


        );





        const texto = await response.text();



        console.log(

            "Status Melhor Envio:",

            response.status

        );



        console.log(

            "Resposta Melhor Envio:",

            texto

        );





        return {


            statusCode:

            response.status,


            body:

            texto


        };





    }catch(error){


        console.log(error);



        return {


            statusCode:500,


            body:JSON.stringify({

                erro:error.message

            })


        };


    }


}