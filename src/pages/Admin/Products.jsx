import "./Products.css";

import {
    useEffect,
    useState
} from "react";


import ProductForm from "../../components/ProductForm/ProductForm";


import {
    getProducts,
    deleteProduct
} from "../../services/productService";


import {
    calculateDiscount
} from "../../utils/discount";



export default function Products(){


    const [products,setProducts] = useState([]);

    const [editingProduct,setEditingProduct] = useState(null);





    async function loadProducts(){


        try{


            const data = await getProducts();


            setProducts(data);


        }catch(error){


            console.log(
                "Erro ao carregar produtos:",
                error
            );


        }


    }







    useEffect(()=>{


        loadProducts();


    },[]);








    async function handleDelete(id){


        const confirmDelete = window.confirm(

            "Deseja realmente excluir este produto?"

        );



        if(!confirmDelete)

            return;



        await deleteProduct(id);



        loadProducts();


    }







    function handleEdit(product){


        setEditingProduct(product);



        window.scrollTo({

            top:0,

            behavior:"smooth"

        });


    }







    return(


        <main className="products-admin">





            <h1>

                Gerenciar Produtos

            </h1>







            <ProductForm


                productEdit={editingProduct}


                onSaved={()=>{


                    setEditingProduct(null);


                    loadProducts();


                }}


            />









            <section className="products-list-section">



                <h2>

                    Produtos cadastrados

                </h2>







                <div className="product-list">





                {


                products.map(product=>(




                    <div

                    className="product-card"

                    key={product.id}

                    >






                    {


                    product.precoPromocional > 0 &&



                    <div className="discount-badge">


                        -

                        {

                        calculateDiscount(

                            product.preco,

                            product.precoPromocional

                        )

                        }

                        %


                    </div>


                    }









                    {


                    product.imagens &&

                    product.imagens.length > 0 &&



                    <img

                    src={product.imagens[0]}

                    alt={product.nome}

                    className="product-thumbnail"

                    />


                    }









                    <h3>

                        {product.nome}

                    </h3>








                    <p>

                        Código:

                        {" "}

                        {product.codigoProduto}

                    </p>








                    <p>

                        Categoria:

                        {" "}

                        {product.categoria}

                    </p>









                    <div className="price-area">



                    {

                    product.precoPromocional > 0

                    ?

                    <>


                    <p className="old-price">


                        R$

                        {" "}

                        {Number(product.preco)

                        .toLocaleString(

                            "pt-BR",

                            {

                            minimumFractionDigits:2

                            }

                        )}


                    </p>






                    <p className="new-price">


                        R$

                        {" "}

                        {Number(product.precoPromocional)

                        .toLocaleString(

                            "pt-BR",

                            {

                            minimumFractionDigits:2

                            }

                        )}



                    </p>



                    </>


                    :


                    <p className="new-price">


                        R$

                        {" "}

                        {Number(product.preco)

                        .toLocaleString(

                            "pt-BR",

                            {

                            minimumFractionDigits:2

                            }

                        )}



                    </p>


                    }



                    </div>









                    <p>

                        Estoque:

                        {" "}

                        {product.estoque}

                    </p>









                    <span

                    className={

                    product.ativo

                    ?

                    "status active"

                    :

                    "status inactive"

                    }

                    >


                    {


                    product.ativo

                    ?

                    "Produto ativo"

                    :

                    "Produto inativo"


                    }



                    </span>









                    <div className="product-actions">





                    <button

                    className="edit-button"

                    onClick={()=>handleEdit(product)}

                    >


                        ✏ Editar


                    </button>








                    <button

                    className="delete-button"

                    onClick={()=>handleDelete(product.id)}

                    >


                        🗑 Excluir


                    </button>







                    </div>








                    </div>



                ))



                }





                </div>






            </section>






        </main>


    )


}