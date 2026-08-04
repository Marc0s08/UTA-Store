export function moeda(valor){

    return Number(valor)

    .toLocaleString(

        "pt-BR",

        {

            minimumFractionDigits:2

        }

    );

}