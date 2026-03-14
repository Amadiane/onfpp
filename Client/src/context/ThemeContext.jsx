/**
 * ThemeContext.jsx
 * ─────────────────────────────────────────────────────────────
 * Fournit le thème (dark / light) à TOUTE l'application.
 * Persistance via localStorage("onfpp_theme").
 *
 * Usage :
 *   import { useTheme } from "@/context/ThemeContext";
 *   const { dark, toggle, T } = useTheme();
 *
 * T contient tous les tokens CSS :
 *   T.page, T.surface, T.brand, T.textPri, T.divider …
 * ─────────────────────────────────────────────────────────────
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════
   TOKENS LIGHT
═══════════════════════════════════════════════════════════════ */
export const LIGHT = {
  mode: "light",

  /* Fonds */
  page:         "#F4F6FC",
  surface:      "#FFFFFF",
  surfaceEl:    "#F8FAFE",
  surfaceHover: "#F1F5FF",
  glass:        "rgba(255,255,255,0.84)",

  /* Brand ONFPP */
  brand:        "#1A3B8C",
  brandMid:     "#2451B8",
  brandViv:     "#3D68FF",
  brandPale:    "#EBF0FF",
  brandGlow:    "rgba(26,59,140,0.15)",
  sky:          "#5B82FF",

  /* Texte */
  textPri:      "#0D1B3E",
  textSec:      "#2C3F7A",
  textMuted:    "#8496C8",
  textInv:      "#FFFFFF",

  /* Borders */
  divider:      "#DDE5F5",
  border:       "#C8D4FF",
  borderStr:    "#9EB2F0",

  /* Ice */
  ice:          "#EBF0FF",
  iceDeep:      "#D6E1FF",
  iceFaint:     "#F3F6FF",

  /* Or guinéen */
  gold:         "#B87A00",
  goldBright:   "#E09A00",
  goldViv:      "#F5B020",
  goldPale:     "#FFF7E0",

  /* Sémantiques */
  green:        "#046048",
  greenLight:   "#0BAF7A",
  greenPale:    "#E2F8F1",
  rose:         "#CC1840",
  rosePale:     "#FDEAEF",
  violet:       "#5A22CC",
  violetPale:   "#F0EAFF",
  teal:         "#077870",

  /* Ombres */
  sh1:          "rgba(13,27,62,0.06)",
  sh2:          "rgba(13,27,62,0.12)",
  sh3:          "rgba(13,27,62,0.24)",

  /* Hero banner (toujours dark pour le contraste) */
  heroBg: "linear-gradient(148deg,#04101F 0%,#061228 18%,#091A3E 38%,#0E2258 58%,#1A3B8C 82%,#2451B8 100%)",
};

/* ═══════════════════════════════════════════════════════════════
   TOKENS DARK
═══════════════════════════════════════════════════════════════ */
export const DARK = {
  mode: "dark",

  /* Fonds */
  page:         "#06101E",
  surface:      "#0D1B35",
  surfaceEl:    "#112040",
  surfaceHover: "#162548",
  glass:        "rgba(13,27,53,0.88)",

  /* Brand */
  brand:        "#4A78FF",
  brandMid:     "#3D68FF",
  brandViv:     "#5B82FF",
  brandPale:    "rgba(74,120,255,0.15)",
  brandGlow:    "rgba(74,120,255,0.25)",
  sky:          "#7EA8FF",

  /* Texte */
  textPri:      "#E8EFFF",
  textSec:      "#9AB0FF",
  textMuted:    "#4D6599",
  textInv:      "#04101F",

  /* Borders */
  divider:      "rgba(93,118,255,0.14)",
  border:       "rgba(93,118,255,0.24)",
  borderStr:    "rgba(93,118,255,0.42)",

  /* Ice → deep blue */
  ice:          "rgba(26,59,140,0.28)",
  iceDeep:      "rgba(26,59,140,0.48)",
  iceFaint:     "rgba(26,59,140,0.14)",

  /* Or */
  gold:         "#E09A00",
  goldBright:   "#F5B020",
  goldViv:      "#FFD060",
  goldPale:     "rgba(245,176,32,0.12)",

  /* Sémantiques */
  green:        "#0BAF7A",
  greenLight:   "#2DD4A0",
  greenPale:    "rgba(11,175,122,0.14)",
  rose:         "#FF4060",
  rosePale:     "rgba(255,64,96,0.14)",
  violet:       "#9B6EFF",
  violetPale:   "rgba(155,110,255,0.14)",
  teal:         "#20C0B0",

  /* Ombres */
  sh1:          "rgba(0,0,0,0.24)",
  sh2:          "rgba(0,0,0,0.42)",
  sh3:          "rgba(0,0,0,0.64)",

  /* Hero banner */
  heroBg: "linear-gradient(148deg,#04101F 0%,#061228 18%,#091A3E 38%,#0E2258 58%,#1A3B8C 82%,#2451B8 100%)",
};

