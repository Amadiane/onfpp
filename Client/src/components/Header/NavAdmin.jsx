import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, GraduationCap,
  ClipboardList, Award, Settings, LogOut,
  Bell, FileText, CalendarDays, Package, Layers,
  CheckCircle2, Briefcase, UserCog, Clock,
  AlertTriangle, X, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import CONFIG from "../../config/config.js";
import logo from "../../assets/logo.png";

const C = {
  sideBg:"#FFFFFF", sideBorder:"#EDF0FA", sideHov:"#F4F6FF",
  sideAct:"#EEF2FF", sideActLine:"#1A3BD4", sideLabel:"#3B4F82",
  sideLabelDim:"#9BADD4", sideSection:"#B8C4E0",
  navy:"#08122E", navyMid:"#0D1B5E", blue:"#1A3BD4", blueSoft:"#2E50E8",
  iceBlue:"#D6E0FF", iceBluePale:"#EEF2FF", divider:"#EDF0FA",
  textPri:"#08122E", textSub:"#3B4F82", textMuted:"#7B8EC4",
  accent:"#E8A000", accentBg:"#FFF8E6",
  success:"#047857", emerald:"#10B981", purple:"#5B21B6",
  danger:"#B91C1C", shadow:"rgba(8,18,46,0.08)", shadowMd:"rgba(8,18,46,0.13)",
};

export const SIDEBAR_W  = 248;
export const SIDEBAR_SM = 64;
export const TOPBAR_H   = 60;

const ROLE_LABELS = {
  DG:"Directeur Général",CD:"Chef de Division",DR:"Directeur Régional",
  CC:"Chef de Centre",FORMATEUR:"Formateur",SUPERADMIN:"Super Administrateur",
  "Directeur Général":"Directeur Général","Chef de Division":"Chef de Division",
  "Directeur Régional":"Directeur Régional","Chef de Centre":"Chef de Centre",
  "Formateur":"Formateur","Super Administrateur":"Super Administrateur",
  "Chef d'Antenne":"Chef d'Antenne","Conseiller":"Conseiller",
};

const ROLE_COLORS = {
  default:{ bg:"#EEF2FF",text:"#1A3BD4",dot:"#1A3BD4" },
  DR:{ bg:"#ECFDF5",text:"#047857",dot:"#10B981" },
  CC:{ bg:"#FFF7ED",text:"#B45309",dot:"#F59E0B" },
  FORMATEUR:{ bg:"#F0F9FF",text:"#0369A1",dot:"#0EA5E9" },
  SUPERADMIN:{ bg:"#FFF1F2",text:"#B91C1C",dot:"#F43F5E" },
  "Chef d'Antenne":{ bg:"#F5F3FF",text:"#5B21B6",dot:"#7C3AED" },
};
const rc = (role) => ROLE_COLORS[role] || ROLE_COLORS[
  role==="Directeur Régional"?"DR":role==="Chef de Centre"?"CC":
  (role==="Formateur"||role==="FORMATEUR")?"FORMATEUR":
  (role==="Super Administrateur"||role==="SUPERADMIN")?"SUPERADMIN":"default"
] || ROLE_COLORS.default;

const ALL = ["DG","CD","DR","CC","FORMATEUR","SUPERADMIN",
  "Directeur Général","Chef de Division","Directeur Régional",
  "Chef de Centre","Formateur","Super Administrateur","Chef d'Antenne","Conseiller"];
const MGMT = ["DG","CD","DR","Directeur Général","Chef de Division","Directeur Régional"];
const OPS  = ["CC","FORMATEUR","Chef de Centre","Formateur"];
const ADM  = ["DG","CD","SUPERADMIN","Directeur Général","Chef de Division","Super Administrateur"];

