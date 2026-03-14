/**
 * DashboardAdmin.jsx — Ultra-modern redesign
 * Thème adaptatif via useTheme() depuis ThemeContext
 * Design : Lumineux institutionnel / Sombre premium
 * Typographie : DM Serif Display (titres) + Sora (corps)
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap, BookOpen, ClipboardList, Award, BarChart3,
  Building2, CheckCircle2, Clock, FileText, Briefcase, PieChart,
  AlertTriangle, Package, UserCog, Settings, Layers, Users,
  Bell, CalendarDays, ShieldCheck, MapPin,
  TrendingUp, TrendingDown, Activity,
  LayoutDashboard, ChevronRight, Zap, UserCheck,
  Globe, ArrowUpRight, Sparkles, Star,
  RefreshCw, Sun, Moon,
} from "lucide-react";
import CONFIG from "../../config/config.js";
import { apiRequest } from "../../endpoints/api";
import { useTheme, getRoleBadge } from "../../context/ThemeContext";

/* ═══════════════════════════════════════════════════════════════
   CONSTANTES MÉTIER
═══════════════════════════════════════════════════════════════ */
const DIVISION_LABELS = {
  DAP: "Division Apprentissage et Projets Collectifs",
  DSE: "Division Suivi Évaluation",
  DFC: "Division Formation Continue",
  DPL: "Division Planification",
};
const ANTENNE_LABELS = {
  conakry:"Conakry", forecariah:"Forecariah", boke:"Boké", kindia:"Kindia",
  labe:"Labé", mamou:"Mamou", faranah:"Faranah", kankan:"Kankan",
  siguiri:"Siguiri", nzerekore:"N'Zérékoré",
};
const ROLE_LABELS = {
  "Directeur Général":"Directeur Général","Directeur Général Adjoint":"DG Adjoint",
  "Chef de Division":"Chef de Division","Chef de Section":"Chef de Section",
  "Chef d'Antenne":"Chef d'Antenne","Conseiller":"Conseiller",
  DG:"Directeur Général",CD:"Chef de Division",DR:"DG Adjoint",
  CC:"Chef d'Antenne",FORMATEUR:"Formateur",SUPERADMIN:"Super Admin",
};

const resolveGroup = role => {
  if (!role) return "DG";
  const r = (role?.name || role || "").toString();
  if (["Directeur Général","DG","SUPERADMIN"].some(x => r.includes(x) || x === r)) {
    if (r.includes("Division") || r === "CD") return "CS";
    return "DG";
  }
  if (r.includes("Section"))  return "CS";
  if (r.includes("Antenne") || r === "CC") return "CA";
  if (r.includes("Formateur") || r === "FORMATEUR") return "F";
  if (r.includes("Conseiller")) return "C";
  return "DG";
};
const getRoleName  = r => !r ? "Directeur Général" : typeof r === "object" ? r.name || "Directeur Général" : r;
const getRoleLevel = r => !r ? 100 : typeof r === "object" ? r.level || 0 : 0;

/* ═══════════════════════════════════════════════════════════════
   NAV CATEGORIES
═══════════════════════════════════════════════════════════════ */
const buildNavCategories = (role, T) => {
  const g = resolveGroup(role);
  const DG_CS    = ["DG","CS"];
  const DG_CS_CA = ["DG","CS","CA"];
  const ALL_OP   = ["DG","CS","CA","F"];
  const ALL      = ["DG","CS","CA","F","C","E"];

  const all = [
    { section:"Formations", color:T.brand, icon:BookOpen, groups:ALL, items:[
      { path:"/formations",    label:"Catalogue formations",  icon:BookOpen,    groups:ALL       },
      { path:"/sessions",      label:"Sessions planifiées",   icon:CalendarDays,groups:ALL       },
      { path:"/programmes",    label:"Programmes & modules",  icon:Layers,      groups:DG_CS_CA  },
      { path:"/certifications",label:"Certifications",        icon:Award,       groups:ALL       },
    ]},
    { section:"Apprenants", color:"#0891B2", icon:GraduationCap, groups:ALL_OP, items:[
      { path:"/inscription",   label:"Inscriptions",          icon:GraduationCap,  groups:ALL_OP   },
      { path:"/apprenants",    label:"Apprenants actifs",      icon:GraduationCap,  groups:ALL_OP   },
      { path:"/listeCandidats",label:"Inscrits & candidats",  icon:UserCheck,      groups:DG_CS_CA },
      { path:"/validation",    label:"Validation dossiers",   icon:CheckCircle2,   groups:DG_CS_CA },
      { path:"/suivi",         label:"Suivi pédagogique",     icon:ClipboardList,  groups:ALL_OP   },
      { path:"/insertion",     label:"Insertion",             icon:ClipboardList,  groups:ALL_OP   },
    ]},
    { section:"Présences & Notes", color:T.green, icon:ClipboardList, groups:["CA","F"], items:[
      { path:"/presences",     label:"Feuilles de présence",  icon:CalendarDays,   groups:["CA","F"] },
      { path:"/evaluations",   label:"Notes & évaluations",   icon:Award,          groups:["CA","F"] },
      { path:"/discipline",    label:"Discipline",            icon:AlertTriangle,  groups:["CA","F"] },
    ]},
    { section:"Suivi complet", color:T.green, icon:ClipboardList, groups:DG_CS, items:[
      { path:"/presences",         label:"Présences",            icon:CalendarDays, groups:DG_CS   },
      { path:"/evaluations",       label:"Évaluations",          icon:Award,        groups:DG_CS   },
      { path:"/resultats",         label:"Résultats finaux",      icon:CheckCircle2, groups:DG_CS   },
      { path:"/attestations",      label:"Attestations PDF",      icon:FileText,     groups:DG_CS   },
      { path:"/enquete-insertion", label:"Enquête insertion",     icon:Clock,        groups:DG_CS   },
      { path:"/relances",          label:"Relances automatiques", icon:Bell,         groups:["DG"]  },
    ]},
    { section:"Fin de session", color:T.gold, icon:CheckCircle2, groups:["CA","F"], items:[
      { path:"/resultats",         label:"Résultats finaux", icon:CheckCircle2, groups:["CA","F"] },
      { path:"/attestations",      label:"Attestations PDF", icon:FileText,     groups:["CA","F"] },
      { path:"/enquete-insertion", label:"Enquête insertion",icon:Clock,        groups:["CA"]     },
    ]},
    { section:"Entreprises", color:"#A05000", icon:Briefcase, groups:["DG","CS","E"], items:[
      { path:"/entreprises",   label:"Base des entreprises", icon:Briefcase, groups:["DG","CS","E"] },
      { path:"/offres-emploi", label:"Offres d'emploi",      icon:Package,   groups:["DG","CS","E"] },
    ]},
    { section:"Rapports", color:T.violet, icon:BarChart3, groups:["DG","CS","CA","C"], items:[
      { path:"/statistiques",      label:"Statistiques globales",   icon:PieChart,  groups:["DG"]          },
      { path:"/statistiques",      label:"Statistiques de section", icon:PieChart,  groups:["CS"]          },
      { path:"/statistiques",      label:"Statistiques antenne",    icon:BarChart3, groups:["CA"]          },
      { path:"/statistiques",      label:"Statistiques",            icon:BarChart3, groups:["C"]           },
      { path:"/dashboardRegional", label:"Tableau régional",        icon:MapPin,    groups:["DG","CS"]     },
      { path:"/rapports",          label:"Rapports & exports",      icon:FileText,  groups:["DG","CS","CA"]},
    ]},
    { section:"Centres & Équipes", color:"#4338CA", icon:Building2, groups:["DG","CS"], items:[
      { path:"/centresFormation",label:"Antennes de formation", icon:Building2, groups:["DG","CS"]       },
      { path:"/teamMessage",     label:"Équipe & formateurs",   icon:Users,     groups:["DG","CS","CA"]  },
      { path:"/partnerPost",     label:"Partenaires",           icon:Package,   groups:["DG"]            },
    ]},
    { section:"Administration", color:"#374B8A", icon:Settings, groups:["DG"], items:[
      { path:"/utilisateurs", label:"Gestion utilisateurs", icon:UserCog, groups:["DG"] },
      { path:"/parametres",   label:"Paramètres système",   icon:Settings,groups:["DG"] },
      { path:"/homePost",     label:"Contenu site public",  icon:Layers,  groups:["DG"] },
    ]},
  ];

  return all
    .filter(c => c.groups.includes(g))
    .map(c => ({
      ...c,
      items: c.items
        .filter(i => i.groups.includes(g))
        .filter((i, idx, a) => a.findIndex(x => x.path === i.path && x.label === i.label) === idx),
    }))
    .filter(c => c.items.length > 0);
};

