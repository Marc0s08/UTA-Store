import "./Settings.css";


export default function Settings(){


    function conectarMelhorEnvio(){


        const clientId =
        import.meta.env.VITE_MELHOR_ENVIO_CLIENT_ID;



        if(!clientId){


            alert(
                "Client ID do Melhor Envio não configurado no Netlify"
            );

            return;

        }







        const redirectUri = encodeURIComponent(

            "https://uta-store.netlify.app/oauth/callback"

        );







        const scope = encodeURIComponent(

            "shipping-calculate"

        );








        const url =

        "https://melhorenvio.com.br/oauth/authorize" +

        `?client_id=${clientId}` +

        `&redirect_uri=${redirectUri}` +

        "&response_type=code" +

        `&scope=${scope}`;








        console.log(

            "URL OAuth Melhor Envio:",

            url

        );








        window.location.href = url;



    }









    return(


        <main className="settings-page">



            <h1>

                ⚙ Configurações

            </h1>







            <section className="settings-card">



                <h2>

                    Melhor Envio

                </h2>







                <p>

                    Conecte sua conta Melhor Envio

                    para calcular fretes automaticamente

                    dentro da loja.

                </p>







                <button

                onClick={conectarMelhorEnvio}

                className="connect-button"

                >


                    🚚 Conectar Melhor Envio


                </button>







            </section>






        </main>


    );

}