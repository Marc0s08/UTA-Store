import "./Dashboard.css";


export default function Dashboard(){


    return (

        <div className="dashboard">


            <h1>
                Dashboard
            </h1>


            <div className="dashboard-cards">


                <div className="card">

                    <h3>
                        Produtos
                    </h3>

                    <strong>
                        0
                    </strong>

                </div>



                <div className="card">

                    <h3>
                        Pedidos
                    </h3>

                    <strong>
                        0
                    </strong>

                </div>



                <div className="card">

                    <h3>
                        Clientes
                    </h3>

                    <strong>
                        0
                    </strong>

                </div>



                <div className="card">

                    <h3>
                        Faturamento
                    </h3>

                    <strong>
                        R$ 0,00
                    </strong>

                </div>


            </div>



        </div>

    )

}