const NAV_DEF = [
  { path:"/dashboardAdmin",    label:"Tableau de bord",      icon:LayoutDashboard, roles:ALL },
  { path:"/formations",        label:"Catalogue formations", icon:BookOpen,        roles:ALL.filter(r=>!["SUPERADMIN","Super Administrateur"].includes(r)) },
  { path:"/sessions",          label:"Sessions planifiées",  icon:CalendarDays,    roles:ALL.filter(r=>!["SUPERADMIN","Super Administrateur"].includes(r)) },
  { path:"/certifications",    label:"Certifications",       icon:Award,           roles:ALL.filter(r=>!["SUPERADMIN","Super Administrateur"].includes(r)) },
  { path:"/inscription",       label:"Inscriptions",         icon:GraduationCap,   roles:ALL.filter(r=>!["SUPERADMIN","Super Administrateur"].includes(r)) },
  { path:"/listeApprenants",   label:"Liste Apprenants",     icon:ClipboardList,   roles:ALL.filter(r=>!["SUPERADMIN","Super Administrateur"].includes(r)) },
  { path:"/presences",         label:"Présences",            icon:CalendarDays,    roles:[...MGMT,...OPS] },
  { path:"/evaluations",       label:"Évaluations",          icon:Award,           roles:[...MGMT,...OPS] },
  { path:"/discipline",        label:"Discipline",           icon:AlertTriangle,   roles:OPS },
  { path:"/suiviEvaluation",   label:"Suivi Évaluation",     icon:CheckCircle2,    roles:MGMT },
  { path:"/attestations",      label:"Attestations PDF",     icon:FileText,        roles:[...MGMT,...OPS] },
  { path:"/enquete-insertion", label:"Enquête insertion",    icon:Clock,           roles:[...MGMT,"CC","Chef de Centre"] },
  { path:"/resultats",         label:"Résultats finaux",     icon:CheckCircle2,    roles:OPS },
  { path:"/entreprise",        label:"Entreprises",          icon:Briefcase,       roles:MGMT },
  { path:"/formationContinue", label:"Formation DFC",        icon:Package,         roles:MGMT },
  { path:"/formateurs",        label:"Formateurs",           icon:UserCog,         roles:MGMT },
  { path:"/formationDAPc",     label:"Formation DAPC",       icon:Package,         roles:MGMT },
  { path:"/addUser",           label:"Gestion utilisateurs", icon:UserCog,         roles:ADM },
  { path:"/homePost",          label:"Contenu site public",  icon:Layers,          roles:["DG","CD","Directeur Général","Chef de Division"] },
  { path:"/parametres",        label:"Paramètres",           icon:Settings,        roles:ADM },
];

