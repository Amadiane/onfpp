import { Outlet, useLocation, Navigate } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import NavAdmin from "./components/Header/NavAdmin";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import React from "react";

/**
 * 🎨 APP ONFPP — Layout aligné sur la palette NavAdmin / DashboardAdmin
 * Palette : navy #0D1B5E | blue #1A3BD4 | bg #F0F4FF | iceBlue #C8D9FF
 */

/* Palette identique NavAdmin & DashboardAdmin */
const C = {
  bg:         "#F0F4FF",
  surface:    "#FFFFFF",
  surfaceAlt: "#EEF2FF",
  navy:       "#0D1B5E",
  blue:       "#1A3BD4",
  iceBlue:    "#C8D9FF",
  textMuted:  "#8FA3D8",
  shadow:     "rgba(26,59,212,0.10)",
};

const adminPaths = [
  "/newsPost", "/listeContacts", "/listeRejoindre",
  "/listePostulantsCommunity", "/listPartners",
  "/listeAbonnement", "/valeurPost",
  "/dashboardAdmin", "/teamMessage", "/formation",
  "/activitiesPost", "/homePost", "/partnerPost",
  "/servicePost", "/portfolioPost", "/addUser",
  /* routes du nouveau NavAdmin */
  "/formations", "/sessions", "/suiviEvaluation","/programmes", "/certifications",
  "/inscription", "/apprenants", "/listeCandidats", "/validation",
  "/suivi", "/presences", "/evaluations", "/discipline",
  "/resultats", "/attestations", "/enquete-insertion", "/relances",
  "/entreprises", "/offres-emploi", "/statistiques",
  "/dashboardRegional", "/rapports", "/centresFormation",
  "/teamMessage", "/partnerPost", "/utilisateurs", "/parametres",

];

const App = () => {
  const location = useLocation();
  const token = localStorage.getItem("access");

  /* Scroll to top à chaque changement de route */
  React.useEffect(() => {
    const rootElement = document.getElementById("root");
    if (rootElement) rootElement.scrollTop = 0;
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const timer = setTimeout(() => {
      if (rootElement) rootElement.scrollTop = 0;
      window.scrollTo(0, 0);
    }, 0);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const isAdminPage = adminPaths.some(p => location.pathname.startsWith(p));
  const isLoginPage = location.pathname === "/login";

  if (isAdminPage && !token) {
    return <Navigate to="/login" replace />;
  }

  /* ─── Styles globaux ─── */
  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');

    *, *::before, *::after { box-sizing: border-box; }

    html, body, #root {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }

    #root {
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
      scrollbar-color: ${C.blue} ${C.surfaceAlt};
      font-family: 'Syne', sans-serif;
    }

    /* Scrollbar — palette NavAdmin */
    #root::-webkit-scrollbar { width: 8px; }
    #root::-webkit-scrollbar-track {
      background: ${C.surfaceAlt};
      border-radius: 10px;
    }
    #root::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, ${C.blue} 0%, ${C.navy} 100%);
      border-radius: 10px;
      border: 2px solid ${C.surfaceAlt};
    }
    #root::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, ${C.iceBlue} 0%, ${C.blue} 100%);
      box-shadow: 0 0 8px ${C.shadow};
    }

    html::-webkit-scrollbar, body::-webkit-scrollbar,
    *:not(#root)::-webkit-scrollbar { display: none; }
    html, body, *:not(#root) { scrollbar-width: none; }

    @media (max-width: 768px) { #root::-webkit-scrollbar { width: 4px; } }
  `;

  return (
    <I18nextProvider i18n={i18n}>
      <style>{globalStyles}</style>

      {/* ══ LAYOUT ADMIN ══ */}
      {isAdminPage ? (
        <div style={{
          width:"100%", minHeight:"100vh",
          background: C.bg,
          fontFamily:"'Syne', sans-serif",
          position:"relative",
        }}>
          {/* Décors subtils — palette navy/blue */}
          <div style={{ position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0 }}>
            {/* Halo haut-droite */}
            <div style={{
              position:"absolute", top:-120, right:-120,
              width:500, height:500, borderRadius:"50%",
              background:`radial-gradient(circle, ${C.blue}08 0%, transparent 70%)`,
            }}/>
            {/* Halo bas-gauche */}
            <div style={{
              position:"absolute", bottom:-100, left:-100,
              width:400, height:400, borderRadius:"50%",
              background:`radial-gradient(circle, ${C.navy}06 0%, transparent 70%)`,
            }}/>
            {/* Ligne subtile horizontale sous la nav */}
            <div style={{
              position:"absolute", top:72, left:0, right:0,
              height:1, background:`linear-gradient(90deg, transparent, ${C.iceBlue}60, transparent)`,
            }}/>
          </div>

          {/* NavAdmin */}
          <NavAdmin />

          {/* Contenu principal */}
          <main style={{ position:"relative", zIndex:1, width:"100%" }}>
            <div style={{
              maxWidth:1800,
              margin:"0 auto",
              padding:"24px 24px 40px",
            }}>
              <Outlet />
            </div>
          </main>
        </div>

      ) : (
        /* ══ LAYOUT PUBLIC ══ */
        <div style={{
          width:"100%", minHeight:"100vh",
          background: C.bg,
          color: C.navy,
          fontFamily:"'Syne', sans-serif",
          position:"relative",
        }}>
          {/* Décors publics */}
          <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden" }}>
            <div style={{
              position:"absolute", top:-80, right:-80,
              width:600, height:600, borderRadius:"50%",
              background:`radial-gradient(circle, ${C.blue}0A 0%, transparent 65%)`,
            }}/>
            <div style={{
              position:"absolute", bottom:-60, left:-60,
              width:500, height:500, borderRadius:"50%",
              background:`radial-gradient(circle, ${C.navy}07 0%, transparent 65%)`,
            }}/>
          </div>

          {/* Header public fixe */}
          {!isLoginPage && (
            <div style={{ position:"fixed", top:0, left:0, right:0, zIndex:50 }}>
              <Header logoColor={C.blue} />
            </div>
          )}

          {/* Contenu public */}
          <main style={{ position:"relative", paddingTop: isLoginPage ? 0 : 128, paddingBottom:64 }}>
            <div style={{ width:"100%", maxWidth:1600, margin:"0 auto", padding:"0 24px" }}>
              <Outlet />
            </div>
          </main>

          {/* Footer */}
          {!isLoginPage && (
            <div style={{ position:"relative", zIndex:10 }}>
              <Footer />
            </div>
          )}
        </div>
      )}
    </I18nextProvider>
  );
};

export default App;