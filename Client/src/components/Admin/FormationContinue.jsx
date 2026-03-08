import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import CONFIG from "../../config/config.js";
import {
  GraduationCap, Users, Search, ChevronLeft, ChevronRight,
  Calendar, RefreshCw, Loader2, MapPinned, ClipboardList,
  Eye, X, BookOpen, User, ArrowUpRight, Grid3X3, List,
  MapPin, Building2, Clock, CheckCircle2, AlertCircle,
  BarChart3, FileText, Layers, Hash, TrendingUp, Award,
  UserCheck, Briefcase, ChevronDown,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   PALETTE — cohérente avec le reste de la plateforme ONFPP
═══════════════════════════════════════════════════════════════════ */
const C = {
  page: "#F8F9FD", surface: "#FFFFFF", surfaceEl: "#F4F7FF",
  navy: "#06102A", navyMid: "#0C1D5F", blue: "#1635C8", blueViv: "#2447E0",
  iceBlue: "#D0D9FF", textPri: "#06102A", textSub: "#3A4F8C", textMuted: "#8497C8",
  gold: "#D4920A", goldLight: "#F5B020", goldPale: "#FFF8E7",
  green: "#047A5A", greenLight: "#0DA575", greenPale: "#E8FBF5",
  danger: "#C81B1B", dangerPale: "#FEF2F2",
  orange: "#C05C0A", orangePale: "#FFF3E8",
  teal: "#0E7490", tealPale: "#F0FDFF",
  dfc: "#1635C8", dfcPale: "#EEF1FF",
  divider: "#E8EDFC", shadow: "rgba(6,16,42,0.07)", shadowMd: "rgba(6,16,42,0.14)",
};

/* ═══════════════════════════════════════════════════════════════════
   CSS
═══════════════════════════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Outfit:wght@300;400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .dfc { font-family: 'Outfit', sans-serif; -webkit-font-smoothing: antialiased; }
  .dfc-serif { font-family: 'Fraunces', serif !important; }

  .dfc-page::before {
    content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image: radial-gradient(circle at 1px 1px, rgba(22,53,200,.045) 1px, transparent 0);
    background-size: 28px 28px;
  }

  .dfc-input {
    width: 100%; padding: 10px 14px; border-radius: 10px;
    border: 1.5px solid ${C.divider}; background: #fff; color: ${C.textPri};
    font-family: 'Outfit', sans-serif; font-size: 13px; outline: none;
    transition: border-color .16s, box-shadow .16s;
  }
  .dfc-input:focus { border-color: ${C.blue}; box-shadow: 0 0 0 3px rgba(22,53,200,.09); }
  .dfc-input::placeholder { color: ${C.textMuted}; }
  select.dfc-input { cursor: pointer; }

  .dfc-btn-pri {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 22px; border-radius: 11px; border: none; cursor: pointer;
    font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 700;
    background: linear-gradient(135deg, ${C.navy}, ${C.blue}); color: #fff;
    box-shadow: 0 4px 18px rgba(22,53,200,.28);
    transition: all .18s cubic-bezier(.34,1.2,.64,1);
  }
  .dfc-btn-pri:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(22,53,200,.38); }

  .dfc-btn-sec {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 18px; border-radius: 10px; cursor: pointer;
    font-family: 'Outfit', sans-serif; font-size: 12.5px; font-weight: 600;
    background: #fff; color: ${C.textSub}; border: 1.5px solid ${C.divider};
    transition: all .14s ease;
  }
  .dfc-btn-sec:hover { background: ${C.surfaceEl}; border-color: ${C.iceBlue}; }

  .dfc-tr { transition: background .12s; cursor: pointer; }
  .dfc-tr:hover { background: #EEF1FF !important; }

  .dfc-badge {
    display: inline-flex; align-items: center; gap: 5px;
    border-radius: 20px; padding: 3px 10px;
    font-size: 10.5px; font-weight: 700; font-family: 'Outfit', sans-serif;
  }

  .dfc-pill {
    padding: 7px 16px; border-radius: 24px; cursor: pointer;
    font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 700;
    border: 1.5px solid transparent; transition: all .15s;
    display: inline-flex; align-items: center; gap: 6px;
  }

  .dfc-pg {
    width: 34px; height: 34px; border-radius: 9px; border: 1px solid ${C.divider};
    display: flex; align-items: center; justify-content: center; cursor: pointer;
    font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 600;
    background: #fff; color: ${C.textSub}; transition: all .14s;
  }
  .dfc-pg:hover { background: ${C.surfaceEl}; border-color: ${C.iceBlue}; }
  .dfc-pg.active { background: ${C.navy}; color: #fff; border-color: ${C.navy}; }
  .dfc-pg:disabled { opacity: .4; cursor: not-allowed; }

  .dfc-card {
    background: #fff; border-radius: 18px; border: 1px solid ${C.divider};
    box-shadow: 0 2px 14px rgba(6,16,42,.07);
    transition: transform .24s cubic-bezier(.34,1.4,.64,1), box-shadow .24s ease, border-color .2s;
    cursor: pointer; overflow: hidden; position: relative;
  }
  .dfc-card:hover {
    transform: translateY(-6px) scale(1.007);
    box-shadow: 0 22px 52px rgba(6,16,42,.13);
    border-color: ${C.iceBlue};
  }

  .dfc-modal {
    animation: dfcModal .26s cubic-bezier(.22,1,.36,1) both;
  }
  @keyframes dfcModal {
    from { opacity: 0; transform: scale(.93) translateY(-18px); }
    to   { opacity: 1; transform: scale(1)  translateY(0); }
  }

  @keyframes dfcSpin { to { transform: rotate(360deg); } }
  .dfc-spin { animation: dfcSpin .75s linear infinite; display: inline-block; }

  @keyframes dfcUp {
    from { opacity: 0; transform: translateY(20px) scale(.984); }
    to   { opacity: 1; transform: translateY(0)    scale(1); }
  }
  .dfc-in { animation: dfcUp .46s cubic-bezier(.22,1,.36,1) both; }
  .dfc-d0 { animation-delay: .00s; } .dfc-d1 { animation-delay: .07s; }
  .dfc-d2 { animation-delay: .14s; } .dfc-d3 { animation-delay: .21s; }
  .dfc-d4 { animation-delay: .28s; }

  @keyframes dfcBar { from { width: 0; } to { width: var(--bw); } }
  .dfc-bar { animation: dfcBar 1s cubic-bezier(.22,1,.36,1) both; }

  .dfc-detail-row {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 11px 0; border-bottom: 1px solid ${C.divider};
  }
  .dfc-detail-row:last-child { border-bottom: none; }
  .dfc-detail-label {
    font-size: 10.5px; font-weight: 800; color: ${C.textMuted};
    text-transform: uppercase; letter-spacing: .07em;
    min-width: 155px; flex-shrink: 0; padding-top: 2px;
  }
  .dfc-detail-val { font-size: 13px; color: ${C.textPri}; font-weight: 500; line-height: 1.5; }

  .dfc-act-btn {
    width: 30px; height: 30px; border-radius: 8px; border: 1px solid ${C.divider};
    display: flex; align-items: center; justify-content: center; cursor: pointer;
    background: ${C.surfaceEl}; transition: all .14s;
  }

  .dfc-tab-btn {
    display: flex; align-items: center; gap: 7px; padding: 9px 18px;
    border-radius: 10px 10px 0 0; border: none; cursor: pointer;
    font-family: 'Outfit', sans-serif; font-size: 12.5px; font-weight: 700;
    transition: all .14s; background: transparent;
  }

  .dfc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }

  @keyframes dfcAurora {
    0%, 100% { opacity: .5; transform: scale(1); }
    50%       { opacity: .7; transform: scale(1.06) translateX(12px); }
  }
  .dfc-aurora { animation: dfcAurora 10s ease-in-out infinite; }

  @media (max-width: 900px) {
    .dfc-grid { grid-template-columns: 1fr 1fr !important; }
    .dfc-hide-sm { display: none !important; }
  }
  @media (max-width: 600px) {
    .dfc-grid { grid-template-columns: 1fr !important; }
    .dfc { padding: 80px 14px 52px !important; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════
   CONSTANTES
═══════════════════════════════════════════════════════════════════ */
const ANTENNES_LIST = [
  { v: "conakry",    l: "Conakry",    code: "CKY" },
  { v: "forecariah", l: "Forecariah", code: "FRC" },
  { v: "boke",       l: "Boké",       code: "BOK" },
  { v: "kindia",     l: "Kindia",     code: "KND" },
  { v: "labe",       l: "Labé",       code: "LBE" },
  { v: "mamou",      l: "Mamou",      code: "MMU" },
  { v: "faranah",    l: "Faranah",    code: "FRN" },
  { v: "kankan",     l: "Kankan",     code: "KNK" },
  { v: "siguiri",    l: "Siguiri",    code: "SGR" },
  { v: "nzerekore",  l: "N'Zérékoré", code: "NZR" },
];
const ANTENNE_LABEL = (v) => ANTENNES_LIST.find((a) => a.v === v)?.l || v || "—";
const ANTENNE_CODE  = (v) => ANTENNES_LIST.find((a) => a.v === v)?.code || "GN";

const STATUTS_INSCRIPTION = {
  en_attente: { l: "En attente", bg: `${C.gold}15`,    c: C.gold   },
  valide:     { l: "Validé",     bg: C.greenPale,       c: C.green  },
  rejete:     { l: "Rejeté",     bg: C.dangerPale,      c: C.danger },
};

const PAGE_SIZE = 12;

const authHeader = () => {
  const t = localStorage.getItem("access") || localStorage.getItem("access_token") || localStorage.getItem("token");
  return { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) };
};

