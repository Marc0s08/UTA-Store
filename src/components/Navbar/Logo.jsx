import { Link } from "react-router-dom";
import logo from "../../assets/logo/logo.png";

export default function Logo() {
  return (
    <Link to="/" className="logo">
      <img src={logo} alt="UTA Store" />
    </Link>
  );
}