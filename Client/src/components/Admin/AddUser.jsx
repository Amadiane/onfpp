import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserCog, ShieldCheck, MapPin, Eye, EyeOff, CheckCircle2, AlertTriangle,
  ArrowLeft, UserPlus
} from "lucide-react";
import CONFIG from "../../config/config.js";

const C = {
  bg:         "#F0F4FF",
  surface:    "#FFFFFF",
  surfaceAlt: "#EEF2FF",
  navy:       "#0D1B5E",
  blue:       "#1A3BD4",
  iceBlue:    "#C8D9FF",
  textSub:    "#4A5A8A",
  textMuted:  "#8FA3D8",
  success:    "#0BA376",
  danger:     "#E53935",
  shadow:     "rgba(26,59,212,0.10)",
};

/* ─────────────────────────────────────────────────────────────
   authFetch — construit l'URL correctement
   CONFIG.BASE_URL  = "http://127.0.0.1:8000"  (sans slash final)
   CONFIG.API_ROLES = "/api/roles/"             (avec slash initial)
   → on évite la double concaténation
───────────────────────────────────────────────────────────── */
const authFetch = (path, token, options = {}) => {
  // path peut être "/api/roles/" ou "http://..." (URL complète)
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

const AddUser = () => {
  const navigate = useNavigate();
  const token    = localStorage.getItem("access");

  const [roles,       setRoles]       = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [formError,   setFormError]   = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [focused,     setFocused]     = useState({});

  const [form, setForm] = useState({
    username:  "",
    firstName: "",
    lastName:  "",
    email:     "",
    password:  "",
    role:      "",    // ID numérique (select)
    region:    "",    // texte libre → backend fait get_or_create
    centre:    "",    // texte libre → backend fait get_or_create
  });

  /* ── Chargement des rôles ── */
  useEffect(() => {
    if (!token) { setLoadingData(false); return; }

    const fetchRoles = async () => {
      setLoadingData(true);
      try {
        // CONFIG.API_ROLES = "/api/roles/" → authFetch ajoute BASE_URL
        const res = await authFetch(CONFIG.API_ROLES, token);
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (data.results || []);
          setRoles(list);
        } else {
          console.warn(`Roles API → ${res.status}`);
        }
      } catch (e) {
        console.error("fetchRoles:", e);
      } finally {
        setLoadingData(false);
      }
    };

    fetchRoles();
  }, [token]);

  /* ── Handlers ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
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
    if (!token) { setFormError("Vous devez être connecté."); return; }

    setSubmitting(true);
    setFormError("");

    /* Payload — si rôle local (id = string "dg" etc.) → envoie role_name
       Si rôle API (id = entier)                       → envoie role (ID)  */
    const roleId  = Number(form.role);
    const roleObj = roles.find(r => String(r.id) === String(form.role));

    const payload = {
      username:   form.username.trim(),
      first_name: form.firstName.trim(),
      last_name:  form.lastName.trim(),
      email:      form.email.trim(),
      password:   form.password,
      /* role : ID numérique si dispo, sinon nom pour get_or_create côté Django */
      ...(Number.isInteger(roleId) && roleId > 0
          ? { role: roleId }
          : { role_name: roleObj?.name || form.role }
      ),
      ...(form.region.trim() && { region_name: form.region.trim() }),
      ...(form.centre.trim() && { centre_name: form.centre.trim() }),
    };

    try {
      const res = await authFetch(
        CONFIG.API_CREATE_USER,   // "/api/users/create/"
        token,
        { method: "POST", body: JSON.stringify(payload) }
      );

      if (res.ok || res.status === 201) {
        setSuccess(true);
        setTimeout(() => navigate("/utilisateurs"), 1800);
      } else {
        const data = await res.json().catch(() => ({}));
        const msg  = Object.entries(data)
          .map(([k, v]) => `${k} : ${Array.isArray(v) ? v.join(", ") : v}`)
          .join(" | ") || `Erreur ${res.status}`;
        setFormError(msg);
      }
    } catch {
      setFormError("Erreur réseau. Vérifiez votre connexion.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Styles ── */
  const inputStyle = (name) => ({
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: `1.5px solid ${focused[name] ? C.blue : C.iceBlue}`,
    background: C.surface, fontSize: 13, color: C.navy,
    fontFamily: "'Syne',sans-serif", outline: "none",
    boxShadow: focused[name] ? `0 0 0 3px ${C.blue}15` : "none",
    transition: "all .15s",
  });

  const fp = (name) => ({
    onFocus: () => setFocused(p => ({ ...p, [name]: true  })),
    onBlur:  () => setFocused(p => ({ ...p, [name]: false })),
    style:   inputStyle(name),
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

  /* ── Succès ── */
  if (success) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:300, gap:16, fontFamily:"'Syne',sans-serif" }}>
      <div style={{ width:64, height:64, borderRadius:20, background:"#F0FDF4", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <CheckCircle2 size={32} color={C.success}/>
      </div>
      <p style={{ fontSize:16, fontWeight:800, color:C.navy }}>Utilisateur créé avec succès !</p>
      <p style={{ fontSize:12, color:C.textMuted }}>Redirection en cours…</p>
    </div>
  );

  /* ── Formulaire ── */
  return (
    <div style={{ maxWidth:760, margin:"0 auto", fontFamily:"'Syne',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');`}</style>

      {/* En-tête */}
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:28 }}>
        <button type="button" onClick={() => navigate(-1)} style={{ width:36, height:36, borderRadius:10, background:C.surfaceAlt, border:`1.5px solid ${C.iceBlue}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
          <ArrowLeft size={15} color={C.textSub}/>
        </button>
        <div style={{ flex:1 }}>
          <h1 style={{ fontSize:20, fontWeight:800, color:C.navy, lineHeight:1 }}>Ajouter un utilisateur</h1>
          <p style={{ fontSize:12, color:C.textMuted, marginTop:4 }}>Créer un nouveau compte sur la plateforme ONFPP</p>
        </div>
        <div style={{ width:42, height:42, borderRadius:12, background:`linear-gradient(135deg,${C.navy},${C.blue})`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 4px 16px ${C.shadow}` }}>
          <UserPlus size={20} color="#fff"/>
        </div>
      </div>

      {!token && (
        <div style={{ background:"#FFF1F2", border:"1.5px solid #FECDD3", borderRadius:12, padding:"12px 16px", marginBottom:20, display:"flex", gap:10, alignItems:"center" }}>
          <AlertTriangle size={15} color={C.danger}/>
          <p style={{ fontSize:12, color:C.danger, fontWeight:600 }}>Vous devez être connecté pour accéder à cette page.</p>
        </div>
      )}

      <div style={{ background:C.surface, borderRadius:20, padding:28, boxShadow:`0 2px 20px ${C.shadow}`, border:"1.5px solid #EEF2FF" }}>
        <form onSubmit={handleSubmit}>

          {/* ── Identité ── */}
          <SectionHead icon={UserCog} title="Identité" color={C.blue}/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div>
              <Label>Prénom</Label>
              <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="ex : Mamadou" {...fp("firstName")}/>
            </div>
            <div>
              <Label>Nom</Label>
              <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="ex : Diallo" {...fp("lastName")}/>
            </div>
            <div>
              <Label required>Nom d'utilisateur</Label>
              <input name="username" value={form.username} onChange={handleChange} placeholder="ex : m.diallo" required {...fp("username")}/>
            </div>
            <div>
              <Label required>Email</Label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="ex : m.diallo@onfpp.gn" required {...fp("email")}/>
            </div>
          </div>

          {/* ── Mot de passe ── */}
          <div style={{ marginTop:14 }}>
            <Label required>Mot de passe</Label>
            <div style={{ position:"relative" }}>
              <input
                name="password"
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 6 caractères"
                required
                {...fp("password")}
                style={{ ...inputStyle("password"), paddingRight:44 }}
              />
              <button type="button" onClick={() => setShowPass(p => !p)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.textMuted }}>
                {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
          </div>

          {/* ── Rôle — cartes cliquables ── */}
          <SectionHead icon={ShieldCheck} title="Rôle & accès" color={C.navy}/>
          {loadingData ? (
            <p style={{ fontSize:12, color:C.textMuted }}>Chargement des rôles…</p>
          ) : (
            <div>
              {/* Groupes de rôles — définis localement pour l'affichage */}
              {[
                {
                  groupe: "Direction",
                  color: C.blue,
                  bg: "#EEF2FF",
                  border: "#C7D2FE",
                  noms: ["Directeur Général","Directeur Général Adjoint","Chef de Division"],
                },
                {
                  groupe: "Encadrement",
                  color: "#15803D",
                  bg: "#F0FDF4",
                  border: "#86EFAC",
                  noms: ["Chef de Section","Chef d'Antenne"],
                },
                {
                  groupe: "Opérationnel",
                  color: "#7C3AED",
                  bg: "#F5F3FF",
                  border: "#DDD6FE",
                  noms: ["Formateur","Conseiller","Entreprise"],
                },
              ].map(groupe => {
                /* Rôles de ce groupe — depuis l'API ou correspondance par nom */
                const items = roles.length > 0
                  ? roles.filter(r => groupe.noms.some(n =>
                      r.name.toLowerCase().includes(n.toLowerCase()) ||
                      n.toLowerCase().includes(r.name.toLowerCase())
                    ))
                  : groupe.noms.map((n, i) => ({ id: n, name: n }));

                if (items.length === 0) return null;

                return (
                  <div key={groupe.groupe} style={{ marginBottom:16 }}>
                    {/* Label groupe */}
                    <p style={{ fontSize:10, fontWeight:800, color:groupe.color, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>
                      {groupe.groupe}
                    </p>
                    {/* Cartes rôles */}
                    <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                      {items.map(r => {
                        const selected = String(form.role) === String(r.id);
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => { setForm(p => ({ ...p, role: String(r.id) })); setFormError(""); }}
                            style={{
                              padding:"9px 16px",
                              borderRadius:10,
                              border:`2px solid ${selected ? groupe.color : groupe.border}`,
                              background: selected ? groupe.color : groupe.bg,
                              color: selected ? "#fff" : groupe.color,
                              fontSize:12,
                              fontWeight: selected ? 800 : 600,
                              cursor:"pointer",
                              fontFamily:"'Syne',sans-serif",
                              display:"flex",
                              alignItems:"center",
                              gap:6,
                              transition:"all .15s",
                              boxShadow: selected ? `0 4px 14px ${groupe.color}40` : "none",
                              transform: selected ? "translateY(-1px)" : "none",
                            }}
                          >
                            {/* Pastille sélection */}
                            <span style={{
                              width:14, height:14, borderRadius:"50%",
                              border:`2px solid ${selected ? "#fff" : groupe.color}`,
                              background: selected ? "#fff" : "transparent",
                              display:"inline-flex", alignItems:"center", justifyContent:"center",
                              flexShrink:0,
                            }}>
                              {selected && (
                                <span style={{ width:6, height:6, borderRadius:"50%", background:groupe.color }}/>
                              )}
                            </span>
                            {r.name}
                            {r.level !== undefined && (
                              <span style={{ fontSize:10, opacity:0.75, fontWeight:600 }}>niv.{r.level}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Rôles non classifiés (venant de l'API et non mappés) */}
              {(() => {
                const groupNoms = ["Directeur Général","Directeur Général Adjoint","Chef de Division","Chef de Section","Chef d'Antenne","Formateur","Conseiller","Entreprise"];
                const autres = roles.filter(r => !groupNoms.some(n =>
                  r.name.toLowerCase().includes(n.toLowerCase()) ||
                  n.toLowerCase().includes(r.name.toLowerCase())
                ));
                if (autres.length === 0) return null;
                return (
                  <div style={{ marginBottom:16 }}>
                    <p style={{ fontSize:10, fontWeight:800, color:C.textSub, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>Autres</p>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                      {autres.map(r => {
                        const selected = String(form.role) === String(r.id);
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => { setForm(p => ({ ...p, role: String(r.id) })); setFormError(""); }}
                            style={{
                              padding:"9px 16px", borderRadius:10,
                              border:`2px solid ${selected ? C.navy : C.iceBlue}`,
                              background: selected ? C.navy : C.surfaceAlt,
                              color: selected ? "#fff" : C.textSub,
                              fontSize:12, fontWeight: selected ? 800 : 600,
                              cursor:"pointer", fontFamily:"'Syne',sans-serif",
                              transition:"all .15s",
                            }}
                          >
                            {r.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Rôle sélectionné — confirmation */}
              {form.role && (
                <div style={{ marginTop:4, padding:"8px 12px", background:"#F0FDF4", border:"1.5px solid #86EFAC", borderRadius:10, display:"flex", alignItems:"center", gap:8 }}>
                  <ShieldCheck size={13} color="#15803D"/>
                  <p style={{ fontSize:12, color:"#15803D", fontWeight:700 }}>
                    Rôle sélectionné : {roles.find(r => String(r.id) === String(form.role))?.name || form.role}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Localisation (texte libre) ── */}
          <SectionHead icon={MapPin} title="Localisation" color="#15803D"/>
          <p style={{ fontSize:11, color:C.textMuted, marginBottom:12, lineHeight:1.5 }}>
            Saisissez le nom exact. S'il n'existe pas encore, il sera créé automatiquement.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div>
              <Label>Région / Section</Label>
              <input
                name="region"
                value={form.region}
                onChange={handleChange}
                placeholder="ex : Conakry"
                {...fp("region")}
              />
            </div>
            <div>
              <Label>Antenne / Centre</Label>
              <input
                name="centre"
                value={form.centre}
                onChange={handleChange}
                placeholder="ex : Antenne de Ratoma"
                {...fp("centre")}
              />
            </div>
          </div>

          {/* Erreur */}
          {formError && (
            <div style={{ marginTop:18, background:"#FFF1F2", border:"1.5px solid #FECDD3", borderRadius:12, padding:"12px 16px", display:"flex", gap:10, alignItems:"flex-start" }}>
              <AlertTriangle size={15} color={C.danger} style={{ flexShrink:0, marginTop:1 }}/>
              <p style={{ fontSize:12, color:C.danger, fontWeight:600 }}>{formError}</p>
            </div>
          )}

          {/* Boutons */}
          <div style={{ display:"flex", gap:12, marginTop:28, paddingTop:20, borderTop:"1px solid #EEF2FF" }}>
            <button type="button" onClick={() => navigate(-1)} style={{ flex:1, padding:"12px", borderRadius:12, border:`1.5px solid ${C.iceBlue}`, background:C.surfaceAlt, color:C.textSub, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Syne',sans-serif" }}>
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting || !token}
              style={{ flex:2, padding:"12px", borderRadius:12, border:"none", background:(submitting||!token)?C.textMuted:`linear-gradient(135deg,${C.navy},${C.blue})`, color:"#fff", fontSize:13, fontWeight:800, cursor:(submitting||!token)?"not-allowed":"pointer", fontFamily:"'Syne',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:submitting?"none":`0 4px 16px ${C.shadow}`, transition:"all .2s" }}
            >
              {submitting ? "Création en cours…" : <><UserPlus size={15}/> Créer l'utilisateur</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddUser;