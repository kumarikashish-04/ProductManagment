import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/Navbar.css";

const Navbar = () => {
  const { user, isLoggedIn, isAdmin, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🧪 Aasamedchem
        </Link>

        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>

        <ul className={`nav-menu ${mobileMenuOpen ? "active" : ""}`}>
          <li>
            <Link to="/products" onClick={() => setMobileMenuOpen(false)}>
              Products
            </Link>
          </li>

          {isLoggedIn && (
            <>
              <li>
                <Link to="/quotation" onClick={() => setMobileMenuOpen(false)}>
                  Quotations
                </Link>
              </li>
              <li>
                <Link to="/orders" onClick={() => setMobileMenuOpen(false)}>
                  Orders
                </Link>
              </li>
            </>
          )}

          {isAdmin && (
            <li>
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                Dashboard
              </Link>
            </li>
          )}
        </ul>

        <div className="nav-auth">
          {isLoggedIn ? (
            <>
              <span className="user-info">
                {user?.name} ({user?.role})
              </span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="login-btn">
                Login
              </Link>
              <Link to="/register" className="register-btn">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
