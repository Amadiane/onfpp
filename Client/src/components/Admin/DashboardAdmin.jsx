import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap, BookOpen, ClipboardList, Award, BarChart3,
  Building2, CheckCircle2, Clock, FileText, Briefcase, PieChart,
  AlertTriangle, Package, UserCog, Settings, Layers, Users,
  Bell, CalendarDays, ShieldCheck, MapPin,
  TrendingUp, TrendingDown, Activity,
  LayoutDashboard, ChevronRight, Zap, UserCheck,
  Globe, ArrowUpRight, Target, Sparkles, Star,
  RefreshCw, Wifi, WifiOff,
} from "lucide-react";
import CONFIG from "../../config/config.js";
import { apiRequest } from "../../endpoints/api";

/* ═══════════════════════════════════════════════════════════════════
   PALETTE
═══════════════════════════════════════════════════════════════════ */
const C = {
  page:      "#F8F9FD",
  pageAlt:   "#EEF2FF",
  surface:   "#FFFFFF",
  surfaceEl: "#F4F7FF",
  frost:     "rgba(255,255,255,0.72)",
  navy:      "#06102A",
  navyMid:   "#0C1D5F",
  blue:      "#1635C8",
  blueViv:   "#2447E0",
  sky:       "#5073FF",
  iceBlue:   "#D0D9FF",
  textPri:   "#06102A",
  textSub:   "#3A4F8C",
  textMuted: "#8497C8",
  gold:      "#D4920A",
  goldLight: "#F5B020",
  goldPale:  "#FFF8E7",
  green:     "#047A5A",
  greenLight:"#0DA575",
  greenPale: "#E8FBF5",
  success:   "#047A5A",
  danger:    "#C81B1B",
  rose:      "#DC1D44",
  orange:    "#C05C0A",
  violet:    "#6A24D4",
  teal:      "#0A8A7C",
  purple:    "#5B21B6",
  divider:   "#E8EDFC",
  shadow:    "rgba(6,16,42,0.09)",
  shadowMd:  "rgba(6,16,42,0.15)",
  shadowLg:  "rgba(6,16,42,0.22)",
};

/* ═══════════════════════════════════════════════════════════════════
   DIVISIONS / ANTENNES — labels
═══════════════════════════════════════════════════════════════════ */
const DIVISION_LABELS = {
  DAP: "Division Apprentissage et Projets Collectifs",
  DSE: "Division Suivi Évaluation",
  DFC: "Division Formation Continue",
  DPL: "Division Planification",
};
const ANTENNE_LABELS = {
  conakry:    "Conakry",
  forecariah: "Forecariah",
  boke:       "Boké",
  kindia:     "Kindia",
  labe:       "Labé",
  mamou:      "Mamou",
  faranah:    "Faranah",
  kankan:     "Kankan",
  siguiri:    "Siguiri",
  nzerekore:  "N'Zérékoré",
};

/* ═══════════════════════════════════════════════════════════════════
   RÔLES
═══════════════════════════════════════════════════════════════════ */
const ROLE_LABELS = {
  "Directeur Général":          "Directeur Général",
  "Directeur Général Adjoint":  "Directeur Général Adjoint",
  "Chef de Division":           "Chef de Division",
  "Chef de Section":            "Chef de Section",
  "Chef d'Antenne":             "Chef d'Antenne",
  "Conseiller":                 "Conseiller",
  DG:"Directeur Général", CD:"Chef de Division",
  DR:"Directeur Général Adjoint", CC:"Chef d'Antenne",
  FORMATEUR:"Formateur", SUPERADMIN:"Super Administrateur",
};

const ROLE_STYLES = {
  "Directeur Général":         { bg:"#EBF0FF", text:"#1635C8", border:"#C0CEFF", dot:"#1635C8", accent:C.blue   },
  "Directeur Général Adjoint": { bg:"#EBF0FF", text:"#1635C8", border:"#C0CEFF", dot:"#1635C8", accent:C.blue   },
  "Chef de Division":          { bg:"#EBF0FF", text:"#1635C8", border:"#C0CEFF", dot:"#1635C8", accent:C.blue   },
  "Chef de Section":           { bg:"#E6F7F4", text:"#047A5A", border:"#9EE5D2", dot:"#0DA575", accent:C.green  },
  "Chef d'Antenne":            { bg:"#FFF5E6", text:"#C05C0A", border:"#FDDBA8", dot:"#D97706", accent:C.orange },
  "Conseiller":                { bg:"#F2EEFF", text:"#6A24D4", border:"#CBBAF8", dot:"#7C3AED", accent:C.violet },
  DG:         { bg:"#EBF0FF", text:"#1635C8", border:"#C0CEFF", dot:"#1635C8", accent:C.blue   },
  CD:         { bg:"#EBF0FF", text:"#1635C8", border:"#C0CEFF", dot:"#1635C8", accent:C.blue   },
  DR:         { bg:"#EBF0FF", text:"#1635C8", border:"#C0CEFF", dot:"#1635C8", accent:C.blue   },
  CC:         { bg:"#FFF5E6", text:"#C05C0A", border:"#FDDBA8", dot:"#D97706", accent:C.orange },
  SUPERADMIN: { bg:"#FDEAEA", text:"#C81B1B", border:"#F6B4B4", dot:"#DC1D44", accent:C.danger },
};
const rs = r => ROLE_STYLES[r] || ROLE_STYLES.DG;

const resolveGroup = role => {
  if (!role) return "DG";
  const r = (role?.name || role || "").toString();
  if (["Directeur Général","Directeur Général Adjoint","Chef de Division","DG","CD","DR","SUPERADMIN"].some(x => r.includes(x) || x === r)) {
    if (r.includes("Division") || r === "CD") return "CS";
    return "DG";
  }
  if (r.includes("Section")) return "CS";
  if (r.includes("Antenne") || r === "CC") return "CA";
  if (r.includes("Formateur") || r === "FORMATEUR") return "F";
  if (r.includes("Conseiller")) return "C";
  return "DG";
};

const getRoleName = (role) => {
  if (!role) return "Directeur Général";
  if (typeof role === "object") return role.name || "Directeur Général";
  return role;
};

const getRoleLevel = (role) => {
  if (!role) return 100;
  if (typeof role === "object") return role.level || 0;
  return 0;
};

