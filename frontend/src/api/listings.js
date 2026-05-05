import { load, save, uid, delay } from "./storage.js";
import { KEYS } from "./seed.js";

// GET /listings  (with optional search query)
export async function listListings({ query = "", category = "", status = "" } = {}) {
  await delay();
  const all = load(KEYS.listings, []);
  const q = query.trim().toLowerCase();
  return all.filter((l) => {
    if (status && l.status !== status) return false;
    if (category && l.category !== category) return false;
    if (!q) return true;
    return (
      l.title.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q) ||
      l.location.toLowerCase().includes(q)
    );
  });
}

// GET /listings/:id
export async function getListing(id) {
  await delay();
  const all = load(KEYS.listings, []);
  const found = all.find((l) => l.id === id);
  if (!found) throw new Error("Listing not found.");
  return found;
}

// POST /listings  (auth required: seller/admin)
export async function createListing(data, currentUser) {
  await delay();
  if (!currentUser) throw new Error("You must be logged in.");
  if (!["seller", "admin"].includes(currentUser.role)) {
    throw new Error("Only sellers can create listings.");
  }
  const all = load(KEYS.listings, []);
  const newListing = {
    id: "l_" + uid(),
    title: data.title,
    description: data.description,
    price: Number(data.price),
    category: data.category || "Other",
    location: data.location || "",
    sellerId: currentUser.id,
    sellerName: currentUser.name,
    sellerEmail: currentUser.email,
    status: "available",
    createdAt: new Date().toISOString(),
  };
  all.push(newListing);
  save(KEYS.listings, all);
  return newListing;
}

// PUT /listings/:id  (auth required: owner or admin)
export async function updateListing(id, updates, currentUser) {
  await delay();
  if (!currentUser) throw new Error("You must be logged in.");
  const all = load(KEYS.listings, []);
  const idx = all.findIndex((l) => l.id === id);
  if (idx === -1) throw new Error("Listing not found.");

  const target = all[idx];
  const isOwner = target.sellerId === currentUser.id;
  const isAdmin = currentUser.role === "admin";
  if (!isOwner && !isAdmin) throw new Error("You cannot edit this listing.");

  const next = {
    ...target,
    ...updates,
    price: updates.price !== undefined ? Number(updates.price) : target.price,
  };
  all[idx] = next;
  save(KEYS.listings, all);
  return next;
}

// DELETE /listings/:id  (auth required: owner or admin)
export async function deleteListing(id, currentUser) {
  await delay();
  if (!currentUser) throw new Error("You must be logged in.");
  const all = load(KEYS.listings, []);
  const target = all.find((l) => l.id === id);
  if (!target) throw new Error("Listing not found.");

  const isOwner = target.sellerId === currentUser.id;
  const isAdmin = currentUser.role === "admin";
  if (!isOwner && !isAdmin) throw new Error("You cannot delete this listing.");

  const next = all.filter((l) => l.id !== id);
  save(KEYS.listings, next);
  return { ok: true };
}

// PATCH /listings/:id/status  -> "sold" or "available"
export async function setListingStatus(id, status, currentUser) {
  return updateListing(id, { status }, currentUser);
}

// GET /listings?sellerId=me
export async function listMyListings(currentUser) {
  await delay();
  if (!currentUser) return [];
  const all = load(KEYS.listings, []);
  return all.filter((l) => l.sellerId === currentUser.id);
}
