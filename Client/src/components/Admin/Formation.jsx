import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import CONFIG from "../../config/config.js";
import {
  GraduationCap, Users, Search, ChevronLeft, ChevronRight,
  AlertTriangle, Calendar, RefreshCw, Loader2,
  MapPinned, ClipboardList, Eye, X,
  BookOpen, User, TrendingUp, Zap, Globe, Award,
  ArrowUpRight, Filter, SlidersHorizontal,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   DESIGN SYSTEM — Luxury Dark Editorial
   Inspiré des dashboards fintech haut de gamme
═══════════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #080C14;
    --bg2:       #0D1420;
    --bg3:       #111827;
    --surface:   #141D2E;
    --surface2:  #1A2540;
    --border:    rgba(255,255,255,0.07);
    --border2:   rgba(255,255,255,0.12);
    --text1:     #F0F4FF;
    --text2:     #8896B3;
    --text3:     #4A5568;
    --accent:    #4F8EF7;
    --accent2:   #7C3AED;
    --gold:      #F59E0B;
    --green:     #10B981;
    --danger:    #EF4444;
    --dap:       #A855F7;
    --dfc:       #3B82F6;
    --glow-blue: rgba(79,142,247,0.15);
    --glow-pur:  rgba(168,85,247,0.15);
  }

  .fm { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text1); min-height: 100vh; -webkit-font-smoothing: antialiased; }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }

  /* ── Fond animé ── */
  .fm-bg {
    position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
  }
  .fm-bg::before {
    content: ''; position: absolute;
    width: 800px; height: 800px; border-radius: 50%;
    background: radial-gradient(circle, rgba(79,142,247,0.06) 0%, transparent 70%);
    top: -200px; right: -200px;
    animation: bgPulse 8s ease-in-out infinite alternate;
  }
  .fm-bg::after {
    content: ''; position: absolute;
    width: 600px; height: 600px; border-radius: 50%;
    background: radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 70%);
    bottom: -100px; left: -100px;
    animation: bgPulse 10s ease-in-out infinite alternate-reverse;
  }
  @keyframes bgPulse { from { opacity: 0.5; transform: scale(1); } to { opacity: 1; transform: scale(1.1); } }

  /* ── Layout ── */
  .fm-wrap { position: relative; z-index: 1; max-width: 1280px; margin: 0 auto; padding: 88px 32px 80px; }

  /* ── KPI Cards ── */
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
  .kpi-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 22px 20px;
    position: relative; overflow: hidden;
    transition: border-color 0.2s, transform 0.2s;
    cursor: default;
  }
  .kpi-card:hover { border-color: var(--border2); transform: translateY(-2px); }
  .kpi-card::before {
    content: ''; position: absolute; inset: 0; border-radius: 18px;
    background: var(--card-glow, transparent);
    opacity: 0; transition: opacity 0.3s;
  }
  .kpi-card:hover::before { opacity: 1; }
  .kpi-val { font-family: 'Syne', sans-serif; font-size: 36px; font-weight: 800; line-height: 1; letter-spacing: -1.5px; }
  .kpi-label { font-size: 12px; color: var(--text2); margin-top: 6px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; }
  .kpi-icon { position: absolute; top: 18px; right: 18px; width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
  .kpi-trend { display: inline-flex; align-items: center; gap: 3px; font-size: 11px; font-weight: 600; margin-top: 8px; padding: 2px 7px; border-radius: 20px; }

  /* ── Toolbar ── */
  .fm-toolbar {
    display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
    background: var(--surface); border: 1px solid var(--border); border-radius: 16px;
    padding: 14px 18px; margin-bottom: 20px;
  }
  .fm-search-wrap { position: relative; flex: 1 1 240px; min-width: 0; }
  .fm-search-wrap svg { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); pointer-events: none; }
  .fm-input {
    width: 100%; padding: 10px 14px 10px 38px;
    background: var(--bg3); border: 1px solid var(--border); border-radius: 10px;
    color: var(--text1); font-family: 'DM Sans', sans-serif; font-size: 13.5px;
    outline: none; transition: border-color 0.15s, box-shadow 0.15s;
  }
  .fm-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(79,142,247,0.12); }
  .fm-input::placeholder { color: var(--text3); }
  select.fm-input { cursor: pointer; }

  .chip {
    padding: 7px 15px; border-radius: 20px; cursor: pointer; font-size: 12px; font-weight: 600;
    font-family: 'DM Sans', sans-serif; border: 1px solid var(--border); background: transparent;
    color: var(--text2); transition: all 0.14s; white-space: nowrap;
  }
  .chip:hover { border-color: var(--border2); color: var(--text1); }
  .chip.active-dap { background: rgba(168,85,247,0.15); border-color: rgba(168,85,247,0.5); color: var(--dap); }
  .chip.active-dfc { background: rgba(59,130,246,0.15); border-color: rgba(59,130,246,0.5); color: var(--dfc); }
  .chip.active-all { background: rgba(255,255,255,0.07); border-color: var(--border2); color: var(--text1); }

  /* ── Table ── */
  .fm-table-wrap {
    background: var(--surface); border: 1px solid var(--border); border-radius: 20px; overflow: hidden;
  }
  .fm-table { width: 100%; border-collapse: collapse; }
  .fm-thead tr { background: var(--bg3); border-bottom: 1px solid var(--border); }
  .fm-thead th {
    padding: 13px 18px; text-align: left; font-size: 10px; font-weight: 700;
    color: var(--text3); letter-spacing: 0.12em; text-transform: uppercase;
    font-family: 'DM Mono', monospace;
  }
  .fm-tr { border-bottom: 1px solid var(--border); transition: background 0.1s; cursor: pointer; }
  .fm-tr:last-child { border-bottom: none; }
  .fm-tr:hover { background: rgba(255,255,255,0.03); }
  .fm-tr:hover .fm-row-action { opacity: 1; transform: scale(1); }
  .fm-row-action { opacity: 0; transform: scale(0.85); transition: all 0.15s; }
  .fm-td { padding: 15px 18px; font-size: 13px; }

  /* ── Badges ── */
  .badge {
    display: inline-flex; align-items: center; gap: 5px;
    border-radius: 6px; padding: 3px 9px;
    font-size: 10px; font-weight: 700; letter-spacing: 0.06em;
    font-family: 'DM Mono', monospace; text-transform: uppercase;
  }
  .badge-dap { background: rgba(168,85,247,0.15); color: var(--dap); border: 1px solid rgba(168,85,247,0.25); }
  .badge-dfc { background: rgba(59,130,246,0.15); color: var(--dfc); border: 1px solid rgba(59,130,246,0.25); }
  .badge-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

  /* ── Pagination ── */
  .pg-btn {
    width: 34px; height: 34px; border-radius: 9px; border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center; cursor: pointer;
    background: transparent; color: var(--text2); font-family: 'DM Mono', monospace;
    font-size: 12px; font-weight: 600; transition: all 0.14s;
  }
  .pg-btn:hover { background: var(--surface2); border-color: var(--border2); color: var(--text1); }
  .pg-btn.active { background: var(--accent); border-color: var(--accent); color: #fff; }
  .pg-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  /* ── Modal ── */
  .fm-modal-overlay {
    position: fixed; inset: 0; z-index: 900;
    display: flex; align-items: center; justify-content: center; padding: 72px 16px 16px;
  }
  .fm-modal-backdrop {
    position: absolute; inset: 0;
    background: rgba(8,12,20,0.85); backdrop-filter: blur(20px);
  }
  .fm-modal {
    position: relative; width: 100%; max-width: 800px;
    max-height: calc(100vh - 88px); overflow-y: auto;
    background: var(--surface); border: 1px solid var(--border2);
    border-radius: 24px; box-shadow: 0 40px 100px rgba(0,0,0,0.6);
    animation: modalIn 0.22s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  @keyframes modalIn { from { opacity: 0; transform: scale(0.94) translateY(-20px); } to { opacity: 1; transform: scale(1) translateY(0); } }

  /* ── Animations entrée ── */
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .anim-0 { animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.0s both; }
  .anim-1 { animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.07s both; }
  .anim-2 { animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.14s both; }
  .anim-3 { animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.21s both; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .spin { animation: spin 0.8s linear infinite; }

  /* ── Misc ── */
  .mono { font-family: 'DM Mono', monospace; }
  .syne { font-family: 'Syne', sans-serif; }

  /* ── Empty state ── */
  .fm-empty { display: flex; flex-direction: column; align-items: center; padding: 72px 0; gap: 14px; }
  .fm-empty-icon { width: 64px; height: 64px; border-radius: 18px; display: flex; align-items: center; justify-content: center; background: var(--bg3); border: 1px solid var(--border); }

  /* ── Modal detail rows ── */
  .d-row { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border); }
  .d-row:last-child { border-bottom: none; }
  .d-lbl { font-size: 10.5px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.08em; min-width: 130px; flex-shrink: 0; padding-top: 2px; font-family: 'DM Mono', monospace; }
  .d-val { font-size: 13px; color: var(--text1); font-weight: 400; }

  /* ── Apprenants table ── */
  .app-table { width: 100%; border-collapse: collapse; }
  .app-table thead tr { background: var(--bg3); }
  .app-table th { padding: 10px 14px; text-align: left; font-size: 10px; font-weight: 700; color: var(--text3); letter-spacing: 0.1em; text-transform: uppercase; font-family: 'DM Mono', monospace; }
  .app-table td { padding: 11px 14px; font-size: 12.5px; border-top: 1px solid var(--border); }

  /* ── Responsive ── */
  @media(max-width: 900px) {
    .kpi-grid { grid-template-columns: repeat(2, 1fr); }
    .fm-wrap { padding: 80px 16px 64px; }
    .hide-md { display: none !important; }
  }
  @media(max-width: 600px) {
    .kpi-grid { grid-template-columns: 1fr 1fr; }
    .hide-sm { display: none !important; }
  }
`;

/* ═══════════════════════════════════════════════════
   CONSTANTES
═══════════════════════════════════════════════════ */
const ANTENNES_LIST = [
  { v:"conakry",    l:"Conakry"    },
  { v:"forecariah", l:"Forecariah" },
  { v:"boke",       l:"Boké"       },
  { v:"kindia",     l:"Kindia"     },
  { v:"labe",       l:"Labé"       },
  { v:"mamou",      l:"Mamou"      },
  { v:"faranah",    l:"Faranah"    },
  { v:"kankan",     l:"Kankan"     },
  { v:"siguiri",    l:"Siguiri"    },
  { v:"nzerekore",  l:"N'Zérékoré" },
];
const ANTENNE_LABEL = (v) => ANTENNES_LIST.find(a => a.v === v)?.l || v || "—";
const PAGE_SIZE = 12;

const authHeader = () => {
  const t = localStorage.getItem("access") || localStorage.getItem("access_token") || localStorage.getItem("token");
  return { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) };
};

/* ═══════════════════════════════════════════════════
   COMPOSANTS
═══════════════════════════════════════════════════ */
const DivBadge = ({ type }) => {
  if (!type) return <span style={{ color: "var(--text3)", fontSize: 12 }}>—</span>;
  const isDap = type === "apprentissage";
  return (
    <span className={`badge ${isDap ? "badge-dap" : "badge-dfc"}`}>
      <span className="badge-dot" style={{ background: isDap ? "var(--dap)" : "var(--dfc)" }}/>
      {isDap ? "DAP" : "DFC"}
    </span>
  );
};

const StatutBadge = ({ s }) => {
  const cfg = {
    en_attente: { l: "En attente", c: "var(--gold)",   bg: "rgba(245,158,11,0.12)",  b: "rgba(245,158,11,0.25)" },
    valide:     { l: "Validé",     c: "var(--green)",  bg: "rgba(16,185,129,0.12)",  b: "rgba(16,185,129,0.25)" },
    rejete:     { l: "Rejeté",     c: "var(--danger)", bg: "rgba(239,68,68,0.12)",   b: "rgba(239,68,68,0.25)"  },
  }[s] || { l: s, c: "var(--text2)", bg: "var(--bg3)", b: "var(--border)" };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, borderRadius:6, padding:"3px 9px", fontSize:10, fontWeight:700, letterSpacing:"0.06em", fontFamily:"'DM Mono',monospace", textTransform:"uppercase", background:cfg.bg, color:cfg.c, border:`1px solid ${cfg.b}` }}>
      <span style={{ width:4, height:4, borderRadius:"50%", background:cfg.c, flexShrink:0 }}/>
      {cfg.l}
    </span>
  );
};

/* ═══════════════════════════════════════════════════
   MODAL DÉTAIL FORMATION
═══════════════════════════════════════════════════ */
const DetailModal = ({ f, onClose }) => {
  const [candidats, setCandidats] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [tab,       setTab]       = useState("info"); // info | apprenants

  useEffect(() => {
    if (!f?.id) return;
    setLoading(true);
    axios.get(`${CONFIG.BASE_URL}${CONFIG.API_FORMATIONS}${f.id}/candidats/`, { headers: authHeader() })
      .then(res => {
        // ✅ Fix : la réponse est { candidats: [...], ... }
        const data = res.data?.candidats || res.data?.results || (Array.isArray(res.data) ? res.data : []);
        setCandidats(data);
      })
      .catch(() => setCandidats([]))
      .finally(() => setLoading(false));
  }, [f?.id]);

  const isDap = f.type_formation === "apprentissage";
  const accentColor = isDap ? "var(--dap)" : "var(--dfc)";

  return (
    <div className="fm-modal-overlay">
      <div className="fm-modal-backdrop" onClick={onClose}/>
      <div className="fm-modal">

        {/* Barre de couleur top */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${accentColor}, ${isDap ? "var(--accent)" : "var(--green)"})`, borderRadius: "24px 24px 0 0" }}/>

        {/* Header */}
        <div style={{ padding: "24px 28px 0" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
              {/* Icône */}
              <div style={{ width: 52, height: 52, borderRadius: 15, background: isDap ? "rgba(168,85,247,0.12)" : "rgba(59,130,246,0.12)", border: `1px solid ${accentColor}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <GraduationCap size={22} color={accentColor}/>
              </div>
              <div>
                <h2 className="syne" style={{ fontSize: 20, fontWeight: 700, color: "var(--text1)", lineHeight: 1.2, letterSpacing: "-0.3px" }}>
                  {f.nom_formation}
                </h2>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
                  <DivBadge type={f.type_formation}/>
                  {f.identifiant_formation && (
                    <span className="mono" style={{ fontSize: 11, color: "var(--accent)", background: "rgba(79,142,247,0.1)", padding: "3px 9px", borderRadius: 6, border: "1px solid rgba(79,142,247,0.2)" }}>
                      {f.identifiant_formation}
                    </span>
                  )}
                  <span style={{ fontSize: 11, color: "var(--text2)", display: "flex", alignItems: "center", gap: 4 }}>
                    <MapPinned size={11}/> {f.antenne_display || ANTENNE_LABEL(f.antenne)}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 9, background: "var(--bg3)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, color: "var(--text2)" }}>
              <X size={14}/>
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginTop: 22, borderBottom: "1px solid var(--border)", paddingBottom: 0 }}>
            {[
              { k: "info",       l: "Informations",  icon: ClipboardList },
              { k: "apprenants", l: `Apprenants (${candidats.length})`, icon: Users },
            ].map(t => (
              <button key={t.k} onClick={() => setTab(t.k)} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 16px", cursor: "pointer", background: "none", border: "none",
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: tab === t.k ? 600 : 400,
                color: tab === t.k ? "var(--text1)" : "var(--text2)",
                borderBottom: tab === t.k ? `2px solid ${accentColor}` : "2px solid transparent",
                marginBottom: -1, transition: "all 0.15s",
              }}>
                <t.icon size={13}/> {t.l}
              </button>
            ))}
          </div>
        </div>

        {/* Contenu */}
        <div style={{ padding: "22px 28px 28px" }}>

          {tab === "info" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Section info */}
              <div style={{ background: "var(--bg3)", borderRadius: 14, padding: "16px 20px", border: "1px solid var(--border)" }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, fontFamily: "'DM Mono',monospace" }}>Session</p>
                <div className="d-row"><span className="d-lbl">Organisme</span><span className="d-val">{f.organisme_formation || "—"}</span></div>
                <div className="d-row"><span className="d-lbl">Formateur</span><span className="d-val">{f.nom_formateur || "—"}</span></div>
                <div className="d-row">
                  <span className="d-lbl">Période</span>
                  <span className="d-val">
                    {f.date_debut ? new Date(f.date_debut).toLocaleDateString("fr-FR", { day:"2-digit", month:"long", year:"numeric" }) : "—"}
                    {" → "}
                    {f.date_fin   ? new Date(f.date_fin).toLocaleDateString("fr-FR",   { day:"2-digit", month:"long", year:"numeric" }) : "—"}
                  </span>
                </div>
                <div className="d-row"><span className="d-lbl">Type</span><div className="d-val">{f.type_formation === "continue" ? <span style={{ color: "var(--dfc)" }}>Formation Continue</span> : f.type_formation === "apprentissage" ? <span style={{ color: "var(--dap)" }}>Apprentissage</span> : "—"}</div></div>
                <div className="d-row"><span className="d-lbl">Division</span><div className="d-val"><DivBadge type={f.type_formation}/></div></div>
                {f.entreprise_formation && <div className="d-row"><span className="d-lbl">Entreprise</span><span className="d-val">{f.entreprise_formation}</span></div>}
                <div className="d-row"><span className="d-lbl">Antenne</span><span className="d-val">{f.antenne_display || ANTENNE_LABEL(f.antenne)}</span></div>
              </div>

              {/* Métriques */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ background: "var(--bg3)", borderRadius: 12, padding: "16px 18px", border: "1px solid var(--border)" }}>
                  <p style={{ fontSize: 10, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'DM Mono',monospace", marginBottom: 8 }}>Apprenants</p>
                  <p className="syne" style={{ fontSize: 32, fontWeight: 800, color: "var(--green)", letterSpacing: "-1px" }}>{f.nb_candidats || 0}</p>
                </div>
                <div style={{ background: "var(--bg3)", borderRadius: 12, padding: "16px 18px", border: "1px solid var(--border)" }}>
                  <p style={{ fontSize: 10, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'DM Mono',monospace", marginBottom: 8 }}>Division</p>
                  <p className="syne" style={{ fontSize: 28, fontWeight: 800, color: accentColor, letterSpacing: "-1px" }}>{f.division || "—"}</p>
                  <p style={{ fontSize: 11, color: "var(--text2)", marginTop: 4 }}>{f.division_label || (isDap ? "Apprentissage" : "Continue")}</p>
                </div>
              </div>
            </div>
          )}

          {tab === "apprenants" && (
            loading ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "32px 0", justifyContent: "center" }}>
                <Loader2 size={18} color="var(--accent)" className="spin"/>
                <span style={{ fontSize: 13, color: "var(--text2)" }}>Chargement…</span>
              </div>
            ) : candidats.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0", gap: 12 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: "var(--bg3)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Users size={20} color="var(--text3)"/>
                </div>
                <p style={{ fontSize: 14, color: "var(--text2)", fontWeight: 500 }}>Aucun apprenant rattaché</p>
                <p style={{ fontSize: 12, color: "var(--text3)" }}>Les apprenants inscrits à cette formation apparaîtront ici</p>
              </div>
            ) : (
              <div style={{ background: "var(--bg3)", borderRadius: 14, border: "1px solid var(--border)", overflow: "hidden" }}>
                <table className="app-table">
                  <thead>
                    <tr>
                      {["Apprenant", "Identifiant", "Contact", "Statut"].map((h, i) => (
                        <th key={i}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {candidats.map(c => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 600, color: "var(--text1)" }}>{c.nom} {c.prenom}</td>
                        <td>
                          {c.identifiant_unique
                            ? <span className="mono" style={{ fontSize: 11, color: "var(--accent)", background: "rgba(79,142,247,0.1)", padding: "2px 7px", borderRadius: 5, border: "1px solid rgba(79,142,247,0.2)" }}>{c.identifiant_unique}</span>
                            : <span style={{ color: "var(--text3)" }}>—</span>}
                        </td>
                        <td style={{ color: "var(--text2)" }}>{c.telephone || c.email || "—"}</td>
                        <td><StatutBadge s={c.statut_fiche}/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>

        <div style={{ padding: "14px 28px 22px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 20px", borderRadius: 10, background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--text2)", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--text1)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text2)"; }}>
            <X size={13}/> Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
═══════════════════════════════════════════════════ */
const Formation = () => {
  const [formations, setFormations] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [filterDiv,  setFilterDiv]  = useState("tous");
  const [filterAnt,  setFilterAnt]  = useState("");
  const [page,       setPage]       = useState(1);
  const [detail,     setDetail]     = useState(null);

  const fetchFormations = async () => {
    setLoading(true);
    try {
      const res  = await axios.get(`${CONFIG.BASE_URL}${CONFIG.API_FORMATIONS}`, { headers: authHeader() });
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setFormations(data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchFormations(); }, []);

  const filtered = formations.filter(f => {
    const q = search.toLowerCase();
    const matchS = !q || [f.nom_formation, f.organisme_formation, f.nom_formateur, ANTENNE_LABEL(f.antenne)].some(v => v?.toLowerCase().includes(q));
    const matchD = filterDiv === "tous" || (filterDiv === "DAP" ? f.type_formation === "apprentissage" : f.type_formation === "continue");
    const matchA = !filterAnt || f.antenne === filterAnt;
    return matchS && matchD && matchA;
  });

  const pages     = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = {
    total:      formations.length,
    dap:        formations.filter(f => f.type_formation === "apprentissage").length,
    dfc:        formations.filter(f => f.type_formation === "continue").length,
    apprenants: formations.reduce((a, f) => a + (f.nb_candidats || 0), 0),
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="fm">
        <div className="fm-bg"/>
        <div className="fm-wrap">

          {/* ── En-tête ── */}
          <div className="anim-0" style={{ marginBottom: 32 }}>
            {/* Fil tricolore Guinée */}
            <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
              {["#E02020", "#F59E0B", "#10B981"].map((c, i) => (
                <div key={i} style={{ width: 28, height: 3, borderRadius: 3, background: c }}/>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
              <div>
                <p className="mono" style={{ fontSize: 11, color: "var(--text3)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>
                  ONFPP · Guinée
                </p>
                <h1 className="syne" style={{ fontSize: 36, fontWeight: 800, color: "var(--text1)", letterSpacing: "-1px", lineHeight: 1.05 }}>
                  Catalogue des<br/>
                  <span style={{ background: "linear-gradient(90deg, var(--accent), var(--dap))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    formations
                  </span>
                </h1>
                <p style={{ fontSize: 13, color: "var(--text2)", marginTop: 8 }}>Sessions DAP & DFC — {stats.total} programme{stats.total > 1 ? "s" : ""}</p>
              </div>
              <button onClick={fetchFormations} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 12, background: "var(--surface)", border: "1px solid var(--border2)", color: "var(--text1)", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, transition: "all 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--surface2)"}
                onMouseLeave={e => e.currentTarget.style.background = "var(--surface)"}>
                <RefreshCw size={13}/> Actualiser
              </button>
            </div>
          </div>

          {/* ── KPIs ── */}
          <div className="kpi-grid anim-1">
            {[
              { label: "Total formations", value: stats.total,      color: "var(--accent)", glow: "var(--glow-blue)", icon: GraduationCap, trend: null },
              { label: "DAP — Apprentissage", value: stats.dap,     color: "var(--dap)",    glow: "var(--glow-pur)",  icon: BookOpen,      trend: null },
              { label: "DFC — Continue",    value: stats.dfc,       color: "var(--dfc)",    glow: "var(--glow-blue)", icon: ClipboardList, trend: null },
              { label: "Total apprenants",  value: stats.apprenants, color: "var(--green)", glow: "rgba(16,185,129,0.12)", icon: Users,    trend: null },
            ].map((s, i) => {
              const SI = s.icon;
              return (
                <div key={i} className="kpi-card" style={{ "--card-glow": s.glow }}>
                  <div className="kpi-icon" style={{ background: `${s.color}18`, border: `1px solid ${s.color}25` }}>
                    <SI size={17} color={s.color}/>
                  </div>
                  <p className="kpi-val" style={{ color: s.color }}>{s.value}</p>
                  <p className="kpi-label">{s.label}</p>
                </div>
              );
            })}
          </div>

          {/* ── Toolbar ── */}
          <div className="fm-toolbar anim-2">
            <div className="fm-search-wrap">
              <Search size={14} color="var(--text3)"/>
              <input className="fm-input" placeholder="Rechercher formation, organisme, formateur…" value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}/>
            </div>

            {/* Chips division */}
            <div style={{ display: "flex", gap: 6 }}>
              {[{ v:"tous", l:"Toutes" }, { v:"DAP", l:"DAP" }, { v:"DFC", l:"DFC" }].map(f => (
                <button key={f.v} className={`chip ${filterDiv === f.v ? (f.v === "DAP" ? "active-dap" : f.v === "DFC" ? "active-dfc" : "active-all") : ""}`}
                  onClick={() => { setFilterDiv(f.v); setPage(1); }}>
                  {f.l}
                </button>
              ))}
            </div>

            {/* Antenne */}
            <select className="fm-input" value={filterAnt} onChange={e => { setFilterAnt(e.target.value); setPage(1); }}
              style={{ width: "auto", minWidth: 160, padding: "10px 14px" }}>
              <option value="">Toutes antennes</option>
              {ANTENNES_LIST.map(a => <option key={a.v} value={a.v}>{a.l}</option>)}
            </select>

            <span className="mono" style={{ fontSize: 11, color: "var(--text3)", whiteSpace: "nowrap" }}>
              {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
            </span>
          </div>

          {/* ── Table ── */}
          <div className="fm-table-wrap anim-3">
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "72px 0", gap: 14 }}>
                <Loader2 size={32} color="var(--accent)" className="spin"/>
                <p style={{ fontSize: 13, color: "var(--text2)" }}>Chargement des formations…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="fm-empty">
                <div className="fm-empty-icon"><GraduationCap size={26} color="var(--text3)"/></div>
                <p className="syne" style={{ fontSize: 16, fontWeight: 700, color: "var(--text2)" }}>Aucune formation trouvée</p>
                <p style={{ fontSize: 13, color: "var(--text3)" }}>{search || filterDiv !== "tous" || filterAnt ? "Modifiez vos filtres" : "Les formations apparaîtront ici après inscription d'un candidat"}</p>
              </div>
            ) : (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table className="fm-table">
                    <thead className="fm-thead">
                      <tr>
                        {[
                          { h: "Identifiant",    sm: false },
                          { h: "Formation",      sm: false },
                          { h: "Antenne",        sm: false },
                          { h: "Division",       sm: false },
                          { h: "Apprenants",     sm: false },
                          { h: "Formateur",      sm: true  },
                          { h: "Période",        sm: true  },
                          { h: "",               sm: false },
                        ].map((col, i) => (
                          <th key={i} className={col.sm ? "hide-md" : ""}>{col.h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map(f => {
                        const isDap = f.type_formation === "apprentissage";
                        const ac    = isDap ? "var(--dap)" : "var(--dfc)";
                        return (
                          <tr key={f.id} className="fm-tr" onClick={() => setDetail(f)}>

                            {/* Identifiant */}
                            <td className="fm-td">
                              {f.identifiant_formation ? (
                                <span className="mono" style={{ fontSize: 10.5, color: "var(--accent)", background: "rgba(79,142,247,0.08)", padding: "3px 9px", borderRadius: 6, border: "1px solid rgba(79,142,247,0.15)", whiteSpace: "nowrap" }}>
                                  {f.identifiant_formation}
                                </span>
                              ) : <span style={{ color: "var(--text3)", fontSize: 12 }}>—</span>}
                            </td>

                            {/* Formation */}
                            <td className="fm-td">
                              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{ width: 38, height: 38, borderRadius: 11, background: `${ac}12`, border: `1px solid ${ac}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                  <GraduationCap size={16} color={ac}/>
                                </div>
                                <div>
                                  <p style={{ fontWeight: 600, color: "var(--text1)", fontSize: 13.5, lineHeight: 1.3 }}>{f.nom_formation}</p>
                                  <p style={{ fontSize: 11, color: "var(--text3)", marginTop: 1 }}>{f.organisme_formation || "—"}</p>
                                </div>
                              </div>
                            </td>

                            {/* Antenne */}
                            <td className="fm-td">
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <MapPinned size={12} color="var(--text3)"/>
                                <span style={{ fontSize: 12.5, color: "var(--text2)", fontWeight: 500 }}>
                                  {f.antenne_display || ANTENNE_LABEL(f.antenne)}
                                </span>
                              </div>
                            </td>

                            {/* Division */}
                            <td className="fm-td"><DivBadge type={f.type_formation}/></td>

                            {/* Apprenants */}
                            <td className="fm-td">
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <Users size={13} color="var(--green)"/>
                                </div>
                                <span className="syne" style={{ fontSize: 18, fontWeight: 800, color: "var(--text1)", letterSpacing: "-0.5px" }}>{f.nb_candidats || 0}</span>
                              </div>
                            </td>

                            {/* Formateur */}
                            <td className="fm-td hide-md">
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <User size={11} color="var(--text3)"/>
                                <span style={{ fontSize: 12, color: "var(--text2)" }}>{f.nom_formateur || "—"}</span>
                              </div>
                            </td>

                            {/* Période */}
                            <td className="fm-td hide-md">
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <Calendar size={11} color="var(--text3)"/>
                                <span className="mono" style={{ fontSize: 11, color: "var(--text2)" }}>
                                  {f.date_debut ? new Date(f.date_debut).toLocaleDateString("fr-FR", { day:"2-digit", month:"short", year:"2-digit" }) : "—"}
                                  {" → "}
                                  {f.date_fin   ? new Date(f.date_fin).toLocaleDateString("fr-FR",   { day:"2-digit", month:"short", year:"2-digit" }) : "—"}
                                </span>
                              </div>
                            </td>

                            {/* Action */}
                            <td className="fm-td" onClick={e => { e.stopPropagation(); setDetail(f); }}>
                              <div className="fm-row-action" style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(79,142,247,0.08)", border: "1px solid rgba(79,142,247,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                <ArrowUpRight size={14} color="var(--accent)"/>
                              </div>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Légende + Pagination */}
                <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div style={{ display: "flex", gap: 16 }}>
                    <span style={{ fontSize: 11, color: "var(--dap)" }} className="mono">◆ DAP — Apprentissage</span>
                    <span style={{ fontSize: 11, color: "var(--dfc)" }} className="mono">◆ DFC — Continue</span>
                  </div>

                  {pages > 1 && (
                    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                      <button className="pg-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}><ChevronLeft size={13}/></button>
                      {Array.from({ length: pages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === pages || Math.abs(p - page) <= 1)
                        .map((p, i, arr) => (
                          <React.Fragment key={p}>
                            {i > 0 && arr[i - 1] !== p - 1 && <span style={{ color: "var(--text3)", fontSize: 12, padding: "0 2px" }}>…</span>}
                            <button className={`pg-btn${p === page ? " active" : ""}`} onClick={() => setPage(p)}>{p}</button>
                          </React.Fragment>
                        ))}
                      <button className="pg-btn" onClick={() => setPage(p => p + 1)} disabled={page === pages}><ChevronRight size={13}/></button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Note */}
          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }}>
            <Zap size={13} color="var(--text3)"/>
            <p style={{ fontSize: 12, color: "var(--text3)" }}>
              Les formations sont créées depuis <strong style={{ color: "var(--text2)" }}>Inscriptions</strong>. Cliquez sur une ligne pour voir le détail et les apprenants associés.
            </p>
          </div>

        </div>
      </div>

      {detail && <DetailModal f={detail} onClose={() => setDetail(null)}/>}
    </>
  );
};

export default Formation;