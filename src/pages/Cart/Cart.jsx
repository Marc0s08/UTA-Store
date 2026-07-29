import "./Cart.css";


import {
    useState
} from "react";


import {
    useCart
} from "../../context/CartContext";


import {
    useAuth
} from "../../context/AuthContext";


import {
    createOrder
} from "../../services/orderService";


import {
    getUserProfile
} from "../../services/userService";


import {
    useNavigate
} from "react-router-dom";





export default function Cart(){


    const {

        cart,

        removeFromCart,

        increaseQuantity,

        decreaseQuantity,

        clearCart,

        total


    } = useCart();





    const {

        user

    } = useAuth();





    const navigate = useNavigate();





    const [cep,setCep] = useState("");

    const [endereco,setEndereco] = useState(null);

    const [frete,setFrete] = useState(null);

    const [calculando,setCalculando] = useState(false);








    const pesoTotal = cart.reduce(


        (soma,item)=>{


            return soma +

            (

                Number(item.peso || 0)

                *

                Number(item.quantidade)

            );


        },


        0


    );







    async function calcularFrete(){


        try{


            setCalculando(true);



            const cepLimpo = cep.replace(/\D/g,"");



            if(cepLimpo.length !== 8){

                alert(
                    "Digite um CEP válido"
                );

                return;

            }



            const response = await fetch(

                `https://viacep.com.br/ws/${cepLimpo}/json/`

            );



            const data = await response.json();



            if(data.erro){

                alert(
                    "CEP não encontrado"
                );

                return;

            }




            setEndereco(data);




            // FRETE TEMPORÁRIO
            // depois substituímos pelo Melhor Envio

            const resultado = await calcularMelhorEnvio({

cepDestino:cep,

peso:pesoTotal

});


setFrete(resultado);



        }catch(error){


            console.log(error);


            alert(
                "Erro ao calcular frete"
            );


        }finally{


            setCalculando(false);


        }


    }









    async function handleCheckout(){



        if(!user){


            alert(
                "Faça login para finalizar a compra"
            );


            navigate("/login");


            return;

        }






        try{



            const profile = await getUserProfile(

                user.uid

            );







            const valorFrete = frete?.valor || 0;






            const order = {



                usuarioId:user.uid,





                cliente:{



                    nome:

                    profile?.nome ||

                    user.displayName ||

                    user.email.split("@")[0],



                    email:user.email


                },







                enderecoEntrega:endereco,









                produtos:


                cart.map(item=>(


                    {


                    id:item.id,


                    nome:item.nome,


                    imagem:

                    item.imagens?.[0] || "",



                    quantidade:item.quantidade,



                    peso:

                    Number(item.peso || 0),



                    preco:


                    Number(

                        item.precoPromocional > 0

                        ?

                        item.precoPromocional

                        :

                        item.preco

                    )


                    }


                )),








                valorProdutos:total,



                pesoTotal:pesoTotal,



                frete:{


                    valor:valorFrete,


                    servico:

                    frete?.servico || ""

                },





                valorTotal:

                total + valorFrete



            };







            await createOrder(order);







            clearCart();






            alert(

                "Pedido realizado com sucesso!"

            );






            navigate("/meus-pedidos");






        }catch(error){



            console.log(

                "Erro ao criar pedido:",

                error

            );



            alert(

                "Erro ao finalizar pedido"

            );


        }



    }









    if(cart.length === 0){



        return(


            <main className="cart-page">


                <h1>

                    Seu carrinho está vazio

                </h1>



                <p>

                    Adicione produtos para continuar.

                </p>



            </main>


        )


    }









    return(


        <main className="cart-page">



            <h1>

                Carrinho de compras

            </h1>








            <section className="cart-container">







                <div className="cart-products">



                {

                cart.map(product=>(





                    <div

                    className="cart-item"

                    key={product.id}

                    >





                        <img

                        src={

                            product.imagens?.[0] ||

                            "/placeholder.png"

                        }

                        alt={product.nome}

                        />






                        <div className="cart-info">



                            <h2>

                                {product.nome}

                            </h2>





                            <p>

                            R$

                            {

                            Number(

                                product.precoPromocional > 0

                                ?

                                product.precoPromocional

                                :

                                product.preco

                            )

                            .toLocaleString(

                                "pt-BR",

                                {

                                minimumFractionDigits:2

                                }

                            )

                            }

                            </p>





                            <div className="quantity">



                                <button

                                onClick={()=>decreaseQuantity(product.id)}

                                >

                                    -

                                </button>




                                <span>

                                    {product.quantidade}

                                </span>





                                <button

                                onClick={()=>increaseQuantity(product.id)}

                                >

                                    +

                                </button>


                            </div>



                        </div>





                        <button

                        className="remove-button"

                        onClick={()=>removeFromCart(product.id)}

                        >

                            Remover

                        </button>





                    </div>



                ))



                }



                </div>









                <aside className="cart-summary">



                    <h2>

                        Entrega

                    </h2>




                    <input

                    type="text"

                    placeholder="Digite seu CEP"

                    value={cep}

                    onChange={(e)=>

                        setCep(e.target.value)

                    }

                    />





                    <button

                    className="frete-button"

                    onClick={calcularFrete}

                    >

                    {

                    calculando

                    ?

                    "Calculando..."

                    :

                    "Calcular frete"

                    }


                    </button>







                    {

                    endereco &&


                    <div>


                        <p>

                        {endereco.logradouro}

                        </p>


                        <p>

                        {endereco.bairro}

                        </p>


                        <p>

                        {endereco.localidade}

                        -

                        {endereco.uf}

                        </p>


                    </div>


                    }







                    {

                    frete &&


                    <>

                    <p>

                    {frete.servico}

                    -

                    {frete.prazo}

                    </p>


                    </>


                    }









                    <h2>

                        Resumo

                    </h2>







                    <p>

                        Peso:

                        <strong>

                        {" "}

                        {pesoTotal.toFixed(3)}

                        kg

                        </strong>

                    </p>







                    <h3>

                        Produtos:

                        <span>

                        R$

                        {total.toLocaleString(

                            "pt-BR",

                            {

                            minimumFractionDigits:2

                            }

                        )}

                        </span>

                    </h3>








                    <h3>

                        Frete:

                        <span>

                        R$

                        {(frete?.valor || 0)

                        .toLocaleString(

                            "pt-BR",

                            {

                            minimumFractionDigits:2

                            }

                        )}

                        </span>

                    </h3>









                    <h3>

                        Total:

                        <span>

                        R$

                        {(total + (frete?.valor || 0))

                        .toLocaleString(

                            "pt-BR",

                            {

                            minimumFractionDigits:2

                            }

                        )}

                        </span>


                    </h3>







                    <button

                    className="checkout-button"

                    onClick={handleCheckout}

                    >

                        Finalizar compra


                    </button>






                </aside>








            </section>







        </main>


    )


}