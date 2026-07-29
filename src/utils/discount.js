export function calculateDiscount(preco, precoPromocional){

    if(
        !preco ||
        !precoPromocional ||
        precoPromocional >= preco
    ){

        return 0;

    }


    const desconto =
    ((preco - precoPromocional) / preco) * 100;


    return Math.round(desconto);

}