export async function handler(event){


    try{


        const { code } = JSON.parse(event.body);



        if(!code){


            return {

                statusCode:400,

                body:JSON.stringify({

                    erro:"Código não recebido"

                })

            };


        }






        const clientId = process.env.MELHOR_ENVIO_CLIENT_ID;

        const clientSecret = process.env.MELHOR_ENVIO_CLIENT_SECRET;





        console.log("CLIENT ID EXISTE:",
            !!clientId
        );


        console.log("SECRET EXISTE:",
            !!clientSecret
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

                    clientId,



                    client_secret:

                    clientSecret,



                    redirect_uri:

                    "https://uta-store.netlify.app/oauth/callback",



                    code:code


                })


            }


        );







        const data = await response.json();






        console.log(

            "Resposta Melhor Envio:",

            data

        );






        return {


            statusCode:response.status,


            body:JSON.stringify(data)


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