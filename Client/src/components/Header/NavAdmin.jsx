import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, GraduationCap, ClipboardList, Award,
  Settings, LogOut, Bell, FileText, CalendarDays, Package, Layers,
  CheckCircle2, Briefcase, UserCog, Clock, AlertTriangle,
  PanelLeftClose, PanelLeftOpen, X, Globe, ChevronRight,
} from "lucide-react";
import CONFIG from "../../config/config.js";
import logo from "../../assets/logo.png";

/* ═══════════════════════════════════════════════════
   DESIGN SYSTEM — Sovereign Dark · Institutional Precision
   Fil conducteur : Bleu ONFPP #1A3B8C + Or guinéen + Navy profond
═══════════════════════════════════════════════════ */
export const DS = {
  /* ── Fonds navy ── */
  navy:        "#04101F",
  navyMid:     "#081733",
  navyUp:      "#0D2050",
  brand:       "#1A3B8C",
  brandViv:    "#2451B8",
  brandGlow:   "rgba(26,59,140,0.5)",
  electric:    "#3D68FF",
  sky:         "#5B82FF",

  /* ── Surfaces claires ── */
  page:        "#F1F3FB",
  surface:     "#FFFFFF",
  lift:        "#F6F8FF",
  iceStrong:   "#C8D4FF",
  ice:         "#DBE5FF",
  iceFaint:    "#EEF2FF",
  divider:     "#E2E8F5",

  /* ── Texte ── */
  textPri:     "#04101F",
  textSec:     "#2C3F7A",
  textMuted:   "#7A90C4",

  /* ── Or guinéen ── */
  gold:        "#B87A00",
  goldBright:  "#E09A00",
  goldViv:     "#F5B020",
  goldPale:    "#FFF6DC",

  /* ── Accents sémantiques ── */
  green:       "#046048",
  greenLight:  "#0BAF7A",
  greenPale:   "#E2F8F1",
  rose:        "#CC1840",
  rosePale:    "#FDEAEF",
  violet:      "#5A22CC",
  teal:        "#077870",

  /* ── Ombres ── */
  sh1:         "rgba(4,16,31,0.07)",
  sh2:         "rgba(4,16,31,0.14)",
  sh3:         "rgba(4,16,31,0.26)",
  shHero:      "rgba(4,16,31,0.65)",
};

/* Gradient sidebar & hero — même valeur */
export const HERO_BG = `linear-gradient(148deg, ${DS.navy} 0%, #061228 18%, #091A3E 38%, #0E2258 58%, ${DS.brand} 82%, ${DS.brandViv} 100%)`;
export const SIDEBAR_W  = 258;
export const SIDEBAR_SM = 68;
export const TOPBAR_H   = 60;

/* ── Rôles ── */
export const ROLE_LABELS = {
  "Directeur Général":"Directeur Général","Directeur Général Adjoint":"DG Adjoint",
  "Chef de Division":"Chef de Division","Chef de Section":"Chef de Section",
  "Chef d'Antenne":"Chef d'Antenne","Conseiller":"Conseiller","Formateur":"Formateur",
  "Super Administrateur":"Super Admin",
  DG:"Directeur Général",CD:"Chef de Division",DR:"DG Adjoint",
  CC:"Chef d'Antenne",FORMATEUR:"Formateur",SUPERADMIN:"Super Admin",
};

export const RS_DARK = {
  default:{bg:"rgba(93,118,255,.18)",text:"#9AB0FF",border:"rgba(93,118,255,.28)",dot:"#6B8FFF"},
  "Directeur Général":    {bg:"rgba(93,118,255,.18)",text:"#9AB0FF",border:"rgba(93,118,255,.28)",dot:"#6B8FFF"},
  "Directeur Général Adjoint":{bg:"rgba(93,118,255,.18)",text:"#9AB0FF",border:"rgba(93,118,255,.28)",dot:"#6B8FFF"},
  "Chef de Division":     {bg:"rgba(93,118,255,.18)",text:"#9AB0FF",border:"rgba(93,118,255,.28)",dot:"#6B8FFF"},
  "Chef de Section":      {bg:"rgba(11,175,122,.16)",text:"#5AEEC0",border:"rgba(11,175,122,.26)",dot:"#2DD4A0"},
  "Chef d'Antenne":       {bg:"rgba(229,154,0,.15)", text:"#FFD060",border:"rgba(229,154,0,.26)", dot:"#E09A00"},
  "Conseiller":           {bg:"rgba(150,90,255,.16)",text:"#C4AAFF",border:"rgba(150,90,255,.26)",dot:"#AA82FF"},
  "Formateur":            {bg:"rgba(0,200,245,.13)", text:"#6ADEFF",border:"rgba(0,200,245,.23)", dot:"#18D4F5"},
  "Super Administrateur": {bg:"rgba(255,70,90,.15)", text:"#FF9EAC",border:"rgba(255,70,90,.25)", dot:"#FF6070"},
  DG:{bg:"rgba(93,118,255,.18)",text:"#9AB0FF",border:"rgba(93,118,255,.28)",dot:"#6B8FFF"},
  CD:{bg:"rgba(93,118,255,.18)",text:"#9AB0FF",border:"rgba(93,118,255,.28)",dot:"#6B8FFF"},
  DR:{bg:"rgba(93,118,255,.18)",text:"#9AB0FF",border:"rgba(93,118,255,.28)",dot:"#6B8FFF"},
  CC:{bg:"rgba(229,154,0,.15)",text:"#FFD060",border:"rgba(229,154,0,.26)",dot:"#E09A00"},
  SUPERADMIN:{bg:"rgba(255,70,90,.15)",text:"#FF9EAC",border:"rgba(255,70,90,.25)",dot:"#FF6070"},
};

