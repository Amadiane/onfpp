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
  RefreshCw, WifiOff,
} from "lucide-react";
import CONFIG from "../../config/config.js";
import { apiRequest } from "../../endpoints/api";

/* ════════════════════════════════════════════════════════
   DESIGN SYSTEM — Sovereign Dark · Institutional Precision
   Import idéal : import { DS, HERO_BG, RS_DARK, RS_LIGHT } from "../design/tokens"
   En attendant, tokens inline ci-dessous (identiques à NavAdmin)
════════════════════════════════════════════════════════ */
const DS = {
  navy:       "#04101F",navyMid:"#081733",navyUp:"#0D2050",
  brand:      "#1A3B8C",brandViv:"#2451B8",brandGlow:"rgba(26,59,140,0.5)",
  electric:   "#3D68FF",sky:"#5B82FF",
  page:       "#F1F3FB",surface:"#FFFFFF",lift:"#F6F8FF",
  iceStrong:  "#C8D4FF",ice:"#DBE5FF",iceFaint:"#EEF2FF",divider:"#E2E8F5",
  textPri:    "#04101F",textSec:"#2C3F7A",textMuted:"#7A90C4",
  gold:       "#B87A00",goldBright:"#E09A00",goldViv:"#F5B020",goldPale:"#FFF6DC",
  green:      "#046048",greenLight:"#0BAF7A",greenPale:"#E2F8F1",
  rose:       "#CC1840",rosePale:"#FDEAEF",
  violet:     "#5A22CC",teal:"#077870",
  sh1:        "rgba(4,16,31,0.07)",sh2:"rgba(4,16,31,0.14)",
  sh3:        "rgba(4,16,31,0.26)",shHero:"rgba(4,16,31,0.65)",
  /* compat anciens noms */
  blue:       "#1A3B8C",blueViv:"#2451B8",
  pageAlt:    "#EBF0FF",surfaceEl:"#F6F8FF",
  shadow:     "rgba(4,16,31,0.07)",shadowMd:"rgba(4,16,31,0.14)",shadowLg:"rgba(4,16,31,0.26)",
  iceBlue:    "#C8D4FF",
};

const HERO_BG = `linear-gradient(148deg, ${DS.navy} 0%, #061228 18%, #091A3E 38%, #0E2258 58%, ${DS.brand} 82%, ${DS.brandViv} 100%)`;

const DIVISION_LABELS = {
  DAP:"Division Apprentissage et Projets Collectifs",
  DSE:"Division Suivi Évaluation",DFC:"Division Formation Continue",DPL:"Division Planification",
};
const ANTENNE_LABELS = {
  conakry:"Conakry",forecariah:"Forecariah",boke:"Boké",kindia:"Kindia",
  labe:"Labé",mamou:"Mamou",faranah:"Faranah",kankan:"Kankan",
  siguiri:"Siguiri",nzerekore:"N'Zérékoré",
};
const ROLE_LABELS = {
  "Directeur Général":"Directeur Général","Directeur Général Adjoint":"DG Adjoint",
  "Chef de Division":"Chef de Division","Chef de Section":"Chef de Section",
  "Chef d'Antenne":"Chef d'Antenne","Conseiller":"Conseiller",
  DG:"Directeur Général",CD:"Chef de Division",DR:"DG Adjoint",
  CC:"Chef d'Antenne",FORMATEUR:"Formateur",SUPERADMIN:"Super Admin",
};

const RS_LIGHT = {
  default:{bg:"#EBF0FF",text:"#1A3B8C",border:"#BCC8FF",dot:"#1A3B8C"},
  "Directeur Général":        {bg:"#EBF0FF",text:"#1A3B8C",border:"#BCC8FF",dot:"#1A3B8C"},
  "Directeur Général Adjoint":{bg:"#EBF0FF",text:"#1A3B8C",border:"#BCC8FF",dot:"#1A3B8C"},
  "Chef de Division":         {bg:"#EBF0FF",text:"#1A3B8C",border:"#BCC8FF",dot:"#1A3B8C"},
  "Chef de Section":          {bg:"#E0F8F1",text:"#046048",border:"#85E0C5",dot:"#0BAF7A"},
  "Chef d'Antenne":           {bg:"#FFF4D6",text:"#7A4F00",border:"#F0CC78",dot:"#B87A00"},
  "Conseiller":               {bg:"#F0EAFF",text:"#5A22CC",border:"#C2ABFA",dot:"#7C45EE"},
  DG:{bg:"#EBF0FF",text:"#1A3B8C",border:"#BCC8FF",dot:"#1A3B8C"},
  CD:{bg:"#EBF0FF",text:"#1A3B8C",border:"#BCC8FF",dot:"#1A3B8C"},
  DR:{bg:"#EBF0FF",text:"#1A3B8C",border:"#BCC8FF",dot:"#1A3B8C"},
  CC:{bg:"#FFF4D6",text:"#7A4F00",border:"#F0CC78",dot:"#B87A00"},
  SUPERADMIN:{bg:"#FDEAEF",text:"#CC1840",border:"#F5AABC",dot:"#E02050"},
};
const RS_DARK = {
  default:{bg:"rgba(93,118,255,.18)",text:"#9AB0FF",border:"rgba(93,118,255,.28)",dot:"#6B8FFF"},
  "Directeur Général":    {bg:"rgba(93,118,255,.18)",text:"#9AB0FF",border:"rgba(93,118,255,.28)",dot:"#6B8FFF"},
  "Chef de Division":     {bg:"rgba(93,118,255,.18)",text:"#9AB0FF",border:"rgba(93,118,255,.28)",dot:"#6B8FFF"},
  "Chef de Section":      {bg:"rgba(11,175,122,.16)",text:"#5AEEC0",border:"rgba(11,175,122,.26)",dot:"#2DD4A0"},
  "Chef d'Antenne":       {bg:"rgba(229,154,0,.15)", text:"#FFD060",border:"rgba(229,154,0,.26)", dot:"#E09A00"},
  "Conseiller":           {bg:"rgba(150,90,255,.16)",text:"#C4AAFF",border:"rgba(150,90,255,.26)",dot:"#AA82FF"},
  DG:{bg:"rgba(93,118,255,.18)",text:"#9AB0FF",border:"rgba(93,118,255,.28)",dot:"#6B8FFF"},
  CD:{bg:"rgba(93,118,255,.18)",text:"#9AB0FF",border:"rgba(93,118,255,.28)",dot:"#6B8FFF"},
  CC:{bg:"rgba(229,154,0,.15)",text:"#FFD060",border:"rgba(229,154,0,.26)",dot:"#E09A00"},
  SUPERADMIN:{bg:"rgba(255,70,90,.15)",text:"#FF9EAC",border:"rgba(255,70,90,.25)",dot:"#FF6070"},
};

const rsL = r => RS_LIGHT[r] || RS_LIGHT.default;
const rsD = r => RS_DARK[r]  || RS_DARK.default;

const resolveGroup = role => {
  if(!role)return"DG"; const r=(role?.name||role||"").toString();
  if(["Directeur Général","DG","SUPERADMIN"].some(x=>r.includes(x)||x===r)){
    if(r.includes("Division")||r==="CD")return"CS"; return"DG";
  }
  if(r.includes("Section"))return"CS";
  if(r.includes("Antenne")||r==="CC")return"CA";
  if(r.includes("Formateur")||r==="FORMATEUR")return"F";
  if(r.includes("Conseiller"))return"C";
  return"DG";
};
const getRoleName=role=>{if(!role)return"Directeur Général";if(typeof role==="object")return role.name||"Directeur Général";return role;};
const getRoleLevel=role=>{if(!role)return 100;if(typeof role==="object")return role.level||0;return 0;};

