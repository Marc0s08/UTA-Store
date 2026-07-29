import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import {Link} from "react-router-dom";

export default function UserMenu() {
  return (
    <Link 
to="/perfil"
className="nav-icon"
>

<AccountCircleOutlinedIcon/>

<span>
Minha Conta
</span>

</Link>
  );
}