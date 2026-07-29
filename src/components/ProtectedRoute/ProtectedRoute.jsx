import {
    Navigate
} from "react-router-dom";


import useAuth from "../../hooks/useAuth";


export default function ProtectedRoute({children}){


    const {
        user,
        loading
    } = useAuth();



    if(loading){

        return <h2>Carregando...</h2>;

    }



    if(!user){

        return <Navigate to="/login"/>

    }



    return children;


}