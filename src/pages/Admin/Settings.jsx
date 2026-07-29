import "./Settings.css";

export default function Settings(){


    function conectarMelhorEnvio(){


        const clientId =
        import.meta.env.VITE_MELHOR_ENVIO_CLIENT_ID;



        const redirectUri =
        window.location.origin +
        "/oauth/callback";



        const url =

        `https://melhorenvio.com.br/oauth/authorize` +

        `?client_id=${clientId}` +

        `&redirect_uri=${redirectUri}` +

        `&response_type=code`;



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
                    para calcular fretes automaticamente.

                </p>




                <button

                onClick={conectarMelhorEnvio}

                className="connect-button"

                >

                    🚚 Conectar Melhor Envio

                </button>



            </section>


        </main>


    )

}