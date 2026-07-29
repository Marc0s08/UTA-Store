import "./AdminButton.css";

import {
    Link
} from "react-router-dom";


import {
    AdminPanelSettings
} from "@mui/icons-material";


import {
    useEffect,
    useState
} from "react";


import {
    useAuth
} from "../../context/AuthContext";


import {
    getUserProfile
} from "../../services/userService";




export default function AdminButton(){


    const { user } = useAuth();


    const [isAdmin,setIsAdmin] = useState(false);



    useEffect(()=>{


        async function checkAdmin(){


            if(!user){

                setIsAdmin(false);

                return;

            }



            try{


                const profile =

                await getUserProfile(
                    user.uid
                );



                if(
                    profile?.tipo === "admin"
                ){

                    setIsAdmin(true);

                }else{

                    setIsAdmin(false);

                }



            }catch(error){


                console.log(
                    "Erro ao validar admin:",
                    error
                );


                setIsAdmin(false);


            }


        }



        checkAdmin();



    },[user]);





    if(!isAdmin){

        return null;

    }





    return(


        <Link

        to="/admin"

        className="admin-button"

        >

            <AdminPanelSettings/>


            <span>

                Admin

            </span>


        </Link>


    );


}