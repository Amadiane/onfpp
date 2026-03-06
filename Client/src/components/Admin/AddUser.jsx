import { useEffect, useState, useCallback, useMemo } from "react";
import {
  UserCog, ShieldCheck, MapPin, Eye, EyeOff, CheckCircle2, AlertTriangle,
  UserPlus, Users, Search, Mail, Building2,
  X, RefreshCw, Loader2, Award, Pencil, Trash2,
} from "lucide-react";
import CONFIG from "../../config/config.js";

/* ═══════════════════════════════════════════════════
   PALETTE — identique DashboardAdmin
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
  danger:    "#C81B1B",
  dangerPale:"#FEF2F2",
  orange:    "#C05C0A",
  violet:    "#6A24D4",
  divider:   "#E8EDFC",
  shadow:    "rgba(6,16,42,0.07)",
  shadowMd:  "rgba(6,16,42,0.14)",
};

/* ═══════════════════════════════════════════════════
   CSS
═══════════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Outfit:wght@300;400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  .au { font-family:'Outfit',sans-serif; -webkit-font-smoothing:antialiased; }
  .au-serif { font-family:'Fraunces',serif !important; }

  /* Fond micro-grille */
  .au-page::before {
    content:''; position:fixed; inset:0; pointer-events:none; z-index:0;
    background-image: radial-gradient(circle at 1px 1px, rgba(22,53,200,.045) 1px, transparent 0);
    background-size: 28px 28px;
  }

  /* ── Inputs stables ── */
  .au-input {
    width:100%; padding:11px 14px; border-radius:11px;
    border:1.5px solid ${C.divider};
    background:#fff; color:${C.textPri};
    font-family:'Outfit',sans-serif; font-size:13.5px; font-weight:400;
    outline:none; transition:border-color .16s, box-shadow .16s;
    position:relative; z-index:1;
  }
  .au-input:focus { border-color:${C.blue}; box-shadow:0 0 0 3px rgba(22,53,200,.1); }
  .au-input::placeholder { color:${C.textMuted}; }
  .au-input-err { border-color:${C.danger} !important; }
  .au-input-err:focus { box-shadow:0 0 0 3px rgba(200,27,27,.1) !important; }
  select.au-input { cursor:pointer; }

  /* ── Boutons ── */
  .au-btn-pri {
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    padding:11px 26px; border-radius:12px; border:none; cursor:pointer;
    font-family:'Outfit',sans-serif; font-size:13.5px; font-weight:700;
    background:linear-gradient(135deg,${C.navy},${C.blue}); color:#fff;
    box-shadow:0 4px 20px rgba(22,53,200,.3), 0 1px 0 rgba(255,255,255,.1) inset;
    transition:all .2s cubic-bezier(.34,1.2,.64,1);
    letter-spacing:.01em;
  }
  .au-btn-pri:hover { transform:translateY(-2px); box-shadow:0 8px 30px rgba(22,53,200,.38); }
  .au-btn-pri:disabled { opacity:.5; transform:none; cursor:not-allowed; }

  .au-btn-sec {
    display:inline-flex; align-items:center; justify-content:center; gap:7px;
    padding:10px 20px; border-radius:11px; cursor:pointer;
    font-family:'Outfit',sans-serif; font-size:13px; font-weight:600;
    background:#fff; color:${C.textSub}; border:1.5px solid ${C.divider};
    transition:all .15s ease;
  }
  .au-btn-sec:hover { background:${C.surfaceEl}; border-color:${C.iceBlue}; color:${C.textPri}; }

  .au-btn-danger {
    display:inline-flex; align-items:center; justify-content:center; gap:7px;
    padding:10px 20px; border-radius:11px; cursor:pointer;
    font-family:'Outfit',sans-serif; font-size:13px; font-weight:700;
    background:${C.danger}; color:#fff; border:none;
    box-shadow:0 4px 14px rgba(200,27,27,.28);
    transition:all .15s;
  }
  .au-btn-danger:hover { background:#A51515; transform:translateY(-1px); }
  .au-btn-danger:disabled { opacity:.5; cursor:not-allowed; transform:none; }

  /* ── Cards utilisateur ── */
  .au-card {
    background:#fff; border:1.5px solid ${C.divider}; border-radius:18px;
    padding:18px 20px; display:flex; align-items:center; gap:15px;
    transition:all .2s cubic-bezier(.22,1,.36,1);
    box-shadow:0 1px 10px ${C.shadow};
    cursor:default;
  }
  .au-card:hover {
    box-shadow:0 8px 32px rgba(6,16,42,.12);
    border-color:${C.iceBlue};
    transform:translateY(-2px);
  }

  /* ── Bouton action ── */
  .au-act-btn {
    display:inline-flex; align-items:center; gap:6px;
    padding:7px 16px; border-radius:10px; cursor:pointer;
    font-family:'Outfit',sans-serif; font-size:12px; font-weight:700;
    border:1.5px solid ${C.divider}; background:${C.surfaceEl}; color:${C.textSub};
    transition:all .15s;
  }
  .au-act-btn:hover { background:${C.blue}; color:#fff; border-color:${C.blue}; }

  /* ── Rôle chips ── */
  .au-role-chip {
    padding:9px 15px; border-radius:11px; cursor:pointer;
    font-family:'Outfit',sans-serif; font-size:12.5px; font-weight:600;
    display:inline-flex; align-items:center; gap:7px;
    transition:all .16s cubic-bezier(.34,1.2,.64,1);
    border:2px solid transparent;
  }
  .au-role-chip:hover { transform:translateY(-1px); }

  /* ── Modal slide-in ── */
  @keyframes auSlide {
    from { opacity:0; transform:translateX(40px); }
    to   { opacity:1; transform:translateX(0); }
  }
  .au-modal { animation:auSlide .3s cubic-bezier(.22,1,.36,1) both; }

  /* ── Animations entrée ── */
  @keyframes auUp {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .au-in   { animation:auUp .4s cubic-bezier(.22,1,.36,1) both; }
  .au-d0   { animation-delay:.00s; }
  .au-d1   { animation-delay:.06s; }
  .au-d2   { animation-delay:.12s; }
  .au-d3   { animation-delay:.18s; }

  @keyframes auSpin { to { transform:rotate(360deg); } }
  .au-spin { animation:auSpin .7s linear infinite; display:inline-flex; }

  /* ── Toast ── */
  @keyframes auToast {
    0%   { opacity:0; transform:translateY(14px); }
    12%  { opacity:1; transform:translateY(0); }
    80%  { opacity:1; }
    100% { opacity:0; transform:translateY(-6px); }
  }
  .au-toast { animation:auToast 3.4s ease both; }

  /* ── Séparateur section ── */
  .au-sec-hdr { display:flex; align-items:center; gap:9px; margin:22px 0 15px; }

  /* ── Responsive ── */
  @media(max-width:640px) {
    .au-grid-2 { grid-template-columns:1fr !important; }
    .au-hide-sm { display:none !important; }
  }
`;

/* ═══════════════════════════════════════════════════
   CONSTANTES RÔLES
═══════════════════════════════════════════════════ */
const ROLE_GROUPES = [
  {
    groupe:"Direction", color:C.blue, bg:`${C.blue}10`, border:`${C.blue}30`,
    noms:["Directeur Général","Directeur Général Adjoint","Chef de Division"],
  },
  {
    groupe:"Encadrement", color:C.green, bg:C.greenPale, border:`${C.green}30`,
    noms:["Chef de Section","Chef d'Antenne"],
  },
  {
    groupe:"Opérationnel", color:C.violet, bg:"#F3EDFF", border:"#C4A8FF",
    noms:["Formateur","Conseiller"],
  },
  {
    groupe:"Partenaires", color:C.gold, bg:C.goldPale, border:`${C.gold}40`,
    noms:["Entreprise"],
  },
];

const ROLE_COLORS = {
  "Directeur Général":         { text:C.blue,   bg:`${C.blue}12`,  border:`${C.blue}30`  },
  "Directeur Général Adjoint": { text:C.blue,   bg:`${C.blue}10`,  border:`${C.blue}25`  },
  "Chef de Division":          { text:C.blue,   bg:`${C.blue}08`,  border:`${C.blue}20`  },
  "Chef de Section":           { text:C.green,  bg:C.greenPale,    border:`${C.green}30` },
  "Chef d'Antenne":            { text:C.orange, bg:"#FFF3E8",      border:"#FFBF7A"      },
  "Formateur":                 { text:C.violet, bg:"#F3EDFF",      border:"#C4A8FF"      },
  "Conseiller":                { text:C.violet, bg:"#F3EDFF",      border:"#C4A8FF"      },
  "Entreprise":                { text:C.gold,   bg:C.goldPale,     border:`${C.gold}40`  },
};
const getRoleColor = (name) =>
  ROLE_COLORS[name] || { text:C.textSub, bg:C.surfaceEl, border:C.divider };

/* ═══════════════════════════════════════════════════
   AUTH
═══════════════════════════════════════════════════ */
const authFetch = (path, token, options = {}) => {
  const url = path.startsWith("http") ? path : `${CONFIG.BASE_URL}${path}`;
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
};

/* ═══════════════════════════════════════════════════
   PETITS COMPOSANTS STABLES
═══════════════════════════════════════════════════ */
const Initials = ({ user, size = 46 }) => {
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || "?";
  const ini  = name.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
  const COLORS = [
    [C.blue,  `${C.blue}14`],
    [C.green, C.greenPale],
    [C.violet,"#F3EDFF"],
    [C.orange,"#FFF3E8"],
    [C.gold,  C.goldPale],
    [C.navy,  C.surfaceEl],
  ];
  const [text, bg] = COLORS[(user.id || 0) % COLORS.length];
  return (
    <div style={{ width:size, height:size, borderRadius:size*.32, background:bg, border:`2px solid ${text}22`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <span className="au-serif" style={{ fontSize:size*.36, fontWeight:700, fontStyle:"italic", color:text, lineHeight:1 }}>{ini}</span>
    </div>
  );
};

const RoleBadge = ({ role }) => {
  const name = typeof role === "object" ? role?.name : role || "—";
  const cfg  = getRoleColor(name);
  return (
    <span style={{ fontSize:10.5, fontWeight:700, padding:"2px 10px", borderRadius:20, background:cfg.bg, color:cfg.text, border:`1px solid ${cfg.border}`, display:"inline-block" }}>
      {name}
    </span>
  );
};

const Toast = ({ msg, type="success" }) => (
  <div className="au-toast" style={{
    position:"fixed", bottom:28, right:28, zIndex:2000,
    display:"flex", alignItems:"center", gap:10, padding:"13px 22px", borderRadius:14,
    background: type==="success" ? C.green : C.danger, color:"#fff",
    boxShadow:`0 12px 40px ${type==="success"?"rgba(4,122,90,.35)":"rgba(200,27,27,.35)"}`,
    fontFamily:"'Outfit',sans-serif", fontSize:13.5, fontWeight:600, minWidth:280,
  }}>
    {type==="success" ? <CheckCircle2 size={16}/> : <AlertTriangle size={16}/>}
    {msg}
  </div>
);

/* Champs stables hors composant */
const AuInput = ({ label, required, name, value, onChange, error, type="text", placeholder, children }) => (
  <div>
    <label className="au-serif" style={{ display:"block", fontSize:12, fontWeight:600, color:C.textSub, marginBottom:6, fontStyle:"normal" }}>
      {label}{required && <span style={{ color:C.danger, marginLeft:2 }}>*</span>}
    </label>
    {children || (
      <input className={`au-input${error?" au-input-err":""}`} type={type} name={name} value={value} placeholder={placeholder||label} autoComplete="off" onChange={onChange}/>
    )}
    {error && <p style={{ fontSize:11, color:C.danger, marginTop:4 }}>{error}</p>}
  </div>
);

/* Section header formulaire */
const SecHdr = ({ icon:Icon, label, color=C.blue }) => (
  <div className="au-sec-hdr">
    <div style={{ width:4, height:20, borderRadius:3, background:color, flexShrink:0 }}/>
    <div style={{ width:28, height:28, borderRadius:8, background:`${color}12`, border:`1px solid ${color}20`, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <Icon size={13} color={color}/>
    </div>
    <p className="au-serif" style={{ fontSize:13, fontWeight:600, color:C.textSub }}>{label}</p>
  </div>
);

/* Info row dans modal détail */
const InfoRow = ({ label, value, last=false }) => (
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:last?"none":`1px solid ${C.divider}` }}>
    <span style={{ fontSize:12, color:C.textMuted, fontWeight:600 }}>{label}</span>
    <span style={{ fontSize:13, fontWeight:700, color:C.textPri, textAlign:"right", maxWidth:"60%" }}>{value||"—"}</span>
  </div>
);

/* ═══════════════════════════════════════════════════
   MODAL DÉTAIL UTILISATEUR — avec Modifier + Supprimer
═══════════════════════════════════════════════════ */
const UserDetailModal = ({ user, onClose, onEdit, onDelete }) => {
  if (!user) return null;
  const roleName = typeof user.role === "object" ? user.role?.name : user.role || "—";
  return (
    <div style={{ position:"fixed", inset:0, zIndex:900, display:"flex", alignItems:"center", justifyContent:"center", padding:"100px 16px 32px" }}>
      <div style={{ position:"absolute", inset:0, background:"rgba(6,16,42,.52)", backdropFilter:"blur(14px)" }} onClick={onClose}/>
      <div className="au-modal" style={{ position:"relative", width:"100%", maxWidth:460, maxHeight:"calc(100vh - 132px)", overflowY:"auto", background:C.surface, borderRadius:22, boxShadow:`0 32px 80px ${C.shadowMd}` }}>
        {/* Tricolore */}
        <div style={{ height:4, display:"flex", borderRadius:"22px 22px 0 0", overflow:"hidden" }}>
          <div style={{ flex:1, background:"#E02020" }}/><div style={{ flex:1, background:C.gold }}/><div style={{ flex:1, background:C.green }}/>
        </div>
        {/* Header */}
        <div style={{ padding:"22px 26px 18px", display:"flex", alignItems:"center", gap:14, borderBottom:`1px solid ${C.divider}` }}>
          <Initials user={user} size={50}/>
          <div style={{ flex:1, minWidth:0 }}>
            <h3 className="au-serif" style={{ fontSize:19, fontWeight:700, color:C.textPri, letterSpacing:"-.3px", lineHeight:1.2 }}>
              {[user.first_name, user.last_name].filter(Boolean).join(" ") || user.username}
            </h3>
            <div style={{ marginTop:6 }}><RoleBadge role={user.role}/></div>
          </div>
          <button onClick={onClose} style={{ width:34, height:34, borderRadius:9, background:C.surfaceEl, border:`1px solid ${C.divider}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}>
            <X size={14} color={C.textMuted}/>
          </button>
        </div>
        {/* Détails */}
        <div style={{ padding:"14px 26px 6px" }}>
          <InfoRow label="Nom d'utilisateur" value={user.username}/>
          <InfoRow label="Email"             value={user.email}/>
          <InfoRow label="Prénom"            value={user.first_name}/>
          <InfoRow label="Nom"               value={user.last_name}/>
          <InfoRow label="Rôle"              value={roleName}/>
          <InfoRow label="Région / Section"  value={user.region?.name || user.region}/>
          <InfoRow label="Antenne / Centre"  value={user.centre?.name || user.centre}/>
          <InfoRow label="Niveau d'accès"    value={user.role?.level !== undefined ? `Niveau ${user.role.level}` : null}/>
          <InfoRow label="Statut" last       value={
            <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:user.is_active!==false?C.greenPale:C.dangerPale, color:user.is_active!==false?C.green:C.danger, border:`1px solid ${user.is_active!==false?`${C.green}30`:`${C.danger}30`}` }}>
              {user.is_active !== false ? "✓ Actif" : "✗ Inactif"}
            </span>
          }/>
        </div>
        {/* Actions */}
        <div style={{ padding:"16px 26px 24px", display:"flex", gap:10, borderTop:`1px solid ${C.divider}`, marginTop:6 }}>
          <button className="au-btn-sec" onClick={onClose} style={{ flex:1 }}><X size={13}/> Fermer</button>
          <button className="au-btn-sec" onClick={onEdit}
            style={{ flex:1, color:C.gold, borderColor:`${C.gold}30`, background:`${C.gold}08` }}
            onMouseEnter={e=>{e.currentTarget.style.background=C.gold;e.currentTarget.style.color="#fff";e.currentTarget.style.borderColor=C.gold;}}
            onMouseLeave={e=>{e.currentTarget.style.background=`${C.gold}08`;e.currentTarget.style.color=C.gold;e.currentTarget.style.borderColor=`${C.gold}30`;}}
          ><Pencil size={13}/> Modifier</button>
          <button className="au-btn-sec" onClick={onDelete}
            style={{ flex:1, color:C.danger, borderColor:`${C.danger}25`, background:`${C.danger}08` }}
            onMouseEnter={e=>{e.currentTarget.style.background=C.danger;e.currentTarget.style.color="#fff";e.currentTarget.style.borderColor=C.danger;}}
            onMouseLeave={e=>{e.currentTarget.style.background=`${C.danger}08`;e.currentTarget.style.color=C.danger;e.currentTarget.style.borderColor=`${C.danger}25`;}}
          ><Trash2 size={13}/> Supprimer</button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   MODAL FORMULAIRE NOUVEL UTILISATEUR
