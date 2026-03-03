import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap, BookOpen, ClipboardList, Award, BarChart3,
  Building2, CheckCircle2, Clock, FileText, Briefcase, PieChart,
  AlertTriangle, Package, UserCog, Settings, Layers, Users,
  Bell, CalendarDays, ShieldCheck, MapPin,
  TrendingUp, ArrowRight, Activity,
  LayoutDashboard, ChevronRight, Zap, UserCheck,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   PALETTE — identique NavAdmin
═══════════════════════════════════════════════════════════════ */
const C = {
  bg:         "#F0F4FF",
  surface:    "#FFFFFF",
  surfaceAlt: "#EEF2FF",
  navy:       "#0D1B5E",
  blue:       "#1A3BD4",
  steel:      "#3A6FFF",
  sky:        "#6B9FFF",
  iceBlue:    "#C8D9FF",
  textSub:    "#4A5A8A",
  textMuted:  "#8FA3D8",
  accent:     "#F5A800",
  success:    "#0BA376",
  orange:     "#FF6B35",
  purple:     "#7C3AED",
  danger:     "#E53935",
  shadow:     "rgba(26,59,212,0.10)",
};

/* ═══════════════════════════════════════════════════════════════
   RÔLES MÉTIER ONFPP
   Groupes d'accès :
   - GROUPE_DG  : Chef de Division, Directeur Général, Directeur Général Adjoint → accès total
   - GROUPE_CS  : Chef de Section → accès intermédiaire (≈ DR)
   - GROUPE_CA  : Chef d'Antenne → accès centre (≈ CC)
   - FORMATEUR  : Formateur → accès opérationnel
   - CONSEILLER : Conseiller → lecture + rapports
   - ENTREPRISE : Entreprise → accès offres emploi
═══════════════════════════════════════════════════════════════ */
const ROLE_LABELS = {
  "Directeur Général":          "Directeur Général",
  "Directeur Général Adjoint":  "Directeur Général Adjoint",
  "Chef de Division":           "Chef de Division",
  "Chef de Section":            "Chef de Section",
  "Chef d'Antenne":             "Chef d'Antenne",
  "Formateur":                  "Formateur",
  "Conseiller":                 "Conseiller",
  "Entreprise":                 "Entreprise",
  /* Alias courts (compatibilité backend) */
  DG:         "Directeur Général",
  CD:         "Chef de Division",
  DR:         "Directeur Général Adjoint",
  CC:         "Chef d'Antenne",
  FORMATEUR:  "Formateur",
  SUPERADMIN: "Super Administrateur",
};

const ROLE_COLORS = {
  "Directeur Général":          { bg:"#EEF2FF", text:"#1A3BD4", border:"#C7D2FE" },
  "Directeur Général Adjoint":  { bg:"#EEF2FF", text:"#1A3BD4", border:"#C7D2FE" },
  "Chef de Division":           { bg:"#EEF2FF", text:"#1A3BD4", border:"#C7D2FE" },
  "Chef de Section":            { bg:"#F0FDF4", text:"#15803D", border:"#86EFAC" },
  "Chef d'Antenne":             { bg:"#FFF7ED", text:"#C2410C", border:"#FED7AA" },
  "Formateur":                  { bg:"#F0F9FF", text:"#0369A1", border:"#BAE6FD" },
  "Conseiller":                 { bg:"#FDF4FF", text:"#7C3AED", border:"#E9D5FF" },
  "Entreprise":                 { bg:"#FFFBEB", text:"#D97706", border:"#FDE68A" },
  DG:         { bg:"#EEF2FF", text:"#1A3BD4", border:"#C7D2FE" },
  CD:         { bg:"#EEF2FF", text:"#1A3BD4", border:"#C7D2FE" },
  DR:         { bg:"#EEF2FF", text:"#1A3BD4", border:"#C7D2FE" },
  CC:         { bg:"#FFF7ED", text:"#C2410C", border:"#FED7AA" },
  FORMATEUR:  { bg:"#F0F9FF", text:"#0369A1", border:"#BAE6FD" },
  SUPERADMIN: { bg:"#FFF1F2", text:"#E53935", border:"#FECDD3" },
};

