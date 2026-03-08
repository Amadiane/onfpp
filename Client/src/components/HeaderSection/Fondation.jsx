import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CONFIG from "../../config/config.js";
import {
  Building2, Users, Search, ChevronLeft, ChevronRight,
  Calendar, RefreshCw, Loader2, MapPinned, ClipboardList,
  Eye, X, BookOpen, User, ArrowUpRight, Plus, FileText,
  CheckCircle2, AlertTriangle, Clock, Ban, RotateCcw,
  Download, ExternalLink, Layers, Hash, ChevronDown, ChevronUp,
  Pencil, Trash2, BarChart3, Upload, Phone, Mail, MapPin,
  UserCheck, UserX, TrendingUp,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   PALETTE — cohérente avec le reste de la plateforme
═══════════════════════════════════════════════════════════════════ */
const C = {
  page: "#F8F9FD", surface: "#FFFFFF", surfaceEl: "#F4F7FF",
  navy: "#06102A", navyMid: "#0C1D5F", blue: "#1635C8", blueViv: "#2447E0",
  iceBlue: "#D0D9FF", textPri: "#06102A", textSub: "#3A4F8C", textMuted: "#8497C8",
  gold: "#D4920A", goldLight: "#F5B020", goldPale: "#FFF8E7",
  green: "#047A5A", greenLight: "#0DA575", greenPale: "#E8FBF5",
  danger: "#C81B1B", dangerPale: "#FEF2F2",
  orange: "#C05C0A", orangePale: "#FFF3E8",
  violet: "#6A24D4", violetPale: "#F3EDFF",
  teal: "#0E7490", tealPale: "#F0FDFF",
  divider: "#E8EDFC", shadow: "rgba(6,16,42,0.07)", shadowMd: "rgba(6,16,42,0.14)",
};

/* ═══════════════════════════════════════════════════════════════════
   CSS
═══════════════════════════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Outfit:wght@300;400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .ent { font-family: 'Outfit', sans-serif; -webkit-font-smoothing: antialiased; }
  .ent-serif { font-family: 'Fraunces', serif !important; }

  .ent-page::before {
    content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image: radial-gradient(circle at 1px 1px, rgba(22,53,200,.045) 1px, transparent 0);
    background-size: 28px 28px;
  }

  .ent-input {
    width: 100%; padding: 10px 14px; border-radius: 10px;
    border: 1.5px solid ${C.divider}; background: #fff; color: ${C.textPri};
    font-family: 'Outfit', sans-serif; font-size: 13px; outline: none;
    transition: border-color .16s, box-shadow .16s;
  }
  .ent-input:focus { border-color: ${C.blue}; box-shadow: 0 0 0 3px rgba(22,53,200,.09); }
  .ent-input::placeholder { color: ${C.textMuted}; }
  .ent-input-err { border-color: ${C.danger} !important; }
  select.ent-input { cursor: pointer; }
  textarea.ent-input { resize: vertical; min-height: 80px; line-height: 1.5; }

  .ent-btn-pri {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 22px; border-radius: 11px; border: none; cursor: pointer;
    font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 700;
    background: linear-gradient(135deg, ${C.navy}, ${C.blue}); color: #fff;
    box-shadow: 0 4px 18px rgba(22,53,200,.28);
    transition: all .18s cubic-bezier(.34,1.2,.64,1);
  }
  .ent-btn-pri:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(22,53,200,.38); }
  .ent-btn-pri:disabled { opacity: .5; transform: none; cursor: not-allowed; }

  .ent-btn-sec {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 18px; border-radius: 10px; cursor: pointer;
    font-family: 'Outfit', sans-serif; font-size: 12.5px; font-weight: 600;
    background: #fff; color: ${C.textSub}; border: 1.5px solid ${C.divider};
    transition: all .14s ease;
  }
  .ent-btn-sec:hover { background: ${C.surfaceEl}; border-color: ${C.iceBlue}; }

  .ent-btn-success {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 18px; border-radius: 10px; cursor: pointer;
    font-family: 'Outfit', sans-serif; font-size: 12.5px; font-weight: 700;
    background: ${C.green}; color: #fff; border: none;
    box-shadow: 0 4px 14px rgba(4,122,90,.28); transition: all .14s;
  }
  .ent-btn-success:hover { background: #035E45; transform: translateY(-1px); }
  .ent-btn-success:disabled { opacity: .5; cursor: not-allowed; transform: none; }

  .ent-btn-danger {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 18px; border-radius: 10px; cursor: pointer;
    font-family: 'Outfit', sans-serif; font-size: 12.5px; font-weight: 700;
    background: ${C.danger}; color: #fff; border: none;
    box-shadow: 0 4px 14px rgba(200,27,27,.25); transition: all .14s;
  }
  .ent-btn-danger:hover { background: #A51515; transform: translateY(-1px); }
  .ent-btn-danger:disabled { opacity: .5; cursor: not-allowed; transform: none; }

  .ent-tr { transition: background .12s; cursor: pointer; }
  .ent-tr:hover { background: #F4F7FF !important; }

  .ent-badge {
    display: inline-flex; align-items: center; gap: 5px;
    border-radius: 20px; padding: 3px 10px;
    font-size: 10.5px; font-weight: 700; font-family: 'Outfit', sans-serif;
  }

  .ent-act-btn {
    width: 30px; height: 30px; border-radius: 8px; border: 1px solid ${C.divider};
    display: flex; align-items: center; justify-content: center; cursor: pointer;
    background: #fff; transition: all .14s cubic-bezier(.34,1.3,.64,1);
  }
  .ent-act-btn:hover { transform: scale(1.12); }

  .ent-pg {
    width: 34px; height: 34px; border-radius: 9px; border: 1px solid ${C.divider};
    display: flex; align-items: center; justify-content: center; cursor: pointer;
    font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 600;
    background: #fff; color: ${C.textSub}; transition: all .14s;
  }
  .ent-pg:hover { background: ${C.surfaceEl}; border-color: ${C.iceBlue}; }
  .ent-pg.active { background: ${C.navy}; color: #fff; border-color: ${C.navy}; }
  .ent-pg:disabled { opacity: .4; cursor: not-allowed; }

  .ent-label {
    display: block; font-size: 12px; font-weight: 700;
    color: ${C.textSub}; margin-bottom: 5px;
    font-family: 'Outfit', sans-serif;
  }
  .ent-err { font-size: 11px; color: ${C.danger}; margin-top: 4px; }

  @keyframes entUp {
    from { opacity: 0; transform: translateY(18px) scale(.985); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .ent-in { animation: entUp .45s cubic-bezier(.22,1,.36,1) both; }
  .ent-d0 { animation-delay: .00s; } .ent-d1 { animation-delay: .07s; }
  .ent-d2 { animation-delay: .14s; } .ent-d3 { animation-delay: .21s; }

  @keyframes entModal {
    from { opacity: 0; transform: scale(.94) translateY(-16px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  .ent-modal { animation: entModal .26s cubic-bezier(.22,1,.36,1) both; }

  @keyframes entSpin { to { transform: rotate(360deg); } }
  .ent-spin { animation: entSpin .7s linear infinite; }

  @keyframes entToast {
    0%   { opacity: 0; transform: translateY(16px); }
    12%  { opacity: 1; transform: translateY(0); }
    80%  { opacity: 1; }
    100% { opacity: 0; transform: translateY(-6px); }
  }
  .ent-toast { animation: entToast 3.3s ease both; }

  .ent-tab-btn {
    display: flex; align-items: center; gap: 7px; padding: 9px 18px;
    border-radius: 10px 10px 0 0; border: none; cursor: pointer;
    font-family: 'Outfit', sans-serif; font-size: 12.5px; font-weight: 700;
    transition: all .14s; background: transparent;
  }

  .ent-detail-row {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 10px 0; border-bottom: 1px solid ${C.divider};
  }
  .ent-detail-row:last-child { border-bottom: none; }
  .ent-detail-label {
    font-size: 11px; font-weight: 700; color: ${C.textMuted};
    text-transform: uppercase; letter-spacing: .07em;
    min-width: 150px; flex-shrink: 0; padding-top: 2px;
  }
  .ent-detail-val { font-size: 13px; color: ${C.textPri}; font-weight: 500; line-height: 1.5; }

  .ent-module-card {
    border-radius: 12px; border: 1.5px solid ${C.divider};
    background: ${C.surface}; padding: 14px 16px;
    transition: all .2s cubic-bezier(.22,1,.36,1);
  }
  .ent-module-card:hover {
    border-color: ${C.iceBlue};
    box-shadow: 0 4px 20px rgba(6,16,42,.09);
    transform: translateY(-2px);
  }

  @keyframes entBar { from { width: 0; } to { width: var(--bw); } }
  .ent-bar { animation: entBar 1s cubic-bezier(.22,1,.36,1) both; }

  @media(max-width: 768px) {
    .ent { padding: 80px 14px 52px !important; }
    .ent-hide-sm { display: none !important; }
    .ent-2col { grid-template-columns: 1fr !important; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════
   CONSTANTES
═══════════════════════════════════════════════════════════════════ */
const ANTENNES_LIST = [
  { v: "conakry",    l: "Conakry",     code: "CKY" },
  { v: "forecariah", l: "Forecariah",  code: "FRC" },
  { v: "boke",       l: "Boké",        code: "BOK" },
  { v: "kindia",     l: "Kindia",      code: "KND" },
  { v: "labe",       l: "Labé",        code: "LBE" },
  { v: "mamou",      l: "Mamou",       code: "MMU" },
  { v: "faranah",    l: "Faranah",     code: "FRN" },
  { v: "kankan",     l: "Kankan",      code: "KNK" },
  { v: "siguiri",    l: "Siguiri",     code: "SGR" },
  { v: "nzerekore",  l: "N'Zérékoré",  code: "NZR" },
];
const ANTENNE_LABEL = (v) => ANTENNES_LIST.find((a) => a.v === v)?.l || v || "—";

const STATUTS = [
  { v: "planifiee", l: "Planifiée",            icon: Clock,        color: C.gold,   bg: C.goldPale,   border: `${C.gold}35`   },
  { v: "en_cours",  l: "En cours",             icon: TrendingUp,   color: C.blue,   bg: `${C.blue}12`,border: `${C.blue}30`   },
  { v: "realisee",  l: "Réalisée",             icon: CheckCircle2, color: C.green,  bg: C.greenPale,  border: `${C.green}30`  },
  { v: "annulee",   l: "Annulée",              icon: Ban,          color: C.danger, bg: C.dangerPale, border: `${C.danger}30` },
  { v: "reportee",  l: "Reportée",             icon: RotateCcw,    color: C.orange, bg: C.orangePale, border: `${C.orange}30` },
];
const getStatut = (v) => STATUTS.find((s) => s.v === v) || STATUTS[0];

const PAGE_SIZE = 10;

const authHeader = () => {
  const t = localStorage.getItem("access") || localStorage.getItem("access_token") || localStorage.getItem("token");
  return { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) };
};

