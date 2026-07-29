import "./CartButton.css";

import {
    ShoppingCart
} from "@mui/icons-material";

import {
    useNavigate
} from "react-router-dom";

import {
    useCart
} from "../../context/CartContext";



export default function CartButton(){


    const navigate = useNavigate();


    const {

        cart

    } = useCart();




    const totalItems = cart.reduce(

        (total,item)=>

        total + item.quantidade,

        0

    );





    return(


        <button

        className="cart-button"

        onClick={()=>navigate("/carrinho")}

        >



            <ShoppingCart/>




            {

            totalItems > 0 &&


            <span className="cart-count">

                {totalItems}

            </span>


            }



        </button>


    )


}