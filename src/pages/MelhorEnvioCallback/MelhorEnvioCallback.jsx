import {
    useEffect
} from "react";


import {
    useNavigate
} from "react-router-dom";


import {
    salvarTokenMelhorEnvio
} from "../../services/melhorEnvioService";




export default function MelhorEnvioCallback(){


    const navigate = useNavigate();





    useEffect(()=>{



        async function conectar(){



            const params = new URLSearchParams(

                window.location.search

            );



            const code = params.get("code");





            if(!code){


                console.log(

                    "Código Melhor Envio não encontrado"

                );


                alert(

                    "Código de autorização não encontrado"

                );


                navigate(

                    "/admin/configuracoes"

                );


                return;


            }







            try{





                const response = await fetch(


                    "/.netlify/functions/melhorEnvioAuth",


                    {


                        method:"POST",


                        headers:{


                            "Content-Type":

                            "application/json"


                        },


                        body:JSON.stringify({


                            code


                        })


                    }


                );







                const data = await response.json();






                console.log(

                    "Resposta Melhor Envio:",

                    data

                );







                if(!data.access_token){



                    console.log(

                        "Erro OAuth Melhor Envio:",

                        data

                    );



                    alert(

                        "Não foi possível conectar ao Melhor Envio"

                    );



                    return;


                }







                await salvarTokenMelhorEnvio(

                    data

                );







                alert(

                    "Melhor Envio conectado com sucesso!"

                );







                navigate(

                    "/admin/configuracoes"

                );





            }catch(error){





                console.log(

                    "Erro callback Melhor Envio:",

                    error

                );



                alert(

                    "Erro ao conectar Melhor Envio"

                );



            }



        }






        conectar();





    },[navigate]);







    return(


        <main>


            <h1>

                Conectando Melhor Envio...

            </h1>


        </main>


    );


}