/* Résout le groupe d'accès à partir du nom de rôle */
const resolveGroup = (role) => {
  const GROUPE_DG = ["Directeur Général","Directeur Général Adjoint","Chef de Division","DG","CD","DR","SUPERADMIN"];
  const GROUPE_CS = ["Chef de Section"];
  const GROUPE_CA = ["Chef d'Antenne","CC"];
  const GROUPE_F  = ["Formateur","FORMATEUR"];
  const GROUPE_C  = ["Conseiller"];
  const GROUPE_E  = ["Entreprise"];
  if (GROUPE_DG.includes(role)) return "DG";
  if (GROUPE_CS.includes(role)) return "CS";
  if (GROUPE_CA.includes(role)) return "CA";
  if (GROUPE_F.includes(role))  return "F";
  if (GROUPE_C.includes(role))  return "C";
  if (GROUPE_E.includes(role))  return "E";
  return "DG"; // fallback
};

/* ═══════════════════════════════════════════════════════════════
   buildNavCategories — même logique que NavAdmin, groupes ONFPP
═══════════════════════════════════════════════════════════════ */
const buildNavCategories = (role) => {
  const g = resolveGroup(role);
  // Groupes qui voient chaque section
  const DG_CS    = ["DG","CS"];
  const DG_CS_CA = ["DG","CS","CA"];
  const ALL_OP   = ["DG","CS","CA","F"];
  const ALL      = ["DG","CS","CA","F","C","E"];

  const all = [
    {
      section: "Formations", color: C.steel, icon: BookOpen,
      groups: ALL,
      items: [
        { path:"/formations",    label:"Catalogue formations",  icon:BookOpen,     groups:ALL },
        { path:"/sessions",      label:"Sessions planifiées",   icon:CalendarDays, groups:ALL },
        { path:"/programmes",    label:"Programmes & modules",  icon:Layers,       groups:DG_CS_CA },
        { path:"/certifications",label:"Certifications",        icon:Award,        groups:ALL },
      ]
    },
    {
      section: "Apprenants", color: C.navy, icon: GraduationCap,
      groups: ALL_OP,
      items: [
        { path:"/inscription",    label:"Inscriptions",          icon:GraduationCap, groups:ALL_OP },
        { path:"/apprenants",     label:"Apprenants actifs",     icon:GraduationCap, groups:ALL_OP },
        { path:"/listeCandidats", label:"Inscrits & candidats",  icon:UserCheck,     groups:DG_CS_CA },
        { path:"/validation",     label:"Validation dossiers",   icon:CheckCircle2,  groups:DG_CS_CA },
        { path:"/suivi",          label:"Suivi pédagogique",     icon:ClipboardList, groups:ALL_OP },
        { path:"/suivi",          label:"Insertion",             icon:ClipboardList, groups:ALL_OP },
      ]
    },
    {
      section: "Présences & Notes", color: C.success, icon: ClipboardList,
      groups: ["CA","F"],
      items: [
        { path:"/presences",   label:"Feuilles de présence",  icon:CalendarDays,  groups:["CA","F"] },
        { path:"/evaluations", label:"Notes & évaluations",   icon:Award,         groups:["CA","F"] },
        { path:"/discipline",  label:"Discipline",            icon:AlertTriangle, groups:["CA","F"] },
      ]
    },
    {
      section: "Suivi complet", color: C.success, icon: ClipboardList,
      groups: DG_CS,
      items: [
        { path:"/presences",         label:"Présences",               icon:CalendarDays, groups:DG_CS },
        { path:"/evaluations",       label:"Évaluations",             icon:Award,        groups:DG_CS },
        { path:"/resultats",         label:"Résultats finaux",        icon:CheckCircle2, groups:DG_CS },
        { path:"/attestations",      label:"Attestations PDF",        icon:FileText,     groups:DG_CS },
        { path:"/enquete-insertion", label:"Enquête insertion 3 mois",icon:Clock,        groups:DG_CS },
        { path:"/relances",          label:"Relances automatiques",   icon:Bell,         groups:["DG"] },
      ]
    },
    {
      section: "Fin de session", color: C.accent, icon: CheckCircle2,
      groups: ["CA","F"],
      items: [
        { path:"/resultats",         label:"Résultats finaux",        icon:CheckCircle2, groups:["CA","F"] },
        { path:"/attestations",      label:"Attestations PDF",        icon:FileText,     groups:["CA","F"] },
        { path:"/enquete-insertion", label:"Enquête insertion 3 mois",icon:Clock,        groups:["CA"] },
      ]
    },
    {
      section: "Entreprises", color: C.navy, icon: Briefcase,
      groups: ["DG","CS","E"],
      items: [
        { path:"/entreprises",   label:"Base des entreprises",  icon:Briefcase, groups:["DG","CS","E"] },
        { path:"/offres-emploi", label:"Offres d'emploi",       icon:Package,   groups:["DG","CS","E"] },
      ]
    },
    {
      section: "Rapports", color: C.purple, icon: BarChart3,
      groups: ["DG","CS","CA","C"],
      items: [
        { path:"/statistiques",      label:"Statistiques globales",    icon:PieChart,  groups:["DG"] },
        { path:"/statistiques",      label:"Statistiques de section",  icon:PieChart,  groups:["CS"] },
        { path:"/statistiques",      label:"Statistiques de l'antenne",icon:BarChart3, groups:["CA"] },
        { path:"/statistiques",      label:"Statistiques",             icon:BarChart3, groups:["C"] },
        { path:"/dashboardRegional", label:"Tableau régional",         icon:MapPin,    groups:["DG","CS"] },
        { path:"/rapports",          label:"Rapports & exports",       icon:FileText,  groups:["DG","CS","CA"] },
      ]
    },
    {
      section: "Centres & Équipes", color: C.purple, icon: Building2,
      groups: ["DG","CS"],
      items: [
        { path:"/centresFormation", label:"Antennes de formation",  icon:Building2, groups:["DG","CS"] },
        { path:"/teamMessage",      label:"Équipe & formateurs",    icon:Users,     groups:["DG","CS","CA"] },
        { path:"/partnerPost",      label:"Partenaires",            icon:Package,   groups:["DG"] },
      ]
    },
    {
      section: "Administration", color: C.textSub, icon: Settings,
      groups: ["DG"],
      items: [
        { path:"/utilisateurs", label:"Gestion utilisateurs",  icon:UserCog,  groups:["DG"] },
        { path:"/parametres",   label:"Paramètres système",    icon:Settings, groups:["DG"] },
        { path:"/homePost",     label:"Contenu site public",   icon:Layers,   groups:["DG"] },
      ]
    },
  ];

  return all
    .filter(cat => cat.groups.includes(g))
    .map(cat => ({
      ...cat,
      items: cat.items
        .filter(item => item.groups.includes(g))
        .filter((item, idx, arr) =>
          arr.findIndex(x => x.path === item.path && x.label === item.label) === idx
        ),
    }))
    .filter(cat => cat.items.length > 0);
};

