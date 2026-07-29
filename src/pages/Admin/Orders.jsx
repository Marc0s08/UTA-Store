import "./Orders.css";

import {
    useEffect,
    useState
} from "react";


import {

    getAllOrders

} from "../../services/orderService";


import {

    doc,

    getDoc

} from "firebase/firestore";


import {

    db

} from "../../firebase/firebaseConfig";



export default function Orders(){


    const [orders,setOrders] = useState([]);


    const [clients,setClients] = useState({});





    useEffect(()=>{


        loadOrders();


    },[]);







    async function getClientName(order){



        if(order.cliente?.nome){


            return order.cliente.nome;


        }




        if(!order.usuarioId){


            return "Sem nome";


        }





        const ref = doc(

            db,

            "usuarios",

            order.usuarioId

        );





        const snap = await getDoc(ref);





        if(snap.exists()){



            return snap.data().nome || "Sem nome";


        }




        return "Sem nome";



    }







    async function loadOrders(){



        const data = await getAllOrders();




        setOrders(data);





        const names = {};





        for(const order of data){



            names[order.id] = await getClientName(order);



        }





        setClients(names);



    }







    return(



        <div className="orders-admin">



            <h1>

                📦 Pedidos

            </h1>






            <div className="orders-grid">





            {


            orders.map(order=>(



                <div


                key={order.id}


                className="order-card"


                >




                    <h2>


                        Pedido #


                        {order.id.substring(0,8).toUpperCase()}


                    </h2>






                    <p>


                        Cliente:


                        {

                            clients[order.id] ||

                            "Carregando..."

                        }


                    </p>






                    <p>


                        {

                        order.cliente?.email ||

                        "Sem email"

                        }


                    </p>






                    <p>


                        {

                        order.produtos?.length || 0

                        }


                        produto(s)


                    </p>






                    <h3>


                        R$


                        {


                        Number(order.valorTotal)


                        .toLocaleString(

                            "pt-BR",

                            {

                                minimumFractionDigits:2

                            }

                        )


                        }


                    </h3>






                    <span


                    className={

                        `status ${

                        order.status?.toLowerCase()

                        }`

                    }


                    >


                        {order.status}


                    </span>







                    <button>


                        Visualizar


                    </button>





                </div>



            ))



            }




            </div>





        </div>



    );


}