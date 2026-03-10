// AddUser.jsx - VERSION CORRIGÉE COMPLÈTE
// Fond blanc + Centrage + Filtres fonctionnels

import React, { useState, useEffect } from "react";
import CONFIG from "../../config/config.js";

// ══════════════════════════════════════════════════════════════════
//  CONFIGURATION NIVEAUX
// ══════════════════════════════════════════════════════════════════

const NIVEAUX = {
  100: { label: "Directeur Général", emoji: "👑", color: "violet" },
  90: { label: "DG Adjoint", emoji: "🎖️", color: "purple" },
  70: { label: "Chef de Division", emoji: "📊", color: "or" },
  60: { label: "Chef de Section", emoji: "📋", color: "blue" },
  50: { label: "Chef d'Antenne", emoji: "🏢", color: "orange" },
  30: { label: "Conseiller", emoji: "💼", color: "green" },
};

// ══════════════════════════════════════════════════════════════════
//  HELPER: API REQUEST
// ══════════════════════════════════════════════════════════════════

const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem("access_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${CONFIG.BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Erreur ${response.status}`);
  }

  return response.json();
};

// ══════════════════════════════════════════════════════════════════
//  COMPOSANT: TOAST
// ══════════════════════════════════════════════════════════════════

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "bg-[#0BA376]" : "bg-[#E53935]";

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div
        className={`${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px]`}
      >
        <span className="text-2xl">
          {type === "success" ? "✓" : "✕"}
        </span>
        <p className="font-medium">{message}</p>
        <button
          onClick={onClose}
          className="ml-auto text-white/80 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
//  COMPOSANT: MODAL GESTION ACCÈS
// ══════════════════════════════════════════════════════════════════

