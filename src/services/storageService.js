import {

    ref,

    uploadBytes,

    getDownloadURL

} from "firebase/storage";


import {

    storage

} from "../firebase/firebaseConfig";




export async function uploadProductImage(file){


    const imageRef = ref(

        storage,

        `produtos/${Date.now()}-${file.name}`

    );



    await uploadBytes(

        imageRef,

        file

    );



    const url = await getDownloadURL(

        imageRef

    );



    return url;


}