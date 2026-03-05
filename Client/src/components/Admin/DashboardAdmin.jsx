import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap, BookOpen, ClipboardList, Award, BarChart3,
  Building2, CheckCircle2, Clock, FileText, Briefcase, PieChart,
  AlertTriangle, Package, UserCog, Settings, Layers, Users,
  Bell, CalendarDays, ShieldCheck, MapPin,
  TrendingUp, TrendingDown, Activity,
  LayoutDashboard, ChevronRight, Zap, UserCheck,
  Sparkles, Globe, Star, ArrowUpRight, Target,
} from "lucide-react";

/* ─────────────────────────────────────────
   FONT + CSS
───────────────────────────────────────── */
const FONT_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .dash-root { font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }

  .kpi-card { transition: transform .22s cubic-bezier(.34,1.56,.64,1), box-shadow .22s ease; }
  .kpi-card:hover { transform: translateY(-5px) scale(1.01); box-shadow: 0 20px 50px rgba(13,27,94,0.17) !important; }

  .mod-card { transition: all .18s cubic-bezier(.34,1.2,.64,1); }
  .mod-card:hover { transform: translateX(5px); background: #EEF2FF !important; border-color: #C7D2FE !important; }
  .mod-card:hover .mod-arrow { transform: translateX(4px); opacity: 1 !important; }

  .quick-link { transition: all .16s ease; }
  .quick-link:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(13,27,94,0.12) !important; }

  .glob-stat { transition: all .15s ease; cursor: default; }
  .glob-stat:hover { background: #EEF2FF !important; transform: translateY(-1px); }

  .dash-tab { transition: all .18s ease; cursor: pointer; }
  .dash-tab:hover { background: rgba(26,59,212,0.06) !important; }

  @keyframes fadeSlideUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  .anim-in  { animation: fadeSlideUp .42s cubic-bezier(.22,1,.36,1) both; }
  .anim-in-1 { animation-delay:.04s; } .anim-in-2 { animation-delay:.08s; }
  .anim-in-3 { animation-delay:.12s; } .anim-in-4 { animation-delay:.16s; }
  .anim-in-5 { animation-delay:.20s; }

  @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.25)} }
  .notif-pulse { animation: pulse 2s ease infinite; }

  @keyframes clockTick { 0%,49%{opacity:1} 50%,100%{opacity:.45} }
  .clock-sep { animation: clockTick 1s step-end infinite; }

  @keyframes barGrow { from{width:0} to{width:var(--bar-w)} }
  .bar-anim { animation: barGrow .9s cubic-bezier(.22,1,.36,1) both; }

  /* Notif dropdown slide */
  @keyframes notifIn { from{opacity:0;transform:translateY(-8px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  .notif-panel { animation: notifIn .18s cubic-bezier(.22,1,.36,1) both; }

  @media (max-width:900px) {
    .dash-grid-main { grid-template-columns: 1fr !important; }
    .dash-hero-inner { flex-direction: column !important; gap: 16px !important; }
    .dash-hero-right { align-items: flex-start !important; }
  }
  @media (max-width:640px) {
    .kpi-grid { grid-template-columns: 1fr 1fr !important; }
    .dash-root { padding: 80px 14px 40px !important; }
  }
`;

/* ─────────────────────────────────────────
   PALETTE
───────────────────────────────────────── */
const C = {
  bg:"#F0F4FF", surface:"#FFFFFF", surfaceAlt:"#EEF2FF",
  navy:"#0D1B5E", blue:"#1A3BD4", steel:"#3A6FFF",
  sky:"#6B9FFF", iceBlue:"#C8D9FF",
  textSub:"#4A5A8A", textMuted:"#8FA3D8",
  accent:"#F5A800", success:"#0BA376", orange:"#FF6B35",
  purple:"#7C3AED", danger:"#E53935", gold:"#C9952A",
  shadow:"rgba(26,59,212,0.10)",
};

const ROLE_LABELS = {
  "Directeur Général":"Directeur Général",
  "Directeur Général Adjoint":"Directeur Général Adjoint",
  "Chef de Division":"Chef de Division",
  "Chef de Section":"Chef de Section",
  "Chef d'Antenne":"Chef d'Antenne",
  "Formateur":"Formateur", "Conseiller":"Conseiller", "Entreprise":"Entreprise",
  DG:"Directeur Général", CD:"Chef de Division",
  DR:"Directeur Général Adjoint", CC:"Chef d'Antenne",
  FORMATEUR:"Formateur", SUPERADMIN:"Super Administrateur",
};

const ROLE_COLORS = {
  "Directeur Général":        {bg:"#EEF2FF",text:"#1A3BD4",border:"#C7D2FE",accent:C.blue},
  "Directeur Général Adjoint":{bg:"#EEF2FF",text:"#1A3BD4",border:"#C7D2FE",accent:C.blue},
  "Chef de Division":         {bg:"#EEF2FF",text:"#1A3BD4",border:"#C7D2FE",accent:C.blue},
  "Chef de Section":          {bg:"#F0FDF4",text:"#15803D",border:"#86EFAC",accent:C.success},
  "Chef d'Antenne":           {bg:"#FFF7ED",text:"#C2410C",border:"#FED7AA",accent:C.orange},
  "Formateur":                {bg:"#F0F9FF",text:"#0369A1",border:"#BAE6FD",accent:"#0369A1"},
  "Conseiller":               {bg:"#FDF4FF",text:"#7C3AED",border:"#E9D5FF",accent:C.purple},
  "Entreprise":               {bg:"#FFFBEB",text:"#D97706",border:"#FDE68A",accent:C.accent},
  DG:{bg:"#EEF2FF",text:"#1A3BD4",border:"#C7D2FE",accent:C.blue},
  CD:{bg:"#EEF2FF",text:"#1A3BD4",border:"#C7D2FE",accent:C.blue},
  DR:{bg:"#EEF2FF",text:"#1A3BD4",border:"#C7D2FE",accent:C.blue},
  CC:{bg:"#FFF7ED",text:"#C2410C",border:"#FED7AA",accent:C.orange},
  FORMATEUR:{bg:"#F0F9FF",text:"#0369A1",border:"#BAE6FD",accent:"#0369A1"},
  SUPERADMIN:{bg:"#FFF1F2",text:"#E53935",border:"#FECDD3",accent:C.danger},
};
const rc = (role) => ROLE_COLORS[role] || ROLE_COLORS["Directeur Général"];

const resolveGroup = (role) => {
  if (["Directeur Général","Directeur Général Adjoint","Chef de Division","DG","CD","DR","SUPERADMIN"].includes(role)) return "DG";
  if (["Chef de Section"].includes(role))        return "CS";
  if (["Chef d'Antenne","CC"].includes(role))    return "CA";
  if (["Formateur","FORMATEUR"].includes(role))  return "F";
  if (["Conseiller"].includes(role))             return "C";
  if (["Entreprise"].includes(role))             return "E";
  return "DG";
};

const buildNavCategories = (role) => {
  const g=resolveGroup(role), DG_CS=["DG","CS"], DG_CS_CA=["DG","CS","CA"], ALL_OP=["DG","CS","CA","F"], ALL=["DG","CS","CA","F","C","E"];
  const all=[
    {section:"Formations",color:C.steel,icon:BookOpen,groups:ALL,items:[
      {path:"/formations",    label:"Catalogue formations",  icon:BookOpen,     groups:ALL},
      {path:"/sessions",      label:"Sessions planifiées",   icon:CalendarDays, groups:ALL},
      {path:"/programmes",    label:"Programmes & modules",  icon:Layers,       groups:DG_CS_CA},
      {path:"/certifications",label:"Certifications",        icon:Award,        groups:ALL},
    ]},
    {section:"Apprenants",color:C.navy,icon:GraduationCap,groups:ALL_OP,items:[
      {path:"/inscription",    label:"Inscriptions",          icon:GraduationCap,groups:ALL_OP},
      {path:"/apprenants",     label:"Apprenants actifs",     icon:GraduationCap,groups:ALL_OP},
      {path:"/listeCandidats", label:"Inscrits & candidats",  icon:UserCheck,    groups:DG_CS_CA},
      {path:"/validation",     label:"Validation dossiers",   icon:CheckCircle2, groups:DG_CS_CA},
      {path:"/suivi",          label:"Suivi pédagogique",     icon:ClipboardList,groups:ALL_OP},
      {path:"/insertion",      label:"Insertion",             icon:ClipboardList,groups:ALL_OP},
    ]},
    {section:"Présences & Notes",color:C.success,icon:ClipboardList,groups:["CA","F"],items:[
      {path:"/presences",   label:"Feuilles de présence", icon:CalendarDays, groups:["CA","F"]},
      {path:"/evaluations", label:"Notes & évaluations",  icon:Award,        groups:["CA","F"]},
      {path:"/discipline",  label:"Discipline",            icon:AlertTriangle,groups:["CA","F"]},
    ]},
    {section:"Suivi complet",color:C.success,icon:ClipboardList,groups:DG_CS,items:[
      {path:"/presences",         label:"Présences",               icon:CalendarDays,groups:DG_CS},
      {path:"/evaluations",       label:"Évaluations",             icon:Award,       groups:DG_CS},
      {path:"/resultats",         label:"Résultats finaux",        icon:CheckCircle2,groups:DG_CS},
      {path:"/attestations",      label:"Attestations PDF",        icon:FileText,    groups:DG_CS},
      {path:"/enquete-insertion", label:"Enquête insertion 3 mois",icon:Clock,       groups:DG_CS},
      {path:"/relances",          label:"Relances automatiques",   icon:Bell,        groups:["DG"]},
    ]},
    {section:"Fin de session",color:C.accent,icon:CheckCircle2,groups:["CA","F"],items:[
      {path:"/resultats",         label:"Résultats finaux",        icon:CheckCircle2,groups:["CA","F"]},
      {path:"/attestations",      label:"Attestations PDF",        icon:FileText,    groups:["CA","F"]},
      {path:"/enquete-insertion", label:"Enquête insertion 3 mois",icon:Clock,       groups:["CA"]},
    ]},
    {section:"Entreprises",color:C.navy,icon:Briefcase,groups:["DG","CS","E"],items:[
      {path:"/entreprises",   label:"Base des entreprises",icon:Briefcase,groups:["DG","CS","E"]},
      {path:"/offres-emploi", label:"Offres d'emploi",     icon:Package,  groups:["DG","CS","E"]},
    ]},
    {section:"Rapports",color:C.purple,icon:BarChart3,groups:["DG","CS","CA","C"],items:[
      {path:"/statistiques",      label:"Statistiques globales",     icon:PieChart, groups:["DG"]},
      {path:"/statistiques",      label:"Statistiques de section",   icon:PieChart, groups:["CS"]},
      {path:"/statistiques",      label:"Statistiques de l'antenne", icon:BarChart3,groups:["CA"]},
      {path:"/statistiques",      label:"Statistiques",              icon:BarChart3,groups:["C"]},
      {path:"/dashboardRegional", label:"Tableau régional",          icon:MapPin,   groups:["DG","CS"]},
      {path:"/rapports",          label:"Rapports & exports",        icon:FileText, groups:["DG","CS","CA"]},
    ]},
    {section:"Centres & Équipes",color:C.purple,icon:Building2,groups:["DG","CS"],items:[
      {path:"/centresFormation",label:"Antennes de formation",icon:Building2,groups:["DG","CS"]},
      {path:"/teamMessage",     label:"Équipe & formateurs", icon:Users,    groups:["DG","CS","CA"]},
      {path:"/partnerPost",     label:"Partenaires",          icon:Package, groups:["DG"]},
    ]},
    {section:"Administration",color:C.textSub,icon:Settings,groups:["DG"],items:[
      {path:"/utilisateurs",label:"Gestion utilisateurs",icon:UserCog, groups:["DG"]},
      {path:"/parametres",  label:"Paramètres système",  icon:Settings,groups:["DG"]},
      {path:"/homePost",    label:"Contenu site public", icon:Layers,  groups:["DG"]},
    ]},
  ];
  return all
    .filter(c=>c.groups.includes(g))
    .map(c=>({...c,items:c.items.filter(i=>i.groups.includes(g)).filter((i,idx,a)=>a.findIndex(x=>x.path===i.path&&x.label===i.label)===idx)}))
    .filter(c=>c.items.length>0);
};

/* ─── STATS KPI ─── */
const STATS_BY_GROUP = {
  DG:[
    {label:"Apprenants actifs",   value:"4 832",delta:"+12%", icon:Users,        color:C.blue},
    {label:"Taux de réussite",    value:"87%",  delta:"+3.2%",icon:TrendingUp,   color:C.success},
    {label:"Antennes actives",    value:"24",   delta:"stable",icon:Building2,   color:C.accent},
    {label:"Formations en cours", value:"138",  delta:"+8",   icon:BookOpen,     color:C.purple},
  ],
  CS:[
    {label:"Apprenants / section",value:"612",  delta:"+7%",  icon:Users,        color:C.blue},
    {label:"Antennes section",    value:"6",    delta:"stable",icon:Building2,   color:C.success},
    {label:"Taux présence",       value:"91%",  delta:"+1.4%",icon:CheckCircle2, color:C.accent},
    {label:"Rapports en attente", value:"3",    delta:"-2",   icon:FileText,     color:C.danger},
  ],
  CA:[
    {label:"Apprenants antenne",  value:"98",   delta:"+4",   icon:Users,        color:C.blue},
    {label:"Formateurs actifs",   value:"12",   delta:"stable",icon:UserCog,     color:C.purple},
    {label:"Sessions ce mois",    value:"34",   delta:"+5",   icon:CalendarDays, color:C.success},
    {label:"Taux d'abandon",      value:"2.1%", delta:"-0.5%",icon:AlertTriangle,color:C.danger},
  ],
  F:[
    {label:"Mes apprenants",      value:"32",   delta:"stable",icon:Users,       color:"#0369A1"},
    {label:"Séances ce mois",     value:"18",   delta:"+2",   icon:CalendarDays, color:C.blue},
    {label:"Taux présence",       value:"94%",  delta:"+2%",  icon:CheckCircle2, color:C.success},
    {label:"Évaluations à noter", value:"8",    delta:"+3",   icon:ClipboardList,color:C.accent},
  ],
  C:[
    {label:"Dossiers suivis",     value:"47",   delta:"+3",   icon:ClipboardList,color:C.purple},
    {label:"Formations vues",     value:"23",   delta:"+5",   icon:BookOpen,     color:C.blue},
    {label:"Rapports générés",    value:"12",   delta:"+2",   icon:BarChart3,    color:C.success},
    {label:"Alertes",             value:"1",    delta:"stable",icon:AlertTriangle,color:C.accent},
  ],
  E:[
    {label:"Offres publiées",         value:"5",  delta:"+1",   icon:Briefcase,   color:C.accent},
    {label:"Candidatures reçues",     value:"34", delta:"+8",   icon:Users,       color:C.blue},
    {label:"Formations partenaires",  value:"3",  delta:"stable",icon:BookOpen,   color:C.success},
    {label:"Contrats actifs",         value:"2",  delta:"+1",   icon:CheckCircle2,color:C.purple},
  ],
};

const ACTIVITY_BY_GROUP = {
  DG:[
    {text:"Rapport mensuel soumis",   detail:"Antenne de Kindia",       time:"Il y a 8 min",  dot:C.blue},
    {text:"Nouvel apprenant inscrit", detail:"Formation Informatique",   time:"Il y a 22 min", dot:C.success},
    {text:"Alerte taux d'abandon",    detail:"Section de Labé — 4.2%",  time:"Il y a 1h",     dot:C.danger},
    {text:"Budget Q3 validé",         detail:"Direction Générale",       time:"Il y a 2h",     dot:C.accent},
    {text:"Nouvelle antenne créée",   detail:"Antenne de Mamou",         time:"Hier",          dot:C.textMuted},
  ],
  CS:[
    {text:"Rapport antenne soumis",   detail:"Antenne de Pita",          time:"Il y a 15 min", dot:C.blue},
    {text:"Session planifiée",        detail:"Formation Excel — 24 mars",time:"Il y a 1h",     dot:C.success},
    {text:"Apprenant validé",         detail:"Certification Bureautique",time:"Il y a 3h",     dot:C.accent},
    {text:"Absence signalée",         detail:"Formateur Bah Mamadou",    time:"Hier",          dot:C.textMuted},
  ],
  CA:[
    {text:"Émargement signé",         detail:"Module Python — Salle B2", time:"Il y a 5 min",  dot:C.blue},
    {text:"Apprenant absent",         detail:"Diallo Fatoumata",         time:"Il y a 30 min", dot:C.danger},
    {text:"Note saisie",              detail:"Évaluation finale — 17/20",time:"Il y a 2h",     dot:C.success},
    {text:"Incident signalé",         detail:"Problème matériel Salle A",time:"Hier",          dot:C.textMuted},
  ],
  F:[
    {text:"Séance complétée",         detail:"Module 4 — Python avancé", time:"Il y a 1h",     dot:C.blue},
    {text:"Évaluation soumise",       detail:"Apprenant: Kouyaté Sekou", time:"Il y a 2h",     dot:C.success},
    {text:"Ressource ajoutée",        detail:"PDF: Algo & Structures",   time:"Il y a 3h",     dot:C.accent},
    {text:"Message apprenant",        detail:"Question exercice 3",      time:"Hier",          dot:C.textMuted},
  ],
  C:[
    {text:"Rapport consulté",         detail:"Statistiques nationales",  time:"Il y a 30 min", dot:C.purple},
    {text:"Dossier examiné",          detail:"Apprenant: Sylla Ibrahima",time:"Il y a 2h",     dot:C.blue},
    {text:"Recommandation émise",     detail:"Formation Comptabilité",   time:"Hier",          dot:C.textMuted},
  ],
  E:[
    {text:"Offre publiée",            detail:"Technicien Réseau — CDI",  time:"Il y a 1h",     dot:C.accent},
    {text:"Candidature reçue",        detail:"Bah Kadiatou — 2 ans exp.",time:"Il y a 3h",     dot:C.blue},
    {text:"Convention signée",        detail:"Partenariat ONFPP 2025",   time:"Hier",          dot:C.success},
  ],
};

const QUICK_BY_GROUP = {
  DG:["/apprenants","/statistiques","/rapports","/utilisateurs"],
  CS:["/apprenants","/statistiques","/centresFormation","/rapports"],
  CA:["/apprenants","/presences","/evaluations","/resultats"],
  F: ["/apprenants","/presences","/evaluations","/sessions"],
  C: ["/statistiques","/rapports","/apprenants","/formations"],
  E: ["/offres-emploi","/entreprises","/formations","/apprenants"],
};
const ALL_QUICK = [
  {path:"/apprenants",       label:"Apprenants",   icon:GraduationCap,color:C.blue},
  {path:"/presences",        label:"Présences",    icon:CalendarDays, color:C.success},
  {path:"/evaluations",      label:"Évaluations",  icon:Award,        color:C.accent},
  {path:"/statistiques",     label:"Statistiques", icon:PieChart,     color:C.purple},
  {path:"/utilisateurs",     label:"Utilisateurs", icon:UserCog,      color:C.textSub},
  {path:"/centresFormation", label:"Antennes",     icon:Building2,    color:C.purple},
  {path:"/resultats",        label:"Résultats",    icon:CheckCircle2, color:C.accent},
  {path:"/rapports",         label:"Rapports",     icon:BarChart3,    color:C.blue},
  {path:"/sessions",         label:"Sessions",     icon:CalendarDays, color:C.success},
  {path:"/formations",       label:"Formations",   icon:BookOpen,     color:C.steel},
  {path:"/offres-emploi",    label:"Offres emploi",icon:Briefcase,    color:C.accent},
  {path:"/entreprises",      label:"Entreprises",  icon:Building2,    color:C.navy},
];

/* ─────────────────────────────────────────
   VUE GLOBALE PLATEFORME (remplace accès rapides pour DG)
───────────────────────────────────────── */
const GLOBAL_INDICATORS = [
  {label:"Taux de réussite national",    value:87, color:C.success, icon:Target},
  {label:"Taux de présence moyen",       value:91, color:C.blue,    icon:CheckCircle2},
  {label:"Taux d'insertion pro.",        value:63, color:C.purple,  icon:Briefcase},
  {label:"Complétion des cours",         value:78, color:C.accent,  icon:BookOpen},
];
const GLOBAL_SUMMARY = [
  {label:"Régions",      value:"8",     icon:MapPin,      color:C.steel},
  {label:"Antennes",     value:"24",    icon:Building2,   color:C.navy},
  {label:"Formateurs",   value:"186",   icon:UserCog,     color:C.purple},
  {label:"Diplômés",     value:"1 248", icon:Award,       color:C.success},
  {label:"Sessions",     value:"42",    icon:CalendarDays,color:C.accent},
  {label:"Partenaires",  value:"37",    icon:Briefcase,   color:C.orange},
];

/* ─────────────────────────────────────────
   FIX 1 — getStoredUser : lit correctement
   first_name, last_name ET username depuis
   localStorage "user" ou JWT access token
───────────────────────────────────────── */
const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    if (raw) {
      const p = JSON.parse(raw);
      return {
        // FIX : on lit les deux variantes snake_case et camelCase
        username:  p.username   || p.email        || "",
        firstName: p.first_name || p.firstName    || null,
        lastName:  p.last_name  || p.lastName     || null,
        role:      p.role       || "Directeur Général",
        niveau:    p.niveau     ?? 0,
        region:    p.region     || null,
        centre:    p.centre     || null,
      };
    }
    const token = localStorage.getItem("access");
    if (token) {
      const p = JSON.parse(atob(token.split(".")[1]));
      return {
        username:  p.username   || p.email        || "",
        firstName: p.first_name || null,
        lastName:  p.last_name  || null,
        role:      p.role       || "Directeur Général",
        niveau:    p.niveau     ?? 0,
        region:    p.region     || null,
        centre:    p.centre     || null,
      };
    }
  } catch {}
  return { username:"Admin", role:"Directeur Général", niveau:0 };
};

/* ─────────────────────────────────────────
   SOUS-COMPOSANTS
───────────────────────────────────────── */
const NotifBadge = ({ count }) => count > 0 ? (
  <span className="notif-pulse" style={{
    position:"absolute", top:-5, right:-5, background:"#E11D48", color:"#fff",
    borderRadius:20, fontSize:10, fontWeight:800, padding:"2px 6px",
    minWidth:18, textAlign:"center", lineHeight:"16px", fontFamily:"'Inter',sans-serif",
  }}>{count}</span>
) : null;

const StatCard = ({ label, value, delta, icon: Icon, color, delay=0 }) => {
  const isPos  = delta?.startsWith("+");
  const isNeut = delta==="stable"||delta==="OK";
  const dColor = isNeut?"#8FA3D8":isPos?C.success:C.danger;
  const dBg    = isNeut?"#EEF2FF":isPos?"#F0FDF4":"#FFF1F2";
  return (
    <div className={`kpi-card anim-in anim-in-${delay}`} style={{
      background:"#fff", borderRadius:20, padding:"22px 20px",
      boxShadow:"0 2px 20px rgba(13,27,94,0.06)", border:"1.5px solid #EEF2FF",
      display:"flex", flexDirection:"column", gap:14, cursor:"default",
      position:"relative", overflow:"hidden",
    }}>
      <div style={{ position:"absolute", top:0, left:0, width:"100%", height:3, background:`linear-gradient(90deg,${color},${color}44)`, borderRadius:"20px 20px 0 0" }}/>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ width:44, height:44, borderRadius:14, background:`${color}14`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 4px 14px ${color}22` }}>
          <Icon size={20} color={color}/>
        </div>
        <span style={{ fontSize:11, fontWeight:700, padding:"4px 11px", borderRadius:20, background:dBg, color:dColor, display:"flex", alignItems:"center", gap:4, fontFamily:"'Inter',sans-serif" }}>
          {isPos&&<TrendingUp size={9}/>}{delta}
        </span>
      </div>
      <div>
        <p style={{ fontSize:28, fontWeight:800, color:C.navy, lineHeight:1, letterSpacing:"-0.5px", fontFamily:"'Inter',sans-serif" }}>{value}</p>
        <p style={{ fontSize:12, color:C.textMuted, marginTop:5, fontWeight:500, fontFamily:"'Inter',sans-serif" }}>{label}</p>
      </div>
    </div>
  );
};

