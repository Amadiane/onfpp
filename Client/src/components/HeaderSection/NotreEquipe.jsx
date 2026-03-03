import React, { useEffect, useState } from "react";
import {
  Users,
  AlertCircle,
  Linkedin,
  Mail,
  Sparkles,
  Award,
  Zap,
  Heart,
  TrendingUp,
} from "lucide-react";
import CONFIG from "../../config/config.js";

/**
 * 🎨 PAGE NOTRE ÉQUIPE ULTRA MODERNE - TEKACOM
 * Agence de graphisme créative
 * Harmonisé avec Header/Footer (#a34ee5, #41124f, #fec603, #7828a8, #0a0a0a)
 * TRI: Du plus ancien au plus récent (gauche → droite)
 */

const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center py-32">
    <div className="relative w-24 h-24">
      <div className="absolute inset-0 border-4 border-[#a34ee5]/20 rounded-full"></div>
      <div className="absolute inset-2 border-4 border-[#fec603]/30 rounded-full animate-spin"></div>
      <div className="absolute inset-4 border-4 border-t-[#a34ee5] rounded-full animate-spin" style={{ animationDuration: '0.8s' }}></div>
      <div className="absolute inset-8 bg-gradient-to-r from-[#a34ee5] to-[#fec603] rounded-full blur-md opacity-60"></div>
    </div>
    <span className="text-gray-300 text-lg mt-8 font-bold tracking-wide animate-pulse">
      Chargement de l'équipe...
    </span>
  </div>
);

