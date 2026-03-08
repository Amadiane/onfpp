import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import CONFIG from "../../config/config.js";
import {
  User, Users, Search, ChevronLeft, ChevronRight, RefreshCw, Loader2,
  MapPin, Plus, X, Eye, Pencil, Trash2, CheckCircle2, AlertTriangle,
  Star, Building2, Phone, Mail, BookOpen, Briefcase, Award,
  ToggleLeft, ToggleRight, ExternalLink, FileText,
  ClipboardList, UserCheck, Camera, Download,
  GraduationCap, Repeat2,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   PALETTE
═══════════════════════════════════════════════════════════════════ */
const C = {
  page:"#F8F9FD", surface:"#FFFFFF", surfaceEl:"#F4F7FF",
  navy:"#06102A", navyMid:"#0C1D5F", blue:"#1635C8", blueViv:"#2447E0",
  iceBlue:"#D0D9FF", textPri:"#06102A", textSub:"#3A4F8C", textMuted:"#8497C8",
  gold:"#D4920A", goldLight:"#F5B020", goldPale:"#FFF8E7",
  green:"#047A5A", greenLight:"#0DA575", greenPale:"#E8FBF5",
  danger:"#C81B1B", dangerPale:"#FEF2F2",
  orange:"#C05C0A", orangePale:"#FFF3E8",
  teal:"#0E7490", tealPale:"#F0FDFF",
  violet:"#6A24D4", violetPale:"#F3EDFF",
  divider:"#E8EDFC", shadow:"rgba(6,16,42,0.07)", shadowMd:"rgba(6,16,42,0.14)",
};

/* ═══════════════════════════════════════════════════════════════════
   DOMAINES & SPÉCIALITÉS — même logique que Inscription
═══════════════════════════════════════════════════════════════════ */
const DOMAINES = [
  {
    v: "btp", l: "BTP — Bâtiment & Travaux Publics",
    metiers: [
      "Maçonnerie","Carrelage","Peinture bâtiment","Plomberie","Électricité bâtiment",
      "Menuiserie bois","Menuiserie métallique","Ferronnerie","Couverture / Toiture",
      "Climatisation / Froid","Topographie","Conduite d'engins","Gros œuvre",
    ],
  },
  {
    v: "agriculture", l: "Agriculture & Élevage",
    metiers: [
      "Élevage bovin","Élevage avicole","Élevage porcin","Agriculture vivrière",
      "Maraîchage","Arboriculture fruitière","Pisciculture","Apiculture",
      "Transformation agro-alimentaire",
    ],
  },
  {
    v: "numerique", l: "Numérique & Technologies",
    metiers: [
      "Développement web","Développement mobile","Réseaux & Télécoms",
      "Cybersécurité","Infographie / Design","Maintenance informatique",
      "Data / IA","Administration systèmes",
    ],
  },
  {
    v: "sante", l: "Santé & Social",
    metiers: [
      "Soins infirmiers","Sage-femme","Aide-soignant","Pharmacie",
      "Nutrition","Travail social","Éducation spécialisée",
    ],
  },
  {
    v: "commerce", l: "Commerce & Gestion",
    metiers: [
      "Comptabilité","Gestion de projet","Marketing","Commerce international",
      "Logistique","Ressources humaines","Finance / Banque",
    ],
  },
  {
    v: "artisanat", l: "Artisanat & Textile",
    metiers: [
      "Couture / Confection","Broderie","Tissage","Coiffure",
      "Esthétique","Tannerie / Maroquinerie","Poterie / Céramique",
    ],
  },
  {
    v: "tourisme", l: "Tourisme & Hôtellerie",
    metiers: [
      "Cuisine / Restauration","Pâtisserie","Service en salle","Hôtellerie",
      "Guide touristique",
    ],
  },
  { v: "autres", l: "Autre domaine", metiers: [] },
];

const getDomaine = (v) => DOMAINES.find((d) => d.v === v) || null;

/* ═══════════════════════════════════════════════════════════════════
   ANTENNES
═══════════════════════════════════════════════════════════════════ */
const ANTENNES = [
  {v:"conakry",l:"Conakry"},{v:"forecariah",l:"Forecariah"},{v:"boke",l:"Boké"},
  {v:"kindia",l:"Kindia"},{v:"labe",l:"Labé"},{v:"mamou",l:"Mamou"},
  {v:"faranah",l:"Faranah"},{v:"kankan",l:"Kankan"},
  {v:"siguiri",l:"Siguiri"},{v:"nzerekore",l:"N'Zérékoré"},
];
const antenneLabel = (v) => ANTENNES.find((a) => a.v === v)?.l || v || "—";
/* ═══════════════════════════════════════════════════════════════════
   TYPES DE FORMATION ENSEIGNÉE
   Un formateur peut intervenir en DFC, DAP, ou les deux
═══════════════════════════════════════════════════════════════════ */
const TYPES_FORMATION = [
  { v:"continue",     l:"Formation Continue (DFC)", desc:"Salariés / adultes en activité", color:"#1635C8", bg:"#1635C808", icon:"🎓" },
  { v:"apprentissage",l:"Formation par Apprentissage (DAP)", desc:"Alternance école/entreprise — jeunes", color:"#047A5A", bg:"#E8FBF5", icon:"🔧" },
];



/* ═══════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════ */
const PAGE_SIZE = 10;

const authHeader = () => {
  const t = localStorage.getItem("access")||localStorage.getItem("access_token")||localStorage.getItem("token");
  return { "Content-Type":"application/json", ...(t?{Authorization:`Bearer ${t}`}:{}) };
};

const API_BASE = (CONFIG.BASE_URL || "") + "/api/formateurs/";

/*
  ╔══════════════════════════════════════════════════════╗
  ║  DÉCOMPOSITION DE L'IDENTIFIANT FORMATEUR           ║
  ║  FORM - TYPE - ANTENNE - ANNÉE - N°                 ║
  ║  Ex: FORM-IND-CKY-2026-0001                        ║
  ║  • FORM  = Formateur (préfixe)                     ║
  ║  • IND   = INDividuel  |  ORG = ORGanisme          ║
  ║  • CKY   = code antenne (ex: Conakry)              ║
  ║  • 2026  = année d'enregistrement                  ║
  ║  • 0001  = numéro séquentiel auto                  ║
  ╚══════════════════════════════════════════════════════╝
*/
const ANTENNE_CODES = {
  conakry:"CKY",forecariah:"FRC",boke:"BOK",kindia:"KND",
  labe:"LBE",mamou:"MMU",faranah:"FRN",kankan:"KNK",
  siguiri:"SGR",nzerekore:"NZR",
};

/* Export Excel (CSV) */
const exportExcel = (data) => {
  const cols = ["Identifiant","Prénom","Nom","Type","Cabinet","Domaine","Spécialité","Types formation","Téléphone","Email","Adresse","Antenne","Expérience (ans)","Diplôme","Disponible","Note manuelle","Note évaluation"];
  const rows = data.map((it, i) => {
    const dom = getDomaine(it.domaine);
    return [
      it.identifiant_unique || buildFormateurId(it, i),
      it.prenom, it.nom,
      it.type === "organisme" ? "Organisme" : "Individuel",
      it.nom_cabinet || "",
      dom?.l || it.domaine_autre || it.domaine || "",
      it.specialite || it.domaine_autre || "",
      (it.types_formation || []).join(", "),
      it.telephone, it.email || "", it.adresse || "",
      antenneLabel(it.antenne),
      it.experience_annees || "", it.diplome || "",
      it.disponible ? "Oui" : "Non",
      it.note_manuelle ?? "", it.note_evaluation ?? "",
    ];
  });
  const BOM = "\uFEFF";
  const csv = [cols, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g,'\'\'')}"`).join(";")).join("\n");
  const blob = new Blob([BOM + csv], { type:"text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `formateurs_onfpp_${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
};

/* Export PDF via impression navigateur */
const exportPDF = (data) => {
  const date = new Date().toLocaleDateString("fr-FR", { day:"2-digit", month:"long", year:"numeric" });
  const rows = data.map((it, i) => {
    const dom  = getDomaine(it.domaine);
    const note = it.note_evaluation ?? it.note_manuelle;
    const stars= note ? "★".repeat(Math.round(note)) + "☆".repeat(5-Math.round(note)) : "—";
    const tf   = (it.types_formation||[]).map((v)=>v==="continue"?"DFC":"DAP").join("+") || "—";
    const nc   = String(note??"-").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    return `<tr style="border-bottom:1px solid #E8EDFC;">
      <td style="padding:8px 10px;font-family:monospace;font-size:10px;color:#1635C8;font-weight:700;">${it.identifiant_unique||buildFormateurId(it,i)}</td>
      <td style="padding:8px 10px;font-weight:600;">${it.prenom} ${it.nom}</td>
      <td style="padding:8px 10px;font-size:11px;">${it.type==="organisme"?`Org.`:"Indiv."}</td>
      <td style="padding:8px 10px;font-size:11px;font-weight:700;color:#0E7490;">${tf}</td>
      <td style="padding:8px 10px;font-size:11px;">${dom?.l||it.domaine_autre||it.domaine||"—"}</td>
      <td style="padding:8px 10px;font-size:11px;">${it.telephone}</td>
      <td style="padding:8px 10px;font-size:11px;">${antenneLabel(it.antenne)}</td>
      <td style="padding:8px 10px;font-size:11px;text-align:center;color:${note>=4?"#047A5A":note>=3?"#D4920A":"#8497C8"};">${stars} ${nc}</td>
      <td style="padding:8px 10px;text-align:center;">${it.disponible?"<span style='color:#047A5A;font-weight:700;'>✓</span>":"<span style='color:#C81B1B;'>✗</span>"}</td>
    </tr>`;
  }).join("");
  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Formateurs — ONFPP</title>
  <style>
    body{font-family:Arial,sans-serif;color:#06102A;padding:24px 28px;}
    @media print{body{padding:8px 12px;}}
    h1{font-size:22px;font-weight:800;margin-bottom:4px;}
    .sub{font-size:12px;color:#8497C8;margin-bottom:18px;}
    .tri{height:4px;display:flex;border-radius:2px;overflow:hidden;width:56px;margin-bottom:10px;}
    table{width:100%;border-collapse:collapse;font-size:12px;}
    thead tr{background:#06102A;color:#fff;}
    th{padding:9px 10px;text-align:left;font-weight:700;font-size:10px;text-transform:uppercase;letter-spacing:.1em;}
    tbody tr:nth-child(even){background:#F4F7FF;}
    .footer{margin-top:16px;font-size:10px;color:#8497C8;text-align:center;border-top:1px solid #E8EDFC;padding-top:10px;}
    .stats{display:flex;gap:12px;margin-bottom:16px;}
    .stat{padding:6px 14px;border-radius:20px;font-size:11px;font-weight:700;}
  </style></head><body>
  <div class="tri"><div style="flex:1;background:#E02020;"></div><div style="flex:1;background:#D4920A;"></div><div style="flex:1;background:#047A5A;"></div></div>
  <h1>Répertoire des Formateurs — ONFPP Guinée</h1>
  <p class="sub">Exporté le ${date} · ${data.length} formateur${data.length>1?"s":""}</p>
  <div class="stats">
    <span class="stat" style="background:#E8FBF5;color:#047A5A;">${data.filter(d=>d.disponible).length} disponibles</span>
    <span class="stat" style="background:#F3EDFF;color:#6A24D4;">${data.filter(d=>d.type==="organisme").length} organismes</span>
    <span class="stat" style="background:#1635C808;color:#1635C8;">${data.filter(d=>(d.types_formation||[]).includes("continue")).length} DFC</span>
    <span class="stat" style="background:#E8FBF5;color:#047A5A;">${data.filter(d=>(d.types_formation||[]).includes("apprentissage")).length} DAP</span>
  </div>
  <table>
    <thead><tr><th>Identifiant</th><th>Formateur</th><th>Type</th><th>Formation</th><th>Domaine</th><th>Téléphone</th><th>Antenne</th><th style="text-align:center;">Note</th><th style="text-align:center;">Dispo</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">ONFPP Guinée · Document confidentiel · ${date}</div>
  <script>window.onload=()=>{window.print();}<\/script>
  </body></html>`;
  const win = window.open("","_blank");
  win.document.write(html);
  win.document.close();
};



const buildFormateurId = (f, idx) => {
  const div = f.type === "organisme" ? "ORG" : "IND";
  const ant = ANTENNE_CODES[f.antenne] || "GN";
  const year = new Date().getFullYear();
  return `FORM-${div}-${ant}-${year}-${String((idx || 0) + 1).padStart(4, "0")}`;
};

/* Rendu étoiles */
const Stars = ({ note, size = 14, interactive = false, onChange }) => {
  const [hover, setHover] = useState(0);
  const val = Math.round(note || 0);
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = interactive ? (hover || val) >= i : val >= i;
        return (
          <Star key={i} size={size}
            fill={filled ? C.gold : "none"} color={filled ? C.gold : C.divider}
            style={{ cursor: interactive ? "pointer" : "default", transition: "all .12s" }}
            onMouseEnter={() => interactive && setHover(i)}
            onMouseLeave={() => interactive && setHover(0)}
            onClick={() => interactive && onChange?.(i)}
          />
        );
      })}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   CSS
═══════════════════════════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Outfit:wght@300;400;500;600;700;800&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  .fmt{font-family:'Outfit',sans-serif;-webkit-font-smoothing:antialiased;}
  .fmt-serif{font-family:'Fraunces',serif!important;}
  .fmt-page::before{content:'';position:fixed;inset:0;pointer-events:none;z-index:0;
    background-image:radial-gradient(circle at 1px 1px,rgba(22,53,200,.042) 1px,transparent 0);
    background-size:28px 28px;}

  .fmt-input{width:100%;padding:10px 14px;border-radius:10px;
    border:1.5px solid ${C.divider};background:#fff;color:${C.textPri};
    font-family:'Outfit',sans-serif;font-size:13px;outline:none;
    transition:border-color .16s,box-shadow .16s;}
  .fmt-input:focus{border-color:${C.blue};box-shadow:0 0 0 3px rgba(22,53,200,.09);}
  .fmt-input::placeholder{color:${C.textMuted};}
  .fmt-input-err{border-color:${C.danger}!important;}
  select.fmt-input{cursor:pointer;}
  textarea.fmt-input{resize:vertical;min-height:80px;line-height:1.5;}

  .fmt-label{display:block;font-size:11.5px;font-weight:700;color:${C.textSub};
    margin-bottom:5px;letter-spacing:.02em;}
  .fmt-label-opt{font-size:10px;color:${C.textMuted};font-weight:500;margin-left:5px;}
  .fmt-err{font-size:11px;color:${C.danger};margin-top:4px;}

  .fmt-btn-pri{display:inline-flex;align-items:center;gap:8px;padding:10px 22px;
    border-radius:11px;border:none;cursor:pointer;font-family:'Outfit',sans-serif;
    font-size:13px;font-weight:700;background:linear-gradient(135deg,${C.navy},${C.blue});
    color:#fff;box-shadow:0 4px 18px rgba(22,53,200,.28);
    transition:all .18s cubic-bezier(.34,1.2,.64,1);}
  .fmt-btn-pri:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(22,53,200,.38);}
  .fmt-btn-pri:disabled{opacity:.5;transform:none;cursor:not-allowed;}
  .fmt-btn-sec{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;
    border-radius:10px;cursor:pointer;font-family:'Outfit',sans-serif;
    font-size:12.5px;font-weight:600;background:#fff;color:${C.textSub};
    border:1.5px solid ${C.divider};transition:all .14s;}
  .fmt-btn-sec:hover{background:${C.surfaceEl};border-color:${C.iceBlue};}
  .fmt-btn-danger{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;
    border-radius:10px;cursor:pointer;font-family:'Outfit',sans-serif;font-size:12.5px;
    font-weight:700;background:${C.danger};color:#fff;border:none;
    box-shadow:0 4px 14px rgba(200,27,27,.25);transition:all .14s;}
  .fmt-btn-danger:hover{background:#A51515;transform:translateY(-1px);}
  .fmt-btn-danger:disabled{opacity:.5;cursor:not-allowed;transform:none;}

  .fmt-tr{transition:background .12s;cursor:pointer;}
  .fmt-tr:hover{background:#F4F7FF!important;}

  .fmt-badge{display:inline-flex;align-items:center;gap:4px;border-radius:20px;
    padding:3px 10px;font-size:10.5px;font-weight:700;font-family:'Outfit',sans-serif;}

  .fmt-modal{animation:fmtModal .26s cubic-bezier(.22,1,.36,1) both;}
  @keyframes fmtModal{from{opacity:0;transform:scale(.93) translateY(-18px);}
    to{opacity:1;transform:scale(1) translateY(0);}}

  @keyframes fmtSpin{to{transform:rotate(360deg);}}
  .fmt-spin{animation:fmtSpin .75s linear infinite;display:inline-block;}

  @keyframes fmtUp{from{opacity:0;transform:translateY(20px) scale(.984);}
    to{opacity:1;transform:translateY(0) scale(1);}}
  .fmt-in{animation:fmtUp .46s cubic-bezier(.22,1,.36,1) both;}
  .fmt-d0{animation-delay:.00s;}.fmt-d1{animation-delay:.07s;}
  .fmt-d2{animation-delay:.14s;}.fmt-d3{animation-delay:.21s;}
  .fmt-d4{animation-delay:.28s;}

  @keyframes fmtBar{from{width:0}to{width:var(--bw)}}
  .fmt-bar{animation:fmtBar 1s cubic-bezier(.22,1,.36,1) both;}

  @keyframes fmtToast{0%{opacity:0;transform:translateY(16px);}
    12%{opacity:1;transform:translateY(0);}80%{opacity:1;}
    100%{opacity:0;transform:translateY(-6px);}}
  .fmt-toast{animation:fmtToast 3.3s ease both;}

  .fmt-pg{width:34px;height:34px;border-radius:9px;border:1px solid ${C.divider};
    display:flex;align-items:center;justify-content:center;cursor:pointer;
    font-family:'Outfit',sans-serif;font-size:12px;font-weight:600;
    background:#fff;color:${C.textSub};transition:all .14s;}
  .fmt-pg:hover{background:${C.surfaceEl};border-color:${C.iceBlue};}
  .fmt-pg.active{background:${C.navy};color:#fff;border-color:${C.navy};}
  .fmt-pg:disabled{opacity:.4;cursor:not-allowed;}

  .fmt-act-btn{width:30px;height:30px;border-radius:8px;border:1px solid ${C.divider};
    display:flex;align-items:center;justify-content:center;cursor:pointer;
    background:${C.surfaceEl};transition:all .14s;}

  .fmt-avatar{width:42px;height:42px;border-radius:12px;flex-shrink:0;
    display:flex;align-items:center;justify-content:center;
    font-family:'Fraunces',serif;font-size:16px;font-weight:700;}

  .fmt-section{background:${C.surfaceEl};border-radius:14px;padding:18px 20px;
    border:1px solid ${C.divider};}

  .fmt-drow{display:flex;align-items:flex-start;gap:10px;
    padding:10px 0;border-bottom:1px solid ${C.divider};}
  .fmt-drow:last-child{border-bottom:none;}
  .fmt-dlabel{font-size:11px;font-weight:800;color:${C.textMuted};
    text-transform:uppercase;letter-spacing:.07em;min-width:160px;
    flex-shrink:0;padding-top:2px;}
  .fmt-dval{font-size:13px;color:${C.textPri};font-weight:500;line-height:1.5;}

  .fmt-tab-btn{display:flex;align-items:center;gap:7px;padding:9px 18px;
    border-radius:10px 10px 0 0;border:none;cursor:pointer;
    font-family:'Outfit',sans-serif;font-size:12.5px;font-weight:700;
    transition:all .14s;background:transparent;}

  .fmt-pill{padding:6px 14px;border-radius:20px;cursor:pointer;
    font-family:'Outfit',sans-serif;font-size:12px;font-weight:700;
    border:1.5px solid transparent;transition:all .15s;
    display:inline-flex;align-items:center;gap:5px;}

  @media(max-width:768px){
    .fmt-hide-sm{display:none!important;}
    .fmt{padding:80px 14px 52px!important;}
  }
`;

/* ═══════════════════════════════════════════════════════════════════
   COMPOSANTS UTILITAIRES
═══════════════════════════════════════════════════════════════════ */
const Tri = ({ h = 4 }) => (
  <div style={{ height: h, display: "flex", borderRadius: h/2, overflow: "hidden" }}>
    <div style={{ flex:1, background:"#E02020" }}/>
    <div style={{ flex:1, background:C.gold }}/>
    <div style={{ flex:1, background:C.green }}/>
  </div>
);

const SecHdr = ({ icon: Icon, label, color = C.blue }) => (
  <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:14 }}>
    <div style={{ width:4, height:20, borderRadius:3, background:color, flexShrink:0 }}/>
    <div style={{ width:28, height:28, borderRadius:8, background:`${color}12`, border:`1px solid ${color}20`, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <Icon size={13} color={color}/>
    </div>
    <p className="fmt-serif" style={{ fontSize:13, fontWeight:600, color:C.textSub }}>{label}</p>
  </div>
);

const FInput = ({ label, optional, required, name, value, onChange, error, type="text", placeholder, disabled }) => (
  <div>
    <label className="fmt-label">
      {label}
      {optional && <span className="fmt-label-opt">(optionnel)</span>}
      {required && <span style={{ color:C.danger, marginLeft:2 }}>*</span>}
    </label>
    <input className={`fmt-input${error?" fmt-input-err":""}`} type={type} name={name}
      value={value} placeholder={placeholder||label} autoComplete="off"
      onChange={onChange} disabled={disabled}
      style={disabled?{background:C.surfaceEl,color:C.textMuted}:{}}/>
    {error && <p className="fmt-err">{error}</p>}
  </div>
);

const FSelect = ({ label, optional, required, name, value, onChange, error, options, placeholder }) => (
  <div>
    <label className="fmt-label">
      {label}
      {optional && <span className="fmt-label-opt">(optionnel)</span>}
      {required && <span style={{ color:C.danger, marginLeft:2 }}>*</span>}
    </label>
    <select className={`fmt-input${error?" fmt-input-err":""}`} name={name} value={value} onChange={onChange}>
      <option value="">{placeholder||"Choisir…"}</option>
      {options.map((o) => <option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
    </select>
    {error && <p className="fmt-err">{error}</p>}
  </div>
);

const FTextarea = ({ label, optional, name, value, onChange, placeholder, rows=3 }) => (
  <div>
    <label className="fmt-label">
      {label}
      {optional && <span className="fmt-label-opt">(optionnel)</span>}
    </label>
    <textarea className="fmt-input" name={name} value={value}
      placeholder={placeholder||label} rows={rows} onChange={onChange}/>
  </div>
);

const Toast = ({ msg, type }) => (
  <div className="fmt-toast" style={{
    position:"fixed", bottom:28, right:28, zIndex:3000,
    display:"flex", alignItems:"center", gap:10, padding:"12px 22px",
    borderRadius:14, background:type==="success"?C.green:C.danger, color:"#fff",
    boxShadow:`0 12px 40px ${type==="success"?"rgba(4,122,90,.35)":"rgba(200,27,27,.35)"}`,
    fontFamily:"'Outfit',sans-serif", fontSize:13.5, fontWeight:600, minWidth:280,
  }}>
    {type==="success"?<CheckCircle2 size={16}/>:<AlertTriangle size={16}/>}
    {msg}
  </div>
);

/* Avatar initiales */
const FmtAvatar = ({ nom, prenom, photo, size=42 }) => {
  const initiales = `${(prenom||"?")[0]}${(nom||"?")[0]}`.toUpperCase();
  const colors = [C.blue, C.green, C.violet, C.teal, C.orange];
  const color  = colors[(nom?.charCodeAt(0)||0) % colors.length];
  if (photo) return (
    <img src={photo} alt={nom} style={{ width:size, height:size, borderRadius:12, objectFit:"cover", border:`2px solid ${color}25` }}/>
  );
  return (
    <div style={{ width:size, height:size, borderRadius:12, background:`${color}12`, border:`1.5px solid ${color}25`, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <span className="fmt-serif" style={{ fontSize:size*.38, fontWeight:700, color, fontStyle:"italic" }}>{initiales}</span>
    </div>
  );
};

/* Étoile note affichage avec source */
const NoteStars = ({ note, source }) => {
  const n = Number(note) || 0;
  const color = n >= 4 ? C.green : n >= 3 ? C.gold : n >= 2 ? C.orange : C.textMuted;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        <Stars note={n} size={12}/>
        {n > 0
          ? <span style={{ fontSize:12, fontWeight:700, color }}>{n.toFixed(1)}</span>
          : <span style={{ fontSize:11, color:C.textMuted }}>—</span>
        }
      </div>
      {n > 0 && (
        <span style={{ fontSize:9.5, fontWeight:700, padding:"2px 7px", borderRadius:20,
          background: source === "auto" ? `${C.blue}12` : `${C.gold}12`,
          color: source === "auto" ? C.blue : C.gold,
          border: `1px solid ${source==="auto" ? C.blue : C.gold}20` }}>
          {source === "auto" ? "📊 SuiviÉval" : "✏️ Manuelle"}
        </span>
      )}
    </div>
  );
};


/* Tooltip décomposition ID formateur */
const IdBadge = ({ fid }) => {
  const parts = (fid || "").split("-");
  // FORM - TYPE - ANTENNE - ANNÉE - N°
  const descs = ["Préfixe", parts[1]==="IND"?"Individuel":"Organisme", "Antenne", "Année", "N° séquentiel"];
  return (
    <div style={{ position:"relative", display:"inline-block" }}
      onMouseEnter={(e)=>{const t=e.currentTarget.querySelector(".fmt-idc");if(t)t.style.display="flex";}}
      onMouseLeave={(e)=>{const t=e.currentTarget.querySelector(".fmt-idc");if(t)t.style.display="none";}}>
      <span style={{ fontSize:10, fontWeight:800, color:C.violet, background:C.violetPale, padding:"4px 9px",
        borderRadius:6, fontFamily:"monospace", border:`1px solid ${C.violet}20`, whiteSpace:"nowrap", cursor:"help" }}>
        {fid}
      </span>
      <div className="fmt-idc" style={{ display:"none", position:"absolute", top:"calc(100% + 8px)", left:0, zIndex:200,
        background:C.navy, color:"#fff", borderRadius:12, padding:"12px 14px",
        fontFamily:"'Outfit',sans-serif", fontSize:11, minWidth:280,
        boxShadow:"0 12px 32px rgba(6,16,42,.4)", flexDirection:"column", gap:6 }}>
        <p style={{ fontWeight:800, fontSize:11, borderBottom:"1px solid rgba(255,255,255,.15)", paddingBottom:6, marginBottom:2 }}>
          💡 Décomposition de l'identifiant
        </p>
        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
          {parts.map((seg, i) => (
            <div key={i} style={{ background:"rgba(255,255,255,.1)", borderRadius:8, padding:"5px 10px", textAlign:"center", minWidth:48 }}>
              <p style={{ fontFamily:"monospace", fontWeight:800, fontSize:12 }}>{seg}</p>
              <p style={{ fontSize:9, opacity:.65, marginTop:2 }}>{descs[i]||""}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   FORMULAIRE FORMATEUR — CRÉATION / ÉDITION
═══════════════════════════════════════════════════════════════════ */
const EMPTY = {
  /* Identité */
  nom:"", prenom:"", telephone:"", email:"", adresse:"", antenne:"",
  /* Type */
  type:"individuel",                    // "individuel" | "organisme"
  nom_cabinet:"", site_web:"",          // si organisme
  /* Domaine */
  domaine:"", specialite:"", domaine_autre:"",
  /* Type de formation */
  types_formation: [],
  /* Disponibilité */
  disponible: true,
  /* Note manuelle (si pas d'évaluation) */
  note_manuelle: 0,
  /* Optionnels */
  experience_annees:"", diplome:"", certifications:"",
  langues:"", bio:"",
};

const FormateurFormModal = ({ item, onClose, onSaved }) => {
  const isEdit = Boolean(item?.id);
  const [form, setForm] = useState(isEdit ? {
    nom:              item.nom              || "",
    prenom:           item.prenom           || "",
    telephone:        item.telephone        || "",
    email:            item.email            || "",
    adresse:          item.adresse          || "",
    antenne:          item.antenne          || "",
    type:             item.type             || "individuel",
    nom_cabinet:      item.nom_cabinet      || "",
    site_web:         item.site_web         || "",
    domaine:          item.domaine          || "",
    specialite:       item.specialite       || "",
    domaine_autre:    item.domaine_autre    || "",
    disponible:       item.disponible       ?? true,
    note_manuelle:    item.note_manuelle    || 0,
    experience_annees:item.experience_annees|| "",
    diplome:          item.diplome          || "",
    certifications:   item.certifications   || "",
    langues:          item.langues          || "",
    bio:              item.bio              || "",
    types_formation:  item.types_formation  || [],
  } : { ...EMPTY });

  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [photo,   setPhoto]   = useState(null);
  const [photoPreview, setPhotoPreview] = useState(item?.photo || null);

  const handleChange = useCallback((e) => {
    const { name, value, type: t, checked } = e.target;
    const v = t === "checkbox" ? checked : value;
    setForm((p) => {
      const next = { ...p, [name]: v };
      // Reset spécialité si domaine change
      if (name === "domaine") { next.specialite = ""; next.domaine_autre = ""; }
      return next;
    });
    setErrors((p) => ({ ...p, [name]: undefined }));
  }, []);

  /* Toggle type de formation (multi-sélection) */
  const toggleTypeFormation = (v) => {
    setForm((p) => {
      const arr = p.types_formation.includes(v)
        ? p.types_formation.filter((x) => x !== v)
        : [...p.types_formation, v];
      return { ...p, types_formation: arr };
    });
    setErrors((p) => ({ ...p, types_formation: undefined }));
  };

  const handlePhoto = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhoto(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  const validate = () => {
    const e = {};
    if (!form.nom.trim())     e.nom     = "Requis";
    if (!form.prenom.trim())  e.prenom  = "Requis";
    if (!form.telephone.trim()) e.telephone = "Requis";
    if (!form.domaine)        e.domaine = "Requis";
    if (form.domaine === "autres" && !form.domaine_autre.trim()) e.domaine_autre = "Précisez le domaine";
    if (form.domaine && form.domaine !== "autres" && getDomaine(form.domaine)?.metiers.length > 0 && !form.specialite) e.specialite = "Requis";
    if (form.types_formation.length === 0) e.types_formation = "Sélectionnez au moins un type de formation";
    if (form.type === "organisme" && !form.nom_cabinet.trim()) e.nom_cabinet = "Requis";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem("access")||localStorage.getItem("access_token")||localStorage.getItem("token");
      const hdrs  = token ? { Authorization: `Bearer ${token}` } : {};
      let res;
      if (photo) {
        const fd = new FormData();
        Object.entries(form).forEach(([k,v]) => {
          if (k === "types_formation") { (v||[]).forEach((tf) => fd.append("types_formation", tf)); }
          else if (v !== "" && v !== null && v !== undefined) fd.append(k, v);
        });
        fd.append("photo", photo);
        if (isEdit) res = await axios.patch(`${API_BASE}${item.id}/`, fd, { headers: hdrs });
        else        res = await axios.post(API_BASE, fd, { headers: hdrs });
      } else {
        const payload = { ...form, experience_annees: form.experience_annees ? Number(form.experience_annees) : null };
        if (isEdit) res = await axios.patch(`${API_BASE}${item.id}/`, payload, { headers: { "Content-Type":"application/json", ...hdrs } });
        else        res = await axios.post(API_BASE, payload, { headers: { "Content-Type":"application/json", ...hdrs } });
      }
      onSaved(res.data, isEdit ? "edit" : "create");
    } catch (err) {
      const d = err.response?.data;
      if (d && typeof d === "object") {
        const mapped = {};
        Object.entries(d).forEach(([k,v]) => { mapped[k] = Array.isArray(v) ? v[0] : String(v); });
        setErrors(mapped);
      } else setErrors({ nom: "Erreur serveur. Réessayez." });
    } finally { setLoading(false); }
  };

  const domaineCfg  = getDomaine(form.domaine);
  const hasMetiers  = domaineCfg && domaineCfg.metiers.length > 0;

  return (
    <div style={{ position:"fixed", inset:0, zIndex:800, display:"flex", alignItems:"center", justifyContent:"center", padding:"72px 16px 16px" }}>
      <div style={{ position:"absolute", inset:0, background:"rgba(6,16,42,.6)", backdropFilter:"blur(14px)" }} onClick={onClose}/>
      <div className="fmt-modal" style={{ position:"relative", width:"100%", maxWidth:820, maxHeight:"calc(100vh - 88px)", overflowY:"auto", background:C.surface, borderRadius:22, boxShadow:`0 32px 80px ${C.shadowMd}` }}>
        <Tri h={4}/>

        {/* Header */}
        <div style={{ padding:"22px 28px 0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:13 }}>
            <div style={{ width:46, height:46, borderRadius:13, background:isEdit?`${C.gold}14`:`${C.blue}12`, border:`1.5px solid ${isEdit?`${C.gold}30`:`${C.blue}22`}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              {isEdit ? <Pencil size={19} color={C.gold}/> : <Plus size={20} color={C.blue}/>}
            </div>
            <div>
              <h2 className="fmt-serif" style={{ fontSize:20, fontWeight:700, color:C.textPri, letterSpacing:"-.3px" }}>
                {isEdit ? "Modifier le formateur" : "Nouveau formateur"}
              </h2>
              <p style={{ fontSize:11.5, color:C.textMuted, marginTop:2 }}>ONFPP Guinée — Gestion des formateurs</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width:34, height:34, borderRadius:9, background:C.surfaceEl, border:`1px solid ${C.divider}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <X size={14} color={C.textMuted}/>
          </button>
        </div>

        <div style={{ padding:"20px 28px 28px", display:"flex", flexDirection:"column", gap:18 }}>

          {/* ── Photo + Identité ── */}
          <div className="fmt-section">
            <SecHdr icon={User} label="Identité du formateur" color={C.blue}/>
            <div style={{ display:"flex", gap:18, alignItems:"flex-start", marginBottom:14 }}>
              {/* Photo */}
              <div style={{ flexShrink:0 }}>
                <label htmlFor="fmt-photo" style={{ cursor:"pointer" }}>
                  <div style={{ width:80, height:80, borderRadius:18, background:C.surfaceEl, border:`2px dashed ${C.divider}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", overflow:"hidden", position:"relative", transition:"border-color .15s" }}
                    onMouseEnter={(e)=>e.currentTarget.style.borderColor=C.blue}
                    onMouseLeave={(e)=>e.currentTarget.style.borderColor=C.divider}>
                    {photoPreview
                      ? <img src={photoPreview} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                      : <><Camera size={20} color={C.textMuted}/><span style={{ fontSize:10, color:C.textMuted, marginTop:4 }}>Photo</span></>
                    }
                  </div>
                  <input id="fmt-photo" type="file" accept="image/*" style={{ display:"none" }} onChange={handlePhoto}/>
                </label>
                <p style={{ fontSize:10, color:C.textMuted, textAlign:"center", marginTop:4 }}>Optionnel</p>
              </div>
              {/* Nom / Prénom */}
              <div style={{ flex:1, display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <FInput label="Nom" required name="nom" value={form.nom} onChange={handleChange} error={errors.nom} placeholder="Ex: CAMARA"/>
                <FInput label="Prénom" required name="prenom" value={form.prenom} onChange={handleChange} error={errors.prenom} placeholder="Ex: Ibrahima"/>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <FInput label="Téléphone" required name="telephone" type="tel" value={form.telephone} onChange={handleChange} error={errors.telephone} placeholder="Ex: 622 00 00 00"/>
              <FInput label="Email" optional name="email" type="email" value={form.email} onChange={handleChange} placeholder="Ex: camara@mail.com"/>
              <div style={{ gridColumn:"1/-1" }}>
                <FInput label="Adresse" optional name="adresse" value={form.adresse} onChange={handleChange} placeholder="Ex: Dixinn, Conakry"/>
              </div>
              <FSelect label="Antenne ONFPP" optional name="antenne" value={form.antenne} onChange={handleChange} options={ANTENNES} placeholder="Sélectionner une antenne"/>
            </div>
          </div>

          {/* ── Type : Individuel / Organisme ── */}
          <div className="fmt-section">
            <SecHdr icon={Briefcase} label="Type de formateur" color={C.violet}/>
            <div style={{ display:"flex", gap:10, marginBottom:14 }}>
              {[
                { v:"individuel", l:"Individuel",  icon:User,     desc:"Formateur indépendant" },
                { v:"organisme",  l:"Organisme",   icon:Building2, desc:"Cabinet / Centre de formation" },
              ].map((t) => {
                const TI = t.icon;
                const sel = form.type === t.v;
                return (
                  <button key={t.v} type="button" onClick={() => { setForm((p) => ({ ...p, type:t.v })); }}
                    style={{ flex:1, padding:"14px 16px", borderRadius:13, cursor:"pointer", border:`2px solid ${sel?C.violet:C.divider}`, background:sel?C.violetPale:"#fff", display:"flex", alignItems:"center", gap:12, transition:"all .15s" }}>
                    <div style={{ width:38, height:38, borderRadius:10, background:sel?`${C.violet}20`:C.surfaceEl, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <TI size={17} color={sel?C.violet:C.textMuted}/>
                    </div>
                    <div style={{ textAlign:"left" }}>
                      <p style={{ fontSize:13, fontWeight:700, color:sel?C.violet:C.textPri }}>{t.l}</p>
                      <p style={{ fontSize:11, color:sel?C.violet:C.textMuted }}>{t.desc}</p>
                    </div>
                    {sel && <CheckCircle2 size={16} color={C.violet} style={{ marginLeft:"auto" }}/>}
                  </button>
                );
              })}
            </div>

            {/* Si Organisme → champs supplémentaires */}
            {form.type === "organisme" && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, padding:"14px 16px", background:`${C.violet}06`, borderRadius:11, border:`1px solid ${C.violet}20` }}>
                <div style={{ gridColumn:"1/-1" }}>
                  <FInput label="Nom du cabinet / organisme de formation" required name="nom_cabinet" value={form.nom_cabinet} onChange={handleChange} error={errors.nom_cabinet} placeholder="Ex: Centre de Formation Professionnelle Alpha"/>
                </div>
                <FInput label="Site web" optional name="site_web" type="url" value={form.site_web} onChange={handleChange} placeholder="https://…"/>
              </div>
            )}
          </div>


          {/* ══ TYPE DE FORMATION ENSEIGNÉE ══ */}
          <div className="fmt-section">
            <SecHdr icon={GraduationCap} label="Type de formation enseignée" color="#0E7490"/>
            <p style={{ fontSize:12, color:C.textMuted, marginBottom:12, lineHeight:1.6 }}>
              Sélectionnez le(s) type(s) de formations que ce formateur peut dispenser. Un formateur peut couvrir les deux dispositifs.
            </p>
            <div style={{ display:"flex", gap:10 }}>
              {TYPES_FORMATION.map((tf) => {
                const sel = form.types_formation.includes(tf.v);
                return (
                  <button key={tf.v} type="button" onClick={() => toggleTypeFormation(tf.v)}
                    style={{ flex:1, padding:"16px 18px", borderRadius:13, cursor:"pointer",
                      border:`2px solid ${sel ? tf.color : C.divider}`,
                      background:sel ? tf.bg : "#fff",
                      display:"flex", alignItems:"center", gap:12, transition:"all .15s" }}>
                    <span style={{ fontSize:26 }}>{tf.icon}</span>
                    <div style={{ flex:1, textAlign:"left" }}>
                      <p style={{ fontSize:13, fontWeight:700, color:sel ? tf.color : C.textPri }}>{tf.l}</p>
                      <p style={{ fontSize:11, color:sel ? tf.color : C.textMuted, marginTop:2 }}>{tf.desc}</p>
                    </div>
                    <div style={{ width:20, height:20, borderRadius:6,
                      border:`2px solid ${sel ? tf.color : C.divider}`,
                      background:sel ? tf.color : "transparent",
                      display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      {sel && <CheckCircle2 size={12} color="#fff"/>}
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.types_formation && (
              <div style={{ marginTop:10, padding:"9px 14px", borderRadius:9, background:C.dangerPale,
                border:`1px solid ${C.danger}25`, display:"flex", alignItems:"center", gap:7 }}>
                <AlertTriangle size={13} color={C.danger}/>
                <p style={{ fontSize:11, color:C.danger, margin:0, fontWeight:600 }}>{errors.types_formation}</p>
              </div>
            )}
          </div>

          {/* ── Domaine & Spécialité ── */}
          <div className="fmt-section">
            <SecHdr icon={BookOpen} label="Domaine de compétence" color={C.gold}/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div style={{ gridColumn:"1/-1" }}>
                <FSelect label="Domaine principal" required name="domaine" value={form.domaine} onChange={handleChange} error={errors.domaine}
                  options={DOMAINES.map((d) => ({ v:d.v, l:d.l }))} placeholder="Sélectionner un domaine"/>
              </div>

              {/* Domaine connu → liste des métiers */}
              {form.domaine && form.domaine !== "autres" && hasMetiers && (
                <div style={{ gridColumn:"1/-1" }}>
                  <FSelect label="Spécialité / Métier" required name="specialite" value={form.specialite} onChange={handleChange} error={errors.specialite}
                    options={domaineCfg.metiers.map((m) => ({ v:m, l:m }))} placeholder="Sélectionner la spécialité"/>
                </div>
              )}

              {/* Domaine "autres" → saisie manuelle obligatoire */}
              {form.domaine === "autres" && (
                <div style={{ gridColumn:"1/-1" }}>
                  <FInput label="Précisez votre domaine" required name="domaine_autre" value={form.domaine_autre} onChange={handleChange} error={errors.domaine_autre} placeholder="Ex: Médias, Droit, Architecture…"/>
                </div>
              )}

              {/* Infos complémentaires domaine */}
              <FInput label="Années d'expérience" optional name="experience_annees" type="number" value={form.experience_annees} onChange={handleChange} placeholder="Ex: 5"/>
              <FInput label="Diplôme le plus élevé" optional name="diplome" value={form.diplome} onChange={handleChange} placeholder="Ex: Master en Génie Civil"/>
              <div style={{ gridColumn:"1/-1" }}>
                <FInput label="Certifications / Accréditations" optional name="certifications" value={form.certifications} onChange={handleChange} placeholder="Ex: Cert. OFPPT, ISO 9001…"/>
              </div>
              <FInput label="Langues d'enseignement" optional name="langues" value={form.langues} onChange={handleChange} placeholder="Ex: Français, Anglais, Pular"/>
            </div>
          </div>

          {/* ── Disponibilité & Note manuelle ── */}
          <div className="fmt-section">
            <SecHdr icon={Award} label="Disponibilité & Évaluation" color={C.green}/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              {/* Toggle disponible */}
              <div>
                <label className="fmt-label">Disponibilité</label>
                <div style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 14px", borderRadius:10, background:"#fff", border:`1.5px solid ${form.disponible?C.green:C.danger}`, transition:"border-color .2s", cursor:"pointer" }}
                  onClick={() => setForm((p) => ({ ...p, disponible:!p.disponible }))}>
                  {form.disponible
                    ? <ToggleRight size={22} color={C.green}/>
                    : <ToggleLeft  size={22} color={C.danger}/>}
                  <span style={{ fontSize:13, fontWeight:700, color:form.disponible?C.green:C.danger }}>
                    {form.disponible ? "Disponible" : "Non disponible"}
                  </span>
                </div>
              </div>

              {/* Note manuelle si pas d'évaluation automatique */}
              <div>
                <label className="fmt-label">
                  Note manuelle
                  <span className="fmt-label-opt">(si pas d'évaluation automatique)</span>
                </label>
                <div style={{ padding:"11px 14px", borderRadius:10, background:"#fff", border:`1.5px solid ${C.divider}`, display:"flex", alignItems:"center", gap:12 }}>
                  <Stars note={form.note_manuelle} size={20} interactive onChange={(v) => setForm((p) => ({ ...p, note_manuelle:v }))}/>
                  <span style={{ fontSize:12, color:C.textMuted }}>
                    {form.note_manuelle > 0 ? `${form.note_manuelle}/5` : "Cliquez pour noter"}
                  </span>
                  {form.note_manuelle > 0 && (
                    <button type="button" onClick={() => setForm((p) => ({ ...p, note_manuelle:0 }))}
                      style={{ marginLeft:"auto", fontSize:10, color:C.textMuted, background:"none", border:"none", cursor:"pointer" }}>
                      Effacer
                    </button>
                  )}
                </div>
                <p style={{ fontSize:11, color:C.textMuted, marginTop:5 }}>
                  💡 Si ce formateur est lié à une session évaluée, la note sera calculée automatiquement depuis SuiviÉvaluation.
                </p>
              </div>

              {/* Bio */}
              <div style={{ gridColumn:"1/-1" }}>
                <FTextarea label="Biographie / Présentation" optional name="bio" value={form.bio} onChange={handleChange} placeholder="Décrivez l'expérience, la démarche pédagogique…" rows={3}/>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display:"flex", gap:10, paddingTop:6, borderTop:`1px solid ${C.divider}` }}>
            <button className="fmt-btn-sec" onClick={onClose} style={{ flex:1 }}><X size={13}/> Annuler</button>
            <button className="fmt-btn-pri" onClick={handleSubmit} disabled={loading} style={{ flex:2 }}>
              {loading
                ? <><Loader2 size={14} className="fmt-spin"/> Enregistrement…</>
                : isEdit ? <><CheckCircle2 size={14}/> Enregistrer</> : <><Plus size={14}/> Créer le formateur</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   MODAL DÉTAIL
═══════════════════════════════════════════════════════════════════ */
const FormateurDetailModal = ({ item, fmtId, onClose, onEdit }) => {
  const [activeTab, setActiveTab] = useState("info");
  const domaine = getDomaine(item.domaine);

  const tabs = [
    { id:"info",    label:"Informations", icon:ClipboardList },
    { id:"eval",    label:"Évaluation",   icon:Star          },
  ];

  const DR = ({ label, value, node }) => (
    <div className="fmt-drow">
      <span className="fmt-dlabel">{label}</span>
      {node ? <div className="fmt-dval">{node}</div> : <span className="fmt-dval">{value || "—"}</span>}
    </div>
  );

  const noteFinale = item.note_evaluation || item.note_manuelle || 0;

  return (
    <div style={{ position:"fixed", inset:0, zIndex:800, display:"flex", alignItems:"center", justifyContent:"center", padding:"72px 16px 16px" }}>
      <div style={{ position:"absolute", inset:0, background:"rgba(6,16,42,.6)", backdropFilter:"blur(14px)" }} onClick={onClose}/>
      <div className="fmt-modal" style={{ position:"relative", width:"100%", maxWidth:760, maxHeight:"calc(100vh - 90px)", overflowY:"auto", background:C.surface, borderRadius:22, boxShadow:`0 40px 100px rgba(6,16,42,.22)` }}>
        <Tri h={4}/>

        {/* Header */}
        <div style={{ padding:"22px 28px 0", background:`linear-gradient(180deg,${C.surfaceEl},${C.surface})`, borderBottom:`1px solid ${C.divider}` }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
            <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
              <FmtAvatar nom={item.nom} prenom={item.prenom} photo={item.photo} size={56}/>
              <div>
                <h2 className="fmt-serif" style={{ fontSize:21, fontWeight:700, color:C.textPri, letterSpacing:"-.4px" }}>
                  {item.prenom} {item.nom}
                </h2>
                <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginTop:7 }}>
                  {/* Badge type */}
                  <span className="fmt-badge" style={{ background:item.type==="organisme"?C.violetPale:C.surfaceEl, color:item.type==="organisme"?C.violet:C.textSub, border:`1px solid ${item.type==="organisme"?C.violet:C.divider}30` }}>
                    {item.type==="organisme"?<Building2 size={9}/>:<User size={9}/>}
                    {item.type==="organisme"?"Organisme":"Individuel"}
                  </span>
                  {/* Badge domaine */}
                  {item.domaine && (
                    <span className="fmt-badge" style={{ background:`${C.gold}12`, color:C.gold, border:`1px solid ${C.gold}25` }}>
                      <BookOpen size={9}/> {domaine?.l || item.domaine}
                    </span>
                  )}
                  {/* Disponibilité */}
                  <span className="fmt-badge" style={{ background:item.disponible?C.greenPale:C.dangerPale, color:item.disponible?C.green:C.danger, border:`1px solid ${item.disponible?C.green:C.danger}30` }}>
                    {item.disponible?"✓ Disponible":"✗ Indisponible"}
                  </span>
                  {/* ID */}
                  <span style={{ fontSize:11, color:C.blue, background:`${C.blue}10`, padding:"3px 9px", borderRadius:6, fontWeight:800, fontFamily:"monospace", border:`1px solid ${C.blue}20` }}>{fmtId}</span>
                </div>
                {/* Étoiles résumé */}
                <div style={{ marginTop:8 }}>
                  <NoteStars note={noteFinale}/>
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ width:36, height:36, borderRadius:10, background:C.surfaceEl, border:`1px solid ${C.divider}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}>
              <X size={15} color={C.textMuted}/>
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display:"flex", gap:2 }}>
            {tabs.map((tab) => {
              const TI = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="fmt-tab-btn"
                  style={{ color:active?C.textPri:C.textMuted, background:active?C.surface:"transparent", borderBottom:active?`2px solid ${C.blue}`:"2px solid transparent" }}>
                  <TI size={13}/>{tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Corps */}
        <div style={{ padding:"22px 28px", minHeight:260 }}>
          {activeTab === "info" && (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {/* Contact */}
              <div style={{ background:C.surfaceEl, borderRadius:14, padding:"4px 18px", border:`1px solid ${C.divider}` }}>
                <DR label="Nom complet"     value={`${item.prenom} ${item.nom}`}/>
                <DR label="Téléphone"       node={<a href={`tel:${item.telephone}`} style={{ color:C.blue, fontWeight:700 }}>{item.telephone||"—"}</a>}/>
                <DR label="Email"           node={item.email?<a href={`mailto:${item.email}`} style={{ color:C.blue }}>{item.email}</a>:null} value="—"/>
                <DR label="Adresse"         value={item.adresse}/>
                <DR label="Antenne"         value={antenneLabel(item.antenne)}/>
              </div>
              {/* Organisation */}
              <div style={{ background:C.surfaceEl, borderRadius:14, padding:"4px 18px", border:`1px solid ${C.divider}` }}>
                <DR label="Type"            value={item.type==="organisme"?"Organisme / Cabinet":"Formateur individuel"}/>
                {item.type==="organisme" && (
                  <>
                    <DR label="Cabinet"     value={item.nom_cabinet}/>
                    {item.site_web && <DR label="Site web" node={<a href={item.site_web} target="_blank" rel="noreferrer" style={{ color:C.blue, display:"flex", alignItems:"center", gap:5 }}>{item.site_web} <ExternalLink size={11}/></a>}/>}
                  </>
                )}
                <DR label="Domaine"         value={domaine?.l || item.domaine}/>
                <DR label="Spécialité"      value={item.specialite || item.domaine_autre}/>
                <DR label="Expérience"      value={item.experience_annees?`${item.experience_annees} an${item.experience_annees>1?"s":""}`:null}/>
                <DR label="Diplôme"         value={item.diplome}/>
                <DR label="Certifications"  value={item.certifications}/>
                <DR label="Langues"         value={item.langues}/>
              </div>
              {item.bio && (
                <div style={{ background:C.surfaceEl, borderRadius:14, padding:"14px 18px", border:`1px solid ${C.divider}` }}>
                  <p style={{ fontSize:11, fontWeight:800, color:C.textMuted, textTransform:"uppercase", letterSpacing:".08em", marginBottom:8 }}>Biographie</p>
                  <p style={{ fontSize:13, color:C.textPri, lineHeight:1.7 }}>{item.bio}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "eval" && (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {/* Note globale */}
              <div style={{ background:`${C.gold}08`, borderRadius:14, padding:"20px 24px", border:`1px solid ${C.gold}25`, display:"flex", alignItems:"center", gap:20 }}>
                <div style={{ textAlign:"center", minWidth:80 }}>
                  <p className="fmt-serif" style={{ fontSize:48, fontWeight:700, color:C.gold, lineHeight:1 }}>{noteFinale > 0 ? noteFinale.toFixed(1) : "—"}</p>
                  <p style={{ fontSize:11, color:C.textMuted, marginTop:4 }}>Note / 5</p>
                </div>
                <div>
                  <Stars note={noteFinale} size={22}/>
                  <p style={{ fontSize:12, color:C.textMuted, marginTop:8, lineHeight:1.6 }}>
                    {item.note_evaluation
                      ? `Note calculée automatiquement depuis ${item.nb_evaluations||"les"} évaluation${item.nb_evaluations>1?"s":""} de sessions.`
                      : item.note_manuelle
                      ? "Note attribuée manuellement par l'administration."
                      : "Ce formateur n'a pas encore été évalué."
                    }
                  </p>
                  {item.note_evaluation && item.note_manuelle && (
                    <p style={{ fontSize:11, color:C.textMuted, marginTop:6 }}>
                      Note auto : <strong style={{ color:C.blue }}>{item.note_evaluation}/5</strong> · Note manuelle : <strong style={{ color:C.gold }}>{item.note_manuelle}/5</strong>
                    </p>
                  )}
                </div>
              </div>

              {/* Détail par critère si disponible */}
              {item.detail_evaluation && (
                <div style={{ background:C.surfaceEl, borderRadius:14, padding:"18px 20px", border:`1px solid ${C.divider}` }}>
                  <p style={{ fontSize:12, fontWeight:800, color:C.textMuted, textTransform:"uppercase", letterSpacing:".08em", marginBottom:14 }}>Détail par critère</p>
                  {Object.entries(item.detail_evaluation).map(([critere, note]) => (
                    <div key={critere} style={{ marginBottom:10 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                        <span style={{ fontSize:12.5, color:C.textPri, fontWeight:600 }}>{critere}</span>
                        <span style={{ fontSize:12, fontWeight:700, color:C.blue }}>{note}/5</span>
                      </div>
                      <div style={{ height:6, borderRadius:3, background:C.surfaceEl, overflow:"hidden", border:`1px solid ${C.divider}` }}>
                        <div className="fmt-bar" style={{ "--bw":`${(note/5)*100}%`, height:"100%", borderRadius:3, background:note>=4?C.green:note>=3?C.gold:C.orange }}/>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Message si aucune évaluation */}
              {noteFinale === 0 && (
                <div style={{ textAlign:"center", padding:"32px 0" }}>
                  <Star size={32} color={C.textMuted} style={{ margin:"0 auto 12px" }}/>
                  <p className="fmt-serif" style={{ fontSize:14, color:C.textSub }}>Aucune évaluation disponible</p>
                  <p style={{ fontSize:12, color:C.textMuted, marginTop:6, lineHeight:1.6 }}>
                    Les évaluations de sessions alimenteront automatiquement cette section.<br/>
                    Une note manuelle peut être définie depuis le formulaire de modification.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:"14px 28px 20px", borderTop:`1px solid ${C.divider}`, display:"flex", gap:8, justifyContent:"space-between", alignItems:"center" }}>
          <button className="fmt-btn-sec" onClick={onClose}><X size={13}/> Fermer</button>
          <button className="fmt-btn-sec" onClick={() => onEdit(item)}
            style={{ color:C.gold, borderColor:`${C.gold}30`, background:`${C.gold}08` }}
            onMouseEnter={(e) => { e.currentTarget.style.background=C.gold; e.currentTarget.style.color="#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background=`${C.gold}08`; e.currentTarget.style.color=C.gold; }}>
            <Pencil size={13}/> Modifier
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   MODAL SUPPRESSION
═══════════════════════════════════════════════════════════════════ */
const DeleteModal = ({ label, onClose, onConfirm, loading }) => (
  <div style={{ position:"fixed", inset:0, zIndex:950, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
    <div style={{ position:"absolute", inset:0, background:"rgba(6,16,42,.65)", backdropFilter:"blur(14px)" }} onClick={onClose}/>
    <div className="fmt-modal" style={{ position:"relative", width:"100%", maxWidth:400, background:C.surface, borderRadius:20, overflow:"hidden", boxShadow:`0 32px 80px ${C.shadowMd}` }}>
      <div style={{ height:3, background:C.danger }}/>
      <div style={{ padding:"26px 28px 24px", textAlign:"center" }}>
        <div style={{ width:52, height:52, borderRadius:15, background:`${C.danger}12`, border:`1.5px solid ${C.danger}25`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
          <Trash2 size={22} color={C.danger}/>
        </div>
        <h3 className="fmt-serif" style={{ fontSize:18, fontWeight:700, color:C.textPri, marginBottom:8 }}>Supprimer ce formateur ?</h3>
        <p style={{ fontSize:14, fontWeight:700, color:C.textPri, marginBottom:16 }}>{label}</p>
        <p style={{ fontSize:11.5, color:C.textMuted, background:C.dangerPale, borderRadius:9, padding:"8px 14px", marginBottom:20 }}>⚠️ Action irréversible — toutes les données seront supprimées.</p>
        <div style={{ display:"flex", gap:10 }}>
          <button className="fmt-btn-sec" onClick={onClose} style={{ flex:1 }}><X size={13}/> Annuler</button>
          <button className="fmt-btn-danger" onClick={onConfirm} disabled={loading} style={{ flex:1, justifyContent:"center" }}>
            {loading?<Loader2 size={13} className="fmt-spin"/>:<Trash2 size={13}/>}
            {loading?"Suppression…":"Supprimer"}
          </button>
        </div>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL — Formateurs
═══════════════════════════════════════════════════════════════════ */
const Formateurs = () => {
  const [items,       setItems]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [filterDispo, setFilterDispo] = useState("tous");
  const [filterDom,   setFilterDom]   = useState("");
  const [filterType,  setFilterType]  = useState("tous");
  const [filterTF,    setFilterTF]    = useState("tous"); // filtre DFC/DAP
  const [page,        setPage]        = useState(1);
  const [showForm,    setShowForm]    = useState(false);
  const [editItem,    setEditItem]    = useState(null);
  const [delItem,     setDelItem]     = useState(null);
  const [detailItem,  setDetailItem]  = useState(null);
  const [delLoading,  setDelLoading]  = useState(false);
  const [toast,       setToast]       = useState(null);
  const [sortCol,     setSortCol]     = useState("nom");
  const [sortDir,     setSortDir]     = useState("asc");

  const showToast = useCallback((msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3300);
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const r = await axios.get(API_BASE, { headers: authHeader() });
      setItems(Array.isArray(r.data) ? r.data : r.data.results || []);
    } catch (err) {
      if ([401,403].includes(err.response?.status)) {
        showToast("Session expirée", "error");
        setTimeout(() => { window.location.href = "/login"; }, 1800);
      } else showToast("Impossible de charger les formateurs", "error");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSaved = (data, mode) => {
    if (mode === "create") setItems((p) => [data, ...p]);
    else {
      setItems((p) => p.map((it) => it.id === data.id ? data : it));
      if (detailItem?.id === data.id) setDetailItem(data);
    }
    setShowForm(false);
    setEditItem(null);
    showToast(mode === "create" ? `${data.prenom} ${data.nom} — ajouté` : "Formateur mis à jour");
  };

  const handleDelete = async () => {
    if (!delItem) return;
    setDelLoading(true);
    try {
      await axios.delete(`${API_BASE}${delItem.id}/`, { headers: authHeader() });
      setItems((p) => p.filter((it) => it.id !== delItem.id));
      showToast(`${delItem.prenom} ${delItem.nom} — supprimé`);
      setDelItem(null);
    } catch { showToast("Erreur lors de la suppression", "error"); }
    finally { setDelLoading(false); }
  };

  /* ── Filtrage ── */
  const filtered = items.filter((it) => {
    const q = search.toLowerCase();
    const ms = !q || [it.nom, it.prenom, it.telephone, it.email, it.nom_cabinet, it.specialite, it.domaine_autre, getDomaine(it.domaine)?.l].some((v) => v?.toLowerCase().includes(q));
    const md = filterDispo==="tous" || (filterDispo==="dispo"?it.disponible:!it.disponible);
    const mdom = !filterDom || it.domaine === filterDom;
    const mtype = filterType==="tous" || it.type === filterType;
    const mtf   = filterTF==="tous" || (it.types_formation||[]).includes(filterTF);
    return ms && md && mdom && mtype && mtf;
  });

  /* ── Tri ── */
  const sorted = [...filtered].sort((a, b) => {
    let va, vb;
    if (sortCol === "note") { va = a.note_evaluation||a.note_manuelle||0; vb = b.note_evaluation||b.note_manuelle||0; }
    else { va = (a[sortCol]||"").toString().toLowerCase(); vb = (b[sortCol]||"").toString().toLowerCase(); }
    return sortDir==="asc" ? (va>vb?1:-1) : (va<vb?1:-1);
  });

  const handleSort = (col) => {
    if (sortCol===col) setSortDir((d) => d==="asc"?"desc":"asc");
    else { setSortCol(col); setSortDir("asc"); }
    setPage(1);
  };

  const pages    = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged    = sorted.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);
  const gIdx     = (f) => items.findIndex((x) => x.id === f.id);

  /* ── Stats ── */
  const stats = {
    total:     items.length,
    dispos:    items.filter((it) => it.disponible).length,
    organismes:items.filter((it) => it.type==="organisme").length,
    individ:   items.filter((it) => it.type==="individuel").length,
    evalues:   items.filter((it) => (it.note_evaluation||it.note_manuelle||0) > 0).length,
    dfc:       items.filter((it) => (it.types_formation||[]).includes("continue")).length,
    dap:       items.filter((it) => (it.types_formation||[]).includes("apprentissage")).length,
    moy:       (() => {
      const notes = items.map((it) => it.note_evaluation||it.note_manuelle||0).filter((n) => n > 0);
      return notes.length > 0 ? (notes.reduce((a,b) => a+b,0) / notes.length).toFixed(1) : null;
    })(),
  };

  const SortTh = ({ col, label, hide }) => (
    <th onClick={() => handleSort(col)} className={hide?"fmt-hide-sm":""} style={{ padding:"13px 16px", textAlign:"left", fontSize:10, fontWeight:800, color:sortCol===col?C.blue:C.textMuted, letterSpacing:".12em", textTransform:"uppercase", whiteSpace:"nowrap", cursor:"pointer", userSelect:"none" }}>
      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
        {label}{sortCol===col && <span style={{ color:C.blue }}>{sortDir==="asc"?"↑":"↓"}</span>}
      </div>
    </th>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="fmt fmt-page" style={{ minHeight:"100vh", background:`radial-gradient(ellipse 100% 50% at 60% -8%,rgba(22,53,200,.06) 0%,transparent 60%),${C.page}`, padding:"88px 28px 70px", position:"relative" }}>

        {/* Aurora */}
        <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:"-10%", right:"8%", width:480, height:480, borderRadius:"50%", background:"radial-gradient(circle,rgba(22,53,200,.07) 0%,transparent 70%)", filter:"blur(30px)" }}/>
          <div style={{ position:"absolute", bottom:"8%", left:"5%", width:360, height:360, borderRadius:"50%", background:"radial-gradient(circle,rgba(106,36,212,.04) 0%,transparent 70%)", filter:"blur(40px)" }}/>
        </div>

        <div style={{ position:"relative", zIndex:1, maxWidth:1280, margin:"0 auto" }}>

          {/* ── En-tête ── */}
          <div className="fmt-in fmt-d0" style={{ marginBottom:28 }}>
            <div style={{ width:80, marginBottom:14 }}><Tri h={3}/></div>
            <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:14 }}>
              <div>
                <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"4px 12px", borderRadius:20, background:`${C.violet}10`, border:`1px solid ${C.violet}20`, marginBottom:10 }}>
                  <Award size={12} color={C.violet}/>
                  <span style={{ fontSize:11, fontWeight:800, color:C.violet, textTransform:"uppercase", letterSpacing:".12em" }}>Gestion des formateurs — ONFPP</span>
                </div>
                <h1 className="fmt-serif" style={{ fontSize:34, fontWeight:700, color:C.textPri, letterSpacing:"-.8px", lineHeight:1.05 }}>Formateurs</h1>
                <p style={{ fontSize:13.5, color:C.textMuted, marginTop:8 }}>Répertoire des formateurs individuels et organismes partenaires</p>
              </div>
              <div style={{ display:"flex", gap:9 }}>
                <button className="fmt-btn-sec" onClick={fetchAll}><RefreshCw size={13}/></button>
                <button className="fmt-btn-sec"
                  title="Exporter CSV (Excel)"
                  onClick={() => exportExcel(sorted)}
                  style={{ color:C.green, borderColor:`${C.green}30`, background:`${C.green}06` }}
                  onMouseEnter={(e)=>{e.currentTarget.style.background=C.green;e.currentTarget.style.color="#fff";}}
                  onMouseLeave={(e)=>{e.currentTarget.style.background=`${C.green}06`;e.currentTarget.style.color=C.green;}}>
                  <Download size={13}/> Excel
                </button>
                <button className="fmt-btn-sec"
                  title="Exporter PDF"
                  onClick={() => exportPDF(sorted)}
                  style={{ color:C.danger, borderColor:`${C.danger}30`, background:`${C.danger}06` }}
                  onMouseEnter={(e)=>{e.currentTarget.style.background=C.danger;e.currentTarget.style.color="#fff";}}
                  onMouseLeave={(e)=>{e.currentTarget.style.background=`${C.danger}06`;e.currentTarget.style.color=C.danger;}}>
                  <FileText size={13}/> PDF
                </button>
                <button className="fmt-btn-pri" onClick={() => { setEditItem(null); setShowForm(true); }}>
                  <Plus size={14}/> Nouveau formateur
                </button>
              </div>
            </div>
          </div>

          {/* ── KPIs ── */}
          <div className="fmt-in fmt-d1" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))", gap:13, marginBottom:26 }}>
            {[
              { label:"Total formateurs",  value:stats.total,     color:C.blue,   bg:`${C.blue}10`, icon:Users       },
              { label:"Disponibles",       value:stats.dispos,    color:C.green,  bg:C.greenPale,   icon:UserCheck   },
              { label:"Organismes",        value:stats.organismes,color:C.violet, bg:C.violetPale,  icon:Building2   },
              { label:"Individuels",       value:stats.individ,   color:C.teal,   bg:C.tealPale,    icon:User        },
              { label:"DFC",              value:stats.dfc,       color:C.blue,   bg:`${C.blue}08`,  icon:GraduationCap },
              { label:"DAP",              value:stats.dap,       color:C.green,  bg:C.greenPale,    icon:Repeat2    },
              { label:"Note moyenne",      value:stats.moy?`${stats.moy}★`:"—", color:C.gold, bg:C.goldPale, icon:Star },
            ].map((s, i) => {
              const SI = s.icon;
              return (
                <div key={i} style={{ background:C.surface, borderRadius:16, padding:"16px 15px", border:`1px solid ${C.divider}`, boxShadow:`0 2px 14px ${C.shadow}`, position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:s.color, borderRadius:"16px 16px 0 0" }}/>
                  <div style={{ width:36, height:36, borderRadius:10, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:10 }}>
                    <SI size={15} color={s.color}/>
                  </div>
                  <p className="fmt-serif" style={{ fontSize:27, fontWeight:700, color:C.textPri, lineHeight:1, letterSpacing:"-1px" }}>{s.value??0}</p>
                  <p style={{ fontSize:11.5, color:C.textMuted, marginTop:5 }}>{s.label}</p>
                </div>
              );
            })}
          </div>

          {/* ── Filtres ── */}
          <div className="fmt-in fmt-d2" style={{ background:C.surface, border:`1px solid ${C.divider}`, borderRadius:16, padding:"13px 18px", marginBottom:18, display:"flex", alignItems:"center", gap:12, flexWrap:"wrap", boxShadow:`0 2px 14px ${C.shadow}` }}>
            <div style={{ position:"relative", flex:"1 1 240px", minWidth:0 }}>
              <Search size={14} color={C.textMuted} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
              <input className="fmt-input" placeholder="Nom, spécialité, téléphone, cabinet…" value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ paddingLeft:38 }}/>
            </div>

            {/* Filtre dispo */}
            <div style={{ display:"flex", gap:5 }}>
              {[{v:"tous",l:"Tous"},{v:"dispo",l:"Disponibles"},{v:"indispo",l:"Indisponibles"}].map((f) => (
                <button key={f.v} className="fmt-pill" onClick={() => { setFilterDispo(f.v); setPage(1); }}
                  style={{ border:filterDispo===f.v?`1.5px solid ${C.blue}`:`1px solid ${C.divider}`, background:filterDispo===f.v?`${C.blue}12`:C.surfaceEl, color:filterDispo===f.v?C.blue:C.textMuted }}>
                  {f.l}
                </button>
              ))}
            </div>

            {/* Filtre type */}
            <div style={{ display:"flex", gap:5 }}>
              {[{v:"tous",l:"Tous types"},{v:"individuel",l:"Individuel"},{v:"organisme",l:"Organisme"}].map((f) => (
                <button key={f.v} className="fmt-pill" onClick={() => { setFilterType(f.v); setPage(1); }}
                  style={{ border:filterType===f.v?`1.5px solid ${C.violet}`:`1px solid ${C.divider}`, background:filterType===f.v?C.violetPale:C.surfaceEl, color:filterType===f.v?C.violet:C.textMuted }}>
                  {f.l}
                </button>
              ))}
            </div>

            {/* Filtre domaine */}
            <select className="fmt-input" value={filterDom} onChange={(e) => { setFilterDom(e.target.value); setPage(1); }}
              style={{ width:"auto", minWidth:180 }}>
              <option value="">Tous les domaines</option>
              {DOMAINES.map((d) => <option key={d.v} value={d.v}>{d.l}</option>)}
            </select>

            {/* Filtre DFC / DAP */}
            <div style={{ display:"flex", gap:5 }}>
              {[{v:"tous",l:"Tous"},{v:"continue",l:"🎓 DFC"},{v:"apprentissage",l:"🔧 DAP"}].map((f) => (
                <button key={f.v} className="fmt-pill" onClick={() => { setFilterTF(f.v); setPage(1); }}
                  style={{ border:filterTF===f.v?`1.5px solid ${C.teal}`:`1px solid ${C.divider}`, background:filterTF===f.v?C.tealPale:C.surfaceEl, color:filterTF===f.v?C.teal:C.textMuted }}>
                  {f.l}
                </button>
              ))}
            </div>

            <p style={{ fontSize:12, color:C.textMuted, flexShrink:0 }}>
              <span style={{ fontWeight:700, color:C.textSub }}>{sorted.length}</span> formateur{sorted.length>1?"s":""}
            </p>
          </div>

          {/* ── Tableau ── */}
          <div className="fmt-in fmt-d3" style={{ background:C.surface, border:`1px solid ${C.divider}`, borderRadius:20, boxShadow:`0 2px 18px ${C.shadow}`, overflow:"hidden" }}>

            {loading ? (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"72px 0", gap:14 }}>
                <Loader2 size={30} color={C.violet} className="fmt-spin"/>
                <p style={{ fontSize:13.5, color:C.textMuted }}>Chargement des formateurs…</p>
              </div>

            ) : sorted.length === 0 ? (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"72px 0", gap:12 }}>
                <div style={{ width:62, height:62, borderRadius:17, background:C.surfaceEl, display:"flex", alignItems:"center", justifyContent:"center", border:`1px solid ${C.divider}` }}>
                  <User size={28} color={C.textMuted}/>
                </div>
                <p className="fmt-serif" style={{ fontSize:16, fontWeight:600, color:C.textSub }}>Aucun formateur trouvé</p>
                <p style={{ fontSize:13, color:C.textMuted }}>{search||filterDispo!=="tous"||filterDom||filterType!=="tous"?"Modifiez vos critères":"Ajoutez le premier formateur"}</p>
                {!search && filterDispo==="tous" && !filterDom && filterType==="tous" && (
                  <button className="fmt-btn-pri" onClick={() => setShowForm(true)} style={{ marginTop:8 }}>
                    <Plus size={13}/> Nouveau formateur
                  </button>
                )}
              </div>

            ) : (
              <>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead>
                      <tr style={{ background:`linear-gradient(90deg,${C.navy}05,transparent)`, borderBottom:`1.5px solid ${C.divider}` }}>
                        <SortTh col="identifiant" label="ID"/>
                        <SortTh col="nom"         label="Formateur"/>
                        <SortTh col="type"        label="Type"/>
                        <th style={{ padding:"13px 16px", fontSize:10, fontWeight:800, color:C.textMuted, letterSpacing:".12em", textTransform:"uppercase", whiteSpace:"nowrap" }}>Formation</th>
                        <SortTh col="domaine"     label="Domaine / Spécialité"/>
                        <th className="fmt-hide-sm" style={{ padding:"13px 16px", textAlign:"left", fontSize:10, fontWeight:800, color:C.textMuted, letterSpacing:".12em", textTransform:"uppercase" }}>Contact</th>
                        <th className="fmt-hide-sm" style={{ padding:"13px 16px", textAlign:"left", fontSize:10, fontWeight:800, color:C.textMuted, letterSpacing:".12em", textTransform:"uppercase" }}>Antenne</th>
                        <SortTh col="note"        label="Note" />
                        <th style={{ padding:"13px 16px", textAlign:"left", fontSize:10, fontWeight:800, color:C.textMuted, letterSpacing:".12em", textTransform:"uppercase" }}>Dispo</th>
                        <th style={{ padding:"13px 16px", width:120 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paged.map((it, ri) => {
                        const idx  = gIdx(it);
                        const fid  = it.identifiant_unique || buildFormateurId(it, idx);
                        const note = it.note_evaluation || it.note_manuelle || 0;
                        const dom  = getDomaine(it.domaine);
                        return (
                          <tr key={it.id} className="fmt-tr"
                            style={{ borderBottom:`1px solid ${C.divider}`, background:ri%2===0?C.surface:`${C.navy}008` }}
                            onClick={() => setDetailItem({ item:it, id:fid })}>

                            {/* ID */}
                            <td style={{ padding:"13px 16px" }}><IdBadge fid={fid}/></td>

                            {/* Formateur */}
                            <td style={{ padding:"13px 16px" }}>
                              <div style={{ display:"flex", alignItems:"center", gap:11 }}>
                                <FmtAvatar nom={it.nom} prenom={it.prenom} photo={it.photo} size={38}/>
                                <div>
                                  <p style={{ fontSize:13, fontWeight:700, color:C.textPri, lineHeight:1.2 }}>{it.prenom} {it.nom}</p>
                                  {it.type==="organisme" && it.nom_cabinet && (
                                    <p style={{ fontSize:11, color:C.violet, marginTop:1 }}>{it.nom_cabinet}</p>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Type */}
                            <td style={{ padding:"13px 16px" }}>
                              <span className="fmt-badge" style={{ background:it.type==="organisme"?C.violetPale:C.surfaceEl, color:it.type==="organisme"?C.violet:C.textSub, border:`1px solid ${it.type==="organisme"?C.violet:C.divider}25` }}>
                                {it.type==="organisme"?<Building2 size={9}/>:<User size={9}/>}
                                {it.type==="organisme"?"Organisme":"Individuel"}
                              </span>
                            </td>

                            {/* Types formation badges */}
                            <td style={{ padding:"13px 16px" }}>
                              <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                                {(it.types_formation||[]).map((v) => {
                                  const tf = TYPES_FORMATION.find((t) => t.v === v);
                                  return tf ? (
                                    <span key={v} style={{ fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:20, background:tf.bg, color:tf.color, border:`1px solid ${tf.color}25` }}>
                                      {tf.icon} {v==="continue"?"DFC":"DAP"}
                                    </span>
                                  ) : null;
                                })}
                                {(!it.types_formation||it.types_formation.length===0) && <span style={{ fontSize:11, color:C.textMuted }}>—</span>}
                              </div>
                            </td>

                            {/* Domaine / Spécialité */}
                            <td style={{ padding:"13px 16px" }}>
                              <p style={{ fontSize:12.5, fontWeight:700, color:C.textPri, lineHeight:1.2 }}>
                                {dom?.l || it.domaine_autre || it.domaine || "—"}
                              </p>
                              {(it.specialite || it.domaine_autre) && (
                                <p style={{ fontSize:11, color:C.gold, marginTop:2, fontWeight:600 }}>
                                  {it.specialite || it.domaine_autre}
                                </p>
                              )}
                            </td>

                            {/* Contact */}
                            <td className="fmt-hide-sm" style={{ padding:"13px 16px" }}>
                              <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                                {it.telephone && (
                                  <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                                    <Phone size={10} color={C.textMuted}/>
                                    <span style={{ fontSize:12, color:C.textSub }}>{it.telephone}</span>
                                  </div>
                                )}
                                {it.email && (
                                  <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                                    <Mail size={10} color={C.textMuted}/>
                                    <span style={{ fontSize:11, color:C.textMuted }}>{it.email}</span>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Antenne */}
                            <td className="fmt-hide-sm" style={{ padding:"13px 16px" }}>
                              {it.antenne ? (
                                <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                                  <MapPin size={10} color={C.textMuted}/>
                                  <span style={{ fontSize:12, color:C.textSub }}>{antenneLabel(it.antenne)}</span>
                                </div>
                              ) : <span style={{ fontSize:12, color:C.textMuted }}>—</span>}
                            </td>

                            {/* Note */}
                            <td style={{ padding:"13px 16px" }}>
                              <NoteStars note={note} source={it.note_evaluation?"auto":"manuelle"}/>
                            </td>

                            {/* Disponibilité */}
                            <td style={{ padding:"13px 16px" }}>
                              <span className="fmt-badge" style={{ background:it.disponible?C.greenPale:C.dangerPale, color:it.disponible?C.green:C.danger, border:`1px solid ${it.disponible?C.green:C.danger}25` }}>
                                {it.disponible?"✓":"✗"} {it.disponible?"Dispo":"Indispo"}
                              </span>
                            </td>

                            {/* Actions */}
                            <td style={{ padding:"13px 16px" }} onClick={(e) => e.stopPropagation()}>
                              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                                <button className="fmt-act-btn" title="Voir"
                                  style={{ background:`${C.blue}08`, borderColor:`${C.blue}20` }}
                                  onClick={(e) => { e.stopPropagation(); setDetailItem({ item:it, id:fid }); }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background=`${C.blue}18`; e.currentTarget.style.borderColor=C.blue; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background=`${C.blue}08`; e.currentTarget.style.borderColor=`${C.blue}20`; }}>
                                  <Eye size={13} color={C.blue}/>
                                </button>
                                <button className="fmt-act-btn" title="Modifier"
                                  style={{ background:`${C.gold}08`, borderColor:`${C.gold}20` }}
                                  onClick={(e) => { e.stopPropagation(); setEditItem(it); setShowForm(true); }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background=`${C.gold}18`; e.currentTarget.style.borderColor=C.gold; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background=`${C.gold}08`; e.currentTarget.style.borderColor=`${C.gold}20`; }}>
                                  <Pencil size={13} color={C.gold}/>
                                </button>
                                <button className="fmt-act-btn" title="Supprimer"
                                  style={{ background:`${C.danger}08`, borderColor:`${C.danger}20` }}
                                  onClick={(e) => { e.stopPropagation(); setDelItem(it); }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background=`${C.danger}18`; e.currentTarget.style.borderColor=C.danger; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background=`${C.danger}08`; e.currentTarget.style.borderColor=`${C.danger}20`; }}>
                                  <Trash2 size={13} color={C.danger}/>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Légende */}
                <div style={{ padding:"10px 20px", background:`${C.navy}02`, borderTop:`1px solid ${C.divider}`, display:"flex", gap:14, flexWrap:"wrap", alignItems:"center" }}>
                  <Tri h={3}/>
                  <span style={{ fontSize:11, color:C.textMuted }}>
                    ↑↓ Cliquez sur les entêtes pour trier · Cliquez sur une ligne pour le détail complet
                  </span>
                  <span style={{ fontSize:11, color:C.textMuted, marginLeft:"auto" }}>
                    La note <Star size={10} style={{ display:"inline", marginBottom:-1 }}/> est calculée depuis SuiviÉvaluation ou saisie manuellement
                  </span>
                </div>
              </>
            )}

            {/* Pagination */}
            {!loading && sorted.length > 0 && pages > 1 && (
              <div style={{ padding:"13px 20px", borderTop:`1px solid ${C.divider}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
                <p style={{ fontSize:12, color:C.textMuted }}>
                  <span style={{ fontWeight:700, color:C.textSub }}>{(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE,sorted.length)}</span> / <span style={{ fontWeight:700, color:C.textSub }}>{sorted.length}</span>
                </p>
                <div style={{ display:"flex", gap:5, alignItems:"center" }}>
                  <button className="fmt-pg" onClick={() => setPage((p) => p-1)} disabled={page===1}><ChevronLeft size={13}/></button>
                  {Array.from({ length:pages }, (_,i) => i+1)
                    .filter((p) => p===1||p===pages||Math.abs(p-page)<=1)
                    .map((p, i, arr) => (
                      <React.Fragment key={p}>
                        {i>0&&arr[i-1]!==p-1&&<span style={{ color:C.textMuted, fontSize:12, padding:"0 2px" }}>…</span>}
                        <button className={`fmt-pg${p===page?" active":""}`} onClick={() => setPage(p)}>{p}</button>
                      </React.Fragment>
                    ))}
                  <button className="fmt-pg" onClick={() => setPage((p) => p+1)} disabled={page===pages}><ChevronRight size={13}/></button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Modals */}
      {showForm && (
        <FormateurFormModal
          item={editItem}
          onClose={() => { setShowForm(false); setEditItem(null); }}
          onSaved={handleSaved}
        />
      )}
      {delItem && (
        <DeleteModal
          label={`${delItem.prenom} ${delItem.nom}`}
          onClose={() => setDelItem(null)}
          onConfirm={handleDelete}
          loading={delLoading}
        />
      )}
      {detailItem && !showForm && (
        <FormateurDetailModal
          item={detailItem.item}
          fmtId={detailItem.id}
          onClose={() => setDetailItem(null)}
          onEdit={(it) => { setEditItem(it); setDetailItem(null); setShowForm(true); }}
        />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type}/>}
    </>
  );
};

export default Formateurs;