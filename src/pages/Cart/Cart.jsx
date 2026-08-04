import "./Cart.css";

import {
    useState,
    useEffect
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
    calcularMelhorEnvio
} from "../../services/freteService";

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


    // ALTERADO
    const [fretes,setFretes] = useState([]);

    const [freteSelecionado,setFreteSelecionado] = useState(null);



    const [calculando,setCalculando] = useState(false);


    const [perfil,setPerfil] = useState(null);


    const [usarEnderecoCadastro,setUsarEnderecoCadastro] = useState(true);







    useEffect(()=>{


        async function carregarPerfil(){


            if(user){


                const data = await getUserProfile(
                    user.uid
                );


                setPerfil(data);


            }


        }



        carregarPerfil();



    },[user]);








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




            let cepDestino = cep;




            if(usarEnderecoCadastro){


                cepDestino = perfil?.endereco?.cep;


            }






            const cepLimpo = cepDestino?.replace(/\D/g,"");






            if(!cepLimpo || cepLimpo.length !== 8){


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









            const resultado = await calcularMelhorEnvio({


                cepDestino:cepLimpo,


                peso:pesoTotal


            });






            console.log(

                "Frete retorno:",

                resultado

            );






            const lista = Array.isArray(resultado)

            ?

            resultado

            :

            [resultado];







            setFretes(lista);






            setFreteSelecionado(

                lista[0]

            );






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





            const valorFrete =

            freteSelecionado?.valor || 0;









            const order = {




                usuarioId:user.uid,





                cliente:{


                    nome:

                    profile?.nome ||

                    user.displayName ||

                    user.email.split("@")[0],


                    email:user.email


                },






                enderecoEntrega:{


                    ...endereco,


                    cep:


                    usarEnderecoCadastro

                    ?

                    profile?.endereco?.cep

                    :

                    cep


                },








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

                    freteSelecionado?.servico || "",



                    prazo:

                    freteSelecionado?.prazo || ""


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









                    <label>


                    <input

                    type="radio"

                    checked={usarEnderecoCadastro}

                    onChange={()=>setUsarEnderecoCadastro(true)}

                    />


                    Usar endereço cadastrado


                    </label>








                    <label>


                    <input

                    type="radio"

                    checked={!usarEnderecoCadastro}

                    onChange={()=>setUsarEnderecoCadastro(false)}

                    />


                    Digitar outro CEP


                    </label>









                    {


                    usarEnderecoCadastro && perfil?.endereco && (


                    <div className="address-box">



                        <p>

                        {perfil.endereco.rua},

                        {" "}

                        {perfil.endereco.numero}

                        </p>



                        <p>

                        {perfil.endereco.bairro}

                        </p>



                        <p>

                        {perfil.endereco.cidade}

                        -

                        {perfil.endereco.estado}

                        </p>



                        <p>

                        CEP:

                        {" "}

                        {perfil.endereco.cep}

                        </p>



                    </div>


                    )

                    }









                    {


                    !usarEnderecoCadastro && (



                    <input


                    type="text"


                    placeholder="Digite seu CEP"


                    value={cep}


                    onChange={(e)=>


                        setCep(e.target.value)


                    }


                    />


                    )


                    }









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


                    endereco && (



                    <div className="cep-result">



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


                    )

                    }












                    {


                    fretes.length > 0 && (



                    <div className="fretes-box">



                    <h3>

                        Opções de entrega

                    </h3>







                    {


                    fretes.map((item,index)=>(



                    <label

                    key={item.id || index}

                    className="frete-item"

                    >




                        <input


                        type="radio"


                        name="frete"


                        checked={

                        freteSelecionado?.id === item.id

                        }


                        onChange={()=>{


                            setFreteSelecionado(item);


                        }}


                        />







                        <div>



                            <strong>

                            {item.servico}

                            </strong>



                            <br/>



                            <span>


                            R$

                            {


                            Number(item.valor)

                            .toLocaleString(

                                "pt-BR",

                                {

                                minimumFractionDigits:2

                                }

                            )


                            }


                            </span>





                            <br/>




                            <small>

                            {item.prazo}

                            </small>



                        </div>




                    </label>



                    ))

                    }




                    </div>



                    )

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


                        {(freteSelecionado?.valor || 0)

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


                        {(

                        total +

                        (freteSelecionado?.valor || 0)

                        )


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