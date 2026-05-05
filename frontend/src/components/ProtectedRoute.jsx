import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children, roles }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) return <p>Loading…</p>;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="card">
        <h2>Not allowed</h2>
        <p>You don’t have permission to view this page.</p>
      </div>
    );
  }

  return children;
}
