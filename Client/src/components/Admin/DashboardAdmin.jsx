import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap, BookOpen, ClipboardList, Award, BarChart3,
  Building2, CheckCircle2, Clock, FileText, Briefcase, PieChart,
  AlertTriangle, Package, UserCog, Settings, Layers, Users,
  Bell, CalendarDays, ShieldCheck, MapPin,
  TrendingUp, TrendingDown, Activity,
  LayoutDashboard, ChevronRight, Zap, UserCheck,
  Globe, ArrowUpRight, Target, Sparkles, Star,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   PALETTE  —  "Autorité Lumineuse"
   Fond blanc nacré, navy profond, or Guinée, vert succès
═══════════════════════════════════════════════════════════════════ */
const C = {
  /* Canvas */
  page:      "#F8F9FD",
  pageAlt:   "#EEF2FF",
  surface:   "#FFFFFF",
  surfaceEl: "#F4F7FF",
  frost:     "rgba(255,255,255,0.72)",
  /* Navy */
  navy:      "#06102A",
  navyMid:   "#0C1D5F",
  blue:      "#1635C8",
  blueViv:   "#2447E0",
  sky:       "#5073FF",
  iceBlue:   "#D0D9FF",
  /* Texte */
  textPri:   "#06102A",
  textSub:   "#3A4F8C",
  textMuted: "#8497C8",
  /* Accents Guinée */
  gold:      "#D4920A",
  goldLight: "#F5B020",
  goldPale:  "#FFF8E7",
  green:     "#047A5A",
  greenLight:"#0DA575",
  greenPale: "#E8FBF5",
  /* Sémantique */
  success:   "#047A5A",
  danger:    "#C81B1B",
  rose:      "#DC1D44",
  orange:    "#C05C0A",
  violet:    "#6A24D4",
  teal:      "#0A8A7C",
  purple:    "#5B21B6",
  /* Structure */
  divider:   "#E8EDFC",
  shadow:    "rgba(6,16,42,0.09)",
  shadowMd:  "rgba(6,16,42,0.15)",
  shadowLg:  "rgba(6,16,42,0.22)",
};

/* ═══════════════════════════════════════════════════════════════════
   RÔLES
═══════════════════════════════════════════════════════════════════ */
const ROLE_LABELS = {
  "Directeur Général":"Directeur Général","Directeur Général Adjoint":"Directeur Général Adjoint",
  "Chef de Division":"Chef de Division","Chef de Section":"Chef de Section",
  "Chef d'Antenne":"Chef d'Antenne","Formateur":"Formateur",
  "Conseiller":"Conseiller","Entreprise":"Entreprise",
  DG:"Directeur Général",CD:"Chef de Division",
  DR:"Directeur Général Adjoint",CC:"Chef d'Antenne",
  FORMATEUR:"Formateur",SUPERADMIN:"Super Administrateur",
};

const ROLE_STYLES = {
  DG:{        bg:"#EBF0FF",text:"#1635C8",border:"#C0CEFF",dot:"#1635C8",  accent:C.blue    },
  CD:{        bg:"#EBF0FF",text:"#1635C8",border:"#C0CEFF",dot:"#1635C8",  accent:C.blue    },
  DR:{        bg:"#EBF0FF",text:"#1635C8",border:"#C0CEFF",dot:"#1635C8",  accent:C.blue    },
  CC:{        bg:"#FFF5E6",text:"#C05C0A",border:"#FDDBA8",dot:"#D97706",  accent:C.orange  },
  FORMATEUR:{ bg:"#E6F7F4",text:"#047A5A",border:"#9EE5D2",dot:"#0DA575",  accent:C.green   },
  SUPERADMIN:{bg:"#FDEAEA",text:"#C81B1B",border:"#F6B4B4",dot:"#DC1D44",  accent:C.danger  },
  "Directeur Général":         {bg:"#EBF0FF",text:"#1635C8",border:"#C0CEFF",dot:"#1635C8",accent:C.blue},
  "Directeur Général Adjoint": {bg:"#EBF0FF",text:"#1635C8",border:"#C0CEFF",dot:"#1635C8",accent:C.blue},
  "Chef de Division":          {bg:"#EBF0FF",text:"#1635C8",border:"#C0CEFF",dot:"#1635C8",accent:C.blue},
  "Chef de Section":           {bg:"#E6F7F4",text:"#047A5A",border:"#9EE5D2",dot:"#0DA575",accent:C.green},
  "Chef d'Antenne":            {bg:"#FFF5E6",text:"#C05C0A",border:"#FDDBA8",dot:"#D97706",accent:C.orange},
  "Formateur":                 {bg:"#E6F7F4",text:"#047A5A",border:"#9EE5D2",dot:"#0DA575",accent:C.green},
  "Conseiller":                {bg:"#F2EEFF",text:"#6A24D4",border:"#CBBAF8",dot:"#7C3AED",accent:C.violet},
  "Entreprise":                {bg:"#FFF8E7",text:"#D4920A",border:"#FAE09A",dot:"#F5B020",accent:C.gold},
};
const rs = r => ROLE_STYLES[r] || ROLE_STYLES.DG;

const resolveGroup = role => {
  if (["Directeur Général","Directeur Général Adjoint","Chef de Division","DG","CD","DR","SUPERADMIN"].includes(role)) return "DG";
  if (["Chef de Section"].includes(role))       return "CS";
  if (["Chef d'Antenne","CC"].includes(role))   return "CA";
  if (["Formateur","FORMATEUR"].includes(role)) return "F";
  if (["Conseiller"].includes(role))            return "C";
  if (["Entreprise"].includes(role))            return "E";
  return "DG";
};

