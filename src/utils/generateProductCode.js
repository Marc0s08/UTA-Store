export function generateProductCode(id){


    const code = id
    .replace(/[^a-zA-Z0-9]/g,"")
    .substring(0,5)
    .toUpperCase();



    return `UTA-${code}`;


}