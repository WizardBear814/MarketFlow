import { Link } from "react-router-dom";

export default function ListingCard({ listing }) {
  const sold = listing.status === "sold";
  return (
    <article className={`card listing-card ${sold ? "is-sold" : ""}`}>
      <h3 className="listing-title">
        <Link to={`/listings/${listing.id}`}>{listing.title}</Link>
      </h3>
      <p className="muted">{listing.category} · {listing.location || "—"}</p>
      <p className="price">${Number(listing.price).toFixed(2)}</p>
      <p className="desc">{listing.description}</p>
      <div className="row">
        <span className={`badge ${sold ? "badge-danger" : "badge-ok"}`}>
          {sold ? "Sold" : "Available"}
        </span>
        <Link className="btn btn-secondary" to={`/listings/${listing.id}`}>View</Link>
      </div>
    </article>
  );
}
