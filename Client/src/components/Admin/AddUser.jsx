import { useState, useEffect } from "react";
import CONFIG from "../../config/config";
import { apiRequest } from "../../endpoints/api";

// ── Données statiques ────────────────────────────────────────
const NIVEAUX_ACCES = [
  { level: 100, name: "Directeur Général" },
  { level: 90,  name: "Directeur Général Adjoint" },
  { level: 70,  name: "Chef de Division" },
  { level: 60,  name: "Chef de Section" },
  { level: 50,  name: "Chef d'Antenne" },
  { level: 30,  name: "Conseiller" },
];

const DIVISIONS_CHOICES = [
  { code: "DAP", name: "Division Apprentissage et Projets Collectifs" },
  { code: "DSE", name: "Division Suivi Évaluation" },
  { code: "DFC", name: "Division Formation Continue" },
  { code: "DPL", name: "Division Planification" },
];

const ANTENNES_CHOICES = [
  { code: "conakry",    name: "Conakry" },
  { code: "forecariah", name: "Forecariah" },
  { code: "boke",       name: "Boké" },
  { code: "kindia",     name: "Kindia" },
  { code: "labe",       name: "Labé" },
  { code: "mamou",      name: "Mamou" },
  { code: "faranah",    name: "Faranah" },
  { code: "kankan",     name: "Kankan" },
  { code: "siguiri",    name: "Siguiri" },
  { code: "nzerekore",  name: "N'Zérékoré" },
];

// ── Helpers ──────────────────────────────────────────────────
function getDivisionName(code) {
  if (!code) return null;
  return DIVISIONS_CHOICES.find(d => d.code === code)?.name || code;
}
function getAntenneName(code) {
  if (!code) return null;
  return ANTENNES_CHOICES.find(a => a.code === code)?.name || code;
}

// ── Palette ──────────────────────────────────────────────────
const C = {
  navy:      "#0D1B5E",
  blue:      "#1A3BD4",
  iceBlue:   "#C8D9FF",
  textSub:   "#4A5A8A",
  textMuted: "#8FA3D8",
  surface:   "#FFFFFF",
  bg:        "#EEF3FF",
  danger:    "#DC2626",
  success:   "#16A34A",
  warning:   "#D97706",
  shadow:    "rgba(13,27,94,0.10)",
  border:    "#DDE6FA",
};

