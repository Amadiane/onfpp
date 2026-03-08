import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import CONFIG from "../../config/config.js";
import {
  Users, Search, RefreshCw, Loader2, ChevronLeft, ChevronRight,
  Eye, Pencil, Trash2, X, CheckCircle2, XCircle,
  GraduationCap, MapPin, User, Calendar, Phone, Mail,
  Briefcase, Award, Building2, Clock, BookOpen, Save,
  ChevronDown, ChevronUp, Star, TrendingUp, BarChart3,
  AlertTriangle, ArrowUpRight, Hash, Zap,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   PALETTE — identique DashboardAdmin
═══════════════════════════════════════════════════════════════════ */
const C = {
  page:"#F8F9FD",pageAlt:"#EEF2FF",surface:"#FFFFFF",surfaceEl:"#F4F7FF",
  navy:"#06102A",blue:"#1635C8",iceBlue:"#D0D9FF",
  textPri:"#06102A",textSub:"#3A4F8C",textMuted:"#8497C8",
  gold:"#D4920A",goldLight:"#F5B020",goldPale:"#FFF8E7",
  green:"#047A5A",greenLight:"#0DA575",greenPale:"#E8FBF5",
  danger:"#C81B1B",dangerPale:"#FEF2F2",rose:"#DC1D44",
  divider:"#E8EDFC",shadow:"rgba(6,16,42,0.07)",
  shadowMd:"rgba(6,16,42,0.14)",shadowLg:"rgba(6,16,42,0.22)",
  violet:"#6A24D4",violetPale:"#F2EEFF",
  teal:"#0A8A7C",tealPale:"#E6FAF8",
  orange:"#C05C0A",orangePale:"#FFF5E6",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700;800&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  .la{font-family:'Outfit',sans-serif;-webkit-font-smoothing:antialiased;}
  .la-serif{font-family:'Fraunces',serif!important;}
  .la-page::before{content:'';position:fixed;inset:0;pointer-events:none;z-index:0;
    background-image:radial-gradient(circle at 1px 1px,rgba(22,53,200,.04) 1px,transparent 0);
    background-size:28px 28px;}
  .la-btn{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border-radius:10px;
    cursor:pointer;font-family:'Outfit',sans-serif;font-size:12.5px;font-weight:700;
    transition:all .15s ease;border:none;}
  .la-btn-pri{background:linear-gradient(135deg,#06102A,#1635C8);color:#fff;
    box-shadow:0 4px 16px rgba(22,53,200,.24);}
  .la-btn-pri:hover{transform:translateY(-2px);box-shadow:0 8px 26px rgba(22,53,200,.34);}
  .la-btn-sec{background:#fff;color:#3A4F8C;border:1.5px solid #E8EDFC!important;}
  .la-btn-sec:hover{background:#F4F7FF;border-color:#D0D9FF!important;}
  .la-btn-green{background:${C.green};color:#fff;}
  .la-btn-green:hover{background:${C.greenLight};}
  .la-btn-danger{background:${C.dangerPale};color:${C.danger};border:1px solid ${C.danger}22!important;}
  .la-btn-danger:hover{background:${C.danger};color:#fff;}
  .la-input{width:100%;padding:9px 13px;border-radius:10px;border:1.5px solid #E8EDFC;
    background:#fff;color:#06102A;font-family:'Outfit',sans-serif;font-size:13px;
    outline:none;transition:border-color .15s,box-shadow .15s;}
  .la-input:focus{border-color:#1635C8;box-shadow:0 0 0 3px rgba(22,53,200,.1);}
  .la-input::placeholder{color:#8497C8;}
  .la-tr{transition:background .1s;cursor:pointer;}
  .la-tr:hover{background:#F4F7FF!important;}
  .la-badge{display:inline-flex;align-items:center;gap:4px;border-radius:20px;
    padding:3px 10px;font-size:10.5px;font-weight:700;}
  .la-group-hdr{border-left:4px solid var(--gc);padding:12px 18px;
    display:flex;align-items:center;gap:10px;cursor:pointer;transition:opacity .14s;
    background:linear-gradient(90deg,var(--gc-bg),transparent);}
  .la-group-hdr:hover{opacity:.85;}
  .la-section-title{font-size:10px;font-weight:800;letter-spacing:.14em;
    text-transform:uppercase;padding:12px 0 6px;border-bottom:1px solid ${C.divider};margin-bottom:10px;}
  .la-pg{width:34px;height:34px;border-radius:9px;border:1px solid #E8EDFC;
    display:flex;align-items:center;justify-content:center;cursor:pointer;
    font-size:12px;font-weight:600;background:#fff;color:#3A4F8C;transition:all .13s;}
  .la-pg:hover{background:#F4F7FF;border-color:#D0D9FF;}
  .la-pg.active{background:#06102A;color:#fff;border-color:#06102A;}
  .la-pg:disabled{opacity:.4;cursor:not-allowed;}
  .la-star{cursor:pointer;font-size:22px;transition:transform .12s;}
  .la-star:hover{transform:scale(1.25);}
  @keyframes laUp{from{opacity:0;transform:translateY(18px) scale(.985);}
    to{opacity:1;transform:translateY(0) scale(1);}}
  .la-in{animation:laUp .45s cubic-bezier(.22,1,.36,1) both;}
  .la-d0{animation-delay:.0s;}.la-d1{animation-delay:.08s;}
  .la-d2{animation-delay:.16s;}.la-d3{animation-delay:.24s;}.la-d4{animation-delay:.32s;}
  @keyframes laSpin{to{transform:rotate(360deg);}}
  .la-spin{animation:laSpin .75s linear infinite;display:inline-block;}
  @keyframes laModal{from{opacity:0;transform:scale(.93) translateY(-18px);}
    to{opacity:1;transform:scale(1) translateY(0);}}
  .la-modal{animation:laModal .24s cubic-bezier(.22,1,.36,1) both;}
  @keyframes laDrawer{from{opacity:0;transform:translateX(40px);}
    to{opacity:1;transform:translateX(0);}}
  .la-drawer{animation:laDrawer .22s cubic-bezier(.22,1,.36,1) both;}
  @keyframes laConfirm{from{opacity:0;transform:scale(.88);}to{opacity:1;transform:scale(1);}}
  .la-confirm{animation:laConfirm .18s cubic-bezier(.22,1,.36,1) both;}
  @keyframes laAurora{0%,100%{opacity:.45;transform:scale(1);}50%{opacity:.6;transform:scale(1.05);}}
  .la-aurora{animation:laAurora 11s ease-in-out infinite;}
  @media(max-width:960px){.la-hide-md{display:none!important;}}
  @media(max-width:640px){.la-hide-sm{display:none!important;}
    .la{padding:80px 12px 52px!important;}}
`;

/* ── Constantes ── */
const ANTENNES=[
  {v:"conakry",l:"Conakry"},{v:"forecariah",l:"Forecariah"},{v:"boke",l:"Boké"},
  {v:"kindia",l:"Kindia"},{v:"labe",l:"Labé"},{v:"mamou",l:"Mamou"},
  {v:"faranah",l:"Faranah"},{v:"kankan",l:"Kankan"},{v:"siguiri",l:"Siguiri"},
  {v:"nzerekore",l:"N'Zérékoré"},
];
const ANT_L = v => ANTENNES.find(a=>a.v===v)?.l||v||"—";

const DOMAINES=[
  {v:"informatique",     l:"Informatique & Numérique",   color:"#1635C8",bg:"#EEF1FF",icon:"💻"},
  {v:"electrotechnique", l:"Électrotechnique",           color:"#B45309",bg:"#FEF3C7",icon:"⚡"},
  {v:"btp",              l:"Bâtiment & Travaux Publics", color:"#6B21A8",bg:"#F5F3FF",icon:"🏗️"},
  {v:"mecanique",        l:"Mécanique & Auto",           color:"#0A8A7C",bg:"#E6FAF8",icon:"🔧"},
  {v:"agriculture",      l:"Agriculture & Élevage",      color:"#047A5A",bg:"#E8FBF5",icon:"🌱"},
  {v:"commerce",         l:"Commerce & Gestion",         color:"#D4920A",bg:"#FFF8E7",icon:"📊"},
  {v:"sante",            l:"Santé & Social",             color:"#DC1D44",bg:"#FEF2F2",icon:"🏥"},
  {v:"couture",          l:"Couture & Textile",          color:"#7C3AED",bg:"#EDE9FE",icon:"🧵"},
  {v:"hotellerie",       l:"Hôtellerie & Restauration",  color:"#C05C0A",bg:"#FFF5E6",icon:"🍽️"},
  {v:"artisanat",        l:"Artisanat",                  color:"#0891B2",bg:"#E0F7FA",icon:"🎨"},
  {v:"energie",          l:"Énergie solaire",            color:"#F5B020",bg:"#FFFBEB",icon:"☀️"},
  {v:"transport",        l:"Transport & Logistique",     color:"#475569",bg:"#F1F5F9",icon:"🚛"},
  {v:"peche",            l:"Pêche & Aquaculture",        color:"#0E7490",bg:"#E0F2FE",icon:"🐟"},
  {v:"autre",            l:"Autre / Non classé",         color:"#8497C8",bg:"#F4F7FF",icon:"📁"},
];
const DOM_CFG = v => DOMAINES.find(d=>d.v===v)||DOMAINES[DOMAINES.length-1];

const SITUATIONS=[
  {v:"chomeur",l:"Chômeur(se)"},{v:"actif",l:"Actif(ve)"},{v:"diplome",l:"Diplômé(e) sans emploi"},
  {v:"etudiant",l:"Étudiant(e)"},{v:"reconversion",l:"En reconversion"},{v:"independant",l:"Indépendant"},{v:"autre",l:"Autre"},
];
const NIVEAUX=[
  {v:"CEP",l:"CEP"},{v:"BEPC",l:"BEPC"},{v:"BAC",l:"BAC"},{v:"BTS",l:"BTS"},
  {v:"Licence",l:"Licence"},{v:"Master",l:"Master"},{v:"Doctorat",l:"Doctorat"},{v:"sans_diplome",l:"Sans diplôme"},{v:"autre",l:"Autre"},
];
const CONTRATS=[
  {v:"cdi",l:"CDI"},{v:"cdd",l:"CDD"},{v:"stage",l:"Stage / Apprentissage"},
  {v:"freelance",l:"Freelance / Auto-entrepreneur"},{v:"informel",l:"Emploi informel"},{v:"sans",l:"Sans contrat"},
];
const STATUTS_EMPLOI=[
  {v:"en_poste",l:"En poste 🟢"},{v:"chomage",l:"Au chômage"},{v:"independant",l:"Indépendant"},
  {v:"etudes",l:"Poursuite d'études"},{v:"autre",l:"Autre"},
];
const STATUTS_FICHE=[
  {v:"en_attente",l:"En attente",bg:`${C.gold}15`,c:C.gold},
  {v:"valide",    l:"Validé",    bg:C.greenPale,  c:C.green},
  {v:"rejete",    l:"Rejeté",    bg:C.dangerPale, c:C.danger},
];
const STATUT_CFG = v => STATUTS_FICHE.find(s=>s.v===v)||STATUTS_FICHE[0];

const PAGE_SIZE=15;
const authHeader=()=>{
  const t=localStorage.getItem("access")||localStorage.getItem("access_token")||localStorage.getItem("token");
  return{"Content-Type":"application/json",...(t?{Authorization:`Bearer ${t}`}:{})};
};
const fmtDate=d=>d?new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}):"—";
const fmtNum=n=>n!=null?new Intl.NumberFormat("fr-GN").format(n)+" GNF":"—";

/* ── Sous-composants ── */
const Tri=({h=4,r=0})=>(
  <div style={{height:h,display:"flex",borderRadius:r,overflow:"hidden"}}>
    <div style={{flex:1,background:"#E02020"}}/><div style={{flex:1,background:C.gold}}/><div style={{flex:1,background:C.green}}/>
  </div>
);
const StatutBadge=({statut})=>{const s=STATUT_CFG(statut);return<span className="la-badge" style={{background:s.bg,color:s.c,border:`1px solid ${s.c}28`}}>{s.l}</span>;};
const SexeBadge=({sexe})=>sexe?<span className="la-badge" style={{background:sexe==="H"?`${C.blue}10`:`${C.rose}10`,color:sexe==="H"?C.blue:C.rose,border:`1px solid ${sexe==="H"?C.blue:C.rose}25`}}>{sexe==="H"?"Homme":"Femme"}</span>:<span style={{color:C.textMuted,fontSize:12}}>—</span>;

const InsereBadge=({insere,statut_emploi})=>{
  if(insere===true)  return<span className="la-badge" style={{background:C.greenPale,color:C.green,border:`1px solid ${C.green}28`}}><CheckCircle2 size={9}/>Inséré{statut_emploi==="en_poste"?" ✓":""}</span>;
  if(insere===false) return<span className="la-badge" style={{background:`${C.gold}12`,color:C.gold,border:`1px solid ${C.gold}25`}}><Clock size={9}/>En recherche</span>;
  return<span className="la-badge" style={{background:C.surfaceEl,color:C.textMuted,border:`1px solid ${C.divider}`}}>—</span>;
};

const StarRating=({value,onChange,readOnly=false})=>(
  <div style={{display:"flex",gap:4}}>
    {[1,2,3,4,5].map(n=>(
      <span key={n} className={readOnly?"":"la-star"} onClick={()=>!readOnly&&onChange&&onChange(n)}
        style={{fontSize:readOnly?16:20,color:n<=(value||0)?C.goldLight:"#CBD5E1",cursor:readOnly?"default":"pointer"}}>★</span>
    ))}
    {value&&<span style={{fontSize:11,color:C.textMuted,marginLeft:4,alignSelf:"center"}}>{value}/5</span>}
  </div>
);

/* ══════════════════════════════════════════════════════════════════
   MODAL DÉTAIL
══════════════════════════════════════════════════════════════════ */
const DetailModal=({candidat,onClose,onEdit})=>{
  const dc=DOM_CFG(candidat.domaine);
  const Row=({label,children})=>(
    <div style={{display:"flex",gap:10,padding:"9px 0",borderBottom:`1px solid ${C.divider}`}}>
      <span style={{minWidth:165,fontSize:10.5,fontWeight:800,color:C.textMuted,textTransform:"uppercase",letterSpacing:".06em",flexShrink:0,paddingTop:2}}>{label}</span>
      <div style={{fontSize:13,color:C.textPri,fontWeight:500,lineHeight:1.5,flex:1}}>{children||"—"}</div>
    </div>
  );
  return(
    <div style={{position:"fixed",inset:0,zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:"68px 16px 16px"}}>
      <div style={{position:"absolute",inset:0,background:"rgba(6,16,42,.6)",backdropFilter:"blur(14px)"}} onClick={onClose}/>
      <div className="la-modal" style={{position:"relative",width:"100%",maxWidth:700,maxHeight:"calc(100vh - 84px)",overflowY:"auto",background:C.surface,borderRadius:22,boxShadow:`0 36px 90px ${C.shadowLg}`}}>
        <Tri h={4} r={22}/>
        <div style={{padding:"20px 24px",borderBottom:`1px solid ${C.divider}`,background:`linear-gradient(180deg,${C.surfaceEl},${C.surface})`,display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
          <div style={{display:"flex",gap:14,alignItems:"center"}}>
            <div style={{width:52,height:52,borderRadius:15,background:dc.bg,border:`1.5px solid ${dc.color}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{dc.icon}</div>
            <div>
              <h2 className="la-serif" style={{fontSize:20,fontWeight:700,color:C.textPri,letterSpacing:"-.4px"}}>{candidat.nom} {candidat.prenom}</h2>
              <div style={{display:"flex",gap:7,marginTop:6,flexWrap:"wrap",alignItems:"center"}}>
                <SexeBadge sexe={candidat.sexe}/>
                <StatutBadge statut={candidat.statut_fiche}/>
                <InsereBadge insere={candidat.insere} statut_emploi={candidat.statut_emploi_actuel}/>
                {candidat.identifiant_unique&&<span style={{fontSize:11,color:C.blue,background:`${C.blue}10`,padding:"2px 8px",borderRadius:5,fontWeight:800,fontFamily:"monospace",border:`1px solid ${C.blue}20`}}>{candidat.identifiant_unique}</span>}
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:7,flexShrink:0}}>
            <button className="la-btn la-btn-pri" onClick={()=>onEdit(candidat)} style={{padding:"7px 14px",fontSize:12}}><Pencil size={12}/>Modifier</button>
            <button onClick={onClose} style={{width:34,height:34,borderRadius:9,background:C.surfaceEl,border:`1px solid ${C.divider}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><X size={14} color={C.textMuted}/></button>
          </div>
        </div>

        <div style={{padding:"18px 24px",display:"flex",flexDirection:"column",gap:16}}>
          {/* Identité */}
          <div style={{background:C.surfaceEl,borderRadius:13,padding:"4px 16px",border:`1px solid ${C.divider}`}}>
            <p className="la-section-title" style={{color:dc.color}}>Identité & Contact</p>
            <Row label="Date de naissance">{fmtDate(candidat.date_naissance)}</Row>
            <Row label="Téléphone">{candidat.telephone}</Row>
            <Row label="Email">{candidat.email}</Row>
            <Row label="Adresse">{candidat.adresse}</Row>
          </div>
          {/* Formation */}
          <div style={{background:C.surfaceEl,borderRadius:13,padding:"4px 16px",border:`1px solid ${C.divider}`}}>
            <p className="la-section-title" style={{color:dc.color}}>Formation reçue</p>
            <Row label="Domaine"><span className="la-badge" style={{background:dc.bg,color:dc.color,border:`1px solid ${dc.color}25`}}>{dc.icon} {dc.l}</span></Row>
            <Row label="Formation ciblée">{candidat.formation_ciblee}</Row>
            <Row label="Session">
              {candidat.formation_detail?<span style={{display:"flex",flexDirection:"column",gap:2}}><span style={{fontWeight:700}}>{candidat.formation_detail.nom_formation}</span><span style={{fontSize:10,color:C.blue,fontFamily:"monospace",fontWeight:700}}>{candidat.formation_detail.identifiant_formation}</span></span>:"—"}
            </Row>
            <Row label="Antenne">{ANT_L(candidat.antenne)||ANT_L(candidat.formation_detail?.antenne)}</Row>
            <Row label="Niveau d'étude">{candidat.niveau_etude}</Row>
            <Row label="Satisfaction formation"><StarRating value={candidat.satisfaction_formation} readOnly/></Row>
          </div>
          {/* Insertion */}
          <div style={{background:candidat.insere?C.greenPale:`${C.gold}08`,borderRadius:13,padding:"4px 16px",border:`1.5px solid ${candidat.insere?C.green:C.gold}22`}}>
            <p className="la-section-title" style={{color:candidat.insere?C.green:C.gold}}>Insertion professionnelle</p>
            <Row label="Statut insertion"><InsereBadge insere={candidat.insere} statut_emploi={candidat.statut_emploi_actuel}/></Row>
            <Row label="Statut emploi actuel">{STATUTS_EMPLOI.find(s=>s.v===candidat.statut_emploi_actuel)?.l||"—"}</Row>
            {candidat.insere&&<>
              <Row label="Entreprise">{candidat.entreprise_insertion}</Row>
              <Row label="Poste occupé">{candidat.poste_occupe}</Row>
              <Row label="Type de contrat">{CONTRATS.find(c=>c.v===candidat.type_contrat)?.l||"—"}</Row>
              <Row label="Salaire mensuel">{fmtNum(candidat.salaire_insertion)}</Row>
              <Row label="Secteur d'activité">{candidat.secteur_activite}</Row>
              <Row label="Date de prise de poste">{fmtDate(candidat.date_insertion)}</Row>
              <Row label="Durée recherche emploi">{candidat.duree_recherche_emploi!=null?`${candidat.duree_recherche_emploi} mois`:"—"}</Row>
            </>}
            <Row label="Formation complémentaire">{candidat.formation_complementaire===true?"Oui":candidat.formation_complementaire===false?"Non":"—"}</Row>
            {candidat.commentaire_insertion&&<Row label="Commentaire conseiller">{candidat.commentaire_insertion}</Row>}
            {candidat.date_suivi_insertion&&<Row label="Dernier suivi">{fmtDate(candidat.date_suivi_insertion)}{candidat.suivi_par&&` — ${candidat.suivi_par}`}</Row>}
          </div>
          {/* Situation avant formation */}
          <div style={{background:C.surfaceEl,borderRadius:13,padding:"4px 16px",border:`1px solid ${C.divider}`}}>
            <p className="la-section-title" style={{color:C.blue}}>Situation avant la formation</p>
            <Row label="Situation">{candidat.situation_label||candidat.situation}</Row>
            <Row label="Métier précédent">{candidat.metier_actuel}</Row>
          </div>
          {/* Traçabilité */}
          <div style={{background:C.surfaceEl,borderRadius:13,padding:"4px 16px",border:`1px solid ${C.divider}`}}>
            <p className="la-section-title" style={{color:C.textMuted}}>Traçabilité</p>
            <Row label="Créé le">{fmtDate(candidat.created_at)}</Row>
            <Row label="Créé par">{candidat.created_by_nom||"—"}</Row>
            <Row label="Conseiller">{candidat.conseiller||"—"}</Row>
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

/* ══════════════════════════════════════════════════════════════════
   DRAWER ÉDITION — avec bloc insertion complet
══════════════════════════════════════════════════════════════════ */
const EditDrawer=({candidat,onClose,onSaved})=>{
  const initForm=c=>({
    nom:c.nom||"",prenom:c.prenom||"",sexe:c.sexe||"",
    date_naissance:c.date_naissance||"",telephone:c.telephone||"",
    email:c.email||"",adresse:c.adresse||"",
    situation:c.situation||"",metier_actuel:c.metier_actuel||"",
    niveau_etude:c.niveau_etude||"",domaine:c.domaine||"",
    formation_ciblee:c.formation_ciblee||"",
    conseiller:c.conseiller||"",motivation:c.motivation||"",observation:c.observation||"",
    antenne:c.antenne||"",
    // Insertion
    insere:c.insere??null,
    entreprise_insertion:c.entreprise_insertion||"",
    poste_occupe:c.poste_occupe||"",
    type_contrat:c.type_contrat||"",
    salaire_insertion:c.salaire_insertion||"",
    secteur_activite:c.secteur_activite||"",
    date_insertion:c.date_insertion||"",
    duree_recherche_emploi:c.duree_recherche_emploi||"",
    formation_complementaire:c.formation_complementaire??null,
    satisfaction_formation:c.satisfaction_formation||null,
    statut_emploi_actuel:c.statut_emploi_actuel||"",
    commentaire_insertion:c.commentaire_insertion||"",
    date_suivi_insertion:c.date_suivi_insertion||"",
    suivi_par:c.suivi_par||"",
  });

  const [form,   setForm]   = useState(()=>initForm(candidat));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [tab,    setTab]    = useState("profil"); // profil | insertion

  const set=(k,v)=>setForm(f=>({...f,[k]:v}));

  const save=async()=>{
    setSaving(true);setErrors({});
    try{
      const payload={...form};
      if(payload.insere===""||payload.insere===undefined) payload.insere=null;
      if(payload.formation_complementaire===""||payload.formation_complementaire===undefined) payload.formation_complementaire=null;
      if(payload.satisfaction_formation==="") payload.satisfaction_formation=null;
      if(payload.salaire_insertion==="") payload.salaire_insertion=null;
      if(payload.duree_recherche_emploi==="") payload.duree_recherche_emploi=null;
      const r=await axios.patch(`${CONFIG.BASE_URL}/api/candidats/${candidat.id}/`,payload,{headers:authHeader()});
      onSaved(r.data);
    }catch(e){setErrors(e.response?.data||{non_field_errors:"Erreur lors de la sauvegarde."});}
    setSaving(false);
  };

  const FG=({label,children,err,col=1})=>(
    <div style={{gridColumn:`span ${col}`,display:"flex",flexDirection:"column",gap:5}}>
      <label style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:".06em"}}>{label}</label>
      {children}
      {err&&<p style={{fontSize:11,color:C.danger}}>{Array.isArray(err)?err[0]:err}</p>}
    </div>
  );

  const TABS=[{id:"profil",label:"Profil",icon:User},{id:"insertion",label:"Insertion",icon:Briefcase}];

  return(
    <div style={{position:"fixed",inset:0,zIndex:950,display:"flex",justifyContent:"flex-end"}}>
      <div style={{position:"absolute",inset:0,background:"rgba(6,16,42,.45)",backdropFilter:"blur(8px)"}} onClick={onClose}/>
      <div className="la-drawer" style={{position:"relative",width:"100%",maxWidth:560,background:C.surface,boxShadow:`-20px 0 60px ${C.shadowLg}`,display:"flex",flexDirection:"column",overflowY:"hidden"}}>
        <Tri h={4}/>
        {/* Header */}
        <div style={{padding:"16px 22px 0",borderBottom:`1px solid ${C.divider}`,background:`linear-gradient(180deg,${C.surfaceEl},${C.surface})`}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <div>
              <h2 className="la-serif" style={{fontSize:18,fontWeight:700,color:C.textPri}}>Modifier l'apprenant</h2>
              <p style={{fontSize:12,color:C.textMuted,marginTop:2}}>{candidat.nom} {candidat.prenom}</p>
            </div>
            <button onClick={onClose} style={{width:34,height:34,borderRadius:9,background:C.surfaceEl,border:`1px solid ${C.divider}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><X size={14} color={C.textMuted}/></button>
          </div>
          {/* Onglets */}
          <div style={{display:"flex",gap:2}}>
            {TABS.map(t=>{const TI=t.icon;const active=tab===t.id;return(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:7,padding:"9px 18px",borderRadius:"10px 10px 0 0",border:"none",cursor:"pointer",background:active?C.surface:"transparent",color:active?C.textPri:C.textMuted,fontSize:12.5,fontWeight:700,fontFamily:"'Outfit',sans-serif",borderBottom:active?`2px solid ${C.blue}`:"2px solid transparent",transition:"all .14s"}}>
                <TI size={13}/>{t.label}
                {t.id==="insertion"&&form.insere===true&&<span style={{width:7,height:7,borderRadius:"50%",background:C.green,display:"inline-block"}}/>}
              </button>
            );})}
          </div>
        </div>

        {/* Corps scrollable */}
        <div style={{flex:1,overflowY:"auto",padding:"18px 22px"}}>
          {errors.non_field_errors&&<div style={{background:C.dangerPale,border:`1px solid ${C.danger}30`,borderRadius:10,padding:"10px 14px",fontSize:13,color:C.danger,marginBottom:14}}>{errors.non_field_errors}</div>}

          {/* ── Tab PROFIL ── */}
          {tab==="profil"&&(
            <div style={{display:"flex",flexDirection:"column",gap:13}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <FG label="Nom" err={errors.nom}><input className="la-input" value={form.nom} onChange={e=>set("nom",e.target.value)} placeholder="Nom"/></FG>
                <FG label="Prénom" err={errors.prenom}><input className="la-input" value={form.prenom} onChange={e=>set("prenom",e.target.value)} placeholder="Prénom"/></FG>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <FG label="Sexe"><select className="la-input" value={form.sexe} onChange={e=>set("sexe",e.target.value)}><option value="">—</option><option value="H">Homme</option><option value="F">Femme</option></select></FG>
                <FG label="Date de naissance"><input className="la-input" type="date" value={form.date_naissance} onChange={e=>set("date_naissance",e.target.value)}/></FG>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <FG label="Téléphone"><input className="la-input" value={form.telephone} onChange={e=>set("telephone",e.target.value)} placeholder="+224 6XX…"/></FG>
                <FG label="Email"><input className="la-input" type="email" value={form.email} onChange={e=>set("email",e.target.value)}/></FG>
              </div>
              <FG label="Adresse"><input className="la-input" value={form.adresse} onChange={e=>set("adresse",e.target.value)}/></FG>
              <div style={{height:1,background:C.divider}}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <FG label="Domaine"><select className="la-input" value={form.domaine} onChange={e=>set("domaine",e.target.value)}><option value="">—</option>{DOMAINES.map(d=><option key={d.v} value={d.v}>{d.icon} {d.l}</option>)}</select></FG>
                <FG label="Niveau d'étude"><select className="la-input" value={form.niveau_etude} onChange={e=>set("niveau_etude",e.target.value)}><option value="">—</option>{NIVEAUX.map(n=><option key={n.v} value={n.v}>{n.l}</option>)}</select></FG>
              </div>
              <FG label="Formation ciblée"><input className="la-input" value={form.formation_ciblee} onChange={e=>set("formation_ciblee",e.target.value)} placeholder="Ex: Maçonnerie…"/></FG>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <FG label="Situation avant formation"><select className="la-input" value={form.situation} onChange={e=>set("situation",e.target.value)}><option value="">—</option>{SITUATIONS.map(s=><option key={s.v} value={s.v}>{s.l}</option>)}</select></FG>
                <FG label="Antenne"><select className="la-input" value={form.antenne} onChange={e=>set("antenne",e.target.value)}><option value="">—</option>{ANTENNES.map(a=><option key={a.v} value={a.v}>{a.l}</option>)}</select></FG>
              </div>
              <FG label="Métier avant formation"><input className="la-input" value={form.metier_actuel} onChange={e=>set("metier_actuel",e.target.value)}/></FG>
              <FG label="Conseiller responsable"><input className="la-input" value={form.conseiller} onChange={e=>set("conseiller",e.target.value)}/></FG>
              <FG label="Observation"><textarea className="la-input" value={form.observation} onChange={e=>set("observation",e.target.value)} rows={2} style={{resize:"vertical"}}/></FG>
            </div>
          )}

          {/* ── Tab INSERTION ── */}
          {tab==="insertion"&&(
            <div style={{display:"flex",flexDirection:"column",gap:13}}>
              {/* Statut principal */}
              <div style={{background:form.insere===true?C.greenPale:form.insere===false?`${C.gold}08`:C.surfaceEl,borderRadius:14,padding:"14px 16px",border:`1.5px solid ${form.insere===true?C.green:form.insere===false?C.gold:C.divider}30`}}>
                <p style={{fontSize:11,fontWeight:800,color:form.insere===true?C.green:C.gold,letterSpacing:".1em",textTransform:"uppercase",marginBottom:10}}>Statut d'insertion</p>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                  {[
                    {v:true, l:"✅ Inséré",    bg:C.greenPale, c:C.green},
                    {v:false,l:"🔍 En recherche",bg:`${C.gold}15`,c:C.gold},
                    {v:null, l:"— Non renseigné",bg:C.surfaceEl,c:C.textMuted},
                  ].map(opt=>(
                    <button key={String(opt.v)} onClick={()=>set("insere",opt.v)} style={{
                      padding:"9px 8px",borderRadius:10,cursor:"pointer",border:"none",
                      background:form.insere===opt.v?opt.bg:C.surface,
                      color:form.insere===opt.v?opt.c:C.textMuted,
                      fontFamily:"'Outfit',sans-serif",fontSize:12,fontWeight:700,
                      boxShadow:form.insere===opt.v?`0 0 0 2px ${opt.c}50`:`0 0 0 1px ${C.divider}`,
                      transition:"all .15s",
                    }}>{opt.l}</button>
                  ))}
                </div>
              </div>

              <FG label="Statut emploi actuel">
                <select className="la-input" value={form.statut_emploi_actuel} onChange={e=>set("statut_emploi_actuel",e.target.value)}>
                  <option value="">— Sélectionner —</option>
                  {STATUTS_EMPLOI.map(s=><option key={s.v} value={s.v}>{s.l}</option>)}
                </select>
              </FG>

              {/* Champs emploi — visibles si inséré */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <FG label="Entreprise d'insertion">
                  <input className="la-input" value={form.entreprise_insertion} onChange={e=>set("entreprise_insertion",e.target.value)} placeholder="Nom de l'entreprise"/>
                </FG>
                <FG label="Poste / Intitulé du métier">
                  <input className="la-input" value={form.poste_occupe} onChange={e=>set("poste_occupe",e.target.value)} placeholder="Ex: Technicien réseau"/>
                </FG>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <FG label="Type de contrat">
                  <select className="la-input" value={form.type_contrat} onChange={e=>set("type_contrat",e.target.value)}>
                    <option value="">—</option>
                    {CONTRATS.map(c=><option key={c.v} value={c.v}>{c.l}</option>)}
                  </select>
                </FG>
                <FG label="Date de prise de poste">
                  <input className="la-input" type="date" value={form.date_insertion} onChange={e=>set("date_insertion",e.target.value)}/>
                </FG>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <FG label="Salaire mensuel brut (GNF)">
                  <input className="la-input" type="number" value={form.salaire_insertion} onChange={e=>set("salaire_insertion",e.target.value)} placeholder="Ex: 2500000"/>
                </FG>
                <FG label="Durée recherche emploi (mois)">
                  <input className="la-input" type="number" min="0" max="60" value={form.duree_recherche_emploi} onChange={e=>set("duree_recherche_emploi",e.target.value)} placeholder="Ex: 3"/>
                </FG>
              </div>

              <FG label="Secteur d'activité de l'entreprise">
                <input className="la-input" value={form.secteur_activite} onChange={e=>set("secteur_activite",e.target.value)} placeholder="Ex: Télécommunications, BTP…"/>
              </FG>

              <div style={{height:1,background:C.divider}}/>

              {/* Satisfaction & complémentaire */}
              <FG label="Satisfaction vis-à-vis de la formation ONFPP">
                <div style={{display:"flex",alignItems:"center",gap:6,padding:"8px 0"}}>
                  <StarRating value={form.satisfaction_formation} onChange={v=>set("satisfaction_formation",v)}/>
                  {form.satisfaction_formation&&<button onClick={()=>set("satisfaction_formation",null)} style={{fontSize:11,color:C.textMuted,background:"none",border:"none",cursor:"pointer"}}>Effacer</button>}
                </div>
              </FG>

              <FG label="Formation complémentaire suivie après l'ONFPP ?">
                <div style={{display:"flex",gap:10}}>
                  {[{v:true,l:"✓ Oui"},{v:false,l:"✗ Non"},{v:null,l:"— Non renseigné"}].map(opt=>(
                    <button key={String(opt.v)} onClick={()=>set("formation_complementaire",opt.v)} style={{
                      flex:1,padding:"9px 6px",borderRadius:9,cursor:"pointer",border:"none",
                      background:form.formation_complementaire===opt.v?`${C.blue}14`:C.surfaceEl,
                      color:form.formation_complementaire===opt.v?C.blue:C.textMuted,
                      fontFamily:"'Outfit',sans-serif",fontSize:12,fontWeight:700,
                      boxShadow:form.formation_complementaire===opt.v?`0 0 0 2px ${C.blue}40`:`0 0 0 1px ${C.divider}`,
                    }}>{opt.l}</button>
                  ))}
                </div>
              </FG>

              <div style={{height:1,background:C.divider}}/>
              <p style={{fontSize:10,fontWeight:800,color:C.textMuted,letterSpacing:".12em",textTransform:"uppercase"}}>Suivi insertion (conseiller)</p>

              <FG label="Commentaire insertion">
                <textarea className="la-input" value={form.commentaire_insertion} onChange={e=>set("commentaire_insertion",e.target.value)} rows={3} placeholder="Notes, difficultés rencontrées, points forts…" style={{resize:"vertical"}}/>
              </FG>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <FG label="Date du dernier suivi">
                  <input className="la-input" type="date" value={form.date_suivi_insertion} onChange={e=>set("date_suivi_insertion",e.target.value)}/>
                </FG>
                <FG label="Suivi réalisé par">
                  <input className="la-input" value={form.suivi_par} onChange={e=>set("suivi_par",e.target.value)} placeholder="Nom du conseiller"/>
                </FG>
              </div>
            </div>
          )}
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

/* ── Confirm Delete ── */
const DeleteConfirm=({candidat,onClose,onDeleted})=>{
  const [del,setDel]=useState(false);
  const go=async()=>{setDel(true);try{await axios.delete(`${CONFIG.BASE_URL}/api/candidats/${candidat.id}/`,{headers:authHeader()});onDeleted(candidat.id);}catch{}setDel(false);};
  return(
    <div style={{position:"fixed",inset:0,zIndex:980,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{position:"absolute",inset:0,background:"rgba(6,16,42,.55)",backdropFilter:"blur(10px)"}} onClick={onClose}/>
      <div className="la-confirm" style={{position:"relative",background:C.surface,borderRadius:18,padding:"28px",maxWidth:400,width:"90%",boxShadow:`0 28px 70px ${C.shadowLg}`,border:`1px solid ${C.divider}`}}>
        <div style={{width:52,height:52,borderRadius:14,background:C.dangerPale,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14}}><Trash2 size={22} color={C.danger}/></div>
        <h3 className="la-serif" style={{fontSize:17,fontWeight:700,color:C.textPri,marginBottom:8}}>Supprimer cet apprenant ?</h3>
        <p style={{fontSize:13,color:C.textMuted,lineHeight:1.6,marginBottom:20}}><strong style={{color:C.textPri}}>{candidat.nom} {candidat.prenom}</strong> sera définitivement supprimé.</p>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <button className="la-btn la-btn-sec" onClick={onClose} disabled={del}><X size={13}/>Annuler</button>
          <button className="la-btn la-btn-danger" onClick={go} disabled={del} style={{background:C.danger,color:"#fff"}}>
            {del?<Loader2 size={13} className="la-spin"/>:<Trash2 size={13}/>}{del?"Suppression…":"Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════════════════════════════════ */
const ListeApprenants=()=>{
  const [candidats, setCandidats] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [fDom,      setFDom]      = useState("");
  const [fAnt,      setFAnt]      = useState("");
  const [fStat,     setFStat]     = useState("");
  const [fIns,      setFIns]      = useState("");
  const [fEmploi,   setFEmploi]   = useState("");
  const [page,      setPage]      = useState(1);
  const [collapsed, setCollapsed] = useState({});
  const [detail,    setDetail]    = useState(null);
  const [editing,   setEditing]   = useState(null);
  const [deleting,  setDeleting]  = useState(null);

  const fetch=useCallback(async()=>{
    setLoading(true);
    try{const r=await axios.get(`${CONFIG.BASE_URL}${CONFIG.API_CANDIDATS||"/api/candidats/"}`,{headers:authHeader()});
      setCandidats(Array.isArray(r.data)?r.data:r.data.results||[]);}
    catch{}finally{setLoading(false);}
  },[]);
  useEffect(()=>{fetch();},[fetch]);

  const filtered=candidats.filter(c=>{
    const q=search.toLowerCase();
    const ms=!q||[c.nom,c.prenom,c.telephone,c.email,c.identifiant_unique,
      c.formation_detail?.nom_formation,c.formation_ciblee,c.entreprise_insertion,c.poste_occupe]
      .some(v=>v?.toLowerCase().includes(q));
    return ms
      &&(!fDom||c.domaine===fDom)
      &&(!fAnt||(c.antenne===fAnt||c.formation_detail?.antenne===fAnt))
      &&(!fStat||c.statut_fiche===fStat)
      &&(fIns===""
        ||(fIns==="true"&&c.insere===true)
        ||(fIns==="false"&&c.insere!==true))
      &&(!fEmploi||c.statut_emploi_actuel===fEmploi);
  });

  const grouped=DOMAINES.map(d=>({...d,items:filtered.filter(c=>(c.domaine||"autre")===d.v)})).filter(g=>g.items.length>0);
  const useGrouped=!search&&!fDom&&!fAnt&&!fStat&&fIns===""&&!fEmploi;
  const totalPages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
  const paged=filtered.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE);

  const stats={
    total:   candidats.length,
    valides: candidats.filter(c=>c.statut_fiche==="valide").length,
    inseres: candidats.filter(c=>c.insere===true).length,
    taux:    candidats.filter(c=>c.statut_fiche==="valide").length
      ? Math.round(candidats.filter(c=>c.insere===true).length/candidats.filter(c=>c.statut_fiche==="valide").length*100)
      : 0,
  };

  const handleSaved=u=>{setCandidats(p=>p.map(c=>c.id===u.id?u:c));setEditing(null);if(detail?.id===u.id)setDetail(u);};
  const handleDeleted=id=>{setCandidats(p=>p.filter(c=>c.id!==id));setDeleting(null);setDetail(null);};
  useEffect(()=>setPage(1),[search,fDom,fAnt,fStat,fIns,fEmploi]);

  const ActionBtns=({c})=>(
    <div style={{display:"flex",gap:5}} onClick={e=>e.stopPropagation()}>
      {[{icon:Eye,c:C.blue,fn:()=>setDetail(c)},{icon:Pencil,c:C.green,fn:()=>setEditing(c)},{icon:Trash2,c:C.danger,bg:C.dangerPale,fn:()=>setDeleting(c)}].map(({icon:Icon,c:col,bg,fn},i)=>(
        <button key={i} onClick={fn} style={{width:29,height:29,borderRadius:7,background:bg||`${col}08`,border:`1px solid ${col}20`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .13s"}}
          onMouseEnter={e=>{e.currentTarget.style.background=`${col}20`;e.currentTarget.style.borderColor=col;}}
          onMouseLeave={e=>{e.currentTarget.style.background=bg||`${col}08`;e.currentTarget.style.borderColor=`${col}20`;}}>
          <Icon size={12} color={col}/>
        </button>
      ))}
    </div>
  );

  return(
    <>
      <style>{CSS}</style>
      <div className="la la-page" style={{minHeight:"100vh",background:`radial-gradient(ellipse 100% 50% at 65% -5%,rgba(22,53,200,.06) 0%,transparent 58%),${C.page}`,padding:"88px 26px 70px",position:"relative"}}>
        <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",overflow:"hidden"}}>
          <div className="la-aurora" style={{position:"absolute",top:"-8%",right:"10%",width:460,height:460,borderRadius:"50%",background:"radial-gradient(circle,rgba(22,53,200,.06) 0%,transparent 70%)",filter:"blur(30px)"}}/>
        </div>

        <div style={{position:"relative",zIndex:1,maxWidth:1280,margin:"0 auto"}}>
          {/* En-tête */}
          <div className="la-in la-d0" style={{marginBottom:26}}>
            <div style={{width:72,marginBottom:12}}><Tri h={3} r={3}/></div>
            <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:14}}>
              <div>
                <h1 className="la-serif" style={{fontSize:34,fontWeight:700,color:C.textPri,letterSpacing:"-.8px",lineHeight:1.05}}>Apprenants ONFPP</h1>
                <p style={{fontSize:13.5,color:C.textMuted,marginTop:7}}>Gestion complète — profil, suivi et insertion professionnelle</p>
              </div>
              <button className="la-btn la-btn-sec" onClick={fetch}><RefreshCw size={13}/>Actualiser</button>
            </div>
          </div>

          {/* KPI */}
          <div className="la-in la-d1" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(165px,1fr))",gap:13,marginBottom:24}}>
            {[
              {label:"Total apprenants",  value:stats.total,   color:C.blue,  bg:`${C.blue}10`,  icon:Users},
              {label:"Fiches validées",   value:stats.valides, color:C.green, bg:C.greenPale,    icon:CheckCircle2},
              {label:"Insérés en emploi", value:stats.inseres, color:C.teal,  bg:C.tealPale,     icon:Briefcase},
              {label:"Taux d'insertion",  value:`${stats.taux}%`,color:C.violet,bg:C.violetPale, icon:TrendingUp},
            ].map((s,i)=>{const SI=s.icon;return(
              <div key={i} className={`la-in la-d${i+1}`} style={{background:C.surface,borderRadius:17,padding:"17px 15px",border:`1px solid ${C.divider}`,boxShadow:`0 2px 14px ${C.shadow}`,position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${s.color},${s.color}55)`,borderRadius:"17px 17px 0 0"}}/>
                <div style={{position:"absolute",bottom:-16,right:-16,width:80,height:80,borderRadius:"50%",background:`${s.color}06`}}/>
                <div style={{width:36,height:36,borderRadius:10,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:11}}><SI size={16} color={s.color}/></div>
                <p className="la-serif" style={{fontSize:28,fontWeight:700,color:C.textPri,lineHeight:1,letterSpacing:"-1px"}}>{s.value}</p>
                <p style={{fontSize:11.5,color:C.textMuted,marginTop:5}}>{s.label}</p>
              </div>
            );})}
          </div>

          {/* Filtres */}
          <div className="la-in la-d2" style={{background:C.surface,border:`1px solid ${C.divider}`,borderRadius:15,padding:"13px 16px",marginBottom:18,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",boxShadow:`0 2px 12px ${C.shadow}`}}>
            <div style={{position:"relative",flex:"1 1 200px",minWidth:0}}>
              <Search size={13} color={C.textMuted} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}/>
              <input className="la-input" placeholder="Nom, ID, entreprise…" value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:37}}/>
            </div>
            <select className="la-input" value={fDom} onChange={e=>setFDom(e.target.value)} style={{width:"auto",minWidth:170}}><option value="">Tous les domaines</option>{DOMAINES.map(d=><option key={d.v} value={d.v}>{d.icon} {d.l}</option>)}</select>
            <select className="la-input" value={fAnt} onChange={e=>setFAnt(e.target.value)} style={{width:"auto",minWidth:140}}><option value="">Toutes antennes</option>{ANTENNES.map(a=><option key={a.v} value={a.v}>{a.l}</option>)}</select>
            <select className="la-input" value={fStat} onChange={e=>setFStat(e.target.value)} style={{width:"auto",minWidth:130}}><option value="">Tous statuts</option>{STATUTS_FICHE.map(s=><option key={s.v} value={s.v}>{s.l}</option>)}</select>
            <select className="la-input" value={fIns} onChange={e=>setFIns(e.target.value)} style={{width:"auto",minWidth:135}}><option value="">Insertion : tous</option><option value="true">✅ Insérés</option><option value="false">⏳ Non insérés</option></select>
            <select className="la-input" value={fEmploi} onChange={e=>setFEmploi(e.target.value)} style={{width:"auto",minWidth:140}}><option value="">Emploi : tous</option>{STATUTS_EMPLOI.map(s=><option key={s.v} value={s.v}>{s.l}</option>)}</select>
            <p style={{fontSize:12,color:C.textMuted,flexShrink:0}}><span style={{fontWeight:700,color:C.textSub}}>{filtered.length}</span> apprenant{filtered.length>1?"s":""}</p>
          </div>

          {/* Contenu */}
          {loading?(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"72px 0",gap:14}}>
              <Loader2 size={28} color={C.blue} className="la-spin"/>
              <p style={{fontSize:13.5,color:C.textMuted}}>Chargement…</p>
            </div>
          ):filtered.length===0?(
            <div className="la-in" style={{background:C.surface,borderRadius:18,padding:"64px 0",display:"flex",flexDirection:"column",alignItems:"center",gap:12,border:`1px solid ${C.divider}`}}>
              <Users size={26} color={C.textMuted}/><p className="la-serif" style={{fontSize:16,color:C.textSub}}>Aucun apprenant trouvé</p>
            </div>
          ):useGrouped?(
            /* VUE GROUPÉE */
            <div style={{display:"flex",flexDirection:"column",gap:13}}>
              {grouped.map((grp,gi)=>{
                const isOpen=!collapsed[grp.v];
                const nbInseres=grp.items.filter(c=>c.insere===true).length;
                return(
                  <div key={grp.v} className={`la-in la-d${Math.min(gi,4)}`} style={{background:C.surface,borderRadius:18,border:`1px solid ${C.divider}`,boxShadow:`0 2px 14px ${C.shadow}`,overflow:"hidden"}}>
                    <div className="la-group-hdr" onClick={()=>setCollapsed(p=>({...p,[grp.v]:!p[grp.v]}))}
                      style={{"--gc":grp.color,"--gc-bg":`${grp.color}0D`}}>
                      <span style={{fontSize:22}}>{grp.icon}</span>
                      <div style={{flex:1}}>
                        <p className="la-serif" style={{fontSize:15,fontWeight:700,color:C.textPri}}>{grp.l}</p>
                        <p style={{fontSize:11.5,color:C.textMuted}}>{grp.items.length} apprenant{grp.items.length>1?"s":""}</p>
                      </div>
                      <div className="la-hide-md" style={{display:"flex",gap:8,marginRight:10}}>
                        <span className="la-badge" style={{background:C.greenPale,color:C.green,border:`1px solid ${C.green}22`}}><CheckCircle2 size={9}/>{grp.items.filter(c=>c.statut_fiche==="valide").length} validés</span>
                        <span className="la-badge" style={{background:C.tealPale,color:C.teal,border:`1px solid ${C.teal}22`}}><Briefcase size={9}/>{nbInseres} insérés</span>
                        {grp.items.length>0&&<span className="la-badge" style={{background:C.violetPale,color:C.violet,border:`1px solid ${C.violet}22`}}>{Math.round(nbInseres/grp.items.length*100)}% taux</span>}
                      </div>
                      {isOpen?<ChevronUp size={16} color={grp.color}/>:<ChevronDown size={16} color={grp.color}/>}
                    </div>
                    {isOpen&&(
                      <div style={{overflowX:"auto"}}>
                        <table style={{width:"100%",borderCollapse:"collapse"}}>
                          <thead>
                            <tr style={{background:`${grp.color}06`,borderBottom:`1px solid ${C.divider}`}}>
                              {["ID ONFPP","Apprenant","Sexe","Formation / Session","Antenne","Statut fiche","Inséré","Emploi actuel","Date inscr.","Actions"].map((h,i)=>(
                                <th key={i} className={i>=6?"la-hide-md":""} style={{padding:"10px 13px",textAlign:"left",fontSize:9.5,fontWeight:800,color:C.textMuted,letterSpacing:".1em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {grp.items.map((c,ri)=>(
                              <tr key={c.id} className="la-tr" style={{borderBottom:`1px solid ${C.divider}`,background:ri%2===0?C.surface:`${grp.color}025`}} onClick={()=>setDetail(c)}>
                                <td style={{padding:"11px 13px"}}>{c.identifiant_unique?<span style={{fontSize:10,color:grp.color,background:grp.bg,padding:"2px 7px",borderRadius:5,fontWeight:800,fontFamily:"monospace",border:`1px solid ${grp.color}25`,whiteSpace:"nowrap"}}>{c.identifiant_unique}</span>:<span style={{fontSize:11,color:C.textMuted}}>—</span>}</td>
                                <td style={{padding:"11px 13px"}}>
                                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                                    <div style={{width:32,height:32,borderRadius:9,background:grp.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:14}}>{c.sexe==="F"?"👩":"👨"}</div>
                                    <div><p style={{fontSize:13,fontWeight:700,color:C.textPri,lineHeight:1.2}}>{c.nom} {c.prenom}</p><p style={{fontSize:11,color:C.textMuted}}>{c.telephone||"—"}</p></div>
                                  </div>
                                </td>
                                <td style={{padding:"11px 13px"}}><SexeBadge sexe={c.sexe}/></td>
                                <td style={{padding:"11px 13px",maxWidth:190}}>
                                  {c.formation_detail?<div><p style={{fontSize:12,fontWeight:600,color:C.textPri,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:175}}>{c.formation_detail.nom_formation}</p><p style={{fontSize:10,color:C.blue,fontFamily:"monospace",fontWeight:700}}>{c.formation_detail.identifiant_formation}</p></div>:<span style={{fontSize:12,color:C.textMuted}}>{c.formation_ciblee||"—"}</span>}
                                </td>
                                <td style={{padding:"11px 13px"}}><div style={{display:"flex",alignItems:"center",gap:5}}><MapPin size={11} color={C.textMuted}/><span style={{fontSize:12,color:C.textSub,fontWeight:500}}>{ANT_L(c.antenne)||ANT_L(c.formation_detail?.antenne)}</span></div></td>
                                <td style={{padding:"11px 13px"}}><StatutBadge statut={c.statut_fiche}/></td>
                                <td className="la-hide-md" style={{padding:"11px 13px"}}><InsereBadge insere={c.insere} statut_emploi={c.statut_emploi_actuel}/></td>
                                <td className="la-hide-md" style={{padding:"11px 13px"}}>
                                  {c.statut_emploi_actuel?<div><p style={{fontSize:11.5,color:C.textSub,fontWeight:500}}>{STATUTS_EMPLOI.find(s=>s.v===c.statut_emploi_actuel)?.l||"—"}</p>{c.poste_occupe&&<p style={{fontSize:11,color:C.textMuted,marginTop:1}}>{c.poste_occupe}</p>}</div>:<span style={{fontSize:11,color:C.textMuted}}>—</span>}
                                </td>
                                <td className="la-hide-md" style={{padding:"11px 13px",fontSize:11.5,color:C.textMuted}}>{fmtDate(c.created_at)}</td>
                                <td style={{padding:"11px 13px"}}><ActionBtns c={c}/></td>
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
          ):(
            /* VUE PAGINÉE (filtres actifs) */
            <div className="la-in la-d2" style={{background:C.surface,border:`1px solid ${C.divider}`,borderRadius:18,boxShadow:`0 2px 16px ${C.shadow}`,overflow:"hidden"}}>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr style={{background:`${C.navy}04`,borderBottom:`1.5px solid ${C.divider}`}}>
                      {["ID","Apprenant","Domaine","Formation","Antenne","Statut","Inséré","Emploi","Actions"].map((h,i)=>(
                        <th key={i} className={i>=5?"la-hide-md":""} style={{padding:"12px 14px",textAlign:"left",fontSize:10,fontWeight:800,color:C.textMuted,letterSpacing:".1em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((c,ri)=>{const dc=DOM_CFG(c.domaine);return(
                      <tr key={c.id} className="la-tr" style={{borderBottom:`1px solid ${C.divider}`,background:ri%2===0?C.surface:`${C.navy}008`}} onClick={()=>setDetail(c)}>
                        <td style={{padding:"12px 14px"}}>{c.identifiant_unique?<span style={{fontSize:10,color:dc.color,background:dc.bg,padding:"2px 7px",borderRadius:5,fontWeight:800,fontFamily:"monospace",border:`1px solid ${dc.color}25`}}>{c.identifiant_unique}</span>:<span style={{color:C.textMuted,fontSize:11}}>—</span>}</td>
                        <td style={{padding:"12px 14px"}}><div style={{display:"flex",alignItems:"center",gap:9}}><div style={{width:32,height:32,borderRadius:9,background:dc.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:14}}>{dc.icon}</div><div><p style={{fontSize:13,fontWeight:700,color:C.textPri}}>{c.nom} {c.prenom}</p><p style={{fontSize:11,color:C.textMuted}}>{c.telephone||"—"}</p></div></div></td>
                        <td style={{padding:"12px 14px"}}><span className="la-badge" style={{background:dc.bg,color:dc.color,border:`1px solid ${dc.color}25`}}>{dc.icon} {dc.l}</span></td>
                        <td style={{padding:"12px 14px",maxWidth:180}}>{c.formation_detail?<div><p style={{fontSize:12,fontWeight:600,color:C.textPri,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:165}}>{c.formation_detail.nom_formation}</p><p style={{fontSize:10,color:C.blue,fontFamily:"monospace",fontWeight:700}}>{c.formation_detail.identifiant_formation}</p></div>:<span style={{fontSize:12,color:C.textMuted}}>{c.formation_ciblee||"—"}</span>}</td>
                        <td style={{padding:"12px 14px"}}><div style={{display:"flex",alignItems:"center",gap:5}}><MapPin size={11} color={C.textMuted}/><span style={{fontSize:12,color:C.textSub,fontWeight:500}}>{ANT_L(c.antenne)||ANT_L(c.formation_detail?.antenne)}</span></div></td>
                        <td className="la-hide-md" style={{padding:"12px 14px"}}><StatutBadge statut={c.statut_fiche}/></td>
                        <td className="la-hide-md" style={{padding:"12px 14px"}}><InsereBadge insere={c.insere} statut_emploi={c.statut_emploi_actuel}/></td>
                        <td className="la-hide-md" style={{padding:"12px 14px",fontSize:11.5,color:C.textSub}}>{c.statut_emploi_actuel?STATUTS_EMPLOI.find(s=>s.v===c.statut_emploi_actuel)?.l:"—"}</td>
                        <td style={{padding:"12px 14px"}}><ActionBtns c={c}/></td>
                      </tr>
                    );})}
                  </tbody>
                </table>
              </div>
              {totalPages>1&&(
                <div style={{padding:"12px 18px",borderTop:`1px solid ${C.divider}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
                  <p style={{fontSize:12,color:C.textMuted}}><span style={{fontWeight:700,color:C.textSub}}>{(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE,filtered.length)}</span> / <span style={{fontWeight:700,color:C.textSub}}>{filtered.length}</span></p>
                  <div style={{display:"flex",gap:5}}>
                    <button className="la-pg" onClick={()=>setPage(p=>p-1)} disabled={page===1}><ChevronLeft size={13}/></button>
                    {Array.from({length:totalPages},(_,i)=>i+1).filter(p=>p===1||p===totalPages||Math.abs(p-page)<=1).map((p,i,arr)=>(
                      <React.Fragment key={p}>{i>0&&arr[i-1]!==p-1&&<span style={{color:C.textMuted,fontSize:12}}>…</span>}
                        <button className={`la-pg${p===page?" active":""}`} onClick={()=>setPage(p)}>{p}</button></React.Fragment>
                    ))}
                    <button className="la-pg" onClick={()=>setPage(p=>p+1)} disabled={page===totalPages}><ChevronRight size={13}/></button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info */}
          <div className="la-in la-d4" style={{marginTop:13,padding:"11px 16px",background:`${C.navy}03`,borderRadius:11,border:`1px solid ${C.divider}`,display:"flex",alignItems:"center",gap:9}}>
            <Zap size={13} color={C.textMuted}/>
            <p style={{fontSize:12,color:C.textMuted}}>Vue groupée par domaine sans filtres. Cliquez sur une ligne pour les détails. ✏️ modifier, 🗑️ supprimer. Filtrez pour basculer en vue paginée.</p>
          </div>
        </div>
      </div>

      {detail  &&!editing&&<DetailModal candidat={detail}  onClose={()=>setDetail(null)}  onEdit={c=>{setEditing(c);setDetail(null);}}/>}
      {editing &&           <EditDrawer candidat={editing} onClose={()=>setEditing(null)} onSaved={handleSaved}/>}
      {deleting&&           <DeleteConfirm candidat={deleting} onClose={()=>setDeleting(null)} onDeleted={handleDeleted}/>}
    </>
  );
};
export default ListeApprenants;