═══════════════════════════════════════════════════ */
const UserFormModal = ({ token, roles, onClose, onSuccess }) => {
  const [form, setForm]         = useState({ username:"", firstName:"", lastName:"", email:"", password:"", role:"", region:"", centre:"" });
  const [errors, setErrors]     = useState({});
  const [submitting, setSub]    = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [done, setDone]         = useState(false);

  /* ── Tous les rôles — affiche TOUT sans filtrage restrictif ── */
  const allRoles = useMemo(() =>
    roles.length > 0 ? roles : ROLE_GROUPES.flatMap(g => g.noms.map(n => ({ id:n, name:n })))
  , [roles]);

  /* Groupement pour affichage — chaque rôle est classé dans son groupe;
     les rôles sans correspondance tombent dans "Autres rôles" */
  const roleGroupes = useMemo(() => {
    const assignedIds = new Set();
    const grouped = ROLE_GROUPES.map(g => {
      const items = allRoles.filter(r => {
        const rn = (r.name || "").toLowerCase();
        return g.noms.some(n => {
          const nn = n.toLowerCase();
          return rn === nn || rn.includes(nn) || nn.includes(rn);
        });
      });
      items.forEach(r => assignedIds.add(String(r.id)));
      return { ...g, items };
    });
    const others = allRoles.filter(r => !assignedIds.has(String(r.id)));
    const result = grouped.filter(g => g.items.length > 0);
    if (others.length > 0) {
      result.push({ groupe:"Autres rôles", color:C.textSub, bg:C.surfaceEl, border:C.divider, items:others });
    }
    return result;
  }, [allRoles]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]:value }));
    setErrors(p => ({ ...p, [name]:undefined }));
  }, []);

  const validate = () => {
    const e = {};
    if (!form.username.trim())    e.username = "Requis";
    if (!form.email.trim())       e.email    = "Requis";
    if (!form.password.trim())    e.password = "Requis";
    if (form.password.length > 0 && form.password.length < 6) e.password = "Min. 6 caractères";
    if (!form.role)               e.role     = "Sélectionner un rôle";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSub(true);
    const roleId  = Number(form.role);
    const roleObj = roles.find(r => String(r.id) === String(form.role));
    const payload = {
      username:   form.username.trim(),
      first_name: form.firstName.trim(),
      last_name:  form.lastName.trim(),
      email:      form.email.trim(),
      password:   form.password,
      ...(Number.isInteger(roleId) && roleId > 0 ? { role:roleId } : { role_name:roleObj?.name||form.role }),
      ...(form.region.trim() && { region_name:form.region.trim() }),
      ...(form.centre.trim() && { centre_name:form.centre.trim() }),
    };
    try {
      const res = await authFetch(CONFIG.API_CREATE_USER, token, { method:"POST", body:JSON.stringify(payload) });
      if (res.ok || res.status === 201) {
        setDone(true);
        setTimeout(() => { onSuccess(); onClose(); }, 1400);
      } else {
        const data = await res.json().catch(() => ({}));
        const mapped = {};
        Object.entries(data).forEach(([k,v]) => { mapped[k] = Array.isArray(v)?v[0]:String(v); });
        setErrors(mapped);
      }
    } catch { setErrors({ username:"Erreur réseau." }); }
    finally { setSub(false); }
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:900, display:"flex", alignItems:"center", justifyContent:"center", padding:"100px 16px 32px" }}>
      <div style={{ position:"absolute", inset:0, background:"rgba(6,16,42,.55)", backdropFilter:"blur(14px)" }} onClick={onClose}/>
      <div className="au-modal" style={{
        position:"relative", width:"100%", maxWidth:680,
        maxHeight:"calc(100vh - 132px)", overflowY:"auto",
        background:C.surface, borderRadius:22, boxShadow:`0 32px 80px ${C.shadowMd}`,
      }}>
        {/* Tricolore */}
        <div style={{ height:4, display:"flex", borderRadius:"22px 22px 0 0", overflow:"hidden" }}>
          <div style={{ flex:1, background:"#E02020" }}/><div style={{ flex:1, background:C.gold }}/><div style={{ flex:1, background:C.green }}/>
        </div>

        {/* Header modal */}
        <div style={{ padding:"22px 28px 0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:13 }}>
            <div style={{ width:46, height:46, borderRadius:13, background:`${C.blue}12`, border:`1.5px solid ${C.blue}22`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <UserPlus size={20} color={C.blue}/>
            </div>
            <div>
              <h2 className="au-serif" style={{ fontSize:20, fontWeight:700, color:C.textPri, letterSpacing:"-.3px" }}>Nouvel utilisateur</h2>
              <p style={{ fontSize:11.5, color:C.textMuted, marginTop:2 }}>Créer un compte sur la plateforme ONFPP</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width:34, height:34, borderRadius:9, background:C.surfaceEl, border:`1px solid ${C.divider}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <X size={14} color={C.textMuted}/>
          </button>
        </div>

        {done ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"48px 28px", gap:14 }}>
            <div style={{ width:64, height:64, borderRadius:20, background:C.greenPale, border:`1.5px solid ${C.green}30`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <CheckCircle2 size={32} color={C.green}/>
            </div>
            <p className="au-serif" style={{ fontSize:18, fontWeight:700, color:C.textPri }}>Utilisateur créé avec succès !</p>
            <p style={{ fontSize:13, color:C.textMuted }}>Fermeture automatique…</p>
          </div>
        ) : (
          <div style={{ padding:"20px 28px 28px", display:"flex", flexDirection:"column", gap:18 }}>

            {/* Identité */}
            <div style={{ background:C.surfaceEl, borderRadius:14, padding:"18px 20px", border:`1px solid ${C.divider}` }}>
              <SecHdr icon={UserCog} label="Identité" color={C.blue}/>
              <div className="au-grid-2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <AuInput label="Prénom" name="firstName" value={form.firstName} onChange={handleChange} placeholder="Ex: Mamadou"/>
                <AuInput label="Nom de famille" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Ex: Diallo"/>
                <AuInput label="Nom d'utilisateur" name="username" required value={form.username} onChange={handleChange} error={errors.username} placeholder="Ex: m.diallo"/>
                <AuInput label="Email" name="email" type="email" required value={form.email} onChange={handleChange} error={errors.email} placeholder="Ex: m.diallo@onfpp.gn"/>
              </div>
              <div style={{ marginTop:14 }}>
                <AuInput label="Mot de passe" name="password" required value={form.password} onChange={handleChange} error={errors.password}>
                  <div style={{ position:"relative" }}>
                    <input className={`au-input${errors.password?" au-input-err":""}`} type={showPass?"text":"password"} name="password" value={form.password} placeholder="Min. 6 caractères" autoComplete="new-password" onChange={handleChange} style={{ paddingRight:44 }}/>
                    <button type="button" onClick={()=>setShowPass(p=>!p)} style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.textMuted, display:"flex" }}>
                      {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                </AuInput>
              </div>
            </div>


            {/* Rôle — logique de groupement hors JSX via useMemo */}
            <div style={{ background:C.surfaceEl, borderRadius:14, padding:"18px 20px", border:`1px solid ${errors.role?C.danger:C.divider}` }}>
              <SecHdr icon={ShieldCheck} label="Rôle & accès" color={C.navy}/>
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {roleGroupes.map(g => (
                  <div key={g.groupe}>
                    <p style={{ fontSize:10, fontWeight:800, color:g.color, textTransform:"uppercase", letterSpacing:".12em", marginBottom:9 }}>{g.groupe}</p>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                      {g.items.map(r => {
                        const sel = String(form.role) === String(r.id);
                        return (
                          <button key={r.id} type="button" className="au-role-chip"
                            onClick={() => { setForm(p=>({...p,role:String(r.id)})); setErrors(p=>({...p,role:undefined})); }}
                            style={{ border:`2px solid ${sel?g.color:g.border}`, background:sel?g.color:g.bg, color:sel?"#fff":g.color, fontWeight:sel?700:500, boxShadow:sel?`0 4px 16px ${g.color}35`:"none", transform:sel?"translateY(-2px)":"none" }}
                          >
                            <span style={{ width:13, height:13, borderRadius:"50%", border:`2px solid ${sel?"rgba(255,255,255,.7)":g.color}`, background:sel?"rgba(255,255,255,.25)":"transparent", display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                              {sel && <span style={{ width:5, height:5, borderRadius:"50%", background:"#fff" }}/>}
                            </span>
                            {r.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              {form.role && (
                <div style={{ marginTop:12, padding:"9px 13px", background:C.greenPale, border:`1.5px solid ${C.green}30`, borderRadius:10, display:"flex", alignItems:"center", gap:8 }}>
                  <ShieldCheck size={13} color={C.green}/>
                  <p style={{ fontSize:12, color:C.green, fontWeight:700 }}>
                    Sélectionné : {roleGroupes.flatMap(g=>g.items).find(r=>String(r.id)===String(form.role))?.name || form.role}
                  </p>
                </div>
              )}
              {errors.role && <p style={{ fontSize:11, color:C.danger, marginTop:8 }}>{errors.role}</p>}
            </div>

            {/* Localisation */}
            <div style={{ background:C.surfaceEl, borderRadius:14, padding:"18px 20px", border:`1px solid ${C.divider}` }}>
              <SecHdr icon={MapPin} label="Localisation" color={C.green}/>
              <div className="au-grid-2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <AuInput label="Région / Section" name="region" value={form.region} onChange={handleChange} placeholder="Ex: Conakry"/>
                <AuInput label="Antenne / Centre" name="centre" value={form.centre} onChange={handleChange} placeholder="Ex: Antenne de Ratoma"/>
              </div>
            </div>

            {errors.username && errors.username.includes("réseau") && (
              <div style={{ background:C.dangerPale, border:`1.5px solid ${C.danger}25`, borderRadius:11, padding:"11px 16px", display:"flex", gap:9, alignItems:"center" }}>
                <AlertTriangle size={14} color={C.danger} style={{ flexShrink:0 }}/>
                <p style={{ fontSize:12, color:C.danger, fontWeight:600 }}>{errors.username}</p>
              </div>
            )}

            {/* Actions */}
            <div style={{ display:"flex", gap:11, paddingTop:6, borderTop:`1px solid ${C.divider}` }}>
              <button className="au-btn-sec" onClick={onClose} style={{ flex:1 }}><X size={13}/> Annuler</button>
              <button className="au-btn-pri" onClick={handleSubmit} disabled={submitting} style={{ flex:2 }}>
                {submitting ? <><Loader2 size={14} className="au-spin"/> Création…</> : <><UserPlus size={14}/> Créer l'utilisateur</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   MODAL MODIFICATION UTILISATEUR
═══════════════════════════════════════════════════ */
const UserEditModal = ({ user, token, roles, onClose, onSaved }) => {
  const [form, setForm]         = useState({
    username:  user.username  || "",
    firstName: user.first_name|| "",
    lastName:  user.last_name || "",
    email:     user.email     || "",
    password:  "",
    role:      String(typeof user.role==="object"? user.role?.id||"" : user.role||""),
    region:    user.region?.name || user.region || "",
    centre:    user.centre?.name || user.centre || "",
  });
  const [errors, setErrors]     = useState({});
  const [submitting, setSub]    = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]:value }));
    setErrors(p => ({ ...p, [name]:undefined }));
  }, []);

  const handleSubmit = async () => {
    if (!form.username.trim()) { setErrors({ username:"Requis" }); return; }
    setSub(true);
    const roleId  = Number(form.role);
    const roleObj = roles.find(r => String(r.id)===String(form.role));
    const payload = {
      username:   form.username.trim(),
      first_name: form.firstName.trim(),
      last_name:  form.lastName.trim(),
      email:      form.email.trim(),
      ...(form.password.trim() && { password:form.password }),
      ...(Number.isInteger(roleId)&&roleId>0 ? { role:roleId } : roleObj ? { role_name:roleObj.name } : {}),
      ...(form.region.trim() && { region_name:form.region.trim() }),
      ...(form.centre.trim() && { centre_name:form.centre.trim() }),
    };
    try {
      const res = await authFetch(`/api/users/${user.id}/`, token, { method:"PATCH", body:JSON.stringify(payload) });
      if (res.ok) {
        const updated = await res.json();
        onSaved(updated);
      } else {
        const data = await res.json().catch(()=>({}));
        const mapped = {};
        Object.entries(data).forEach(([k,v])=>{ mapped[k]=Array.isArray(v)?v[0]:String(v); });
        setErrors(mapped);
      }
    } catch { setErrors({ username:"Erreur réseau." }); }
    finally { setSub(false); }
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:950, display:"flex", alignItems:"center", justifyContent:"center", padding:"100px 16px 32px" }}>
      <div style={{ position:"absolute", inset:0, background:"rgba(6,16,42,.56)", backdropFilter:"blur(14px)" }} onClick={onClose}/>
      <div className="au-modal" style={{ position:"relative", width:"100%", maxWidth:620, maxHeight:"calc(100vh - 132px)", overflowY:"auto", background:C.surface, borderRadius:22, boxShadow:`0 32px 80px ${C.shadowMd}` }}>
        <div style={{ height:4, display:"flex", borderRadius:"22px 22px 0 0", overflow:"hidden" }}>
          <div style={{ flex:1, background:"#E02020" }}/><div style={{ flex:1, background:C.gold }}/><div style={{ flex:1, background:C.green }}/>
        </div>
        <div style={{ padding:"22px 28px 0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:44, height:44, borderRadius:13, background:`${C.gold}12`, border:`1.5px solid ${C.gold}30`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Pencil size={18} color={C.gold}/>
            </div>
            <div>
              <h2 className="au-serif" style={{ fontSize:19, fontWeight:700, color:C.textPri, letterSpacing:"-.3px" }}>Modifier l'utilisateur</h2>
              <p style={{ fontSize:11.5, color:C.textMuted, marginTop:2 }}>{user.username}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width:34, height:34, borderRadius:9, background:C.surfaceEl, border:`1px solid ${C.divider}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <X size={14} color={C.textMuted}/>
          </button>
        </div>
        <div style={{ padding:"20px 28px 28px", display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ background:C.surfaceEl, borderRadius:14, padding:"18px 20px", border:`1px solid ${C.divider}` }}>
            <SecHdr icon={UserCog} label="Identité" color={C.blue}/>
            <div className="au-grid-2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <AuInput label="Prénom" name="firstName" value={form.firstName} onChange={handleChange} placeholder="Ex: Mamadou"/>
              <AuInput label="Nom" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Ex: Diallo"/>
              <AuInput label="Nom d'utilisateur" required name="username" value={form.username} onChange={handleChange} error={errors.username} placeholder="Ex: m.diallo"/>
              <AuInput label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="Ex: m.diallo@onfpp.gn"/>
            </div>
            <div style={{ marginTop:14 }}>
              <AuInput label="Nouveau mot de passe (optionnel)" name="password" value={form.password} onChange={handleChange}>
                <div style={{ position:"relative" }}>
                  <input className="au-input" type={showPass?"text":"password"} name="password" value={form.password} placeholder="Laisser vide = inchangé" autoComplete="new-password" onChange={handleChange} style={{ paddingRight:44 }}/>
                  <button type="button" onClick={()=>setShowPass(p=>!p)} style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.textMuted, display:"flex" }}>
                    {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>
              </AuInput>
            </div>
          </div>
          <div style={{ background:C.surfaceEl, borderRadius:14, padding:"18px 20px", border:`1px solid ${C.divider}` }}>
            <SecHdr icon={ShieldCheck} label="Rôle" color={C.navy}/>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {(roles.length > 0 ? roles : ROLE_GROUPES.flatMap(g=>g.noms.map(n=>({id:n,name:n})))).map(r => {
                const sel = String(form.role)===String(r.id);
                const g   = ROLE_GROUPES.find(g=>g.noms.some(n=>r.name?.toLowerCase().includes(n.toLowerCase())||n.toLowerCase().includes(r.name?.toLowerCase()))) || ROLE_GROUPES[0];
                return (
                  <button key={r.id} type="button" className="au-role-chip"
                    onClick={()=>{setForm(p=>({...p,role:String(r.id)}));setErrors(p=>({...p,role:undefined}));}}
                    style={{ border:`2px solid ${sel?g.color:g.border}`, background:sel?g.color:g.bg, color:sel?"#fff":g.color, fontWeight:sel?700:500, boxShadow:sel?`0 4px 14px ${g.color}35`:"none", transform:sel?"translateY(-2px)":"none" }}>
                    <span style={{ width:12, height:12, borderRadius:"50%", border:`2px solid ${sel?"rgba(255,255,255,.7)":g.color}`, background:sel?"rgba(255,255,255,.2)":"transparent", display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      {sel && <span style={{ width:4, height:4, borderRadius:"50%", background:"#fff" }}/>}
                    </span>
                    {r.name}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ background:C.surfaceEl, borderRadius:14, padding:"18px 20px", border:`1px solid ${C.divider}` }}>
            <SecHdr icon={MapPin} label="Localisation" color={C.green}/>
            <div className="au-grid-2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <AuInput label="Région / Section" name="region" value={form.region} onChange={handleChange} placeholder="Ex: Conakry"/>
              <AuInput label="Antenne / Centre" name="centre" value={form.centre} onChange={handleChange} placeholder="Ex: Antenne de Ratoma"/>
            </div>
          </div>
          <div style={{ display:"flex", gap:11, paddingTop:4, borderTop:`1px solid ${C.divider}` }}>
            <button className="au-btn-sec" onClick={onClose} style={{ flex:1 }}><X size={13}/> Annuler</button>
            <button className="au-btn-pri" onClick={handleSubmit} disabled={submitting} style={{ flex:2 }}>
              {submitting ? <><Loader2 size={14} className="au-spin"/> Enregistrement…</> : <><CheckCircle2 size={14}/> Enregistrer</>}
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
const UserDeleteModal = ({ user, token, onClose, onDeleted }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`/api/users/${user.id}/`, token, { method:"DELETE" });
      if (res.ok || res.status === 204) {
        onDeleted(user.id);
      }
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:950, display:"flex", alignItems:"center", justifyContent:"center", padding:"100px 16px 32px" }}>
      <div style={{ position:"absolute", inset:0, background:"rgba(6,16,42,.6)", backdropFilter:"blur(14px)" }} onClick={onClose}/>
      <div className="au-modal" style={{ position:"relative", width:"100%", maxWidth:400, background:C.surface, borderRadius:22, boxShadow:`0 32px 80px ${C.shadowMd}`, overflow:"hidden" }}>
        <div style={{ height:3, background:C.danger }}/>
        <div style={{ padding:"28px 28px 26px", textAlign:"center" }}>
          <div style={{ width:52, height:52, borderRadius:15, background:`${C.danger}12`, border:`1.5px solid ${C.danger}25`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
            <Trash2 size={22} color={C.danger}/>
          </div>
          <h3 className="au-serif" style={{ fontSize:18, fontWeight:700, color:C.textPri, marginBottom:8 }}>Supprimer cet utilisateur ?</h3>
          <p style={{ fontSize:13, color:C.textSub, marginBottom:6 }}>Suppression définitive du compte de</p>
          <p style={{ fontSize:15, fontWeight:700, color:C.textPri, marginBottom:18 }}>
            {[user.first_name, user.last_name].filter(Boolean).join(" ") || user.username}
          </p>
          <p style={{ fontSize:11.5, color:C.textMuted, background:C.dangerPale, borderRadius:9, padding:"8px 14px", marginBottom:22 }}>
            ⚠️ Cette action est irréversible.
          </p>
          <div style={{ display:"flex", gap:10 }}>
            <button className="au-btn-sec" onClick={onClose} style={{ flex:1 }}><X size={13}/> Annuler</button>
            <button className="au-btn-danger" onClick={handleDelete} disabled={loading} style={{ flex:1, justifyContent:"center" }}>
              {loading ? <><Loader2 size={13} className="au-spin"/> Suppression…</> : <><Trash2 size={13}/> Supprimer</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
═══════════════════════════════════════════════════ */
const AddUser = () => {
  const token = localStorage.getItem("access") || localStorage.getItem("access_token") || localStorage.getItem("token");

  const [users,       setUsers]       = useState([]);
  const [roles,       setRoles]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [filterRole,  setFilterRole]  = useState("tous");
  const [showForm,    setShowForm]    = useState(false);
  const [detailUser,  setDetailUser]  = useState(null);
  const [editUser,    setEditUser]    = useState(null);
  const [deleteUser,  setDeleteUser]  = useState(null);
  const [toast,       setToast]       = useState(null);

  const showToast = useCallback((msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3400);
  }, []);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [uRes, rRes] = await Promise.all([
        authFetch("/api/users/", token),
        authFetch(CONFIG.API_ROLES, token),
      ]);
      if (uRes.ok) {
        const d = await uRes.json();
        setUsers(Array.isArray(d) ? d : d.results || []);
      }
      if (rRes.ok) {
        const d = await rRes.json();
        setRoles(Array.isArray(d) ? d : d.results || []);
      }
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreated = () => {
    load();
    showToast("Utilisateur créé avec succès !");
  };

  const handleSaved = (updated) => {
    setUsers(p => p.map(u => u.id === updated.id ? updated : u));
    setEditUser(null);
    setDetailUser(null);
    showToast(`${updated.first_name||updated.username} mis à jour avec succès`);
  };

  const handleDeleted = (id) => {
    setUsers(p => p.filter(u => u.id !== id));
    setDeleteUser(null);
    setDetailUser(null);
    showToast("Utilisateur supprimé", "error");
  };

  const roleName = (u) => typeof u.role==="object" ? u.role?.name : u.role || "";

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchQ = !q || [u.username, u.first_name, u.last_name, u.email, roleName(u)].some(v=>v?.toLowerCase().includes(q));
    const matchR = filterRole==="tous" || roleName(u)===filterRole;
    return matchQ && matchR;
  });

  const stats = {
    total:    users.length,
    actifs:   users.filter(u=>u.is_active!==false).length,
    roles:    [...new Set(users.map(u=>roleName(u)).filter(Boolean))].length,
  };

  /* Groupes de rôles pour le filtre rapide */
  const uniqueRoles = [...new Set(users.map(u=>roleName(u)).filter(Boolean))];

  return (
    <>
      <style>{CSS}</style>

      {/* Fond page */}
      <div className="au au-page" style={{ minHeight:"100vh", background:`radial-gradient(ellipse 90% 50% at 65% -8%, rgba(22,53,200,.055) 0%, transparent 55%), ${C.page}`, padding:"88px 28px 64px", position:"relative" }}>
        <div style={{ position:"relative", zIndex:1, maxWidth:1140, margin:"0 auto" }}>

          {/* ══════════════════════════
              EN-TÊTE
          ══════════════════════════ */}
          <div className="au-in au-d0" style={{ marginBottom:28 }}>
            {/* Tricolore Guinée signature */}
            <div style={{ display:"flex", height:3, borderRadius:3, marginBottom:16, overflow:"hidden", width:80 }}>
              <div style={{ flex:1, background:"#E02020" }}/><div style={{ flex:1, background:C.gold }}/><div style={{ flex:1, background:C.green }}/>
            </div>

            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
              <div>
                <h1 className="au-serif" style={{ fontSize:32, fontWeight:700, color:C.textPri, letterSpacing:"-.6px", lineHeight:1.1 }}>
                  Gestion des utilisateurs
                </h1>
                <p style={{ fontSize:13.5, color:C.textMuted, marginTop:7, lineHeight:1.5 }}>
                  Comptes et accès à la plateforme ONFPP — Guinée
                </p>
              </div>
              <div style={{ display:"flex", gap:9, alignItems:"center" }}>
                <button className="au-btn-sec" onClick={load} title="Actualiser">
                  <RefreshCw size={13}/>
                </button>
                {/* ── BOUTON PRINCIPAL AJOUT ── */}
                <button className="au-btn-pri" onClick={() => setShowForm(true)}>
                  <UserPlus size={15}/>
                  Ajouter un utilisateur
                </button>
              </div>
            </div>
          </div>

          {/* ══════════════════════════
              KPI CARDS
          ══════════════════════════ */}
          <div className="au-in au-d1" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(158px,1fr))", gap:12, marginBottom:26 }}>
            {[
              { label:"Total comptes",   value:stats.total,  color:C.blue,  bg:`${C.blue}10`, icon:Users        },
              { label:"Comptes actifs",  value:stats.actifs, color:C.green, bg:C.greenPale,   icon:CheckCircle2 },
              { label:"Rôles distincts", value:stats.roles,  color:C.gold,  bg:C.goldPale,    icon:Award        },
            ].map((s,i)=>{
              const SI = s.icon;
              return (
                <div key={i} style={{ background:C.surface, borderRadius:16, padding:"17px 15px", border:`1px solid ${C.divider}`, boxShadow:`0 2px 14px ${C.shadow}`, position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:2.5, background:s.color, borderRadius:"16px 16px 0 0" }}/>
                  <div style={{ width:36, height:36, borderRadius:10, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:11 }}>
                    <SI size={16} color={s.color}/>
                  </div>
                  <p className="au-serif" style={{ fontSize:27, fontWeight:700, color:C.textPri, lineHeight:1, letterSpacing:"-1px" }}>{s.value}</p>
                  <p style={{ fontSize:11.5, color:C.textMuted, marginTop:5 }}>{s.label}</p>
                </div>
              );
            })}
          </div>

          {/* ══════════════════════════
              BARRE FILTRES + RECHERCHE
          ══════════════════════════ */}
          <div className="au-in au-d2" style={{ background:C.surface, border:`1px solid ${C.divider}`, borderRadius:16, padding:"13px 18px", marginBottom:18, display:"flex", alignItems:"center", gap:12, flexWrap:"wrap", boxShadow:`0 2px 12px ${C.shadow}` }}>
            {/* Search */}
            <div style={{ position:"relative", flex:"1 1 240px", minWidth:0 }}>
              <Search size={14} color={C.textMuted} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
              <input className="au-input" placeholder="Rechercher par nom, email, rôle…" value={search}
                onChange={e => setSearch(e.target.value)} style={{ paddingLeft:38 }}/>
            </div>
            {/* Filtre rôle */}
            <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
              {["tous", ...uniqueRoles.slice(0,4)].map(r => (
                <button key={r} onClick={()=>setFilterRole(r)} style={{
                  padding:"6px 13px", borderRadius:20, cursor:"pointer",
                  fontSize:11.5, fontWeight:700, fontFamily:"'Outfit',sans-serif",
                  border: filterRole===r ? `1.5px solid ${C.blue}` : `1px solid ${C.divider}`,
                  background: filterRole===r ? `${C.blue}10` : C.surfaceEl,
                  color: filterRole===r ? C.blue : C.textMuted,
                  transition:"all .14s",
                }}>{r === "tous" ? "Tous" : r}</button>
              ))}
            </div>
            <p style={{ fontSize:12, color:C.textMuted, flexShrink:0 }}>
              <span style={{ fontWeight:700, color:C.textSub }}>{filtered.length}</span> résultat{filtered.length>1?"s":""}
            </p>
          </div>

          {/* ══════════════════════════
              LISTE UTILISATEURS
          ══════════════════════════ */}
          <div className="au-in au-d3">
            {loading ? (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"64px 0", gap:14 }}>
                <Loader2 size={28} color={C.blue} className="au-spin"/>
                <p style={{ fontSize:13, color:C.textMuted }}>Chargement des utilisateurs…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"64px 0", gap:13, background:C.surface, borderRadius:18, border:`1px solid ${C.divider}` }}>
                <div style={{ width:54, height:54, borderRadius:15, background:C.surfaceEl, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Users size={24} color={C.textMuted}/>
                </div>
                <p className="au-serif" style={{ fontSize:16, fontWeight:600, color:C.textSub }}>Aucun utilisateur trouvé</p>
                <p style={{ fontSize:12.5, color:C.textMuted }}>{search?"Modifiez votre recherche":"Ajoutez un premier utilisateur"}</p>
                {!search && (
                  <button className="au-btn-pri" onClick={()=>setShowForm(true)} style={{ marginTop:6 }}>
                    <UserPlus size={14}/> Ajouter un utilisateur
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display:"grid", gap:10 }}>
                {filtered.map((u, i) => {
                  const rn  = roleName(u);
                  return (
                    <div key={u.id} className="au-card" style={{ animationDelay:`${i*.04}s` }}>
                      <Initials user={u} size={46}/>

                      {/* Infos */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:9, flexWrap:"wrap", marginBottom:5 }}>
                          <p className="au-serif" style={{ fontSize:14.5, fontWeight:700, color:C.textPri, letterSpacing:"-.2px" }}>
                            {[u.first_name,u.last_name].filter(Boolean).join(" ") || u.username}
                          </p>
                          {rn && <RoleBadge role={u.role}/>}
                          {u.is_active === false && (
                            <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, background:C.dangerPale, color:C.danger, border:`1px solid ${C.danger}25` }}>Inactif</span>
                          )}
                        </div>
                        <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
                          {u.email && (
                            <span style={{ fontSize:11.5, color:C.textMuted, display:"flex", alignItems:"center", gap:5 }}>
                              <Mail size={11} color={C.textMuted}/>{u.email}
                            </span>
                          )}
                          {(u.region?.name||u.region) && (
                            <span style={{ fontSize:11.5, color:C.textMuted, display:"flex", alignItems:"center", gap:5 }}>
                              <MapPin size={11} color={C.textMuted}/>{u.region?.name||u.region}
                            </span>
                          )}
                          {(u.centre?.name||u.centre) && (
                            <span style={{ fontSize:11.5, color:C.textMuted, display:"flex", alignItems:"center", gap:5 }}>
                              <Building2 size={11} color={C.textMuted}/>{u.centre?.name||u.centre}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bouton Détails */}
                      <button className="au-act-btn" onClick={()=>setDetailUser(u)}>
                        <Eye size={12}/> <span className="au-hide-sm">Détails</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Modals ── */}
      {showForm && (
        <UserFormModal
          token={token}
          roles={roles}
          onClose={()=>setShowForm(false)}
          onSuccess={handleCreated}
        />
      )}
      {detailUser && !editUser && !deleteUser && (
        <UserDetailModal
          user={detailUser}
          onClose={()=>setDetailUser(null)}
          onEdit={()=>{ setEditUser(detailUser); setDetailUser(null); }}
          onDelete={()=>{ setDeleteUser(detailUser); setDetailUser(null); }}
        />
      )}
      {editUser && (
        <UserEditModal
          user={editUser}
          token={token}
          roles={roles}
          onClose={()=>setEditUser(null)}
          onSaved={handleSaved}
        />
      )}
      {deleteUser && (
        <UserDeleteModal
          user={deleteUser}
          token={token}
          onClose={()=>setDeleteUser(null)}
          onDeleted={handleDeleted}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type}/>}
    </>
  );
};

export default AddUser;