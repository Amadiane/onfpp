import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  ArrowRight,
  Sparkles,
  Palette,
  Video,
  Printer,
  Globe,
  Users,
  GraduationCap,
  Lightbulb,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import CONFIG from "../../config/config.js";
// import Logo from "../Header/Logo";

/**
 * 🎨 FOOTER ULTRA MODERNE - TEKACOM
 * Agence de communication & digital
 * Charte : #a34ee5 (violet), #41124f (violet profond), #fec603 (or), #7828a8 (violet foncé)
 * 
 * Améliorations :
 * ✅ Toast notification visible et accessible
 * ✅ Performance optimisée mobile (blur réduits)
 * ✅ ARIA labels pour accessibilité
 * ✅ Meilleur contrast WCAG
 * ✅ Animation fade-in au scroll
 * ✅ Loading state amélioré
 */

// Ajouter les keyframes pour l'animation
const styles = `
  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
`;

const Footer = () => {
  const [email, setEmail] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success"); // "success" | "error"
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = React.useRef(null);

  // Intersection Observer pour fade-in
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, []);

  const showNotification = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    
    setTimeout(() => {
      setShowToast(false);
    }, 5000);
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(CONFIG.API_NEWSLETTER_CREATE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        showNotification("🎉 Merci ! Vous êtes maintenant inscrit à notre newsletter.", "success");
        setEmail("");
      } else {
        showNotification(
          data.error || data.message || "⚠️ Une erreur est survenue. Veuillez réessayer.",
          "error"
        );
      }
    } catch (err) {
      console.error("Erreur :", err);
      showNotification("⚠️ Erreur de connexion. Veuillez réessayer plus tard.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const services = [
    { label: "Communication visuelle", href: "/services", icon: Palette },
    { label: "Production audiovisuelle", href: "/services", icon: Video },
    { label: "Impression numérique", href: "/services", icon: Printer },
    { label: "Conception sites web", href: "/services", icon: Globe },
    { label: "Community management", href: "/services", icon: Users },
    { label: "Formation", href: "/services", icon: GraduationCap },
    { label: "Consulting", href: "/services", icon: Lightbulb },
    { label: "Organisation événements", href: "/services", icon: Calendar },
  ];

  const quickLinks = [
    { label: "Accueil", href: "/" },
    { label: "À propos", href: "/nosMissions" },
    { label: "Notre équipe", href: "/notreEquipe" },
    { label: "Notre mission", href: "/nosMissions" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Partenaires", href: "/partner" },
    { label: "Contact", href: "/contacternous" },
  ];

  const socialLinks = [
    { 
      name: "Facebook", 
      icon: Facebook, 
      url: "https://facebook.com/tekacom", 
      color: "hover:text-blue-400",
      gradient: "from-blue-600 to-blue-400"
    },
    { 
      name: "Instagram", 
      icon: Instagram, 
      url: "https://instagram.com/tekacom", 
      color: "hover:text-pink-400",
      gradient: "from-pink-600 via-purple-600 to-orange-500"
    },
    { 
      name: "LinkedIn", 
      icon: Linkedin, 
      url: "https://linkedin.com/company/tekacom", 
      color: "hover:text-blue-500",
      gradient: "from-blue-700 to-blue-500"
    },
    { 
      name: "YouTube", 
      icon: Youtube, 
      url: "https://youtube.com/@tekacom", 
      color: "hover:text-red-500",
      gradient: "from-red-600 to-red-400"
    },
  ];

  const contactInfo = [
    { 
      icon: MapPin, 
      text: "Conakry, Guinée", 
      color: "text-[#fec603]",
      bgColor: "bg-[#fec603]/10",
      link: "https://maps.app.goo.gl/2gya1yBW9QCu4Lt36"
    },
    { 
      icon: Phone, 
      text: "+224 611 92 98 92", 
      color: "text-[#a34ee5]",
      bgColor: "bg-[#a34ee5]/10",
      link: "tel:+224626741478"
    },
    { 
      icon: Mail, 
      text: "contact@tekacom.gn", 
      color: "text-[#fec603]",
      bgColor: "bg-[#fec603]/10",
      link: "mailto:contact@tekacom.gn"
    },
  ];

  return (
    <>
      {/* CSS Animations */}
      <style>{styles}</style>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 right-6 z-[9999] animate-in slide-in-from-right duration-500">
          <div className={`relative max-w-md ${
            toastType === "success" 
              ? "bg-gradient-to-r from-green-500/90 to-emerald-600/90" 
              : "bg-gradient-to-r from-red-500/90 to-rose-600/90"
          } backdrop-blur-xl rounded-2xl p-5 border ${
            toastType === "success" ? "border-green-400/50" : "border-red-400/50"
          } shadow-2xl shadow-black/50`}
          role="alert"
          aria-live="polite"
          >
            {/* Glow effect */}
            <div className={`absolute -inset-1 ${
              toastType === "success" ? "bg-green-400/30" : "bg-red-400/30"
            } rounded-2xl blur-xl -z-10`}></div>
            
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl ${
                toastType === "success" ? "bg-white/20" : "bg-white/20"
              } flex items-center justify-center flex-shrink-0`}>
                {toastType === "success" ? (
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              
              {/* Message */}
              <div className="flex-1">
                <p className="text-white font-bold text-sm mb-1">
                  {toastType === "success" ? "Succès !" : "Erreur"}
                </p>
                <p className="text-white/90 text-sm leading-relaxed">
                  {toastMessage}
                </p>
              </div>
              
              {/* Close button */}
              <button
                onClick={() => setShowToast(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-all"
                aria-label="Fermer la notification"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-2xl overflow-hidden">
              <div className="h-full bg-white/60 animate-[shrink_5s_linear]" style={{
                animation: 'shrink 5s linear forwards'
              }}></div>
            </div>
          </div>
        </div>
      )}

      <footer 
        ref={footerRef}
        className={`relative bg-[#0a0a0a] border-t border-[#a34ee5]/20 overflow-hidden transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
      
      {/* Effets de fond optimisés pour mobile */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Gradients lumineux - réduits sur mobile */}
        <div className="absolute -top-40 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-[#a34ee5]/10 rounded-full blur-2xl sm:blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-[#fec603]/10 rounded-full blur-2xl sm:blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 w-64 h-64 sm:w-96 sm:h-96 bg-[#7828a8]/10 rounded-full blur-2xl sm:blur-3xl"></div>
        
        {/* Grille de points - cachée sur mobile pour performance */}
        <div className="hidden sm:block absolute inset-0 opacity-[0.02]" 
             style={{
               backgroundImage: 'radial-gradient(circle, #a34ee5 1px, transparent 1px)',
               backgroundSize: '50px 50px'
             }}>
        </div>
      </div>

      {/* Section principale */}
      <div className="relative max-w-[1600px] mx-auto px-6 lg:px-12 py-16 md:py-20">
        
        {/* Top Section - Logo + CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 pb-16 border-b border-[#a34ee5]/20">
          
          {/* Logo + Description */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                {/* Glow effect
                <div className="absolute inset-0 bg-gradient-to-r from-[#a34ee5]/30 to-[#fec603]/30 rounded-2xl blur-xl"></div>
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#41124f] to-[#0a0a0a] border border-[#a34ee5]/30 flex items-center justify-center overflow-hidden shadow-lg shadow-[#a34ee5]/20">
                  <Logo scrolled={false} />
                </div> */}
              </div>
              <div>
                <h3 className="text-3xl font-black text-white tracking-tight">
                  <span className="text-gradient bg-gradient-to-r from-[#a34ee5] to-[#fec603] bg-clip-text text-transparent">
                    TEKACOM
                  </span>
                </h3>
                <p className="text-sm text-[#fec603] font-bold tracking-wide">
                  Inspirer • Créer • Impacter
                </p>
              </div>
            </div>

            <p className="text-gray-400 text-base leading-relaxed max-w-xl">
              Agence guinéenne multidisciplinaire spécialisée dans la{" "}
              <span className="text-[#a34ee5] font-semibold">communication</span> et le{" "}
              <span className="text-[#fec603] font-semibold">digital</span>. 
              Nous proposons des solutions globales et créatives pour donner vie à vos projets.
            </p>

            {/* Contact Info Cards */}
            <div className="space-y-3 pt-4">
              {contactInfo.map((item, idx) => {
                const Icon = item.icon;
                const content = (
                  <div className={`group flex items-center gap-3 p-4 rounded-xl bg-[#41124f]/20 border border-[#a34ee5]/20 hover:border-[#a34ee5]/40 transition-all duration-500 ${item.link ? 'cursor-pointer hover:scale-[1.02]' : ''}`}>
                    <div className={`w-10 h-10 rounded-lg ${item.bgColor} flex items-center justify-center transition-all duration-500 group-hover:scale-110`}>
                      <Icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <span className="text-gray-300 text-sm font-medium group-hover:text-white transition-colors">
                      {item.text}
                    </span>
                    {item.link && (
                      <ExternalLink className="w-4 h-4 text-[#a34ee5] opacity-0 group-hover:opacity-100 ml-auto transition-all" />
                    )}
                  </div>
                );
                
                return item.link ? (
                  <a 
                    key={idx} 
                    href={item.link}
                    target={item.link.startsWith('http') ? '_blank' : undefined}
                    rel={item.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {content}
                  </a>
                ) : (
                  <div key={idx}>{content}</div>
                );
              })}
            </div>
          </div>

          {/* Newsletter */}
          <div className="relative">
            {/* Decoration */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-[#a34ee5]/20 to-[#fec603]/20 rounded-full blur-2xl"></div>
            
            <div className="relative bg-gradient-to-br from-[#41124f]/40 to-[#0a0a0a]/40 backdrop-blur-sm rounded-2xl p-8 border border-[#a34ee5]/30 shadow-xl shadow-[#a34ee5]/10">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-[#a34ee5]/10 backdrop-blur-sm border border-[#a34ee5]/30 rounded-full">
                <Sparkles className="w-4 h-4 text-[#fec603]" />
                <span className="text-sm font-semibold text-[#a34ee5]">
                  Newsletter
                </span>
              </div>

              <h4 className="text-2xl font-black text-white mb-3">
                Restez <span className="text-gradient bg-gradient-to-r from-[#a34ee5] to-[#fec603] bg-clip-text text-transparent">informé</span>
              </h4>
              
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Recevez nos actualités, projets créatifs et conseils directement dans votre boîte mail.
              </p>

              <form onSubmit={handleSubscribe} className="space-y-4">
                <div className="relative group">
                  {/* Glow effect renforcé sur mobile */}
                  <div className="absolute -inset-1 sm:-inset-0.5 bg-gradient-to-r from-[#a34ee5] to-[#fec603] rounded-xl opacity-20 sm:opacity-0 group-focus-within:opacity-100 blur-sm sm:blur transition-all duration-500"></div>
                  
                  <div className="relative flex">
                    <input
                      type="email"
                      value={email}
                      placeholder="votre@email.com"
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="flex-1 px-5 py-4 bg-[#41124f]/60 text-white border-2 border-[#a34ee5]/30 rounded-l-xl focus:outline-none focus:border-[#a34ee5] placeholder-gray-500 font-medium transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Adresse email pour la newsletter"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 bg-gradient-to-r from-[#a34ee5] to-[#7828a8] text-white font-bold rounded-r-xl hover:shadow-lg hover:shadow-[#a34ee5]/50 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[100px] sm:min-w-[120px] justify-center"
                      aria-label={isSubmitting ? "Envoi en cours" : "S'inscrire à la newsletter"}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
                          <span className="hidden sm:inline text-sm">Envoi...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span className="hidden sm:inline">S'inscrire</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-16">
          
          {/* Nos Services */}
          <div>
            <h4 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-[#a34ee5] to-[#fec603] rounded-full"></div>
              Nos Services
            </h4>
            <ul className="space-y-2.5">
              {services.slice(0, 4).map((service, idx) => {
                const Icon = service.icon;
                return (
                  <li key={idx}>
                    <NavLink
                      to={service.href}
                      className="group flex items-center gap-2 text-gray-300 hover:text-[#fec603] text-sm transition-all duration-300 focus:outline-none focus:text-[#fec603]"
                      aria-label={service.label}
                    >
                      <Icon className="w-4 h-4 text-[#a34ee5] group-hover:text-[#fec603] transition-colors" aria-hidden="true" />
                      <span>{service.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Plus de Services */}
          <div>
            <h4 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-[#7828a8] to-[#a34ee5] rounded-full"></div>
              Expertises
            </h4>
            <ul className="space-y-2.5">
              {services.slice(4).map((service, idx) => {
                const Icon = service.icon;
                return (
                  <li key={idx}>
                    <NavLink
                      to={service.href}
                      className="group flex items-center gap-2 text-gray-300 hover:text-[#fec603] text-sm transition-all duration-300 focus:outline-none focus:text-[#fec603]"
                      aria-label={service.label}
                    >
                      <Icon className="w-4 h-4 text-[#a34ee5] group-hover:text-[#fec603] transition-colors" aria-hidden="true" />
                      <span>{service.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Liens Rapides */}
          <div>
            <h4 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-[#fec603] to-[#a34ee5] rounded-full"></div>
              Navigation
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <NavLink
                    to={link.href}
                    className="group flex items-center gap-2 text-gray-300 hover:text-[#a34ee5] text-sm transition-all duration-300 focus:outline-none focus:text-[#a34ee5]"
                    aria-label={link.label}
                  >
                    <ArrowRight className="w-3 h-3 text-[#a34ee5] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" aria-hidden="true" />
                    <span>{link.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Réseaux Sociaux */}
          <div>
            <h4 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-[#a34ee5] to-[#7828a8] rounded-full"></div>
              Suivez-nous
            </h4>
            <div className="space-y-3">
              {socialLinks.map((social, idx) => {
                const Icon = social.icon;
                return (
                  <a
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 p-3 rounded-xl bg-[#41124f]/20 border border-[#a34ee5]/20 hover:border-[#a34ee5]/40 transition-all duration-500 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#a34ee5] focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
                    aria-label={`Suivez-nous sur ${social.name}`}
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${social.gradient} flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-110`}>
                      <Icon className="w-5 h-5 text-white" aria-hidden="true" />
                    </div>
                    <span className="text-gray-200 text-sm font-medium group-hover:text-white transition-colors">
                      {social.name}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#a34ee5]/20"></div>
          </div>
          <div className="relative flex justify-center">
            <div className="bg-[#0a0a0a] px-4">
              <div className="w-2 h-2 bg-gradient-to-r from-[#a34ee5] to-[#fec603] rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <div className="text-gray-500 text-center md:text-left">
            © {new Date().getFullYear()}{" "}
            <span className="font-black text-gradient bg-gradient-to-r from-[#a34ee5] to-[#fec603] bg-clip-text text-transparent">
              TEKACOM
            </span>
            . Tous droits réservés.
          </div>

          <div className="flex items-center gap-6 text-gray-500">
            <a href="/mentions-legales" className="hover:text-[#a34ee5] transition-colors">
              Mentions légales
            </a>
            <span>•</span>
            <a href="/politique-confidentialite" className="hover:text-[#a34ee5] transition-colors">
              Confidentialité
            </a>
            <span>•</span>
            <a href="/cgv" className="hover:text-[#a34ee5] transition-colors">
              CGV
            </a>
          </div>
        </div>

        {/* Made with love badge */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-600">
            Créé avec <span className="text-red-500">♥</span> par{" "}
            <span className="text-[#fec603] font-semibold">TEKACOM</span>
          </p>
        </div>
      </div>

      {/* Gradient line at bottom */}
      <div className="h-1 bg-gradient-to-r from-[#a34ee5] via-[#fec603] to-[#7828a8]"></div>
      </footer>
    </>
  );
};

export default Footer;