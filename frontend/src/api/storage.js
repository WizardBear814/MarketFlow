

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Pretend the API takes a moment, like a real network call.
export function delay(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
