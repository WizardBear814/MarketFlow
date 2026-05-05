import { useEffect, useState } from "react";
import { listUsers, updateUser, deleteUser } from "../api/users.js";
import { useAuth } from "../context/AuthContext.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function refresh() {
    setLoading(true);
    listUsers(user)
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleToggleStatus(target) {
    const next = target.status === "active" ? "disabled" : "active";
    try {
      await updateUser(target.id, { status: next }, user);
      refresh();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleChangeRole(target, role) {
    try {
      await updateUser(target.id, { role }, user);
      refresh();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this user?")) return;
    try {
      await deleteUser(id, user);
      refresh();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <>
      <h1 className="page-title">Admin · Users</h1>
      <p className="subtitle">Manage user accounts and access levels.</p>

      {items.length === 0 ? (
        <EmptyState title="No users" />
      ) : (
        <section className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => handleChangeRole(u, e.target.value)}
                      disabled={u.id === user.id}
                    >
                      <option value="buyer">buyer</option>
                      <option value="seller">seller</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td>
                    <span className={`badge ${u.status === "active" ? "badge-ok" : "badge-danger"}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="row wrap">
                    <button className="btn" onClick={() => handleToggleStatus(u)} disabled={u.id === user.id}>
                      {u.status === "active" ? "Disable" : "Enable"}
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(u.id)} disabled={u.id === user.id}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}