export const RS_LIGHT = {
  default:{bg:"#EBF0FF",text:"#1A3B8C",border:"#BCC8FF",dot:"#1A3B8C"},
  "Directeur Général":    {bg:"#EBF0FF",text:"#1A3B8C",border:"#BCC8FF",dot:"#1A3B8C"},
  "Directeur Général Adjoint":{bg:"#EBF0FF",text:"#1A3B8C",border:"#BCC8FF",dot:"#1A3B8C"},
  "Chef de Division":     {bg:"#EBF0FF",text:"#1A3B8C",border:"#BCC8FF",dot:"#1A3B8C"},
  "Chef de Section":      {bg:"#E0F8F1",text:"#046048",border:"#85E0C5",dot:"#0BAF7A"},
  "Chef d'Antenne":       {bg:"#FFF4D6",text:"#7A4F00",border:"#F0CC78",dot:"#B87A00"},
  "Conseiller":           {bg:"#F0EAFF",text:"#5A22CC",border:"#C2ABFA",dot:"#7C45EE"},
  "Formateur":            {bg:"#DDFAFF",text:"#025070",border:"#88DEFF",dot:"#0891B2"},
  "Super Administrateur": {bg:"#FDEAEF",text:"#CC1840",border:"#F5AABC",dot:"#E02050"},
  DG:{bg:"#EBF0FF",text:"#1A3B8C",border:"#BCC8FF",dot:"#1A3B8C"},
  CD:{bg:"#EBF0FF",text:"#1A3B8C",border:"#BCC8FF",dot:"#1A3B8C"},
  DR:{bg:"#EBF0FF",text:"#1A3B8C",border:"#BCC8FF",dot:"#1A3B8C"},
  CC:{bg:"#FFF4D6",text:"#7A4F00",border:"#F0CC78",dot:"#B87A00"},
  SUPERADMIN:{bg:"#FDEAEF",text:"#CC1840",border:"#F5AABC",dot:"#E02050"},
};

const rD = r => RS_DARK[r]  || RS_DARK.default;
const rL = r => RS_LIGHT[r] || RS_LIGHT.default;

/* ── Nav items ── */
const ALL  = ["DG","CD","DR","CC","FORMATEUR","SUPERADMIN","Directeur Général","Directeur Général Adjoint","Chef de Division","Chef de Section","Chef de Centre","Formateur","Super Administrateur","Chef d'Antenne","Conseiller"];
const MGMT = ["DG","CD","DR","Directeur Général","Directeur Général Adjoint","Chef de Division","Chef de Section"];
const OPS  = ["CC","FORMATEUR","Chef de Centre","Formateur","Chef d'Antenne"];
const ADM  = ["DG","CD","SUPERADMIN","Directeur Général","Chef de Division","Super Administrateur"];
const NS   = ALL.filter(r=>!["SUPERADMIN","Super Administrateur"].includes(r));

const NAV = [
  {path:"/dashboardAdmin",    label:"Tableau de bord",      icon:LayoutDashboard, roles:ALL},
  {path:"/inscription",       label:"Inscriptions",         icon:GraduationCap,   roles:NS},
  {path:"/listeApprenants",   label:"Liste des Candidats",     icon:ClipboardList,   roles:NS},
  {path:"/formateurs",        label:"Gestion des Formateurs",           icon:UserCog,         roles:MGMT},
  {path:"/formationContinue", label:"Formation DFC",        icon:Package,         roles:MGMT},
  {path:"/formationDAPc",     label:"Formation DAPC",       icon:Package,         roles:MGMT},
  {path:"/entreprise",        label:"Entreprises",          icon:Briefcase,       roles:MGMT},
  {path:"/suiviEvaluation",   label:"Suivi Évaluation",     icon:CheckCircle2,    roles:MGMT},
  {path:"/addUser",           label:"Gestion utilisateurs", icon:UserCog,         roles:ADM},
  {path:"/boitecommune",           label:"Boite Commune", icon:UserCog,         roles:ADM},
  {path:"/rapports",           label:"Rapports", icon:UserCog,         roles:ADM},
  {path:"/attestations",      label:"Attestations PDF",     icon:FileText,        roles:[...MGMT,...OPS]},
  {path:"/enquete-insertion", label:"Enquête insertion 3 mois",    icon:Clock,           roles:[...MGMT,"CC","Chef de Centre","Chef d'Antenne"]},
  {path:"/homePost",          label:"Contenu site public",  icon:Layers,          roles:["DG","CD","Directeur Général","Chef de Division"]},
  // {path:"/parametres",        label:"Paramètres",           icon:Settings,        roles:ADM},
];

const buildNav = role => {
  const s=new Set();
  return NAV.filter(i=>{if(s.has(i.path)||!i.roles.includes(role))return false;s.add(i.path);return true;});
};

const getUser = () => {
  try{
    const raw=localStorage.getItem("user");
    if(raw){
      const p=JSON.parse(raw); const rr=p.role;
      const role=typeof rr==="object"&&rr?rr.name||"Directeur Général":rr||"Directeur Général";
      const fn=p.first_name||p.firstName||"",ln=p.last_name||p.lastName||"";
      const name=fn?`${fn}${ln?" "+ln:""}`:p.username||p.email||"Admin";
      return{...p,role,name,username:p.username||p.email||name,division:p.division||null,antenne:p.antenne||null};
    }
    const tok=localStorage.getItem("access");
    if(tok){
      const p=JSON.parse(atob(tok.split(".")[1]));
      const rr=p.role;
      const role=typeof rr==="object"&&rr?rr.name||"Directeur Général":rr||"Directeur Général";
      const fn=p.first_name||"",ln=p.last_name||"";
      const name=fn?`${fn}${ln?" "+ln:""}`:p.username||p.email||"Admin";
      return{username:p.username||p.email||name,name,role,division:p.division||null,antenne:p.antenne||null};
    }
  }catch{}
  return{username:"Admin",name:"Admin",role:"Directeur Général"};
};

