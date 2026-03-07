import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import CONFIG from "../../config/config.js";
import {
  UserPlus, Users, Search, Pencil, Trash2, X, Check,
  ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2,
  User, Phone, Mail, MapPin, BookOpen, Briefcase, Calendar,
  RefreshCw, Loader2, Eye, ShieldCheck, ShieldX,
  Building2, GraduationCap, ClipboardList, MapPinned,
  FileText, Target, MessageSquare, Hash, Star,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   PALETTE
═══════════════════════════════════════════════════ */
const C = {
  page:       "#F8F9FD",
  surface:    "#FFFFFF",
  surfaceEl:  "#F4F7FF",
  navy:       "#06102A",
  blue:       "#1635C8",
  blueViv:    "#2447E0",
  textPri:    "#06102A",
  textSub:    "#3A4F8C",
  textMuted:  "#8497C8",
  gold:       "#D4920A",
  goldPale:   "#FFF8E7",
  green:      "#047A5A",
  greenPale:  "#E8FBF5",
  danger:     "#C81B1B",
  dangerPale: "#FEF2F2",
  divider:    "#E8EDFC",
  shadow:     "rgba(6,16,42,0.08)",
  shadowMd:   "rgba(6,16,42,0.15)",
  purple:     "#6B21A8",
  purplePale: "#F5F3FF",
  teal:       "#0E7490",
  tealPale:   "#F0FDFF",
};

/* ═══════════════════════════════════════════════════
   CSS GLOBAL
═══════════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  .ins { font-family:'Outfit',sans-serif; -webkit-font-smoothing:antialiased; }
  .ins-serif { font-family:'Fraunces',serif !important; }

  .ins-page::before {
    content:''; position:fixed; inset:0; pointer-events:none; z-index:0;
    background-image: radial-gradient(circle at 1px 1px, rgba(22,53,200,.05) 1px, transparent 0);
    background-size:28px 28px;
  }

  .ins-btn-pri {
    display:inline-flex; align-items:center; gap:8px;
    padding:10px 22px; border-radius:11px; border:none; cursor:pointer;
    font-family:'Outfit',sans-serif; font-size:13px; font-weight:700;
    background:linear-gradient(135deg,#1635C8,#2447E0); color:#fff;
    box-shadow:0 4px 18px rgba(22,53,200,.28);
    transition:all .18s cubic-bezier(.34,1.2,.64,1);
  }
  .ins-btn-pri:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(22,53,200,.38); }
  .ins-btn-pri:disabled { opacity:.55; transform:none; cursor:not-allowed; }

  .ins-btn-sec {
    display:inline-flex; align-items:center; gap:7px;
    padding:9px 18px; border-radius:10px; cursor:pointer;
    font-family:'Outfit',sans-serif; font-size:12.5px; font-weight:600;
    background:#fff; color:#3A4F8C; border:1px solid #E8EDFC;
    transition:all .15s ease;
  }
  .ins-btn-sec:hover { background:#F4F7FF; border-color:#D0D9FF; }

  .ins-btn-success {
    display:inline-flex; align-items:center; gap:7px;
    padding:9px 18px; border-radius:10px; cursor:pointer;
    font-family:'Outfit',sans-serif; font-size:12.5px; font-weight:700;
    background:#047A5A; color:#fff; border:none;
    box-shadow:0 4px 14px rgba(4,122,90,.28); transition:all .15s;
  }
  .ins-btn-success:hover { background:#035E45; transform:translateY(-1px); }
  .ins-btn-success:disabled { opacity:.5; cursor:not-allowed; transform:none; }

  .ins-btn-danger {
    display:inline-flex; align-items:center; gap:7px;
    padding:9px 18px; border-radius:10px; cursor:pointer;
    font-family:'Outfit',sans-serif; font-size:12.5px; font-weight:700;
    background:#C81B1B; color:#fff; border:none;
    box-shadow:0 4px 14px rgba(200,27,27,.28); transition:all .15s;
  }
  .ins-btn-danger:hover { background:#A51515; transform:translateY(-1px); }
  .ins-btn-danger:disabled { opacity:.5; cursor:not-allowed; transform:none; }

  .ins-input {
    width:100%; padding:11px 14px; border-radius:10px;
    border:1.5px solid #E8EDFC;
    background:#fff; color:#06102A;
    font-family:'Outfit',sans-serif; font-size:14px; font-weight:400;
    outline:none; transition:border-color .16s, box-shadow .16s;
    -webkit-font-smoothing:antialiased;
  }
  .ins-input:focus { border-color:#1635C8; box-shadow:0 0 0 3px rgba(22,53,200,.1); }
  .ins-input::placeholder { color:#8497C8; }
  .ins-input-err { border-color:#C81B1B !important; }
  .ins-input-err:focus { box-shadow:0 0 0 3px rgba(200,27,27,.1) !important; }
  select.ins-input { cursor:pointer; }
  textarea.ins-input { resize:vertical; min-height:80px; line-height:1.5; }

  .ins-tr { transition:background .12s; }
  .ins-tr:hover { background:#F4F7FF !important; }
  .ins-act-btn {
    width:30px; height:30px; border-radius:8px; border:1px solid #E8EDFC;
    display:flex; align-items:center; justify-content:center; cursor:pointer;
    background:#fff; transition:all .14s cubic-bezier(.34,1.3,.64,1);
  }
  .ins-act-btn:hover { transform:scale(1.12); }
  .ins-badge {
    display:inline-flex; align-items:center; gap:5px;
    border-radius:20px; padding:3px 10px;
    font-size:10.5px; font-weight:700;
  }

  @keyframes insUp {
    from { opacity:0; transform:translateY(18px) scale(.985); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  .ins-in  { animation:insUp .45s cubic-bezier(.22,1,.36,1) both; }
  .ins-d0  { animation-delay:.0s; }
  .ins-d1  { animation-delay:.07s; }
  .ins-d2  { animation-delay:.14s; }

  @keyframes insModal {
    from { opacity:0; transform:scale(.94) translateY(-16px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }
  .ins-modal { animation:insModal .24s cubic-bezier(.22,1,.36,1) both; }

  @keyframes insSpin { to { transform:rotate(360deg); } }
  .ins-spin { animation:insSpin .7s linear infinite; }

  @keyframes insToast {
    0%   { opacity:0; transform:translateY(16px); }
    15%  { opacity:1; transform:translateY(0); }
    80%  { opacity:1; }
    100% { opacity:0; transform:translateY(-8px); }
  }
  .ins-toast { animation:insToast 3.2s ease both; }

  .ins-pg {
    width:34px; height:34px; border-radius:9px; border:1px solid #E8EDFC;
    display:flex; align-items:center; justify-content:center; cursor:pointer;
    font-family:'Outfit',sans-serif; font-size:12px; font-weight:600;
    background:#fff; color:#3A4F8C; transition:all .14s;
  }
  .ins-pg:hover { background:#F4F7FF; border-color:#D0D9FF; }
  .ins-pg.active { background:#06102A; color:#fff; border-color:#06102A; }
  .ins-pg:disabled { opacity:.4; cursor:not-allowed; }

  .ins-label {
    display:block; font-family:'Outfit',sans-serif;
    font-size:12px; font-weight:700; color:#3A4F8C; margin-bottom:6px;
  }
  .ins-opt {
    font-size:10px; font-weight:500; color:#8497C8;
    background:#F4F7FF; border-radius:4px; padding:1px 5px; margin-left:4px;
  }
  .ins-err-msg { font-size:11px; color:#C81B1B; margin-top:4px; }

  .ins-detail-row { display:flex; align-items:flex-start; gap:10px; padding:10px 0; border-bottom:1px solid #E8EDFC; }
  .ins-detail-row:last-child { border-bottom:none; }
  .ins-detail-label { font-size:11px; font-weight:700; color:#8497C8; text-transform:uppercase; letter-spacing:.05em; min-width:140px; flex-shrink:0; padding-top:2px; }
  .ins-detail-val { font-size:13px; color:#06102A; font-weight:500; }

  @media(max-width:768px) {
    .ins-table-scroll { overflow-x:auto; }
    .ins-hide-sm { display:none !important; }
    .ins { padding:80px 14px 52px !important; }
  }
`;

/* ═══════════════════════════════════════════════════
   CONSTANTES
═══════════════════════════════════════════════════ */
const ANTENNES_LIST = [
  { v:"conakry",    l:"Conakry",     code:"CKY" },
  { v:"forecariah", l:"Forecariah",  code:"FRC" },
  { v:"boke",       l:"Boké",        code:"BOK" },
  { v:"kindia",     l:"Kindia",      code:"KND" },
  { v:"labe",       l:"Labé",        code:"LBE" },
  { v:"mamou",      l:"Mamou",       code:"MMU" },
  { v:"faranah",    l:"Faranah",     code:"FRN" },
  { v:"kankan",     l:"Kankan",      code:"KNK" },
  { v:"siguiri",    l:"Siguiri",     code:"SGR" },
  { v:"nzerekore",  l:"N'Zérékoré",  code:"NZR" },
];

const ANTENNE_CODE  = (v) => ANTENNES_LIST.find(a => a.v === v)?.code || "GN";
const ANTENNE_LABEL = (v) => ANTENNES_LIST.find(a => a.v === v)?.l   || v || "—";

const NIVEAUX = [
  { v:"CEP",          l:"CEP"           },
  { v:"BEPC",         l:"BEPC"          },
  { v:"BAC",          l:"BAC"           },
  { v:"BTS",          l:"BTS"           },
  { v:"Licence",      l:"Licence"       },
  { v:"Master",       l:"Master"        },
  { v:"Doctorat",     l:"Doctorat"      },
  { v:"sans_diplome", l:"Sans diplôme"  },
  { v:"autre",        l:"Autre"         },
];

// ✅ Clés alignées avec DOMAINE_CHOICES dans models.py
const DOMAINES = [
  { v:"informatique",     l:"Informatique & Numérique"   },
  { v:"electrotechnique", l:"Électrotechnique"           },
  { v:"btp",              l:"Bâtiment & Travaux Publics" },
  { v:"mecanique",        l:"Mécanique & Auto"           },
  { v:"agriculture",      l:"Agriculture & Élevage"      },
  { v:"commerce",         l:"Commerce & Gestion"         },
  { v:"sante",            l:"Santé & Social"             },
  { v:"couture",          l:"Couture & Textile"          },
  { v:"hotellerie",       l:"Hôtellerie & Restauration"  },
  { v:"artisanat",        l:"Artisanat"                  },
  { v:"energie",          l:"Énergie solaire"            },
  { v:"transport",        l:"Transport & Logistique"     },
  { v:"peche",            l:"Pêche & Aquaculture"        },
  { v:"autre",            l:"Autre"                      },
];

// ✅ Toutes les situations alignées avec SITUATION_CHOICES dans models.py
const SITUATIONS = [
  { v:"chomeur",      l:"Chômeur(se)"                    },
  { v:"actif",        l:"Actif(ve)"                      },
  { v:"diplome",      l:"Diplômé(e) sans emploi"         },
  { v:"etudiant",     l:"Étudiant(e)"                    },
  { v:"reconversion", l:"En reconversion professionnelle"},
  { v:"independant",  l:"Travailleur indépendant"        },
  { v:"autre",        l:"Autre"                          },
];

const STATUT_CFG = {
  en_attente: { label:"En attente", bg:"rgba(212,146,10,.12)", text:C.gold,   border:"rgba(212,146,10,.25)" },
  valide:     { label:"Validé",     bg:C.greenPale,            text:C.green,  border:"rgba(4,122,90,.2)"   },
  rejete:     { label:"Rejeté",     bg:C.dangerPale,           text:C.danger, border:"rgba(200,27,27,.2)"  },
};

const TYPE_CFG = {
  continue:      { label:"Formation Continue", bg:`${C.blue}10`,   text:C.blue,   border:`${C.blue}25`   },
  apprentissage: { label:"Apprentissage",       bg:`${C.purple}10`, text:C.purple, border:`${C.purple}25` },
};

const PAGE_SIZE = 10;

/* ═══════════════════════════════════════════════════
   FORM VIDE
═══════════════════════════════════════════════════ */
const EMPTY_FORM = {
  nom:"", prenom:"", sexe:"", date_naissance:"",
  telephone:"", email:"", adresse:"",
  situation:"", metier_actuel:"",
  niveau_etude:"", domaine:"", formation_ciblee:"",
  nom_formation:"", organisme_formation:"", nom_formateur:"",
  date_debut:"", date_fin:"",
  type_formation:"", entreprise_formation:"",
  antenne:"", conseiller:"",
  motivation:"", observation:"",
};

/* ═══════════════════════════════════════════════════
   AUTH
═══════════════════════════════════════════════════ */
const authHeader = () => {
  const t = localStorage.getItem("access") || localStorage.getItem("access_token") || localStorage.getItem("token");
  return { "Content-Type":"application/json", ...(t ? { Authorization:`Bearer ${t}` } : {}) };
};

/* ═══════════════════════════════════════════════════
   COMPOSANTS STABLES
═══════════════════════════════════════════════════ */
const StatutBadge = ({ statut }) => {
  const cfg = STATUT_CFG[statut] || STATUT_CFG.en_attente;
  return (
    <span className="ins-badge" style={{ background:cfg.bg, color:cfg.text, border:`1px solid ${cfg.border}` }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:cfg.text, flexShrink:0 }}/>
      {cfg.label}
    </span>
  );
};

