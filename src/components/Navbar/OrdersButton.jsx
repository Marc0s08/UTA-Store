import "./OrdersButton.css";

import {
    ReceiptLong
} from "@mui/icons-material";


import {
    useNavigate
} from "react-router-dom";



export default function OrdersButton(){


    const navigate = useNavigate();



    return(


        <button

        className="orders-button-nav"

        onClick={()=>navigate("/meus-pedidos")}

        >


            <ReceiptLong/>


            <span>

                Pedidos

            </span>


        </button>


    )

}