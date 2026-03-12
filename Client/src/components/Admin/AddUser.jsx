import { useState, useEffect } from "react";
import CONFIG from "../../config/config";
import { apiRequest } from "../../endpoints/api";

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

const C = {
  navy:      "#0D1B5E",
  blue:      "#1A3BD4",
  iceBlue:   "#C8D9FF",
  textSub:   "#4A5A8A",
  textMuted: "#8FA3D8",
  surface:   "#FFFFFF",
  bg:        "#F0F4FF",
  danger:    "#E53935",
  success:   "#16A34A",
  shadow:    "rgba(26,59,212,0.12)",
  border:    "#E2E8F8",
};

const card = {
  background: C.surface,
  borderRadius: 20,
  border: `1px solid ${C.border}`,
  boxShadow: `0 4px 32px ${C.shadow}`,
  padding: "32px 36px",
  marginBottom: 28,
};

const labelStyle = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: C.textSub,
  marginBottom: 7,
  fontFamily: "'Syne', sans-serif",
};

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function useInputStyle() {
  const [focused, setFocused] = useState(false);
  const style = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 12,
    border: `1.5px solid ${focused ? C.blue : C.border}`,
    background: focused ? "#F5F8FF" : C.surface,
    fontSize: 14,
    color: C.navy,
    fontFamily: "'Syne', sans-serif",
    outline: "none",
    boxShadow: focused ? `0 0 0 3px ${C.blue}18` : "none",
    transition: "all .18s",
    boxSizing: "border-box",
  };
  return { style, onFocus: () => setFocused(true), onBlur: () => setFocused(false) };
}

function Input({ name, type = "text", placeholder, value, onChange, required }) {
  const { style, onFocus, onBlur } = useInputStyle();
  return (
    <input
      name={name} type={type} placeholder={placeholder}
      value={value} onChange={onChange} required={required}
      style={style} onFocus={onFocus} onBlur={onBlur}
    />
  );
}

function Select({ name, value, onChange, children, required }) {
  const { style, onFocus, onBlur } = useInputStyle();
  return (
    <select
      name={name} value={value} onChange={onChange} required={required}
      style={{
        ...style, cursor: "pointer", appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238FA3D8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center",
        paddingRight: 36,
      }}
      onFocus={onFocus} onBlur={onBlur}
    >
      {children}
    </select>
  );
}

function NiveauBadge({ level, name }) {
  const palettes = {
    100: { bg: "#FEF3C7", text: "#92400E" },
    90:  { bg: "#EDE9FE", text: "#5B21B6" },
    70:  { bg: "#DBEAFE", text: "#1D4ED8" },
    60:  { bg: "#D1FAE5", text: "#065F46" },
    50:  { bg: "#FFE4E6", text: "#9F1239" },
    30:  { bg: "#F0F4FF", text: "#3730A3" },
  };
  const c = palettes[level] || { bg: C.iceBlue, text: C.navy };
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 999,
      fontSize: 11, fontWeight: 700, background: c.bg, color: c.text,
      fontFamily: "'Syne', sans-serif", letterSpacing: "0.04em",
    }}>
      {name || `N${level}`}
    </span>
  );
}

// ────────────────────────────────────────────────────────────
export default function AddUser() {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");
  const [showForm, setShowForm] = useState(false);

  const emptyForm = {
    username: "", password: "", password_confirm: "",
    first_name: "", last_name: "", email: "",
    role: "", division: "", antenne: "",
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    try {
      const usersData = await apiRequest(CONFIG.API_USER_LIST);
      setUsers(usersData);
    } catch (err) {
      setError(err.message);
    }
  }

  // ── LOGIQUE INTACTE ──────────────────────────────────────
  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "role") {
      setForm(prev => ({ ...prev, role: value, division: "", antenne: "" }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  }

  const selectedRoleLevel = form.role ? parseInt(form.role) : null;
  const showDivision = [70, 60].includes(selectedRoleLevel);
  const showAntenne  = [50, 30].includes(selectedRoleLevel);
  const isDGorDGA    = [100, 90].includes(selectedRoleLevel);

  const isFormValid = () => {
    if (!form.username || !form.password || !form.password_confirm) return false;
    if (!form.first_name || !form.last_name || !form.email) return false;
    if (!form.role) return false;
    if (showDivision && !form.division) return false;
    if (showAntenne  && !form.antenne)  return false;
    if (form.password !== form.password_confirm) return false;
    return true;
  };

  async function createUser(e) {
    e.preventDefault();
    if (!isFormValid()) return;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const roleName = NIVEAUX_ACCES.find(r => r.level === selectedRoleLevel)?.name || "";
      const payload = {
        username: form.username,
        password: form.password,
        password_confirm: form.password_confirm,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        role_name: roleName,
        division: showDivision ? form.division : null,
        antenne:  showAntenne  ? form.antenne  : null,
      };

      console.log("Payload envoyé :", payload);

      await apiRequest(CONFIG.API_CREATE_USER, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSuccess(`Utilisateur "${form.username}" créé avec succès !`);
      setForm(emptyForm);
      setShowForm(false);
      loadUsers();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }
  // ────────────────────────────────────────────────────────

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      padding: "40px 32px",
      fontFamily: "'Syne', sans-serif",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
        tr.user-row:hover td { background: #EEF2FF !important; }
      `}</style>

      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* ── EN-TÊTE ── */}
        <div style={{
          ...card,
          background: `linear-gradient(135deg, ${C.navy} 0%, #1A2F8A 55%, ${C.blue} 100%)`,
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          padding: "28px 36px",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Halos déco */}
          <div style={{ position:"absolute", top:-60, right:-60, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,0.05)", pointerEvents:"none" }}/>
          <div style={{ position:"absolute", bottom:-40, left:200, width:140, height:140, borderRadius:"50%", background:"rgba(107,159,255,0.08)", pointerEvents:"none" }}/>

          <div style={{ display: "flex", alignItems: "center", gap: 18, position:"relative" }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 26, border: "1px solid rgba(255,255,255,0.2)",
            }}>👤</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
                Gestion des Utilisateurs
              </h1>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>
                Office National de la Formation Professionnelle · {users.length} utilisateur{users.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <button
            onClick={() => { setShowForm(f => !f); setError(""); }}
            style={{
              padding: "11px 22px",
              borderRadius: 12,
              border: "1.5px solid rgba(255,255,255,0.25)",
              background: showForm ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.16)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Syne', sans-serif",
              letterSpacing: "0.03em",
              transition: "all .18s",
              position: "relative",
            }}
          >
            {showForm ? "✕  Annuler" : "+  Nouvel utilisateur"}
          </button>
        </div>

        {/* ── MESSAGES ── */}
        {error && (
          <div style={{
            background: "#FFF1F2", border: `1.5px solid #FECDD3`,
            borderRadius: 12, padding: "12px 16px", marginBottom: 20,
            fontSize: 13, color: C.danger, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 8,
          }}>⚠️ {error}</div>
        )}
        {success && (
          <div style={{
            background: "#F0FDF4", border: `1.5px solid #BBF7D0`,
            borderRadius: 12, padding: "12px 16px", marginBottom: 20,
            fontSize: 13, color: C.success, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 8,
          }}>✅ {success}</div>
        )}

        {/* ── FORMULAIRE ── */}
        {showForm && (
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16,
              }}>✏️</div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: C.navy, letterSpacing: "-0.01em" }}>
                Créer un utilisateur
              </h2>
            </div>

            <form onSubmit={createUser}>
              {/* Séparateur section */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: C.textMuted, textTransform: "uppercase" }}>
                  Informations personnelles
                </span>
                <div style={{ flex: 1, height: 1, background: C.border }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", marginBottom: 24 }}>
                <Field label="Prénom *">
                  <Input name="first_name" placeholder="Prénom" value={form.first_name} onChange={handleChange} required />
                </Field>
                <Field label="Nom *">
                  <Input name="last_name" placeholder="Nom de famille" value={form.last_name} onChange={handleChange} required />
                </Field>
                <Field label="Email *">
                  <Input name="email" type="email" placeholder="email@onfpp.gov.gn" value={form.email} onChange={handleChange} required />
                </Field>
                <Field label="Nom d'utilisateur *">
                  <Input name="username" placeholder="ex : m.diallo" value={form.username} onChange={handleChange} required />
                </Field>
                <Field label="Mot de passe *">
                  <Input name="password" type="password" placeholder="Minimum 8 caractères" value={form.password} onChange={handleChange} required />
                </Field>
                <Field label="Confirmer le mot de passe *">
                  <Input name="password_confirm" type="password" placeholder="Répéter le mot de passe" value={form.password_confirm} onChange={handleChange} required />
                </Field>
              </div>

              {/* Mismatch warning */}
              {form.password && form.password_confirm && form.password !== form.password_confirm && (
                <p style={{ fontSize: 12, color: C.danger, fontWeight: 600, margin: "-12px 0 16px" }}>
                  ⚠️ Les mots de passe ne correspondent pas
                </p>
              )}

              {/* Section rôle */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: C.textMuted, textTransform: "uppercase" }}>
                  Rôle & affectation
                </span>
                <div style={{ flex: 1, height: 1, background: C.border }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", marginBottom: 28 }}>
                <Field label="Rôle *">
                  <Select name="role" value={form.role} onChange={handleChange} required>
                    <option value="">Sélectionner un rôle</option>
                    {NIVEAUX_ACCES.map(r => (
                      <option key={r.level} value={r.level}>{r.name}</option>
                    ))}
                  </Select>
                </Field>

                {showDivision && (
                  <Field label="Division *">
                    <Select name="division" value={form.division} onChange={handleChange} required>
                      <option value="">Sélectionner une division</option>
                      {DIVISIONS_CHOICES.map(d => (
                        <option key={d.code} value={d.code}>{d.code} — {d.name}</option>
                      ))}
                    </Select>
                  </Field>
                )}

                {showAntenne && (
                  <Field label="Antenne *">
                    <Select name="antenne" value={form.antenne} onChange={handleChange} required>
                      <option value="">Sélectionner une antenne</option>
                      {ANTENNES_CHOICES.map(a => (
                        <option key={a.code} value={a.code}>{a.name}</option>
                      ))}
                    </Select>
                  </Field>
                )}

                {isDGorDGA && (
                  <div style={{
                    background: "#EEF2FF", border: `1px solid #C7D2FE`,
                    borderRadius: 12, padding: "14px 16px",
                    fontSize: 13, color: "#3730A3", fontWeight: 600,
                    display: "flex", alignItems: "center", gap: 8,
                    alignSelf: "flex-end",
                  }}>
                    ℹ️ Accès complet — toutes divisions et antennes
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !isFormValid()}
                style={{
                  width: "100%", padding: "14px",
                  borderRadius: 14, border: "none",
                  background: (loading || !isFormValid())
                    ? C.textMuted
                    : `linear-gradient(135deg, ${C.navy}, ${C.blue})`,
                  color: "#fff", fontSize: 14, fontWeight: 800,
                  cursor: (loading || !isFormValid()) ? "not-allowed" : "pointer",
                  fontFamily: "'Syne', sans-serif",
                  letterSpacing: "0.04em",
                  boxShadow: (!loading && isFormValid()) ? `0 6px 24px ${C.shadow}` : "none",
                  transition: "all .2s",
                }}
              >
                {loading ? "Création en cours…" : "Créer l'utilisateur"}
              </button>
            </form>
          </div>
        )}

        {/* ── LISTE UTILISATEURS ── */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16,
            }}>👥</div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: C.navy, letterSpacing: "-0.01em" }}>
              Utilisateurs enregistrés
              <span style={{
                marginLeft: 10, fontSize: 12, fontWeight: 700,
                background: C.iceBlue, color: C.blue,
                padding: "2px 10px", borderRadius: 999,
                verticalAlign: "middle",
              }}>{users.length}</span>
            </h2>
          </div>

          {users.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: C.textMuted }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>👥</div>
              <p style={{ fontWeight: 600, fontSize: 14 }}>Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto", borderRadius: 14, border: `1px solid ${C.border}` }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: C.bg }}>
                    {["Utilisateur", "Rôle", "Division", "Antenne"].map(h => (
                      <th key={h} style={{
                        textAlign: "left", padding: "12px 16px",
                        fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
                        textTransform: "uppercase", color: C.textMuted,
                        borderBottom: `1px solid ${C.border}`,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} className="user-row" style={{
                      borderBottom: i < users.length - 1 ? `1px solid ${C.border}` : "none",
                      cursor: "default",
                    }}>
                      <td style={{ padding: "13px 16px" }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: C.navy }}>
                          {u.username}
                        </p>
                        {(u.first_name || u.last_name) && (
                          <p style={{ margin: "2px 0 0", fontSize: 12, color: C.textMuted }}>
                            {u.first_name} {u.last_name}
                          </p>
                        )}
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        {u.role
                          ? <NiveauBadge level={u.role.level} name={u.role.name} />
                          : <span style={{ color: C.textMuted, fontSize: 13 }}>—</span>
                        }
                      </td>
                      <td style={{ padding: "13px 16px", fontSize: 13, color: C.textSub, fontWeight: 500 }}>
                        {u.division || <span style={{ color: C.textMuted }}>—</span>}
                      </td>
                      <td style={{ padding: "13px 16px", fontSize: 13, color: C.textSub, fontWeight: 500 }}>
                        {u.antenne || <span style={{ color: C.textMuted }}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}