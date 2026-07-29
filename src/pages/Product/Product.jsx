import "./Product.css";

import {
    useEffect,
    useState
} from "react";


import {
    useParams
} from "react-router-dom";


import {
    ShoppingCart
} from "@mui/icons-material";


import {
    getProductById
} from "../../services/productService";


import {
    calculateDiscount
} from "../../utils/discount";


import {
    useCart
} from "../../context/CartContext";





export default function Product(){


    const {id}=useParams();



    const [product,setProduct]=useState(null);

    const [loading,setLoading]=useState(true);

    const [mainImage,setMainImage]=useState("");



    const {

        addToCart

    } = useCart();







    async function loadProduct(){


        try{


            const data = await getProductById(id);


            setProduct(data);



            if(data?.imagens?.length > 0){


                setMainImage(

                    data.imagens[0]

                );


            }



        }catch(error){


            console.log(

                "Erro ao carregar produto:",

                error

            );


        }finally{


            setLoading(false);


        }


    }







    useEffect(()=>{


        loadProduct();


    },[id]);







    if(loading){


        return(

            <div className="product-loading">

                Carregando produto...

            </div>

        )

    }







    if(!product){


        return(

            <div className="product-loading">

                Produto não encontrado

            </div>

        )

    }






    const desconto =

    product.precoPromocional > 0

    ?

    calculateDiscount(

        product.preco,

        product.precoPromocional

    )

    :

    0;







    const precoFinal =

    product.precoPromocional > 0

    ?

    product.precoPromocional

    :

    product.preco;








    return(


        <main className="product-page">







            <section className="product-gallery">



                <div className="main-image">


                    <img

                    src={mainImage}

                    alt={product.nome}

                    />



                </div>






                <div className="thumbnail-area">


                {


                product.imagens?.map((img,index)=>(


                    <img


                    key={index}


                    src={img}


                    alt={product.nome}


                    onClick={()=>setMainImage(img)}


                    className={

                    mainImage === img

                    ?

                    "active-thumb"

                    :

                    ""

                    }


                    />


                ))


                }



                </div>



            </section>










            <section className="product-info">



                <h1>

                    {product.nome}

                </h1>





                <span className="category">

                    {product.categoria}

                </span>






                <p>

                    {product.descricao}

                </p>







                {

                product.precoPromocional > 0 &&


                <>


                <span className="old-price">

                    R$ {

                    Number(product.preco)

                    .toLocaleString(

                        "pt-BR",

                        {

                        minimumFractionDigits:2

                        }

                    )

                    }


                </span>





                <span className="discount">

                    -{desconto}% OFF

                </span>



                </>


                }







                <h2 className="price">


                    R$ {

                    Number(precoFinal)

                    .toLocaleString(

                        "pt-BR",

                        {

                        minimumFractionDigits:2

                        }

                    )


                    }


                </h2>







                <p className="stock">

                    Estoque disponível:

                    {" "}

                    {product.estoque}

                </p>









                <button


                className="buy-button"


                onClick={()=>addToCart(product)}


                >



                    <ShoppingCart/>


                    Adicionar ao carrinho



                </button>






            </section>






        </main>


    )

}