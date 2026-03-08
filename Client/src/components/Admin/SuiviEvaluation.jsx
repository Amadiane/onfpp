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
  const [view,    setView]    = useState("list");
  const [session, setSession] = useState(null);

  return (
    <div style={{ fontFamily:"'Inter',sans-serif", paddingTop:72 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes spin   { to{ transform:rotate(360deg) } }
        @keyframes fadeUp { from{ opacity:0;transform:translateY(12px) } to{ opacity:1;transform:none } }
        *,*::before,*::after { box-sizing:border-box; }
        @media (max-width:640px){
          .rsp2  { grid-template-columns:1fr !important; }
          .rsph  { display:none !important; }
          .rspst { flex-direction:column !important; align-items:stretch !important; }
          .rspfw { width:100% !important; min-width:0 !important; }
          .rsptb { width:100% !important; }
          .rspsaisie { grid-template-columns:1fr !important; }
        }
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
      <div className="rspst" style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:12 }}>
        <div>
          <h1 style={{ fontSize:22,fontWeight:800,color:C.navy }}>Évaluations des formations</h1>
          <p style={{ fontSize:12,color:C.textMuted,marginTop:4 }}>{sessions.length} session{sessions.length!==1?"s":""}</p>
        </div>
        <Btn icon={Plus} label="Nouvelle session" onClick={onNew}/>
      </div>

      <SBar value={search} set={setSearch} ph="Rechercher par thème, lieu, formateur…"/>

      {loading ? <Spin/> : error ? <Err msg={error}/> : lst.length===0 ? (
        <div style={{ textAlign:"center",padding:"44px 20px",color:C.textMuted }}>
          <ClipboardList size={34} style={{ margin:"0 auto 10px",opacity:.2,display:"block" }}/>
          <p style={{ fontWeight:700,fontSize:13 }}>{search ? "Aucun résultat pour cette recherche." : "Aucune session créée pour l'instant."}</p>
          {!search && (
            <button onClick={onNew} style={{ marginTop:16,display:"inline-flex",alignItems:"center",gap:8,padding:"12px 24px",borderRadius:12,border:"none",background:`linear-gradient(135deg,${C.navy},${C.blue})`,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"'Inter',sans-serif",boxShadow:`0 4px 16px ${C.shadow}` }}>
              <Plus size={15}/> Créer la première session
            </button>
          )}
        </div>
      ) : (
        <div style={{ display:"grid",gap:12 }}>
          {lst.map(s=>(
            <div key={s.id}
              onClick={()=>onSelect(s)}
              style={{ background:C.surface,border:"1.5px solid #EEF2FF",borderRadius:18,padding:"16px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:14,transition:"all .18s",boxShadow:"0 1px 8px rgba(13,27,94,0.05)",flexWrap:"wrap" }}
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
   2 — NOUVELLE SESSION  (avec sélection formateur)
══════════════════════════════════════════════════════ */
function NewSession({ token, onBack, onDone }) {
  const [form, setForm] = useState({
    theme:"", periode_debut:"", periode_fin:"", lieu:"",
    organisme:"", formateur:"", formateur_ref:"",
    structure_beneficiaire:"",
  });
  const [busy,       setBusy]       = useState(false);
  const [err,        setErr]        = useState("");
  const [ok,         setOk]         = useState(false);
  const [foc,        setFoc]        = useState({});
  const [formateurs, setFormateurs] = useState([]);
  const [loadingFmt, setLoadingFmt] = useState(true);

  /* Charger la liste des formateurs enregistrés */
  useEffect(() => {
    (async () => {
      setLoadingFmt(true);
      try {
        const r = await authFetch("/api/formateurs/", token);
        if (r.ok) {
          const d = await r.json();
          setFormateurs(Array.isArray(d) ? d : d.results || []);
        }
      } catch {}
      finally { setLoadingFmt(false); }
    })();
  }, []);

  const iS = n=>({ width:"100%",padding:"10px 14px",borderRadius:10,border:`1.5px solid ${foc[n]?C.blue:C.iceBlue}`,background:C.surface,fontSize:13,color:C.navy,fontFamily:"'Inter',sans-serif",outline:"none",boxShadow:foc[n]?`0 0 0 3px ${C.blue}15`:"none",transition:"all .15s" });
  const fp = n=>({ onFocus:()=>setFoc(p=>({...p,[n]:true})), onBlur:()=>setFoc(p=>({...p,[n]:false})), style:iS(n) });
  const ch = (n,v)=>{ setForm(p=>({...p,[n]:v})); setErr(""); };

  /* Quand on sélectionne un formateur dans la liste → pré-remplir le champ texte */
  const handleFormateurSelect = (e) => {
    const id = e.target.value;
    const fmt = formateurs.find(f => String(f.id) === String(id));
    if (fmt) {
      const nom = `${fmt.prenom} ${fmt.nom}`;
      setForm(p => ({ ...p, formateur_ref: id, formateur: nom }));
    } else {
      setForm(p => ({ ...p, formateur_ref: "", formateur: "" }));
    }
    setErr("");
  };

  const submit = async e => {
    e.preventDefault();
    if (!form.theme||!form.periode_debut||!form.periode_fin||!form.lieu||!form.formateur)
      { setErr("Remplissez tous les champs obligatoires."); return; }
    setBusy(true);
    try {
      const payload = {
        theme:                  form.theme,
        periode_debut:          form.periode_debut,
        periode_fin:            form.periode_fin,
        lieu:                   form.lieu,
        organisme:              form.organisme,
        formateur:              form.formateur,
        structure_beneficiaire: form.structure_beneficiaire,
      };
      if (form.formateur_ref) payload.formateur_ref = form.formateur_ref;

      const r = await authFetch(CONFIG.API_SESSIONS, token, { method:"POST", body:JSON.stringify(payload) });
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
          <div className="rsp2" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14 }}>
            <div><L t="Date de début" req/><input type="date" value={form.periode_debut} onChange={e=>ch("periode_debut",e.target.value)} {...fp("periode_debut")}/></div>
            <div><L t="Date de fin"   req/><input type="date" value={form.periode_fin}   onChange={e=>ch("periode_fin",  e.target.value)} {...fp("periode_fin")}/></div>
          </div>

          {/* Lieu */}
          <div style={{ marginBottom:14 }}>
            <L t="Lieu" req/>
            <input value={form.lieu} onChange={e=>ch("lieu",e.target.value)} placeholder="ex : Conakry" {...fp("lieu")}/>
          </div>

          {/* ── SÉLECTION FORMATEUR ── */}
          <div style={{ marginBottom:14 }}>
            <L t="Formateur" req/>
            <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
              {/* Dropdown formateurs enregistrés */}
              <div style={{ position:"relative" }}>
                <select
                  value={form.formateur_ref}
                  onChange={handleFormateurSelect}
                  style={{ ...iS("formateur_ref"), appearance:"none", paddingRight:36, cursor:"pointer" }}
                  onFocus={()=>setFoc(p=>({...p,formateur_ref:true}))}
                  onBlur={()=>setFoc(p=>({...p,formateur_ref:false}))}
                >
                  <option value="">— Sélectionner un formateur enregistré —</option>
                  {loadingFmt
                    ? <option disabled>Chargement…</option>
                    : formateurs.map(f => (
                        <option key={f.id} value={f.id}>
                          {f.prenom} {f.nom}
                          {f.specialite ? ` — ${f.specialite}` : ""}
                          {f.antenne ? ` (${f.antenne})` : ""}
                        </option>
                      ))
                  }
                </select>
                <User size={14} color={C.textMuted} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }}/>
              </div>

              {/* Ou saisie manuelle */}
              <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                <div style={{ flex:1,height:1,background:C.iceBlue }}/>
                <span style={{ fontSize:11,color:C.textMuted,fontWeight:600,whiteSpace:"nowrap" }}>ou saisir manuellement</span>
                <div style={{ flex:1,height:1,background:C.iceBlue }}/>
              </div>
              <input
                value={form.formateur}
                onChange={e=>{ ch("formateur",e.target.value); if(!e.target.value) ch("formateur_ref",""); }}
                placeholder="ex : Mamadou Diallo (saisie libre)"
                {...fp("formateur")}
              />

              {/* Affichage formateur sélectionné */}
              {form.formateur_ref && (
                <div style={{ padding:"8px 12px",borderRadius:10,background:`${C.success}10`,border:`1px solid ${C.success}30`,display:"flex",alignItems:"center",gap:8 }}>
                  <CheckCircle2 size={13} color={C.success}/>
                  <span style={{ fontSize:12,color:C.success,fontWeight:700 }}>
                    Formateur enregistré sélectionné : {form.formateur}
                  </span>
                  <button type="button" onClick={()=>setForm(p=>({...p,formateur_ref:"",formateur:""}))}
                    style={{ marginLeft:"auto",background:"none",border:"none",cursor:"pointer",color:C.textMuted }}>
                    <X size={13}/>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Organisme + Structure */}
          <div className="rsp2" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:22 }}>
            <div><L t="Organisme"/><input value={form.organisme} onChange={e=>ch("organisme",e.target.value)} placeholder="ex : ONFPP" {...fp("organisme")}/></div>
            <div><L t="Structure bénéficiaire"/><input value={form.structure_beneficiaire} onChange={e=>ch("structure_beneficiaire",e.target.value)} placeholder="ex : Ministère XYZ" {...fp("structure_beneficiaire")}/></div>
          </div>

          {err && <Err msg={err} inline/>}
          <div style={{ display:"flex",gap:12,paddingTop:18,borderTop:"1px solid #EEF2FF" }}>
            <button type="button" onClick={onBack} style={{ flex:1,padding:"12px",borderRadius:12,border:`1.5px solid ${C.iceBlue}`,background:C.surfaceAlt,color:C.textSub,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif" }}>Annuler</button>
            <button type="submit" disabled={busy} style={{ flex:2,padding:"12px",borderRadius:12,border:"none",background:busy?C.textMuted:`linear-gradient(135deg,${C.navy},${C.blue})`,color:"#fff",fontSize:13,fontWeight:800,cursor:busy?"not-allowed":"pointer",fontFamily:"'Inter',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
              {busy?<><Loader2 size={14} style={{animation:"spin 1s linear infinite"}}/> Création…</>:<><CheckCircle2 size={14}/> Enregistrer la session</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   3 — DÉTAIL SESSION
══════════════════════════════════════════════════════ */
function SessionDetail({ token, session, onBack }) {
  const [tab,          setTab]          = useState("saisie");
  const [criteres,     setCriteres]     = useState([]);
  const [newCrit,      setNewCrit]      = useState("");
  const [addingCrit,   setAddingCrit]   = useState(false);
  const [editCrit,     setEditCrit]     = useState(null);
  const [editCritVal,  setEditCritVal]  = useState("");
  const [savingCrit,   setSavingCrit]   = useState(null);
  const [deletingCrit, setDeletingCrit] = useState(null);
  const [apprenants,   setApprenants]   = useState([]);
  const [editApp,      setEditApp]      = useState(null);
  const [editAppVal,   setEditAppVal]   = useState({ nom:"", email:"" });
  const [savingApp,    setSavingApp]    = useState(null);
  const [deletingApp,  setDeletingApp]  = useState(null);
  const [confirmDel,   setConfirmDel]   = useState(null);
  const [draft,        setDraft]        = useState(null);
  const [draftNom,     setDraftNom]     = useState("");
  const [draftEmail,   setDraftEmail]   = useState("");
  const [draftComment, setDraftComment] = useState("");
  const [savingDraft,  setSavingDraft]  = useState(false);
  const [editCommentApp,    setEditCommentApp]    = useState(null);
  const [editCommentVal,    setEditCommentVal]    = useState("");
  const [savingComment,     setSavingComment]     = useState(null);
  const [incluirePdf,       setIncluirePdf]       = useState({});
  const [commentFinal,      setCommentFinal]      = useState(session.commentaire_final||"");
  const [editingFinal,      setEditingFinal]      = useState(false);
  const [editFinalVal,      setEditFinalVal]       = useState(commentFinal);
  const [savingFinal,       setSavingFinal]        = useState(false);
  const [results,      setResults]      = useState([]);
  const [loadingRes,   setLoadingRes]   = useState(false);
  const [exporting,    setExporting]    = useState("");
  const [graphData,    setGraphData]    = useState(null);
  const [graphLoading, setGraphLoading] = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [editSession,    setEditSession]    = useState(false);
  const [editSessionVal, setEditSessionVal] = useState({});
  const [savingSession,  setSavingSession]  = useState(false);
  const [deletingSession,setDeletingSession]= useState(false);
  const [confirmDelSession, setConfirmDelSession] = useState(false);
  const [sessionData,    setSessionData]    = useState(session);

  const fd = d => d ? new Date(d).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"}) : "—";

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

        const notesMap    = {};
        const evalIdsMap  = {};
        const commentMap  = {};
        e.forEach(ev => {
          if (!notesMap[ev.apprenant])   notesMap[ev.apprenant]   = {};
          if (!evalIdsMap[ev.apprenant]) evalIdsMap[ev.apprenant] = {};
          notesMap[ev.apprenant][ev.critere]   = ev.note;
          evalIdsMap[ev.apprenant][ev.critere] = ev.id;
          if (ev.commentaire && !commentMap[ev.apprenant]) commentMap[ev.apprenant] = ev.commentaire;
        });
        const inclMap = {};
        const appList = a.filter(ap => notesMap[ap.id]).map(ap => {
          if (commentMap[ap.id]) inclMap[ap.id] = true;
          return {
            ...ap, notes:notesMap[ap.id], saved:true,
            evalIds:  evalIdsMap[ap.id]  || {},
            commentaire: commentMap[ap.id] || "",
          };
        });
        setIncluirePdf(inclMap);
        setApprenants(appList);
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
      if (r.ok) { const d = await r.json(); setCriteres(p => p.map(c => c.id===id ? d : c)); cancelEditCrit(); }
    } catch {}
    finally { setSavingCrit(null); }
  };

  const deleteCrit = async (id) => {
    setDeletingCrit(id); setConfirmDel(null);
    try {
      const r = await authFetch(`${CONFIG.API_CRITERES}${id}/`, token, { method:"DELETE" });
      if (r.ok||r.status===204) {
        setCriteres(p => p.filter(c => c.id!==id));
        if (draft) setDraft(p => { const n={...p.notes}; delete n[id]; return {...p,notes:n}; });
      }
    } catch {}
    finally { setDeletingCrit(null); }
  };

  /* ═══ APPRENANTS ═══ */
  const openDraft = () => { setDraft({ notes:{} }); setDraftNom(""); setDraftEmail(""); setDraftComment(""); };
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
      const evalResponses = await Promise.all(
        criteres.filter(c => draft.notes[c.id]).map(c =>
          authFetch(CONFIG.API_EVALUATIONS, token, {
            method:"POST",
            body:JSON.stringify({
              session:session.id, apprenant:apprenant.id, critere:c.id,
              note:draft.notes[c.id],
              commentaire: draftComment.trim()||undefined,
            }),
          }).then(r=>r.json().catch(()=>null))
        )
      );
      const evalIds = {};
      criteres.filter(c=>draft.notes[c.id]).forEach((c,i)=>{
        if (evalResponses[i]?.id) evalIds[c.id] = evalResponses[i].id;
      });
      setApprenants(p => [...p, {
        ...apprenant, notes:draft.notes, saved:true,
        evalIds, commentaire:draftComment.trim(),
      }]);
      if (draftComment.trim()) setIncluirePdf(p => ({ ...p, [apprenant.id]: true }));
      setDraft(null); setDraftNom(""); setDraftEmail(""); setDraftComment("");
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
      if (r.ok) { const d = await r.json(); setApprenants(p => p.map(a => a.id===id ? { ...a, nom:d.nom, email:d.email } : a)); cancelEditApp(); }
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

  /* ═══ COMMENTAIRES ═══ */
  const startEditComment = (a) => { setEditCommentApp(a.id); setEditCommentVal(a.commentaire||""); };
  const cancelEditComment = () => { setEditCommentApp(null); setEditCommentVal(""); };

  const saveComment = async (appId) => {
    setSavingComment(appId);
    try {
      const a = apprenants.find(x=>x.id===appId);
      if (!a) return;
      const firstEvalId = a.evalIds ? Object.values(a.evalIds)[0] : null;
      if (!firstEvalId) return;
      const r = await authFetch(
        `${CONFIG.API_EVALUATIONS}${firstEvalId}/update-commentaire/`, token,
        { method:"PATCH", body:JSON.stringify({ commentaire: editCommentVal }) }
      );
      if (r.ok) { setApprenants(p => p.map(x => x.id===appId ? { ...x, commentaire:editCommentVal } : x)); cancelEditComment(); }
    } catch {}
    finally { setSavingComment(null); }
  };

  const deleteComment = async (appId) => {
    setSavingComment(appId);
    try {
      const a = apprenants.find(x=>x.id===appId);
      if (!a) return;
      const firstEvalId = a.evalIds ? Object.values(a.evalIds)[0] : null;
      if (!firstEvalId) return;
      const r = await authFetch(
        `${CONFIG.API_EVALUATIONS}${firstEvalId}/update-commentaire/`, token,
        { method:"PATCH", body:JSON.stringify({ commentaire: "" }) }
      );
      if (r.ok) setApprenants(p => p.map(x => x.id===appId ? { ...x, commentaire:"" } : x));
    } catch {}
    finally { setSavingComment(null); }
  };

  /* ═══ COMMENTAIRE FINAL ═══ */
  const openEditFinal = () => { setEditFinalVal(commentFinal); setEditingFinal(true); };
  const cancelEditFinal = () => { setEditingFinal(false); setEditFinalVal(""); };

  const saveCommentFinal = async () => {
    setSavingFinal(true);
    try {
      const r = await authFetch(
        `${CONFIG.API_SESSIONS}${session.id}/update-commentaire-final/`, token,
        { method:"PATCH", body:JSON.stringify({ commentaire_final: editFinalVal }) }
      );
      if (r.ok) { setCommentFinal(editFinalVal); setEditingFinal(false); }
    } catch {}
    finally { setSavingFinal(false); }
  };

  const deleteCommentFinal = async () => {
    setSavingFinal(true);
    try {
      const r = await authFetch(
        `${CONFIG.API_SESSIONS}${session.id}/update-commentaire-final/`, token,
        { method:"PATCH", body:JSON.stringify({ commentaire_final: "" }) }
      );
      if (r.ok) { setCommentFinal(""); setEditingFinal(false); }
    } catch {}
    finally { setSavingFinal(false); }
  };

  /* ═══ SESSION EDIT/DELETE ═══ */
  const openEditSession = () => {
    setEditSessionVal({
      theme:                 sessionData.theme||"",
      formateur:             sessionData.formateur||"",
      lieu:                  sessionData.lieu||"",
      periode_debut:         sessionData.periode_debut||"",
      periode_fin:           sessionData.periode_fin||"",
      organisme:             sessionData.organisme||"",
      structure_beneficiaire:sessionData.structure_beneficiaire||"",
    });
    setEditSession(true);
  };

  const saveSession = async () => {
    if (!editSessionVal.theme?.trim()) return;
    setSavingSession(true);
    try {
      const r = await authFetch(`${CONFIG.API_SESSIONS}${sessionData.id}/`, token, {
        method:"PATCH", body:JSON.stringify(editSessionVal),
      });
      if (r.ok) { const d = await r.json(); setSessionData(d); setEditSession(false); }
    } catch {}
    finally { setSavingSession(false); }
  };

  const deleteSession = async () => {
    setDeletingSession(true); setConfirmDelSession(false);
    try {
      const r = await authFetch(`${CONFIG.API_SESSIONS}${sessionData.id}/`, token, { method:"DELETE" });
      if (r.ok||r.status===204) onBack();
    } catch {}
    finally { setDeletingSession(false); }
  };

  /* ═══ EXPORTS ═══ */
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
      let gd = graphData;
      if (!gd) {
        const gr = await authFetch(CONFIG.API_GRAPH(session.id), token);
        if (gr.ok) gd = await gr.json();
      }
      if (!gd) return;

      const nbApp = (gd.scores||[]).length;
      const chartBars = await generateChartBase64("bar", buildBarsData(gd), buildBarsOpts(nbApp), 780, Math.max(300, nbApp * 44 + 100));
      const chartCrit = await generateChartBase64("bar", buildCritBarsData(gd), buildCritBarsOpts(), 820, 380);
      const chartPie  = await generateChartBase64("doughnut", buildPieData(gd), buildPieOpts(), 740, 340);

      const commentaires_a_inclure = apprenants
        .filter(a => a.commentaire && incluirePdf[a.id])
        .map(a => ({ nom: a.nom, commentaire: a.commentaire }));

      const r = await fetch(`${CONFIG.BASE_URL}${CONFIG.API_PDF_GLOBAL(session.id)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          chart_bars: chartBars, chart_crit: chartCrit, chart_pie: chartPie,
          commentaires_apprenants: commentaires_a_inclure,
          commentaire_final: commentFinal || "",
        }),
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

  const loadGraph = async () => {
    if (graphData) { setGraphData(null); return; }
    setGraphLoading(true);
    try {
      const r = await authFetch(CONFIG.API_GRAPH(session.id), token);
      if (r.ok) setGraphData(await r.json());
    } catch {}
    finally { setGraphLoading(false); }
  };

  /* Stats locales */
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

      {/* Modal confirmation suppression */}
      {confirmDel && (
        <div onClick={()=>setConfirmDel(null)} style={{ position:"fixed",inset:0,background:"rgba(13,27,94,0.4)",backdropFilter:"blur(4px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"80px 16px 16px" }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:C.surface,borderRadius:20,padding:28,width:"100%",maxWidth:380,boxShadow:"0 24px 80px rgba(13,27,94,0.25)",border:"2px solid #FECDD3" }}>
            <div style={{ width:48,height:48,borderRadius:14,background:"#FFF1F2",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px" }}>
              <AlertTriangle size={22} color={C.danger}/>
            </div>
            <p style={{ fontSize:16,fontWeight:800,color:C.navy,textAlign:"center",marginBottom:8 }}>Confirmer la suppression</p>
            <p style={{ fontSize:13,color:C.textSub,textAlign:"center",marginBottom:22 }}>
              Supprimer <strong>"{confirmDel.nom}"</strong> ?
              {confirmDel.type==="app" && <><br/><span style={{fontSize:11,color:C.textMuted}}>Toutes ses évaluations seront aussi supprimées.</span></>}
            </p>
            <div style={{ display:"flex",gap:10 }}>
              <button onClick={()=>setConfirmDel(null)} style={{ flex:1,padding:"11px",borderRadius:12,border:`1.5px solid ${C.iceBlue}`,background:C.surfaceAlt,color:C.textSub,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif" }}>Annuler</button>
              <button onClick={()=>confirmDel.type==="crit" ? deleteCrit(confirmDel.id) : deleteApp(confirmDel.id)}
                style={{ flex:1,padding:"11px",borderRadius:12,border:"none",background:C.danger,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"'Inter',sans-serif" }}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmation suppression session */}
      {confirmDelSession && (
        <div onClick={()=>setConfirmDelSession(false)} style={{ position:"fixed",inset:0,background:"rgba(13,27,94,0.45)",backdropFilter:"blur(4px)",zIndex:1100,display:"flex",alignItems:"center",justifyContent:"center",padding:"80px 16px 16px" }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:C.surface,borderRadius:20,padding:28,width:"100%",maxWidth:400,boxShadow:"0 24px 80px rgba(13,27,94,0.25)",border:"2px solid #FECDD3" }}>
            <div style={{ width:52,height:52,borderRadius:14,background:"#FFF1F2",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px" }}>
              <AlertTriangle size={24} color={C.danger}/>
            </div>
            <p style={{ fontSize:16,fontWeight:800,color:C.navy,textAlign:"center",marginBottom:8 }}>Supprimer cette session ?</p>
            <p style={{ fontSize:13,color:C.textSub,textAlign:"center",marginBottom:22 }}>
              La session <strong>"{sessionData.theme}"</strong> et toutes ses évaluations seront supprimées définitivement.
            </p>
            <div style={{ display:"flex",gap:10 }}>
              <button onClick={()=>setConfirmDelSession(false)} style={{ flex:1,padding:"11px",borderRadius:12,border:`1.5px solid ${C.iceBlue}`,background:C.surfaceAlt,color:C.textSub,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif" }}>Annuler</button>
              <button onClick={deleteSession} disabled={deletingSession} style={{ flex:1,padding:"11px",borderRadius:12,border:"none",background:C.danger,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"'Inter',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:7 }}>
                {deletingSession?<><Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/> Suppression…</>:<><Trash2 size={13}/> Supprimer</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal édition session */}
      {editSession && (
        <div onClick={()=>setEditSession(false)} style={{ position:"fixed",inset:0,background:"rgba(13,27,94,0.5)",backdropFilter:"blur(6px)",zIndex:1100,display:"flex",alignItems:"center",justifyContent:"center",padding:"80px 16px 16px" }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:C.surface,borderRadius:20,padding:28,width:"100%",maxWidth:520,maxHeight:"calc(100vh - 100px)",overflowY:"auto",boxShadow:"0 32px 80px rgba(13,27,94,0.3)",border:`1.5px solid ${C.iceBlue}` }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
              <p style={{ fontSize:16,fontWeight:800,color:C.navy }}>Modifier la session</p>
              <button onClick={()=>setEditSession(false)} style={{ width:30,height:30,borderRadius:8,background:C.surfaceAlt,border:`1px solid ${C.iceBlue}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}><X size={13} color={C.textSub}/></button>
            </div>
            {[
              {k:"theme",label:"Thème",req:true},{k:"formateur",label:"Formateur",req:true},
              {k:"lieu",label:"Lieu",req:true},{k:"organisme",label:"Organisme",req:false},
              {k:"structure_beneficiaire",label:"Structure bénéficiaire",req:false},
            ].map(f=>(
              <div key={f.k} style={{ marginBottom:12 }}>
                <L t={f.label} req={f.req}/>
                <input value={editSessionVal[f.k]||""} onChange={e=>setEditSessionVal(p=>({...p,[f.k]:e.target.value}))}
                  style={{ width:"100%",padding:"9px 12px",borderRadius:9,border:`1.5px solid ${C.iceBlue}`,fontSize:13,color:C.navy,fontFamily:"'Inter',sans-serif",outline:"none",boxSizing:"border-box" }}/>
              </div>
            ))}
            <div className="rsp2" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20 }}>
              <div><L t="Date début"/><input type="date" value={editSessionVal.periode_debut||""} onChange={e=>setEditSessionVal(p=>({...p,periode_debut:e.target.value}))} style={{ width:"100%",padding:"9px 12px",borderRadius:9,border:`1.5px solid ${C.iceBlue}`,fontSize:13,color:C.navy,fontFamily:"'Inter',sans-serif",outline:"none",boxSizing:"border-box" }}/></div>
              <div><L t="Date fin"/><input type="date" value={editSessionVal.periode_fin||""} onChange={e=>setEditSessionVal(p=>({...p,periode_fin:e.target.value}))} style={{ width:"100%",padding:"9px 12px",borderRadius:9,border:`1.5px solid ${C.iceBlue}`,fontSize:13,color:C.navy,fontFamily:"'Inter',sans-serif",outline:"none",boxSizing:"border-box" }}/></div>
            </div>
            <div style={{ display:"flex",gap:10 }}>
              <button onClick={()=>setEditSession(false)} style={{ flex:1,padding:"11px",borderRadius:12,border:`1.5px solid ${C.iceBlue}`,background:C.surfaceAlt,color:C.textSub,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif" }}>Annuler</button>
              <button onClick={saveSession} disabled={savingSession||!editSessionVal.theme?.trim()} style={{ flex:2,padding:"11px",borderRadius:12,border:"none",background:`linear-gradient(135deg,${C.navy},${C.blue})`,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"'Inter',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:7 }}>
                {savingSession?<><Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/> Sauvegarde…</>:<><CheckCircle2 size={13}/> Enregistrer</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="rspst" style={{ display:"flex",alignItems:"flex-start",gap:14,marginBottom:22,flexWrap:"wrap" }}>
        <button onClick={onBack} style={{ width:38,height:38,borderRadius:10,background:C.surfaceAlt,border:`1.5px solid ${C.iceBlue}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,marginTop:2 }}>
          <ArrowLeft size={15} color={C.textSub}/>
        </button>
        <div style={{ flex:1,minWidth:0 }}>
          <h1 style={{ fontSize:18,fontWeight:800,color:C.navy,lineHeight:1.2 }}>{sessionData.theme}</h1>
          <div style={{ display:"flex",gap:10,marginTop:6,flexWrap:"wrap" }}>
            <M icon={User} t={sessionData.formateur}/><M icon={MapPin} t={sessionData.lieu}/>
            <M icon={Calendar} t={`${fd(sessionData.periode_debut)} → ${fd(sessionData.periode_fin)}`}/>
            {sessionData.organisme&&<M icon={Building2} t={sessionData.organisme}/>}
          </div>
        </div>
        <div style={{ display:"flex",gap:8,flexShrink:0,marginTop:2,flexWrap:"wrap" }}>
          <button onClick={openEditSession} title="Modifier la session"
            style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:10,border:`1.5px solid ${C.iceBlue}`,background:C.surfaceAlt,color:C.textSub,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif",transition:"all .15s" }}
            onMouseEnter={e=>{e.currentTarget.style.background=`${C.blue}14`;e.currentTarget.style.borderColor=C.blue;e.currentTarget.style.color=C.blue;}}
            onMouseLeave={e=>{e.currentTarget.style.background=C.surfaceAlt;e.currentTarget.style.borderColor=C.iceBlue;e.currentTarget.style.color=C.textSub;}}>
            <Edit3 size={12}/> Modifier
          </button>
          <button onClick={()=>setConfirmDelSession(true)} title="Supprimer la session"
            style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:10,border:"1.5px solid #FECDD3",background:"#FFF5F5",color:C.danger,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif",transition:"all .15s" }}
            onMouseEnter={e=>{e.currentTarget.style.background="#FECDD3";}}
            onMouseLeave={e=>{e.currentTarget.style.background="#FFF5F5";}}>
            <Trash2 size={12}/> Supprimer
          </button>
        </div>
      </div>

      {error && <Err msg={error} inline/>}

      {/* Onglets */}
      <div className="rsptb" style={{ display:"flex",gap:4,marginBottom:20,background:C.surfaceAlt,borderRadius:12,padding:4,width:"fit-content",border:`1px solid ${C.iceBlue}` }}>
        {[{id:"saisie",label:"Saisie",icon:Edit3},{id:"resultats",label:"Résultats",icon:BarChart3}].map(t=>(
          <button key={t.id} onClick={()=>t.id==="resultats"?loadResults():setTab("saisie")}
            style={{ display:"flex",alignItems:"center",gap:7,padding:"9px 20px",borderRadius:9,border:"none",background:tab===t.id?C.surface:"transparent",color:tab===t.id?C.navy:C.textSub,fontSize:13,fontWeight:tab===t.id?800:600,cursor:"pointer",fontFamily:"'Inter',sans-serif",boxShadow:tab===t.id?`0 2px 8px ${C.shadow}`:"none",transition:"all .15s" }}>
            {t.id==="resultats"&&loadingRes?<Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/>:<t.icon size={13}/>} {t.label}
          </button>
        ))}
      </div>

      {/* ════ ONGLET SAISIE ════ */}
      {tab==="saisie" && (
        <div className="rspsaisie" style={{ display:"grid",gridTemplateColumns:"280px 1fr",gap:16,alignItems:"start" }}>

          {/* Colonne rubriques */}
          <div style={{ background:C.surface,borderRadius:18,border:"1.5px solid #EEF2FF",overflow:"hidden",position:"sticky",top:16 }}>
            <div style={{ padding:"14px 16px",borderBottom:"1px solid #EEF2FF" }}>
              <SH icon={BookOpen} title="Rubriques" color={C.blue}/>
              <p style={{ fontSize:11,color:C.textMuted,marginTop:5 }}>{criteres.length} rubrique{criteres.length!==1?"s":""} · communes à tous</p>
            </div>
            <div style={{ maxHeight:340,overflowY:"auto" }}>
              {criteres.length===0 ? (
                <p style={{ padding:"14px 16px",fontSize:12,color:C.textMuted }}>Aucune rubrique.</p>
              ) : criteres.map((c,i) => (
                <div key={c.id} style={{ padding:"9px 14px",borderBottom:i<criteres.length-1?"1px solid #F5F7FF":"none" }}>
                  {editCrit===c.id ? (
                    <div style={{ display:"flex",gap:6,alignItems:"center" }}>
                      <input autoFocus value={editCritVal} onChange={e=>setEditCritVal(e.target.value)}
                        onKeyDown={e=>{ if(e.key==="Enter") saveEditCrit(c.id); if(e.key==="Escape") cancelEditCrit(); }}
                        style={{ flex:1,padding:"6px 9px",borderRadius:7,border:`1.5px solid ${C.blue}`,fontSize:12,color:C.navy,fontFamily:"'Inter',sans-serif",outline:"none" }}/>
                      <button onClick={()=>saveEditCrit(c.id)} disabled={savingCrit===c.id}
                        style={{ width:28,height:28,borderRadius:7,border:"none",background:C.blue,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0 }}>
                        {savingCrit===c.id?<Loader2 size={11} color="#fff" style={{animation:"spin 1s linear infinite"}}/>:<CheckCircle2 size={11} color="#fff"/>}
                      </button>
                      <button onClick={cancelEditCrit} style={{ width:28,height:28,borderRadius:7,border:`1px solid ${C.iceBlue}`,background:C.surfaceAlt,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0 }}>
                        <X size={11} color={C.textSub}/>
                      </button>
                    </div>
                  ) : (
                    <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                      <span style={{ width:20,height:20,borderRadius:5,background:`${C.blue}14`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:C.blue,flexShrink:0 }}>{i+1}</span>
                      <p style={{ flex:1,fontSize:12,fontWeight:700,color:C.navy,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{c.nom}</p>
                      <button onClick={()=>startEditCrit(c)}
                        style={{ width:26,height:26,borderRadius:7,border:`1px solid ${C.iceBlue}`,background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0 }}
                        onMouseEnter={e=>{e.currentTarget.style.background=`${C.blue}14`;e.currentTarget.style.borderColor=C.blue;}}
                        onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor=C.iceBlue;}}>
                        <Edit3 size={10} color={C.textSub}/>
                      </button>
                      <button onClick={()=>setConfirmDel({type:"crit",id:c.id,nom:c.nom})} disabled={deletingCrit===c.id}
                        style={{ width:26,height:26,borderRadius:7,border:"1px solid #FECDD3",background:"#FFF5F5",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0 }}
                        onMouseEnter={e=>{e.currentTarget.style.background="#FECDD3";}}
                        onMouseLeave={e=>{e.currentTarget.style.background="#FFF5F5";}}>
                        {deletingCrit===c.id?<Loader2 size={10} color={C.danger} style={{animation:"spin 1s linear infinite"}}/>:<Trash2 size={10} color={C.danger}/>}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ padding:"12px 14px",borderTop:"1px solid #EEF2FF" }}>
              <input value={newCrit} onChange={e=>setNewCrit(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&(e.preventDefault(),addCritere())}
                placeholder="Nouvelle rubrique…"
                style={{ width:"100%",padding:"8px 10px",borderRadius:8,border:`1.5px solid ${C.iceBlue}`,fontSize:12,color:C.navy,fontFamily:"'Inter',sans-serif",outline:"none",boxSizing:"border-box",marginBottom:8 }}/>
              <button onClick={addCritere} disabled={addingCrit||!newCrit.trim()}
                style={{ width:"100%",padding:"8px",borderRadius:8,border:"none",background:newCrit.trim()?`linear-gradient(135deg,${C.navy},${C.blue})`:C.textMuted,color:"#fff",fontSize:12,fontWeight:700,cursor:newCrit.trim()?"pointer":"not-allowed",fontFamily:"'Inter',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
                {addingCrit?<Loader2 size={12} style={{animation:"spin 1s linear infinite"}}/>:<Plus size={12}/>} Ajouter
              </button>
            </div>
          </div>

          {/* Colonne apprenants */}
          <div>
            {!draft && (
              <button onClick={openDraft} disabled={criteres.length===0}
                style={{ width:"100%",marginBottom:16,padding:"14px",borderRadius:14,border:`2px dashed ${criteres.length>0?C.blue:C.iceBlue}`,background:criteres.length>0?`${C.blue}06`:"transparent",color:criteres.length>0?C.blue:C.textMuted,fontSize:13,fontWeight:700,cursor:criteres.length>0?"pointer":"not-allowed",fontFamily:"'Inter',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all .15s" }}
                onMouseEnter={e=>{ if(criteres.length>0){e.currentTarget.style.background=`${C.blue}12`;e.currentTarget.style.borderStyle="solid";}}}
                onMouseLeave={e=>{ e.currentTarget.style.background=criteres.length>0?`${C.blue}06`:"transparent";e.currentTarget.style.borderStyle="dashed";}}>
                <Plus size={16}/> {criteres.length===0?"Ajoutez d'abord des rubriques":"Saisir l'évaluation d'un apprenant"}
              </button>
            )}

            {draft && (
              <div style={{ background:C.surface,borderRadius:18,border:`2px solid ${C.blue}`,marginBottom:16,overflow:"hidden",boxShadow:`0 4px 24px ${C.shadow}` }}>
                <div style={{ padding:"16px 20px",borderBottom:"1px solid #EEF2FF",background:`${C.blue}06`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:10,flex:1,flexWrap:"wrap" }}>
                    <input autoFocus value={draftNom} onChange={e=>setDraftNom(e.target.value)} placeholder="Nom de l'apprenant *"
                      style={{ padding:"9px 14px",borderRadius:10,border:`1.5px solid ${C.iceBlue}`,fontSize:13,fontWeight:700,color:C.navy,fontFamily:"'Inter',sans-serif",outline:"none",width:"min(200px,100%)",minWidth:0,flex:1 }}/>
                    <input value={draftEmail} onChange={e=>setDraftEmail(e.target.value)} placeholder="Email (optionnel)"
                      style={{ padding:"9px 14px",borderRadius:10,border:`1.5px solid ${C.iceBlue}`,fontSize:13,color:C.navy,fontFamily:"'Inter',sans-serif",outline:"none",width:"min(190px,100%)",minWidth:0,flex:1 }}/>
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
                              style={{ flex:1,padding:"9px 6px",borderRadius:10,border:`2px solid ${sel?nc.text:C.iceBlue}`,background:sel?nc.bg:"#FAFBFF",color:sel?nc.text:C.textMuted,fontSize:11,fontWeight:sel?800:600,cursor:"pointer",fontFamily:"'Inter',sans-serif",transition:"all .12s",textAlign:"center",boxShadow:sel?`0 2px 8px ${nc.text}25`:"none" }}>
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

                <div style={{ padding:"14px 20px",borderTop:"1px solid #EEF2FF",background:"#FAFBFF" }}>
                  <label style={{ fontSize:11,fontWeight:700,color:C.textSub,display:"flex",alignItems:"center",gap:6,marginBottom:7 }}>
                    <span style={{ width:18,height:18,borderRadius:5,background:`${C.purple}18`,display:"inline-flex",alignItems:"center",justifyContent:"center" }}>
                      <FileText size={10} color={C.purple}/>
                    </span>
                    Commentaire (optionnel)
                  </label>
                  <textarea value={draftComment} onChange={e=>setDraftComment(e.target.value)}
                    placeholder="Observations sur l'apprenant…" rows={2}
                    style={{ width:"100%",padding:"9px 12px",borderRadius:10,border:`1.5px solid ${C.iceBlue}`,fontSize:12,color:C.navy,fontFamily:"'Inter',sans-serif",outline:"none",resize:"vertical",boxSizing:"border-box",background:"#fff",lineHeight:1.5 }}/>
                </div>

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
                    style={{ display:"flex",alignItems:"center",gap:8,padding:"11px 22px",borderRadius:12,border:"none",background:draftNom.trim()&&!savingDraft?`linear-gradient(135deg,${C.navy},${C.blue})`:C.textMuted,color:"#fff",fontSize:13,fontWeight:800,cursor:draftNom.trim()&&!savingDraft?"pointer":"not-allowed",fontFamily:"'Inter',sans-serif" }}>
                    {savingDraft?<><Loader2 size={14} style={{animation:"spin 1s linear infinite"}}/> Enregistrement…</>:<><CheckCircle2 size={14}/> Enregistrer</>}
                  </button>
                </div>
              </div>
            )}

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
                        <div style={{ padding:"14px 18px",background:`${C.blue}05`,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" }}>
                          <input autoFocus value={editAppVal.nom} onChange={e=>setEditAppVal(p=>({...p,nom:e.target.value}))}
                            onKeyDown={e=>{ if(e.key==="Enter") saveEditApp(a.id); if(e.key==="Escape") cancelEditApp(); }}
                            placeholder="Nom *"
                            style={{ padding:"8px 12px",borderRadius:9,border:`1.5px solid ${C.blue}`,fontSize:13,fontWeight:700,color:C.navy,fontFamily:"'Inter',sans-serif",outline:"none",width:180 }}/>
                          <input value={editAppVal.email} onChange={e=>setEditAppVal(p=>({...p,email:e.target.value}))}
                            placeholder="Email"
                            style={{ padding:"8px 12px",borderRadius:9,border:`1.5px solid ${C.iceBlue}`,fontSize:13,color:C.navy,fontFamily:"'Inter',sans-serif",outline:"none",width:180 }}/>
                          <div style={{ display:"flex",gap:8,marginLeft:"auto" }}>
                            <button onClick={()=>saveEditApp(a.id)} disabled={savingApp===a.id||!editAppVal.nom.trim()}
                              style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:9,border:"none",background:editAppVal.nom.trim()?C.blue:C.textMuted,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif" }}>
                              {savingApp===a.id?<Loader2 size={12} style={{animation:"spin 1s linear infinite"}}/>:<CheckCircle2 size={12}/>} Sauvegarder
                            </button>
                            <button onClick={cancelEditApp}
                              style={{ padding:"8px 14px",borderRadius:9,border:`1.5px solid ${C.iceBlue}`,background:C.surfaceAlt,color:C.textSub,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif" }}>
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ padding:"14px 18px",display:"flex",alignItems:"center",gap:14 }}>
                          <div style={{ width:40,height:40,borderRadius:12,background:`${C.blue}14`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                            <span style={{ fontSize:14,fontWeight:800,color:C.blue }}>
                              {a.nom.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase()}
                            </span>
                          </div>
                          <div style={{ flex:1,minWidth:0 }}>
                            <p style={{ fontSize:14,fontWeight:800,color:C.navy }}>{a.nom}</p>
                            <p style={{ fontSize:11,color:C.textMuted,marginTop:1 }}>
                              {total}/{maxPts} pts · {filled}/{criteres.length} rubriques
                              {a.email&&<> · {a.email}</>}
                            </p>
                          </div>
                          <div style={{ display:"flex",alignItems:"center",gap:8,flexShrink:0 }}>
                            <div style={{ width:60,height:6,borderRadius:3,background:"#EEF2FF",overflow:"hidden" }}>
                              <div style={{ width:`${pct}%`,height:"100%",background:sc.text,borderRadius:3 }}/>
                            </div>
                            <span style={{ fontSize:13,fontWeight:800,padding:"4px 12px",borderRadius:20,background:sc.bg,color:sc.text,border:`1px solid ${sc.border}` }}>{pct}%</span>
                          </div>
                          <span style={{ fontSize:11,fontWeight:700,color:sc.text,minWidth:100,flexShrink:0 }}>{sc.label}</span>
                          <div style={{ display:"flex",gap:6,flexShrink:0 }}>
                            <button onClick={()=>startEditApp(a)} title="Modifier"
                              style={{ width:30,height:30,borderRadius:8,border:`1px solid ${C.iceBlue}`,background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}
                              onMouseEnter={e=>{e.currentTarget.style.background=`${C.blue}14`;e.currentTarget.style.borderColor=C.blue;}}
                              onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor=C.iceBlue;}}>
                              <Edit3 size={12} color={C.textSub}/>
                            </button>
                            <button onClick={()=>setConfirmDel({type:"app",id:a.id,nom:a.nom})} disabled={deletingApp===a.id} title="Supprimer"
                              style={{ width:30,height:30,borderRadius:8,border:"1px solid #FECDD3",background:"#FFF5F5",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}
                              onMouseEnter={e=>{e.currentTarget.style.background=C.danger;e.currentTarget.style.borderColor=C.danger;}}
                              onMouseLeave={e=>{e.currentTarget.style.background="#FFF5F5";e.currentTarget.style.borderColor="#FECDD3";}}>
                              {deletingApp===a.id?<Loader2 size={12} color={C.danger} style={{animation:"spin 1s linear infinite"}}/>:<Trash2 size={12} color={C.danger}/>}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Commentaire inline */}
                      {editCommentApp===a.id ? (
                        <div style={{ padding:"10px 16px",borderTop:"1px solid #EEF2FF",background:"#FAFBFF" }}>
                          <textarea autoFocus value={editCommentVal} onChange={e=>setEditCommentVal(e.target.value)} rows={2}
                            placeholder="Commentaire sur l'apprenant…"
                            style={{ width:"100%",padding:"8px 11px",borderRadius:9,border:`1.5px solid ${C.blue}`,fontSize:12,color:C.navy,fontFamily:"'Inter',sans-serif",outline:"none",resize:"vertical",boxSizing:"border-box",background:"#fff" }}/>
                          <div style={{ display:"flex",gap:8,marginTop:8 }}>
                            <button onClick={()=>saveComment(a.id)} disabled={savingComment===a.id}
                              style={{ display:"flex",alignItems:"center",gap:5,padding:"6px 14px",borderRadius:8,border:"none",background:C.blue,color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif" }}>
                              {savingComment===a.id?<Loader2 size={11} style={{animation:"spin 1s linear infinite"}}/>:<CheckCircle2 size={11}/>} Sauvegarder
                            </button>
                            <button onClick={cancelEditComment}
                              style={{ padding:"6px 12px",borderRadius:8,border:`1px solid ${C.iceBlue}`,background:C.surfaceAlt,color:C.textSub,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif" }}>
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ padding:"8px 14px 10px",borderTop:"1px solid #F5F7FF",display:"flex",alignItems:"flex-start",gap:8,flexWrap:"wrap" }}>
                          {a.commentaire ? (
                            <div style={{ flex:1,display:"flex",flexDirection:"column",gap:7 }}>
                              <div style={{ display:"flex",alignItems:"flex-start",gap:8 }}>
                                <p style={{ flex:1,fontSize:11,color:C.textSub,lineHeight:1.5,fontStyle:"italic" }}>"{a.commentaire}"</p>
                                <div style={{ display:"flex",gap:4,flexShrink:0 }}>
                                  <button onClick={()=>startEditComment(a)} title="Modifier"
                                    style={{ width:22,height:22,borderRadius:6,border:`1px solid ${C.iceBlue}`,background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}
                                    onMouseEnter={e=>{e.currentTarget.style.background=`${C.blue}14`;e.currentTarget.style.borderColor=C.blue;}}
                                    onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor=C.iceBlue;}}>
                                    <Edit3 size={9} color={C.textSub}/>
                                  </button>
                                  <button onClick={()=>deleteComment(a.id)} disabled={savingComment===a.id} title="Supprimer"
                                    style={{ width:22,height:22,borderRadius:6,border:"1px solid #FECDD3",background:"#FFF5F5",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}
                                    onMouseEnter={e=>{e.currentTarget.style.background="#FECDD3";}}
                                    onMouseLeave={e=>{e.currentTarget.style.background="#FFF5F5";}}>
                                    {savingComment===a.id?<Loader2 size={9} color={C.danger} style={{animation:"spin 1s linear infinite"}}/>:<Trash2 size={9} color={C.danger}/>}
                                  </button>
                                </div>
                              </div>
                              <button onClick={()=>setIncluirePdf(p=>({...p,[a.id]:!p[a.id]}))}
                                style={{ display:"flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:20,border:`1.5px solid ${incluirePdf[a.id]?C.success:"#FECDD3"}`,background:incluirePdf[a.id]?"#F0FDF4":"#FFF5F5",color:incluirePdf[a.id]?C.success:C.danger,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif",width:"fit-content" }}>
                                {incluirePdf[a.id]?<><CheckCircle2 size={10}/> Inclus dans le PDF</>:<><X size={10}/> Exclu du PDF</>}
                              </button>
                            </div>
                          ) : (
                            <button onClick={()=>startEditComment(a)}
                              style={{ display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:7,border:`1px dashed ${C.iceBlue}`,background:"transparent",color:C.textMuted,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif" }}
                              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.purple;e.currentTarget.style.color=C.purple;e.currentTarget.style.background=`${C.purple}08`;}}
                              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.iceBlue;e.currentTarget.style.color=C.textMuted;e.currentTarget.style.background="transparent";}}>
                              <FileText size={10}/> Ajouter un commentaire
                            </button>
                          )}
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

      {/* ════ ONGLET RÉSULTATS ════ */}
      {tab==="resultats" && (
        <div>
          {localResults.length>0 && (
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12,marginBottom:20 }}>
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

          {graphData && <GraphDashboard graphData={graphData}/>}

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

          {/* Commentaire final */}
          <div style={{ marginTop:16,background:C.surface,border:`1.5px solid ${editingFinal||commentFinal?C.purple:C.iceBlue}`,borderRadius:18,overflow:"hidden" }}>
            <div style={{ padding:"14px 20px",borderBottom:"1px solid #EEF2FF",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10 }}>
              <div>
                <SH icon={FileText} title="Commentaire final du responsable" color={C.purple}/>
                <p style={{ fontSize:11,color:C.textMuted,marginTop:5,marginLeft:37 }}>Ce texte sera imprimé en bas du rapport PDF.</p>
              </div>
              {commentFinal && !editingFinal && (
                <div style={{ display:"flex",gap:7 }}>
                  <button onClick={openEditFinal}
                    style={{ display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:9,border:`1.5px solid ${C.purple}22`,background:`${C.purple}08`,color:C.purple,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif" }}>
                    <Edit3 size={10}/> Modifier
                  </button>
                  <button onClick={deleteCommentFinal} disabled={savingFinal}
                    style={{ display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:9,border:"1.5px solid #FECDD3",background:"#FFF5F5",color:C.danger,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif" }}>
                    <Trash2 size={10}/> Supprimer
                  </button>
                </div>
              )}
            </div>
            <div style={{ padding:"18px 20px" }}>
              {editingFinal ? (
                <div>
                  <textarea autoFocus value={editFinalVal} onChange={e=>setEditFinalVal(e.target.value)} rows={5}
                    placeholder="Rédigez ici le commentaire final…"
                    style={{ width:"100%",padding:"12px 14px",borderRadius:12,border:`1.5px solid ${C.purple}`,fontSize:13,color:C.navy,fontFamily:"'Inter',sans-serif",outline:"none",resize:"vertical",boxSizing:"border-box",lineHeight:1.7 }}/>
                  <div style={{ display:"flex",gap:10,marginTop:12,flexWrap:"wrap" }}>
                    <button onClick={saveCommentFinal} disabled={savingFinal}
                      style={{ display:"flex",alignItems:"center",gap:7,padding:"10px 22px",borderRadius:10,border:"none",background:`linear-gradient(135deg,${C.purple},#9F5AED)`,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif" }}>
                      {savingFinal?<Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/>:<CheckCircle2 size={13}/>} Enregistrer
                    </button>
                    <button onClick={cancelEditFinal}
                      style={{ padding:"10px 16px",borderRadius:10,border:`1.5px solid ${C.iceBlue}`,background:C.surfaceAlt,color:C.textSub,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif" }}>
                      Annuler
                    </button>
                  </div>
                </div>
              ) : commentFinal ? (
                <div style={{ padding:"14px 18px",borderRadius:12,background:`${C.purple}07`,border:`1px solid ${C.purple}25` }}>
                  <p style={{ fontSize:13,color:C.navy,lineHeight:1.8,whiteSpace:"pre-wrap" }}>{commentFinal}</p>
                </div>
              ) : (
                <div>
                  <textarea value={editFinalVal} onChange={e=>setEditFinalVal(e.target.value)} onFocus={()=>setEditingFinal(true)} rows={4}
                    placeholder="Rédigez ici le commentaire final du responsable…"
                    style={{ width:"100%",padding:"12px 14px",borderRadius:12,border:`1.5px dashed ${C.purple}50`,fontSize:13,color:C.navy,fontFamily:"'Inter',sans-serif",outline:"none",resize:"vertical",boxSizing:"border-box",lineHeight:1.7,background:`${C.purple}04`,cursor:"text" }}/>
                  <p style={{ fontSize:10,color:C.textMuted,marginTop:6 }}>Cliquez dans le champ pour commencer à rédiger.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   HELPERS CHART.JS (identiques à l'original)
══════════════════════════════════════════════════════ */
const PDF_COLORS = { navy:"#0D1B5E", blue:"#1A3BD4", green:"#0BA376", orange:"#F5A800", red:"#E53935" };
const pdfSc = p => p>=75 ? PDF_COLORS.green : p>=50 ? PDF_COLORS.orange : PDF_COLORS.red;

function buildBarsData(gd) {
  if (!gd) return { labels:[], datasets:[] };
  const sorted = [...(gd.scores||[])].sort((a,b)=>b.pourcentage-a.pourcentage);
  return { labels:sorted.map(d=>d.apprenant), datasets:[{ label:"Score (%)", data:sorted.map(d=>Math.round(d.pourcentage)), backgroundColor:sorted.map(d=>pdfSc(d.pourcentage)+"CC"), borderColor:sorted.map(d=>pdfSc(d.pourcentage)), borderWidth:1.5, borderRadius:5, borderSkipped:false }] };
}
function buildBarsOpts(nbItems=8) {
  return { indexAxis:"y", responsive:false, animation:{ duration:0 }, plugins:{ legend:{ display:false }, title:{ display:true, text:"Scores par apprenant (%)", font:{ size:14, weight:"bold" }, color:"#0D1B5E", padding:{ bottom:12 } } }, scales:{ x:{ min:0, max:100, ticks:{ callback:v=>`${v}%`, font:{ size:10 }, color:"#4A5A8A" }, grid:{ color:"#EEF2FF" }, border:{ display:false } }, y:{ ticks:{ font:{ size:11, weight:"bold" }, color:"#0D1B5E" }, grid:{ display:false }, border:{ display:false } } }, layout:{ padding:{ left:8, right:20, top:4, bottom:8 } } };
}
function buildCritBarsData(gd) {
  if (!gd) return { labels:[], datasets:[] };
  const cd = gd.critere_data||[];
  return { labels:cd.map(c=>c.nom), datasets:[{ label:"Score (%)", data:cd.map(c=>Math.round(c.pourcentage)), backgroundColor:cd.map(c=>pdfSc(c.pourcentage)+"CC"), borderColor:cd.map(c=>pdfSc(c.pourcentage)), borderWidth:1.5, borderRadius:{ topLeft:5, topRight:5 } }] };
}
function buildCritBarsOpts() {
  return { responsive:false, animation:{ duration:0 }, plugins:{ legend:{ display:false }, title:{ display:true, text:"Résultats par rubrique (%)", font:{ size:14, weight:"bold" }, color:"#0D1B5E", padding:{ bottom:12 } } }, scales:{ y:{ min:0, max:100, ticks:{ callback:v=>`${v}%`, font:{ size:10 }, color:"#4A5A8A" }, grid:{ color:"#EEF2FF" }, border:{ display:false } }, x:{ ticks:{ font:{ size:9 }, color:"#0D1B5E", maxRotation:40 }, grid:{ display:false }, border:{ display:false } } }, layout:{ padding:{ left:8, right:8, top:4, bottom:8 } } };
}
function buildPieData(gd) {
  if (!gd) return { labels:[], datasets:[] };
  const nc = gd.notes_counter||{};
  return { labels:["Pas satisfait (25 pts)","Satisfait (50 pts)","Très satisfait (75 pts)"], datasets:[{ data:[nc[1]||0, nc[2]||0, nc[3]||0], backgroundColor:["#E53935CC","#F5A800CC","#0BA376CC"], borderColor:["#ffffff","#ffffff","#ffffff"], borderWidth:3, hoverOffset:6 }] };
}
function buildPieOpts() {
  return { responsive:false, animation:{ duration:0 }, cutout:"55%", plugins:{ legend:{ position:"right", labels:{ font:{ size:11 }, padding:16, usePointStyle:true, color:"#0D1B5E" } }, title:{ display:true, text:"Répartition des niveaux de satisfaction", font:{ size:14, weight:"bold" }, color:"#0D1B5E", padding:{ bottom:12 } } }, layout:{ padding:{ top:4, bottom:8, left:8, right:8 } } };
}

async function generateChartBase64(type, data, options, w=800, h=380) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
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

function GraphDashboard({ graphData }) {
  const [tab, setTab] = useState("bars");
  if (!graphData) return null;
  const { scores=[], notes_counter={}, critere_data=[] } = graphData;
  const sc = p => p>=75 ? C.success : p>=50 ? C.accent : C.danger;
  const sorted = [...scores].sort((a,b) => b.pourcentage - a.pourcentage);
  const globalAvg = sorted.length ? Math.round(sorted.reduce((s,d)=>s+d.pourcentage,0)/sorted.length) : 0;

  const tabs = [
    { id:"bars", label:"Scores apprenants", icon:BarChart3 },
    { id:"pie",  label:"Satisfaction",      icon:PieChart  },
    { id:"crit", label:"Par rubrique",      icon:Star      },
  ];

  const barsData = { labels:sorted.map(d=>d.apprenant), datasets:[{ label:"Score (%)", data:sorted.map(d=>Math.round(d.pourcentage)), backgroundColor:sorted.map(d=>sc(d.pourcentage)+"BB"), borderColor:sorted.map(d=>sc(d.pourcentage)), borderWidth:1.5, borderRadius:6, borderSkipped:false }] };
  const barsOpts = { indexAxis:"y", responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } }, scales:{ x:{ min:0, max:100, ticks:{ callback:v=>`${v}%`, font:{ size:10 } }, grid:{ color:"#EEF2FF" } }, y:{ ticks:{ font:{ size:11, weight:"bold" } }, grid:{ display:false } } } };

  const cntPas=notes_counter[1]||0, cntSat=notes_counter[2]||0, cntTres=notes_counter[3]||0;
  const totalNotes=cntPas+cntSat+cntTres;
  const pieData = { labels:["Pas satisfait","Satisfait","Très satisfait"], datasets:[{ data:[cntPas,cntSat,cntTres], backgroundColor:[C.danger+"BB",C.accent+"BB",C.success+"BB"], borderColor:[C.danger,C.accent,C.success], borderWidth:2, hoverOffset:8 }] };
  const pieOpts = { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:"bottom", labels:{ font:{ size:11 }, padding:14, usePointStyle:true } } } };

  const critData = { labels:critere_data.map(c=>c.nom), datasets:[{ label:"Score (%)", data:critere_data.map(c=>c.pourcentage), backgroundColor:critere_data.map(c=>sc(c.pourcentage)+"BB"), borderColor:critere_data.map(c=>sc(c.pourcentage)), borderWidth:1.5, borderRadius:6 }] };
  const critOpts = { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } }, scales:{ y:{ min:0, max:100, ticks:{ callback:v=>`${v}%`, font:{ size:10 } }, grid:{ color:"#EEF2FF" } }, x:{ ticks:{ font:{ size:10 }, maxRotation:35 }, grid:{ display:false } } } };

  const barsH = Math.max(200, sorted.length * 44 + 50);

  return (
    <div style={{ background:C.surface,border:"1.5px solid #EEF2FF",borderRadius:18,overflow:"hidden",marginBottom:16 }}>
      <div style={{ padding:"14px 20px",borderBottom:"1px solid #EEF2FF",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10 }}>
        <SH icon={BarChart3} title="Analyse graphique" color={C.purple}/>
        <span style={{ fontSize:15,fontWeight:800,padding:"3px 14px",borderRadius:20,background:sc(globalAvg)+"18",color:sc(globalAvg),border:`1px solid ${sc(globalAvg)}44` }}>{globalAvg}%</span>
      </div>
      <div style={{ display:"flex",borderBottom:"1px solid #EEF2FF" }}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"11px 8px",border:"none",borderBottom:tab===t.id?`2.5px solid ${C.blue}`:"2.5px solid transparent",background:tab===t.id?`${C.blue}08`:"transparent",color:tab===t.id?C.blue:C.textMuted,fontSize:12,fontWeight:tab===t.id?800:600,cursor:"pointer",fontFamily:"'Inter',sans-serif" }}>
            <t.icon size={12}/>{t.label}
          </button>
        ))}
      </div>
      <div style={{ padding:"20px 24px" }}>
        {tab==="bars" && <div style={{ height:barsH }}><ChartCanvas type="bar" data={barsData} options={barsOpts} height={barsH}/></div>}
        {tab==="pie" && (
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,alignItems:"center" }}>
            <div style={{ height:240 }}><ChartCanvas type="doughnut" data={pieData} options={pieOpts} height={240}/></div>
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              {[{n:cntTres,label:"Très satisfait",note:"75 pts",color:C.success},{n:cntSat,label:"Satisfait",note:"50 pts",color:C.accent},{n:cntPas,label:"Pas satisfait",note:"25 pts",color:C.danger}].map(x=>(
                <div key={x.label} style={{ padding:"10px 14px",borderRadius:12,background:`${x.color}10`,border:`1.5px solid ${x.color}30`,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                  <div><p style={{ fontSize:13,fontWeight:800,color:x.color }}>{x.label}</p><p style={{ fontSize:10,color:C.textMuted,marginTop:2 }}>{x.note}</p></div>
                  <div style={{ textAlign:"right" }}>
                    <p style={{ fontSize:22,fontWeight:800,color:x.color,lineHeight:1 }}>{x.n}</p>
                    <p style={{ fontSize:10,color:C.textMuted }}>{totalNotes>0?Math.round(x.n/totalNotes*100):0}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab==="crit" && (
          <div>
            {critere_data.length===0 ? <p style={{color:C.textMuted,fontSize:13,textAlign:"center",padding:"20px 0"}}>Aucune rubrique.</p> : (
              <>
                <div style={{ height:240, marginBottom:16 }}><ChartCanvas type="bar" data={critData} options={critOpts} height={240}/></div>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:8 }}>
                  {[...critere_data].sort((a,b)=>b.pourcentage-a.pourcentage).map((c,i)=>(
                    <div key={i} style={{ padding:"10px 12px",borderRadius:12,background:`${sc(c.pourcentage)}10`,border:`1px solid ${sc(c.pourcentage)}30` }}>
                      <p style={{ fontSize:11,fontWeight:700,color:C.navy,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{c.nom}</p>
                      <p style={{ fontSize:18,fontWeight:800,color:sc(c.pourcentage),lineHeight:1 }}>{c.pourcentage}%</p>
                      <p style={{ fontSize:10,color:C.textMuted,marginTop:2 }}>{c.total} pts</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* Composants utilitaires */
const Spin = ()=><div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:160,gap:10,color:C.textMuted }}><RefreshCw size={18} style={{animation:"spin 1s linear infinite"}}/> Chargement…</div>;
const Err = ({msg,inline})=><div style={{ ...(inline?{marginBottom:14}:{margin:16}),background:"#FFF1F2",border:"1.5px solid #FECDD3",borderRadius:12,padding:"11px 16px",display:"flex",gap:10,alignItems:"center" }}><AlertTriangle size={14} color={C.danger}/><p style={{ fontSize:12,color:C.danger,fontWeight:600 }}>{msg}</p></div>;
const Empty = ({label})=><div style={{ textAlign:"center",padding:"44px 20px",color:C.textMuted }}><ClipboardList size={34} style={{ margin:"0 auto 10px",opacity:.2,display:"block" }}/><p style={{ fontWeight:700,fontSize:13 }}>{label}</p></div>;
const Yay = ({label})=><div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:260,gap:14,animation:"fadeUp .3s ease" }}><div style={{ width:56,height:56,borderRadius:16,background:"#F0FDF4",display:"flex",alignItems:"center",justifyContent:"center" }}><CheckCircle2 size={26} color={C.success}/></div><p style={{ fontSize:16,fontWeight:800,color:C.navy }}>{label}</p></div>;
const Btn = ({onClick,icon:I,label})=><button onClick={onClick} style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 18px",borderRadius:12,border:"none",background:`linear-gradient(135deg,${C.navy},${C.blue})`,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:`0 4px 16px ${C.shadow}`,fontFamily:"'Inter',sans-serif",whiteSpace:"nowrap" }}><I size={14}/>{label}</button>;
const EBtn = ({icon:I,label,color,loading,onClick,active})=><button onClick={onClick} disabled={loading} style={{ display:"flex",alignItems:"center",gap:7,padding:"9px 16px",borderRadius:10,border:`1.5px solid ${active?color:C.iceBlue}`,background:active?`${color}10`:C.surfaceAlt,color:active?color:C.textSub,fontSize:12,fontWeight:700,cursor:loading?"not-allowed":"pointer",fontFamily:"'Inter',sans-serif",transition:"all .15s" }} onMouseEnter={e=>{if(!loading){e.currentTarget.style.background=`${color}15`;e.currentTarget.style.borderColor=color;e.currentTarget.style.color=color;}}} onMouseLeave={e=>{if(!loading){e.currentTarget.style.background=active?`${color}10`:C.surfaceAlt;e.currentTarget.style.borderColor=active?color:C.iceBlue;e.currentTarget.style.color=active?color:C.textSub;}}}>{loading?<Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/>:<I size={13}/>} {label}</button>;
const PH = ({onBack,title,sub,icon:I})=><div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:24 }}><button type="button" onClick={onBack} style={{ width:38,height:38,borderRadius:10,background:C.surfaceAlt,border:`1.5px solid ${C.iceBlue}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0 }}><ArrowLeft size={15} color={C.textSub}/></button><div style={{ flex:1 }}><h1 style={{ fontSize:20,fontWeight:800,color:C.navy,lineHeight:1 }}>{title}</h1>{sub&&<p style={{ fontSize:12,color:C.textMuted,marginTop:4 }}>{sub}</p>}</div><div style={{ width:42,height:42,borderRadius:12,background:`linear-gradient(135deg,${C.navy},${C.blue})`,display:"flex",alignItems:"center",justifyContent:"center" }}><I size={20} color="#fff"/></div></div>;
const SH = ({icon:I,title,color})=><div style={{ display:"flex",alignItems:"center",gap:8 }}><div style={{ width:3,height:18,borderRadius:2,background:color }}/><div style={{ width:26,height:26,borderRadius:8,background:`${color}14`,display:"flex",alignItems:"center",justifyContent:"center" }}><I size={13} color={color}/></div><p style={{ fontSize:13,fontWeight:800,color:C.navy }}>{title}</p></div>;
const M = ({icon:I,t})=><span style={{ fontSize:11,color:C.textMuted,display:"flex",alignItems:"center",gap:4 }}><I size={10}/>{t}</span>;
const L = ({t,req})=><label style={{ display:"block",fontSize:12,fontWeight:700,color:C.textSub,marginBottom:6 }}>{t}{req&&<span style={{color:C.danger}}> *</span>}</label>;
const SBar = ({value,set,ph})=><div style={{ position:"relative",marginBottom:18 }}><Search size={14} color={C.textMuted} style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }}/><input value={value} onChange={e=>set(e.target.value)} placeholder={ph} style={{ width:"100%",padding:"11px 14px 11px 38px",borderRadius:12,border:`1.5px solid ${C.iceBlue}`,background:C.surface,fontSize:13,color:C.navy,fontFamily:"'Inter',sans-serif",outline:"none",boxSizing:"border-box" }}/>{value&&<button onClick={()=>set("")} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer" }}><X size={14} color={C.textMuted}/></button>}</div>;