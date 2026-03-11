// import CONFIG from "../config/config.js";

// export const login = async (username, password) => {
//   try {
//     const response = await fetch(`${CONFIG.BASE_URL}${CONFIG.API_LOGIN}`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ username, password }),
//     });

//     if (!response.ok) {
//       throw new Error("Erreur HTTP : " + response.status);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Erreur de connexion :", error);
//     return { success: false, error: error.message };
//   }
// };

// src/components/endpoints/api.js
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