/* ═══════════════════════════════════════════════════════════════
   KPI STATS PAR GROUPE
═══════════════════════════════════════════════════════════════ */
const STATS_BY_GROUP = {
  DG: [
    { label:"Apprenants actifs",   value:"4 832", delta:"+12%",  icon:Users,         color:"#1A3BD4" },
    { label:"Taux de réussite",    value:"87%",   delta:"+3.2%", icon:TrendingUp,    color:"#15803D" },
    { label:"Antennes actives",    value:"24",    delta:"stable",icon:Building2,     color:"#D97706" },
    { label:"Formations en cours", value:"138",   delta:"+8",    icon:BookOpen,      color:"#9333EA" },
  ],
  CS: [
    { label:"Apprenants / section",value:"612",   delta:"+7%",   icon:Users,         color:"#1A3BD4" },
    { label:"Antennes section",    value:"6",     delta:"stable",icon:Building2,     color:"#15803D" },
    { label:"Taux présence",       value:"91%",   delta:"+1.4%", icon:CheckCircle2,  color:"#D97706" },
    { label:"Rapports en attente", value:"3",     delta:"-2",    icon:FileText,      color:"#E11D48" },
  ],
  CA: [
    { label:"Apprenants antenne",  value:"98",    delta:"+4",    icon:Users,         color:"#1A3BD4" },
    { label:"Formateurs actifs",   value:"12",    delta:"stable",icon:UserCog,       color:"#9333EA" },
    { label:"Sessions ce mois",    value:"34",    delta:"+5",    icon:CalendarDays,  color:"#15803D" },
    { label:"Taux d'abandon",      value:"2.1%",  delta:"-0.5%", icon:AlertTriangle, color:"#E11D48" },
  ],
  F: [
    { label:"Mes apprenants",      value:"32",    delta:"stable",icon:Users,         color:"#0369A1" },
    { label:"Séances ce mois",     value:"18",    delta:"+2",    icon:CalendarDays,  color:"#1A3BD4" },
    { label:"Taux présence",       value:"94%",   delta:"+2%",   icon:CheckCircle2,  color:"#15803D" },
    { label:"Évaluations à noter", value:"8",     delta:"+3",    icon:ClipboardList, color:"#D97706" },
  ],
  C: [
    { label:"Dossiers suivis",     value:"47",    delta:"+3",    icon:ClipboardList, color:"#7C3AED" },
    { label:"Formations vues",     value:"23",    delta:"+5",    icon:BookOpen,      color:"#1A3BD4" },
    { label:"Rapports générés",    value:"12",    delta:"+2",    icon:BarChart3,     color:"#15803D" },
    { label:"Alertes",             value:"1",     delta:"stable",icon:AlertTriangle, color:"#D97706" },
  ],
  E: [
    { label:"Offres publiées",     value:"5",     delta:"+1",    icon:Briefcase,     color:"#D97706" },
    { label:"Candidatures reçues", value:"34",    delta:"+8",    icon:Users,         color:"#1A3BD4" },
    { label:"Formations partenaires",value:"3",   delta:"stable",icon:BookOpen,      color:"#15803D" },
    { label:"Contrats actifs",     value:"2",     delta:"+1",    icon:CheckCircle2,  color:"#9333EA" },
  ],
};

