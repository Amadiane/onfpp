/**
 * App.jsx — mis à jour pour le thème global dark/light
 * Enveloppe toute l'application dans ThemeProvider.
 * Les variables CSS --page-bg, --surface, --text-pri, etc.
 * sont injectées sur <html> par ThemeContext et disponibles partout.
 */

import { useState, useEffect } from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import NavAdmin from "./components/Header/NavAdmin";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import React from "react";

/* ── Constantes layout (doivent correspondre à NavAdmin.jsx) ── */
const SIDEBAR_W  = 262;
const SIDEBAR_SM = 68;
const TOPBAR_H   = 60;

const adminPaths = [
  "/newsPost", "/listeContacts", "/listeRejoindre",
  "/listePostulantsCommunity", "/listPartners",
  "/listeAbonnement", "/valeurPost",
  "/dashboardAdmin", "/teamMessage", "/formationContinue", "/formation",
  "/activitiesPost", "/formateurs",
  "/servicePost", "/entreprise", "/addUser",
  "/formations", "/sessions", "/suiviEvaluation", "/formationDAPc", "/certifications",
  "/inscription", "/apprenants", "/listeCandidats", "/validation",
  "/suivi", "/presences", "/evaluations", "/discipline",
  "/resultats", "/attestations", "/enquete-insertion", "/relances",
  "/offres-emploi", "/statistiques",
  "/dashboardRegional", "/rapports", "/centresFormation",
  "/listeApprenants", "/utilisateurs", "/parametres",
  "/boitecommune", "/homePost", "/partnerPost",
];

/* ─────────────────────────────────────────────────────────────
   INNER APP — accède au thème via useTheme()
───────────────────────────────────────────────────────────── */
const InnerApp = () => {
  const location = useLocation();
  const token    = localStorage.getItem("access");
  const { dark, T } = useTheme();

  /* Écouter le toggle sidebar depuis NavAdmin */
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    const h = (e) => setCollapsed(e.detail?.collapsed ?? false);
    window.addEventListener("sidebar-toggle", h);
    return () => window.removeEventListener("sidebar-toggle", h);
  }, []);
  const sideW = collapsed ? SIDEBAR_SM : SIDEBAR_W;

  /* Scroll to top à chaque navigation */
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  const isAdminPage = adminPaths.some(p => location.pathname.startsWith(p));
  const isLoginPage = location.pathname === "/login";

  if (isAdminPage && !token) return <Navigate to="/login" replace />;

  /* CSS global — injecté dynamiquement selon le thème */
  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');

    *, *::before, *::after { box-sizing: border-box; }

    html {
      font-size: 16px;
      scroll-behavior: smooth;
    }

    body {
      margin: 0; padding: 0;
      width: 100%; min-height: 100vh;
      background: ${T.page};
      color: ${T.textPri};
      font-family: 'Sora', sans-serif;
      -webkit-font-smoothing: antialiased;
      transition: background .3s ease, color .3s ease;
    }

    #root {
      width: 100%; min-height: 100vh;
      scrollbar-width: thin;
      scrollbar-color: ${T.brand} ${T.surface};
    }
    #root::-webkit-scrollbar { width: 5px; }
    #root::-webkit-scrollbar-track { background: ${T.surface}; }
    #root::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, ${T.brand}, ${dark ? T.brandViv : T.brandMid});
      border-radius: 5px;
    }

    /* ── CSS variables globales — utilisables dans TOUTES les pages ── */
    :root {
      --page-bg:      ${T.page};
      --surface:      ${T.surface};
      --surface-el:   ${T.surfaceEl};
      --surface-hov:  ${T.surfaceHover};
      --brand:        ${T.brand};
      --brand-mid:    ${T.brandMid};
      --brand-viv:    ${T.brandViv};
      --brand-pale:   ${T.brandPale};
      --brand-glow:   ${T.brandGlow};
      --text-pri:     ${T.textPri};
      --text-sec:     ${T.textSec};
      --text-muted:   ${T.textMuted};
      --text-inv:     ${T.textInv};
      --divider:      ${T.divider};
      --border:       ${T.border};
      --border-str:   ${T.borderStr};
      --ice:          ${T.ice};
      --ice-deep:     ${T.iceDeep};
      --ice-faint:    ${T.iceFaint};
      --gold:         ${T.gold};
      --gold-viv:     ${T.goldViv};
      --gold-pale:    ${T.goldPale};
      --green:        ${T.green};
      --green-light:  ${T.greenLight};
      --green-pale:   ${T.greenPale};
      --rose:         ${T.rose};
      --rose-pale:    ${T.rosePale};
      --violet:       ${T.violet};
      --teal:         ${T.teal};
      --sh1:          ${T.sh1};
      --sh2:          ${T.sh2};
      --sh3:          ${T.sh3};
      --sky:          ${T.sky};
    }

    /* ── Transitions globales pour le passage de thème ── */
    *, *::before, *::after {
      transition:
        background-color .25s ease,
        border-color     .25s ease,
        color            .25s ease,
        box-shadow       .25s ease;
    }
    /* Exclure les animations qui ne doivent pas être ralenties */
    *[class*="spin"], *[class*="pulse"], *[class*="blink"],
    *[class*="orb"], *[class*="badge"] {
      transition: none !important;
    }

    /* ── Sélection texte ── */
    ::selection {
      background: ${T.brand}30;
      color: ${T.textPri};
    }

    /* ── Focus accessible ── */
    :focus-visible {
      outline: 2px solid ${T.brand};
      outline-offset: 2px;
      border-radius: 4px;
    }
  `;

  return (
    <>
      <style>{globalStyles}</style>

      {isAdminPage ? (
        <div style={{
          width: "100%", minHeight: "100vh",
          background: T.page,
          transition: "background .3s ease",
        }}>
          {/* Sidebar + Topbar */}
          <NavAdmin />

          {/* Zone contenu principal */}
          <main style={{
            marginLeft:  sideW,
            paddingTop:  TOPBAR_H,
            minHeight:   "100vh",
            background:  T.page,
            transition:  "margin-left .32s cubic-bezier(.22,1,.36,1), background .3s ease",
          }}>
            <div style={{
              maxWidth: 1800,
              margin:   "0 auto",
              padding:  "28px 28px 60px",
            }}>
              <Outlet />
            </div>
          </main>
        </div>

      ) : (
        <div style={{
          width: "100%", minHeight: "100vh",
          background: T.page,
          color: T.textPri,
          fontFamily: "'Sora', sans-serif",
          transition: "background .3s ease, color .3s ease",
        }}>
          {!isLoginPage && (
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50 }}>
              <Header logoColor={T.brand}/>
            </div>
          )}
          <main style={{ paddingTop: isLoginPage ? 0 : 128, paddingBottom: 64 }}>
            <div style={{ maxWidth: 1600, margin: "0 auto", padding: "0 24px" }}>
              <Outlet />
            </div>
          </main>
          {!isLoginPage && <Footer />}
        </div>
      )}
    </>
  );
};

/* ─────────────────────────────────────────────────────────────
   APP ROOT — enveloppe tout dans ThemeProvider
───────────────────────────────────────────────────────────── */
const App = () => (
  <ThemeProvider>
    <I18nextProvider i18n={i18n}>
      <InnerApp />
    </I18nextProvider>
  </ThemeProvider>
);

export default App;