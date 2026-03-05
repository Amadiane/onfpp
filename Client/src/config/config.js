

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
  API_RESULTS: (sessionId) =>
    `/api/sessions/${sessionId}/results/`,

  API_PDF_APPRENANT: (sessionId, apprenantId) =>
    `/api/sessions/${sessionId}/pdf-apprenant/${apprenantId}/`,

  // ✅ Correspond à url_path='pdf-global' dans views.py
  API_PDF_GLOBAL: (sessionId) =>
    `/api/sessions/${sessionId}/pdf-global/`,

  API_EXPORT_EXCEL: (sessionId) =>
    `/api/sessions/${sessionId}/export_excel/`,

  API_GRAPH: (sessionId) =>
    `/api/sessions/${sessionId}/graph/`,

  // ── Cloudinary ───────────────────────────────────────────
  CLOUDINARY_NAME:          "dwuyq2eoz",
  CLOUDINARY_UPLOAD_PRESET: "default",
};

export default CONFIG;