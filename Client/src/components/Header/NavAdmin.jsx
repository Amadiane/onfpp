/**
 * NavAdmin.jsx — connecté au ThemeContext GLOBAL
 *
 * ╔══════════════════════════════════════════════════════╗
 * ║  CHANGEMENT CLÉ vs version précédente :              ║
 * ║  • Plus de useState local pour `dark`                ║
 * ║  • Plus de ThemeContext.Provider ici                 ║
 * ║  • On lit dark + toggle depuis useTheme()            ║
 * ║    (le Provider est dans App.jsx → toutes les pages  ║
 * ║     partagent le même état de thème)                 ║
 * ╚══════════════════════════════════════════════════════╝
 */

import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, GraduationCap, ClipboardList,
  Settings, LogOut, Bell, FileText, CalendarDays, Package, Layers,
  CheckCircle2, Briefcase, UserCog, Clock,
  PanelLeftClose, PanelLeftOpen, X, Globe,
  Sun, Moon,
} from "lucide-react";
import CONFIG from "../../config/config.js";
import logo from "../../assets/logo.png";

/* ── Thème global ── */
import { useTheme } from "../../context/ThemeContext";

/* ═══════════════════════════════════════════════════════════
   TOKENS SIDEBAR (identiques à ThemeContext mais locaux
   pour garder NavAdmin autonome côté import)
═══════════════════════════════════════════════════════════ */
const LT = {
  page:"#F4F6FC", surface:"#FFFFFF", surfaceEl:"#F8FAFE",
  brand:"#1A3B8C", brandMid:"#2451B8", brandViv:"#3D68FF",
  textPri:"#0D1B3E", textSec:"#2C3F7A", textMuted:"#8496C8",
  divider:"#DDE5F5", border:"#C8D4FF",
  ice:"#EBF0FF", iceDeep:"#D6E1FF", iceFaint:"#F3F6FF",
  gold:"#B87A00", goldBright:"#E09A00", goldViv:"#F5B020", goldPale:"#FFF7E0",
  green:"#046048", greenLight:"#0BAF7A", greenPale:"#E2F8F1",
  rose:"#CC1840", rosePale:"#FDEAEF", violet:"#5A22CC", teal:"#077870",
  sh1:"rgba(13,27,62,0.06)", sh2:"rgba(13,27,62,0.12)",
  navItemHover:"rgba(26,59,140,0.06)",
  topbarBg:"rgba(255,255,255,0.97)", topbarBorder:"#DDE5F5",
};
const DT = {
  page:"#06101E", surface:"#0D1B35", surfaceEl:"#112040",
  brand:"#4A78FF", brandMid:"#3D68FF", brandViv:"#5B82FF",
  textPri:"#E8EFFF", textSec:"#9AB0FF", textMuted:"#4D6599",
  divider:"rgba(93,118,255,0.15)", border:"rgba(93,118,255,0.25)",
  ice:"rgba(26,59,140,0.3)", iceDeep:"rgba(26,59,140,0.5)", iceFaint:"rgba(26,59,140,0.15)",
  gold:"#E09A00", goldBright:"#F5B020", goldViv:"#FFD060", goldPale:"rgba(245,176,32,0.12)",
  green:"#0BAF7A", greenLight:"#2DD4A0", greenPale:"rgba(11,175,122,0.15)",
  rose:"#FF4060", rosePale:"rgba(255,64,96,0.15)", violet:"#9B6EFF", teal:"#20C0B0",
  sh1:"rgba(0,0,0,0.25)", sh2:"rgba(0,0,0,0.4)",
  navItemHover:"rgba(93,118,255,0.10)",
  topbarBg:"rgba(10,22,40,0.97)", topbarBorder:"rgba(93,118,255,0.15)",
};

export const SIDEBAR_W  = 262;
export const SIDEBAR_SM = 68;
export const TOPBAR_H   = 60;

const ROLE_LABELS = {
  "Directeur Général":"Directeur Général","Directeur Général Adjoint":"DG Adjoint",
  "Chef de Division":"Chef de Division","Chef de Section":"Chef de Section",
  "Chef d'Antenne":"Chef d'Antenne","Conseiller":"Conseiller",
  "Formateur":"Formateur","Super Administrateur":"Super Admin",
  DG:"Directeur Général",CD:"Chef de Division",DR:"DG Adjoint",
  CC:"Chef d'Antenne",FORMATEUR:"Formateur",SUPERADMIN:"Super Admin",
};