const buildDfcId = (f, idx) => {
  const year = f.date_debut ? new Date(f.date_debut).getFullYear() : new Date().getFullYear();
  return `ONFPP-DFC-${ANTENNE_CODE(f.antenne)}-${year}-${String((idx || 0) + 1).padStart(3, "0")}`;
};

const fmtD  = (d) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short",  year: "2-digit"  }) : "—";
const fmtDL = (d) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long",   year: "numeric"  }) : "—";

/* ── Durée en jours ── */
const dureeJours = (debut, fin) => {
  if (!debut || !fin) return null;
  const d = Math.ceil((new Date(fin) - new Date(debut)) / 86400000);
  return d > 0 ? d : null;
};

/* ── Statut session (calculé depuis dates) ── */
const getSessionStatus = (debut, fin) => {
  const now = new Date();
  const d = debut ? new Date(debut) : null;
  const f = fin   ? new Date(fin)   : null;
  if (!d) return { l: "Non planifiée", c: C.textMuted, bg: C.surfaceEl, icon: Clock };
  if (now < d)      return { l: "Planifiée",    c: C.gold,   bg: C.goldPale,   icon: Clock        };
  if (!f || now <= f) return { l: "En cours",   c: C.blue,   bg: C.dfcPale,    icon: TrendingUp   };
  return               { l: "Terminée",          c: C.green,  bg: C.greenPale,  icon: CheckCircle2 };
};

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
  const s = STATUTS_INSCRIPTION[statut] || STATUTS_INSCRIPTION.en_attente;
  return (
    <span className="dfc-badge" style={{ background: s.bg, color: s.c, border: `1px solid ${s.c}30` }}>
      {s.l}
    </span>
  );
};