const NotreEquipe = () => {
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredMember, setHoveredMember] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const normalizeUrl = (url) => {
      if (!url) return null;
      if (url.startsWith("http")) return url;
      if (url.startsWith("/")) return `${CONFIG.BASE_URL}${url}`;
      return `${CONFIG.BASE_URL}/${url}`;
    };

    const fetchEquipe = async () => {
      try {
        setError(null);
        const res = await fetch(CONFIG.API_TEAM_LIST);
        
        if (!res.ok) {
          throw new Error(`Erreur ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        const teamData = Array.isArray(data) ? data : data.results || [];
        
        const activeMembres = teamData.filter(membre => membre.is_active === true);
        
        const normalized = activeMembres.map((m) => ({
          ...m,
          photo_url: normalizeUrl(m.photo_url || m.photo),
        }));
        
        // ✨ TRI DU PLUS ANCIEN AU PLUS RÉCENT (gauche → droite)
        const sorted = normalized.sort((a, b) => {
          // Tri par date de création si disponible
          if (a.created_at && b.created_at) {
            return new Date(a.created_at) - new Date(b.created_at);
          }
          // Sinon tri par ID (plus petit ID = plus ancien)
          return a.id - b.id;
        });
        
        setMembres(sorted);
      } catch (err) {
        console.error("Erreur API Équipe:", err);
        setError(err.message || "Une erreur est survenue lors du chargement de l'équipe");
      } finally {
        setLoading(false);
      }
    };
    fetchEquipe();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#a34ee5]/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#fec603]/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#7828a8]/10 rounded-full blur-3xl"></div>
        
        {/* Grille de points */}
        <div className="hidden md:block absolute inset-0 opacity-[0.015]" 
             style={{
               backgroundImage: 'radial-gradient(circle, #a34ee5 1px, transparent 1px)',
               backgroundSize: '40px 40px'
             }}>
        </div>
      </div>

      {/* Hero Section Ultra Moderne */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-6 lg:px-12 border-b border-[#a34ee5]/20">
        {/* Decorations */}
        <div className="absolute top-20 left-10 w-32 h-32 border-2 border-[#a34ee5]/20 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 border-2 border-[#fec603]/20 rounded-full animate-ping" style={{ animationDuration: '4s' }}></div>

        <div className="relative max-w-[1400px] mx-auto">
          
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 mb-8 bg-gradient-to-r from-[#41124f]/60 to-[#0a0a0a]/60 backdrop-blur-xl border border-[#a34ee5]/40 rounded-full shadow-lg shadow-[#a34ee5]/20">
            <Sparkles className="w-4 h-4 text-[#fec603] animate-pulse" />
            <span className="text-sm font-bold text-[#a34ee5] uppercase tracking-wider">
              Les Talents de TEKACOM
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight leading-none">
            <span className="block text-white mb-2">Notre</span>
            <span className="block bg-gradient-to-r from-[#a34ee5] via-[#fec603] to-[#7828a8] bg-clip-text text-transparent animate-gradient">
              ÉQUIPE
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl lg:text-3xl text-gray-400 font-light max-w-3xl leading-relaxed mb-8">
            Les{" "}
            <span className="text-[#fec603] font-bold">créatifs passionnés</span>{" "}
            qui donnent vie à{" "}
            <span className="text-[#a34ee5] font-bold">vos idées</span>
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mt-12">
            {[
              { icon: Users, label: "Créatifs", value: membres.length || "0", color: "from-[#a34ee5] to-[#7828a8]" },
              { icon: Award, label: "Expertise", value: "10+ ans", color: "from-[#fec603] to-[#a34ee5]" },
              { icon: Zap, label: "Projets", value: "500+", color: "from-[#7828a8] to-[#a34ee5]" },
              { icon: Heart, label: "Passion", value: "100%", color: "from-[#a34ee5] to-[#fec603]" },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={idx}
                  className="group relative bg-[#41124f]/20 backdrop-blur-sm border border-[#a34ee5]/20 hover:border-[#a34ee5]/50 rounded-2xl p-6 transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-[#a34ee5]/20"
                >
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.color} rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-500`}></div>
                  
                  <div className="relative">
                    <Icon className="w-8 h-8 text-[#a34ee5] mb-3 group-hover:text-[#fec603] transition-colors" />
                    <div className={`text-3xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                      {stat.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Grid Section */}
      <section className="relative py-16 md:py-24 px-6 lg:px-12">
        <div className="max-w-[1600px] mx-auto">

          {/* Loading State */}
          {loading && <LoadingSpinner />}

          {/* Error State */}
          {error && !loading && (
            <div className="max-w-2xl mx-auto">
              <div className="relative bg-[#41124f]/20 backdrop-blur-xl rounded-3xl p-12 border border-red-500/30 overflow-hidden">
                <div className="absolute -inset-1 bg-red-500/20 blur-xl"></div>
                
                <div className="relative text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                    <AlertCircle className="w-10 h-10 text-red-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Erreur de chargement
                  </h3>
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

          {/* Empty State */}
          {!loading && !error && membres.length === 0 && (
            <div className="max-w-2xl mx-auto">
              <div className="relative bg-[#41124f]/20 backdrop-blur-xl rounded-3xl p-12 border border-[#a34ee5]/30 overflow-hidden">
                <div className="absolute -inset-1 bg-[#a34ee5]/10 blur-xl"></div>
                
                <div className="relative text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#a34ee5]/10 border border-[#a34ee5]/30 flex items-center justify-center">
                    <Users className="w-10 h-10 text-[#a34ee5]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Aucun membre trouvé
                  </h3>
                  <p className="text-gray-400">
                    Notre équipe créative sera bientôt présentée !
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Team Grid Ultra Moderne - TRI DU PLUS ANCIEN AU PLUS RÉCENT */}
          {!loading && !error && membres.length > 0 && (
            <>
              {/* Indicateur de tri */}
              {/* <div className="mb-8 text-center">
                <p className="text-sm text-gray-500">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#41124f]/20 border border-[#a34ee5]/20 rounded-full">
                    <Users className="w-4 h-4 text-[#a34ee5]" />
                    <span>Affichage chronologique : du plus ancien membre au plus récent</span>
                  </span>
                </p>
              </div> */}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {membres.map((membre, index) => {
                  const isHovered = hoveredMember === membre.id;
                  
                  return (
                    <article
                      key={membre.id}
                      onMouseEnter={() => setHoveredMember(membre.id)}
                      onMouseLeave={() => setHoveredMember(null)}
                      className="group relative"
                      style={{
                        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                      }}
                    >
                      {/* Card Container */}
                      <div className={`relative bg-[#41124f]/20 backdrop-blur-sm rounded-3xl overflow-hidden border transition-all duration-500 ${
                        isHovered 
                          ? 'border-[#a34ee5]/80 shadow-2xl shadow-[#a34ee5]/30 scale-105 -translate-y-2' 
                          : 'border-[#a34ee5]/20 hover:border-[#a34ee5]/50'
                      }`}>
                        
                        {/* Glow effect */}
                        <div className={`absolute -inset-1 bg-gradient-to-r from-[#a34ee5] to-[#fec603] rounded-3xl opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-500`}></div>
                        
                        {/* Photo Container */}
                        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-[#0a0a0a]/40 to-[#41124f]/20">
                          
                          {/* Scan effect animé */}
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#a34ee5]/10 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000"></div>
                          
                          {/* Photo */}
                          <img
                            src={membre.photo_url || "https://placehold.co/600x800/0a0a0a/a34ee5?text=Photo"}
                            alt={membre.full_name}
                            className={`relative w-full h-full object-cover transition-all duration-500 ${
                              isHovered ? 'scale-110 brightness-110' : 'scale-100'
                            }`}
                            loading="lazy"
                            onError={(e) => {
                              e.target.src = "https://placehold.co/600x800/0a0a0a/a34ee5?text=Photo";
                            }}
                          />
                          
                          {/* Overlay gradient au hover */}
                          <div className={`absolute inset-0 bg-gradient-to-t from-[#a34ee5]/90 via-[#a34ee5]/50 to-transparent transition-opacity duration-500 ${
                            isHovered ? 'opacity-100' : 'opacity-0'
                          }`}></div>
                          
                          {/* LinkedIn badge coin supérieur */}
                          {membre.linkedin && (
                            <a
                              href={membre.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`absolute top-4 right-4 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border-2 border-white/30 flex items-center justify-center transition-all duration-500 hover:scale-110 hover:bg-white/20 ${
                                isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                              }`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Linkedin className="w-6 h-6 text-white" />
                            </a>
                          )}
                          
                          {/* Sparkle indicator */}
                          {isHovered && (
                            <div className="absolute top-4 left-4">
                              <Sparkles className="w-5 h-5 text-[#fec603] animate-pulse" />
                            </div>
                          )}

                          {/* Info overlay au hover */}
                          {isHovered && (
                            <div className="absolute bottom-0 left-0 right-0 p-6 transform transition-all duration-500">
                              {/* Contact rapide */}
                              {membre.email && (
                                <a
                                  href={`mailto:${membre.email}`}
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-white text-sm font-semibold hover:bg-white/30 transition-all"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Mail className="w-4 h-4" />
                                  <span>Contacter</span>
                                </a>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Info Card */}
                        <div className={`p-5 transition-all duration-500 ${
                          isHovered 
                            ? 'bg-gradient-to-r from-[#a34ee5]/20 to-[#fec603]/20' 
                            : 'bg-[#0a0a0a]/40'
                        }`}>
                          <h3 className={`text-lg font-black mb-1 transition-all duration-300 ${
                            isHovered 
                              ? 'text-transparent bg-gradient-to-r from-[#a34ee5] to-[#fec603] bg-clip-text' 
                              : 'text-white'
                          }`}>
                            {membre.full_name}
                          </h3>
                          
                          <p className="text-sm font-semibold text-[#fec603] mb-3">
                            {membre.position_fr || "Membre de l'équipe"}
                          </p>

                          {/* Skills tags si disponibles */}
                          {membre.skills && (
                            <div className="flex flex-wrap gap-2">
                              {membre.skills.slice(0, 2).map((skill, idx) => (
                                <span 
                                  key={idx}
                                  className="px-2 py-1 bg-[#a34ee5]/10 border border-[#a34ee5]/30 rounded-lg text-xs text-gray-400"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Barre gradient en bas */}
                        <div className={`h-1 bg-gradient-to-r from-[#a34ee5] via-[#fec603] to-[#7828a8] transition-all duration-500 ${
                          isHovered ? 'opacity-100' : 'opacity-0'
                        }`}></div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {!loading && !error && membres.length > 0 && (
        <section className="relative py-20 md:py-28 px-6 lg:px-12 border-t border-[#a34ee5]/20">
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#a34ee5]/20 rounded-full blur-3xl -translate-y-1/2 animate-pulse" style={{ animationDuration: '6s' }}></div>
          
          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-8 bg-gradient-to-br from-[#a34ee5] to-[#7828a8] rounded-3xl shadow-2xl shadow-[#a34ee5]/50">
              <TrendingUp className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6">
              <span className="block text-white mb-2">Rejoignez</span>
              <span className="block bg-gradient-to-r from-[#a34ee5] via-[#fec603] to-[#7828a8] bg-clip-text text-transparent">
                L'AVENTURE
              </span>
            </h2>
            
            <p className="text-lg md:text-xl text-gray-400 font-light mb-12 max-w-2xl mx-auto">
              Vous êtes{" "}
              <span className="text-[#fec603] font-bold">créatif</span>,{" "}
              <span className="text-[#a34ee5] font-bold">passionné</span> et prêt à relever des défis ?
            </p>

            <a
              href="/contacternous"
              className="group relative inline-flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-[#a34ee5] to-[#7828a8] text-white font-black text-lg rounded-2xl shadow-2xl shadow-[#a34ee5]/50 hover:shadow-[#a34ee5]/80 transition-all duration-500 hover:scale-110 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#fec603] to-[#a34ee5] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative">NOUS REJOINDRE</span>
              <Sparkles className="relative w-6 h-6 animate-pulse" />
            </a>
          </div>
        </section>
      )}

      {/* Animations CSS */}
      <style>{`
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
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default NotreEquipe;