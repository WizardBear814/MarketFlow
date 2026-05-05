import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getWishlist, removeFromWishlist } from "../api/wishlist.js";
import { listListings } from "../api/listings.js";
import ListingCard from "../components/ListingCard.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function WishlistPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const ids = await getWishlist(user);
    const all = await listListings();
    setItems(all.filter((l) => ids.includes(l.id)));
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [user]);

  async function handleRemove(id) {
    await removeFromWishlist(id, user);
    load();
  }

  if (loading) return <p>Loading…</p>;

  return (
    <>
      <h1 className="page-title">My Wishlist</h1>

      {items.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          message="Browse the marketplace and tap “Add to Wishlist” on items you like."
          action={<Link className="btn btn-primary" to="/">Browse listings</Link>}
        />
      ) : (
        <section className="grid grid-3">
          {items.map((l) => (
            <div key={l.id} className="stack">
              <ListingCard listing={l} />
              <button className="btn btn-danger" onClick={() => handleRemove(l.id)}>
                Remove from wishlist
              </button>
            </div>
          ))}
        </section>
      )}
    </>
  );
}