const SessionBadge = ({ debut, fin }) => {
  const s = getSessionStatus(debut, fin);
  const SI = s.icon;
  return (
    <span className="dfc-badge" style={{ background: s.bg, color: s.c, border: `1px solid ${s.c}25` }}>
      <SI size={9} /> {s.l}
    </span>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   MODAL DÉTAIL FORMATION DFC
═══════════════════════════════════════════════════════════════════ */
const DFCDetailModal = ({ formation, dfcId, onClose }) => {
  const [candidats,  setCandidats]  = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [activeTab,  setActiveTab]  = useState("info");
  const [searchCand, setSearchCand] = useState("");

  const ss = getSessionStatus(formation.date_debut, formation.date_fin);
  const SSI = ss.icon;
  const duree = dureeJours(formation.date_debut, formation.date_fin);

  useEffect(() => {
    if (!formation?.id) return;
    setLoading(true);
    const API = CONFIG.API_FORMATIONS || "/api/formations/";
    axios
      .get(`${CONFIG.BASE_URL}${API}${formation.id}/candidats/`, { headers: authHeader() })
      .then((res) => {
        const d = res.data;
        if      (Array.isArray(d))              setCandidats(d);
        else if (Array.isArray(d?.candidats))   setCandidats(d.candidats);
        else if (Array.isArray(d?.results))     setCandidats(d.results);
        else setCandidats([]);
      })
      .catch(() => setCandidats([]))
      .finally(() => setLoading(false));
  }, [formation?.id]);

  const filteredCands = candidats.filter((c) => {
    const q = searchCand.toLowerCase();
    return !q || [c.nom, c.prenom, c.identifiant_unique, c.telephone, c.email, c.domaine].some((v) => v?.toLowerCase().includes(q));
  });

  const nbH = candidats.filter((c) => c.sexe === "M" || c.genre === "M").length;
  const nbF = candidats.filter((c) => c.sexe === "F" || c.genre === "F").length;

  const tabs = [
    { id: "info",       label: "Informations",                                      icon: ClipboardList },
    { id: "apprenants", label: `Apprenants (${loading ? "…" : candidats.length})`, icon: Users         },
    { id: "stats",      label: "Statistiques",                                      icon: BarChart3     },
  ];

  const InfoRow = ({ label, value, node }) => (
    <div className="dfc-detail-row">
      <span className="dfc-detail-label">{label}</span>
      {node ? <div className="dfc-detail-val">{node}</div> : <span className="dfc-detail-val">{value || "—"}</span>}
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center", padding: "72px 16px 16px" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(6,16,42,.65)", backdropFilter: "blur(16px)" }} onClick={onClose} />
      <div className="dfc-modal" style={{ position: "relative", width: "100%", maxWidth: 820, maxHeight: "calc(100vh - 90px)", overflowY: "auto", background: C.surface, borderRadius: 24, boxShadow: `0 40px 100px rgba(6,16,42,.22)` }}>
        <Tri h={4} />

        {/* Header */}
        <div style={{ padding: "24px 28px 0", background: `linear-gradient(180deg,${C.dfcPale},${C.surface})`, borderBottom: `1px solid ${C.divider}` }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 54, height: 54, borderRadius: 15, flexShrink: 0, background: C.dfcPale, border: `1.5px solid ${C.blue}28`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 16px ${C.blue}18` }}>
                <GraduationCap size={23} color={C.blue} />
              </div>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 6, background: C.dfcPale, border: `1px solid ${C.blue}20`, marginBottom: 6 }}>
                  <BookOpen size={10} color={C.blue} />
                  <span style={{ fontSize: 10, fontWeight: 800, color: C.blue, textTransform: "uppercase", letterSpacing: ".1em" }}>DFC — Formation Continue</span>
                </div>
                <h2 className="dfc-serif" style={{ fontSize: 21, fontWeight: 700, color: C.textPri, letterSpacing: "-.4px", lineHeight: 1.2 }}>
                  {formation.nom_formation}
                </h2>
                <div style={{ display: "flex", gap: 7, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
                  <SessionBadge debut={formation.date_debut} fin={formation.date_fin} />
                  <span style={{ fontSize: 11, color: C.blue, background: `${C.blue}10`, padding: "3px 9px", borderRadius: 6, border: `1px solid ${C.blue}20`, fontWeight: 800, fontFamily: "monospace" }}>
                    {dfcId}
                  </span>
                  {formation.antenne && (
                    <span style={{ fontSize: 11, color: C.teal, background: `${C.teal}10`, padding: "3px 9px", borderRadius: 6, border: `1px solid ${C.teal}20`, fontWeight: 700 }}>
                      <MapPin size={9} style={{ marginRight: 4 }} />{ANTENNE_LABEL(formation.antenne)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, background: C.surfaceEl, border: `1px solid ${C.divider}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <X size={15} color={C.textMuted} />
            </button>
          </div>

          {/* Mini KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Apprenants", value: candidats.length || formation.nb_candidats || 0, icon: Users,    color: C.green },
              { label: "Durée",      value: duree ? `${duree}j` : "—",                       icon: Clock,    color: C.gold  },
              { label: "Hommes",     value: nbH,                                              icon: User,     color: C.blue  },
              { label: "Femmes",     value: nbF,                                              icon: UserCheck,color: C.teal  },
            ].map((k, i) => {
              const KI = k.icon;
              return (
                <div key={i} style={{ background: `${k.color}08`, borderRadius: 12, padding: "10px 12px", border: `1px solid ${k.color}20`, textAlign: "center" }}>
                  <KI size={13} color={k.color} style={{ marginBottom: 4 }} />
                  <p className="dfc-serif" style={{ fontSize: 20, fontWeight: 700, color: k.color, lineHeight: 1 }}>{k.value}</p>
                  <p style={{ fontSize: 10.5, color: C.textMuted, marginTop: 2 }}>{k.label}</p>
                </div>
              );
            })}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 2 }}>
            {tabs.map((tab) => {
              const TI = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="dfc-tab-btn"
                  style={{ color: active ? C.textPri : C.textMuted, background: active ? C.surface : "transparent", borderBottom: active ? `2px solid ${C.blue}` : "2px solid transparent" }}>
                  <TI size={13} />{tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Corps */}
        <div style={{ padding: "22px 28px", minHeight: 260 }}>

          {/* ── Onglet Informations ── */}
          {activeTab === "info" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Bloc formation */}
              <div style={{ background: C.surfaceEl, borderRadius: 14, padding: "4px 18px", border: `1px solid ${C.divider}` }}>
                <div style={{ padding: "10px 0 6px", borderBottom: `1px solid ${C.divider}` }}>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: C.blue, textTransform: "uppercase", letterSpacing: ".08em" }}>Formation</span>
                </div>
                <InfoRow label="Intitulé"         value={formation.nom_formation} />
                <InfoRow label="Organisme"         value={formation.organisme_formation} />
                <InfoRow label="Formateur"         value={formation.nom_formateur} />
                <InfoRow label="Antenne ONFPP"     value={formation.antenne_display || ANTENNE_LABEL(formation.antenne)} />
                {formation.entreprise_formation && (
                  <InfoRow label="Entreprise"      value={formation.entreprise_formation} />
                )}
                <InfoRow label="Créé par"          value={formation.created_by_nom} />
              </div>
              {/* Bloc dates */}
              <div style={{ background: C.surfaceEl, borderRadius: 14, padding: "4px 18px", border: `1px solid ${C.divider}` }}>
                <div style={{ padding: "10px 0 6px", borderBottom: `1px solid ${C.divider}` }}>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: C.gold, textTransform: "uppercase", letterSpacing: ".08em" }}>Période & Statut</span>
                </div>
                <InfoRow label="Date de début"   value={fmtDL(formation.date_debut)} />
                <InfoRow label="Date de fin"     value={fmtDL(formation.date_fin)} />
                <InfoRow label="Durée"           value={duree ? `${duree} jour${duree > 1 ? "s" : ""}` : "—"} />
                <InfoRow label="Statut session"  node={<SessionBadge debut={formation.date_debut} fin={formation.date_fin} />} />
              </div>
              {/* Bloc effectifs */}
              <div style={{ background: C.surfaceEl, borderRadius: 14, padding: "4px 18px", border: `1px solid ${C.divider}` }}>
                <div style={{ padding: "10px 0 6px", borderBottom: `1px solid ${C.divider}` }}>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: C.green, textTransform: "uppercase", letterSpacing: ".08em" }}>Effectifs</span>
                </div>
                <InfoRow label="Total apprenants" node={
                  <span className="dfc-serif" style={{ fontSize: 20, fontWeight: 700, color: C.green }}>{candidats.length || formation.nb_candidats || 0}</span>
                } />
                {!loading && candidats.length > 0 && (
                  <>
                    <InfoRow label="Hommes" value={nbH} />
                    <InfoRow label="Femmes" value={nbF} />
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── Onglet Apprenants ── */}
          {activeTab === "apprenants" && (
            loading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "52px 0", gap: 14 }}>
                <Loader2 size={26} color={C.blue} className="dfc-spin" />
                <p style={{ fontSize: 13, color: C.textMuted }}>Chargement des apprenants…</p>
              </div>
            ) : candidats.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "52px 0", gap: 12 }}>
                <div style={{ width: 60, height: 60, borderRadius: 16, background: C.surfaceEl, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${C.divider}` }}>
                  <Users size={26} color={C.textMuted} />
                </div>
                <p className="dfc-serif" style={{ fontSize: 15, fontWeight: 600, color: C.textSub }}>Aucun apprenant rattaché</p>
                <p style={{ fontSize: 12, color: C.textMuted, textAlign: "center", maxWidth: 300, lineHeight: 1.6 }}>
                  Les apprenants inscrits depuis la page Inscriptions apparaîtront ici.
                </p>
              </div>
            ) : (
              <div>
                {/* Barre recherche */}
                <div style={{ position: "relative", marginBottom: 14 }}>
                  <Search size={13} color={C.textMuted} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input className="dfc-input" placeholder="Nom, identifiant, contact…" value={searchCand}
                    onChange={(e) => setSearchCand(e.target.value)} style={{ paddingLeft: 36 }} />
                </div>
                <div style={{ borderRadius: 14, border: `1px solid ${C.divider}`, overflow: "hidden" }}>
                  <div style={{ padding: "11px 16px", background: `${C.navy}04`, borderBottom: `1px solid ${C.divider}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Users size={13} color={C.green} />
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: C.textSub }}>
                        {filteredCands.length} apprenant{filteredCands.length > 1 ? "s" : ""}
                        {searchCand && ` · filtrés sur ${candidats.length}`}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ fontSize: 11, color: C.blue, background: `${C.blue}10`, padding: "2px 8px", borderRadius: 5, fontWeight: 700 }}>{nbH}H</span>
                      <span style={{ fontSize: 11, color: C.teal, background: `${C.teal}10`, padding: "2px 8px", borderRadius: 5, fontWeight: 700 }}>{nbF}F</span>
                    </div>
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: `${C.navy}03`, borderBottom: `1px solid ${C.divider}` }}>
                        {["#", "Apprenant", "Identifiant", "Contact", "Domaine", "Statut"].map((h, i) => (
                          <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 800, color: C.textMuted, letterSpacing: ".1em", textTransform: "uppercase" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCands.map((c, i) => (
                        <tr key={c.id} style={{ borderBottom: i < filteredCands.length - 1 ? `1px solid ${C.divider}` : "none", background: i % 2 === 0 ? C.surface : `${C.navy}008` }}>
                          <td style={{ padding: "10px 14px", fontSize: 11, color: C.textMuted, fontWeight: 700 }}>{i + 1}</td>
                          <td style={{ padding: "10px 14px" }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: C.textPri }}>{c.nom} {c.prenom}</p>
                            {(c.sexe || c.genre) && (
                              <span style={{ fontSize: 10, color: (c.sexe || c.genre) === "F" ? C.teal : C.blue, fontWeight: 700 }}>
                                {(c.sexe || c.genre) === "F" ? "Femme" : "Homme"}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: "10px 14px" }}>
                            {c.identifiant_unique
                              ? <span style={{ fontSize: 11, color: C.blue, background: `${C.blue}10`, padding: "3px 8px", borderRadius: 5, fontWeight: 800, fontFamily: "monospace", border: `1px solid ${C.blue}20` }}>{c.identifiant_unique}</span>
                              : <span style={{ fontSize: 12, color: C.textMuted }}>—</span>}
                          </td>
                          <td style={{ padding: "10px 14px", fontSize: 12, color: C.textSub }}>{c.telephone || c.email || "—"}</td>
                          <td style={{ padding: "10px 14px", fontSize: 12, color: C.textMuted }}>{c.domaine || "—"}</td>
                          <td style={{ padding: "10px 14px" }}><StatutBadge statut={c.statut_fiche} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}

          {/* ── Onglet Statistiques ── */}
          {activeTab === "stats" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                  <Loader2 size={22} color={C.blue} className="dfc-spin" />
                </div>
              ) : (
                <>
                  {/* Répartition H/F */}
                  <div style={{ background: C.surfaceEl, borderRadius: 14, padding: "18px 20px", border: `1px solid ${C.divider}` }}>
                    <p style={{ fontSize: 12, fontWeight: 800, color: C.textMuted, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>Répartition par genre</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                      {[
                        { label: "Hommes", value: nbH, color: C.blue,  pct: candidats.length > 0 ? Math.round((nbH / candidats.length) * 100) : 0 },
                        { label: "Femmes", value: nbF, color: C.teal,  pct: candidats.length > 0 ? Math.round((nbF / candidats.length) * 100) : 0 },
                      ].map((g) => (
                        <div key={g.label} style={{ background: `${g.color}08`, borderRadius: 12, padding: "14px 16px", border: `1px solid ${g.color}20` }}>
                          <p className="dfc-serif" style={{ fontSize: 28, fontWeight: 700, color: g.color, lineHeight: 1 }}>{g.value}</p>
                          <p style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>{g.label} — {g.pct}%</p>
                          <div style={{ height: 5, borderRadius: 3, background: `${g.color}15`, overflow: "hidden", marginTop: 10 }}>
                            <div className="dfc-bar" style={{ "--bw": `${g.pct}%`, height: "100%", borderRadius: 3, background: g.color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Répartition par statut */}
                  <div style={{ background: C.surfaceEl, borderRadius: 14, padding: "18px 20px", border: `1px solid ${C.divider}` }}>
                    <p style={{ fontSize: 12, fontWeight: 800, color: C.textMuted, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>Répartition par statut d'inscription</p>
                    {Object.entries(STATUTS_INSCRIPTION).map(([key, cfg]) => {
                      const count = candidats.filter((c) => c.statut_fiche === key).length;
                      const pct   = candidats.length > 0 ? Math.round((count / candidats.length) * 100) : 0;
                      return (
                        <div key={key} style={{ marginBottom: 10 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: cfg.c }}>{cfg.l}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: C.textSub }}>{count} ({pct}%)</span>
                          </div>
                          <div style={{ height: 7, borderRadius: 4, background: C.surfaceEl, overflow: "hidden", border: `1px solid ${C.divider}` }}>
                            <div className="dfc-bar" style={{ "--bw": `${pct}%`, height: "100%", borderRadius: 4, background: cfg.c }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Domaines */}
                  {candidats.some((c) => c.domaine) && (
                    <div style={{ background: C.surfaceEl, borderRadius: 14, padding: "18px 20px", border: `1px solid ${C.divider}` }}>
                      <p style={{ fontSize: 12, fontWeight: 800, color: C.textMuted, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>Domaines représentés</p>
                      {Object.entries(
                        candidats.reduce((acc, c) => {
                          const d = c.domaine || "Non précisé";
                          acc[d] = (acc[d] || 0) + 1;
                          return acc;
                        }, {})
                      ).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([domaine, count]) => (
                        <div key={domaine} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.divider}` }}>
                          <span style={{ fontSize: 13, color: C.textPri }}>{domaine}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: C.blue, background: `${C.blue}10`, padding: "2px 8px", borderRadius: 5 }}>{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div style={{ padding: "14px 28px 20px", borderTop: `1px solid ${C.divider}`, display: "flex", justifyContent: "flex-end" }}>
          <button className="dfc-btn-sec" onClick={onClose}><X size={13} /> Fermer</button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   CARTE GRILLE
═══════════════════════════════════════════════════════════════════ */
const DFCCard = ({ f, dfcId, onClick, delay = 0 }) => {
  const ss = getSessionStatus(f.date_debut, f.date_fin);
  const SSI = ss.icon;
  const duree = dureeJours(f.date_debut, f.date_fin);
  return (
    <div className={`dfc-card dfc-in dfc-d${delay}`} onClick={onClick}>
      <div style={{ height: 3, background: `linear-gradient(90deg, ${C.blue}, ${C.teal})` }} />
      <div style={{ position: "absolute", bottom: -28, right: -28, width: 120, height: 120, borderRadius: "50%", background: `${C.blue}05`, pointerEvents: "none" }} />
      <div style={{ padding: "18px 20px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: C.dfcPale, border: `1.5px solid ${C.blue}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GraduationCap size={18} color={C.blue} />
            </div>
            <span className="dfc-badge" style={{ background: C.dfcPale, color: C.blue, border: `1px solid ${C.blue}30` }}>DFC</span>
          </div>
          <span className="dfc-badge" style={{ background: ss.bg, color: ss.c, border: `1px solid ${ss.c}25` }}>
            <SSI size={9} /> {ss.l}
          </span>
        </div>
        <h3 className="dfc-serif" style={{ fontSize: 15, fontWeight: 700, color: C.textPri, lineHeight: 1.3, marginBottom: 4, letterSpacing: "-.2px" }}>{f.nom_formation}</h3>
        <p style={{ fontSize: 11.5, color: C.textMuted, marginBottom: 11 }}>{f.organisme_formation || "—"}</p>
        <span style={{ fontSize: 10, color: C.blue, background: `${C.blue}10`, padding: "2px 8px", borderRadius: 5, fontWeight: 800, fontFamily: "monospace", border: `1px solid ${C.blue}20` }}>{dfcId}</span>
        <div style={{ height: 1, background: C.divider, margin: "12px 0" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <MapPin size={10} color={C.textMuted} />
            <span style={{ fontSize: 11.5, color: C.textSub, fontWeight: 600 }}>{f.antenne_display || ANTENNE_LABEL(f.antenne)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <User size={10} color={C.textMuted} />
            <span style={{ fontSize: 11.5, color: C.textSub }}>{f.nom_formateur || "—"}</span>
          </div>
          {f.entreprise_formation && (
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Building2 size={10} color={C.textMuted} />
              <span style={{ fontSize: 11.5, color: C.textSub }}>{f.entreprise_formation}</span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Calendar size={10} color={C.textMuted} />
            <span style={{ fontSize: 11.5, color: C.textSub }}>{fmtD(f.date_debut)} → {fmtD(f.date_fin)}</span>
            {duree && <span style={{ fontSize: 10, color: C.gold, background: C.goldPale, padding: "1px 6px", borderRadius: 8, fontWeight: 700 }}>{duree}j</span>}
          </div>
        </div>
        <div style={{ marginTop: 12, paddingTop: 11, borderTop: `1px solid ${C.divider}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: C.greenPale, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={12} color={C.green} />
            </div>
            <span className="dfc-serif" style={{ fontSize: 17, fontWeight: 700, color: C.textPri }}>{f.nb_candidats || 0}</span>
            <span style={{ fontSize: 11, color: C.textMuted }}>apprenant{f.nb_candidats > 1 ? "s" : ""}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.blue, fontWeight: 700 }}>Voir <ArrowUpRight size={11} /></div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL — FormationDFC
═══════════════════════════════════════════════════════════════════ */
const FormationContinue = () => {
  const [formations, setFormations] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [filterAnt,  setFilterAnt]  = useState("");
  const [filterStat, setFilterStat] = useState("tous");
  const [page,       setPage]       = useState(1);
  const [viewMode,   setViewMode]   = useState("table");
  const [detail,     setDetail]     = useState(null);
  const [sortCol,    setSortCol]    = useState("date_debut");
  const [sortDir,    setSortDir]    = useState("desc");

  const API = CONFIG.API_FORMATIONS || "/api/formations/";

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${CONFIG.BASE_URL}${API}`, { headers: authHeader() });
      const all = Array.isArray(r.data) ? r.data : r.data.results || [];
      // Filtrer uniquement les formations DFC (type_formation === "continue")
      setFormations(all.filter((f) => f.type_formation === "continue"));
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Filtrage ── */
  const sessionFilter = (f) => {
    if (filterStat === "tous") return true;
    const ss = getSessionStatus(f.date_debut, f.date_fin);
    if (filterStat === "planifiee")  return ss.l === "Planifiée";
    if (filterStat === "en_cours")   return ss.l === "En cours";
    if (filterStat === "terminee")   return ss.l === "Terminée";
    return true;
  };

  const filtered = formations.filter((f) => {
    const q = search.toLowerCase();
    const ms = !q || [f.nom_formation, f.organisme_formation, f.nom_formateur, f.entreprise_formation, ANTENNE_LABEL(f.antenne)].some((v) => v?.toLowerCase().includes(q));
    const ma = !filterAnt || f.antenne === filterAnt;
    return ms && ma && sessionFilter(f);
  });

  /* ── Tri ── */
  const sorted = [...filtered].sort((a, b) => {
    let va = a[sortCol]; let vb = b[sortCol];
    if (sortCol === "date_debut" || sortCol === "date_fin") {
      va = va ? new Date(va).getTime() : 0;
      vb = vb ? new Date(vb).getTime() : 0;
    } else if (sortCol === "nb_candidats") {
      va = Number(va) || 0; vb = Number(vb) || 0;
    } else {
      va = (va || "").toLowerCase(); vb = (vb || "").toLowerCase();
    }
    return sortDir === "asc" ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
  });

  const handleSort = (col) => {
    if (sortCol === col) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
    setPage(1);
  };

  const pages    = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged    = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const gIdx     = (f) => formations.findIndex((x) => x.id === f.id);

  /* ── Stats globales ── */
  const stats = {
    total:       formations.length,
    planifiees:  formations.filter((f) => getSessionStatus(f.date_debut, f.date_fin).l === "Planifiée").length,
    en_cours:    formations.filter((f) => getSessionStatus(f.date_debut, f.date_fin).l === "En cours").length,
    terminees:   formations.filter((f) => getSessionStatus(f.date_debut, f.date_fin).l === "Terminée").length,
    apprenants:  formations.reduce((a, f) => a + (f.nb_candidats || 0), 0),
  };

  /* ── Colonne triable ── */
  const SortHeader = ({ col, label }) => (
    <th onClick={() => handleSort(col)} style={{ padding: "13px 16px", textAlign: "left", fontSize: 10, fontWeight: 800, color: sortCol === col ? C.blue : C.textMuted, letterSpacing: ".12em", textTransform: "uppercase", whiteSpace: "nowrap", cursor: "pointer", userSelect: "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {label}
        {sortCol === col && (
          <span style={{ color: C.blue, fontSize: 12 }}>{sortDir === "asc" ? "↑" : "↓"}</span>
        )}
      </div>
    </th>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="dfc dfc-page" style={{ minHeight: "100vh", background: `radial-gradient(ellipse 100% 50% at 60% -8%, rgba(22,53,200,.07) 0%, transparent 60%), ${C.page}`, padding: "88px 28px 70px", position: "relative" }}>

        {/* Aurora bg */}
        <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div className="dfc-aurora" style={{ position: "absolute", top: "-10%", right: "8%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(22,53,200,.07) 0%,transparent 70%)", filter: "blur(30px)" }} />
          <div style={{ position: "absolute", bottom: "8%", left: "5%", width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle,rgba(14,116,144,.04) 0%,transparent 70%)", filter: "blur(40px)" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1260, margin: "0 auto" }}>

          {/* ── En-tête ── */}
          <div className="dfc-in dfc-d0" style={{ marginBottom: 28 }}>
            <div style={{ width: 80, marginBottom: 14 }}><Tri h={3} /></div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 12px", borderRadius: 20, background: C.dfcPale, border: `1px solid ${C.blue}20`, marginBottom: 10 }}>
                  <BookOpen size={12} color={C.blue} />
                  <span style={{ fontSize: 11, fontWeight: 800, color: C.blue, textTransform: "uppercase", letterSpacing: ".12em" }}>DFC — Division Formation Continue</span>
                </div>
                <h1 className="dfc-serif" style={{ fontSize: 34, fontWeight: 700, color: C.textPri, letterSpacing: "-.8px", lineHeight: 1.05 }}>
                  Formations continues
                </h1>
                <p style={{ fontSize: 13.5, color: C.textMuted, marginTop: 8 }}>
                  Liste des formations de la Division Formation Continue — ONFPP Guinée
                </p>
              </div>
              <div style={{ display: "flex", gap: 9 }}>
                <button className="dfc-btn-sec" onClick={fetchAll}><RefreshCw size={13} /></button>
              </div>
            </div>
          </div>

          {/* ── KPIs ── */}
          <div className="dfc-in dfc-d1" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px,1fr))", gap: 13, marginBottom: 26 }}>
            {[
              { label: "Total formations", value: stats.total,      color: C.blue,  bg: C.dfcPale,   icon: GraduationCap, bar: 1 },
              { label: "Planifiées",       value: stats.planifiees, color: C.gold,  bg: C.goldPale,  icon: Clock,         bar: stats.planifiees / Math.max(stats.total, 1) },
              { label: "En cours",         value: stats.en_cours,   color: C.blue,  bg: C.dfcPale,   icon: TrendingUp,    bar: stats.en_cours   / Math.max(stats.total, 1) },
              { label: "Terminées",        value: stats.terminees,  color: C.green, bg: C.greenPale, icon: CheckCircle2,  bar: stats.terminees  / Math.max(stats.total, 1) },
              { label: "Total apprenants", value: stats.apprenants, color: C.teal,  bg: C.tealPale,  icon: Users,         bar: 1 },
            ].map((s, i) => {
              const SI = s.icon;
              return (
                <div key={i} style={{ background: C.surface, borderRadius: 17, padding: "17px 15px", border: `1px solid ${C.divider}`, boxShadow: `0 2px 14px ${C.shadow}`, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${s.color},${s.color}55)`, borderRadius: "17px 17px 0 0" }} />
                  <div style={{ position: "absolute", bottom: -18, right: -18, width: 88, height: 88, borderRadius: "50%", background: `${s.color}06`, pointerEvents: "none" }} />
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 11 }}>
                    <SI size={15} color={s.color} />
                  </div>
                  <p className="dfc-serif" style={{ fontSize: 28, fontWeight: 700, color: C.textPri, lineHeight: 1, letterSpacing: "-1px" }}>{s.value}</p>
                  <p style={{ fontSize: 11.5, color: C.textMuted, marginTop: 5, marginBottom: 10 }}>{s.label}</p>
                  <div style={{ height: 4, borderRadius: 3, background: C.surfaceEl, overflow: "hidden" }}>
                    <div className="dfc-bar" style={{ "--bw": `${Math.round(s.bar * 100)}%`, height: "100%", background: `linear-gradient(90deg,${s.color},${s.color}77)`, borderRadius: 3, animationDelay: `${i * .1 + .3}s` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Filtres ── */}
          <div className="dfc-in dfc-d2" style={{ background: C.surface, border: `1px solid ${C.divider}`, borderRadius: 16, padding: "13px 18px", marginBottom: 18, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", boxShadow: `0 2px 14px ${C.shadow}` }}>
            {/* Recherche */}
            <div style={{ position: "relative", flex: "1 1 230px", minWidth: 0 }}>
              <Search size={14} color={C.textMuted} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input className="dfc-input" placeholder="Formation, formateur, organisme, entreprise…" value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ paddingLeft: 38 }} />
            </div>

            {/* Filtre statut session */}
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {[
                { v: "tous",      l: "Toutes",    c: C.textSub },
                { v: "planifiee", l: "Planifiées", c: C.gold   },
                { v: "en_cours",  l: "En cours",   c: C.blue   },
                { v: "terminee",  l: "Terminées",  c: C.green  },
              ].map((f) => (
                <button key={f.v} className="dfc-pill" onClick={() => { setFilterStat(f.v); setPage(1); }}
                  style={{ border: filterStat === f.v ? `1.5px solid ${f.c}` : `1px solid ${C.divider}`, background: filterStat === f.v ? `${f.c}12` : C.surfaceEl, color: filterStat === f.v ? f.c : C.textMuted }}>
                  {filterStat === f.v && <span style={{ width: 6, height: 6, borderRadius: "50%", background: f.c, display: "inline-block" }} />}
                  {f.l}
                </button>
              ))}
            </div>

            {/* Filtre antenne */}
            <select className="dfc-input" value={filterAnt} onChange={(e) => { setFilterAnt(e.target.value); setPage(1); }}
              style={{ width: "auto", minWidth: 155 }}>
              <option value="">Toutes les antennes</option>
              {ANTENNES_LIST.map((a) => <option key={a.v} value={a.v}>{a.l}</option>)}
            </select>

            <p style={{ fontSize: 12, color: C.textMuted, flexShrink: 0 }}>
              <span style={{ fontWeight: 700, color: C.textSub }}>{sorted.length}</span> résultat{sorted.length > 1 ? "s" : ""}
            </p>

            {/* Toggle vue */}
            <div style={{ display: "flex", gap: 3, padding: "3px", background: C.surfaceEl, borderRadius: 10, border: `1px solid ${C.divider}` }}>
              {[{ id: "table", Icon: List }, { id: "grid", Icon: Grid3X3 }].map(({ id, Icon }) => (
                <button key={id} onClick={() => setViewMode(id)} style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: viewMode === id ? C.surface : "transparent", border: viewMode === id ? `1px solid ${C.divider}` : "none", boxShadow: viewMode === id ? `0 1px 6px ${C.shadow}` : "none", cursor: "pointer", transition: "all .14s" }}>
                  <Icon size={13} color={viewMode === id ? C.navy : C.textMuted} />
                </button>
              ))}
            </div>
          </div>

          {/* ── Contenu principal ── */}
          <div className="dfc-in dfc-d3" style={{ background: C.surface, border: `1px solid ${C.divider}`, borderRadius: 20, boxShadow: `0 2px 18px ${C.shadow}`, overflow: "hidden" }}>

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "72px 0", gap: 16 }}>
                <Loader2 size={30} color={C.blue} className="dfc-spin" />
                <p style={{ fontSize: 13.5, color: C.textMuted }}>Chargement des formations DFC…</p>
              </div>

            ) : sorted.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "72px 0", gap: 14 }}>
                <div style={{ width: 62, height: 62, borderRadius: 17, background: C.dfcPale, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${C.blue}20` }}>
                  <GraduationCap size={27} color={C.blue} />
                </div>
                <p className="dfc-serif" style={{ fontSize: 16, fontWeight: 600, color: C.textSub }}>Aucune formation DFC trouvée</p>
                <p style={{ fontSize: 13, color: C.textMuted }}>
                  {search || filterAnt || filterStat !== "tous" ? "Modifiez vos critères de recherche" : "Les formations DFC créées via Inscriptions apparaîtront ici"}
                </p>
              </div>

            ) : viewMode === "grid" ? (
              <div style={{ padding: "20px" }}>
                <div className="dfc-grid">
                  {paged.map((f, i) => (
                    <DFCCard key={f.id} f={f} dfcId={buildDfcId(f, gIdx(f))}
                      onClick={() => setDetail({ formation: f, id: buildDfcId(f, gIdx(f)) })}
                      delay={Math.min(i, 4)} />
                  ))}
                </div>
              </div>

            ) : (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: `linear-gradient(90deg, ${C.navy}05, transparent)`, borderBottom: `1.5px solid ${C.divider}` }}>
                        <SortHeader col="id"                    label="ID / Code"      />
                        <SortHeader col="nom_formation"         label="Formation"      />
                        <SortHeader col="antenne"               label="Antenne"        />
                        <SortHeader col="organisme_formation"   label="Organisme"      />
                        <SortHeader col="nom_formateur"         label="Formateur"      />
                        <th className="dfc-hide-sm" style={{ padding: "13px 16px", textAlign: "left", fontSize: 10, fontWeight: 800, color: C.textMuted, letterSpacing: ".12em", textTransform: "uppercase" }}>Entreprise</th>
                        <SortHeader col="date_debut"            label="Période"        />
                        <th className="dfc-hide-sm" style={{ padding: "13px 16px", textAlign: "left", fontSize: 10, fontWeight: 800, color: C.textMuted, letterSpacing: ".12em", textTransform: "uppercase" }}>Durée</th>
                        <th style={{ padding: "13px 16px", textAlign: "left", fontSize: 10, fontWeight: 800, color: C.textMuted, letterSpacing: ".12em", textTransform: "uppercase" }}>Statut</th>
                        <SortHeader col="nb_candidats"          label="Apprenants"     />
                        <th style={{ padding: "13px 16px", width: 46 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {paged.map((f, ri) => {
                        const idx  = gIdx(f);
                        const fid  = buildDfcId(f, idx);
                        const ss   = getSessionStatus(f.date_debut, f.date_fin);
                        const SSI  = ss.icon;
                        const dur  = dureeJours(f.date_debut, f.date_fin);
                        return (
                          <tr key={f.id} className="dfc-tr"
                            style={{ borderBottom: `1px solid ${C.divider}`, background: ri % 2 === 0 ? C.surface : `${C.navy}008` }}
                            onClick={() => setDetail({ formation: f, id: fid })}>

                            {/* ID */}
                            <td style={{ padding: "13px 16px" }}>
                              <span style={{ fontSize: 10.5, fontWeight: 800, color: C.blue, background: `${C.blue}10`, padding: "4px 10px", borderRadius: 6, fontFamily: "monospace", border: `1px solid ${C.blue}22`, whiteSpace: "nowrap" }}>
                                {fid}
                              </span>
                            </td>

                            {/* Formation */}
                            <td style={{ padding: "13px 16px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: C.dfcPale, border: `1px solid ${C.blue}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <GraduationCap size={15} color={C.blue} />
                                </div>
                                <div>
                                  <p style={{ fontSize: 13, fontWeight: 700, color: C.textPri, lineHeight: 1.3, maxWidth: 200 }}>{f.nom_formation}</p>
                                </div>
                              </div>
                            </td>

                            {/* Antenne */}
                            <td style={{ padding: "13px 16px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <MapPinned size={11} color={C.textMuted} />
                                <span style={{ fontSize: 12.5, color: C.textSub, fontWeight: 600 }}>{f.antenne_display || ANTENNE_LABEL(f.antenne)}</span>
                              </div>
                            </td>

                            {/* Organisme */}
                            <td style={{ padding: "13px 16px" }}>
                              <span style={{ fontSize: 12, color: C.textSub }}>{f.organisme_formation || "—"}</span>
                            </td>

                            {/* Formateur */}
                            <td style={{ padding: "13px 16px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <User size={11} color={C.textMuted} />
                                <span style={{ fontSize: 12, color: C.textSub }}>{f.nom_formateur || "—"}</span>
                              </div>
                            </td>

                            {/* Entreprise */}
                            <td className="dfc-hide-sm" style={{ padding: "13px 16px" }}>
                              {f.entreprise_formation ? (
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <Building2 size={11} color={C.textMuted} />
                                  <span style={{ fontSize: 12, color: C.textSub, maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.entreprise_formation}</span>
                                </div>
                              ) : (
                                <span style={{ fontSize: 12, color: C.textMuted }}>—</span>
                              )}
                            </td>

                            {/* Période */}
                            <td style={{ padding: "13px 16px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                <Calendar size={11} color={C.textMuted} />
                                <div>
                                  <p style={{ fontSize: 11.5, color: C.textSub, whiteSpace: "nowrap" }}>{fmtD(f.date_debut)}</p>
                                  <p style={{ fontSize: 11, color: C.textMuted }}>→ {fmtD(f.date_fin)}</p>
                                </div>
                              </div>
                            </td>

                            {/* Durée */}
                            <td className="dfc-hide-sm" style={{ padding: "13px 16px" }}>
                              {dur ? (
                                <span style={{ fontSize: 12, fontWeight: 700, color: C.gold, background: C.goldPale, padding: "3px 9px", borderRadius: 6, border: `1px solid ${C.gold}25` }}>
                                  {dur} j
                                </span>
                              ) : <span style={{ fontSize: 12, color: C.textMuted }}>—</span>}
                            </td>

                            {/* Statut session */}
                            <td style={{ padding: "13px 16px" }}>
                              <span className="dfc-badge" style={{ background: ss.bg, color: ss.c, border: `1px solid ${ss.c}25` }}>
                                <SSI size={9} /> {ss.l}
                              </span>
                            </td>

                            {/* Apprenants */}
                            <td style={{ padding: "13px 16px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 9, background: C.greenPale, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <Users size={13} color={C.green} />
                                </div>
                                <span className="dfc-serif" style={{ fontSize: 17, fontWeight: 700, color: C.textPri }}>{f.nb_candidats || 0}</span>
                              </div>
                            </td>

                            {/* Action */}
                            <td style={{ padding: "13px 16px" }} onClick={(e) => { e.stopPropagation(); setDetail({ formation: f, id: fid }); }}>
                              <div className="dfc-act-btn"
                                style={{ background: `${C.blue}08`, borderColor: `${C.blue}20` }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = `${C.blue}18`; e.currentTarget.style.borderColor = C.blue; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = `${C.blue}08`; e.currentTarget.style.borderColor = `${C.blue}20`; }}>
                                <Eye size={13} color={C.blue} />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Légende */}
                <div style={{ padding: "10px 20px", background: `${C.navy}02`, borderTop: `1px solid ${C.divider}`, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                  <Tri h={3} />
                  {[
                    { c: C.gold,  l: "Planifiée",  icon: Clock       },
                    { c: C.blue,  l: "En cours",   icon: TrendingUp  },
                    { c: C.green, l: "Terminée",   icon: CheckCircle2},
                  ].map((s) => {
                    const SI = s.icon;
                    return (
                      <div key={s.l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <SI size={11} color={s.c} />
                        <span style={{ fontSize: 11, color: C.textMuted }}><strong style={{ color: s.c }}>{s.l}</strong></span>
                      </div>
                    );
                  })}
                  <span style={{ fontSize: 11, color: C.textMuted, marginLeft: "auto" }}>
                    Cliquez sur ↑↓ les entêtes pour trier · Cliquez sur une ligne pour voir le détail
                  </span>
                </div>
              </>
            )}

            {/* Pagination */}
            {!loading && sorted.length > 0 && pages > 1 && (
              <div style={{ padding: "13px 20px", borderTop: `1px solid ${C.divider}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <p style={{ fontSize: 12, color: C.textMuted }}>
                  <span style={{ fontWeight: 700, color: C.textSub }}>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)}</span> / <span style={{ fontWeight: 700, color: C.textSub }}>{sorted.length}</span>
                </p>
                <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                  <button className="dfc-pg" onClick={() => setPage((p) => p - 1)} disabled={page === 1}><ChevronLeft size={13} /></button>
                  {Array.from({ length: pages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 1)
                    .map((p, i, arr) => (
                      <React.Fragment key={p}>
                        {i > 0 && arr[i - 1] !== p - 1 && <span style={{ color: C.textMuted, fontSize: 12, padding: "0 2px" }}>…</span>}
                        <button className={`dfc-pg${p === page ? " active" : ""}`} onClick={() => setPage(p)}>{p}</button>
                      </React.Fragment>
                    ))}
                  <button className="dfc-pg" onClick={() => setPage((p) => p + 1)} disabled={page === pages}><ChevronRight size={13} /></button>
                </div>
              </div>
            )}
          </div>

          {/* Note bas de page */}
          <div className="dfc-in dfc-d4" style={{ marginTop: 14, padding: "12px 18px", background: `${C.navy}03`, borderRadius: 12, border: `1px solid ${C.divider}`, display: "flex", alignItems: "center", gap: 10 }}>
            <BookOpen size={13} color={C.textMuted} />
            <p style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>
              Affiche uniquement les formations de type <strong style={{ color: C.blue }}>Formation Continue (DFC)</strong>.
              Cliquez sur une ligne ou une carte pour consulter le détail et les apprenants inscrits.
            </p>
          </div>

        </div>
      </div>

      {detail && (
        <DFCDetailModal
          formation={detail.formation}
          dfcId={detail.id}
          onClose={() => setDetail(null)}
        />
      )}
    </>
  );
};

export default FormationContinue;