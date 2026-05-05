import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <Link to="/" className="brand">MarketFlow</Link>
        <nav>
          <ul className="nav-links">
            <li><NavLink to="/" end>Browse</NavLink></li>

            {user && (
              <li><NavLink to="/wishlist">Wishlist</NavLink></li>
            )}

            {user && (user.role === "seller" || user.role === "admin") && (
              <>
                <li><NavLink to="/my-listings">My Listings</NavLink></li>
                <li><NavLink to="/listings/new">+ New Listing</NavLink></li>
              </>
            )}

            {user && user.role === "admin" && (
              <>
                <li><NavLink to="/admin/listings">Admin · Listings</NavLink></li>
                <li><NavLink to="/admin/users">Admin · Users</NavLink></li>
              </>
            )}

            {!user && (
              <>
                <li><NavLink to="/login">Login</NavLink></li>
                <li><NavLink to="/register">Register</NavLink></li>
              </>
            )}

            {user && (
              <li>
                <span className="user-tag">
                  {user.name} ({user.role})
                </span>
                <button className="btn btn-ghost" onClick={handleLogout}>Logout</button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
