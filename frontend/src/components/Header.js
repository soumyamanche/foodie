import {LOGO_URL} from "../utils/constants";
import { useEffect,useState} from "react";
import {Link} from "react-router-dom";

export const Header = () => {

   const [menuOpen, setMenuOpen] = useState(false);

   let btnName="Login";
   const [btnNameReact,setBtnNameReact]=useState("Login");
   console.log("header render");

   useEffect(()=>{
    console.log("useEffect called");
   },[btnNameReact]);

  return (
    <>
    {/*navbar*/}
    <div className="header">
      
      <div className="logo-container">
        <img
          className="logo"
          alt="res-logo"
          src={LOGO_URL}
        />
      </div>

      <div className="nav-items">
        <ul>
        <li><Link to="/">Home</Link></li>
  <li><Link to="/about">About</Link></li>
  <li><Link to="/contact">Contact</Link></li>
        <li>
        <button
            className="login-btn"
            onClick={() =>
              setBtnNameReact(
                btnNameReact === "Login" ? "Logout" : "Login"
              )
            }
          >
            {btnNameReact}
          </button>
         </li>
        </ul>
      </div>

    {/* Hamburger */}
        <div className="hamburger" onClick={() => setMenuOpen(true)}>
          ☰
        </div>
    </div>

   {/* Overlay */}
      {menuOpen && (
        <div className="overlay" onClick={() => setMenuOpen(false)}></div>
      )}

   {/* Mobile Sidebar */}
      <div className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="close-btn" onClick={() => setMenuOpen(false)}>
          ✖
        </div>

        <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
        <Link to="/help" onClick={() => setMenuOpen(false)}>Help</Link>
        <p>Cart</p>

        <button
          className="login-btn"
          onClick={() =>
            setBtnNameReact(
              btnNameReact === "Login" ? "Logout" : "Login"
            )
          }
        >
          {btnNameReact}
        </button>
      </div>
      </>
  );
};

export default Header;
