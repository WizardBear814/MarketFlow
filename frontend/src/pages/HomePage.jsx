import { useEffect, useState } from "react";
import { listListings } from "../api/listings.js";
import ListingCard from "../components/ListingCard.jsx";
import EmptyState from "../components/EmptyState.jsx";

const CATEGORIES = ["", "Electronics", "Home", "Clothing", "Books", "Other"];

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [hideSold, setHideSold] = useState(true);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    listListings({
      query,
      category,
      status: hideSold ? "available" : "",
    }).then((data) => {
      if (active) {
        setItems(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [query, category, hideSold]);

  return (
    <>
      <h1 className="page-title">Browse the Marketplace</h1>
      <p className="subtitle">Find items nearby. Search by name, description, or location.</p>

      <section className="card search-bar">
        <div className="grid grid-3">
          <div className="field">
            <label htmlFor="search">Search</label>
            <input
              id="search"
              type="text"
              placeholder="e.g. headphones, Boston…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c || "all"} value={c}>{c || "All categories"}</option>
              ))}
            </select>
          </div>
          <div className="field checkbox-field">
            <label>
              <input
                type="checkbox"
                checked={hideSold}
                onChange={(e) => setHideSold(e.target.checked)}
              />
              Hide sold items
            </label>
          </div>
        </div>
      </section>

      {loading && <p>Loading…</p>}

      {!loading && items.length === 0 && (
        <EmptyState
          title="No listings found"
          message="Try a different search or clear your filters."
        />
      )}

      {!loading && items.length > 0 && (
        <section className="grid grid-3">
          {items.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </section>
      )}
    </>
  );
}