const API_BASE = (CONFIG.BASE_URL || "") + "/api/entreprise-formations/";

const fmtD  = (d) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short",  year: "2-digit"  }) : "—";
const fmtDL = (d) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long",   year: "numeric"  }) : "—";

/* ═══════════════════════════════════════════════════════════════════
   PETITS COMPOSANTS
═══════════════════════════════════════════════════════════════════ */
const Tri = ({ h = 4 }) => (
  <div style={{ height: h, display: "flex", borderRadius: h / 2, overflow: "hidden" }}>
    <div style={{ flex: 1, background: "#E02020" }} />
    <div style={{ flex: 1, background: C.gold }} />
    <div style={{ flex: 1, background: C.green }} />
  </div>
);

const StatutBadge = ({ statut }) => {
  const s = getStatut(statut);
  const SI = s.icon;
  return (
    <span className="ent-badge" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      <SI size={10} /> {s.l}
    </span>
  );
};

const Toast = ({ msg, type }) => (
  <div className="ent-toast" style={{
    position: "fixed", bottom: 28, right: 28, zIndex: 3000,
    display: "flex", alignItems: "center", gap: 10, padding: "12px 22px", borderRadius: 14,
    background: type === "success" ? C.green : C.danger, color: "#fff",
    boxShadow: `0 12px 40px ${type === "success" ? "rgba(4,122,90,.35)" : "rgba(200,27,27,.35)"}`,
    fontFamily: "'Outfit',sans-serif", fontSize: 13.5, fontWeight: 600, minWidth: 280,
  }}>
    {type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
    {msg}
  </div>
);

const SecHdr = ({ icon: Icon, label, color = C.blue }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
    <div style={{ width: 4, height: 20, borderRadius: 3, background: color, flexShrink: 0 }} />
    <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}12`, border: `1px solid ${color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon size={13} color={color} />
    </div>
    <p className="ent-serif" style={{ fontSize: 13, fontWeight: 600, color: C.textSub }}>{label}</p>
  </div>
);

const FInput = ({ label, required, name, value, onChange, error, type = "text", placeholder }) => (
  <div>
    <label className="ent-label">{label}{required && <span style={{ color: C.danger, marginLeft: 2 }}>*</span>}</label>
    <input className={`ent-input${error ? " ent-input-err" : ""}`} type={type} name={name} value={value}
      placeholder={placeholder || label} autoComplete="off" onChange={onChange} />
    {error && <p className="ent-err">{error}</p>}
  </div>
);

const FSelect = ({ label, required, name, value, onChange, error, options, placeholder }) => (
  <div>
    <label className="ent-label">{label}{required && <span style={{ color: C.danger, marginLeft: 2 }}>*</span>}</label>
    <select className={`ent-input${error ? " ent-input-err" : ""}`} name={name} value={value} onChange={onChange}>
      <option value="">{placeholder || "Choisir…"}</option>
      {options.map((o) => <option key={o.v || o} value={o.v || o}>{o.l || o}</option>)}
    </select>
    {error && <p className="ent-err">{error}</p>}
  </div>
);

const FTextarea = ({ label, name, value, onChange, placeholder, rows = 3 }) => (
  <div>
    <label className="ent-label">{label}</label>
    <textarea className="ent-input" name={name} value={value} placeholder={placeholder || label}
      rows={rows} onChange={onChange} />
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   MODAL FORMULAIRE — CRÉATION / ÉDITION
═══════════════════════════════════════════════════════════════════ */
const EMPTY_FORM = {
  nom_entreprise: "", secteur_activite: "", adresse_entreprise: "",
  contact_rh: "", telephone_entreprise: "", email_entreprise: "",
  intitule_formation: "", objectifs: "",
  antenne: "", nb_hommes: 0, nb_femmes: 0,
  date_debut_prevue: "", date_fin_prevue: "",
  statut_realisation: "planifiee",
  plan_formation_url: "", plan_formation_nom: "",
  nb_formes_hommes: 0, nb_formes_femmes: 0, rapport_final: "",
};

const EntrepriseFormModal = ({ item, onClose, onSaved }) => {
  const isEdit = Boolean(item?.id);
  const [form, setForm]     = useState(isEdit ? {
    nom_entreprise:        item.nom_entreprise        || "",
    secteur_activite:      item.secteur_activite      || "",
    adresse_entreprise:    item.adresse_entreprise    || "",
    contact_rh:            item.contact_rh            || "",
    telephone_entreprise:  item.telephone_entreprise  || "",
    email_entreprise:      item.email_entreprise      || "",
    intitule_formation:    item.intitule_formation    || "",
    objectifs:             item.objectifs             || "",
    antenne:               item.antenne               || "",
    nb_hommes:             item.nb_hommes             ?? 0,
    nb_femmes:             item.nb_femmes             ?? 0,
    date_debut_prevue:     item.date_debut_prevue     || "",
    date_fin_prevue:       item.date_fin_prevue       || "",
    statut_realisation:    item.statut_realisation    || "planifiee",
    plan_formation_url:    item.plan_formation_url    || "",
    plan_formation_nom:    item.plan_formation_nom    || "",
    nb_formes_hommes:      item.nb_formes_hommes      ?? 0,
    nb_formes_femmes:      item.nb_formes_femmes      ?? 0,
    rapport_final:         item.rapport_final         || "",
  } : { ...EMPTY_FORM });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  }, []);

  const validate = () => {
    const e = {};
    if (!form.nom_entreprise.trim())    e.nom_entreprise    = "Requis";
    if (!form.intitule_formation.trim()) e.intitule_formation = "Requis";
    if (!form.antenne)                  e.antenne           = "Requis";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    const payload = {
      ...form,
      nb_hommes:        Number(form.nb_hommes)        || 0,
      nb_femmes:        Number(form.nb_femmes)        || 0,
      nb_formes_hommes: Number(form.nb_formes_hommes) || 0,
      nb_formes_femmes: Number(form.nb_formes_femmes) || 0,
      date_debut_prevue:  form.date_debut_prevue  || null,
      date_fin_prevue:    form.date_fin_prevue    || null,
      plan_formation_url: form.plan_formation_url || null,
      plan_formation_nom: form.plan_formation_nom || null,
      rapport_final:      form.rapport_final      || null,
      objectifs:          form.objectifs          || null,
    };
    try {
      let res;
      if (isEdit) {
        res = await axios.patch(`${API_BASE}${item.id}/`, payload, { headers: authHeader() });
      } else {
        res = await axios.post(API_BASE, payload, { headers: authHeader() });
      }
      onSaved(res.data, isEdit ? "edit" : "create");
    } catch (err) {
      const d = err.response?.data;
      if (d && typeof d === "object") {
        const mapped = {};
        Object.entries(d).forEach(([k, v]) => { mapped[k] = Array.isArray(v) ? v[0] : String(v); });
        setErrors(mapped);
      } else {
        setErrors({ nom_entreprise: "Erreur serveur. Réessayez." });
      }
    } finally { setLoading(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: "72px 16px 16px" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(6,16,42,.6)", backdropFilter: "blur(14px)" }} onClick={onClose} />
      <div className="ent-modal" style={{ position: "relative", width: "100%", maxWidth: 800, maxHeight: "calc(100vh - 88px)", overflowY: "auto", background: C.surface, borderRadius: 22, boxShadow: `0 32px 80px ${C.shadowMd}` }}>
        <div style={{ height: 4, display: "flex", borderRadius: "22px 22px 0 0", overflow: "hidden" }}>
          <div style={{ flex: 1, background: "#E02020" }} /><div style={{ flex: 1, background: C.gold }} /><div style={{ flex: 1, background: C.green }} />
        </div>
        {/* Header */}
        <div style={{ padding: "22px 28px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
            <div style={{ width: 46, height: 46, borderRadius: 13, background: isEdit ? `${C.gold}14` : `${C.blue}12`, border: `1.5px solid ${isEdit ? `${C.gold}30` : `${C.blue}22`}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {isEdit ? <Pencil size={19} color={C.gold} /> : <Plus size={20} color={C.blue} />}
            </div>
            <div>
              <h2 className="ent-serif" style={{ fontSize: 20, fontWeight: 700, color: C.textPri, letterSpacing: "-.3px" }}>
                {isEdit ? "Modifier le plan de formation" : "Nouveau plan de formation DFC"}
              </h2>
              <p style={{ fontSize: 11.5, color: C.textMuted, marginTop: 2 }}>Division Formation Continue — ONFPP Guinée</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 9, background: C.surfaceEl, border: `1px solid ${C.divider}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={14} color={C.textMuted} />
          </button>
        </div>

        <div style={{ padding: "20px 28px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Entreprise */}
          <div style={{ background: C.surfaceEl, borderRadius: 14, padding: "18px 20px", border: `1px solid ${C.divider}` }}>
            <SecHdr icon={Building2} label="Informations de l'entreprise" color={C.blue} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ gridColumn: "1/-1" }}>
                <FInput label="Nom de l'entreprise" name="nom_entreprise" required value={form.nom_entreprise} onChange={handleChange} error={errors.nom_entreprise} placeholder="Ex: Orange Guinée SA" />
              </div>
              <FInput label="Secteur d'activité" name="secteur_activite" value={form.secteur_activite} onChange={handleChange} placeholder="Ex: Télécommunications" />
              <FSelect label="Antenne ONFPP" name="antenne" required value={form.antenne} onChange={handleChange} error={errors.antenne} options={ANTENNES_LIST} />
              <FInput label="Contact RH / Responsable" name="contact_rh" value={form.contact_rh} onChange={handleChange} placeholder="Ex: Fatoumata Bah" />
              <FInput label="Téléphone" name="telephone_entreprise" type="tel" value={form.telephone_entreprise} onChange={handleChange} placeholder="Ex: 620 00 00 00" />
              <div style={{ gridColumn: "1/-1" }}>
                <FInput label="Email de l'entreprise" name="email_entreprise" type="email" value={form.email_entreprise} onChange={handleChange} placeholder="Ex: formation@orangeguinee.com" />
              </div>
            </div>
          </div>

          {/* Formation */}
          <div style={{ background: C.surfaceEl, borderRadius: 14, padding: "18px 20px", border: `1px solid ${C.divider}` }}>
            <SecHdr icon={BookOpen} label="Formation ciblée" color={C.violet} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ gridColumn: "1/-1" }}>
                <FInput label="Intitulé de la formation" name="intitule_formation" required value={form.intitule_formation} onChange={handleChange} error={errors.intitule_formation} placeholder="Ex: Formation en cybersécurité" />
              </div>
              <FInput label="Date de début prévue" name="date_debut_prevue" type="date" value={form.date_debut_prevue} onChange={handleChange} />
              <FInput label="Date de fin prévue"   name="date_fin_prevue"   type="date" value={form.date_fin_prevue}   onChange={handleChange} />
              <div style={{ gridColumn: "1/-1" }}>
                <FTextarea label="Objectifs de la formation" name="objectifs" value={form.objectifs} onChange={handleChange} placeholder="Décrire les objectifs visés…" rows={3} />
              </div>
            </div>
          </div>

          {/* Effectifs */}
          <div style={{ background: C.surfaceEl, borderRadius: 14, padding: "18px 20px", border: `1px solid ${C.divider}` }}>
            <SecHdr icon={Users} label="Effectifs prévus & réalisés" color={C.teal} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14 }}>
              <FInput label="Hommes prévus" name="nb_hommes" type="number" value={form.nb_hommes} onChange={handleChange} placeholder="0" />
              <FInput label="Femmes prévues" name="nb_femmes" type="number" value={form.nb_femmes} onChange={handleChange} placeholder="0" />
              <FInput label="Hommes formés" name="nb_formes_hommes" type="number" value={form.nb_formes_hommes} onChange={handleChange} placeholder="0" />
              <FInput label="Femmes formées" name="nb_formes_femmes" type="number" value={form.nb_formes_femmes} onChange={handleChange} placeholder="0" />
            </div>
          </div>

          {/* Plan & Statut */}
          <div style={{ background: C.surfaceEl, borderRadius: 14, padding: "18px 20px", border: `1px solid ${C.divider}` }}>
            <SecHdr icon={FileText} label="Plan de formation & Statut" color={C.gold} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <FSelect label="Statut de réalisation" name="statut_realisation" value={form.statut_realisation} onChange={handleChange}
                options={STATUTS.map((s) => ({ v: s.v, l: s.l }))} />
              <FInput label="Nom du fichier / document" name="plan_formation_nom" value={form.plan_formation_nom} onChange={handleChange} placeholder="Ex: Plan_Formation_2026.pdf" />
              <div style={{ gridColumn: "1/-1" }}>
                <FInput label="Lien vers le plan de formation (URL)" name="plan_formation_url" type="url" value={form.plan_formation_url} onChange={handleChange} placeholder="https://drive.google.com/…" />
              </div>
            </div>
          </div>

          {/* Rapport final */}
          <div style={{ background: C.surfaceEl, borderRadius: 14, padding: "18px 20px", border: `1px solid ${C.divider}` }}>
            <SecHdr icon={ClipboardList} label="Rapport & observations" color={C.textMuted} />
            <FTextarea label="Rapport / Observations finales" name="rapport_final" value={form.rapport_final} onChange={handleChange} placeholder="Bilan de la réalisation, points d'amélioration…" rows={4} />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, paddingTop: 6, borderTop: `1px solid ${C.divider}` }}>
            <button className="ent-btn-sec" onClick={onClose} style={{ flex: 1 }}><X size={13} /> Annuler</button>
            <button className="ent-btn-pri" onClick={handleSubmit} disabled={loading} style={{ flex: 2 }}>
              {loading ? <><Loader2 size={14} className="ent-spin" /> Enregistrement…</> : isEdit ? <><CheckCircle2 size={14} /> Enregistrer</> : <><Plus size={14} /> Créer le plan</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   MODAL AJOUT MODULE
═══════════════════════════════════════════════════════════════════ */
const ModuleFormModal = ({ planId, module, onClose, onSaved }) => {
  const isEdit = Boolean(module?.id);
  const [form, setForm]     = useState(isEdit ? {
    intitule_module: module.intitule_module || "", contenu: module.contenu || "",
    duree_heures: module.duree_heures ?? "", formateur: module.formateur || "",
    lieu: module.lieu || "", date_debut_prevue: module.date_debut_prevue || "",
    date_fin_prevue: module.date_fin_prevue || "", date_realisation: module.date_realisation || "",
    statut: module.statut || "planifiee", nb_hommes_module: module.nb_hommes_module ?? 0,
    nb_femmes_module: module.nb_femmes_module ?? 0, observations: module.observations || "",
  } : {
    intitule_module: "", contenu: "", duree_heures: "", formateur: "",
    lieu: "", date_debut_prevue: "", date_fin_prevue: "", date_realisation: "",
    statut: "planifiee", nb_hommes_module: 0, nb_femmes_module: 0, observations: "",
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const API_MOD = (CONFIG.BASE_URL || "") + "/api/modules-formation/";

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  }, []);

  const handleSubmit = async () => {
    if (!form.intitule_module.trim()) { setErrors({ intitule_module: "Requis" }); return; }
    setLoading(true);
    const payload = {
      ...form,
      entreprise_formation: planId,
      duree_heures:     form.duree_heures     ? Number(form.duree_heures)     : null,
      nb_hommes_module: Number(form.nb_hommes_module) || 0,
      nb_femmes_module: Number(form.nb_femmes_module) || 0,
      date_debut_prevue:  form.date_debut_prevue  || null,
      date_fin_prevue:    form.date_fin_prevue    || null,
      date_realisation:   form.date_realisation   || null,
      contenu:    form.contenu    || null,
      formateur:  form.formateur  || null,
      lieu:       form.lieu       || null,
      observations: form.observations || null,
    };
    try {
      let res;
      if (isEdit) {
        res = await axios.patch(`${API_MOD}${module.id}/`, payload, { headers: authHeader() });
      } else {
        res = await axios.post(`${API_BASE}${planId}/add-module/`, payload, { headers: authHeader() });
      }
      onSaved(res.data);
    } catch (err) {
      const d = err.response?.data;
      if (d && typeof d === "object") {
        const mapped = {};
        Object.entries(d).forEach(([k, v]) => { mapped[k] = Array.isArray(v) ? v[0] : String(v); });
        setErrors(mapped);
      } else {
        setErrors({ intitule_module: "Erreur serveur." });
      }
    } finally { setLoading(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center", padding: "72px 16px 16px" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(6,16,42,.65)", backdropFilter: "blur(14px)" }} onClick={onClose} />
      <div className="ent-modal" style={{ position: "relative", width: "100%", maxWidth: 680, maxHeight: "calc(100vh - 88px)", overflowY: "auto", background: C.surface, borderRadius: 20, boxShadow: `0 32px 80px ${C.shadowMd}` }}>
        <div style={{ height: 3, background: `linear-gradient(90deg,${C.violet},${C.blue})` }} />
        <div style={{ padding: "20px 26px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${C.violet}12`, border: `1.5px solid ${C.violet}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Layers size={17} color={C.violet} />
            </div>
            <div>
              <h3 className="ent-serif" style={{ fontSize: 17, fontWeight: 700, color: C.textPri }}>{isEdit ? "Modifier le module" : "Ajouter un module"}</h3>
              <p style={{ fontSize: 11, color: C.textMuted }}>Plan de formation — contenu pédagogique</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: C.surfaceEl, border: `1px solid ${C.divider}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={13} color={C.textMuted} />
          </button>
        </div>
        <div style={{ padding: "18px 26px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: C.surfaceEl, borderRadius: 12, padding: "16px 18px", border: `1px solid ${C.divider}` }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ gridColumn: "1/-1" }}>
                <FInput label="Intitulé du module" name="intitule_module" required value={form.intitule_module} onChange={handleChange} error={errors.intitule_module} placeholder="Ex: Module 1 — Réseaux informatiques" />
              </div>
              <FInput label="Formateur" name="formateur" value={form.formateur} onChange={handleChange} placeholder="Ex: Dr. Kouyaté" />
              <FInput label="Lieu" name="lieu" value={form.lieu} onChange={handleChange} placeholder="Ex: Salle A, Conakry" />
              <FInput label="Durée (heures)" name="duree_heures" type="number" value={form.duree_heures} onChange={handleChange} placeholder="0" />
              <FSelect label="Statut" name="statut" value={form.statut} onChange={handleChange} options={STATUTS.map((s) => ({ v: s.v, l: s.l }))} />
              <FInput label="Début prévu"       name="date_debut_prevue"  type="date" value={form.date_debut_prevue}  onChange={handleChange} />
              <FInput label="Fin prévue"         name="date_fin_prevue"    type="date" value={form.date_fin_prevue}    onChange={handleChange} />
              <FInput label="Date de réalisation" name="date_realisation"  type="date" value={form.date_realisation}   onChange={handleChange} />
              <FInput label="Hommes (module)" name="nb_hommes_module" type="number" value={form.nb_hommes_module} onChange={handleChange} placeholder="0" />
              <FInput label="Femmes (module)" name="nb_femmes_module" type="number" value={form.nb_femmes_module} onChange={handleChange} placeholder="0" />
              <div style={{ gridColumn: "1/-1" }}>
                <FTextarea label="Contenu / Programme" name="contenu" value={form.contenu} onChange={handleChange} placeholder="Décrire le contenu du module…" rows={3} />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <FTextarea label="Observations" name="observations" value={form.observations} onChange={handleChange} placeholder="Notes du formateur…" rows={2} />
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, borderTop: `1px solid ${C.divider}`, paddingTop: 10 }}>
            <button className="ent-btn-sec" onClick={onClose} style={{ flex: 1 }}><X size={12} /> Annuler</button>
            <button className="ent-btn-pri" onClick={handleSubmit} disabled={loading} style={{ flex: 2 }}>
              {loading ? <><Loader2 size={13} className="ent-spin" /> Enregistrement…</> : isEdit ? <><CheckCircle2 size={13} /> Enregistrer</> : <><Plus size={13} /> Ajouter le module</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   MODAL SUPPRESSION
═══════════════════════════════════════════════════════════════════ */
const DeleteModal = ({ label, onClose, onConfirm, loading }) => (
  <div style={{ position: "fixed", inset: 0, zIndex: 950, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
    <div style={{ position: "absolute", inset: 0, background: "rgba(6,16,42,.65)", backdropFilter: "blur(14px)" }} onClick={onClose} />
    <div className="ent-modal" style={{ position: "relative", width: "100%", maxWidth: 400, background: C.surface, borderRadius: 20, overflow: "hidden", boxShadow: `0 32px 80px ${C.shadowMd}` }}>
      <div style={{ height: 3, background: C.danger }} />
      <div style={{ padding: "26px 28px 24px", textAlign: "center" }}>
        <div style={{ width: 52, height: 52, borderRadius: 15, background: `${C.danger}12`, border: `1.5px solid ${C.danger}25`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
          <Trash2 size={22} color={C.danger} />
        </div>
        <h3 className="ent-serif" style={{ fontSize: 18, fontWeight: 700, color: C.textPri, marginBottom: 8 }}>Supprimer ce plan ?</h3>
        <p style={{ fontSize: 13, color: C.textSub, marginBottom: 4 }}>Suppression définitive de</p>
        <p style={{ fontSize: 14, fontWeight: 700, color: C.textPri, marginBottom: 16 }}>{label}</p>
        <p style={{ fontSize: 11.5, color: C.textMuted, background: C.dangerPale, borderRadius: 9, padding: "8px 14px", marginBottom: 20 }}>⚠️ Action irréversible — tous les modules seront supprimés.</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="ent-btn-sec" onClick={onClose} style={{ flex: 1 }}><X size={13} /> Annuler</button>
          <button className="ent-btn-danger" onClick={onConfirm} disabled={loading} style={{ flex: 1, justifyContent: "center" }}>
            {loading ? <Loader2 size={13} className="ent-spin" /> : <Trash2 size={13} />}
            {loading ? "Suppression…" : "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   MODAL DÉTAIL — vue complète avec onglets
═══════════════════════════════════════════════════════════════════ */
const DetailModal = ({ item, onClose, onEdit, onNavigateEvaluation }) => {
  const [activeTab, setActiveTab] = useState("info");
  const [modules,   setModules]   = useState(item.modules || []);
  const [loadMod,   setLoadMod]   = useState(false);
  const [showModForm, setShowModForm] = useState(false);
  const [editModule,  setEditModule]  = useState(null);

  const reloadModules = async () => {
    setLoadMod(true);
    try {
      const res = await axios.get(`${API_BASE}${item.id}/modules/`, { headers: authHeader() });
      setModules(res.data.modules || []);
    } catch {}
    finally { setLoadMod(false); }
  };

  useEffect(() => {
    if (activeTab === "modules") reloadModules();
  }, [activeTab]);

  const s = getStatut(item.statut_realisation);
  const SI = s.icon;

  const DR = ({ label, value, node }) => (
    <div className="ent-detail-row">
      <span className="ent-detail-label">{label}</span>
      {node ? <div className="ent-detail-val">{node}</div> : <span className="ent-detail-val">{value || "—"}</span>}
    </div>
  );

  const tabs = [
    { id: "info",    label: "Informations",            icon: ClipboardList },
    { id: "modules", label: `Modules (${modules.length})`, icon: Layers },
  ];

  const totalPrevus  = (item.nb_hommes || 0) + (item.nb_femmes || 0);
  const totalFormes  = (item.nb_formes_hommes || 0) + (item.nb_formes_femmes || 0);
  const tauxRealise  = totalPrevus > 0 ? Math.round((totalFormes / totalPrevus) * 100) : 0;

  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: "72px 16px 16px" }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(6,16,42,.6)", backdropFilter: "blur(16px)" }} onClick={onClose} />
        <div className="ent-modal" style={{ position: "relative", width: "100%", maxWidth: 860, maxHeight: "calc(100vh - 90px)", overflowY: "auto", background: C.surface, borderRadius: 24, boxShadow: `0 40px 100px rgba(6,16,42,.22)` }}>
          <Tri h={4} />
          {/* Header */}
          <div style={{ padding: "22px 28px 0", background: `linear-gradient(180deg,${C.surfaceEl},${C.surface})`, borderBottom: `1px solid ${C.divider}` }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 52, height: 52, borderRadius: 15, flexShrink: 0, background: `${C.blue}10`, border: `1.5px solid ${C.blue}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Building2 size={22} color={C.blue} />
                </div>
                <div>
                  <h2 className="ent-serif" style={{ fontSize: 21, fontWeight: 700, color: C.textPri, letterSpacing: "-.4px", lineHeight: 1.2 }}>{item.nom_entreprise}</h2>
                  <p style={{ fontSize: 13, color: C.textMuted, marginTop: 3 }}>{item.intitule_formation}</p>
                  <div style={{ display: "flex", gap: 7, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
                    <StatutBadge statut={item.statut_realisation} />
                    <span style={{ fontSize: 11, color: C.blue, background: `${C.blue}10`, padding: "3px 9px", borderRadius: 6, border: `1px solid ${C.blue}20`, fontWeight: 800, fontFamily: "monospace" }}>
                      {item.identifiant_unique}
                    </span>
                    {item.antenne && (
                      <span style={{ fontSize: 11, color: C.teal, background: `${C.teal}10`, padding: "3px 9px", borderRadius: 6, border: `1px solid ${C.teal}20`, fontWeight: 700 }}>
                        <MapPinned size={9} style={{ marginRight: 4 }} />{ANTENNE_LABEL(item.antenne)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, background: C.surfaceEl, border: `1px solid ${C.divider}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                <X size={15} color={C.textMuted} />
              </button>
            </div>

            {/* KPI rapide */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
              {[
                { label: "Prévus", value: totalPrevus, icon: Users, color: C.blue },
                { label: "Formés", value: totalFormes, icon: UserCheck, color: C.green },
                { label: "Taux", value: `${tauxRealise}%`, icon: BarChart3, color: tauxRealise >= 80 ? C.green : tauxRealise >= 50 ? C.gold : C.danger },
                { label: "Modules", value: modules.length, icon: Layers, color: C.violet },
              ].map((k, i) => {
                const KI = k.icon;
                return (
                  <div key={i} style={{ background: `${k.color}08`, borderRadius: 12, padding: "10px 12px", border: `1px solid ${k.color}20`, textAlign: "center" }}>
                    <KI size={14} color={k.color} style={{ marginBottom: 4 }} />
                    <p className="ent-serif" style={{ fontSize: 20, fontWeight: 700, color: k.color, lineHeight: 1 }}>{k.value}</p>
                    <p style={{ fontSize: 10.5, color: C.textMuted, marginTop: 2 }}>{k.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 2 }}>
              {tabs.map((tab) => {
                const TI = tab.icon; const active = activeTab === tab.id;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="ent-tab-btn"
                    style={{ color: active ? C.textPri : C.textMuted, background: active ? C.surface : "transparent", borderBottom: active ? `2px solid ${C.blue}` : "2px solid transparent" }}>
                    <TI size={13} />{tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Corps */}
          <div style={{ padding: "22px 28px", minHeight: 280 }}>
            {activeTab === "info" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Infos entreprise */}
                <div style={{ background: C.surfaceEl, borderRadius: 14, padding: "4px 18px", border: `1px solid ${C.divider}` }}>
                  <DR label="Entreprise"        value={item.nom_entreprise} />
                  <DR label="Secteur"            value={item.secteur_activite} />
                  <DR label="Contact RH"         value={item.contact_rh} />
                  <DR label="Téléphone"          value={item.telephone_entreprise} />
                  <DR label="Email"              value={item.email_entreprise} />
                  <DR label="Adresse"            value={item.adresse_entreprise} />
                  <DR label="Antenne ONFPP"      value={item.antenne_display || ANTENNE_LABEL(item.antenne)} />
                </div>
                {/* Infos formation */}
                <div style={{ background: C.surfaceEl, borderRadius: 14, padding: "4px 18px", border: `1px solid ${C.divider}` }}>
                  <DR label="Formation"          value={item.intitule_formation} />
                  <DR label="Objectifs"          value={item.objectifs} />
                  <DR label="Statut"             node={<StatutBadge statut={item.statut_realisation} />} />
                  <DR label="Date soumission"    value={fmtDL(item.date_soumission)} />
                  <DR label="Début prévu"        value={fmtDL(item.date_debut_prevue)} />
                  <DR label="Fin prévue"         value={fmtDL(item.date_fin_prevue)} />
                  <DR label="Date réalisation"   value={fmtDL(item.date_realisation)} />
                </div>
                {/* Effectifs */}
                <div style={{ background: C.surfaceEl, borderRadius: 14, padding: "4px 18px", border: `1px solid ${C.divider}` }}>
                  <DR label="Hommes prévus"      value={item.nb_hommes} />
                  <DR label="Femmes prévues"     value={item.nb_femmes} />
                  <DR label="Total prévu"        node={<span style={{ fontWeight: 800, color: C.blue, fontSize: 15 }}>{totalPrevus}</span>} />
                  <DR label="Hommes formés"      value={item.nb_formes_hommes} />
                  <DR label="Femmes formées"     value={item.nb_formes_femmes} />
                  <DR label="Total formés"       node={
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontWeight: 800, color: C.green, fontSize: 15 }}>{totalFormes}</span>
                      {totalPrevus > 0 && (
                        <div style={{ flex: 1, height: 6, borderRadius: 3, background: C.surfaceEl, overflow: "hidden", maxWidth: 120 }}>
                          <div className="ent-bar" style={{ "--bw": `${tauxRealise}%`, height: "100%", background: tauxRealise >= 80 ? C.green : tauxRealise >= 50 ? C.gold : C.danger, borderRadius: 3 }} />
                        </div>
                      )}
                      <span style={{ fontSize: 12, fontWeight: 700, color: tauxRealise >= 80 ? C.green : tauxRealise >= 50 ? C.gold : C.danger }}>{tauxRealise}%</span>
                    </div>
                  } />
                </div>
                {/* Plan de formation */}
                {(item.plan_formation_url || item.plan_formation_nom) && (
                  <div style={{ background: `${C.gold}08`, borderRadius: 14, padding: "14px 18px", border: `1px solid ${C.gold}25`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: C.goldPale, border: `1px solid ${C.gold}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <FileText size={16} color={C.gold} />
                      </div>
                      <div>
                        <p style={{ fontSize: 12.5, fontWeight: 700, color: C.textPri }}>{item.plan_formation_nom || "Plan de formation"}</p>
                        <p style={{ fontSize: 11, color: C.textMuted }}>Document joint</p>
                      </div>
                    </div>
                    {item.plan_formation_url && (
                      <a href={item.plan_formation_url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                        <button className="ent-btn-sec" style={{ fontSize: 12 }}><ExternalLink size={12} /> Ouvrir</button>
                      </a>
                    )}
                  </div>
                )}
                {/* Rapport */}
                {item.rapport_final && (
                  <div style={{ background: C.surfaceEl, borderRadius: 14, padding: "14px 18px", border: `1px solid ${C.divider}` }}>
                    <p style={{ fontSize: 11, fontWeight: 800, color: C.textMuted, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>Rapport final</p>
                    <p style={{ fontSize: 13, color: C.textPri, lineHeight: 1.6 }}>{item.rapport_final}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "modules" && (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <p className="ent-serif" style={{ fontSize: 15, fontWeight: 700, color: C.textPri }}>
                    {modules.length} module{modules.length > 1 ? "s" : ""} dans ce plan
                  </p>
                  <button className="ent-btn-pri" onClick={() => setShowModForm(true)} style={{ padding: "8px 16px", fontSize: 12 }}>
                    <Plus size={13} /> Ajouter un module
                  </button>
                </div>
                {loadMod ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                    <Loader2 size={24} color={C.blue} className="ent-spin" />
                  </div>
                ) : modules.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "48px 0" }}>
                    <Layers size={32} color={C.textMuted} style={{ margin: "0 auto 12px" }} />
                    <p className="ent-serif" style={{ fontSize: 15, color: C.textSub }}>Aucun module défini</p>
                    <p style={{ fontSize: 12, color: C.textMuted, marginTop: 6 }}>Ajoutez les modules du plan de formation</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {modules.map((m, i) => {
                      const ms = getStatut(m.statut);
                      const MSI = ms.icon;
                      return (
                        <div key={m.id} className="ent-module-card">
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flex: 1, minWidth: 0 }}>
                              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${C.violet}12`, border: `1.5px solid ${C.violet}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <span className="ent-serif" style={{ fontSize: 13, fontWeight: 700, color: C.violet, fontStyle: "italic" }}>{i + 1}</span>
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: 13.5, fontWeight: 700, color: C.textPri, marginBottom: 4, lineHeight: 1.3 }}>{m.intitule_module}</p>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                                  <span className="ent-badge" style={{ background: ms.bg, color: ms.color, border: `1px solid ${ms.border}` }}>
                                    <MSI size={9} /> {ms.l}
                                  </span>
                                  {m.duree_heures && (
                                    <span style={{ fontSize: 10.5, color: C.textMuted, background: C.surfaceEl, padding: "2px 8px", borderRadius: 5, border: `1px solid ${C.divider}`, fontWeight: 700 }}>
                                      ⏱ {m.duree_heures}h
                                    </span>
                                  )}
                                  {m.formateur && (
                                    <span style={{ fontSize: 10.5, color: C.textMuted }}>👤 {m.formateur}</span>
                                  )}
                                </div>
                                <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                                  {m.date_debut_prevue && (
                                    <span style={{ fontSize: 11, color: C.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
                                      <Calendar size={10} /> Prévu : {fmtD(m.date_debut_prevue)} → {fmtD(m.date_fin_prevue)}
                                    </span>
                                  )}
                                  {m.date_realisation && (
                                    <span style={{ fontSize: 11, color: C.green, display: "flex", alignItems: "center", gap: 4 }}>
                                      <CheckCircle2 size={10} /> Réalisé : {fmtD(m.date_realisation)}
                                    </span>
                                  )}
                                </div>
                                {(m.nb_hommes_module > 0 || m.nb_femmes_module > 0) && (
                                  <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                                    <span style={{ fontSize: 11, color: C.teal, background: `${C.teal}10`, padding: "2px 8px", borderRadius: 5, fontWeight: 700 }}>
                                      👨 {m.nb_hommes_module}H + 👩 {m.nb_femmes_module}F = {m.nb_total_module} formé{m.nb_total_module > 1 ? "s" : ""}
                                    </span>
                                  </div>
                                )}
                                {m.contenu && (
                                  <p style={{ fontSize: 12, color: C.textMuted, marginTop: 6, lineHeight: 1.5 }}>{m.contenu}</p>
                                )}
                              </div>
                            </div>
                            <button className="ent-act-btn" onClick={() => setEditModule(m)}
                              style={{ background: `${C.gold}08`, borderColor: `${C.gold}20`, flexShrink: 0 }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = `${C.gold}18`; e.currentTarget.style.borderColor = C.gold; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = `${C.gold}08`; e.currentTarget.style.borderColor = `${C.gold}20`; }}>
                              <Pencil size={12} color={C.gold} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: "14px 28px 22px", borderTop: `1px solid ${C.divider}`, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="ent-btn-sec" onClick={onClose}><X size={13} /> Fermer</button>
              <button className="ent-btn-sec" onClick={() => onEdit(item)}
                style={{ color: C.gold, borderColor: `${C.gold}30`, background: `${C.gold}08` }}
                onMouseEnter={(e) => { e.currentTarget.style.background = C.gold; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = `${C.gold}08`; e.currentTarget.style.color = C.gold; }}>
                <Pencil size={13} /> Modifier
              </button>
            </div>
            {/* Bouton Évaluation */}
            <button className="ent-btn-pri"
              onClick={() => { onClose(); onNavigateEvaluation(item); }}
              style={{ background: `linear-gradient(135deg,${C.green},${C.teal})`, boxShadow: `0 4px 18px rgba(4,122,90,.28)` }}>
              <BarChart3 size={14} /> Évaluation <ArrowUpRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {showModForm && (
        <ModuleFormModal
          planId={item.id}
          onClose={() => setShowModForm(false)}
          onSaved={(newMod) => { setModules((p) => [...p, newMod]); setShowModForm(false); }}
        />
      )}
      {editModule && (
        <ModuleFormModal
          planId={item.id}
          module={editModule}
          onClose={() => setEditModule(null)}
          onSaved={(updated) => {
            setModules((p) => p.map((m) => m.id === updated.id ? updated : m));
            setEditModule(null);
          }}
        />
      )}
    </>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL — Entreprise (DFC)
═══════════════════════════════════════════════════════════════════ */
const Entreprise = () => {
  const navigate = useNavigate();

  const [items,      setItems]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [filterStat, setFilterStat] = useState("tous");
  const [filterAnt,  setFilterAnt]  = useState("");
  const [page,       setPage]       = useState(1);
  const [showForm,   setShowForm]   = useState(false);
  const [editItem,   setEditItem]   = useState(null);
  const [delItem,    setDelItem]    = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [delLoading, setDelLoading] = useState(false);
  const [toast,      setToast]      = useState(null);
  const [stats,      setStats]      = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3300);
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        axios.get(API_BASE, { headers: authHeader() }),
        axios.get(`${API_BASE}stats/`, { headers: authHeader() }),
      ]);
      const data = Array.isArray(listRes.data) ? listRes.data : listRes.data.results || [];
      setItems(data);
      setStats(statsRes.data);
    } catch (err) {
      if ([401, 403].includes(err.response?.status)) {
        showToast("Session expirée", "error");
        setTimeout(() => { window.location.href = "/login"; }, 1800);
      } else {
        showToast("Impossible de charger les données", "error");
      }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSaved = (data, mode) => {
    if (mode === "create") {
      setItems((p) => [data, ...p]);
      showToast(`Plan de formation créé — ${data.identifiant_unique}`);
    } else {
      setItems((p) => p.map((it) => it.id === data.id ? data : it));
      if (detailItem?.id === data.id) setDetailItem(data);
      showToast("Plan mis à jour avec succès");
    }
    setShowForm(false);
    setEditItem(null);
    fetchAll();
  };

  const handleDelete = async () => {
    if (!delItem) return;
    setDelLoading(true);
    try {
      await axios.delete(`${API_BASE}${delItem.id}/`, { headers: authHeader() });
      setItems((p) => p.filter((it) => it.id !== delItem.id));
      showToast(`${delItem.nom_entreprise} — supprimé`);
      setDelItem(null);
      fetchAll();
    } catch { showToast("Erreur lors de la suppression", "error"); }
    finally { setDelLoading(false); }
  };

  const handleNavigateEvaluation = (item) => {
    navigate("../suiviEvaluation", {
      state: { fromEntreprise: true, entrepriseId: item.id, sessionId: item.session_evaluation },
    });
  };

  /* Filtrage */
  const filtered = items.filter((it) => {
    const q = search.toLowerCase();
    const matchS = !q || [it.nom_entreprise, it.intitule_formation, it.identifiant_unique, it.secteur_activite, it.contact_rh].some((v) => v?.toLowerCase().includes(q));
    const matchF = filterStat === "tous" || it.statut_realisation === filterStat;
    const matchA = !filterAnt || it.antenne === filterAnt;
    return matchS && matchF && matchA;
  });

  const pages     = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <style>{CSS}</style>
      <div className="ent ent-page" style={{ minHeight: "100vh", background: `radial-gradient(ellipse 100% 50% at 60% -8%, rgba(22,53,200,.06) 0%, transparent 60%), ${C.page}`, padding: "88px 28px 70px", position: "relative" }}>
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1240, margin: "0 auto" }}>

          {/* ── En-tête ── */}
          <div className="ent-in ent-d0" style={{ marginBottom: 28 }}>
            <div style={{ width: 80, marginBottom: 14 }}><Tri h={3} /></div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 12px", borderRadius: 20, background: `${C.blue}10`, border: `1px solid ${C.blue}20`, marginBottom: 10 }}>
                  <Building2 size={12} color={C.blue} />
                  <span style={{ fontSize: 11, fontWeight: 800, color: C.blue, textTransform: "uppercase", letterSpacing: ".12em" }}>DFC — Division Formation Continue</span>
                </div>
                <h1 className="ent-serif" style={{ fontSize: 33, fontWeight: 700, color: C.textPri, letterSpacing: "-.7px", lineHeight: 1.05 }}>Plans de formation entreprises</h1>
                <p style={{ fontSize: 13.5, color: C.textMuted, marginTop: 8 }}>Suivi des plans de formation soumis par les entreprises partenaires</p>
              </div>
              <div style={{ display: "flex", gap: 9 }}>
                <button className="ent-btn-sec" onClick={fetchAll}><RefreshCw size={13} /></button>
                <button className="ent-btn-pri" onClick={() => { setEditItem(null); setShowForm(true); }}>
                  <Plus size={14} /> Nouveau plan
                </button>
              </div>
            </div>
          </div>

          {/* ── KPIs ── */}
          {stats && (
            <div className="ent-in ent-d1" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 13, marginBottom: 26 }}>
              {[
                { label: "Total plans",     value: stats.total,         color: C.blue,   bg: `${C.blue}10`,  icon: ClipboardList },
                { label: "Planifiées",      value: stats.planifiees,    color: C.gold,   bg: C.goldPale,     icon: Clock         },
                { label: "En cours",        value: stats.en_cours,      color: C.blue,   bg: `${C.blue}10`,  icon: TrendingUp    },
                { label: "Réalisées",       value: stats.realisees,     color: C.green,  bg: C.greenPale,    icon: CheckCircle2  },
                { label: "Total formés",    value: stats.total_formes,  color: C.teal,   bg: C.tealPale,     icon: UserCheck     },
              ].map((s, i) => {
                const SI = s.icon;
                return (
                  <div key={i} style={{ background: C.surface, borderRadius: 16, padding: "16px 15px", border: `1px solid ${C.divider}`, boxShadow: `0 2px 14px ${C.shadow}`, position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: s.color, borderRadius: "16px 16px 0 0" }} />
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                      <SI size={15} color={s.color} />
                    </div>
                    <p className="ent-serif" style={{ fontSize: 27, fontWeight: 700, color: C.textPri, lineHeight: 1, letterSpacing: "-1px" }}>{s.value ?? 0}</p>
                    <p style={{ fontSize: 11.5, color: C.textMuted, marginTop: 5 }}>{s.label}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Filtres ── */}
          <div className="ent-in ent-d2" style={{ background: C.surface, border: `1px solid ${C.divider}`, borderRadius: 16, padding: "13px 18px", marginBottom: 18, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", boxShadow: `0 2px 14px ${C.shadow}` }}>
            <div style={{ position: "relative", flex: "1 1 260px", minWidth: 0 }}>
              <Search size={14} color={C.textMuted} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input className="ent-input" placeholder="Entreprise, formation, identifiant…" value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ paddingLeft: 38 }} />
            </div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {[{ v: "tous", l: "Tous" }, ...STATUTS.map((s) => ({ v: s.v, l: s.l }))].map((f) => {
                const fs = getStatut(f.v);
                return (
                  <button key={f.v} onClick={() => { setFilterStat(f.v); setPage(1); }} style={{
                    padding: "6px 13px", borderRadius: 20, cursor: "pointer",
                    fontSize: 11.5, fontWeight: 700, fontFamily: "'Outfit',sans-serif",
                    border: filterStat === f.v ? `1.5px solid ${f.v === "tous" ? C.navy : fs.color}` : `1px solid ${C.divider}`,
                    background: filterStat === f.v ? `${f.v === "tous" ? C.navy : fs.color}12` : C.surfaceEl,
                    color: filterStat === f.v ? (f.v === "tous" ? C.navy : fs.color) : C.textMuted,
                    transition: "all .14s",
                  }}>{f.l}</button>
                );
              })}
            </div>
            <select className="ent-input" value={filterAnt} onChange={(e) => { setFilterAnt(e.target.value); setPage(1); }}
              style={{ width: "auto", minWidth: 155 }}>
              <option value="">Toutes les antennes</option>
              {ANTENNES_LIST.map((a) => <option key={a.v} value={a.v}>{a.l}</option>)}
            </select>
            <p style={{ fontSize: 12, color: C.textMuted, flexShrink: 0 }}>
              <span style={{ fontWeight: 700, color: C.textSub }}>{filtered.length}</span> résultat{filtered.length > 1 ? "s" : ""}
            </p>
          </div>

          {/* ── Tableau ── */}
          <div className="ent-in ent-d3" style={{ background: C.surface, border: `1px solid ${C.divider}`, borderRadius: 20, boxShadow: `0 2px 18px ${C.shadow}`, overflow: "hidden" }}>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "72px 0", gap: 14 }}>
                <Loader2 size={30} color={C.blue} className="ent-spin" />
                <p style={{ fontSize: 13.5, color: C.textMuted }}>Chargement des plans…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "72px 0", gap: 12 }}>
                <div style={{ width: 60, height: 60, borderRadius: 16, background: C.surfaceEl, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Building2 size={26} color={C.textMuted} />
                </div>
                <p className="ent-serif" style={{ fontSize: 16, fontWeight: 600, color: C.textSub }}>Aucun plan trouvé</p>
                <p style={{ fontSize: 12.5, color: C.textMuted }}>{search || filterStat !== "tous" || filterAnt ? "Modifiez vos critères" : "Créez le premier plan de formation"}</p>
                {!search && filterStat === "tous" && !filterAnt && (
                  <button className="ent-btn-pri" onClick={() => setShowForm(true)} style={{ marginTop: 8 }}>
                    <Plus size={13} /> Nouveau plan
                  </button>
                )}
              </div>
            ) : (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: `linear-gradient(90deg,${C.navy}05,transparent)`, borderBottom: `1.5px solid ${C.divider}` }}>
                        {[
                          { h: "Identifiant" }, { h: "Entreprise" }, { h: "Formation" },
                          { h: "Employés" }, { h: "Soumission", hide: true }, { h: "Réalisation", hide: true },
                          { h: "Statut" }, { h: "Actions" },
                        ].map((col, i) => (
                          <th key={i} className={col.hide ? "ent-hide-sm" : ""} style={{ padding: "13px 16px", textAlign: "left", fontSize: 10, fontWeight: 800, color: C.textMuted, letterSpacing: ".12em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                            {col.h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((it, ri) => {
                        const total = (it.nb_hommes || 0) + (it.nb_femmes || 0);
                        const formes = it.nb_formes_total || ((it.nb_formes_hommes || 0) + (it.nb_formes_femmes || 0));
                        return (
                          <tr key={it.id} className="ent-tr" style={{ borderBottom: `1px solid ${C.divider}`, background: ri % 2 === 0 ? C.surface : `${C.navy}008` }}
                            onClick={() => setDetailItem(it)}>
                            {/* ID */}
                            <td style={{ padding: "13px 16px" }}>
                              <span style={{ fontSize: 11, fontWeight: 800, color: C.blue, background: `${C.blue}10`, padding: "4px 10px", borderRadius: 6, fontFamily: "monospace", border: `1px solid ${C.blue}22`, whiteSpace: "nowrap" }}>
                                {it.identifiant_unique || "—"}
                              </span>
                            </td>
                            {/* Entreprise */}
                            <td style={{ padding: "13px 16px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: `${C.blue}10`, border: `1px solid ${C.blue}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <Building2 size={15} color={C.blue} />
                                </div>
                                <div>
                                  <p style={{ fontSize: 13, fontWeight: 700, color: C.textPri, lineHeight: 1.2 }}>{it.nom_entreprise}</p>
                                  {it.secteur_activite && <p style={{ fontSize: 11, color: C.textMuted }}>{it.secteur_activite}</p>}
                                  {it.antenne && <p style={{ fontSize: 10, color: C.teal, fontWeight: 700 }}>{ANTENNE_LABEL(it.antenne)}</p>}
                                </div>
                              </div>
                            </td>
                            {/* Formation */}
                            <td style={{ padding: "13px 16px" }}>
                              <p style={{ fontSize: 12.5, fontWeight: 700, color: C.textPri, lineHeight: 1.3, maxWidth: 200 }}>{it.intitule_formation}</p>
                              {(it.nb_modules > 0) && (
                                <p style={{ fontSize: 11, color: C.violet, marginTop: 2 }}>
                                  <Layers size={9} style={{ marginRight: 3 }} />{it.nb_modules} module{it.nb_modules > 1 ? "s" : ""}
                                </p>
                              )}
                            </td>
                            {/* Employés */}
                            <td style={{ padding: "13px 16px" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <Users size={12} color={C.textMuted} />
                                  <span style={{ fontSize: 13, fontWeight: 700, color: C.textPri }}>{total}</span>
                                  <span style={{ fontSize: 10, color: C.textMuted }}>prévus</span>
                                </div>
                                {formes > 0 && (
                                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <UserCheck size={11} color={C.green} />
                                    <span style={{ fontSize: 12, fontWeight: 700, color: C.green }}>{formes}</span>
                                    <span style={{ fontSize: 10, color: C.textMuted }}>formés</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            {/* Date soumission */}
                            <td className="ent-hide-sm" style={{ padding: "13px 16px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <Calendar size={11} color={C.textMuted} />
                                <span style={{ fontSize: 12, color: C.textSub }}>{fmtD(it.date_soumission)}</span>
                              </div>
                            </td>
                            {/* Date réalisation */}
                            <td className="ent-hide-sm" style={{ padding: "13px 16px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <Calendar size={11} color={it.date_realisation ? C.green : C.textMuted} />
                                <span style={{ fontSize: 12, color: it.date_realisation ? C.green : C.textMuted, fontWeight: it.date_realisation ? 700 : 400 }}>
                                  {it.date_realisation ? fmtD(it.date_realisation) : "—"}
                                </span>
                              </div>
                            </td>
                            {/* Statut */}
                            <td style={{ padding: "13px 16px" }}>
                              <StatutBadge statut={it.statut_realisation} />
                              {it.plan_formation_nom && (
                                <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                                  <FileText size={9} color={C.gold} />
                                  <span style={{ fontSize: 10, color: C.gold, fontWeight: 700 }}>Plan joint</span>
                                </div>
                              )}
                            </td>
                            {/* Actions */}
                            <td style={{ padding: "13px 16px" }} onClick={(e) => e.stopPropagation()}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <button className="ent-act-btn" title="Voir"
                                  style={{ background: `${C.blue}08`, borderColor: `${C.blue}20` }}
                                  onClick={(e) => { e.stopPropagation(); setDetailItem(it); }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = `${C.blue}18`; e.currentTarget.style.borderColor = C.blue; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = `${C.blue}08`; e.currentTarget.style.borderColor = `${C.blue}20`; }}>
                                  <Eye size={13} color={C.blue} />
                                </button>
                                <button className="ent-act-btn" title="Modifier"
                                  style={{ background: `${C.gold}08`, borderColor: `${C.gold}20` }}
                                  onClick={(e) => { e.stopPropagation(); setEditItem(it); setShowForm(true); }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = `${C.gold}18`; e.currentTarget.style.borderColor = C.gold; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = `${C.gold}08`; e.currentTarget.style.borderColor = `${C.gold}20`; }}>
                                  <Pencil size={13} color={C.gold} />
                                </button>
                                <button className="ent-act-btn" title="Supprimer"
                                  style={{ background: `${C.danger}08`, borderColor: `${C.danger}20` }}
                                  onClick={(e) => { e.stopPropagation(); setDelItem(it); }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = `${C.danger}18`; e.currentTarget.style.borderColor = C.danger; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = `${C.danger}08`; e.currentTarget.style.borderColor = `${C.danger}20`; }}>
                                  <Trash2 size={13} color={C.danger} />
                                </button>
                                <button className="ent-act-btn" title="Évaluation"
                                  style={{ background: `${C.green}08`, borderColor: `${C.green}20` }}
                                  onClick={(e) => { e.stopPropagation(); handleNavigateEvaluation(it); }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = `${C.green}18`; e.currentTarget.style.borderColor = C.green; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = `${C.green}08`; e.currentTarget.style.borderColor = `${C.green}20`; }}>
                                  <BarChart3 size={13} color={C.green} />
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
                {pages > 1 && (
                  <div style={{ padding: "13px 20px", borderTop: `1px solid ${C.divider}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                    <p style={{ fontSize: 12, color: C.textMuted }}>
                      <span style={{ fontWeight: 700, color: C.textSub }}>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</span> / <span style={{ fontWeight: 700, color: C.textSub }}>{filtered.length}</span>
                    </p>
                    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                      <button className="ent-pg" onClick={() => setPage((p) => p - 1)} disabled={page === 1}><ChevronLeft size={13} /></button>
                      {Array.from({ length: pages }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 1)
                        .map((p, i, arr) => (
                          <React.Fragment key={p}>
                            {i > 0 && arr[i - 1] !== p - 1 && <span style={{ color: C.textMuted, fontSize: 12, padding: "0 2px" }}>…</span>}
                            <button className={`ent-pg${p === page ? " active" : ""}`} onClick={() => setPage(p)}>{p}</button>
                          </React.Fragment>
                        ))}
                      <button className="ent-pg" onClick={() => setPage((p) => p + 1)} disabled={page === pages}><ChevronRight size={13} /></button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Légende statuts */}
          <div className="ent-in" style={{ marginTop: 14, padding: "12px 18px", background: `${C.navy}03`, borderRadius: 12, border: `1px solid ${C.divider}`, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <Building2 size={13} color={C.textMuted} />
            {STATUTS.map((s) => {
              const SI = s.icon;
              return (
                <div key={s.v} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <SI size={11} color={s.color} />
                  <span style={{ fontSize: 11, color: C.textMuted }}><strong style={{ color: s.color }}>{s.l}</strong></span>
                </div>
              );
            })}
            <span style={{ fontSize: 11, color: C.textMuted, marginLeft: "auto" }}>
              Cliquez sur ▶ <BarChart3 size={10} style={{ display: "inline" }} /> pour accéder à l'évaluation
            </span>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showForm && (
        <EntrepriseFormModal
          item={editItem}
          onClose={() => { setShowForm(false); setEditItem(null); }}
          onSaved={handleSaved}
        />
      )}
      {delItem && (
        <DeleteModal
          label={`${delItem.nom_entreprise} — ${delItem.intitule_formation}`}
          onClose={() => setDelItem(null)}
          onConfirm={handleDelete}
          loading={delLoading}
        />
      )}
      {detailItem && !showForm && (
        <DetailModal
          item={detailItem}
          onClose={() => setDetailItem(null)}
          onEdit={(it) => { setEditItem(it); setDetailItem(null); setShowForm(true); }}
          onNavigateEvaluation={handleNavigateEvaluation}
        />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </>
  );
};

export default Entreprise;