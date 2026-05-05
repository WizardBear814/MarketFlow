import { load, save, uid, delay } from "./storage.js";
import { KEYS } from "./seed.js";

// POST /auth/register
export async function register({ name, email, password, role }) {
  await delay();
  const users = load(KEYS.users, []);
  const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    throw new Error("An account with this email already exists.");
  }
  const newUser = {
    id: "u_" + uid(),
    name,
    email,
    password,
    role: role || "buyer",
    status: "active",
  };
  users.push(newUser);
  save(KEYS.users, users);
  return publicUser(newUser);
}

// POST /auth/login
export async function login({ email, password }) {
  await delay();
  const users = load(KEYS.users, []);
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!user) throw new Error("Invalid email or password.");
  if (user.status !== "active") throw new Error("This account has been disabled.");

  const session = publicUser(user);
  save(KEYS.session, session);
  return session;
}

export function logout() {
  localStorage.removeItem(KEYS.session);
}

export function getSession() {
  return load(KEYS.session, null);
}

function publicUser(u) {
  return { id: u.id, name: u.name, email: u.email, role: u.role };
}
