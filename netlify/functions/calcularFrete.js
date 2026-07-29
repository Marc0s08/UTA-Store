export async function handler(event) {


    try {


        if(event.httpMethod !== "POST"){


            return {


                statusCode:405,


                headers:{
                    "Content-Type":"application/json"
                },


                body:JSON.stringify({

                    erro:"Método não permitido"

                })


            };


        }





        const body = JSON.parse(event.body);



        const {

            cepDestino,

            peso,

            pacote


        } = body;





        if(!cepDestino || !peso || !pacote){


            return {


                statusCode:400,


                headers:{
                    "Content-Type":"application/json"
                },


                body:JSON.stringify({

                    erro:"Dados incompletos para cálculo"

                })


            };


        }







        const response = await fetch(


            "https://www.melhorenvio.com.br/api/v2/me/shipment/calculate",


            {


                method:"POST",


                headers:{


                    "Authorization":

                    `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,


                    "Content-Type":

                    "application/json",


                    "Accept":

                    "application/json",


                    "User-Agent":

                    "UTA Store (contato@utastore.com.br)"


                },



                body:JSON.stringify({


                    from:{


                        postal_code:

                        String(pacote.cepOrigem)


                    },


                    to:{


                        postal_code:

                        String(cepDestino)


                    },


                    package:{


                        height:

                        Number(pacote.altura),



                        width:

                        Number(pacote.largura),



                        length:

                        Number(pacote.comprimento),



                        weight:

                        Number(peso)


                    }


                })


            }


        );








        const data = await response.json();





        console.log(

            "Resposta Melhor Envio:",

            data

        );







        if(!response.ok){


            return {


                statusCode:response.status,


                headers:{
                    "Content-Type":"application/json"
                },


                body:JSON.stringify({

                    erro:"Erro Melhor Envio",

                    detalhes:data

                })


            };


        }








        return {


            statusCode:200,


            headers:{

                "Content-Type":"application/json"

            },


            body:JSON.stringify(data)


        };






    }catch(error){



        console.log(

            "Erro Function Frete:",

            error

        );



        return {


            statusCode:500,


            headers:{

                "Content-Type":"application/json"

            },


            body:JSON.stringify({

                erro:error.message

            })


        };


    }


}