import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { Search, Menu, X, Users, Award, FileText, Calendar, Palette, ChevronDown, ArrowRight } from "lucide-react";
import Logo from "./Logo";

/**
 * 🎨 NAVLINKS - HARMONISÉ AVEC PARTNER
 * Couleurs : #a34ee5 (violet), #41124f (violet profond), #fec603 (or), #7828a8 (violet foncé)
 * Background : #0a0a0a (noir profond comme Partner)
 */

const Navlinks = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const dropdownTimeoutRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = (index) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(index);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 500);
  };

  const navItems = [
    { title: "Accueil", path: "/", icon: Award },
    { 
      title: "À propos", 
      path: "/nosMissions", 
      icon: Users,
      hasDropdown: true,
      subItems: [
        { title: "Qui sommes-nous", path: "/nosMissions", icon: Users },
        { title: "Notre équipe", path: "/notreEquipe", icon: Users },
        // { title: "Notre mission", path: "/nosMissions", icon: Award },
      ]
    },
    { title: "Services", path: "/services", icon: Palette },
    { title: "Portfolio", path: "/portfolio", icon: FileText },
    { title: "Partenaires", path: "/partner", icon: FileText },
    { title: "Contact", path: "/contacternous", icon: Calendar },
  ];

  return (
    <>
      {/* HEADER - Harmonisé avec Partner (#0a0a0a background) */}
      <div className={`max-w-[1600px] mx-auto px-6 lg:px-12 transition-all duration-500 ${
        scrolled ? 'py-2' : 'py-3'
      }`}>
        <div className={`relative flex items-center justify-between transition-all duration-500 px-6 rounded-2xl ${
          scrolled 
            ? 'h-14 bg-[#0a0a0a]/95 border border-[#a34ee5]/30 shadow-[0_0_30px_rgba(163,78,229,0.2)]' 
            : 'h-16 bg-[#0a0a0a]/90 border border-[#a34ee5]/20 shadow-[0_0_20px_rgba(163,78,229,0.15)]'
        }`}>
          
          {/* Effet de brillance violet profond (#41124f) */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-[#41124f]/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
          
          {/* LOGO */}
          <Logo scrolled={scrolled} />

          {/* MENU DESKTOP */}
          <nav className="hidden lg:flex items-center gap-1.5" ref={dropdownRef}>
            {navItems.map((item, index) => {
              if (item.hasDropdown) {
                return (
                  <div 
                    key={index} 
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(index)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      className={`relative group/btn flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-500 overflow-hidden ${
                        activeDropdown === index
                          ? "text-white bg-gradient-to-r from-[#a34ee5] to-[#7828a8] shadow-[0_0_25px_rgba(163,78,229,0.5)] border border-[#fec603]/50" 
                          : "text-gray-300 hover:text-white bg-[#41124f]/30 hover:bg-[#41124f]/60 border border-transparent hover:border-[#a34ee5]/40 hover:shadow-[0_0_20px_rgba(163,78,229,0.2)]"
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000"></div>
                      <span className="relative">{item.title}</span>
                      <ChevronDown 
                        size={14} 
                        className={`relative transition-all duration-500 ${
                          activeDropdown === index 
                            ? "rotate-180 text-[#fec603] drop-shadow-[0_0_6px_rgba(254,198,3,0.8)]" 
                            : "text-gray-500 group-hover/btn:text-[#fec603]"
                        }`}
                      />
                    </button>

                    {/* DROPDOWN - Background #0a0a0a comme Partner */}
                    {activeDropdown === index && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64">
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#0a0a0a] rotate-45 border-l border-t border-[#a34ee5]/20"></div>
                        
                        <div className="relative bg-[#0a0a0a]/95 rounded-2xl border border-[#a34ee5]/20 shadow-2xl shadow-[#a34ee5]/20 overflow-hidden backdrop-blur-xl">
                          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#a34ee5] via-[#fec603] to-[#a34ee5]"></div>
                          
                          <div className="p-2">
                            {item.subItems.map((sub, i) => {
                              const SubIcon = sub.icon;
                              return (
                                <NavLink
                                  key={i}
                                  to={sub.path}
                                  onClick={() => setActiveDropdown(null)}
                                  className="group/item flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-[#a34ee5]/20 hover:to-[#fec603]/10 relative overflow-hidden hover:shadow-lg hover:shadow-[#a34ee5]/30 hover:scale-[1.02] hover:-translate-y-0.5"
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/item:translate-x-[100%] transition-transform duration-700"></div>
                                  <div className="absolute inset-0 opacity-0 group-hover/item:opacity-100 bg-gradient-to-r from-[#a34ee5]/10 via-[#fec603]/10 to-transparent blur-xl transition-opacity duration-500"></div>
                                  
                                  <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#a34ee5]/10 to-[#41124f]/20 group-hover/item:from-[#a34ee5]/30 group-hover/item:to-[#fec603]/20 flex items-center justify-center transition-all duration-300 group-hover/item:scale-110 group-hover/item:rotate-3 shadow-lg shadow-[#a34ee5]/0 group-hover/item:shadow-[#a34ee5]/50">
                                    <SubIcon size={16} className="text-[#a34ee5] group-hover/item:text-[#fec603] transition-all duration-300 group-hover/item:scale-110" />
                                  </div>
                                  
                                  <span className="relative flex-1 text-sm font-semibold text-gray-300 group-hover/item:text-white transition-all duration-300 group-hover/item:translate-x-0.5">
                                    {sub.title}
                                  </span>
                                  
                                  <ArrowRight 
                                    size={16} 
                                    className="relative text-[#fec603] opacity-0 group-hover/item:opacity-100 -translate-x-3 group-hover/item:translate-x-0 transition-all duration-300 drop-shadow-[0_0_8px_rgba(254,198,3,0.6)] group-hover/item:animate-pulse"
                                  />
                                </NavLink>
                              );
                            })}
                          </div>

                          <div className="px-4 py-2.5 bg-gradient-to-r from-[#41124f]/20 to-[#fec603]/5 border-t border-[#a34ee5]/10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#fec603]/10 to-transparent animate-pulse"></div>
                            <p className="text-xs text-gray-500 text-center font-medium relative">
                              Découvrez <span className="text-[#fec603] font-bold">TEKACOM</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <NavLink
                  key={index}
                  to={item.path}
                  className={({ isActive }) =>
                    `relative group px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-500 overflow-hidden border ${
                      isActive 
                        ? "text-white bg-gradient-to-r from-[#a34ee5] to-[#7828a8] shadow-[0_0_25px_rgba(163,78,229,0.5)] border-[#fec603]/50" 
                        : "text-gray-300 hover:text-white bg-[#41124f]/30 hover:bg-[#41124f]/60 border-transparent hover:border-[#a34ee5]/40 hover:shadow-[0_0_20px_rgba(163,78,229,0.2)]"
                    }`
                  }
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></span>
                  <span className="relative">{item.title}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* ACTIONS */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSearchOpen(true)} 
              className="relative p-3 rounded-xl bg-[#41124f]/50 hover:bg-[#41124f] transition-all duration-500 group hidden lg:block border border-[#a34ee5]/20 hover:border-[#a34ee5]/60 hover:shadow-[0_0_20px_rgba(163,78,229,0.3)] overflow-hidden"
            >
              <div className="absolute inset-0 rounded-xl bg-[#a34ee5]/20 opacity-0 group-hover:opacity-100 group-hover:scale-150 blur-xl transition-all duration-700"></div>
              <Search size={16} className="relative text-[#a34ee5] group-hover:text-[#fec603] transition-all duration-500 group-hover:scale-110 group-hover:rotate-12" />
            </button>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="relative lg:hidden p-3 rounded-xl bg-[#41124f]/50 hover:bg-[#41124f] transition-all duration-500 border border-[#a34ee5]/20 hover:border-[#a34ee5]/60 hover:shadow-[0_0_20px_rgba(163,78,229,0.3)] overflow-hidden group"
            >
              <div className="absolute inset-0 rounded-xl bg-[#a34ee5]/20 opacity-0 group-hover:opacity-100 group-hover:scale-150 blur-xl transition-all duration-700"></div>
              {mobileMenuOpen ? (
                <X size={20} className="relative text-[#a34ee5] group-hover:text-[#fec603] transition-all duration-500 group-hover:rotate-90" />
              ) : (
                <Menu size={20} className="relative text-[#a34ee5] group-hover:text-[#fec603] transition-all duration-500" />
              )}
            </button>
          </div>
        </div>

        {/* MENU MOBILE */}
        {mobileMenuOpen && (
          <div className="relative lg:hidden pb-6 pt-4 space-y-2 mt-3 px-4 rounded-2xl bg-[#0a0a0a]/95 backdrop-blur-2xl border border-[#a34ee5]/30 shadow-[0_0_40px_rgba(163,78,229,0.2)]">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#fec603] to-transparent"></div>
            
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index}>
                  <NavLink
                    to={item.path}
                    onClick={() => !item.subItems && setMobileMenuOpen(false)}
                    className="relative flex items-center gap-3 px-5 py-3.5 rounded-xl text-white hover:bg-gradient-to-r hover:from-[#a34ee5]/20 hover:to-[#fec603]/10 transition-all duration-500 border border-transparent hover:border-[#a34ee5]/40 overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    <div className="relative w-8 h-8 rounded-lg bg-[#a34ee5]/10 group-hover:bg-[#a34ee5]/30 flex items-center justify-center transition-all duration-500">
                      <Icon size={16} className="text-[#a34ee5] group-hover:text-[#fec603] transition-all duration-500" />
                    </div>
                    <span className="relative font-bold text-sm tracking-wide">{item.title}</span>
                  </NavLink>
                  
                  {item.subItems && (
                    <div className="ml-10 mt-2 space-y-1.5 pl-3 border-l-2 border-[#a34ee5]/30">
                      {item.subItems.map((sub, i) => (
                        <NavLink
                          key={i}
                          to={sub.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-400 hover:text-[#fec603] transition-all duration-500 rounded-lg hover:bg-[#a34ee5]/10 border border-transparent hover:border-[#a34ee5]/20 group"
                        >
                          <ArrowRight size={12} className="text-[#fec603] group-hover:translate-x-1 transition-transform duration-500" />
                          <span className="font-medium">{sub.title}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SEARCH MODAL */}
      {searchOpen && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-start justify-center pt-32 px-4 z-[101]"
          onClick={() => setSearchOpen(false)}
        >
          <div 
            className="relative w-full max-w-2xl bg-[#0a0a0a]/95 backdrop-blur-2xl rounded-3xl p-8 border border-[#a34ee5]/40 shadow-[0_0_60px_rgba(163,78,229,0.4)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#a34ee5] via-[#fec603] to-[#a34ee5]"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#a34ee5]/10 rounded-full blur-3xl opacity-50"></div>
            
            <div className="relative flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-gray-300 uppercase tracking-[0.2em] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#a34ee5]/20 to-[#fec603]/20 flex items-center justify-center">
                  <Search size={18} className="text-[#fec603]" />
                </div>
                Rechercher
              </h3>
              <button
                onClick={() => setSearchOpen(false)}
                className="relative p-2.5 hover:bg-white/10 rounded-xl transition-all duration-500 group border border-transparent hover:border-[#a34ee5]/40"
              >
                <div className="absolute inset-0 rounded-xl bg-[#a34ee5]/20 opacity-0 group-hover:opacity-100 group-hover:scale-150 blur-lg transition-all duration-500"></div>
                <X size={20} className="relative text-gray-400 group-hover:text-[#fec603] transition-colors duration-500 group-hover:rotate-90" />
              </button>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#a34ee5] via-[#fec603] to-[#a34ee5] rounded-2xl opacity-0 group-focus-within:opacity-100 blur transition-all duration-500"></div>
              <input
                type="text"
                placeholder="Ex: design, vidéo, site web..."
                autoFocus
                className="relative w-full px-6 py-4 bg-[#41124f]/40 border-2 border-[#a34ee5]/30 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-[#a34ee5] focus:shadow-[0_0_30px_rgba(163,78,229,0.3)] transition-all duration-500 font-medium"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-gradient-to-br from-[#a34ee5] to-[#7828a8] flex items-center justify-center shadow-lg shadow-[#a34ee5]/50">
                <Search size={18} className="text-white" />
              </div>
            </div>
            
            <div className="relative mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
              <div className="px-3 py-1 rounded-lg bg-[#a34ee5]/10 border border-[#a34ee5]/30 font-mono">Enter</div>
              <span>pour rechercher</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navlinks;