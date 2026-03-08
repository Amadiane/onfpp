import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, Users, GraduationCap, Building2,
  ClipboardList, BarChart3, Award, Settings, LogOut, Menu, X,
  ChevronDown, BarChart2, Bell, MapPin,
  FileText, UserCheck, CalendarDays, Package, Layers,
  CheckCircle2, Briefcase, PieChart, UserCog, Clock,
  AlertTriangle, Globe, AlertCircle,
} from "lucide-react";
import CONFIG from "../../config/config.js";
import logo from "../../assets/logo.png";

/* ══════════════════════════════════════════════════
   PALETTE — Institutionnel national, sobre et fort
══════════════════════════════════════════════════ */
const C = {
  bg:        "#FFFFFF",
  surface:   "#F7F9FF",
  navy:      "#08122E",
  navyMid:   "#0D1B5E",
  blue:      "#1A3BD4",
  blueSoft:  "#2E50E8",
  sky:       "#4F72FF",
  iceBlue:   "#D6E0FF",
  divider:   "#E8ECFA",
  textPri:   "#08122E",
  textSub:   "#3B4F82",
  textMuted: "#7B8EC4",
  accent:    "#E8A000",
  accentWarm:"#F5B422",
  success:   "#047857",
  emerald:   "#10B981",
  purple:    "#5B21B6",
  danger:    "#B91C1C",
  shadow:    "rgba(8,18,46,0.10)",
};

/* ══════════════════════════════════════════════════
   RÔLES
══════════════════════════════════════════════════ */
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
};

const ROLE_BADGE = {
  DG:        { bg:"#EEF2FF", text:"#1A3BD4", dot:"#1A3BD4" },
  CD:        { bg:"#EEF2FF", text:"#1A3BD4", dot:"#1A3BD4" },
  DR:        { bg:"#F0FDF4", text:"#047857", dot:"#10B981" },
  CC:        { bg:"#FFF7ED", text:"#B45309", dot:"#F59E0B" },
  FORMATEUR: { bg:"#F0F9FF", text:"#0369A1", dot:"#0EA5E9" },
  SUPERADMIN:{ bg:"#FFF1F2", text:"#B91C1C", dot:"#F43F5E" },
};
const rb = (role) => ROLE_BADGE[role] || ROLE_BADGE.DG;

/* ══════════════════════════════════════════════════
   buildNavCategories
══════════════════════════════════════════════════ */
const buildNavCategories = (role, counts = {}) => {
  const all = [
    { title:"Formations", color:C.sky, icon:BookOpen, roles:["DG","CD","DR","CC","FORMATEUR"], items:[
      { path:"/formations",    label:"Catalogue formations",  icon:BookOpen,     roles:["DG","CD","DR","CC","FORMATEUR"] },
      { path:"/sessions",      label:"Sessions planifiées",   icon:CalendarDays, roles:["DG","CD","DR","CC","FORMATEUR"] },
      { path:"/certifications",label:"Certifications",        icon:Award,        roles:["DG","CD","DR","CC","FORMATEUR"] },
    ]},
    { title:"Apprenants", color:"#0369A1", icon:GraduationCap, roles:["DG","CD","DR","CC","FORMATEUR"], items:[
      { path:"/inscription",    label:"Inscriptions",          icon:GraduationCap, roles:["DG","CD","DR","CC","FORMATEUR"] },
      { path:"/formation",     label:"Formation",     icon:GraduationCap, roles:["DG","CD","DR","CC","FORMATEUR"] },
      { path:"/listeApprenants",          label:"Liste Apprenants",     icon:ClipboardList, roles:["DG","CD","DR","CC","FORMATEUR"] },
      
    ]},
    { title:"Présences & Notes", color:C.success, icon:ClipboardList, roles:["CC","FORMATEUR"], items:[
      { path:"/presences",   label:"Feuilles de présence",  icon:CalendarDays,  roles:["CC","FORMATEUR"] },
      { path:"/evaluations", label:"Notes & évaluations",   icon:Award,         roles:["CC","FORMATEUR"] },
      { path:"/discipline",  label:"Discipline",            icon:AlertTriangle, roles:["CC","FORMATEUR"] },
    ]},
    { title:"Suivi complet", color:C.success, icon:ClipboardList, roles:["DG","CD","DR"], items:[
      { path:"/presences",         label:"Présences",               icon:CalendarDays, roles:["DG","CD","DR"] },
      { path:"/suiviEvaluation",   label:"Évaluations",             icon:Award,        roles:["DG","CD","DR"] },
      { path:"/attestations",      label:"Attestations PDF",        icon:FileText,     roles:["DG","CD","DR"] },
      { path:"/enquete-insertion", label:"Enquête insertion 3 mois",icon:Clock,        roles:["DG","CD","DR"] },
     
    ]},
    { title:"Fin de session", color:C.accent, icon:CheckCircle2, roles:["CC","FORMATEUR"], items:[
      { path:"/resultats",         label:"Résultats finaux",        icon:CheckCircle2, roles:["CC","FORMATEUR"] },
      { path:"/attestations",      label:"Attestations PDF",        icon:FileText,     roles:["CC","FORMATEUR"] },
      { path:"/enquete-insertion", label:"Enquête insertion 3 mois",icon:Clock,        roles:["CC"] },
    ]},
    { title:"Entreprises", color:C.navyMid, icon:Briefcase, roles:["DG","CD","DR"], items:[
      { path:"/entreprise",   label:"Base des entreprises", icon:Briefcase, roles:["DG","CD","DR"] },
      { path:"/formationContinue", label:"Formation DFC",      icon:Package,   roles:["DG","CD","DR"] },
      { path:"/formateurs", label:"Formateurs",      icon:Package,   roles:["DG","CD","DR"] },
    ]},
    // { title:"Rapports", color:C.purple, icon:BarChart3, roles:["DG","CD","DR","CC"], items:[
    //   { path:"/statistiques",      label:"Statistiques globales",   icon:PieChart,  roles:["DG","CD"] },
    //   { path:"/statistiques",      label:"Statistiques régionales", icon:PieChart,  roles:["DR"] },
    //   { path:"/statistiques",      label:"Statistiques du centre",  icon:BarChart3, roles:["CC"] },
    //   { path:"/dashboardRegional", label:"Tableau régional",        icon:MapPin,    roles:["DG","CD","DR"] },
    //   { path:"/rapports",          label:"Rapports & exports",      icon:FileText,  roles:["DG","CD","DR","CC"] },
    // ]},
    // { title:"Centres & Équipes", color:C.purple, icon:Building2, roles:["DG","CD","DR"], items:[
    //   { path:"/centresFormation", label:"Centres de formation", icon:Building2, roles:["DG","CD","DR"] },
    //   { path:"/teamMessage",      label:"Équipe & formateurs",  icon:Users,     roles:["DG","CD","DR","CC"] },
    //   { path:"/partnerPost",      label:"Partenaires",          icon:Package,   roles:["DG","CD"] },
    // ]},
    { title:"Administration", color:"#64748B", icon:Settings, roles:["DG","CD","SUPERADMIN"], items:[
      { path:"/parametres", label:"Division Planification",   icon:Settings, roles:["DG","CD","SUPERADMIN"] },
      { path:"/parametres", label:"Division Apprentissage",   icon:Settings, roles:["DG","CD","SUPERADMIN"] },
      { path:"/parametres", label:"Division Suivi Evaluation",   icon:Settings, roles:["DG","CD","SUPERADMIN"] },
      { path:"/addUser",    label:"Gestion utilisateurs", icon:UserCog,  roles:["DG","CD","SUPERADMIN"] },
      { path:"/homePost",   label:"Contenu site public",  icon:Layers,   roles:["DG","CD"] },
    ]},
  ];
  return all
    .filter(c => c.roles.includes(role))
    .map(c => ({
      ...c,
      items: c.items
        .filter(i => i.roles.includes(role))
        .filter((i, idx, a) => a.findIndex(x => x.path===i.path && x.label===i.label)===idx),
    }))
    .filter(c => c.items.length > 0);
};