/* ═══════════════════════════════════════════════════════════════
   DATA HOOK
═══════════════════════════════════════════════════════════════ */
const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    if (raw) {
      const p = JSON.parse(raw);
      return { username:p.username||p.email||"", firstName:p.first_name||p.firstName||null, lastName:p.last_name||p.lastName||null, role:p.role||"Directeur Général", niveau:p.niveau??0, division:p.division||null, antenne:p.antenne||null };
    }
    const tok = localStorage.getItem("access");
    if (tok) {
      const p = JSON.parse(atob(tok.split(".")[1]));
      return { username:p.username||p.email||"", firstName:p.first_name||null, lastName:p.last_name||null, role:p.role||"Directeur Général", niveau:p.niveau??0, division:p.division||null, antenne:p.antenne||null };
    }
  } catch {}
  return { username:"Admin", role:"Directeur Général", niveau:0 };
};

function useDashData() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const [dr, ur] = await Promise.allSettled([
        apiRequest("/api/dashboard/"),
        apiRequest(CONFIG.API_USER_LIST),
      ]);
      setData({
        dash:  dr.status === "fulfilled" ? dr.value : null,
        users: ur.status === "fulfilled" && Array.isArray(ur.value) ? ur.value : [],
      });
    } catch { setError(true); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, refetch: load };
}

/* ═══════════════════════════════════════════════════════════════
   CSS DYNAMIQUE
═══════════════════════════════════════════════════════════════ */
const buildCSS = (T, dark) => `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');

.da, .da *:not(style) { font-family:'Sora',sans-serif; -webkit-font-smoothing:antialiased; }
.da-f { font-family:'DM Serif Display',serif !important; }

/* ── Fond page avec motif ── */
.da-page {
  background:
    radial-gradient(ellipse 100% 50% at 70% -5%, ${T.brandGlow} 0%, transparent 60%),
    ${T.page};
}
.da-page::before {
  content:''; position:fixed; inset:0; pointer-events:none; z-index:0;
  background-image: radial-gradient(circle at 1px 1px, ${dark ? "rgba(93,118,255,.06)" : "rgba(26,59,140,.035)"} 1px, transparent 0);
  background-size: 28px 28px;
}

/* ── KPI card ── */
.da-kpi { transition: transform .28s cubic-bezier(.34,1.5,.64,1), box-shadow .28s; cursor:default; }
.da-kpi:hover { transform: translateY(-7px) scale(1.012); box-shadow: 0 28px 56px var(--kglow), 0 8px 20px ${T.sh1} !important; }

/* ── Section card ── */
.da-sec { transition: box-shadow .2s, border-color .2s; }
.da-sec:hover { box-shadow: 0 12px 44px ${T.sh2} !important; border-color: ${T.border} !important; }

/* ── Module row ── */
.da-mod { transition: background .15s, border-left-color .18s, padding-left .22s cubic-bezier(.34,1.3,.64,1); }
.da-mod:hover { background: ${T.ice} !important; border-left-color: var(--mc) !important; padding-left: 18px !important; }
.da-mod:hover .da-arr { transform: translateX(5px); opacity: 1 !important; }

/* ── Quick link ── */
.da-ql { transition: all .2s cubic-bezier(.34,1.2,.64,1); }
.da-ql:hover { transform: translateY(-3px); box-shadow: 0 10px 28px ${T.sh2} !important; border-color: ${T.border} !important; }

/* ── Tab ── */
.da-tab { transition: all .18s ease; cursor: pointer; }
.da-tab:hover:not(.da-tab-act) { background: ${T.ice} !important; color: ${T.textSec} !important; }

/* ── Table row ── */
.da-urow { transition: background .12s; }
.da-urow:hover { background: ${T.ice} !important; }

/* ── Notif item ── */
.da-ni { transition: background .12s; }
.da-ni:hover { background: ${T.iceFaint} !important; }

/* ── Refresh ── */
.da-refr { transition: transform .35s cubic-bezier(.34,1.5,.64,1); }
.da-refr:hover { transform: rotate(180deg); }

/* ════ ANIMATIONS ════ */
@keyframes daUp { from { opacity:0; transform:translateY(20px) scale(.984) } to { opacity:1; transform:none } }
.da-in  { animation: daUp .46s cubic-bezier(.16,1,.3,1) both; }
.da-d0  { animation-delay:0s }   .da-d1 { animation-delay:.08s }
.da-d2  { animation-delay:.16s } .da-d3 { animation-delay:.24s }
.da-d4  { animation-delay:.32s } .da-d5 { animation-delay:.40s }

@keyframes daBadge { 0%,100% { box-shadow:0 0 0 0 rgba(204,24,64,.6) } 65% { box-shadow:0 0 0 8px rgba(204,24,64,0) } }
.da-badge { animation: daBadge 2.6s ease infinite; }

@keyframes daBlink { 0%,49% { opacity:1 } 50%,100% { opacity:.15 } }
.da-blink { animation: daBlink 1s step-end infinite; }

@keyframes daDrop { from { opacity:0; transform:translateY(-10px) scale(.97) } to { opacity:1; transform:none } }
.da-notif { animation: daDrop .2s cubic-bezier(.16,1,.3,1) both; }

@keyframes daOrb { 0%,100% { opacity:.5; transform:scale(1) translate(0,0) } 50% { opacity:.8; transform:scale(1.1) translate(-10px,-14px) } }
.da-orb { animation: daOrb 12s ease-in-out infinite; }

@keyframes daSpin { to { transform:rotate(360deg) } }
.da-spin { animation: daSpin .7s linear infinite; }

@keyframes daLive { 0%,100% { box-shadow:0 0 0 0 rgba(11,175,122,.5) } 55% { box-shadow:0 0 0 6px rgba(11,175,122,0) } }
.da-live { animation: daLive 2.2s ease infinite; }

@keyframes daSkelShim { 0% { background-position:200% 0 } 100% { background-position:-200% 0 } }

/* ── Hover stat card (périmètre) ── */
.da-stat-row { transition: background .14s, border-color .14s; }
.da-stat-row:hover { background: ${T.ice} !important; }

/* ════ RESPONSIVE ════ */
@media(max-width:1200px) { .da-layout { grid-template-columns:1fr !important; } .da-rsb { display:none !important; } }
@media(max-width:780px)  { .da-kgrid { grid-template-columns:1fr 1fr !important; } .da-hero-in { flex-direction:column !important; gap:20px !important; } .da-hero-r { align-items:flex-start !important; } .da { padding:60px 14px 50px !important; } }
@media(max-width:480px)  { .da-kgrid { grid-template-columns:1fr !important; } }
`;

