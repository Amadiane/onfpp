import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserCog, ShieldCheck, MapPin, Eye, EyeOff, CheckCircle2, AlertTriangle,
  ArrowLeft, UserPlus, Users, Search, Mail, Phone, Building2,
  ChevronRight, X, Edit2, Trash2, MoreVertical, RefreshCw,
} from "lucide-react";
import CONFIG from "../../config/config.js";

const C = {
  bg:         "#F0F4FF",
  surface:    "#FFFFFF",
  surfaceAlt: "#EEF2FF",
  navy:       "#0D1B5E",
  blue:       "#1A3BD4",
  steel:      "#3A6FFF",
  iceBlue:    "#C8D9FF",
  textSub:    "#4A5A8A",
  textMuted:  "#8FA3D8",
  success:    "#0BA376",
  danger:     "#E53935",
  accent:     "#F5A800",
  shadow:     "rgba(26,59,212,0.10)",
};

const ROLE_STYLE = {
  "Directeur Général":         { bg:"#EEF2FF", text:"#1A3BD4", border:"#C7D2FE" },
  "Directeur Général Adjoint": { bg:"#EEF2FF", text:"#1A3BD4", border:"#C7D2FE" },
  "Chef de Division":          { bg:"#EEF2FF", text:"#1A3BD4", border:"#C7D2FE" },
  "Chef de Section":           { bg:"#F0FDF4", text:"#15803D", border:"#86EFAC" },
  "Chef d'Antenne":            { bg:"#FFF7ED", text:"#C2410C", border:"#FED7AA" },
  "Formateur":                 { bg:"#F0F9FF", text:"#0369A1", border:"#BAE6FD" },
  "Conseiller":                { bg:"#F5F3FF", text:"#7C3AED", border:"#DDD6FE" },
  "Entreprise":                { bg:"#FFFBEB", text:"#D97706", border:"#FDE68A" },
};
const getRoleStyle = (name) =>
  ROLE_STYLE[name] || { bg:"#EEF2FF", text:C.textSub, border:C.iceBlue };

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

/* ═══════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL — deux vues : liste / formulaire
═══════════════════════════════════════════════════════════ */
const AddUser = () => {
  const navigate   = useNavigate();
  const token      = localStorage.getItem("access");
  const [view, setView] = useState("list"); // "list" | "form"

  return view === "list"
    ? <UsersList token={token} onAdd={() => setView("form")} navigate={navigate}/>
    : <UserForm  token={token} onBack={() => setView("list")} onSuccess={() => setView("list")}/>;
};