const NIVEAU_PALETTE = {
  100: { bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" },
  90:  { bg: "#EDE9FE", text: "#5B21B6", dot: "#7C3AED" },
  70:  { bg: "#DBEAFE", text: "#1D4ED8", dot: "#3B82F6" },
  60:  { bg: "#D1FAE5", text: "#065F46", dot: "#10B981" },
  50:  { bg: "#FFE4E6", text: "#9F1239", dot: "#F43F5E" },
  30:  { bg: "#F0F4FF", text: "#3730A3", dot: "#6366F1" },
};

// ── Composants UI ─────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; }
  .au-btn-icon { transition: all .15s; }
  .au-btn-icon:hover { transform: scale(1.12); }
  .au-row { transition: background .15s; }
  .au-row:hover { background: #F5F8FF !important; }
  .au-card-user:hover { box-shadow: 0 8px 32px rgba(13,27,94,0.13) !important; transform: translateY(-1px); }
  .au-card-user { transition: all .18s; }
  @keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
  .au-form-appear { animation: slideDown .22s ease; }
  @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
  .au-fade { animation: fadeIn .2s ease; }
`;

function Badge({ level }) {
  const p = NIVEAU_PALETTE[level] || { bg: C.iceBlue, text: C.navy, dot: C.blue };
  const label = NIVEAUX_ACCES.find(r => r.level === level)?.name || `N${level}`;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 999,
      fontSize: 11, fontWeight: 700,
      background: p.bg, color: p.text,
      fontFamily: "'Syne', sans-serif", letterSpacing: "0.03em",
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.dot, flexShrink: 0 }} />
      {label}
    </span>
  );
}

function Tag({ icon, text, color = C.textSub }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 8,
      fontSize: 11, fontWeight: 600, color,
      background: `${color}15`,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <span style={{ fontSize: 10 }}>{icon}</span> {text}
    </span>
  );
}

function useField() {
  const [focused, setFocused] = useState(false);
  return {
    style: {
      width: "100%", padding: "10px 13px", borderRadius: 11,
      border: `1.5px solid ${focused ? C.blue : C.border}`,
      background: focused ? "#F5F8FF" : "#FAFBFF",
      fontSize: 13, color: C.navy,
      fontFamily: "'DM Sans', sans-serif",
      outline: "none",
      boxShadow: focused ? `0 0 0 3px ${C.blue}18` : "none",
      transition: "all .16s", boxSizing: "border-box",
    },
    onFocus: () => setFocused(true),
    onBlur:  () => setFocused(false),
  };
}

function FInput({ name, type = "text", placeholder, value, onChange, required }) {
  const f = useField();
  return <input name={name} type={type} placeholder={placeholder} value={value} onChange={onChange} required={required} {...f} />;
}

function FSelect({ name, value, onChange, children, required }) {
  const f = useField();
  return (
    <select name={name} value={value} onChange={onChange} required={required}
      style={{ ...f.style, cursor: "pointer", appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%238FA3D8' d='M5 7L0 2h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: 32,
      }}
      onFocus={f.onFocus} onBlur={f.onBlur}
    >{children}</select>
  );
}

function FL({ label, children }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.textSub, marginBottom: 6, fontFamily: "'Syne',sans-serif" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function SectionDivider({ title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0 16px" }}>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: C.textMuted, textTransform: "uppercase", whiteSpace: "nowrap", fontFamily: "'Syne',sans-serif" }}>{title}</span>
      <div style={{ flex: 1, height: 1, background: C.border }} />
    </div>
  );
}

// ── Modal Confirmation Suppression ───────────────────────────
function DeleteModal({ user, onConfirm, onCancel }) {
  return (
    <div className="au-fade" style={{
      position: "fixed", inset: 0, background: "rgba(13,27,94,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 20,
    }}>
      <div style={{
        background: C.surface, borderRadius: 20, padding: "36px 32px",
        maxWidth: 420, width: "100%",
        boxShadow: `0 24px 80px rgba(13,27,94,0.25)`,
        border: `1px solid ${C.border}`,
      }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🗑️</div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.navy, fontFamily: "'Syne',sans-serif" }}>
            Supprimer l'utilisateur ?
          </h3>
          <p style={{ margin: "10px 0 0", fontSize: 13, color: C.textSub, fontFamily: "'DM Sans',sans-serif" }}>
            Cette action est irréversible. L'utilisateur{" "}
            <strong style={{ color: C.navy }}>{user.username}</strong> sera définitivement supprimé.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: "12px", borderRadius: 12, border: `1.5px solid ${C.border}`,
            background: C.surface, color: C.textSub, fontSize: 13, fontWeight: 700,
            cursor: "pointer", fontFamily: "'Syne',sans-serif",
          }}>Annuler</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: "12px", borderRadius: 12, border: "none",
            background: `linear-gradient(135deg, #DC2626, #B91C1C)`,
            color: "#fff", fontSize: 13, fontWeight: 700,
            cursor: "pointer", fontFamily: "'Syne',sans-serif",
            boxShadow: "0 4px 16px rgba(220,38,38,0.3)",
          }}>Supprimer</button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
//  COMPOSANT PRINCIPAL
// ────────────────────────────────────────────────────────────
export default function AddUser() {
  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [success,     setSuccess]     = useState("");
  const [showForm,    setShowForm]    = useState(false);
  const [editUser,    setEditUser]    = useState(null);   // user en cours d'édition
  const [deleteUser,  setDeleteUser]  = useState(null);  // user à supprimer (modal)

  const emptyForm = {
    username: "", password: "", password_confirm: "",
    first_name: "", last_name: "", email: "",
    role: "", division: "", antenne: "",
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    try {
      const data = await apiRequest(CONFIG.API_USER_LIST);
      setUsers(data);
    } catch (err) { setError(err.message); }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "role") {
      setForm(prev => ({ ...prev, role: value, division: "", antenne: "" }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  }

  const selectedLevel = form.role ? parseInt(form.role) : null;
  const showDivision  = [70, 60].includes(selectedLevel);
  const showAntenne   = [50, 30].includes(selectedLevel);
  const isDGorDGA     = [100, 90].includes(selectedLevel);

  const isFormValid = () => {
    if (!form.username || !form.first_name || !form.last_name || !form.email || !form.role) return false;
    if (!editUser && (!form.password || !form.password_confirm)) return false;
    if (!editUser && form.password !== form.password_confirm) return false;
    if (showDivision && !form.division) return false;
    if (showAntenne  && !form.antenne)  return false;
    return true;
  };

  // ── Ouvrir formulaire création ────────────────────────────
  function openCreate() {
    setEditUser(null);
    setForm(emptyForm);
    setShowForm(true);
    setError("");
  }

  // ── Ouvrir formulaire édition ─────────────────────────────
  function openEdit(u) {
    setEditUser(u);
    const roleLevel = u.role?.level?.toString() || "";
    setForm({
      username:         u.username     || "",
      password:         "",
      password_confirm: "",
      first_name:       u.first_name   || "",
      last_name:        u.last_name    || "",
      email:            u.email        || "",
      role:             roleLevel,
      division:         u.division     || "",
      antenne:          u.antenne      || "",
    });
    setShowForm(true);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── Soumettre création ou modification ────────────────────
  async function submitForm(e) {
    e.preventDefault();
    if (!isFormValid()) return;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const roleName = NIVEAUX_ACCES.find(r => r.level === selectedLevel)?.name || "";

      if (editUser) {
        // MODIFICATION
        const payload = {
          username:   form.username,
          first_name: form.first_name,
          last_name:  form.last_name,
          email:      form.email,
          role_name:  roleName,
          division:   showDivision ? form.division : null,
          antenne:    showAntenne  ? form.antenne  : null,
        };
        if (form.password) {
          payload.password         = form.password;
          payload.password_confirm = form.password_confirm;
        }
        await apiRequest(`${CONFIG.API_USER_LIST}${editUser.id}/`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setSuccess(`Utilisateur "${form.username}" modifié avec succès !`);
      } else {
        // CRÉATION
        const payload = {
          username:         form.username,
          password:         form.password,
          password_confirm: form.password_confirm,
          first_name:       form.first_name,
          last_name:        form.last_name,
          email:            form.email,
          role_name:        roleName,
          division:         showDivision ? form.division : null,
          antenne:          showAntenne  ? form.antenne  : null,
        };
        await apiRequest(CONFIG.API_CREATE_USER, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setSuccess(`Utilisateur "${form.username}" créé avec succès !`);
      }

      setForm(emptyForm);
      setShowForm(false);
      setEditUser(null);
      loadUsers();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  // ── Supprimer ─────────────────────────────────────────────
  async function confirmDelete() {
    if (!deleteUser) return;
    try {
      await apiRequest(`${CONFIG.API_USER_LIST}${deleteUser.id}/`, { method: "DELETE" });
      setSuccess(`Utilisateur "${deleteUser.username}" supprimé.`);
      setDeleteUser(null);
      loadUsers();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.message);
      setDeleteUser(null);
    }
  }

  // ── Fermer formulaire ─────────────────────────────────────
  function closeForm() {
    setShowForm(false);
    setEditUser(null);
    setForm(emptyForm);
    setError("");
  }

  // ─────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: "36px 28px", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{css}</style>

      {deleteUser && (
        <DeleteModal
          user={deleteUser}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteUser(null)}
        />
      )}

      <div style={{ maxWidth: 1060, margin: "0 auto" }}>

        {/* ══ EN-TÊTE ══════════════════════════════════════════ */}
        <div style={{
          background: `linear-gradient(135deg, ${C.navy} 0%, #162580 55%, ${C.blue} 100%)`,
          borderRadius: 22, padding: "26px 32px", marginBottom: 24,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 16, position: "relative", overflow: "hidden",
          boxShadow: `0 8px 40px ${C.shadow}`,
        }}>
          <div style={{ position:"absolute", top:-50, right:-50, width:180, height:180, borderRadius:"50%", background:"rgba(255,255,255,0.04)", pointerEvents:"none" }}/>
          <div style={{ position:"absolute", bottom:-30, left:180, width:120, height:120, borderRadius:"50%", background:"rgba(200,217,255,0.06)", pointerEvents:"none" }}/>

          <div style={{ display:"flex", alignItems:"center", gap:16, position:"relative" }}>
            <div style={{
              width:48, height:48, borderRadius:14,
              background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.2)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:22,
            }}>👤</div>
            <div>
              <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:"#fff", fontFamily:"'Syne',sans-serif", letterSpacing:"-0.02em" }}>
                Gestion des Utilisateurs
              </h1>
              <p style={{ margin:"3px 0 0", fontSize:12, color:"rgba(255,255,255,0.5)", fontWeight:400 }}>
                ONFPP · {users.length} utilisateur{users.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <button onClick={openCreate} style={{
            padding:"10px 20px", borderRadius:12,
            border:"1.5px solid rgba(255,255,255,0.25)",
            background: showForm && !editUser ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.16)",
            color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer",
            fontFamily:"'Syne',sans-serif", letterSpacing:"0.03em",
            display:"flex", alignItems:"center", gap:8, position:"relative",
          }}>
            {showForm && !editUser ? "✕ Annuler" : "+ Nouvel utilisateur"}
          </button>
        </div>

        {/* ══ MESSAGES ══════════════════════════════════════════ */}
        {error && (
          <div className="au-fade" style={{
            background:"#FFF1F2", border:`1.5px solid #FECDD3`,
            borderRadius:12, padding:"11px 16px", marginBottom:18,
            fontSize:13, color:C.danger, fontWeight:600, display:"flex", alignItems:"center", gap:8,
          }}>⚠️ {error}</div>
        )}
        {success && (
          <div className="au-fade" style={{
            background:"#F0FDF4", border:`1.5px solid #BBF7D0`,
            borderRadius:12, padding:"11px 16px", marginBottom:18,
            fontSize:13, color:C.success, fontWeight:600, display:"flex", alignItems:"center", gap:8,
          }}>✅ {success}</div>
        )}

        {/* ══ FORMULAIRE ════════════════════════════════════════ */}
        {showForm && (
          <div className="au-form-appear" style={{
            background:C.surface, borderRadius:20,
            border:`1px solid ${C.border}`,
            boxShadow:`0 4px 32px ${C.shadow}`,
            padding:"28px 32px", marginBottom:24,
          }}>
            {/* Titre formulaire */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{
                  width:34, height:34, borderRadius:10,
                  background:`linear-gradient(135deg, ${C.navy}, ${C.blue})`,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:15,
                }}>
                  {editUser ? "✏️" : "➕"}
                </div>
                <h2 style={{ margin:0, fontSize:16, fontWeight:800, color:C.navy, fontFamily:"'Syne',sans-serif" }}>
                  {editUser ? `Modifier — ${editUser.username}` : "Créer un utilisateur"}
                </h2>
              </div>
              <button onClick={closeForm} style={{
                background:"none", border:`1px solid ${C.border}`,
                borderRadius:8, padding:"5px 10px", cursor:"pointer",
                fontSize:12, color:C.textMuted, fontFamily:"'Syne',sans-serif",
              }}>✕ Fermer</button>
            </div>

            <form onSubmit={submitForm}>
              <SectionDivider title="Informations personnelles" />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px 18px" }}>
                <FL label="Prénom *"><FInput name="first_name" placeholder="Prénom" value={form.first_name} onChange={handleChange} required /></FL>
                <FL label="Nom *"><FInput name="last_name" placeholder="Nom de famille" value={form.last_name} onChange={handleChange} required /></FL>
                <FL label="Email *"><FInput name="email" type="email" placeholder="email@onfpp.gov.gn" value={form.email} onChange={handleChange} required /></FL>
                <FL label="Nom d'utilisateur *"><FInput name="username" placeholder="ex : m.diallo" value={form.username} onChange={handleChange} required /></FL>
                <FL label={editUser ? "Nouveau mot de passe (optionnel)" : "Mot de passe *"}>
                  <FInput name="password" type="password" placeholder="Minimum 8 caractères" value={form.password} onChange={handleChange} required={!editUser} />
                </FL>
                <FL label={editUser ? "Confirmer nouveau mot de passe" : "Confirmer mot de passe *"}>
                  <FInput name="password_confirm" type="password" placeholder="Répéter le mot de passe" value={form.password_confirm} onChange={handleChange} required={!editUser} />
                </FL>
              </div>

              {form.password && form.password_confirm && form.password !== form.password_confirm && (
                <p style={{ fontSize:12, color:C.danger, fontWeight:600, margin:"8px 0 0" }}>
                  ⚠️ Les mots de passe ne correspondent pas
                </p>
              )}

              <SectionDivider title="Rôle & affectation" />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px 18px", marginBottom:24 }}>
                <FL label="Rôle *">
                  <FSelect name="role" value={form.role} onChange={handleChange} required>
                    <option value="">Sélectionner un rôle</option>
                    {NIVEAUX_ACCES.map(r => (
                      <option key={r.level} value={r.level}>{r.name}</option>
                    ))}
                  </FSelect>
                </FL>

                {showDivision && (
                  <FL label="Division *">
                    <FSelect name="division" value={form.division} onChange={handleChange} required>
                      <option value="">Sélectionner une division</option>
                      {DIVISIONS_CHOICES.map(d => (
                        <option key={d.code} value={d.code}>{d.code} — {d.name}</option>
                      ))}
                    </FSelect>
                  </FL>
                )}

                {showAntenne && (
                  <FL label="Antenne *">
                    <FSelect name="antenne" value={form.antenne} onChange={handleChange} required>
                      <option value="">Sélectionner une antenne</option>
                      {ANTENNES_CHOICES.map(a => (
                        <option key={a.code} value={a.code}>{a.name}</option>
                      ))}
                    </FSelect>
                  </FL>
                )}

                {isDGorDGA && (
                  <div style={{
                    background:"#EEF2FF", border:`1px solid #C7D2FE`,
                    borderRadius:11, padding:"12px 14px",
                    fontSize:12, color:"#3730A3", fontWeight:600,
                    display:"flex", alignItems:"center", gap:8, alignSelf:"flex-end",
                    fontFamily:"'DM Sans',sans-serif",
                  }}>
                    ℹ️ Accès complet — toutes divisions et antennes
                  </div>
                )}
              </div>

              <button type="submit" disabled={loading || !isFormValid()} style={{
                width:"100%", padding:"13px",
                borderRadius:13, border:"none",
                background: (loading || !isFormValid())
                  ? "#C5CFEA"
                  : `linear-gradient(135deg, ${C.navy}, ${C.blue})`,
                color:"#fff", fontSize:13, fontWeight:800,
                cursor: (loading || !isFormValid()) ? "not-allowed" : "pointer",
                fontFamily:"'Syne',sans-serif", letterSpacing:"0.04em",
                boxShadow: (!loading && isFormValid()) ? `0 6px 20px ${C.shadow}` : "none",
                transition:"all .2s",
              }}>
                {loading
                  ? (editUser ? "Modification en cours…" : "Création en cours…")
                  : (editUser ? "Enregistrer les modifications" : "Créer l'utilisateur")
                }
              </button>
            </form>
          </div>
        )}

        {/* ══ TABLEAU UTILISATEURS ══════════════════════════════ */}
        <div style={{
          background:C.surface, borderRadius:20,
          border:`1px solid ${C.border}`,
          boxShadow:`0 4px 32px ${C.shadow}`,
          overflow:"hidden",
        }}>
          {/* Header tableau */}
          <div style={{
            padding:"20px 28px", borderBottom:`1px solid ${C.border}`,
            display:"flex", alignItems:"center", justifyContent:"space-between",
            background:`linear-gradient(to right, #FAFBFF, ${C.surface})`,
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:18 }}>👥</span>
              <h2 style={{ margin:0, fontSize:16, fontWeight:800, color:C.navy, fontFamily:"'Syne',sans-serif" }}>
                Utilisateurs enregistrés
              </h2>
              <span style={{
                fontSize:11, fontWeight:700,
                background:C.iceBlue, color:C.blue,
                padding:"2px 10px", borderRadius:999,
                fontFamily:"'Syne',sans-serif",
              }}>{users.length}</span>
            </div>
          </div>

          {users.length === 0 ? (
            <div style={{ textAlign:"center", padding:"60px 0", color:C.textMuted }}>
              <div style={{ fontSize:48, marginBottom:12 }}>👥</div>
              <p style={{ fontWeight:600, fontSize:14, fontFamily:"'Syne',sans-serif" }}>Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:"#F5F8FF", borderBottom:`1.5px solid ${C.border}` }}>
                    {["Utilisateur", "Contact", "Rôle & Niveau", "Affectation", "Actions"].map((h, i) => (
                      <th key={h} style={{
                        textAlign: i === 4 ? "center" : "left",
                        padding:"11px 16px",
                        fontSize:10, fontWeight:700, letterSpacing:"0.08em",
                        textTransform:"uppercase", color:C.textMuted,
                        fontFamily:"'Syne',sans-serif",
                        whiteSpace:"nowrap",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => {
                    const level    = u.role?.level;
                    const palette  = NIVEAU_PALETTE[level] || { bg: C.iceBlue, text: C.navy, dot: C.blue };
                    const divName  = getDivisionName(u.division);
                    const antName  = getAntenneName(u.antenne);

                    return (
                      <tr key={u.id} className="au-row" style={{
                        borderBottom: i < users.length - 1 ? `1px solid ${C.border}` : "none",
                        background: editUser?.id === u.id ? "#EEF2FF" : C.surface,
                      }}>

                        {/* Utilisateur */}
                        <td style={{ padding:"14px 16px", minWidth:160 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <div style={{
                              width:36, height:36, borderRadius:10, flexShrink:0,
                              background:`linear-gradient(135deg, ${palette.bg}, ${palette.bg}cc)`,
                              border:`1.5px solid ${palette.dot}30`,
                              display:"flex", alignItems:"center", justifyContent:"center",
                              fontSize:14, fontWeight:800, color:palette.text,
                              fontFamily:"'Syne',sans-serif",
                            }}>
                              {(u.first_name?.[0] || u.username?.[0] || "?").toUpperCase()}
                            </div>
                            <div>
                              <p style={{ margin:0, fontWeight:700, fontSize:13, color:C.navy, fontFamily:"'Syne',sans-serif" }}>
                                {u.username}
                              </p>
                              <p style={{ margin:0, fontSize:11, color:C.textMuted, marginTop:1 }}>
                                {u.first_name} {u.last_name}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td style={{ padding:"14px 16px", minWidth:180 }}>
                          {u.email ? (
                            <span style={{ fontSize:12, color:C.textSub, display:"block" }}>
                              📧 {u.email}
                            </span>
                          ) : (
                            <span style={{ fontSize:12, color:C.textMuted }}>—</span>
                          )}
                          {u.date_joined && (
                            <span style={{ fontSize:11, color:C.textMuted, display:"block", marginTop:3 }}>
                              🗓 {new Date(u.date_joined).toLocaleDateString("fr-FR")}
                            </span>
                          )}
                        </td>

                        {/* Rôle */}
                        <td style={{ padding:"14px 16px", minWidth:160 }}>
                          {u.role ? (
                            <Badge level={u.role.level} />
                          ) : (
                            <span style={{ fontSize:12, color:C.textMuted }}>—</span>
                          )}
                        </td>

                        {/* Affectation */}
                        <td style={{ padding:"14px 16px", minWidth:200 }}>
                          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                            {divName && (
                              <Tag icon="🏢" text={divName} color={C.blue} />
                            )}
                            {antName && (
                              <Tag icon="📍" text={antName} color="#0891B2" />
                            )}
                            {!divName && !antName && (
                              level >= 90
                                ? <Tag icon="🌐" text="Accès global" color="#7C3AED" />
                                : <span style={{ fontSize:12, color:C.textMuted }}>—</span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td style={{ padding:"14px 16px", textAlign:"center", minWidth:100 }}>
                          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                            {/* Modifier */}
                            <button
                              className="au-btn-icon"
                              onClick={() => openEdit(u)}
                              title="Modifier"
                              style={{
                                width:32, height:32, borderRadius:9,
                                border:`1.5px solid ${C.border}`,
                                background:"#EEF2FF",
                                cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                                fontSize:14,
                              }}
                            >✏️</button>

                            {/* Supprimer */}
                            <button
                              className="au-btn-icon"
                              onClick={() => setDeleteUser(u)}
                              title="Supprimer"
                              style={{
                                width:32, height:32, borderRadius:9,
                                border:"1.5px solid #FECDD3",
                                background:"#FFF1F2",
                                cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                                fontSize:14,
                              }}
                            >🗑️</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}