/* ═══════════════════════════════════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════════════════════════════════ */
const buildNavCategories = role => {
  const g = resolveGroup(role);
  const DG_CS=["DG","CS"], DG_CS_CA=["DG","CS","CA"], ALL_OP=["DG","CS","CA","F"], ALL=["DG","CS","CA","F","C","E"];
  const all = [
    { section:"Formations",       color:"#2447E0", icon:BookOpen,       groups:ALL,      items:[
      {path:"/formations",    label:"Catalogue formations", icon:BookOpen,     groups:ALL},
      {path:"/sessions",      label:"Sessions planifiées",  icon:CalendarDays, groups:ALL},
      {path:"/programmes",    label:"Programmes & modules", icon:Layers,       groups:DG_CS_CA},
      {path:"/certifications",label:"Certifications",       icon:Award,        groups:ALL},
    ]},
    { section:"Apprenants",       color:"#0891B2", icon:GraduationCap,  groups:ALL_OP,   items:[
      {path:"/inscription",    label:"Inscriptions",         icon:GraduationCap,groups:ALL_OP},
      {path:"/apprenants",     label:"Apprenants actifs",    icon:GraduationCap,groups:ALL_OP},
      {path:"/listeCandidats", label:"Inscrits & candidats", icon:UserCheck,    groups:DG_CS_CA},
      {path:"/validation",     label:"Validation dossiers",  icon:CheckCircle2, groups:DG_CS_CA},
      {path:"/suivi",          label:"Suivi pédagogique",    icon:ClipboardList,groups:ALL_OP},
      {path:"/insertion",      label:"Insertion",            icon:ClipboardList,groups:ALL_OP},
    ]},
    { section:"Présences & Notes",color:C.green,   icon:ClipboardList,  groups:["CA","F"],items:[
      {path:"/presences",   label:"Feuilles de présence",icon:CalendarDays, groups:["CA","F"]},
      {path:"/evaluations", label:"Notes & évaluations", icon:Award,        groups:["CA","F"]},
      {path:"/discipline",  label:"Discipline",           icon:AlertTriangle,groups:["CA","F"]},
    ]},
    { section:"Suivi complet",    color:C.green,   icon:ClipboardList,  groups:DG_CS,    items:[
      {path:"/presences",         label:"Présences",             icon:CalendarDays,groups:DG_CS},
      {path:"/evaluations",       label:"Évaluations",           icon:Award,       groups:DG_CS},
      {path:"/resultats",         label:"Résultats finaux",      icon:CheckCircle2,groups:DG_CS},
      {path:"/attestations",      label:"Attestations PDF",      icon:FileText,    groups:DG_CS},
      {path:"/enquete-insertion", label:"Enquête insertion",     icon:Clock,       groups:DG_CS},
      {path:"/relances",          label:"Relances automatiques", icon:Bell,        groups:["DG"]},
    ]},
    { section:"Fin de session",   color:C.gold,    icon:CheckCircle2,   groups:["CA","F"],items:[
      {path:"/resultats",         label:"Résultats finaux",      icon:CheckCircle2,groups:["CA","F"]},
      {path:"/attestations",      label:"Attestations PDF",      icon:FileText,    groups:["CA","F"]},
      {path:"/enquete-insertion", label:"Enquête insertion",     icon:Clock,       groups:["CA"]},
    ]},
    { section:"Entreprises",      color:"#B45309", icon:Briefcase,      groups:["DG","CS","E"],items:[
      {path:"/entreprises",   label:"Base des entreprises",icon:Briefcase,groups:["DG","CS","E"]},
      {path:"/offres-emploi", label:"Offres d'emploi",     icon:Package,  groups:["DG","CS","E"]},
    ]},
    { section:"Rapports",         color:C.violet,  icon:BarChart3,      groups:["DG","CS","CA","C"],items:[
      {path:"/statistiques",      label:"Statistiques globales",   icon:PieChart, groups:["DG"]},
      {path:"/statistiques",      label:"Statistiques de section", icon:PieChart, groups:["CS"]},
      {path:"/statistiques",      label:"Statistiques antenne",    icon:BarChart3,groups:["CA"]},
      {path:"/statistiques",      label:"Statistiques",            icon:BarChart3,groups:["C"]},
      {path:"/dashboardRegional", label:"Tableau régional",        icon:MapPin,   groups:["DG","CS"]},
      {path:"/rapports",          label:"Rapports & exports",      icon:FileText, groups:["DG","CS","CA"]},
    ]},
    { section:"Centres & Équipes",color:"#4338CA", icon:Building2,      groups:["DG","CS"],items:[
      {path:"/centresFormation",label:"Antennes de formation",icon:Building2,groups:["DG","CS"]},
      {path:"/teamMessage",     label:"Équipe & formateurs", icon:Users,    groups:["DG","CS","CA"]},
      {path:"/partnerPost",     label:"Partenaires",          icon:Package, groups:["DG"]},
    ]},
    { section:"Administration",   color:"#475569", icon:Settings,       groups:["DG"],   items:[
      {path:"/utilisateurs",label:"Gestion utilisateurs",icon:UserCog, groups:["DG"]},
      {path:"/parametres",  label:"Paramètres système",  icon:Settings,groups:["DG"]},
      {path:"/homePost",    label:"Contenu site public", icon:Layers,  groups:["DG"]},
    ]},
  ];
  return all
    .filter(c => c.groups.includes(g))
    .map(c => ({ ...c, items: c.items.filter(i => i.groups.includes(g)).filter((i,idx,a) => a.findIndex(x=>x.path===i.path&&x.label===i.label)===idx) }))
    .filter(c => c.items.length > 0);
};

/* ═══════════════════════════════════════════════════════════════════
   DONNÉES
═══════════════════════════════════════════════════════════════════ */
const STATS = {
  DG:[
    { label:"Apprenants actifs",   value:"4 832",trend:"+12%",up:true, icon:Users,       color:"#2447E0",sub:"vs mois précédent" },
    { label:"Taux de réussite",    value:"87%",  trend:"+3.2",up:true, icon:Target,      color:C.green,  sub:"objectif : 85%" },
    { label:"Antennes actives",    value:"24",   trend:"—",   up:null, icon:Building2,   color:C.gold,   sub:"sur 8 régions" },
    { label:"Formations en cours", value:"138",  trend:"+8",  up:true, icon:BookOpen,    color:C.violet, sub:"ce trimestre" },
  ],
  CS:[
    { label:"Apprenants section",  value:"612",  trend:"+7%", up:true, icon:Users,       color:"#2447E0",sub:"actifs ce mois" },
    { label:"Antennes section",    value:"6",    trend:"—",   up:null, icon:Building2,   color:C.green,  sub:"opérationnelles" },
    { label:"Taux présence",       value:"91%",  trend:"+1.4",up:true, icon:CheckCircle2,color:C.gold,   sub:"moyenne mensuelle" },
    { label:"Rapports en attente", value:"3",    trend:"-2",  up:true, icon:FileText,    color:C.danger, sub:"à traiter" },
  ],
  CA:[
    { label:"Apprenants antenne",  value:"98",   trend:"+4",  up:true, icon:Users,       color:"#2447E0",sub:"inscrits actifs" },
    { label:"Formateurs actifs",   value:"12",   trend:"—",   up:null, icon:UserCog,     color:C.violet, sub:"en poste" },
    { label:"Sessions ce mois",    value:"34",   trend:"+5",  up:true, icon:CalendarDays,color:C.green,  sub:"planifiées" },
    { label:"Taux d'abandon",      value:"2.1%", trend:"-0.5",up:true, icon:AlertTriangle,color:C.danger,sub:"en baisse ✓" },
  ],
  F:[
    { label:"Mes apprenants",      value:"32",   trend:"—",   up:null, icon:Users,       color:"#0891B2",sub:"groupe actuel" },
    { label:"Séances ce mois",     value:"18",   trend:"+2",  up:true, icon:CalendarDays,color:"#2447E0",sub:"complétées" },
    { label:"Taux présence",       value:"94%",  trend:"+2%", up:true, icon:CheckCircle2,color:C.green,  sub:"moyenne" },
    { label:"Évaluations",         value:"8",    trend:"+3",  up:false,icon:ClipboardList,color:C.gold,  sub:"à noter" },
  ],
  C:[
    { label:"Dossiers suivis",     value:"47",   trend:"+3",  up:true, icon:ClipboardList,color:C.violet,sub:"actifs" },
    { label:"Formations vues",     value:"23",   trend:"+5",  up:true, icon:BookOpen,    color:"#2447E0",sub:"ce mois" },
    { label:"Rapports générés",    value:"12",   trend:"+2",  up:true, icon:BarChart3,   color:C.green,  sub:"exportés" },
    { label:"Alertes",             value:"1",    trend:"—",   up:null, icon:AlertTriangle,color:C.gold,  sub:"à traiter" },
  ],
  E:[
    { label:"Offres publiées",     value:"5",    trend:"+1",  up:true, icon:Briefcase,   color:C.gold,   sub:"actives" },
    { label:"Candidatures",        value:"34",   trend:"+8",  up:true, icon:Users,       color:"#2447E0",sub:"ce mois" },
    { label:"Formations partner.", value:"3",    trend:"—",   up:null, icon:BookOpen,    color:C.green,  sub:"en cours" },
    { label:"Contrats actifs",     value:"2",    trend:"+1",  up:true, icon:CheckCircle2,color:C.violet, sub:"signés" },
  ],
};