/* ═══════════════════════════════════════════════════
   CSS — Sovereign Dark · Institutional Precision
   Polices : Sora (corps ultra-moderne) + Fraunces (display)
═══════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,700;1,9..144,400;1,9..144,600&display=swap');

.nv,.nv *:not(style){font-family:'Sora',sans-serif!important;-webkit-font-smoothing:antialiased;box-sizing:border-box;}
.nv-f{font-family:'Fraunces',serif!important;}

/* ── Sidebar transition ── */
.nv-side{transition:width .3s cubic-bezier(.16,1,.3,1);will-change:width;overflow:hidden;}

/* ─────────────────────────────────────────
   Nav item : effet hover avec trait lumineux
───────────────────────────────────────────*/
.nv-item{
  display:flex;align-items:center;gap:10px;
  padding:9px 11px;border-radius:10px;
  cursor:pointer;text-decoration:none;border:none;background:transparent;
  position:relative;width:100%;overflow:hidden;
  transition:background .18s ease, transform .16s cubic-bezier(.34,1.56,.64,1);
}
.nv-item::after{
  content:'';position:absolute;left:0;top:0;bottom:0;
  width:0;background:linear-gradient(90deg,rgba(93,130,255,.22),transparent);
  transition:width .22s ease;border-radius:10px;
}
.nv-item:hover{background:rgba(255,255,255,.07);transform:translateX(3px);}
.nv-item:hover::after{width:100%;}