const RS_LIGHT = {
  default:{ bg:"#EBF0FF",text:"#1A3B8C",border:"#BCC8FF",dot:"#1A3B8C" },
  "Directeur Général":{ bg:"#EBF0FF",text:"#1A3B8C",border:"#BCC8FF",dot:"#1A3B8C" },
  "Directeur Général Adjoint":{ bg:"#EBF0FF",text:"#1A3B8C",border:"#BCC8FF",dot:"#1A3B8C" },
  "Chef de Division":{ bg:"#EBF0FF",text:"#1A3B8C",border:"#BCC8FF",dot:"#1A3B8C" },
  "Chef de Section":{ bg:"#E0F8F1",text:"#046048",border:"#85E0C5",dot:"#0BAF7A" },
  "Chef d'Antenne":{ bg:"#FFF4D6",text:"#7A4F00",border:"#F0CC78",dot:"#B87A00" },
  "Conseiller":{ bg:"#F0EAFF",text:"#5A22CC",border:"#C2ABFA",dot:"#7C45EE" },
  "Formateur":{ bg:"#DDFAFF",text:"#025070",border:"#88DEFF",dot:"#0891B2" },
  "Super Administrateur":{ bg:"#FDEAEF",text:"#CC1840",border:"#F5AABC",dot:"#E02050" },
  DG:{ bg:"#EBF0FF",text:"#1A3B8C",border:"#BCC8FF",dot:"#1A3B8C" },
  CD:{ bg:"#EBF0FF",text:"#1A3B8C",border:"#BCC8FF",dot:"#1A3B8C" },
  CC:{ bg:"#FFF4D6",text:"#7A4F00",border:"#F0CC78",dot:"#B87A00" },
  SUPERADMIN:{ bg:"#FDEAEF",text:"#CC1840",border:"#F5AABC",dot:"#E02050" },
};
const RS_DARK = {
  default:{ bg:"rgba(93,118,255,.18)",text:"#9AB0FF",border:"rgba(93,118,255,.28)",dot:"#6B8FFF" },
  "Directeur Général":{ bg:"rgba(93,118,255,.18)",text:"#9AB0FF",border:"rgba(93,118,255,.28)",dot:"#6B8FFF" },
  "Directeur Général Adjoint":{ bg:"rgba(93,118,255,.18)",text:"#9AB0FF",border:"rgba(93,118,255,.28)",dot:"#6B8FFF" },
  "Chef de Division":{ bg:"rgba(93,118,255,.18)",text:"#9AB0FF",border:"rgba(93,118,255,.28)",dot:"#6B8FFF" },
  "Chef de Section":{ bg:"rgba(11,175,122,.16)",text:"#5AEEC0",border:"rgba(11,175,122,.26)",dot:"#2DD4A0" },
  "Chef d'Antenne":{ bg:"rgba(229,154,0,.15)",text:"#FFD060",border:"rgba(229,154,0,.26)",dot:"#E09A00" },
  "Conseiller":{ bg:"rgba(150,90,255,.16)",text:"#C4AAFF",border:"rgba(150,90,255,.26)",dot:"#AA82FF" },
  "Formateur":{ bg:"rgba(0,200,245,.13)",text:"#6ADEFF",border:"rgba(0,200,245,.23)",dot:"#18D4F5" },
  "Super Administrateur":{ bg:"rgba(255,70,90,.15)",text:"#FF9EAC",border:"rgba(255,70,90,.25)",dot:"#FF6070" },
  DG:{ bg:"rgba(93,118,255,.18)",text:"#9AB0FF",border:"rgba(93,118,255,.28)",dot:"#6B8FFF" },
  CD:{ bg:"rgba(93,118,255,.18)",text:"#9AB0FF",border:"rgba(93,118,255,.28)",dot:"#6B8FFF" },
  CC:{ bg:"rgba(229,154,0,.15)",text:"#FFD060",border:"rgba(229,154,0,.26)",dot:"#E09A00" },
  SUPERADMIN:{ bg:"rgba(255,70,90,.15)",text:"#FF9EAC",border:"rgba(255,70,90,.25)",dot:"#FF6070" },
};

const ALL   = ["DG","CD","DR","CC","FORMATEUR","SUPERADMIN","Directeur Général","Directeur Général Adjoint","Chef de Division","Chef de Section","Chef de Centre","Formateur","Super Administrateur","Chef d'Antenne","Conseiller"];
const MGMT  = ["DG","CD","DR","Directeur Général","Directeur Général Adjoint","Chef de Division","Chef de Section"];
const OPS   = ["CC","FORMATEUR","Chef de Centre","Formateur","Chef d'Antenne"];
const ADM   = ["DG","CD","SUPERADMIN","Directeur Général","Chef de Division","Super Administrateur"];
const NS    = ALL.filter(r => !["SUPERADMIN","Super Administrateur"].includes(r));

const NAV = [
  { path:"/dashboardAdmin",    label:"Tableau de bord",          icon:LayoutDashboard, roles:ALL   },
  { path:"/inscription",       label:"Inscriptions",             icon:GraduationCap,   roles:NS    },
  { path:"/listeApprenants",   label:"Liste des Candidats",      icon:ClipboardList,   roles:NS    },
  { path:"/formateurs",        label:"Gestion des Formateurs",   icon:UserCog,         roles:MGMT  },
  { path:"/formationContinue", label:"Formation DFC",            icon:Package,         roles:MGMT  },
  { path:"/formationDAPc",     label:"Formation DAPC",           icon:Package,         roles:MGMT  },
  { path:"/entreprise",        label:"Entreprises",              icon:Briefcase,       roles:MGMT  },
  { path:"/suiviEvaluation",   label:"Suivi Évaluation",         icon:CheckCircle2,    roles:MGMT  },
  { path:"/addUser",           label:"Gestion utilisateurs",     icon:UserCog,         roles:ADM   },
  { path:"/boitecommune",      label:"Boite Commune",            icon:UserCog,         roles:ADM   },
  { path:"/rapports",          label:"Rapports",                 icon:UserCog,         roles:ADM   },
  { path:"/attestations",      label:"Attestations PDF",         icon:FileText,        roles:[...MGMT,...OPS] },
  { path:"/enquete-insertion", label:"Enquête insertion 3 mois", icon:Clock,           roles:[...MGMT,"CC","Chef de Centre","Chef d'Antenne"] },
  { path:"/homePost",          label:"Contenu site public",      icon:Layers,          roles:["DG","CD","Directeur Général","Chef de Division"] },
];

const buildNav = role => {
  const s = new Set();
  return NAV.filter(i => { if (s.has(i.path) || !i.roles.includes(role)) return false; s.add(i.path); return true; });
};

