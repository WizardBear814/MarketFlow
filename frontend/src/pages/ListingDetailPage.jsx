import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getListing, deleteListing, setListingStatus } from "../api/listings.js";
import { addToWishlist, getWishlist, removeFromWishlist } from "../api/wishlist.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inWishlist, setInWishlist] = useState(false);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    setLoading(true);
    getListing(id)
      .then(setListing)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!user) return;
    getWishlist(user).then((ids) => setInWishlist(ids.includes(id)));
  }, [id, user]);

  async function handleWishlistToggle() {
    if (!user) {
      navigate("/login", { state: { from: `/listings/${id}` } });
      return;
    }
    try {
      if (inWishlist) {
        await removeFromWishlist(id, user);
        setInWishlist(false);
      } else {
        await addToWishlist(id, user);
        setInWishlist(true);
      }
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this listing?")) return;
    try {
      await deleteListing(id, user);
      navigate("/my-listings");
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleMarkSold() {
    try {
      const next = await setListingStatus(id, "sold", user);
      setListing(next);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleMarkAvailable() {
    try {
      const next = await setListingStatus(id, "available", user);
      setListing(next);
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="error-text">{error}</p>;
  if (!listing) return null;

  const isOwner = user && user.id === listing.sellerId;
  const isAdmin = user && user.role === "admin";
  const sold = listing.status === "sold";

  return (
    <article className="card listing-detail">
      <h1 className="page-title">{listing.title}</h1>
      <p className="muted">{listing.category} · {listing.location || "—"}</p>
      <p className="price big">${Number(listing.price).toFixed(2)}</p>
      <p>
        <span className={`badge ${sold ? "badge-danger" : "badge-ok"}`}>
          {sold ? "Sold" : "Available"}
        </span>
      </p>

      <h3>Description</h3>
      <p>{listing.description}</p>

      <h3>Seller</h3>
      <p>{listing.sellerName}</p>

      {/* Buyer actions */}
      <div className="row wrap">
        <button className="btn btn-primary" onClick={() => setShowContact((v) => !v)} disabled={sold}>
          {showContact ? "Hide contact info" : "Contact seller"}
        </button>
        <button className="btn" onClick={handleWishlistToggle}>
          {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        </button>
        <Link className="btn btn-ghost" to="/">Back to browse</Link>
      </div>

      {showContact && (
        <p className="contact-box">
          Email: <a href={`mailto:${listing.sellerEmail}`}>{listing.sellerEmail}</a>
        </p>
      )}

      {/* Owner / admin actions */}
      {(isOwner || isAdmin) && (
        <section className="owner-actions">
          <h3>Manage listing</h3>
          <div className="row wrap">
            <Link className="btn btn-secondary" to={`/listings/${listing.id}/edit`}>Edit</Link>
            {sold ? (
              <button className="btn" onClick={handleMarkAvailable}>Mark as available</button>
            ) : (
              <button className="btn" onClick={handleMarkSold}>Mark as sold</button>
            )}
            <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
          </div>
        </section>
      )}
    </article>
  );
}