const TypeBadge = ({ type }) => {
  const cfg = TYPE_CFG[type];
  if (!cfg) return null;
  return <span className="ins-badge" style={{ background:cfg.bg, color:cfg.text, border:`1px solid ${cfg.border}` }}>{cfg.label}</span>;
};

const Initials = ({ nom, prenom, size=36 }) => {
  const ini = `${nom?.[0]||""}${prenom?.[0]||""}`.toUpperCase() || "?";
  return (
    <div style={{ width:size, height:size, borderRadius:size/3, background:`linear-gradient(135deg,${C.navy},${C.blue})`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:`0 2px 8px rgba(22,53,200,.2)` }}>
      <span className="ins-serif" style={{ fontSize:size*.38, fontWeight:600, fontStyle:"italic", color:"#fff", lineHeight:1 }}>{ini}</span>
    </div>
  );
};

const Toast = ({ msg, type }) => (
  <div className="ins-toast" style={{
    position:"fixed", bottom:28, right:28, zIndex:2000,
    display:"flex", alignItems:"center", gap:10, padding:"12px 20px", borderRadius:13,
    background: type==="success" ? C.green : C.danger, color:"#fff",
    boxShadow:`0 12px 40px ${type==="success"?"rgba(4,122,90,.35)":"rgba(200,27,27,.35)"}`,
    fontFamily:"'Outfit',sans-serif", fontSize:13, fontWeight:600, minWidth:260,
  }}>
    {type==="success" ? <CheckCircle2 size={15}/> : <AlertTriangle size={15}/>}
    {msg}
  </div>
);

const SecHdr = ({ icon:Icon, label, color=C.blue }) => (
  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
    <div style={{ width:4, height:20, borderRadius:3, background:color, flexShrink:0 }}/>
    <Icon size={13} color={color}/>
    <p className="ins-serif" style={{ fontSize:13, fontWeight:600, color:C.textSub }}>{label}</p>
  </div>
);

