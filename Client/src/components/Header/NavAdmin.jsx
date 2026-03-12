import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, GraduationCap,
  ClipboardList, Award, Settings, LogOut, Menu,
  Bell, FileText, UserCheck, CalendarDays, Package, Layers,
  CheckCircle2, Briefcase, UserCog, Clock,
  AlertTriangle, AlertCircle, ChevronRight, X,
  PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import CONFIG from "../../config/config.js";
import logo from "../../assets/logo.png";

/* ═══════════════════════════════════════
   PALETTE
═══════════════════════════════════════ */
const C = {
  sidebarBg:   "#08122E",
  sidebarMid:  "#0D1B5E",
  sidebarItem: "rgba(255,255,255,0.06)",
  sidebarHov:  "rgba(255,255,255,0.10)",
  sidebarAct:  "rgba(26,59,212,0.35)",
  sidebarActBorder: "#1A3BD4",
  topbarBg:    "#FFFFFF",
  blue:        "#1A3BD4",
  blueSoft:    "#2E50E8",
  sky:         "#4F72FF",
  iceBlue:     "#D6E0FF",
  divider:     "#E8ECFA",
  textPri:     "#08122E",
  textSub:     "#3B4F82",
  textMuted:   "#7B8EC4",
  textSide:    "rgba(255,255,255,0.75)",
  textSideDim: "rgba(255,255,255,0.38)",
  accent:      "#E8A000",
  success:     "#047857",
  emerald:     "#10B981",
  purple:      "#5B21B6",
  danger:      "#B91C1C",
  shadow:      "rgba(8,18,46,0.12)",
};

const SIDEBAR_W  = 240;
const SIDEBAR_SM = 64;

/* ═══════════════════════════════════════
   RÔLES
═══════════════════════════════════════ */
const ROLE_LABELS = {
  DG:"Directeur Général", CD:"Chef de Division",
  DR:"Directeur Régional", CC:"Chef de Centre",
  FORMATEUR:"Formateur", SUPERADMIN:"Super Administrateur",
  "Directeur Général":"Directeur Général",
  "Chef de Division":"Chef de Division",
  "Directeur Régional":"Directeur Régional",
  "Chef de Centre":"Chef de Centre",
  "Formateur":"Formateur",
  "Super Administrateur":"Super Administrateur",
  "Chef d'Antenne":"Chef d'Antenne",
  "Conseiller":"Conseiller",
};

const ROLE_COLOR = {
  DG:"#1A3BD4", CD:"#1A3BD4", DR:"#047857", CC:"#B45309",
  FORMATEUR:"#0369A1", SUPERADMIN:"#B91C1C",
  "Directeur Général":"#1A3BD4","Chef de Division":"#1A3BD4",
  "Directeur Régional":"#047857","Chef de Centre":"#B45309",
  "Formateur":"#0369A1","Super Administrateur":"#B91C1C",
  "Chef d'Antenne":"#5B21B6","Conseiller":"#0369A1",
};

