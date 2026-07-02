const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function request(path) {
  const res = await fetch(`${API_BASE}${path}`);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = typeof err.detail === "string"
      ? err.detail
      : err.error || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return res.json();
}

export function cloneRepo(url) {
  return request(`/clone?url=${encodeURIComponent(url)}`);
}

export function readRepo() {
  return request("/read");
}

export function storeRepo() {
  return request("/store");
}

export function askQuestion(question) {
  return request(`/ask?question=${encodeURIComponent(question)}`);
}
