import "./CartMessage.css";


import {
    useCart
} from "../../context/CartContext";



export default function CartMessage(){


    const {

        message

    } = useCart();




    if(!message){


        return null;


    }





    return(


        <div className="cart-message">


            🛒 {message}


        </div>


    )


}