/* ═══════════════════════════════════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════════════════════════════════ */
const buildNavCategories = role => {
  const g = resolveGroup(role);
  const DG_CS=["DG","CS"], DG_CS_CA=["DG","CS","CA"], ALL_OP=["DG","CS","CA","F"], ALL=["DG","CS","CA","F","C","E"];
  const all = [
    { section:"Formations", color:"#2447E0", icon:BookOpen, groups:ALL, items:[
      { path:"/formations",     label:"Catalogue formations", icon:BookOpen,      groups:ALL },
      { path:"/sessions",       label:"Sessions planifiées",  icon:CalendarDays,  groups:ALL },
      { path:"/programmes",     label:"Programmes & modules", icon:Layers,        groups:DG_CS_CA },
      { path:"/certifications", label:"Certifications",       icon:Award,         groups:ALL },
    ]},
    { section:"Apprenants", color:"#0891B2", icon:GraduationCap, groups:ALL_OP, items:[
      { path:"/inscription",    label:"Inscriptions",         icon:GraduationCap, groups:ALL_OP },
      { path:"/apprenants",     label:"Apprenants actifs",    icon:GraduationCap, groups:ALL_OP },
      { path:"/listeCandidats", label:"Inscrits & candidats", icon:UserCheck,     groups:DG_CS_CA },
      { path:"/validation",     label:"Validation dossiers",  icon:CheckCircle2,  groups:DG_CS_CA },
      { path:"/suivi",          label:"Suivi pédagogique",    icon:ClipboardList, groups:ALL_OP },
      { path:"/insertion",      label:"Insertion",            icon:ClipboardList, groups:ALL_OP },
    ]},
    { section:"Présences & Notes", color:C.green, icon:ClipboardList, groups:["CA","F"], items:[
      { path:"/presences",   label:"Feuilles de présence", icon:CalendarDays,  groups:["CA","F"] },
      { path:"/evaluations", label:"Notes & évaluations",  icon:Award,         groups:["CA","F"] },
      { path:"/discipline",  label:"Discipline",           icon:AlertTriangle, groups:["CA","F"] },
    ]},
    { section:"Suivi complet", color:C.green, icon:ClipboardList, groups:DG_CS, items:[
      { path:"/presences",         label:"Présences",             icon:CalendarDays, groups:DG_CS },
      { path:"/evaluations",       label:"Évaluations",           icon:Award,        groups:DG_CS },
      { path:"/resultats",         label:"Résultats finaux",      icon:CheckCircle2, groups:DG_CS },
      { path:"/attestations",      label:"Attestations PDF",      icon:FileText,     groups:DG_CS },
      { path:"/enquete-insertion", label:"Enquête insertion",     icon:Clock,        groups:DG_CS },
      { path:"/relances",          label:"Relances automatiques", icon:Bell,         groups:["DG"] },
    ]},
    { section:"Fin de session", color:C.gold, icon:CheckCircle2, groups:["CA","F"], items:[
      { path:"/resultats",         label:"Résultats finaux",  icon:CheckCircle2, groups:["CA","F"] },
      { path:"/attestations",      label:"Attestations PDF",  icon:FileText,     groups:["CA","F"] },
      { path:"/enquete-insertion", label:"Enquête insertion", icon:Clock,        groups:["CA"] },
    ]},
    { section:"Entreprises", color:"#B45309", icon:Briefcase, groups:["DG","CS","E"], items:[
      { path:"/entreprises",   label:"Base des entreprises", icon:Briefcase, groups:["DG","CS","E"] },
      { path:"/offres-emploi", label:"Offres d'emploi",      icon:Package,   groups:["DG","CS","E"] },
    ]},
    { section:"Rapports", color:C.violet, icon:BarChart3, groups:["DG","CS","CA","C"], items:[
      { path:"/statistiques",      label:"Statistiques globales",   icon:PieChart,  groups:["DG"] },
      { path:"/statistiques",      label:"Statistiques de section", icon:PieChart,  groups:["CS"] },
      { path:"/statistiques",      label:"Statistiques antenne",    icon:BarChart3, groups:["CA"] },
      { path:"/statistiques",      label:"Statistiques",            icon:BarChart3, groups:["C"] },
      { path:"/dashboardRegional", label:"Tableau régional",        icon:MapPin,    groups:["DG","CS"] },
      { path:"/rapports",          label:"Rapports & exports",      icon:FileText,  groups:["DG","CS","CA"] },
    ]},
    { section:"Centres & Équipes", color:"#4338CA", icon:Building2, groups:["DG","CS"], items:[
      { path:"/centresFormation", label:"Antennes de formation", icon:Building2, groups:["DG","CS"] },
      { path:"/teamMessage",      label:"Équipe & formateurs",   icon:Users,     groups:["DG","CS","CA"] },
      { path:"/partnerPost",      label:"Partenaires",           icon:Package,   groups:["DG"] },
    ]},
    { section:"Administration", color:"#475569", icon:Settings, groups:["DG"], items:[
      { path:"/utilisateurs", label:"Gestion utilisateurs", icon:UserCog, groups:["DG"] },
      { path:"/parametres",   label:"Paramètres système",   icon:Settings, groups:["DG"] },
      { path:"/homePost",     label:"Contenu site public",  icon:Layers,  groups:["DG"] },
    ]},
  ];
  return all
    .filter(c => c.groups.includes(g))
    .map(c => ({ ...c, items: c.items.filter(i => i.groups.includes(g)).filter((i,idx,a) => a.findIndex(x=>x.path===i.path&&x.label===i.label)===idx) }))
    .filter(c => c.items.length > 0);
};

/* ═══════════════════════════════════════════════════════════════════
   getStoredUser
═══════════════════════════════════════════════════════════════════ */
const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    if (raw) {
      const p = JSON.parse(raw);
      return {
        username:  p.username  || p.email || "",
        firstName: p.first_name || p.firstName || null,
        lastName:  p.last_name  || p.lastName  || null,
        role:      p.role   || "Directeur Général",
        niveau:    p.niveau ?? 0,
        region:    p.region || null,
        centre:    p.centre || null,
        division:  p.division || null,
        antenne:   p.antenne  || null,
      };
    }
    const token = localStorage.getItem("access");
    if (token) {
      const p = JSON.parse(atob(token.split(".")[1]));
      return {
        username:  p.username  || p.email || "",
        firstName: p.first_name || null,
        lastName:  p.last_name  || null,
        role:      p.role    || "Directeur Général",
        niveau:    p.niveau  ?? 0,
        region:    p.region  || null,
        centre:    p.centre  || null,
        division:  p.division || null,
        antenne:   p.antenne  || null,
      };
    }
  } catch {}
  return { username:"Admin", role:"Directeur Général", niveau:0 };
};

/* ═══════════════════════════════════════════════════════════════════
   HOOK — données réelles depuis /api/dashboard/
═══════════════════════════════════════════════════════════════════ */
function useDashboardData() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      // Charge en parallèle : dashboard stats + liste users (filtrée par backend)
      const [dashRes, usersRes] = await Promise.allSettled([
        apiRequest("/api/dashboard/"),
        apiRequest(CONFIG.API_USER_LIST),
      ]);

      const dash  = dashRes.status  === "fulfilled" ? dashRes.value  : null;
      const users = usersRes.status === "fulfilled" ? usersRes.value : [];

      setData({ dash, users: Array.isArray(users) ? users : [] });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  return { data, loading, error, refetch: fetchData };
}