const getUser = () => {
  try {
    const raw = localStorage.getItem("user");
    if (raw) {
      const p = JSON.parse(raw); const rr = p.role;
      const role = typeof rr === "object" && rr ? rr.name || "Directeur Général" : rr || "Directeur Général";
      const fn = p.first_name || p.firstName || "", ln = p.last_name || p.lastName || "";
      const name = fn ? `${fn}${ln ? " "+ln : ""}` : p.username || p.email || "Admin";
      return { ...p, role, name, username: p.username || p.email || name, division: p.division || null, antenne: p.antenne || null };
    }
    const tok = localStorage.getItem("access");
    if (tok) {
      const p = JSON.parse(atob(tok.split(".")[1])); const rr = p.role;
      const role = typeof rr === "object" && rr ? rr.name || "Directeur Général" : rr || "Directeur Général";
      const fn = p.first_name || "", ln = p.last_name || "";
      const name = fn ? `${fn}${ln ? " "+ln : ""}` : p.username || p.email || "Admin";
      return { username: p.username || p.email || name, name, role, division: p.division || null, antenne: p.antenne || null };
    }
  } catch {}
  return { username:"Admin", name:"Admin", role:"Directeur Général" };
};

const isAuthenticated = () => {
  try {
    const tok = localStorage.getItem("access");
    if (!tok) return false;
    const p = JSON.parse(atob(tok.split(".")[1]));
    if (p.exp && p.exp * 1000 < Date.now()) return false;
    return true;
  } catch { return !!localStorage.getItem("access"); }
};

/* ── CSS dynamique ── */
const buildCSS = (T, dark) => `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
.nv,.nv *:not(style){font-family:'Sora',sans-serif!important;-webkit-font-smoothing:antialiased;box-sizing:border-box;}
.nv-f{font-family:'DM Serif Display',serif!important;}
.nv-side{transition:width .32s cubic-bezier(.16,1,.3,1);will-change:width;overflow:hidden;}
.nv-item{display:flex;align-items:center;gap:11px;padding:9px 12px;border-radius:11px;cursor:pointer;text-decoration:none;border:none;background:transparent;position:relative;width:100%;transition:background .18s,transform .16s cubic-bezier(.34,1.4,.64,1);}
.nv-item:hover{background:${T.navItemHover};transform:translateX(2px);}
.nv-item.act{background:${dark?"linear-gradient(135deg,rgba(74,120,255,.2),rgba(93,130,255,.12))":"linear-gradient(135deg,rgba(26,59,140,.09),rgba(61,104,255,.05))"};box-shadow:${dark?"inset 0 1px 0 rgba(255,255,255,.04),0 4px 16px rgba(26,59,140,.2)":"inset 0 1px 0 rgba(255,255,255,.8),0 2px 12px rgba(26,59,140,.10)"};}
.nv-item.act::before{content:'';position:absolute;left:0;top:20%;bottom:20%;width:3px;border-radius:0 3px 3px 0;background:linear-gradient(180deg,${dark?"#7EA8FF":"#2451B8"} 0%,${dark?"#4A78FF":"#1A3B8C"} 100%);box-shadow:0 0 12px ${dark?"rgba(74,120,255,.7)":"rgba(26,59,140,.35)"};}
.nv-tip{position:absolute;left:calc(100% + 14px);top:50%;transform:translateY(-50%) translateX(-4px);background:${dark?"#0A1628":"#0D1B3E"};color:${dark?"#C8D8FF":"#E8EFFF"};font-size:11.5px;font-weight:500;white-space:nowrap;padding:7px 14px;border-radius:10px;pointer-events:none;opacity:0;transition:opacity .15s,transform .15s;z-index:9999;border:1px solid ${dark?"rgba(93,118,255,.2)":"rgba(93,118,255,.15)"};box-shadow:0 10px 36px rgba(0,0,0,.45);}
.nv-tip::before{content:'';position:absolute;right:100%;top:50%;transform:translateY(-50%);border:5px solid transparent;border-right-color:${dark?"#0A1628":"#0D1B3E"};}
.nv-item:hover .nv-tip{opacity:1;transform:translateY(-50%) translateX(0);}
.nv-scroll::-webkit-scrollbar{width:2px;}.nv-scroll::-webkit-scrollbar-track{background:transparent;}.nv-scroll::-webkit-scrollbar-thumb{background:${dark?"rgba(93,118,255,.22)":"rgba(26,59,140,.15)"};border-radius:2px;}
.nv-btn{width:36px;height:36px;border-radius:10px;border:1px solid ${T.divider};background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;color:${T.textMuted};transition:all .15s;}
.nv-btn:hover{background:${T.ice};color:${T.textPri};border-color:${T.border};}
.nv-btn.on{background:${dark?"rgba(74,120,255,.15)":"rgba(26,59,140,.08)"};color:${T.brand};border-color:${T.border};}
.nv-tog{width:28px;height:28px;border-radius:8px;border:1px solid ${dark?"rgba(255,255,255,.1)":"rgba(26,59,140,.15)"};background:${dark?"rgba(255,255,255,.05)":"rgba(26,59,140,.05)"};cursor:pointer;display:flex;align-items:center;justify-content:center;color:${dark?"rgba(255,255,255,.38)":"rgba(26,59,140,.45)"};transition:all .15s;flex-shrink:0;}
.nv-tog:hover{background:${dark?"rgba(255,255,255,.12)":"rgba(26,59,140,.12)"};color:${dark?"#fff":T.brand};border-color:${dark?"rgba(255,255,255,.18)":T.brand};}
.nv-chip{cursor:default;transition:box-shadow .16s,border-color .16s;}
.nv-chip:hover{border-color:${T.border}!important;box-shadow:0 6px 24px ${T.sh2}!important;}
.nv-sec{font-size:7.5px;font-weight:700;letter-spacing:.3em;text-transform:uppercase;color:${dark?"rgba(255,255,255,.15)":"rgba(26,59,140,.3)"};padding:12px 12px 4px;}
.nv-stat{display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:9px;border:1px solid ${T.divider};background:${T.iceFaint};font-size:10.5px;transition:border-color .14s,background .14s;cursor:default;color:${T.textSec};}
.nv-stat:hover{background:${T.ice};border-color:${T.border};}
.nv-ni{transition:background .12s;}.nv-ni:hover{background:${T.iceFaint}!important;}
.nv-theme-toggle{width:60px;height:30px;border-radius:15px;cursor:pointer;border:1px solid ${dark?"rgba(93,118,255,.3)":"rgba(26,59,140,.2)"};background:${dark?"linear-gradient(135deg,#1A2E5A,#0D1B35)":"linear-gradient(135deg,#EBF0FF,#DDEEFF)"};display:flex;align-items:center;padding:3px;overflow:hidden;transition:background .3s;}
.nv-theme-knob{width:24px;height:24px;border-radius:12px;background:${dark?"linear-gradient(135deg,#4A78FF,#2451B8)":"linear-gradient(135deg,#FFD060,#F5B020)"};box-shadow:${dark?"0 2px 8px rgba(74,120,255,.5)":"0 2px 8px rgba(245,176,32,.6)"};transition:transform .3s cubic-bezier(.34,1.4,.64,1);transform:${dark?"translateX(30px)":"translateX(0)"};display:flex;align-items:center;justify-content:center;flex-shrink:0;}
@keyframes nvFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}.nv-fade{animation:nvFade .3s cubic-bezier(.16,1,.3,1) both;}
@keyframes nvOrb1{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.12) translate(-10px,-14px)}}.nv-orb1{animation:nvOrb1 12s ease-in-out infinite;}
@keyframes nvOrb2{0%,100%{opacity:.35;transform:scale(1)}50%{opacity:.6;transform:scale(1.08) translate(8px,12px)}}.nv-orb2{animation:nvOrb2 16s ease-in-out infinite;}
@keyframes nvBadge{0%,100%{box-shadow:0 0 0 0 rgba(204,24,64,.6)}65%{box-shadow:0 0 0 7px transparent}}.nv-badge{animation:nvBadge 2.6s ease infinite;}
@keyframes nvSpin{to{transform:rotate(360deg)}}.nv-spin{animation:nvSpin .7s linear infinite;}
@keyframes nvPulse{0%,100%{box-shadow:0 0 0 0 rgba(11,175,122,.5)}55%{box-shadow:0 0 0 5px transparent}}.nv-live{animation:nvPulse 2.2s ease infinite;}
@keyframes nvBlink{0%,49%{opacity:1}50%,100%{opacity:.15}}.nv-blink{animation:nvBlink 1s step-end infinite;}
@keyframes nvDrop{from{opacity:0;transform:translateY(-8px) scale(.97)}to{opacity:1;transform:none}}.nv-panel{animation:nvDrop .2s cubic-bezier(.16,1,.3,1) both;}
@keyframes glowMove{0%{opacity:.4;left:-80%}100%{opacity:0;left:120%}}.nv-glow-line{animation:glowMove 3.5s ease-in-out infinite;}
`;

