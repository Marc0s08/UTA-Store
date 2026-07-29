import { createTheme } from "@mui/material/styles";

const theme = createTheme({

    palette:{

        mode:"dark",

        primary:{
            main:"#556B2F"
        },

        secondary:{
            main:"#FFC107"
        },

        background:{
            default:"#121212",
            paper:"#1C1C1C"
        }

    },

    shape:{
        borderRadius:12
    },

    typography:{

        fontFamily:"Poppins"

    }

});

export default theme;