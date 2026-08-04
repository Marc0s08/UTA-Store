import {
    useEffect,
    useState
} from "react";


import "./BannerSlider.css";


import {
    collection,
    getDocs,
    where,
    query
} from "firebase/firestore";


import {
    db
} from "../../firebase/firebaseConfig";



export default function BannerSlider(){


    const [banners,setBanners] = useState([]);

    const [atual,setAtual] = useState(0);



    async function carregarBanners(){


        try{


            const q = query(

                collection(
                    db,
                    "banners"
                ),

                where(
                    "ativo",
                    "==",
                    true
                )

            );



            const snapshot = await getDocs(q);



            const lista = snapshot.docs.map(item=>({

                id:item.id,

                ...item.data()

            }));



            lista.sort(

                (a,b)=>

                (a.ordem || 0)

                -

                (b.ordem || 0)

            );



            setBanners(lista);



        }catch(error){


            console.log(
                "Erro banners:",
                error
            );


        }


    }







    useEffect(()=>{


        carregarBanners();


    },[]);








    useEffect(()=>{


        if(banners.length <=1)

        return;



        const timer = setInterval(()=>{


            setAtual(prev=>

                prev + 1 >= banners.length

                ?

                0

                :

                prev + 1

            );


        },5000);



        return ()=>clearInterval(timer);



    },[banners]);







    function anterior(){


        setAtual(

            atual === 0

            ?

            banners.length-1

            :

            atual-1

        );


    }








    function proximo(){


        setAtual(

            atual+1 >= banners.length

            ?

            0

            :

            atual+1

        );


    }








    if(banners.length===0)

    return null;





    const banner = banners[atual];



    return(



        <section className="banner-slider">



            <img

            className="banner-image"

            src={banner.imagem}

            />







            {

            banner.overlay?.ativo &&



            <div

            className="banner-overlay"

            style={{

                background:

                `rgba(0,0,0,${
                    banner.overlay.intensidade
                })`

            }}

            />

            }








            <div

            className={

                banner.texto?.sombra

                ?

                "banner-content sombra"

                :

                "banner-content"

            }


            style={{


                left:

                `${banner.texto?.x || 50}%`,



                top:

                `${banner.texto?.y || 50}%`,



                color:

                banner.texto?.cor || "#fff",



                fontSize:

                `${banner.texto?.tamanho || 42}px`



            }}

            >





                <h2>

                {banner.titulo}

                </h2>





                <p>

                {banner.descricao}

                </p>








                {

                banner.botao?.texto &&



                <a

                href={banner.botao.link || "#"}

                >

                    <button>


                    {banner.botao.texto}


                    </button>


                </a>


                }




            </div>









            {

            banners.length >1 &&


            <>

            <button

            className="banner-arrow left"

            onClick={anterior}

            >

            ❮

            </button>






            <button

            className="banner-arrow right"

            onClick={proximo}

            >

            ❯

            </button>







            <div

            className="banner-dots"

            >

            {

            banners.map((_,index)=>(


                <span

                key={index}

                className={

                index===atual

                ?

                "active"

                :

                ""

                }


                onClick={()=>setAtual(index)}


                />


            ))

            }


            </div>


            </>


            }



        </section>


    );


}