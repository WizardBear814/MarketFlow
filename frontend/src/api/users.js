import { load, save, delay } from "./storage.js";
import { KEYS } from "./seed.js";

// GET /admin/users
export async function listUsers(currentUser) {
  await delay();
  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Admins only.");
  }
  const users = load(KEYS.users, []);
  return users.map(({ password, ...u }) => u);
}

// PATCH /admin/users/:id
export async function updateUser(id, updates, currentUser) {
  await delay();
  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Admins only.");
  }
  const users = load(KEYS.users, []);
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error("User not found.");
  users[idx] = { ...users[idx], ...updates };
  save(KEYS.users, users);
  const { password, ...safe } = users[idx];
  return safe;
}

// DELETE /admin/users/:id
export async function deleteUser(id, currentUser) {
  await delay();
  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Admins only.");
  }
  if (currentUser.id === id) {
    throw new Error("You cannot delete your own admin account.");
  }
  const users = load(KEYS.users, []);
  save(KEYS.users, users.filter((u) => u.id !== id));
  return { ok: true };
}