const ACTIVITY = {
  DG:[
    { text:"Rapport mensuel soumis",   detail:"Antenne de Kindia",       time:"8 min",  color:"#2447E0", type:"rapport"     },
    { text:"Nouvel apprenant inscrit", detail:"Formation Informatique",   time:"22 min", color:C.green,   type:"inscription" },
    { text:"Alerte taux d'abandon",    detail:"Section de Labé — 4.2%",  time:"1h",     color:C.danger,  type:"alerte"      },
    { text:"Budget Q3 validé",         detail:"Direction Générale",       time:"2h",     color:C.gold,    type:"finance"     },
    { text:"Nouvelle antenne créée",   detail:"Antenne de Mamou",         time:"Hier",   color:C.textMuted,type:"admin"      },
  ],
  CS:[
    { text:"Rapport antenne soumis",   detail:"Antenne de Pita",          time:"15 min", color:"#2447E0", type:"rapport"     },
    { text:"Session planifiée",        detail:"Formation Excel — 24 mars",time:"1h",     color:C.green,   type:"session"     },
    { text:"Apprenant validé",         detail:"Certification Bureautique",time:"3h",     color:C.gold,    type:"validation"  },
    { text:"Absence signalée",         detail:"Formateur Bah Mamadou",    time:"Hier",   color:C.textMuted,type:"rh"         },
  ],
  CA:[
    { text:"Émargement signé",         detail:"Module Python — Salle B2", time:"5 min",  color:"#2447E0", type:"présence"    },
    { text:"Apprenant absent",         detail:"Diallo Fatoumata",         time:"30 min", color:C.danger,  type:"absence"     },
    { text:"Note saisie",              detail:"Évaluation finale — 17/20",time:"2h",     color:C.green,   type:"note"        },
    { text:"Incident signalé",         detail:"Problème matériel Salle A",time:"Hier",   color:C.textMuted,type:"incident"   },
  ],
  F:[
    { text:"Séance complétée",         detail:"Module 4 — Python avancé", time:"1h",     color:"#2447E0", type:"cours"       },
    { text:"Évaluation soumise",       detail:"Apprenant: Kouyaté Sekou", time:"2h",     color:C.green,   type:"note"        },
    { text:"Ressource ajoutée",        detail:"PDF: Algo & Structures",   time:"3h",     color:C.gold,    type:"ressource"   },
    { text:"Message apprenant",        detail:"Question exercice 3",      time:"Hier",   color:C.textMuted,type:"message"    },
  ],
  C:[
    { text:"Rapport consulté",         detail:"Statistiques nationales",  time:"30 min", color:C.violet,  type:"rapport"     },
    { text:"Dossier examiné",          detail:"Apprenant: Sylla Ibrahima",time:"2h",     color:"#2447E0", type:"dossier"     },
    { text:"Recommandation émise",     detail:"Formation Comptabilité",   time:"Hier",   color:C.textMuted,type:"conseil"    },
  ],
  E:[
    { text:"Offre publiée",            detail:"Technicien Réseau — CDI",  time:"1h",     color:C.gold,    type:"offre"       },
    { text:"Candidature reçue",        detail:"Bah Kadiatou — 2 ans exp.",time:"3h",     color:"#2447E0", type:"candidature" },
    { text:"Convention signée",        detail:"Partenariat ONFPP 2025",   time:"Hier",   color:C.green,   type:"contrat"     },
  ],
};

const QUICK_LINKS = {
  DG:[
    { path:"/apprenants",   label:"Apprenants",   icon:GraduationCap, color:"#2447E0" },
    { path:"/statistiques", label:"Statistiques", icon:PieChart,      color:C.violet  },
    { path:"/rapports",     label:"Rapports",     icon:BarChart3,     color:C.teal    },
    { path:"/utilisateurs", label:"Utilisateurs", icon:UserCog,       color:"#475569" },
  ],
  CS:[
    { path:"/apprenants",       label:"Apprenants",  icon:GraduationCap, color:"#2447E0" },
    { path:"/statistiques",     label:"Statistiques",icon:PieChart,      color:C.violet  },
    { path:"/centresFormation", label:"Antennes",    icon:Building2,     color:C.gold    },
    { path:"/rapports",         label:"Rapports",    icon:BarChart3,     color:C.teal    },
  ],
  CA:[
    { path:"/apprenants",  label:"Apprenants",  icon:GraduationCap, color:"#2447E0" },
    { path:"/presences",   label:"Présences",   icon:CalendarDays,  color:C.green   },
    { path:"/evaluations", label:"Évaluations", icon:Award,         color:C.gold    },
    { path:"/resultats",   label:"Résultats",   icon:CheckCircle2,  color:C.teal    },
  ],
  F:[
    { path:"/apprenants",  label:"Apprenants",  icon:GraduationCap, color:"#2447E0" },
    { path:"/presences",   label:"Présences",   icon:CalendarDays,  color:C.green   },
    { path:"/evaluations", label:"Évaluations", icon:Award,         color:C.gold    },
    { path:"/sessions",    label:"Sessions",    icon:CalendarDays,  color:"#0891B2" },
  ],
  C:[
    { path:"/statistiques",label:"Statistiques",icon:PieChart,      color:C.violet  },
    { path:"/rapports",    label:"Rapports",    icon:BarChart3,     color:C.teal    },
    { path:"/apprenants",  label:"Apprenants",  icon:GraduationCap, color:"#2447E0" },
    { path:"/formations",  label:"Formations",  icon:BookOpen,      color:"#0891B2" },
  ],
  E:[
    { path:"/offres-emploi",label:"Offres",     icon:Briefcase,     color:C.gold    },
    { path:"/entreprises",  label:"Entreprises",icon:Building2,     color:"#475569" },
    { path:"/formations",   label:"Formations", icon:BookOpen,      color:"#0891B2" },
    { path:"/apprenants",   label:"Apprenants", icon:GraduationCap, color:"#2447E0" },
  ],
};

const VG_BARS = [
  { label:"Taux de réussite national", value:87, color:"#2447E0", icon:Target       },
  { label:"Taux de présence moyen",    value:91, color:C.green,   icon:CheckCircle2 },
  { label:"Taux d'insertion pro.",     value:63, color:C.violet,  icon:Briefcase    },
  { label:"Complétion des cours",      value:78, color:C.gold,    icon:BookOpen     },
];
const VG_GRID = [
  { label:"Régions",    value:"8",     icon:MapPin,       color:"#2447E0" },
  { label:"Antennes",   value:"24",    icon:Building2,    color:C.gold    },
  { label:"Formateurs", value:"186",   icon:UserCog,      color:C.violet  },
  { label:"Diplômés",   value:"1 248", icon:Award,        color:C.green   },
  { label:"Sessions",   value:"42",    icon:CalendarDays, color:"#0891B2" },
  { label:"Partenaires",value:"37",    icon:Briefcase,    color:C.teal    },
];