/* ═══════════════════════════════════════════════════════════════════
   CSS
═══════════════════════════════════════════════════════════════════ */
const DASH_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  .da  { font-family:'Outfit',sans-serif; -webkit-font-smoothing:antialiased; }
  .da-serif { font-family:'Fraunces',serif !important; }

  .da-page::before {
    content:''; position:fixed; inset:0; pointer-events:none; z-index:0;
    background-image: radial-gradient(circle at 1px 1px, rgba(22,53,200,.055) 1px, transparent 0);
    background-size: 28px 28px;
  }
  .da-kpi { transition: transform .26s cubic-bezier(.34,1.5,.64,1), box-shadow .26s ease; cursor:default; }
  .da-kpi:hover { transform:translateY(-7px) scale(1.012); box-shadow:0 28px 60px var(--kglow), 0 8px 20px rgba(6,16,42,.12) !important; }
  .da-sec { transition: box-shadow .2s, border-color .2s; }
  .da-sec:hover { box-shadow:0 12px 48px rgba(6,16,42,.12) !important; border-color:rgba(22,53,200,.18) !important; }
  .da-mod { transition:background .15s, border-left-color .16s, padding-left .2s cubic-bezier(.34,1.3,.64,1); }
  .da-mod:hover { background:${C.pageAlt} !important; border-left-color:var(--mc) !important; padding-left:20px !important; }
  .da-mod:hover .da-arr { transform:translateX(5px); opacity:1 !important; }
  .da-ql { transition:all .18s cubic-bezier(.34,1.2,.64,1); }
  .da-ql:hover { transform:translateY(-3px); box-shadow:0 10px 30px rgba(6,16,42,.13) !important; border-color:${C.iceBlue} !important; background:${C.surface} !important; }
  .da-act { transition:background .12s; border-radius:10px; }
  .da-act:hover { background:${C.surfaceEl} !important; }
  .da-gs { transition:all .15s; cursor:default; }
  .da-gs:hover { transform:translateY(-2px); background:${C.surface} !important; box-shadow:0 6px 20px rgba(6,16,42,.1) !important; }
  .da-tab { transition:all .18s ease; cursor:pointer; }
  .da-tab:hover { background:${C.pageAlt} !important; }
  .da-ni { transition:background .12s; }
  .da-ni:hover { background:${C.surfaceEl} !important; }
  .da-urow { transition:background .12s; }
  .da-urow:hover { background:#F0F4FF !important; }
  .da-refr { transition:transform .3s; }
  .da-refr:hover { transform:rotate(180deg); }

  @keyframes daUp { from{opacity:0;transform:translateY(20px) scale(.985)} to{opacity:1;transform:translateY(0) scale(1)} }
  .da-in { animation:daUp .5s cubic-bezier(.22,1,.36,1) both; }
  .da-d0{animation-delay:.0s} .da-d1{animation-delay:.07s} .da-d2{animation-delay:.14s}
  .da-d3{animation-delay:.21s} .da-d4{animation-delay:.28s} .da-d5{animation-delay:.36s}

  @keyframes daPulse { 0%,100%{box-shadow:0 0 0 0 rgba(220,29,68,.5)} 60%{box-shadow:0 0 0 7px rgba(220,29,68,0)} }
  .da-badge { animation:daPulse 2.4s ease infinite; }

  @keyframes daBar { from{width:0} to{width:var(--bw)} }
  .da-bar { animation:daBar 1.1s cubic-bezier(.22,1,.36,1) both; }

  @keyframes daBlink { 0%,49%{opacity:1} 50%,100%{opacity:.2} }
  .da-blink { animation:daBlink 1s step-end infinite; }

  @keyframes daDrop { from{opacity:0;transform:translateY(-10px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  .da-notif-panel { animation:daDrop .2s cubic-bezier(.22,1,.36,1) both; }

  @keyframes daAurora { 0%,100%{opacity:.55;transform:scale(1) translateX(0)} 50%{opacity:.75;transform:scale(1.08) translateX(20px)} }
  .da-aurora { animation:daAurora 9s ease-in-out infinite; }

  @keyframes daSpin { to{transform:rotate(360deg)} }
  .da-spin { animation:daSpin .8s linear infinite; }

  @keyframes daPulseGlow {
    0%,100%{box-shadow:0 0 0 0 rgba(22,53,200,.25)}
    50%{box-shadow:0 0 0 8px rgba(22,53,200,0)}
  }
  .da-live { animation:daPulseGlow 2s ease infinite; }

  @media(max-width:1200px){.da-layout{grid-template-columns:1fr !important;} .da-sidebar{display:none !important;}}
  @media(max-width:780px){.da-kpi-grid{grid-template-columns:1fr 1fr !important;} .da-hero-inner{flex-direction:column !important;gap:22px !important;} .da-hero-right{align-items:flex-start !important;} .da{padding:76px 14px 52px !important;}}
  @media(max-width:480px){.da-kpi-grid{grid-template-columns:1fr !important;}}
`;

/* ═══════════════════════════════════════════════════════════════════
   SOUS-COMPOSANTS
═══════════════════════════════════════════════════════════════════ */

const NBadge = ({ n }) => n > 0 ? (
  <span className="da-badge" style={{ position:"absolute", top:-6, right:-6, minWidth:19, height:19, borderRadius:12, background:C.rose, color:"#fff", fontSize:9.5, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 5px", border:"2.5px solid #F8F9FD", fontFamily:"'Outfit',sans-serif" }}>{n}</span>
) : null;

/* Skeleton loader */
const Skeleton = ({ w = "100%", h = 18, r = 8 }) => (
  <div style={{ width:w, height:h, borderRadius:r, background:`linear-gradient(90deg,${C.surfaceEl} 25%,${C.divider} 50%,${C.surfaceEl} 75%)`, backgroundSize:"200% 100%", animation:"daBar 1.5s ease infinite" }}/>
);

/* KPI Card */
const KpiCard = ({ label, value, trend, up, icon:Icon, color, sub, delay=0, loading=false }) => {
  const flat   = up === null;
  const tColor = flat ? C.textMuted : up ? C.green : C.danger;
  const tBg    = flat ? C.surfaceEl : up ? C.greenPale : "#FDEAEA";
  const TIcon  = flat ? null : up ? TrendingUp : TrendingDown;
  return (
    <div className={`da-kpi da-in da-d${delay}`} style={{ "--kglow":`${color}28`, background:C.surface, borderRadius:20, padding:"24px 22px", border:`1px solid ${C.divider}`, boxShadow:`0 2px 16px ${C.shadow}, 0 0 0 1px rgba(255,255,255,.7) inset`, display:"flex", flexDirection:"column", gap:18, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${color},${color}44)`, borderRadius:"20px 20px 0 0" }}/>
      <div style={{ position:"absolute", bottom:-30, right:-30, width:120, height:120, borderRadius:"50%", background:`${color}0C`, pointerEvents:"none" }}/>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", position:"relative" }}>
        <div style={{ width:50, height:50, borderRadius:15, background:`linear-gradient(135deg,${color}18,${color}0A)`, border:`1.5px solid ${color}25`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 4px 16px ${color}18` }}>
          <Icon size={22} color={color}/>
        </div>
        {loading ? <Skeleton w={60} h={24} r={12}/> : (
          <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, fontWeight:700, padding:"4px 11px", borderRadius:20, background:tBg, color:tColor, fontFamily:"'Outfit',sans-serif", border:`1px solid ${tColor}1A` }}>
            {TIcon && <TIcon size={9}/>}
            {trend === "—" ? "stable" : trend}
          </span>
        )}
      </div>
      <div style={{ position:"relative" }}>
        {loading ? (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <Skeleton w="60%" h={34} r={6}/>
            <Skeleton w="80%" h={14} r={6}/>
            <Skeleton w="50%" h={12} r={6}/>
          </div>
        ) : (
          <>
            <p className="da-serif" style={{ fontSize:34, fontWeight:700, color:C.textPri, lineHeight:1, letterSpacing:"-1px" }}>{value}</p>
            <p style={{ fontSize:12.5, color:C.textSub, marginTop:7, fontWeight:500 }}>{label}</p>
            <p style={{ fontSize:11, color:C.textMuted, marginTop:3 }}>{sub}</p>
          </>
        )}
      </div>
    </div>
  );
};

/* Section header */
const SHdr = ({ icon:Icon, title, color, count, badge }) => (
  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
    <div style={{ width:4, height:26, borderRadius:3, background:color, flexShrink:0 }}/>
    <div style={{ width:32, height:32, borderRadius:9, background:`${color}14`, border:`1px solid ${color}22`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <Icon size={15} color={color}/>
    </div>
    <p className="da-serif" style={{ flex:1, fontSize:13.5, fontWeight:600, color:C.textPri, letterSpacing:"-0.1px" }}>{title}</p>
    {badge && <span style={{ fontSize:10, fontWeight:700, color:"#fff", background:C.rose, borderRadius:20, padding:"2px 8px", fontFamily:"'Outfit',sans-serif" }}>{badge}</span>}
    {count && <span style={{ fontSize:10, fontWeight:700, color, background:`${color}12`, border:`1px solid ${color}22`, borderRadius:20, padding:"2px 9px", fontFamily:"'Outfit',sans-serif" }}>{count}</span>}
  </div>
);

/* Module row */
const ModRow = ({ label, icon:Icon, path, color }) => (
  <Link to={path || "#"} style={{ textDecoration:"none" }}>
    <div className="da-mod" style={{ "--mc":color, background:C.surfaceEl, border:`1px solid ${C.divider}`, borderLeft:"3px solid transparent", borderRadius:10, padding:"10px 14px", display:"flex", alignItems:"center", gap:11 }}>
      <div style={{ width:30, height:30, borderRadius:8, flexShrink:0, background:`${color}12`, border:`1px solid ${color}1E`, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Icon size={13} color={color}/>
      </div>
      <p style={{ flex:1, fontSize:12.5, fontWeight:500, color:C.textSub, minWidth:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", fontFamily:"'Outfit',sans-serif" }}>{label}</p>
      <ChevronRight className="da-arr" size={13} color={C.textMuted} style={{ flexShrink:0, opacity:.3, transition:"all .2s" }}/>
    </div>
  </Link>
);

/* Section box */
const SBox = ({ icon, title, color, children, count, delay="da-d1", badge }) => (
  <div className={`da-sec da-in ${delay}`} style={{ background:C.surface, borderRadius:20, padding:"22px", border:`1px solid ${C.divider}`, boxShadow:`0 2px 18px ${C.shadow}` }}>
    <SHdr icon={icon} title={title} color={color} count={count} badge={badge}/>
    {children}
  </div>
);

/* Quick link */
const QL = ({ path, label, icon:Icon, color }) => (
  <Link to={path || "#"} style={{ textDecoration:"none", flex:"1 1 calc(50% - 5px)", minWidth:0 }}>
    <div className="da-ql" style={{ display:"flex", alignItems:"center", gap:9, padding:"11px 13px", borderRadius:12, background:C.surfaceEl, border:`1px solid ${C.divider}`, cursor:"pointer" }}>
      <div style={{ width:32, height:32, borderRadius:9, background:`${color}14`, border:`1px solid ${color}20`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <Icon size={14} color={color}/>
      </div>
      <span style={{ fontSize:12, fontWeight:600, color:C.textSub, flex:1, minWidth:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", fontFamily:"'Outfit',sans-serif" }}>{label}</span>
      <ArrowUpRight size={11} color={C.textMuted} style={{ flexShrink:0, opacity:.55 }}/>
    </div>
  </Link>
);

/* Bandeau périmètre (division/antenne) */
const ScopeBanner = ({ division, antenne, niveau }) => {
  if (niveau >= 90) return null;
  const isDivision = division && [70, 60].includes(niveau);
  const isAntenne  = antenne  && [50, 30].includes(niveau);
  if (!isDivision && !isAntenne) return null;

  const label = isDivision
    ? `Division — ${DIVISION_LABELS[division] || division}`
    : `Antenne — ${ANTENNE_LABELS[antenne] || antenne}`;
  const color = isDivision ? C.blue : "#0891B2";
  const icon  = isDivision ? "🏢" : "📍";

  return (
    <div className="da-in da-d0" style={{
      background:`linear-gradient(90deg, ${color}08, ${color}04)`,
      border:`1px solid ${color}28`,
      borderLeft:`4px solid ${color}`,
      borderRadius:14, padding:"14px 20px", marginBottom:20,
      display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:38, height:38, borderRadius:11, background:`${color}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{icon}</div>
        <div>
          <p style={{ fontSize:10, fontWeight:700, color, letterSpacing:".12em", textTransform:"uppercase", fontFamily:"'Outfit',sans-serif" }}>
            Votre périmètre d'accès
          </p>
          <p style={{ fontSize:14, fontWeight:700, color:C.textPri, marginTop:3, fontFamily:"'Outfit',sans-serif" }}>{label}</p>
        </div>
      </div>
      <span style={{ fontSize:11, fontWeight:600, color, background:`${color}12`, border:`1px solid ${color}22`, borderRadius:20, padding:"4px 14px", fontFamily:"'Outfit',sans-serif" }}>
        Accès restreint à ce périmètre
      </span>
    </div>
  );
};

/* Tableau des utilisateurs filtrés */
const UsersTable = ({ users, loading, niveau }) => {
  const NIVEAU_BADGE = {
    100:{ bg:"#FEF3C7", text:"#92400E" },
    90: { bg:"#EDE9FE", text:"#5B21B6" },
    70: { bg:"#DBEAFE", text:"#1D4ED8" },
    60: { bg:"#D1FAE5", text:"#065F46" },
    50: { bg:"#FFE4E6", text:"#9F1239" },
    30: { bg:"#F0F4FF", text:"#3730A3" },
  };

  return (
    <div style={{ overflowX:"auto", borderRadius:14, border:`1px solid ${C.divider}` }}>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead>
          <tr style={{ background:C.surfaceEl, borderBottom:`1.5px solid ${C.divider}` }}>
            {["Utilisateur","Rôle","Affectation","Statut"].map((h,i) => (
              <th key={h} style={{ textAlign:"left", padding:"11px 16px", fontSize:10, fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", color:C.textMuted, fontFamily:"'Outfit',sans-serif" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? Array(3).fill(0).map((_,i) => (
            <tr key={i} style={{ borderBottom:`1px solid ${C.divider}` }}>
              {[1,2,3,4].map(j => <td key={j} style={{ padding:"14px 16px" }}><Skeleton h={14} r={6}/></td>)}
            </tr>
          )) : users.slice(0, 8).map((u, i) => {
            const level   = u.role?.level;
            const nb      = NIVEAU_BADGE[level] || { bg:C.iceBlue, text:C.navy };
            const roleName = u.role?.name || "—";
            const initiale = (u.first_name?.[0] || u.username?.[0] || "?").toUpperCase();
            return (
              <tr key={u.id} className="da-urow" style={{ borderBottom: i < users.length - 1 ? `1px solid ${C.divider}` : "none" }}>
                <td style={{ padding:"12px 16px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:9, background:`${nb.bg}`, border:`1.5px solid ${nb.text}20`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:nb.text, flexShrink:0, fontFamily:"'Outfit',sans-serif" }}>{initiale}</div>
                    <div>
                      <p style={{ margin:0, fontWeight:700, fontSize:13, color:C.textPri, fontFamily:"'Outfit',sans-serif" }}>{u.username}</p>
                      <p style={{ margin:0, fontSize:11, color:C.textMuted }}>{u.first_name} {u.last_name}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding:"12px 16px" }}>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:999, fontSize:11, fontWeight:700, background:nb.bg, color:nb.text, fontFamily:"'Outfit',sans-serif" }}>
                    <span style={{ width:5, height:5, borderRadius:"50%", background:nb.text }}/>
                    {roleName}
                  </span>
                </td>
                <td style={{ padding:"12px 16px", fontSize:12, color:C.textSub }}>
                  {u.division && <span style={{ display:"inline-block", background:`${C.blue}10`, color:C.blue, borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:600, marginRight:4 }}>🏢 {u.division}</span>}
                  {u.antenne  && <span style={{ display:"inline-block", background:"#0891B210", color:"#0891B2", borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:600 }}>📍 {ANTENNE_LABELS[u.antenne] || u.antenne}</span>}
                  {!u.division && !u.antenne && <span style={{ color:C.textMuted }}>—</span>}
                </td>
                <td style={{ padding:"12px 16px" }}>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:11, fontWeight:600, color:u.is_active !== false ? C.green : C.danger, fontFamily:"'Outfit',sans-serif" }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", background:u.is_active !== false ? C.green : C.danger }}/>
                    {u.is_active !== false ? "Actif" : "Inactif"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!loading && users.length === 0 && (
        <div style={{ textAlign:"center", padding:"40px 0", color:C.textMuted }}>
          <div style={{ fontSize:36, marginBottom:8 }}>👥</div>
          <p style={{ fontWeight:600, fontSize:13, fontFamily:"'Outfit',sans-serif" }}>Aucun utilisateur dans votre périmètre</p>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
═══════════════════════════════════════════════════════════════════ */
const DashboardAdmin = () => {
  const [time,      setTime]      = useState(new Date());
  const [notifOpen, setNotifOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("modules");
  const [notifPos,  setNotifPos]  = useState({ top:0, right:0 });
  const bellRef = useRef(null);

  const user        = getStoredUser();
  const roleName    = getRoleName(user.role);
  const roleLevel   = getRoleLevel(user.role) || user.niveau || 0;
  const roleLabel   = ROLE_LABELS[roleName] || roleName;
  const rStyle      = rs(roleName);
  const group       = resolveGroup(roleName);

  const displayName = user.firstName
    ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
    : user.username || "Admin";
  const initials = displayName.split(" ").filter(Boolean).map(w => w[0]).slice(0,2).join("").toUpperCase() || "?";

  const sections = buildNavCategories(roleName);
  const totalMod = sections.reduce((a, s) => a + s.items.length, 0);
  const isDG     = group === "DG" && roleLevel >= 90;

  // ── Données réelles ──────────────────────────────────────
  const { data: apiData, loading: apiLoading, error: apiError, refetch } = useDashboardData();
  const dash  = apiData?.dash  || null;
  const users = apiData?.users || [];

  // ── KPIs dynamiques selon rôle ───────────────────────────
  const buildKpis = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.is_active !== false).length;

    // Compter divisions/antennes uniques dans le périmètre
    const uniqueDivisions = [...new Set(users.map(u => u.division).filter(Boolean))].length;
    const uniqueAntennes  = [...new Set(users.map(u => u.antenne).filter(Boolean))].length;

    if (roleLevel >= 90) {
      // DG / DGA — vue globale
      return [
        { label:"Utilisateurs actifs",   value:activeUsers.toString(), trend:"+", up:true, icon:Users,     color:"#2447E0", sub:`${totalUsers} enregistrés`,      delay:1 },
        { label:"Divisions couvertes",   value:uniqueDivisions.toString(), trend:"—", up:null, icon:Building2, color:C.gold,   sub:"divisions actives",            delay:2 },
        { label:"Antennes",              value:uniqueAntennes.toString(),  trend:"—", up:null, icon:MapPin,    color:C.green,  sub:"antennes enregistrées",         delay:3 },
        { label:"Périmètre",             value:"Global", trend:"—", up:null, icon:Globe,     color:C.violet, sub:"accès complet plateforme",                       delay:4 },
      ];
    }
    if ([70, 60].includes(roleLevel)) {
      // Chef de Division / Section
      const maDiv = user.division || dash?.ma_division;
      return [
        { label:"Membres de ma division", value:totalUsers.toString(),  trend:"—", up:null, icon:Users,     color:"#2447E0", sub:`division ${maDiv || "—"}`,       delay:1 },
        { label:"Membres actifs",         value:activeUsers.toString(), trend:"—", up:null, icon:CheckCircle2, color:C.green, sub:"comptes actifs",                delay:2 },
        { label:"Ma division",            value:maDiv || "—",           trend:"—", up:null, icon:Building2, color:C.gold,   sub:DIVISION_LABELS[maDiv] || "—",    delay:3 },
        { label:"Antennes liées",         value:uniqueAntennes.toString(), trend:"—", up:null, icon:MapPin, color:C.violet, sub:"dans votre division",             delay:4 },
      ];
    }
    if ([50, 30].includes(roleLevel)) {
      // Chef d'Antenne / Conseiller
      const monAnt = user.antenne || dash?.mon_antenne;
      return [
        { label:"Membres de mon antenne", value:totalUsers.toString(),  trend:"—", up:null, icon:Users,     color:"#2447E0", sub:`antenne ${ANTENNE_LABELS[monAnt] || monAnt || "—"}`, delay:1 },
        { label:"Membres actifs",         value:activeUsers.toString(), trend:"—", up:null, icon:CheckCircle2, color:C.green, sub:"comptes actifs",                delay:2 },
        { label:"Mon antenne",            value:ANTENNE_LABELS[monAnt] || monAnt || "—", trend:"—", up:null, icon:MapPin, color:C.gold, sub:"votre périmètre",    delay:3 },
        { label:"Votre rôle",             value:roleLabel,              trend:"—", up:null, icon:ShieldCheck, color:C.violet, sub:`niveau ${roleLevel}`,          delay:4 },
      ];
    }
    // Défaut
    return [
      { label:"Mon espace",  value:displayName, trend:"—", up:null, icon:Users,    color:"#2447E0", sub:roleLabel, delay:1 },
      { label:"Niveau",      value:roleLevel.toString(), trend:"—", up:null, icon:ShieldCheck, color:C.gold, sub:"niveau d'accès", delay:2 },
    ];
  };

  const kpis = buildKpis();

  // ── Activité récente depuis les users ────────────────────
  const recentUsers = [...users]
    .sort((a, b) => new Date(b.date_joined || 0) - new Date(a.date_joined || 0))
    .slice(0, 5)
    .map(u => ({
      text:   `${u.username} — compte enregistré`,
      detail: `${u.role?.name || "—"} · ${u.division ? `Division ${u.division}` : u.antenne ? `Antenne ${ANTENNE_LABELS[u.antenne] || u.antenne}` : "Accès global"}`,
      time:   u.date_joined ? new Date(u.date_joined).toLocaleDateString("fr-FR") : "Récemment",
      color:  "#2447E0",
      type:   "utilisateur",
    }));

  // ── Tabs ─────────────────────────────────────────────────
  const tabs = [
    { id:"modules",      label:"Modules",          icon:LayoutDashboard },
    { id:"activite",     label:"Utilisateurs",      icon:Users },
    { id:"statistiques", label:"Mon périmètre",     icon:Activity },
  ];

  // ── Horloge ──────────────────────────────────────────────
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  useEffect(() => {
    if (!notifOpen) return;
    const h = e => { if (bellRef.current && !bellRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [notifOpen]);

  const openNotif = () => {
    if (bellRef.current) {
      const r = bellRef.current.getBoundingClientRect();
      setNotifPos({ top:r.bottom + 12, right:window.innerWidth - r.right });
    }
    setNotifOpen(v => !v);
  };

  const hh = String(time.getHours()).padStart(2,"0");
  const mm = String(time.getMinutes()).padStart(2,"0");
  const ss = String(time.getSeconds()).padStart(2,"0");
  const greeting  = time.getHours() < 12 ? "Bonjour" : time.getHours() < 18 ? "Bon après-midi" : "Bonsoir";
  const dateStr   = time.toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long", year:"numeric" });

  // ── Division / Antenne de l'user (multi-source) ──────────
  const userDivision = user.division || dash?.ma_division || null;
  const userAntenne  = user.antenne  || dash?.mon_antenne  || null;

  const unread = Math.min(recentUsers.length, 3);

  return (
    <>
      <style>{DASH_CSS}</style>
      <div className="da da-page" style={{ minHeight:"100vh", background:`radial-gradient(ellipse 110% 60% at 60% -10%, rgba(22,53,200,.07) 0%, transparent 65%), ${C.page}`, padding:"84px 30px 64px", position:"relative" }}>

        {/* Aurora */}
        <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", overflow:"hidden" }}>
          <div className="da-aurora" style={{ position:"absolute", top:"-8%", right:"12%", width:560, height:560, borderRadius:"50%", background:"radial-gradient(circle,rgba(22,53,200,.08) 0%,transparent 70%)", filter:"blur(30px)" }}/>
          <div style={{ position:"absolute", bottom:"5%", left:"8%", width:440, height:440, borderRadius:"50%", background:"radial-gradient(circle,rgba(5,150,105,.05) 0%,transparent 70%)", filter:"blur(40px)" }}/>
        </div>

        <div style={{ position:"relative", zIndex:1 }}>

          {/* ══ HERO ═══════════════════════════════════════════ */}
          <div className="da-in da-d0" style={{ background:`linear-gradient(138deg,${C.navy} 0%,#0C1E6C 45%,${C.blue} 85%,#1E45EE 100%)`, borderRadius:26, marginBottom:26, padding:"38px 44px", boxShadow:`0 20px 64px ${C.shadowLg}, 0 2px 0 rgba(255,255,255,.08) inset`, position:"relative", overflow:"visible" }}>

            <div style={{ position:"absolute", inset:0, borderRadius:26, overflow:"hidden", pointerEvents:"none" }}>
              <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:.08 }} xmlns="http://www.w3.org/2000/svg">
                <defs><pattern id="hg" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(255,255,255,1)" strokeWidth=".7"/></pattern></defs>
                <rect width="100%" height="100%" fill="url(#hg)"/>
              </svg>
              <div style={{ position:"absolute", top:-80, right:-60, width:380, height:380, borderRadius:"50%", background:"rgba(255,255,255,.05)" }}/>
              <div style={{ position:"absolute", top:32, right:220, width:64, height:64, borderRadius:"50%", background:"rgba(245,176,32,.18)", border:"1px solid rgba(245,176,32,.2)" }}/>
              {/* Tricolore Guinée */}
              <div style={{ position:"absolute", top:0, left:0, right:0, height:4, display:"flex", borderRadius:"26px 26px 0 0" }}>
                <div style={{ flex:1, background:"linear-gradient(90deg,#CC1A1A,#E02020)" }}/>
                <div style={{ flex:1, background:`linear-gradient(90deg,${C.gold},${C.goldLight})` }}/>
                <div style={{ flex:1, background:`linear-gradient(90deg,${C.green},${C.greenLight})` }}/>
              </div>
            </div>

            <div className="da-hero-inner" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:28, flexWrap:"wrap", position:"relative", zIndex:1 }}>

              {/* Gauche */}
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20, opacity:.55 }}>
                  <Globe size={11} color={C.goldLight}/>
                  <span style={{ fontSize:10, color:C.goldLight, fontWeight:700, letterSpacing:".2em", textTransform:"uppercase", fontFamily:"'Outfit',sans-serif" }}>
                    ONFPP · Plateforme Nationale · République de Guinée
                  </span>
                </div>

                <div style={{ display:"flex", alignItems:"center", gap:18, marginBottom:20 }}>
                  <div style={{ position:"relative", flexShrink:0 }}>
                    <div style={{ width:62, height:62, borderRadius:18, background:`linear-gradient(135deg,${rStyle.dot}55,${rStyle.dot}22)`, border:"1.5px solid rgba(255,255,255,.22)", backdropFilter:"blur(12px)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 0 0 4px rgba(255,255,255,.07), 0 8px 28px rgba(0,0,0,.28)` }}>
                      <span className="da-serif" style={{ fontSize:24, fontWeight:600, color:"#fff", fontStyle:"italic" }}>{initials}</span>
                    </div>
                    <div style={{ position:"absolute", bottom:-4, right:-4, width:18, height:18, borderRadius:6, background:rStyle.dot, border:"2px solid rgba(255,255,255,.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <div style={{ width:6, height:6, borderRadius:"50%", background:"#fff" }}/>
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize:12, color:"rgba(255,255,255,.5)", fontWeight:500, marginBottom:4, fontFamily:"'Outfit',sans-serif" }}>{greeting}</p>
                    <h1 className="da-serif" style={{ fontSize:30, fontWeight:600, fontStyle:"italic", color:"#fff", lineHeight:1.05, letterSpacing:"-0.5px" }}>{displayName}</h1>
                    <p style={{ fontSize:11.5, color:"rgba(255,255,255,.45)", marginTop:5, fontFamily:"'Outfit',sans-serif" }}>{dateStr}</p>
                  </div>
                </div>

                {/* Badges */}
                <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:7, background:"rgba(255,255,255,.12)", backdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,.2)", borderRadius:30, padding:"6px 16px", fontSize:12, fontWeight:700, color:"#fff", fontFamily:"'Outfit',sans-serif" }}>
                    <ShieldCheck size={13}/>{roleLabel}
                  </span>
                  {roleLevel > 0 && (
                    <span style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:11.5, background:"rgba(245,176,32,.2)", border:"1px solid rgba(245,176,32,.32)", borderRadius:30, padding:"5px 14px", fontWeight:700, color:C.goldLight, fontFamily:"'Outfit',sans-serif" }}>
                      <Star size={11} color={C.goldLight} fill={C.goldLight}/> Niveau {roleLevel}
                    </span>
                  )}
                  {/* Périmètre badge */}
                  {userDivision && roleLevel < 90 && (
                    <span style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:11, background:"rgba(22,53,200,.3)", border:"1px solid rgba(22,53,200,.4)", borderRadius:30, padding:"5px 14px", fontWeight:700, color:"#A5B4FC", fontFamily:"'Outfit',sans-serif" }}>
                      🏢 {userDivision}
                    </span>
                  )}
                  {userAntenne && roleLevel < 90 && (
                    <span style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:11, background:"rgba(8,145,178,.25)", border:"1px solid rgba(8,145,178,.35)", borderRadius:30, padding:"5px 14px", fontWeight:700, color:"#7DDFF7", fontFamily:"'Outfit',sans-serif" }}>
                      📍 {ANTENNE_LABELS[userAntenne] || userAntenne}
                    </span>
                  )}
                  {roleLevel >= 90 && (
                    <span style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:11, background:"rgba(4,122,90,.25)", border:"1px solid rgba(4,122,90,.4)", borderRadius:30, padding:"5px 14px", fontWeight:700, color:"#6EF5CF", fontFamily:"'Outfit',sans-serif" }}>
                      🌐 Accès global
                    </span>
                  )}
                </div>
              </div>

              {/* Droite */}
              <div className="da-hero-right" style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:14 }}>
                <div style={{ background:"rgba(0,0,0,.35)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,.1)", borderRadius:18, padding:"16px 28px", textAlign:"center", boxShadow:"0 8px 32px rgba(0,0,0,.35)" }}>
                  <p className="da-serif" style={{ fontSize:38, fontWeight:700, letterSpacing:5, lineHeight:1, color:"#fff" }}>
                    {hh}<span className="da-blink" style={{ color:C.goldLight }}>:</span>{mm}<span className="da-blink" style={{ color:C.goldLight }}>:</span>{ss}
                  </p>
                  <p style={{ fontSize:9.5, color:"rgba(255,255,255,.38)", marginTop:7, fontWeight:600, letterSpacing:".14em", textTransform:"uppercase", fontFamily:"'Outfit',sans-serif" }}>Heure locale · Conakry, Guinée</p>
                </div>

                <div style={{ display:"flex", gap:9, alignItems:"center" }}>
                  {/* Indicateur connexion API */}
                  <div style={{ background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.15)", borderRadius:12, padding:"8px 14px", display:"flex", alignItems:"center", gap:7 }}>
                    {apiError ? (
                      <><WifiOff size={12} color="#F87171"/> <span style={{ fontSize:11, color:"#F87171", fontWeight:600, fontFamily:"'Outfit',sans-serif" }}>Hors-ligne</span></>
                    ) : apiLoading ? (
                      <><div style={{ width:10, height:10, borderRadius:"50%", border:"2px solid rgba(255,255,255,.4)", borderTop:"2px solid #fff" }} className="da-spin"/><span style={{ fontSize:11, color:"rgba(255,255,255,.6)", fontFamily:"'Outfit',sans-serif" }}>Chargement</span></>
                    ) : (
                      <><div style={{ width:8, height:8, borderRadius:"50%", background:"#34D399" }} className="da-live"/><span style={{ fontSize:11, color:"rgba(255,255,255,.75)", fontWeight:600, fontFamily:"'Outfit',sans-serif" }}>En ligne</span></>
                    )}
                  </div>

                  {/* Bouton refresh */}
                  <button onClick={refetch} title="Actualiser" style={{ width:40, height:40, borderRadius:12, background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.18)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,.7)" }}>
                    <RefreshCw size={15} className="da-refr"/>
                  </button>

                  <div style={{ background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.15)", borderRadius:12, padding:"8px 16px", display:"flex", alignItems:"center", gap:8 }}>
                    <LayoutDashboard size={12} color="rgba(255,255,255,.65)"/>
                    <span style={{ fontSize:11.5, color:"rgba(255,255,255,.75)", fontWeight:600, fontFamily:"'Outfit',sans-serif" }}>{totalMod} modules</span>
                  </div>

                  <div style={{ position:"relative" }} ref={bellRef}>
                    <button onClick={openNotif} style={{ width:44, height:44, borderRadius:13, background:"rgba(255,255,255,.12)", border:"1px solid rgba(255,255,255,.2)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", backdropFilter:"blur(10px)" }}>
                      <Bell size={18}/>
                    </button>
                    <NBadge n={unread}/>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications dropdown */}
          {notifOpen && (
            <>
              <div style={{ position:"fixed", inset:0, zIndex:998 }} onClick={() => setNotifOpen(false)}/>
              <div className="da-notif-panel" style={{ position:"fixed", top:notifPos.top, right:notifPos.right, width:345, background:C.surface, border:`1px solid ${C.divider}`, borderTop:`3px solid ${C.gold}`, borderRadius:"0 0 18px 18px", boxShadow:`0 28px 72px ${C.shadowMd}`, zIndex:999, overflow:"hidden" }}>
                <div style={{ padding:"14px 18px 12px", borderBottom:`1px solid ${C.divider}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <Bell size={13} color={C.gold}/>
                    <p className="da-serif" style={{ fontSize:13, fontWeight:600, color:C.textPri }}>Activité récente</p>
                  </div>
                  <span style={{ fontSize:10, color:C.gold, fontWeight:700, background:`${C.gold}14`, padding:"2px 9px", borderRadius:20, border:`1px solid ${C.gold}28`, fontFamily:"'Outfit',sans-serif" }}>{users.length} utilisateurs</span>
                </div>
                {recentUsers.slice(0,4).map((n, i) => (
                  <div key={i} className="da-ni" style={{ padding:"12px 18px", borderBottom: i < 3 ? `1px solid ${C.divider}` : "none", display:"flex", gap:12, alignItems:"flex-start" }}>
                    <div style={{ width:7, height:7, borderRadius:"50%", flexShrink:0, marginTop:5, background:n.color, boxShadow:`0 0 0 3px ${n.color}22` }}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:12.5, fontWeight:600, color:C.textPri, fontFamily:"'Outfit',sans-serif" }}>{n.text}</p>
                      <p style={{ fontSize:11, color:C.textMuted, marginTop:2, fontFamily:"'Outfit',sans-serif" }}>{n.detail} · {n.time}</p>
                    </div>
                  </div>
                ))}
                {recentUsers.length === 0 && !apiLoading && (
                  <div style={{ padding:"24px 18px", textAlign:"center", color:C.textMuted, fontSize:12, fontFamily:"'Outfit',sans-serif" }}>Aucune activité récente</div>
                )}
                <div style={{ padding:"10px 18px 13px", borderTop:`1px solid ${C.divider}`, display:"flex", justifyContent:"center" }}>
                  <button onClick={() => { setNotifOpen(false); setActiveTab("activite"); }} style={{ fontSize:12, fontWeight:700, color:C.blue, background:"none", border:"none", cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}>
                    Voir tous les utilisateurs →
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ══ KPIs ═══════════════════════════════════════════ */}
          <div className="da-kpi-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))", gap:14, marginBottom:26 }}>
            {kpis.map((s, i) => <KpiCard key={i} {...s} loading={apiLoading}/>)}
          </div>

          {/* ══ ONGLETS ═══════════════════════════════════════ */}
          <div style={{ display:"flex", gap:4, marginBottom:22, padding:"4px", background:C.surface, border:`1px solid ${C.divider}`, borderRadius:14, width:"fit-content", boxShadow:`0 2px 12px ${C.shadow}` }}>
            {tabs.map(tab => (
              <button key={tab.id} className="da-tab" onClick={() => setActiveTab(tab.id)} style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 20px", borderRadius:11, border:"none", fontSize:13, fontWeight:700, background: activeTab === tab.id ? `linear-gradient(135deg,${C.navy},${C.navyMid})` : "transparent", color: activeTab === tab.id ? "#fff" : C.textMuted, boxShadow: activeTab === tab.id ? `0 4px 18px ${C.navy}30` : "none", fontFamily:"'Outfit',sans-serif", cursor:"pointer" }}>
                <tab.icon size={14}/>{tab.label}
              </button>
            ))}
          </div>

          {/* ══ VUE MODULES ═══════════════════════════════════ */}
          {activeTab === "modules" && (
            <div className="da-layout" style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:22, alignItems:"start" }}>
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {sections.map((sec, si) => (
                  <SBox key={si} icon={sec.icon} title={sec.section} color={sec.color} count={String(sec.items.length)} delay={`da-d${Math.min(si+1,5)}`}>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(205px,1fr))", gap:7 }}>
                      {sec.items.map((m, mi) => <ModRow key={mi} label={m.label} icon={m.icon} path={m.path} color={sec.color}/>)}
                    </div>
                  </SBox>
                ))}
              </div>

              {/* Sidebar */}
              <div className="da-sidebar" style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {/* Profil card */}
                <div className="da-in da-d1" style={{ background:`linear-gradient(148deg,${C.navy} 0%,#0C1E6C 55%,${C.blue} 100%)`, borderRadius:22, padding:"24px 22px", boxShadow:`0 14px 48px ${C.shadowLg}`, position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:4, display:"flex", borderRadius:"22px 22px 0 0" }}>
                    <div style={{ flex:1, background:"#E02020" }}/><div style={{ flex:1, background:C.gold }}/><div style={{ flex:1, background:C.green }}/>
                  </div>
                  <p style={{ fontSize:9.5, color:"rgba(255,255,255,.35)", marginBottom:18, letterSpacing:".22em", textTransform:"uppercase", fontWeight:700, fontFamily:"'Outfit',sans-serif" }}>Votre espace</p>
                  <div style={{ display:"flex", alignItems:"center", gap:13, marginBottom:18 }}>
                    <div style={{ width:52, height:52, borderRadius:16, flexShrink:0, background:`${rStyle.dot}40`, border:"1.5px solid rgba(255,255,255,.18)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 4px 16px rgba(0,0,0,.25)` }}>
                      <span className="da-serif" style={{ fontSize:22, fontWeight:600, fontStyle:"italic", color:"#fff" }}>{initials}</span>
                    </div>
                    <div>
                      <p className="da-serif" style={{ fontWeight:600, fontSize:15, color:"#fff", letterSpacing:"-0.2px" }}>{displayName}</p>
                      <span style={{ display:"inline-block", marginTop:5, background:rStyle.bg, color:rStyle.text, border:`1px solid ${rStyle.border}`, borderRadius:8, padding:"2px 11px", fontSize:10.5, fontWeight:700, fontFamily:"'Outfit',sans-serif" }}>{roleLabel}</span>
                    </div>
                  </div>

                  {/* Périmètre dans la sidebar */}
                  {(userDivision || userAntenne) && roleLevel < 90 && (
                    <div style={{ background:"rgba(255,255,255,.08)", borderRadius:11, padding:"11px 13px", marginBottom:14 }}>
                      <p style={{ fontSize:10, color:"rgba(255,255,255,.4)", fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", marginBottom:6, fontFamily:"'Outfit',sans-serif" }}>Périmètre</p>
                      {userDivision && <p style={{ fontSize:12, color:"rgba(255,255,255,.8)", fontWeight:600, fontFamily:"'Outfit',sans-serif" }}>🏢 {DIVISION_LABELS[userDivision] || userDivision}</p>}
                      {userAntenne  && <p style={{ fontSize:12, color:"rgba(255,255,255,.8)", fontWeight:600, fontFamily:"'Outfit',sans-serif", marginTop:4 }}>📍 {ANTENNE_LABELS[userAntenne] || userAntenne}</p>}
                    </div>
                  )}

                  {roleLevel >= 90 && (
                    <div style={{ background:"rgba(255,255,255,.08)", borderRadius:11, padding:"11px 13px", marginBottom:14 }}>
                      <p style={{ fontSize:10, color:"rgba(255,255,255,.4)", fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", marginBottom:6, fontFamily:"'Outfit',sans-serif" }}>Périmètre</p>
                      <p style={{ fontSize:12, color:"rgba(255,255,255,.8)", fontWeight:600, fontFamily:"'Outfit',sans-serif" }}>🌐 Accès global — toutes divisions et antennes</p>
                    </div>
                  )}

                  <div style={{ display:"flex", justifyContent:"space-between", paddingTop:12, borderTop:"1px solid rgba(255,255,255,.1)" }}>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,.4)", fontFamily:"'Outfit',sans-serif" }}>{totalMod} modules</span>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,.65)", fontWeight:600, fontFamily:"'Outfit',sans-serif" }}>{apiLoading ? "…" : users.length} utilisateurs</span>
                  </div>
                </div>

                {/* Accès rapides */}
                <div className="da-in da-d2" style={{ background:C.surface, border:`1px solid ${C.divider}`, borderRadius:20, padding:"22px", boxShadow:`0 2px 16px ${C.shadow}` }}>
                  <SHdr icon={Zap} title="Accès rapides" color={C.gold}/>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                    {(isDG
                      ? [
                          { path:"/apprenants",   label:"Apprenants",   icon:GraduationCap, color:"#2447E0" },
                          { path:"/statistiques", label:"Statistiques", icon:PieChart,      color:C.violet  },
                          { path:"/rapports",     label:"Rapports",     icon:BarChart3,     color:C.teal    },
                          { path:"/utilisateurs", label:"Utilisateurs", icon:UserCog,       color:"#475569" },
                        ]
                      : [
                          { path:"/apprenants",  label:"Apprenants",  icon:GraduationCap, color:"#2447E0" },
                          { path:"/presences",   label:"Présences",   icon:CalendarDays,  color:C.green   },
                          { path:"/statistiques",label:"Statistiques",icon:PieChart,      color:C.violet  },
                          { path:"/rapports",    label:"Rapports",    icon:BarChart3,     color:C.teal    },
                        ]
                    ).map((q, i) => <QL key={i} {...q}/>)}
                  </div>
                </div>

                {/* Info ONFPP */}
                <div className="da-in da-d3" style={{ background:`linear-gradient(135deg,${C.goldPale},${C.surface})`, border:`1px solid rgba(212,146,10,.2)`, borderRadius:20, padding:"18px 20px", boxShadow:`0 2px 14px rgba(212,146,10,.08)` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:11 }}>
                    <Sparkles size={14} color={C.gold}/>
                    <p className="da-serif" style={{ fontSize:12, fontWeight:600, color:C.textPri }}>Office National de Formation Professionnelle</p>
                  </div>
                  <p style={{ fontSize:11, color:C.textSub, lineHeight:1.75, fontFamily:"'Outfit',sans-serif" }}>Plateforme nationale de suivi et d'évaluation des formations professionnelles en République de Guinée.</p>
                  <div style={{ display:"flex", gap:8, marginTop:14 }}>
                    {[{ v:"2025", l:"Exercice" }, { v:"v3.0", l:"Version" }, { v:"🇬🇳", l:"Guinée" }].map((b, i) => (
                      <div key={i} style={{ flex:1, background:"rgba(255,255,255,.8)", borderRadius:10, padding:"9px 8px", textAlign:"center", border:`1px solid rgba(212,146,10,.14)` }}>
                        <p className="da-serif" style={{ fontSize:14, fontWeight:600, color:C.textPri, lineHeight:1 }}>{b.v}</p>
                        <p style={{ fontSize:9.5, color:C.textMuted, marginTop:4, fontFamily:"'Outfit',sans-serif" }}>{b.l}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ VUE UTILISATEURS ══════════════════════════════ */}
          {activeTab === "activite" && (
            <div style={{ maxWidth:900 }}>
              {/* Bandeau périmètre */}
              <ScopeBanner division={userDivision} antenne={userAntenne} niveau={roleLevel}/>

              <SBox icon={Users} title={`Utilisateurs de votre périmètre`} color={C.blue} count={apiLoading ? "…" : String(users.length)} delay="da-in da-d0">
                <UsersTable users={users} loading={apiLoading} niveau={roleLevel}/>
              </SBox>

              {/* Stats rapides périmètre */}
              {!apiLoading && users.length > 0 && (
                <div className="da-in da-d1" style={{ background:C.surface, border:`1px solid ${C.divider}`, borderRadius:20, padding:"22px", boxShadow:`0 2px 16px ${C.shadow}`, marginTop:16 }}>
                  <SHdr icon={BarChart3} title="Répartition par rôle" color={C.violet}/>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
                    {Object.entries(
                      users.reduce((acc, u) => {
                        const r = u.role?.name || "Inconnu";
                        acc[r] = (acc[r] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([role, count], i) => {
                      const rs2 = ROLE_STYLES[role] || { bg:C.surfaceEl, text:C.textSub, dot:C.textMuted };
                      return (
                        <div key={i} style={{ display:"flex", alignItems:"center", gap:8, background:rs2.bg, border:`1px solid ${rs2.dot}22`, borderRadius:10, padding:"8px 14px" }}>
                          <span style={{ width:8, height:8, borderRadius:"50%", background:rs2.dot, flexShrink:0 }}/>
                          <span style={{ fontSize:12, fontWeight:600, color:rs2.text, fontFamily:"'Outfit',sans-serif" }}>{role}</span>
                          <span style={{ fontSize:12, fontWeight:800, color:rs2.text, fontFamily:"'Outfit',sans-serif" }}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ MON PÉRIMÈTRE ══════════════════════════════════ */}
          {activeTab === "statistiques" && (
            <div style={{ maxWidth:760 }}>
              <ScopeBanner division={userDivision} antenne={userAntenne} niveau={roleLevel}/>

              <div className="da-in da-d0" style={{ background:C.surface, border:`1px solid ${C.divider}`, borderRadius:20, padding:"28px", boxShadow:`0 2px 18px ${C.shadow}`, marginBottom:16 }}>
                <SHdr icon={ShieldCheck} title="Informations de votre compte" color={C.blue}/>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  {[
                    { label:"Nom d'utilisateur",   value:user.username },
                    { label:"Nom complet",          value:displayName },
                    { label:"Rôle",                 value:roleLabel },
                    { label:"Niveau d'accès",       value:String(roleLevel) },
                    { label:"Division",             value:userDivision ? (DIVISION_LABELS[userDivision] || userDivision) : (roleLevel >= 90 ? "Toutes" : "—") },
                    { label:"Antenne",              value:userAntenne  ? (ANTENNE_LABELS[userAntenne]   || userAntenne)  : (roleLevel >= 90 ? "Toutes" : "—") },
                  ].map((item, i) => (
                    <div key={i} style={{ background:C.surfaceEl, borderRadius:12, padding:"14px 16px", border:`1px solid ${C.divider}` }}>
                      <p style={{ fontSize:10, fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", color:C.textMuted, marginBottom:6, fontFamily:"'Outfit',sans-serif" }}>{item.label}</p>
                      <p style={{ fontSize:14, fontWeight:700, color:C.textPri, fontFamily:"'Outfit',sans-serif" }}>{item.value || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Résumé accès */}
              <div className="da-in da-d1" style={{ background:C.surface, border:`1px solid ${C.divider}`, borderRadius:20, padding:"22px", boxShadow:`0 2px 16px ${C.shadow}` }}>
                <SHdr icon={Activity} title="Périmètre d'accès autorisé" color={C.green}/>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {[
                    { label:"Voir tous les utilisateurs",         ok: roleLevel >= 90 },
                    { label:"Voir utilisateurs de ma division",   ok: roleLevel >= 60 },
                    { label:"Voir utilisateurs de mon antenne",   ok: roleLevel >= 30 },
                    { label:"Gérer les utilisateurs",             ok: roleLevel >= 90 },
                    { label:"Accès statistiques globales",        ok: roleLevel >= 90 },
                    { label:"Accès statistiques section/antenne", ok: roleLevel >= 50 },
                    { label:"Export PDF / Excel",                 ok: roleLevel >= 50 },
                  ].map((item, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", background: item.ok ? C.greenPale : C.surfaceEl, borderRadius:10, border:`1px solid ${item.ok ? C.green + "30" : C.divider}` }}>
                      <span style={{ fontSize:13, color: item.ok ? C.textPri : C.textMuted, fontFamily:"'Outfit',sans-serif" }}>{item.label}</span>
                      <span style={{ fontSize:11, fontWeight:700, color: item.ok ? C.green : C.textMuted, background: item.ok ? C.green + "18" : "transparent", borderRadius:20, padding:"2px 10px", border:`1px solid ${item.ok ? C.green + "25" : "transparent"}`, fontFamily:"'Outfit',sans-serif" }}>
                        {item.ok ? "✓ Autorisé" : "✗ Restreint"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default DashboardAdmin;