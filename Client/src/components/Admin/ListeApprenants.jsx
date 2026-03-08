import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import CONFIG from "../../config/config.js";
import {
  Users, Search, RefreshCw, Loader2, ChevronLeft, ChevronRight,
  Eye, Pencil, Trash2, X, Check, ChevronDown, ChevronUp,
  GraduationCap, MapPin, User, Calendar, Phone, Mail,
  Briefcase, Award, Building2, CheckCircle2, AlertTriangle,
  Clock, BookOpen, TrendingUp, Filter, Download, MoreVertical,
  Hash, ArrowUpRight, Save, XCircle,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   PALETTE — identique DashboardAdmin
═══════════════════════════════════════════════════════════════════ */
const C = {
  page:"#F8F9FD",pageAlt:"#EEF2FF",surface:"#FFFFFF",surfaceEl:"#F4F7FF",
  navy:"#06102A",navyMid:"#0C1D5F",blue:"#1635C8",blueViv:"#2447E0",
  iceBlue:"#D0D9FF",textPri:"#06102A",textSub:"#3A4F8C",textMuted:"#8497C8",
  gold:"#D4920A",goldLight:"#F5B020",goldPale:"#FFF8E7",
  green:"#047A5A",greenLight:"#0DA575",greenPale:"#E8FBF5",
  danger:"#C81B1B",dangerPale:"#FEF2F2",rose:"#DC1D44",
  divider:"#E8EDFC",shadow:"rgba(6,16,42,0.08)",
  shadowMd:"rgba(6,16,42,0.15)",shadowLg:"rgba(6,16,42,0.22)",
  violet:"#6A24D4",violetPale:"#F2EEFF",
  teal:"#0A8A7C",tealPale:"#E6FAF8",
};

/* ═══════════════════════════════════════════════════════════════════
   CSS — Fraunces + Outfit
═══════════════════════════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700;800&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  .la{font-family:'Outfit',sans-serif;-webkit-font-smoothing:antialiased;}
  .la-serif{font-family:'Fraunces',serif!important;}
  .la-page::before{content:'';position:fixed;inset:0;pointer-events:none;z-index:0;
    background-image:radial-gradient(circle at 1px 1px,rgba(22,53,200,.04) 1px,transparent 0);
    background-size:28px 28px;}

  /* Boutons */
  .la-btn{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border-radius:10px;
    cursor:pointer;font-family:'Outfit',sans-serif;font-size:12.5px;font-weight:700;
    transition:all .16s ease;border:none;}
  .la-btn-pri{background:linear-gradient(135deg,#06102A,#1635C8);color:#fff;
    box-shadow:0 4px 16px rgba(22,53,200,.25);}
  .la-btn-pri:hover{transform:translateY(-2px);box-shadow:0 8px 26px rgba(22,53,200,.35);}
  .la-btn-sec{background:#fff;color:#3A4F8C;border:1.5px solid #E8EDFC!important;}
  .la-btn-sec:hover{background:#F4F7FF;border-color:#D0D9FF!important;}
  .la-btn-danger{background:${C.dangerPale};color:${C.danger};border:1px solid ${C.danger}22!important;}
  .la-btn-danger:hover{background:${C.danger};color:#fff;}

  /* Inputs */
  .la-input{width:100%;padding:9px 13px;border-radius:10px;border:1.5px solid #E8EDFC;
    background:#fff;color:#06102A;font-family:'Outfit',sans-serif;font-size:13px;
    outline:none;transition:border-color .15s,box-shadow .15s;}
  .la-input:focus{border-color:#1635C8;box-shadow:0 0 0 3px rgba(22,53,200,.1);}
  .la-input::placeholder{color:#8497C8;}
  select.la-input{cursor:pointer;}

  /* Table */
  .la-tr{transition:background .1s;cursor:pointer;}
  .la-tr:hover{background:#F4F7FF!important;}
  .la-tr.selected{background:#EEF2FF!important;}

  /* Badges */
  .la-badge{display:inline-flex;align-items:center;gap:4px;border-radius:20px;
    padding:3px 10px;font-size:10.5px;font-weight:700;}

  /* Domaine group header */
  .la-group-hdr{
    background:linear-gradient(90deg,var(--gc) 0%,transparent 100%);
    border-left:4px solid var(--gc);
    padding:11px 18px;
    display:flex;align-items:center;gap:10px;
    cursor:pointer;transition:opacity .14s;
  }
  .la-group-hdr:hover{opacity:.85;}

  /* Animations */
  @keyframes laUp{from{opacity:0;transform:translateY(18px) scale(.985);}
    to{opacity:1;transform:translateY(0) scale(1);}}
  .la-in{animation:laUp .45s cubic-bezier(.22,1,.36,1) both;}
  .la-d0{animation-delay:.0s;}.la-d1{animation-delay:.07s;}
  .la-d2{animation-delay:.14s;}.la-d3{animation-delay:.21s;}
  .la-d4{animation-delay:.28s;}

  @keyframes laSpin{to{transform:rotate(360deg);}}
  .la-spin{animation:laSpin .7s linear infinite;display:inline-block;}

  @keyframes laModal{from{opacity:0;transform:scale(.93) translateY(-18px);}
    to{opacity:1;transform:scale(1) translateY(0);}}
  .la-modal{animation:laModal .24s cubic-bezier(.22,1,.36,1) both;}

  @keyframes laAurora{0%,100%{opacity:.45;transform:scale(1);}50%{opacity:.65;transform:scale(1.06);}}
  .la-aurora{animation:laAurora 11s ease-in-out infinite;}

  /* Pagination */
  .la-pg{width:34px;height:34px;border-radius:9px;border:1px solid #E8EDFC;
    display:flex;align-items:center;justify-content:center;cursor:pointer;
    font-size:12px;font-weight:600;background:#fff;color:#3A4F8C;transition:all .13s;}
  .la-pg:hover{background:#F4F7FF;border-color:#D0D9FF;}
  .la-pg.active{background:#06102A;color:#fff;border-color:#06102A;}
  .la-pg:disabled{opacity:.4;cursor:not-allowed;}

  /* Drawer édition */
  @keyframes laDrawer{from{opacity:0;transform:translateX(32px);}
    to{opacity:1;transform:translateX(0);}}
  .la-drawer{animation:laDrawer .24s cubic-bezier(.22,1,.36,1) both;}

  /* Confirm delete */
  @keyframes laConfirm{from{opacity:0;transform:scale(.88);}to{opacity:1;transform:scale(1);}}
  .la-confirm{animation:laConfirm .18s cubic-bezier(.22,1,.36,1) both;}

  @media(max-width:900px){.la-hide-md{display:none!important;}}
  @media(max-width:650px){.la-hide-sm{display:none!important;}
    .la{padding:80px 12px 52px!important;}}
`;

/* ═══════════════════════════════════════════════════════════════════
   CONSTANTES
═══════════════════════════════════════════════════════════════════ */
const ANTENNES = [
  {v:"conakry",l:"Conakry"},{v:"forecariah",l:"Forecariah"},{v:"boke",l:"Boké"},
  {v:"kindia",l:"Kindia"},{v:"labe",l:"Labé"},{v:"mamou",l:"Mamou"},
  {v:"faranah",l:"Faranah"},{v:"kankan",l:"Kankan"},{v:"siguiri",l:"Siguiri"},
  {v:"nzerekore",l:"N'Zérékoré"},
];
const ANTENNE_L = v => ANTENNES.find(a=>a.v===v)?.l||v||"—";

const DOMAINES = [
  {v:"informatique",     l:"Informatique & Numérique",   color:"#1635C8", bg:"#EEF1FF", icon:"💻"},
  {v:"electrotechnique", l:"Électrotechnique",           color:"#B45309", bg:"#FEF3C7", icon:"⚡"},
  {v:"btp",              l:"Bâtiment & Travaux Publics", color:"#6B21A8", bg:"#F5F3FF", icon:"🏗️"},
  {v:"mecanique",        l:"Mécanique & Auto",           color:"#0A8A7C", bg:"#E6FAF8", icon:"🔧"},
  {v:"agriculture",      l:"Agriculture & Élevage",      color:"#047A5A", bg:"#E8FBF5", icon:"🌱"},
  {v:"commerce",         l:"Commerce & Gestion",         color:"#D4920A", bg:"#FFF8E7", icon:"📊"},
  {v:"sante",            l:"Santé & Social",             color:"#DC1D44", bg:"#FEF2F2", icon:"🏥"},
  {v:"couture",          l:"Couture & Textile",          color:"#7C3AED", bg:"#EDE9FE", icon:"🧵"},
  {v:"hotellerie",       l:"Hôtellerie & Restauration",  color:"#C05C0A", bg:"#FFF5E6", icon:"🍽️"},
  {v:"artisanat",        l:"Artisanat",                  color:"#0891B2", bg:"#E0F7FA", icon:"🎨"},
  {v:"energie",          l:"Énergie solaire",            color:"#F5B020", bg:"#FFFBEB", icon:"☀️"},
  {v:"transport",        l:"Transport & Logistique",     color:"#475569", bg:"#F1F5F9", icon:"🚛"},
  {v:"peche",            l:"Pêche & Aquaculture",        color:"#0E7490", bg:"#E0F2FE", icon:"🐟"},
  {v:"autre",            l:"Autre / Non classé",         color:"#8497C8", bg:"#F4F7FF", icon:"📁"},
];
const DOMAINE_CFG = v => DOMAINES.find(d=>d.v===v) || DOMAINES[DOMAINES.length-1];

const SITUATIONS = [
  {v:"chomeur",l:"Chômeur(se)"},{v:"actif",l:"Actif(ve)"},{v:"diplome",l:"Diplômé(e) sans emploi"},
  {v:"etudiant",l:"Étudiant(e)"},{v:"reconversion",l:"En reconversion"},{v:"independant",l:"Indépendant"},
  {v:"autre",l:"Autre"},
];
const NIVEAUX = [
  {v:"CEP",l:"CEP"},{v:"BEPC",l:"BEPC"},{v:"BAC",l:"BAC"},{v:"BTS",l:"BTS"},
  {v:"Licence",l:"Licence"},{v:"Master",l:"Master"},{v:"Doctorat",l:"Doctorat"},
  {v:"sans_diplome",l:"Sans diplôme"},{v:"autre",l:"Autre"},
];
const STATUTS = [
  {v:"en_attente",l:"En attente",bg:`${C.gold}15`,c:C.gold},
  {v:"valide",    l:"Validé",    bg:C.greenPale,   c:C.green},
  {v:"rejete",    l:"Rejeté",    bg:C.dangerPale,  c:C.danger},
];
const STATUT_CFG = v => STATUTS.find(s=>s.v===v)||STATUTS[0];

const PAGE_SIZE = 15;
const authHeader = () => {
  const t=localStorage.getItem("access")||localStorage.getItem("access_token")||localStorage.getItem("token");
  return {"Content-Type":"application/json",...(t?{Authorization:`Bearer ${t}`}:{})};
};
const fmtDate = d => d?new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}):"—";

/* ═══════════════════════════════════════════════════════════════════
   SOUS-COMPOSANTS
═══════════════════════════════════════════════════════════════════ */
const Tri = ({h=4,r=0}) => (
  <div style={{height:h,display:"flex",borderRadius:r,overflow:"hidden"}}>
    <div style={{flex:1,background:"#E02020"}}/><div style={{flex:1,background:C.gold}}/><div style={{flex:1,background:C.green}}/>
  </div>
);

const StatutBadge = ({statut}) => {
  const s=STATUT_CFG(statut);
  return <span className="la-badge" style={{background:s.bg,color:s.c,border:`1px solid ${s.c}28`}}>{s.l}</span>;
};

const InsereBadge = ({insere}) => {
  if(insere===null||insere===undefined)
    return <span className="la-badge" style={{background:C.surfaceEl,color:C.textMuted,border:`1px solid ${C.divider}`}}>—</span>;
  return insere
    ? <span className="la-badge" style={{background:C.greenPale,color:C.green,border:`1px solid ${C.green}28`}}><CheckCircle2 size={9}/>Inséré</span>
    : <span className="la-badge" style={{background:C.surfaceEl,color:C.textMuted,border:`1px solid ${C.divider}`}}><Clock size={9}/>En attente</span>;
};

const SexeBadge = ({sexe}) => sexe
  ? <span className="la-badge" style={{background:sexe==="H"?`${C.blue}10`:`${C.rose}10`,color:sexe==="H"?C.blue:C.rose,border:`1px solid ${sexe==="H"?C.blue:C.rose}25`}}>{sexe==="H"?"Homme":"Femme"}</span>
  : <span style={{color:C.textMuted,fontSize:12}}>—</span>;

/* ═══════════════════════════════════════════════════════════════════
   MODAL DÉTAIL APPRENANT (lecture seule)
═══════════════════════════════════════════════════════════════════ */
const DetailModal = ({candidat, onClose, onEdit}) => {
  const dc = DOMAINE_CFG(candidat.domaine);
  const Row = ({label,children}) => (
    <div style={{display:"flex",gap:10,padding:"9px 0",borderBottom:`1px solid ${C.divider}`}}>
      <span style={{minWidth:160,fontSize:10.5,fontWeight:800,color:C.textMuted,textTransform:"uppercase",letterSpacing:".06em",flexShrink:0,paddingTop:2}}>{label}</span>
      <div style={{fontSize:13,color:C.textPri,fontWeight:500,lineHeight:1.5}}>{children||"—"}</div>
    </div>
  );
  return (
    <div style={{position:"fixed",inset:0,zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:"68px 16px 16px"}}>
      <div style={{position:"absolute",inset:0,background:"rgba(6,16,42,.6)",backdropFilter:"blur(14px)"}} onClick={onClose}/>
      <div className="la-modal" style={{
        position:"relative",width:"100%",maxWidth:680,
        maxHeight:"calc(100vh - 84px)",overflowY:"auto",
        background:C.surface,borderRadius:22,boxShadow:`0 36px 90px ${C.shadowLg}`,
      }}>
        <Tri h={4} r={22}/>
        {/* Header */}
        <div style={{padding:"20px 24px",borderBottom:`1px solid ${C.divider}`,background:`linear-gradient(180deg,${C.surfaceEl},${C.surface})`,display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
          <div style={{display:"flex",gap:14,alignItems:"center"}}>
            <div style={{width:52,height:52,borderRadius:15,background:dc.bg,border:`1.5px solid ${dc.color}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>
              {dc.icon}
            </div>
            <div>
              <h2 className="la-serif" style={{fontSize:20,fontWeight:700,color:C.textPri,letterSpacing:"-.4px"}}>
                {candidat.nom} {candidat.prenom}
              </h2>
              <div style={{display:"flex",gap:7,marginTop:6,flexWrap:"wrap",alignItems:"center"}}>
                <SexeBadge sexe={candidat.sexe}/>
                <StatutBadge statut={candidat.statut_fiche}/>
                {candidat.identifiant_unique&&(
                  <span style={{fontSize:11,color:C.blue,background:`${C.blue}10`,padding:"2px 8px",borderRadius:5,fontWeight:800,fontFamily:"monospace",border:`1px solid ${C.blue}20`}}>
                    {candidat.identifiant_unique}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:7,flexShrink:0}}>
            <button className="la-btn la-btn-pri" onClick={()=>onEdit(candidat)} style={{padding:"7px 14px",fontSize:12}}>
              <Pencil size={12}/>Modifier
            </button>
            <button onClick={onClose} style={{width:34,height:34,borderRadius:9,background:C.surfaceEl,border:`1px solid ${C.divider}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
              <X size={14} color={C.textMuted}/>
            </button>
          </div>
        </div>
        {/* Corps */}
        <div style={{padding:"18px 24px",display:"flex",flexDirection:"column",gap:18}}>
          {/* Identité */}
          <div style={{background:C.surfaceEl,borderRadius:13,padding:"4px 16px",border:`1px solid ${C.divider}`}}>
            <p style={{fontSize:10,fontWeight:800,color:dc.color,letterSpacing:".15em",textTransform:"uppercase",padding:"10px 0 4px"}}>Identité</p>
            <Row label="Date de naissance">{fmtDate(candidat.date_naissance)}</Row>
            <Row label="Téléphone">{candidat.telephone}</Row>
            <Row label="Email">{candidat.email}</Row>
            <Row label="Adresse">{candidat.adresse}</Row>
          </div>
          {/* Formation */}
          <div style={{background:C.surfaceEl,borderRadius:13,padding:"4px 16px",border:`1px solid ${C.divider}`}}>
            <p style={{fontSize:10,fontWeight:800,color:dc.color,letterSpacing:".15em",textTransform:"uppercase",padding:"10px 0 4px"}}>Formation</p>
            <Row label="Domaine">
              <span className="la-badge" style={{background:dc.bg,color:dc.color,border:`1px solid ${dc.color}25`}}>{dc.icon} {dc.l}</span>
            </Row>
            <Row label="Formation ciblée">{candidat.formation_ciblee}</Row>
            <Row label="Session">
              {candidat.formation_detail
                ? <span style={{display:"flex",flexDirection:"column",gap:2}}>
                    <span style={{fontWeight:700}}>{candidat.formation_detail.nom_formation}</span>
                    <span style={{fontSize:11,color:C.textMuted,fontFamily:"monospace"}}>{candidat.formation_detail.identifiant_formation}</span>
                  </span>
                : "—"}
            </Row>
            <Row label="Antenne">{ANTENNE_L(candidat.antenne)||ANTENNE_L(candidat.formation_detail?.antenne)}</Row>
            <Row label="Niveau d'étude">{candidat.niveau_etude}</Row>
          </div>
          {/* Situation professionnelle */}
          <div style={{background:C.surfaceEl,borderRadius:13,padding:"4px 16px",border:`1px solid ${C.divider}`}}>
            <p style={{fontSize:10,fontWeight:800,color:dc.color,letterSpacing:".15em",textTransform:"uppercase",padding:"10px 0 4px"}}>Situation professionnelle</p>
            <Row label="Situation">{candidat.situation_label||candidat.situation}</Row>
            <Row label="Métier actuel">{candidat.metier_actuel}</Row>
            <Row label="Inséré en entreprise"><InsereBadge insere={candidat.insere}/></Row>
            {candidat.insere&&<>
              <Row label="Entreprise d'insertion">{candidat.entreprise_insertion}</Row>
              <Row label="Date d'insertion">{fmtDate(candidat.date_insertion)}</Row>
            </>}
          </div>
          {/* Suivi */}
          {(candidat.motivation||candidat.observation||candidat.conseiller)&&(
            <div style={{background:C.surfaceEl,borderRadius:13,padding:"4px 16px",border:`1px solid ${C.divider}`}}>
              <p style={{fontSize:10,fontWeight:800,color:dc.color,letterSpacing:".15em",textTransform:"uppercase",padding:"10px 0 4px"}}>Suivi</p>
              {candidat.conseiller&&<Row label="Conseiller">{candidat.conseiller}</Row>}
              {candidat.motivation&&<Row label="Motivation">{candidat.motivation}</Row>}
              {candidat.observation&&<Row label="Observation">{candidat.observation}</Row>}
            </div>
          )}
          {/* Tracabilité */}
          <div style={{background:C.surfaceEl,borderRadius:13,padding:"4px 16px",border:`1px solid ${C.divider}`}}>
            <p style={{fontSize:10,fontWeight:800,color:dc.color,letterSpacing:".15em",textTransform:"uppercase",padding:"10px 0 4px"}}>Traçabilité</p>
            <Row label="Créé le">{fmtDate(candidat.created_at)}</Row>
            <Row label="Créé par">{candidat.created_by_nom||"—"}</Row>
          </div>
        </div>
        <div style={{padding:"12px 24px 18px",borderTop:`1px solid ${C.divider}`,display:"flex",justifyContent:"flex-end",gap:8}}>
          <button className="la-btn la-btn-sec" onClick={onClose}><X size={13}/>Fermer</button>
          <button className="la-btn la-btn-pri" onClick={()=>onEdit(candidat)}><Pencil size={13}/>Modifier</button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   DRAWER ÉDITION
═══════════════════════════════════════════════════════════════════ */
const EditDrawer = ({candidat, onClose, onSaved}) => {
  const [form, setForm] = useState({
    nom:                  candidat.nom||"",
    prenom:               candidat.prenom||"",
    sexe:                 candidat.sexe||"",
    date_naissance:       candidat.date_naissance||"",
    telephone:            candidat.telephone||"",
    email:                candidat.email||"",
    adresse:              candidat.adresse||"",
    situation:            candidat.situation||"",
    metier_actuel:        candidat.metier_actuel||"",
    niveau_etude:         candidat.niveau_etude||"",
    domaine:              candidat.domaine||"",
    formation_ciblee:     candidat.formation_ciblee||"",
    conseiller:           candidat.conseiller||"",
    motivation:           candidat.motivation||"",
    observation:          candidat.observation||"",
    insere:               candidat.insere??null,
    entreprise_insertion: candidat.entreprise_insertion||"",
    date_insertion:       candidat.date_insertion||"",
    antenne:              candidat.antenne||"",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const save = async () => {
    setSaving(true); setErrors({});
    try {
      const payload = {...form};
      if(payload.insere===""||payload.insere===null) delete payload.insere;
      const r = await axios.patch(
        `${CONFIG.BASE_URL}/api/candidats/${candidat.id}/`,
        payload, {headers:authHeader()}
      );
      onSaved(r.data);
    } catch(e) {
      setErrors(e.response?.data||{non_field_errors:"Erreur lors de la sauvegarde"});
    } finally { setSaving(false); }
  };

  const FG = ({label,children,err}) => (
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      <label style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:".06em"}}>{label}</label>
      {children}
      {err&&<p style={{fontSize:11,color:C.danger}}>{Array.isArray(err)?err[0]:err}</p>}
    </div>
  );

  return (
    <div style={{position:"fixed",inset:0,zIndex:950,display:"flex",justifyContent:"flex-end"}}>
      <div style={{position:"absolute",inset:0,background:"rgba(6,16,42,.45)",backdropFilter:"blur(8px)"}} onClick={onClose}/>
      <div className="la-drawer" style={{
        position:"relative",width:"100%",maxWidth:540,
        background:C.surface,boxShadow:`-20px 0 60px ${C.shadowLg}`,
        overflowY:"auto",display:"flex",flexDirection:"column",
      }}>
        <Tri h={4}/>
        {/* Header */}
        <div style={{padding:"18px 22px",borderBottom:`1px solid ${C.divider}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:`linear-gradient(180deg,${C.surfaceEl},${C.surface})`}}>
          <div>
            <h2 className="la-serif" style={{fontSize:18,fontWeight:700,color:C.textPri,letterSpacing:"-.3px"}}>Modifier l'apprenant</h2>
            <p style={{fontSize:12,color:C.textMuted,marginTop:3}}>{candidat.nom} {candidat.prenom}</p>
          </div>
          <button onClick={onClose} style={{width:34,height:34,borderRadius:9,background:C.surfaceEl,border:`1px solid ${C.divider}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
            <X size={14} color={C.textMuted}/>
          </button>
        </div>

        {/* Formulaire */}
        <div style={{flex:1,padding:"20px 22px",display:"flex",flexDirection:"column",gap:14,overflowY:"auto"}}>

          {errors.non_field_errors&&(
            <div style={{background:C.dangerPale,border:`1px solid ${C.danger}30`,borderRadius:10,padding:"10px 14px",fontSize:13,color:C.danger}}>
              {errors.non_field_errors}
            </div>
          )}

          {/* Section identité */}
          <p style={{fontSize:10,fontWeight:800,color:C.blue,letterSpacing:".14em",textTransform:"uppercase"}}>Identité</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <FG label="Nom" err={errors.nom}>
              <input className="la-input" value={form.nom} onChange={e=>set("nom",e.target.value)} placeholder="Nom"/>
            </FG>
            <FG label="Prénom" err={errors.prenom}>
              <input className="la-input" value={form.prenom} onChange={e=>set("prenom",e.target.value)} placeholder="Prénom"/>
            </FG>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <FG label="Sexe" err={errors.sexe}>
              <select className="la-input" value={form.sexe} onChange={e=>set("sexe",e.target.value)}>
                <option value="">—</option>
                <option value="H">Homme</option>
                <option value="F">Femme</option>
              </select>
            </FG>
            <FG label="Date de naissance" err={errors.date_naissance}>
              <input className="la-input" type="date" value={form.date_naissance} onChange={e=>set("date_naissance",e.target.value)}/>
            </FG>
          </div>
          <FG label="Téléphone" err={errors.telephone}>
            <input className="la-input" value={form.telephone} onChange={e=>set("telephone",e.target.value)} placeholder="+224 6XX XXX XXX"/>
          </FG>
          <FG label="Email" err={errors.email}>
            <input className="la-input" type="email" value={form.email} onChange={e=>set("email",e.target.value)} placeholder="email@exemple.com"/>
          </FG>
          <FG label="Adresse" err={errors.adresse}>
            <input className="la-input" value={form.adresse} onChange={e=>set("adresse",e.target.value)} placeholder="Quartier, ville…"/>
          </FG>

          <div style={{height:1,background:C.divider,margin:"4px 0"}}/>
          <p style={{fontSize:10,fontWeight:800,color:C.blue,letterSpacing:".14em",textTransform:"uppercase"}}>Formation & Profil</p>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <FG label="Domaine" err={errors.domaine}>
              <select className="la-input" value={form.domaine} onChange={e=>set("domaine",e.target.value)}>
                <option value="">— Sélectionner —</option>
                {DOMAINES.map(d=><option key={d.v} value={d.v}>{d.l}</option>)}
              </select>
            </FG>
            <FG label="Niveau d'étude" err={errors.niveau_etude}>
              <select className="la-input" value={form.niveau_etude} onChange={e=>set("niveau_etude",e.target.value)}>
                <option value="">— Sélectionner —</option>
                {NIVEAUX.map(n=><option key={n.v} value={n.v}>{n.l}</option>)}
              </select>
            </FG>
          </div>
          <FG label="Formation ciblée" err={errors.formation_ciblee}>
            <input className="la-input" value={form.formation_ciblee} onChange={e=>set("formation_ciblee",e.target.value)} placeholder="Ex: Maçonnerie, Informatique…"/>
          </FG>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <FG label="Situation" err={errors.situation}>
              <select className="la-input" value={form.situation} onChange={e=>set("situation",e.target.value)}>
                <option value="">—</option>
                {SITUATIONS.map(s=><option key={s.v} value={s.v}>{s.l}</option>)}
              </select>
            </FG>
            <FG label="Antenne" err={errors.antenne}>
              <select className="la-input" value={form.antenne} onChange={e=>set("antenne",e.target.value)}>
                <option value="">—</option>
                {ANTENNES.map(a=><option key={a.v} value={a.v}>{a.l}</option>)}
              </select>
            </FG>
          </div>
          <FG label="Métier actuel" err={errors.metier_actuel}>
            <input className="la-input" value={form.metier_actuel} onChange={e=>set("metier_actuel",e.target.value)}/>
          </FG>

          <div style={{height:1,background:C.divider,margin:"4px 0"}}/>
          <p style={{fontSize:10,fontWeight:800,color:C.green,letterSpacing:".14em",textTransform:"uppercase"}}>Insertion professionnelle</p>

          <FG label="Inséré en entreprise" err={errors.insere}>
            <select className="la-input" value={form.insere===null||form.insere===undefined?"":String(form.insere)} onChange={e=>set("insere",e.target.value===""?null:e.target.value==="true")}>
              <option value="">— Non renseigné —</option>
              <option value="true">Oui — inséré</option>
              <option value="false">Non — pas encore</option>
            </select>
          </FG>
          {form.insere===true&&<>
            <FG label="Entreprise d'insertion" err={errors.entreprise_insertion}>
              <input className="la-input" value={form.entreprise_insertion} onChange={e=>set("entreprise_insertion",e.target.value)} placeholder="Nom de l'entreprise"/>
            </FG>
            <FG label="Date d'insertion" err={errors.date_insertion}>
              <input className="la-input" type="date" value={form.date_insertion} onChange={e=>set("date_insertion",e.target.value)}/>
            </FG>
          </>}

          <div style={{height:1,background:C.divider,margin:"4px 0"}}/>
          <p style={{fontSize:10,fontWeight:800,color:C.textMuted,letterSpacing:".14em",textTransform:"uppercase"}}>Suivi</p>
          <FG label="Conseiller" err={errors.conseiller}>
            <input className="la-input" value={form.conseiller} onChange={e=>set("conseiller",e.target.value)}/>
          </FG>
          <FG label="Motivation" err={errors.motivation}>
            <textarea className="la-input" value={form.motivation} onChange={e=>set("motivation",e.target.value)} rows={3} style={{resize:"vertical"}}/>
          </FG>
          <FG label="Observation" err={errors.observation}>
            <textarea className="la-input" value={form.observation} onChange={e=>set("observation",e.target.value)} rows={2} style={{resize:"vertical"}}/>
          </FG>
        </div>

        {/* Footer */}
        <div style={{padding:"14px 22px",borderTop:`1px solid ${C.divider}`,display:"flex",gap:8,justifyContent:"flex-end",background:C.surface}}>
          <button className="la-btn la-btn-sec" onClick={onClose} disabled={saving}><X size={13}/>Annuler</button>
          <button className="la-btn la-btn-pri" onClick={save} disabled={saving}>
            {saving?<Loader2 size={13} className="la-spin"/>:<Save size={13}/>}
            {saving?"Sauvegarde…":"Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   CONFIRM DELETE
═══════════════════════════════════════════════════════════════════ */
const DeleteConfirm = ({candidat, onClose, onDeleted}) => {
  const [deleting, setDeleting] = useState(false);
  const del = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${CONFIG.BASE_URL}/api/candidats/${candidat.id}/`,{headers:authHeader()});
      onDeleted(candidat.id);
    } catch {}
    setDeleting(false);
  };
  return (
    <div style={{position:"fixed",inset:0,zIndex:980,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{position:"absolute",inset:0,background:"rgba(6,16,42,.55)",backdropFilter:"blur(10px)"}} onClick={onClose}/>
      <div className="la-confirm" style={{
        position:"relative",background:C.surface,borderRadius:18,padding:"28px 28px 22px",
        maxWidth:400,width:"90%",boxShadow:`0 28px 70px ${C.shadowLg}`,
        border:`1px solid ${C.divider}`,
      }}>
        <div style={{width:52,height:52,borderRadius:14,background:C.dangerPale,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14,border:`1.5px solid ${C.danger}25`}}>
          <Trash2 size={22} color={C.danger}/>
        </div>
        <h3 className="la-serif" style={{fontSize:17,fontWeight:700,color:C.textPri,marginBottom:8}}>Supprimer cet apprenant ?</h3>
        <p style={{fontSize:13,color:C.textMuted,lineHeight:1.6,marginBottom:20}}>
          <strong style={{color:C.textPri}}>{candidat.nom} {candidat.prenom}</strong> sera définitivement supprimé. Cette action est irréversible.
        </p>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <button className="la-btn la-btn-sec" onClick={onClose} disabled={deleting}><X size={13}/>Annuler</button>
          <button className="la-btn la-btn-danger" onClick={del} disabled={deleting} style={{background:C.danger,color:"#fff"}}>
            {deleting?<Loader2 size={13} className="la-spin"/>:<Trash2 size={13}/>}
            {deleting?"Suppression…":"Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
═══════════════════════════════════════════════════════════════════ */
const ListeApprenants = () => {
  const [candidats,  setCandidats]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [filterDom,  setFilterDom]  = useState("");
  const [filterAnt,  setFilterAnt]  = useState("");
  const [filterStat, setFilterStat] = useState("");
  const [filterIns,  setFilterIns]  = useState("");
  const [page,       setPage]       = useState(1);
  const [collapsed,  setCollapsed]  = useState({});
  const [detail,     setDetail]     = useState(null);
  const [editing,    setEditing]    = useState(null);
  const [deleting,   setDeleting]   = useState(null);

  const API_C = CONFIG.API_CANDIDATS||"/api/candidats/";

  const fetch = useCallback(async()=>{
    setLoading(true);
    try{
      const r=await axios.get(`${CONFIG.BASE_URL}${API_C}`,{headers:authHeader()});
      setCandidats(Array.isArray(r.data)?r.data:r.data.results||[]);
    }catch{}finally{setLoading(false);}
  },[]);

  useEffect(()=>{fetch();},[fetch]);

  /* Filtrage global */
  const filtered = candidats.filter(c=>{
    const q=search.toLowerCase();
    const ms=!q||[c.nom,c.prenom,c.telephone,c.email,c.identifiant_unique,
      c.formation_detail?.nom_formation,c.formation_ciblee].some(v=>v?.toLowerCase().includes(q));
    return ms
      &&(!filterDom||c.domaine===filterDom)
      &&(!filterAnt||c.antenne===filterAnt||(c.formation_detail?.antenne===filterAnt))
      &&(!filterStat||c.statut_fiche===filterStat)
      &&(filterIns===""
        ||(filterIns==="true"&&c.insere===true)
        ||(filterIns==="false"&&(c.insere===false||c.insere===null||c.insere===undefined)));
  });

  /* Grouper par domaine */
  const grouped = DOMAINES.map(d=>({
    ...d,
    items: filtered.filter(c=>(c.domaine||"autre")===d.v),
  })).filter(g=>g.items.length>0);

  const totalPages = Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
  const pagedFlat  = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  /* Stats */
  const stats = {
    total:   candidats.length,
    valides: candidats.filter(c=>c.statut_fiche==="valide").length,
    inseres: candidats.filter(c=>c.insere===true).length,
    domaines:new Set(candidats.map(c=>c.domaine).filter(Boolean)).size,
  };

  const toggleGroup = k => setCollapsed(p=>({...p,[k]:!p[k]}));

  const handleSaved = updated => {
    setCandidats(p=>p.map(c=>c.id===updated.id?updated:c));
    setEditing(null);
    if(detail?.id===updated.id) setDetail(updated);
  };
  const handleDeleted = id => {
    setCandidats(p=>p.filter(c=>c.id!==id));
    setDeleting(null); setDetail(null);
  };

  /* Réinitialiser page si filtre change */
  useEffect(()=>setPage(1),[search,filterDom,filterAnt,filterStat,filterIns]);

  /* Affichage groupé ou paginé */
  const useGrouped = !search&&!filterDom&&!filterAnt&&!filterStat&&filterIns==="";

  return (
    <>
      <style>{CSS}</style>
      <div className="la la-page" style={{minHeight:"100vh",background:`radial-gradient(ellipse 100% 50% at 65% -5%,rgba(22,53,200,.06) 0%,transparent 58%),${C.page}`,padding:"88px 26px 70px",position:"relative"}}>

        {/* Aurora */}
        <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",overflow:"hidden"}}>
          <div className="la-aurora" style={{position:"absolute",top:"-8%",right:"10%",width:480,height:480,borderRadius:"50%",background:"radial-gradient(circle,rgba(22,53,200,.06) 0%,transparent 70%)",filter:"blur(30px)"}}/>
          <div style={{position:"absolute",bottom:"6%",left:"4%",width:360,height:360,borderRadius:"50%",background:"radial-gradient(circle,rgba(4,122,90,.04) 0%,transparent 70%)",filter:"blur(40px)"}}/>
        </div>

        <div style={{position:"relative",zIndex:1,maxWidth:1260,margin:"0 auto"}}>

          {/* ── En-tête ── */}
          <div className="la-in la-d0" style={{marginBottom:28}}>
            <div style={{width:72,marginBottom:12}}><Tri h={3} r={3}/></div>
            <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:14}}>
              <div>
                <h1 className="la-serif" style={{fontSize:34,fontWeight:700,color:C.textPri,letterSpacing:"-.8px",lineHeight:1.05}}>Apprenants ONFPP</h1>
                <p style={{fontSize:13.5,color:C.textMuted,marginTop:8}}>
                  Tous les apprenants inscrits — classés par domaine de formation
                </p>
              </div>
              <button className="la-btn la-btn-sec" onClick={fetch}><RefreshCw size={13}/>Actualiser</button>
            </div>
          </div>

          {/* ── KPI ── */}
          <div className="la-in la-d1" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(165px,1fr))",gap:13,marginBottom:24}}>
            {[
              {label:"Total apprenants",  value:stats.total,   color:C.blue,  bg:`${C.blue}10`,  icon:Users},
              {label:"Fiches validées",   value:stats.valides, color:C.green, bg:C.greenPale,    icon:CheckCircle2},
              {label:"Insérés en emploi", value:stats.inseres, color:C.gold,  bg:C.goldPale,     icon:Briefcase},
              {label:"Domaines couverts", value:stats.domaines,color:C.violet,bg:C.violetPale,   icon:BookOpen},
            ].map((s,i)=>{
              const SI=s.icon;
              return (
                <div key={i} className={`la-in la-d${i+1}`} style={{background:C.surface,borderRadius:17,padding:"17px 15px",border:`1px solid ${C.divider}`,boxShadow:`0 2px 14px ${C.shadow}`,position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${s.color},${s.color}55)`,borderRadius:"17px 17px 0 0"}}/>
                  <div style={{position:"absolute",bottom:-18,right:-18,width:90,height:90,borderRadius:"50%",background:`${s.color}06`}}/>
                  <div style={{width:36,height:36,borderRadius:10,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:11}}>
                    <SI size={16} color={s.color}/>
                  </div>
                  <p className="la-serif" style={{fontSize:28,fontWeight:700,color:C.textPri,lineHeight:1,letterSpacing:"-1px"}}>{s.value}</p>
                  <p style={{fontSize:11.5,color:C.textMuted,marginTop:5}}>{s.label}</p>
                </div>
              );
            })}
          </div>

          {/* ── Filtres ── */}
          <div className="la-in la-d2" style={{background:C.surface,border:`1px solid ${C.divider}`,borderRadius:15,padding:"13px 17px",marginBottom:18,display:"flex",alignItems:"center",gap:11,flexWrap:"wrap",boxShadow:`0 2px 12px ${C.shadow}`}}>
            <div style={{position:"relative",flex:"1 1 210px",minWidth:0}}>
              <Search size={13} color={C.textMuted} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}/>
              <input className="la-input" placeholder="Nom, prénom, ID, formation…" value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:37}}/>
            </div>
            <select className="la-input" value={filterDom} onChange={e=>setFilterDom(e.target.value)} style={{width:"auto",minWidth:180,cursor:"pointer"}}>
              <option value="">Tous les domaines</option>
              {DOMAINES.map(d=><option key={d.v} value={d.v}>{d.icon} {d.l}</option>)}
            </select>
            <select className="la-input" value={filterAnt} onChange={e=>setFilterAnt(e.target.value)} style={{width:"auto",minWidth:145,cursor:"pointer"}}>
              <option value="">Toutes les antennes</option>
              {ANTENNES.map(a=><option key={a.v} value={a.v}>{a.l}</option>)}
            </select>
            <select className="la-input" value={filterStat} onChange={e=>setFilterStat(e.target.value)} style={{width:"auto",minWidth:135,cursor:"pointer"}}>
              <option value="">Tous les statuts</option>
              {STATUTS.map(s=><option key={s.v} value={s.v}>{s.l}</option>)}
            </select>
            <select className="la-input" value={filterIns} onChange={e=>setFilterIns(e.target.value)} style={{width:"auto",minWidth:140,cursor:"pointer"}}>
              <option value="">Insertion : tous</option>
              <option value="true">Insérés ✓</option>
              <option value="false">Non insérés</option>
            </select>
            <p style={{fontSize:12,color:C.textMuted,flexShrink:0}}>
              <span style={{fontWeight:700,color:C.textSub}}>{filtered.length}</span> apprenant{filtered.length>1?"s":""}
            </p>
          </div>

          {/* ── Contenu ── */}
          {loading?(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"72px 0",gap:16}}>
              <Loader2 size={30} color={C.blue} className="la-spin"/>
              <p style={{fontSize:13.5,color:C.textMuted}}>Chargement des apprenants…</p>
            </div>
          ) : filtered.length===0?(
            <div className="la-in la-d2" style={{background:C.surface,borderRadius:18,padding:"64px 0",display:"flex",flexDirection:"column",alignItems:"center",gap:14,border:`1px solid ${C.divider}`}}>
              <div style={{width:58,height:58,borderRadius:16,background:C.surfaceEl,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${C.divider}`}}>
                <Users size={24} color={C.textMuted}/>
              </div>
              <p className="la-serif" style={{fontSize:16,fontWeight:600,color:C.textSub}}>Aucun apprenant trouvé</p>
              <p style={{fontSize:13,color:C.textMuted}}>{search||filterDom||filterAnt||filterStat||filterIns?"Modifiez vos filtres":"Aucun apprenant enregistré pour l'instant"}</p>
            </div>
          ) : useGrouped ? (
            /* ════ VUE GROUPÉE PAR DOMAINE ════ */
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {grouped.map((grp,gi)=>{
                const isOpen = !collapsed[grp.v];
                return (
                  <div key={grp.v} className={`la-in la-d${Math.min(gi,4)}`} style={{background:C.surface,borderRadius:18,border:`1px solid ${C.divider}`,boxShadow:`0 2px 16px ${C.shadow}`,overflow:"hidden"}}>
                    {/* Group header */}
                    <div className="la-group-hdr" onClick={()=>toggleGroup(grp.v)}
                      style={{"--gc":grp.color,background:`linear-gradient(90deg,${grp.color}12,transparent)`}}>
                      <span style={{fontSize:22,lineHeight:1}}>{grp.icon}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <p className="la-serif" style={{fontSize:15,fontWeight:700,color:C.textPri,letterSpacing:"-.2px"}}>{grp.l}</p>
                        <p style={{fontSize:11.5,color:C.textMuted}}>{grp.items.length} apprenant{grp.items.length>1?"s":""}</p>
                      </div>
                      {/* Mini stats */}
                      <div className="la-hide-md" style={{display:"flex",gap:10,marginRight:12}}>
                        <span style={{fontSize:11,color:C.green,fontWeight:700,background:C.greenPale,padding:"2px 9px",borderRadius:10,border:`1px solid ${C.green}22`}}>
                          {grp.items.filter(c=>c.statut_fiche==="valide").length} validés
                        </span>
                        <span style={{fontSize:11,color:C.gold,fontWeight:700,background:C.goldPale,padding:"2px 9px",borderRadius:10,border:`1px solid ${C.gold}22`}}>
                          {grp.items.filter(c=>c.insere===true).length} insérés
                        </span>
                      </div>
                      {isOpen?<ChevronUp size={16} color={grp.color}/>:<ChevronDown size={16} color={grp.color}/>}
                    </div>

                    {/* Table du groupe */}
                    {isOpen&&(
                      <div style={{overflowX:"auto"}}>
                        <table style={{width:"100%",borderCollapse:"collapse"}}>
                          <thead>
                            <tr style={{background:`${grp.color}06`,borderBottom:`1px solid ${C.divider}`}}>
                              {["ID Apprenant","Nom & Prénom","Sexe","Formation / ID session","Antenne","Statut","Inséré","Date inscr.","Actions"].map((h,i)=>(
                                <th key={i} className={i>=6?"la-hide-md":""} style={{padding:"10px 14px",textAlign:"left",fontSize:9.5,fontWeight:800,color:C.textMuted,letterSpacing:".1em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {grp.items.map((c,ri)=>(
                              <tr key={c.id} className="la-tr" style={{borderBottom:`1px solid ${C.divider}`,background:ri%2===0?C.surface:`${grp.color}03`}}
                                onClick={()=>setDetail(c)}>
                                {/* ID */}
                                <td style={{padding:"11px 14px"}}>
                                  {c.identifiant_unique
                                    ?<span style={{fontSize:10.5,color:grp.color,background:grp.bg,padding:"2px 8px",borderRadius:5,fontWeight:800,fontFamily:"monospace",border:`1px solid ${grp.color}25`,whiteSpace:"nowrap"}}>{c.identifiant_unique}</span>
                                    :<span style={{fontSize:11,color:C.textMuted}}>En attente</span>}
                                </td>
                                {/* Nom */}
                                <td style={{padding:"11px 14px"}}>
                                  <div style={{display:"flex",alignItems:"center",gap:9}}>
                                    <div style={{width:34,height:34,borderRadius:10,background:grp.bg,border:`1px solid ${grp.color}22`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:13}}>
                                      {c.sexe==="F"?"👩":"👨"}
                                    </div>
                                    <div>
                                      <p style={{fontSize:13,fontWeight:700,color:C.textPri,lineHeight:1.2}}>{c.nom} {c.prenom}</p>
                                      <p style={{fontSize:11,color:C.textMuted,marginTop:1}}>{c.telephone||c.email||"—"}</p>
                                    </div>
                                  </div>
                                </td>
                                {/* Sexe */}
                                <td style={{padding:"11px 14px"}}><SexeBadge sexe={c.sexe}/></td>
                                {/* Formation */}
                                <td style={{padding:"11px 14px",maxWidth:200}}>
                                  {c.formation_detail?(
                                    <div>
                                      <p style={{fontSize:12,fontWeight:600,color:C.textPri,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:180}}>{c.formation_detail.nom_formation}</p>
                                      <p style={{fontSize:10,color:C.blue,fontFamily:"monospace",fontWeight:700,marginTop:1}}>{c.formation_detail.identifiant_formation}</p>
                                    </div>
                                  ):(
                                    <span style={{fontSize:12,color:C.textMuted}}>{c.formation_ciblee||"—"}</span>
                                  )}
                                </td>
                                {/* Antenne */}
                                <td style={{padding:"11px 14px"}}>
                                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                                    <MapPin size={11} color={C.textMuted}/>
                                    <span style={{fontSize:12,color:C.textSub,fontWeight:500}}>{ANTENNE_L(c.antenne)||ANTENNE_L(c.formation_detail?.antenne)}</span>
                                  </div>
                                </td>
                                {/* Statut */}
                                <td style={{padding:"11px 14px"}}><StatutBadge statut={c.statut_fiche}/></td>
                                {/* Inséré */}
                                <td className="la-hide-md" style={{padding:"11px 14px"}}><InsereBadge insere={c.insere}/></td>
                                {/* Date */}
                                <td className="la-hide-md" style={{padding:"11px 14px"}}>
                                  <span style={{fontSize:11.5,color:C.textMuted}}>{fmtDate(c.created_at)}</span>
                                </td>
                                {/* Actions */}
                                <td style={{padding:"11px 14px"}} onClick={e=>e.stopPropagation()}>
                                  <div style={{display:"flex",gap:5}}>
                                    <button onClick={()=>setDetail(c)} style={{width:30,height:30,borderRadius:7,background:`${C.blue}08`,border:`1px solid ${C.blue}20`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .13s"}}
                                      onMouseEnter={e=>{e.currentTarget.style.background=`${C.blue}18`;e.currentTarget.style.borderColor=C.blue;}}
                                      onMouseLeave={e=>{e.currentTarget.style.background=`${C.blue}08`;e.currentTarget.style.borderColor=`${C.blue}20`;}}>
                                      <Eye size={12} color={C.blue}/>
                                    </button>
                                    <button onClick={()=>setEditing(c)} style={{width:30,height:30,borderRadius:7,background:`${C.green}08`,border:`1px solid ${C.green}20`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .13s"}}
                                      onMouseEnter={e=>{e.currentTarget.style.background=`${C.green}18`;e.currentTarget.style.borderColor=C.green;}}
                                      onMouseLeave={e=>{e.currentTarget.style.background=`${C.green}08`;e.currentTarget.style.borderColor=`${C.green}20`;}}>
                                      <Pencil size={12} color={C.green}/>
                                    </button>
                                    <button onClick={()=>setDeleting(c)} style={{width:30,height:30,borderRadius:7,background:C.dangerPale,border:`1px solid ${C.danger}22`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .13s"}}
                                      onMouseEnter={e=>{e.currentTarget.style.background=C.danger;e.currentTarget.querySelector("*").style.color="#fff";}}
                                      onMouseLeave={e=>{e.currentTarget.style.background=C.dangerPale;e.currentTarget.querySelector("*").style.color=C.danger;}}>
                                      <Trash2 size={12} color={C.danger}/>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* ════ VUE PAGINÉE (mode filtres actifs) ════ */
            <div className="la-in la-d2" style={{background:C.surface,border:`1px solid ${C.divider}`,borderRadius:18,boxShadow:`0 2px 16px ${C.shadow}`,overflow:"hidden"}}>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr style={{background:`${C.navy}04`,borderBottom:`1.5px solid ${C.divider}`}}>
                      {["ID","Apprenant","Domaine","Formation / ID session","Antenne","Statut","Inséré","Date","Actions"].map((h,i)=>(
                        <th key={i} className={i>=5?"la-hide-md":""} style={{padding:"12px 15px",textAlign:"left",fontSize:10,fontWeight:800,color:C.textMuted,letterSpacing:".1em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagedFlat.map((c,ri)=>{
                      const dc=DOMAINE_CFG(c.domaine);
                      return (
                        <tr key={c.id} className="la-tr" style={{borderBottom:`1px solid ${C.divider}`,background:ri%2===0?C.surface:`${C.navy}008`}}
                          onClick={()=>setDetail(c)}>
                          <td style={{padding:"12px 15px"}}>
                            {c.identifiant_unique
                              ?<span style={{fontSize:10.5,color:dc.color,background:dc.bg,padding:"2px 8px",borderRadius:5,fontWeight:800,fontFamily:"monospace",border:`1px solid ${dc.color}25`,whiteSpace:"nowrap"}}>{c.identifiant_unique}</span>
                              :<span style={{fontSize:11,color:C.textMuted}}>—</span>}
                          </td>
                          <td style={{padding:"12px 15px"}}>
                            <div style={{display:"flex",alignItems:"center",gap:9}}>
                              <div style={{width:34,height:34,borderRadius:10,background:dc.bg,border:`1px solid ${dc.color}22`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:14}}>{dc.icon}</div>
                              <div>
                                <p style={{fontSize:13,fontWeight:700,color:C.textPri}}>{c.nom} {c.prenom}</p>
                                <p style={{fontSize:11,color:C.textMuted}}>{c.telephone||"—"}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{padding:"12px 15px"}}>
                            <span className="la-badge" style={{background:dc.bg,color:dc.color,border:`1px solid ${dc.color}25`}}>{dc.icon} {dc.l}</span>
                          </td>
                          <td style={{padding:"12px 15px",maxWidth:200}}>
                            {c.formation_detail?(
                              <div>
                                <p style={{fontSize:12,fontWeight:600,color:C.textPri,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:180}}>{c.formation_detail.nom_formation}</p>
                                <p style={{fontSize:10,color:C.blue,fontFamily:"monospace",fontWeight:700,marginTop:1}}>{c.formation_detail.identifiant_formation}</p>
                              </div>
                            ):<span style={{fontSize:12,color:C.textMuted}}>{c.formation_ciblee||"—"}</span>}
                          </td>
                          <td style={{padding:"12px 15px"}}>
                            <div style={{display:"flex",alignItems:"center",gap:5}}>
                              <MapPin size={11} color={C.textMuted}/>
                              <span style={{fontSize:12,color:C.textSub,fontWeight:500}}>{ANTENNE_L(c.antenne)||ANTENNE_L(c.formation_detail?.antenne)}</span>
                            </div>
                          </td>
                          <td className="la-hide-md" style={{padding:"12px 15px"}}><StatutBadge statut={c.statut_fiche}/></td>
                          <td className="la-hide-md" style={{padding:"12px 15px"}}><InsereBadge insere={c.insere}/></td>
                          <td className="la-hide-md" style={{padding:"12px 15px",fontSize:11.5,color:C.textMuted}}>{fmtDate(c.created_at)}</td>
                          <td style={{padding:"12px 15px"}} onClick={e=>e.stopPropagation()}>
                            <div style={{display:"flex",gap:5}}>
                              <button onClick={()=>setDetail(c)} style={{width:29,height:29,borderRadius:7,background:`${C.blue}08`,border:`1px solid ${C.blue}20`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                                <Eye size={12} color={C.blue}/>
                              </button>
                              <button onClick={()=>setEditing(c)} style={{width:29,height:29,borderRadius:7,background:`${C.green}08`,border:`1px solid ${C.green}20`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                                <Pencil size={12} color={C.green}/>
                              </button>
                              <button onClick={()=>setDeleting(c)} style={{width:29,height:29,borderRadius:7,background:C.dangerPale,border:`1px solid ${C.danger}22`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                                <Trash2 size={12} color={C.danger}/>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {totalPages>1&&(
                <div style={{padding:"12px 18px",borderTop:`1px solid ${C.divider}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
                  <p style={{fontSize:12,color:C.textMuted}}>
                    <span style={{fontWeight:700,color:C.textSub}}>{(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE,filtered.length)}</span> / <span style={{fontWeight:700,color:C.textSub}}>{filtered.length}</span>
                  </p>
                  <div style={{display:"flex",gap:5}}>
                    <button className="la-pg" onClick={()=>setPage(p=>p-1)} disabled={page===1}><ChevronLeft size={13}/></button>
                    {Array.from({length:totalPages},(_,i)=>i+1).filter(p=>p===1||p===totalPages||Math.abs(p-page)<=1).map((p,i,arr)=>(
                      <React.Fragment key={p}>
                        {i>0&&arr[i-1]!==p-1&&<span style={{color:C.textMuted,fontSize:12,padding:"0 2px"}}>…</span>}
                        <button className={`la-pg${p===page?" active":""}`} onClick={()=>setPage(p)}>{p}</button>
                      </React.Fragment>
                    ))}
                    <button className="la-pg" onClick={()=>setPage(p=>p+1)} disabled={page===totalPages}><ChevronRight size={13}/></button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info footer */}
          <div className="la-in la-d4" style={{marginTop:14,padding:"11px 17px",background:`${C.navy}03`,borderRadius:11,border:`1px solid ${C.divider}`,display:"flex",alignItems:"center",gap:9}}>
            <Users size={13} color={C.textMuted}/>
            <p style={{fontSize:12,color:C.textMuted,lineHeight:1.5}}>
              Vue groupée par domaine (sans filtres). Utilisez les filtres pour basculer en vue paginée. Cliquez sur une ligne pour les détails, <Pencil size={10} style={{display:"inline",verticalAlign:"middle"}}/> pour modifier, <Trash2 size={10} style={{display:"inline",verticalAlign:"middle"}}/> pour supprimer.
            </p>
          </div>
        </div>
      </div>

      {/* Modals / Drawer */}
      {detail  && !editing && <DetailModal candidat={detail}  onClose={()=>setDetail(null)}  onEdit={c=>{setEditing(c);setDetail(null);}}/>}
      {editing && <EditDrawer candidat={editing} onClose={()=>setEditing(null)} onSaved={handleSaved}/>}
      {deleting && <DeleteConfirm candidat={deleting} onClose={()=>setDeleting(null)} onDeleted={handleDeleted}/>}
    </>
  );
};

export default ListeApprenants;