/* ═══════════════════════════════════════════════════════════
   VUE LISTE
═══════════════════════════════════════════════════════════ */
const UsersList = ({ token, onAdd, navigate }) => {
  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [search,      setSearch]      = useState("");
  const [detail,      setDetail]      = useState(null); // user sélectionné pour modal
  const [menuOpen,    setMenuOpen]    = useState(null);

  const load = async () => {
    if (!token) { setLoading(false); return; }
    setLoading(true); setError("");
    try {
      const res = await authFetch("/api/users/", token);
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : (data.results || []));
      } else {
        setError(`Erreur ${res.status} lors du chargement des utilisateurs.`);
      }
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [token]);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (
      u.username?.toLowerCase().includes(q) ||
      u.first_name?.toLowerCase().includes(q) ||
      u.last_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.name?.toLowerCase().includes(q) ||
      u.role?.toLowerCase?.().includes(q)
    );
  });

  const displayName = (u) =>
    [u.first_name, u.last_name].filter(Boolean).join(" ") || u.username;

  const roleName = (u) =>
    typeof u.role === "object" ? u.role?.name : u.role || "—";

  const initials = (u) => {
    const n = displayName(u);
    return n.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  };

  const AVATAR_COLORS = [
    ["#1A3BD4","#EEF2FF"], ["#15803D","#F0FDF4"],
    ["#7C3AED","#F5F3FF"], ["#C2410C","#FFF7ED"],
    ["#0369A1","#F0F9FF"], ["#D97706","#FFFBEB"],
  ];
  const avatarColor = (u) => AVATAR_COLORS[(u.id || 0) % AVATAR_COLORS.length];

  return (
    <div style={{ fontFamily:"'Syne',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');`}</style>

      {/* ── En-tête ── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:C.navy, lineHeight:1 }}>
            Utilisateurs
          </h1>
          <p style={{ fontSize:12, color:C.textMuted, marginTop:4 }}>
            {users.length} compte{users.length !== 1 ? "s" : ""} enregistré{users.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <button onClick={load} style={{ width:36, height:36, borderRadius:10, background:C.surfaceAlt, border:`1.5px solid ${C.iceBlue}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <RefreshCw size={15} color={C.textSub}/>
          </button>
          <button
            onClick={onAdd}
            style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 18px", borderRadius:12, border:"none", background:`linear-gradient(135deg,${C.navy},${C.blue})`, color:"#fff", fontSize:13, fontWeight:800, cursor:"pointer", boxShadow:`0 4px 16px ${C.shadow}`, fontFamily:"'Syne',sans-serif" }}
          >
            <UserPlus size={15}/> Ajouter un utilisateur
          </button>
        </div>
      </div>

      {/* ── Barre de recherche ── */}
      <div style={{ position:"relative", marginBottom:20 }}>
        <Search size={14} color={C.textMuted} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par nom, email, rôle…"
          style={{ width:"100%", padding:"11px 14px 11px 38px", borderRadius:12, border:`1.5px solid ${C.iceBlue}`, background:C.surface, fontSize:13, color:C.navy, fontFamily:"'Syne',sans-serif", outline:"none", boxSizing:"border-box" }}
        />
        {search && (
          <button onClick={() => setSearch("")} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.textMuted }}>
            <X size={14}/>
          </button>
        )}
      </div>

      {/* ── Contenu ── */}
      {loading ? (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:200, gap:12, color:C.textMuted }}>
          <RefreshCw size={18} style={{ animation:"spin 1s linear infinite" }}/>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          Chargement…
        </div>
      ) : error ? (
        <div style={{ background:"#FFF1F2", border:"1.5px solid #FECDD3", borderRadius:14, padding:"16px 20px", display:"flex", gap:10, alignItems:"center" }}>
          <AlertTriangle size={16} color={C.danger}/>
          <p style={{ fontSize:13, color:C.danger, fontWeight:600 }}>{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px 20px", color:C.textMuted }}>
          <Users size={40} style={{ margin:"0 auto 12px", opacity:.3 }}/>
          <p style={{ fontSize:14, fontWeight:700 }}>
            {search ? "Aucun résultat pour cette recherche." : "Aucun utilisateur enregistré."}
          </p>
        </div>
      ) : (
        <div style={{ display:"grid", gap:10 }}>
          {filtered.map(u => {
            const [avatarText, avatarBg] = avatarColor(u);
            const rs = getRoleStyle(roleName(u));
            return (
              <div
                key={u.id}
                style={{ background:C.surface, border:`1.5px solid #EEF2FF`, borderRadius:16, padding:"14px 18px", display:"flex", alignItems:"center", gap:14, transition:"all .18s", cursor:"default", boxShadow:"0 1px 8px rgba(13,27,94,0.05)" }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow="0 4px 20px rgba(13,27,94,0.10)"; e.currentTarget.style.borderColor=C.iceBlue; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow="0 1px 8px rgba(13,27,94,0.05)"; e.currentTarget.style.borderColor="#EEF2FF"; }}
              >
                {/* Avatar */}
                <div style={{ width:44, height:44, borderRadius:14, background:`${avatarBg}`, border:`2px solid ${avatarText}22`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <span style={{ fontSize:14, fontWeight:800, color:avatarText }}>{initials(u)}</span>
                </div>

                {/* Infos principales */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                    <p style={{ fontSize:14, fontWeight:800, color:C.navy }}>{displayName(u)}</p>
                    <span style={{ fontSize:10, fontWeight:700, padding:"2px 9px", borderRadius:20, background:rs.bg, color:rs.text, border:`1px solid ${rs.border}` }}>
                      {roleName(u)}
                    </span>
                  </div>
                  <div style={{ display:"flex", gap:12, marginTop:4, flexWrap:"wrap" }}>
                    <span style={{ fontSize:11, color:C.textMuted, display:"flex", alignItems:"center", gap:4 }}>
                      <Mail size={10}/>{u.email || "—"}
                    </span>
                    {(u.region?.name || u.region) && (
                      <span style={{ fontSize:11, color:C.textMuted, display:"flex", alignItems:"center", gap:4 }}>
                        <MapPin size={10}/>{u.region?.name || u.region}
                      </span>
                    )}
                    {(u.centre?.name || u.centre) && (
                      <span style={{ fontSize:11, color:C.textMuted, display:"flex", alignItems:"center", gap:4 }}>
                        <Building2 size={10}/>{u.centre?.name || u.centre}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bouton Détails */}
                <button
                  onClick={() => setDetail(u)}
                  style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:10, border:`1.5px solid ${C.iceBlue}`, background:C.surfaceAlt, color:C.textSub, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'Syne',sans-serif", flexShrink:0, transition:"all .15s" }}
                  onMouseEnter={e => { e.currentTarget.style.background=C.blue; e.currentTarget.style.color="#fff"; e.currentTarget.style.borderColor=C.blue; }}
                  onMouseLeave={e => { e.currentTarget.style.background=C.surfaceAlt; e.currentTarget.style.color=C.textSub; e.currentTarget.style.borderColor=C.iceBlue; }}
                >
                  <Eye size={12}/> Détails
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal Détails ── */}
      {detail && (
        <div
          onClick={() => setDetail(null)}
          style={{ position:"fixed", inset:0, background:"rgba(13,27,94,0.35)", backdropFilter:"blur(4px)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background:C.surface, borderRadius:24, padding:28, width:"100%", maxWidth:440, boxShadow:"0 24px 80px rgba(13,27,94,0.25)", border:`1.5px solid #EEF2FF`, position:"relative" }}
          >
            {/* Fermer */}
            <button onClick={() => setDetail(null)} style={{ position:"absolute", top:16, right:16, width:32, height:32, borderRadius:10, background:C.surfaceAlt, border:`1.5px solid ${C.iceBlue}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              <X size={14} color={C.textSub}/>
            </button>

            {/* Avatar + nom */}
            {(() => {
              const [avatarText, avatarBg] = avatarColor(detail);
              const rs = getRoleStyle(roleName(detail));
              return (
                <>
                  <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20 }}>
                    <div style={{ width:60, height:60, borderRadius:18, background:avatarBg, border:`2px solid ${avatarText}33`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <span style={{ fontSize:20, fontWeight:800, color:avatarText }}>{initials(detail)}</span>
                    </div>
                    <div>
                      <p style={{ fontSize:18, fontWeight:800, color:C.navy }}>{displayName(detail)}</p>
                      <span style={{ display:"inline-block", marginTop:4, fontSize:11, fontWeight:700, padding:"3px 11px", borderRadius:20, background:rs.bg, color:rs.text, border:`1px solid ${rs.border}` }}>
                        {roleName(detail)}
                      </span>
                    </div>
                  </div>

                  {/* Détails */}
                  {[
                    { label:"Nom d'utilisateur", value: detail.username },
                    { label:"Email",             value: detail.email || "—" },
                    { label:"Prénom",            value: detail.first_name || "—" },
                    { label:"Nom",               value: detail.last_name  || "—" },
                    { label:"Région / Section",  value: detail.region?.name || detail.region || "—" },
                    { label:"Antenne / Centre",  value: detail.centre?.name || detail.centre || "—" },
                    { label:"Niveau d'accès",    value: detail.role?.level !== undefined ? `Niveau ${detail.role.level}` : "—" },
                    { label:"Statut",            value: detail.is_active !== false ? "Actif" : "Inactif" },
                  ].map(row => (
                    <div key={row.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:"1px solid #F0F4FF" }}>
                      <span style={{ fontSize:12, color:C.textMuted, fontWeight:600 }}>{row.label}</span>
                      <span style={{ fontSize:13, fontWeight:700, color:C.navy }}>{row.value}</span>
                    </div>
                  ))}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   VUE FORMULAIRE (identique à l'ancien AddUser)
═══════════════════════════════════════════════════════════ */
const UserForm = ({ token, onBack, onSuccess }) => {
  const [roles,       setRoles]       = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [formError,   setFormError]   = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [focused,     setFocused]     = useState({});

  const [form, setForm] = useState({
    username:"", firstName:"", lastName:"",
    email:"", password:"", role:"", region:"", centre:"",
  });

  useEffect(() => {
    if (!token) { setLoadingData(false); return; }
    const fetchRoles = async () => {
      setLoadingData(true);
      try {
        const res = await authFetch(CONFIG.API_ROLES, token);
        if (res.ok) {
          const data = await res.json();
          setRoles(Array.isArray(data) ? data : (data.results || []));
        }
      } catch {}
      finally { setLoadingData(false); }
    };
    fetchRoles();
  }, [token]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError("");
  };

  const validate = () => {
    if (!form.username.trim())    return "Le nom d'utilisateur est requis.";
    if (!form.email.trim())       return "L'email est requis.";
    if (!form.password.trim())    return "Le mot de passe est requis.";
    if (form.password.length < 6) return "Le mot de passe doit faire au moins 6 caractères.";
    if (!form.role)               return "Veuillez sélectionner un rôle.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setFormError(err); return; }

    setSubmitting(true);
    const roleId  = Number(form.role);
    const roleObj = roles.find(r => String(r.id) === String(form.role));

    const payload = {
      username:   form.username.trim(),
      first_name: form.firstName.trim(),
      last_name:  form.lastName.trim(),
      email:      form.email.trim(),
      password:   form.password,
      ...(Number.isInteger(roleId) && roleId > 0
        ? { role: roleId }
        : { role_name: roleObj?.name || form.role }
      ),
      ...(form.region.trim() && { region_name: form.region.trim() }),
      ...(form.centre.trim() && { centre_name: form.centre.trim() }),
    };

    try {
      const res = await authFetch(CONFIG.API_CREATE_USER, token, {
        method: "POST", body: JSON.stringify(payload),
      });
      if (res.ok || res.status === 201) {
        setSuccess(true);
        setTimeout(() => onSuccess(), 1600);
      } else {
        const data = await res.json().catch(() => ({}));
        setFormError(Object.entries(data).map(([k,v]) => `${k}: ${Array.isArray(v)?v.join(", "):v}`).join(" | ") || `Erreur ${res.status}`);
      }
    } catch {
      setFormError("Erreur réseau.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = (name) => ({
    width:"100%", padding:"10px 14px", borderRadius:10,
    border:`1.5px solid ${focused[name]?C.blue:C.iceBlue}`,
    background:C.surface, fontSize:13, color:C.navy,
    fontFamily:"'Syne',sans-serif", outline:"none",
    boxShadow:focused[name]?`0 0 0 3px ${C.blue}15`:"none",
    transition:"all .15s",
  });

  const fp = (name) => ({
    onFocus:()=>setFocused(p=>({...p,[name]:true})),
    onBlur: ()=>setFocused(p=>({...p,[name]:false})),
    style:  inputStyle(name),
  });

  const Label = ({ children, required: req }) => (
    <label style={{ display:"block", fontSize:12, fontWeight:700, color:C.textSub, marginBottom:6 }}>
      {children}{req && <span style={{ color:C.danger }}> *</span>}
    </label>
  );

  const SectionHead = ({ icon: Icon, title, color }) => (
    <div style={{ display:"flex", alignItems:"center", gap:8, margin:"22px 0 14px" }}>
      <div style={{ width:3, height:18, borderRadius:2, background:color }}/>
      <div style={{ width:26, height:26, borderRadius:8, background:`${color}14`, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Icon size={13} color={color}/>
      </div>
      <p style={{ fontSize:13, fontWeight:800, color:C.navy }}>{title}</p>
    </div>
  );

  if (success) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:300, gap:16 }}>
      <div style={{ width:64, height:64, borderRadius:20, background:"#F0FDF4", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <CheckCircle2 size={32} color={C.success}/>
      </div>
      <p style={{ fontSize:16, fontWeight:800, color:C.navy }}>Utilisateur créé avec succès !</p>
      <p style={{ fontSize:12, color:C.textMuted }}>Retour à la liste…</p>
    </div>
  );

  const ROLE_GROUPES = [
    { groupe:"Direction",    color:C.blue,    bg:"#EEF2FF", border:"#C7D2FE", noms:["Directeur Général","Directeur Général Adjoint","Chef de Division"] },
    { groupe:"Encadrement",  color:"#15803D", bg:"#F0FDF4", border:"#86EFAC", noms:["Chef de Section","Chef d'Antenne"] },
    { groupe:"Opérationnel", color:"#7C3AED", bg:"#F5F3FF", border:"#DDD6FE", noms:["Formateur","Conseiller","Entreprise"] },
  ];

  return (
    <div style={{ maxWidth:760, margin:"0 auto" }}>
      {/* En-tête */}
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:24 }}>
        <button type="button" onClick={onBack} style={{ width:36, height:36, borderRadius:10, background:C.surfaceAlt, border:`1.5px solid ${C.iceBlue}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
          <ArrowLeft size={15} color={C.textSub}/>
        </button>
        <div style={{ flex:1 }}>
          <h1 style={{ fontSize:20, fontWeight:800, color:C.navy, lineHeight:1 }}>Nouvel utilisateur</h1>
          <p style={{ fontSize:12, color:C.textMuted, marginTop:4 }}>Remplir le formulaire pour créer un compte</p>
        </div>
        <div style={{ width:42, height:42, borderRadius:12, background:`linear-gradient(135deg,${C.navy},${C.blue})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <UserPlus size={20} color="#fff"/>
        </div>
      </div>

      <div style={{ background:C.surface, borderRadius:20, padding:28, boxShadow:`0 2px 20px ${C.shadow}`, border:"1.5px solid #EEF2FF" }}>
        <form onSubmit={handleSubmit}>

          <SectionHead icon={UserCog} title="Identité" color={C.blue}/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div><Label>Prénom</Label><input name="firstName" value={form.firstName} onChange={handleChange} placeholder="ex : Mamadou" {...fp("firstName")}/></div>
            <div><Label>Nom</Label><input name="lastName" value={form.lastName} onChange={handleChange} placeholder="ex : Diallo" {...fp("lastName")}/></div>
            <div><Label required>Nom d'utilisateur</Label><input name="username" value={form.username} onChange={handleChange} placeholder="ex : m.diallo" required {...fp("username")}/></div>
            <div><Label required>Email</Label><input name="email" type="email" value={form.email} onChange={handleChange} placeholder="ex : m.diallo@onfpp.gn" required {...fp("email")}/></div>
          </div>

          <div style={{ marginTop:14 }}>
            <Label required>Mot de passe</Label>
            <div style={{ position:"relative" }}>
              <input name="password" type={showPass?"text":"password"} value={form.password} onChange={handleChange} placeholder="Min. 6 caractères" required {...fp("password")} style={{ ...inputStyle("password"), paddingRight:44 }}/>
              <button type="button" onClick={() => setShowPass(p=>!p)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.textMuted }}>
                {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
          </div>

          <SectionHead icon={ShieldCheck} title="Rôle & accès" color={C.navy}/>
          {loadingData ? <p style={{ fontSize:12, color:C.textMuted }}>Chargement…</p> : (
            <div>
              {ROLE_GROUPES.map(g => {
                const items = roles.length > 0
                  ? roles.filter(r => g.noms.some(n => r.name.toLowerCase().includes(n.toLowerCase()) || n.toLowerCase().includes(r.name.toLowerCase())))
                  : g.noms.map(n => ({ id:n, name:n }));
                if (!items.length) return null;
                return (
                  <div key={g.groupe} style={{ marginBottom:14 }}>
                    <p style={{ fontSize:10, fontWeight:800, color:g.color, textTransform:"uppercase", letterSpacing:".1em", marginBottom:8 }}>{g.groupe}</p>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                      {items.map(r => {
                        const sel = String(form.role) === String(r.id);
                        return (
                          <button key={r.id} type="button"
                            onClick={() => { setForm(p=>({...p,role:String(r.id)})); setFormError(""); }}
                            style={{ padding:"9px 16px", borderRadius:10, border:`2px solid ${sel?g.color:g.border}`, background:sel?g.color:g.bg, color:sel?"#fff":g.color, fontSize:12, fontWeight:sel?800:600, cursor:"pointer", fontFamily:"'Syne',sans-serif", display:"flex", alignItems:"center", gap:6, transition:"all .15s", boxShadow:sel?`0 4px 14px ${g.color}40`:"none", transform:sel?"translateY(-1px)":"none" }}
                          >
                            <span style={{ width:14, height:14, borderRadius:"50%", border:`2px solid ${sel?"#fff":g.color}`, background:sel?"#fff":"transparent", display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                              {sel && <span style={{ width:6, height:6, borderRadius:"50%", background:g.color }}/>}
                            </span>
                            {r.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {form.role && (
                <div style={{ padding:"8px 12px", background:"#F0FDF4", border:"1.5px solid #86EFAC", borderRadius:10, display:"flex", alignItems:"center", gap:8, marginTop:4 }}>
                  <ShieldCheck size={13} color="#15803D"/>
                  <p style={{ fontSize:12, color:"#15803D", fontWeight:700 }}>
                    Sélectionné : {roles.find(r=>String(r.id)===String(form.role))?.name || form.role}
                  </p>
                </div>
              )}
            </div>
          )}

          <SectionHead icon={MapPin} title="Localisation" color="#15803D"/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div><Label>Région / Section</Label><input name="region" value={form.region} onChange={handleChange} placeholder="ex : Conakry" {...fp("region")}/></div>
            <div><Label>Antenne / Centre</Label><input name="centre" value={form.centre} onChange={handleChange} placeholder="ex : Antenne de Ratoma" {...fp("centre")}/></div>
          </div>

          {formError && (
            <div style={{ marginTop:18, background:"#FFF1F2", border:"1.5px solid #FECDD3", borderRadius:12, padding:"12px 16px", display:"flex", gap:10 }}>
              <AlertTriangle size={15} color={C.danger} style={{ flexShrink:0, marginTop:1 }}/>
              <p style={{ fontSize:12, color:C.danger, fontWeight:600 }}>{formError}</p>
            </div>
          )}

          <div style={{ display:"flex", gap:12, marginTop:28, paddingTop:20, borderTop:"1px solid #EEF2FF" }}>
            <button type="button" onClick={onBack} style={{ flex:1, padding:"12px", borderRadius:12, border:`1.5px solid ${C.iceBlue}`, background:C.surfaceAlt, color:C.textSub, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Syne',sans-serif" }}>Annuler</button>
            <button type="submit" disabled={submitting||!token} style={{ flex:2, padding:"12px", borderRadius:12, border:"none", background:(submitting||!token)?C.textMuted:`linear-gradient(135deg,${C.navy},${C.blue})`, color:"#fff", fontSize:13, fontWeight:800, cursor:(submitting||!token)?"not-allowed":"pointer", fontFamily:"'Syne',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"all .2s" }}>
              {submitting ? "Création en cours…" : <><UserPlus size={15}/> Créer l'utilisateur</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;