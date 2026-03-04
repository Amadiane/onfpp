import { useEffect, useState, useRef } from "react";
import {
  ClipboardList, Plus, Search, X, CheckCircle2, AlertTriangle,
  RefreshCw, ArrowLeft, Calendar, MapPin, User, Building2,
  FileText, FileSpreadsheet, BarChart3, Loader2, Trash2,
  ChevronDown, ChevronUp, TrendingUp, Users, Send,
  BookOpen, Edit3, Star, PieChart,
} from "lucide-react";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);
import CONFIG from "../../config/config.js";

const C = {
  bg:"#F0F4FF", surface:"#FFFFFF", surfaceAlt:"#EEF2FF",
  navy:"#0D1B5E", blue:"#1A3BD4", iceBlue:"#C8D9FF",
  textSub:"#4A5A8A", textMuted:"#8FA3D8",
  success:"#0BA376", danger:"#E53935", accent:"#F5A800",
  purple:"#7C3AED", shadow:"rgba(26,59,212,0.10)",
};

/* NOTE_MAPPING identique au backend */
const NOTE_MAP    = { 1:25, 2:50, 3:75 };
const NOTE_LABELS = { 1:"Pas satisfait", 2:"Satisfait", 3:"Très satisfait" };
const NOTE_COLORS = {
  1:{ bg:"#FFF1F2", text:C.danger,  border:"#FECDD3" },
  2:{ bg:"#FFFBEB", text:C.accent,  border:"#FDE68A" },
  3:{ bg:"#F0FDF4", text:C.success, border:"#86EFAC" },
};
const scoreStyle = p => p>=75
  ? { text:C.success, bg:"#F0FDF4", border:"#86EFAC", label:"Très satisfaisant" }
  : p>=50
  ? { text:C.accent,  bg:"#FFFBEB", border:"#FDE68A", label:"Satisfaisant" }
  : { text:C.danger,  bg:"#FFF1F2", border:"#FECDD3", label:"Insuffisant" };