/* ═════════ NAV CATEGORIES ═════════ */
const buildNavCategories = role => {
  const g=resolveGroup(role);
  const DG_CS=["DG","CS"],DG_CS_CA=["DG","CS","CA"],ALL_OP=["DG","CS","CA","F"],ALL=["DG","CS","CA","F","C","E"];
  const all=[
    {section:"Formations",color:DS.brand,icon:BookOpen,groups:ALL,items:[
      {path:"/formations",label:"Catalogue formations",icon:BookOpen,groups:ALL},
      {path:"/sessions",label:"Sessions planifiées",icon:CalendarDays,groups:ALL},
      {path:"/programmes",label:"Programmes & modules",icon:Layers,groups:DG_CS_CA},
      {path:"/certifications",label:"Certifications",icon:Award,groups:ALL},
    ]},
    {section:"Apprenants",color:"#0891B2",icon:GraduationCap,groups:ALL_OP,items:[
      {path:"/inscription",label:"Inscriptions",icon:GraduationCap,groups:ALL_OP},
      {path:"/apprenants",label:"Apprenants actifs",icon:GraduationCap,groups:ALL_OP},
      {path:"/listeCandidats",label:"Inscrits & candidats",icon:UserCheck,groups:DG_CS_CA},
      {path:"/validation",label:"Validation dossiers",icon:CheckCircle2,groups:DG_CS_CA},
      {path:"/suivi",label:"Suivi pédagogique",icon:ClipboardList,groups:ALL_OP},
      {path:"/insertion",label:"Insertion",icon:ClipboardList,groups:ALL_OP},
    ]},
    {section:"Présences & Notes",color:DS.green,icon:ClipboardList,groups:["CA","F"],items:[
      {path:"/presences",label:"Feuilles de présence",icon:CalendarDays,groups:["CA","F"]},
      {path:"/evaluations",label:"Notes & évaluations",icon:Award,groups:["CA","F"]},
      {path:"/discipline",label:"Discipline",icon:AlertTriangle,groups:["CA","F"]},
    ]},
    {section:"Suivi complet",color:DS.green,icon:ClipboardList,groups:DG_CS,items:[
      {path:"/presences",label:"Présences",icon:CalendarDays,groups:DG_CS},
      {path:"/evaluations",label:"Évaluations",icon:Award,groups:DG_CS},
      {path:"/resultats",label:"Résultats finaux",icon:CheckCircle2,groups:DG_CS},
      {path:"/attestations",label:"Attestations PDF",icon:FileText,groups:DG_CS},
      {path:"/enquete-insertion",label:"Enquête insertion",icon:Clock,groups:DG_CS},
      {path:"/relances",label:"Relances automatiques",icon:Bell,groups:["DG"]},
    ]},
    {section:"Fin de session",color:DS.gold,icon:CheckCircle2,groups:["CA","F"],items:[
      {path:"/resultats",label:"Résultats finaux",icon:CheckCircle2,groups:["CA","F"]},
      {path:"/attestations",label:"Attestations PDF",icon:FileText,groups:["CA","F"]},
      {path:"/enquete-insertion",label:"Enquête insertion",icon:Clock,groups:["CA"]},
    ]},
    {section:"Entreprises",color:"#A05000",icon:Briefcase,groups:["DG","CS","E"],items:[
      {path:"/entreprises",label:"Base des entreprises",icon:Briefcase,groups:["DG","CS","E"]},
      {path:"/offres-emploi",label:"Offres d'emploi",icon:Package,groups:["DG","CS","E"]},
    ]},
    {section:"Rapports",color:DS.violet,icon:BarChart3,groups:["DG","CS","CA","C"],items:[
      {path:"/statistiques",label:"Statistiques globales",icon:PieChart,groups:["DG"]},
      {path:"/statistiques",label:"Statistiques de section",icon:PieChart,groups:["CS"]},
      {path:"/statistiques",label:"Statistiques antenne",icon:BarChart3,groups:["CA"]},
      {path:"/statistiques",label:"Statistiques",icon:BarChart3,groups:["C"]},
      {path:"/dashboardRegional",label:"Tableau régional",icon:MapPin,groups:["DG","CS"]},
      {path:"/rapports",label:"Rapports & exports",icon:FileText,groups:["DG","CS","CA"]},
    ]},
    {section:"Centres & Équipes",color:"#4338CA",icon:Building2,groups:["DG","CS"],items:[
      {path:"/centresFormation",label:"Antennes de formation",icon:Building2,groups:["DG","CS"]},
      {path:"/teamMessage",label:"Équipe & formateurs",icon:Users,groups:["DG","CS","CA"]},
      {path:"/partnerPost",label:"Partenaires",icon:Package,groups:["DG"]},
    ]},
    {section:"Administration",color:"#374B8A",icon:Settings,groups:["DG"],items:[
      {path:"/utilisateurs",label:"Gestion utilisateurs",icon:UserCog,groups:["DG"]},
      {path:"/parametres",label:"Paramètres système",icon:Settings,groups:["DG"]},
      {path:"/homePost",label:"Contenu site public",icon:Layers,groups:["DG"]},
    ]},
  ];
  return all
    .filter(c=>c.groups.includes(g))
    .map(c=>({...c,items:c.items.filter(i=>i.groups.includes(g)).filter((i,idx,a)=>a.findIndex(x=>x.path===i.path&&x.label===i.label)===idx)}))
    .filter(c=>c.items.length>0);
};

const getStoredUser=()=>{
  try{
    const raw=localStorage.getItem("user");
    if(raw){const p=JSON.parse(raw);return{username:p.username||p.email||"",firstName:p.first_name||p.firstName||null,lastName:p.last_name||p.lastName||null,role:p.role||"Directeur Général",niveau:p.niveau??0,division:p.division||null,antenne:p.antenne||null};}
    const tok=localStorage.getItem("access");
    if(tok){const p=JSON.parse(atob(tok.split(".")[1]));return{username:p.username||p.email||"",firstName:p.first_name||null,lastName:p.last_name||null,role:p.role||"Directeur Général",niveau:p.niveau??0,division:p.division||null,antenne:p.antenne||null};}
  }catch{}
  return{username:"Admin",role:"Directeur Général",niveau:0};
};

function useDashData(){
  const[data,setData]=useState(null);const[loading,setLoading]=useState(true);const[error,setError]=useState(false);
  const load=useCallback(async()=>{
    setLoading(true);setError(false);
    try{
      const[dr,ur]=await Promise.allSettled([apiRequest("/api/dashboard/"),apiRequest(CONFIG.API_USER_LIST)]);
      setData({dash:dr.status==="fulfilled"?dr.value:null,users:ur.status==="fulfilled"&&Array.isArray(ur.value)?ur.value:[]});
    }catch{setError(true);}finally{setLoading(false);}
  },[]);
  useEffect(()=>{load();},[load]);
  return{data,loading,error,refetch:load};
}

/* ════════════════════════════════════════════════════════
   CSS — Sovereign Dark · Sora + Fraunces
════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,700;1,9..144,400;1,9..144,600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
.da{font-family:'Sora',sans-serif;-webkit-font-smoothing:antialiased;}
.da-f{font-family:'Fraunces',serif!important;}

/* ── Dot grid page ── */
.da-page::before{
  content:'';position:fixed;inset:0;pointer-events:none;z-index:0;
  background-image:radial-gradient(circle at 1px 1px, rgba(26,59,140,.038) 1.2px, transparent 0);
  background-size:30px 30px;
}

/* ── KPI lift ── */
.da-kpi{
  transition:transform .28s cubic-bezier(.34,1.5,.64,1), box-shadow .28s;
  cursor:default;
}
.da-kpi:hover{
  transform:translateY(-8px) scale(1.015);
  box-shadow:0 32px 64px var(--kglow),0 8px 24px rgba(4,16,31,.1)!important;
}

/* ── Section card ── */
.da-sec{transition:box-shadow .2s, border-color .2s;}
.da-sec:hover{
  box-shadow:0 14px 50px rgba(4,16,31,.1)!important;
  border-color:rgba(26,59,140,.2)!important;
}

/* ── Module row ── */
.da-mod{transition:background .16s, border-left-color .18s, padding-left .22s cubic-bezier(.34,1.3,.64,1);}
.da-mod:hover{background:#EEF2FF!important;border-left-color:var(--mc)!important;padding-left:20px!important;}
.da-mod:hover .da-arr{transform:translateX(5px);opacity:1!important;}

/* ── Quick link ── */
.da-ql{transition:all .2s cubic-bezier(.34,1.2,.64,1);}
.da-ql:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(4,16,31,.12)!important;border-color:${DS.iceStrong}!important;}