/* ══════════════════════════════════════════════════
   getStoredUser
══════════════════════════════════════════════════ */
const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    if (raw) {
      const u = JSON.parse(raw);
      const fn = u.first_name || u.firstName || "";
      const ln = u.last_name  || u.lastName  || "";
      const displayName = fn ? `${fn}${ln?" "+ln:""}` : u.username || u.email || "Admin";
      return { ...u, displayName, username: u.username || u.email || displayName };
    }
    const token = localStorage.getItem("access");
    if (token) {
      const p = JSON.parse(atob(token.split(".")[1]));
      const fn = p.first_name || "";
      const ln = p.last_name  || "";
      const displayName = fn ? `${fn}${ln?" "+ln:""}` : p.username || p.email || "Admin";
      return { username:p.username||p.email||displayName, displayName, role:p.role||"DG", niveau:p.niveau??0, region:p.region||null, centre:p.centre||null };
    }
  } catch {}
  return { username:"Admin", displayName:"Admin", role:"DG", niveau:0 };
};

/* ══════════════════════════════════════════════════
   CSS — Syne + DM Sans, ultra moderne national
══════════════════════════════════════════════════ */
const NAV_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

  .na-root * { box-sizing:border-box; }
  .na-root, .na-root *:not(style) { font-family:'DM Sans',sans-serif !important; -webkit-font-smoothing:antialiased; }

  /* Nav button */
  .na-btn {
    position:relative; cursor:pointer; border:none; background:transparent;
    color:${C.textSub}; font-weight:500; font-size:13px; letter-spacing:-0.1px;
    transition:color .16s ease;
    display:flex; align-items:center; gap:5px; padding:7px 10px; border-radius:8px;
    white-space:nowrap;
  }
  .na-btn:hover { color:${C.navy}; background:${C.surface}; }
  .na-btn.na-open, .na-btn.na-active { color:${C.navy}; font-weight:700; }

  /* Underline indicator */
  .na-btn::after {
    content:''; position:absolute; bottom:-1px; left:10px; right:10px; height:2px;
    background:${C.blue}; border-radius:2px 2px 0 0;
    transform:scaleX(0); transform-origin:center;
    transition:transform .22s cubic-bezier(.34,1.56,.64,1);
  }
  .na-btn.na-active::after { transform:scaleX(1); }

  /* Dropdown items */
  .na-item {
    display:flex; align-items:center; justify-content:space-between;
    padding:9px 16px; text-decoration:none; border-left:2px solid transparent;
    transition:background .12s, border-color .12s, padding-left .15s;
    cursor:pointer;
  }
  .na-item:hover { background:${C.surface}; border-left-color:${C.blue}; padding-left:20px; }
  .na-item.na-item-active { background:${C.surface}; border-left-color:${C.blue}; }

  /* Icon buttons right side */
  .na-icon {
    width:34px; height:34px; border-radius:8px; border:none; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    background:transparent; color:${C.textMuted};
    transition:all .16s cubic-bezier(.34,1.2,.64,1);
  }
  .na-icon:hover { background:${C.surface}; color:${C.navy}; transform:translateY(-1px); }
  .na-icon.na-icon-on {
    background:${C.navy}; color:#fff;
    box-shadow:0 4px 14px ${C.shadow};
  }

  /* Badge */
  @keyframes naPulse { 0%,100%{box-shadow:0 0 0 0 rgba(232,160,0,.45)} 60%{box-shadow:0 0 0 5px rgba(232,160,0,0)} }
  .na-badge { animation:naPulse 2.6s ease infinite; }

  /* Dropdown appear */
  @keyframes naDropIn {
    from { opacity:0; transform:translateX(-50%) translateY(-8px) scale(.97); }
    to   { opacity:1; transform:translateX(-50%) translateY(0) scale(1); }
  }
  .na-drop { animation:naDropIn .19s cubic-bezier(.22,1,.36,1) both; }

  /* Panel appear */
  @keyframes naPanelIn {
    from { opacity:0; transform:translateY(-10px) scale(.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  .na-panel { animation:naPanelIn .19s cubic-bezier(.22,1,.36,1) both; }

  /* Mobile drawer */
  @keyframes naDrawer {
    from { opacity:0; transform:translateX(28px); }
    to   { opacity:1; transform:translateX(0); }
  }
  .na-drawer { animation:naDrawer .24s cubic-bezier(.22,1,.36,1) both; }

  /* Spinner */
  @keyframes naSpin { to { transform:rotate(360deg); } }
  .na-spin { animation:naSpin .75s linear infinite; }

  /* KPI hover */
  .na-kpi { transition:transform .15s, box-shadow .15s; }
  .na-kpi:hover { transform:translateY(-2px); box-shadow:0 8px 24px ${C.shadow} !important; }

  /* Notif hover */
  .na-notif { transition:background .11s; }
  .na-notif:hover { background:${C.surface} !important; }

  /* Mobile item */
  .na-mob { transition:background .12s, border-color .12s; }
  .na-mob:hover { background:${C.surface} !important; }

  /* Responsive */
  @media(max-width:1279px) { .na-desk { display:none !important; } }
  @media(min-width:1280px) { .na-mob-only { display:none !important; } }
`;

/* ══════════════════════════════════════════════════
   COMPOSANT
══════════════════════════════════════════════════ */
const NavAdmin = () => {
  const location = useLocation();
  const navigate  = useNavigate();

  const [counts,       setCounts]       = useState({ contacts:0, community:0, newsletter:0 });
  const [showVG,       setShowVG]       = useState(false);
  const [showNotif,    setShowNotif]    = useState(false);
  const [showMobile,   setShowMobile]   = useState(false);
  const [activeDrop,   setActiveDrop]   = useState(null);
  const [scrolled,     setScrolled]     = useState(false);
  const [vgData,       setVgData]       = useState(null);
  const [vgLoading,    setVgLoading]    = useState(false);
  const [notifData,    setNotifData]    = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);

  const vgRef    = useRef(null);
  const notifRef = useRef(null);

  const user        = getStoredUser();
  const role        = user.role || "DG";
  const roleLabel   = ROLE_LABELS[role] || role;
  const displayName = user.displayName || user.username || "Admin";
  const initials    = displayName.split(" ").filter(Boolean).map(w=>w[0]).slice(0,2).join("").toUpperCase() || "?";
  const badge       = rb(role);

  /* scroll */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 6);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* counts */
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

  /* vue globale lazy */
  const loadVG = async () => {
    if (vgData) return;
    setVgLoading(true);
    try {
      const eps = [
        { key:"apprenants",  url:CONFIG.API_APPRENANT_LIST  || "/api/apprenants/"     },
        { key:"sessions",    url:CONFIG.API_SESSION_LIST    || "/api/sessions/"        },
        { key:"formations",  url:CONFIG.API_FORMATION_LIST  || "/api/formations/"      },
        { key:"presences",   url:CONFIG.API_PRESENCE_LIST   || "/api/presences/"       },
        { key:"evaluations", url:CONFIG.API_EVALUATION_LIST || "/api/evaluations/"     },
        { key:"centres",     url:CONFIG.API_CENTRE_LIST     || "/api/centresFormation/" },
        { key:"formateurs",  url:CONFIG.API_FORMATEUR_LIST  || "/api/formateurs/"      },
        { key:"alertes",     url:CONFIG.API_CONTACT_LIST    || "/api/contacts/"        },
      ];
      const res = await Promise.allSettled(eps.map(e=>fetch(e.url).then(r=>r.ok?r.json():null)));
      const d = {};
      res.forEach((r,i) => {
        if(r.status==="fulfilled"&&r.value){const v=r.value; d[eps[i].key]=Array.isArray(v)?v.length:(v.count??(v.results?.length??0));}
        else d[eps[i].key]=null;
      });
      setVgData(d);
    } catch {}
    finally { setVgLoading(false); }
  };

  /* notifs lazy */
  const loadNotifs = async () => {
    if (notifData.length>0) return;
    setNotifLoading(true);
    try {
      const [r1,r2] = await Promise.allSettled([
        fetch(CONFIG.API_CONTACT_LIST).then(r=>r.ok?r.json():[]),
        fetch(CONFIG.API_POSTULANT_LIST).then(r=>r.ok?r.json():[]),
      ]);
      const c = r1.status==="fulfilled"?(Array.isArray(r1.value)?r1.value:r1.value?.results||[]):[];
      const p = r2.status==="fulfilled"?(Array.isArray(r2.value)?r2.value:r2.value?.results||[]):[];
      setNotifData([
        ...c.slice(0,4).map((x,i)=>({ text:x.nom||x.name||x.sujet||"Nouveau message", detail:x.email||x.telephone||"", time:x.created_at||x.date||"", type:"contact", read:i>1 })),
        ...p.slice(0,3).map((x,i)=>({ text:x.nom_complet||x.nom||x.name||"Nouveau postulant", detail:x.formation||x.email||"", time:x.created_at||x.date||"", type:"postulant", read:i>0 })),
      ].slice(0,6));
    } catch {}
    finally { setNotifLoading(false); }
  };

  /* clic extérieur */
  useEffect(() => {
    const h = e => {
      if(vgRef.current    && !vgRef.current.contains(e.target))    setShowVG(false);
      if(notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const totalNotifs = counts.contacts + counts.community + counts.newsletter;
  const unread      = notifData.filter(n=>!n.read).length || totalNotifs;
  const cats        = buildNavCategories(role, counts);

  /* KPIs */
  const getKpis = () => {
    if(!vgData) return [];
    const f = v => v===null?"—":String(v);
    const all = [
      { label:"Apprenants actifs",   value:f(vgData.apprenants),  icon:GraduationCap, color:C.blue,    path:"/apprenants" },
      { label:"Sessions planifiées", value:f(vgData.sessions),    icon:CalendarDays,  color:C.success, path:"/sessions" },
      { label:"Formations actives",  value:f(vgData.formations),  icon:BookOpen,      color:C.purple,  path:"/formations" },
      { label:"Formateurs",          value:f(vgData.formateurs),  icon:UserCog,       color:C.sky,     path:"/teamMessage" },
      { label:"Centres / Antennes",  value:f(vgData.centres),     icon:Building2,     color:C.accent,  path:"/centresFormation" },
      { label:"Présences enreg.",    value:f(vgData.presences),   icon:CheckCircle2,  color:C.success, path:"/presences" },
      { label:"Évaluations",         value:f(vgData.evaluations), icon:Award,         color:C.purple,  path:"/evaluations" },
      { label:"Messages reçus",      value:f(vgData.alertes),     icon:AlertCircle,   color:C.danger,  path:"/contacts" },
    ];
    const hide = { CC:["Centres / Antennes"], FORMATEUR:["Centres / Antennes","Formateurs"] }[role]||[];
    return all.filter(k=>!hide.includes(k.label));
  };
  const kpis = getKpis();
  const alertes = [
    counts.contacts   > 0 && { label:`${counts.contacts} message(s) en attente`,     color:C.danger, icon:AlertCircle, path:"/contacts" },
    counts.community  > 0 && { label:`${counts.community} candidature(s) à traiter`, color:C.accent, icon:Users,       path:"/listeCandidats" },
    counts.newsletter > 0 && { label:`${counts.newsletter} abonnement(s) newsletter`, color:C.purple, icon:Bell,        path:"/newsletter" },
  ].filter(Boolean);

  const isActive = path => location.pathname === path;

  /* ─────────── SÉPARATEUR VERTICAL ─────────── */
  const Sep = () => (
    <div style={{ width:1, height:18, background:C.divider, margin:"0 2px", flexShrink:0 }}/>
  );

  return (
    <>
      <style>{NAV_CSS}</style>

      {/* ══════════════════════════════════════
          BARRE PRINCIPALE
      ══════════════════════════════════════ */}
      <nav className="na-root" style={{
        position:"fixed", top:0, left:0, right:0,
        height: scrolled ? 60 : 66,
        background: scrolled
          ? "rgba(255,255,255,0.97)"
          : "#fff",
        borderBottom:`1px solid ${scrolled ? C.iceBlue : C.divider}`,
        boxShadow: scrolled
          ? `0 1px 0 rgba(255,255,255,1), 0 4px 28px ${C.shadow}`
          : "none",
        zIndex:200,
        backdropFilter:"blur(20px) saturate(1.6)",
        transition:"height .28s cubic-bezier(.22,1,.36,1), box-shadow .28s, border-color .28s",
      }}>

        {/* ── Barre tricolore Guinée : Rouge · Jaune · Vert ── */}
        <div style={{
          position:"absolute", top:0, left:0, right:0, height:3,
          display:"flex", pointerEvents:"none",
          opacity: scrolled ? 1 : 0.75,
          transition:"opacity .3s",
        }}>
          <div style={{ flex:1, background:"#E02020" }}/>
          <div style={{ flex:1, background:C.accent }}/>
          <div style={{ flex:1, background:C.success }}/>
        </div>

        <div style={{
          height:"100%", maxWidth:1920, margin:"0 auto",
          padding:"0 24px",
          display:"flex", alignItems:"center", justifyContent:"space-between", gap:8,
        }}>

          {/* ── LOGO ── */}
          <Link to="/dashboardAdmin" style={{ textDecoration:"none", flexShrink:0, display:"flex", alignItems:"center", gap:10 }}>
            <img
              src={logo} alt="ONFPP"
              style={{
                height: scrolled ? 32 : 38,
                width:"auto", objectFit:"contain",
                transition:"height .28s cubic-bezier(.22,1,.36,1)",
              }}
            />
            {/* <div className="na-desk" style={{ display:"flex", flexDirection:"column", lineHeight:1 }}>
              <span style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:800, color:C.navy, letterSpacing:"0.02em" }}>ONFPP</span>
              <span style={{ fontSize:8.5, fontWeight:500, color:C.textMuted, letterSpacing:"0.16em", textTransform:"uppercase", marginTop:2 }}>Plateforme Nationale · Guinée</span>
            </div> */}
          </Link>

          {/* ── NAV DESKTOP ── */}
          <div className="na-desk" style={{
            display:"flex", alignItems:"center", flex:1, justifyContent:"center",
            gap:0, height:"100%",
          }}>

            {/* Dashboard */}
            <Link to="/dashboardAdmin" style={{ textDecoration:"none" }}>
              <div className={`na-btn${isActive("/dashboardAdmin")?" na-active":""}`}>
                <LayoutDashboard size={13}/>
                <span>Tableau de bord</span>
              </div>
            </Link>

            <Sep/>

            {/* Catégories */}
            {cats.map((cat, idx) => {
              const open    = activeDrop === idx;
              const CatIcon = cat.icon;
              return (
                <div key={idx} style={{ position:"relative", height:"100%", display:"flex", alignItems:"center" }}>
                  <button
                    className={`na-btn${open?" na-open":""}`}
                    onClick={() => setActiveDrop(open ? null : idx)}
                  >
                    <CatIcon size={13}/>
                    <span>{cat.title}</span>
                    <ChevronDown
                      size={11}
                      style={{
                        marginLeft:1, opacity:.5,
                        transition:"transform .22s cubic-bezier(.34,1.56,.64,1)",
                        transform: open ? "rotate(180deg)" : "rotate(0)",
                      }}
                    />
                  </button>

                  {/* ── DROPDOWN ── */}
                  {open && (
                    <div className="na-drop" style={{
                      position:"absolute",
                      top:"calc(100% + 2px)",
                      left:"50%",
                      transform:"translateX(-50%)",
                      minWidth:256,
                      maxHeight:"calc(100vh - 80px)",
                      overflowY:"auto",
                      background:"#fff",
                      border:`1px solid ${C.divider}`,
                      borderTop:`3px solid ${cat.color}`,
                      borderRadius:"0 0 14px 14px",
                      boxShadow:"0 20px 60px rgba(8,18,46,.13), 0 4px 16px rgba(8,18,46,.06)",
                      zIndex:400,
                    }}>

                      {/* Header catégorie */}
                      <div style={{
                        padding:"13px 16px 11px",
                        borderBottom:`1px solid ${C.divider}`,
                        display:"flex", alignItems:"center", gap:10,
                        background:`${cat.color}07`,
                      }}>
                        <div style={{ width:30, height:30, borderRadius:8, background:`${cat.color}18`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          <CatIcon size={14} color={cat.color}/>
                        </div>
                        <div>
                          <p style={{ fontSize:12.5, fontWeight:700, color:C.navy, letterSpacing:"-0.1px" }}>{cat.title}</p>
                          <p style={{ fontSize:9.5, color:C.textMuted, marginTop:1.5 }}>{cat.items.length} section{cat.items.length>1?"s":""}</p>
                        </div>
                      </div>

                      {/* Items */}
                      <div style={{ padding:"5px 0 7px" }}>
                        {cat.items.map((item, i) => {
                          const ItemIcon = item.icon;
                          const active   = isActive(item.path);
                          return (
                            <Link
                              key={i}
                              to={item.path}
                              onClick={() => setActiveDrop(null)}
                              className={`na-item${active?" na-item-active":""}`}
                              style={{ textDecoration:"none", background: active ? C.surface : "transparent" }}
                            >
                              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                                <div style={{
                                  width:28, height:28, borderRadius:7, flexShrink:0,
                                  background: active ? `${cat.color}18` : `${cat.color}0C`,
                                  display:"flex", alignItems:"center", justifyContent:"center",
                                }}>
                                  <ItemIcon size={13} color={active ? cat.color : C.textMuted}/>
                                </div>
                                <span style={{ fontSize:12.5, fontWeight:active?700:450, color:active?C.navy:C.textSub }}>
                                  {item.label}
                                </span>
                              </div>
                              {item.count > 0 && (
                                <span style={{
                                  background: active ? cat.color : C.surface,
                                  color: active ? "#fff" : C.textSub,
                                  border:`1px solid ${active?cat.color:C.divider}`,
                                  borderRadius:20, padding:"2px 8px",
                                  fontSize:9.5, fontWeight:700,
                                }}>{item.count}</span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── DROITE ── */}
          <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>

            {/* Vue Globale */}
            <div ref={vgRef} style={{ position:"relative" }}>
              <button
                className={`na-icon${showVG?" na-icon-on":""}`}
                title="Vue globale de la plateforme"
                onClick={() => { setShowVG(v=>!v); setShowNotif(false); if(!vgData) loadVG(); }}
              >
                <BarChart2 size={15}/>
              </button>

              {showVG && (
                <div className="na-panel" style={{
                  position:"absolute", top:44, right:0,
                  width:380, background:"#fff",
                  border:`1px solid ${C.divider}`,
                  borderTop:`3px solid ${C.navy}`,
                  borderRadius:"0 0 16px 16px",
                  boxShadow:"0 24px 64px rgba(8,18,46,.15)",
                  zIndex:500, overflow:"hidden",
                }}>
                  {/* Header */}
                  <div style={{ padding:"15px 18px 13px", borderBottom:`1px solid ${C.divider}`, background:`${C.navy}06`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:32, height:32, borderRadius:9, background:`linear-gradient(135deg,${C.navy},${C.blue})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Globe size={15} color="#fff"/>
                      </div>
                      <div>
                        <p style={{ fontSize:13.5, fontWeight:700, color:C.navy, letterSpacing:"-0.2px" }}>Vue Globale</p>
                        <p style={{ fontSize:9.5, color:C.textMuted, marginTop:1.5 }}>État de la plateforme · temps réel</p>
                      </div>
                    </div>
                    <button onClick={()=>setShowVG(false)} style={{ width:24, height:24, borderRadius:6, background:C.surface, border:`1px solid ${C.divider}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                      <X size={10} color={C.textMuted}/>
                    </button>
                  </div>

                  <div style={{ padding:"14px 16px 16px", maxHeight:"calc(100vh - 130px)", overflowY:"auto" }}>
                    {vgLoading && (
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"30px 0", gap:10 }}>
                        <div className="na-spin" style={{ width:24, height:24, borderRadius:"50%", border:`2.5px solid ${C.iceBlue}`, borderTopColor:C.blue }}/>
                        <p style={{ fontSize:12, color:C.textMuted }}>Chargement…</p>
                      </div>
                    )}

                    {!vgLoading && vgData && (
                      <>
                        <p style={{ fontSize:9, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:".15em", marginBottom:10 }}>Indicateurs clés</p>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, marginBottom:14 }}>
                          {kpis.map((k,i) => {
                            const KI = k.icon;
                            return (
                              <Link key={i} to={k.path} onClick={()=>setShowVG(false)} style={{ textDecoration:"none" }}>
                                <div className="na-kpi" style={{ padding:"11px 12px", borderRadius:11, background:k.value==="—"?C.surface:`${k.color}07`, border:`1px solid ${k.value==="—"?C.divider:`${k.color}1E`}`, display:"flex", alignItems:"center", gap:9 }}>
                                  <div style={{ width:30, height:30, borderRadius:8, background:`${k.color}14`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                                    <KI size={14} color={k.color}/>
                                  </div>
                                  <div style={{ minWidth:0 }}>
                                    <p style={{ fontSize:18, fontWeight:800, color:k.value==="—"?C.textMuted:C.navy, lineHeight:1, letterSpacing:"-0.6px" }}>{k.value}</p>
                                    <p style={{ fontSize:9.5, color:C.textMuted, marginTop:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{k.label}</p>
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>

                        {alertes.length > 0 && (
                          <>
                            <p style={{ fontSize:9, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:".15em", marginBottom:8 }}>Alertes</p>
                            <div style={{ display:"flex", flexDirection:"column", gap:5, marginBottom:12 }}>
                              {alertes.map((a,i) => {
                                const AI = a.icon;
                                return (
                                  <Link key={i} to={a.path} onClick={()=>setShowVG(false)} style={{ textDecoration:"none" }}>
                                    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:9, background:`${a.color}07`, border:`1px solid ${a.color}1A`, transition:"background .12s" }}
                                      onMouseEnter={e=>e.currentTarget.style.background=`${a.color}12`}
                                      onMouseLeave={e=>e.currentTarget.style.background=`${a.color}07`}
                                    >
                                      <div style={{ width:26, height:26, borderRadius:7, background:`${a.color}16`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                                        <AI size={12} color={a.color}/>
                                      </div>
                                      <span style={{ fontSize:12, fontWeight:600, color:C.navy, flex:1 }}>{a.label}</span>
                                      <ChevronDown size={10} color={C.textMuted} style={{ transform:"rotate(-90deg)", flexShrink:0 }}/>
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          </>
                        )}

                        <Link to="/statistiques" onClick={()=>setShowVG(false)} style={{ textDecoration:"none" }}>
                          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:7, padding:"10px", borderRadius:10, background:`linear-gradient(135deg,${C.navy},${C.blue})`, transition:"opacity .14s" }}
                            onMouseEnter={e=>e.currentTarget.style.opacity=".88"}
                            onMouseLeave={e=>e.currentTarget.style.opacity="1"}
                          >
                            <BarChart3 size={13} color="#fff"/>
                            <span style={{ fontSize:12, fontWeight:600, color:"#fff" }}>Voir les statistiques complètes</span>
                          </div>
                        </Link>
                      </>
                    )}

                    {!vgLoading && !vgData && (
                      <div style={{ textAlign:"center", padding:"26px 0", color:C.textMuted }}>
                        <AlertCircle size={24} style={{ margin:"0 auto 10px", display:"block", opacity:.4 }}/>
                        <p style={{ fontSize:12 }}>Impossible de charger les données</p>
                        <button onClick={loadVG} style={{ marginTop:10, fontSize:11, color:C.blue, background:"none", border:"none", cursor:"pointer", fontWeight:700, textDecoration:"underline" }}>Réessayer</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div ref={notifRef} style={{ position:"relative" }}>
              <button
                className={`na-icon${showNotif?" na-icon-on":""}`}
                onClick={() => { setShowNotif(v=>!v); setShowVG(false); if(!notifData.length) loadNotifs(); }}
              >
                <Bell size={15}/>
              </button>

              {totalNotifs > 0 && (
                <span className="na-badge" style={{
                  position:"absolute", top:-3, right:-3,
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
                  position:"absolute", top:44, right:0, width:340,
                  background:"#fff",
                  border:`1px solid ${C.divider}`,
                  borderTop:`3px solid ${C.accent}`,
                  borderRadius:"0 0 16px 16px",
                  boxShadow:"0 24px 64px rgba(8,18,46,.15)",
                  zIndex:500, overflow:"hidden",
                }}>
                  {/* Header */}
                  <div style={{ padding:"14px 18px 12px", borderBottom:`1px solid ${C.divider}`, display:"flex", justifyContent:"space-between", alignItems:"center", background:`${C.accent}07` }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <Bell size={14} color={C.accent}/>
                      <p style={{ fontSize:13.5, fontWeight:700, color:C.navy }}>Notifications</p>
                      {unread > 0 && (
                        <span style={{ fontSize:10, color:C.accent, fontWeight:700, background:`${C.accent}18`, padding:"2px 8px", borderRadius:20, border:`1px solid ${C.accent}30` }}>
                          {unread} non lue{unread>1?"s":""}
                        </span>
                      )}
                    </div>
                    <button onClick={()=>setShowNotif(false)} style={{ width:24, height:24, borderRadius:6, background:C.surface, border:`1px solid ${C.divider}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                      <X size={10} color={C.textMuted}/>
                    </button>
                  </div>

                  <div style={{ maxHeight:340, overflowY:"auto" }}>
                    {notifLoading && (
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"22px", gap:10 }}>
                        <div className="na-spin" style={{ width:20, height:20, borderRadius:"50%", border:`2px solid ${C.iceBlue}`, borderTopColor:C.accent }}/>
                        <span style={{ fontSize:12, color:C.textMuted }}>Chargement…</span>
                      </div>
                    )}
                    {!notifLoading && (<>
                      {counts.contacts > 0 && (
                        <Link to="/contacts" onClick={()=>setShowNotif(false)} style={{ textDecoration:"none" }}>
                          <div className="na-notif" style={{ padding:"12px 18px", borderBottom:`1px solid ${C.divider}`, background:`${C.danger}06`, display:"flex", gap:11, alignItems:"flex-start" }}>
                            <div style={{ width:7, height:7, borderRadius:"50%", background:C.danger, flexShrink:0, marginTop:6, boxShadow:`0 0 0 3px ${C.danger}22` }}/>
                            <div style={{ flex:1, minWidth:0 }}>
                              <p style={{ fontSize:12.5, fontWeight:700, color:C.navy }}>Messages en attente</p>
                              <p style={{ fontSize:11, color:C.textMuted, marginTop:2 }}>{counts.contacts} message(s) non traité(s)</p>
                            </div>
                            <span style={{ fontSize:9, color:C.danger, fontWeight:700, background:`${C.danger}12`, padding:"2px 7px", borderRadius:6, flexShrink:0, textTransform:"uppercase", letterSpacing:".04em" }}>Urgent</span>
                          </div>
                        </Link>
                      )}
                      {counts.community > 0 && (
                        <Link to="/listeCandidats" onClick={()=>setShowNotif(false)} style={{ textDecoration:"none" }}>
                          <div className="na-notif" style={{ padding:"12px 18px", borderBottom:`1px solid ${C.divider}`, background:`${C.blue}06`, display:"flex", gap:11, alignItems:"flex-start" }}>
                            <div style={{ width:7, height:7, borderRadius:"50%", background:C.blue, flexShrink:0, marginTop:6, boxShadow:`0 0 0 3px ${C.blue}22` }}/>
                            <div style={{ flex:1, minWidth:0 }}>
                              <p style={{ fontSize:12.5, fontWeight:700, color:C.navy }}>Nouvelles candidatures</p>
                              <p style={{ fontSize:11, color:C.textMuted, marginTop:2 }}>{counts.community} candidature(s) à examiner</p>
                            </div>
                            <span style={{ fontSize:9, color:C.blue, fontWeight:700, background:`${C.blue}12`, padding:"2px 7px", borderRadius:6, flexShrink:0, textTransform:"uppercase" }}>Nouveau</span>
                          </div>
                        </Link>
                      )}
                      {counts.newsletter > 0 && (
                        <Link to="/newsletter" onClick={()=>setShowNotif(false)} style={{ textDecoration:"none" }}>
                          <div className="na-notif" style={{ padding:"12px 18px", borderBottom:`1px solid ${C.divider}`, background:`${C.purple}06`, display:"flex", gap:11, alignItems:"flex-start" }}>
                            <div style={{ width:7, height:7, borderRadius:"50%", background:C.purple, flexShrink:0, marginTop:6, boxShadow:`0 0 0 3px ${C.purple}22` }}/>
                            <div style={{ flex:1, minWidth:0 }}>
                              <p style={{ fontSize:12.5, fontWeight:700, color:C.navy }}>Abonnements newsletter</p>
                              <p style={{ fontSize:11, color:C.textMuted, marginTop:2 }}>{counts.newsletter} nouvel(aux) abonné(s)</p>
                            </div>
                          </div>
                        </Link>
                      )}
                      {notifData.map((n,i) => (
                        <div key={i} className="na-notif" style={{ padding:"11px 18px", borderBottom:i<notifData.length-1?`1px solid ${C.divider}`:"none", background:n.read?"#fff":`${C.blue}05`, display:"flex", gap:11, alignItems:"flex-start" }}>
                          <div style={{ width:7, height:7, borderRadius:"50%", flexShrink:0, marginTop:6, background:n.read?"#CBD5E1":C.blue, boxShadow:n.read?"none":`0 0 0 3px ${C.blue}18` }}/>
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ fontSize:12, fontWeight:n.read?450:700, color:C.navy, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{n.text}</p>
                            {n.detail && <p style={{ fontSize:10.5, color:C.textMuted, marginTop:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{n.detail}</p>}
                          </div>
                          {n.type && (
                            <span style={{ fontSize:8.5, color:n.type==="contact"?C.accent:C.blue, fontWeight:700, background:n.type==="contact"?`${C.accent}12`:`${C.blue}10`, padding:"2px 6px", borderRadius:5, flexShrink:0, textTransform:"uppercase" }}>{n.type}</span>
                          )}
                        </div>
                      ))}
                      {totalNotifs===0 && notifData.length===0 && (
                        <div style={{ textAlign:"center", padding:"28px 18px" }}>
                          <CheckCircle2 size={24} color={C.success} style={{ margin:"0 auto 10px", display:"block", opacity:.5 }}/>
                          <p style={{ fontSize:12.5, color:C.textMuted, fontWeight:600 }}>Tout est à jour</p>
                          <p style={{ fontSize:11, color:C.textMuted, marginTop:4 }}>Aucune notification en attente</p>
                        </div>
                      )}
                    </>)}
                  </div>

                  <div style={{ padding:"10px 18px 13px", borderTop:`1px solid ${C.divider}` }}>
                    <Link to="/notifications" onClick={()=>setShowNotif(false)} style={{ textDecoration:"none", display:"block", textAlign:"center", fontSize:12, fontWeight:600, color:C.blue, opacity:.9 }}>
                      Voir toutes les notifications →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Sep/>

            {/* Chip profil */}
            <div
              className="na-desk"
              style={{
                display:"flex", alignItems:"center", gap:8,
                padding:"4px 12px 4px 4px",
                background:C.surface,
                border:`1px solid ${C.divider}`,
                borderRadius:9,
                transition:"border-color .15s, box-shadow .15s",
              }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.iceBlue; e.currentTarget.style.boxShadow=`0 2px 10px ${C.shadow}`; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.divider;  e.currentTarget.style.boxShadow="none"; }}
            >
              {/* Avatar */}
              <div style={{
                width:28, height:28, borderRadius:7, flexShrink:0,
                background:`linear-gradient(135deg,${C.navy},${C.blue})`,
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:`0 2px 8px ${C.blue}25`,
              }}>
                <span style={{ fontSize:10.5, fontWeight:800, color:"#fff", letterSpacing:"-0.3px" }}>{initials}</span>
              </div>

              {/* Infos */}
              <div style={{ minWidth:0 }}>
                <p style={{ fontSize:11.5, fontWeight:700, color:C.navy, lineHeight:1.2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:130 }}>{displayName}</p>
                <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:2 }}>
                  <div style={{ width:5, height:5, borderRadius:"50%", background:badge.dot, flexShrink:0 }}/>
                  <p style={{ fontSize:9, fontWeight:600, color:C.textMuted, whiteSpace:"nowrap", textTransform:"uppercase", letterSpacing:".05em" }}>{roleLabel}</p>
                </div>
              </div>
            </div>

            {/* Déconnexion */}
            <button
              onClick={handleLogout}
              title="Déconnexion"
              className="na-icon"
              style={{ background:"#FEF2F2", border:`1px solid #FECACA` }}
              onMouseEnter={e=>{ e.currentTarget.style.background="#FEE2E2"; e.currentTarget.style.borderColor=C.danger; e.currentTarget.style.color=C.danger; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="#FEF2F2"; e.currentTarget.style.borderColor="#FECACA"; e.currentTarget.style.color=C.danger; }}
            >
              <LogOut size={14} color={C.danger}/>
            </button>

            {/* Burger mobile */}
            <button
              onClick={() => setShowMobile(!showMobile)}
              className={`na-icon na-mob-only${showMobile?" na-icon-on":""}`}
              style={{ border:`1px solid ${C.divider}` }}
            >
              {showMobile ? <X size={15}/> : <Menu size={15}/>}
            </button>
          </div>
        </div>
      </nav>

      {/* Overlay fermeture dropdown */}
      {activeDrop !== null && (
        <div style={{ position:"fixed", inset:0, zIndex:199 }} onClick={() => setActiveDrop(null)}/>
      )}

      {/* ══════════════════════════════════════
          MENU MOBILE — drawer latéral
      ══════════════════════════════════════ */}
      {showMobile && (
        <>
          <div
            style={{ position:"fixed", inset:0, background:"rgba(8,18,46,.4)", backdropFilter:"blur(10px) saturate(1.3)", zIndex:250 }}
            onClick={() => setShowMobile(false)}
          />
          <div className="na-drawer" style={{
            position:"fixed", top:0, right:0, bottom:0,
            width:"min(340px,92vw)",
            background:"#fff",
            zIndex:300, overflowY:"auto",
            display:"flex", flexDirection:"column",
            boxShadow:"-16px 0 70px rgba(8,18,46,.18)",
          }}>

            {/* Header */}
            <div style={{
              position:"sticky", top:0, flexShrink:0, zIndex:10,
              background:C.navy,
              padding:"16px 18px 14px",
              display:"flex", alignItems:"center", justifyContent:"space-between",
            }}>
              {/* Filet tricolore bas */}
              <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2, display:"flex" }}>
                <div style={{ flex:1, background:"#E02020" }}/>
                <div style={{ flex:1, background:C.accent }}/>
                <div style={{ flex:1, background:C.success }}/>
              </div>

              {/* Profil */}
              <div style={{ display:"flex", alignItems:"center", gap:11 }}>
                <div style={{
                  width:38, height:38, borderRadius:10, flexShrink:0,
                  background:"rgba(255,255,255,.12)",
                  border:"1px solid rgba(255,255,255,.2)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  <span style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:800, color:"#fff" }}>{initials}</span>
                </div>
                <div>
                  <p style={{ fontSize:13.5, fontWeight:700, color:"#fff", letterSpacing:"-0.2px" }}>{displayName}</p>
                  <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:3 }}>
                    <div style={{ width:5, height:5, borderRadius:"50%", background:C.accentWarm }}/>
                    <span style={{ fontSize:9.5, color:"rgba(255,255,255,.55)", fontWeight:500 }}>{roleLabel}</span>
                  </div>
                </div>
              </div>

              <button onClick={()=>setShowMobile(false)} style={{ width:30, height:30, borderRadius:7, background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.18)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                <X size={14} color="#fff"/>
              </button>
            </div>

            <div style={{ padding:"10px 14px 90px", display:"flex", flexDirection:"column", gap:6 }}>

              {/* Dashboard */}
              <Link to="/dashboardAdmin" onClick={()=>setShowMobile(false)} style={{ textDecoration:"none" }}>
                <div className="na-mob" style={{
                  display:"flex", alignItems:"center", gap:10, padding:"10px 14px",
                  borderRadius:9,
                  background: isActive("/dashboardAdmin") ? C.surface : "transparent",
                  borderLeft:`3px solid ${isActive("/dashboardAdmin") ? C.blue : "transparent"}`,
                  marginTop:4,
                }}>
                  <LayoutDashboard size={14} color={isActive("/dashboardAdmin") ? C.blue : C.textMuted}/>
                  <span style={{ fontSize:13, fontWeight:700, color:isActive("/dashboardAdmin") ? C.navy : C.textSub }}>Tableau de bord</span>
                </div>
              </Link>

              {/* Catégories */}
              {cats.map((cat, i) => {
                const CatIcon = cat.icon;
                return (
                  <div key={i} style={{ marginTop:10 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, padding:"3px 5px 6px", marginBottom:2 }}>
                      <div style={{ width:3, height:12, borderRadius:2, background:cat.color, flexShrink:0 }}/>
                      <CatIcon size={11} color={cat.color}/>
                      <span style={{ fontSize:9.5, fontWeight:700, color:cat.color, textTransform:"uppercase", letterSpacing:".12em" }}>{cat.title}</span>
                    </div>

                    <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                      {cat.items.map((item, j) => {
                        const ItemIcon = item.icon;
                        const active   = isActive(item.path);
                        return (
                          <Link
                            key={j}
                            to={item.path}
                            onClick={()=>setShowMobile(false)}
                            className="na-mob"
                            style={{
                              display:"flex", alignItems:"center", justifyContent:"space-between",
                              padding:"8px 14px 8px 16px", borderRadius:8, textDecoration:"none",
                              background: active ? `${cat.color}09` : "transparent",
                              borderLeft:`3px solid ${active ? cat.color : "transparent"}`,
                            }}
                          >
                            <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                              <div style={{ width:26, height:26, borderRadius:7, background:`${cat.color}0E`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                                <ItemIcon size={12} color={active ? cat.color : C.textMuted}/>
                              </div>
                              <span style={{ fontSize:12.5, fontWeight:active?700:450, color:active?C.navy:C.textSub }}>{item.label}</span>
                            </div>
                            {item.count > 0 && (
                              <span style={{ background:active?cat.color:C.surface, color:active?"#fff":C.textSub, border:`1px solid ${active?cat.color:C.divider}`, borderRadius:20, padding:"2px 8px", fontSize:9, fontWeight:700 }}>{item.count}</span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Déconnexion */}
              <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${C.divider}` }}>
                <button
                  onClick={() => { setShowMobile(false); handleLogout(); }}
                  style={{
                    width:"100%", padding:"11px 16px", borderRadius:9,
                    background:"#FEF2F2", border:`1px solid #FECACA`,
                    color:C.danger, fontWeight:700, fontSize:13,
                    display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                    cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
                    transition:"all .14s",
                  }}
                  onMouseEnter={e=>{ e.currentTarget.style.background="#FEE2E2"; e.currentTarget.style.borderColor=C.danger; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background="#FEF2F2"; e.currentTarget.style.borderColor="#FECACA"; }}
                >
                  <LogOut size={14}/> Déconnexion
                </button>
              </div>
            </div>

            {/* FAB */}
            <button
              onClick={() => setShowMobile(false)}
              style={{
                position:"fixed", bottom:22, right:22,
                width:44, height:44, borderRadius:22,
                background:`linear-gradient(135deg,${C.navy},${C.blue})`,
                border:"none",
                boxShadow:`0 8px 24px ${C.blue}40`,
                display:"flex", alignItems:"center", justifyContent:"center",
                cursor:"pointer", zIndex:20,
                transition:"transform .15s",
              }}
              onMouseEnter={e=>e.currentTarget.style.transform="scale(1.08)"}
              onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
            >
              <X size={17} color="#fff"/>
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default NavAdmin;