const SectionHeader = ({ icon: Icon, title, color, count }) => (
  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
    <div style={{ width:34, height:34, borderRadius:10, background:`${color}16`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <Icon size={16} color={color}/>
    </div>
    <p style={{ flex:1, fontSize:13, fontWeight:800, color:C.navy, fontFamily:"'Inter',sans-serif", letterSpacing:"-0.2px" }}>{title}</p>
    {count && (
      <span style={{ fontSize:10, fontWeight:700, color, background:`${color}14`, border:`1px solid ${color}30`, borderRadius:20, padding:"2px 9px", fontFamily:"'Inter',sans-serif" }}>{count}</span>
    )}
  </div>
);

const ModuleCard = ({ label, icon: Icon, path, color }) => (
  <Link to={path||"#"} style={{ textDecoration:"none" }}>
    <div className="mod-card" style={{ background:"#FAFBFF", border:"1.5px solid #EEF2FF", borderLeft:`3px solid ${color}`, borderRadius:12, padding:"11px 14px", display:"flex", alignItems:"center", gap:11 }}>
      <div style={{ width:32, height:32, borderRadius:9, flexShrink:0, background:`${color}14`, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Icon size={14} color={color}/>
      </div>
      <p style={{ flex:1, fontSize:12.5, fontWeight:600, color:C.navy, fontFamily:"'Inter',sans-serif", minWidth:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{label}</p>
      <ChevronRight className="mod-arrow" size={13} color={C.iceBlue} style={{ flexShrink:0, opacity:0.5, transition:"all .18s" }}/>
    </div>
  </Link>
);

const SectionBox = ({ icon, title, color, children, count, className="" }) => (
  <div className={`anim-in ${className}`} style={{ background:"#fff", borderRadius:18, padding:"18px", boxShadow:"0 2px 16px rgba(13,27,94,0.05)", border:"1.5px solid #EEF2FF" }}>
    <SectionHeader icon={icon} title={title} color={color} count={count}/>
    {children}
  </div>
);

const QuickLink = ({ path, label, icon: Icon, color }) => (
  <Link to={path||"#"} style={{ textDecoration:"none", flex:"1 1 calc(50% - 4px)", minWidth:0 }}>
    <div className="quick-link" style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 12px", borderRadius:12, background:"#FAFBFF", border:"1.5px solid #EEF2FF", cursor:"pointer", boxShadow:"0 1px 4px rgba(13,27,94,0.05)" }}>
      <div style={{ width:30, height:30, borderRadius:8, background:`${color}14`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <Icon size={13} color={color}/>
      </div>
      <span style={{ fontSize:11.5, fontWeight:600, color:C.navy, fontFamily:"'Inter',sans-serif", flex:1, minWidth:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{label}</span>
      <ArrowUpRight size={10} color={C.textMuted} style={{ flexShrink:0 }}/>
    </div>
  </Link>
);

const ActivityItem = ({ text, detail, time, dot, isLast }) => (
  <div style={{ display:"flex", gap:14, padding:"12px 0", borderBottom:isLast?"none":"1px solid #F4F6FF", alignItems:"flex-start" }}>
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, paddingTop:4, flexShrink:0 }}>
      <div style={{ width:8, height:8, borderRadius:"50%", background:dot, boxShadow:`0 0 0 3px ${dot}20` }}/>
      {!isLast && <div style={{ width:1, flex:1, background:"#EEF2FF", marginTop:3 }}/>}
    </div>
    <div style={{ flex:1, minWidth:0 }}>
      <p style={{ fontSize:12.5, fontWeight:700, color:C.navy, fontFamily:"'Inter',sans-serif" }}>{text}</p>
      <p style={{ fontSize:11, color:C.textMuted, marginTop:2, fontFamily:"'Inter',sans-serif" }}>{detail}</p>
    </div>
    <span style={{ fontSize:10, color:C.textMuted, background:"#F5F7FF", padding:"3px 9px", borderRadius:20, whiteSpace:"nowrap", fontWeight:500, fontFamily:"'Inter',sans-serif", flexShrink:0 }}>{time}</span>
  </div>
);

/* ─── Vue globale plateforme (DG uniquement) ─── */
const GlobalPlatformCard = () => (
  <div className="anim-in anim-in-2" style={{ background:"#fff", borderRadius:18, padding:"18px", border:"1.5px solid #EEF2FF", boxShadow:"0 2px 14px rgba(13,27,94,0.05)" }}>
    <SectionHeader icon={Globe} title="Vue globale plateforme" color={C.blue}/>

    {/* Barres indicateurs */}
    <div style={{ display:"flex", flexDirection:"column", gap:11, marginBottom:16 }}>
      {GLOBAL_INDICATORS.map((ind, i) => {
        const IndIcon = ind.icon;
        return (
          <div key={i}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <IndIcon size={11} color={ind.color}/>
                <span style={{ fontSize:11, fontWeight:600, color:C.textSub, fontFamily:"'Inter',sans-serif" }}>{ind.label}</span>
              </div>
              <span style={{ fontSize:12.5, fontWeight:800, color:ind.color, fontFamily:"'Inter',sans-serif" }}>{ind.value}%</span>
            </div>
            <div style={{ height:6, borderRadius:3, background:"#EEF2FF", overflow:"hidden" }}>
              <div
                className="bar-anim"
                style={{"--bar-w":`${ind.value}%`, width:`${ind.value}%`, height:"100%", background:`linear-gradient(90deg,${ind.color},${ind.color}99)`, borderRadius:3, animationDelay:`${i*0.12+0.3}s`}}
              />
            </div>
          </div>
        );
      })}
    </div>

    <div style={{ height:1, background:"#EEF2FF", marginBottom:14 }}/>

    {/* Grille résumé 3×2 */}
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:7 }}>
      {GLOBAL_SUMMARY.map((s, i) => {
        const SIcon = s.icon;
        return (
          <div key={i} className="glob-stat" style={{ background:"#FAFBFF", border:"1.5px solid #EEF2FF", borderRadius:11, padding:"10px 8px", display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:`${s.color}14`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <SIcon size={12} color={s.color}/>
            </div>
            <p style={{ fontSize:13, fontWeight:800, color:C.navy, fontFamily:"'Inter',sans-serif", lineHeight:1 }}>{s.value}</p>
            <p style={{ fontSize:9.5, color:C.textMuted, fontFamily:"'Inter',sans-serif", textAlign:"center", lineHeight:1.3 }}>{s.label}</p>
          </div>
        );
      })}
    </div>
  </div>
);

/* ─────────────────────────────────────────
   COMPOSANT PRINCIPAL
───────────────────────────────────────── */
const DashboardAdmin = () => {
  const [time,      setTime]      = useState(new Date());
  const [notifOpen, setNotifOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("modules");
  const [notifPos,  setNotifPos]  = useState({top:0, right:0});
  const bellBtnRef = useRef(null);

  const storedUser  = getStoredUser();
  const role        = storedUser.role || "Directeur Général";
  const niveau      = storedUser.niveau ?? 0;
  const roleLabel   = ROLE_LABELS[role] || role;
  const roleColor   = rc(role);
  const group       = resolveGroup(role);

  /* ─── FIX 1 — displayName : prénom+nom > username (jamais "Utilisateur") ─── */
  const displayName = storedUser.firstName
    ? `${storedUser.firstName}${storedUser.lastName ? " "+storedUser.lastName : ""}`
    : storedUser.username || "Admin";

  const stats        = STATS_BY_GROUP[group]    || STATS_BY_GROUP.DG;
  const activity     = ACTIVITY_BY_GROUP[group] || ACTIVITY_BY_GROUP.DG;
  const sections     = buildNavCategories(role);
  const totalModules = sections.reduce((acc,s)=>acc+s.items.length, 0);
  const quickPaths   = QUICK_BY_GROUP[group] || QUICK_BY_GROUP.DG;
  const quickItems   = ALL_QUICK.filter(q=>quickPaths.includes(q.path));
  const notifs       = activity.slice(0,4).map((a,i)=>({...a, read:i>1}));
  const unread       = notifs.filter(n=>!n.read).length;
  const isDG         = group === "DG";

  useEffect(()=>{ const t=setInterval(()=>setTime(new Date()),1000); return()=>clearInterval(t); },[]);

  /* ─── FIX 2 — ferme notif sur clic extérieur ─── */
  useEffect(()=>{
    if (!notifOpen) return;
    const h=(e)=>{
      if (bellBtnRef.current && !bellBtnRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [notifOpen]);

  /* ─── FIX 2 — calcule la position du dropdown notif par rapport au bouton cloche ─── */
  const handleBellClick = () => {
    if (bellBtnRef.current) {
      const r = bellBtnRef.current.getBoundingClientRect();
      setNotifPos({ top: r.bottom + 10, right: window.innerWidth - r.right });
    }
    setNotifOpen(v => !v);
  };

  const hh       = String(time.getHours()).padStart(2,"0");
  const mm       = String(time.getMinutes()).padStart(2,"0");
  const ss       = String(time.getSeconds()).padStart(2,"0");
  const greeting = time.getHours()<12?"Bonjour":time.getHours()<18?"Bon après-midi":"Bonsoir";

  return (
    <>
      <style>{FONT_STYLE}</style>
      <div className="dash-root" style={{ minHeight:"100vh", background:"linear-gradient(160deg,#EDF1FC 0%,#F5F7FF 60%,#F8F6FF 100%)", padding:"88px 28px 52px" }}>

        {/* ══ HERO ══ */}
        <div className="anim-in" style={{
          background:`linear-gradient(135deg,${C.navy} 0%,#1E2E80 45%,${C.blue} 80%,#2A54E8 100%)`,
          borderRadius:24, marginBottom:28, color:"#fff", padding:"32px 36px",
          boxShadow:`0 12px 48px rgba(13,27,94,0.32),0 1px 0 rgba(255,255,255,0.06) inset`,
          /* FIX 2 — overflow:visible pour que le dropdown ne soit PAS clippé */
          position:"relative", overflow:"visible",
        }}>
          {/* Décorations — ne pas clipper le hero donc on les masque manuellement */}
          <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, borderRadius:24, overflow:"hidden", pointerEvents:"none" }}>
            <div style={{ position:"absolute", top:-70, right:-50,  width:280, height:280, borderRadius:"50%", background:"rgba(255,255,255,0.04)" }}/>
            <div style={{ position:"absolute", bottom:-80, right:80, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,0.03)" }}/>
            <div style={{ position:"absolute", top:20,  right:160,  width:60,  height:60,  borderRadius:"50%", background:"rgba(245,168,0,0.15)" }}/>
            <div style={{ position:"absolute", top:0,   left:36, right:36, height:2, background:`linear-gradient(90deg,transparent,${C.accent}60,transparent)`, borderRadius:2 }}/>
          </div>

          <div className="dash-hero-inner" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:20, flexWrap:"wrap", position:"relative", zIndex:1 }}>

            {/* Gauche */}
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                <div style={{ width:48, height:48, borderRadius:14, background:"rgba(255,255,255,0.12)", backdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <LayoutDashboard size={22} color="#fff"/>
                </div>
                <div>
                  <p style={{ fontSize:10, opacity:0.55, letterSpacing:2.5, textTransform:"uppercase", fontWeight:600, fontFamily:"'Inter',sans-serif" }}>Plateforme ONFPP · Guinée</p>
                  <h1 style={{ fontSize:22, fontWeight:800, lineHeight:1.15, fontFamily:"'Inter',sans-serif", letterSpacing:"-0.4px" }}>
                    {greeting}, {displayName} 👋
                  </h1>
                </div>
              </div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                <span style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.14)", backdropFilter:"blur(8px)", borderRadius:20, padding:"5px 14px", fontSize:11.5, fontWeight:700, border:"1px solid rgba(255,255,255,0.22)", fontFamily:"'Inter',sans-serif" }}>
                  <ShieldCheck size={12}/>{roleLabel}
                </span>
                {niveau>0 && (
                  <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:11, background:"rgba(245,168,0,0.2)", border:"1px solid rgba(245,168,0,0.35)", borderRadius:20, padding:"4px 12px", fontWeight:700, fontFamily:"'Inter',sans-serif" }}>
                    <Star size={10} color={C.accent}/> Niveau {niveau}/10
                  </span>
                )}
                {storedUser.region && <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:11, opacity:0.75, fontFamily:"'Inter',sans-serif" }}><MapPin size={10}/>{storedUser.region}</span>}
                {storedUser.centre && <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:11, opacity:0.75, fontFamily:"'Inter',sans-serif" }}><Building2 size={10}/>{storedUser.centre}</span>}
              </div>
            </div>

            {/* Droite */}
            <div className="dash-hero-right" style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:12 }}>
              {/* Horloge */}
              <div style={{ background:"rgba(0,0,0,0.25)", backdropFilter:"blur(12px)", borderRadius:14, padding:"10px 18px", border:"1px solid rgba(255,255,255,0.12)", textAlign:"center" }}>
                <p style={{ fontSize:30, fontFamily:"'DM Mono','Courier New',monospace", fontWeight:700, letterSpacing:3, lineHeight:1, color:"#fff" }}>
                  {hh}<span className="clock-sep">:</span>{mm}<span className="clock-sep">:</span>{ss}
                </p>
                <p style={{ fontSize:11, opacity:0.55, marginTop:5, fontFamily:"'Inter',sans-serif", fontWeight:500 }}>
                  {time.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}
                </p>
              </div>

              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <span style={{ background:"rgba(255,255,255,0.1)", borderRadius:10, padding:"5px 12px", fontSize:11, fontWeight:600, border:"1px solid rgba(255,255,255,0.18)", fontFamily:"'Inter',sans-serif", display:"flex", alignItems:"center", gap:6 }}>
                  <Globe size={11} style={{opacity:.7}}/>{totalModules} modules
                </span>
                {/* ─── Bouton cloche avec ref ─── */}
                <div style={{ position:"relative" }}>
                  <button
                    ref={bellBtnRef}
                    onClick={handleBellClick}
                    style={{ width:38, height:38, borderRadius:11, background:"rgba(255,255,255,0.14)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,0.25)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", transition:"all .15s" }}
                    onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.22)";}}
                    onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.14)";}}>
                    <Bell size={16}/>
                  </button>
                  <NotifBadge count={unread}/>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── FIX 2 — Dropdown notif en position:fixed, EN DEHORS du hero ─── */}
        {notifOpen && (
          <>
            <div style={{ position:"fixed", inset:0, zIndex:998 }} onClick={()=>setNotifOpen(false)}/>
            <div
              className="notif-panel"
              style={{
                position:"fixed",
                top: notifPos.top,
                right: notifPos.right,
                width: 320,
                background:"#fff",
                borderRadius:18,
                boxShadow:"0 20px 60px rgba(13,27,94,0.20)",
                border:"1.5px solid #EEF2FF",
                zIndex:999,
                overflow:"hidden",
              }}
            >
              {/* Ligne accent gold */}
              <div style={{ height:2, background:`linear-gradient(90deg,${C.navy},${C.blue} 50%,${C.accent})` }}/>

              <div style={{ padding:"14px 18px 12px", borderBottom:"1px solid #EEF2FF", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <Bell size={14} color={C.navy}/>
                  <p style={{ fontSize:13, fontWeight:800, color:C.navy, fontFamily:"'Inter',sans-serif" }}>Notifications</p>
                </div>
                <span style={{ fontSize:11, color:C.blue, fontWeight:700, background:C.surfaceAlt, padding:"2px 10px", borderRadius:20, fontFamily:"'Inter',sans-serif" }}>{unread} non lues</span>
              </div>

              {notifs.map((n,i)=>(
                <div key={i}
                  style={{ padding:"12px 18px", borderBottom:i<notifs.length-1?"1px solid #F5F7FF":"none", background:n.read?"#fff":"#F5F8FF", display:"flex", gap:12, alignItems:"flex-start", transition:"background .12s" }}
                  onMouseEnter={e=>{e.currentTarget.style.background=n.read?"#FAFBFF":"#EEF6FF";}}
                  onMouseLeave={e=>{e.currentTarget.style.background=n.read?"#fff":"#F5F8FF";}}
                >
                  <div style={{ width:8, height:8, borderRadius:"50%", flexShrink:0, marginTop:5, background:n.read?"#D1D5DB":C.blue, boxShadow:n.read?"none":`0 0 0 3px ${C.blue}20` }}/>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:12.5, fontWeight:n.read?500:700, color:C.navy, fontFamily:"'Inter',sans-serif" }}>{n.text}</p>
                    <p style={{ fontSize:11, color:C.textMuted, marginTop:2, fontFamily:"'Inter',sans-serif" }}>{n.detail} · {n.time}</p>
                  </div>
                </div>
              ))}

              <div style={{ padding:"10px 18px", borderTop:"1px solid #EEF2FF", display:"flex", justifyContent:"center" }}>
                <button onClick={()=>setNotifOpen(false)} style={{ fontSize:11.5, fontWeight:700, color:C.blue, background:"none", border:"none", cursor:"pointer", fontFamily:"'Inter',sans-serif" }}>
                  Voir toutes les notifications →
                </button>
              </div>
            </div>
          </>
        )}

        {/* ══ KPI ══ */}
        <div className="kpi-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))", gap:14, marginBottom:28 }}>
          {stats.map((s,i)=><StatCard key={i} {...s} delay={Math.min(i+1,5)}/>)}
        </div>

        {/* ══ ONGLETS ══ */}
        <div style={{ display:"flex", gap:6, marginBottom:22, padding:"5px", background:"#fff", borderRadius:14, border:"1.5px solid #EEF2FF", width:"fit-content", boxShadow:"0 1px 6px rgba(13,27,94,0.06)" }}>
          {[{id:"modules",label:"Modules",icon:LayoutDashboard},{id:"activite",label:"Activité récente",icon:Activity}].map(tab=>(
            <button key={tab.id} className="dash-tab" onClick={()=>setActiveTab(tab.id)} style={{
              display:"flex", alignItems:"center", gap:7, padding:"8px 18px", borderRadius:10, border:"none",
              fontFamily:"'Inter',sans-serif", fontSize:12.5, fontWeight:700,
              background: activeTab===tab.id?C.navy:"transparent",
              color:       activeTab===tab.id?"#fff":C.textMuted,
              boxShadow:   activeTab===tab.id?`0 4px 16px ${C.navy}30`:"none",
            }}>
              <tab.icon size={13}/>{tab.label}
            </button>
          ))}
        </div>

        {/* ══ MODULES ══ */}
        {activeTab==="modules" && (
          <div className="dash-grid-main" style={{ display:"grid", gridTemplateColumns:"1fr 290px", gap:20, alignItems:"start" }}>

            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {sections.map((sec,si)=>(
                <SectionBox key={si} icon={sec.icon} title={sec.section} color={sec.color} count={`${sec.items.length}`} className={`anim-in-${Math.min(si+1,5)}`}>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:7 }}>
                    {sec.items.map((m,mi)=><ModuleCard key={mi} label={m.label} icon={m.icon} path={m.path} color={sec.color}/>)}
                  </div>
                </SectionBox>
              ))}
            </div>

            {/* Sidebar */}
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

              {/* Profil card */}
              <div className="anim-in anim-in-1" style={{ background:`linear-gradient(145deg,${C.navy},#1E2E80)`, borderRadius:20, padding:"22px 20px", boxShadow:`0 8px 30px ${C.navy}30`, position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${C.accent},transparent)` }}/>
                <div style={{ position:"absolute", top:-30, right:-30, width:100, height:100, borderRadius:"50%", background:"rgba(255,255,255,0.04)" }}/>
                <p style={{ fontSize:9.5, color:"rgba(255,255,255,0.45)", marginBottom:14, letterSpacing:2, textTransform:"uppercase", fontWeight:700, fontFamily:"'Inter',sans-serif" }}>Votre espace</p>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
                  <div style={{ width:50, height:50, borderRadius:14, flexShrink:0, background:"rgba(255,255,255,0.12)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <ShieldCheck size={24} color="#fff"/>
                  </div>
                  <div>
                    <p style={{ fontWeight:800, fontSize:14, color:"#fff", fontFamily:"'Inter',sans-serif", letterSpacing:"-0.2px" }}>{displayName}</p>
                    <span style={{ display:"inline-block", marginTop:5, background:roleColor.bg, color:roleColor.text, border:`1px solid ${roleColor.border}`, borderRadius:8, padding:"2px 10px", fontSize:10.5, fontWeight:700, fontFamily:"'Inter',sans-serif" }}>
                      {roleLabel}
                    </span>
                  </div>
                </div>
                {niveau>0 && (
                  <div style={{ background:"rgba(255,255,255,0.08)", borderRadius:10, padding:"10px 12px", marginBottom:14 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                      <p style={{ fontSize:10.5, color:"rgba(255,255,255,0.55)", fontFamily:"'Inter',sans-serif" }}>Niveau d'accès</p>
                      <span style={{ fontSize:11, fontWeight:800, color:C.accent, fontFamily:"'Inter',sans-serif" }}>{niveau}/10</span>
                    </div>
                    <div style={{ height:5, borderRadius:3, background:"rgba(255,255,255,0.12)", overflow:"hidden" }}>
                      <div style={{ width:`${niveau*10}%`, height:"100%", background:`linear-gradient(90deg,${C.accent},#FFD166)`, borderRadius:3 }}/>
                    </div>
                  </div>
                )}
                <div style={{ display:"flex", justifyContent:"space-between", paddingTop:12, borderTop:"1px solid rgba(255,255,255,0.1)" }}>
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.5)", fontFamily:"'Inter',sans-serif" }}>{totalModules} modules</span>
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.7)", fontWeight:700, fontFamily:"'Inter',sans-serif" }}>{sections.length} sections</span>
                </div>
              </div>

              {/* ─── FIX 3 — Vue globale pour DG, accès rapides pour les autres ─── */}
              {isDG ? (
                <GlobalPlatformCard/>
              ) : (
                <div className="anim-in anim-in-2" style={{ background:"#fff", borderRadius:18, padding:"18px", border:"1.5px solid #EEF2FF", boxShadow:"0 2px 14px rgba(13,27,94,0.05)" }}>
                  <SectionHeader icon={Zap} title="Accès rapides" color={C.accent}/>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                    {quickItems.map((q,i)=><QuickLink key={i} {...q}/>)}
                  </div>
                </div>
              )}

              {/* Info ONFPP */}
              <div className="anim-in anim-in-3" style={{ background:`linear-gradient(135deg,${C.accent}18,${C.accent}06)`, border:`1.5px solid ${C.accent}30`, borderRadius:18, padding:"16px 18px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:10 }}>
                  <Sparkles size={15} color={C.accent}/>
                  <p style={{ fontSize:12, fontWeight:800, color:C.navy, fontFamily:"'Inter',sans-serif" }}>Office National de Formation Professionnelle</p>
                </div>
                <p style={{ fontSize:11, color:C.textSub, lineHeight:1.6, fontFamily:"'Inter',sans-serif" }}>Plateforme nationale de suivi et d'évaluation des formations professionnelles en République de Guinée.</p>
              </div>
            </div>
          </div>
        )}

        {/* ══ ACTIVITÉ ══ */}
        {activeTab==="activite" && (
          <div style={{ maxWidth:720 }}>
            <SectionBox icon={Activity} title="Activité récente" color={C.blue} className="anim-in">
              {activity.map((act,i)=><ActivityItem key={i} {...act} isLast={i===activity.length-1}/>)}
            </SectionBox>
          </div>
        )}
      </div>
    </>
  );
};

export default DashboardAdmin;