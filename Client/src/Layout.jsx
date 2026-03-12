import { useState, useEffect } from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import NavAdmin from "./components/Header/NavAdmin";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import React from "react";

const C = {
  bg:         "#F0F4FF",
  surfaceAlt: "#EEF2FF",
  navy:       "#0D1B5E",
  blue:       "#1A3BD4",
};

/* ⚠️  Ces valeurs DOIVENT être identiques à celles dans NavAdmin.jsx */
const SIDEBAR_W  = 240;
const SIDEBAR_SM = 64;
const TOPBAR_H   = 58;

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
];

const App = () => {
  const location = useLocation();
  const token    = localStorage.getItem("access");

  /* Écouter l'event "sidebar-toggle" émis par NavAdmin */
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    const h = (e) => setCollapsed(e.detail?.collapsed ?? false);
    window.addEventListener("sidebar-toggle", h);
    return () => window.removeEventListener("sidebar-toggle", h);
  }, []);
  const sideW = collapsed ? SIDEBAR_SM : SIDEBAR_W;

  React.useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  const isAdminPage = adminPaths.some(p => location.pathname.startsWith(p));
  const isLoginPage = location.pathname === "/login";

  if (isAdminPage && !token) return <Navigate to="/login" replace />;

  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin:0; padding:0; width:100%; height:100%; overflow:hidden; }
    #root {
      width:100%; height:100%;
      overflow-y:auto; overflow-x:hidden;
      -webkit-overflow-scrolling:touch;
      scrollbar-width:thin;
      scrollbar-color:${C.blue} ${C.surfaceAlt};
      font-family:'Syne', sans-serif;
    }
    #root::-webkit-scrollbar { width:6px; }
    #root::-webkit-scrollbar-track { background:${C.surfaceAlt}; }
    #root::-webkit-scrollbar-thumb {
      background:linear-gradient(180deg,${C.blue},${C.navy});
      border-radius:6px;
    }
  `;

  return (
    <I18nextProvider i18n={i18n}>
      <style>{globalStyles}</style>

      {isAdminPage ? (
        <div style={{ width:"100%", minHeight:"100vh", background:C.bg }}>

          {/* Sidebar + Topbar */}
          <NavAdmin />

          {/* Zone contenu */}
          <main style={{
            marginLeft: sideW,
            paddingTop: TOPBAR_H,
            minHeight:  "100vh",
            transition: "margin-left .28s cubic-bezier(.22,1,.36,1)",
          }}>
            <div style={{
              maxWidth: 1800,
              margin:   "0 auto",
              padding:  "28px 28px 56px",
            }}>
              <Outlet />
            </div>
          </main>
        </div>

      ) : (
        <div style={{
          width:"100%", minHeight:"100vh",
          background:C.bg, color:C.navy,
          fontFamily:"'Syne',sans-serif",
        }}>
          {!isLoginPage && (
            <div style={{ position:"fixed", top:0, left:0, right:0, zIndex:50 }}>
              <Header logoColor={C.blue}/>
            </div>
          )}
          <main style={{ paddingTop:isLoginPage?0:128, paddingBottom:64 }}>
            <div style={{ maxWidth:1600, margin:"0 auto", padding:"0 24px" }}>
              <Outlet />
            </div>
          </main>
          {!isLoginPage && <Footer />}
        </div>
      )}
    </I18nextProvider>
  );
};

export default App;