/* ═══════════════════════════════════════
   NAV ITEMS (liste plate)
═══════════════════════════════════════ */
const buildNavItems = (role) => {
  const all = [
    { path:"/dashboardAdmin",    label:"Tableau de bord",        icon:LayoutDashboard, roles:["DG","CD","DR","CC","FORMATEUR","SUPERADMIN","Chef de Division","Directeur Général","Chef de Centre","Formateur","Super Administrateur","Chef d'Antenne","Conseiller"] },
    { path:"/formations",        label:"Catalogue formations",   icon:BookOpen,        roles:["DG","CD","DR","CC","FORMATEUR","Chef de Division","Directeur Général","Chef de Centre","Formateur","Chef d'Antenne","Conseiller"] },
    { path:"/sessions",          label:"Sessions planifiées",    icon:CalendarDays,    roles:["DG","CD","DR","CC","FORMATEUR","Chef de Division","Directeur Général","Chef de Centre","Formateur","Chef d'Antenne","Conseiller"] },
    { path:"/certifications",    label:"Certifications",         icon:Award,           roles:["DG","CD","DR","CC","FORMATEUR","Chef de Division","Directeur Général","Chef de Centre","Formateur","Chef d'Antenne","Conseiller"] },
    { path:"/inscription",       label:"Inscriptions",           icon:GraduationCap,   roles:["DG","CD","DR","CC","FORMATEUR","Chef de Division","Directeur Général","Chef de Centre","Formateur","Chef d'Antenne","Conseiller"] },
    { path:"/listeApprenants",   label:"Liste Apprenants",       icon:ClipboardList,   roles:["DG","CD","DR","CC","FORMATEUR","Chef de Division","Directeur Général","Chef de Centre","Formateur","Chef d'Antenne","Conseiller"] },
    { path:"/presences",         label:"Présences",              icon:CalendarDays,    roles:["DG","CD","DR","CC","FORMATEUR","Chef de Division","Directeur Général","Chef de Centre","Formateur"] },
    { path:"/evaluations",       label:"Évaluations",            icon:Award,           roles:["DG","CD","DR","CC","FORMATEUR","Chef de Division","Directeur Général","Chef de Centre","Formateur"] },
    { path:"/discipline",        label:"Discipline",             icon:AlertTriangle,   roles:["CC","FORMATEUR","Chef de Centre","Formateur"] },
    { path:"/suiviEvaluation",   label:"Suivi Évaluation",       icon:CheckCircle2,    roles:["DG","CD","DR","Chef de Division","Directeur Général"] },
    { path:"/attestations",      label:"Attestations PDF",       icon:FileText,        roles:["DG","CD","DR","CC","FORMATEUR","Chef de Division","Directeur Général","Chef de Centre","Formateur"] },
    { path:"/enquete-insertion", label:"Enquête insertion",      icon:Clock,           roles:["DG","CD","DR","CC","Chef de Division","Directeur Général","Chef de Centre"] },
    { path:"/resultats",         label:"Résultats finaux",       icon:CheckCircle2,    roles:["CC","FORMATEUR","Chef de Centre","Formateur"] },
    { path:"/entreprise",        label:"Entreprises",            icon:Briefcase,       roles:["DG","CD","DR","Chef de Division","Directeur Général"] },
    { path:"/formationContinue", label:"Formation DFC",          icon:Package,         roles:["DG","CD","DR","Chef de Division","Directeur Général"] },
    { path:"/formateurs",        label:"Formateurs",             icon:UserCog,         roles:["DG","CD","DR","Chef de Division","Directeur Général"] },
    { path:"/formationDAPc",     label:"Formation DAPC",         icon:Package,         roles:["DG","CD","DR","Chef de Division","Directeur Général"] },
    { path:"/addUser",           label:"Gestion utilisateurs",   icon:UserCog,         roles:["DG","CD","SUPERADMIN","Chef de Division","Directeur Général","Super Administrateur"] },
    { path:"/homePost",          label:"Contenu site public",    icon:Layers,          roles:["DG","CD","Chef de Division","Directeur Général"] },
    { path:"/parametres",        label:"Paramètres",             icon:Settings,        roles:["DG","CD","SUPERADMIN","Chef de Division","Directeur Général","Super Administrateur"] },
  ];
  // Dédupliquer par path
  const seen = new Set();
  return all.filter(item => {
    const key = item.path;
    if (seen.has(key)) return false;
    seen.add(key);
    return item.roles.includes(role);
  });
};

/* ═══════════════════════════════════════
   getStoredUser — robuste (objet ou string)
═══════════════════════════════════════ */
const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    if (raw) {
      const u = JSON.parse(raw);
      const roleRaw  = u.role;
      const roleName = typeof roleRaw === "object" && roleRaw !== null
        ? (roleRaw.name || "DG") : (roleRaw || "DG");
      const fn = u.first_name || u.firstName || "";
      const ln = u.last_name  || u.lastName  || "";
      const displayName = fn ? `${fn}${ln ? " "+ln : ""}` : u.username || u.email || "Admin";
      return {
        ...u,
        role:        roleName,
        roleLevel:   typeof roleRaw === "object" ? (roleRaw.level ?? u.niveau ?? 0) : (u.niveau ?? 0),
        displayName,
        username:    u.username || u.email || displayName,
        division:    u.division || null,
        antenne:     u.antenne  || null,
      };
    }
    const token = localStorage.getItem("access");
    if (token) {
      const p = JSON.parse(atob(token.split(".")[1]));
      const roleRaw  = p.role;
      const roleName = typeof roleRaw === "object" && roleRaw !== null
        ? (roleRaw.name || "DG") : (roleRaw || "DG");
      const fn = p.first_name || "";
      const ln = p.last_name  || "";
      const displayName = fn ? `${fn}${ln ? " "+ln : ""}` : p.username || p.email || "Admin";
      return { username: p.username||p.email||displayName, displayName, role: roleName, roleLevel: typeof roleRaw==="object"?(roleRaw.level??p.niveau??0):(p.niveau??0), niveau: p.niveau??0, division: p.division||null, antenne: p.antenne||null };
    }
  } catch {}
  return { username:"Admin", displayName:"Admin", role:"DG", roleLevel:100, niveau:0 };
};