/* ═══════════════════════════════════════════════════════════════
   BADGES RÔLE (indépendants du thème car auto-contrastés)
═══════════════════════════════════════════════════════════════ */
export const RS_LIGHT = {
  default:                     { bg:"#EBF0FF", text:"#1A3B8C", border:"#BCC8FF", dot:"#1A3B8C" },
  "Directeur Général":         { bg:"#EBF0FF", text:"#1A3B8C", border:"#BCC8FF", dot:"#1A3B8C" },
  "Directeur Général Adjoint": { bg:"#EBF0FF", text:"#1A3B8C", border:"#BCC8FF", dot:"#1A3B8C" },
  "Chef de Division":          { bg:"#EBF0FF", text:"#1A3B8C", border:"#BCC8FF", dot:"#1A3B8C" },
  "Chef de Section":           { bg:"#E0F8F1", text:"#046048", border:"#85E0C5", dot:"#0BAF7A" },
  "Chef d'Antenne":            { bg:"#FFF4D6", text:"#7A4F00", border:"#F0CC78", dot:"#B87A00" },
  "Conseiller":                { bg:"#F0EAFF", text:"#5A22CC", border:"#C2ABFA", dot:"#7C45EE" },
  "Formateur":                 { bg:"#DDFAFF", text:"#025070", border:"#88DEFF", dot:"#0891B2" },
  "Super Administrateur":      { bg:"#FDEAEF", text:"#CC1840", border:"#F5AABC", dot:"#E02050" },
  DG:        { bg:"#EBF0FF", text:"#1A3B8C", border:"#BCC8FF", dot:"#1A3B8C" },
  CD:        { bg:"#EBF0FF", text:"#1A3B8C", border:"#BCC8FF", dot:"#1A3B8C" },
  DR:        { bg:"#EBF0FF", text:"#1A3B8C", border:"#BCC8FF", dot:"#1A3B8C" },
  CC:        { bg:"#FFF4D6", text:"#7A4F00", border:"#F0CC78", dot:"#B87A00" },
  SUPERADMIN:{ bg:"#FDEAEF", text:"#CC1840", border:"#F5AABC", dot:"#E02050" },
};

export const RS_DARK = {
  default:                     { bg:"rgba(93,118,255,.18)", text:"#9AB0FF", border:"rgba(93,118,255,.28)", dot:"#6B8FFF" },
  "Directeur Général":         { bg:"rgba(93,118,255,.18)", text:"#9AB0FF", border:"rgba(93,118,255,.28)", dot:"#6B8FFF" },
  "Directeur Général Adjoint": { bg:"rgba(93,118,255,.18)", text:"#9AB0FF", border:"rgba(93,118,255,.28)", dot:"#6B8FFF" },
  "Chef de Division":          { bg:"rgba(93,118,255,.18)", text:"#9AB0FF", border:"rgba(93,118,255,.28)", dot:"#6B8FFF" },
  "Chef de Section":           { bg:"rgba(11,175,122,.16)", text:"#5AEEC0", border:"rgba(11,175,122,.26)", dot:"#2DD4A0" },
  "Chef d'Antenne":            { bg:"rgba(229,154,0,.15)",  text:"#FFD060", border:"rgba(229,154,0,.26)",  dot:"#E09A00" },
  "Conseiller":                { bg:"rgba(150,90,255,.16)", text:"#C4AAFF", border:"rgba(150,90,255,.26)", dot:"#AA82FF" },
  "Formateur":                 { bg:"rgba(0,200,245,.13)",  text:"#6ADEFF", border:"rgba(0,200,245,.23)",  dot:"#18D4F5" },
  "Super Administrateur":      { bg:"rgba(255,70,90,.15)",  text:"#FF9EAC", border:"rgba(255,70,90,.25)",  dot:"#FF6070" },
  DG:        { bg:"rgba(93,118,255,.18)", text:"#9AB0FF", border:"rgba(93,118,255,.28)", dot:"#6B8FFF" },
  CD:        { bg:"rgba(93,118,255,.18)", text:"#9AB0FF", border:"rgba(93,118,255,.28)", dot:"#6B8FFF" },
  CC:        { bg:"rgba(229,154,0,.15)",  text:"#FFD060", border:"rgba(229,154,0,.26)",  dot:"#E09A00" },
  SUPERADMIN:{ bg:"rgba(255,70,90,.15)",  text:"#FF9EAC", border:"rgba(255,70,90,.25)",  dot:"#FF6070" },
};

export const getRoleBadge = (role, dark) =>
  (dark ? RS_DARK : RS_LIGHT)[role] || (dark ? RS_DARK.default : RS_LIGHT.default);

/* ═══════════════════════════════════════════════════════════════
   CONTEXT
═══════════════════════════════════════════════════════════════ */
const ThemeContext = createContext({
  dark:   false,
  toggle: () => {},
  T:      LIGHT,
});

export const ThemeProvider = ({ children }) => {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem("onfpp_theme") === "dark"; }
    catch { return false; }
  });

  const toggle = () => {
    setDark(d => {
      const next = !d;
      try { localStorage.setItem("onfpp_theme", next ? "dark" : "light"); } catch {}
      return next;
    });
  };

  const T = useMemo(() => (dark ? DARK : LIGHT), [dark]);

  /* Applique data-theme sur <html> pour les CSS variables globales */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    document.documentElement.style.setProperty("--page-bg",     T.page);
    document.documentElement.style.setProperty("--surface",     T.surface);
    document.documentElement.style.setProperty("--text-pri",    T.textPri);
    document.documentElement.style.setProperty("--text-sec",    T.textSec);
    document.documentElement.style.setProperty("--text-muted",  T.textMuted);
    document.documentElement.style.setProperty("--divider",     T.divider);
    document.documentElement.style.setProperty("--brand",       T.brand);
    document.documentElement.style.setProperty("--brand-pale",  T.brandPale);
    document.documentElement.style.setProperty("--gold",        T.gold);
    document.documentElement.style.setProperty("--gold-viv",    T.goldViv);
    document.documentElement.style.setProperty("--green",       T.green);
    document.documentElement.style.setProperty("--rose",        T.rose);
    document.body.style.background = T.page;
    document.body.style.color      = T.textPri;
  }, [dark, T]);

  return (
    <ThemeContext.Provider value={{ dark, toggle, T }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;