/* ── Tab ── */
.da-tab{transition:all .18s ease;cursor:pointer;}
.da-tab:hover:not(.da-tab-active){background:${DS.iceFaint}!important;color:${DS.textSec}!important;}

/* ── Table row ── */
.da-urow{transition:background .12s;}
.da-urow:hover{background:#EEF2FF!important;}

/* ── Notif item ── */
.da-ni{transition:background .12s;}
.da-ni:hover{background:${DS.iceFaint}!important;}

/* ── Refresh icon ── */
.da-refr{transition:transform .35s cubic-bezier(.34,1.5,.64,1);}
.da-refr:hover{transform:rotate(180deg);}

/* ════ ANIMATIONS ════ */
@keyframes daUp{from{opacity:0;transform:translateY(22px) scale(.982)}to{opacity:1;transform:none}}
.da-in{animation:daUp .48s cubic-bezier(.16,1,.3,1) both;}
.da-d0{animation-delay:0s}.da-d1{animation-delay:.08s}.da-d2{animation-delay:.16s}
.da-d3{animation-delay:.24s}.da-d4{animation-delay:.32s}.da-d5{animation-delay:.4s}

@keyframes daBadge{0%,100%{box-shadow:0 0 0 0 rgba(204,24,64,.6)}65%{box-shadow:0 0 0 8px rgba(204,24,64,0)}}
.da-badge{animation:daBadge 2.6s ease infinite;}

@keyframes daBar{from{width:0}to{width:var(--bw)}}
.da-bar{animation:daBar 1.2s cubic-bezier(.16,1,.3,1) both;}

@keyframes daBlink{0%,49%{opacity:1}50%,100%{opacity:.15}}
.da-blink{animation:daBlink 1s step-end infinite;}

@keyframes daDrop{from{opacity:0;transform:translateY(-10px) scale(.97)}to{opacity:1;transform:none}}
.da-notif{animation:daDrop .2s cubic-bezier(.16,1,.3,1) both;}

@keyframes daOrb{0%,100%{opacity:.55;transform:scale(1) translate(0,0)}50%{opacity:.8;transform:scale(1.1) translate(-10px,-16px)}}
.da-orb{animation:daOrb 11s ease-in-out infinite;}

@keyframes daSpin{to{transform:rotate(360deg)}}
.da-spin{animation:daSpin .7s linear infinite;}

@keyframes daLive{0%,100%{box-shadow:0 0 0 0 rgba(11,175,122,.45)}55%{box-shadow:0 0 0 7px rgba(11,175,122,0)}}
.da-live{animation:daLive 2.2s ease infinite;}

@keyframes daSkelShim{0%{background-position:200% 0}100%{background-position:-200% 0}}

/* ════ RESPONSIVE ════ */
@media(max-width:1200px){.da-layout{grid-template-columns:1fr!important;}.da-rsb{display:none!important;}}
@media(max-width:780px){.da-kgrid{grid-template-columns:1fr 1fr!important;}.da-hero-in{flex-direction:column!important;gap:22px!important;}.da-hero-r{align-items:flex-start!important;}.da{padding:62px 14px 52px!important;}}
@media(max-width:480px){.da-kgrid{grid-template-columns:1fr!important;}}
`;

/* ═════════════════════ SOUS-COMPOSANTS ═════════════════════ */

const Skel=({w="100%",h=18,r=8})=>(
  <div style={{width:w,height:h,borderRadius:r,background:`linear-gradient(90deg,${DS.lift} 25%,${DS.divider} 50%,${DS.lift} 75%)`,backgroundSize:"400% 100%",animation:"daSkelShim 1.5s ease infinite"}}/>
);

/* KPI Card — barre accent couleur en haut + orbe */
const KpiCard=({label,value,trend,up,icon:Icon,color,sub,delay=0,loading=false})=>{
  const flat=up===null;
  const tC=flat?DS.textMuted:up?DS.green:DS.rose;
  const tBg=flat?DS.lift:up?DS.greenPale:DS.rosePale;
  const TI=flat?null:up?TrendingUp:TrendingDown;
  return(
    <div className={`da-kpi da-in da-d${delay}`} style={{
      "--kglow":`${color}30`,
      background:DS.surface,borderRadius:20,padding:"22px 20px",
      border:`1px solid ${DS.divider}`,
      boxShadow:`0 2px 18px ${DS.sh1}, inset 0 0 0 1px rgba(255,255,255,.7)`,
      display:"flex",flexDirection:"column",gap:16,position:"relative",overflow:"hidden",
    }}>
      {/* Barre couleur haut */}
      <div style={{position:"absolute",top:0,left:0,right:0,height:3,borderRadius:"20px 20px 0 0",background:`linear-gradient(90deg,${color},${color}55)`}}/>
      {/* Orbe décorative */}
      <div style={{position:"absolute",bottom:-32,right:-32,width:110,height:110,borderRadius:"50%",background:`${color}09`,pointerEvents:"none"}}/>
      {/* Ligne diagonale subtile */}
      <div style={{position:"absolute",top:0,right:0,width:1,height:"100%",background:`linear-gradient(180deg,${color}18,transparent)`,pointerEvents:"none"}}/>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",position:"relative"}}>
        <div style={{
          width:48,height:48,borderRadius:14,
          background:`linear-gradient(140deg,${color}16,${color}08)`,
          border:`1.5px solid ${color}20`,
          display:"flex",alignItems:"center",justifyContent:"center",
          boxShadow:`0 4px 18px ${color}16`,
        }}>
          <Icon size={21} color={color}/>
        </div>
        {loading?<Skel w={58} h={22} r={11}/>:(
          <span style={{
            display:"flex",alignItems:"center",gap:4,
            fontSize:11,fontWeight:600,padding:"4px 11px",
            borderRadius:20,background:tBg,color:tC,
            border:`1px solid ${tC}18`,
          }}>
            {TI&&<TI size={9}/>}{trend==="—"?"stable":trend}
          </span>
        )}
      </div>
      <div style={{position:"relative"}}>
        {loading?(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <Skel w="58%" h={32} r={5}/><Skel w="78%" h={13} r={5}/><Skel w="48%" h={11} r={5}/>
          </div>
        ):(
          <>
            <p className="da-f" style={{fontSize:32,fontWeight:700,color:DS.textPri,lineHeight:1,letterSpacing:"-1.2px"}}>{value}</p>
            <p style={{fontSize:12,color:DS.textSec,marginTop:7,fontWeight:500}}>{label}</p>
            <p style={{fontSize:11,color:DS.textMuted,marginTop:3}}>{sub}</p>
          </>
        )}
      </div>
    </div>
  );
};

/* Section header avec trait couleur et icône */
const SHdr=({icon:Icon,title,color,count,badge})=>(
  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
    <div style={{width:4,height:24,borderRadius:2,background:color,flexShrink:0}}/>
    <div style={{
      width:32,height:32,borderRadius:9,
      background:`${color}12`,border:`1.5px solid ${color}20`,
      display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
    }}>
      <Icon size={14} color={color}/>
    </div>
    <p className="da-f" style={{flex:1,fontSize:13,fontWeight:600,color:DS.textPri,letterSpacing:"-.1px"}}>{title}</p>
    {badge&&<span style={{fontSize:10,fontWeight:700,color:"#fff",background:DS.rose,borderRadius:20,padding:"2px 8px"}}>{badge}</span>}
    {count&&<span style={{fontSize:10,fontWeight:700,color,background:`${color}10`,border:`1px solid ${color}20`,borderRadius:20,padding:"2px 9px"}}>{count}</span>}
  </div>
);

/* Module row — carte cliquable avec icône + flèche */
const ModRow=({label,icon:Icon,path,color})=>(
  <Link to={path||"#"} style={{textDecoration:"none"}}>
    <div className="da-mod" style={{
      "--mc":color,
      background:DS.lift,border:`1px solid ${DS.divider}`,
      borderLeft:"3px solid transparent",borderRadius:10,
      padding:"10px 13px",display:"flex",alignItems:"center",gap:10,
    }}>
      <div style={{width:28,height:28,borderRadius:8,flexShrink:0,background:`${color}10`,border:`1px solid ${color}1A`,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <Icon size={12} color={color}/>
      </div>
      <p style={{flex:1,fontSize:12,fontWeight:500,color:DS.textSec,minWidth:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{label}</p>
      <ChevronRight className="da-arr" size={12} color={DS.textMuted} style={{flexShrink:0,opacity:.3,transition:"all .2s"}}/>
    </div>
  </Link>
);

/* Section box wrapper */
const SBox=({icon,title,color,children,count,delay="da-d1",badge})=>(
  <div className={`da-sec da-in ${delay}`} style={{
    background:DS.surface,borderRadius:20,padding:"20px",
    border:`1px solid ${DS.divider}`,
    boxShadow:`0 2px 16px ${DS.sh1}`,
  }}>
    <SHdr icon={icon} title={title} color={color} count={count} badge={badge}/>
    {children}
  </div>
);

/* Quick link */
const QL=({path,label,icon:Icon,color})=>(
  <Link to={path||"#"} style={{textDecoration:"none",flex:"1 1 calc(50% - 5px)",minWidth:0}}>
    <div className="da-ql" style={{
      display:"flex",alignItems:"center",gap:9,padding:"11px 12px",
      borderRadius:12,background:DS.lift,border:`1px solid ${DS.divider}`,cursor:"pointer",
      boxShadow:`0 2px 8px ${DS.sh1}`,
    }}>
      <div style={{width:30,height:30,borderRadius:9,background:`${color}12`,border:`1px solid ${color}1C`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <Icon size={13} color={color}/>
      </div>
      <span style={{fontSize:12,fontWeight:500,color:DS.textSec,flex:1,minWidth:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{label}</span>
      <ArrowUpRight size={10} color={DS.textMuted} style={{flexShrink:0,opacity:.5}}/>
    </div>
  </Link>
);

/* Scope banner */
const ScopeBanner=({division,antenne,niveau})=>{
  if(niveau>=90)return null;
  const isDiv=division&&[70,60].includes(niveau);
  const isAnt=antenne&&[50,30].includes(niveau);
  if(!isDiv&&!isAnt)return null;
  const lbl=isDiv?`Division — ${DIVISION_LABELS[division]||division}`:`Antenne — ${ANTENNE_LABELS[antenne]||antenne}`;
  const color=isDiv?DS.brand:"#0891B2"; const icon=isDiv?"🏢":"📍";
  return(
    <div className="da-in da-d0" style={{
      background:`linear-gradient(90deg,${color}07,${color}03)`,
      border:`1px solid ${color}25`,borderLeft:`4px solid ${color}`,
      borderRadius:14,padding:"14px 20px",marginBottom:18,
      display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,
    }}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:36,height:36,borderRadius:10,background:`${color}12`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{icon}</div>
        <div>
          <p style={{fontSize:9.5,fontWeight:700,color,letterSpacing:".14em",textTransform:"uppercase"}}>Votre périmètre</p>
          <p style={{fontSize:14,fontWeight:700,color:DS.textPri,marginTop:3}}>{lbl}</p>
        </div>
      </div>
      <span style={{fontSize:11,fontWeight:600,color,background:`${color}10`,border:`1px solid ${color}20`,borderRadius:20,padding:"4px 14px"}}>Accès restreint</span>
    </div>
  );
};

/* Users table */
const UsersTable=({users,loading})=>{
  const NB={100:{bg:"#FEF3C7",text:"#78350F"},90:{bg:"#EDE9FE",text:"#4C1D95"},70:{bg:"#DBEAFE",text:"#1E3A8A"},60:{bg:"#D1FAE5",text:"#064E3B"},50:{bg:"#FFE4E6",text:"#881337"},30:{bg:"#EEF2FF",text:"#312E81"}};
  return(
    <div style={{overflowX:"auto",borderRadius:14,border:`1px solid ${DS.divider}`}}>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead>
          <tr style={{background:DS.lift,borderBottom:`1.5px solid ${DS.divider}`}}>
            {["Utilisateur","Rôle","Affectation","Statut"].map(h=>(
              <th key={h} style={{textAlign:"left",padding:"11px 16px",fontSize:9.5,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:DS.textMuted}}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading?Array(3).fill(0).map((_,i)=>(
            <tr key={i} style={{borderBottom:`1px solid ${DS.divider}`}}>
              {[1,2,3,4].map(j=><td key={j} style={{padding:"14px 16px"}}><Skel h={13} r={5}/></td>)}
            </tr>
          )):users.slice(0,8).map((u,i)=>{
            const lv=u.role?.level; const nb=NB[lv]||{bg:DS.ice,text:DS.navy};
            const roleName=u.role?.name||"—";
            const ini=(u.first_name?.[0]||u.username?.[0]||"?").toUpperCase();
            return(
              <tr key={u.id} className="da-urow" style={{borderBottom:i<users.length-1?`1px solid ${DS.divider}`:"none"}}>
                <td style={{padding:"12px 16px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:32,height:32,borderRadius:9,background:nb.bg,border:`1.5px solid ${nb.text}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:nb.text,flexShrink:0}}>{ini}</div>
                    <div>
                      <p style={{margin:0,fontWeight:600,fontSize:12.5,color:DS.textPri}}>{u.username}</p>
                      <p style={{margin:0,fontSize:11,color:DS.textMuted}}>{u.first_name} {u.last_name}</p>
                    </div>
                  </div>
                </td>
                <td style={{padding:"12px 16px"}}>
                  <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:999,fontSize:11,fontWeight:600,background:nb.bg,color:nb.text}}>
                    <span style={{width:5,height:5,borderRadius:"50%",background:nb.text}}/>{roleName}
                  </span>
                </td>
                <td style={{padding:"12px 16px",fontSize:11.5,color:DS.textSec}}>
                  {u.division&&<span style={{display:"inline-block",background:`${DS.brand}0E`,color:DS.brand,borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:600,marginRight:4}}>🏢 {u.division}</span>}
                  {u.antenne&&<span style={{display:"inline-block",background:"#0891B20E",color:"#0891B2",borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:600}}>📍 {ANTENNE_LABELS[u.antenne]||u.antenne}</span>}
                  {!u.division&&!u.antenne&&<span style={{color:DS.textMuted}}>—</span>}
                </td>
                <td style={{padding:"12px 16px"}}>
                  <span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11,fontWeight:600,color:u.is_active!==false?DS.green:DS.rose}}>
                    <span style={{width:6,height:6,borderRadius:"50%",background:u.is_active!==false?DS.green:DS.rose}}/>
                    {u.is_active!==false?"Actif":"Inactif"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!loading&&users.length===0&&(
        <div style={{textAlign:"center",padding:"40px 0",color:DS.textMuted}}>
          <div style={{fontSize:36,marginBottom:8}}>👥</div>
          <p style={{fontWeight:600,fontSize:13}}>Aucun utilisateur dans votre périmètre</p>
        </div>
      )}
    </div>
  );
};

