import {
    Navigate
} from "react-router-dom";


import useAuth from "../../hooks/useAuth";



export default function AdminRoute({children}){


    const {
        user,
        profile,
        loading
    } = useAuth();



    if(loading){

        return <p>Carregando...</p>;

    }



    if(!user){

        return (

            <Navigate
            to="/login"
            />

        );

    }



    if(profile?.tipo !== "admin"){


        return (

            <Navigate
            to="/"
            />

        );

    }



    return children;


}