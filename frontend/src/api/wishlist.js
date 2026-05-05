import { load, save, delay } from "./storage.js";
import { KEYS } from "./seed.js";

// Wishlist is stored as { [userId]: [listingId, ...] }

export async function getWishlist(currentUser) {
  await delay(80);
  if (!currentUser) return [];
  const map = load(KEYS.wishlist, {});
  return map[currentUser.id] || [];
}

export async function addToWishlist(listingId, currentUser) {
  await delay(80);
  if (!currentUser) throw new Error("You must be logged in.");
  const map = load(KEYS.wishlist, {});
  const ids = map[currentUser.id] || [];
  if (!ids.includes(listingId)) ids.push(listingId);
  map[currentUser.id] = ids;
  save(KEYS.wishlist, map);
  return ids;
}

export async function removeFromWishlist(listingId, currentUser) {
  await delay(80);
  if (!currentUser) throw new Error("You must be logged in.");
  const map = load(KEYS.wishlist, {});
  const ids = (map[currentUser.id] || []).filter((id) => id !== listingId);
  map[currentUser.id] = ids;
  save(KEYS.wishlist, map);
  return ids;
}
