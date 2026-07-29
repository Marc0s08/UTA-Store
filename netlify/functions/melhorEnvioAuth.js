export async function handler(event){


    try{


        const body =
        JSON.parse(event.body);



        console.log(
            "Recebido:",
            body
        );



        const response = await fetch(

            "https://melhorenvio.com.br/oauth/token",

            {


                method:"POST",


                headers:{


                    "Accept":
                    "application/json",


                    "Content-Type":
                    "application/json"

                },


                body:JSON.stringify({


                    grant_type:
                    "authorization_code",


                    client_id:
                    process.env.MELHOR_ENVIO_CLIENT_ID,


                    client_secret:
                    process.env.MELHOR_ENVIO_CLIENT_SECRET,


                    redirect_uri:

                    "https://uta-store.netlify.app/oauth/callback",


                    code:
                    body.code


                })


            }


        );





        const data =
        await response.json();





        console.log(
            "Resposta Melhor Envio:",
            data
        );





        return {


            statusCode:response.status,


            body:JSON.stringify(data)


        };



    }catch(error){


        return {


            statusCode:500,


            body:JSON.stringify({

                erro:error.message

            })


        };


    }


}