// // ✅ Détection automatique selon le domaine
// const BASE_URL =
//   window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
//     ? "http://127.0.0.1:8000"
//     : "https://onfpp.onrender.com"; // URL backend sur Render

// const CONFIG = {
//   BASE_URL,
//   API_LOGIN: "/api/login/",            // correspond à ton urls.py
//   API_ME: "/api/me/",                  // endpoint pour récupérer l'utilisateur connecté
//   API_CREATE_USER: "/api/users/create/", // création d'utilisateur
//   API_USER_LIST: "/api/users/",   
//   API_ROLES: "/api/roles/",
//   API_REGIONS: "/api/regions/",
//   API_CENTRES: "/api/centres/",

//   // Evaluation
//   API_SESSIONS: "/api/sessions/",                  // CRUD sessions
//   API_CRITERES: "/api/criteres/",                  // CRUD critères
//   API_APPRENANTS: "/api/apprenants/",              // CRUD apprenants
//   API_EVALUATIONS: "/api/evaluations/",            // CRUD évaluations

//   // Nouveaux endpoints pour rapports
//   API_RESULTS: (sessionId) => `/api/sessions/${sessionId}/results/`,                       // JSON total + %
//   API_PDF_APPRENANT: (sessionId, apprenantId) => `/api/sessions/${sessionId}/pdf-apprenant/${apprenantId}/`,
//   API_PDF_GLOBAL: (sessionId) => `/api/sessions/${sessionId}/pdf_global/`,
//   API_EXPORT_EXCEL: (sessionId) => `/api/sessions/${sessionId}/export_excel/`,
//   API_GRAPH: (sessionId) => `/api/sessions/${sessionId}/graph/`,


//   CLOUDINARY_NAME: "dwuyq2eoz",
//   CLOUDINARY_UPLOAD_PRESET: "default", // preset Unsigned
// };

// export default CONFIG;

// config.js

// ✅ Détection automatique selon le domaine
const BASE_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:8000"
    : "https://onfpp.onrender.com";

const CONFIG = {
  BASE_URL,

  // ── Auth / Utilisateurs ──────────────────────────────────
  API_LOGIN:        "/api/login/",
  API_ME:           "/api/me/",
  API_CREATE_USER:  "/api/users/create/",
  API_USER_LIST:    "/api/users/",
  API_ROLES:        "/api/roles/",
  API_REGIONS:      "/api/regions/",
  API_CENTRES:      "/api/centres/",

  // ── Évaluation CRUD ──────────────────────────────────────
  API_SESSIONS:     "/api/sessions/",
  API_CRITERES:     "/api/criteres/",
  API_APPRENANTS:   "/api/apprenants/",
  API_EVALUATIONS:  "/api/evaluations/",

  // ── Rapports & exports ───────────────────────────────────
  // Résultats JSON : total + % par apprenant
  API_RESULTS: (sessionId) =>
    `/api/sessions/${sessionId}/results/`,

  // PDF individuel par apprenant
  API_PDF_APPRENANT: (sessionId, apprenantId) =>
    `/api/sessions/${sessionId}/pdf-apprenant/${apprenantId}/`,

  // PDF global ultime (6 graphiques) ← url_path='pdf-global-ultimate'
  API_PDF_GLOBAL: (sessionId) =>
    `/api/sessions/${sessionId}/pdf-global-ultimate/`,

  // Export Excel
  API_EXPORT_EXCEL: (sessionId) =>
    `/api/sessions/${sessionId}/export_excel/`,

  // Graphique PNG simple
  API_GRAPH: (sessionId) =>
    `/api/sessions/${sessionId}/graph/`,

  // ── Cloudinary ───────────────────────────────────────────
  CLOUDINARY_NAME:          "dwuyq2eoz",
  CLOUDINARY_UPLOAD_PRESET: "default",
};

export default CONFIG;