const UserAccessModal = ({ user, onClose, onSave }) => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccess = async () => {
      try {
        const data = await apiRequest(
          `/api/page-access/user-summary/?user=${user.id}`
        );
        setPages(data);
      } catch (error) {
        console.error("Erreur chargement accès:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAccess();
  }, [user.id]);

  const handleToggle = (pageId) => {
    setPages((prev) =>
      prev.map((p) =>
        p.page_id === pageId ? { ...p, final_access: !p.final_access } : p
      )
    );
  };

  const handleSave = async () => {
    try {
      const accesses = pages
        .filter((p) => p.final_access !== p.base_access)
        .map((p) => ({
          page_id: p.page_id,
          is_allowed: p.final_access,
          note: p.final_access ? "Accès forcé" : "Accès bloqué",
        }));

      await apiRequest("/api/page-access/bulk-set/", {
        method: "POST",
        body: JSON.stringify({
          user_id: user.id,
          accesses,
        }),
      });

      onSave("Accès mis à jour avec succès !");
    } catch (error) {
      onSave(`Erreur: ${error.message}`, "error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#a34ee5] to-[#7828a8] text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Gérer les Accès</h2>
              <p className="text-white/80 mt-1">
                {user.username} — {NIVEAUX[user.niveau_acces]?.label}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-3xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)]">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#a34ee5] border-t-transparent mx-auto"></div>
              <p className="text-gray-600 mt-4">Chargement...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pages.map((page) => {
                const isCustom = page.override || page.final_access !== page.base_access;
                return (
                  <div
                    key={page.page_id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      page.final_access
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {page.page_label}
                          </h3>
                          {isCustom && (
                            <span className="px-2 py-1 bg-[#fec603] text-black text-xs font-bold rounded">
                              PERSONNALISÉ
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {page.page_description || page.page_key}
                        </p>
                      </div>

                      <button
                        onClick={() => handleToggle(page.page_id)}
                        className={`ml-4 px-4 py-2 rounded-lg font-semibold transition-all ${
                          page.final_access
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : "bg-red-500 hover:bg-red-600 text-white"
                        }`}
                      >
                        {page.final_access ? "🔓 Autorisé" : "🔒 Bloqué"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-semibold transition-all"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-[#a34ee5] to-[#7828a8] hover:from-[#8a3bc7] hover:to-[#6520a0] text-white rounded-xl font-semibold transition-all disabled:opacity-50"
          >
            💾 Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
//  COMPOSANT: MODAL AJOUT UTILISATEUR
// ══════════════════════════════════════════════════════════════════

const AddUserModal = ({ onClose, onSuccess, divisions, antennes }) => {
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    username: "",
    telephone: "",
    niveau: "",
    division: "",
    antenne_onfpp: "",
    password: "",
    password_confirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (formData.password !== formData.password_confirm) {
        throw new Error("Les mots de passe ne correspondent pas");
      }

      // Préparation des données
      const payload = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
        role_name: NIVEAUX[formData.niveau]?.label,
      };

      // Division pour 70, 60, 30
      if ([70, 60, 30].includes(parseInt(formData.niveau))) {
        payload.division = formData.division;
      }

      // Antenne pour 50
      if (parseInt(formData.niveau) === 50) {
        payload.antenne_onfpp = formData.antenne_onfpp;
      }

      await apiRequest("/api/users/create/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      onSuccess("Utilisateur créé avec succès !");
    } catch (error) {
      onSuccess(`Erreur: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const niveau = parseInt(formData.niveau);
  const needsDivision = [70, 60, 30].includes(niveau);
  const needsAntenne = niveau === 50;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#a34ee5] to-[#7828a8] text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">➕ Nouvel Utilisateur</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-3xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📧 Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-[#a34ee5] focus:ring-2 focus:ring-[#a34ee5]/20 outline-none transition-all"
                placeholder="exemple@onfpp.gn"
              />
            </div>

            {/* Nom */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                👤 Nom *
              </label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-[#a34ee5] focus:ring-2 focus:ring-[#a34ee5]/20 outline-none transition-all"
                placeholder="Diallo"
              />
            </div>

            {/* Prénom */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                👤 Prénom *
              </label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-[#a34ee5] focus:ring-2 focus:ring-[#a34ee5]/20 outline-none transition-all"
                placeholder="Mamadou"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🔑 Nom d'utilisateur *
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-[#a34ee5] focus:ring-2 focus:ring-[#a34ee5]/20 outline-none transition-all"
                placeholder="mdiallo"
              />
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📱 Téléphone
              </label>
              <input
                type="tel"
                value={formData.telephone}
                onChange={(e) =>
                  setFormData({ ...formData, telephone: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-[#a34ee5] focus:ring-2 focus:ring-[#a34ee5]/20 outline-none transition-all"
                placeholder="+224 XXX XX XX XX"
              />
            </div>

            {/* Niveau */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🎯 Niveau d'accès *
              </label>
              <select
                required
                value={formData.niveau}
                onChange={(e) =>
                  setFormData({ ...formData, niveau: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-[#a34ee5] focus:ring-2 focus:ring-[#a34ee5]/20 outline-none transition-all"
              >
                <option value="">Sélectionnez un niveau</option>
                {Object.entries(NIVEAUX).map(([val, { label, emoji }]) => (
                  <option key={val} value={val}>
                    {emoji} {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Division (si 70, 60, 30) */}
            {needsDivision && (
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🏢 Division *
                </label>
                <select
                  required
                  value={formData.division}
                  onChange={(e) =>
                    setFormData({ ...formData, division: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-[#a34ee5] focus:ring-2 focus:ring-[#a34ee5]/20 outline-none transition-all"
                >
                  <option value="">Sélectionnez une division</option>
                  {divisions.map((div) => (
                    <option key={div.code} value={div.code}>
                      {div.nom}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Antenne (si 50) */}
            {needsAntenne && (
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📍 Antenne *
                </label>
                <select
                  required
                  value={formData.antenne_onfpp}
                  onChange={(e) =>
                    setFormData({ ...formData, antenne_onfpp: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-[#a34ee5] focus:ring-2 focus:ring-[#a34ee5]/20 outline-none transition-all"
                >
                  <option value="">Sélectionnez une antenne</option>
                  {antennes.map((ant) => (
                    <option key={ant.code} value={ant.code}>
                      {ant.nom}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Mot de passe */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🔒 Mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-[#a34ee5] focus:ring-2 focus:ring-[#a34ee5]/20 outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {/* Confirmation mot de passe */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🔒 Confirmer le mot de passe *
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={formData.password_confirm}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password_confirm: e.target.value,
                  })
                }
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-[#a34ee5] focus:ring-2 focus:ring-[#a34ee5]/20 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-semibold transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#a34ee5] to-[#7828a8] hover:from-[#8a3bc7] hover:to-[#6520a0] text-white rounded-xl font-semibold transition-all disabled:opacity-50"
            >
              {loading ? "⏳ Création..." : "✅ Créer l'utilisateur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
//  COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════════════════

export default function AddUser() {
  const [users, setUsers] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [antennes, setAntennes] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    niveau: "",
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState(null);

  // ── Load Data ─────────────────────────────────────────────────
  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, constantsData] = await Promise.all([
        apiRequest("/api/users/"),
        apiRequest("/api/constants/"),
      ]);

      setUsers(usersData);
      setDivisions(constantsData.divisions || []);
      setAntennes(constantsData.antennes || []);
      setNiveaux(constantsData.niveaux || []);
    } catch (error) {
      console.error("Erreur chargement:", error);
      setToast({ message: `Erreur: ${error.message}`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ── Stats ─────────────────────────────────────────────────────
  const stats = {
    total: users.length,
    direction: users.filter((u) => u.niveau_acces >= 90).length,
    staff: users.filter((u) => u.niveau_acces < 90).length,
  };

  // ── Filtrage ──────────────────────────────────────────────────
  const filteredUsers = users.filter((user) => {
    const matchSearch =
      !filters.search ||
      user.username?.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.first_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email?.toLowerCase().includes(filters.search.toLowerCase());

    const matchNiveau =
      !filters.niveau || user.niveau_acces === parseInt(filters.niveau);

    return matchSearch && matchNiveau;
  });

  // ── Handlers ──────────────────────────────────────────────────
  const handleSuccess = (message, type = "success") => {
    setToast({ message, type });
    setShowAddModal(false);
    setSelectedUser(null);
    loadData();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Modals */}
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleSuccess}
          divisions={divisions}
          antennes={antennes}
        />
      )}

      {selectedUser && (
        <UserAccessModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={handleSuccess}
        />
      )}

      {/* Container Principal avec Padding Top */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header avec espace en haut */}
        <div className="mb-8 pt-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            👥 Gestion des Utilisateurs
          </h1>
          <p className="text-gray-600">
            Administrez les comptes et les accès de votre équipe
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-[#a34ee5] to-[#7828a8] text-white p-6 rounded-2xl shadow-lg">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-4xl font-bold mb-1">{stats.total}</div>
            <div className="text-white/80">Utilisateurs total</div>
          </div>

          <div className="bg-gradient-to-br from-[#fec603] to-[#f5a800] text-white p-6 rounded-2xl shadow-lg">
            <div className="text-3xl mb-2">👑</div>
            <div className="text-4xl font-bold mb-1">{stats.direction}</div>
            <div className="text-white/80">Direction</div>
          </div>

          <div className="bg-gradient-to-br from-[#0BA376] to-[#078a5e] text-white p-6 rounded-2xl shadow-lg">
            <div className="text-3xl mb-2">💼</div>
            <div className="text-4xl font-bold mb-1">{stats.staff}</div>
            <div className="text-white/80">Staff</div>
          </div>
        </div>

        {/* Filtres et Actions */}
        <div className="bg-gray-50 p-6 rounded-2xl shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Rechercher par nom, email..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-[#a34ee5] focus:ring-2 focus:ring-[#a34ee5]/20 outline-none transition-all"
              />
            </div>

            {/* Filtre Niveau */}
            <select
              value={filters.niveau}
              onChange={(e) =>
                setFilters({ ...filters, niveau: e.target.value })
              }
              className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-[#a34ee5] focus:ring-2 focus:ring-[#a34ee5]/20 outline-none transition-all"
            >
              <option value="">🎯 Tous les niveaux</option>
              {Object.entries(NIVEAUX).map(([val, { label, emoji }]) => (
                <option key={val} value={val}>
                  {emoji} {label}
                </option>
              ))}
            </select>

            {/* Bouton Ajouter */}
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#a34ee5] to-[#7828a8] hover:from-[#8a3bc7] hover:to-[#6520a0] text-white rounded-xl font-semibold transition-all shadow-lg"
            >
              ➕ Nouvel Utilisateur
            </button>
          </div>
        </div>

        {/* Liste Utilisateurs */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#a34ee5] border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Chargement des utilisateurs...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => {
              const niveauInfo = NIVEAUX[user.niveau_acces] || {};
              return (
                <div
                  key={user.id}
                  className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-[#a34ee5] hover:shadow-xl transition-all group"
                >
                  {/* Emoji Niveau */}
                  <div className="text-5xl mb-4">{niveauInfo.emoji || "👤"}</div>

                  {/* Nom */}
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {user.first_name} {user.last_name}
                  </h3>

                  {/* Username */}
                  <p className="text-sm text-gray-500 mb-3">@{user.username}</p>

                  {/* Badge Niveau */}
                  <div className="inline-block px-3 py-1 bg-[#a34ee5]/10 text-[#a34ee5] rounded-lg text-sm font-semibold mb-4">
                    {niveauInfo.label || "Utilisateur"}
                  </div>

                  {/* Infos */}
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    {user.email && (
                      <div className="flex items-center gap-2">
                        <span>📧</span>
                        <span className="truncate">{user.email}</span>
                      </div>
                    )}
                    {user.division_display && (
                      <div className="flex items-center gap-2">
                        <span>🏢</span>
                        <span className="truncate">{user.division_display}</span>
                      </div>
                    )}
                    {user.antenne_display && (
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span className="truncate">{user.antenne_display}</span>
                      </div>
                    )}
                  </div>

                  {/* Bouton Gérer Accès */}
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-[#a34ee5] to-[#7828a8] hover:from-[#8a3bc7] hover:to-[#6520a0] text-white rounded-xl font-semibold transition-all opacity-0 group-hover:opacity-100"
                  >
                    🔑 Gérer les Accès
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredUsers.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-gray-600">Aucun utilisateur trouvé</p>
            <p className="text-gray-500 mt-2">
              Essayez de modifier vos filtres
            </p>
          </div>
        )}
      </div>
    </div>
  );
}