/* ═══════════════════════════════════════════════════════════
   COMPOSANT
═══════════════════════════════════════════════════════════ */
export default function NavAdmin() {
  const loc = useLocation();
  const nav = useNavigate();

  /* ▼ Thème lu depuis le contexte global — PAS de useState local ▼ */
  const { dark, toggle: toggleTheme } = useTheme();

  const T   = dark ? DT : LT;
  const CSS = buildCSS(T, dark);

  const [col,    setCol]    = useState(false);
  const [notif,  setNotif]  = useState(false);
  const [counts, setCounts] = useState({ contacts:0, community:0, newsletter:0 });
  const [nList,  setNList]  = useState([]);
  const [nLoad,  setNLoad]  = useState(false);
  const [time,   setTime]   = useState(new Date());
  const nRef = useRef(null);

  const u      = getUser();
  const role   = u.role || "Directeur Général";
  const label  = ROLE_LABELS[role] || role;
  const name   = u.name || u.username || "Admin";
  const ini    = name.split(" ").filter(Boolean).map(w => w[0]).slice(0,2).join("").toUpperCase() || "?";
  const rd     = RS_DARK[role]  || RS_DARK.default;
  const rl     = RS_LIGHT[role] || RS_LIGHT.default;
  const rb     = dark ? rd : rl;
  const online = isAuthenticated();

  const items   = buildNav(role);
  const total   = counts.contacts + counts.community + counts.newsletter;
  const sw      = col ? SIDEBAR_SM : SIDEBAR_W;
  const scope   = u.division ? `Div. ${u.division}` : u.antenne ? `Antenne ${u.antenne}` : "Accès global";
  const isAct   = p => loc.pathname === p || loc.pathname.startsWith(p + "/");
  const curPage = items.find(i => isAct(i.path))?.label || "Tableau de bord";

  const SIDEBAR_BG   = dark ? "linear-gradient(175deg,#08152A 0%,#0D1F3C 35%,#101D40 65%,#0A1628 100%)" : "linear-gradient(175deg,#FFFFFF 0%,#F8FAFE 40%,#F4F7FF 70%,#FAFBFF 100%)";
  const BRAND_ACCENT = dark ? "#4A78FF" : "#1A3B8C";

  useEffect(() => { window.dispatchEvent(new CustomEvent("sidebar-toggle",{detail:{collapsed:col}})); }, [col]);
  useEffect(() => { const t = setInterval(()=>setTime(new Date()),1000); return ()=>clearInterval(t); }, []);

  useEffect(() => {
    (async()=>{
      try {
        const r  = await fetch(CONFIG.API_CONTACT_LIST);
        if(r.ok)  {const d=await r.json();  setCounts(p=>({...p,contacts: (Array.isArray(d)?d:d.results||[]).length}));}
        const r2 = await fetch(CONFIG.API_POSTULANT_LIST);
        if(r2.ok) {const d=await r2.json(); setCounts(p=>({...p,community:(Array.isArray(d)?d:d.results||[]).length}));}
        const r3 = await fetch(CONFIG.API_ABONNEMENT_LIST);
        if(r3.ok) {const d=await r3.json(); setCounts(p=>({...p,newsletter:(Array.isArray(d)?d:d.results||[]).length}));}
      }catch{}
    })();
  }, []);

  const loadN = async () => {
    if(nList.length>0) return; setNLoad(true);
    try {
      const[r1,r2]=await Promise.allSettled([
        fetch(CONFIG.API_CONTACT_LIST).then(r=>r.ok?r.json():[]),
        fetch(CONFIG.API_POSTULANT_LIST).then(r=>r.ok?r.json():[]),
      ]);
      const c=r1.status==="fulfilled"?(Array.isArray(r1.value)?r1.value:r1.value?.results||[]):[];
      const p=r2.status==="fulfilled"?(Array.isArray(r2.value)?r2.value:r2.value?.results||[]):[];
      setNList([...c.slice(0,3).map((x,i)=>({text:x.nom||x.name||"Nouveau message",detail:x.email||"",type:"contact",read:i>1})),...p.slice(0,3).map((x,i)=>({text:x.nom_complet||x.nom||"Nouveau postulant",detail:x.formation||"",type:"candidat",read:i>0}))].slice(0,6));
    }catch{}finally{setNLoad(false);}
  };

  useEffect(()=>{
    const h=e=>{if(nRef.current&&!nRef.current.contains(e.target))setNotif(false);};
    document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h);
  },[]);

  const logout = ()=>{ localStorage.removeItem("access"); localStorage.removeItem("user"); nav("/login"); };

  const hh=String(time.getHours()).padStart(2,"0");
  const mm=String(time.getMinutes()).padStart(2,"0");
  const ss=String(time.getSeconds()).padStart(2,"0");
  const ds=time.toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short"});

  /* ── helpers JSX ── */
  const Notif = () => !notif ? null : (
    <div className="nv-panel" style={{position:"absolute",top:44,right:0,width:320,background:T.surface,border:`1px solid ${T.divider}`,borderTop:`3px solid ${T.goldBright}`,borderRadius:"0 0 16px 16px",boxShadow:`0 24px 60px ${T.sh2}`,zIndex:600,overflow:"hidden"}}>
      <div style={{padding:"12px 16px 10px",borderBottom:`1px solid ${T.divider}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:T.goldPale}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <Bell size={12} color={T.gold}/>
          <span className="nv-f" style={{fontSize:12.5,fontStyle:"italic",color:T.textPri}}>Notifications</span>
          {total>0&&<span style={{fontSize:9,color:T.gold,fontWeight:700,background:`${T.gold}22`,padding:"2px 7px",borderRadius:20}}>{total}</span>}
        </div>
        <button onClick={()=>setNotif(false)} style={{width:20,height:20,borderRadius:5,background:T.divider,border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><X size={9} color={T.textMuted}/></button>
      </div>
      <div style={{maxHeight:280,overflowY:"auto"}}>
        {nLoad&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",gap:8}}><div className="nv-spin" style={{width:15,height:15,borderRadius:"50%",border:`2px solid ${T.divider}`,borderTopColor:T.goldViv}}/><span style={{fontSize:11,color:T.textMuted}}>Chargement…</span></div>}
        {!nLoad&&<>
          {counts.contacts>0&&<Link to="/contacts" onClick={()=>setNotif(false)} style={{textDecoration:"none"}}><div className="nv-ni" style={{padding:"11px 16px",borderBottom:`1px solid ${T.divider}`,display:"flex",gap:10,background:dark?"rgba(204,24,64,.06)":`${T.rose}04`}}><div style={{width:7,height:7,borderRadius:"50%",background:T.rose,flexShrink:0,marginTop:4,boxShadow:`0 0 0 3px ${T.rose}22`}}/><div style={{flex:1}}><p style={{fontSize:12,fontWeight:700,color:T.textPri}}>Messages en attente</p><p style={{fontSize:10.5,color:T.textMuted,marginTop:1}}>{counts.contacts} non traité(s)</p></div><span style={{fontSize:8.5,color:T.rose,fontWeight:700,background:`${T.rose}12`,padding:"2px 7px",borderRadius:5,flexShrink:0}}>Urgent</span></div></Link>}
          {counts.community>0&&<Link to="/listeCandidats" onClick={()=>setNotif(false)} style={{textDecoration:"none"}}><div className="nv-ni" style={{padding:"11px 16px",borderBottom:`1px solid ${T.divider}`,display:"flex",gap:10}}><div style={{width:7,height:7,borderRadius:"50%",background:T.brand,flexShrink:0,marginTop:4}}/><div style={{flex:1}}><p style={{fontSize:12,fontWeight:700,color:T.textPri}}>Candidatures</p><p style={{fontSize:10.5,color:T.textMuted,marginTop:1}}>{counts.community} à examiner</p></div></div></Link>}
          {nList.map((n,i)=><div key={i} className="nv-ni" style={{padding:"10px 16px",borderBottom:i<nList.length-1?`1px solid ${T.divider}`:"none",display:"flex",gap:10}}><div style={{width:7,height:7,borderRadius:"50%",flexShrink:0,marginTop:4,background:n.read?T.divider:T.brand}}/><div style={{flex:1,minWidth:0}}><p style={{fontSize:11.5,fontWeight:n.read?400:600,color:T.textPri,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.text}</p>{n.detail&&<p style={{fontSize:10,color:T.textMuted,marginTop:1}}>{n.detail}</p>}</div></div>)}
          {total===0&&nList.length===0&&<div style={{textAlign:"center",padding:"24px 16px"}}><CheckCircle2 size={20} color={T.green} style={{margin:"0 auto 8px",display:"block",opacity:.4}}/><p style={{fontSize:12,color:T.textMuted,fontWeight:600}}>Aucune notification</p></div>}
        </>}
      </div>
      {total>0&&<div style={{padding:"10px 16px 12px",borderTop:`1px solid ${T.divider}`,textAlign:"center"}}><Link to="/notifications" onClick={()=>setNotif(false)} style={{fontSize:11.5,fontWeight:700,color:T.brand,textDecoration:"none"}}>Voir tout →</Link></div>}
    </div>
  );

  return (
    <>
      <style>{CSS}</style>

      {/* ══ SIDEBAR ══ */}
      <aside className="nv nv-side" style={{
        position:"fixed",top:0,left:0,bottom:0,width:sw,
        background:SIDEBAR_BG,
        borderRight:`1px solid ${dark?"rgba(93,118,255,.10)":"rgba(26,59,140,.08)"}`,
        boxShadow:dark?"4px 0 60px rgba(0,0,0,.5),1px 0 0 rgba(93,118,255,.08)":"4px 0 40px rgba(13,27,62,.08),1px 0 0 rgba(26,59,140,.06)",
        zIndex:300,display:"flex",flexDirection:"column",overflow:"hidden",
      }}>
        {/* Décors */}
        <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:0}}>
          <div style={{position:"absolute",inset:0,backgroundImage:`radial-gradient(circle at 1px 1px,${dark?"rgba(93,118,255,.08)":"rgba(26,59,140,.05)"} 1px,transparent 0)`,backgroundSize:"28px 28px"}}/>
          {dark&&<><div className="nv-orb1" style={{position:"absolute",top:"-18%",left:"-30%",width:340,height:340,borderRadius:"50%",background:"radial-gradient(circle,rgba(26,59,140,.38) 0%,rgba(61,104,255,.12) 45%,transparent 70%)",filter:"blur(32px)"}}/><div className="nv-orb2" style={{position:"absolute",bottom:"-12%",right:"-20%",width:280,height:280,borderRadius:"50%",background:"radial-gradient(circle,rgba(11,175,122,.10) 0%,transparent 70%)",filter:"blur(36px)"}}/></>}
          {!dark&&<div className="nv-glow-line" style={{position:"absolute",top:"30%",width:"60%",height:1,background:"linear-gradient(90deg,transparent,rgba(26,59,140,.15),transparent)",filter:"blur(1px)"}}/>}
          <div style={{position:"absolute",top:0,left:0,right:0,height:4,display:"flex",zIndex:5}}>
            <div style={{flex:1,background:"linear-gradient(90deg,#B01010,#D42020)"}}/>
            <div style={{flex:1,background:`linear-gradient(90deg,${T.gold},${T.goldViv})`}}/>
            <div style={{flex:1,background:`linear-gradient(90deg,${T.green},${T.greenLight})`}}/>
          </div>
        </div>

        {/* Logo */}
        <div style={{marginTop:4,position:"relative",zIndex:2,padding:col?"13px 0":"14px 16px",borderBottom:`1px solid ${dark?"rgba(93,118,255,.08)":"rgba(26,59,140,.07)"}`,display:"flex",alignItems:"center",justifyContent:col?"center":"space-between",flexShrink:0,minHeight:TOPBAR_H}}>
          <Link to="/dashboardAdmin" style={{textDecoration:"none",display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:col?38:44,height:col?38:44,borderRadius:col?12:14,flexShrink:0,background:"#FFFFFF",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:dark?"0 0 0 1px rgba(93,118,255,.2),0 6px 24px rgba(0,0,0,.4)":"0 0 0 1px rgba(26,59,140,.12),0 4px 16px rgba(13,27,62,.12)",overflow:"hidden",transition:"width .28s,height .28s,border-radius .28s"}}>
              <img src={logo} alt="ONFPP" style={{width:"86%",height:"86%",objectFit:"contain"}}/>
            </div>
            {!col&&<div className="nv-fade"><p className="nv-f" style={{fontSize:15,color:dark?"#E8EFFF":T.brand,lineHeight:1.1}}>ONFPP</p><p style={{fontSize:7.5,fontWeight:600,letterSpacing:".28em",textTransform:"uppercase",marginTop:2,color:dark?"rgba(255,255,255,.25)":"rgba(26,59,140,.4)"}}>République de Guinée</p></div>}
          </Link>
          {!col&&<button className="nv-tog" onClick={()=>setCol(true)}><PanelLeftClose size={12}/></button>}
        </div>

        {col&&<div style={{display:"flex",justifyContent:"center",padding:"10px 0 4px",zIndex:2,position:"relative",flexShrink:0}}><button className="nv-tog" onClick={()=>setCol(false)} style={{width:36,height:36,borderRadius:10}}><PanelLeftOpen size={12}/></button></div>}

        {/* Profil card (déplié) */}
        {!col&&(
          <div className="nv-fade" style={{position:"relative",zIndex:2,margin:"10px 12px 6px",padding:"14px",borderRadius:16,background:dark?"rgba(255,255,255,.04)":"rgba(26,59,140,.04)",border:`1px solid ${dark?"rgba(93,118,255,.12)":"rgba(26,59,140,.09)"}`,backdropFilter:"blur(20px)"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{position:"relative",flexShrink:0}}>
                <div style={{width:44,height:44,borderRadius:13,background:dark?`linear-gradient(140deg,${rd.dot}50,${rd.dot}18)`:`linear-gradient(140deg,${BRAND_ACCENT}18,${BRAND_ACCENT}08)`,border:`1.5px solid ${dark?"rgba(255,255,255,.14)":"rgba(26,59,140,.15)"}`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:dark?`0 0 0 3px rgba(255,255,255,.04),0 8px 22px rgba(0,0,0,.3)`:"0 2px 14px rgba(26,59,140,.14)"}}>
                  <span className="nv-f" style={{fontSize:18,fontStyle:"italic",color:dark?"#fff":BRAND_ACCENT}}>{ini}</span>
                </div>
                <div style={{position:"absolute",bottom:-2,right:-2,width:13,height:13,borderRadius:4,background:online?T.greenLight:T.rose,border:`2px solid ${dark?"#0A1628":"#FFFFFF"}`,boxShadow:`0 0 8px ${online?T.greenLight:T.rose}60`}}/>
              </div>
              <div style={{minWidth:0,flex:1}}>
                <p className="nv-f" style={{fontSize:13.5,fontStyle:"italic",color:dark?"#E8EFFF":T.textPri,lineHeight:1.2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{name}</p>
                <span style={{display:"inline-flex",alignItems:"center",gap:5,marginTop:5,background:rb.bg,border:`1px solid ${rb.border}`,borderRadius:30,padding:"3px 10px 3px 7px",fontSize:8.5,fontWeight:600,color:rb.text}}>
                  <span style={{width:5,height:5,borderRadius:"50%",background:rb.dot,boxShadow:`0 0 6px ${rb.dot}80`,flexShrink:0}}/>{label}
                </span>
              </div>
            </div>
            <div style={{marginTop:11,paddingTop:10,borderTop:`1px solid ${dark?"rgba(255,255,255,.06)":"rgba(26,59,140,.07)"}`,display:"flex",alignItems:"center",gap:7}}>
              <Globe size={9} color={dark?"rgba(255,255,255,.2)":"rgba(26,59,140,.3)"}/>
              <span style={{fontSize:9,color:dark?"rgba(255,255,255,.28)":"rgba(26,59,140,.45)",fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{scope}</span>
            </div>
          </div>
        )}

        {/* Avatar mini (réduit) */}
        {col&&(
          <div style={{display:"flex",justifyContent:"center",padding:"8px 0 4px",zIndex:2,position:"relative",flexShrink:0}}>
            <div style={{position:"relative",width:38,height:38,borderRadius:12,background:dark?`linear-gradient(140deg,${rd.dot}50,${rd.dot}18)`:`linear-gradient(140deg,${BRAND_ACCENT}18,${BRAND_ACCENT}06)`,border:`1.5px solid ${dark?"rgba(255,255,255,.15)":"rgba(26,59,140,.12)"}`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 18px rgba(0,0,0,.12)"}}>
              <span className="nv-f" style={{fontSize:14,fontStyle:"italic",color:dark?"#fff":BRAND_ACCENT}}>{ini}</span>
              <div style={{position:"absolute",bottom:-2,right:-2,width:11,height:11,borderRadius:3,background:online?T.greenLight:T.rose,border:`2px solid ${dark?"#0A1628":"#FFFFFF"}`}}/>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="nv-scroll" style={{flex:1,overflowY:"auto",overflowX:"hidden",padding:"6px 9px 10px",position:"relative",zIndex:2}}>
          {!col&&<p className="nv-sec">Navigation</p>}
          {items.map((item,i)=>{
            const Icon=item.icon; const act=isAct(item.path);
            return(
              <Link key={i} to={item.path} className={`nv-item${act?" act":""}`} style={{justifyContent:col?"center":"flex-start",padding:col?"11px":"9px 12px",margin:col?"2px 0":"1.5px 0"}}>
                <Icon size={15} color={act?(dark?"#9AB0FF":BRAND_ACCENT):(dark?"rgba(255,255,255,.32)":"rgba(26,59,140,.38)")} style={{flexShrink:0,transition:"color .15s,filter .15s",filter:act?`drop-shadow(0 0 4px ${dark?"rgba(74,120,255,.6)":"rgba(26,59,140,.3)"})`:"none"}}/>
                <span style={{fontSize:12.5,fontWeight:act?600:400,color:act?(dark?"#E8EFFF":T.textPri):(dark?"rgba(255,255,255,.5)":"rgba(26,59,140,.6)"),overflow:"hidden",whiteSpace:"nowrap",opacity:col?0:1,maxWidth:col?0:195,transition:"opacity .2s,max-width .28s cubic-bezier(.16,1,.3,1)"}}>{item.label}</span>
                {col&&<span className="nv-tip">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bas */}
        <div style={{padding:"8px 9px 14px",borderTop:`1px solid ${dark?"rgba(93,118,255,.08)":"rgba(26,59,140,.07)"}`,flexShrink:0,zIndex:2,position:"relative",display:"flex",flexDirection:"column",gap:6}}>
          {col?(
            <div style={{display:"flex",justifyContent:"center",marginBottom:4}}>
              <button onClick={toggleTheme} style={{width:36,height:36,borderRadius:10,cursor:"pointer",border:`1px solid ${dark?"rgba(93,118,255,.25)":"rgba(26,59,140,.15)"}`,background:dark?"rgba(74,120,255,.15)":"rgba(26,59,140,.06)",display:"flex",alignItems:"center",justifyContent:"center",color:dark?"#9AB0FF":T.brand,transition:"all .15s"}} onMouseEnter={e=>e.currentTarget.style.background=dark?"rgba(74,120,255,.25)":"rgba(26,59,140,.12)"} onMouseLeave={e=>e.currentTarget.style.background=dark?"rgba(74,120,255,.15)":"rgba(26,59,140,.06)"}>
                {dark?<Sun size={14}/>:<Moon size={14}/>}
              </button>
            </div>
          ):(
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"4px 3px"}}>
              <span style={{fontSize:11,fontWeight:500,color:dark?"rgba(255,255,255,.28)":"rgba(26,59,140,.38)"}}>{dark?"Mode sombre":"Mode clair"}</span>
              <button className="nv-theme-toggle" onClick={toggleTheme}>
                <div className="nv-theme-knob">{dark?<Moon size={11} color="#fff"/>:<Sun size={11} color="#fff"/>}</div>
              </button>
            </div>
          )}
          <button onClick={logout} className="nv-item" style={{justifyContent:col?"center":"flex-start",padding:col?"11px":"9px 12px",background:dark?"rgba(204,24,64,.09)":"rgba(204,24,64,.05)",border:`1px solid ${dark?"rgba(204,24,64,.18)":"rgba(204,24,64,.12)"}`,borderRadius:11}} onMouseEnter={e=>e.currentTarget.style.background=dark?"rgba(204,24,64,.22)":"rgba(204,24,64,.12)"} onMouseLeave={e=>e.currentTarget.style.background=dark?"rgba(204,24,64,.09)":"rgba(204,24,64,.05)"}>
            <LogOut size={14} color={dark?"#FF9EAC":T.rose} style={{flexShrink:0}}/>
            <span style={{fontSize:12.5,fontWeight:600,color:dark?"#FF9EAC":T.rose,overflow:"hidden",whiteSpace:"nowrap",opacity:col?0:1,maxWidth:col?0:190,transition:"opacity .2s,max-width .28s cubic-bezier(.16,1,.3,1)"}}>Déconnexion</span>
            {col&&<span className="nv-tip" style={{background:"#5A0A18",border:"1px solid rgba(255,100,120,.2)"}}>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* ══ TOPBAR ══ */}
      <header className="nv" style={{position:"fixed",top:0,left:sw,right:0,height:TOPBAR_H,background:T.topbarBg,backdropFilter:"blur(24px) saturate(2)",borderBottom:`1px solid ${T.topbarBorder}`,boxShadow:dark?"0 1px 0 rgba(93,118,255,.06),0 4px 28px rgba(0,0,0,.25)":"0 1px 0 rgba(255,255,255,.9),0 4px 24px rgba(13,27,62,.05)",zIndex:200,display:"flex",alignItems:"center",padding:"0 22px",justifyContent:"space-between",transition:"left .32s cubic-bezier(.16,1,.3,1)"}}>
        {/* Gauche */}
        <div style={{display:"flex",alignItems:"center",gap:14,minWidth:0}}>
          <div style={{width:3,height:28,borderRadius:2,overflow:"hidden",flexShrink:0,display:"flex",flexDirection:"column"}}>
            <div style={{flex:1,background:"#D42020"}}/><div style={{flex:1,background:T.goldViv}}/><div style={{flex:1,background:T.greenLight}}/>
          </div>
          <div>
            <p className="nv-f" style={{fontSize:15.5,fontStyle:"italic",color:T.textPri,lineHeight:1.15,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:380}}>{curPage}</p>
            <p style={{fontSize:9,color:T.textMuted,fontWeight:600,marginTop:2,letterSpacing:".1em",textTransform:"uppercase"}}>ONFPP · Guinée</p>
          </div>
        </div>
        {/* Droite */}
        <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
          <div className="nv-stat">
            {online?<><div className="nv-live" style={{width:7,height:7,borderRadius:"50%",background:T.greenLight}}/><span style={{color:T.green,fontWeight:600}}>En ligne</span></>:<><div style={{width:7,height:7,borderRadius:"50%",background:T.rose}}/><span style={{color:T.rose,fontWeight:600}}>Session expirée</span></>}
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",padding:"5px 12px",borderRadius:9,background:T.iceFaint,border:`1px solid ${T.divider}`,cursor:"default"}}>
            <span className="nv-f" style={{fontSize:14,color:T.textPri,lineHeight:1,letterSpacing:".5px"}}>{hh}<span className="nv-blink" style={{color:T.brand}}>:</span>{mm}<span style={{fontSize:10,color:T.textMuted}}>:{ss}</span></span>
            <span style={{fontSize:7.5,color:T.textMuted,fontWeight:500,marginTop:2,textTransform:"capitalize",letterSpacing:".05em"}}>{ds}</span>
          </div>
          <button className="nv-btn" onClick={toggleTheme} title={dark?"Mode clair":"Mode sombre"}>{dark?<Sun size={14}/>:<Moon size={14}/>}</button>
          <div style={{width:1,height:20,background:T.divider,margin:"0 2px"}}/>
          <div ref={nRef} style={{position:"relative"}}>
            <button className={`nv-btn${notif?" on":""}`} onClick={()=>{setNotif(v=>!v);if(!nList.length)loadN();}}><Bell size={14}/></button>
            {total>0&&<span className="nv-badge" style={{position:"absolute",top:-5,right:-5,minWidth:17,height:17,borderRadius:10,background:T.rose,color:"#fff",fontSize:8,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 4px",border:`2.5px solid ${dark?"#06101E":"#F4F6FC"}`}}>{total>99?"99+":total}</span>}
            <Notif/>
          </div>
          <div style={{width:1,height:20,background:T.divider,margin:"0 2px"}}/>
          <div className="nv-chip" style={{display:"flex",alignItems:"center",gap:9,padding:"5px 13px 5px 5px",borderRadius:11,border:`1px solid ${T.divider}`,background:dark?"linear-gradient(135deg,rgba(255,255,255,.04),rgba(255,255,255,.02))":`linear-gradient(135deg,${T.surface},${T.iceFaint})`,boxShadow:`0 2px 8px ${T.sh1}`}}>
            <div style={{width:34,height:34,borderRadius:10,flexShrink:0,background:dark?`linear-gradient(135deg,${BRAND_ACCENT},#2451B8)`:`linear-gradient(135deg,${T.brand},${T.brandMid})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 14px ${dark?"rgba(74,120,255,.4)":"rgba(26,59,140,.22)"}`}}>
              <span className="nv-f" style={{fontSize:13,fontStyle:"italic",color:"#fff"}}>{ini}</span>
            </div>
            <div style={{minWidth:0}}>
              <p className="nv-f" style={{fontSize:12.5,fontStyle:"italic",color:T.textPri,lineHeight:1.2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:130}}>{name}</p>
              <span style={{display:"inline-flex",alignItems:"center",gap:4,marginTop:3,background:rl.bg,border:`1px solid ${rl.border}`,borderRadius:20,padding:"1.5px 8px 1.5px 5px",fontSize:8.5,fontWeight:600,color:rl.text}}>
                <span style={{width:4,height:4,borderRadius:"50%",background:rl.dot,flexShrink:0}}/>{label}
              </span>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}