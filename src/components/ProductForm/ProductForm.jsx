import "./ProductForm.css";

import {
    useEffect,
    useState
} from "react";


import {
    createProduct,
    updateProduct
} from "../../services/productService";


import {
    uploadProductImage
} from "../../services/storageService";



export default function ProductForm({

    productEdit,

    onSaved

}){


    const initialState = {

        nome:"",
        descricao:"",
        categoria:"",
        preco:"",
        precoPromocional:"",
        estoque:"",
        peso:"",
        ativo:true

    };



    const [form,setForm] = useState(initialState);


    const [images,setImages] = useState([]);


    const [oldImages,setOldImages] = useState([]);





    useEffect(()=>{


        if(productEdit){


            setForm({

                nome:productEdit.nome || "",

                descricao:
                productEdit.descricao || "",

                categoria:
                productEdit.categoria || "",

                preco:
                productEdit.preco || "",

                precoPromocional:
                productEdit.precoPromocional || "",

                estoque:
                productEdit.estoque || "",


                peso:
                productEdit.peso || "",


                ativo:
                productEdit.ativo ?? true

            });



            setOldImages(

                productEdit.imagens || []

            );


        }else{


            setForm(initialState);

            setOldImages([]);

            setImages([]);


        }


    },[productEdit]);








    function handleChange(e){


        const {

            name,

            value,

            type,

            checked


        } = e.target;



        setForm({

            ...form,


            [name]:

            type === "checkbox"

            ?

            checked

            :

            value


        });


    }







    function handleImages(e){


        setImages(

            Array.from(

                e.target.files

            )

        );


    }










    async function handleSubmit(e){


        e.preventDefault();



        try{



            const newImages = [];





            for(const image of images){



                const url =

                await uploadProductImage(image);



                newImages.push(url);



            }








            const productData = {


                ...form,


                preco:

                Number(form.preco),




                precoPromocional:

                Number(form.precoPromocional || 0),




                estoque:

                Number(form.estoque),




                peso:

                Number(form.peso || 0),





                imagens:

                [

                    ...oldImages,

                    ...newImages

                ]



            };








            if(productEdit){



                await updateProduct(

                    productEdit.id,

                    productData

                );



                alert(

                    "Produto atualizado com sucesso!"

                );



            }else{



                await createProduct(

                    productData

                );



                alert(

                    "Produto cadastrado com sucesso!"

                );



            }







            setForm(initialState);


            setImages([]);


            setOldImages([]);




            if(onSaved){

                onSaved();

            }





        }catch(error){


            console.log(

                "Erro produto:",

                error

            );


            alert(

                "Erro ao salvar produto"

            );


        }


    }









    return(


        <form

        className="product-form"

        onSubmit={handleSubmit}

        >



            <h2>

            {

            productEdit

            ?

            "Editar Produto"

            :

            "Novo Produto"

            }

            </h2>







            <div className="input-group">


                <label>

                    Nome do produto

                </label>


                <input

                name="nome"

                value={form.nome}

                onChange={handleChange}

                placeholder="Ex: Rifle M4A1"

                required

                />


            </div>








            <div className="input-group">


                <label>

                    Descrição

                </label>


                <textarea

                name="descricao"

                value={form.descricao}

                onChange={handleChange}

                placeholder="Descrição do produto"

                />


            </div>








            <div className="input-group">


                <label>

                    Categoria

                </label>


                <input

                name="categoria"

                value={form.categoria}

                onChange={handleChange}

                placeholder="Ex: Airsoft"

                />


            </div>








            <div className="input-group">


                <label>

                    Imagens do produto

                </label>


                <input

                type="file"

                multiple

                accept="image/*"

                onChange={handleImages}

                />


            </div>








            {

            oldImages.length > 0 && (


                <div className="image-preview">


                    {

                    oldImages.map((img,index)=>(


                        <img

                        key={index}

                        src={img}

                        alt="Produto"

                        />


                    ))

                    }


                </div>


            )

            }









            <div className="input-group">


                <label>

                    Preço normal

                </label>


                <input

                type="number"

                step="0.01"

                name="preco"

                value={form.preco}

                onChange={handleChange}

                placeholder="R$ 0,00"

                />


            </div>









            <div className="input-group">


                <label>

                    Preço promocional

                </label>


                <input

                type="number"

                step="0.01"

                name="precoPromocional"

                value={form.precoPromocional}

                onChange={handleChange}

                placeholder="R$ 0,00"

                />


            </div>









            <div className="input-group">


                <label>

                    Estoque

                </label>


                <input

                type="number"

                name="estoque"

                value={form.estoque}

                onChange={handleChange}

                placeholder="Quantidade"

                />


            </div>







            <div className="input-group">


                <label>

                    Peso do produto (kg)

                </label>


                <input

                type="number"

                step="0.001"

                name="peso"

                value={form.peso}

                onChange={handleChange}

                placeholder="Ex: 0.300"

                />


            </div>









            <div className="checkbox-container">


                <span>

                    Produto ativo

                </span>





                <label className="switch-container">


                    <input

                    type="checkbox"

                    name="ativo"

                    checked={form.ativo}

                    onChange={handleChange}

                    />



                    <div className="switch"></div>



                </label>


            </div>









            <button>


            {

            productEdit

            ?

            "Atualizar produto"

            :

            "Cadastrar produto"

            }


            </button>







        </form>


    )


}