/* ═══════════════════════════════════════════════════════════════
   SOUS-COMPOSANTS
═══════════════════════════════════════════════════════════════ */

/* Skeleton loader */
const Skel = ({ w = "100%", h = 18, r = 8, T }) => (
  <div style={{
    width: w, height: h, borderRadius: r,
    background: `linear-gradient(90deg,${T.surfaceEl} 25%,${T.divider} 50%,${T.surfaceEl} 75%)`,
    backgroundSize: "400% 100%",
    animation: "daSkelShim 1.5s ease infinite",
  }}/>
);

/* KPI Card */
const KpiCard = ({ label, value, trend, up, icon: Icon, color, sub, delay = 0, loading = false, T, dark }) => {
  const flat = up === null;
  const tC   = flat ? T.textMuted : up ? T.green : T.rose;
  const tBg  = flat ? T.surfaceEl : up ? T.greenPale : T.rosePale;
  const TI   = flat ? null : up ? TrendingUp : TrendingDown;

  return (
    <div className={`da-kpi da-in da-d${delay}`} style={{
      "--kglow": `${color}35`,
      background: T.surface, borderRadius: 22, padding: "22px 20px",
      border: `1px solid ${T.divider}`,
      boxShadow: `0 2px 20px ${T.sh1}, inset 0 0 0 1px ${dark ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.8)"}`,
      display: "flex", flexDirection: "column", gap: 16,
      position: "relative", overflow: "hidden",
    }}>
      {/* Barre couleur top */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, borderRadius:"22px 22px 0 0", background:`linear-gradient(90deg,${color},${color}55)` }}/>
      {/* Orbe déco */}
      <div style={{ position:"absolute", bottom:-36, right:-36, width:120, height:120, borderRadius:"50%", background:`${color}09`, pointerEvents:"none" }}/>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", position:"relative" }}>
        <div style={{
          width:46, height:46, borderRadius:13,
          background: dark ? `${color}20` : `${color}12`,
          border: `1.5px solid ${color}${dark ? "30" : "20"}`,
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow: `0 4px 16px ${color}${dark ? "28" : "14"}`,
        }}>
          <Icon size={20} color={color}/>
        </div>
        {loading ? <Skel w={56} h={22} r={11} T={T}/> : (
          <span style={{
            display:"flex", alignItems:"center", gap:4,
            fontSize:11, fontWeight:600, padding:"3px 10px",
            borderRadius:20, background:tBg, color:tC,
            border:`1px solid ${tC}${dark ? "30" : "18"}`,
          }}>
            {TI && <TI size={9}/>}{trend === "—" ? "stable" : trend}
          </span>
        )}
      </div>

      <div style={{ position:"relative" }}>
        {loading ? (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <Skel w="55%" h={30} r={5} T={T}/>
            <Skel w="75%" h={13} r={5} T={T}/>
            <Skel w="45%" h={11} r={5} T={T}/>
          </div>
        ) : (
          <>
            <p className="da-f" style={{ fontSize:30, fontWeight:400, color:T.textPri, lineHeight:1, letterSpacing:"-0.5px" }}>{value}</p>
            <p style={{ fontSize:12, color:T.textSec, marginTop:6, fontWeight:500 }}>{label}</p>
            <p style={{ fontSize:11, color:T.textMuted, marginTop:3 }}>{sub}</p>
          </>
        )}
      </div>
    </div>
  );
};

/* Section header */
const SHdr = ({ icon: Icon, title, color, count, badge, T }) => (
  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
    <div style={{ width:4, height:24, borderRadius:2, background:color, flexShrink:0 }}/>
    <div style={{
      width:32, height:32, borderRadius:9,
      background:`${color}12`, border:`1.5px solid ${color}20`,
      display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
    }}>
      <Icon size={14} color={color}/>
    </div>
    <p className="da-f" style={{ flex:1, fontSize:13, fontWeight:400, fontStyle:"italic", color:T.textPri }}>{title}</p>
    {badge && <span style={{ fontSize:10, fontWeight:700, color:"#fff", background:T.rose, borderRadius:20, padding:"2px 8px" }}>{badge}</span>}
    {count && <span style={{ fontSize:10, fontWeight:700, color, background:`${color}12`, border:`1px solid ${color}22`, borderRadius:20, padding:"2px 9px" }}>{count}</span>}
  </div>
);

