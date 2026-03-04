import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, Users, GraduationCap, Building2,
  ClipboardList, BarChart3, Award, Settings, LogOut, Menu, X,
  ChevronDown, Zap, Bell, ShieldCheck, MapPin,
  FileText, UserCheck, CalendarDays, Package, Layers,
  CheckCircle2, Briefcase, PieChart, UserCog, Clock,
  AlertTriangle,
} from "lucide-react";
import CONFIG from "../../config/config.js";
import logo from "../../assets/logo.png";

/* ═══════════════════════════════════════════════════════════════
   PALETTE — identique DashboardAdmin
═══════════════════════════════════════════════════════════════ */
const C = {
  bg:         "#F0F4FF",
  surface:    "#FFFFFF",
  surfaceAlt: "#EEF2FF",
  navy:       "#0D1B5E",
  blue:       "#1A3BD4",
  steel:      "#3A6FFF",
  sky:        "#6B9FFF",
  iceBlue:    "#C8D9FF",
  textSub:    "#4A5A8A",
  textMuted:  "#8FA3D8",
  accent:     "#F5A800",
  success:    "#0BA376",
  purple:     "#7C3AED",
  danger:     "#E53935",
  shadow:     "rgba(26,59,212,0.10)",
};

/* ═══════════════════════════════════════════════════════════════
   RÔLES — identiques DashboardAdmin
═══════════════════════════════════════════════════════════════ */
const ROLE_LABELS = {
  DG:         "Directeur Général",
  CD:         "Chef de Division",
  DR:         "Directeur Régional",
  CC:         "Chef de Centre",
  FORMATEUR:  "Formateur",
  SUPERADMIN: "Super Administrateur",
};

