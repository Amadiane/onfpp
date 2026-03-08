import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import CONFIG from "../../config/config.js";
import {
  GraduationCap, Users, Search, ChevronLeft, ChevronRight,
  Calendar, RefreshCw, Loader2, MapPinned, ClipboardList,
  Eye, X, BookOpen, User, ArrowUpRight, Grid3X3, List,
  MapPin, Sparkles,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   PALETTE — identique DashboardAdmin
═══════════════════════════════════════════════════════════════════ */
const C = {
  page:"#F8F9FD",pageAlt:"#EEF2FF",surface:"#FFFFFF",surfaceEl:"#F4F7FF",
  navy:"#06102A",navyMid:"#0C1D5F",blue:"#1635C8",blueViv:"#2447E0",
  iceBlue:"#D0D9FF",textPri:"#06102A",textSub:"#3A4F8C",textMuted:"#8497C8",
  gold:"#D4920A",goldLight:"#F5B020",goldPale:"#FFF8E7",
  green:"#047A5A",greenLight:"#0DA575",greenPale:"#E8FBF5",
  danger:"#C81B1B",dangerPale:"#FEF2F2",
  divider:"#E8EDFC",shadow:"rgba(6,16,42,0.08)",
  shadowMd:"rgba(6,16,42,0.15)",shadowLg:"rgba(6,16,42,0.22)",
  dap:"#6B21A8",dapPale:"#F5F3FF",dfc:"#1635C8",dfcPale:"#EEF1FF",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700;800&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  .frm{font-family:'Outfit',sans-serif;-webkit-font-smoothing:antialiased;}
  .frm-serif{font-family:'Fraunces',serif!important;}
  .frm-page::before{content:'';position:fixed;inset:0;pointer-events:none;z-index:0;
    background-image:radial-gradient(circle at 1px 1px,rgba(22,53,200,.05) 1px,transparent 0);
    background-size:28px 28px;}
  .frm-btn{display:inline-flex;align-items:center;gap:7px;padding:10px 20px;border-radius:11px;
    cursor:pointer;font-family:'Outfit',sans-serif;font-size:12.5px;font-weight:700;
    transition:all .17s ease;border:none;}
  .frm-btn-pri{background:linear-gradient(135deg,#06102A,#1635C8);color:#fff;
    box-shadow:0 4px 18px rgba(22,53,200,.28);}
  .frm-btn-pri:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(22,53,200,.38);}
  .frm-btn-sec{background:#fff;color:#3A4F8C;border:1.5px solid #E8EDFC!important;}
  .frm-btn-sec:hover{background:#F4F7FF;border-color:#D0D9FF!important;}
  .frm-input{width:100%;padding:10px 14px;border-radius:11px;border:1.5px solid #E8EDFC;
    background:#fff;color:#06102A;font-family:'Outfit',sans-serif;font-size:13px;
    outline:none;transition:border-color .16s,box-shadow .16s;}
  .frm-input:focus{border-color:#1635C8;box-shadow:0 0 0 3px rgba(22,53,200,.1);}
  .frm-input::placeholder{color:#8497C8;}
  .frm-card{background:#fff;border-radius:20px;border:1px solid #E8EDFC;
    box-shadow:0 2px 16px rgba(6,16,42,.07);
    transition:transform .24s cubic-bezier(.34,1.4,.64,1),box-shadow .24s ease;}
  .frm-card:hover{transform:translateY(-6px) scale(1.008);
    box-shadow:0 24px 56px rgba(6,16,42,.14);border-color:#D0D9FF;}
  .frm-tr{transition:background .12s;cursor:pointer;}
  .frm-tr:hover{background:#F4F7FF!important;}
  .frm-badge{display:inline-flex;align-items:center;gap:5px;border-radius:20px;
    padding:3px 10px;font-size:10.5px;font-weight:700;font-family:'Outfit',sans-serif;}
  .frm-dap{background:${C.dapPale};color:${C.dap};border:1px solid ${C.dap}30;}
  .frm-dfc{background:${C.dfcPale};color:${C.dfc};border:1px solid ${C.dfc}30;}
  .frm-pill{padding:7px 18px;border-radius:24px;cursor:pointer;
    font-family:'Outfit',sans-serif;font-size:12px;font-weight:700;
    border:1.5px solid transparent;transition:all .15s;
    display:inline-flex;align-items:center;gap:6px;}
  .frm-pg{width:34px;height:34px;border-radius:9px;border:1px solid #E8EDFC;
    display:flex;align-items:center;justify-content:center;cursor:pointer;
    font-family:'Outfit',sans-serif;font-size:12px;font-weight:600;
    background:#fff;color:#3A4F8C;transition:all .14s;}
  .frm-pg:hover{background:#F4F7FF;border-color:#D0D9FF;}
  .frm-pg.active{background:#06102A;color:#fff;border-color:#06102A;}
  .frm-pg:disabled{opacity:.4;cursor:not-allowed;}
  .frm-detail-row{display:flex;align-items:flex-start;gap:10px;
    padding:11px 0;border-bottom:1px solid #E8EDFC;}
  .frm-detail-row:last-child{border-bottom:none;}
  .frm-detail-label{font-size:10.5px;font-weight:800;color:#8497C8;
    text-transform:uppercase;letter-spacing:.07em;min-width:145px;flex-shrink:0;padding-top:2px;}
  .frm-detail-val{font-size:13px;color:#06102A;font-weight:500;line-height:1.5;}
  @keyframes frmUp{from{opacity:0;transform:translateY(22px) scale(.982);}
    to{opacity:1;transform:translateY(0) scale(1);}}
  .frm-in{animation:frmUp .48s cubic-bezier(.22,1,.36,1) both;}
  .frm-d0{animation-delay:.00s;}.frm-d1{animation-delay:.08s;}
  .frm-d2{animation-delay:.16s;}.frm-d3{animation-delay:.24s;}
  .frm-d4{animation-delay:.32s;}
  @keyframes frmModal{from{opacity:0;transform:scale(.93) translateY(-20px);}
    to{opacity:1;transform:scale(1) translateY(0);}}
  .frm-modal{animation:frmModal .26s cubic-bezier(.22,1,.36,1) both;}
  @keyframes frmSpin{to{transform:rotate(360deg);}}
  .frm-spin{animation:frmSpin .75s linear infinite;display:inline-block;}
  @keyframes frmBar{from{width:0}to{width:var(--bw)}}
  .frm-bar{animation:frmBar 1s cubic-bezier(.22,1,.36,1) both;}
  @keyframes frmAurora{0%,100%{opacity:.5;transform:scale(1);}50%{opacity:.7;transform:scale(1.07) translateX(15px);}}
  .frm-aurora{animation:frmAurora 10s ease-in-out infinite;}
  .frm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:16px;}
  @media(max-width:900px){.frm-grid{grid-template-columns:1fr 1fr!important;}
    .frm-hide-sm{display:none!important;}}
  @media(max-width:600px){.frm-grid{grid-template-columns:1fr!important;}
    .frm{padding:80px 14px 52px!important;}}
`;

/* ── Helpers ── */
const ANTENNES_LIST = [
  {v:"conakry",l:"Conakry",code:"CKY"},{v:"forecariah",l:"Forecariah",code:"FRC"},
  {v:"boke",l:"Boké",code:"BOK"},{v:"kindia",l:"Kindia",code:"KND"},
  {v:"labe",l:"Labé",code:"LBE"},{v:"mamou",l:"Mamou",code:"MMU"},
  {v:"faranah",l:"Faranah",code:"FRN"},{v:"kankan",l:"Kankan",code:"KNK"},
  {v:"siguiri",l:"Siguiri",code:"SGR"},{v:"nzerekore",l:"N'Zérékoré",code:"NZR"},
];
const ANTENNE_LABEL = v => ANTENNES_LIST.find(a=>a.v===v)?.l||v;
const ANTENNE_CODE  = v => ANTENNES_LIST.find(a=>a.v===v)?.code||"GN";
const getDivCfg = type => type==="apprentissage"
  ? {label:"DAP",cls:"frm-dap",color:C.dap, bg:C.dapPale,desc:"Direction Apprentissage Professionnel"}
  : type==="continue"
  ? {label:"DFC",cls:"frm-dfc",color:C.dfc, bg:C.dfcPale,desc:"Direction Formation Continue"}
  : null;
const PAGE_SIZE = 12;
const authHeader = () => {
  const t = localStorage.getItem("access")||localStorage.getItem("access_token")||localStorage.getItem("token");
  return {"Content-Type":"application/json",...(t?{Authorization:`Bearer ${t}`}:{})};
};
const buildFrmId = (f,idx) => {
  const div = f.type_formation==="apprentissage"?"DAP":"DFC";
  const year = f.date_debut?new Date(f.date_debut).getFullYear():new Date().getFullYear();
  return `ONFPP-${div}-${ANTENNE_CODE(f.antenne)}-${year}-${String((idx||0)+1).padStart(3,"0")}`;
};
const fmtD  = d => d?new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"2-digit"}):"—";
const fmtDL = d => d?new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"}):"—";

/* ── Tricolore ── */
const Tri = ({h=4,r=0}) => (
  <div style={{height:h,display:"flex",borderRadius:r,overflow:"hidden"}}>
    <div style={{flex:1,background:"#E02020"}}/><div style={{flex:1,background:C.gold}}/><div style={{flex:1,background:C.green}}/>
  </div>
);

const DivBadge = ({type}) => {
  const c=getDivCfg(type);
  if(!c) return <span style={{fontSize:11,color:C.textMuted}}>—</span>;
  return <span className={`frm-badge ${c.cls}`} title={c.desc}>{c.label}</span>;
};

const StatutBadge = ({statut}) => {
  const m={en_attente:{l:"En attente",bg:`${C.gold}15`,c:C.gold},valide:{l:"Validé",bg:C.greenPale,c:C.green},rejete:{l:"Rejeté",bg:C.dangerPale,c:C.danger}};
  const s=m[statut]||m.en_attente;
  return <span className="frm-badge" style={{background:s.bg,color:s.c,border:`1px solid ${s.c}30`}}>{s.l}</span>;
};

/* ══════════════════════════════════════════════════════════════════
   MODAL DÉTAIL
   BUG FIX ✅ : l'API retourne { candidats:[...], nb_candidats, ... }
   On lit explicitement res.data.candidats
══════════════════════════════════════════════════════════════════ */
const FormationDetailModal = ({formation,formationId,onClose}) => {
  const [candidats,   setCandidats]   = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [activeTab,   setActiveTab]   = useState("info");

  useEffect(()=>{
    if(!formation?.id) return;
    setLoading(true);
    const API = CONFIG.API_FORMATIONS||"/api/formations/";
    axios.get(`${CONFIG.BASE_URL}${API}${formation.id}/candidats/`,{headers:authHeader()})
      .then(res=>{
        const d = res.data;
        // ✅ FIX : API retourne un objet enveloppé { candidats:[...] }
        if(Array.isArray(d))             setCandidats(d);
        else if(Array.isArray(d?.candidats)) setCandidats(d.candidats);
        else if(Array.isArray(d?.results))   setCandidats(d.results);
        else setCandidats([]);
      })
      .catch(()=>setCandidats([]))
      .finally(()=>setLoading(false));
  },[formation?.id]);

  const dc = getDivCfg(formation.type_formation);
  const tabs = [
    {id:"info",      label:"Informations",                               icon:ClipboardList},
    {id:"apprenants",label:`Apprenants (${loading?"…":candidats.length})`,icon:Users},
  ];

  return (
    <div style={{position:"fixed",inset:0,zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:"72px 16px 16px"}}>
      <div style={{position:"absolute",inset:0,background:"rgba(6,16,42,.65)",backdropFilter:"blur(16px)"}} onClick={onClose}/>
      <div className="frm-modal" style={{
        position:"relative",width:"100%",maxWidth:780,
        maxHeight:"calc(100vh - 90px)",overflowY:"auto",
        background:C.surface,borderRadius:24,
        boxShadow:`0 40px 100px ${C.shadowLg}`,
      }}>
        <Tri h={4} r={24}/>

        {/* Header */}
        <div style={{padding:"24px 28px 0",background:`linear-gradient(180deg,${C.surfaceEl},${C.surface})`,borderBottom:`1px solid ${C.divider}`}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:18}}>
            <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
              <div style={{width:52,height:52,borderRadius:15,flexShrink:0,background:dc?.bg||C.surfaceEl,border:`1.5px solid ${dc?.color||C.blue}28`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 16px ${dc?.color||C.blue}18`}}>
                <GraduationCap size={22} color={dc?.color||C.blue}/>
              </div>
              <div>
                <h2 className="frm-serif" style={{fontSize:20,fontWeight:700,color:C.textPri,letterSpacing:"-.4px",lineHeight:1.2}}>{formation.nom_formation}</h2>
                <div style={{display:"flex",gap:7,alignItems:"center",marginTop:7,flexWrap:"wrap"}}>
                  {dc && <span className={`frm-badge ${dc.cls}`}>{dc.label} — {dc.desc}</span>}
                  <span style={{fontSize:11,color:dc?.color||C.blue,background:`${dc?.color||C.blue}10`,padding:"3px 9px",borderRadius:6,border:`1px solid ${dc?.color||C.blue}20`,fontWeight:800,fontFamily:"monospace"}}>{formationId}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{width:36,height:36,borderRadius:10,background:C.surfaceEl,border:`1px solid ${C.divider}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
              <X size={15} color={C.textMuted}/>
            </button>
          </div>
          <div style={{display:"flex",gap:2}}>
            {tabs.map(tab=>{
              const TI=tab.icon; const active=activeTab===tab.id;
              return (
                <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{display:"flex",alignItems:"center",gap:7,padding:"10px 18px",borderRadius:"10px 10px 0 0",border:"none",cursor:"pointer",background:active?C.surface:"transparent",color:active?C.textPri:C.textMuted,fontSize:12.5,fontWeight:700,fontFamily:"'Outfit',sans-serif",borderBottom:active?`2px solid ${C.blue}`:"2px solid transparent",transition:"all .14s"}}>
                  <TI size={13}/>{tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Corps */}
        <div style={{padding:"22px 28px",minHeight:260}}>
          {activeTab==="info" && (
            <div style={{background:C.surfaceEl,borderRadius:14,padding:"4px 18px",border:`1px solid ${C.divider}`}}>
              {[
                {l:"Organisme",  v:formation.organisme_formation||"—"},
                {l:"Formateur",  v:formation.nom_formateur||"—"},
                {l:"Période",    v:`${fmtDL(formation.date_debut)} → ${fmtDL(formation.date_fin)}`},
                {l:"Division",   node:<DivBadge type={formation.type_formation}/>},
                {l:"Antenne",    v:formation.antenne_display||ANTENNE_LABEL(formation.antenne)},
                ...(formation.entreprise_formation?[{l:"Entreprise",v:formation.entreprise_formation}]:[]),
                {l:"Créé par",   v:formation.created_by_nom||"—"},
                {l:"Apprenants", node:<span className="frm-serif" style={{fontSize:18,fontWeight:700,color:C.green}}>{candidats.length||formation.nb_candidats||0}</span>},
              ].map((row,i)=>(
                <div key={i} className="frm-detail-row">
                  <span className="frm-detail-label">{row.l}</span>
                  {row.node?<div className="frm-detail-val">{row.node}</div>:<span className="frm-detail-val">{row.v}</span>}
                </div>
              ))}
            </div>
          )}

          {activeTab==="apprenants" && (
            loading?(
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"52px 0",gap:14}}>
                <Loader2 size={26} color={C.blue} className="frm-spin"/>
                <p style={{fontSize:13,color:C.textMuted}}>Chargement des apprenants…</p>
              </div>
            ):candidats.length===0?(
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"52px 0",gap:12}}>
                <div style={{width:58,height:58,borderRadius:16,background:C.surfaceEl,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${C.divider}`}}>
                  <Users size={24} color={C.textMuted}/>
                </div>
                <p className="frm-serif" style={{fontSize:15,fontWeight:600,color:C.textSub}}>Aucun apprenant rattaché</p>
                <p style={{fontSize:12,color:C.textMuted,textAlign:"center",maxWidth:300,lineHeight:1.6}}>
                  Les apprenants inscrits depuis la page Inscriptions apparaîtront ici.
                </p>
              </div>
            ):(
              <div style={{borderRadius:14,border:`1px solid ${C.divider}`,overflow:"hidden"}}>
                <div style={{padding:"12px 16px",background:`${C.navy}04`,borderBottom:`1px solid ${C.divider}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <Users size={14} color={C.green}/>
                    <span style={{fontSize:12.5,fontWeight:700,color:C.textSub}}>{candidats.length} apprenant{candidats.length>1?"s":""}</span>
                  </div>
                </div>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr style={{background:`${C.navy}03`,borderBottom:`1px solid ${C.divider}`}}>
                      {["Apprenant","Identifiant","Contact","Statut"].map((h,i)=>(
                        <th key={i} style={{padding:"10px 14px",textAlign:"left",fontSize:10,fontWeight:800,color:C.textMuted,letterSpacing:".1em",textTransform:"uppercase"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {candidats.map((c,i)=>(
                      <tr key={c.id} style={{borderBottom:i<candidats.length-1?`1px solid ${C.divider}`:"none",background:i%2===0?C.surface:`${C.navy}008`}}>
                        <td style={{padding:"11px 14px"}}>
                          <p style={{fontSize:13,fontWeight:700,color:C.textPri}}>{c.nom} {c.prenom}</p>
                          {c.domaine&&<p style={{fontSize:11,color:C.textMuted,marginTop:1}}>{c.domaine}</p>}
                        </td>
                        <td style={{padding:"11px 14px"}}>
                          {c.identifiant_unique
                            ?<span style={{fontSize:11,color:C.blue,background:`${C.blue}10`,padding:"3px 8px",borderRadius:5,fontWeight:800,fontFamily:"monospace",border:`1px solid ${C.blue}20`}}>{c.identifiant_unique}</span>
                            :<span style={{fontSize:12,color:C.textMuted}}>—</span>}
                        </td>
                        <td style={{padding:"11px 14px",fontSize:12,color:C.textSub}}>{c.telephone||c.email||"—"}</td>
                        <td style={{padding:"11px 14px"}}><StatutBadge statut={c.statut_fiche}/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>

        <div style={{padding:"14px 28px 20px",borderTop:`1px solid ${C.divider}`,display:"flex",justifyContent:"flex-end"}}>
          <button className="frm-btn frm-btn-sec" onClick={onClose}><X size={13}/> Fermer</button>
        </div>
      </div>
    </div>
  );
};

/* ── Card grille ── */
const FormationCard = ({f,frmId,onClick,delay=0}) => {
  const dc = getDivCfg(f.type_formation);
  const daysLeft = f.date_fin?Math.ceil((new Date(f.date_fin)-new Date())/86400000):null;
  return (
    <div className={`frm-card frm-in frm-d${delay}`} onClick={onClick} style={{cursor:"pointer",overflow:"hidden",position:"relative"}}>
      <div style={{height:3,background:`linear-gradient(90deg,${dc?.color||C.blue},${dc?.color||C.blue}55)`}}/>
      <div style={{position:"absolute",bottom:-30,right:-30,width:130,height:130,borderRadius:"50%",background:`${dc?.color||C.blue}06`,pointerEvents:"none"}}/>
      <div style={{padding:"18px 20px"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:42,height:42,borderRadius:12,flexShrink:0,background:dc?.bg||C.surfaceEl,border:`1.5px solid ${dc?.color||C.blue}22`,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <GraduationCap size={18} color={dc?.color||C.blue}/>
            </div>
            <DivBadge type={f.type_formation}/>
          </div>
          <div style={{width:30,height:30,borderRadius:8,background:`${C.blue}08`,border:`1px solid ${C.blue}18`,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Eye size={13} color={C.blue}/>
          </div>
        </div>
        <h3 className="frm-serif" style={{fontSize:15.5,fontWeight:700,color:C.textPri,lineHeight:1.3,marginBottom:4,letterSpacing:"-.2px"}}>{f.nom_formation}</h3>
        <p style={{fontSize:11.5,color:C.textMuted,marginBottom:12}}>{f.organisme_formation||"—"}</p>
        <span style={{fontSize:10,color:dc?.color||C.blue,background:`${dc?.color||C.blue}10`,padding:"2px 8px",borderRadius:5,fontWeight:800,fontFamily:"monospace",border:`1px solid ${dc?.color||C.blue}20`}}>{frmId}</span>
        <div style={{height:1,background:C.divider,margin:"13px 0"}}/>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <MapPin size={11} color={C.textMuted}/>
            <span style={{fontSize:12,color:C.textSub,fontWeight:500}}>{f.antenne_display||ANTENNE_LABEL(f.antenne)}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <User size={11} color={C.textMuted}/>
            <span style={{fontSize:12,color:C.textSub}}>{f.nom_formateur||"—"}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <Calendar size={11} color={C.textMuted}/>
            <span style={{fontSize:12,color:C.textSub}}>{fmtD(f.date_debut)} → {fmtD(f.date_fin)}</span>
            {daysLeft!==null&&daysLeft>0&&daysLeft<30&&(
              <span style={{fontSize:10,color:C.gold,background:C.goldPale,padding:"1px 7px",borderRadius:10,fontWeight:700,border:`1px solid ${C.gold}30`}}>J-{daysLeft}</span>
            )}
          </div>
        </div>
        <div style={{marginTop:12,paddingTop:11,borderTop:`1px solid ${C.divider}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <div style={{width:28,height:28,borderRadius:7,background:C.greenPale,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Users size={12} color={C.green}/>
            </div>
            <span className="frm-serif" style={{fontSize:17,fontWeight:700,color:C.textPri}}>{f.nb_candidats||0}</span>
            <span style={{fontSize:11,color:C.textMuted}}>apprenant{f.nb_candidats>1?"s":""}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:C.blue,fontWeight:700}}>Voir <ArrowUpRight size={11}/></div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
═══════════════════════════════════════════════════════════════════ */
const Formation = () => {
  const [formations,setFormations]=useState([]);
  const [loading,   setLoading]   =useState(true);
  const [search,    setSearch]    =useState("");
  const [filterDiv, setFilterDiv] =useState("tous");
  const [filterAnt, setFilterAnt] =useState("");
  const [page,      setPage]      =useState(1);
  const [viewMode,  setViewMode]  =useState("table");
  const [detail,    setDetail]    =useState(null);

  const API = CONFIG.API_FORMATIONS||"/api/formations/";

  const fetch = useCallback(async()=>{
    setLoading(true);
    try{
      const r=await axios.get(`${CONFIG.BASE_URL}${API}`,{headers:authHeader()});
      setFormations(Array.isArray(r.data)?r.data:r.data.results||[]);
    }catch{}finally{setLoading(false);}
  },[]);

  useEffect(()=>{fetch();},[fetch]);

  const filtered = formations.filter(f=>{
    const q=search.toLowerCase();
    const ms=!q||[f.nom_formation,f.organisme_formation,f.nom_formateur,ANTENNE_LABEL(f.antenne)].some(v=>v?.toLowerCase().includes(q));
    const md=filterDiv==="tous"||(filterDiv==="DAP"?f.type_formation==="apprentissage":f.type_formation==="continue");
    return ms&&md&&(!filterAnt||f.antenne===filterAnt);
  });

  const pages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
  const paged=filtered.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE);
  const gIdx=f=>formations.findIndex(x=>x.id===f.id);

  const stats={
    total:formations.length,
    dap:formations.filter(f=>f.type_formation==="apprentissage").length,
    dfc:formations.filter(f=>f.type_formation==="continue").length,
    apprenants:formations.reduce((a,f)=>a+(f.nb_candidats||0),0),
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="frm frm-page" style={{minHeight:"100vh",background:`radial-gradient(ellipse 100% 50% at 65% -5%,rgba(22,53,200,.07) 0%,transparent 60%),${C.page}`,padding:"88px 28px 70px",position:"relative"}}>
        {/* Aurora */}
        <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",overflow:"hidden"}}>
          <div className="frm-aurora" style={{position:"absolute",top:"-10%",right:"8%",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(22,53,200,.07) 0%,transparent 70%)",filter:"blur(30px)"}}/>
          <div style={{position:"absolute",bottom:"8%",left:"5%",width:380,height:380,borderRadius:"50%",background:"radial-gradient(circle,rgba(107,33,168,.04) 0%,transparent 70%)",filter:"blur(40px)"}}/>
        </div>

        <div style={{position:"relative",zIndex:1,maxWidth:1200,margin:"0 auto"}}>

          {/* ── En-tête ── */}
          <div className="frm-in frm-d0" style={{marginBottom:28}}>
            <div style={{width:72,marginBottom:14}}><Tri h={3} r={3}/></div>
            <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:14}}>
              <div>
                <h1 className="frm-serif" style={{fontSize:34,fontWeight:700,color:C.textPri,letterSpacing:"-.8px",lineHeight:1.05}}>
                  Catalogue des formations
                </h1>
                <p style={{fontSize:13.5,color:C.textMuted,marginTop:8}}>
                  Sessions ONFPP Guinée —{" "}
                  <span style={{color:C.dap,fontWeight:700}}>DAP</span> Apprentissage &{" "}
                  <span style={{color:C.dfc,fontWeight:700}}>DFC</span> Continue
                </p>
              </div>
              <button className="frm-btn frm-btn-sec" onClick={fetch}><RefreshCw size={13}/> Actualiser</button>
            </div>
          </div>

          {/* ── KPI ── */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14,marginBottom:26}}>
            {[
              {label:"Total formations",    value:stats.total,      color:C.blue,  bg:`${C.blue}10`, icon:GraduationCap,bar:1},
              {label:"DAP — Apprentissage", value:stats.dap,        color:C.dap,   bg:C.dapPale,     icon:BookOpen,     bar:stats.dap/Math.max(stats.total,1)},
              {label:"DFC — Continue",      value:stats.dfc,        color:C.dfc,   bg:C.dfcPale,     icon:ClipboardList,bar:stats.dfc/Math.max(stats.total,1)},
              {label:"Total apprenants",    value:stats.apprenants, color:C.green, bg:C.greenPale,   icon:Users,        bar:1},
            ].map((s,i)=>{
              const SI=s.icon;
              return (
                <div key={i} className={`frm-in frm-d${i+1}`} style={{background:C.surface,borderRadius:18,padding:"18px 16px",border:`1px solid ${C.divider}`,boxShadow:`0 2px 16px ${C.shadow}`,position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${s.color},${s.color}55)`,borderRadius:"18px 18px 0 0"}}/>
                  <div style={{position:"absolute",bottom:-20,right:-20,width:100,height:100,borderRadius:"50%",background:`${s.color}06`,pointerEvents:"none"}}/>
                  <div style={{width:38,height:38,borderRadius:11,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12}}>
                    <SI size={16} color={s.color}/>
                  </div>
                  <p className="frm-serif" style={{fontSize:30,fontWeight:700,color:C.textPri,lineHeight:1,letterSpacing:"-1.2px"}}>{s.value}</p>
                  <p style={{fontSize:11.5,color:C.textMuted,marginTop:6,marginBottom:12}}>{s.label}</p>
                  <div style={{height:4,borderRadius:3,background:C.surfaceEl,overflow:"hidden"}}>
                    <div className="frm-bar" style={{"--bw":`${Math.round(s.bar*100)}%`,height:"100%",background:`linear-gradient(90deg,${s.color},${s.color}77)`,borderRadius:3,animationDelay:`${i*.12+.3}s`}}/>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Filtres ── */}
          <div className="frm-in frm-d2" style={{background:C.surface,border:`1px solid ${C.divider}`,borderRadius:16,padding:"14px 18px",marginBottom:18,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",boxShadow:`0 2px 14px ${C.shadow}`}}>
            <div style={{position:"relative",flex:"1 1 220px",minWidth:0}}>
              <Search size={14} color={C.textMuted} style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}/>
              <input className="frm-input" placeholder="Formation, formateur, organisme…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{paddingLeft:40}}/>
            </div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {[{v:"tous",l:"Toutes",c:C.textSub},{v:"DAP",l:"DAP",c:C.dap},{v:"DFC",l:"DFC",c:C.dfc}].map(f=>(
                <button key={f.v} onClick={()=>{setFilterDiv(f.v);setPage(1);}} className="frm-pill" style={{border:filterDiv===f.v?`1.5px solid ${f.c}`:`1px solid ${C.divider}`,background:filterDiv===f.v?`${f.c}12`:C.surfaceEl,color:filterDiv===f.v?f.c:C.textMuted}}>
                  {filterDiv===f.v&&<span style={{width:6,height:6,borderRadius:"50%",background:f.c,display:"inline-block"}}/>}{f.l}
                </button>
              ))}
            </div>
            <select className="frm-input" value={filterAnt} onChange={e=>{setFilterAnt(e.target.value);setPage(1);}} style={{width:"auto",minWidth:155,cursor:"pointer"}}>
              <option value="">Toutes les antennes</option>
              {ANTENNES_LIST.map(a=><option key={a.v} value={a.v}>{a.l}</option>)}
            </select>
            <p style={{fontSize:12,color:C.textMuted,flexShrink:0}}>
              <span style={{fontWeight:700,color:C.textSub}}>{filtered.length}</span> résultat{filtered.length>1?"s":""}
            </p>
            {/* Toggle vue */}
            <div style={{display:"flex",gap:3,padding:"3px",background:C.surfaceEl,borderRadius:10,border:`1px solid ${C.divider}`}}>
              {[{id:"table",Icon:List},{id:"grid",Icon:Grid3X3}].map(({id,Icon})=>(
                <button key={id} onClick={()=>setViewMode(id)} style={{width:30,height:30,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",background:viewMode===id?C.surface:"transparent",border:viewMode===id?`1px solid ${C.divider}`:"none",boxShadow:viewMode===id?`0 1px 6px ${C.shadow}`:"none",cursor:"pointer",transition:"all .14s"}}>
                  <Icon size={13} color={viewMode===id?C.navy:C.textMuted}/>
                </button>
              ))}
            </div>
          </div>

          {/* ── Table / Grille ── */}
          <div className="frm-in frm-d3" style={{background:C.surface,border:`1px solid ${C.divider}`,borderRadius:20,boxShadow:`0 2px 18px ${C.shadow}`,overflow:"hidden"}}>

            {loading?(
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"72px 0",gap:16}}>
                <Loader2 size={30} color={C.dap} className="frm-spin"/>
                <p style={{fontSize:13.5,color:C.textMuted}}>Chargement des formations…</p>
              </div>
            ):filtered.length===0?(
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"72px 0",gap:14}}>
                <div style={{width:60,height:60,borderRadius:16,background:C.surfaceEl,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${C.divider}`}}>
                  <GraduationCap size={26} color={C.textMuted}/>
                </div>
                <p className="frm-serif" style={{fontSize:16,fontWeight:600,color:C.textSub}}>Aucune formation trouvée</p>
                <p style={{fontSize:13,color:C.textMuted}}>{search||filterDiv!=="tous"||filterAnt?"Modifiez vos critères":"Les formations créées via Inscriptions apparaîtront ici"}</p>
              </div>

            ):viewMode==="grid"?(
              <div style={{padding:"20px"}}>
                <div className="frm-grid">
                  {paged.map((f,i)=>(
                    <FormationCard key={f.id} f={f} frmId={buildFrmId(f,gIdx(f))} onClick={()=>setDetail({formation:f,id:buildFrmId(f,gIdx(f))})} delay={Math.min(i,4)}/>
                  ))}
                </div>
              </div>
            ):(
              <>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead>
                      <tr style={{background:`linear-gradient(90deg,${C.navy}05,transparent)`,borderBottom:`1.5px solid ${C.divider}`}}>
                        {[{h:"ID Formation"},{h:"Formation"},{h:"Antenne"},{h:"Division"},{h:"Apprenants"},{h:"Formateur",hide:true},{h:"Période",hide:true},{h:""}].map((col,i)=>(
                          <th key={i} className={col.hide?"frm-hide-sm":""} style={{padding:"13px 16px",textAlign:"left",fontSize:10,fontWeight:800,color:C.textMuted,letterSpacing:".12em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{col.h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paged.map((f,ri)=>{
                        const idx=gIdx(f); const fid=buildFrmId(f,idx); const dc=getDivCfg(f.type_formation);
                        return (
                          <tr key={f.id} className="frm-tr" style={{borderBottom:`1px solid ${C.divider}`,background:ri%2===0?C.surface:`${C.navy}008`}} onClick={()=>setDetail({formation:f,id:fid})}>
                            <td style={{padding:"14px 16px"}}>
                              <span style={{fontSize:11,fontWeight:800,color:dc?.color||C.blue,background:`${dc?.color||C.blue}10`,padding:"4px 10px",borderRadius:6,fontFamily:"monospace",border:`1px solid ${dc?.color||C.blue}22`,whiteSpace:"nowrap"}}>{fid}</span>
                            </td>
                            <td style={{padding:"14px 16px"}}>
                              <div style={{display:"flex",alignItems:"center",gap:11}}>
                                <div style={{width:36,height:36,borderRadius:10,flexShrink:0,background:dc?.bg||C.surfaceEl,border:`1px solid ${dc?.color||C.blue}20`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                                  <GraduationCap size={15} color={dc?.color||C.blue}/>
                                </div>
                                <div>
                                  <p style={{fontSize:13,fontWeight:700,color:C.textPri,lineHeight:1.3}}>{f.nom_formation}</p>
                                  <p style={{fontSize:11,color:C.textMuted,marginTop:1}}>{f.organisme_formation||"—"}</p>
                                </div>
                              </div>
                            </td>
                            <td style={{padding:"14px 16px"}}>
                              <div style={{display:"flex",alignItems:"center",gap:7}}>
                                <MapPinned size={12} color={C.textMuted}/>
                                <span style={{fontSize:12.5,color:C.textSub,fontWeight:600}}>{f.antenne_display||ANTENNE_LABEL(f.antenne)}</span>
                              </div>
                            </td>
                            <td style={{padding:"14px 16px"}}><DivBadge type={f.type_formation}/></td>
                            <td style={{padding:"14px 16px"}}>
                              <div style={{display:"flex",alignItems:"center",gap:8}}>
                                <div style={{width:32,height:32,borderRadius:9,background:C.greenPale,display:"flex",alignItems:"center",justifyContent:"center"}}>
                                  <Users size={13} color={C.green}/>
                                </div>
                                <span className="frm-serif" style={{fontSize:17,fontWeight:700,color:C.textPri}}>{f.nb_candidats||0}</span>
                              </div>
                            </td>
                            <td className="frm-hide-sm" style={{padding:"14px 16px"}}>
                              <div style={{display:"flex",alignItems:"center",gap:6}}>
                                <User size={11} color={C.textMuted}/>
                                <span style={{fontSize:12,color:C.textSub}}>{f.nom_formateur||"—"}</span>
                              </div>
                            </td>
                            <td className="frm-hide-sm" style={{padding:"14px 16px"}}>
                              <div style={{display:"flex",alignItems:"center",gap:6}}>
                                <Calendar size={11} color={C.textMuted}/>
                                <span style={{fontSize:11.5,color:C.textSub}}>{fmtD(f.date_debut)} → {fmtD(f.date_fin)}</span>
                              </div>
                            </td>
                            <td style={{padding:"14px 16px"}} onClick={e=>{e.stopPropagation();setDetail({formation:f,id:fid});}}>
                              <div style={{width:32,height:32,borderRadius:9,cursor:"pointer",border:`1px solid ${C.blue}20`,background:`${C.blue}08`,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .14s"}}
                                onMouseEnter={e=>{e.currentTarget.style.background=`${C.blue}18`;e.currentTarget.style.borderColor=C.blue;}}
                                onMouseLeave={e=>{e.currentTarget.style.background=`${C.blue}08`;e.currentTarget.style.borderColor=`${C.blue}20`;}}>
                                <Eye size={14} color={C.blue}/>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div style={{padding:"10px 20px",background:`${C.navy}02`,borderTop:`1px solid ${C.divider}`,display:"flex",gap:20,flexWrap:"wrap",alignItems:"center"}}>
                  <div style={{display:"flex",gap:4,height:12,borderRadius:2,overflow:"hidden",width:28,flexShrink:0}}>
                    <div style={{flex:1,background:"#E02020"}}/><div style={{flex:1,background:C.gold}}/><div style={{flex:1,background:C.green}}/>
                  </div>
                  <span style={{fontSize:11,color:C.textMuted}}><strong style={{color:C.dap}}>DAP</strong> — Direction Apprentissage Professionnel</span>
                  <span style={{fontSize:11,color:C.textMuted}}><strong style={{color:C.dfc}}>DFC</strong> — Direction Formation Continue</span>
                </div>
              </>
            )}

            {/* Pagination */}
            {!loading&&filtered.length>0&&pages>1&&(
              <div style={{padding:"13px 20px",borderTop:`1px solid ${C.divider}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
                <p style={{fontSize:12,color:C.textMuted}}>
                  <span style={{fontWeight:700,color:C.textSub}}>{(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE,filtered.length)}</span> / <span style={{fontWeight:700,color:C.textSub}}>{filtered.length}</span>
                </p>
                <div style={{display:"flex",gap:5,alignItems:"center"}}>
                  <button className="frm-pg" onClick={()=>setPage(p=>p-1)} disabled={page===1}><ChevronLeft size={13}/></button>
                  {Array.from({length:pages},(_,i)=>i+1).filter(p=>p===1||p===pages||Math.abs(p-page)<=1).map((p,i,arr)=>(
                    <React.Fragment key={p}>
                      {i>0&&arr[i-1]!==p-1&&<span style={{color:C.textMuted,fontSize:12,padding:"0 2px"}}>…</span>}
                      <button className={`frm-pg${p===page?" active":""}`} onClick={()=>setPage(p)}>{p}</button>
                    </React.Fragment>
                  ))}
                  <button className="frm-pg" onClick={()=>setPage(p=>p+1)} disabled={page===pages}><ChevronRight size={13}/></button>
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="frm-in frm-d4" style={{marginTop:14,padding:"12px 18px",background:`${C.navy}03`,borderRadius:12,border:`1px solid ${C.divider}`,display:"flex",alignItems:"center",gap:10}}>
            <GraduationCap size={14} color={C.textMuted}/>
            <p style={{fontSize:12,color:C.textMuted,lineHeight:1.5}}>
              Formations créées depuis la page <strong style={{color:C.textSub}}>Inscriptions</strong>. Cliquez sur une ligne pour voir les apprenants. Basculez vue tableau ↔ grille avec les boutons en haut des filtres.
            </p>
          </div>

        </div>
      </div>

      {detail&&(
        <FormationDetailModal formation={detail.formation} formationId={detail.id} onClose={()=>setDetail(null)}/>
      )}
    </>
  );
};

export default Formation;