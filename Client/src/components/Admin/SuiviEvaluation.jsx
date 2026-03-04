import { useEffect, useState } from "react";
import {
  ClipboardList, Plus, Search, X, CheckCircle2, AlertTriangle,
  RefreshCw, ArrowLeft, Calendar, MapPin, User, Building2,
  FileText, FileSpreadsheet, BarChart3, Loader2, Trash2,
  ChevronDown, ChevronUp, TrendingUp, Award, Users, Image as ImageIcon,
  BookOpen, Edit3, Star, Send,
} from "lucide-react";
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
function SessionDetail({ token, session, onBack }) {
  /* ── onglet ── */
  const [tab, setTab] = useState("saisie"); // "saisie" | "resultats"

  /* ── critères de la session (rubriques) ── */
  const [criteres,      setCriteres]      = useState([]);
  const [newCritere,    setNewCritere]    = useState("");
  const [addingCritere, setAddingCritere] = useState(false);

  /* ── apprenants + notes ── */
  const [apprenants,    setApprenants]    = useState([]); // [{id,nom,email,notes:{critereId:note}}]
  const [newNom,        setNewNom]        = useState("");
  const [newEmail,      setNewEmail]      = useState("");
  const [addingApp,     setAddingApp]     = useState(false);
  const [savingApp,     setSavingApp]     = useState(null); // id en cours de save

  /* ── résultats ── */
  const [results,       setResults]       = useState([]);
  const [loadingRes,    setLoadingRes]    = useState(false);

  /* ── exports ── */
  const [exporting,     setExporting]     = useState("");
  const [graphUrl,      setGraphUrl]      = useState(null);
  const [graphLoading,  setGraphLoading]  = useState(false);

  /* ── loading initial ── */
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  /* ─────────────────────────────────────────
     Chargement initial : critères + apprenants + évaluations existantes
  ───────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      setLoading(true); setError("");
      try {
        /* Critères */
        const cR = await authFetch(CONFIG.API_CRITERES, token);
        const cD = cR.ok ? await cR.json() : [];
        const c  = Array.isArray(cD)?cD:cD.results||[];
        setCriteres(c);

        /* Apprenants */
        const aR = await authFetch(CONFIG.API_APPRENANTS, token);
        const aD = aR.ok ? await aR.json() : [];
        const a  = Array.isArray(aD)?aD:aD.results||[];

        /* Évaluations de cette session */
        const eR = await authFetch(`${CONFIG.API_EVALUATIONS}?session=${session.id}`, token);
        const eD = eR.ok ? await eR.json() : [];
        const e  = Array.isArray(eD)?eD:eD.results||[];

        /* Construire la map notes par apprenant */
        const notesMap = {};
        e.forEach(ev => {
          if (!notesMap[ev.apprenant]) notesMap[ev.apprenant] = {};
          notesMap[ev.apprenant][ev.critere] = ev.note;
        });

        setApprenants(a.map(ap => ({ ...ap, notes: notesMap[ap.id]||{} })));
      } catch { setError("Erreur de chargement."); }
      finally   { setLoading(false); }
    })();
  }, [session.id]);

  /* ─────────────────────────────────────────
     Ajouter un critère (rubrique)
  ───────────────────────────────────────── */
  const addCritere = async () => {
    if (!newCritere.trim()) return;
    setAddingCritere(true);
    try {
      const r = await authFetch(CONFIG.API_CRITERES, token, { method:"POST", body:JSON.stringify({ nom:newCritere.trim() }) });
      if (r.ok||r.status===201) { const d=await r.json(); setCriteres(p=>[...p,d]); setNewCritere(""); }
    } catch {}
    finally { setAddingCritere(false); }
  };

  /* ─────────────────────────────────────────
     Ajouter un apprenant
  ───────────────────────────────────────── */
  const addApprenant = async () => {
    if (!newNom.trim()) return;
    setAddingApp(true);
    try {
      const r = await authFetch(CONFIG.API_APPRENANTS, token, { method:"POST", body:JSON.stringify({ nom:newNom.trim(), email:newEmail.trim()||undefined }) });
      if (r.ok||r.status===201) { const d=await r.json(); setApprenants(p=>[...p,{...d,notes:{}}]); setNewNom(""); setNewEmail(""); }
    } catch {}
    finally { setAddingApp(false); }
  };

  /* ─────────────────────────────────────────
     Changer une note dans la grille
  ───────────────────────────────────────── */
  const setNote = (appId, critId, note) => {
    setApprenants(p => p.map(a => a.id===appId ? { ...a, notes:{ ...a.notes, [critId]:note } } : a));
  };

  /* ─────────────────────────────────────────
     Enregistrer les évaluations d'un apprenant
  ───────────────────────────────────────── */
  const saveApprenant = async (app) => {
    setSavingApp(app.id);
    try {
      await Promise.all(criteres.map(c => {
        const note = app.notes[c.id];
        if (!note) return Promise.resolve();
        return authFetch(CONFIG.API_EVALUATIONS, token, {
          method:"POST",
          body:JSON.stringify({ session:session.id, apprenant:app.id, critere:c.id, note }),
        });
      }));
    } catch {}
    finally { setSavingApp(null); }
  };

  /* ─────────────────────────────────────────
     Charger les résultats
  ───────────────────────────────────────── */
  const loadResults = async () => {
    setLoadingRes(true);
    try {
      const r = await authFetch(CONFIG.API_RESULTS(session.id), token);
      if (r.ok) { const d=await r.json(); setResults(d); setTab("resultats"); }
    } catch {}
    finally { setLoadingRes(false); }
  };

  /* ─────────────────────────────────────────
     Exports
  ───────────────────────────────────────── */
  const dlPdfGlobal = async () => {
    setExporting("pdf");
    const r = await fetch(`${CONFIG.BASE_URL}${CONFIG.API_PDF_GLOBAL(session.id)}`,{headers:{Authorization:`Bearer ${token}`}});
    if (r.ok) dlBlob(await r.blob(),`rapport_global_${session.id}.pdf`);
    setExporting("");
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
    if (graphUrl) { setGraphUrl(null); return; }
    setGraphLoading(true);
    const r = await fetch(`${CONFIG.BASE_URL}${CONFIG.API_GRAPH(session.id)}`,{headers:{Authorization:`Bearer ${token}`}});
    if (r.ok) setGraphUrl(URL.createObjectURL(await r.blob()));
    setGraphLoading(false);
  };

  /* ─────────────────────────────────────────
     Stats locales (calcul frontend)
  ───────────────────────────────────────── */
  const localResults = apprenants.map(a => {
    const total   = Object.values(a.notes).reduce((s,n) => s+(NOTE_MAP[n]||0), 0);
    const maxPts  = criteres.length * 75;
    const pct     = maxPts > 0 ? Math.round((total/maxPts)*100) : 0;
    return { id:a.id, nom:a.nom, total, maxPts, pct };
  }).filter(r => r.total > 0);

  const avg    = localResults.length ? Math.round(localResults.reduce((s,r)=>s+r.pct,0)/localResults.length) : 0;
  const passed = localResults.filter(r=>r.pct>=50).length;

  const fd = d=>d?new Date(d).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"}):"—";

  if (loading) return <Spin/>;

  return (
    <div style={{ animation:"fadeUp .3s ease" }}>
      {/* ── En-tête session ── */}
      <div style={{ display:"flex",alignItems:"flex-start",gap:14,marginBottom:22 }}>
        <button onClick={onBack} style={{ width:38,height:38,borderRadius:10,background:C.surfaceAlt,border:`1.5px solid ${C.iceBlue}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,marginTop:2 }}>
          <ArrowLeft size={15} color={C.textSub}/>
        </button>
        <div style={{ flex:1 }}>
          <h1 style={{ fontSize:20,fontWeight:800,color:C.navy,lineHeight:1.2 }}>{session.theme}</h1>
          <div style={{ display:"flex",gap:12,marginTop:6,flexWrap:"wrap" }}>
            <M icon={User}     t={session.formateur}/>
            <M icon={MapPin}   t={session.lieu}/>
            <M icon={Calendar} t={`${fd(session.periode_debut)} → ${fd(session.periode_fin)}`}/>
            {session.organisme&&<M icon={Building2} t={session.organisme}/>}
          </div>
        </div>
      </div>

      {error && <Err msg={error} inline/>}

      {/* ── Onglets ── */}
      <div style={{ display:"flex",gap:4,marginBottom:20,background:C.surfaceAlt,borderRadius:12,padding:4,width:"fit-content",border:`1px solid ${C.iceBlue}` }}>
        {[{id:"saisie",label:"Saisie des évaluations",icon:Edit3},{id:"resultats",label:"Résultats",icon:BarChart3}].map(t=>(
          <button key={t.id} onClick={()=>t.id==="resultats"?loadResults():setTab(t.id)}
            style={{ display:"flex",alignItems:"center",gap:7,padding:"9px 18px",borderRadius:9,border:"none",background:tab===t.id?C.surface:"transparent",color:tab===t.id?C.navy:C.textSub,fontSize:13,fontWeight:tab===t.id?800:600,cursor:"pointer",fontFamily:"'Syne',sans-serif",boxShadow:tab===t.id?`0 2px 8px ${C.shadow}`:"none",transition:"all .15s" }}>
            {t.id==="resultats"&&loadingRes?<Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/>:<t.icon size={13}/>}{t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════
          ONGLET SAISIE
      ══════════════════════════════════════ */}
      {tab==="saisie" && (
        <div>
          {/* ── Bloc rubriques ── */}
          <div style={{ background:C.surface,borderRadius:18,border:"1.5px solid #EEF2FF",marginBottom:16,overflow:"hidden" }}>
            <div style={{ padding:"14px 20px",borderBottom:"1px solid #EEF2FF",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10 }}>
              <SH icon={BookOpen} title="Rubriques d'évaluation" color={C.blue}/>
              {/* Ajouter rubrique inline */}
              <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                <input
                  value={newCritere}
                  onChange={e=>setNewCritere(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&(e.preventDefault(),addCritere())}
                  placeholder="Nouvelle rubrique…"
                  style={{ padding:"7px 12px",borderRadius:9,border:`1.5px solid ${C.iceBlue}`,fontSize:12,color:C.navy,fontFamily:"'Syne',sans-serif",outline:"none",width:200 }}
                />
                <button onClick={addCritere} disabled={addingCritere||!newCritere.trim()}
                  style={{ display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:9,border:"none",background:newCritere.trim()?`linear-gradient(135deg,${C.navy},${C.blue})`:C.textMuted,color:"#fff",fontSize:12,fontWeight:700,cursor:newCritere.trim()?"pointer":"not-allowed",fontFamily:"'Syne',sans-serif" }}>
                  {addingCritere?<Loader2 size={12} style={{animation:"spin 1s linear infinite"}}/>:<Plus size={12}/>} Ajouter
                </button>
              </div>
            </div>
            {criteres.length===0 ? (
              <p style={{ padding:"16px 20px",fontSize:12,color:C.textMuted }}>Ajoutez au moins une rubrique pour pouvoir noter les apprenants.</p>
            ) : (
              <div style={{ padding:"12px 20px",display:"flex",flexWrap:"wrap",gap:8 }}>
                {criteres.map((c,i)=>(
                  <span key={c.id} style={{ fontSize:12,fontWeight:700,padding:"5px 14px",borderRadius:20,background:`${C.blue}10`,color:C.blue,border:`1px solid ${C.iceBlue}` }}>
                    {i+1}. {c.nom}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── Bloc apprenants + grille de notes ── */}
          <div style={{ background:C.surface,borderRadius:18,border:"1.5px solid #EEF2FF",overflow:"hidden" }}>
            {/* Header + ajout apprenant */}
            <div style={{ padding:"14px 20px",borderBottom:"1px solid #EEF2FF",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10 }}>
              <SH icon={Users} title="Apprenants" color={C.purple}/>
              <div style={{ display:"flex",gap:8,alignItems:"center",flexWrap:"wrap" }}>
                <input
                  value={newNom}
                  onChange={e=>setNewNom(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&(e.preventDefault(),addApprenant())}
                  placeholder="Nom de l'apprenant *"
                  style={{ padding:"7px 12px",borderRadius:9,border:`1.5px solid ${C.iceBlue}`,fontSize:12,color:C.navy,fontFamily:"'Syne',sans-serif",outline:"none",width:180 }}
                />
                <input
                  value={newEmail}
                  onChange={e=>setNewEmail(e.target.value)}
                  placeholder="Email (optionnel)"
                  style={{ padding:"7px 12px",borderRadius:9,border:`1.5px solid ${C.iceBlue}`,fontSize:12,color:C.navy,fontFamily:"'Syne',sans-serif",outline:"none",width:160 }}
                />
                <button onClick={addApprenant} disabled={addingApp||!newNom.trim()}
                  style={{ display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:9,border:"none",background:newNom.trim()?`linear-gradient(135deg,${C.navy},${C.blue})`:C.textMuted,color:"#fff",fontSize:12,fontWeight:700,cursor:newNom.trim()?"pointer":"not-allowed",fontFamily:"'Syne',sans-serif" }}>
                  {addingApp?<Loader2 size={12} style={{animation:"spin 1s linear infinite"}}/>:<Plus size={12}/>} Ajouter
                </button>
              </div>
            </div>

            {apprenants.length===0 ? (
              <p style={{ padding:"20px",fontSize:13,color:C.textMuted }}>Ajoutez un apprenant ci-dessus pour commencer la saisie.</p>
            ) : criteres.length===0 ? (
              <p style={{ padding:"20px",fontSize:13,color:C.textMuted }}>Ajoutez des rubriques avant de saisir les notes.</p>
            ) : (
              <div>
                {apprenants.map((app,ai)=>(
                  <AppRow key={app.id} app={app} criteres={criteres} ai={ai} total={apprenants.length}
                    onNote={(cId,n)=>setNote(app.id,cId,n)}
                    onSave={()=>saveApprenant(app)}
                    saving={savingApp===app.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          ONGLET RÉSULTATS
      ══════════════════════════════════════ */}
      {tab==="resultats" && (
        <div>
          {/* KPIs */}
          {localResults.length>0 && (
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:20 }}>
              {[
                { label:"Taux global",         value:`${avg}%`,                        icon:TrendingUp,   color:C.blue    },
                { label:"Satisfaisants ≥50%",  value:`${passed}/${localResults.length}`, icon:CheckCircle2, color:C.success },
                { label:"Apprenants évalués",  value:localResults.length,              icon:Users,        color:C.purple  },
                { label:"Rubriques évaluées",  value:criteres.length,                  icon:Star,         color:C.accent  },
              ].map((k,i)=>(
                <div key={i} style={{ background:C.surface,borderRadius:14,padding:"14px 16px",border:"1.5px solid #EEF2FF",boxShadow:"0 2px 12px rgba(13,27,94,0.06)" }}>
                  <div style={{ width:32,height:32,borderRadius:9,background:`${k.color}14`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:9 }}>
                    <k.icon size={15} color={k.color}/>
                  </div>
                  <p style={{ fontSize:22,fontWeight:800,color:C.navy,lineHeight:1 }}>{k.value}</p>
                  <p style={{ fontSize:11,color:C.textMuted,marginTop:3 }}>{k.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Exports */}
          <div style={{ display:"flex",gap:10,marginBottom:16,flexWrap:"wrap" }}>
            <EBtn icon={FileText}        label="PDF Global"    color="#E53935" loading={exporting==="pdf"}   onClick={dlPdfGlobal}/>
            <EBtn icon={FileSpreadsheet} label="Export Excel"  color="#15803D" loading={exporting==="excel"} onClick={dlExcel}/>
            <EBtn icon={ImageIcon}       label={graphUrl?"Masquer graphique":"Voir graphique"} color={C.purple} loading={graphLoading} onClick={loadGraph} active={!!graphUrl}/>
          </div>

          {/* Graphique */}
          {graphUrl && (
            <div style={{ background:C.surface,border:"1.5px solid #EEF2FF",borderRadius:16,padding:20,marginBottom:16 }}>
              <img src={graphUrl} alt="Graphique" style={{ maxWidth:"100%",borderRadius:10,display:"block",margin:"0 auto" }}/>
            </div>
          )}

          {/* Tableau résultats */}
          <div style={{ background:C.surface,border:"1.5px solid #EEF2FF",borderRadius:18,overflow:"hidden" }}>
            <div style={{ padding:"14px 20px",borderBottom:"1px solid #EEF2FF" }}>
              <SH icon={BarChart3} title="Résultats par apprenant" color={C.blue}/>
            </div>

            {localResults.length===0 ? (
              <Empty label="Aucune note saisie. Revenez à la Saisie pour entrer les notes."/>
            ) : (
              <div>
                {/* Ligne taux global */}
                <div style={{ padding:"12px 20px",background:`${C.blue}08`,borderBottom:"2px solid #EEF2FF",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                  <span style={{ fontSize:13,fontWeight:800,color:C.navy }}>Taux global de satisfaction</span>
                  <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                    <div style={{ width:100,height:8,borderRadius:4,background:"#EEF2FF",overflow:"hidden" }}>
                      <div style={{ width:`${avg}%`,height:"100%",background:avg>=75?C.success:avg>=50?C.accent:C.danger,borderRadius:4 }}/>
                    </div>
                    <span style={{ fontSize:16,fontWeight:800,color:avg>=75?C.success:avg>=50?C.accent:C.danger }}>{avg}%</span>
                  </div>
                </div>

                {/* Lignes apprenants */}
                {localResults.sort((a,b)=>b.pct-a.pct).map((r,i)=>{
                  const sc = scoreStyle(r.pct);
                  return (
                    <div key={r.id} style={{ padding:"14px 20px",display:"flex",alignItems:"center",gap:14,borderBottom:i<localResults.length-1?"1px solid #F0F4FF":"none",flexWrap:"wrap" }}>
                      {/* Rang */}
                      <div style={{ width:30,height:30,borderRadius:9,background:i<3?`${C.accent}18`:C.surfaceAlt,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                        <span style={{ fontSize:12,fontWeight:800,color:i<3?C.accent:C.textMuted }}>#{i+1}</span>
                      </div>
                      {/* Nom */}
                      <p style={{ flex:1,fontSize:14,fontWeight:800,color:C.navy,minWidth:120 }}>{r.nom}</p>
                      {/* Points */}
                      <span style={{ fontSize:12,color:C.textSub,fontWeight:600 }}>{r.total}/{r.maxPts} pts</span>
                      {/* Barre */}
                      <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                        <div style={{ width:80,height:6,borderRadius:3,background:"#EEF2FF",overflow:"hidden" }}>
                          <div style={{ width:`${r.pct}%`,height:"100%",background:sc.text,borderRadius:3 }}/>
                        </div>
                        <span style={{ fontSize:13,fontWeight:800,padding:"3px 12px",borderRadius:20,background:sc.bg,color:sc.text,border:`1px solid ${sc.border}` }}>{r.pct}%</span>
                      </div>
                      {/* Label */}
                      <span style={{ fontSize:11,fontWeight:700,color:sc.text }}>{sc.label}</span>
                      {/* PDF apprenant */}
                      <button onClick={()=>dlPdfApp(r.id,r.nom)}
                        style={{ display:"flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:8,border:`1px solid #FECDD3`,background:"#FFF1F2",color:C.danger,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'Syne',sans-serif" }}>
                        <FileText size={11}/> PDF
                      </button>
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
   LIGNE APPRENANT — grille de notation
══════════════════════════════════════════════════════ */
function AppRow({ app, criteres, ai, total, onNote, onSave, saving }) {
  const [open, setOpen] = useState(true);

  /* Score local en temps réel */
  const pts    = Object.values(app.notes).reduce((s,n)=>s+(NOTE_MAP[n]||0),0);
  const maxPts = criteres.length * 75;
  const pct    = maxPts>0 ? Math.round((pts/maxPts)*100) : 0;
  const sc     = scoreStyle(pct);
  const filled = criteres.filter(c=>app.notes[c.id]).length;

  return (
    <div style={{ borderBottom:ai<total-1?"1px solid #EEF2FF":"none" }}>
      {/* Header apprenant */}
      <div
        onClick={()=>setOpen(p=>!p)}
        style={{ padding:"14px 20px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",transition:"background .15s" }}
        onMouseEnter={e=>e.currentTarget.style.background="#F7F9FF"}
        onMouseLeave={e=>e.currentTarget.style.background="transparent"}
      >
        {/* Avatar initiales */}
        <div style={{ width:38,height:38,borderRadius:12,background:`${C.blue}14`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
          <span style={{ fontSize:13,fontWeight:800,color:C.blue }}>
            {app.nom.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase()}
          </span>
        </div>

        <div style={{ flex:1,minWidth:0 }}>
          <p style={{ fontSize:14,fontWeight:800,color:C.navy }}>{app.nom}</p>
          <p style={{ fontSize:11,color:C.textMuted,marginTop:2 }}>{filled}/{criteres.length} rubrique{criteres.length!==1?"s":""} remplie{criteres.length!==1?"s":""}</p>
        </div>

        {/* Score temps réel */}
        {filled>0 && (
          <span style={{ fontSize:13,fontWeight:800,padding:"4px 12px",borderRadius:20,background:sc.bg,color:sc.text,border:`1px solid ${sc.border}` }}>{pct}%</span>
        )}

        {/* Bouton enregistrer */}
        <button
          onClick={e=>{e.stopPropagation();onSave();}}
          disabled={saving||filled===0}
          style={{ display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:9,border:"none",background:filled>0&&!saving?`linear-gradient(135deg,${C.navy},${C.blue})`:C.textMuted,color:"#fff",fontSize:11,fontWeight:700,cursor:filled>0&&!saving?"pointer":"not-allowed",fontFamily:"'Syne',sans-serif",flexShrink:0 }}
        >
          {saving?<Loader2 size={11} style={{animation:"spin 1s linear infinite"}}/>:<Send size={11}/>}
          {saving?"Sauvegarde…":"Enregistrer"}
        </button>

        {open?<ChevronUp size={14} color={C.textMuted}/>:<ChevronDown size={14} color={C.textMuted}/>}
      </div>

      {/* Grille critères */}
      {open && (
        <div style={{ padding:"4px 20px 16px 72px" }}>
          {criteres.map((c,ci)=>{
            const current = app.notes[c.id];
            return (
              <div key={c.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"9px 0",borderBottom:ci<criteres.length-1?"1px dashed #EEF2FF":"none",flexWrap:"wrap" }}>
                {/* Nom rubrique */}
                <p style={{ width:220,fontSize:12,fontWeight:700,color:C.textSub,flexShrink:0 }}>
                  <span style={{ fontSize:10,color:C.textMuted,marginRight:6 }}>#{ci+1}</span>{c.nom}
                </p>
                {/* Boutons notation */}
                <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                  {[1,2,3].map(n=>{
                    const sel = current===n;
                    const nc  = NOTE_COLORS[n];
                    return (
                      <button key={n} type="button"
                        onClick={()=>onNote(c.id,n)}
                        style={{ padding:"6px 14px",borderRadius:8,border:`1.5px solid ${sel?nc.text:C.iceBlue}`,background:sel?nc.bg:"transparent",color:sel?nc.text:C.textMuted,fontSize:11,fontWeight:sel?800:600,cursor:"pointer",fontFamily:"'Syne',sans-serif",transition:"all .12s" }}>
                        {NOTE_LABELS[n]}
                      </button>
                    );
                  })}
                </div>
                {/* Points */}
                {current && (
                  <span style={{ fontSize:11,fontWeight:800,color:NOTE_COLORS[current].text,background:NOTE_COLORS[current].bg,padding:"3px 9px",borderRadius:14,border:`1px solid ${NOTE_COLORS[current].border}` }}>
                    {NOTE_MAP[current]} pts
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MINI COMPOSANTS
══════════════════════════════════════════════════════ */
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
const EBtn = ({icon:I,label,color,loading,onClick,active})=>(
  <button onClick={onClick} disabled={loading}
    style={{ display:"flex",alignItems:"center",gap:7,padding:"9px 16px",borderRadius:10,border:`1.5px solid ${active?color:C.iceBlue}`,background:active?`${color}10`:C.surfaceAlt,color:active?color:C.textSub,fontSize:12,fontWeight:700,cursor:loading?"not-allowed":"pointer",fontFamily:"'Syne',sans-serif",transition:"all .15s" }}
    onMouseEnter={e=>{if(!loading){e.currentTarget.style.background=`${color}15`;e.currentTarget.style.borderColor=color;e.currentTarget.style.color=color;}}}
    onMouseLeave={e=>{if(!loading&&!active){e.currentTarget.style.background=C.surfaceAlt;e.currentTarget.style.borderColor=C.iceBlue;e.currentTarget.style.color=C.textSub;}}}>
    {loading?<Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/>:<I size={13}/>} {label}
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