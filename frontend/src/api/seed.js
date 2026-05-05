import { load, save } from "./storage.js";

const KEYS = {
  users: "mf_users",
  listings: "mf_listings",
  wishlist: "mf_wishlist",
  session: "mf_session",
};

const SEED_USERS = [
  {
    id: "u_admin",
    name: "Admin",
    email: "admin@marketflow.com",
    password: "admin123",
    role: "admin",
    status: "active",
  },
  {
    id: "u_seller",
    name: "Sample Seller",
    email: "seller@marketflow.com",
    password: "seller123",
    role: "seller",
    status: "active",
  },
  {
    id: "u_buyer",
    name: "Sample Buyer",
    email: "buyer@marketflow.com",
    password: "buyer123",
    role: "buyer",
    status: "active",
  },
];

const SEED_LISTINGS = [
  {
    id: "l_1",
    title: "Wireless Headphones",
    description: "Noise-canceling, 30-hour battery. Lightly used.",
    price: 89.99,
    category: "Electronics",
    location: "Boston, MA",
    sellerId: "u_seller",
    sellerName: "Sample Seller",
    sellerEmail: "seller@marketflow.com",
    status: "available",
    createdAt: new Date().toISOString(),
  },
  {
    id: "l_2",
    title: "Portable Blender",
    description: "Rechargeable, perfect for smoothies on the go.",
    price: 39.95,
    category: "Home",
    location: "Cambridge, MA",
    sellerId: "u_seller",
    sellerName: "Sample Seller",
    sellerEmail: "seller@marketflow.com",
    status: "available",
    createdAt: new Date().toISOString(),
  },
  {
    id: "l_3",
    title: "Smart Watch",
    description: "Fitness tracking and notifications.",
    price: 129.0,
    category: "Electronics",
    location: "Somerville, MA",
    sellerId: "u_seller",
    sellerName: "Sample Seller",
    sellerEmail: "seller@marketflow.com",
    status: "sold",
    createdAt: new Date().toISOString(),
  },
];

export function seedIfEmpty() {
  if (!load(KEYS.users, null)) save(KEYS.users, SEED_USERS);
  if (!load(KEYS.listings, null)) save(KEYS.listings, SEED_LISTINGS);
  if (!load(KEYS.wishlist, null)) save(KEYS.wishlist, {});
}

export { KEYS };