const authFetch = (path, token, opts={}) =>
  fetch(path.startsWith("http") ? path : `${CONFIG.BASE_URL}${path}`, {
    ...opts,
    headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}`, ...(opts.headers||{}) },
  });

const dlBlob = (blob, name) => {
  const url = URL.createObjectURL(blob);
  Object.assign(document.createElement("a"), { href:url, download:name }).click();
  URL.revokeObjectURL(url);
};

/* ══════════════════════════════════════════════════════
   RACINE
══════════════════════════════════════════════════════ */
export default function SuiviEvaluation() {
  const token = localStorage.getItem("access");
  const [view,    setView]    = useState("list");   // "list" | "new" | "session"
  const [session, setSession] = useState(null);

  return (
    <div style={{ fontFamily:"'Syne',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
        @keyframes spin   { to{ transform:rotate(360deg) } }
        @keyframes fadeUp { from{ opacity:0;transform:translateY(10px) } to{ opacity:1;transform:none } }
      `}</style>

      {view==="list"    && <SessionsList token={token} onSelect={s=>{setSession(s);setView("session");}} onNew={()=>setView("new")}/>}
      {view==="new"     && <NewSession   token={token} onBack={()=>setView("list")} onDone={s=>{setSession(s);setView("session");}}/>}
      {view==="session" && session && <SessionDetail token={token} session={session} onBack={()=>setView("list")}/>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   1 — LISTE DES SESSIONS
══════════════════════════════════════════════════════ */
function SessionsList({ token, onSelect, onNew }) {
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [error,    setError]    = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await authFetch(CONFIG.API_SESSIONS, token);
        if (r.ok) { const d = await r.json(); setSessions(Array.isArray(d)?d:d.results||[]); }
        else setError(`Erreur ${r.status}`);
      } catch { setError("Erreur réseau."); }
      finally   { setLoading(false); }
    })();
  }, []);

  const q   = search.toLowerCase();
  const lst = sessions.filter(s=>[s.theme,s.lieu,s.formateur].some(v=>v?.toLowerCase().includes(q)));
  const fd  = d=>d?new Date(d).toLocaleDateString("fr-FR",{day:"numeric",month:"short",year:"numeric"}):"—";

  return (
    <div style={{ animation:"fadeUp .3s ease" }}>
      {/* Header */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:12 }}>
        <div>
          <h1 style={{ fontSize:22,fontWeight:800,color:C.navy }}>Évaluations des formations</h1>
          <p style={{ fontSize:12,color:C.textMuted,marginTop:4 }}>{sessions.length} session{sessions.length!==1?"s":""}</p>
        </div>
        <Btn icon={Plus} label="Nouvelle session" onClick={onNew}/>
      </div>

      {/* Recherche */}
      <SBar value={search} set={setSearch} ph="Rechercher par thème, lieu, formateur…"/>

      {/* Liste */}
      {loading ? <Spin/> : error ? <Err msg={error}/> : lst.length===0 ? (
        <Empty label={search?"Aucun résultat.":"Aucune session."} onAction={!search?onNew:null} act="Créer la première"/>
      ) : (
        <div style={{ display:"grid",gap:12 }}>
          {lst.map(s=>(
            <div key={s.id}
              onClick={()=>onSelect(s)}
              style={{ background:C.surface,border:"1.5px solid #EEF2FF",borderRadius:18,padding:"18px 22px",cursor:"pointer",display:"flex",alignItems:"center",gap:16,transition:"all .18s",boxShadow:"0 1px 8px rgba(13,27,94,0.05)" }}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 6px 24px rgba(13,27,94,0.12)";e.currentTarget.style.borderColor=C.iceBlue;e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 1px 8px rgba(13,27,94,0.05)";e.currentTarget.style.borderColor="#EEF2FF";e.currentTarget.style.transform="none";}}
            >
              <div style={{ width:48,height:48,borderRadius:14,background:`linear-gradient(135deg,${C.navy},${C.blue})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                <ClipboardList size={22} color="#fff"/>
              </div>
              <div style={{ flex:1,minWidth:0 }}>
                <p style={{ fontSize:15,fontWeight:800,color:C.navy,marginBottom:4 }}>{s.theme}</p>
                <div style={{ display:"flex",gap:14,flexWrap:"wrap" }}>
                  <M icon={User}     t={s.formateur}/>
                  <M icon={MapPin}   t={s.lieu}/>
                  <M icon={Calendar} t={`${fd(s.periode_debut)} → ${fd(s.periode_fin)}`}/>
                  {s.organisme&&<M icon={Building2} t={s.organisme}/>}
                </div>
              </div>
              <span style={{ fontSize:11,fontWeight:700,color:C.blue,background:C.surfaceAlt,padding:"5px 14px",borderRadius:20,border:`1px solid ${C.iceBlue}`,flexShrink:0,whiteSpace:"nowrap" }}>
                Ouvrir →
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   2 — NOUVELLE SESSION
══════════════════════════════════════════════════════ */
function NewSession({ token, onBack, onDone }) {
  const [form, setForm] = useState({ theme:"",periode_debut:"",periode_fin:"",lieu:"",organisme:"",formateur:"",structure_beneficiaire:"" });
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState("");
  const [ok,   setOk]   = useState(false);
  const [foc,  setFoc]  = useState({});

  const iS = n=>({ width:"100%",padding:"10px 14px",borderRadius:10,border:`1.5px solid ${foc[n]?C.blue:C.iceBlue}`,background:C.surface,fontSize:13,color:C.navy,fontFamily:"'Syne',sans-serif",outline:"none",boxShadow:foc[n]?`0 0 0 3px ${C.blue}15`:"none",transition:"all .15s" });
  const fp = n=>({ onFocus:()=>setFoc(p=>({...p,[n]:true})), onBlur:()=>setFoc(p=>({...p,[n]:false})), style:iS(n) });
  const ch = (n,v)=>{ setForm(p=>({...p,[n]:v})); setErr(""); };

  const submit = async e => {
    e.preventDefault();
    if (!form.theme||!form.periode_debut||!form.periode_fin||!form.lieu||!form.formateur)
      { setErr("Remplissez tous les champs obligatoires."); return; }
    setBusy(true);
    try {
      const r = await authFetch(CONFIG.API_SESSIONS, token, { method:"POST", body:JSON.stringify(form) });
      if (r.ok||r.status===201) { const s=await r.json(); setOk(true); setTimeout(()=>onDone(s),1200); }
      else { const d=await r.json().catch(()=>({})); setErr(Object.values(d).flat().join(" ")||`Erreur ${r.status}`); }
    } catch { setErr("Erreur réseau."); }
    finally   { setBusy(false); }
  };

  if (ok) return <Yay label="Session créée !"/>;

  return (
    <div style={{ maxWidth:660,margin:"0 auto",animation:"fadeUp .3s ease" }}>
      <PH onBack={onBack} title="Nouvelle session de formation" sub="Informations générales de la formation" icon={ClipboardList}/>
      <div style={{ background:C.surface,borderRadius:20,padding:28,boxShadow:`0 2px 20px ${C.shadow}`,border:"1.5px solid #EEF2FF" }}>
        <form onSubmit={submit}>
          {/* Thème */}
          <div style={{ marginBottom:14 }}>
            <L t="Thème / Intitulé de la formation" req/>
            <input value={form.theme} onChange={e=>ch("theme",e.target.value)} placeholder="ex : Formation en Gestion de Projet" {...fp("theme")}/>
          </div>
          {/* Dates */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14 }}>
            <div><L t="Date de début" req/><input type="date" value={form.periode_debut} onChange={e=>ch("periode_debut",e.target.value)} {...fp("periode_debut")}/></div>
            <div><L t="Date de fin"   req/><input type="date" value={form.periode_fin}   onChange={e=>ch("periode_fin",  e.target.value)} {...fp("periode_fin")}/></div>
          </div>
          {/* Lieu + Formateur */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14 }}>
            <div><L t="Lieu" req/><input value={form.lieu} onChange={e=>ch("lieu",e.target.value)} placeholder="ex : Conakry" {...fp("lieu")}/></div>
            <div><L t="Formateur" req/><input value={form.formateur} onChange={e=>ch("formateur",e.target.value)} placeholder="ex : Mamadou Diallo" {...fp("formateur")}/></div>
          </div>
          {/* Organisme + Structure */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:22 }}>
            <div><L t="Organisme"/><input value={form.organisme} onChange={e=>ch("organisme",e.target.value)} placeholder="ex : ONFPP" {...fp("organisme")}/></div>
            <div><L t="Structure bénéficiaire"/><input value={form.structure_beneficiaire} onChange={e=>ch("structure_beneficiaire",e.target.value)} placeholder="ex : Ministère XYZ" {...fp("structure_beneficiaire")}/></div>
          </div>
          {err && <Err msg={err} inline/>}
          <div style={{ display:"flex",gap:12,paddingTop:18,borderTop:"1px solid #EEF2FF" }}>
            <button type="button" onClick={onBack} style={{ flex:1,padding:"12px",borderRadius:12,border:`1.5px solid ${C.iceBlue}`,background:C.surfaceAlt,color:C.textSub,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Syne',sans-serif" }}>Annuler</button>
            <button type="submit" disabled={busy} style={{ flex:2,padding:"12px",borderRadius:12,border:"none",background:busy?C.textMuted:`linear-gradient(135deg,${C.navy},${C.blue})`,color:"#fff",fontSize:13,fontWeight:800,cursor:busy?"not-allowed":"pointer",fontFamily:"'Syne',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
              {busy?<><Loader2 size={14} style={{animation:"spin 1s linear infinite"}}/> Création…</>:<><CheckCircle2 size={14}/> Enregistrer la session</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   3 — DÉTAIL SESSION : saisie + résultats
══════════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════════
   3 — DÉTAIL SESSION
   Flux :
     - Définir les rubriques une fois (partagées)
     - Écrire nom apprenant → Valider → formulaire de notes
     - Sélectionner les points par rubrique → total + taux live
     - Enregistrer → carte résultat
   Onglet Résultats : tableau global + exports
══════════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════════
   3 — DÉTAIL SESSION
══════════════════════════════════════════════════════ */
function SessionDetail({ token, session, onBack }) {
  const [tab,          setTab]          = useState("saisie");

  /* ── Rubriques ── */
  const [criteres,     setCriteres]     = useState([]);
  const [newCrit,      setNewCrit]      = useState("");
  const [addingCrit,   setAddingCrit]   = useState(false);
  // Modifier rubrique : {id, nom}
  const [editCrit,     setEditCrit]     = useState(null);
  const [editCritVal,  setEditCritVal]  = useState("");
  const [savingCrit,   setSavingCrit]   = useState(null);  // id en cours de save
  const [deletingCrit, setDeletingCrit] = useState(null);  // id en cours de delete

  /* ── Apprenants évalués ── */
  const [apprenants,   setApprenants]   = useState([]);
  // Modifier apprenant : {id, nom, email}
  const [editApp,      setEditApp]      = useState(null);
  const [editAppVal,   setEditAppVal]   = useState({ nom:"", email:"" });
  const [savingApp,    setSavingApp]    = useState(null);
  const [deletingApp,  setDeletingApp]  = useState(null);
  // Confirmation suppression
  const [confirmDel,   setConfirmDel]   = useState(null); // {type:"crit"|"app", id, nom}

  /* ── Draft nouvel apprenant ── */
  const [draft,        setDraft]        = useState(null);
  const [draftNom,     setDraftNom]     = useState("");
  const [draftEmail,   setDraftEmail]   = useState("");
  const [savingDraft,  setSavingDraft]  = useState(false);

  /* ── Résultats / Exports ── */
  const [results,      setResults]      = useState([]);
  const [loadingRes,   setLoadingRes]   = useState(false);
  const [exporting,    setExporting]    = useState("");
  const [graphData,    setGraphData]    = useState(null);  // [{apprenant, pourcentage}]
  const [graphLoading, setGraphLoading] = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");

  const fd = d => d ? new Date(d).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"}) : "—";

  /* ─── Chargement initial ─── */
  useEffect(() => {
    (async () => {
      setLoading(true); setError("");
      try {
        const cR = await authFetch(CONFIG.API_CRITERES, token);
        const cD = cR.ok ? await cR.json() : [];
        setCriteres(Array.isArray(cD) ? cD : cD.results||[]);

        const aR = await authFetch(CONFIG.API_APPRENANTS, token);
        const aD = aR.ok ? await aR.json() : [];
        const a  = Array.isArray(aD) ? aD : aD.results||[];

        const eR = await authFetch(`${CONFIG.API_EVALUATIONS}?session=${session.id}`, token);
        const eD = eR.ok ? await eR.json() : [];
        const e  = Array.isArray(eD) ? eD : eD.results||[];

        const notesMap = {};
        e.forEach(ev => {
          if (!notesMap[ev.apprenant]) notesMap[ev.apprenant] = {};
          notesMap[ev.apprenant][ev.critere] = ev.note;
        });
        setApprenants(a.filter(ap => notesMap[ap.id]).map(ap => ({ ...ap, notes:notesMap[ap.id], saved:true })));
      } catch { setError("Erreur de chargement."); }
      finally   { setLoading(false); }
    })();
  }, [session.id]);

  /* ═══ RUBRIQUES ═══ */

  const addCritere = async () => {
    if (!newCrit.trim()) return;
    setAddingCrit(true);
    try {
      const r = await authFetch(CONFIG.API_CRITERES, token, { method:"POST", body:JSON.stringify({ nom:newCrit.trim() }) });
      if (r.ok||r.status===201) {
        const d = await r.json();
        setCriteres(p => [...p, d]);
        setNewCrit("");
        if (draft) setDraft(p => ({ ...p, notes:{ ...p.notes, [d.id]:null } }));
      }
    } catch {}
    finally { setAddingCrit(false); }
  };

  const startEditCrit = (c) => { setEditCrit(c.id); setEditCritVal(c.nom); };
  const cancelEditCrit = () => { setEditCrit(null); setEditCritVal(""); };

  const saveEditCrit = async (id) => {
    if (!editCritVal.trim()) return;
    setSavingCrit(id);
    try {
      const r = await authFetch(`${CONFIG.API_CRITERES}${id}/`, token, {
        method:"PATCH", body:JSON.stringify({ nom:editCritVal.trim() }),
      });
      if (r.ok) {
        const d = await r.json();
        setCriteres(p => p.map(c => c.id===id ? d : c));
        cancelEditCrit();
      }
    } catch {}
    finally { setSavingCrit(null); }
  };

  const deleteCrit = async (id) => {
    setDeletingCrit(id); setConfirmDel(null);
    try {
      const r = await authFetch(`${CONFIG.API_CRITERES}${id}/`, token, { method:"DELETE" });
      if (r.ok||r.status===204) {
        setCriteres(p => p.filter(c => c.id!==id));
        // Retirer cette rubrique du draft si ouvert
        if (draft) setDraft(p => { const n={...p.notes}; delete n[id]; return {...p,notes:n}; });
      }
    } catch {}
    finally { setDeletingCrit(null); }
  };

  /* ═══ APPRENANTS ═══ */

  const openDraft = () => { setDraft({ notes:{} }); setDraftNom(""); setDraftEmail(""); };
  const setDraftNote = (critId, note) => setDraft(p => ({ ...p, notes:{ ...p.notes, [critId]:note } }));

  const saveDraft = async () => {
    if (!draftNom.trim()) return;
    setSavingDraft(true);
    try {
      const aR = await authFetch(CONFIG.API_APPRENANTS, token, {
        method:"POST", body:JSON.stringify({ nom:draftNom.trim(), email:draftEmail.trim()||undefined }),
      });
      if (!aR.ok && aR.status!==201) return;
      const apprenant = await aR.json();
      await Promise.all(
        criteres.filter(c => draft.notes[c.id]).map(c =>
          authFetch(CONFIG.API_EVALUATIONS, token, {
            method:"POST",
            body:JSON.stringify({ session:session.id, apprenant:apprenant.id, critere:c.id, note:draft.notes[c.id] }),
          })
        )
      );
      setApprenants(p => [...p, { ...apprenant, notes:draft.notes, saved:true }]);
      setDraft(null); setDraftNom(""); setDraftEmail("");
    } catch {}
    finally { setSavingDraft(false); }
  };

  const startEditApp = (a) => { setEditApp(a.id); setEditAppVal({ nom:a.nom, email:a.email||"" }); };
  const cancelEditApp = () => { setEditApp(null); setEditAppVal({ nom:"", email:"" }); };

  const saveEditApp = async (id) => {
    if (!editAppVal.nom.trim()) return;
    setSavingApp(id);
    try {
      const r = await authFetch(`${CONFIG.API_APPRENANTS}${id}/`, token, {
        method:"PATCH", body:JSON.stringify({ nom:editAppVal.nom.trim(), email:editAppVal.email.trim()||undefined }),
      });
      if (r.ok) {
        const d = await r.json();
        setApprenants(p => p.map(a => a.id===id ? { ...a, nom:d.nom, email:d.email } : a));
        cancelEditApp();
      }
    } catch {}
    finally { setSavingApp(null); }
  };

  const deleteApp = async (id) => {
    setDeletingApp(id); setConfirmDel(null);
    try {
      const r = await authFetch(`${CONFIG.API_APPRENANTS}${id}/`, token, { method:"DELETE" });
      if (r.ok||r.status===204) setApprenants(p => p.filter(a => a.id!==id));
    } catch {}
    finally { setDeletingApp(null); }
  };

  /* ═══ RÉSULTATS / EXPORTS ═══ */

  const loadResults = async () => {
    setLoadingRes(true);
    try {
      const r = await authFetch(CONFIG.API_RESULTS(session.id), token);
      if (r.ok) { setResults(await r.json()); setTab("resultats"); }
    } catch {}
    finally { setLoadingRes(false); }
  };
  const dlPdfGlobal = async () => {
    setExporting("pdf");
    try {
      // ── Charger les données graphe si pas encore fait ──
      let gd = graphData;
      if (!gd) {
        const gr = await authFetch(CONFIG.API_GRAPH(session.id), token);
        if (gr.ok) gd = await gr.json();
      }
      if (!gd) return;

      const nbApp = (gd.scores||[]).length;

      // ── Générer les 3 images hors DOM ──
      const chartBars = await generateChartBase64(
        "bar", buildBarsData(gd), buildBarsOpts(nbApp),
        780, Math.max(300, nbApp * 44 + 100)
      );
      const chartCrit = await generateChartBase64(
        "bar", buildCritBarsData(gd), buildCritBarsOpts(),
        820, 380
      );
      const chartPie = await generateChartBase64(
        "doughnut", buildPieData(gd), buildPieOpts(),
        740, 340
      );

      // ── POST → Django ──
      const r = await fetch(`${CONFIG.BASE_URL}${CONFIG.API_PDF_GLOBAL(session.id)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ chart_bars: chartBars, chart_crit: chartCrit, chart_pie: chartPie }),
      });
      if (r.ok) dlBlob(await r.blob(), `rapport_global_${session.id}.pdf`);
    } catch(e) { console.error(e); }
    finally { setExporting(""); }
  };
  const dlExcel = async () => {
    setExporting("excel");
    const r = await fetch(`${CONFIG.BASE_URL}${CONFIG.API_EXPORT_EXCEL(session.id)}`,{headers:{Authorization:`Bearer ${token}`}});
    if (r.ok) dlBlob(await r.blob(),`resultats_${session.id}.xlsx`);
    setExporting("");
  };
  const dlPdfApp = async (appId, nom) => {
    const r = await fetch(`${CONFIG.BASE_URL}${CONFIG.API_PDF_APPRENANT(session.id,appId)}`,{headers:{Authorization:`Bearer ${token}`}});
    if (r.ok) dlBlob(await r.blob(),`rapport_${nom.replace(/ /g,"_")}.pdf`);
  };
  const loadGraph = async () => {
    if (graphData) { setGraphData(null); return; }
    setGraphLoading(true);
    try {
      const r = await authFetch(CONFIG.API_GRAPH(session.id), token);
      if (r.ok) setGraphData(await r.json());
    } catch {}
    finally { setGraphLoading(false); }
  };

  /* ─── Stats locales ─── */
  const localResults = apprenants.map(a => {
    const total  = criteres.reduce((s,c) => s+(NOTE_MAP[a.notes[c.id]]||0), 0);
    const maxPts = criteres.length * 75;
    const pct    = maxPts>0 ? Math.round((total/maxPts)*100) : 0;
    return { id:a.id, nom:a.nom, total, maxPts, pct };
  });
  const draftTotal  = draft ? criteres.reduce((s,c)=>s+(NOTE_MAP[draft.notes[c.id]]||0),0) : 0;
  const draftMaxPts = criteres.length * 75;
  const draftPct    = draftMaxPts>0 ? Math.round((draftTotal/draftMaxPts)*100) : 0;
  const draftFilled = draft ? criteres.filter(c=>draft.notes[c.id]).length : 0;
  const draftSc     = scoreStyle(draftPct);
  const avg    = localResults.length ? Math.round(localResults.reduce((s,r)=>s+r.pct,0)/localResults.length) : 0;
  const passed = localResults.filter(r=>r.pct>=50).length;

  if (loading) return <Spin/>;

  return (
    <div style={{ animation:"fadeUp .3s ease" }}>

      {/* ── MODAL CONFIRMATION SUPPRESSION ── */}
      {confirmDel && (
        <div onClick={()=>setConfirmDel(null)} style={{ position:"fixed",inset:0,background:"rgba(13,27,94,0.4)",backdropFilter:"blur(4px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:C.surface,borderRadius:20,padding:28,width:"100%",maxWidth:380,boxShadow:"0 24px 80px rgba(13,27,94,0.25)",border:`2px solid #FECDD3` }}>
            <div style={{ width:48,height:48,borderRadius:14,background:"#FFF1F2",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px" }}>
              <AlertTriangle size={22} color={C.danger}/>
            </div>
            <p style={{ fontSize:16,fontWeight:800,color:C.navy,textAlign:"center",marginBottom:8 }}>Confirmer la suppression</p>
            <p style={{ fontSize:13,color:C.textSub,textAlign:"center",marginBottom:22 }}>
              Supprimer <strong>"{confirmDel.nom}"</strong> ? Cette action est irréversible.
              {confirmDel.type==="app" && <><br/><span style={{fontSize:11,color:C.textMuted}}>Toutes ses évaluations seront aussi supprimées.</span></>}
            </p>
            <div style={{ display:"flex",gap:10 }}>
              <button onClick={()=>setConfirmDel(null)} style={{ flex:1,padding:"11px",borderRadius:12,border:`1.5px solid ${C.iceBlue}`,background:C.surfaceAlt,color:C.textSub,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Syne',sans-serif" }}>Annuler</button>
              <button
                onClick={()=>confirmDel.type==="crit" ? deleteCrit(confirmDel.id) : deleteApp(confirmDel.id)}
                style={{ flex:1,padding:"11px",borderRadius:12,border:"none",background:C.danger,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"'Syne',sans-serif" }}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── En-tête ── */}
      <div style={{ display:"flex",alignItems:"flex-start",gap:14,marginBottom:22 }}>
        <button onClick={onBack} style={{ width:38,height:38,borderRadius:10,background:C.surfaceAlt,border:`1.5px solid ${C.iceBlue}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,marginTop:2 }}>
          <ArrowLeft size={15} color={C.textSub}/>
        </button>
        <div style={{ flex:1 }}>
          <h1 style={{ fontSize:20,fontWeight:800,color:C.navy,lineHeight:1.2 }}>{session.theme}</h1>
          <div style={{ display:"flex",gap:12,marginTop:6,flexWrap:"wrap" }}>
            <M icon={User} t={session.formateur}/><M icon={MapPin} t={session.lieu}/>
            <M icon={Calendar} t={`${fd(session.periode_debut)} → ${fd(session.periode_fin)}`}/>
            {session.organisme&&<M icon={Building2} t={session.organisme}/>}
          </div>
        </div>
      </div>

      {error && <Err msg={error} inline/>}

      {/* ── Onglets ── */}
      <div style={{ display:"flex",gap:4,marginBottom:20,background:C.surfaceAlt,borderRadius:12,padding:4,width:"fit-content",border:`1px solid ${C.iceBlue}` }}>
        {[{id:"saisie",label:"Saisie",icon:Edit3},{id:"resultats",label:"Résultats",icon:BarChart3}].map(t=>(
          <button key={t.id} onClick={()=>t.id==="resultats"?loadResults():setTab("saisie")}
            style={{ display:"flex",alignItems:"center",gap:7,padding:"9px 20px",borderRadius:9,border:"none",background:tab===t.id?C.surface:"transparent",color:tab===t.id?C.navy:C.textSub,fontSize:13,fontWeight:tab===t.id?800:600,cursor:"pointer",fontFamily:"'Syne',sans-serif",boxShadow:tab===t.id?`0 2px 8px ${C.shadow}`:"none",transition:"all .15s" }}>
            {t.id==="resultats"&&loadingRes?<Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/>:<t.icon size={13}/>} {t.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════
          ONGLET SAISIE
      ════════════════════════════════ */}
      {tab==="saisie" && (
        <div style={{ display:"grid",gridTemplateColumns:"280px 1fr",gap:16,alignItems:"start" }}>

          {/* ─── Colonne gauche : Rubriques ─── */}
          <div style={{ background:C.surface,borderRadius:18,border:"1.5px solid #EEF2FF",overflow:"hidden",position:"sticky",top:16 }}>
            <div style={{ padding:"14px 16px",borderBottom:"1px solid #EEF2FF" }}>
              <SH icon={BookOpen} title="Rubriques" color={C.blue}/>
              <p style={{ fontSize:11,color:C.textMuted,marginTop:5 }}>{criteres.length} rubrique{criteres.length!==1?"s":""} · communes à tous</p>
            </div>

            {/* Liste rubriques avec edit/delete */}
            <div style={{ maxHeight:340,overflowY:"auto" }}>
              {criteres.length===0 ? (
                <p style={{ padding:"14px 16px",fontSize:12,color:C.textMuted }}>Aucune rubrique. Ajoutez-en ci-dessous.</p>
              ) : criteres.map((c,i) => (
                <div key={c.id} style={{ padding:"9px 14px",borderBottom:i<criteres.length-1?"1px solid #F5F7FF":"none" }}>
                  {editCrit===c.id ? (
                    /* ── Mode édition rubrique ── */
                    <div style={{ display:"flex",gap:6,alignItems:"center" }}>
                      <input
                        autoFocus
                        value={editCritVal}
                        onChange={e=>setEditCritVal(e.target.value)}
                        onKeyDown={e=>{ if(e.key==="Enter") saveEditCrit(c.id); if(e.key==="Escape") cancelEditCrit(); }}
                        style={{ flex:1,padding:"6px 9px",borderRadius:7,border:`1.5px solid ${C.blue}`,fontSize:12,color:C.navy,fontFamily:"'Syne',sans-serif",outline:"none",boxShadow:`0 0 0 3px ${C.blue}15` }}
                      />
                      <button onClick={()=>saveEditCrit(c.id)} disabled={savingCrit===c.id}
                        style={{ width:28,height:28,borderRadius:7,border:"none",background:C.blue,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0 }}>
                        {savingCrit===c.id?<Loader2 size={11} color="#fff" style={{animation:"spin 1s linear infinite"}}/>:<CheckCircle2 size={11} color="#fff"/>}
                      </button>
                      <button onClick={cancelEditCrit} style={{ width:28,height:28,borderRadius:7,border:`1px solid ${C.iceBlue}`,background:C.surfaceAlt,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0 }}>
                        <X size={11} color={C.textSub}/>
                      </button>
                    </div>
                  ) : (
                    /* ── Mode affichage rubrique ── */
                    <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                      <span style={{ width:20,height:20,borderRadius:5,background:`${C.blue}14`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:C.blue,flexShrink:0 }}>{i+1}</span>
                      <p style={{ flex:1,fontSize:12,fontWeight:700,color:C.navy,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{c.nom}</p>
                      {/* Bouton modifier */}
                      <button onClick={()=>startEditCrit(c)}
                        style={{ width:26,height:26,borderRadius:7,border:`1px solid ${C.iceBlue}`,background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,transition:"all .12s" }}
                        onMouseEnter={e=>{e.currentTarget.style.background=`${C.blue}14`;e.currentTarget.style.borderColor=C.blue;}}
                        onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor=C.iceBlue;}}>
                        <Edit3 size={10} color={C.textSub}/>
                      </button>
                      {/* Bouton supprimer */}
                      <button onClick={()=>setConfirmDel({type:"crit",id:c.id,nom:c.nom})}
                        disabled={deletingCrit===c.id}
                        style={{ width:26,height:26,borderRadius:7,border:"1px solid #FECDD3",background:"#FFF5F5",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,transition:"all .12s" }}
                        onMouseEnter={e=>{e.currentTarget.style.background="#FECDD3";}}
                        onMouseLeave={e=>{e.currentTarget.style.background="#FFF5F5";}}>
                        {deletingCrit===c.id?<Loader2 size={10} color={C.danger} style={{animation:"spin 1s linear infinite"}}/>:<Trash2 size={10} color={C.danger}/>}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Ajouter rubrique */}
            <div style={{ padding:"12px 14px",borderTop:"1px solid #EEF2FF" }}>
              <input
                value={newCrit}
                onChange={e=>setNewCrit(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&(e.preventDefault(),addCritere())}
                placeholder="Nouvelle rubrique…"
                style={{ width:"100%",padding:"8px 10px",borderRadius:8,border:`1.5px solid ${C.iceBlue}`,fontSize:12,color:C.navy,fontFamily:"'Syne',sans-serif",outline:"none",boxSizing:"border-box",marginBottom:8 }}
              />
              <button onClick={addCritere} disabled={addingCrit||!newCrit.trim()}
                style={{ width:"100%",padding:"8px",borderRadius:8,border:"none",background:newCrit.trim()?`linear-gradient(135deg,${C.navy},${C.blue})`:C.textMuted,color:"#fff",fontSize:12,fontWeight:700,cursor:newCrit.trim()?"pointer":"not-allowed",fontFamily:"'Syne',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
                {addingCrit?<Loader2 size={12} style={{animation:"spin 1s linear infinite"}}/>:<Plus size={12}/>} Ajouter
              </button>
            </div>
          </div>

          {/* ─── Colonne droite : Apprenants ─── */}
          <div>
            {/* Bouton évaluer */}
            {!draft && (
              <button onClick={openDraft} disabled={criteres.length===0}
                style={{ width:"100%",marginBottom:16,padding:"14px",borderRadius:14,border:`2px dashed ${criteres.length>0?C.blue:C.iceBlue}`,background:criteres.length>0?`${C.blue}06`:"transparent",color:criteres.length>0?C.blue:C.textMuted,fontSize:13,fontWeight:700,cursor:criteres.length>0?"pointer":"not-allowed",fontFamily:"'Syne',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all .15s" }}
                onMouseEnter={e=>{ if(criteres.length>0){e.currentTarget.style.background=`${C.blue}12`;e.currentTarget.style.borderStyle="solid";}}}
                onMouseLeave={e=>{ e.currentTarget.style.background=criteres.length>0?`${C.blue}06`:"transparent";e.currentTarget.style.borderStyle="dashed";}}>
                <Plus size={16}/> {criteres.length===0?"Ajoutez d'abord des rubriques":"Évaluer un apprenant"}
              </button>
            )}

            {/* ── Formulaire draft ── */}
            {draft && (
              <div style={{ background:C.surface,borderRadius:18,border:`2px solid ${C.blue}`,marginBottom:16,overflow:"hidden",boxShadow:`0 4px 24px ${C.shadow}` }}>
                {/* Header */}
                <div style={{ padding:"16px 20px",borderBottom:"1px solid #EEF2FF",background:`${C.blue}06`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:10,flex:1,flexWrap:"wrap" }}>
                    <input autoFocus value={draftNom} onChange={e=>setDraftNom(e.target.value)} placeholder="Nom de l'apprenant *"
                      style={{ padding:"9px 14px",borderRadius:10,border:`1.5px solid ${C.iceBlue}`,fontSize:13,fontWeight:700,color:C.navy,fontFamily:"'Syne',sans-serif",outline:"none",width:200 }}/>
                    <input value={draftEmail} onChange={e=>setDraftEmail(e.target.value)} placeholder="Email (optionnel)"
                      style={{ padding:"9px 14px",borderRadius:10,border:`1.5px solid ${C.iceBlue}`,fontSize:13,color:C.navy,fontFamily:"'Syne',sans-serif",outline:"none",width:190 }}/>
                  </div>
                  {draftFilled>0 && (
                    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0 }}>
                      <span style={{ fontSize:22,fontWeight:800,color:draftSc.text,lineHeight:1 }}>{draftPct}%</span>
                      <span style={{ fontSize:10,fontWeight:700,color:draftSc.text }}>{draftTotal}/{draftMaxPts} pts</span>
                    </div>
                  )}
                  <button onClick={()=>setDraft(null)} style={{ width:30,height:30,borderRadius:8,background:C.surfaceAlt,border:`1px solid ${C.iceBlue}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0 }}>
                    <X size={13} color={C.textSub}/>
                  </button>
                </div>
                {/* Grille notes */}
                {criteres.map((c,i)=>{
                  const cur = draft.notes[c.id];
                  return (
                    <div key={c.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"13px 20px",borderBottom:i<criteres.length-1?"1px solid #F0F4FF":"none",flexWrap:"wrap" }}>
                      <div style={{ display:"flex",alignItems:"center",gap:8,flex:"0 0 200px",minWidth:0 }}>
                        <span style={{ width:22,height:22,borderRadius:6,background:`${C.blue}14`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:C.blue,flexShrink:0 }}>{i+1}</span>
                        <p style={{ fontSize:13,fontWeight:700,color:C.navy,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{c.nom}</p>
                      </div>
                      <div style={{ display:"flex",gap:6,flex:1 }}>
                        {[1,2,3].map(n=>{
                          const sel=cur===n; const nc=NOTE_COLORS[n];
                          return (
                            <button key={n} type="button" onClick={()=>setDraftNote(c.id,n)}
                              style={{ flex:1,padding:"9px 6px",borderRadius:10,border:`2px solid ${sel?nc.text:C.iceBlue}`,background:sel?nc.bg:"#FAFBFF",color:sel?nc.text:C.textMuted,fontSize:11,fontWeight:sel?800:600,cursor:"pointer",fontFamily:"'Syne',sans-serif",transition:"all .12s",textAlign:"center",boxShadow:sel?`0 2px 8px ${nc.text}25`:"none" }}>
                              {NOTE_LABELS[n]}
                            </button>
                          );
                        })}
                      </div>
                      <div style={{ width:54,textAlign:"right",flexShrink:0 }}>
                        {cur?<span style={{ fontSize:13,fontWeight:800,color:NOTE_COLORS[cur].text }}>{NOTE_MAP[cur]} pts</span>:<span style={{ fontSize:11,color:C.textMuted }}>— pts</span>}
                      </div>
                    </div>
                  );
                })}
                {/* Footer total */}
                <div style={{ padding:"14px 20px",background:`${C.blue}05`,borderTop:"2px solid #EEF2FF",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12 }}>
                  <div>
                    <p style={{ fontSize:12,color:C.textMuted,fontWeight:600 }}>{draftFilled}/{criteres.length} rubriques évaluées</p>
                    <p style={{ fontSize:14,fontWeight:800,color:C.navy,marginTop:2 }}>Total : {draftTotal} / {draftMaxPts} pts</p>
                  </div>
                  <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ width:120,height:8,borderRadius:4,background:"#EEF2FF",overflow:"hidden",marginBottom:4 }}>
                        <div style={{ width:`${draftPct}%`,height:"100%",background:draftPct>=75?C.success:draftPct>=50?C.accent:draftPct>0?C.danger:"transparent",borderRadius:4,transition:"width .3s" }}/>
                      </div>
                      <span style={{ fontSize:11,color:draftSc.text,fontWeight:700 }}>{draftFilled>0?draftSc.label:"En attente"}</span>
                    </div>
                    <div style={{ width:54,height:54,borderRadius:14,background:draftFilled>0?draftSc.bg:C.surfaceAlt,border:`2px solid ${draftFilled>0?draftSc.text:C.iceBlue}`,display:"flex",alignItems:"center",justifyContent:"center" }}>
                      <span style={{ fontSize:16,fontWeight:800,color:draftFilled>0?draftSc.text:C.textMuted }}>{draftFilled>0?`${draftPct}%`:"—"}</span>
                    </div>
                  </div>
                  <button onClick={saveDraft} disabled={savingDraft||!draftNom.trim()}
                    style={{ display:"flex",alignItems:"center",gap:8,padding:"11px 22px",borderRadius:12,border:"none",background:draftNom.trim()&&!savingDraft?`linear-gradient(135deg,${C.navy},${C.blue})`:C.textMuted,color:"#fff",fontSize:13,fontWeight:800,cursor:draftNom.trim()&&!savingDraft?"pointer":"not-allowed",fontFamily:"'Syne',sans-serif" }}>
                    {savingDraft?<><Loader2 size={14} style={{animation:"spin 1s linear infinite"}}/> Enregistrement…</>:<><CheckCircle2 size={14}/> Enregistrer</>}
                  </button>
                </div>
              </div>
            )}

            {/* ── Cartes apprenants évalués ── */}
            {apprenants.length===0 && !draft ? (
              <div style={{ background:C.surface,borderRadius:16,border:"1.5px solid #EEF2FF",padding:"40px 20px",textAlign:"center",color:C.textMuted }}>
                <Users size={36} style={{ margin:"0 auto 10px",opacity:.2,display:"block" }}/>
                <p style={{ fontWeight:700,fontSize:13 }}>Aucun apprenant évalué pour l'instant.</p>
              </div>
            ) : (
              <div style={{ display:"grid",gap:10 }}>
                {apprenants.map((a,i)=>{
                  const total  = criteres.reduce((s,c)=>s+(NOTE_MAP[a.notes[c.id]]||0),0);
                  const maxPts = criteres.length*75;
                  const pct    = maxPts>0?Math.round((total/maxPts)*100):0;
                  const sc     = scoreStyle(pct);
                  const filled = criteres.filter(c=>a.notes[c.id]).length;

                  return (
                    <div key={a.id} style={{ background:C.surface,border:`1.5px solid ${editApp===a.id?C.blue:"#EEF2FF"}`,borderRadius:16,overflow:"hidden",transition:"border-color .15s" }}>

                      {editApp===a.id ? (
                        /* ── Mode édition apprenant ── */
                        <div style={{ padding:"14px 18px",background:`${C.blue}05`,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" }}>
                          <input autoFocus value={editAppVal.nom} onChange={e=>setEditAppVal(p=>({...p,nom:e.target.value}))}
                            onKeyDown={e=>{ if(e.key==="Enter") saveEditApp(a.id); if(e.key==="Escape") cancelEditApp(); }}
                            placeholder="Nom *"
                            style={{ padding:"8px 12px",borderRadius:9,border:`1.5px solid ${C.blue}`,fontSize:13,fontWeight:700,color:C.navy,fontFamily:"'Syne',sans-serif",outline:"none",width:180,boxShadow:`0 0 0 3px ${C.blue}15` }}/>
                          <input value={editAppVal.email} onChange={e=>setEditAppVal(p=>({...p,email:e.target.value}))}
                            placeholder="Email"
                            style={{ padding:"8px 12px",borderRadius:9,border:`1.5px solid ${C.iceBlue}`,fontSize:13,color:C.navy,fontFamily:"'Syne',sans-serif",outline:"none",width:180 }}/>
                          <div style={{ display:"flex",gap:8,marginLeft:"auto" }}>
                            <button onClick={()=>saveEditApp(a.id)} disabled={savingApp===a.id||!editAppVal.nom.trim()}
                              style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:9,border:"none",background:editAppVal.nom.trim()?C.blue:C.textMuted,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Syne',sans-serif" }}>
                              {savingApp===a.id?<Loader2 size={12} style={{animation:"spin 1s linear infinite"}}/>:<CheckCircle2 size={12}/>} Sauvegarder
                            </button>
                            <button onClick={cancelEditApp}
                              style={{ padding:"8px 14px",borderRadius:9,border:`1.5px solid ${C.iceBlue}`,background:C.surfaceAlt,color:C.textSub,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Syne',sans-serif" }}>
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* ── Mode affichage apprenant ── */
                        <div style={{ padding:"14px 18px",display:"flex",alignItems:"center",gap:14 }}>
                          {/* Avatar */}
                          <div style={{ width:40,height:40,borderRadius:12,background:`${C.blue}14`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                            <span style={{ fontSize:14,fontWeight:800,color:C.blue }}>
                              {a.nom.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase()}
                            </span>
                          </div>
                          {/* Infos */}
                          <div style={{ flex:1,minWidth:0 }}>
                            <p style={{ fontSize:14,fontWeight:800,color:C.navy }}>{a.nom}</p>
                            <p style={{ fontSize:11,color:C.textMuted,marginTop:1 }}>
                              {total}/{maxPts} pts · {filled}/{criteres.length} rubriques
                              {a.email&&<> · {a.email}</>}
                            </p>
                          </div>
                          {/* Score */}
                          <div style={{ display:"flex",alignItems:"center",gap:8,flexShrink:0 }}>
                            <div style={{ width:60,height:6,borderRadius:3,background:"#EEF2FF",overflow:"hidden" }}>
                              <div style={{ width:`${pct}%`,height:"100%",background:sc.text,borderRadius:3 }}/>
                            </div>
                            <span style={{ fontSize:13,fontWeight:800,padding:"4px 12px",borderRadius:20,background:sc.bg,color:sc.text,border:`1px solid ${sc.border}` }}>{pct}%</span>
                          </div>
                          <span style={{ fontSize:11,fontWeight:700,color:sc.text,minWidth:100,flexShrink:0 }}>{sc.label}</span>
                          {/* Actions */}
                          <div style={{ display:"flex",gap:6,flexShrink:0 }}>
                            {/* Modifier */}
                            <button onClick={()=>startEditApp(a)} title="Modifier"
                              style={{ width:30,height:30,borderRadius:8,border:`1px solid ${C.iceBlue}`,background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .12s" }}
                              onMouseEnter={e=>{e.currentTarget.style.background=`${C.blue}14`;e.currentTarget.style.borderColor=C.blue;}}
                              onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor=C.iceBlue;}}>
                              <Edit3 size={12} color={C.textSub}/>
                            </button>
                            {/* Supprimer */}
                            <button onClick={()=>setConfirmDel({type:"app",id:a.id,nom:a.nom})}
                              disabled={deletingApp===a.id}
                              title="Supprimer"
                              style={{ width:30,height:30,borderRadius:8,border:"1px solid #FECDD3",background:"#FFF5F5",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .12s" }}
                              onMouseEnter={e=>{e.currentTarget.style.background=C.danger;e.currentTarget.style.borderColor=C.danger;}}
                              onMouseLeave={e=>{e.currentTarget.style.background="#FFF5F5";e.currentTarget.style.borderColor="#FECDD3";}}>
                              {deletingApp===a.id?<Loader2 size={12} color={C.danger} style={{animation:"spin 1s linear infinite"}}/>:<Trash2 size={12} color={C.danger}/>}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════
          ONGLET RÉSULTATS
      ════════════════════════════════ */}
      {tab==="resultats" && (
        <div>
          {localResults.length>0 && (
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:20 }}>
              {[
                { label:"Taux global",         value:`${avg}%`,                          icon:TrendingUp,   color:C.blue    },
                { label:"Satisfaisants ≥50%",  value:`${passed}/${localResults.length}`, icon:CheckCircle2, color:C.success },
                { label:"Apprenants évalués",  value:localResults.length,                icon:Users,        color:C.purple  },
                { label:"Rubriques évaluées",  value:criteres.length,                    icon:Star,         color:C.accent  },
              ].map((k,i)=>(
                <div key={i} style={{ background:C.surface,borderRadius:14,padding:"14px 16px",border:"1.5px solid #EEF2FF" }}>
                  <div style={{ width:32,height:32,borderRadius:9,background:`${k.color}14`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:9 }}><k.icon size={15} color={k.color}/></div>
                  <p style={{ fontSize:22,fontWeight:800,color:C.navy,lineHeight:1 }}>{k.value}</p>
                  <p style={{ fontSize:11,color:C.textMuted,marginTop:3 }}>{k.label}</p>
                </div>
              ))}
            </div>
          )}
          <div style={{ display:"flex",gap:10,marginBottom:16,flexWrap:"wrap" }}>
            <EBtn icon={FileText}        label="Rapport PDF Complet" color="#E53935" loading={exporting==="pdf"}   onClick={dlPdfGlobal}/>
            <EBtn icon={FileSpreadsheet} label="Export Excel"        color="#15803D" loading={exporting==="excel"} onClick={dlExcel}/>
            <EBtn icon={BarChart3}       label={graphData?"Masquer analyses":"Voir analyses"} color={C.purple} loading={graphLoading} onClick={loadGraph} active={!!graphData}/>
          </div>

          {/* ── Dashboard graphiques Chart.js ── */}
          {graphData && (
            <GraphDashboard graphData={graphData}/>
          )}
          <div style={{ background:C.surface,border:"1.5px solid #EEF2FF",borderRadius:18,overflow:"hidden" }}>
            <div style={{ padding:"14px 20px",borderBottom:"1px solid #EEF2FF" }}><SH icon={BarChart3} title="Résultats par apprenant" color={C.blue}/></div>
            {localResults.length===0 ? <Empty label="Aucune note saisie. Revenez à la Saisie."/> : (
              <div>
                <div style={{ padding:"12px 20px",background:`${C.blue}07`,borderBottom:"2px solid #EEF2FF",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                  <span style={{ fontSize:13,fontWeight:800,color:C.navy }}>Taux global de satisfaction</span>
                  <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                    <div style={{ width:110,height:7,borderRadius:4,background:"#EEF2FF",overflow:"hidden" }}>
                      <div style={{ width:`${avg}%`,height:"100%",background:avg>=75?C.success:avg>=50?C.accent:C.danger,borderRadius:4 }}/>
                    </div>
                    <span style={{ fontSize:18,fontWeight:800,color:avg>=75?C.success:avg>=50?C.accent:C.danger }}>{avg}%</span>
                  </div>
                </div>
                {[...localResults].sort((a,b)=>b.pct-a.pct).map((r,i)=>{
                  const sc=scoreStyle(r.pct);
                  return (
                    <div key={r.id} style={{ padding:"13px 20px",display:"flex",alignItems:"center",gap:14,borderBottom:i<localResults.length-1?"1px solid #F0F4FF":"none",flexWrap:"wrap" }}>
                      <div style={{ width:28,height:28,borderRadius:8,background:i<3?`${C.accent}18`:C.surfaceAlt,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                        <span style={{ fontSize:11,fontWeight:800,color:i<3?C.accent:C.textMuted }}>#{i+1}</span>
                      </div>
                      <p style={{ flex:1,fontSize:14,fontWeight:800,color:C.navy,minWidth:120 }}>{r.nom}</p>
                      <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                        <div style={{ width:80,height:6,borderRadius:3,background:"#EEF2FF",overflow:"hidden" }}>
                          <div style={{ width:`${r.pct}%`,height:"100%",background:sc.text,borderRadius:3 }}/>
                        </div>
                        <span style={{ fontSize:13,fontWeight:800,padding:"3px 12px",borderRadius:20,background:sc.bg,color:sc.text,border:`1px solid ${sc.border}` }}>{r.pct}%</span>
                      </div>
                      <span style={{ fontSize:11,fontWeight:700,color:sc.text,minWidth:110 }}>{sc.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}






/* ══════════════════════════════════════════════════════
   HELPERS — génération d'images Chart.js hors DOM
   Utilisés par dlPdfGlobal pour envoyer les graphes au PDF
══════════════════════════════════════════════════════ */

/* ── Palette commune ── */
const PDF_COLORS = {
  navy:"#0D1B5E", blue:"#1A3BD4", green:"#0BA376", orange:"#F5A800", red:"#E53935",
  ice:"#C8D9FF", light:"#EEF2FF",
};
const pdfSc = p => p>=75 ? PDF_COLORS.green : p>=50 ? PDF_COLORS.orange : PDF_COLORS.red;

/* ── Graphe 1 : barres horizontales — scores apprenants ── */
function buildBarsData(gd) {
  if (!gd) return { labels:[], datasets:[] };
  const sorted = [...(gd.scores||[])].sort((a,b)=>b.pourcentage-a.pourcentage);
  return {
    labels: sorted.map(d=>d.apprenant),
    datasets:[{
      label:"Score (%)",
      data:  sorted.map(d=>Math.round(d.pourcentage)),
      backgroundColor: sorted.map(d=>pdfSc(d.pourcentage)+"CC"),
      borderColor:     sorted.map(d=>pdfSc(d.pourcentage)),
      borderWidth:1.5,
      borderRadius:5,
      borderSkipped:false,
    }],
  };
}
function buildBarsOpts(nbItems=8) {
  return {
    indexAxis:"y", responsive:false, animation:{ duration:0 },
    plugins:{
      legend:{ display:false },
      title:{ display:true, text:"Scores par apprenant (%)", font:{ size:14, weight:"bold" }, color:"#0D1B5E", padding:{ bottom:12 } },
    },
    scales:{
      x:{
        min:0, max:100,
        ticks:{ callback:v=>`${v}%`, font:{ size:10 }, color:"#4A5A8A" },
        grid:{ color:"#EEF2FF", lineWidth:1 },
        border:{ display:false },
      },
      y:{
        ticks:{ font:{ size:11, weight:"bold" }, color:"#0D1B5E" },
        grid:{ display:false },
        border:{ display:false },
      },
    },
    layout:{ padding:{ left:8, right:20, top:4, bottom:8 } },
  };
}

/* ── Graphe 2 : barres verticales — scores rubriques ── */
function buildCritBarsData(gd) {
  if (!gd) return { labels:[], datasets:[] };
  const cd = gd.critere_data || [];
  return {
    labels: cd.map(c=>c.nom),
    datasets:[{
      label:"Score (%)",
      data:  cd.map(c=>Math.round(c.pourcentage)),
      backgroundColor: cd.map(c=>pdfSc(c.pourcentage)+"CC"),
      borderColor:     cd.map(c=>pdfSc(c.pourcentage)),
      borderWidth:1.5,
      borderRadius:{ topLeft:5, topRight:5 },
    }],
  };
}
function buildCritBarsOpts() {
  return {
    responsive:false, animation:{ duration:0 },
    plugins:{
      legend:{ display:false },
      title:{ display:true, text:"Résultats par rubrique d'évaluation (%)", font:{ size:14, weight:"bold" }, color:"#0D1B5E", padding:{ bottom:12 } },
    },
    scales:{
      y:{
        min:0, max:100,
        ticks:{ callback:v=>`${v}%`, font:{ size:10 }, color:"#4A5A8A" },
        grid:{ color:"#EEF2FF", lineWidth:1 },
        border:{ display:false },
      },
      x:{
        ticks:{ font:{ size:9 }, color:"#0D1B5E", maxRotation:40 },
        grid:{ display:false },
        border:{ display:false },
      },
    },
    layout:{ padding:{ left:8, right:8, top:4, bottom:8 } },
  };
}

/* ── Graphe 3 : doughnut satisfaction ── */
function buildPieData(gd) {
  if (!gd) return { labels:[], datasets:[] };
  const nc = gd.notes_counter || {};
  return {
    labels:["Pas satisfait (25 pts)","Satisfait (50 pts)","Très satisfait (75 pts)"],
    datasets:[{
      data:[nc[1]||0, nc[2]||0, nc[3]||0],
      backgroundColor:["#E53935CC","#F5A800CC","#0BA376CC"],
      borderColor:    ["#ffffff",  "#ffffff",  "#ffffff"  ],
      borderWidth:3,
      hoverOffset:6,
    }],
  };
}
function buildPieOpts() {
  return {
    responsive:false, animation:{ duration:0 },
    cutout:"55%",
    plugins:{
      legend:{
        position:"right",
        labels:{ font:{ size:11 }, padding:16, usePointStyle:true, color:"#0D1B5E" },
      },
      title:{ display:true, text:"Répartition des niveaux de satisfaction", font:{ size:14, weight:"bold" }, color:"#0D1B5E", padding:{ bottom:12 } },
    },
    layout:{ padding:{ top:4, bottom:8, left:8, right:8 } },
  };
}

/* ── Génère un graphe hors-écran → base64 PNG ── */
async function generateChartBase64(type, data, options, w=800, h=380) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    // Fond blanc
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    canvas.style.position = "absolute";
    canvas.style.left = "-9999px";
    document.body.appendChild(canvas);
    const chart = new Chart(canvas, { type, data, options });
    setTimeout(() => {
      const url = canvas.toDataURL("image/png");
      chart.destroy();
      document.body.removeChild(canvas);
      resolve(url);
    }, 80);
  });
}

/* ══════════════════════════════════════════════════════
   GRAPHIQUES CHART.JS
   Données backend : { scores, notes_counter, critere_data }
══════════════════════════════════════════════════════ */

function ChartCanvas({ type, data, options, height=260 }) {
  const ref  = useRef(null);
  const inst = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    if (inst.current) inst.current.destroy();
    inst.current = new Chart(ref.current, { type, data, options });
    return () => { if (inst.current) inst.current.destroy(); };
  }, [JSON.stringify(data)]);
  return <canvas ref={ref} style={{ maxHeight:height, width:"100%" }}/>;
}

/*
  graphData = { scores:[{apprenant,pourcentage,total}],
                notes_counter:{1:n,2:n,3:n},
                critere_data:[{nom,total,pourcentage}] }
*/
function GraphDashboard({ graphData }) {
  const [tab, setTab] = useState("bars");

  if (!graphData) return null;
  const { scores=[], notes_counter={}, critere_data=[] } = graphData;

  const sc = p => p>=75 ? C.success : p>=50 ? C.accent : C.danger;
  const sorted     = [...scores].sort((a,b) => b.pourcentage - a.pourcentage);
  const globalAvg  = sorted.length
    ? Math.round(sorted.reduce((s,d)=>s+d.pourcentage,0)/sorted.length)
    : 0;

  /* ── Onglets disponibles ── */
  const tabs = [
    { id:"bars",  label:"Scores apprenants",  icon:BarChart3 },
    { id:"pie",   label:"Satisfaction",        icon:PieChart  },
    { id:"crit",  label:"Par rubrique",        icon:Star      },
  ];

  /* ── Chart 1 : barres horizontales % ── */
  const barsData = {
    labels: sorted.map(d => d.apprenant),
    datasets: [{
      label: "Score (%)",
      data:  sorted.map(d => Math.round(d.pourcentage)),
      backgroundColor: sorted.map(d => sc(d.pourcentage)+"BB"),
      borderColor:     sorted.map(d => sc(d.pourcentage)),
      borderWidth: 1.5, borderRadius: 6, borderSkipped: false,
    }],
  };
  const barsOpts = {
    indexAxis:"y", responsive:true, maintainAspectRatio:false,
    plugins:{
      legend:{ display:false },
      tooltip:{ callbacks:{ label: ctx=>`${ctx.parsed.x}%` } },
      annotation:{},
    },
    scales:{
      x:{ min:0, max:100,
          ticks:{ callback:v=>`${v}%`, font:{ family:"Syne", size:10 } },
          grid:{ color:"#EEF2FF" } },
      y:{ ticks:{ font:{ family:"Syne", size:11, weight:"bold" } },
          grid:{ display:false } },
    },
  };

  /* ── Chart 2 : doughnut satisfaction ── */
  const cntPas  = notes_counter[1] || 0;
  const cntSat  = notes_counter[2] || 0;
  const cntTres = notes_counter[3] || 0;
  const totalNotes = cntPas + cntSat + cntTres;
  const pieData = {
    labels: ["Pas satisfait","Satisfait","Très satisfait"],
    datasets:[{
      data: [cntPas, cntSat, cntTres],
      backgroundColor:[C.danger+"BB", C.accent+"BB", C.success+"BB"],
      borderColor:    [C.danger,       C.accent,       C.success     ],
      borderWidth:2, hoverOffset:8,
    }],
  };
  const pieOpts = {
    responsive:true, maintainAspectRatio:false,
    plugins:{
      legend:{ position:"bottom",
               labels:{ font:{ family:"Syne",size:11 }, padding:14, usePointStyle:true } },
      tooltip:{ callbacks:{ label: ctx=>`${ctx.label} : ${ctx.parsed} éval.` } },
    },
  };

  /* ── Chart 3 : barres verticales par critère ── */
  const critData = {
    labels: critere_data.map(c => c.nom),
    datasets:[{
      label:"Score (%)",
      data: critere_data.map(c => c.pourcentage),
      backgroundColor: critere_data.map(c => sc(c.pourcentage)+"BB"),
      borderColor:     critere_data.map(c => sc(c.pourcentage)),
      borderWidth:1.5, borderRadius:6,
    }],
  };
  const critOpts = {
    responsive:true, maintainAspectRatio:false,
    plugins:{
      legend:{ display:false },
      tooltip:{ callbacks:{ label: ctx=>`${ctx.parsed.y}% — ${critere_data[ctx.dataIndex]?.total} pts` } },
    },
    scales:{
      y:{ min:0, max:100,
          ticks:{ callback:v=>`${v}%`, font:{ family:"Syne",size:10 } },
          grid:{ color:"#EEF2FF" } },
      x:{ ticks:{ font:{ family:"Syne",size:10 }, maxRotation:35 },
          grid:{ display:false } },
    },
  };

  const barsH = Math.max(200, sorted.length * 44 + 50);

  return (
    <div style={{ background:C.surface,border:"1.5px solid #EEF2FF",borderRadius:18,overflow:"hidden",marginBottom:16 }}>

      {/* En-tête */}
      <div style={{ padding:"14px 20px",borderBottom:"1px solid #EEF2FF",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10 }}>
        <SH icon={BarChart3} title="Analyse graphique" color={C.purple}/>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <span style={{ fontSize:11,color:C.textMuted,fontWeight:600 }}>Taux moyen :</span>
          <span style={{ fontSize:15,fontWeight:800,padding:"3px 14px",borderRadius:20,
            background:sc(globalAvg)+"18",color:sc(globalAvg),border:`1px solid ${sc(globalAvg)}44` }}>
            {globalAvg}%
          </span>
        </div>
      </div>

      {/* Onglets */}
      <div style={{ display:"flex",borderBottom:"1px solid #EEF2FF" }}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,
              padding:"11px 8px",border:"none",
              borderBottom:tab===t.id?`2.5px solid ${C.blue}`:"2.5px solid transparent",
              background:tab===t.id?`${C.blue}08`:"transparent",
              color:tab===t.id?C.blue:C.textMuted,
              fontSize:12,fontWeight:tab===t.id?800:600,
              cursor:"pointer",fontFamily:"'Syne',sans-serif",transition:"all .15s" }}>
            <t.icon size={12}/>{t.label}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div style={{ padding:"20px 24px" }}>

        {/* ── Scores apprenants ── */}
        {tab==="bars" && (
          <div>
            {sorted.length===0
              ? <p style={{color:C.textMuted,fontSize:13,textAlign:"center",padding:"20px 0"}}>Aucune donnée.</p>
              : <div style={{ height:barsH }}><ChartCanvas type="bar" data={barsData} options={barsOpts} height={barsH}/></div>
            }
            <div style={{ display:"flex",gap:16,marginTop:14,flexWrap:"wrap" }}>
              {[{c:C.success,l:"≥75% — Très satisfaisant"},{c:C.accent,l:"≥50% — Satisfaisant"},{c:C.danger,l:"<50% — Insuffisant"}].map(x=>(
                <div key={x.l} style={{ display:"flex",alignItems:"center",gap:6 }}>
                  <div style={{ width:10,height:10,borderRadius:3,background:x.c }}/>
                  <span style={{ fontSize:10,color:C.textSub,fontWeight:600 }}>{x.l}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Satisfaction (doughnut) ── */}
        {tab==="pie" && (
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,alignItems:"center" }}>
            <div style={{ height:240 }}>
              <ChartCanvas type="doughnut" data={pieData} options={pieOpts} height={240}/>
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              {[
                {n:cntTres, label:"Très satisfait",  note:"75 pts", color:C.success},
                {n:cntSat,  label:"Satisfait",        note:"50 pts", color:C.accent },
                {n:cntPas,  label:"Pas satisfait",    note:"25 pts", color:C.danger },
              ].map(x=>(
                <div key={x.label} style={{ padding:"10px 14px",borderRadius:12,
                  background:`${x.color}10`,border:`1.5px solid ${x.color}30`,
                  display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                  <div>
                    <p style={{ fontSize:13,fontWeight:800,color:x.color }}>{x.label}</p>
                    <p style={{ fontSize:10,color:C.textMuted,marginTop:2 }}>{x.note}</p>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <p style={{ fontSize:22,fontWeight:800,color:x.color,lineHeight:1 }}>{x.n}</p>
                    <p style={{ fontSize:10,color:C.textMuted }}>
                      {totalNotes>0?Math.round(x.n/totalNotes*100):0}%
                    </p>
                  </div>
                </div>
              ))}
              <div style={{ padding:"10px 14px",borderRadius:12,background:`${C.blue}08`,
                border:`1px solid ${C.iceBlue}`,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <span style={{ fontSize:12,fontWeight:700,color:C.navy }}>Total réponses</span>
                <span style={{ fontSize:16,fontWeight:800,color:C.blue }}>{totalNotes}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Par rubrique ── */}
        {tab==="crit" && (
          <div>
            {critere_data.length===0
              ? <p style={{color:C.textMuted,fontSize:13,textAlign:"center",padding:"20px 0"}}>Aucune rubrique.</p>
              : (
                <>
                  <div style={{ height:240, marginBottom:16 }}>
                    <ChartCanvas type="bar" data={critData} options={critOpts} height={240}/>
                  </div>
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:8 }}>
                    {[...critere_data].sort((a,b)=>b.pourcentage-a.pourcentage).map((c,i)=>(
                      <div key={i} style={{ padding:"10px 12px",borderRadius:12,
                        background:`${sc(c.pourcentage)}10`,border:`1px solid ${sc(c.pourcentage)}30` }}>
                        <p style={{ fontSize:11,fontWeight:700,color:C.navy,marginBottom:4,
                          overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{c.nom}</p>
                        <p style={{ fontSize:18,fontWeight:800,color:sc(c.pourcentage),lineHeight:1 }}>{c.pourcentage}%</p>
                        <p style={{ fontSize:10,color:C.textMuted,marginTop:2 }}>{c.total} pts</p>
                      </div>
                    ))}
                  </div>
                </>
              )
            }
          </div>
        )}

      </div>
    </div>
  );
}

const Spin = ()=>(
  <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:160,gap:10,color:C.textMuted }}>
    <RefreshCw size={18} style={{animation:"spin 1s linear infinite"}}/> Chargement…
  </div>
);
const Err = ({msg,inline})=>(
  <div style={{ ...(inline?{marginBottom:14}:{margin:16}),background:"#FFF1F2",border:"1.5px solid #FECDD3",borderRadius:12,padding:"11px 16px",display:"flex",gap:10,alignItems:"center" }}>
    <AlertTriangle size={14} color={C.danger}/><p style={{ fontSize:12,color:C.danger,fontWeight:600 }}>{msg}</p>
  </div>
);
const Empty = ({label,onAction,act})=>(
  <div style={{ textAlign:"center",padding:"44px 20px",color:C.textMuted }}>
    <ClipboardList size={34} style={{ margin:"0 auto 10px",opacity:.2,display:"block" }}/>
    <p style={{ fontWeight:700,fontSize:13 }}>{label}</p>
    {onAction&&<button onClick={onAction} style={{ marginTop:12,padding:"8px 18px",borderRadius:10,border:"none",background:`linear-gradient(135deg,${C.navy},${C.blue})`,color:"#fff",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"'Syne',sans-serif" }}><Plus size={12} style={{marginRight:5}}/>{act}</button>}
  </div>
);
const Yay = ({label})=>(
  <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:260,gap:14,animation:"fadeUp .3s ease" }}>
    <div style={{ width:56,height:56,borderRadius:16,background:"#F0FDF4",display:"flex",alignItems:"center",justifyContent:"center" }}><CheckCircle2 size={26} color={C.success}/></div>
    <p style={{ fontSize:16,fontWeight:800,color:C.navy }}>{label}</p>
  </div>
);
const Btn = ({onClick,icon:I,label})=>(
  <button onClick={onClick} style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 20px",borderRadius:12,border:"none",background:`linear-gradient(135deg,${C.navy},${C.blue})`,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",boxShadow:`0 4px 16px ${C.shadow}`,fontFamily:"'Syne',sans-serif" }}>
    <I size={14}/>{label}
  </button>
);
const EBtn = ({icon:I,label,color,loading,onClick,active,ultimate})=>(
  <button onClick={onClick} disabled={loading}
    style={{
      display:"flex",alignItems:"center",gap:7,
      padding:ultimate?"10px 18px":"9px 16px",
      borderRadius:ultimate?12:10,
      border:ultimate?`2px solid ${color}`:`1.5px solid ${active?color:C.iceBlue}`,
      background:ultimate?`linear-gradient(135deg,${color}22,${color}08)`:active?`${color}10`:C.surfaceAlt,
      color:ultimate?color:active?color:C.textSub,
      fontSize:ultimate?13:12,
      fontWeight:ultimate?800:700,
      cursor:loading?"not-allowed":"pointer",
      fontFamily:"'Syne',sans-serif",
      transition:"all .15s",
      boxShadow:ultimate?`0 2px 12px ${color}30`:"none",
    }}
    onMouseEnter={e=>{if(!loading){
      e.currentTarget.style.background=ultimate?color:`${color}15`;
      e.currentTarget.style.borderColor=color;
      e.currentTarget.style.color=ultimate?"#fff":color;
      if(ultimate) e.currentTarget.style.boxShadow=`0 4px 20px ${color}50`;
    }}}
    onMouseLeave={e=>{if(!loading){
      e.currentTarget.style.background=ultimate?`linear-gradient(135deg,${color}22,${color}08)`:active?`${color}10`:C.surfaceAlt;
      e.currentTarget.style.borderColor=ultimate||active?color:C.iceBlue;
      e.currentTarget.style.color=ultimate||active?color:C.textSub;
      if(ultimate) e.currentTarget.style.boxShadow=`0 2px 12px ${color}30`;
    }}}>
    {loading?<Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/>:<I size={ultimate?15:13}/>} {label}
  </button>
);
const PH = ({onBack,title,sub,icon:I})=>(
  <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:24 }}>
    <button type="button" onClick={onBack} style={{ width:38,height:38,borderRadius:10,background:C.surfaceAlt,border:`1.5px solid ${C.iceBlue}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0 }}>
      <ArrowLeft size={15} color={C.textSub}/>
    </button>
    <div style={{ flex:1 }}>
      <h1 style={{ fontSize:20,fontWeight:800,color:C.navy,lineHeight:1 }}>{title}</h1>
      {sub&&<p style={{ fontSize:12,color:C.textMuted,marginTop:4 }}>{sub}</p>}
    </div>
    <div style={{ width:42,height:42,borderRadius:12,background:`linear-gradient(135deg,${C.navy},${C.blue})`,display:"flex",alignItems:"center",justifyContent:"center" }}>
      <I size={20} color="#fff"/>
    </div>
  </div>
);
const SH = ({icon:I,title,color})=>(
  <div style={{ display:"flex",alignItems:"center",gap:8 }}>
    <div style={{ width:3,height:18,borderRadius:2,background:color }}/>
    <div style={{ width:26,height:26,borderRadius:8,background:`${color}14`,display:"flex",alignItems:"center",justifyContent:"center" }}><I size={13} color={color}/></div>
    <p style={{ fontSize:13,fontWeight:800,color:C.navy }}>{title}</p>
  </div>
);
const M = ({icon:I,t})=>(
  <span style={{ fontSize:11,color:C.textMuted,display:"flex",alignItems:"center",gap:4 }}><I size={10}/>{t}</span>
);
const L = ({t,req})=>(
  <label style={{ display:"block",fontSize:12,fontWeight:700,color:C.textSub,marginBottom:6 }}>{t}{req&&<span style={{color:C.danger}}> *</span>}</label>
);
const SBar = ({value,set,ph})=>(
  <div style={{ position:"relative",marginBottom:18 }}>
    <Search size={14} color={C.textMuted} style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }}/>
    <input value={value} onChange={e=>set(e.target.value)} placeholder={ph}
      style={{ width:"100%",padding:"11px 14px 11px 38px",borderRadius:12,border:`1.5px solid ${C.iceBlue}`,background:C.surface,fontSize:13,color:C.navy,fontFamily:"'Syne',sans-serif",outline:"none",boxSizing:"border-box" }}/>
    {value&&<button onClick={()=>set("")} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer" }}><X size={14} color={C.textMuted}/></button>}
  </div>
);