/* ═════════════════════ COMPOSANT PRINCIPAL ═════════════════════ */
const DashboardAdmin=()=>{
  const[time,setTime]=useState(new Date());
  const[notifOpen,setNotifOpen]=useState(false);
  const[activeTab,setActiveTab]=useState("modules");
  const[notifPos,setNotifPos]=useState({top:0,right:0});
  const bellRef=useRef(null);

  const user=getStoredUser();
  const roleName=getRoleName(user.role);
  const roleLevel=getRoleLevel(user.role)||user.niveau||0;
  const roleLabel=ROLE_LABELS[roleName]||roleName;
  const rD=rsD(roleName);
  const group=resolveGroup(roleName);

  const displayName=user.firstName?`${user.firstName}${user.lastName?" "+user.lastName:""}`:user.username||"Admin";
  const initials=displayName.split(" ").filter(Boolean).map(w=>w[0]).slice(0,2).join("").toUpperCase()||"?";

  const sections=buildNavCategories(roleName);
  const totalMod=sections.reduce((a,s)=>a+s.items.length,0);
  const isDG=group==="DG"&&roleLevel>=90;

  const{data:apiData,loading:apiLoad,error:apiErr,refetch}=useDashData();
  const dash=apiData?.dash||null;
  const users=apiData?.users||[];

  const buildKpis=()=>{
    const tot=users.length, act=users.filter(u=>u.is_active!==false).length;
    const uDiv=[...new Set(users.map(u=>u.division).filter(Boolean))].length;
    const uAnt=[...new Set(users.map(u=>u.antenne).filter(Boolean))].length;
    if(roleLevel>=90)return[
      {label:"Utilisateurs actifs",value:act.toString(),trend:"+",up:true,icon:Users,color:DS.brand,sub:`${tot} enregistrés`,delay:1},
      {label:"Divisions couvertes",value:uDiv.toString(),trend:"—",up:null,icon:Building2,color:DS.goldBright,sub:"divisions actives",delay:2},
      {label:"Antennes",value:uAnt.toString(),trend:"—",up:null,icon:MapPin,color:DS.green,sub:"antennes enregistrées",delay:3},
      {label:"Périmètre",value:"Global",trend:"—",up:null,icon:Globe,color:DS.violet,sub:"accès complet plateforme",delay:4},
    ];
    if([70,60].includes(roleLevel)){const d=user.division||dash?.ma_division;return[
      {label:"Membres division",value:tot.toString(),trend:"—",up:null,icon:Users,color:DS.brand,sub:`div. ${d||"—"}`,delay:1},
      {label:"Membres actifs",value:act.toString(),trend:"—",up:null,icon:CheckCircle2,color:DS.green,sub:"comptes actifs",delay:2},
      {label:"Ma division",value:d||"—",trend:"—",up:null,icon:Building2,color:DS.goldBright,sub:DIVISION_LABELS[d]||"—",delay:3},
      {label:"Antennes liées",value:uAnt.toString(),trend:"—",up:null,icon:MapPin,color:DS.violet,sub:"dans votre division",delay:4},
    ];}
    if([50,30].includes(roleLevel)){const a=user.antenne||dash?.mon_antenne;return[
      {label:"Membres antenne",value:tot.toString(),trend:"—",up:null,icon:Users,color:DS.brand,sub:`antenne ${ANTENNE_LABELS[a]||a||"—"}`,delay:1},
      {label:"Membres actifs",value:act.toString(),trend:"—",up:null,icon:CheckCircle2,color:DS.green,sub:"comptes actifs",delay:2},
      {label:"Mon antenne",value:ANTENNE_LABELS[a]||a||"—",trend:"—",up:null,icon:MapPin,color:DS.goldBright,sub:"votre périmètre",delay:3},
      {label:"Votre rôle",value:roleLabel,trend:"—",up:null,icon:ShieldCheck,color:DS.violet,sub:`niveau ${roleLevel}`,delay:4},
    ];}
    return[
      {label:"Mon espace",value:displayName,trend:"—",up:null,icon:Users,color:DS.brand,sub:roleLabel,delay:1},
      {label:"Niveau",value:roleLevel.toString(),trend:"—",up:null,icon:ShieldCheck,color:DS.goldBright,sub:"niveau d'accès",delay:2},
    ];
  };

  const kpis=buildKpis();
  const recentUsers=[...users].sort((a,b)=>new Date(b.date_joined||0)-new Date(a.date_joined||0)).slice(0,5).map(u=>({
    text:`${u.username} — compte enregistré`,
    detail:`${u.role?.name||"—"} · ${u.division?`Division ${u.division}`:u.antenne?`Antenne ${ANTENNE_LABELS[u.antenne]||u.antenne}`:"Accès global"}`,
    time:u.date_joined?new Date(u.date_joined).toLocaleDateString("fr-FR"):"Récemment",
    color:DS.brand,
  }));

  const tabs=[
    {id:"modules",label:"Modules",icon:LayoutDashboard},
    {id:"activite",label:"Utilisateurs",icon:Users},
    {id:"statistiques",label:"Mon périmètre",icon:Activity},
  ];

  useEffect(()=>{const t=setInterval(()=>setTime(new Date()),1000);return()=>clearInterval(t);},[]);
  useEffect(()=>{
    if(!notifOpen)return;
    const h=e=>{if(bellRef.current&&!bellRef.current.contains(e.target))setNotifOpen(false);};
    document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);
  },[notifOpen]);

  const openNotif=()=>{
    if(bellRef.current){const r=bellRef.current.getBoundingClientRect();setNotifPos({top:r.bottom+10,right:window.innerWidth-r.right});}
    setNotifOpen(v=>!v);
  };

  const hh=String(time.getHours()).padStart(2,"0");
  const mm=String(time.getMinutes()).padStart(2,"0");
  const ss=String(time.getSeconds()).padStart(2,"0");
  const greeting=time.getHours()<12?"Bonjour":time.getHours()<18?"Bon après-midi":"Bonsoir";
  const dateStr=time.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  const userDivision=user.division||dash?.ma_division||null;
  const userAntenne=user.antenne||dash?.mon_antenne||null;
  const unread=Math.min(recentUsers.length,3);

  return(
    <>
      <style>{CSS}</style>
      <div className="da da-page" style={{
        minHeight:"100vh",
        background:`radial-gradient(ellipse 120% 55% at 65% -5%, rgba(26,59,140,.07) 0%, transparent 60%), ${DS.page}`,
        padding:"62px 28px 60px",
        position:"relative",
      }}>

        {/* Aurora page (fixe, subtile) */}
        <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",overflow:"hidden"}}>
          <div className="da-orb" style={{
            position:"absolute",top:"-6%",right:"10%",
            width:580,height:580,borderRadius:"50%",
            background:"radial-gradient(circle,rgba(26,59,140,.065) 0%,transparent 68%)",
            filter:"blur(32px)",
          }}/>
          <div style={{
            position:"absolute",bottom:"8%",left:"5%",
            width:420,height:420,borderRadius:"50%",
            background:"radial-gradient(circle,rgba(4,96,72,.04) 0%,transparent 70%)",
            filter:"blur(38px)",
          }}/>
        </div>

        <div style={{position:"relative",zIndex:1}}>

          {/* ══════════════════════════════════════════════════
              HERO — même HERO_BG que la sidebar
              Tricolore Guinée + grille + orbes
          ═══════════════════════════════════════════════════ */}
          <div className="da-in da-d0" style={{
            background:HERO_BG,
            borderRadius:26,marginBottom:14,
            padding:"32px 44px",
            boxShadow:`0 24px 70px ${DS.shHero}, inset 0 1px 0 rgba(255,255,255,.08)`,
            position:"relative",overflow:"hidden",
          }}>
            {/* Décors hero */}
            <div style={{position:"absolute",inset:0,borderRadius:26,overflow:"hidden",pointerEvents:"none"}}>
              {/* Micro-grille */}
              <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:.07}} xmlns="http://www.w3.org/2000/svg">
                <defs><pattern id="hg" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,1)" strokeWidth=".5"/></pattern></defs>
                <rect width="100%" height="100%" fill="url(#hg)"/>
              </svg>
              {/* Orbes */}
              <div style={{position:"absolute",top:-80,right:-60,width:400,height:400,borderRadius:"50%",background:"rgba(255,255,255,.04)"}}/>
              <div style={{position:"absolute",top:28,right:230,width:60,height:60,borderRadius:"50%",background:"rgba(224,154,0,.18)",border:"1px solid rgba(224,154,0,.22)"}}/>
              {/* Ligne diagonale */}
              <div style={{position:"absolute",top:"20%",left:"-5%",width:"115%",height:1,background:"linear-gradient(90deg,transparent,rgba(255,255,255,.06),transparent)",transform:"rotate(-8deg)"}}/>
              {/* Tricolore — haut arrondi */}
              <div style={{position:"absolute",top:0,left:0,right:0,height:5,display:"flex",borderRadius:"26px 26px 0 0"}}>
                <div style={{flex:1,background:"linear-gradient(90deg,#B01010,#D42020)"}}/>
                <div style={{flex:1,background:`linear-gradient(90deg,${DS.gold},${DS.goldViv})`}}/>
                <div style={{flex:1,background:`linear-gradient(90deg,${DS.green},${DS.greenLight})`}}/>
              </div>
            </div>

            <div className="da-hero-in" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:28,flexWrap:"wrap",position:"relative",zIndex:1}}>

              {/* ── Gauche — identité ── */}
              <div>
                {/* Label ONFPP */}
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18,opacity:.5}}>
                  <Globe size={10} color={DS.goldViv}/>
                  <span style={{fontSize:9.5,color:DS.goldViv,fontWeight:700,letterSpacing:".22em",textTransform:"uppercase"}}>
                    ONFPP · Plateforme Nationale · République de Guinée
                  </span>
                </div>

                {/* Avatar + nom */}
                <div style={{display:"flex",alignItems:"center",gap:18,marginBottom:20}}>
                  <div style={{position:"relative",flexShrink:0}}>
                    <div style={{
                      width:62,height:62,borderRadius:18,
                      background:`linear-gradient(140deg,${rD.dot}50,${rD.dot}1A)`,
                      border:"1.5px solid rgba(255,255,255,.22)",
                      display:"flex",alignItems:"center",justifyContent:"center",
                      boxShadow:`0 0 0 4px rgba(255,255,255,.07), 0 10px 32px rgba(0,0,0,.32), 0 0 30px ${rD.dot}28`,
                    }}>
                      <span className="da-f" style={{fontSize:25,fontWeight:600,color:"#fff",fontStyle:"italic",letterSpacing:"-.3px"}}>{initials}</span>
                    </div>
                    <div style={{position:"absolute",bottom:-4,right:-4,width:18,height:18,borderRadius:6,background:rD.dot,border:"2px solid rgba(255,255,255,.28)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 0 10px ${rD.dot}60`}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:"#fff"}}/>
                    </div>
                  </div>
                  <div>
                    <p style={{fontSize:11.5,color:"rgba(255,255,255,.5)",fontWeight:400,marginBottom:5,letterSpacing:".02em"}}>{greeting}</p>
                    <h1 className="da-f" style={{fontSize:30,fontWeight:600,fontStyle:"italic",color:"#fff",lineHeight:1.05,letterSpacing:"-.6px"}}>{displayName}</h1>
                    <p style={{fontSize:11,color:"rgba(255,255,255,.4)",marginTop:6,letterSpacing:".03em"}}>{dateStr}</p>
                  </div>
                </div>

                {/* Badges */}
                <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                  <span style={{
                    display:"inline-flex",alignItems:"center",gap:7,
                    background:"rgba(255,255,255,.1)",backdropFilter:"blur(12px)",
                    border:"1px solid rgba(255,255,255,.18)",borderRadius:30,
                    padding:"6px 16px",fontSize:12,fontWeight:600,color:"#fff",
                  }}>
                    <ShieldCheck size={12}/>{roleLabel}
                  </span>
                  {roleLevel>0&&(
                    <span style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:11.5,background:"rgba(224,154,0,.2)",border:"1px solid rgba(224,154,0,.3)",borderRadius:30,padding:"5px 14px",fontWeight:700,color:DS.goldViv}}>
                      <Star size={10} color={DS.goldViv} fill={DS.goldViv}/> Niv. {roleLevel}
                    </span>
                  )}
                  {userDivision&&roleLevel<90&&(
                    <span style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:11,background:"rgba(26,59,140,.32)",border:"1px solid rgba(93,130,255,.35)",borderRadius:30,padding:"5px 14px",fontWeight:600,color:"#9AB0FF"}}>
                      🏢 {userDivision}
                    </span>
                  )}
                  {userAntenne&&roleLevel<90&&(
                    <span style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:11,background:"rgba(8,145,178,.22)",border:"1px solid rgba(8,145,178,.32)",borderRadius:30,padding:"5px 14px",fontWeight:600,color:"#7DDFF7"}}>
                      📍 {ANTENNE_LABELS[userAntenne]||userAntenne}
                    </span>
                  )}
                  {roleLevel>=90&&(
                    <span style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:11,background:"rgba(11,175,122,.22)",border:"1px solid rgba(11,175,122,.35)",borderRadius:30,padding:"5px 14px",fontWeight:600,color:"#5AEEC0"}}>
                      🌐 Accès global
                    </span>
                  )}
                </div>
              </div>

              {/* ── Droite — horloge + actions ── */}
              <div className="da-hero-r" style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:14}}>
                {/* Horloge flip */}
                <div style={{
                  background:"rgba(4,16,31,.55)",backdropFilter:"blur(20px)",
                  border:"1px solid rgba(255,255,255,.12)",borderRadius:20,
                  padding:"16px 24px",textAlign:"center",
                  boxShadow:`0 8px 40px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.08)`,
                }}>
                  <p className="da-f" style={{
                    fontSize:42,fontWeight:700,color:"#fff",lineHeight:1,letterSpacing:"2px",
                    textShadow:"0 0 30px rgba(93,130,255,.4)",
                  }}>
                    {hh}<span className="da-blink" style={{color:DS.sky}}>:</span>{mm}
                    <span style={{fontSize:22,color:"rgba(255,255,255,.4)",fontWeight:500}}>:{ss}</span>
                  </p>
                  <p style={{fontSize:9,color:"rgba(255,255,255,.35)",fontWeight:600,marginTop:8,letterSpacing:".24em",textTransform:"uppercase"}}>
                    Heure locale · Conakry, Guinée
                  </p>
                </div>

                {/* Contrôles */}
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  {/* Statut */}
                  <div style={{
                    display:"flex",alignItems:"center",gap:7,
                    background:"rgba(255,255,255,.09)",border:"1px solid rgba(255,255,255,.14)",
                    borderRadius:12,padding:"8px 14px",backdropFilter:"blur(10px)",
                  }}>
                    <div className="da-live" style={{width:7,height:7,borderRadius:"50%",background:DS.greenLight}}/>
                    <span style={{fontSize:11.5,color:"rgba(255,255,255,.75)",fontWeight:600}}>En ligne</span>
                  </div>
                  {/* Refresh */}
                  <button onClick={refetch} style={{
                    width:44,height:44,borderRadius:13,
                    background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.18)",
                    cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
                    color:"rgba(255,255,255,.75)",backdropFilter:"blur(10px)",transition:"background .15s",
                  }}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.18)"}
                  onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.1)"}
                  title="Actualiser">
                    <RefreshCw size={16} className="da-refr" style={{transition:"transform .35s"}}/>
                  </button>
                  {/* Modules */}
                  <div style={{background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.16)",borderRadius:13,padding:"8px 16px",display:"flex",alignItems:"center",gap:8,backdropFilter:"blur(10px)"}}>
                    <LayoutDashboard size={12} color="rgba(255,255,255,.65)"/>
                    <span style={{fontSize:11.5,color:"rgba(255,255,255,.78)",fontWeight:600}}>{totalMod} modules</span>
                  </div>
                  {/* Bell */}
                  <div style={{position:"relative"}} ref={bellRef}>
                    <button onClick={openNotif} style={{
                      width:44,height:44,borderRadius:13,
                      background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.18)",
                      cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
                      color:"#fff",backdropFilter:"blur(10px)",transition:"background .15s",
                    }}
                    onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.18)"}
                    onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.1)"}
                    >
                      <Bell size={18}/>
                    </button>
                    {unread>0&&<span className="da-badge" style={{position:"absolute",top:-6,right:-6,minWidth:19,height:19,borderRadius:12,background:DS.rose,color:"#fff",fontSize:9.5,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 5px",border:"2.5px solid #F1F3FB"}}>{unread}</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notifs dropdown */}
          {notifOpen&&(
            <>
              <div style={{position:"fixed",inset:0,zIndex:998}} onClick={()=>setNotifOpen(false)}/>
              <div className="da-notif" style={{position:"fixed",top:notifPos.top,right:notifPos.right,width:340,background:DS.surface,border:`1px solid ${DS.divider}`,borderTop:`3px solid ${DS.goldBright}`,borderRadius:"0 0 16px 16px",boxShadow:`0 28px 72px ${DS.sh2}`,zIndex:999,overflow:"hidden"}}>
                <div style={{padding:"13px 18px 11px",borderBottom:`1px solid ${DS.divider}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:DS.goldPale}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <Bell size={12} color={DS.gold}/>
                    <p className="da-f" style={{fontSize:13,fontWeight:600,color:DS.textPri}}>Activité récente</p>
                  </div>
                  <span style={{fontSize:10,color:DS.gold,fontWeight:700,background:`${DS.gold}14`,padding:"2px 9px",borderRadius:20}}>{users.length} utilisateurs</span>
                </div>
                {recentUsers.slice(0,4).map((n,i)=>(
                  <div key={i} className="da-ni" style={{padding:"12px 18px",borderBottom:i<3?`1px solid ${DS.divider}`:"none",display:"flex",gap:12,alignItems:"flex-start"}}>
                    <div style={{width:7,height:7,borderRadius:"50%",flexShrink:0,marginTop:5,background:n.color,boxShadow:`0 0 0 3px ${n.color}20`}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:12.5,fontWeight:600,color:DS.textPri}}>{n.text}</p>
                      <p style={{fontSize:11,color:DS.textMuted,marginTop:2}}>{n.detail} · {n.time}</p>
                    </div>
                  </div>
                ))}
                {recentUsers.length===0&&!apiLoad&&<div style={{padding:"24px 18px",textAlign:"center",color:DS.textMuted,fontSize:12}}>Aucune activité récente</div>}
                <div style={{padding:"10px 18px 13px",borderTop:`1px solid ${DS.divider}`,display:"flex",justifyContent:"center"}}>
                  <button onClick={()=>{setNotifOpen(false);setActiveTab("activite");}} style={{fontSize:12,fontWeight:700,color:DS.brand,background:"none",border:"none",cursor:"pointer"}}>
                    Voir tous les utilisateurs →
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ══ KPIs ══ */}
          <div className="da-kgrid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:14,marginBottom:24}}>
            {kpis.map((s,i)=><KpiCard key={i} {...s} loading={apiLoad}/>)}
          </div>

          {/* ══ TABS — style "pill" premium ══ */}
          <div style={{
            display:"flex",gap:3,marginBottom:22,padding:"4px",
            background:DS.surface,border:`1px solid ${DS.divider}`,
            borderRadius:14,width:"fit-content",
            boxShadow:`0 2px 14px ${DS.sh1}`,
          }}>
            {tabs.map(tab=>{
              const isAct=activeTab===tab.id;
              return(
                <button key={tab.id} className={`da-tab${isAct?" da-tab-active":""}`} onClick={()=>setActiveTab(tab.id)} style={{
                  display:"flex",alignItems:"center",gap:7,padding:"9px 20px",borderRadius:11,border:"none",
                  fontSize:12.5,fontWeight:isAct?600:500,
                  background:isAct?HERO_BG:"transparent",
                  color:isAct?"#fff":DS.textMuted,
                  boxShadow:isAct?`0 5px 20px rgba(4,16,31,.28), inset 0 1px 0 rgba(255,255,255,.1)`:"none",
                  cursor:"pointer",transition:"all .18s ease",
                  letterSpacing:isAct?".01em":"0",
                }}>
                  <tab.icon size={13}/>{tab.label}
                </button>
              );
            })}
          </div>

          {/* ══ VUE MODULES ══ */}
          {activeTab==="modules"&&(
            <div className="da-layout" style={{display:"grid",gridTemplateColumns:"1fr 296px",gap:20,alignItems:"start"}}>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {sections.map((sec,si)=>(
                  <SBox key={si} icon={sec.icon} title={sec.section} color={sec.color} count={String(sec.items.length)} delay={`da-d${Math.min(si+1,5)}`}>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:7}}>
                      {sec.items.map((m,mi)=><ModRow key={mi} label={m.label} icon={m.icon} path={m.path} color={sec.color}/>)}
                    </div>
                  </SBox>
                ))}
              </div>

              {/* ── Sidebar droite ── */}
              <div className="da-rsb" style={{display:"flex",flexDirection:"column",gap:14}}>

                {/* Profil card — gradient HERO_BG */}
                <div className="da-in da-d1" style={{
                  background:HERO_BG,borderRadius:22,padding:"22px 20px",
                  boxShadow:`0 16px 52px ${DS.shHero}`,
                  position:"relative",overflow:"hidden",
                }}>
                  <div style={{position:"absolute",inset:0,borderRadius:22,overflow:"hidden",pointerEvents:"none"}}>
                    <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:.07}} xmlns="http://www.w3.org/2000/svg">
                      <defs><pattern id="pcg" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(255,255,255,1)" strokeWidth=".5"/></pattern></defs>
                      <rect width="100%" height="100%" fill="url(#pcg)"/>
                    </svg>
                    <div style={{position:"absolute",top:0,left:0,right:0,height:5,display:"flex",borderRadius:"22px 22px 0 0"}}>
                      <div style={{flex:1,background:"#D42020"}}/><div style={{flex:1,background:DS.goldViv}}/><div style={{flex:1,background:DS.green}}/>
                    </div>
                  </div>
                  <p style={{fontSize:8.5,color:"rgba(255,255,255,.28)",marginBottom:16,letterSpacing:".26em",textTransform:"uppercase",fontWeight:700,position:"relative"}}>Votre espace</p>
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,position:"relative"}}>
                    <div style={{
                      width:50,height:50,borderRadius:15,flexShrink:0,
                      background:`${rD.dot}40`,border:"1.5px solid rgba(255,255,255,.2)",
                      display:"flex",alignItems:"center",justifyContent:"center",
                      boxShadow:"0 4px 18px rgba(0,0,0,.3)",
                    }}>
                      <span className="da-f" style={{fontSize:21,fontWeight:600,fontStyle:"italic",color:"#fff"}}>{initials}</span>
                    </div>
                    <div>
                      <p className="da-f" style={{fontWeight:600,fontSize:14.5,color:"#fff",letterSpacing:"-.2px"}}>{displayName}</p>
                      <span style={{display:"inline-flex",alignItems:"center",gap:5,marginTop:5,background:rD.bg,color:rD.text,border:`1px solid ${rD.border}`,borderRadius:30,padding:"3px 10px 3px 7px",fontSize:8.5,fontWeight:600}}>
                        <span style={{width:5,height:5,borderRadius:"50%",background:rD.dot,boxShadow:`0 0 5px ${rD.dot}`,flexShrink:0}}/>{roleLabel}
                      </span>
                    </div>
                  </div>

                  {(userDivision||userAntenne)&&roleLevel<90&&(
                    <div style={{background:"rgba(255,255,255,.07)",borderRadius:10,padding:"10px 12px",marginBottom:12,position:"relative"}}>
                      <p style={{fontSize:9,color:"rgba(255,255,255,.34)",fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",marginBottom:6}}>Périmètre</p>
                      {userDivision&&<p style={{fontSize:11.5,color:"rgba(255,255,255,.78)",fontWeight:500}}>🏢 {DIVISION_LABELS[userDivision]||userDivision}</p>}
                      {userAntenne&&<p style={{fontSize:11.5,color:"rgba(255,255,255,.78)",fontWeight:500,marginTop:4}}>📍 {ANTENNE_LABELS[userAntenne]||userAntenne}</p>}
                    </div>
                  )}
                  {roleLevel>=90&&(
                    <div style={{background:"rgba(255,255,255,.07)",borderRadius:10,padding:"10px 12px",marginBottom:12,position:"relative"}}>
                      <p style={{fontSize:9,color:"rgba(255,255,255,.34)",fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",marginBottom:6}}>Périmètre</p>
                      <p style={{fontSize:11.5,color:"rgba(255,255,255,.78)",fontWeight:500}}>🌐 Accès global — toutes divisions</p>
                    </div>
                  )}
                  <div style={{display:"flex",justifyContent:"space-between",paddingTop:12,borderTop:"1px solid rgba(255,255,255,.09)",position:"relative"}}>
                    <span style={{fontSize:11,color:"rgba(255,255,255,.36)"}}>{totalMod} modules</span>
                    <span style={{fontSize:11,color:"rgba(255,255,255,.62)",fontWeight:600}}>{apiLoad?"…":users.length} utilisateurs</span>
                  </div>
                </div>

                {/* Accès rapides */}
                <div className="da-in da-d2" style={{background:DS.surface,border:`1px solid ${DS.divider}`,borderRadius:20,padding:"20px",boxShadow:`0 2px 16px ${DS.sh1}`}}>
                  <SHdr icon={Zap} title="Accès rapides" color={DS.goldBright}/>
                  <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                    {(isDG
                      ?[{path:"/apprenants",label:"Apprenants",icon:GraduationCap,color:DS.brand},{path:"/statistiques",label:"Statistiques",icon:PieChart,color:DS.violet},{path:"/rapports",label:"Rapports",icon:BarChart3,color:DS.teal},{path:"/utilisateurs",label:"Utilisateurs",icon:UserCog,color:"#374B8A"}]
                      :[{path:"/apprenants",label:"Apprenants",icon:GraduationCap,color:DS.brand},{path:"/presences",label:"Présences",icon:CalendarDays,color:DS.green},{path:"/statistiques",label:"Statistiques",icon:PieChart,color:DS.violet},{path:"/rapports",label:"Rapports",icon:BarChart3,color:DS.teal}]
                    ).map((q,i)=><QL key={i} {...q}/>)}
                  </div>
                </div>

                {/* Carte ONFPP — or institutionnel */}
                <div className="da-in da-d3" style={{
                  background:`linear-gradient(140deg,${DS.goldPale},${DS.surface})`,
                  border:`1px solid rgba(184,122,0,.2)`,borderRadius:20,padding:"18px 20px",
                  boxShadow:`0 2px 14px rgba(184,122,0,.07)`,
                }}>
                  <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:12}}>
                    <Sparkles size={13} color={DS.gold}/>
                    <p className="da-f" style={{fontSize:12,fontWeight:600,color:DS.textPri}}>Office National de Formation Professionnelle</p>
                  </div>
                  <p style={{fontSize:11,color:DS.textSec,lineHeight:1.8}}>Plateforme nationale de suivi des formations professionnelles en République de Guinée.</p>
                  <div style={{display:"flex",gap:7,marginTop:13}}>
                    {[{v:"2025",l:"Exercice"},{v:"v3.0",l:"Version"},{v:"🇬🇳",l:"Guinée"}].map((b,i)=>(
                      <div key={i} style={{flex:1,background:"rgba(255,255,255,.8)",borderRadius:9,padding:"9px 7px",textAlign:"center",border:`1px solid rgba(184,122,0,.14)`}}>
                        <p className="da-f" style={{fontSize:13.5,fontWeight:700,color:DS.textPri,lineHeight:1}}>{b.v}</p>
                        <p style={{fontSize:9,color:DS.textMuted,marginTop:4}}>{b.l}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ VUE UTILISATEURS ══ */}
          {activeTab==="activite"&&(
            <div style={{maxWidth:900}}>
              <ScopeBanner division={userDivision} antenne={userAntenne} niveau={roleLevel}/>
              <SBox icon={Users} title="Utilisateurs de votre périmètre" color={DS.brand} count={apiLoad?"…":String(users.length)} delay="da-in da-d0">
                <UsersTable users={users} loading={apiLoad}/>
              </SBox>
              {!apiLoad&&users.length>0&&(
                <div className="da-in da-d1" style={{background:DS.surface,border:`1px solid ${DS.divider}`,borderRadius:20,padding:"22px",boxShadow:`0 2px 16px ${DS.sh1}`,marginTop:14}}>
                  <SHdr icon={BarChart3} title="Répartition par rôle" color={DS.violet}/>
                  <div style={{display:"flex",flexWrap:"wrap",gap:9}}>
                    {Object.entries(users.reduce((acc,u)=>{const r=u.role?.name||"Inconnu";acc[r]=(acc[r]||0)+1;return acc},{})).map(([role,count],i)=>{
                      const rs2=RS_LIGHT[role]||{bg:DS.lift,text:DS.textSec,dot:DS.textMuted};
                      return(
                        <div key={i} style={{display:"flex",alignItems:"center",gap:8,background:rs2.bg,border:`1px solid ${rs2.dot}22`,borderRadius:10,padding:"8px 14px"}}>
                          <span style={{width:7,height:7,borderRadius:"50%",background:rs2.dot,flexShrink:0}}/>
                          <span style={{fontSize:12,fontWeight:600,color:rs2.text}}>{role}</span>
                          <span style={{fontSize:12,fontWeight:800,color:rs2.text}}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ VUE PÉRIMÈTRE ══ */}
          {activeTab==="statistiques"&&(
            <div style={{maxWidth:760}}>
              <ScopeBanner division={userDivision} antenne={userAntenne} niveau={roleLevel}/>
              <div className="da-in da-d0" style={{background:DS.surface,border:`1px solid ${DS.divider}`,borderRadius:20,padding:"26px",boxShadow:`0 2px 18px ${DS.sh1}`,marginBottom:14}}>
                <SHdr icon={ShieldCheck} title="Informations de votre compte" color={DS.brand}/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  {[
                    {label:"Nom d'utilisateur",value:user.username},
                    {label:"Nom complet",value:displayName},
                    {label:"Rôle",value:roleLabel},
                    {label:"Niveau d'accès",value:String(roleLevel)},
                    {label:"Division",value:userDivision?(DIVISION_LABELS[userDivision]||userDivision):(roleLevel>=90?"Toutes":"—")},
                    {label:"Antenne",value:userAntenne?(ANTENNE_LABELS[userAntenne]||userAntenne):(roleLevel>=90?"Toutes":"—")},
                  ].map((item,i)=>(
                    <div key={i} style={{background:DS.lift,borderRadius:12,padding:"14px 16px",border:`1px solid ${DS.divider}`}}>
                      <p style={{fontSize:9.5,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:DS.textMuted,marginBottom:7}}>{item.label}</p>
                      <p style={{fontSize:14,fontWeight:700,color:DS.textPri}}>{item.value||"—"}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="da-in da-d1" style={{background:DS.surface,border:`1px solid ${DS.divider}`,borderRadius:20,padding:"22px",boxShadow:`0 2px 16px ${DS.sh1}`}}>
                <SHdr icon={Activity} title="Périmètre d'accès autorisé" color={DS.green}/>
                <div style={{display:"flex",flexDirection:"column",gap:9}}>
                  {[
                    {label:"Voir tous les utilisateurs",ok:roleLevel>=90},
                    {label:"Voir utilisateurs de ma division",ok:roleLevel>=60},
                    {label:"Voir utilisateurs de mon antenne",ok:roleLevel>=30},
                    {label:"Gérer les utilisateurs",ok:roleLevel>=90},
                    {label:"Accès statistiques globales",ok:roleLevel>=90},
                    {label:"Accès statistiques section/antenne",ok:roleLevel>=50},
                    {label:"Export PDF / Excel",ok:roleLevel>=50},
                  ].map((item,i)=>(
                    <div key={i} style={{
                      display:"flex",alignItems:"center",justifyContent:"space-between",
                      padding:"10px 14px",
                      background:item.ok?DS.greenPale:DS.lift,
                      borderRadius:10,
                      border:`1px solid ${item.ok?DS.green+"28":DS.divider}`,
                    }}>
                      <span style={{fontSize:13,color:item.ok?DS.textPri:DS.textMuted}}>{item.label}</span>
                      <span style={{
                        fontSize:10.5,fontWeight:700,
                        color:item.ok?DS.green:DS.textMuted,
                        background:item.ok?`${DS.green}15`:"transparent",
                        borderRadius:20,padding:"2px 10px",
                        border:`1px solid ${item.ok?DS.green+"22":"transparent"}`,
                      }}>{item.ok?"✓ Autorisé":"✗ Restreint"}</span>
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