/* Module row */
const ModRow = ({ label, icon: Icon, path, color, T }) => (
  <Link to={path || "#"} style={{ textDecoration:"none" }}>
    <div className="da-mod" style={{
      "--mc": color,
      background: T.surfaceEl, border:`1px solid ${T.divider}`,
      borderLeft:"3px solid transparent", borderRadius:11,
      padding:"10px 13px", display:"flex", alignItems:"center", gap:10,
    }}>
      <div style={{ width:28, height:28, borderRadius:8, flexShrink:0, background:`${color}12`, border:`1px solid ${color}1C`, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Icon size={12} color={color}/>
      </div>
      <p style={{ flex:1, fontSize:12, fontWeight:500, color:T.textSec, minWidth:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{label}</p>
      <ChevronRight className="da-arr" size={12} color={T.textMuted} style={{ flexShrink:0, opacity:.3, transition:"all .2s" }}/>
    </div>
  </Link>
);

/* Section box */
const SBox = ({ icon, title, color, children, count, delay = "da-d1", badge, T }) => (
  <div className={`da-sec da-in ${delay}`} style={{
    background: T.surface, borderRadius:20, padding:"20px",
    border:`1px solid ${T.divider}`,
    boxShadow:`0 2px 16px ${T.sh1}`,
  }}>
    <SHdr icon={icon} title={title} color={color} count={count} badge={badge} T={T}/>
    {children}
  </div>
);

/* Quick link */
const QL = ({ path, label, icon: Icon, color, T }) => (
  <Link to={path || "#"} style={{ textDecoration:"none", flex:"1 1 calc(50% - 5px)", minWidth:0 }}>
    <div className="da-ql" style={{
      display:"flex", alignItems:"center", gap:9, padding:"10px 12px",
      borderRadius:12, background:T.surfaceEl, border:`1px solid ${T.divider}`,
      cursor:"pointer", boxShadow:`0 2px 8px ${T.sh1}`,
    }}>
      <div style={{ width:30, height:30, borderRadius:9, background:`${color}12`, border:`1px solid ${color}1C`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <Icon size={13} color={color}/>
      </div>
      <span style={{ fontSize:12, fontWeight:500, color:T.textSec, flex:1, minWidth:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{label}</span>
      <ArrowUpRight size={10} color={T.textMuted} style={{ flexShrink:0, opacity:.5 }}/>
    </div>
  </Link>
);

/* Scope banner */
const ScopeBanner = ({ division, antenne, niveau, T }) => {
  if (niveau >= 90) return null;
  const isDiv = division && [70, 60].includes(niveau);
  const isAnt = antenne  && [50, 30].includes(niveau);
  if (!isDiv && !isAnt) return null;
  const lbl   = isDiv ? `Division — ${DIVISION_LABELS[division] || division}` : `Antenne — ${ANTENNE_LABELS[antenne] || antenne}`;
  const color = isDiv ? T.brand : "#0891B2";
  const icon  = isDiv ? "🏢" : "📍";
  return (
    <div className="da-in da-d0" style={{
      background:`linear-gradient(90deg,${color}08,${color}03)`,
      border:`1px solid ${color}28`, borderLeft:`4px solid ${color}`,
      borderRadius:14, padding:"14px 20px", marginBottom:18,
      display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:`${color}12`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{icon}</div>
        <div>
          <p style={{ fontSize:9.5, fontWeight:700, color, letterSpacing:".14em", textTransform:"uppercase" }}>Votre périmètre</p>
          <p style={{ fontSize:14, fontWeight:700, color:T.textPri, marginTop:3 }}>{lbl}</p>
        </div>
      </div>
      <span style={{ fontSize:11, fontWeight:600, color, background:`${color}10`, border:`1px solid ${color}22`, borderRadius:20, padding:"4px 14px" }}>Accès restreint</span>
    </div>
  );
};

/* Users table */
const UsersTable = ({ users, loading, T, dark }) => {
  const NB = {
    100:{ bg:dark?"rgba(254,243,199,.1)":"#FEF3C7", text:dark?"#F5B020":"#78350F" },
    90: { bg:dark?"rgba(237,233,254,.1)":"#EDE9FE", text:dark?"#C4AAFF":"#4C1D95" },
    70: { bg:dark?"rgba(219,234,254,.1)":"#DBEAFE", text:dark?"#9AB0FF":"#1E3A8A" },
    60: { bg:dark?"rgba(209,250,229,.1)":"#D1FAE5", text:dark?"#5AEEC0":"#064E3B" },
    50: { bg:dark?"rgba(255,228,230,.1)":"#FFE4E6", text:dark?"#FF9EAC":"#881337" },
    30: { bg:dark?"rgba(238,242,255,.1)":"#EEF2FF", text:dark?"#9AB0FF":"#312E81" },
  };
  return (
    <div style={{ overflowX:"auto", borderRadius:14, border:`1px solid ${T.divider}` }}>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead>
          <tr style={{ background:T.surfaceEl, borderBottom:`1.5px solid ${T.divider}` }}>
            {["Utilisateur","Rôle","Affectation","Statut"].map(h => (
              <th key={h} style={{ textAlign:"left", padding:"11px 16px", fontSize:9.5, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:T.textMuted }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? Array(3).fill(0).map((_, i) => (
            <tr key={i} style={{ borderBottom:`1px solid ${T.divider}` }}>
              {[1,2,3,4].map(j => <td key={j} style={{ padding:"14px 16px" }}><Skel h={13} r={5} T={T}/></td>)}
            </tr>
          )) : users.slice(0, 8).map((u, i) => {
            const lv = u.role?.level;
            const nb = NB[lv] || { bg:T.ice, text:T.textSec };
            const rn = u.role?.name || "—";
            const ini = (u.first_name?.[0] || u.username?.[0] || "?").toUpperCase();
            return (
              <tr key={u.id} className="da-urow" style={{ borderBottom: i < users.length - 1 ? `1px solid ${T.divider}` : "none" }}>
                <td style={{ padding:"12px 16px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:9, background:nb.bg, border:`1.5px solid ${nb.text}20`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:nb.text, flexShrink:0 }}>{ini}</div>
                    <div>
                      <p style={{ margin:0, fontWeight:600, fontSize:12.5, color:T.textPri }}>{u.username}</p>
                      <p style={{ margin:0, fontSize:11, color:T.textMuted }}>{u.first_name} {u.last_name}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding:"12px 16px" }}>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:999, fontSize:11, fontWeight:600, background:nb.bg, color:nb.text }}>
                    <span style={{ width:5, height:5, borderRadius:"50%", background:nb.text }}/>{rn}
                  </span>
                </td>
                <td style={{ padding:"12px 16px", fontSize:11.5, color:T.textSec }}>
                  {u.division && <span style={{ display:"inline-block", background:`${T.brand}12`, color:T.brand, borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:600, marginRight:4 }}>🏢 {u.division}</span>}
                  {u.antenne  && <span style={{ display:"inline-block", background:"#0891B214", color:"#0891B2", borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:600 }}>📍 {ANTENNE_LABELS[u.antenne]||u.antenne}</span>}
                  {!u.division && !u.antenne && <span style={{ color:T.textMuted }}>—</span>}
                </td>
                <td style={{ padding:"12px 16px" }}>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:11, fontWeight:600, color:u.is_active!==false?T.greenLight:T.rose }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", background:u.is_active!==false?T.greenLight:T.rose }}/>
                    {u.is_active !== false ? "Actif" : "Inactif"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!loading && users.length === 0 && (
        <div style={{ textAlign:"center", padding:"40px 0", color:T.textMuted }}>
          <div style={{ fontSize:36, marginBottom:8 }}>👥</div>
          <p style={{ fontWeight:600, fontSize:13 }}>Aucun utilisateur dans votre périmètre</p>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
═══════════════════════════════════════════════════════════════ */
const DashboardAdmin = () => {
  const { dark, toggle: toggleTheme, T } = useTheme();
  const CSS = buildCSS(T, dark);

  const [time,       setTime]       = useState(new Date());
  const [notifOpen,  setNotifOpen]  = useState(false);
  const [activeTab,  setActiveTab]  = useState("modules");
  const [notifPos,   setNotifPos]   = useState({ top:0, right:0 });
  const bellRef = useRef(null);

  const user       = getStoredUser();
  const roleName   = getRoleName(user.role);
  const roleLevel  = getRoleLevel(user.role) || user.niveau || 0;
  const roleLabel  = ROLE_LABELS[roleName] || roleName;
  const rBadge     = getRoleBadge(roleName, dark);
  const group      = resolveGroup(roleName);

  const displayName = user.firstName ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}` : user.username || "Admin";
  const initials    = displayName.split(" ").filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?";

  const sections  = buildNavCategories(roleName, T);
  const totalMod  = sections.reduce((a, s) => a + s.items.length, 0);
  const isDG      = group === "DG" && roleLevel >= 90;

  const { data: apiData, loading: apiLoad, refetch } = useDashData();
  const dash  = apiData?.dash  || null;
  const users = apiData?.users || [];

  /* KPIs */
  const buildKpis = () => {
    const tot = users.length;
    const act = users.filter(u => u.is_active !== false).length;
    const uDiv = [...new Set(users.map(u => u.division).filter(Boolean))].length;
    const uAnt = [...new Set(users.map(u => u.antenne).filter(Boolean))].length;

    if (roleLevel >= 90) return [
      { label:"Utilisateurs actifs", value:act.toString(), trend:"+", up:true,  icon:Users,     color:T.brand,      sub:`${tot} enregistrés`,         delay:1 },
      { label:"Divisions couvertes", value:uDiv.toString(), trend:"—", up:null, icon:Building2, color:T.goldBright, sub:"divisions actives",            delay:2 },
      { label:"Antennes",            value:uAnt.toString(), trend:"—", up:null, icon:MapPin,    color:T.green,      sub:"antennes enregistrées",        delay:3 },
      { label:"Périmètre",           value:"Global",        trend:"—", up:null, icon:Globe,     color:T.violet,     sub:"accès complet plateforme",     delay:4 },
    ];
    if ([70, 60].includes(roleLevel)) {
      const d = user.division || dash?.ma_division;
      return [
        { label:"Membres division", value:tot.toString(), trend:"—", up:null,  icon:Users,      color:T.brand,      sub:`div. ${d||"—"}`,          delay:1 },
        { label:"Membres actifs",   value:act.toString(), trend:"—", up:null,  icon:CheckCircle2,color:T.green,     sub:"comptes actifs",           delay:2 },
        { label:"Ma division",      value:d||"—",         trend:"—", up:null,  icon:Building2,  color:T.goldBright, sub:DIVISION_LABELS[d]||"—",   delay:3 },
        { label:"Antennes liées",   value:uAnt.toString(),trend:"—", up:null,  icon:MapPin,     color:T.violet,     sub:"dans votre division",      delay:4 },
      ];
    }
    if ([50, 30].includes(roleLevel)) {
      const a = user.antenne || dash?.mon_antenne;
      return [
        { label:"Membres antenne", value:tot.toString(), trend:"—", up:null, icon:Users,      color:T.brand,      sub:`antenne ${ANTENNE_LABELS[a]||a||"—"}`, delay:1 },
        { label:"Membres actifs",  value:act.toString(), trend:"—", up:null, icon:CheckCircle2,color:T.green,     sub:"comptes actifs",                       delay:2 },
        { label:"Mon antenne",     value:ANTENNE_LABELS[a]||a||"—", trend:"—", up:null, icon:MapPin, color:T.goldBright, sub:"votre périmètre",             delay:3 },
        { label:"Votre rôle",      value:roleLabel,      trend:"—", up:null, icon:ShieldCheck, color:T.violet,    sub:`niveau ${roleLevel}`,                 delay:4 },
      ];
    }
    return [
      { label:"Mon espace", value:displayName, trend:"—", up:null, icon:Users,      color:T.brand,      sub:roleLabel,         delay:1 },
      { label:"Niveau",     value:roleLevel.toString(), trend:"—", up:null, icon:ShieldCheck, color:T.goldBright, sub:"niveau d'accès", delay:2 },
    ];
  };

  const kpis = buildKpis();

  const recentUsers = [...users]
    .sort((a, b) => new Date(b.date_joined || 0) - new Date(a.date_joined || 0))
    .slice(0, 5)
    .map(u => ({
      text:   `${u.username} — compte enregistré`,
      detail: `${u.role?.name || "—"} · ${u.division ? `Division ${u.division}` : u.antenne ? `Antenne ${ANTENNE_LABELS[u.antenne] || u.antenne}` : "Accès global"}`,
      time:   u.date_joined ? new Date(u.date_joined).toLocaleDateString("fr-FR") : "Récemment",
      color:  T.brand,
    }));

  const tabs = [
    { id:"modules",      label:"Modules",      icon:LayoutDashboard },
    { id:"activite",     label:"Utilisateurs", icon:Users           },
    { id:"statistiques", label:"Mon périmètre",icon:Activity        },
  ];

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
      setNotifPos({ top: r.bottom + 10, right: window.innerWidth - r.right });
    }
    setNotifOpen(v => !v);
  };

  const hh = String(time.getHours()).padStart(2, "0");
  const mm = String(time.getMinutes()).padStart(2, "0");
  const ss = String(time.getSeconds()).padStart(2, "0");
  const greeting  = time.getHours() < 12 ? "Bonjour" : time.getHours() < 18 ? "Bon après-midi" : "Bonsoir";
  const dateStr   = time.toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
  const userDiv   = user.division || dash?.ma_division || null;
  const userAnt   = user.antenne  || dash?.mon_antenne  || null;
  const unread    = Math.min(recentUsers.length, 3);

  /* Couleurs section card */
  const secColor = {
    background: T.surface,
    border: `1px solid ${T.divider}`,
    boxShadow: `0 2px 16px ${T.sh1}`,
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="da da-page" style={{ minHeight:"100vh", padding:"62px 28px 60px", position:"relative" }}>

        {/* Aurora déco (fixe) */}
        <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", overflow:"hidden" }}>
          <div className="da-orb" style={{
            position:"absolute", top:"-6%", right:"8%",
            width:560, height:560, borderRadius:"50%",
            background:`radial-gradient(circle,${T.brandGlow} 0%,transparent 68%)`,
            filter:"blur(36px)",
          }}/>
          <div style={{
            position:"absolute", bottom:"6%", left:"4%",
            width:400, height:400, borderRadius:"50%",
            background:`radial-gradient(circle,${dark ? "rgba(4,96,72,.08)" : "rgba(4,96,72,.035)"} 0%,transparent 70%)`,
            filter:"blur(40px)",
          }}/>
        </div>

        <div style={{ position:"relative", zIndex:1 }}>

          {/* ═══════════════════════════════════════════════════
              HERO BANNER — toujours dark pour le contraste
          ═══════════════════════════════════════════════════ */}
          <div className="da-in da-d0" style={{
            background: T.heroBg,
            borderRadius: 28, marginBottom: 16,
            padding: "32px 44px",
            boxShadow: "0 24px 70px rgba(4,16,31,.65), inset 0 1px 0 rgba(255,255,255,.07)",
            position: "relative", overflow: "hidden",
          }}>
            {/* Décors hero */}
            <div style={{ position:"absolute", inset:0, borderRadius:28, overflow:"hidden", pointerEvents:"none" }}>
              <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:.07 }} xmlns="http://www.w3.org/2000/svg">
                <defs><pattern id="hg2" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,1)" strokeWidth=".5"/></pattern></defs>
                <rect width="100%" height="100%" fill="url(#hg2)"/>
              </svg>
              <div style={{ position:"absolute", top:-80, right:-60, width:380, height:380, borderRadius:"50%", background:"rgba(255,255,255,.035)" }}/>
              <div style={{ position:"absolute", top:"20%", left:"-5%", width:"115%", height:1, background:"linear-gradient(90deg,transparent,rgba(255,255,255,.06),transparent)", transform:"rotate(-8deg)" }}/>
              {/* Tricolore top */}
              <div style={{ position:"absolute", top:0, left:0, right:0, height:5, display:"flex", borderRadius:"28px 28px 0 0" }}>
                <div style={{ flex:1, background:"linear-gradient(90deg,#B01010,#D42020)" }}/>
                <div style={{ flex:1, background:`linear-gradient(90deg,#B87A00,#F5B020)` }}/>
                <div style={{ flex:1, background:`linear-gradient(90deg,#046048,#0BAF7A)` }}/>
              </div>
            </div>

            <div className="da-hero-in" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:28, flexWrap:"wrap", position:"relative", zIndex:1 }}>

              {/* ── Gauche ── */}
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:18, opacity:.45 }}>
                  <Globe size={10} color="#F5B020"/>
                  <span style={{ fontSize:9.5, color:"#F5B020", fontWeight:700, letterSpacing:".22em", textTransform:"uppercase" }}>ONFPP · Plateforme Nationale · République de Guinée</span>
                </div>

                <div style={{ display:"flex", alignItems:"center", gap:18, marginBottom:20 }}>
                  <div style={{ position:"relative", flexShrink:0 }}>
                    <div style={{
                      width:62, height:62, borderRadius:18,
                      background:`linear-gradient(140deg,${rBadge.dot}55,${rBadge.dot}1A)`,
                      border:"1.5px solid rgba(255,255,255,.2)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      boxShadow:`0 0 0 4px rgba(255,255,255,.06), 0 10px 32px rgba(0,0,0,.32), 0 0 28px ${rBadge.dot}28`,
                    }}>
                      <span className="da-f" style={{ fontSize:25, fontStyle:"italic", color:"#fff" }}>{initials}</span>
                    </div>
                    <div style={{ position:"absolute", bottom:-4, right:-4, width:18, height:18, borderRadius:6, background:rBadge.dot, border:"2px solid rgba(255,255,255,.25)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 0 10px ${rBadge.dot}60` }}>
                      <div style={{ width:6, height:6, borderRadius:"50%", background:"#fff" }}/>
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize:11.5, color:"rgba(255,255,255,.45)", fontWeight:400, marginBottom:5 }}>{greeting}</p>
                    <h1 className="da-f" style={{ fontSize:30, fontStyle:"italic", color:"#fff", lineHeight:1.05 }}>{displayName}</h1>
                    <p style={{ fontSize:11, color:"rgba(255,255,255,.38)", marginTop:6, letterSpacing:".02em" }}>{dateStr}</p>
                  </div>
                </div>

                {/* Badges */}
                <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:7, background:"rgba(255,255,255,.10)", backdropFilter:"blur(12px)", border:"1px solid rgba(255,255,255,.17)", borderRadius:30, padding:"6px 16px", fontSize:12, fontWeight:600, color:"#fff" }}>
                    <ShieldCheck size={12}/>{roleLabel}
                  </span>
                  {roleLevel > 0 && (
                    <span style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:11.5, background:"rgba(224,154,0,.2)", border:"1px solid rgba(224,154,0,.3)", borderRadius:30, padding:"5px 14px", fontWeight:700, color:"#FFD060" }}>
                      <Star size={10} color="#FFD060" fill="#FFD060"/> Niv. {roleLevel}
                    </span>
                  )}
                  {userDiv && roleLevel < 90 && (
                    <span style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:11, background:"rgba(26,59,140,.3)", border:"1px solid rgba(93,130,255,.32)", borderRadius:30, padding:"5px 14px", fontWeight:600, color:"#9AB0FF" }}>
                      🏢 {userDiv}
                    </span>
                  )}
                  {userAnt && roleLevel < 90 && (
                    <span style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:11, background:"rgba(8,145,178,.22)", border:"1px solid rgba(8,145,178,.3)", borderRadius:30, padding:"5px 14px", fontWeight:600, color:"#7DDFF7" }}>
                      📍 {ANTENNE_LABELS[userAnt] || userAnt}
                    </span>
                  )}
                  {roleLevel >= 90 && (
                    <span style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:11, background:"rgba(11,175,122,.22)", border:"1px solid rgba(11,175,122,.32)", borderRadius:30, padding:"5px 14px", fontWeight:600, color:"#5AEEC0" }}>
                      🌐 Accès global
                    </span>
                  )}
                </div>
              </div>

              {/* ── Droite — horloge + actions ── */}
              <div className="da-hero-r" style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:14 }}>
                {/* Horloge */}
                <div style={{
                  background:"rgba(4,16,31,.55)", backdropFilter:"blur(20px)",
                  border:"1px solid rgba(255,255,255,.11)", borderRadius:20,
                  padding:"16px 24px", textAlign:"center",
                  boxShadow:"0 8px 40px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.07)",
                }}>
                  <p className="da-f" style={{ fontSize:42, color:"#fff", lineHeight:1, letterSpacing:"2px", textShadow:"0 0 30px rgba(93,130,255,.35)" }}>
                    {hh}<span className="da-blink" style={{ color:"#5B82FF" }}>:</span>{mm}
                    <span style={{ fontSize:22, color:"rgba(255,255,255,.38)" }}>:{ss}</span>
                  </p>
                  <p style={{ fontSize:9, color:"rgba(255,255,255,.32)", fontWeight:600, marginTop:8, letterSpacing:".24em", textTransform:"uppercase" }}>
                    Heure locale · Conakry, Guinée
                  </p>
                </div>

                {/* Contrôles */}
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  {/* Statut en ligne */}
                  <div style={{ display:"flex", alignItems:"center", gap:7, background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.13)", borderRadius:12, padding:"8px 14px", backdropFilter:"blur(10px)" }}>
                    <div className="da-live" style={{ width:7, height:7, borderRadius:"50%", background:"#0BAF7A" }}/>
                    <span style={{ fontSize:11.5, color:"rgba(255,255,255,.72)", fontWeight:600 }}>En ligne</span>
                  </div>

                  {/* Toggle thème */}
                  <button onClick={toggleTheme} title={dark ? "Mode clair" : "Mode sombre"} style={{
                    width:44, height:44, borderRadius:13,
                    background:"rgba(255,255,255,.09)", border:"1px solid rgba(255,255,255,.16)",
                    cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                    color:"rgba(255,255,255,.7)", backdropFilter:"blur(10px)", transition:"background .15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.18)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.09)"}
                  >
                    {dark ? <Sun size={16}/> : <Moon size={16}/>}
                  </button>

                  {/* Refresh */}
                  <button onClick={refetch} title="Actualiser" style={{
                    width:44, height:44, borderRadius:13,
                    background:"rgba(255,255,255,.09)", border:"1px solid rgba(255,255,255,.16)",
                    cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                    color:"rgba(255,255,255,.7)", backdropFilter:"blur(10px)", transition:"background .15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.18)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.09)"}
                  >
                    <RefreshCw size={16} className="da-refr"/>
                  </button>

                  {/* Modules count */}
                  <div style={{ background:"rgba(255,255,255,.09)", border:"1px solid rgba(255,255,255,.14)", borderRadius:13, padding:"8px 16px", display:"flex", alignItems:"center", gap:8, backdropFilter:"blur(10px)" }}>
                    <LayoutDashboard size={12} color="rgba(255,255,255,.6)"/>
                    <span style={{ fontSize:11.5, color:"rgba(255,255,255,.75)", fontWeight:600 }}>{totalMod} modules</span>
                  </div>

                  {/* Bell */}
                  <div style={{ position:"relative" }} ref={bellRef}>
                    <button onClick={openNotif} style={{
                      width:44, height:44, borderRadius:13,
                      background:"rgba(255,255,255,.09)", border:"1px solid rgba(255,255,255,.16)",
                      cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                      color:"#fff", backdropFilter:"blur(10px)", transition:"background .15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.18)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.09)"}
                    >
                      <Bell size={18}/>
                    </button>
                    {unread > 0 && <span className="da-badge" style={{ position:"absolute", top:-6, right:-6, minWidth:19, height:19, borderRadius:12, background:"#CC1840", color:"#fff", fontSize:9.5, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 5px", border:"2.5px solid rgba(4,16,31,.8)" }}>{unread}</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notifs dropdown */}
          {notifOpen && (
            <>
              <div style={{ position:"fixed", inset:0, zIndex:998 }} onClick={() => setNotifOpen(false)}/>
              <div className="da-notif" style={{ position:"fixed", top:notifPos.top, right:notifPos.right, width:340, background:T.surface, border:`1px solid ${T.divider}`, borderTop:`3px solid ${T.goldBright}`, borderRadius:"0 0 16px 16px", boxShadow:`0 28px 72px ${T.sh2}`, zIndex:999, overflow:"hidden" }}>
                <div style={{ padding:"13px 18px 11px", borderBottom:`1px solid ${T.divider}`, display:"flex", justifyContent:"space-between", alignItems:"center", background:T.goldPale }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <Bell size={12} color={T.gold}/>
                    <p className="da-f" style={{ fontSize:13, fontStyle:"italic", color:T.textPri }}>Activité récente</p>
                  </div>
                  <span style={{ fontSize:10, color:T.gold, fontWeight:700, background:`${T.gold}14`, padding:"2px 9px", borderRadius:20 }}>{users.length} utilisateurs</span>
                </div>
                {recentUsers.slice(0, 4).map((n, i) => (
                  <div key={i} className="da-ni" style={{ padding:"12px 18px", borderBottom:i<3?`1px solid ${T.divider}`:"none", display:"flex", gap:12, alignItems:"flex-start" }}>
                    <div style={{ width:7, height:7, borderRadius:"50%", flexShrink:0, marginTop:5, background:n.color, boxShadow:`0 0 0 3px ${n.color}22` }}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:12.5, fontWeight:600, color:T.textPri }}>{n.text}</p>
                      <p style={{ fontSize:11, color:T.textMuted, marginTop:2 }}>{n.detail} · {n.time}</p>
                    </div>
                  </div>
                ))}
                {recentUsers.length === 0 && !apiLoad && <div style={{ padding:"24px 18px", textAlign:"center", color:T.textMuted, fontSize:12 }}>Aucune activité récente</div>}
                <div style={{ padding:"10px 18px 13px", borderTop:`1px solid ${T.divider}`, display:"flex", justifyContent:"center" }}>
                  <button onClick={() => { setNotifOpen(false); setActiveTab("activite"); }} style={{ fontSize:12, fontWeight:700, color:T.brand, background:"none", border:"none", cursor:"pointer" }}>
                    Voir tous les utilisateurs →
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ═══ KPIs ═══ */}
          <div className="da-kgrid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))", gap:14, marginBottom:24 }}>
            {kpis.map((s, i) => <KpiCard key={i} {...s} loading={apiLoad} T={T} dark={dark}/>)}
          </div>

          {/* ═══ TABS ═══ */}
          <div style={{
            display:"flex", gap:3, marginBottom:22, padding:"4px",
            background: T.surface, border:`1px solid ${T.divider}`,
            borderRadius:14, width:"fit-content",
            boxShadow:`0 2px 14px ${T.sh1}`,
          }}>
            {tabs.map(tab => {
              const isAct = activeTab === tab.id;
              return (
                <button key={tab.id} className={`da-tab${isAct ? " da-tab-act" : ""}`} onClick={() => setActiveTab(tab.id)} style={{
                  display:"flex", alignItems:"center", gap:7, padding:"9px 20px", borderRadius:11, border:"none",
                  fontSize:12.5, fontWeight:isAct ? 600 : 400,
                  background: isAct ? T.heroBg : "transparent",
                  color: isAct ? "#fff" : T.textMuted,
                  boxShadow: isAct ? "0 5px 20px rgba(4,16,31,.28), inset 0 1px 0 rgba(255,255,255,.09)" : "none",
                  cursor:"pointer",
                }}>
                  <tab.icon size={13}/>{tab.label}
                </button>
              );
            })}
          </div>

          {/* ═══ VUE MODULES ═══ */}
          {activeTab === "modules" && (
            <div className="da-layout" style={{ display:"grid", gridTemplateColumns:"1fr 296px", gap:20, alignItems:"start" }}>
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {sections.map((sec, si) => (
                  <SBox key={si} icon={sec.icon} title={sec.section} color={sec.color} count={String(sec.items.length)} delay={`da-d${Math.min(si+1,5)}`} T={T}>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:7 }}>
                      {sec.items.map((m, mi) => <ModRow key={mi} label={m.label} icon={m.icon} path={m.path} color={sec.color} T={T}/>)}
                    </div>
                  </SBox>
                ))}
              </div>

              {/* Sidebar droite */}
              <div className="da-rsb" style={{ display:"flex", flexDirection:"column", gap:14 }}>

                {/* Profil card — toujours dark */}
                <div className="da-in da-d1" style={{
                  background: T.heroBg, borderRadius:22, padding:"22px 20px",
                  boxShadow:"0 16px 52px rgba(4,16,31,.65)",
                  position:"relative", overflow:"hidden",
                }}>
                  <div style={{ position:"absolute", inset:0, borderRadius:22, overflow:"hidden", pointerEvents:"none" }}>
                    <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:.07 }} xmlns="http://www.w3.org/2000/svg">
                      <defs><pattern id="pcg2" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(255,255,255,1)" strokeWidth=".5"/></pattern></defs>
                      <rect width="100%" height="100%" fill="url(#pcg2)"/>
                    </svg>
                    <div style={{ position:"absolute", top:0, left:0, right:0, height:5, display:"flex", borderRadius:"22px 22px 0 0" }}>
                      <div style={{ flex:1, background:"#D42020" }}/><div style={{ flex:1, background:"#F5B020" }}/><div style={{ flex:1, background:"#0BAF7A" }}/>
                    </div>
                  </div>
                  <p style={{ fontSize:8.5, color:"rgba(255,255,255,.25)", marginBottom:16, letterSpacing:".26em", textTransform:"uppercase", fontWeight:700, position:"relative" }}>Votre espace</p>
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16, position:"relative" }}>
                    <div style={{ width:50, height:50, borderRadius:15, flexShrink:0, background:`${rBadge.dot}40`, border:"1.5px solid rgba(255,255,255,.18)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 18px rgba(0,0,0,.28)" }}>
                      <span className="da-f" style={{ fontSize:21, fontStyle:"italic", color:"#fff" }}>{initials}</span>
                    </div>
                    <div>
                      <p className="da-f" style={{ fontStyle:"italic", fontSize:14.5, color:"#fff" }}>{displayName}</p>
                      <span style={{ display:"inline-flex", alignItems:"center", gap:5, marginTop:5, background:rBadge.bg, color:rBadge.text, border:`1px solid ${rBadge.border}`, borderRadius:30, padding:"3px 10px 3px 7px", fontSize:8.5, fontWeight:600 }}>
                        <span style={{ width:5, height:5, borderRadius:"50%", background:rBadge.dot, boxShadow:`0 0 5px ${rBadge.dot}`, flexShrink:0 }}/>{roleLabel}
                      </span>
                    </div>
                  </div>
                  {(userDiv || userAnt) && roleLevel < 90 && (
                    <div style={{ background:"rgba(255,255,255,.06)", borderRadius:10, padding:"10px 12px", marginBottom:12, position:"relative" }}>
                      <p style={{ fontSize:9, color:"rgba(255,255,255,.3)", fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", marginBottom:6 }}>Périmètre</p>
                      {userDiv && <p style={{ fontSize:11.5, color:"rgba(255,255,255,.75)", fontWeight:500 }}>🏢 {DIVISION_LABELS[userDiv] || userDiv}</p>}
                      {userAnt && <p style={{ fontSize:11.5, color:"rgba(255,255,255,.75)", fontWeight:500, marginTop:4 }}>📍 {ANTENNE_LABELS[userAnt] || userAnt}</p>}
                    </div>
                  )}
                  {roleLevel >= 90 && (
                    <div style={{ background:"rgba(255,255,255,.06)", borderRadius:10, padding:"10px 12px", marginBottom:12, position:"relative" }}>
                      <p style={{ fontSize:9, color:"rgba(255,255,255,.3)", fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", marginBottom:6 }}>Périmètre</p>
                      <p style={{ fontSize:11.5, color:"rgba(255,255,255,.75)", fontWeight:500 }}>🌐 Accès global — toutes divisions</p>
                    </div>
                  )}
                  <div style={{ display:"flex", justifyContent:"space-between", paddingTop:12, borderTop:"1px solid rgba(255,255,255,.08)", position:"relative" }}>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,.32)" }}>{totalMod} modules</span>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,.58)", fontWeight:600 }}>{apiLoad ? "…" : users.length} utilisateurs</span>
                  </div>
                </div>

                {/* Accès rapides */}
                <div className="da-in da-d2" style={{ background:T.surface, border:`1px solid ${T.divider}`, borderRadius:20, padding:"20px", boxShadow:`0 2px 16px ${T.sh1}` }}>
                  <SHdr icon={Zap} title="Accès rapides" color={T.goldBright} T={T}/>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                    {(isDG
                      ? [{ path:"/apprenants", label:"Apprenants", icon:GraduationCap, color:T.brand },{ path:"/statistiques", label:"Statistiques", icon:PieChart, color:T.violet },{ path:"/rapports", label:"Rapports", icon:BarChart3, color:T.teal },{ path:"/utilisateurs", label:"Utilisateurs", icon:UserCog, color:"#374B8A" }]
                      : [{ path:"/apprenants", label:"Apprenants", icon:GraduationCap, color:T.brand },{ path:"/presences",    label:"Présences",   icon:CalendarDays, color:T.green },{ path:"/statistiques", label:"Statistiques", icon:PieChart, color:T.violet },{ path:"/rapports", label:"Rapports", icon:BarChart3, color:T.teal }]
                    ).map((q, i) => <QL key={i} {...q} T={T}/>)}
                  </div>
                </div>

                {/* Carte ONFPP */}
                <div className="da-in da-d3" style={{
                  background: dark
                    ? `linear-gradient(140deg,rgba(184,122,0,.12),${T.surface})`
                    : `linear-gradient(140deg,${T.goldPale},${T.surface})`,
                  border:`1px solid ${dark ? "rgba(184,122,0,.2)" : "rgba(184,122,0,.18)"}`,
                  borderRadius:20, padding:"18px 20px",
                  boxShadow:`0 2px 14px ${dark ? "rgba(184,122,0,.08)" : "rgba(184,122,0,.06)"}`,
                }}>
                  <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:12 }}>
                    <Sparkles size={13} color={T.gold}/>
                    <p className="da-f" style={{ fontSize:12, fontStyle:"italic", color:T.textPri }}>Office National de Formation Professionnelle</p>
                  </div>
                  <p style={{ fontSize:11, color:T.textSec, lineHeight:1.8 }}>Plateforme nationale de suivi des formations professionnelles en République de Guinée.</p>
                  <div style={{ display:"flex", gap:7, marginTop:13 }}>
                    {[{ v:"2025", l:"Exercice" },{ v:"v3.0", l:"Version" },{ v:"🇬🇳", l:"Guinée" }].map((b, i) => (
                      <div key={i} style={{ flex:1, background:dark?"rgba(255,255,255,.04)":"rgba(255,255,255,.8)", borderRadius:9, padding:"9px 7px", textAlign:"center", border:`1px solid ${dark?"rgba(184,122,0,.16)":"rgba(184,122,0,.12)"}` }}>
                        <p className="da-f" style={{ fontSize:13.5, fontStyle:"italic", color:T.textPri, lineHeight:1 }}>{b.v}</p>
                        <p style={{ fontSize:9, color:T.textMuted, marginTop:4 }}>{b.l}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ VUE UTILISATEURS ═══ */}
          {activeTab === "activite" && (
            <div style={{ maxWidth:900 }}>
              <ScopeBanner division={userDiv} antenne={userAnt} niveau={roleLevel} T={T}/>
              <SBox icon={Users} title="Utilisateurs de votre périmètre" color={T.brand} count={apiLoad?"…":String(users.length)} delay="da-in da-d0" T={T}>
                <UsersTable users={users} loading={apiLoad} T={T} dark={dark}/>
              </SBox>
              {!apiLoad && users.length > 0 && (
                <div className="da-in da-d1" style={{ background:T.surface, border:`1px solid ${T.divider}`, borderRadius:20, padding:"22px", boxShadow:`0 2px 16px ${T.sh1}`, marginTop:14 }}>
                  <SHdr icon={BarChart3} title="Répartition par rôle" color={T.violet} T={T}/>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:9 }}>
                    {Object.entries(
                      users.reduce((acc, u) => { const r = u.role?.name || "Inconnu"; acc[r] = (acc[r] || 0) + 1; return acc; }, {})
                    ).map(([role, count], i) => {
                      const rb = getRoleBadge(role, dark);
                      return (
                        <div key={i} style={{ display:"flex", alignItems:"center", gap:8, background:rb.bg, border:`1px solid ${rb.dot}22`, borderRadius:10, padding:"8px 14px" }}>
                          <span style={{ width:7, height:7, borderRadius:"50%", background:rb.dot, flexShrink:0 }}/>
                          <span style={{ fontSize:12, fontWeight:600, color:rb.text }}>{role}</span>
                          <span style={{ fontSize:12, fontWeight:800, color:rb.text }}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ VUE PÉRIMÈTRE ═══ */}
          {activeTab === "statistiques" && (
            <div style={{ maxWidth:760 }}>
              <ScopeBanner division={userDiv} antenne={userAnt} niveau={roleLevel} T={T}/>
              <div className="da-in da-d0" style={{ background:T.surface, border:`1px solid ${T.divider}`, borderRadius:20, padding:"26px", boxShadow:`0 2px 18px ${T.sh1}`, marginBottom:14 }}>
                <SHdr icon={ShieldCheck} title="Informations de votre compte" color={T.brand} T={T}/>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  {[
                    { label:"Nom d'utilisateur",value:user.username },
                    { label:"Nom complet",       value:displayName  },
                    { label:"Rôle",              value:roleLabel     },
                    { label:"Niveau d'accès",    value:String(roleLevel) },
                    { label:"Division",          value:userDiv ? (DIVISION_LABELS[userDiv]||userDiv) : roleLevel>=90?"Toutes":"—" },
                    { label:"Antenne",           value:userAnt ? (ANTENNE_LABELS[userAnt]||userAnt)  : roleLevel>=90?"Toutes":"—" },
                  ].map((item, i) => (
                    <div key={i} style={{ background:T.surfaceEl, borderRadius:12, padding:"14px 16px", border:`1px solid ${T.divider}` }}>
                      <p style={{ fontSize:9.5, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:T.textMuted, marginBottom:7 }}>{item.label}</p>
                      <p className="da-f" style={{ fontSize:15, fontStyle:"italic", color:T.textPri }}>{item.value || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="da-in da-d1" style={{ background:T.surface, border:`1px solid ${T.divider}`, borderRadius:20, padding:"22px", boxShadow:`0 2px 16px ${T.sh1}` }}>
                <SHdr icon={Activity} title="Périmètre d'accès autorisé" color={T.green} T={T}/>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {[
                    { label:"Voir tous les utilisateurs",             ok:roleLevel>=90 },
                    { label:"Voir utilisateurs de ma division",       ok:roleLevel>=60 },
                    { label:"Voir utilisateurs de mon antenne",       ok:roleLevel>=30 },
                    { label:"Gérer les utilisateurs",                 ok:roleLevel>=90 },
                    { label:"Accès statistiques globales",            ok:roleLevel>=90 },
                    { label:"Accès statistiques section/antenne",     ok:roleLevel>=50 },
                    { label:"Export PDF / Excel",                     ok:roleLevel>=50 },
                  ].map((item, i) => (
                    <div key={i} className="da-stat-row" style={{
                      display:"flex", alignItems:"center", justifyContent:"space-between",
                      padding:"10px 14px",
                      background: item.ok ? T.greenPale : T.surfaceEl,
                      borderRadius:10,
                      border:`1px solid ${item.ok ? T.green + "28" : T.divider}`,
                    }}>
                      <span style={{ fontSize:13, color:item.ok ? T.textPri : T.textMuted }}>{item.label}</span>
                      <span style={{
                        fontSize:10.5, fontWeight:700,
                        color: item.ok ? T.green : T.textMuted,
                        background: item.ok ? `${T.green}15` : "transparent",
                        borderRadius:20, padding:"2px 10px",
                        border:`1px solid ${item.ok ? T.green + "22" : "transparent"}`,
                      }}>{item.ok ? "✓ Autorisé" : "✗ Restreint"}</span>
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