/* ═══════════════════════════════════════
   CSS GLOBAL
═══════════════════════════════════════ */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

  .na-root * { box-sizing:border-box; }
  .na-root, .na-root *:not(style) { font-family:'DM Sans',sans-serif !important; -webkit-font-smoothing:antialiased; }

  /* Sidebar item */
  .na-si {
    display:flex; align-items:center; gap:11px;
    padding:9px 12px; border-radius:9px; cursor:pointer;
    text-decoration:none; border:none; background:transparent;
    transition:background .15s, transform .12s;
    position:relative; overflow:visible;
    margin:1px 8px;
  }
  .na-si:hover { background:${C.sidebarHov}; transform:translateX(2px); }
  .na-si.na-si-active {
    background:${C.sidebarAct};
    box-shadow:inset 3px 0 0 ${C.sidebarActBorder};
  }

  /* Topbar icon btn */
  .na-tb-btn {
    width:36px; height:36px; border-radius:9px; border:1px solid ${C.divider};
    background:transparent; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    color:${C.textMuted}; transition:all .15s;
  }
  .na-tb-btn:hover { background:${C.iceBlue}22; color:${C.textPri}; border-color:${C.iceBlue}; }
  .na-tb-btn.active { background:${C.blue}10; color:${C.blue}; border-color:${C.blue}30; }

  /* Notif panel */
  @keyframes naPanel {
    from { opacity:0; transform:translateY(-8px) scale(.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  .na-panel { animation:naPanel .18s cubic-bezier(.22,1,.36,1) both; }

  /* Tooltip */
  .na-tip {
    position:absolute; left:calc(100% + 12px); top:50%;
    transform:translateY(-50%);
    background:${C.textPri}; color:#fff;
    font-size:11px; font-weight:600; white-space:nowrap;
    padding:5px 10px; border-radius:7px;
    pointer-events:none; opacity:0;
    transition:opacity .15s;
    z-index:9999;
    box-shadow:0 4px 16px ${C.shadow};
  }
  .na-tip::before {
    content:''; position:absolute; right:100%; top:50%;
    transform:translateY(-50%);
    border:5px solid transparent; border-right-color:${C.textPri};
  }
  .na-si:hover .na-tip { opacity:1; }

  /* Scrollbar sidebar */
  .na-scroll::-webkit-scrollbar { width:3px; }
  .na-scroll::-webkit-scrollbar-track { background:transparent; }
  .na-scroll::-webkit-scrollbar-thumb { background:rgba(255,255,255,.15); border-radius:3px; }

  /* Sidebar transition */
  .na-sidebar {
    transition:width .28s cubic-bezier(.22,1,.36,1);
    will-change:width;
  }

  /* Label fade */
  .na-label {
    transition:opacity .2s, max-width .28s cubic-bezier(.22,1,.36,1);
    overflow:hidden; white-space:nowrap;
  }

  @keyframes naPulse { 0%,100%{box-shadow:0 0 0 0 rgba(232,160,0,.5)} 60%{box-shadow:0 0 0 5px rgba(232,160,0,0)} }
  .na-badge { animation:naPulse 2.4s ease infinite; }

  /* Notif item hover */
  .na-ni { transition:background .1s; }
  .na-ni:hover { background:${C.iceBlue}22 !important; }

  @keyframes naSpin { to { transform:rotate(360deg); } }
  .na-spin { animation:naSpin .7s linear infinite; }
`;

/* ═══════════════════════════════════════
   COMPOSANT PRINCIPAL
═══════════════════════════════════════ */
const NavAdmin = () => {
  const location = useLocation();
  const navigate  = useNavigate();

  const [collapsed,    setCollapsed]    = useState(false);
  const [showNotif,    setShowNotif]    = useState(false);
  const [counts,       setCounts]       = useState({ contacts:0, community:0, newsletter:0 });
  const [notifData,    setNotifData]    = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [time,         setTime]         = useState(new Date());

  const notifRef = useRef(null);

  const user        = getStoredUser();
  const role        = user.role || "DG";
  const roleLabel   = ROLE_LABELS[role] || role;
  const displayName = user.displayName || user.username || "Admin";
  const initials    = displayName.split(" ").filter(Boolean).map(w=>w[0]).slice(0,2).join("").toUpperCase() || "?";
  const roleColor   = ROLE_COLOR[role] || C.blue;
  const navItems    = buildNavItems(role);
  const totalNotifs = counts.contacts + counts.community + counts.newsletter;

  /* Sync Layout.jsx via CustomEvent quand sidebar se plie/déplie */
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("sidebar-toggle", { detail:{ collapsed } }));
  }, [collapsed]);

  /* Horloge */
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  /* Counts */
  useEffect(() => {
    (async () => {
      try {
        const r1 = await fetch(CONFIG.API_CONTACT_LIST);
        if(r1.ok){ const d=await r1.json(); setCounts(p=>({...p,contacts:(Array.isArray(d)?d:d.results||[]).length})); }
        const r2 = await fetch(CONFIG.API_POSTULANT_LIST);
        if(r2.ok){ const d=await r2.json(); setCounts(p=>({...p,community:(Array.isArray(d)?d:d.results||[]).length})); }
        const r3 = await fetch(CONFIG.API_ABONNEMENT_LIST);
        if(r3.ok){ const d=await r3.json(); setCounts(p=>({...p,newsletter:(Array.isArray(d)?d:d.results||[]).length})); }
      } catch {}
    })();
  }, []);

  /* Notifs lazy */
  const loadNotifs = async () => {
    if (notifData.length > 0) return;
    setNotifLoading(true);
    try {
      const [r1,r2] = await Promise.allSettled([
        fetch(CONFIG.API_CONTACT_LIST).then(r=>r.ok?r.json():[]),
        fetch(CONFIG.API_POSTULANT_LIST).then(r=>r.ok?r.json():[]),
      ]);
      const c = r1.status==="fulfilled"?(Array.isArray(r1.value)?r1.value:r1.value?.results||[]):[];
      const p = r2.status==="fulfilled"?(Array.isArray(r2.value)?r2.value:r2.value?.results||[]):[];
      setNotifData([
        ...c.slice(0,3).map((x,i)=>({ text:x.nom||x.name||x.sujet||"Nouveau message",     detail:x.email||"", type:"contact",  read:i>1 })),
        ...p.slice(0,3).map((x,i)=>({ text:x.nom_complet||x.nom||"Nouveau postulant",      detail:x.formation||"",type:"candidat",read:i>0 })),
      ].slice(0,6));
    } catch {}
    finally { setNotifLoading(false); }
  };

  /* Clic extérieur notif */
  useEffect(() => {
    const h = e => { if(notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = path => location.pathname === path || location.pathname.startsWith(path+"/");
  const sideW = collapsed ? SIDEBAR_SM : SIDEBAR_W;

  /* Format heure */
  const heure = time.toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" });
  const dateStr = time.toLocaleDateString("fr-FR", { weekday:"short", day:"numeric", month:"short" });

  /* Affichage périmètre */
  const perimetre = user.division
    ? `Division ${user.division}`
    : user.antenne
      ? `Antenne ${user.antenne}`
      : null;

  return (
    <>
      <style>{STYLES}</style>

      {/* ══════════════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════════════ */}
      <aside
        className="na-root na-sidebar"
        style={{
          position:"fixed", top:0, left:0, bottom:0,
          width: sideW,
          background: C.sidebarBg,
          zIndex:300,
          display:"flex", flexDirection:"column",
          overflow:"hidden",
        }}
      >
        {/* Barre tricolore Guinée */}
        <div style={{ position:"absolute", top:0, left:0, right:0, height:3, display:"flex", flexShrink:0 }}>
          <div style={{ flex:1, background:"#E02020" }}/>
          <div style={{ flex:1, background:C.accent }}/>
          <div style={{ flex:1, background:C.success }}/>
        </div>

        {/* ── En-tête sidebar ── */}
        <div style={{
          padding: collapsed ? "22px 0 18px" : "22px 16px 18px",
          borderBottom:"1px solid rgba(255,255,255,.07)",
          flexShrink:0,
          display:"flex",
          alignItems:"center",
          justifyContent: collapsed ? "center" : "space-between",
          marginTop:3,
        }}>
          {!collapsed && (
            <Link to="/dashboardAdmin" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
              <img src={logo} alt="ONFPP" style={{ height:32, width:"auto", objectFit:"contain", flexShrink:0 }}/>
              <div style={{ minWidth:0 }}>
                <p style={{ fontFamily:"'Syne',sans-serif", fontSize:13.5, fontWeight:800, color:"#fff", letterSpacing:"0.04em", lineHeight:1 }}>ONFPP</p>
                <p style={{ fontSize:8, color:"rgba(255,255,255,.35)", letterSpacing:".14em", textTransform:"uppercase", marginTop:2 }}>Plateforme · Guinée</p>
              </div>
            </Link>
          )}
          {collapsed && (
            <Link to="/dashboardAdmin" style={{ textDecoration:"none" }}>
              <img src={logo} alt="ONFPP" style={{ height:28, width:"auto", objectFit:"contain" }}/>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{
              width:28, height:28, borderRadius:7, border:"1px solid rgba(255,255,255,.12)",
              background:"rgba(255,255,255,.06)", cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center",
              color:"rgba(255,255,255,.5)", transition:"all .15s", flexShrink:0,
              ...(collapsed ? {} : {}),
            }}
            onMouseEnter={e=>{ e.currentTarget.style.background="rgba(255,255,255,.14)"; e.currentTarget.style.color="#fff"; }}
            onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,.06)"; e.currentTarget.style.color="rgba(255,255,255,.5)"; }}
            title={collapsed ? "Déplier la sidebar" : "Replier la sidebar"}
          >
            {collapsed
              ? <PanelLeftOpen  size={13}/>
              : <PanelLeftClose size={13}/>
            }
          </button>
        </div>

        {/* ── Profil utilisateur ── */}
        {!collapsed && (
          <div style={{
            margin:"12px 12px 8px",
            padding:"12px",
            borderRadius:11,
            background:"rgba(255,255,255,.05)",
            border:"1px solid rgba(255,255,255,.08)",
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              {/* Avatar */}
              <div style={{
                width:36, height:36, borderRadius:10, flexShrink:0,
                background:`linear-gradient(135deg,${roleColor}60,${roleColor}30)`,
                border:`1.5px solid ${roleColor}50`,
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                <span style={{ fontSize:12, fontWeight:800, color:"#fff", letterSpacing:"-0.3px" }}>{initials}</span>
              </div>
              <div style={{ minWidth:0 }}>
                <p style={{ fontSize:12.5, fontWeight:700, color:"#fff", lineHeight:1.2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{displayName}</p>
                <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:3 }}>
                  <div style={{ width:5, height:5, borderRadius:"50%", background:C.emerald, flexShrink:0, boxShadow:`0 0 0 2px ${C.emerald}30` }}/>
                  <p style={{ fontSize:9, color:"rgba(255,255,255,.45)", fontWeight:600, textTransform:"uppercase", letterSpacing:".06em", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{roleLabel}</p>
                </div>
              </div>
            </div>
            {perimetre && (
              <div style={{
                marginTop:9, paddingTop:9, borderTop:"1px solid rgba(255,255,255,.07)",
                display:"flex", alignItems:"center", gap:6,
              }}>
                <div style={{ width:14, height:14, borderRadius:4, background:"rgba(255,255,255,.08)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <div style={{ width:5, height:5, borderRadius:1, background:"rgba(255,255,255,.4)" }}/>
                </div>
                <p style={{ fontSize:9.5, color:"rgba(255,255,255,.38)", fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{perimetre}</p>
              </div>
            )}
          </div>
        )}

        {/* Avatar seul (collapsed) */}
        {collapsed && (
          <div style={{ display:"flex", justifyContent:"center", padding:"10px 0 8px" }}>
            <div style={{
              width:36, height:36, borderRadius:10,
              background:`linear-gradient(135deg,${roleColor}60,${roleColor}30)`,
              border:`1.5px solid ${roleColor}50`,
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <span style={{ fontSize:12, fontWeight:800, color:"#fff" }}>{initials}</span>
            </div>
          </div>
        )}

        {/* ── Nav items ── */}
        <nav
          className="na-scroll"
          style={{
            flex:1, overflowY:"auto", overflowX:"hidden",
            padding:"4px 0 12px",
          }}
        >
          {!collapsed && (
            <p style={{
              fontSize:8.5, fontWeight:700, color:"rgba(255,255,255,.22)",
              textTransform:"uppercase", letterSpacing:".14em",
              padding:"8px 20px 4px",
            }}>Navigation</p>
          )}

          {navItems.map((item, i) => {
            const Icon   = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={i}
                to={item.path}
                className={`na-si${active ? " na-si-active" : ""}`}
                style={{
                  justifyContent: collapsed ? "center" : "flex-start",
                  margin: collapsed ? "1px auto" : "1px 8px",
                  width: collapsed ? 44 : "auto",
                  padding: collapsed ? "10px" : "9px 12px",
                }}
              >
                <Icon
                  size={15}
                  color={active ? "#fff" : "rgba(255,255,255,.55)"}
                  style={{ flexShrink:0 }}
                />
                <span
                  className="na-label"
                  style={{
                    fontSize:12.5,
                    fontWeight: active ? 700 : 450,
                    color: active ? "#fff" : C.textSide,
                    opacity: collapsed ? 0 : 1,
                    maxWidth: collapsed ? 0 : 180,
                  }}
                >
                  {item.label}
                </span>

                {/* Tooltip quand collapsed */}
                {collapsed && <span className="na-tip">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* ── Déconnexion ── */}
        <div style={{
          padding: collapsed ? "10px 0 16px" : "10px 8px 16px",
          borderTop:"1px solid rgba(255,255,255,.07)",
          flexShrink:0,
        }}>
          <button
            onClick={handleLogout}
            className="na-si"
            style={{
              width: collapsed ? 44 : "100%",
              justifyContent: collapsed ? "center" : "flex-start",
              margin: collapsed ? "0 auto" : "0",
              padding: collapsed ? "10px" : "9px 12px",
              background:"rgba(185,28,28,.12)",
              border:"1px solid rgba(185,28,28,.20)",
            }}
            onMouseEnter={e=>{ e.currentTarget.style.background="rgba(185,28,28,.22)"; e.currentTarget.style.transform="translateX(2px)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.background="rgba(185,28,28,.12)"; e.currentTarget.style.transform="translateX(0)"; }}
          >
            <LogOut size={14} color="#F87171" style={{ flexShrink:0 }}/>
            <span
              className="na-label"
              style={{
                fontSize:12.5, fontWeight:600, color:"#F87171",
                opacity: collapsed ? 0 : 1,
                maxWidth: collapsed ? 0 : 180,
              }}
            >
              Déconnexion
            </span>
            {collapsed && <span className="na-tip" style={{ background:"#B91C1C" }}>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════
          TOPBAR
      ══════════════════════════════════════════════ */}
      <header
        className="na-root"
        style={{
          position:"fixed",
          top:0,
          left: sideW,
          right:0,
          height:58,
          background:"rgba(255,255,255,0.96)",
          backdropFilter:"blur(16px) saturate(1.5)",
          borderBottom:`1px solid ${C.divider}`,
          zIndex:200,
          display:"flex", alignItems:"center",
          padding:"0 24px",
          justifyContent:"space-between",
          transition:"left .28s cubic-bezier(.22,1,.36,1)",
        }}
      >
        {/* ── Gauche : page title + fil d'ariane ── */}
        <div style={{ display:"flex", alignItems:"center", gap:12, minWidth:0 }}>
          {/* Indicateur page active */}
          <div>
            <p style={{
              fontSize:14, fontWeight:700, color:C.textPri,
              lineHeight:1.1, letterSpacing:"-0.2px",
              whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:280,
            }}>
              {navItems.find(i => isActive(i.path))?.label || "Tableau de bord"}
            </p>
            <p style={{ fontSize:10, color:C.textMuted, marginTop:2, fontWeight:500 }}>ONFPP · Plateforme nationale</p>
          </div>
        </div>

        {/* ── Droite : heure + notifs + profil ── */}
        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>

          {/* Date/heure */}
          <div style={{
            display:"flex", flexDirection:"column", alignItems:"flex-end",
            padding:"4px 12px",
            borderRadius:8,
            background:C.iceBlue+"22",
            border:`1px solid ${C.iceBlue}`,
          }}>
            <span style={{ fontSize:13, fontWeight:700, color:C.textPri, lineHeight:1, letterSpacing:"-0.3px" }}>{heure}</span>
            <span style={{ fontSize:9, color:C.textMuted, fontWeight:500, marginTop:1, textTransform:"capitalize" }}>{dateStr}</span>
          </div>

          {/* Séparateur */}
          <div style={{ width:1, height:20, background:C.divider }}/>

          {/* Notifications */}
          <div ref={notifRef} style={{ position:"relative" }}>
            <button
              className={`na-tb-btn${showNotif?" active":""}`}
              onClick={() => { setShowNotif(v=>!v); if(!notifData.length) loadNotifs(); }}
            >
              <Bell size={15}/>
            </button>

            {totalNotifs > 0 && (
              <span className="na-badge" style={{
                position:"absolute", top:-4, right:-4,
                minWidth:16, height:16, borderRadius:9,
                background:C.accent, color:"#fff",
                fontSize:8, fontWeight:800,
                display:"flex", alignItems:"center", justifyContent:"center", padding:"0 4px",
                border:"2px solid #fff",
              }}>
                {totalNotifs > 99 ? "99+" : totalNotifs}
              </span>
            )}

            {showNotif && (
              <div className="na-panel" style={{
                position:"absolute", top:44, right:0, width:320,
                background:"#fff",
                border:`1px solid ${C.divider}`,
                borderTop:`3px solid ${C.accent}`,
                borderRadius:"0 0 14px 14px",
                boxShadow:"0 20px 60px rgba(8,18,46,.15)",
                zIndex:500, overflow:"hidden",
              }}>
                {/* Header panel */}
                <div style={{ padding:"13px 16px 11px", borderBottom:`1px solid ${C.divider}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                    <Bell size={13} color={C.accent}/>
                    <p style={{ fontSize:13, fontWeight:700, color:C.textPri }}>Notifications</p>
                    {totalNotifs > 0 && (
                      <span style={{ fontSize:9, color:C.accent, fontWeight:700, background:`${C.accent}18`, padding:"2px 7px", borderRadius:20 }}>
                        {totalNotifs}
                      </span>
                    )}
                  </div>
                  <button onClick={()=>setShowNotif(false)} style={{ width:22, height:22, borderRadius:5, background:C.divider, border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                    <X size={10} color={C.textMuted}/>
                  </button>
                </div>

                <div style={{ maxHeight:300, overflowY:"auto" }}>
                  {notifLoading && (
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"20px", gap:8 }}>
                      <div className="na-spin" style={{ width:18, height:18, borderRadius:"50%", border:`2px solid ${C.iceBlue}`, borderTopColor:C.accent }}/>
                      <span style={{ fontSize:11.5, color:C.textMuted }}>Chargement…</span>
                    </div>
                  )}
                  {!notifLoading && <>
                    {counts.contacts > 0 && (
                      <Link to="/contacts" onClick={()=>setShowNotif(false)} style={{ textDecoration:"none" }}>
                        <div className="na-ni" style={{ padding:"11px 16px", borderBottom:`1px solid ${C.divider}`, display:"flex", gap:10, alignItems:"flex-start", background:`${C.danger}05` }}>
                          <div style={{ width:6, height:6, borderRadius:"50%", background:C.danger, flexShrink:0, marginTop:5, boxShadow:`0 0 0 3px ${C.danger}20` }}/>
                          <div style={{ flex:1 }}>
                            <p style={{ fontSize:12, fontWeight:700, color:C.textPri }}>Messages en attente</p>
                            <p style={{ fontSize:10.5, color:C.textMuted, marginTop:1 }}>{counts.contacts} non traité(s)</p>
                          </div>
                          <span style={{ fontSize:8.5, color:C.danger, fontWeight:700, background:`${C.danger}12`, padding:"2px 6px", borderRadius:5, flexShrink:0 }}>Urgent</span>
                        </div>
                      </Link>
                    )}
                    {counts.community > 0 && (
                      <Link to="/listeCandidats" onClick={()=>setShowNotif(false)} style={{ textDecoration:"none" }}>
                        <div className="na-ni" style={{ padding:"11px 16px", borderBottom:`1px solid ${C.divider}`, display:"flex", gap:10, alignItems:"flex-start", background:`${C.blue}05` }}>
                          <div style={{ width:6, height:6, borderRadius:"50%", background:C.blue, flexShrink:0, marginTop:5, boxShadow:`0 0 0 3px ${C.blue}20` }}/>
                          <div style={{ flex:1 }}>
                            <p style={{ fontSize:12, fontWeight:700, color:C.textPri }}>Nouvelles candidatures</p>
                            <p style={{ fontSize:10.5, color:C.textMuted, marginTop:1 }}>{counts.community} à examiner</p>
                          </div>
                        </div>
                      </Link>
                    )}
                    {counts.newsletter > 0 && (
                      <Link to="/newsletter" onClick={()=>setShowNotif(false)} style={{ textDecoration:"none" }}>
                        <div className="na-ni" style={{ padding:"11px 16px", borderBottom:`1px solid ${C.divider}`, display:"flex", gap:10, alignItems:"flex-start", background:`${C.purple}05` }}>
                          <div style={{ width:6, height:6, borderRadius:"50%", background:C.purple, flexShrink:0, marginTop:5, boxShadow:`0 0 0 3px ${C.purple}20` }}/>
                          <div style={{ flex:1 }}>
                            <p style={{ fontSize:12, fontWeight:700, color:C.textPri }}>Abonnements newsletter</p>
                            <p style={{ fontSize:10.5, color:C.textMuted, marginTop:1 }}>{counts.newsletter} nouvel(aux) abonné(s)</p>
                          </div>
                        </div>
                      </Link>
                    )}
                    {notifData.map((n,i) => (
                      <div key={i} className="na-ni" style={{ padding:"10px 16px", borderBottom:i<notifData.length-1?`1px solid ${C.divider}`:"none", display:"flex", gap:10, alignItems:"flex-start", background:n.read?"transparent":`${C.blue}04` }}>
                        <div style={{ width:6, height:6, borderRadius:"50%", flexShrink:0, marginTop:5, background:n.read?"#CBD5E1":C.blue }}/>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontSize:11.5, fontWeight:n.read?450:700, color:C.textPri, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{n.text}</p>
                          {n.detail && <p style={{ fontSize:10, color:C.textMuted, marginTop:1 }}>{n.detail}</p>}
                        </div>
                        <span style={{ fontSize:8, color:n.type==="contact"?C.accent:C.blue, background:n.type==="contact"?`${C.accent}12`:`${C.blue}10`, padding:"2px 6px", borderRadius:4, fontWeight:700, flexShrink:0 }}>{n.type}</span>
                      </div>
                    ))}
                    {totalNotifs === 0 && notifData.length === 0 && (
                      <div style={{ textAlign:"center", padding:"24px 16px" }}>
                        <CheckCircle2 size={22} color={C.success} style={{ margin:"0 auto 8px", display:"block", opacity:.5 }}/>
                        <p style={{ fontSize:12, color:C.textMuted, fontWeight:600 }}>Aucune notification</p>
                      </div>
                    )}
                  </>}
                </div>
              </div>
            )}
          </div>

          {/* Séparateur */}
          <div style={{ width:1, height:20, background:C.divider }}/>

          {/* Chip profil */}
          <div style={{
            display:"flex", alignItems:"center", gap:9,
            padding:"5px 12px 5px 5px",
            borderRadius:10,
            background:C.surface || "#F7F9FF",
            border:`1px solid ${C.divider}`,
            cursor:"default",
          }}>
            {/* Avatar mini */}
            <div style={{
              width:28, height:28, borderRadius:8, flexShrink:0,
              background:`linear-gradient(135deg,${C.sidebarBg},${C.blue})`,
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <span style={{ fontSize:10, fontWeight:800, color:"#fff", letterSpacing:"-0.3px" }}>{initials}</span>
            </div>
            <div style={{ minWidth:0 }}>
              <p style={{ fontSize:11.5, fontWeight:700, color:C.textPri, lineHeight:1.2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:120 }}>{displayName}</p>
              <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:2 }}>
                <div style={{ width:5, height:5, borderRadius:"50%", background:roleColor, flexShrink:0 }}/>
                <p style={{ fontSize:8.5, fontWeight:600, color:C.textMuted, textTransform:"uppercase", letterSpacing:".05em", whiteSpace:"nowrap" }}>{roleLabel}</p>
              </div>
            </div>
          </div>

        </div>
      </header>
    </>
  );
};

export default NavAdmin;