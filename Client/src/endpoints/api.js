const BASE_URL = "http://127.0.0.1:8000";

// Appels authentifiés
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("access");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || `Erreur API ${response.status}`);
  }

  return response.json();
}

// Appels publics
export async function apiPublic(endpoint) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || `Erreur API publique ${response.status}`);
  }

  return response.json();
}

