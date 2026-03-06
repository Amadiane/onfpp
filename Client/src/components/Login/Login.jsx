import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, Eye, EyeOff, ShieldCheck } from "lucide-react";
import CONFIG from "../../config/config.js";

const C = {
  navy:    "#0D1B5E",
  blue:    "#1A3BD4",
  iceBlue: "#C8D9FF",
  textSub: "#4A5A8A",
  textMuted:"#8FA3D8",
  surface: "#FFFFFF",
  bg:      "#F0F4FF",
  danger:  "#E53935",
  shadow:  "rgba(26,59,212,0.15)",
};

const Login = () => {
  const navigate = useNavigate();

  const [username,         setUsername]         = useState("");
  const [password,         setPassword]         = useState("");
  const [error,            setError]            = useState("");
  const [loading,          setLoading]          = useState(false);
  const [passwordVisible,  setPasswordVisible]  = useState(false);
  const [focused,          setFocused]          = useState({});

  /* ── Connexion ── */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      /* 1. Login → access + refresh */
      const loginRes = await fetch(`${CONFIG.BASE_URL}${CONFIG.API_LOGIN}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ username, password }),
      });

      if (!loginRes.ok) {
        const data = await loginRes.json().catch(() => ({}));
        setError(data.detail || "Identifiants incorrects.");
        return;
      }

      const loginData   = await loginRes.json();
      const accessToken = loginData.access;

      /* 2. Stocke le token IMMÉDIATEMENT */
      localStorage.setItem("access",  accessToken);
      localStorage.setItem("refresh", loginData.refresh || "");

      /* ── 3. Récupération profil /api/me/ avec le token frais ── */
      let userProfile = null;

      try {
        const meRes = await fetch(`${CONFIG.BASE_URL}${CONFIG.API_ME}`, {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type":  "application/json",
          },
        });

        if (meRes.ok) {
          /* ✅ /api/me/ répond correctement */
          const u = await meRes.json();
          userProfile = {
            id:        u.id,
            username:  u.username        || loginData.username || username,
            firstName: u.first_name      || "",
            lastName:  u.last_name       || "",
            email:     u.email           || "",
            role:      u.role            || loginData.role   || null,
            niveau:    u.niveau          ?? loginData.niveau ?? 0,
            region:    u.region          || loginData.region || null,
            centre:    u.centre          || loginData.centre || null,
          };
        } else {
          /* ⚠️ /api/me/ retourne 403/401 → décode le JWT payload */
          console.warn(`[Login] /api/me/ retourné ${meRes.status} — fallback JWT payload`);
          try {
            const jwtPayload = JSON.parse(atob(accessToken.split(".")[1]));
            userProfile = {
              id:        jwtPayload.user_id    || null,
              username:  jwtPayload.username   || loginData.username || username,
              firstName: jwtPayload.first_name || "",
              lastName:  jwtPayload.last_name  || "",
              email:     jwtPayload.email      || "",
              role:      jwtPayload.role       || loginData.role   || null,
              niveau:    jwtPayload.niveau     ?? loginData.niveau ?? 0,
              region:    jwtPayload.region     || loginData.region || null,
              centre:    jwtPayload.centre     || loginData.centre || null,
            };
          } catch {
            /* JWT non décodable → utilise ce que /api/login/ a renvoyé */
            userProfile = {
              username: loginData.username || username,
              role:     loginData.role     || null,
              niveau:   loginData.niveau   ?? 0,
              region:   loginData.region   || null,
              centre:   loginData.centre   || null,
            };
          }
        }
      } catch {
        /* Erreur réseau sur /api/me/ — on utilise les données du login */
        userProfile = {
          username: loginData.username || username,
          role:     loginData.role     || null,
          niveau:   loginData.niveau   ?? 0,
          region:   loginData.region   || null,
          centre:   loginData.centre   || null,
        };
      }

      /* ✅ Stocke le profil — toujours renseigné même si /api/me/ a échoué */
      localStorage.setItem("user", JSON.stringify(userProfile));
      console.log("[Login] Profil stocké :", userProfile);

      /* 4. Redirection */
      navigate("/dashboardAdmin");

    } catch {
      setError("Erreur réseau. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Style ── */
  const inputStyle = (name) => ({
    width: "100%", padding: "12px 16px",
    borderRadius: 12,
    border: `1.5px solid ${focused[name] ? C.blue : C.iceBlue}`,
    background: focused[name] ? "#F5F8FF" : C.surface,
    fontSize: 14, color: C.navy,
    fontFamily: "'Syne', sans-serif",
    outline: "none",
    boxShadow: focused[name] ? `0 0 0 3px ${C.blue}18` : "none",
    transition: "all .18s",
  });

  const fp = (name) => ({
    onFocus: () => setFocused(p => ({ ...p, [name]: true  })),
    onBlur:  () => setFocused(p => ({ ...p, [name]: false })),
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(135deg, ${C.navy} 0%, #1A2F8A 50%, ${C.blue} 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16, fontFamily: "'Syne', sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');`}</style>

      {/* Halos décoratifs */}
      <div style={{ position:"absolute", top:-120, right:-120, width:400, height:400, borderRadius:"50%", background:"rgba(107,159,255,0.10)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:-80, left:-80, width:300, height:300, borderRadius:"50%", background:"rgba(255,255,255,0.05)", pointerEvents:"none" }}/>

      {/* Card */}
      <div style={{
        width: "100%", maxWidth: 420,
        background: C.surface,
        borderRadius: 24,
        padding: "40px 36px",
        boxShadow: `0 24px 80px ${C.shadow}`,
        border: `1.5px solid rgba(255,255,255,0.15)`,
        position: "relative",
      }}>

        {/* Logo / Icône */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, margin: "0 auto 16px",
            background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 8px 32px ${C.shadow}`,
          }}>
            <ShieldCheck size={34} color="#fff"/>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: C.navy, lineHeight: 1 }}>
            ONFPP
          </h1>
          <p style={{ fontSize: 13, color: C.textMuted, marginTop: 6, fontWeight: 600 }}>
            Plateforme d'administration
          </p>
        </div>

        {/* Erreur */}
        {error && (
          <div style={{
            marginBottom: 20, padding: "12px 16px",
            background: "#FFF1F2", border: "1.5px solid #FECDD3",
            borderRadius: 12, fontSize: 13, color: C.danger, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 16 }}>⚠️</span> {error}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Nom d'utilisateur */}
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: C.textSub, marginBottom: 7 }}>
              <User size={13} color={C.blue}/> Nom d'utilisateur
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="ex : m.diallo"
              required
              autoComplete="username"
              style={inputStyle("username")}
              {...fp("username")}
            />
          </div>

          {/* Mot de passe */}
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: C.textSub, marginBottom: 7 }}>
              <Lock size={13} color={C.blue}/> Mot de passe
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={passwordVisible ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={{ ...inputStyle("password"), paddingRight: 46 }}
                {...fp("password")}
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(p => !p)}
                style={{
                  position: "absolute", right: 14, top: "50%",
                  transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: C.textMuted, display: "flex", alignItems: "center",
                }}
              >
                {passwordVisible ? <EyeOff size={17}/> : <Eye size={17}/>}
              </button>
            </div>
          </div>

          {/* Bouton */}
          <button
            type="submit"
            disabled={loading || !username || !password}
            style={{
              marginTop: 6,
              padding: "14px",
              borderRadius: 14, border: "none",
              background: (loading || !username || !password)
                ? C.textMuted
                : `linear-gradient(135deg, ${C.navy}, ${C.blue})`,
              color: "#fff",
              fontSize: 14, fontWeight: 800,
              cursor: (loading || !username || !password) ? "not-allowed" : "pointer",
              fontFamily: "'Syne', sans-serif",
              letterSpacing: "0.04em",
              boxShadow: loading ? "none" : `0 6px 24px ${C.shadow}`,
              transition: "all .2s",
            }}
          >
            {loading ? "Connexion en cours…" : "Se connecter"}
          </button>
        </form>

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: 11, color: C.textMuted, marginTop: 24 }}>
          Office National de la Formation Professionnelle et Promotionnelle
        </p>
      </div>
    </div>
  );
};

export default Login;