/* ═══════════════════════════════════════════════════════════════
   buildNavCategories — EXACTEMENT la même que DashboardAdmin
═══════════════════════════════════════════════════════════════ */
const buildNavCategories = (role, counts = {}) => {
  const all = [
    {
      title: "Formations", color: C.steel, icon: BookOpen,
      roles: ["DG","CD","DR","CC","FORMATEUR"],
      items: [
        { path:"/formations",    label:"Catalogue formations",  icon:BookOpen,     roles:["DG","CD","DR","CC","FORMATEUR"] },
        { path:"/sessions",      label:"Sessions planifiées",   icon:CalendarDays, roles:["DG","CD","DR","CC","FORMATEUR"] },
        { path:"/programmes",    label:"Programmes & modules",  icon:Layers,       roles:["DG","CD","DR","CC"] },
        { path:"/certifications",label:"Certifications",        icon:Award,        roles:["DG","CD","DR","CC","FORMATEUR"] },
      ]
    },
    {
      title: "Apprenants", color: C.navy, icon: GraduationCap,
      roles: ["DG","CD","DR","CC","FORMATEUR"],
      items: [
        { path:"/inscription",    label:"Inscriptions",          icon:GraduationCap, roles:["DG","CD","DR","CC","FORMATEUR"] },
        { path:"/apprenants",     label:"Apprenants actifs",     icon:GraduationCap, roles:["DG","CD","DR","CC","FORMATEUR"] },
        { path:"/listeCandidats", label:"Inscrits & candidats",  icon:UserCheck,     roles:["DG","CD","DR","CC"], count: counts.community },
        { path:"/validation",     label:"Validation dossiers",   icon:CheckCircle2,  roles:["DG","CD","DR","CC"] },
        { path:"/suivi",          label:"Suivi pédagogique",     icon:ClipboardList, roles:["DG","CD","DR","CC","FORMATEUR"] },
        { path:"/suivi",          label:"Insertion",             icon:ClipboardList, roles:["DG","CD","DR","CC","FORMATEUR"] },
      ]
    },
    {
      title: "Présences & Notes", color: C.success, icon: ClipboardList,
      roles: ["CC","FORMATEUR"],
      items: [
        { path:"/presences",   label:"Feuilles de présence",  icon:CalendarDays,  roles:["CC","FORMATEUR"] },
        { path:"/evaluations", label:"Notes & évaluations",   icon:Award,         roles:["CC","FORMATEUR"] },
        { path:"/discipline",  label:"Discipline",            icon:AlertTriangle, roles:["CC","FORMATEUR"] },
      ]
    },
    {
      title: "Suivi complet", color: C.success, icon: ClipboardList,
      roles: ["DG","CD","DR"],
      items: [
        { path:"/presences",         label:"Présences",               icon:CalendarDays, roles:["DG","CD","DR"] },
        { path:"/suiviEvaluation",       label:"Évaluations",             icon:Award,        roles:["DG","CD","DR"] },
        { path:"/resultats",         label:"Résultats finaux",        icon:CheckCircle2, roles:["DG","CD","DR"] },
        { path:"/attestations",      label:"Attestations PDF",        icon:FileText,     roles:["DG","CD","DR"] },
        { path:"/enquete-insertion", label:"Enquête insertion 3 mois",icon:Clock,        roles:["DG","CD","DR"] },
        { path:"/relances",          label:"Relances automatiques",   icon:Bell,         roles:["DG","CD"] },
      ]
    },
    {
      title: "Fin de session", color: C.accent, icon: CheckCircle2,
      roles: ["CC","FORMATEUR"],
      items: [
        { path:"/resultats",         label:"Résultats finaux",        icon:CheckCircle2, roles:["CC","FORMATEUR"] },
        { path:"/attestations",      label:"Attestations PDF",        icon:FileText,     roles:["CC","FORMATEUR"] },
        { path:"/enquete-insertion", label:"Enquête insertion 3 mois",icon:Clock,        roles:["CC"] },
      ]
    },
    {
      title: "Entreprises", color: C.navy, icon: Briefcase,
      roles: ["DG","CD","DR"],
      items: [
        { path:"/entreprises",   label:"Base des entreprises",  icon:Briefcase, roles:["DG","CD","DR"] },
        { path:"/offres-emploi", label:"Offres d'emploi",       icon:Package,   roles:["DG","CD","DR"] },
      ]
    },
    {
      title: "Rapports", color: C.purple, icon: BarChart3,
      roles: ["DG","CD","DR","CC"],
      items: [
        { path:"/statistiques",      label:"Statistiques globales",   icon:PieChart,  roles:["DG","CD"] },
        { path:"/statistiques",      label:"Statistiques régionales", icon:PieChart,  roles:["DR"] },
        { path:"/statistiques",      label:"Statistiques du centre",  icon:BarChart3, roles:["CC"] },
        { path:"/dashboardRegional", label:"Tableau régional",        icon:MapPin,    roles:["DG","CD","DR"] },
        { path:"/rapports",          label:"Rapports & exports",      icon:FileText,  roles:["DG","CD","DR","CC"] },
      ]
    },
    {
      title: "Centres & Équipes", color: C.purple, icon: Building2,
      roles: ["DG","CD","DR"],
      items: [
        { path:"/centresFormation", label:"Centres de formation",  icon:Building2, roles:["DG","CD","DR"] },
        { path:"/teamMessage",      label:"Équipe & formateurs",   icon:Users,     roles:["DG","CD","DR","CC"] },
        { path:"/partnerPost",      label:"Partenaires",           icon:Package,   roles:["DG","CD"] },
      ]
    },
    {
      title: "Administration", color: C.textSub, icon: Settings,
      roles: ["DG","CD","SUPERADMIN"],
      items: [
        { path:"/addUser", label:"Gestion utilisateurs",  icon:UserCog,  roles:["DG","CD","SUPERADMIN"] },
        { path:"/parametres",   label:"Paramètres système",    icon:Settings, roles:["DG","CD","SUPERADMIN"] },
        { path:"/homePost",     label:"Contenu site public",   icon:Layers,   roles:["DG","CD"] },
      ]
    },
  ];

  return all
    .filter(cat => cat.roles.includes(role))
    .map(cat => ({
      ...cat,
      items: cat.items
        .filter(item => item.roles.includes(role))
        .filter((item, idx, arr) =>
          arr.findIndex(x => x.path === item.path && x.label === item.label) === idx
        ),
    }))
    .filter(cat => cat.items.length > 0);
};

/* ═══════════════════════════════════════════════════════════════
   LECTURE VRAI USER — identique DashboardAdmin
═══════════════════════════════════════════════════════════════ */
const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    if (raw) return JSON.parse(raw);
    const token = localStorage.getItem("access");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return {
        username: payload.username || payload.email || "Utilisateur",
        role:     payload.role     || "DG",
        niveau:   payload.niveau   ?? 0,
        region:   payload.region   || null,
        centre:   payload.centre   || null,
      };
    }
  } catch { /* ignore */ }
  return { username:"Admin", role:"DG", niveau:0 };
};

