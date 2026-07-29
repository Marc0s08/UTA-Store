export async function handler(event){


    try{


        const {
            code
        } = JSON.parse(event.body);



        const response = await fetch(

            "https://melhorenvio.com.br/oauth/token",

            {

                method:"POST",

                headers:{

                    "Content-Type":
                    "application/json",

                    "Accept":
                    "application/json"

                },


                body:JSON.stringify({

                    grant_type:"authorization_code",

                    client_id:
                    process.env.MELHOR_ENVIO_CLIENT_ID,


                    client_secret:
                    process.env.MELHOR_ENVIO_CLIENT_SECRET,


                    redirect_uri:

                    "https://uta-store.netlify.app/oauth/callback",


                    code

                })


            }

        );





        const data =
        await response.json();





        return {


            statusCode:200,


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