export async function buscarCEP(cep){

    const cepLimpo = cep.replace(/\D/g,"");


    if(cepLimpo.length !== 8){

        throw new Error(
            "CEP inválido"
        );

    }


    const response = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`
    );


    const data = await response.json();


    if(data.erro){

        throw new Error(
            "CEP não encontrado"
        );

    }


    return {

        ...data,

        cep:cepLimpo

    };

}