/* ═══════════════════════════════════════════════════════════════
   ACTIVITÉ PAR GROUPE
═══════════════════════════════════════════════════════════════ */
const ACTIVITY_BY_GROUP = {
  DG: [
    { text:"Rapport mensuel soumis",    detail:"Antenne de Kindia",          time:"Il y a 8 min"  },
    { text:"Nouvel apprenant inscrit",  detail:"Formation Informatique",     time:"Il y a 22 min" },
    { text:"Alerte taux d'abandon",     detail:"Section de Labé — 4.2%",    time:"Il y a 1h"     },
    { text:"Budget Q3 validé",          detail:"Direction Générale",         time:"Il y a 2h"     },
    { text:"Nouvelle antenne créée",    detail:"Antenne de Mamou",           time:"Hier"          },
  ],
  CS: [
    { text:"Rapport antenne soumis",    detail:"Antenne de Pita",            time:"Il y a 15 min" },
    { text:"Session planifiée",         detail:"Formation Excel — 24 mars",  time:"Il y a 1h"     },
    { text:"Apprenant validé",          detail:"Certification Bureautique",  time:"Il y a 3h"     },
    { text:"Absence signalée",          detail:"Formateur Bah Mamadou",     time:"Hier"          },
  ],
  CA: [
    { text:"Émargement signé",          detail:"Module Python — Salle B2",   time:"Il y a 5 min"  },
    { text:"Apprenant absent",          detail:"Diallo Fatoumata",          time:"Il y a 30 min" },
    { text:"Note saisie",               detail:"Évaluation finale — 17/20", time:"Il y a 2h"     },
    { text:"Incident signalé",          detail:"Problème matériel Salle A",  time:"Hier"          },
  ],
  F: [
    { text:"Séance complétée",          detail:"Module 4 — Python avancé",   time:"Il y a 1h"     },
    { text:"Évaluation soumise",        detail:"Apprenant: Kouyaté Sekou",   time:"Il y a 2h"     },
    { text:"Ressource ajoutée",         detail:"PDF: Algo & Structures",     time:"Il y a 3h"     },
    { text:"Message apprenant",         detail:"Question exercice 3",        time:"Hier"          },
  ],
  C: [
    { text:"Rapport consulté",          detail:"Statistiques nationales",    time:"Il y a 30 min" },
    { text:"Dossier examiné",           detail:"Apprenant: Sylla Ibrahima",  time:"Il y a 2h"     },
    { text:"Recommandation émise",      detail:"Formation Comptabilité",     time:"Hier"          },
  ],
  E: [
    { text:"Offre publiée",             detail:"Technicien Réseau — CDI",    time:"Il y a 1h"     },
    { text:"Candidature reçue",         detail:"Bah Kadiatou — 2 ans exp.",  time:"Il y a 3h"     },
    { text:"Convention signée",         detail:"Partenariat ONFPP 2025",     time:"Hier"          },
  ],
};

