import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import CONFIG from "../../config/config.js";
import {
  UserPlus, Users, Search, Pencil, Trash2, X, Check,
  ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2,
  User, Phone, Mail, MapPin, BookOpen, Briefcase, Calendar,
  Filter, RefreshCw, Eye, MoreVertical, Download,
  ArrowUpRight, Loader2,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   PALETTE — cohérente avec DashboardAdmin
═══════════════════════════════════════════════════ */
const C = {
  page:      "#F8F9FD",
  surface:   "#FFFFFF",
  surfaceEl: "#F4F7FF",
  navy:      "#06102A",
  navyMid:   "#0C1D5F",
  blue:      "#1635C8",
  blueViv:   "#2447E0",
  sky:       "#5073FF",
  iceBlue:   "#D0D9FF",
  textPri:   "#06102A",
  textSub:   "#3A4F8C",
  textMuted: "#8497C8",
  gold:      "#D4920A",
  goldLight: "#F5B020",
  goldPale:  "#FFF8E7",
  green:     "#047A5A",
  greenLight:"#0DA575",
  greenPale: "#E8FBF5",
  success:   "#047A5A",
  danger:    "#C81B1B",
  dangerPale:"#FEF2F2",
  orange:    "#C05C0A",
  violet:    "#6A24D4",
  divider:   "#E8EDFC",
  shadow:    "rgba(6,16,42,0.08)",
  shadowMd:  "rgba(6,16,42,0.15)",
};

/* ═══════════════════════════════════════════════════
   CSS GLOBAL
═══════════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .ins { font-family:'Outfit',sans-serif; -webkit-font-smoothing:antialiased; }
  .ins-serif { font-family:'Fraunces',serif !important; }

  /* Micro-grille fond */
  .ins-page::before {
    content:''; position:fixed; inset:0; pointer-events:none; z-index:0;
    background-image: radial-gradient(circle at 1px 1px, rgba(22,53,200,.05) 1px, transparent 0);
    background-size: 28px 28px;
  }

  /* Boutons principaux */
  .ins-btn-pri {
    display:inline-flex; align-items:center; gap:8px;
    padding:10px 22px; border-radius:11px; border:none; cursor:pointer;
    font-family:'Outfit',sans-serif; font-size:13px; font-weight:700;
    background:linear-gradient(135deg,#1635C8,#2447E0);
    color:#fff;
    box-shadow:0 4px 18px rgba(22,53,200,.28), 0 1px 0 rgba(255,255,255,.12) inset;
    transition:all .18s cubic-bezier(.34,1.2,.64,1);
  }
  .ins-btn-pri:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(22,53,200,.38); }
  .ins-btn-pri:active { transform:translateY(0); }
  .ins-btn-pri:disabled { opacity:.55; transform:none; cursor:not-allowed; }

  .ins-btn-sec {
    display:inline-flex; align-items:center; gap:7px;
    padding:9px 18px; border-radius:10px; cursor:pointer;
    font-family:'Outfit',sans-serif; font-size:12.5px; font-weight:600;
    background:#fff; color:${C.textSub};
    border:1px solid ${C.divider};
    transition:all .15s ease;
  }
  .ins-btn-sec:hover { background:${C.surfaceEl}; border-color:${C.iceBlue}; color:${C.textPri}; }

  .ins-btn-danger {
    display:inline-flex; align-items:center; gap:7px;
    padding:9px 18px; border-radius:10px; cursor:pointer;
    font-family:'Outfit',sans-serif; font-size:12.5px; font-weight:700;
    background:${C.danger}; color:#fff; border:none;
    box-shadow:0 4px 14px rgba(200,27,27,.28);
    transition:all .15s;
  }
  .ins-btn-danger:hover { background:#A51515; transform:translateY(-1px); }

  /* Inputs */
  .ins-input {
    width:100%; padding:10px 14px; border-radius:10px;
    border:1.5px solid ${C.divider};
    background:#fff; color:${C.textPri};
    font-family:'Outfit',sans-serif; font-size:13px; font-weight:400;
    outline:none; transition:border-color .16s, box-shadow .16s;
    -webkit-font-smoothing:antialiased;
  }
  .ins-input:focus {
    border-color:${C.blue};
    box-shadow:0 0 0 3px rgba(22,53,200,.1);
  }
  .ins-input::placeholder { color:${C.textMuted}; }

  /* Tableau */
  .ins-tr { transition:background .12s; }
  .ins-tr:hover { background:${C.surfaceEl} !important; }

  /* Actions tableau */
  .ins-act-btn {
    width:30px; height:30px; border-radius:8px; border:1px solid ${C.divider};
    display:flex; align-items:center; justify-content:center; cursor:pointer;
    background:#fff; transition:all .14s cubic-bezier(.34,1.3,.64,1);
  }
  .ins-act-btn:hover { transform:scale(1.12); }

  /* Badge statut */
  .ins-badge { display:inline-flex; align-items:center; gap:5px; border-radius:20px; padding:3px 10px; font-size:10.5px; font-weight:700; }

  /* Card animations */
  @keyframes insUp {
    from { opacity:0; transform:translateY(18px) scale(.985); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  .ins-in  { animation:insUp .45s cubic-bezier(.22,1,.36,1) both; }
  .ins-d0  { animation-delay:.0s;  }
  .ins-d1  { animation-delay:.07s; }
  .ins-d2  { animation-delay:.14s; }

  /* Modal */
  @keyframes insModal {
    from { opacity:0; transform:scale(.94) translateY(-12px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }
  .ins-modal { animation:insModal .22s cubic-bezier(.22,1,.36,1) both; }

  /* Loader spin */
  @keyframes insSpin { to { transform:rotate(360deg); } }
  .ins-spin { animation:insSpin .7s linear infinite; }

  /* Notification toast */
  @keyframes insToast {
    0%   { opacity:0; transform:translateY(16px); }
    15%  { opacity:1; transform:translateY(0); }
    80%  { opacity:1; transform:translateY(0); }
    100% { opacity:0; transform:translateY(-8px); }
  }
  .ins-toast { animation:insToast 3.2s ease both; }

  /* Pagination btn */
  .ins-pg {
    width:34px; height:34px; border-radius:9px; border:1px solid ${C.divider};
    display:flex; align-items:center; justify-content:center; cursor:pointer;
    font-family:'Outfit',sans-serif; font-size:12px; font-weight:600;
    background:#fff; color:${C.textSub};
    transition:all .14s;
  }
  .ins-pg:hover { background:${C.surfaceEl}; border-color:${C.iceBlue}; }
  .ins-pg.active { background:${C.navy}; color:#fff; border-color:${C.navy}; }
  .ins-pg:disabled { opacity:.4; cursor:not-allowed; }

  /* Search */
  .ins-search-wrap { position:relative; }
  .ins-search-wrap input { padding-left:38px; }
  .ins-search-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); pointer-events:none; }

  /* Hover card sections */
  .ins-field-group { transition:background .12s; border-radius:12px; padding:4px; }
  .ins-field-group:hover { background:${C.surfaceEl}; }

  /* Responsive */
  @media(max-width:768px) {
    .ins-table-scroll { overflow-x:auto; }
    .ins-hide-sm { display:none !important; }
    .ins-grid-2 { grid-template-columns:1fr !important; }
    .ins-grid-3 { grid-template-columns:1fr !important; }
    .ins { padding:80px 14px 52px !important; }
  }
`;

/* ═══════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════ */
const EMPTY_FORM = {
  nom:"", prenom:"", sexe:"", date_naissance:"",
  telephone:"", email:"", adresse:"",
  niveau_etude:"", metier_souhaite:"", antenne:null,
  /* read-only — affichés en mode édition uniquement */
  statut_fiche:"en_attente", identifiant_unique:"",
};

const STATUT_CONFIG = {
  en_attente:{ label:"En attente", bg:"rgba(212,146,10,.12)", text:C.gold,    border:"rgba(212,146,10,.25)" },
  valide:    { label:"Validé",     bg:C.greenPale,             text:C.green,   border:"rgba(4,122,90,.2)"   },
  rejete:    { label:"Rejeté",     bg:C.dangerPale,            text:C.danger,  border:"rgba(200,27,27,.2)"  },
};

const NIVEAUX = ["CEP","BEPC","BAC","BTS","Licence","Master","Doctorat","Sans diplôme","Autre"];
const PAGE_SIZE = 10;

/* ─────────────────────────────────────────────────────
   authHeader — lit le token depuis localStorage
   Clé prioritaire : "access" (celle écrite par Login.jsx)
   Debug : si 403, ouvrir console → localStorage.getItem("access")
───────────────────────────────────────────────────── */
const authHeader = () => {
  const token =
    localStorage.getItem("access") ||       // Login.jsx ligne ~51
    localStorage.getItem("access_token") ||  // variante possible
    localStorage.getItem("token");           // autre variante
  if (!token) {
    console.warn("[authHeader] ⚠️ Aucun token trouvé dans localStorage !");
  }
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/* ═══════════════════════════════════════════════════
   SUB-COMPOSANTS
═══════════════════════════════════════════════════ */

/* Séparateur de section */
const SecHdr = ({ icon:Icon, label, color = C.blue }) => (
  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
    <div style={{ width:4, height:20, borderRadius:3, background:color, flexShrink:0 }}/>
    <Icon size={13} color={color}/>
    <p className="ins-serif" style={{ fontSize:12.5, fontWeight:600, color:C.textSub, letterSpacing:"-.05px" }}>{label}</p>
  </div>
);

/* Label champ */
const FL = ({ label, required }) => (
  <label style={{ fontSize:12, fontWeight:600, color:C.textSub, marginBottom:5, display:"block", fontFamily:"'Outfit',sans-serif" }}>
    {label}{required && <span style={{ color:C.danger, marginLeft:2 }}>*</span>}
  </label>
);

/* Badge statut */
const StatutBadge = ({ statut }) => {
  const cfg = STATUT_CONFIG[statut] || STATUT_CONFIG.en_attente;
  return (
    <span className="ins-badge" style={{ background:cfg.bg, color:cfg.text, border:`1px solid ${cfg.border}` }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:cfg.text, flexShrink:0 }}/>
      {cfg.label}
    </span>
  );
};

/* Toast notification */
const Toast = ({ msg, type }) => {
  const isOk = type === "success";
  return (
    <div className="ins-toast" style={{
      position:"fixed", bottom:28, right:28, zIndex:1000,
      display:"flex", alignItems:"center", gap:10,
      padding:"12px 20px", borderRadius:13,
      background: isOk ? C.green : C.danger,
      color:"#fff",
      boxShadow:`0 12px 40px ${isOk?"rgba(4,122,90,.35)":"rgba(200,27,27,.35)"}`,
      fontFamily:"'Outfit',sans-serif", fontSize:13, fontWeight:600,
      minWidth:260,
    }}>
      {isOk ? <CheckCircle2 size={15}/> : <AlertTriangle size={15}/>}
      {msg}
    </div>
  );
};

/* Initiales avatar */
const Initials = ({ nom, prenom, size = 36 }) => {
  const ini = `${nom?.[0]||""}${prenom?.[0]||""}`.toUpperCase() || "?";
  return (
    <div style={{
      width:size, height:size, borderRadius:size/3,
      background:`linear-gradient(135deg,${C.navy},${C.blue})`,
      display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
      boxShadow:`0 2px 8px rgba(22,53,200,.2)`,
    }}>
      <span className="ins-serif" style={{ fontSize:size*.38, fontWeight:600, fontStyle:"italic", color:"#fff", lineHeight:1 }}>{ini}</span>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   FORMULAIRE CANDIDAT (Création & Édition)
═══════════════════════════════════════════════════ */
const CandidatForm = ({ candidat, onClose, onSaved }) => {
  const isEdit = Boolean(candidat?.id);
  const [form, setForm]       = useState(isEdit ? { ...candidat } : { ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]:v }));
    setErrors(e => ({ ...e, [k]:undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.nom?.trim())    e.nom    = "Le nom est requis";
    if (!form.prenom?.trim()) e.prenom = "Le prénom est requis";
    if (!form.sexe)           e.sexe   = "Le sexe est requis";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setLoading(true);
    try {
      const url = isEdit
        ? `${CONFIG.BASE_URL}${CONFIG.API_CANDIDATS}${candidat.id}/`
        : `${CONFIG.BASE_URL}${CONFIG.API_CANDIDATS}`;
      const method = isEdit ? axios.put : axios.post;
      /* Tous les champs optionnels → null si vide (évite erreurs Django) */
      const payload = {
        nom:             form.nom.trim(),
        prenom:          form.prenom.trim(),
        sexe:            form.sexe            || null,
        date_naissance:  form.date_naissance  || null,
        telephone:       form.telephone?.trim()       || null,
        email:           form.email?.trim()           || null,
        adresse:         form.adresse?.trim()         || null,
        niveau_etude:    form.niveau_etude            || null,
        metier_souhaite: form.metier_souhaite?.trim() || null,
        antenne:         form.antenne                 || null,
      };
      const res = await method(url, payload, { headers: authHeader() });
      onSaved(res.data, isEdit ? "edit" : "create");
    } catch (err) {
      console.error("Erreur API :", err.response?.data);
      const detail = err.response?.data;
      if (detail && typeof detail === "object") {
        const mapped = {};
        Object.entries(detail).forEach(([k, v]) => { mapped[k] = Array.isArray(v) ? v[0] : String(v); });
        setErrors(mapped);
      }
    } finally { setLoading(false); }
  };

  /* Champ générique texte / select */
  const Field = ({ label, name, required, type="text", options, placeholder, span=1, textarea=false }) => (
    <div style={{ gridColumn: span > 1 ? `span ${span}` : undefined }}>
      <FL label={label} required={required}/>
      {textarea ? (
        <textarea
          className="ins-input"
          rows={3}
          value={form[name]||""}
          placeholder={placeholder||label}
          onChange={e=>set(name,e.target.value)}
          style={{ borderColor:errors[name]?C.danger:undefined, resize:"vertical" }}
        />
      ) : options ? (
        <select className="ins-input" value={form[name]||""} onChange={e=>set(name,e.target.value)}
          style={{ borderColor:errors[name]?C.danger:undefined }}>
          <option value="">{placeholder||`Choisir ${label.toLowerCase()}`}</option>
          {options.map(o => <option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
        </select>
      ) : (
        <input className="ins-input" type={type} value={form[name]||""} placeholder={placeholder||label}
          onChange={e=>set(name,e.target.value)}
          style={{ borderColor:errors[name]?C.danger:undefined }}/>
      )}
      {errors[name] && <p style={{ fontSize:11, color:C.danger, marginTop:4 }}>{errors[name]}</p>}
    </div>
  );

  /* Champ info en lecture seule (statut, identifiant) */
  const ReadOnly = ({ label, value, color=C.textMuted, badge=false, icon:Icon }) => (
    <div>
      <FL label={label}/>
      <div style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 13px", borderRadius:10, background:C.surfaceEl, border:`1px solid ${C.divider}`, minHeight:40 }}>
        {Icon && <Icon size={13} color={color}/>}
        {badge ? (
          <StatutBadge statut={value||"en_attente"}/>
        ) : (
          <span style={{ fontSize:12.5, color: value ? C.textPri : C.textMuted }}>
            {value || "—"}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ position:"fixed", inset:0, zIndex:600, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      {/* Overlay */}
      <div style={{ position:"absolute", inset:0, background:"rgba(6,16,42,.52)", backdropFilter:"blur(12px) saturate(1.4)" }} onClick={onClose}/>

      {/* Modal */}
      <div className="ins-modal" style={{
        position:"relative", width:"100%", maxWidth:700,
        maxHeight:"92vh", overflowY:"auto",
        background:C.surface, borderRadius:24,
        boxShadow:`0 32px 80px ${C.shadowMd}, 0 0 0 1px rgba(255,255,255,.6) inset`,
      }}>
        {/* Tricolore Guinée haut */}
        <div style={{ height:4, display:"flex", borderRadius:"24px 24px 0 0" }}>
          <div style={{ flex:1, background:"#E02020" }}/>
          <div style={{ flex:1, background:C.gold }}/>
          <div style={{ flex:1, background:C.green }}/>
        </div>

        {/* Header modal */}
        <div style={{ padding:"22px 28px 0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:13 }}>
            <div style={{ width:46, height:46, borderRadius:14, background:isEdit?`${C.gold}16`:`${C.blue}12`, border:`1.5px solid ${isEdit?`${C.gold}30`:`${C.blue}20`}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              {isEdit ? <Pencil size={20} color={C.gold}/> : <UserPlus size={20} color={C.blue}/>}
            </div>
            <div>
              <h2 className="ins-serif" style={{ fontSize:20, fontWeight:700, color:C.textPri, letterSpacing:"-.3px" }}>
                {isEdit ? "Modifier le candidat" : "Nouveau candidat"}
              </h2>
              <p style={{ fontSize:11.5, color:C.textMuted, marginTop:3 }}>
                {isEdit ? `Modification de ${candidat.nom} ${candidat.prenom}` : "Remplir les informations du candidat"}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ width:36, height:36, borderRadius:10, background:C.surfaceEl, border:`1px solid ${C.divider}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <X size={14} color={C.textMuted}/>
          </button>
        </div>

        {/* Corps du formulaire */}
        <div style={{ padding:"24px 28px 28px", display:"flex", flexDirection:"column", gap:20 }}>

          {/* ── 1. Identité personnelle ── */}
          <div style={{ background:C.surfaceEl, borderRadius:14, padding:"18px 20px", border:`1px solid ${C.divider}` }}>
            <SecHdr icon={User} label="Identité personnelle" color={C.blue}/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:13 }}>
              <Field label="Nom"    name="nom"    required placeholder="Ex: Diallo"/>
              <Field label="Prénom" name="prenom" required placeholder="Ex: Mamadou"/>
              <Field label="Sexe"   name="sexe"   required options={[{v:"H",l:"Homme"},{v:"F",l:"Femme"}]}/>
              <Field label="Date de naissance" name="date_naissance" type="date"/>
            </div>
          </div>

          {/* ── 2. Coordonnées ── */}
          <div style={{ background:C.surfaceEl, borderRadius:14, padding:"18px 20px", border:`1px solid ${C.divider}` }}>
            <SecHdr icon={Phone} label="Coordonnées" color={C.green}/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:13 }}>
              <Field label="Téléphone" name="telephone" type="tel" placeholder="Ex: 620 00 00 00"/>
              <Field label="Email"     name="email"     type="email" placeholder="Ex: mamadou@email.com"/>
            </div>
            <div style={{ marginTop:13 }}>
              <Field label="Adresse complète" name="adresse" placeholder="Quartier, Commune, Préfecture…" textarea span={2}/>
            </div>
          </div>

          {/* ── 3. Formation souhaitée ── */}
          <div style={{ background:C.surfaceEl, borderRadius:14, padding:"18px 20px", border:`1px solid ${C.divider}` }}>
            <SecHdr icon={BookOpen} label="Formation souhaitée" color={C.gold}/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:13 }}>
              <Field
                label="Niveau d'étude"
                name="niveau_etude"
                options={NIVEAUX}
                placeholder="Sélectionner un niveau"
              />
              <Field
                label="Métier / Filière souhaitée"
                name="metier_souhaite"
                placeholder="Ex: Technicien en informatique"
              />
            </div>
          </div>

          {/* ── 4. Informations fiche (lecture seule en édition) ── */}
          {isEdit && (
            <div style={{ background:`${C.navy}04`, borderRadius:14, padding:"18px 20px", border:`1px solid ${C.divider}` }}>
              <SecHdr icon={CheckCircle2} label="Informations de la fiche" color={C.textMuted}/>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:13 }}>
                <ReadOnly
                  label="Statut de la fiche"
                  value={form.statut_fiche}
                  badge
                />
                <ReadOnly
                  label="Identifiant unique"
                  value={form.identifiant_unique}
                  icon={CheckCircle2}
                  color={C.green}
                />
                <ReadOnly
                  label="Créé le"
                  value={form.created_at ? new Date(form.created_at).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"}) : null}
                  icon={Calendar}
                  color={C.textMuted}
                />
              </div>
              <p style={{ fontSize:11, color:C.textMuted, marginTop:10, fontStyle:"italic" }}>
                ⓘ Le statut et l'identifiant sont gérés par le workflow de validation — non modifiables ici.
              </p>
            </div>
          )}

          {/* ── Actions ── */}
          <div style={{ display:"flex", justifyContent:"flex-end", gap:10, paddingTop:6, borderTop:`1px solid ${C.divider}` }}>
            <button className="ins-btn-sec" onClick={onClose}>
              <X size={13}/> Annuler
            </button>
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
   MODAL CONFIRMATION SUPPRESSION
═══════════════════════════════════════════════════ */
const DeleteModal = ({ candidat, onClose, onConfirm, loading }) => (
  <div style={{ position:"fixed", inset:0, zIndex:700, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
    <div style={{ position:"absolute", inset:0, background:"rgba(6,16,42,.6)", backdropFilter:"blur(14px)" }} onClick={onClose}/>
    <div className="ins-modal" style={{
      position:"relative", width:"100%", maxWidth:420,
      background:C.surface, borderRadius:22,
      boxShadow:`0 32px 80px ${C.shadowMd}`,
      overflow:"hidden",
    }}>
      <div style={{ height:3, background:C.danger }}/>
      <div style={{ padding:"28px 28px 24px", textAlign:"center" }}>
        <div style={{ width:56, height:56, borderRadius:16, background:`${C.danger}12`, border:`1.5px solid ${C.danger}25`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
          <Trash2 size={24} color={C.danger}/>
        </div>
        <h3 className="ins-serif" style={{ fontSize:18, fontWeight:700, color:C.textPri, marginBottom:8 }}>Supprimer ce candidat ?</h3>
        <p style={{ fontSize:13, color:C.textSub, lineHeight:1.6, marginBottom:6 }}>
          Vous êtes sur le point de supprimer définitivement la fiche de
        </p>
        <p style={{ fontSize:15, fontWeight:700, color:C.textPri, marginBottom:18 }}>
          {candidat.nom} {candidat.prenom}
        </p>
        <p style={{ fontSize:11.5, color:C.textMuted, background:C.dangerPale, borderRadius:9, padding:"8px 14px", marginBottom:22 }}>
          ⚠️ Cette action est irréversible. Toutes les données associées seront perdues.
        </p>
        <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
          <button className="ins-btn-sec" onClick={onClose} style={{ flex:1 }}>
            <X size={13}/> Annuler
          </button>
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
   COMPOSANT PRINCIPAL
═══════════════════════════════════════════════════ */
const Inscription = () => {
  const [candidats,  setCandidats]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState("tous");
  const [page,       setPage]       = useState(1);
  const [showForm,   setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [delTarget,  setDelTarget]  = useState(null);
  const [delLoading, setDelLoading] = useState(false);
  const [toast,      setToast]      = useState(null);

  /* Chargement — vérifie le token avant d'appeler l'API */
  const fetchCandidats = async () => {
    const token = localStorage.getItem("access") || localStorage.getItem("access_token") || localStorage.getItem("token");
    if (!token) {
      showToast("Session expirée — veuillez vous reconnecter", "error");
      setTimeout(() => { window.location.href = "/login"; }, 1800);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`${CONFIG.BASE_URL}${CONFIG.API_CANDIDATS}`, { headers: authHeader() });
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setCandidats(data);
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        showToast("Session expirée — veuillez vous reconnecter", "error");
        setTimeout(() => { window.location.href = "/login"; }, 1800);
      } else {
        showToast("Impossible de charger les candidats", "error");
      }
    }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCandidats(); }, []);

  /* Toast */
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3300);
  };

  /* Après save */
  const handleSaved = (data, mode) => {
    if (mode === "create") {
      setCandidats(p => [data, ...p]);
      showToast(`${data.prenom} ${data.nom} inscrit(e) avec succès !`);
    } else {
      setCandidats(p => p.map(c => c.id === data.id ? data : c));
      showToast(`Fiche de ${data.prenom} ${data.nom} mise à jour`);
    }
    setShowForm(false);
    setEditTarget(null);
  };

  /* Suppression */
  const handleDelete = async () => {
    if (!delTarget) return;
    setDelLoading(true);
    try {
      await axios.delete(`${CONFIG.BASE_URL}${CONFIG.API_CANDIDATS}${delTarget.id}/`, { headers: authHeader() });
      setCandidats(p => p.filter(c => c.id !== delTarget.id));
      showToast(`Fiche de ${delTarget.prenom} ${delTarget.nom} supprimée`);
      setDelTarget(null);
    } catch { showToast("Erreur lors de la suppression", "error"); }
    finally { setDelLoading(false); }
  };

  /* Filtrage / pagination */
  const filtered = candidats.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || [c.nom, c.prenom, c.email, c.telephone, c.metier_souhaite].some(v => v?.toLowerCase().includes(q));
    const matchFilter = filter === "tous" || c.statut_fiche === filter;
    return matchSearch && matchFilter;
  });
  const pages    = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const total    = candidats.length;
  const stats    = {
    total,
    en_attente: candidats.filter(c => c.statut_fiche === "en_attente").length,
    valide:     candidats.filter(c => c.statut_fiche === "valide").length,
    rejete:     candidats.filter(c => c.statut_fiche === "rejete").length,
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="ins ins-page" style={{ minHeight:"100vh", background:`radial-gradient(ellipse 100% 50% at 60% -10%,rgba(22,53,200,.06) 0%,transparent 60%), ${C.page}`, padding:"88px 28px 64px", position:"relative" }}>
        <div style={{ position:"relative", zIndex:1, maxWidth:1200, margin:"0 auto" }}>

          {/* ══════════════════════════
              EN-TÊTE PAGE
          ══════════════════════════ */}
          <div className="ins-in ins-d0" style={{ marginBottom:26 }}>
            {/* Tricolore */}
            <div style={{ display:"flex", gap:0, height:3, borderRadius:3, marginBottom:16, overflow:"hidden", width:80 }}>
              <div style={{ flex:1, background:"#E02020" }}/>
              <div style={{ flex:1, background:C.gold }}/>
              <div style={{ flex:1, background:C.green }}/>
            </div>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:14 }}>
              <div>
                <h1 className="ins-serif" style={{ fontSize:30, fontWeight:700, color:C.textPri, letterSpacing:"-.6px", lineHeight:1.1 }}>
                  Gestion des candidats
                </h1>
                <p style={{ fontSize:13, color:C.textMuted, marginTop:6 }}>
                  Inscriptions, modifications et suivi des fiches candidats — ONFPP Guinée
                </p>
              </div>
              <div style={{ display:"flex", gap:9, alignItems:"center" }}>
                <button className="ins-btn-sec" onClick={fetchCandidats} title="Actualiser">
                  <RefreshCw size={13}/>
                </button>
                <button className="ins-btn-pri" onClick={() => { setEditTarget(null); setShowForm(true); }}>
                  <UserPlus size={14}/> Nouveau candidat
                </button>
              </div>
            </div>
          </div>

          {/* ══════════════════════════
              KPI CARDS
          ══════════════════════════ */}
          <div className="ins-in ins-d1" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:12, marginBottom:24 }}>
            {[
              { label:"Total candidats", value:stats.total,      color:C.blue,   bg:`${C.blue}10`,   icon:Users         },
              { label:"En attente",      value:stats.en_attente, color:C.gold,   bg:`${C.gold}12`,   icon:Calendar      },
              { label:"Validés",         value:stats.valide,     color:C.green,  bg:C.greenPale,     icon:CheckCircle2  },
              { label:"Rejetés",         value:stats.rejete,     color:C.danger, bg:C.dangerPale,    icon:AlertTriangle },
            ].map((s, i) => {
              const SI = s.icon;
              return (
                <div key={i} style={{ background:C.surface, borderRadius:16, padding:"18px 16px", border:`1px solid ${C.divider}`, boxShadow:`0 2px 14px ${C.shadow}`, position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:2.5, background:s.color, borderRadius:"16px 16px 0 0" }}/>
                  <div style={{ width:38, height:38, borderRadius:11, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12 }}>
                    <SI size={17} color={s.color}/>
                  </div>
                  <p className="ins-serif" style={{ fontSize:28, fontWeight:700, color:C.textPri, lineHeight:1, letterSpacing:"-1px" }}>{s.value}</p>
                  <p style={{ fontSize:11.5, color:C.textMuted, marginTop:5, fontWeight:500 }}>{s.label}</p>
                </div>
              );
            })}
          </div>

          {/* ══════════════════════════
              BARRE FILTRES
          ══════════════════════════ */}
          <div className="ins-in ins-d2" style={{ background:C.surface, border:`1px solid ${C.divider}`, borderRadius:16, padding:"14px 18px", marginBottom:18, display:"flex", alignItems:"center", gap:12, flexWrap:"wrap", boxShadow:`0 2px 12px ${C.shadow}` }}>

            {/* Search */}
            <div className="ins-search-wrap" style={{ flex:"1 1 260px", minWidth:0 }}>
              <Search size={14} color={C.textMuted} className="ins-search-icon"/>
              <input
                className="ins-input"
                placeholder="Rechercher par nom, email, téléphone…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                style={{ paddingLeft:38 }}
              />
            </div>

            {/* Filtre statut */}
            <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
              {[
                { v:"tous",      l:"Tous",         c:C.textSub },
                { v:"en_attente",l:"En attente",   c:C.gold    },
                { v:"valide",    l:"Validés",      c:C.green   },
                { v:"rejete",    l:"Rejetés",      c:C.danger  },
              ].map(f => (
                <button key={f.v} onClick={() => { setFilter(f.v); setPage(1); }} style={{
                  padding:"6px 14px", borderRadius:20, cursor:"pointer",
                  fontSize:12, fontWeight:700,
                  fontFamily:"'Outfit',sans-serif",
                  border: filter === f.v ? `1.5px solid ${f.c}` : `1px solid ${C.divider}`,
                  background: filter === f.v ? `${f.c}12` : C.surfaceEl,
                  color: filter === f.v ? f.c : C.textMuted,
                  transition:"all .14s",
                }}>
                  {f.l}
                </button>
              ))}
            </div>

            {/* Compteur */}
            <p style={{ fontSize:12, color:C.textMuted, flexShrink:0 }}>
              <span style={{ fontWeight:700, color:C.textSub }}>{filtered.length}</span> résultat{filtered.length>1?"s":""}
            </p>
          </div>

          {/* ══════════════════════════
              TABLEAU
          ══════════════════════════ */}
          <div className="ins-in ins-d2" style={{ background:C.surface, border:`1px solid ${C.divider}`, borderRadius:18, boxShadow:`0 2px 16px ${C.shadow}`, overflow:"hidden" }}>

            {loading ? (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"60px 0", gap:14 }}>
                <Loader2 size={28} color={C.blue} className="ins-spin"/>
                <p style={{ fontSize:13, color:C.textMuted }}>Chargement des candidats…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"64px 0", gap:12 }}>
                <div style={{ width:56, height:56, borderRadius:16, background:C.surfaceEl, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Users size={24} color={C.textMuted}/>
                </div>
                <p className="ins-serif" style={{ fontSize:16, fontWeight:600, color:C.textSub }}>Aucun candidat trouvé</p>
                <p style={{ fontSize:12.5, color:C.textMuted }}>
                  {search ? "Modifiez votre recherche" : "Commencez par inscrire un candidat"}
                </p>
                {!search && (
                  <button className="ins-btn-pri" onClick={() => setShowForm(true)} style={{ marginTop:6 }}>
                    <UserPlus size={13}/> Inscrire un candidat
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="ins-table-scroll">
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead>
                      <tr style={{ background:`${C.navy}04`, borderBottom:`1.5px solid ${C.divider}` }}>
                        {["Candidat","Contacts","Formation","Statut","Actions"].map((h, i) => (
                          <th key={i} className={i >= 2 && i <= 3 ? "ins-hide-sm" : ""} style={{ padding:"12px 16px", textAlign:"left", fontSize:10.5, fontWeight:800, color:C.textMuted, letterSpacing:".1em", textTransform:"uppercase" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((c, i) => (
                        <tr key={c.id} className="ins-tr" style={{ borderBottom:`1px solid ${C.divider}`, background:"transparent" }}>

                          {/* Candidat */}
                          <td style={{ padding:"13px 16px" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:11 }}>
                              <Initials nom={c.nom} prenom={c.prenom}/>
                              <div>
                                <p style={{ fontSize:13.5, fontWeight:700, color:C.textPri, lineHeight:1.2 }}>{c.nom} {c.prenom}</p>
                                <p style={{ fontSize:11, color:C.textMuted, marginTop:2 }}>
                                  {c.sexe === "H" ? "Homme" : c.sexe === "F" ? "Femme" : "—"} 
                                  {c.date_naissance ? ` · ${new Date(c.date_naissance).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"})}` : ""}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Contacts */}
                          <td style={{ padding:"13px 16px" }}>
                            {c.telephone && (
                              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                                <Phone size={11} color={C.textMuted}/>
                                <span style={{ fontSize:12, color:C.textSub }}>{c.telephone}</span>
                              </div>
                            )}
                            {c.email && (
                              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                                <Mail size={11} color={C.textMuted}/>
                                <span style={{ fontSize:12, color:C.textSub }}>{c.email}</span>
                              </div>
                            )}
                            {!c.telephone && !c.email && <span style={{ fontSize:12, color:C.textMuted }}>—</span>}
                          </td>

                          {/* Formation */}
                          <td className="ins-hide-sm" style={{ padding:"13px 16px" }}>
                            {c.metier_souhaite && (
                              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                                <Briefcase size={11} color={C.gold}/>
                                <span style={{ fontSize:12, color:C.textSub, fontWeight:500 }}>{c.metier_souhaite}</span>
                              </div>
                            )}
                            {c.niveau_etude && (
                              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                                <BookOpen size={11} color={C.textMuted}/>
                                <span style={{ fontSize:11.5, color:C.textMuted }}>{c.niveau_etude}</span>
                              </div>
                            )}
                            {!c.metier_souhaite && !c.niveau_etude && <span style={{ fontSize:12, color:C.textMuted }}>—</span>}
                          </td>

                          {/* Statut */}
                          <td className="ins-hide-sm" style={{ padding:"13px 16px" }}>
                            <StatutBadge statut={c.statut_fiche}/>
                          </td>

                          {/* Actions */}
                          <td style={{ padding:"13px 16px" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                              <button
                                className="ins-act-btn"
                                onClick={() => { setEditTarget(c); setShowForm(true); }}
                                title="Modifier"
                                style={{ background:`${C.gold}0A`, borderColor:`${C.gold}22` }}
                                onMouseEnter={e => { e.currentTarget.style.background=`${C.gold}18`; e.currentTarget.style.borderColor=C.gold; }}
                                onMouseLeave={e => { e.currentTarget.style.background=`${C.gold}0A`; e.currentTarget.style.borderColor=`${C.gold}22`; }}
                              >
                                <Pencil size={13} color={C.gold}/>
                              </button>
                              <button
                                className="ins-act-btn"
                                onClick={() => setDelTarget(c)}
                                title="Supprimer"
                                style={{ background:`${C.danger}0A`, borderColor:`${C.danger}22` }}
                                onMouseEnter={e => { e.currentTarget.style.background=`${C.danger}18`; e.currentTarget.style.borderColor=C.danger; }}
                                onMouseLeave={e => { e.currentTarget.style.background=`${C.danger}0A`; e.currentTarget.style.borderColor=`${C.danger}22`; }}
                              >
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
                  <div style={{ padding:"14px 20px", borderTop:`1px solid ${C.divider}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
                    <p style={{ fontSize:12, color:C.textMuted }}>
                      Affichage <span style={{ fontWeight:700, color:C.textSub }}>{(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE,filtered.length)}</span> sur <span style={{ fontWeight:700, color:C.textSub }}>{filtered.length}</span>
                    </p>
                    <div style={{ display:"flex", gap:5, alignItems:"center" }}>
                      <button className="ins-pg" onClick={() => setPage(p=>p-1)} disabled={page===1}>
                        <ChevronLeft size={13}/>
                      </button>
                      {Array.from({length:pages}, (_,i)=>i+1).filter(p => p===1||p===pages||Math.abs(p-page)<=1).map((p,i,arr)=>(
                        <React.Fragment key={p}>
                          {i>0 && arr[i-1]!==p-1 && <span style={{color:C.textMuted,fontSize:12,padding:"0 2px"}}>…</span>}
                          <button className={`ins-pg${p===page?" active":""}`} onClick={()=>setPage(p)}>{p}</button>
                        </React.Fragment>
                      ))}
                      <button className="ins-pg" onClick={() => setPage(p=>p+1)} disabled={page===pages}>
                        <ChevronRight size={13}/>
                      </button>
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
          candidat={delTarget}
          onClose={() => setDelTarget(null)}
          onConfirm={handleDelete}
          loading={delLoading}
        />
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type}/>}
    </>
  );
};

export default Inscription;