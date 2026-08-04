export async function calcularMelhorEnvio({

    cepDestino,

    peso

}){


    const response = await fetch(

        "/.netlify/functions/calcularFrete",

        {

            method:"POST",

            headers:{

                "Content-Type":
                "application/json"

            },


            body:JSON.stringify({

                cepDestino,

                peso

            })

        }

    );




    const data = await response.json();




    console.log(
        "Retorno fretes:",
        data
    );





    if(!response.ok){

        throw new Error(
            data.message ||
            data.erro ||
            "Erro no Melhor Envio"
        );

    }





    const lista = Array.isArray(data)

    ? data

    :

    [data];







    return lista.map(item=>({


        id:item.id,


        servico:

        item.name || 
        item.company?.name ||
        "Frete",



        valor:

        Number(

            item.price ||
            item.custom_price ||
            0

        ),




        prazo:

        item.delivery_time

        ?

        `${item.delivery_time} dias úteis`

        :

        "Prazo não informado",




        transportadora:

        item.company?.name || ""



    }));


}