/* ═══════════════════════════════════════════════════════════════
   ACCÈS RAPIDES PAR GROUPE
═══════════════════════════════════════════════════════════════ */
const QUICK_BY_GROUP = {
  DG: ["/apprenants","/statistiques","/rapports","/utilisateurs"],
  CS: ["/apprenants","/statistiques","/centresFormation","/rapports"],
  CA: ["/apprenants","/presences","/evaluations","/resultats"],
  F:  ["/apprenants","/presences","/evaluations","/sessions"],
  C:  ["/statistiques","/rapports","/apprenants","/formations"],
  E:  ["/offres-emploi","/entreprises","/formations","/apprenants"],
};
const ALL_QUICK = [
  { path:"/apprenants",      label:"Apprenants",    icon:GraduationCap, color:"#1A3BD4" },
  { path:"/presences",       label:"Présences",     icon:CalendarDays,  color:"#0BA376" },
  { path:"/evaluations",     label:"Évaluations",   icon:Award,         color:"#F5A800" },
  { path:"/statistiques",    label:"Statistiques",  icon:PieChart,      color:"#7C3AED" },
  { path:"/utilisateurs",    label:"Utilisateurs",  icon:UserCog,       color:"#4A5A8A" },
  { path:"/centresFormation",label:"Antennes",      icon:Building2,     color:"#7C3AED" },
  { path:"/resultats",       label:"Résultats",     icon:CheckCircle2,  color:"#F5A800" },
  { path:"/rapports",        label:"Rapports",      icon:BarChart3,     color:"#1A3BD4" },
  { path:"/sessions",        label:"Sessions",      icon:CalendarDays,  color:"#0BA376" },
  { path:"/formations",      label:"Formations",    icon:BookOpen,      color:"#3A6FFF" },
  { path:"/offres-emploi",   label:"Offres emploi", icon:Briefcase,     color:"#D97706" },
  { path:"/entreprises",     label:"Entreprises",   icon:Building2,     color:"#0D1B5E" },
];

/* ═══════════════════════════════════════════════════════════════
   LECTURE VRAI USER — localStorage("user") → JWT decode
═══════════════════════════════════════════════════════════════ */
const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    if (raw) return JSON.parse(raw);
    const token = localStorage.getItem("access");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return {
        username:  payload.username  || payload.email || "Utilisateur",
        role:      payload.role      || "Directeur Général",
        niveau:    payload.niveau    ?? 0,
        region:    payload.region    || null,
        centre:    payload.centre    || null,
        firstName: payload.first_name || null,
        lastName:  payload.last_name  || null,
      };
    }
  } catch { /* ignore */ }
  return { username:"Admin", role:"Directeur Général", niveau:0 };
};

/* ═══════════════════════════════════════════════════════════════
   SOUS-COMPOSANTS — style identique au dashboard précédent
═══════════════════════════════════════════════════════════════ */
const NotifBadge = ({ count }) => count > 0 ? (
  <span style={{ position:"absolute", top:-5, right:-5, background:"#E11D48", color:"#fff", borderRadius:20, fontSize:10, fontWeight:800, padding:"1px 6px", minWidth:18, textAlign:"center" }}>{count}</span>
) : null;

const StatCard = ({ label, value, delta, icon: Icon, color }) => {
  const isPositive = delta?.startsWith("+");
  const isNeutral  = delta === "stable" || delta === "OK";
  const deltaColor = isNeutral ? "#8FA3D8" : isPositive ? "#15803D" : "#E11D48";
  const deltaBg    = isNeutral ? "#EEF2FF" : isPositive ? "#F0FDF4" : "#FFF1F2";
  return (
    <div style={{ background:"#fff", borderRadius:18, padding:"18px 20px", boxShadow:"0 2px 20px rgba(13,27,94,0.07)", display:"flex", flexDirection:"column", gap:10, border:"1px solid #EEF2FF", transition:"transform 0.2s, box-shadow 0.2s", cursor:"default" }}
      onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 8px 32px rgba(13,27,94,0.13)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 2px 20px rgba(13,27,94,0.07)"; }}
    >
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ width:40, height:40, borderRadius:12, background:`${color}18`, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Icon size={20} color={color}/>
        </div>
        <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:deltaBg, color:deltaColor }}>{delta}</span>
      </div>
      <div>
        <p style={{ fontSize:26, fontWeight:800, color:"#0D1B5E", lineHeight:1 }}>{value}</p>
        <p style={{ fontSize:12, color:"#8FA3D8", marginTop:4 }}>{label}</p>
      </div>
    </div>
  );
};

