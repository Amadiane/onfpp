import React, { useEffect, useState } from "react";
import { 
  Target, 
  Award, 
  Compass, 
  Sparkles, 
  ArrowRight, 
  MessageCircle, 
  Heart, 
  Zap, 
  Phone, 
  Mail, 
  Users, 
  TrendingUp, 
  CheckCircle,
  AlertCircle,
  Flame
} from "lucide-react";
import CONFIG from "../../config/config.js";

/**
 * 🎨 NOS MISSIONS - ULTRA MODERNE V2
 * Layout: Titre+Desc (gauche) | Photo (droite) | Valeur + Mission (bas)
 * Style: Glassmorphism, Gradients animés, Micro-interactions
 */

// ============ LOADING SPINNER ============
const LoadingSpinner = () => (
  <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
    <div className="relative">
      {/* Cercles animés */}
      <div className="w-24 h-24 border-4 border-[#a34ee5]/20 rounded-full animate-spin"></div>
      <div className="absolute inset-2 border-4 border-[#fec603]/30 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      <div className="absolute inset-4 border-4 border-t-[#a34ee5] rounded-full animate-spin" style={{ animationDuration: '0.8s' }}></div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#a34ee5] to-[#fec603] rounded-full blur-2xl opacity-30 animate-pulse"></div>
      
      <p className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-gray-300 font-bold text-lg whitespace-nowrap">
        Chargement...
      </p>
    </div>
  </div>
);

// ============ MISSION CARD ============
const MissionCard = ({ item, index }) => {
  const photoUrl = item.photo_url || item.photo || null;

  return (
    <article 
      className="group relative"
      style={{ 
        animation: `fadeInUp 0.6s ease-out ${index * 0.2}s both` 
      }}
    >
      {/* Card Container */}
      <div className="relative bg-gradient-to-br from-[#1a0a2e]/80 via-[#16001e]/80 to-[#0a0a0a]/80 backdrop-blur-xl rounded-3xl overflow-hidden border border-[#a34ee5]/30 hover:border-[#fec603]/60 transition-all duration-700 hover:shadow-2xl hover:shadow-[#a34ee5]/30 hover:-translate-y-2">
        
        {/* Glow effect animé */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#a34ee5] via-[#fec603] to-[#a34ee5] rounded-3xl opacity-0 group-hover:opacity-30 blur-2xl transition-all duration-700 animate-gradient-slow"></div>
        
        {/* Grain texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")' }}></div>

        {/* Content */}
        <div className="relative">
          
          {/* TOP SECTION: Titre + Description (gauche) | Photo (droite) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 md:p-10 lg:p-12">
            
            {/* GAUCHE: Titre + Description */}
            <div className="space-y-6 flex flex-col justify-center">
              {/* Icon badge avec animation */}
              <div className="inline-flex items-center gap-3 self-start">
                <div className="relative w-16 h-16 bg-gradient-to-br from-[#a34ee5] via-[#fec603] to-[#a34ee5] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#a34ee5]/50 group-hover:scale-110 transition-transform duration-500 animate-gradient-slow">
                  <Compass className="w-8 h-8 text-white relative z-10" />
                  {/* Pulse effect */}
                  <div className="absolute inset-0 bg-white/20 rounded-2xl animate-ping"></div>
                </div>
              </div>

              {/* Titre avec gradient animé */}
              <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight">
                <span className="inline-block bg-gradient-to-r from-white via-[#fec603] to-[#a34ee5] bg-clip-text text-transparent group-hover:from-[#a34ee5] group-hover:via-[#fec603] group-hover:to-white transition-all duration-1000 animate-gradient-slow">
                  {item.titre}
                </span>
              </h2>

              {/* Description avec effet de reveal */}
              {item.description && (
                <div className="relative">
                  <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-[#a34ee5] to-[#fec603] rounded-full"></div>
                  <p className="text-gray-300 text-lg md:text-xl leading-relaxed pl-4">
                    {item.description}
                  </p>
                </div>
              )}

              {/* Badge actif */}
              {/* <div className="inline-flex items-center gap-2 self-start px-4 py-2 bg-green-500/20 border border-green-500/40 rounded-full backdrop-blur-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-bold text-sm">Active</span>
              </div> */}
            </div>

            {/* DROITE: Photo avec effets */}
            <div className="relative">
              {photoUrl ? (
                <div className="relative group/photo">
                  {/* Container photo avec bordure lumineuse */}
                  <div className="relative rounded-2xl overflow-hidden border-2 border-[#a34ee5]/40 shadow-2xl shadow-[#a34ee5]/30 bg-[#0a0a0a]" style={{ height: '450px' }}>
                    
                    {/* Scan line effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#a34ee5]/20 to-transparent h-full -translate-y-full group-hover/photo:translate-y-full transition-transform duration-2000 pointer-events-none z-10"></div>
                    
                    {/* Image */}
                    <img
                      src={photoUrl}
                      alt={item.titre}
                      className="w-full h-full object-contain p-6 transition-transform duration-700 group-hover/photo:scale-105"
                      onError={(e) => {
                        console.error("❌ Photo error:", photoUrl);
                        e.target.style.display = 'none';
                      }}
                    />
                    
                    {/* Overlay gradient au hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/photo:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Corner decoration */}
                    <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-[#fec603]/60 rounded-tr-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-[#a34ee5]/60 rounded-bl-2xl"></div>
                  </div>

                  {/* Glow decorations */}
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#fec603]/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '3s' }}></div>
                  <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#a34ee5]/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
                </div>
              ) : (
                // Placeholder avec style moderne
                <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-[#a34ee5]/30 bg-gradient-to-br from-[#1a0a2e]/60 to-[#0a0a0a]/60 backdrop-blur-sm" style={{ height: '450px' }}>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <Compass className="w-24 h-24 text-[#a34ee5]/40 animate-pulse" />
                    <p className="text-gray-600 text-sm font-medium">Aucune image</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Séparateur lumineux */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#a34ee5]/50 to-transparent mx-8"></div>

          {/* BOTTOM SECTION: Valeur (gauche) + Mission (droite) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-8 md:p-10 lg:p-12">
            
            {/* VALEUR - Gold theme */}
            <div className="group/card relative">
              <div className="relative p-8 bg-gradient-to-br from-[#fec603]/10 via-[#a34ee5]/5 to-transparent rounded-2xl border-2 border-[#fec603]/30 hover:border-[#fec603]/60 transition-all duration-500 overflow-hidden">
                
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#fec603]/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#fec603] to-[#d4a000] rounded-xl flex items-center justify-center shadow-lg shadow-[#fec603]/30 group-hover/card:scale-110 transition-transform duration-500">
                      <Award className="w-7 h-7 text-[#0a0a0a]" />
                    </div>
                    <h3 className="text-2xl font-black text-[#fec603]">
                      Notre Valeur
                    </h3>
                  </div>
                  
                  {/* Text */}
                  <p className="text-gray-200 text-lg leading-relaxed">
                    {item.valeur}
                  </p>
                </div>

                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#fec603]/10 to-transparent rounded-bl-[100px] pointer-events-none"></div>
              </div>
            </div>

            {/* MISSION - Violet theme */}
            <div className="group/card relative">
              <div className="relative p-8 bg-gradient-to-br from-[#a34ee5]/10 via-[#7828a8]/5 to-transparent rounded-2xl border-2 border-[#a34ee5]/30 hover:border-[#a34ee5]/60 transition-all duration-500 overflow-hidden">
                
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#a34ee5]/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#a34ee5] to-[#7828a8] rounded-xl flex items-center justify-center shadow-lg shadow-[#a34ee5]/30 group-hover/card:scale-110 transition-transform duration-500">
                      <Target className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-[#a34ee5]">
                      Notre Mission
                    </h3>
                  </div>
                  
                  {/* Text with bullet points if multiline */}
                  {item.mission && item.mission.includes('\n') ? (
                    <div className="space-y-3">
                      {item.mission.split('\n').filter(line => line.trim()).map((line, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="mt-2">
                            <div className="w-2 h-2 rounded-full bg-[#a34ee5] shadow-lg shadow-[#a34ee5]/50"></div>
                          </div>
                          <p className="text-gray-200 text-lg leading-relaxed flex-1">
                            {line.trim()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-200 text-lg leading-relaxed whitespace-pre-wrap">
                      {item.mission}
                    </p>
                  )}
                </div>

                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#a34ee5]/10 to-transparent rounded-bl-[100px] pointer-events-none"></div>
              </div>
            </div>
          </div>

          {/* Bottom CTA bar */}
          <div className="mx-8 md:mx-10 lg:mx-12 mb-8 p-6 bg-gradient-to-r from-[#a34ee5]/10 via-[#fec603]/10 to-[#a34ee5]/10 rounded-2xl border border-[#a34ee5]/30 backdrop-blur-sm hover:border-[#fec603]/60 transition-all duration-500">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Flame className="w-6 h-6 text-[#fec603] animate-pulse" />
                <div>
                  <h4 className="font-bold text-white text-lg">Intéressé par cette approche ?</h4>
                  <p className="text-gray-400 text-sm">Parlons de votre projet ensemble</p>
                </div>
              </div>
              <a
                href="/contacternous"
                className="group/btn relative px-8 py-4 bg-gradient-to-r from-[#a34ee5] to-[#7828a8] text-white font-bold rounded-xl overflow-hidden shadow-lg shadow-[#a34ee5]/30 hover:shadow-[#a34ee5]/60 transition-all duration-500 hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Nous contacter
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                </span>
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom gradient bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#a34ee5] via-[#fec603] to-[#a34ee5] opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-slow"></div>
      </div>
    </article>
  );
};

// ============ MAIN COMPONENT ============
const NosMissions = () => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const fetchMissions = async () => {
    try {
      setError(null);
      const res = await fetch(CONFIG.API_MISSION_LIST);
      
      if (!res.ok) {
        throw new Error(`Erreur ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const itemsData = Array.isArray(data) ? data : data.results || [];

      // Filtrer actives et trier chronologiquement
      const activeItems = itemsData
        .filter(item => item.is_active === true)
        .sort((a, b) => {
          if (a.created_at && b.created_at) {
            return new Date(a.created_at) - new Date(b.created_at);
          }
          return a.id - b.id;
        });

      setMissions(activeItems);
    } catch (err) {
      console.error("Erreur API Missions:", err);
      setError(err.message || "Une erreur est survenue lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  // Loading state
  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#a34ee5]/10 rounded-full blur-[120px] animate-float" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#fec603]/10 rounded-full blur-[120px] animate-float" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#7828a8]/10 rounded-full blur-[120px] animate-float" style={{ animationDuration: '12s', animationDelay: '4s' }}></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ 
          backgroundImage: 'radial-gradient(circle, #a34ee5 1px, transparent 1px)', 
          backgroundSize: '50px 50px' 
        }}></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 px-6 lg:px-12">
        <div className="max-w-[1600px] mx-auto text-center">
          
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-3 px-6 py-3 mb-8 bg-gradient-to-r from-[#41124f]/80 to-[#0a0a0a]/80 backdrop-blur-xl border border-[#a34ee5]/50 rounded-full shadow-2xl shadow-[#a34ee5]/20 animate-fade-in">
            <Sparkles className="w-5 h-5 text-[#fec603] animate-pulse" />
            <span className="text-sm font-bold text-[#a34ee5] uppercase tracking-wider">
              Notre ADN
            </span>
            <div className="w-2 h-2 bg-[#fec603] rounded-full animate-pulse"></div>
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black mb-8 leading-none">
            <span className="block text-white mb-4 animate-fade-in">Ce Qui</span>
            <span className="block bg-gradient-to-r from-[#a34ee5] via-[#fec603] to-[#7828a8] bg-clip-text text-transparent animate-gradient-slow animate-fade-in" style={{ animationDelay: '0.2s' }}>
              NOUS DÉFINIT
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl lg:text-3xl text-gray-400 font-light max-w-4xl mx-auto leading-relaxed mb-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            Découvrez les{" "}
            <span className="text-[#fec603] font-bold">valeurs</span>
            {" "}et{" "}
            <span className="text-[#a34ee5] font-bold">missions</span>
            {" "}qui guident chacune de nos actions
          </p>

          {/* Quick CTA */}
          <a
            href="/contacternous"
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#a34ee5] to-[#7828a8] text-white font-black text-lg rounded-2xl shadow-2xl shadow-[#a34ee5]/50 hover:shadow-[#a34ee5]/80 transition-all duration-500 hover:scale-110 group animate-fade-in"
            style={{ animationDelay: '0.6s' }}
          >
            <MessageCircle className="w-6 h-6" />
            <span>Travaillons ensemble</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </a>
        </div>
      </section>

      {/* Content Section */}
      <section className="relative py-16 md:py-24 px-6 lg:px-12">
        <div className="max-w-[1600px] mx-auto">

          {/* Error state */}
          {error && !loading && (
            <div className="max-w-2xl mx-auto">
              <div className="relative bg-[#41124f]/20 backdrop-blur-xl rounded-3xl p-12 border border-red-500/30">
                <div className="absolute -inset-1 bg-red-500/20 blur-xl"></div>
                <div className="relative text-center">
                  <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-3">Erreur de chargement</h3>
                  <p className="text-gray-400 mb-8">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300 hover:scale-105"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && missions.length === 0 && (
            <div className="max-w-2xl mx-auto">
              <div className="relative bg-[#41124f]/20 backdrop-blur-xl rounded-3xl p-12 border border-[#a34ee5]/30">
                <div className="absolute -inset-1 bg-[#a34ee5]/10 blur-xl"></div>
                <div className="relative text-center">
                  <Compass className="w-16 h-16 text-[#a34ee5] mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-3">Aucune mission trouvée</h3>
                  <p className="text-gray-400">Nos valeurs et missions arrivent bientôt !</p>
                </div>
              </div>
            </div>
          )}

          {/* Missions list */}
          {!loading && !error && missions.length > 0 && (
            <div className="space-y-16 md:space-y-24">
              {missions.map((mission, index) => (
                <MissionCard key={mission.id} item={mission} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Final CTA Section */}
      {!loading && !error && missions.length > 0 && (
        <section className="relative py-24 md:py-32 px-6 lg:px-12 border-t border-[#a34ee5]/20">
          <div className="max-w-5xl mx-auto text-center">
            
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-24 h-24 mb-10 bg-gradient-to-br from-[#a34ee5] to-[#7828a8] rounded-3xl shadow-2xl shadow-[#a34ee5]/50 animate-bounce" style={{ animationDuration: '3s' }}>
              <Target className="w-12 h-12 text-white" />
            </div>
            
            {/* Title */}
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6">
              <span className="block text-white mb-2">Prêt à</span>
              <span className="block bg-gradient-to-r from-[#a34ee5] via-[#fec603] to-[#7828a8] bg-clip-text text-transparent animate-gradient-slow">
                COLLABORER ?
              </span>
            </h2>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl lg:text-2xl text-gray-400 font-light mb-12 max-w-3xl mx-auto">
              Transformons ensemble vos{" "}
              <span className="text-[#fec603] font-bold">idées créatives</span>
              {" "}en{" "}
              <span className="text-[#a34ee5] font-bold">réalité visuelle</span>
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <a
                href="/contacternous"
                className="group relative inline-flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-[#a34ee5] to-[#7828a8] text-white font-black text-lg rounded-2xl shadow-2xl shadow-[#a34ee5]/50 hover:shadow-[#a34ee5]/80 transition-all duration-500 hover:scale-110 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#fec603] to-[#a34ee5] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative">DÉMARRER UN PROJET</span>
                <ArrowRight className="relative w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </a>

              <a
                href="mailto:contact@tekacom.gn"
                className="inline-flex items-center gap-3 px-8 py-5 bg-[#41124f]/60 border-2 border-[#a34ee5]/40 text-white font-bold text-lg rounded-2xl hover:border-[#a34ee5]/80 hover:bg-[#41124f]/80 transition-all duration-300"
              >
                <Mail className="w-6 h-6" />
                <span>contact@tekacom.gn</span>
              </a>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Users, text: "Équipe passionnée", color: "from-[#a34ee5] to-[#7828a8]" },
                { icon: TrendingUp, text: "+500 Projets", color: "from-[#fec603] to-[#a34ee5]" },
                { icon: CheckCircle, text: "Satisfaction garantie", color: "from-[#7828a8] to-[#a34ee5]" },
                { icon: Zap, text: "Réponse 24h", color: "from-[#a34ee5] to-[#fec603]" },
              ].map((badge, idx) => {
                const Icon = badge.icon;
                return (
                  <div key={idx} className="flex flex-col items-center gap-3 p-6 bg-[#41124f]/20 rounded-2xl border border-[#a34ee5]/20 hover:border-[#a34ee5]/50 transition-all backdrop-blur-sm">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${badge.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-sm text-gray-300 font-semibold text-center">{badge.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Animations CSS */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes gradient-slow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animate-float {
          animation: float ease-in-out infinite;
        }

        .animate-gradient-slow {
          background-size: 200% 200%;
          animation: gradient-slow 5s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default NosMissions;