/* ═══════════════════════════════════════════════════════════════
   COMPOSANT
═══════════════════════════════════════════════════════════════ */
const NavAdmin = () => {
  const location = useLocation();
  const navigate  = useNavigate();

  const [counts, setCounts]               = useState({ contacts:0, community:0, newsletter:0 });
  const [showQuickMenu,  setShowQuickMenu]  = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [scrolled, setScrolled]             = useState(false);

  /* Vrai user */
  const user      = getStoredUser();
  const role      = user.role     || "DG";
  const roleLabel = ROLE_LABELS[role] || "Administrateur";

  /* Scroll shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Fetch counts */
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const r1 = await fetch(CONFIG.API_CONTACT_LIST);
        if (r1.ok) { const d = await r1.json(); setCounts(p => ({ ...p, contacts: (Array.isArray(d)?d:d.results||[]).length })); }
        const r2 = await fetch(CONFIG.API_POSTULANT_LIST);
        if (r2.ok) { const d = await r2.json(); setCounts(p => ({ ...p, community: (Array.isArray(d)?d:d.results||[]).length })); }
        const r3 = await fetch(CONFIG.API_ABONNEMENT_LIST);
        if (r3.ok) { const d = await r3.json(); setCounts(p => ({ ...p, newsletter: (Array.isArray(d)?d:d.results||[]).length })); }
      } catch(e) { console.error(e); }
    };
    fetchCounts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const totalNotifs = counts.contacts + counts.community + counts.newsletter;
  const navCategories = buildNavCategories(role, counts);

  /* Accès rapides — mirror DashboardAdmin QUICK_BY_ROLE */
  const QUICK_BY_ROLE = {
    DG:         ["/apprenants","/statistiques","/rapports","/utilisateurs"],
    CD:         ["/apprenants","/statistiques","/rapports","/utilisateurs"],
    DR:         ["/apprenants","/statistiques","/centresFormation","/rapports"],
    CC:         ["/apprenants","/presences","/evaluations","/resultats"],
    FORMATEUR:  ["/apprenants","/presences","/evaluations","/sessions"],
    SUPERADMIN: ["/addUser","/parametres","/apprenants","/statistiques"],
  };
  const ALL_QUICK = [
    { path:"/apprenants",      label:"Apprenants",    icon:GraduationCap, color:C.navy,    bg:"#E8ECF8" },
    { path:"/presences",       label:"Présences",     icon:CalendarDays,  color:C.success, bg:"#E6FAF4" },
    { path:"/evaluations",     label:"Évaluations",   icon:Award,         color:C.accent,  bg:"#FFF8E6" },
    { path:"/statistiques",    label:"Statistiques",  icon:PieChart,      color:C.purple,  bg:"#F3F0FF" },
    { path:"/addUser",    label:"Utilisateurs",  icon:UserCog,       color:C.textSub, bg:"#EEF2FF" },
    { path:"/centresFormation",label:"Centres",       icon:Building2,     color:C.purple,  bg:"#F3F0FF" },
    { path:"/resultats",       label:"Résultats",     icon:CheckCircle2,  color:C.accent,  bg:"#FFF8E6" },
    { path:"/rapports",        label:"Rapports",      icon:BarChart3,     color:C.blue,    bg:"#EEF2FF" },
    { path:"/sessions",        label:"Sessions",      icon:CalendarDays,  color:C.success, bg:"#E6FAF4" },
    { path:"/parametres",      label:"Paramètres",    icon:Settings,      color:C.textSub, bg:"#EEF2FF" },
  ];
  const quickPaths = QUICK_BY_ROLE[role] || QUICK_BY_ROLE.DG;
  const quickItems = ALL_QUICK.filter(q => quickPaths.includes(q.path));

  /* Style bouton nav actif/inactif */
  const dropBtnStyle = (open) => ({
    display:"flex", alignItems:"center", gap:6, padding:"7px 12px", borderRadius:10,
    border:"none", cursor:"pointer",
    background: open ? C.surfaceAlt : "transparent",
    color: open ? C.navy : C.textSub,
    fontWeight:600, fontSize:12, fontFamily:"'Syne',sans-serif",
    transition:"all .15s", whiteSpace:"nowrap",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
        .na-btn:hover  { background:${C.surfaceAlt} !important; color:${C.navy} !important; }
        .na-drop:hover { background:${C.surfaceAlt} !important; }
        .na-ml:hover   { background:${C.surfaceAlt} !important; color:${C.navy} !important; }
        @media(max-width:1279px){ .na-deskonly{display:none !important;} }
        @media(min-width:1280px){ .na-mobileonly{display:none !important;} }
      `}</style>

      {/* ══ TOP BAR ══ */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, height:72,
        background: scrolled ? "rgba(255,255,255,0.97)" : C.surface,
        borderBottom:`1.5px solid ${C.iceBlue}`,
        boxShadow: scrolled ? `0 4px 24px ${C.shadow}` : `0 2px 16px ${C.shadow}`,
        zIndex:200, backdropFilter:"blur(14px)", transition:"box-shadow .3s",
        fontFamily:"'Syne',sans-serif",
      }}>
        <div style={{ height:"100%", maxWidth:1920, margin:"0 auto", padding:"0 20px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>

          {/* LOGO */}
          <Link to="/dashboardAdmin" style={{ textDecoration:"none", flexShrink:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}
              onMouseEnter={e => e.currentTarget.style.opacity=".85"}
              onMouseLeave={e => e.currentTarget.style.opacity="1"}
            >
              <img src={logo} alt="ONFPP" style={{ height:44, width:"auto", objectFit:"contain" }}/>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <div className="na-deskonly" style={{ display:"flex", alignItems:"center", gap:2, flex:1, justifyContent:"center" }}>

            {/* Lien dashboard direct */}
            <Link to="/dashboardAdmin" className="na-btn" style={{
              display:"flex", alignItems:"center", gap:5, padding:"7px 12px", borderRadius:10,
              textDecoration:"none",
              background: location.pathname==="/dashboardAdmin" ? C.surfaceAlt : "transparent",
              color:       location.pathname==="/dashboardAdmin" ? C.navy        : C.textSub,
              fontWeight:600, fontSize:12, transition:"all .15s",
              borderBottom: location.pathname==="/dashboardAdmin" ? `2px solid ${C.blue}` : "2px solid transparent",
            }}>
              <LayoutDashboard size={13}/> Tableau de bord
            </Link>

            {/* Catégories avec dropdown */}
            {navCategories.map((cat, idx) => {
              const isOpen = activeDropdown === idx;
              const CatIcon = cat.icon;
              return (
                <div key={idx} style={{ position:"relative" }}>
                  <button className="na-btn" onClick={() => setActiveDropdown(isOpen ? null : idx)} style={dropBtnStyle(isOpen)}>
                    <CatIcon size={13}/>
                    {cat.title}
                    <ChevronDown size={11} style={{ transition:"transform .2s", transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}/>
                  </button>

                  {isOpen && (
                    <div style={{
                      position:"absolute", top:"calc(100% + 8px)", left:"50%", transform:"translateX(-50%)",
                      minWidth:230, background:C.surface, border:`1.5px solid ${C.iceBlue}`,
                      borderRadius:16, boxShadow:`0 12px 40px ${C.shadow}`, overflow:"hidden", zIndex:300,
                    }}>
                      {/* Barre couleur catégorie */}
                      <div style={{ height:3, background:`linear-gradient(90deg,${cat.color},transparent)` }}/>
                      {cat.items.map((item, i) => {
                        const ItemIcon = item.icon;
                        const active = location.pathname === item.path;
                        return (
                          <Link key={i} to={item.path} onClick={() => setActiveDropdown(null)} className="na-drop"
                            style={{
                              display:"flex", alignItems:"center", justifyContent:"space-between",
                              padding:"10px 14px", textDecoration:"none",
                              background: active ? C.surfaceAlt : "transparent",
                              borderLeft:`3px solid ${active ? C.blue : "transparent"}`,
                              transition:"all .15s",
                            }}
                          >
                            <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                              <div style={{ width:28, height:28, borderRadius:8, background: active ? `${C.blue}18` : `${cat.color}12`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                                <ItemIcon size={14} color={active ? C.blue : cat.color}/>
                              </div>
                              <span style={{ color: active ? C.navy : C.textSub, fontWeight: active ? 700 : 500, fontSize:13 }}>{item.label}</span>
                            </div>
                            {item.count > 0 && (
                              <span style={{ background: active ? C.blue : C.surfaceAlt, color: active ? "#fff" : C.blue, borderRadius:20, padding:"2px 8px", fontSize:10, fontWeight:700 }}>{item.count}</span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* DROITE */}
          <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>

            {/* Bouton accès rapides (Quick Menu) */}
            <button onClick={() => setShowQuickMenu(!showQuickMenu)}
              style={{
                width:38, height:38, borderRadius:10, cursor:"pointer",
                background: showQuickMenu ? `linear-gradient(135deg,${C.navy},${C.blue})` : C.surfaceAlt,
                border:`1.5px solid ${showQuickMenu ? C.blue : C.iceBlue}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow: showQuickMenu ? `0 4px 16px ${C.blue}40` : "none",
                transition:"all .2s",
              }}
              title="Accès rapides"
            >
              <Zap size={15} color={showQuickMenu ? "#fff" : C.textSub}/>
            </button>

            {/* Cloche notifs */}
            <div style={{ position:"relative" }}>
              <button style={{
                width:38, height:38, borderRadius:10, background:C.surfaceAlt,
                border:`1.5px solid ${C.iceBlue}`, display:"flex", alignItems:"center",
                justifyContent:"center", cursor:"pointer",
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.blue}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.iceBlue}
              >
                <Bell size={15} color={C.textSub}/>
              </button>
              {totalNotifs > 0 && (
                <span style={{
                  position:"absolute", top:-4, right:-4, width:17, height:17,
                  borderRadius:9, background:C.accent, color:"#fff",
                  fontSize:9, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center",
                  border:`2px solid ${C.surface}`,
                }}>{totalNotifs}</span>
              )}
            </div>

            {/* Profil utilisateur */}
            <div className="na-deskonly" style={{
              display:"flex", alignItems:"center", gap:8,
              padding:"5px 12px 5px 5px", background:C.surfaceAlt,
              border:`1.5px solid ${C.iceBlue}`, borderRadius:11,
            }}>
              <div style={{ width:30, height:30, borderRadius:8, background:`linear-gradient(135deg,${C.navy},${C.blue})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <ShieldCheck size={14} color="#fff"/>
              </div>
              <div>
                <p style={{ color:C.navy, fontSize:11, fontWeight:700, lineHeight:1 }}>{user.username || "Admin"}</p>
                <p style={{ color:C.textMuted, fontSize:9 }}>{roleLabel}</p>
              </div>
            </div>

            {/* Déconnexion */}
            <button onClick={handleLogout} title="Déconnexion"
              style={{ width:38, height:38, borderRadius:10, background:"#FFF1F0", border:"1.5px solid #FECDD3", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}
              onMouseEnter={e => { e.currentTarget.style.background="#FEE2E2"; e.currentTarget.style.borderColor=C.danger; }}
              onMouseLeave={e => { e.currentTarget.style.background="#FFF1F0"; e.currentTarget.style.borderColor="#FECDD3"; }}
            >
              <LogOut size={15} color={C.danger}/>
            </button>

            {/* Burger mobile */}
            <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="na-mobileonly"
              style={{ width:38, height:38, borderRadius:10, background:C.surfaceAlt, border:`1.5px solid ${C.iceBlue}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}
            >
              {showMobileMenu ? <X size={17} color={C.navy}/> : <Menu size={17} color={C.navy}/>}
            </button>
          </div>
        </div>
      </nav>

      {/* Ferme dropdown au clic extérieur */}
      {activeDropdown !== null && (
        <div style={{ position:"fixed", inset:0, zIndex:150 }} onClick={() => setActiveDropdown(null)}/>
      )}

      {/* ══ QUICK MENU (accès rapides) ══ */}
      {showQuickMenu && (
        <>
          <div style={{ position:"fixed", inset:0, background:"rgba(13,27,94,0.12)", backdropFilter:"blur(4px)", zIndex:250 }} onClick={() => setShowQuickMenu(false)}/>
          <div style={{
            position:"fixed", top:82, right:16, width:300,
            background:C.surface, border:`1.5px solid ${C.iceBlue}`,
            borderRadius:22, boxShadow:`0 16px 48px ${C.shadow}`,
            zIndex:300, overflow:"hidden", fontFamily:"'Syne',sans-serif",
          }}>
            {/* Header */}
            <div style={{ padding:"16px 16px 12px", borderBottom:`1px solid ${C.iceBlue}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:2 }}>
                  <Zap size={14} color={C.accent}/>
                  <span style={{ color:C.navy, fontWeight:800, fontSize:14 }}>Accès Rapide</span>
                </div>
                <p style={{ color:C.textMuted, fontSize:10 }}>{roleLabel}</p>
              </div>
              <button onClick={() => setShowQuickMenu(false)} style={{ width:30, height:30, borderRadius:8, background:C.surfaceAlt, border:`1px solid ${C.iceBlue}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                <X size={13} color={C.textSub}/>
              </button>
            </div>

            {/* Grille accès rapides — mirror DashboardAdmin */}
            <div style={{ padding:14, display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
              {quickItems.map((item, i) => {
                const active = location.pathname === item.path;
                const QIcon = item.icon;
                return (
                  <Link key={i} to={item.path} onClick={() => setShowQuickMenu(false)} style={{ textDecoration:"none" }}>
                    <div style={{
                      padding:"13px 10px",
                      background: active ? `linear-gradient(135deg,${C.navy},${C.blue})` : item.bg,
                      border:`1.5px solid ${active ? C.blue : C.iceBlue}`,
                      borderRadius:13, display:"flex", flexDirection:"column", alignItems:"center", gap:7,
                      transition:"all .15s", cursor:"pointer",
                    }}
                      onMouseEnter={e => { if(!active) { e.currentTarget.style.borderColor=item.color; } }}
                      onMouseLeave={e => { if(!active) { e.currentTarget.style.borderColor=C.iceBlue; } }}
                    >
                      <div style={{ width:36, height:36, borderRadius:10, background: active ? "rgba(255,255,255,0.2)" : C.surface, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <QIcon size={16} color={active ? "#fff" : item.color}/>
                      </div>
                      <span style={{ color: active ? "#fff" : C.navy, fontSize:11, fontWeight:700, textAlign:"center" }}>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Toutes les sections */}
            <div style={{ borderTop:`1px solid ${C.iceBlue}`, padding:"10px 14px 14px" }}>
              <p style={{ color:C.textMuted, fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 }}>Toutes les sections</p>
              {navCategories.map((cat, i) => {
                const CatIcon = cat.icon;
                return (
                  <div key={i} style={{ marginBottom:4 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:5, padding:"3px 8px", marginBottom:1 }}>
                      <CatIcon size={10} color={cat.color}/>
                      <span style={{ color:C.textMuted, fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em" }}>{cat.title}</span>
                    </div>
                    {cat.items.map((item, j) => {
                      const active = location.pathname === item.path;
                      const ItemIcon = item.icon;
                      return (
                        <Link key={j} to={item.path} onClick={() => setShowQuickMenu(false)} className="na-ml"
                          style={{
                            display:"flex", alignItems:"center", justifyContent:"space-between",
                            padding:"6px 10px", borderRadius:9, textDecoration:"none",
                            background: active ? C.surfaceAlt : "transparent",
                            borderLeft:`3px solid ${active ? C.blue : "transparent"}`,
                            transition:"all .15s",
                          }}
                        >
                          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                            <ItemIcon size={12} color={active ? C.blue : C.textMuted}/>
                            <span style={{ color: active ? C.navy : C.textSub, fontSize:12, fontWeight: active ? 700 : 500 }}>{item.label}</span>
                          </div>
                          {item.count > 0 && (
                            <span style={{ background:C.surfaceAlt, color:C.blue, borderRadius:9, padding:"1px 6px", fontSize:9, fontWeight:700 }}>{item.count}</span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ══ MENU MOBILE ══ */}
      {showMobileMenu && (
        <>
          <div style={{ position:"fixed", inset:0, background:"rgba(13,27,94,0.25)", backdropFilter:"blur(6px)", zIndex:250 }} onClick={() => setShowMobileMenu(false)}/>
          <div style={{ position:"fixed", inset:0, top:72, background:C.surface, zIndex:300, overflowY:"auto", fontFamily:"'Syne',sans-serif" }}>

            {/* Header mobile */}
            <div style={{ position:"sticky", top:0, background:C.surface, borderBottom:`1.5px solid ${C.iceBlue}`, padding:"13px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <img src={logo} alt="ONFPP" style={{ height:32, objectFit:"contain" }}/>
                <span style={{ color:C.navy, fontWeight:800, fontSize:14 }}>Menu Navigation</span>
              </div>
              <button onClick={() => setShowMobileMenu(false)} style={{ width:34, height:34, borderRadius:9, background:C.surfaceAlt, border:`1.5px solid ${C.iceBlue}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                <X size={15} color={C.navy}/>
              </button>
            </div>

            <div style={{ padding:20, paddingBottom:100, display:"flex", flexDirection:"column", gap:20 }}>

              {/* Profil mobile */}
              <div style={{ display:"flex", alignItems:"center", gap:12, padding:14, background:C.surfaceAlt, border:`1.5px solid ${C.iceBlue}`, borderRadius:14 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:`linear-gradient(135deg,${C.navy},${C.blue})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <ShieldCheck size={20} color="#fff"/>
                </div>
                <div>
                  <p style={{ color:C.navy, fontWeight:800, fontSize:14 }}>{user.username || "Admin"}</p>
                  <span style={{ display:"inline-block", background:C.surfaceAlt, color:C.blue, border:`1px solid ${C.iceBlue}`, borderRadius:8, padding:"2px 9px", fontSize:11, fontWeight:700, marginTop:2 }}>
                    {roleLabel}
                  </span>
                </div>
              </div>

              {/* Lien dashboard */}
              <Link to="/dashboardAdmin" onClick={() => setShowMobileMenu(false)} style={{
                display:"flex", alignItems:"center", gap:10, padding:"12px 16px", borderRadius:12,
                textDecoration:"none",
                background: location.pathname==="/dashboardAdmin" ? C.surfaceAlt : C.surfaceAlt,
                borderLeft:`4px solid ${location.pathname==="/dashboardAdmin" ? C.blue : "transparent"}`,
              }}>
                <LayoutDashboard size={16} color={C.blue}/>
                <span style={{ color:C.navy, fontWeight:700, fontSize:13 }}>Tableau de bord</span>
              </Link>

              {/* Catégories mobile */}
              {navCategories.map((cat, i) => {
                const CatIcon = cat.icon;
                return (
                  <div key={i}>
                    <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:8 }}>
                      <div style={{ width:3, height:18, borderRadius:2, background:cat.color }}/>
                      <CatIcon size={13} color={cat.color}/>
                      <span style={{ color:cat.color, fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.1em" }}>{cat.title}</span>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                      {cat.items.map((item, j) => {
                        const active = location.pathname === item.path;
                        const ItemIcon = item.icon;
                        return (
                          <Link key={j} to={item.path} onClick={() => setShowMobileMenu(false)} style={{
                            display:"flex", alignItems:"center", justifyContent:"space-between",
                            padding:"11px 14px", borderRadius:11, textDecoration:"none",
                            background: active ? C.surfaceAlt : C.surfaceAlt,
                            borderLeft:`4px solid ${active ? C.blue : "transparent"}`,
                            transition:"all .15s",
                          }}>
                            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                              <ItemIcon size={16} color={active ? C.blue : cat.color}/>
                              <span style={{ color: active ? C.navy : C.textSub, fontWeight: active ? 700 : 500, fontSize:13 }}>{item.label}</span>
                            </div>
                            {item.count > 0 && (
                              <span style={{ background: active ? C.blue : C.surfaceAlt, color: active ? "#fff" : C.blue, borderRadius:9, padding:"2px 9px", fontSize:10, fontWeight:700 }}>{item.count}</span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Déconnexion mobile */}
              <button onClick={() => { setShowMobileMenu(false); handleLogout(); }}
                style={{ width:"100%", padding:"13px", borderRadius:12, background:"#FFF1F0", border:"1.5px solid #FECDD3", color:C.danger, fontWeight:700, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:7, cursor:"pointer", fontFamily:"'Syne',sans-serif" }}
              >
                <LogOut size={15}/> Déconnexion
              </button>
            </div>

            {/* FAB fermeture */}
            <button onClick={() => setShowMobileMenu(false)}
              style={{ position:"fixed", bottom:22, right:22, width:50, height:50, borderRadius:25, background:`linear-gradient(135deg,${C.navy},${C.blue})`, border:"none", boxShadow:`0 8px 24px ${C.blue}50`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", zIndex:20 }}
            >
              <X size={20} color="#fff"/>
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default NavAdmin;