/* Actif : fond glass avec lueur */
.nv-item.act{
  background:linear-gradient(135deg,rgba(26,59,140,.5) 0%,rgba(61,104,255,.22) 100%);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.1), 0 6px 24px rgba(26,59,140,.35);
}
.nv-item.act::before{
  content:'';position:absolute;left:0;top:22%;bottom:22%;
  width:3px;border-radius:0 3px 3px 0;
  background:linear-gradient(180deg,#7EB0FF 0%,#3D68FF 100%);
  box-shadow:0 0 16px rgba(93,130,255,.9),0 0 6px rgba(93,130,255,.5);
}
.nv-item.act::after{width:100%;}

/* ── Tooltip sidebar réduite ── */
.nv-tip{
  position:absolute;left:calc(100% + 12px);top:50%;transform:translateY(-50%);
  background:#04101F;color:#E8EFFF;
  font-size:11.5px;font-weight:500;white-space:nowrap;
  padding:7px 13px;border-radius:9px;
  pointer-events:none;opacity:0;
  transition:opacity .14s ease, transform .14s ease;
  transform:translateY(-50%) translateX(-4px);
  z-index:9999;
  border:1px solid rgba(93,130,255,.2);
  box-shadow:0 10px 32px rgba(4,16,31,.6), 0 0 0 1px rgba(255,255,255,.04);
}
.nv-tip::before{
  content:'';position:absolute;right:100%;top:50%;transform:translateY(-50%);
  border:5px solid transparent;border-right-color:#04101F;
}
.nv-item:hover .nv-tip{opacity:1;transform:translateY(-50%) translateX(0);}

/* ── Scrollbar ── */
.nv-scroll::-webkit-scrollbar{width:2px;}
.nv-scroll::-webkit-scrollbar-track{background:transparent;}
.nv-scroll::-webkit-scrollbar-thumb{background:rgba(93,130,255,.28);border-radius:2px;}

/* ── Animations ── */
@keyframes nvFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.nv-fade{animation:nvFade .32s cubic-bezier(.16,1,.3,1) both;}

@keyframes nvOrb1{0%,100%{opacity:.5;transform:scale(1) translate(0,0)}50%{opacity:.9;transform:scale(1.15) translate(-12px,-18px)}}
.nv-orb1{animation:nvOrb1 11s ease-in-out infinite;}
@keyframes nvOrb2{0%,100%{opacity:.3;transform:scale(1)}50%{opacity:.55;transform:scale(1.1) translate(8px,14px)}}
.nv-orb2{animation:nvOrb2 14s ease-in-out infinite;}

@keyframes nvBadge{0%,100%{box-shadow:0 0 0 0 rgba(204,24,64,.6)}65%{box-shadow:0 0 0 7px transparent}}
.nv-badge{animation:nvBadge 2.6s ease infinite;}

@keyframes nvSpin{to{transform:rotate(360deg)}}
.nv-spin{animation:nvSpin .7s linear infinite;}

@keyframes nvPulse{0%,100%{box-shadow:0 0 0 0 rgba(11,175,122,.45)}55%{box-shadow:0 0 0 6px transparent}}
.nv-live{animation:nvPulse 2.2s ease infinite;}

@keyframes nvBlink{0%,49%{opacity:1}50%,100%{opacity:.15}}
.nv-blink{animation:nvBlink 1s step-end infinite;}

/* ── Notif panel drop ── */
@keyframes nvDrop{from{opacity:0;transform:translateY(-8px) scale(.97)}to{opacity:1;transform:none}}
.nv-panel{animation:nvDrop .2s cubic-bezier(.16,1,.3,1) both;}
.nv-ni{transition:background .12s;}
.nv-ni:hover{background:#EBF0FF!important;}

/* ── Topbar buttons ── */
.nv-btn{
  width:35px;height:35px;border-radius:9px;
  border:1px solid #E2E8F5;background:transparent;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  color:#7A90C4;transition:all .15s;
}
.nv-btn:hover{background:#EBF0FF;color:#04101F;border-color:#C8D4FF;}
.nv-btn.on{background:rgba(26,59,140,.08);color:#1A3B8C;border-color:rgba(26,59,140,.2);}

/* ── Toggle ── */
.nv-tog{
  width:27px;height:27px;border-radius:8px;
  border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.06);
  cursor:pointer;display:flex;align-items:center;justify-content:center;
  color:rgba(255,255,255,.4);transition:all .15s;flex-shrink:0;
}
.nv-tog:hover{background:rgba(255,255,255,.16);color:#fff;border-color:rgba(255,255,255,.22);}

/* ── Chip profil topbar ── */
.nv-chip{cursor:default;transition:box-shadow .16s, border-color .16s;}
.nv-chip:hover{border-color:#C8D4FF!important;box-shadow:0 6px 22px rgba(4,16,31,.1)!important;}

/* ── Section label ── */
.nv-sec{
  font-size:7px;font-weight:700;letter-spacing:.3em;text-transform:uppercase;
  color:rgba(255,255,255,.14);padding:10px 11px 4px;
}

/* ── Stat chip topbar ── */
.nv-stat{
  display:flex;align-items:center;gap:6px;
  padding:6px 12px;border-radius:9px;
  border:1px solid #E2E8F5;background:#F6F8FF;
  font-size:10.5px;transition:border-color .14s,background .14s;cursor:default;
}
.nv-stat:hover{background:#EBF0FF;border-color:#C8D4FF;}
`;

/* ═══════════════════════════════════════════════════
   COMPOSANT
═══════════════════════════════════════════════════ */
export default function NavAdmin() {
  const loc=useLocation(), nav=useNavigate();
  const [col,setCol]=useState(false);
  const [notif,setNotif]=useState(false);
  const [counts,setCounts]=useState({contacts:0,community:0,newsletter:0});
  const [nList,setNList]=useState([]);
  const [nLoad,setNLoad]=useState(false);
  const [time,setTime]=useState(new Date());
  const [online,setOnline]=useState(null);
  const nRef=useRef(null);

  const u=getUser();
  const role=u.role||"Directeur Général";
  const label=ROLE_LABELS[role]||role;
  const name=u.name||u.username||"Admin";
  const ini=name.split(" ").filter(Boolean).map(w=>w[0]).slice(0,2).join("").toUpperCase()||"?";
  const rd=rD(role), rl=rL(role);
  const items=buildNav(role);
  const total=counts.contacts+counts.community+counts.newsletter;
  const sw=col?SIDEBAR_SM:SIDEBAR_W;
  const scope=u.division?`Div. ${u.division}`:u.antenne?`Antenne ${u.antenne}`:"Accès global";
  const isAct=p=>loc.pathname===p||loc.pathname.startsWith(p+"/");
  const curPage=items.find(i=>isAct(i.path))?.label||"Tableau de bord";

  useEffect(()=>{window.dispatchEvent(new CustomEvent("sidebar-toggle",{detail:{collapsed:col}}));},[col]);
  useEffect(()=>{const t=setInterval(()=>setTime(new Date()),1000);return()=>clearInterval(t);},[]);

  useEffect(()=>{
    (async()=>{
      try{
        const r=await fetch(CONFIG.API_CONTACT_LIST);
        if(r.ok){const d=await r.json();setCounts(p=>({...p,contacts:(Array.isArray(d)?d:d.results||[]).length}));setOnline(true);}
        const r2=await fetch(CONFIG.API_POSTULANT_LIST);
        if(r2.ok){const d=await r2.json();setCounts(p=>({...p,community:(Array.isArray(d)?d:d.results||[]).length}));}
        const r3=await fetch(CONFIG.API_ABONNEMENT_LIST);
        if(r3.ok){const d=await r3.json();setCounts(p=>({...p,newsletter:(Array.isArray(d)?d:d.results||[]).length}));}
      }catch{setOnline(false);}
    })();
  },[]);

  const loadN=async()=>{
    if(nList.length>0)return; setNLoad(true);
    try{
      const[r1,r2]=await Promise.allSettled([
        fetch(CONFIG.API_CONTACT_LIST).then(r=>r.ok?r.json():[]),
        fetch(CONFIG.API_POSTULANT_LIST).then(r=>r.ok?r.json():[]),
      ]);
      const c=r1.status==="fulfilled"?(Array.isArray(r1.value)?r1.value:r1.value?.results||[]):[];
      const p=r2.status==="fulfilled"?(Array.isArray(r2.value)?r2.value:r2.value?.results||[]):[];
      setNList([
        ...c.slice(0,3).map((x,i)=>({text:x.nom||x.name||"Nouveau message",detail:x.email||"",type:"contact",read:i>1})),
        ...p.slice(0,3).map((x,i)=>({text:x.nom_complet||x.nom||"Nouveau postulant",detail:x.formation||"",type:"candidat",read:i>0})),
      ].slice(0,6));
    }catch{}finally{setNLoad(false);}
  };

  useEffect(()=>{
    const h=e=>{if(nRef.current&&!nRef.current.contains(e.target))setNotif(false);};
    document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);
  },[]);

  const logout=()=>{localStorage.removeItem("access");localStorage.removeItem("user");nav("/login");};
  const hh=String(time.getHours()).padStart(2,"0");
  const mm=String(time.getMinutes()).padStart(2,"0");
  const ss=String(time.getSeconds()).padStart(2,"0");
  const ds=time.toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short"});

  return(
    <>
      <style>{CSS}</style>

      {/* ╔═══════════════════════════════════════════════════
          ║  SIDEBAR — Sovereign Dark                         ║
          ║  Navy #04101F → Brand #1A3B8C avec orbes vivantes ║
          ╚═══════════════════════════════════════════════════*/}
      <aside className="nv nv-side" style={{
        position:"fixed",top:0,left:0,bottom:0,width:sw,
        background:HERO_BG,
        borderRight:"1px solid rgba(93,130,255,.12)",
        boxShadow:`5px 0 70px ${DS.shHero}`,
        zIndex:300,display:"flex",flexDirection:"column",overflow:"hidden",
      }}>

        {/* ── Décors atmosphériques ── */}
        <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:0}}>

          {/* Micro-grille institutionnelle */}
          <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:.06}} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="nvgrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,1)" strokeWidth=".5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#nvgrid)"/>
          </svg>

          {/* Orbe bleue — haut gauche */}
          <div className="nv-orb1" style={{
            position:"absolute",top:"-20%",left:"-25%",
            width:380,height:380,borderRadius:"50%",
            background:"radial-gradient(circle, rgba(26,59,140,.42) 0%, rgba(61,104,255,.15) 45%, transparent 70%)",
            filter:"blur(36px)",
          }}/>
          {/* Orbe verte subtile — bas droite */}
          <div className="nv-orb2" style={{
            position:"absolute",bottom:"-15%",right:"-18%",
            width:320,height:320,borderRadius:"50%",
            background:"radial-gradient(circle,rgba(11,175,122,.12) 0%,transparent 68%)",
            filter:"blur(40px)",
          }}/>
          {/* Orbe dorée — milieu droite */}
          <div style={{
            position:"absolute",top:"42%",right:"-10%",
            width:100,height:100,borderRadius:"50%",
            background:"radial-gradient(circle,rgba(224,154,0,.16),transparent 70%)",
          }}/>
          {/* Ligne diagonale décorative */}
          <div style={{
            position:"absolute",top:"18%",left:"-10%",
            width:"130%",height:1,
            background:"linear-gradient(90deg,transparent,rgba(93,130,255,.12),transparent)",
            transform:"rotate(-12deg)",
          }}/>
        </div>

        {/* ── Barre tricolore Guinée (6px, plus affirmée) ── */}
        <div style={{position:"absolute",top:0,left:0,right:0,height:6,display:"flex",zIndex:5}}>
          <div style={{flex:1,background:"linear-gradient(90deg,#B01010,#D42020)"}}/>
          <div style={{flex:1,background:`linear-gradient(90deg,${DS.gold},${DS.goldViv})`}}/>
          <div style={{flex:1,background:`linear-gradient(90deg,${DS.green},${DS.greenLight})`}}/>
        </div>

        {/* ── LOGO ── */}
        <div style={{
          marginTop:6,position:"relative",zIndex:2,
          padding:col?"13px 0":"14px 16px",
          borderBottom:"1px solid rgba(255,255,255,.06)",
          display:"flex",alignItems:"center",
          justifyContent:col?"center":"space-between",
          flexShrink:0,minHeight:TOPBAR_H,
        }}>
          <Link to="/dashboardAdmin" style={{textDecoration:"none",display:"flex",alignItems:"center",gap:12}}>
            {/* Logo ONFPP original — cadre blanc avec halo */}
            <div style={{
              width:col?38:44,height:col?38:44,
              borderRadius:col?12:14,flexShrink:0,
              background:"#FFFFFF",
              display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:"0 0 0 1px rgba(255,255,255,.15), 0 6px 24px rgba(0,0,0,.38), 0 0 40px rgba(93,130,255,.2)",
              overflow:"hidden",
              transition:"width .28s cubic-bezier(.16,1,.3,1), height .28s, border-radius .28s",
            }}>
              <img src={logo} alt="ONFPP" style={{width:"86%",height:"86%",objectFit:"contain"}}/>
            </div>
            {!col&&(
              <div className="nv-fade">
                <p className="nv-f" style={{
                  fontSize:14.5,fontWeight:700,color:"#fff",lineHeight:1.1,letterSpacing:"-.2px",
                }}>ONFPP</p>
                <p style={{
                  fontSize:7,color:"rgba(255,255,255,.28)",fontWeight:600,
                  letterSpacing:".28em",textTransform:"uppercase",marginTop:3,
                }}>République de Guinée</p>
              </div>
            )}
          </Link>
          {!col&&(
            <button className="nv-tog" onClick={()=>setCol(true)} title="Réduire">
              <PanelLeftClose size={12}/>
            </button>
          )}
        </div>

        {/* Expand (réduit) */}
        {col&&(
          <div style={{display:"flex",justifyContent:"center",padding:"10px 0 4px",zIndex:2,position:"relative",flexShrink:0}}>
            <button className="nv-tog" onClick={()=>setCol(false)} title="Déplier" style={{width:36,height:36,borderRadius:10}}>
              <PanelLeftOpen size={12}/>
            </button>
          </div>
        )}

        {/* ── PROFIL CARD (déplié) ── */}
        {!col&&(
          <div className="nv-fade" style={{
            position:"relative",zIndex:2,
            margin:"10px 11px 6px",
            padding:"14px 14px 12px",
            borderRadius:15,
            background:"rgba(255,255,255,.062)",
            border:"1px solid rgba(255,255,255,.09)",
            backdropFilter:"blur(20px)",
          }}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              {/* Avatar avec halo de couleur rôle */}
              <div style={{position:"relative",flexShrink:0}}>
                <div style={{
                  width:44,height:44,borderRadius:13,
                  background:`linear-gradient(140deg,${rd.dot}50,${rd.dot}18)`,
                  border:"1.5px solid rgba(255,255,255,.2)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  boxShadow:`0 0 0 3px rgba(255,255,255,.06), 0 8px 22px rgba(0,0,0,.35), 0 0 28px ${rd.dot}30`,
                }}>
                  <span className="nv-f" style={{fontSize:18,fontWeight:600,fontStyle:"italic",color:"#fff",letterSpacing:"-.3px"}}>{ini}</span>
                </div>
                {/* Badge statut connexion */}
                <div style={{
                  position:"absolute",bottom:-2,right:-2,
                  width:13,height:13,borderRadius:4,
                  background:online===false?DS.rose:online?DS.greenLight:"rgba(255,255,255,.2)",
                  border:"2px solid rgba(20,30,55,.6)",
                  boxShadow:`0 0 8px ${online===false?DS.rose:online?DS.greenLight:"transparent"}60`,
                }}/>
              </div>
              <div style={{minWidth:0,flex:1}}>
                <p className="nv-f" style={{
                  fontSize:13.5,fontWeight:600,fontStyle:"italic",color:"#fff",
                  lineHeight:1.2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",letterSpacing:"-.1px",
                }}>{name}</p>
                {/* Badge rôle DARK */}
                <span style={{
                  display:"inline-flex",alignItems:"center",gap:5,marginTop:5,
                  background:rd.bg,border:`1px solid ${rd.border}`,
                  borderRadius:30,padding:"3px 10px 3px 7px",
                  fontSize:8.5,fontWeight:600,color:rd.text,letterSpacing:".04em",
                }}>
                  <span style={{width:5,height:5,borderRadius:"50%",background:rd.dot,boxShadow:`0 0 6px ${rd.dot}80`,flexShrink:0}}/>
                  {label}
                </span>
              </div>
            </div>
            {/* Périmètre */}
            <div style={{marginTop:11,paddingTop:10,borderTop:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",gap:7}}>
              <Globe size={9} color="rgba(255,255,255,.22)"/>
              <span style={{fontSize:9,color:"rgba(255,255,255,.3)",fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",letterSpacing:".02em"}}>{scope}</span>
            </div>
          </div>
        )}

        {/* Avatar mini (réduit) */}
        {col&&(
          <div style={{display:"flex",justifyContent:"center",padding:"8px 0 4px",zIndex:2,position:"relative",flexShrink:0}}>
            <div style={{
              position:"relative",width:38,height:38,borderRadius:12,
              background:`linear-gradient(140deg,${rd.dot}50,${rd.dot}18)`,
              border:"1.5px solid rgba(255,255,255,.18)",
              display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:"0 4px 18px rgba(0,0,0,.4)",
            }}>
              <span className="nv-f" style={{fontSize:14,fontWeight:600,fontStyle:"italic",color:"#fff"}}>{ini}</span>
              <div style={{position:"absolute",bottom:-2,right:-2,width:11,height:11,borderRadius:3,background:online===false?DS.rose:online?DS.greenLight:"rgba(255,255,255,.2)",border:"2px solid rgba(20,30,55,.7)"}}/>
            </div>
          </div>
        )}

        {/* ── NAV ── */}
        <nav className="nv-scroll" style={{
          flex:1,overflowY:"auto",overflowX:"hidden",
          padding:"6px 9px 10px",position:"relative",zIndex:2,
        }}>
          {!col&&<p className="nv-sec">Navigation</p>}
          {items.map((item,i)=>{
            const Icon=item.icon; const act=isAct(item.path);
            return(
              <Link key={i} to={item.path}
                className={`nv-item${act?" act":""}`}
                style={{
                  justifyContent:col?"center":"flex-start",
                  padding:col?"11px":"9px 11px",
                  margin:col?"2px 0":"1.5px 0",
                }}
              >
                <Icon size={15}
                  color={act?"#9AB0FF":"rgba(255,255,255,.36)"}
                  style={{flexShrink:0,transition:"color .15s, filter .15s",filter:act?"drop-shadow(0 0 4px rgba(93,130,255,.7))":"none"}}
                />
                <span style={{
                  fontSize:12.5,fontWeight:act?600:400,
                  color:act?"#fff":"rgba(255,255,255,.56)",
                  overflow:"hidden",whiteSpace:"nowrap",
                  opacity:col?0:1,maxWidth:col?0:195,
                  transition:"opacity .2s,max-width .28s cubic-bezier(.16,1,.3,1)",
                  letterSpacing:act?".01em":"0",
                }}>{item.label}</span>
                {col&&<span className="nv-tip">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* ── DÉCONNEXION ── */}
        <div style={{padding:"8px 9px 14px",borderTop:"1px solid rgba(255,255,255,.06)",flexShrink:0,zIndex:2,position:"relative"}}>
          <button onClick={logout} className="nv-item" style={{
            justifyContent:col?"center":"flex-start",padding:col?"11px":"9px 11px",
            background:"rgba(204,24,64,.11)",border:"1px solid rgba(204,24,64,.2)",borderRadius:10,
          }}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(204,24,64,.25)"}
          onMouseLeave={e=>e.currentTarget.style.background="rgba(204,24,64,.11)"}
          >
            <LogOut size={14} color="#FF9EAC" style={{flexShrink:0}}/>
            <span style={{
              fontSize:12.5,fontWeight:600,color:"#FF9EAC",
              overflow:"hidden",whiteSpace:"nowrap",
              opacity:col?0:1,maxWidth:col?0:190,
              transition:"opacity .2s,max-width .28s cubic-bezier(.16,1,.3,1)",
            }}>Déconnexion</span>
            {col&&<span className="nv-tip" style={{background:"#5A0A18",border:"1px solid rgba(255,100,120,.2)"}}>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* ╔═══════════════════════════════════════════════════
          ║  TOPBAR — Blanc laiteux · Détails orfèvres        ║
          ║  Barre accent tricolore · Chip profil premium     ║
          ╚═══════════════════════════════════════════════════*/}
      <header className="nv" style={{
        position:"fixed",top:0,left:sw,right:0,height:TOPBAR_H,
        background:"rgba(252,253,255,.97)",
        backdropFilter:"blur(24px) saturate(2.2)",
        borderBottom:`1px solid ${DS.divider}`,
        boxShadow:`0 1px 0 rgba(255,255,255,.95), 0 4px 30px ${DS.sh1}`,
        zIndex:200,display:"flex",alignItems:"center",
        padding:"0 22px",justifyContent:"space-between",
        transition:"left .3s cubic-bezier(.16,1,.3,1)",
      }}>

        {/* Gauche — titre page avec barre tricolore verticale */}
        <div style={{display:"flex",alignItems:"center",gap:14,minWidth:0}}>
          {/* Barre tricolore verticale — marqueur institutionnel */}
          <div style={{width:4,height:30,borderRadius:3,overflow:"hidden",flexShrink:0,display:"flex",flexDirection:"column"}}>
            <div style={{flex:1,background:DS.rose}}/>
            <div style={{flex:1,background:DS.goldViv}}/>
            <div style={{flex:1,background:DS.greenLight}}/>
          </div>
          <div>
            <p className="nv-f" style={{
              fontSize:15,fontWeight:600,fontStyle:"italic",color:DS.textPri,
              letterSpacing:"-.3px",lineHeight:1.15,
              whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:380,
            }}>{curPage}</p>
            <p style={{fontSize:9,color:DS.textMuted,fontWeight:500,marginTop:2,letterSpacing:".08em",textTransform:"uppercase"}}>
              ONFPP · Guinée
            </p>
          </div>
        </div>

        {/* Droite */}
        <div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>

          {/* Statut connexion API */}
          <div className="nv-stat">
            {online===null
              ?<><div className="nv-spin" style={{width:9,height:9,borderRadius:"50%",border:`1.5px solid ${DS.ice}`,borderTopColor:DS.brand}}/><span style={{color:DS.textMuted,fontWeight:500}}>Sync…</span></>
              :online
              ?<><div className="nv-live" style={{width:7,height:7,borderRadius:"50%",background:DS.greenLight}}/><span style={{color:DS.green,fontWeight:600}}>En ligne</span></>
              :<><div style={{width:7,height:7,borderRadius:"50%",background:DS.rose}}/><span style={{color:DS.rose,fontWeight:600}}>Hors-ligne</span></>
            }
          </div>

          {/* Horloge — flip style institutionnel */}
          <div style={{
            display:"flex",flexDirection:"column",alignItems:"flex-end",
            padding:"5px 12px",borderRadius:9,
            background:DS.iceFaint,border:`1px solid ${DS.ice}`,
            cursor:"default",
          }}>
            <span className="nv-f" style={{fontSize:13.5,fontWeight:600,color:DS.textPri,lineHeight:1,letterSpacing:".4px"}}>
              {hh}<span className="nv-blink" style={{color:DS.brand}}>:</span>{mm}
              <span style={{fontSize:10,color:DS.textMuted,fontWeight:400}}>:{ss}</span>
            </span>
            <span style={{fontSize:7.5,color:DS.textMuted,fontWeight:500,marginTop:2,textTransform:"capitalize",letterSpacing:".05em"}}>{ds}</span>
          </div>

          {/* Séparateur */}
          <div style={{width:1,height:20,background:DS.divider,margin:"0 3px"}}/>

          {/* Bell + panel notifs */}
          <div ref={nRef} style={{position:"relative"}}>
            <button className={`nv-btn${notif?" on":""}`}
              onClick={()=>{setNotif(v=>!v);if(!nList.length)loadN();}}
              title="Notifications"
            >
              <Bell size={14}/>
            </button>
            {total>0&&(
              <span className="nv-badge" style={{
                position:"absolute",top:-5,right:-5,
                minWidth:17,height:17,borderRadius:10,
                background:DS.rose,color:"#fff",fontSize:8,fontWeight:800,
                display:"flex",alignItems:"center",justifyContent:"center",padding:"0 4px",
                border:"2.5px solid #F1F3FB",
              }}>{total>99?"99+":total}</span>
            )}

            {notif&&(
              <div className="nv-panel" style={{
                position:"absolute",top:42,right:0,width:320,
                background:DS.surface,border:`1px solid ${DS.divider}`,
                borderTop:`3px solid ${DS.goldBright}`,
                borderRadius:"0 0 16px 16px",
                boxShadow:`0 24px 60px ${DS.sh2}`,
                zIndex:600,overflow:"hidden",
              }}>
                <div style={{padding:"12px 16px 10px",borderBottom:`1px solid ${DS.divider}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:DS.goldPale}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <Bell size={12} color={DS.gold}/>
                    <span className="nv-f" style={{fontSize:12.5,fontWeight:600,color:DS.textPri}}>Notifications</span>
                    {total>0&&<span style={{fontSize:9,color:DS.gold,fontWeight:700,background:`${DS.gold}22`,padding:"2px 7px",borderRadius:20}}>{total}</span>}
                  </div>
                  <button onClick={()=>setNotif(false)} style={{width:20,height:20,borderRadius:5,background:DS.divider,border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                    <X size={9} color={DS.textMuted}/>
                  </button>
                </div>
                <div style={{maxHeight:280,overflowY:"auto"}}>
                  {nLoad&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",gap:8}}>
                    <div className="nv-spin" style={{width:15,height:15,borderRadius:"50%",border:`2px solid ${DS.ice}`,borderTopColor:DS.goldViv}}/>
                    <span style={{fontSize:11,color:DS.textMuted}}>Chargement…</span>
                  </div>}
                  {!nLoad&&<>
                    {counts.contacts>0&&<Link to="/contacts" onClick={()=>setNotif(false)} style={{textDecoration:"none"}}>
                      <div className="nv-ni" style={{padding:"11px 16px",borderBottom:`1px solid ${DS.divider}`,display:"flex",gap:10,background:`${DS.rose}06`}}>
                        <div style={{width:7,height:7,borderRadius:"50%",background:DS.rose,flexShrink:0,marginTop:4,boxShadow:`0 0 0 3px ${DS.rose}22`}}/>
                        <div style={{flex:1}}>
                          <p style={{fontSize:12,fontWeight:700,color:DS.textPri}}>Messages en attente</p>
                          <p style={{fontSize:10.5,color:DS.textMuted,marginTop:1}}>{counts.contacts} non traité(s)</p>
                        </div>
                        <span style={{fontSize:8.5,color:DS.rose,fontWeight:700,background:`${DS.rose}12`,padding:"2px 7px",borderRadius:5,flexShrink:0}}>Urgent</span>
                      </div>
                    </Link>}
                    {counts.community>0&&<Link to="/listeCandidats" onClick={()=>setNotif(false)} style={{textDecoration:"none"}}>
                      <div className="nv-ni" style={{padding:"11px 16px",borderBottom:`1px solid ${DS.divider}`,display:"flex",gap:10}}>
                        <div style={{width:7,height:7,borderRadius:"50%",background:DS.electric,flexShrink:0,marginTop:4}}/>
                        <div style={{flex:1}}>
                          <p style={{fontSize:12,fontWeight:700,color:DS.textPri}}>Candidatures</p>
                          <p style={{fontSize:10.5,color:DS.textMuted,marginTop:1}}>{counts.community} à examiner</p>
                        </div>
                      </div>
                    </Link>}
                    {counts.newsletter>0&&<Link to="/newsletter" onClick={()=>setNotif(false)} style={{textDecoration:"none"}}>
                      <div className="nv-ni" style={{padding:"11px 16px",borderBottom:`1px solid ${DS.divider}`,display:"flex",gap:10}}>
                        <div style={{width:7,height:7,borderRadius:"50%",background:DS.violet,flexShrink:0,marginTop:4}}/>
                        <div style={{flex:1}}>
                          <p style={{fontSize:12,fontWeight:700,color:DS.textPri}}>Newsletter</p>
                          <p style={{fontSize:10.5,color:DS.textMuted,marginTop:1}}>{counts.newsletter} nouveau(x)</p>
                        </div>
                      </div>
                    </Link>}
                    {nList.map((n,i)=>(
                      <div key={i} className="nv-ni" style={{padding:"10px 16px",borderBottom:i<nList.length-1?`1px solid ${DS.divider}`:"none",display:"flex",gap:10}}>
                        <div style={{width:7,height:7,borderRadius:"50%",flexShrink:0,marginTop:4,background:n.read?DS.divider:DS.electric}}/>
                        <div style={{flex:1,minWidth:0}}>
                          <p style={{fontSize:11.5,fontWeight:n.read?400:600,color:DS.textPri,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.text}</p>
                          {n.detail&&<p style={{fontSize:10,color:DS.textMuted,marginTop:1}}>{n.detail}</p>}
                        </div>
                      </div>
                    ))}
                    {total===0&&nList.length===0&&(
                      <div style={{textAlign:"center",padding:"24px 16px"}}>
                        <CheckCircle2 size={20} color={DS.green} style={{margin:"0 auto 8px",display:"block",opacity:.4}}/>
                        <p style={{fontSize:12,color:DS.textMuted,fontWeight:600}}>Aucune notification</p>
                      </div>
                    )}
                  </>}
                </div>
                {total>0&&<div style={{padding:"10px 16px 12px",borderTop:`1px solid ${DS.divider}`,textAlign:"center"}}>
                  <Link to="/notifications" onClick={()=>setNotif(false)} style={{fontSize:11.5,fontWeight:700,color:DS.brand,textDecoration:"none"}}>Voir tout →</Link>
                </div>}
              </div>
            )}
          </div>

          {/* Séparateur */}
          <div style={{width:1,height:20,background:DS.divider,margin:"0 3px"}}/>

          {/* ── CHIP PROFIL — premium glass look ── */}
          <div className="nv-chip" style={{
            display:"flex",alignItems:"center",gap:9,
            padding:"5px 13px 5px 5px",borderRadius:11,
            border:`1px solid ${DS.divider}`,
            background:`linear-gradient(135deg,${DS.lift},${DS.iceFaint})`,
            boxShadow:`0 2px 8px ${DS.sh1}`,
          }}>
            {/* Avatar brand blue avec initiales */}
            <div style={{
              width:34,height:34,borderRadius:10,flexShrink:0,
              background:`linear-gradient(135deg,${DS.brand},${DS.brandViv})`,
              display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:`0 4px 14px ${DS.brandGlow}`,
            }}>
              <span className="nv-f" style={{fontSize:13,fontWeight:600,fontStyle:"italic",color:"#fff",letterSpacing:"-.1px"}}>{ini}</span>
            </div>
            <div style={{minWidth:0}}>
              <p className="nv-f" style={{
                fontSize:12.5,fontWeight:600,fontStyle:"italic",color:DS.textPri,
                lineHeight:1.2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:134,
                letterSpacing:"-.1px",
              }}>{name}</p>
              {/* Badge LIGHT sur fond clair */}
              <span style={{
                display:"inline-flex",alignItems:"center",gap:4,marginTop:3,
                background:rl.bg,border:`1px solid ${rl.border}`,
                borderRadius:20,padding:"1.5px 8px 1.5px 5px",
                fontSize:8.5,fontWeight:600,color:rl.text,
              }}>
                <span style={{width:4,height:4,borderRadius:"50%",background:rl.dot,flexShrink:0}}/>
                {label}
              </span>
            </div>
          </div>

        </div>
      </header>
    </>
  );
}