import "./Home.css";


import BannerSlider from "../../components/BannerSlider/BannerSlider";





export default function Home(){


    return(


        <main className="home">





            {/* CARROSSEL PRINCIPAL */}


            <section className="home-banner">


                <BannerSlider/>


            </section>









            {/* INTRODUÇÃO */}


            <section className="home-intro">


                <h1>


                    Bem-vindo à UTA Store


                </h1>





                <p>


                    Equipamentos, acessórios e produtos personalizados para operadores.


                </p>



            </section>









            {/* FUTURO: PRODUTOS DESTAQUE */}


            <section className="home-products">


                <h2>


                    Produtos em destaque


                </h2>



                <div className="products-placeholder">


                    Em breve...


                </div>



            </section>







        </main>


    );


}