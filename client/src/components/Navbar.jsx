import { Link } from "react-router-dom";

const Navbar = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <nav>
      <Link to="/">Products</Link> |{" "}
      <Link to="/orders">Orders</Link>

      {user?.role === "admin" && (
        <>
          {" | "}
          <Link to="/admin">Admin</Link>
        </>
      )}

      <button onClick={logout}>Logout</button>
    </nav>
  );
};

export default Navbar;