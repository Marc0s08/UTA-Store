import {
    createContext,
    useContext,
    useState
} from "react";


const CartContext = createContext();



export function CartProvider({children}){


    const [cart,setCart] = useState([]);

    const [message,setMessage] = useState("");





    function showMessage(text){


        setMessage(text);



        setTimeout(()=>{


            setMessage("");


        },3000);


    }







    function addToCart(product){



        const exists = cart.find(

            item => item.id === product.id

        );




        if(exists){



            setCart(


                cart.map(item=>


                    item.id === product.id


                    ?


                    {


                    ...item,


                    quantidade:item.quantidade + 1


                    }


                    :


                    item


                )


            );



        }else{



            setCart([

                ...cart,

                {


                ...product,


                quantidade:1


                }


            ]);



        }




        showMessage(

            `${product.nome} foi adicionado ao carrinho`

        );


    }









    function removeFromCart(id){


        setCart(

            cart.filter(

                item=>item.id !== id

            )

        );


    }








    function increaseQuantity(id){


        setCart(


            cart.map(item=>


                item.id === id


                ?


                {


                ...item,


                quantidade:item.quantidade + 1


                }


                :


                item


            )


        );


    }








    function decreaseQuantity(id){


        setCart(


            cart.map(item=>


                item.id === id && item.quantidade > 1


                ?


                {


                ...item,


                quantidade:item.quantidade - 1


                }


                :


                item


            )


        );


    }








    function clearCart(){


        setCart([]);


    }







    const total = cart.reduce(


        (acc,item)=>{


            const preco =


            item.precoPromocional > 0


            ?


            item.precoPromocional


            :


            item.preco;



            return acc + (

                Number(preco) *

                item.quantidade

            );


        },


        0


    );







    return(


        <CartContext.Provider


        value={{


            cart,


            addToCart,


            removeFromCart,


            increaseQuantity,


            decreaseQuantity,


            clearCart,


            total,


            message


        }}


        >


            {children}


        </CartContext.Provider>


    )

}





export function useCart(){


    return useContext(CartContext);


}