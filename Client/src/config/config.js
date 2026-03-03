// ✅ Détection automatique selon le domaine
const BASE_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:8000"
    : "https://onfpp.onrender.com"; // URL backend sur Render

const CONFIG = {
  BASE_URL,
  API_LOGIN: "/api/login/",            // correspond à ton urls.py
  API_ME: "/api/me/",                  // endpoint pour récupérer l'utilisateur connecté
  API_CREATE_USER: "/api/users/create/", // création d'utilisateur
  API_USER_LIST: "/api/users/",   
  API_ROLES: "/api/roles/",
  API_REGIONS: "/api/regions/",
  API_CENTRES: "/api/centres/",

  CLOUDINARY_NAME: "dwuyq2eoz",
  CLOUDINARY_UPLOAD_PRESET: "default", // preset Unsigned
};

export default CONFIG;