const FInput = ({ label, required, optional, name, value, onChange, error, type="text", placeholder }) => (
  <div>
    <label className="ins-label">
      {label}
      {required && <span style={{ color:C.danger, marginLeft:2 }}>*</span>}
      {optional && <span className="ins-opt">optionnel</span>}
    </label>
    <input className={`ins-input${error?" ins-input-err":""}`} type={type} name={name} value={value}
      placeholder={placeholder||label} autoComplete="off" onChange={onChange}/>
    {error && <p className="ins-err-msg">{error}</p>}
  </div>
);

const FSelect = ({ label, required, optional, name, value, onChange, error, options, placeholder }) => (
  <div>
    <label className="ins-label">
      {label}
      {required && <span style={{ color:C.danger, marginLeft:2 }}>*</span>}
      {optional && <span className="ins-opt">optionnel</span>}
    </label>
    <select className={`ins-input${error?" ins-input-err":""}`} name={name} value={value} onChange={onChange}>
      <option value="">{placeholder||"Choisir…"}</option>
      {options.map(o => <option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
    </select>
    {error && <p className="ins-err-msg">{error}</p>}
  </div>
);

const FTextarea = ({ label, optional, name, value, onChange, placeholder, rows=3 }) => (
  <div>
    <label className="ins-label">
      {label}
      {optional && <span className="ins-opt">optionnel</span>}
    </label>
    <textarea className="ins-input" name={name} value={value} placeholder={placeholder||label} rows={rows} onChange={onChange}/>
  </div>
);

const ReadOnlyField = ({ label, value, badge, icon:Icon, color=C.textMuted }) => (
  <div>
    <label className="ins-label">{label}</label>
    <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 13px", borderRadius:10, background:C.surfaceEl, border:`1px solid ${C.divider}`, minHeight:42 }}>
      {Icon && <Icon size={13} color={color}/>}
      {badge ? <StatutBadge statut={value||"en_attente"}/> : <span style={{ fontSize:13, color:value?C.textPri:C.textMuted }}>{value||"—"}</span>}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════
   MODAL FORMULAIRE INSCRIPTION (Création / Édition)
═══════════════════════════════════════════════════ */
const CandidatForm = ({ candidat, onClose, onSaved }) => {
  const isEdit = Boolean(candidat?.id);

  const initForm = () => {
    if (!isEdit) return { ...EMPTY_FORM };
    const fd = candidat.formation_detail || {};
    return {
      nom:                  candidat.nom                  || "",
      prenom:               candidat.prenom               || "",
      sexe:                 candidat.sexe                 || "",
      date_naissance:       candidat.date_naissance       || "",
      telephone:            candidat.telephone            || "",
      email:                candidat.email                || "",
      adresse:              candidat.adresse              || "",
      situation:            candidat.situation            || "",
      metier_actuel:        candidat.metier_actuel        || "",
      niveau_etude:         candidat.niveau_etude         || "",
      domaine:              candidat.domaine              || "",
      formation_ciblee:     candidat.formation_ciblee     || "",
      nom_formation:        fd.nom_formation              || "",
      organisme_formation:  fd.organisme_formation        || "",
      nom_formateur:        fd.nom_formateur              || "",
      date_debut:           fd.date_debut                 || "",
      date_fin:             fd.date_fin                   || "",
      type_formation:       fd.type_formation             || "",
      entreprise_formation: fd.entreprise_formation       || "",
      antenne:              fd.antenne || candidat.antenne || "",
      conseiller:           candidat.conseiller           || "",
      motivation:           candidat.motivation           || "",
      observation:          candidat.observation          || "",
    };
  };

  const [form,    setForm]    = useState(initForm);
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  }, []);

  const validate = () => {
    const e = {};
    if (!form.nom?.trim())    e.nom    = "Le nom est requis";
    if (!form.prenom?.trim()) e.prenom = "Le prénom est requis";
    if (!form.sexe)           e.sexe   = "Le sexe est requis";
    if (!form.antenne)        e.antenne = "L'antenne est requise";
    if (form.type_formation === "continue" && !form.entreprise_formation?.trim())
      e.entreprise_formation = "Obligatoire pour une formation continue";
    if (form.date_debut && form.date_fin && form.date_fin < form.date_debut)
      e.date_fin = "La date de fin doit être après le début";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      const payload = {
        // Identité
        nom:              form.nom.trim(),
        prenom:           form.prenom.trim(),
        sexe:             form.sexe             || null,
        date_naissance:   form.date_naissance   || null,
        telephone:        form.telephone?.trim()   || null,
        email:            form.email?.trim()       || null,
        adresse:          form.adresse?.trim()     || null,
        // Situation
        situation:        form.situation        || null,
        metier_actuel:    form.metier_actuel?.trim() || null,
        // Profil académique
        niveau_etude:     form.niveau_etude     || null,
        domaine:          form.domaine          || null,   // ✅ Clé courte ex: "informatique"
        formation_ciblee: form.formation_ciblee?.trim() || null,
        // Antenne (CharField sur Candidat)
        antenne:          form.antenne          || null,
        // Conseiller
        conseiller:       form.conseiller?.trim() || null,
        // Compléments
        motivation:       form.motivation?.trim()  || null,
        observation:      form.observation?.trim() || null,
        // Formation ONFPP imbriquée (optionnel)
        formation_data: form.nom_formation?.trim() ? {
          nom_formation:        form.nom_formation.trim(),
          organisme_formation:  form.organisme_formation?.trim() || null,
          nom_formateur:        form.nom_formateur?.trim()       || null,
          date_debut:           form.date_debut  || null,
          date_fin:             form.date_fin    || null,
          type_formation:       form.type_formation || null,
          entreprise_formation: form.type_formation === "continue"
            ? (form.entreprise_formation?.trim() || null)
            : null,
          antenne: form.antenne || null,
        } : null,
      };

      const url    = isEdit
        ? `${CONFIG.BASE_URL}${CONFIG.API_CANDIDATS}${candidat.id}/`
        : `${CONFIG.BASE_URL}${CONFIG.API_CANDIDATS}`;
      const method = isEdit ? axios.put : axios.post;
      const res    = await method(url, payload, { headers: authHeader() });
      onSaved(res.data, isEdit ? "edit" : "create");
    } catch (err) {
      const detail = err.response?.data;
      if (detail && typeof detail === "object") {
        const mapped = {};
        Object.entries(detail).forEach(([k, v]) => {
          mapped[k] = Array.isArray(v) ? v[0] : String(v);
        });
        setErrors(mapped);
      } else {
        setErrors({ non_field_errors: "Une erreur est survenue. Veuillez réessayer." });
      }
    } finally { setLoading(false); }
  };

  const isContinue = form.type_formation === "continue";

  return (
    <div style={{ position:"fixed", inset:0, zIndex:800, display:"flex", alignItems:"center", justifyContent:"center", padding:"72px 16px 16px" }}>
      <div style={{ position:"absolute", inset:0, background:"rgba(6,16,42,.6)", backdropFilter:"blur(14px)" }} onClick={onClose}/>

      <div className="ins-modal" style={{
        position:"relative", width:"100%", maxWidth:780,
        maxHeight:"calc(100vh - 88px)", overflowY:"auto",
        background:C.surface, borderRadius:22, boxShadow:`0 32px 80px ${C.shadowMd}`,
      }}>
        {/* Tricolore */}
        <div style={{ height:4, display:"flex", borderRadius:"22px 22px 0 0", overflow:"hidden" }}>
          <div style={{ flex:1, background:"#E02020" }}/><div style={{ flex:1, background:C.gold }}/><div style={{ flex:1, background:C.green }}/>
        </div>

        {/* Header */}
        <div style={{ padding:"20px 28px 0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:44, height:44, borderRadius:13, background:isEdit?`${C.gold}18`:`${C.blue}12`, border:`1.5px solid ${isEdit?`${C.gold}35`:`${C.blue}22`}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              {isEdit ? <Pencil size={18} color={C.gold}/> : <UserPlus size={18} color={C.blue}/>}
            </div>
            <div>
              <h2 className="ins-serif" style={{ fontSize:19, fontWeight:700, color:C.textPri, letterSpacing:"-.3px" }}>
                {isEdit ? "Modifier le dossier" : "Nouveau dossier d'inscription"}
              </h2>
              <p style={{ fontSize:11.5, color:C.textMuted, marginTop:2 }}>
                {isEdit
                  ? `Modification de ${candidat.nom} ${candidat.prenom}`
                  : "Remplissez les informations du candidat et de sa formation"}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ width:34, height:34, borderRadius:9, background:C.surfaceEl, border:`1px solid ${C.divider}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <X size={14} color={C.textMuted}/>
          </button>
        </div>

        <div style={{ padding:"20px 28px 28px", display:"flex", flexDirection:"column", gap:18 }}>

          {/* Erreur globale */}
          {errors.non_field_errors && (
            <div style={{ background:C.dangerPale, border:`1px solid ${C.danger}30`, borderRadius:10, padding:"10px 14px", display:"flex", alignItems:"center", gap:8 }}>
              <AlertTriangle size={14} color={C.danger}/>
              <span style={{ fontSize:13, color:C.danger }}>{errors.non_field_errors}</span>
            </div>
          )}

          {/* ── 1. IDENTITÉ ── */}
          <div style={{ background:C.surfaceEl, borderRadius:14, padding:"18px 20px", border:`1px solid ${C.divider}` }}>
            <SecHdr icon={User} label="Identité personnelle" color={C.blue}/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <FInput label="Nom" name="nom" required value={form.nom} onChange={handleChange} error={errors.nom} placeholder="Ex: Diallo"/>
              <FInput label="Prénom" name="prenom" required value={form.prenom} onChange={handleChange} error={errors.prenom} placeholder="Ex: Mamadou"/>
              <FSelect label="Sexe" name="sexe" required value={form.sexe} onChange={handleChange} error={errors.sexe}
                options={[{v:"H",l:"Homme"},{v:"F",l:"Femme"}]}/>
              <FInput label="Date de naissance" name="date_naissance" type="date" value={form.date_naissance} onChange={handleChange} optional/>
            </div>
          </div>

          {/* ── 2. COORDONNÉES ── */}
          <div style={{ background:C.surfaceEl, borderRadius:14, padding:"18px 20px", border:`1px solid ${C.divider}` }}>
            <SecHdr icon={Phone} label="Coordonnées" color={C.green}/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
              <FInput label="Téléphone" name="telephone" type="tel" value={form.telephone} onChange={handleChange} optional placeholder="Ex: 620 00 00 00"/>
              <FInput label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} optional placeholder="Ex: mamadou@email.com"/>
            </div>
            <FTextarea label="Adresse complète" name="adresse" value={form.adresse} onChange={handleChange} optional placeholder="Quartier, Commune, Préfecture…"/>
          </div>

          {/* ── 3. SITUATION PROFESSIONNELLE ── */}
          <div style={{ background:C.surfaceEl, borderRadius:14, padding:"18px 20px", border:`1px solid ${C.divider}` }}>
            <SecHdr icon={Briefcase} label="Situation professionnelle" color={C.teal}/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <FSelect label="Situation actuelle" name="situation" value={form.situation} onChange={handleChange} optional options={SITUATIONS}/>
              <FInput label="Métier actuel" name="metier_actuel" value={form.metier_actuel} onChange={handleChange} optional placeholder="Ex: Maçon, Couturier…"/>
            </div>
          </div>

          {/* ── 4. PROFIL ACADÉMIQUE ── */}
          <div style={{ background:C.surfaceEl, borderRadius:14, padding:"18px 20px", border:`1px solid ${C.divider}` }}>
            <SecHdr icon={BookOpen} label="Profil académique & formation ciblée" color={C.gold}/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <FSelect label="Niveau d'étude" name="niveau_etude" value={form.niveau_etude} onChange={handleChange} optional options={NIVEAUX} placeholder="Sélectionner un niveau"/>
              <FSelect label="Domaine" name="domaine" value={form.domaine} onChange={handleChange} optional options={DOMAINES}/>
              <div style={{ gridColumn:"1/-1" }}>
                <FInput label="Formation ciblée" name="formation_ciblee" value={form.formation_ciblee} onChange={handleChange} optional placeholder="Ex: Développeur web, Technicien solaire…"/>
              </div>
            </div>
          </div>

          {/* ── 5. SESSION DE FORMATION ONFPP ── */}
          <div style={{ background:`${C.purple}06`, borderRadius:14, padding:"18px 20px", border:`1px solid ${C.purple}20` }}>
            <SecHdr icon={GraduationCap} label="Session de formation ONFPP" color={C.purple}/>
            <p style={{ fontSize:11, color:C.textMuted, marginBottom:14, fontStyle:"italic" }}>
              ⓘ Remplissez cette section pour rattacher le candidat à une session de formation.
            </p>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
              <div style={{ gridColumn:"1/-1" }}>
                <FInput label="Titre de la formation" name="nom_formation" value={form.nom_formation} onChange={handleChange} optional placeholder="Ex: Développement Web, Électrotechnique…"/>
              </div>
              <FInput label="Organisme de formation" name="organisme_formation" value={form.organisme_formation} onChange={handleChange} optional placeholder="Ex: Simplon Guinée, ONFPP…"/>
              <FInput label="Nom du formateur" name="nom_formateur" value={form.nom_formateur} onChange={handleChange} optional placeholder="Ex: Mamadou Diallo"/>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
              <FInput label="Date de début" name="date_debut" type="date" value={form.date_debut} onChange={handleChange} error={errors.date_debut} optional/>
              <FInput label="Date de fin"   name="date_fin"   type="date" value={form.date_fin}   onChange={handleChange} error={errors.date_fin}   optional/>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom: isContinue ? 14 : 0 }}>
              <FSelect label="Type de formation" name="type_formation" value={form.type_formation} onChange={handleChange} error={errors.type_formation} optional
                options={[{v:"continue",l:"Formation Continue"},{v:"apprentissage",l:"Apprentissage"}]}/>
              <FSelect label="Antenne ONFPP" name="antenne" required value={form.antenne} onChange={handleChange} error={errors.antenne}
                options={ANTENNES_LIST}/>
            </div>

            {isContinue && (
              <div>
                <FInput label="Entreprise de formation" name="entreprise_formation" required value={form.entreprise_formation}
                  onChange={handleChange} error={errors.entreprise_formation} placeholder="Ex: Orange Guinée, SOTELGUI…"/>
                <p style={{ fontSize:11, color:C.textMuted, marginTop:5, fontStyle:"italic" }}>
                  ⓘ Obligatoire pour les formations continues.
                </p>
              </div>
            )}
          </div>

          {/* ── 6. CONSEILLER & IDENTIFIANT ── */}
          <div style={{ background:C.surfaceEl, borderRadius:14, padding:"18px 20px", border:`1px solid ${C.divider}` }}>
            <SecHdr icon={Star} label="Suivi & Identification" color={C.teal}/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <FInput label="Conseiller responsable" name="conseiller" value={form.conseiller} onChange={handleChange} optional placeholder="Ex: Aissatou Bah"/>
              {isEdit && candidat.identifiant_unique ? (
                <ReadOnlyField label="Identifiant unique" value={candidat.identifiant_unique} icon={Hash} color={C.blue}/>
              ) : (
                <div>
                  <label className="ins-label">Identifiant unique</label>
                  <div style={{ padding:"10px 13px", borderRadius:10, background:`${C.blue}06`, border:`1.5px dashed ${C.blue}30`, minHeight:42, display:"flex", alignItems:"center", gap:6 }}>
                    <Hash size={13} color={C.blue}/>
                    <span style={{ fontSize:12, color:C.textMuted, fontStyle:"italic" }}>
                      Généré après validation — ex : ONFPP-{new Date().getFullYear()}-{ANTENNE_CODE(form.antenne)||"ANT"}-0001
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── 7. MOTIVATION & OBSERVATION ── */}
          <div style={{ background:C.surfaceEl, borderRadius:14, padding:"18px 20px", border:`1px solid ${C.divider}` }}>
            <SecHdr icon={MessageSquare} label="Motivation & Observation" color={C.textMuted}/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <FTextarea label="Motivation" name="motivation" value={form.motivation} onChange={handleChange} optional placeholder="Pourquoi le candidat souhaite suivre cette formation…" rows={4}/>
              <FTextarea label="Observation" name="observation" value={form.observation} onChange={handleChange} optional placeholder="Remarques du conseiller ou de l'agent d'inscription…" rows={4}/>
            </div>
          </div>

          {/* Infos fiche en édition */}
          {isEdit && (
            <div style={{ background:`${C.navy}03`, borderRadius:14, padding:"18px 20px", border:`1px solid ${C.divider}` }}>
              <SecHdr icon={CheckCircle2} label="Informations de la fiche" color={C.textMuted}/>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
                <ReadOnlyField label="Statut" value={candidat.statut_fiche} badge/>
                <ReadOnlyField label="Identifiant" value={candidat.identifiant_unique} icon={Hash} color={C.blue}/>
                <ReadOnlyField label="Créé le" icon={Calendar} color={C.textMuted}
                  value={candidat.created_at ? new Date(candidat.created_at).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}) : null}/>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display:"flex", justifyContent:"flex-end", gap:10, paddingTop:6, borderTop:`1px solid ${C.divider}` }}>
            <button className="ins-btn-sec" onClick={onClose}><X size={13}/> Annuler</button>
            <button className="ins-btn-pri" onClick={handleSubmit} disabled={loading}>
              {loading ? <Loader2 size={14} className="ins-spin"/> : isEdit ? <Check size={14}/> : <UserPlus size={14}/>}
              {loading ? "Enregistrement…" : isEdit ? "Enregistrer les modifications" : "Inscrire le candidat"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   MODAL SUPPRESSION
═══════════════════════════════════════════════════ */
const DeleteModal = ({ label, onClose, onConfirm, loading }) => (
  <div style={{ position:"fixed", inset:0, zIndex:900, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
    <div style={{ position:"absolute", inset:0, background:"rgba(6,16,42,.6)", backdropFilter:"blur(14px)" }} onClick={onClose}/>
    <div className="ins-modal" style={{ position:"relative", width:"100%", maxWidth:420, background:C.surface, borderRadius:22, boxShadow:`0 32px 80px ${C.shadowMd}`, overflow:"hidden" }}>
      <div style={{ height:3, background:C.danger }}/>
      <div style={{ padding:"28px 28px 24px", textAlign:"center" }}>
        <div style={{ width:52, height:52, borderRadius:15, background:`${C.danger}12`, border:`1.5px solid ${C.danger}25`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
          <Trash2 size={22} color={C.danger}/>
        </div>
        <h3 className="ins-serif" style={{ fontSize:18, fontWeight:700, color:C.textPri, marginBottom:8 }}>Supprimer ce dossier ?</h3>
        <p style={{ fontSize:13, color:C.textSub, marginBottom:6 }}>Suppression définitive de</p>
        <p style={{ fontSize:15, fontWeight:700, color:C.textPri, marginBottom:16 }}>{label}</p>
        <p style={{ fontSize:11.5, color:C.textMuted, background:C.dangerPale, borderRadius:9, padding:"8px 14px", marginBottom:22 }}>
          ⚠️ Cette action est irréversible.
        </p>
        <div style={{ display:"flex", gap:10 }}>
          <button className="ins-btn-sec" onClick={onClose} style={{ flex:1 }}><X size={13}/> Annuler</button>
          <button className="ins-btn-danger" onClick={onConfirm} disabled={loading} style={{ flex:1, justifyContent:"center" }}>
            {loading ? <Loader2 size={13} className="ins-spin"/> : <Trash2 size={13}/>}
            {loading ? "Suppression…" : "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════
   MODAL DÉTAILS CANDIDAT
═══════════════════════════════════════════════════ */
const DetailsModal = ({ candidat, onClose, onEdit, onValider, onRejeter, loadingAction }) => {
  const DR = ({ icon:Icon, label, value, color=C.textMuted, badge, typeBadge }) => (
    <div className="ins-detail-row">
      <div style={{ display:"flex", alignItems:"center", gap:6, minWidth:140, flexShrink:0 }}>
        {Icon && <Icon size={12} color={color}/>}
        <span className="ins-detail-label" style={{ minWidth:"unset" }}>{label}</span>
      </div>
      <div className="ins-detail-val">
        {badge      ? <StatutBadge statut={value||"en_attente"}/> :
         typeBadge  ? <TypeBadge   type={value}/> :
         (value || <span style={{ color:C.textMuted }}>—</span>)}
      </div>
    </div>
  );

  const fd         = candidat.formation_detail;
  const isEnAttente = candidat.statut_fiche === "en_attente";
  const isValide    = candidat.statut_fiche === "valide";
  const sitLabel    = SITUATIONS.find(s => s.v === candidat.situation)?.l || candidat.situation;
  const domaineLabel = DOMAINES.find(d => d.v === candidat.domaine)?.l   || candidat.domaine;

  return (
    <div style={{ position:"fixed", inset:0, zIndex:850, display:"flex", alignItems:"center", justifyContent:"center", padding:"72px 16px 16px" }}>
      <div style={{ position:"absolute", inset:0, background:"rgba(6,16,42,.55)", backdropFilter:"blur(14px)" }} onClick={onClose}/>
      <div className="ins-modal" style={{
        position:"relative", width:"100%", maxWidth:640,
        maxHeight:"calc(100vh - 88px)", overflowY:"auto",
        background:C.surface, borderRadius:22, boxShadow:`0 32px 80px ${C.shadowMd}`,
      }}>
        <div style={{ height:4, display:"flex", borderRadius:"22px 22px 0 0", overflow:"hidden" }}>
          <div style={{ flex:1, background:"#E02020" }}/><div style={{ flex:1, background:C.gold }}/><div style={{ flex:1, background:C.green }}/>
        </div>

        {/* Header */}
        <div style={{ padding:"22px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:`1px solid ${C.divider}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:13 }}>
            <Initials nom={candidat.nom} prenom={candidat.prenom} size={46}/>
            <div>
              <h2 className="ins-serif" style={{ fontSize:20, fontWeight:700, color:C.textPri, letterSpacing:"-.3px" }}>
                {candidat.nom} {candidat.prenom}
              </h2>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:5, flexWrap:"wrap" }}>
                <StatutBadge statut={candidat.statut_fiche}/>
                {candidat.identifiant_unique && (
                  <span style={{ fontSize:11, color:C.blue, background:`${C.blue}10`, padding:"2px 9px", borderRadius:6, border:`1px solid ${C.blue}25`, fontWeight:800, fontFamily:"monospace" }}>
                    {candidat.identifiant_unique}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ width:34, height:34, borderRadius:9, background:C.surfaceEl, border:`1px solid ${C.divider}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <X size={14} color={C.textMuted}/>
          </button>
        </div>

        <div style={{ padding:"20px 28px", display:"flex", flexDirection:"column", gap:18 }}>

          {/* Identité */}
          <div style={{ background:C.surfaceEl, borderRadius:14, padding:"16px 18px", border:`1px solid ${C.divider}` }}>
            <SecHdr icon={User} label="Identité" color={C.blue}/>
            <DR icon={User}     label="Nom complet"  value={`${candidat.nom} ${candidat.prenom}`} color={C.blue}/>
            <DR icon={User}     label="Sexe"          value={candidat.sexe==="H"?"Homme":candidat.sexe==="F"?"Femme":null}/>
            <DR icon={Calendar} label="Naissance"     value={candidat.date_naissance ? new Date(candidat.date_naissance).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"}) : null}/>
            <DR icon={Phone}    label="Téléphone"     value={candidat.telephone} color={C.green}/>
            <DR icon={Mail}     label="Email"         value={candidat.email}/>
            <DR icon={MapPin}   label="Adresse"       value={candidat.adresse}/>
          </div>

          {/* Antenne */}
          <div style={{ background:C.surfaceEl, borderRadius:14, padding:"16px 18px", border:`1px solid ${C.divider}` }}>
            <SecHdr icon={MapPinned} label="Antenne ONFPP" color={C.teal}/>
            <DR icon={MapPinned} label="Antenne" value={candidat.antenne_label || ANTENNE_LABEL(candidat.antenne)}/>
          </div>

          {/* Situation */}
          {(candidat.situation || candidat.metier_actuel) && (
            <div style={{ background:C.tealPale, borderRadius:14, padding:"16px 18px", border:`1px solid ${C.teal}20` }}>
              <SecHdr icon={Briefcase} label="Situation professionnelle" color={C.teal}/>
              <DR icon={Briefcase} label="Situation"     value={sitLabel}/>
              <DR icon={Briefcase} label="Métier actuel" value={candidat.metier_actuel}/>
            </div>
          )}

          {/* Profil académique */}
          <div style={{ background:C.surfaceEl, borderRadius:14, padding:"16px 18px", border:`1px solid ${C.divider}` }}>
            <SecHdr icon={BookOpen} label="Profil académique" color={C.gold}/>
            <DR icon={BookOpen} label="Niveau d'étude"  value={candidat.niveau_etude}/>
            <DR icon={Target}   label="Domaine"          value={domaineLabel}/>
            <DR icon={Target}   label="Formation ciblée" value={candidat.formation_ciblee}/>
          </div>

          {/* Formation ONFPP */}
          {fd && (
            <div style={{ background:`${C.purple}06`, borderRadius:14, padding:"16px 18px", border:`1px solid ${C.purple}20` }}>
              <SecHdr icon={GraduationCap} label="Session de formation ONFPP" color={C.purple}/>
              <DR icon={GraduationCap} label="Formation"   value={fd.nom_formation}    color={C.purple}/>
              <DR icon={Building2}     label="Organisme"   value={fd.organisme_formation}/>
              <DR icon={User}          label="Formateur"   value={fd.nom_formateur}/>
              <DR icon={Calendar}      label="Du"          value={fd.date_debut ? new Date(fd.date_debut).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"}) : null}/>
              <DR icon={Calendar}      label="Au"          value={fd.date_fin   ? new Date(fd.date_fin).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"})   : null}/>
              <DR icon={ClipboardList} label="Type"        value={fd.type_formation} typeBadge/>
              {fd.entreprise_formation && <DR icon={Building2} label="Entreprise" value={fd.entreprise_formation}/>}
              <DR icon={MapPinned} label="Antenne" value={fd.antenne_display || ANTENNE_LABEL(fd.antenne)}/>
            </div>
          )}

          {/* Conseiller */}
          {candidat.conseiller && (
            <div style={{ background:C.surfaceEl, borderRadius:14, padding:"16px 18px", border:`1px solid ${C.divider}` }}>
              <SecHdr icon={Star} label="Suivi" color={C.teal}/>
              <DR icon={Star} label="Conseiller" value={candidat.conseiller}/>
            </div>
          )}

          {/* Motivation / Observation */}
          {(candidat.motivation || candidat.observation) && (
            <div style={{ background:C.surfaceEl, borderRadius:14, padding:"16px 18px", border:`1px solid ${C.divider}` }}>
              <SecHdr icon={MessageSquare} label="Motivation & Observation" color={C.textMuted}/>
              {candidat.motivation  && <DR icon={MessageSquare} label="Motivation"  value={candidat.motivation}/>}
              {candidat.observation && <DR icon={FileText}      label="Observation" value={candidat.observation}/>}
            </div>
          )}

          {/* Workflow validation */}
          {(isEnAttente || isValide) && (
            <div style={{ background:isEnAttente?C.goldPale:`${C.green}08`, borderRadius:14, padding:"16px 18px", border:`1.5px solid ${isEnAttente?`${C.gold}30`:`${C.green}30`}` }}>
              <p style={{ fontSize:12, fontWeight:700, color:isEnAttente?C.gold:C.green, marginBottom:12 }}>
                {isEnAttente ? "⏳ Dossier en attente de décision" : "✅ Dossier validé — possibilité de rejeter"}
              </p>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                {isEnAttente && (
                  <button className="ins-btn-success" onClick={onValider} disabled={loadingAction}>
                    {loadingAction==="valider" ? <Loader2 size={13} className="ins-spin"/> : <ShieldCheck size={14}/>}
                    Valider le dossier
                  </button>
                )}
                <button className="ins-btn-danger" onClick={onRejeter} disabled={loadingAction}>
                  {loadingAction==="rejeter" ? <Loader2 size={13} className="ins-spin"/> : <ShieldX size={14}/>}
                  {candidat.statut_fiche==="rejete" ? "Déjà rejeté" : "Rejeter le dossier"}
                </button>
              </div>
            </div>
          )}
          {candidat.statut_fiche === "rejete" && (
            <div style={{ background:C.dangerPale, borderRadius:14, padding:"14px 18px", border:`1.5px solid ${C.danger}25` }}>
              <p style={{ fontSize:12, fontWeight:700, color:C.danger }}>❌ Dossier rejeté</p>
            </div>
          )}
        </div>

        <div style={{ padding:"14px 28px 22px", display:"flex", justifyContent:"flex-end", gap:10, borderTop:`1px solid ${C.divider}` }}>
          <button className="ins-btn-sec" onClick={onClose}><X size={13}/> Fermer</button>
          <button className="ins-btn-pri" onClick={onEdit}><Pencil size={13}/> Modifier</button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   COMPOSANT PRINCIPAL — INSCRIPTION
═══════════════════════════════════════════════════ */
const Inscription = () => {
  const [candidats,     setCandidats]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [filter,        setFilter]        = useState("tous");
  const [page,          setPage]          = useState(1);
  const [showForm,      setShowForm]      = useState(false);
  const [editTarget,    setEditTarget]    = useState(null);
  const [delTarget,     setDelTarget]     = useState(null);
  const [detailTarget,  setDetailTarget]  = useState(null);
  const [delLoading,    setDelLoading]    = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast,         setToast]         = useState(null);

  const showToast = useCallback((msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3300);
  }, []);

  const fetchCandidats = async () => {
    const token = localStorage.getItem("access") || localStorage.getItem("access_token") || localStorage.getItem("token");
    if (!token) { showToast("Session expirée", "error"); setTimeout(() => { window.location.href = "/login"; }, 1800); return; }
    setLoading(true);
    try {
      const res  = await axios.get(`${CONFIG.BASE_URL}${CONFIG.API_CANDIDATS}`, { headers: authHeader() });
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setCandidats(data);
    } catch (err) {
      if ([401,403].includes(err.response?.status)) {
        showToast("Session expirée", "error");
        setTimeout(() => { window.location.href = "/login"; }, 1800);
      } else {
        showToast("Impossible de charger les candidats", "error");
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCandidats(); }, []);

  const handleSaved = (data, mode) => {
    if (mode === "create") {
      setCandidats(p => [data, ...p]);
      showToast(`${data.prenom} ${data.nom} inscrit(e) avec succès !`);
    } else {
      setCandidats(p => p.map(c => c.id === data.id ? data : c));
      if (detailTarget?.id === data.id) setDetailTarget(data);
      showToast("Fiche mise à jour");
    }
    setShowForm(false); setEditTarget(null);
  };

  const handleDelete = async () => {
    if (!delTarget) return;
    setDelLoading(true);
    try {
      await axios.delete(`${CONFIG.BASE_URL}${CONFIG.API_CANDIDATS}${delTarget.id}/`, { headers: authHeader() });
      setCandidats(p => p.filter(c => c.id !== delTarget.id));
      showToast(`Dossier de ${delTarget.prenom} ${delTarget.nom} supprimé`);
      setDelTarget(null);
    } catch { showToast("Erreur lors de la suppression", "error"); }
    finally { setDelLoading(false); }
  };

  const handleAction = async (action, candidat) => {
    setActionLoading(action);
    try {
      const res = await axios.patch(
        `${CONFIG.BASE_URL}${CONFIG.API_CANDIDATS}${candidat.id}/${action}/`,
        {}, { headers: authHeader() }
      );
      const updated = res.data;
      setCandidats(p => p.map(c => c.id === updated.id ? updated : c));
      if (detailTarget?.id === updated.id) setDetailTarget(updated);
      showToast(action === "valider"
        ? `Dossier validé ✅ — ID: ${updated.identifiant_unique}`
        : "Dossier rejeté");
    } catch (err) {
      showToast(err.response?.data?.detail || "Erreur", "error");
    } finally { setActionLoading(null); }
  };

  /* Filtrage & pagination */
  const filtered = candidats.filter(c => {
    const q = search.toLowerCase();
    const matchS = !q || [
      c.nom, c.prenom, c.email, c.telephone,
      c.identifiant_unique, c.formation_detail?.nom_formation,
      c.domaine, c.conseiller, c.formation_ciblee,
    ].some(v => v?.toLowerCase().includes(q));
    const matchF = filter === "tous" || c.statut_fiche === filter;
    return matchS && matchF;
  });

  const pages     = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  const stats = {
    total:      candidats.length,
    en_attente: candidats.filter(c => c.statut_fiche === "en_attente").length,
    valide:     candidats.filter(c => c.statut_fiche === "valide").length,
    rejete:     candidats.filter(c => c.statut_fiche === "rejete").length,
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="ins ins-page" style={{ minHeight:"100vh", background:`radial-gradient(ellipse 100% 50% at 60% -10%,rgba(22,53,200,.06) 0%,transparent 60%),${C.page}`, padding:"88px 28px 64px", position:"relative" }}>
        <div style={{ position:"relative", zIndex:1, maxWidth:1200, margin:"0 auto" }}>

          {/* En-tête */}
          <div className="ins-in ins-d0" style={{ marginBottom:26 }}>
            <div style={{ display:"flex", gap:0, height:3, borderRadius:3, marginBottom:14, overflow:"hidden", width:80 }}>
              <div style={{ flex:1, background:"#E02020" }}/><div style={{ flex:1, background:C.gold }}/><div style={{ flex:1, background:C.green }}/>
            </div>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:14 }}>
              <div>
                <h1 className="ins-serif" style={{ fontSize:30, fontWeight:700, color:C.textPri, letterSpacing:"-.6px", lineHeight:1.1 }}>Gestion des inscriptions</h1>
                <p style={{ fontSize:13, color:C.textMuted, marginTop:6 }}>Dossiers candidats et suivi — ONFPP Guinée</p>
              </div>
              <div style={{ display:"flex", gap:9 }}>
                <button className="ins-btn-sec" onClick={fetchCandidats}><RefreshCw size={13}/></button>
                <button className="ins-btn-pri" onClick={() => { setEditTarget(null); setShowForm(true); }}><UserPlus size={14}/> Nouveau dossier</button>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="ins-in ins-d1" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))", gap:12, marginBottom:24 }}>
            {[
              { label:"Total dossiers", value:stats.total,      color:C.blue,   bg:`${C.blue}10`,  icon:Users         },
              { label:"En attente",     value:stats.en_attente, color:C.gold,   bg:`${C.gold}12`,  icon:Calendar      },
              { label:"Validés",        value:stats.valide,     color:C.green,  bg:C.greenPale,    icon:CheckCircle2  },
              { label:"Rejetés",        value:stats.rejete,     color:C.danger, bg:C.dangerPale,   icon:AlertTriangle },
            ].map((s,i) => {
              const SI = s.icon;
              return (
                <div key={i} style={{ background:C.surface, borderRadius:16, padding:"16px 14px", border:`1px solid ${C.divider}`, boxShadow:`0 2px 14px ${C.shadow}`, position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:2.5, background:s.color, borderRadius:"16px 16px 0 0" }}/>
                  <div style={{ width:36, height:36, borderRadius:10, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:10 }}>
                    <SI size={16} color={s.color}/>
                  </div>
                  <p className="ins-serif" style={{ fontSize:26, fontWeight:700, color:C.textPri, lineHeight:1, letterSpacing:"-1px" }}>{s.value}</p>
                  <p style={{ fontSize:11.5, color:C.textMuted, marginTop:5 }}>{s.label}</p>
                </div>
              );
            })}
          </div>

          {/* Filtres */}
          <div className="ins-in ins-d2" style={{ background:C.surface, border:`1px solid ${C.divider}`, borderRadius:16, padding:"13px 18px", marginBottom:18, display:"flex", alignItems:"center", gap:12, flexWrap:"wrap", boxShadow:`0 2px 12px ${C.shadow}` }}>
            <div style={{ position:"relative", flex:"1 1 260px", minWidth:0 }}>
              <Search size={14} color={C.textMuted} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
              <input className="ins-input" placeholder="Rechercher par nom, identifiant, formation…" value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ paddingLeft:38 }}/>
            </div>
            <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
              {[{v:"tous",l:"Tous",c:C.textSub},{v:"en_attente",l:"En attente",c:C.gold},{v:"valide",l:"Validés",c:C.green},{v:"rejete",l:"Rejetés",c:C.danger}].map(f => (
                <button key={f.v} onClick={() => { setFilter(f.v); setPage(1); }} style={{
                  padding:"6px 14px", borderRadius:20, cursor:"pointer",
                  fontSize:12, fontWeight:700, fontFamily:"'Outfit',sans-serif",
                  border: filter===f.v ? `1.5px solid ${f.c}` : `1px solid ${C.divider}`,
                  background: filter===f.v ? `${f.c}12` : C.surfaceEl,
                  color: filter===f.v ? f.c : C.textMuted, transition:"all .14s",
                }}>{f.l}</button>
              ))}
            </div>
            <p style={{ fontSize:12, color:C.textMuted, flexShrink:0 }}>
              <span style={{ fontWeight:700, color:C.textSub }}>{filtered.length}</span> résultat{filtered.length>1?"s":""}
            </p>
          </div>

          {/* Tableau */}
          <div className="ins-in ins-d2" style={{ background:C.surface, border:`1px solid ${C.divider}`, borderRadius:18, boxShadow:`0 2px 16px ${C.shadow}`, overflow:"hidden" }}>
            {loading ? (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"60px 0", gap:14 }}>
                <Loader2 size={28} color={C.blue} className="ins-spin"/>
                <p style={{ fontSize:13, color:C.textMuted }}>Chargement des dossiers…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"64px 0", gap:12 }}>
                <div style={{ width:52, height:52, borderRadius:14, background:C.surfaceEl, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Users size={22} color={C.textMuted}/>
                </div>
                <p className="ins-serif" style={{ fontSize:15, fontWeight:600, color:C.textSub }}>Aucun dossier trouvé</p>
                <p style={{ fontSize:12.5, color:C.textMuted }}>{search?"Modifiez votre recherche":"Commencez par créer un dossier"}</p>
                {!search && <button className="ins-btn-pri" onClick={() => setShowForm(true)} style={{ marginTop:6 }}><UserPlus size={13}/> Nouveau dossier</button>}
              </div>
            ) : (
              <>
                <div className="ins-table-scroll">
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead>
                      <tr style={{ background:`${C.navy}04`, borderBottom:`1.5px solid ${C.divider}` }}>
                        {["Candidat","Contact","Formation / Domaine","Statut","Actions"].map((h,i) => (
                          <th key={i} className={i>=2&&i<=3?"ins-hide-sm":""} style={{ padding:"12px 16px", textAlign:"left", fontSize:10.5, fontWeight:800, color:C.textMuted, letterSpacing:".1em", textTransform:"uppercase" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map(c => (
                        <tr key={c.id} className="ins-tr" style={{ borderBottom:`1px solid ${C.divider}` }}>
                          {/* Candidat */}
                          <td style={{ padding:"13px 16px" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:11 }}>
                              <Initials nom={c.nom} prenom={c.prenom}/>
                              <div>
                                <p style={{ fontSize:13.5, fontWeight:700, color:C.textPri, lineHeight:1.2 }}>{c.nom} {c.prenom}</p>
                                <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:2, flexWrap:"wrap" }}>
                                  <span style={{ fontSize:11, color:C.textMuted }}>{c.sexe==="H"?"Homme":c.sexe==="F"?"Femme":"—"}</span>
                                  {c.antenne && (
                                    <span style={{ fontSize:10, color:C.teal, background:`${C.teal}10`, padding:"1px 6px", borderRadius:4, fontWeight:700 }}>
                                      {ANTENNE_LABEL(c.antenne)}
                                    </span>
                                  )}
                                  {c.identifiant_unique && (
                                    <span style={{ fontSize:10, color:C.blue, background:`${C.blue}10`, padding:"1px 6px", borderRadius:4, fontWeight:800, fontFamily:"monospace" }}>
                                      {c.identifiant_unique}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          {/* Contact */}
                          <td style={{ padding:"13px 16px" }}>
                            {c.telephone && <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}><Phone size={11} color={C.textMuted}/><span style={{ fontSize:12, color:C.textSub }}>{c.telephone}</span></div>}
                            {c.email     && <div style={{ display:"flex", alignItems:"center", gap:6 }}><Mail size={11} color={C.textMuted}/><span style={{ fontSize:12, color:C.textSub }}>{c.email}</span></div>}
                            {!c.telephone && !c.email && <span style={{ fontSize:12, color:C.textMuted }}>—</span>}
                          </td>
                          {/* Formation */}
                          <td className="ins-hide-sm" style={{ padding:"13px 16px" }}>
                            {c.formation_detail ? (
                              <div>
                                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                                  <GraduationCap size={11} color={C.purple}/>
                                  <span style={{ fontSize:12, color:C.textSub, fontWeight:700 }}>{c.formation_detail.nom_formation}</span>
                                </div>
                                <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                                  <TypeBadge type={c.formation_detail.type_formation}/>
                                  <span style={{ fontSize:10, color:C.textMuted }}>{ANTENNE_LABEL(c.formation_detail.antenne)}</span>
                                </div>
                              </div>
                            ) : (c.domaine || c.formation_ciblee) ? (
                              <div>
                                {c.domaine && (
                                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                                    <Target size={11} color={C.gold}/>
                                    <span style={{ fontSize:12, color:C.textSub }}>
                                      {DOMAINES.find(d => d.v === c.domaine)?.l || c.domaine}
                                    </span>
                                  </div>
                                )}
                                {c.formation_ciblee && (
                                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                                    <Briefcase size={11} color={C.textMuted}/>
                                    <span style={{ fontSize:11, color:C.textMuted }}>{c.formation_ciblee}</span>
                                  </div>
                                )}
                              </div>
                            ) : <span style={{ fontSize:12, color:C.textMuted }}>—</span>}
                          </td>
                          {/* Statut */}
                          <td className="ins-hide-sm" style={{ padding:"13px 16px" }}>
                            <StatutBadge statut={c.statut_fiche}/>
                          </td>
                          {/* Actions */}
                          <td style={{ padding:"13px 16px" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                              <button className="ins-act-btn" title="Détails" onClick={() => setDetailTarget(c)}
                                style={{ background:`${C.blue}08`, borderColor:`${C.blue}20` }}
                                onMouseEnter={e=>{e.currentTarget.style.background=`${C.blue}18`;e.currentTarget.style.borderColor=C.blue;}}
                                onMouseLeave={e=>{e.currentTarget.style.background=`${C.blue}08`;e.currentTarget.style.borderColor=`${C.blue}20`;}}>
                                <Eye size={13} color={C.blue}/>
                              </button>
                              <button className="ins-act-btn" title="Modifier" onClick={() => { setEditTarget(c); setShowForm(true); }}
                                style={{ background:`${C.gold}08`, borderColor:`${C.gold}20` }}
                                onMouseEnter={e=>{e.currentTarget.style.background=`${C.gold}18`;e.currentTarget.style.borderColor=C.gold;}}
                                onMouseLeave={e=>{e.currentTarget.style.background=`${C.gold}08`;e.currentTarget.style.borderColor=`${C.gold}20`;}}>
                                <Pencil size={13} color={C.gold}/>
                              </button>
                              <button className="ins-act-btn" title="Supprimer" onClick={() => setDelTarget(c)}
                                style={{ background:`${C.danger}08`, borderColor:`${C.danger}20` }}
                                onMouseEnter={e=>{e.currentTarget.style.background=`${C.danger}18`;e.currentTarget.style.borderColor=C.danger;}}
                                onMouseLeave={e=>{e.currentTarget.style.background=`${C.danger}08`;e.currentTarget.style.borderColor=`${C.danger}20`;}}>
                                <Trash2 size={13} color={C.danger}/>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div style={{ padding:"13px 20px", borderTop:`1px solid ${C.divider}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
                    <p style={{ fontSize:12, color:C.textMuted }}>
                      <span style={{ fontWeight:700, color:C.textSub }}>{(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE,filtered.length)}</span> / <span style={{ fontWeight:700, color:C.textSub }}>{filtered.length}</span>
                    </p>
                    <div style={{ display:"flex", gap:5, alignItems:"center" }}>
                      <button className="ins-pg" onClick={() => setPage(p => p-1)} disabled={page===1}><ChevronLeft size={13}/></button>
                      {Array.from({length:pages},(_,i)=>i+1).filter(p=>p===1||p===pages||Math.abs(p-page)<=1).map((p,i,arr) => (
                        <React.Fragment key={p}>
                          {i>0 && arr[i-1]!==p-1 && <span style={{color:C.textMuted,fontSize:12,padding:"0 2px"}}>…</span>}
                          <button className={`ins-pg${p===page?" active":""}`} onClick={() => setPage(p)}>{p}</button>
                        </React.Fragment>
                      ))}
                      <button className="ins-pg" onClick={() => setPage(p => p+1)} disabled={page===pages}><ChevronRight size={13}/></button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showForm && (
        <CandidatForm
          candidat={editTarget}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
          onSaved={handleSaved}
        />
      )}
      {delTarget && (
        <DeleteModal
          label={`${delTarget.nom} ${delTarget.prenom}`}
          onClose={() => setDelTarget(null)}
          onConfirm={handleDelete}
          loading={delLoading}
        />
      )}
      {detailTarget && (
        <DetailsModal
          candidat={detailTarget}
          onClose={() => setDetailTarget(null)}
          onEdit={() => { setEditTarget(detailTarget); setDetailTarget(null); setShowForm(true); }}
          onValider={() => handleAction("valider", detailTarget)}
          onRejeter={() => handleAction("rejeter", detailTarget)}
          loadingAction={actionLoading}
        />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type}/>}
    </>
  );
};

export default Inscription;