/* ═══════════════════════════════════════════════════════════════════
   getStoredUser
═══════════════════════════════════════════════════════════════════ */
const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    if (raw) {
      const p = JSON.parse(raw);
      return { username:p.username||p.email||"", firstName:p.first_name||p.firstName||null, lastName:p.last_name||p.lastName||null, role:p.role||"Directeur Général", niveau:p.niveau??0, region:p.region||null, centre:p.centre||null };
    }
    const token = localStorage.getItem("access");
    if (token) {
      const p = JSON.parse(atob(token.split(".")[1]));
      return { username:p.username||p.email||"", firstName:p.first_name||null, lastName:p.last_name||null, role:p.role||"Directeur Général", niveau:p.niveau??0, region:p.region||null, centre:p.centre||null };
    }
  } catch {}
  return { username:"Admin", role:"Directeur Général", niveau:0 };
};

/* ═══════════════════════════════════════════════════════════════════
   CSS  —  Fraunces (display sérif) + Outfit (corps moderne)
═══════════════════════════════════════════════════════════════════ */
const DASH_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  .da  { font-family:'Outfit',sans-serif; -webkit-font-smoothing:antialiased; }
  .da-serif { font-family:'Fraunces',serif !important; }

  /* ── micro-texture fond ── */
  .da-page::before {
    content:''; position:fixed; inset:0; pointer-events:none; z-index:0;
    background-image: radial-gradient(circle at 1px 1px, rgba(22,53,200,.055) 1px, transparent 0);
    background-size: 28px 28px;
  }

  /* ── KPI card ── */
  .da-kpi {
    transition: transform .26s cubic-bezier(.34,1.5,.64,1), box-shadow .26s ease;
    cursor: default;
  }
  .da-kpi:hover {
    transform: translateY(-7px) scale(1.012);
    box-shadow: 0 28px 60px var(--kglow), 0 8px 20px rgba(6,16,42,.12) !important;
  }

  /* ── Section card ── */
  .da-sec {
    transition: box-shadow .2s, border-color .2s;
  }
  .da-sec:hover {
    box-shadow: 0 12px 48px rgba(6,16,42,.12) !important;
    border-color: rgba(22,53,200,.18) !important;
  }

  /* ── Module row ── */
  .da-mod {
    transition: background .15s, border-left-color .16s, padding-left .2s cubic-bezier(.34,1.3,.64,1);
  }
  .da-mod:hover {
    background: ${C.pageAlt} !important;
    border-left-color: var(--mc) !important;
    padding-left: 20px !important;
  }
  .da-mod:hover .da-arr { transform:translateX(5px); opacity:1 !important; }

  /* ── Quick link ── */
  .da-ql { transition: all .18s cubic-bezier(.34,1.2,.64,1); }
  .da-ql:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(6,16,42,.13) !important;
    border-color: ${C.iceBlue} !important;
    background: ${C.surface} !important;
  }

  /* ── Activity row ── */
  .da-act { transition: background .12s; border-radius:10px; }
  .da-act:hover { background: ${C.surfaceEl} !important; }

  /* ── Glob stat ── */
  .da-gs { transition: all .15s; cursor:default; }
  .da-gs:hover { transform:translateY(-2px); background:${C.surface} !important; box-shadow:0 6px 20px rgba(6,16,42,.1) !important; }

  /* ── Tab ── */
  .da-tab { transition: all .18s ease; cursor: pointer; }
  .da-tab:hover { background: ${C.pageAlt} !important; }

  /* ── Notif item ── */
  .da-ni { transition: background .12s; }
  .da-ni:hover { background: ${C.surfaceEl} !important; }

  /* ── Entrée orchestrée ── */
  @keyframes daUp {
    from { opacity:0; transform:translateY(20px) scale(.985); }
    to   { opacity:1; transform:translateY(0)    scale(1); }
  }
  .da-in { animation: daUp .5s cubic-bezier(.22,1,.36,1) both; }
  .da-d0 { animation-delay:.0s;  }
  .da-d1 { animation-delay:.07s; }
  .da-d2 { animation-delay:.14s; }
  .da-d3 { animation-delay:.21s; }
  .da-d4 { animation-delay:.28s; }
  .da-d5 { animation-delay:.36s; }

  /* ── Badge pulse ── */
  @keyframes daPulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(220,29,68,.5); }
    60%     { box-shadow: 0 0 0 7px rgba(220,29,68,0); }
  }
  .da-badge { animation: daPulse 2.4s ease infinite; }

  /* ── Bar grow ── */
  @keyframes daBar { from{width:0} to{width:var(--bw)} }
  .da-bar { animation: daBar 1.1s cubic-bezier(.22,1,.36,1) both; }

  /* ── Horloge blink ── */
  @keyframes daBlink { 0%,49%{opacity:1} 50%,100%{opacity:.2} }
  .da-blink { animation: daBlink 1s step-end infinite; }

  /* ── Notif panel ── */
  @keyframes daDrop {
    from { opacity:0; transform:translateY(-10px) scale(.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  .da-notif-panel { animation: daDrop .2s cubic-bezier(.22,1,.36,1) both; }

  /* ── Aurora hero ── */
  @keyframes daAurora {
    0%,100% { opacity:.55; transform:scale(1)   translateX(0); }
    50%     { opacity:.75; transform:scale(1.08) translateX(20px); }
  }
  .da-aurora { animation: daAurora 9s ease-in-out infinite; }

  /* ── Responsive ── */
  @media(max-width:1200px) {
    .da-layout  { grid-template-columns:1fr !important; }
    .da-sidebar { display:none !important; }
  }
  @media(max-width:780px) {
    .da-kpi-grid { grid-template-columns:1fr 1fr !important; }
    .da-hero-inner { flex-direction:column !important; gap:22px !important; }
    .da-hero-right { align-items:flex-start !important; }
    .da { padding:76px 14px 52px !important; }
  }
  @media(max-width:480px) {
    .da-kpi-grid { grid-template-columns:1fr !important; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════
   SOUS-COMPOSANTS
═══════════════════════════════════════════════════════════════════ */

/* Badge notification */
const NBadge = ({ n }) => n > 0 ? (
  <span className="da-badge" style={{
    position:"absolute", top:-6, right:-6,
    minWidth:19, height:19, borderRadius:12,
    background:C.rose, color:"#fff",
    fontSize:9.5, fontWeight:800,
    display:"flex", alignItems:"center", justifyContent:"center",
    padding:"0 5px", border:"2.5px solid #F8F9FD",
    fontFamily:"'Outfit',sans-serif",
  }}>{n}</span>
) : null;

/* KPI Card */
const KpiCard = ({ label, value, trend, up, icon:Icon, color, sub, delay=0 }) => {
  const flat   = up === null;
  const tColor = flat ? C.textMuted : up ? C.green : C.danger;
  const tBg    = flat ? C.surfaceEl : up ? C.greenPale : "#FDEAEA";
  const TIcon  = flat ? null : up ? TrendingUp : TrendingDown;
  return (
    <div
      className={`da-kpi da-in da-d${delay}`}
      style={{
        "--kglow": color + "28",
        background: C.surface,
        borderRadius: 20,
        padding: "24px 22px",
        border: `1px solid ${C.divider}`,
        boxShadow: `0 2px 16px ${C.shadow}, 0 0 0 1px rgba(255,255,255,.7) inset`,
        display: "flex", flexDirection: "column", gap: 18,
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Liseré couleur haut */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${color},${color}44)`, borderRadius:"20px 20px 0 0" }}/>
      {/* Lueur déco bas droite */}
      <div style={{ position:"absolute", bottom:-30, right:-30, width:120, height:120, borderRadius:"50%", background:`${color}0C`, pointerEvents:"none" }}/>
      {/* Bande verticale accent */}
      <div style={{ position:"absolute", top:0, right:0, width:3, height:"40%", background:`linear-gradient(180deg,${color}22,transparent)`, borderRadius:"0 20px 0 0" }}/>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", position:"relative" }}>
        <div style={{
          width:50, height:50, borderRadius:15,
          background:`linear-gradient(135deg,${color}18,${color}0A)`,
          border:`1.5px solid ${color}25`,
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:`0 4px 16px ${color}18`,
        }}>
          <Icon size={22} color={color}/>
        </div>
        <span style={{
          display:"flex", alignItems:"center", gap:4,
          fontSize:11, fontWeight:700, padding:"4px 11px",
          borderRadius:20, background:tBg, color:tColor,
          fontFamily:"'Outfit',sans-serif",
          border:`1px solid ${tColor}1A`,
        }}>
          {TIcon && <TIcon size={9}/>}
          {trend === "—" ? "stable" : trend}
        </span>
      </div>

      <div style={{ position:"relative" }}>
        <p className="da-serif" style={{ fontSize:34, fontWeight:700, color:C.textPri, lineHeight:1, letterSpacing:"-1px" }}>{value}</p>
        <p style={{ fontSize:12.5, color:C.textSub, marginTop:7, fontWeight:500 }}>{label}</p>
        <p style={{ fontSize:11, color:C.textMuted, marginTop:3 }}>{sub}</p>
      </div>
    </div>
  );
};

/* Section header */
const SHdr = ({ icon:Icon, title, color, count }) => (
  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
    <div style={{ width:4, height:26, borderRadius:3, background:color, flexShrink:0 }}/>
    <div style={{ width:32, height:32, borderRadius:9, background:`${color}14`, border:`1px solid ${color}22`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <Icon size={15} color={color}/>
    </div>
    <p className="da-serif" style={{ flex:1, fontSize:13.5, fontWeight:600, color:C.textPri, letterSpacing:"-0.1px" }}>{title}</p>
    {count && (
      <span style={{ fontSize:10, fontWeight:700, color, background:`${color}12`, border:`1px solid ${color}22`, borderRadius:20, padding:"2px 9px", fontFamily:"'Outfit',sans-serif" }}>
        {count}
      </span>
    )}
  </div>
);

/* Module row */
const ModRow = ({ label, icon:Icon, path, color }) => (
  <Link to={path || "#"} style={{ textDecoration:"none" }}>
    <div className="da-mod" style={{
      "--mc": color,
      background: C.surfaceEl,
      border: `1px solid ${C.divider}`,
      borderLeft: `3px solid transparent`,
      borderRadius: 10,
      padding: "10px 14px",
      display: "flex", alignItems: "center", gap: 11,
    }}>
      <div style={{ width:30, height:30, borderRadius:8, flexShrink:0, background:`${color}12`, border:`1px solid ${color}1E`, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Icon size={13} color={color}/>
      </div>
      <p style={{ flex:1, fontSize:12.5, fontWeight:500, color:C.textSub, minWidth:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", fontFamily:"'Outfit',sans-serif" }}>{label}</p>
      <ChevronRight className="da-arr" size={13} color={C.textMuted} style={{ flexShrink:0, opacity:.3, transition:"all .2s" }}/>
    </div>
  </Link>
);

/* Section box */
const SBox = ({ icon, title, color, children, count, delay="da-d1" }) => (
  <div className={`da-sec da-in ${delay}`} style={{
    background: C.surface,
    borderRadius: 20,
    padding: "22px",
    border: `1px solid ${C.divider}`,
    boxShadow: `0 2px 18px ${C.shadow}`,
  }}>
    <SHdr icon={icon} title={title} color={color} count={count}/>
    {children}
  </div>
);

/* Quick link */
const QL = ({ path, label, icon:Icon, color }) => (
  <Link to={path || "#"} style={{ textDecoration:"none", flex:"1 1 calc(50% - 5px)", minWidth:0 }}>
    <div className="da-ql" style={{
      display:"flex", alignItems:"center", gap:9,
      padding:"11px 13px", borderRadius:12,
      background: C.surfaceEl,
      border: `1px solid ${C.divider}`,
      cursor: "pointer",
    }}>
      <div style={{ width:32, height:32, borderRadius:9, background:`${color}14`, border:`1px solid ${color}20`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <Icon size={14} color={color}/>
      </div>
      <span style={{ fontSize:12, fontWeight:600, color:C.textSub, flex:1, minWidth:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", fontFamily:"'Outfit',sans-serif" }}>{label}</span>
      <ArrowUpRight size={11} color={C.textMuted} style={{ flexShrink:0, opacity:.55 }}/>
    </div>
  </Link>
);

/* Activity item */
const ActItem = ({ text, detail, time, color, type, isLast }) => (
  <div className="da-act" style={{ display:"flex", gap:14, padding:"12px 10px", borderBottom:isLast?"none":`1px solid ${C.divider}`, alignItems:"flex-start" }}>
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:0, flexShrink:0, paddingTop:5 }}>
      <div style={{ width:8, height:8, borderRadius:"50%", background:color, boxShadow:`0 0 0 3px ${color}22`, flexShrink:0 }}/>
      {!isLast && <div style={{ width:1, height:28, background:C.divider, marginTop:3 }}/>}
    </div>
    <div style={{ flex:1, minWidth:0 }}>
      <p style={{ fontSize:12.5, fontWeight:600, color:C.textPri }}>{text}</p>
      <p style={{ fontSize:11, color:C.textMuted, marginTop:2 }}>{detail}</p>
    </div>
    <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
      <span style={{ fontSize:9.5, color, fontWeight:700, background:`${color}12`, border:`1px solid ${color}1E`, padding:"2px 7px", borderRadius:6, textTransform:"uppercase", letterSpacing:".05em" }}>{type}</span>
      <span style={{ fontSize:10, color:C.textMuted, background:C.surfaceEl, padding:"2px 9px", borderRadius:20, border:`1px solid ${C.divider}`, whiteSpace:"nowrap" }}>{time}</span>
    </div>
  </div>
);

/* Vue Globale (DG) */
const VueGlobale = () => (
  <div>
    <SHdr icon={Globe} title="Vue globale — plateforme" color="#2447E0"/>
    <div style={{ display:"flex", flexDirection:"column", gap:13, marginBottom:18 }}>
      {VG_BARS.map((b,i) => {
        const BI = b.icon;
        return (
          <div key={i}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                <BI size={11} color={b.color}/>
                <span style={{ fontSize:11, fontWeight:500, color:C.textSub }}>{b.label}</span>
              </div>
              <span className="da-serif" style={{ fontSize:13, fontWeight:600, color:b.color }}>{b.value}%</span>
            </div>
            <div style={{ height:6, borderRadius:4, background:C.surfaceEl, overflow:"hidden" }}>
              <div className="da-bar" style={{ "--bw":`${b.value}%`, height:"100%", borderRadius:4, background:`linear-gradient(90deg,${b.color},${b.color}88)`, animationDelay:`${i*.13+.3}s` }}/>
            </div>
          </div>
        );
      })}
    </div>
    <div style={{ height:1, background:C.divider, marginBottom:14 }}/>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:7 }}>
      {VG_GRID.map((g,i) => {
        const GI = g.icon;
        return (
          <div key={i} className="da-gs" style={{ background:C.surfaceEl, border:`1px solid ${C.divider}`, borderRadius:11, padding:"11px 8px", display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:`${g.color}14`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <GI size={13} color={g.color}/>
            </div>
            <p className="da-serif" style={{ fontSize:16, fontWeight:600, color:C.textPri, lineHeight:1 }}>{g.value}</p>
            <p style={{ fontSize:9.5, color:C.textMuted, textAlign:"center", lineHeight:1.3 }}>{g.label}</p>
          </div>
        );
      })}
    </div>
  </div>
);

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
  const role        = user.role || "Directeur Général";
  const roleLabel   = ROLE_LABELS[role] || role;
  const rStyle      = rs(role);
  const group       = resolveGroup(role);
  const displayName = user.firstName
    ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
    : user.username || "Admin";
  const initials = displayName.split(" ").filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?";

  const stats    = STATS[group]       || STATS.DG;
  const activity = ACTIVITY[group]    || ACTIVITY.DG;
  const sections = buildNavCategories(role);
  const qlItems  = QUICK_LINKS[group] || QUICK_LINKS.DG;
  const isDG     = group === "DG";
  const totalMod = sections.reduce((a, s) => a + s.items.length, 0);
  const notifs   = activity.slice(0, 4).map((a, i) => ({ ...a, read: i > 1 }));
  const unread   = notifs.filter(n => !n.read).length;

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
      setNotifPos({ top: r.bottom + 12, right: window.innerWidth - r.right });
    }
    setNotifOpen(v => !v);
  };

  const hh = String(time.getHours()).padStart(2, "0");
  const mm = String(time.getMinutes()).padStart(2, "0");
  const ss = String(time.getSeconds()).padStart(2, "0");
  const greeting = time.getHours() < 12 ? "Bonjour" : time.getHours() < 18 ? "Bon après-midi" : "Bonsoir";
  const dateStr  = time.toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long", year:"numeric" });

  return (
    <>
      <style>{DASH_CSS}</style>
      <div
        className="da da-page"
        style={{
          minHeight: "100vh",
          background: `radial-gradient(ellipse 110% 60% at 60% -10%, rgba(22,53,200,.07) 0%, transparent 65%), ${C.page}`,
          padding: "84px 30px 64px",
          position: "relative",
        }}
      >
        {/* ── Aurora background blobs ── */}
        <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", overflow:"hidden" }}>
          <div className="da-aurora" style={{ position:"absolute", top:"-8%", right:"12%", width:560, height:560, borderRadius:"50%", background:"radial-gradient(circle,rgba(22,53,200,.08) 0%,transparent 70%)", filter:"blur(30px)" }}/>
          <div style={{ position:"absolute", bottom:"5%", left:"8%", width:440, height:440, borderRadius:"50%", background:"radial-gradient(circle,rgba(5,150,105,.05) 0%,transparent 70%)", filter:"blur(40px)" }}/>
          <div style={{ position:"absolute", top:"40%", right:"30%", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,rgba(212,146,10,.04) 0%,transparent 70%)", filter:"blur(30px)" }}/>
        </div>

        <div style={{ position:"relative", zIndex:1 }}>

          {/* ══════════════════════════════════════════════════
              HERO — "Sceau d'État"
          ══════════════════════════════════════════════════ */}
          <div className="da-in da-d0" style={{
            background: `linear-gradient(138deg, ${C.navy} 0%, #0C1E6C 45%, ${C.blue} 85%, #1E45EE 100%)`,
            borderRadius: 26,
            marginBottom: 26,
            padding: "38px 44px",
            boxShadow: `0 20px 64px ${C.shadowLg}, 0 2px 0 rgba(255,255,255,.08) inset`,
            position: "relative",
            overflow: "visible",
          }}>

            {/* Décorations internes */}
            <div style={{ position:"absolute", inset:0, borderRadius:26, overflow:"hidden", pointerEvents:"none" }}>
              {/* Grille fine */}
              <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:.08 }} xmlns="http://www.w3.org/2000/svg">
                <defs><pattern id="hg" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(255,255,255,1)" strokeWidth=".7"/></pattern></defs>
                <rect width="100%" height="100%" fill="url(#hg)"/>
              </svg>
              {/* Lueurs rondes */}
              <div style={{ position:"absolute", top:-80, right:-60, width:380, height:380, borderRadius:"50%", background:"rgba(255,255,255,.05)", filter:"blur(0)" }}/>
              <div style={{ position:"absolute", bottom:-70, right:120, width:260, height:260, borderRadius:"50%", background:"rgba(255,255,255,.03)" }}/>
              {/* Cercle accent doré */}
              <div style={{ position:"absolute", top:32, right:220, width:64, height:64, borderRadius:"50%", background:"rgba(245,176,32,.18)", border:"1px solid rgba(245,176,32,.2)" }}/>

              {/* ══ TRICOLORE GUINÉE : Rouge · Jaune · Vert ══ */}
              <div style={{ position:"absolute", top:0, left:0, right:0, height:4, display:"flex", borderRadius:"26px 26px 0 0" }}>
                <div style={{ flex:1, background:"linear-gradient(90deg,#CC1A1A,#E02020)" }}/>
                <div style={{ flex:1, background:`linear-gradient(90deg,${C.gold},${C.goldLight})` }}/>
                <div style={{ flex:1, background:`linear-gradient(90deg,${C.green},${C.greenLight})` }}/>
              </div>
            </div>

            <div className="da-hero-inner" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:28, flexWrap:"wrap", position:"relative", zIndex:1 }}>

              {/* ── Gauche : identité ── */}
              <div>
                {/* Fil d'Ariane */}
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20, opacity:.55 }}>
                  <Globe size={11} color={C.goldLight}/>
                  <span style={{ fontSize:10, color:C.goldLight, fontWeight:700, letterSpacing:".2em", textTransform:"uppercase", fontFamily:"'Outfit',sans-serif" }}>
                    ONFPP · Plateforme Nationale · République de Guinée
                  </span>
                </div>

                {/* Avatar + Greeting */}
                <div style={{ display:"flex", alignItems:"center", gap:18, marginBottom:20 }}>
                  {/* Avatar sophistiqué */}
                  <div style={{ position:"relative", flexShrink:0 }}>
                    <div style={{
                      width:62, height:62, borderRadius:18,
                      background: `linear-gradient(135deg,${rStyle.dot}55,${rStyle.dot}22)`,
                      border: "1.5px solid rgba(255,255,255,.22)",
                      backdropFilter: "blur(12px)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: `0 0 0 4px rgba(255,255,255,.07), 0 8px 28px rgba(0,0,0,.28)`,
                    }}>
                      <span className="da-serif" style={{ fontSize:24, fontWeight:600, color:"#fff", fontStyle:"italic" }}>{initials}</span>
                    </div>
                    {/* Petit badge rôle couleur */}
                    <div style={{ position:"absolute", bottom:-4, right:-4, width:18, height:18, borderRadius:6, background:rStyle.dot, border:"2px solid rgba(255,255,255,.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <div style={{ width:6, height:6, borderRadius:"50%", background:"#fff" }}/>
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize:12, color:"rgba(255,255,255,.5)", fontWeight:500, marginBottom:4, fontFamily:"'Outfit',sans-serif" }}>{greeting}</p>
                    <h1 className="da-serif" style={{ fontSize:30, fontWeight:600, fontStyle:"italic", color:"#fff", lineHeight:1.05, letterSpacing:"-0.5px" }}>
                      {displayName}
                    </h1>
                    <p style={{ fontSize:11.5, color:"rgba(255,255,255,.45)", marginTop:5, fontFamily:"'Outfit',sans-serif" }}>{dateStr}</p>
                  </div>
                </div>

                {/* Badges */}
                <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                  <span style={{
                    display:"inline-flex", alignItems:"center", gap:7,
                    background:"rgba(255,255,255,.12)", backdropFilter:"blur(10px)",
                    border:"1px solid rgba(255,255,255,.2)", borderRadius:30,
                    padding:"6px 16px", fontSize:12, fontWeight:700, color:"#fff",
                    fontFamily:"'Outfit',sans-serif",
                  }}>
                    <ShieldCheck size={13}/>{roleLabel}
                  </span>
                  {user.niveau > 0 && (
                    <span style={{
                      display:"inline-flex", alignItems:"center", gap:6, fontSize:11.5,
                      background:"rgba(245,176,32,.2)", border:"1px solid rgba(245,176,32,.32)",
                      borderRadius:30, padding:"5px 14px", fontWeight:700, color:C.goldLight,
                      fontFamily:"'Outfit',sans-serif",
                    }}>
                      <Star size={11} color={C.goldLight} fill={C.goldLight}/> Niveau {user.niveau}/10
                    </span>
                  )}
                  {user.region && (
                    <span style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:11, color:"rgba(255,255,255,.6)", fontFamily:"'Outfit',sans-serif" }}>
                      <MapPin size={11}/>{user.region}
                    </span>
                  )}
                  {user.centre && (
                    <span style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:11, color:"rgba(255,255,255,.6)", fontFamily:"'Outfit',sans-serif" }}>
                      <Building2 size={11}/>{user.centre}
                    </span>
                  )}
                </div>
              </div>

              {/* ── Droite : horloge + actions ── */}
              <div className="da-hero-right" style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:14 }}>

                {/* Horloge */}
                <div style={{
                  background: "rgba(0,0,0,.35)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,.1)",
                  borderRadius: 18, padding: "16px 28px",
                  textAlign: "center",
                  boxShadow: "0 8px 32px rgba(0,0,0,.35)",
                }}>
                  <p className="da-serif" style={{ fontSize:38, fontWeight:700, letterSpacing:5, lineHeight:1, color:"#fff" }}>
                    {hh}<span className="da-blink" style={{ color:C.goldLight }}>:</span>{mm}<span className="da-blink" style={{ color:C.goldLight }}>:</span>{ss}
                  </p>
                  <p style={{ fontSize:9.5, color:"rgba(255,255,255,.38)", marginTop:7, fontWeight:600, letterSpacing:".14em", textTransform:"uppercase", fontFamily:"'Outfit',sans-serif" }}>
                    Heure locale · Conakry, Guinée
                  </p>
                </div>

                {/* Méta + Bell */}
                <div style={{ display:"flex", gap:9, alignItems:"center" }}>
                  <div style={{ background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.15)", borderRadius:12, padding:"8px 16px", display:"flex", alignItems:"center", gap:8 }}>
                    <LayoutDashboard size={12} color="rgba(255,255,255,.65)"/>
                    <span style={{ fontSize:11.5, color:"rgba(255,255,255,.75)", fontWeight:600, fontFamily:"'Outfit',sans-serif" }}>{totalMod} modules</span>
                  </div>
                  <div style={{ position:"relative" }} ref={bellRef}>
                    <button
                      onClick={openNotif}
                      style={{
                        width:44, height:44, borderRadius:13,
                        background:"rgba(255,255,255,.12)", border:"1px solid rgba(255,255,255,.2)",
                        cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                        color:"#fff", transition:"background .15s", backdropFilter:"blur(10px)",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.2)"}
                      onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.12)"}
                    >
                      <Bell size={18}/>
                    </button>
                    <NBadge n={unread}/>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications dropdown — position:fixed */}
          {notifOpen && (
            <>
              <div style={{ position:"fixed", inset:0, zIndex:998 }} onClick={() => setNotifOpen(false)}/>
              <div className="da-notif-panel" style={{
                position: "fixed",
                top: notifPos.top,
                right: notifPos.right,
                width: 345,
                background: C.surface,
                border: `1px solid ${C.divider}`,
                borderTop: `3px solid ${C.gold}`,
                borderRadius: "0 0 18px 18px",
                boxShadow: `0 28px 72px ${C.shadowMd}`,
                zIndex: 999, overflow: "hidden",
              }}>
                <div style={{ padding:"14px 18px 12px", borderBottom:`1px solid ${C.divider}`, display:"flex", justifyContent:"space-between", alignItems:"center", background:`${C.gold}06` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <Bell size={13} color={C.gold}/>
                    <p className="da-serif" style={{ fontSize:13, fontWeight:600, color:C.textPri }}>Notifications</p>
                  </div>
                  {unread > 0 && (
                    <span style={{ fontSize:10, color:C.gold, fontWeight:700, background:`${C.gold}14`, padding:"2px 9px", borderRadius:20, border:`1px solid ${C.gold}28`, fontFamily:"'Outfit',sans-serif" }}>
                      {unread} non lue{unread > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                {notifs.map((n, i) => (
                  <div key={i} className="da-ni" style={{
                    padding:"12px 18px",
                    borderBottom: i < notifs.length - 1 ? `1px solid ${C.divider}` : "none",
                    background: n.read ? C.surface : `${C.blue}05`,
                    display:"flex", gap:12, alignItems:"flex-start",
                  }}>
                    <div style={{ width:7, height:7, borderRadius:"50%", flexShrink:0, marginTop:5, background:n.read?C.divider:n.color, boxShadow:n.read?"none":`0 0 0 3px ${n.color}22` }}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:12.5, fontWeight:n.read?400:600, color:C.textPri, fontFamily:"'Outfit',sans-serif" }}>{n.text}</p>
                      <p style={{ fontSize:11, color:C.textMuted, marginTop:2, fontFamily:"'Outfit',sans-serif" }}>{n.detail} · {n.time}</p>
                    </div>
                  </div>
                ))}
                <div style={{ padding:"10px 18px 13px", borderTop:`1px solid ${C.divider}`, display:"flex", justifyContent:"center" }}>
                  <button onClick={() => setNotifOpen(false)} style={{ fontSize:12, fontWeight:700, color:C.blue, background:"none", border:"none", cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}>
                    Voir toutes les notifications →
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════════
              KPI CARDS
          ══════════════════════════════════════════════════ */}
          <div className="da-kpi-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))", gap:14, marginBottom:26 }}>
            {stats.map((s, i) => <KpiCard key={i} {...s} delay={Math.min(i + 1, 5)}/>)}
          </div>

          {/* ══════════════════════════════════════════════════
              ONGLETS
          ══════════════════════════════════════════════════ */}
          <div style={{
            display:"flex", gap:4, marginBottom:22,
            padding:"4px",
            background: C.surface,
            border: `1px solid ${C.divider}`,
            borderRadius: 14,
            width: "fit-content",
            boxShadow: `0 2px 12px ${C.shadow}`,
          }}>
            {[
              { id:"modules",  label:"Modules",         icon:LayoutDashboard },
              { id:"activite", label:"Activité récente", icon:Activity        },
            ].map(tab => (
              <button key={tab.id} className="da-tab" onClick={() => setActiveTab(tab.id)} style={{
                display:"flex", alignItems:"center", gap:8, padding:"9px 22px",
                borderRadius:11, border:"none",
                fontSize:13, fontWeight:700,
                background: activeTab === tab.id
                  ? `linear-gradient(135deg,${C.navy},${C.navyMid})`
                  : "transparent",
                color:     activeTab === tab.id ? "#fff"       : C.textMuted,
                boxShadow: activeTab === tab.id ? `0 4px 18px ${C.navy}30` : "none",
                fontFamily:"'Outfit',sans-serif",
              }}>
                <tab.icon size={14}/>{tab.label}
              </button>
            ))}
          </div>

          {/* ══════════════════════════════════════════════════
              VUE MODULES
          ══════════════════════════════════════════════════ */}
          {activeTab === "modules" && (
            <div className="da-layout" style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:22, alignItems:"start" }}>

              {/* Colonne principale */}
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {sections.map((sec, si) => (
                  <SBox key={si} icon={sec.icon} title={sec.section} color={sec.color} count={String(sec.items.length)} delay={`da-d${Math.min(si + 1, 5)}`}>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(205px,1fr))", gap:7 }}>
                      {sec.items.map((m, mi) => <ModRow key={mi} label={m.label} icon={m.icon} path={m.path} color={sec.color}/>)}
                    </div>
                  </SBox>
                ))}
              </div>

              {/* SIDEBAR */}
              <div className="da-sidebar" style={{ display:"flex", flexDirection:"column", gap:16 }}>

                {/* Carte profil */}
                <div className="da-in da-d1" style={{
                  background: `linear-gradient(148deg,${C.navy} 0%,#0C1E6C 55%,${C.blue} 100%)`,
                  borderRadius: 22,
                  padding: "24px 22px",
                  boxShadow: `0 14px 48px ${C.shadowLg}`,
                  position: "relative", overflow: "hidden",
                }}>
                  {/* Liseré tricolore : Rouge · Jaune · Vert */}
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:4, display:"flex", borderRadius:"22px 22px 0 0" }}>
                    <div style={{ flex:1, background:"#E02020" }}/>
                    <div style={{ flex:1, background:C.gold }}/>
                    <div style={{ flex:1, background:C.green }}/>
                  </div>
                  <div style={{ position:"absolute", top:-28, right:-28, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,.04)", pointerEvents:"none" }}/>

                  <p style={{ fontSize:9.5, color:"rgba(255,255,255,.35)", marginBottom:18, letterSpacing:".22em", textTransform:"uppercase", fontWeight:700, fontFamily:"'Outfit',sans-serif" }}>Votre espace</p>

                  <div style={{ display:"flex", alignItems:"center", gap:13, marginBottom:18 }}>
                    <div style={{ width:52, height:52, borderRadius:16, flexShrink:0, background:`${rStyle.dot}40`, border:"1.5px solid rgba(255,255,255,.18)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 4px 16px rgba(0,0,0,.25)` }}>
                      <span className="da-serif" style={{ fontSize:22, fontWeight:600, fontStyle:"italic", color:"#fff" }}>{initials}</span>
                    </div>
                    <div>
                      <p className="da-serif" style={{ fontWeight:600, fontSize:15, color:"#fff", letterSpacing:"-0.2px" }}>{displayName}</p>
                      <span style={{ display:"inline-block", marginTop:5, background:rStyle.bg, color:rStyle.text, border:`1px solid ${rStyle.border}`, borderRadius:8, padding:"2px 11px", fontSize:10.5, fontWeight:700, fontFamily:"'Outfit',sans-serif" }}>
                        {roleLabel}
                      </span>
                    </div>
                  </div>

                  {user.niveau > 0 && (
                    <div style={{ background:"rgba(255,255,255,.08)", borderRadius:11, padding:"11px 13px", marginBottom:14 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                        <p style={{ fontSize:11, color:"rgba(255,255,255,.45)", fontFamily:"'Outfit',sans-serif" }}>Niveau d'accès</p>
                        <span className="da-serif" style={{ fontSize:13, fontWeight:600, color:C.goldLight }}>{user.niveau}/10</span>
                      </div>
                      <div style={{ height:5, borderRadius:3, background:"rgba(255,255,255,.12)" }}>
                        <div style={{ width:`${user.niveau * 10}%`, height:"100%", background:`linear-gradient(90deg,${C.gold},${C.goldLight})`, borderRadius:3 }}/>
                      </div>
                    </div>
                  )}

                  <div style={{ display:"flex", justifyContent:"space-between", paddingTop:12, borderTop:"1px solid rgba(255,255,255,.1)" }}>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,.4)", fontFamily:"'Outfit',sans-serif" }}>{totalMod} modules</span>
                    <span className="da-serif" style={{ fontSize:11, color:"rgba(255,255,255,.65)", fontWeight:600 }}>{sections.length} sections</span>
                  </div>
                </div>

                {/* Vue Globale (DG) / Accès Rapides (autres) */}
                <div className="da-in da-d2" style={{ background:C.surface, border:`1px solid ${C.divider}`, borderRadius:20, padding:"22px", boxShadow:`0 2px 16px ${C.shadow}` }}>
                  {isDG ? <VueGlobale/> : (
                    <>
                      <SHdr icon={Zap} title="Accès rapides" color={C.gold}/>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                        {qlItems.map((q, i) => <QL key={i} {...q}/>)}
                      </div>
                    </>
                  )}
                </div>

                {/* ONFPP info card */}
                <div className="da-in da-d3" style={{
                  background: `linear-gradient(135deg,${C.goldPale},${C.surface})`,
                  border: `1px solid rgba(212,146,10,.2)`,
                  borderRadius: 20, padding: "18px 20px",
                  boxShadow: `0 2px 14px rgba(212,146,10,.08)`,
                }}>
                  <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:11 }}>
                    <Sparkles size={14} color={C.gold}/>
                    <p className="da-serif" style={{ fontSize:12, fontWeight:600, color:C.textPri }}>Office National de Formation Professionnelle</p>
                  </div>
                  <p style={{ fontSize:11, color:C.textSub, lineHeight:1.75, fontFamily:"'Outfit',sans-serif" }}>
                    Plateforme nationale de suivi et d'évaluation des formations professionnelles en République de Guinée.
                  </p>
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

          {/* ══════════════════════════════════════════════════
              VUE ACTIVITÉ
          ══════════════════════════════════════════════════ */}
          {activeTab === "activite" && (
            <div style={{ maxWidth:760 }}>
              <SBox icon={Activity} title="Activité récente" color={C.blue} delay="da-in da-d0">
                <div style={{ display:"flex", flexDirection:"column" }}>
                  {activity.map((act, i) => (
                    <ActItem key={i} {...act} isLast={i === activity.length - 1}/>
                  ))}
                </div>
              </SBox>

              <div className="da-in da-d2" style={{ background:C.surface, border:`1px solid ${C.divider}`, borderRadius:20, padding:"22px", boxShadow:`0 2px 16px ${C.shadow}`, marginTop:16 }}>
                <SHdr icon={Zap} title="Accès rapides" color={C.gold}/>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {qlItems.map((q, i) => <QL key={i} {...q}/>)}
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