const ModuleCard = ({ label, icon: Icon, path, desc, color }) => (
  <Link to={path || "#"} style={{ textDecoration:"none" }}>
    <div style={{ background:"#FAFBFF", border:"1px solid #EEF2FF", borderLeft:`3px solid ${color}`, borderRadius:14, padding:"13px 15px", display:"flex", alignItems:"center", gap:12, transition:"all 0.18s", cursor:"pointer" }}
      onMouseEnter={e => { e.currentTarget.style.background="#EEF2FF"; e.currentTarget.style.borderColor="#C7D2FE"; e.currentTarget.style.transform="translateX(3px)"; }}
      onMouseLeave={e => { e.currentTarget.style.background="#FAFBFF"; e.currentTarget.style.borderColor="#EEF2FF"; e.currentTarget.style.borderLeft=`3px solid ${color}`; e.currentTarget.style.transform="translateX(0)"; }}
    >
      <div style={{ width:34, height:34, borderRadius:10, flexShrink:0, background:`${color}14`, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Icon size={15} color={color}/>
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:13, fontWeight:700, color:"#0D1B5E", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{label}</p>
        <p style={{ fontSize:11, color:"#8FA3D8", marginTop:2 }}>{desc}</p>
      </div>
      <ChevronRight size={13} color="#C7D2FE"/>
    </div>
  </Link>
);

const SectionBox = ({ icon: Icon, title, color, children }) => (
  <div style={{ background:"#fff", borderRadius:20, padding:20, boxShadow:"0 2px 16px rgba(13,27,94,0.06)", border:"1px solid #EEF2FF" }}>
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
      <div style={{ width:3, height:20, borderRadius:2, background:color }}/>
      <div style={{ width:32, height:32, borderRadius:10, background:`${color}18`, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Icon size={16} color={color}/>
      </div>
      <p style={{ fontSize:14, fontWeight:800, color:"#0D1B5E" }}>{title}</p>
    </div>
    {children}
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
═══════════════════════════════════════════════════════════════ */
const DashboardAdmin = () => {
  const [time, setTime]           = useState(new Date());
  const [notifOpen, setNotifOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("modules");

  /* Vrai user */
  const storedUser  = getStoredUser();
  const role        = storedUser.role || "Directeur Général";
  const niveau      = storedUser.niveau ?? 0;
  const roleLabel   = ROLE_LABELS[role] || role;
  const roleColor   = ROLE_COLORS[role] || ROLE_COLORS["Directeur Général"];
  const group       = resolveGroup(role);

  /* Nom affiché : prénom + nom si dispo, sinon username */
  const displayName = storedUser.firstName
    ? `${storedUser.firstName}${storedUser.lastName ? " " + storedUser.lastName : ""}`
    : storedUser.username || "Admin";

  /* Données par groupe */
  const stats    = STATS_BY_GROUP[group]    || STATS_BY_GROUP.DG;
  const activity = ACTIVITY_BY_GROUP[group] || ACTIVITY_BY_GROUP.DG;
  const sections = buildNavCategories(role);
  const totalModules = sections.reduce((acc, s) => acc + s.items.length, 0);

  /* Accès rapides */
  const quickPaths = QUICK_BY_GROUP[group] || QUICK_BY_GROUP.DG;
  const quickItems = ALL_QUICK.filter(q => quickPaths.includes(q.path));

  /* Notifications */
  const notifs = activity.slice(0, 4).map((a, i) => ({ ...a, read: i > 1 }));
  const unread = notifs.filter(n => !n.read).length;

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(160deg,#F0F4FF 0%,#F8F9FF 100%)",
      fontFamily:"'Syne', 'DM Sans', sans-serif",
      /* navbar fixe = 72px + 20px de respiration */
      padding:"92px 24px 40px",
      boxSizing:"border-box",
    }}>

      {/* ══ HEADER ══ */}
      <div style={{
        background:"linear-gradient(135deg,#0D1B5E 0%,#1A3BD4 60%,#3B5BDB 100%)",
        padding:"28px 32px", borderRadius:24, marginBottom:24, color:"#fff",
        display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:16,
        boxShadow:"0 8px 40px rgba(26,59,212,0.28)",
        position:"relative", overflow:"hidden",
      }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:220, height:220, borderRadius:"50%", background:"rgba(255,255,255,0.05)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", bottom:-60, right:100, width:160, height:160, borderRadius:"50%", background:"rgba(255,255,255,0.04)", pointerEvents:"none" }}/>

        {/* Gauche */}
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:"rgba(255,255,255,0.15)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <LayoutDashboard size={20} color="#fff"/>
            </div>
            <div>
              <p style={{ fontSize:11, opacity:0.6, letterSpacing:2, textTransform:"uppercase" }}>Plateforme ONFPP</p>
              <h1 style={{ fontSize:20, fontWeight:800, lineHeight:1.1 }}>
                Bonjour, {displayName} 👋
              </h1>
            </div>
          </div>

          {/* Badges rôle / localisation */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
            {/* Badge rôle exact */}
            <span style={{
              display:"inline-flex", alignItems:"center", gap:5,
              background:"rgba(255,255,255,0.18)", backdropFilter:"blur(6px)",
              borderRadius:20, padding:"5px 13px", fontSize:12, fontWeight:700,
              border:"1px solid rgba(255,255,255,0.25)",
            }}>
              <ShieldCheck size={12}/> {roleLabel}
            </span>
            {niveau > 0 && (
              <span style={{ fontSize:11, background:"rgba(255,255,255,0.11)", borderRadius:20, padding:"4px 11px", border:"1px solid rgba(255,255,255,0.2)" }}>
                Niveau {niveau}/10
              </span>
            )}
            {storedUser.region && (
              <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:12, opacity:0.8 }}>
                <MapPin size={11}/>{storedUser.region}
              </span>
            )}
            {storedUser.centre && (
              <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:12, opacity:0.8 }}>
                <Building2 size={11}/>{storedUser.centre}
              </span>
            )}
          </div>
        </div>

        {/* Droite — horloge + notifs */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:10 }}>
          <div style={{ textAlign:"right" }}>
            <p style={{ fontSize:28, fontFamily:"'DM Mono','Courier New',monospace", fontWeight:700, letterSpacing:2, lineHeight:1 }}>
              {time.toLocaleTimeString("fr-FR")}
            </p>
            <p style={{ fontSize:12, opacity:0.65, marginTop:4 }}>
              {time.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
            </p>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <span style={{ background:"rgba(255,255,255,0.12)", borderRadius:12, padding:"4px 12px", fontSize:11, border:"1px solid rgba(255,255,255,0.2)" }}>
              <Zap size={10} style={{ marginRight:4 }}/>{totalModules} modules
            </span>
            <div style={{ position:"relative" }}>
              <button onClick={() => setNotifOpen(!notifOpen)} style={{ width:36, height:36, borderRadius:10, background:"rgba(255,255,255,0.18)", border:"1px solid rgba(255,255,255,0.3)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
                <Bell size={16}/>
              </button>
              <NotifBadge count={unread}/>
              {notifOpen && (
                <div style={{ position:"absolute", top:46, right:0, width:280, background:"#fff", borderRadius:16, boxShadow:"0 8px 40px rgba(13,27,94,0.18)", border:"1px solid #EEF2FF", zIndex:999, overflow:"hidden" }}>
                  <div style={{ padding:"14px 16px", borderBottom:"1px solid #EEF2FF", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <p style={{ fontSize:13, fontWeight:800, color:"#0D1B5E" }}>Notifications</p>
                    <span style={{ fontSize:11, color:"#1A3BD4", fontWeight:700 }}>{unread} non lues</span>
                  </div>
                  {notifs.map((n, i) => (
                    <div key={i} style={{ padding:"12px 16px", borderBottom:"1px solid #F5F7FF", background: n.read?"#fff":"#F5F8FF", display:"flex", gap:10, alignItems:"flex-start" }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", flexShrink:0, marginTop:4, background: n.read?"#D1D5DB":"#1A3BD4" }}/>
                      <div>
                        <p style={{ fontSize:12, fontWeight:600, color:"#0D1B5E" }}>{n.text}</p>
                        <p style={{ fontSize:11, color:"#8FA3D8" }}>{n.detail} · {n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══ KPI STATS ══ */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14, marginBottom:24 }}>
        {stats.map((s, i) => <StatCard key={i} {...s}/>)}
      </div>

      {/* ══ ONGLETS ══ */}
      <div style={{ display:"flex", gap:4, marginBottom:18 }}>
        {[
          { id:"modules",  label:"Modules",          icon:LayoutDashboard },
          { id:"activite", label:"Activité récente", icon:Activity },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            display:"flex", alignItems:"center", gap:7, padding:"9px 18px",
            borderRadius:12, border:"none", cursor:"pointer",
            fontFamily:"inherit", fontSize:13, fontWeight:700, transition:"all 0.18s",
            background: activeTab===tab.id ? "#1A3BD4" : "#fff",
            color:       activeTab===tab.id ? "#fff"    : "#8FA3D8",
            boxShadow:   activeTab===tab.id ? "0 4px 16px rgba(26,59,212,0.3)" : "0 1px 4px rgba(13,27,94,0.07)",
          }}>
            <tab.icon size={14}/> {tab.label}
          </button>
        ))}
      </div>

      {/* ══ ONGLET MODULES ══ */}
      {activeTab === "modules" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:20, alignItems:"start" }}>

          {/* Sections modules */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {sections.map((sec, si) => (
              <SectionBox key={si} icon={sec.icon} title={sec.section} color={sec.color}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:8 }}>
                  {sec.items.map((m, mi) => (
                    <ModuleCard key={mi} label={m.label} icon={m.icon} path={m.path} desc={m.desc || ""} color={sec.color}/>
                  ))}
                </div>
              </SectionBox>
            ))}
          </div>

          {/* Sidebar droite */}
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

            {/* Carte profil */}
            <div style={{ background:"#fff", borderRadius:20, padding:20, boxShadow:"0 2px 16px rgba(13,27,94,0.07)", border:"1px solid #EEF2FF" }}>
              <p style={{ fontSize:10, color:"#8FA3D8", marginBottom:12, letterSpacing:1.5, textTransform:"uppercase" }}>Votre espace</p>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
                <div style={{ width:48, height:48, borderRadius:14, background:"linear-gradient(135deg,#0D1B5E,#1A3BD4)", display:"flex", justifyContent:"center", alignItems:"center", boxShadow:"0 4px 16px rgba(26,59,212,0.3)" }}>
                  <ShieldCheck size={22} color="#fff"/>
                </div>
                <div>
                  <p style={{ fontWeight:800, fontSize:14, color:"#0D1B5E" }}>{displayName}</p>
                  <span style={{ display:"inline-block", marginTop:4, background:roleColor.bg, color:roleColor.text, border:`1px solid ${roleColor.border}`, borderRadius:8, padding:"2px 10px", fontSize:11, fontWeight:700 }}>
                    {roleLabel}
                  </span>
                </div>
              </div>
              {niveau > 0 && (
                <div style={{ background:"#F5F7FF", borderRadius:10, padding:"8px 12px", marginBottom:12 }}>
                  <p style={{ fontSize:11, color:"#8FA3D8" }}>Niveau d'accès</p>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:4 }}>
                    <div style={{ flex:1, height:6, borderRadius:3, background:"#EEF2FF", overflow:"hidden" }}>
                      <div style={{ width:`${niveau * 10}%`, height:"100%", background:"linear-gradient(90deg,#1A3BD4,#6B8EF7)", borderRadius:3 }}/>
                    </div>
                    <span style={{ fontSize:11, fontWeight:700, color:"#1A3BD4" }}>{niveau}/10</span>
                  </div>
                </div>
              )}
              <div style={{ display:"flex", justifyContent:"space-between", paddingTop:10, borderTop:"1px solid #EEF2FF" }}>
                <span style={{ fontSize:11, color:"#8FA3D8" }}>{totalModules} modules</span>
                <span style={{ fontSize:11, color:"#1A3BD4", fontWeight:700 }}>{sections.length} sections</span>
              </div>
            </div>

            {/* Accès rapides */}
            <SectionBox icon={Zap} title="Accès rapides" color="#F5A800">
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {quickItems.map((q, i) => {
                  const QIcon = q.icon;
                  return (
                    <Link key={i} to={q.path} style={{ textDecoration:"none" }}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 12px", borderRadius:10, background:"#FAFBFF", border:"1px solid #EEF2FF", cursor:"pointer", transition:"all 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.background="#EEF2FF"; e.currentTarget.style.borderColor="#C7D2FE"; }}
                        onMouseLeave={e => { e.currentTarget.style.background="#FAFBFF"; e.currentTarget.style.borderColor="#EEF2FF"; }}
                      >
                        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                          <div style={{ width:28, height:28, borderRadius:8, background:`${q.color}14`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <QIcon size={13} color={q.color}/>
                          </div>
                          <span style={{ fontSize:12, fontWeight:600, color:"#0D1B5E" }}>{q.label}</span>
                        </div>
                        <ArrowRight size={12} color="#C7D2FE"/>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </SectionBox>
          </div>
        </div>
      )}

      {/* ══ ONGLET ACTIVITÉ ══ */}
      {activeTab === "activite" && (
        <SectionBox icon={Activity} title="Activité récente" color="#1A3BD4">
          <div style={{ display:"flex", flexDirection:"column" }}>
            {activity.map((act, i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"14px 0", borderBottom: i < activity.length - 1 ? "1px solid #F0F4FF" : "none", gap:12 }}>
                <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", flexShrink:0, marginTop:4, background: i < 2 ? "#1A3BD4" : "#D1D5DB" }}/>
                  <div>
                    <p style={{ fontSize:13, fontWeight:700, color:"#0D1B5E" }}>{act.text}</p>
                    <p style={{ fontSize:12, color:"#8FA3D8", marginTop:2 }}>{act.detail}</p>
                  </div>
                </div>
                <span style={{ fontSize:11, color:"#B0C4DE", whiteSpace:"nowrap", background:"#F5F7FF", padding:"3px 10px", borderRadius:20 }}>{act.time}</span>
              </div>
            ))}
          </div>
        </SectionBox>
      )}
    </div>
  );
};

export default DashboardAdmin;