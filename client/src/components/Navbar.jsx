import { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, isLoggedIn, isAdmin, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">⚗️</span>
          <span className="logo-text">AasaMedchem</span>
        </Link>

        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        <ul className={`nav-menu ${mobileMenuOpen ? "active" : ""}`}>
          <li>
            <Link to="/" className={`nav-link ${isActive('/')}`} onClick={() => setMobileMenuOpen(false)}>
              Products
            </Link>
          </li>

          {isLoggedIn && (
            <>
              <li>
                <Link to="/quotation" className={`nav-link ${isActive('/quotation')}`} onClick={() => setMobileMenuOpen(false)}>
                  Quotations
                </Link>
              </li>
              <li>
                <Link to="/orders" className={`nav-link ${isActive('/orders')}`} onClick={() => setMobileMenuOpen(false)}>
                  Orders
                </Link>
              </li>
            </>
          )}

          {isAdmin && (
            <li>
              <Link to="/admin" className={`nav-link ${isActive('/admin')}`} onClick={() => setMobileMenuOpen(false)}>
                Admin Panel
              </Link>
            </li>
          )}
        </ul>

        <div className={`nav-auth ${mobileMenuOpen ? "active" : ""}`}>
          {isLoggedIn ? (
            <div className="user-profile-section">
              <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
              <div className="user-details">
                <span className="user-name">{user?.name}</span>
                <span className="user-role badge badge-confirmed">{user?.role}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;