const buildNavItems = (role) => {
  const seen = new Set();
  return NAV_DEF.filter(item => {
    if (seen.has(item.path) || !item.roles.includes(role)) return false;
    seen.add(item.path); return true;
  });
};

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    if (raw) {
      const u = JSON.parse(raw);
      const rr = u.role;
      const roleName = typeof rr==="object"&&rr!==null ? (rr.name||"DG") : (rr||"DG");
      const fn=u.first_name||u.firstName||"", ln=u.last_name||u.lastName||"";
      const displayName = fn ? `${fn}${ln?" "+ln:""}` : u.username||u.email||"Admin";
      return { ...u, role:roleName, displayName, username:u.username||u.email||displayName, division:u.division||null, antenne:u.antenne||null };
    }
    const token = localStorage.getItem("access");
    if (token) {
      const p = JSON.parse(atob(token.split(".")[1]));
      const rr=p.role, roleName=typeof rr==="object"&&rr!==null?(rr.name||"DG"):(rr||"DG");
      const fn=p.first_name||"", ln=p.last_name||"";
      const displayName=fn?`${fn}${ln?" "+ln:""}`:p.username||p.email||"Admin";
      return { username:p.username||p.email||displayName, displayName, role:roleName, division:p.division||null, antenne:p.antenne||null };
    }
  } catch {}
  return { username:"Admin", displayName:"Admin", role:"DG" };
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
  .na-root*,.na-root*::before,.na-root*::after{box-sizing:border-box}
  .na-root,.na-root *:not(style){font-family:'DM Sans',sans-serif!important;-webkit-font-smoothing:antialiased}

  .na-si{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;cursor:pointer;
    text-decoration:none;border:none;background:transparent;
    transition:background .13s ease,transform .11s ease;
    position:relative;overflow:visible;width:100%}
  .na-si:hover{background:#F4F6FF;transform:translateX(1px)}
  .na-si.act{background:#EEF2FF}
  .na-si.act::before{content:'';position:absolute;left:0;top:18%;bottom:18%;
    width:3px;border-radius:0 3px 3px 0;background:#1A3BD4}

  .na-lbl{overflow:hidden;white-space:nowrap;
    transition:opacity .18s ease,max-width .25s cubic-bezier(.22,1,.36,1)}

  .na-tip{position:absolute;left:calc(100% + 13px);top:50%;transform:translateY(-50%);
    background:#08122E;color:#fff;font-size:11.5px;font-weight:600;white-space:nowrap;
    padding:6px 11px;border-radius:8px;pointer-events:none;opacity:0;
    transition:opacity .13s ease;z-index:9999;box-shadow:0 6px 20px rgba(8,18,46,.12)}
  .na-tip::before{content:'';position:absolute;right:100%;top:50%;transform:translateY(-50%);
    border:5px solid transparent;border-right-color:#08122E}
  .na-si:hover .na-tip{opacity:1}

  .na-scroll::-webkit-scrollbar{width:2px}
  .na-scroll::-webkit-scrollbar-track{background:transparent}
  .na-scroll::-webkit-scrollbar-thumb{background:#D6E0FF;border-radius:2px}

  .na-sidebar{transition:width .25s cubic-bezier(.22,1,.36,1);will-change:width}

  @keyframes naSlideDown{from{opacity:0;transform:translateY(-6px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}
  .na-panel{animation:naSlideDown .16s cubic-bezier(.22,1,.36,1) both}

  .na-ni{transition:background .1s;cursor:pointer}
  .na-ni:hover{background:#EEF2FF!important}

  @keyframes naPulse{0%,100%{box-shadow:0 0 0 0 rgba(232,160,0,.5)}60%{box-shadow:0 0 0 5px transparent}}
  .na-badge{animation:naPulse 2.5s ease infinite}

  @keyframes naSpin{to{transform:rotate(360deg)}}
  .na-spin{animation:naSpin .7s linear infinite}

  .na-tb{width:34px;height:34px;border-radius:8px;border:1px solid #EDF0FA;
    background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;
    color:#7B8EC4;transition:all .13s ease}
  .na-tb:hover{background:#EEF2FF;color:#08122E;border-color:#D6E0FF}
  .na-tb.on{background:#1A3BD408;color:#1A3BD4;border-color:#1A3BD428}

  .na-tog{width:26px;height:26px;border-radius:6px;border:1px solid #EDF0FA;
    background:#EEF2FF;cursor:pointer;display:flex;align-items:center;justify-content:center;
    color:#7B8EC4;transition:all .13s ease;flex-shrink:0}
  .na-tog:hover{background:#D6E0FF;color:#1A3BD4;border-color:#D6E0FF}
`;

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
  const badge       = rc(role);
  const navItems    = buildNavItems(role);
  const totalNotifs = counts.contacts + counts.community + counts.newsletter;
  const sideW       = collapsed ? SIDEBAR_SM : SIDEBAR_W;
  const perimetre   = user.division ? `Div. ${user.division}` : user.antenne ? `Antenne ${user.antenne}` : null;

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("sidebar-toggle", { detail:{ collapsed } }));
  }, [collapsed]);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const r1=await fetch(CONFIG.API_CONTACT_LIST);
        if(r1.ok){const d=await r1.json();setCounts(p=>({...p,contacts:(Array.isArray(d)?d:d.results||[]).length}));}
        const r2=await fetch(CONFIG.API_POSTULANT_LIST);
        if(r2.ok){const d=await r2.json();setCounts(p=>({...p,community:(Array.isArray(d)?d:d.results||[]).length}));}
        const r3=await fetch(CONFIG.API_ABONNEMENT_LIST);
        if(r3.ok){const d=await r3.json();setCounts(p=>({...p,newsletter:(Array.isArray(d)?d:d.results||[]).length}));}
      } catch {}
    })();
  }, []);

  const loadNotifs = async () => {
    if (notifData.length > 0) return;
    setNotifLoading(true);
    try {
      const [r1,r2] = await Promise.allSettled([
        fetch(CONFIG.API_CONTACT_LIST).then(r=>r.ok?r.json():[]),
        fetch(CONFIG.API_POSTULANT_LIST).then(r=>r.ok?r.json():[]),
      ]);
      const c=r1.status==="fulfilled"?(Array.isArray(r1.value)?r1.value:r1.value?.results||[]):[];
      const p=r2.status==="fulfilled"?(Array.isArray(r2.value)?r2.value:r2.value?.results||[]):[];
      setNotifData([
        ...c.slice(0,3).map((x,i)=>({text:x.nom||x.name||x.sujet||"Nouveau message",detail:x.email||"",type:"contact",read:i>1})),
        ...p.slice(0,3).map((x,i)=>({text:x.nom_complet||x.nom||"Nouveau postulant",detail:x.formation||"",type:"candidat",read:i>0})),
      ].slice(0,6));
    } catch {}
    finally { setNotifLoading(false); }
  };

  useEffect(() => {
    const h = e => { if(notifRef.current&&!notifRef.current.contains(e.target)) setShowNotif(false); };
    document.addEventListener("mousedown",h);
    return () => document.removeEventListener("mousedown",h);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access"); localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = p => location.pathname===p || location.pathname.startsWith(p+"/");
  const heure   = time.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
  const dateStr = time.toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short"});

  return (
    <>
      <style>{STYLES}</style>

      {/* ══ SIDEBAR ══ */}
      <aside className="na-root na-sidebar" style={{
        position:"fixed",top:0,left:0,bottom:0,width:sideW,
        background:C.sideBg,
        borderRight:`1px solid ${C.sideBorder}`,
        boxShadow:`2px 0 20px ${C.shadow}`,
        zIndex:300,display:"flex",flexDirection:"column",overflow:"hidden",
      }}>

        {/* Barre tricolore Guinée */}
        <div style={{position:"absolute",top:0,left:0,right:0,height:3,display:"flex",zIndex:1,flexShrink:0}}>
          <div style={{flex:1,background:"#CE1126"}}/>
          <div style={{flex:1,background:C.accent}}/>
          <div style={{flex:1,background:"#009460"}}/>
        </div>

        {/* Header : logo + toggle */}
        <div style={{
          marginTop:3,
          padding: collapsed ? "14px 0" : "14px 14px",
          borderBottom:`1px solid ${C.sideBorder}`,
          display:"flex",alignItems:"center",
          justifyContent: collapsed ? "center" : "space-between",
          flexShrink:0,minHeight:60,
        }}>
          <Link to="/dashboardAdmin" style={{textDecoration:"none",display:"flex",alignItems:"center"}}>
            <img src={logo} alt="ONFPP" style={{
              height: collapsed ? 26 : 34,
              width:"auto",objectFit:"contain",
              transition:"height .25s cubic-bezier(.22,1,.36,1)",
            }}/>
          </Link>
          {!collapsed && (
            <button className="na-tog" onClick={()=>setCollapsed(true)} title="Réduire">
              <PanelLeftClose size={12}/>
            </button>
          )}
        </div>

        {/* Expand btn (collapsed) */}
        {collapsed && (
          <div style={{display:"flex",justifyContent:"center",paddingTop:10,flexShrink:0}}>
            <button className="na-tog" onClick={()=>setCollapsed(false)} title="Déplier" style={{width:32,height:32,borderRadius:8}}>
              <PanelLeftOpen size={12}/>
            </button>
          </div>
        )}

        {/* Profil (déplié) */}
        {!collapsed && (
          <div style={{
            margin:"10px 10px 2px",padding:"10px 12px",
            borderRadius:10,background:C.iceBluePale,
            border:`1px solid ${C.iceBlue}55`,
          }}>
            <div style={{display:"flex",alignItems:"center",gap:9}}>
              <div style={{
                width:34,height:34,borderRadius:9,flexShrink:0,
                background:`linear-gradient(135deg,${C.navy},${C.blue})`,
                display:"flex",alignItems:"center",justifyContent:"center",
                boxShadow:`0 2px 10px ${C.blue}22`,
              }}>
                <span style={{fontSize:11,fontWeight:800,color:"#fff",letterSpacing:"-0.3px"}}>{initials}</span>
              </div>
              <div style={{minWidth:0,flex:1}}>
                <p style={{fontSize:12,fontWeight:700,color:C.textPri,lineHeight:1.25,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{displayName}</p>
                <div style={{display:"inline-flex",alignItems:"center",gap:4,marginTop:4,background:badge.bg,borderRadius:20,padding:"2px 8px 2px 5px"}}>
                  <div style={{width:5,height:5,borderRadius:"50%",background:badge.dot,flexShrink:0}}/>
                  <span style={{fontSize:8.5,fontWeight:700,color:badge.text,letterSpacing:".03em",whiteSpace:"nowrap"}}>{roleLabel}</span>
                </div>
              </div>
            </div>
            {perimetre && (
              <div style={{marginTop:8,paddingTop:8,borderTop:`1px solid ${C.iceBlue}55`,display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:4,height:4,borderRadius:1,background:C.textMuted,flexShrink:0,transform:"rotate(45deg)"}}/>
                <span style={{fontSize:9.5,color:C.textMuted,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{perimetre}</span>
              </div>
            )}
          </div>
        )}

        {/* Avatar seul (réduit) */}
        {collapsed && (
          <div style={{display:"flex",justifyContent:"center",padding:"8px 0 4px",flexShrink:0}}>
            <div style={{
              width:32,height:32,borderRadius:8,
              background:`linear-gradient(135deg,${C.navy},${C.blue})`,
              display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:`0 2px 8px ${C.blue}20`,
            }}>
              <span style={{fontSize:10.5,fontWeight:800,color:"#fff"}}>{initials}</span>
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav className="na-scroll" style={{flex:1,overflowY:"auto",overflowX:"hidden",padding:"6px 8px 10px"}}>
          {!collapsed && (
            <p style={{fontSize:7.5,fontWeight:700,color:C.sideSection,textTransform:"uppercase",letterSpacing:".2em",padding:"6px 8px 3px",marginBottom:1}}>
              Menu
            </p>
          )}
          {navItems.map((item,i) => {
            const Icon=item.icon, active=isActive(item.path);
            return (
              <Link key={i} to={item.path} className={`na-si${active?" act":""}`} style={{
                justifyContent: collapsed?"center":"flex-start",
                padding: collapsed?"9px":"8px 10px",
                margin: collapsed?"2px 0":"1px 0",
              }}>
                <Icon size={14} color={active?C.blue:C.sideLabelDim} style={{flexShrink:0,transition:"color .13s"}}/>
                <span className="na-lbl" style={{
                  fontSize:12.5, fontWeight:active?700:500,
                  color:active?C.blue:C.sideLabel,
                  opacity:collapsed?0:1, maxWidth:collapsed?0:180,
                }}>{item.label}</span>
                {collapsed && <span className="na-tip">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Déconnexion */}
        <div style={{padding: collapsed?"8px 8px 14px":"8px 8px 14px", borderTop:`1px solid ${C.sideBorder}`,flexShrink:0}}>
          <button onClick={handleLogout} className="na-si" style={{
            justifyContent:collapsed?"center":"flex-start",
            padding:collapsed?"9px":"8px 10px",
            background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8,
          }}
            onMouseEnter={e=>e.currentTarget.style.background="#FEE2E2"}
            onMouseLeave={e=>e.currentTarget.style.background="#FEF2F2"}
          >
            <LogOut size={14} color={C.danger} style={{flexShrink:0}}/>
            <span className="na-lbl" style={{fontSize:12.5,fontWeight:600,color:C.danger,opacity:collapsed?0:1,maxWidth:collapsed?0:180}}>
              Déconnexion
            </span>
            {collapsed && <span className="na-tip" style={{background:C.danger}}>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* ══ TOPBAR ══ */}
      <header className="na-root" style={{
        position:"fixed",top:0,left:sideW,right:0,
        height:TOPBAR_H,
        background:"rgba(255,255,255,0.97)",
        backdropFilter:"blur(14px)",
        borderBottom:`1px solid ${C.sideBorder}`,
        boxShadow:`0 1px 0 #fff, 0 2px 16px ${C.shadow}`,
        zIndex:200,
        display:"flex",alignItems:"center",
        padding:"0 24px",justifyContent:"space-between",
        transition:"left .25s cubic-bezier(.22,1,.36,1)",
      }}>

        {/* Gauche : titre page */}
        <div style={{display:"flex",alignItems:"center",gap:12,minWidth:0}}>
          {/* Accent barre bleue */}
          <div style={{
            width:3,height:20,borderRadius:2,flexShrink:0,
            background:`linear-gradient(180deg,${C.blue},${C.blueSoft})`,
          }}/>
          <div>
            <p style={{
              fontSize:14,fontWeight:700,color:C.textPri,
              letterSpacing:"-0.3px",lineHeight:1.2,
              whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:360,
            }}>
              {navItems.find(i=>isActive(i.path))?.label || "Tableau de bord"}
            </p>
            <p style={{fontSize:9,color:C.textMuted,fontWeight:500,marginTop:1,letterSpacing:".03em"}}>
              ONFPP · Plateforme de Formation Professionnelle
            </p>
          </div>
        </div>

        {/* Droite */}
        <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>

          {/* Heure/date */}
          <div style={{
            display:"flex",flexDirection:"column",alignItems:"flex-end",
            padding:"4px 11px",borderRadius:8,
            background:C.iceBluePale,border:`1px solid ${C.iceBlue}70`,
          }}>
            <span style={{fontSize:12.5,fontWeight:700,color:C.textPri,lineHeight:1,letterSpacing:"-0.2px"}}>{heure}</span>
            <span style={{fontSize:8,color:C.textMuted,fontWeight:500,marginTop:1.5,textTransform:"capitalize",letterSpacing:".03em"}}>{dateStr}</span>
          </div>

          <div style={{width:1,height:20,background:C.divider,margin:"0 2px"}}/>

          {/* Notifications */}
          <div ref={notifRef} style={{position:"relative"}}>
            <button className={`na-tb${showNotif?" on":""}`}
              onClick={()=>{setShowNotif(v=>!v);if(!notifData.length)loadNotifs();}}
              title="Notifications"
            >
              <Bell size={14}/>
            </button>
            {totalNotifs>0 && (
              <span className="na-badge" style={{
                position:"absolute",top:-3,right:-3,
                minWidth:15,height:15,borderRadius:9,
                background:C.accent,color:"#fff",
                fontSize:7.5,fontWeight:800,
                display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px",
                border:"2px solid #fff",
              }}>{totalNotifs>99?"99+":totalNotifs}</span>
            )}

            {showNotif && (
              <div className="na-panel" style={{
                position:"absolute",top:42,right:0,width:310,
                background:"#fff",border:`1px solid ${C.divider}`,
                borderTop:`3px solid ${C.accent}`,
                borderRadius:"0 0 14px 14px",
                boxShadow:`0 20px 56px ${C.shadowMd}`,
                zIndex:600,overflow:"hidden",
              }}>
                <div style={{padding:"11px 15px 9px",borderBottom:`1px solid ${C.divider}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:C.accentBg}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <Bell size={12} color={C.accent}/>
                    <span style={{fontSize:12,fontWeight:700,color:C.textPri}}>Notifications</span>
                    {totalNotifs>0&&<span style={{fontSize:8.5,color:C.accent,fontWeight:700,background:`${C.accent}22`,padding:"2px 7px",borderRadius:20}}>{totalNotifs}</span>}
                  </div>
                  <button onClick={()=>setShowNotif(false)} style={{width:20,height:20,borderRadius:5,background:C.divider,border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                    <X size={9} color={C.textMuted}/>
                  </button>
                </div>
                <div style={{maxHeight:290,overflowY:"auto"}}>
                  {notifLoading&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",gap:8}}>
                    <div className="na-spin" style={{width:16,height:16,borderRadius:"50%",border:`2px solid ${C.iceBlue}`,borderTopColor:C.accent}}/>
                    <span style={{fontSize:11,color:C.textMuted}}>Chargement…</span>
                  </div>}
                  {!notifLoading&&<>
                    {counts.contacts>0&&<Link to="/contacts" onClick={()=>setShowNotif(false)} style={{textDecoration:"none"}}>
                      <div className="na-ni" style={{padding:"10px 15px",borderBottom:`1px solid ${C.divider}`,display:"flex",gap:9,background:`${C.danger}04`}}>
                        <div style={{width:6,height:6,borderRadius:"50%",background:C.danger,flexShrink:0,marginTop:4,boxShadow:`0 0 0 3px ${C.danger}18`}}/>
                        <div style={{flex:1}}>
                          <p style={{fontSize:11.5,fontWeight:700,color:C.textPri}}>Messages en attente</p>
                          <p style={{fontSize:10,color:C.textMuted,marginTop:1}}>{counts.contacts} non traité(s)</p>
                        </div>
                        <span style={{fontSize:8,color:C.danger,fontWeight:700,background:`${C.danger}12`,padding:"2px 6px",borderRadius:4,flexShrink:0,alignSelf:"flex-start"}}>Urgent</span>
                      </div>
                    </Link>}
                    {counts.community>0&&<Link to="/listeCandidats" onClick={()=>setShowNotif(false)} style={{textDecoration:"none"}}>
                      <div className="na-ni" style={{padding:"10px 15px",borderBottom:`1px solid ${C.divider}`,display:"flex",gap:9,background:`${C.blue}04`}}>
                        <div style={{width:6,height:6,borderRadius:"50%",background:C.blue,flexShrink:0,marginTop:4,boxShadow:`0 0 0 3px ${C.blue}18`}}/>
                        <div style={{flex:1}}>
                          <p style={{fontSize:11.5,fontWeight:700,color:C.textPri}}>Nouvelles candidatures</p>
                          <p style={{fontSize:10,color:C.textMuted,marginTop:1}}>{counts.community} à examiner</p>
                        </div>
                      </div>
                    </Link>}
                    {counts.newsletter>0&&<Link to="/newsletter" onClick={()=>setShowNotif(false)} style={{textDecoration:"none"}}>
                      <div className="na-ni" style={{padding:"10px 15px",borderBottom:`1px solid ${C.divider}`,display:"flex",gap:9,background:`${C.purple}04`}}>
                        <div style={{width:6,height:6,borderRadius:"50%",background:C.purple,flexShrink:0,marginTop:4}}/>
                        <div style={{flex:1}}>
                          <p style={{fontSize:11.5,fontWeight:700,color:C.textPri}}>Abonnements newsletter</p>
                          <p style={{fontSize:10,color:C.textMuted,marginTop:1}}>{counts.newsletter} nouvel(aux)</p>
                        </div>
                      </div>
                    </Link>}
                    {notifData.map((n,i)=>(
                      <div key={i} className="na-ni" style={{padding:"9px 15px",borderBottom:i<notifData.length-1?`1px solid ${C.divider}`:"none",display:"flex",gap:9,background:n.read?"transparent":`${C.blue}03`}}>
                        <div style={{width:6,height:6,borderRadius:"50%",flexShrink:0,marginTop:4,background:n.read?C.divider:C.blue}}/>
                        <div style={{flex:1,minWidth:0}}>
                          <p style={{fontSize:11,fontWeight:n.read?500:700,color:C.textPri,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.text}</p>
                          {n.detail&&<p style={{fontSize:9.5,color:C.textMuted,marginTop:1}}>{n.detail}</p>}
                        </div>
                        <span style={{fontSize:7.5,color:n.type==="contact"?C.accent:C.blue,background:n.type==="contact"?`${C.accent}12`:`${C.blue}0E`,padding:"2px 5px",borderRadius:4,fontWeight:700,flexShrink:0}}>{n.type}</span>
                      </div>
                    ))}
                    {totalNotifs===0&&notifData.length===0&&<div style={{textAlign:"center",padding:"22px 16px"}}>
                      <CheckCircle2 size={20} color={C.success} style={{margin:"0 auto 8px",display:"block",opacity:.4}}/>
                      <p style={{fontSize:11.5,color:C.textMuted,fontWeight:600}}>Aucune notification</p>
                    </div>}
                  </>}
                </div>
                {totalNotifs>0&&<div style={{padding:"9px 15px 11px",borderTop:`1px solid ${C.divider}`,textAlign:"center"}}>
                  <Link to="/notifications" onClick={()=>setShowNotif(false)} style={{fontSize:11,fontWeight:600,color:C.blue,textDecoration:"none"}}>Voir tout →</Link>
                </div>}
              </div>
            )}
          </div>

          <div style={{width:1,height:20,background:C.divider,margin:"0 2px"}}/>

          {/* Chip profil */}
          <div style={{
            display:"flex",alignItems:"center",gap:8,
            padding:"4px 11px 4px 4px",borderRadius:9,
            border:`1px solid ${C.divider}`,background:"#FAFBFF",cursor:"default",
            transition:"border-color .13s",
          }}
            onMouseEnter={e=>e.currentTarget.style.borderColor=C.iceBlue}
            onMouseLeave={e=>e.currentTarget.style.borderColor=C.divider}
          >
            <div style={{
              width:28,height:28,borderRadius:7,flexShrink:0,
              background:`linear-gradient(135deg,${C.navy},${C.blue})`,
              display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:`0 2px 8px ${C.blue}20`,
            }}>
              <span style={{fontSize:10,fontWeight:800,color:"#fff",letterSpacing:"-0.2px"}}>{initials}</span>
            </div>
            <div style={{minWidth:0}}>
              <p style={{fontSize:11.5,fontWeight:700,color:C.textPri,lineHeight:1.2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:130}}>{displayName}</p>
              <div style={{display:"flex",alignItems:"center",gap:4,marginTop:2}}>
                <div style={{width:4,height:4,borderRadius:"50%",background:badge.dot,flexShrink:0}}/>
                <span style={{fontSize:8.5,fontWeight:600,color:C.textMuted,textTransform:"uppercase",letterSpacing:".05em",whiteSpace:"nowrap"}}>{roleLabel}</span>
              </div>
            </div>
          </div>

        </div>
      </header>
    </>
  );
};

export default NavAdmin;