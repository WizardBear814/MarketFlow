import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listMyListings, deleteListing, setListingStatus } from "../api/listings.js";
import { useAuth } from "../context/AuthContext.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function MyListingsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  function refresh() {
    setLoading(true);
    listMyListings(user).then((data) => {
      setItems(data);
      setLoading(false);
    });
  }

  useEffect(() => {
    refresh();
  }, [user]);

  async function handleDelete(id) {
    if (!confirm("Delete this listing?")) return;
    try {
      await deleteListing(id, user);
      refresh();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleToggleStatus(item) {
    const next = item.status === "sold" ? "available" : "sold";
    try {
      await setListingStatus(item.id, next, user);
      refresh();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <p>Loading…</p>;

  return (
    <>
      <div className="row wrap between">
        <h1 className="page-title">My Listings</h1>
        <Link className="btn btn-primary" to="/listings/new">+ New listing</Link>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="You have no listings yet"
          message="Create your first listing to start selling."
          action={<Link className="btn btn-primary" to="/listings/new">Create listing</Link>}
        />
      ) : (
        <section className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((l) => (
                <tr key={l.id}>
                  <td><Link to={`/listings/${l.id}`}>{l.title}</Link></td>
                  <td>${Number(l.price).toFixed(2)}</td>
                  <td>
                    <span className={`badge ${l.status === "sold" ? "badge-danger" : "badge-ok"}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="row wrap">
                    <Link className="btn btn-secondary" to={`/listings/${l.id}/edit`}>Edit</Link>
                    <button className="btn" onClick={() => handleToggleStatus(l)}>
                      {l.status === "sold" ? "Mark available" : "Mark sold"}
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(l.id)}>
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
