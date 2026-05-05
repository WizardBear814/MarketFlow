import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listListings, deleteListing } from "../api/listings.js";
import { useAuth } from "../context/AuthContext.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function AdminListingsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  function refresh() {
    setLoading(true);
    listListings().then((data) => {
      setItems(data);
      setLoading(false);
    });
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleDelete(id) {
    if (!confirm("Remove this listing?")) return;
    try {
      await deleteListing(id, user);
      refresh();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <p>Loading…</p>;

  return (
    <>
      <h1 className="page-title">Admin · Listings</h1>
      <p className="subtitle">Remove inappropriate listings to keep the marketplace safe.</p>

      {items.length === 0 ? (
        <EmptyState title="No listings" message="There are no listings yet." />
      ) : (
        <section className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Seller</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((l) => (
                <tr key={l.id}>
                  <td><Link to={`/listings/${l.id}`}>{l.title}</Link></td>
                  <td>{l.sellerName}</td>
                  <td>${Number(l.price).toFixed(2)}</td>
                  <td>
                    <span className={`badge ${l.status === "sold" ? "badge-danger" : "badge-ok"}`}>
                      {l.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-danger" onClick={() => handleDelete(l.id)}>
                      Remove
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
