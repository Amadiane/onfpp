// src/components/Admin/AddUser.jsx
import { useState, useEffect } from "react";
import { PlusCircle, UserPlus, Save, X, Users, Shield, AlertCircle, Check } from "lucide-react";
import CONFIG from "../../config/config.js";
import { apiRequest, apiPublic } from "../../endpoints/api";

export default function AddUser() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [pages, setPages] = useState([]);
  const [constants, setConstants] = useState({ divisions: [], antennes: [] });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    username: "",
    password: "",
    password_confirm: "",
    first_name: "",
    last_name: "",
    email: "",
    role: "",
    division: "",
    antenne: "",
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [access, setAccess] = useState({});
  const [showForm, setShowForm] = useState(false);

  // ─────────────────────────────
  // Charger données initiales
  // ─────────────────────────────
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const constantsData = await apiPublic(CONFIG.API_CONSTANTS);

      const [usersData, rolesData, pagesData] = await Promise.all([
        apiRequest(CONFIG.API_USER_LIST),
        apiRequest(CONFIG.API_ROLES),
        apiRequest(CONFIG.API_PAGES),
      ]);

      setUsers(usersData);
      setRoles(rolesData);
      setPages(pagesData);
      setConstants(constantsData);
    } catch (err) {
      setError(err.message);
    }
  }

  // ─────────────────────────────
  // Gestion formulaire
  // ─────────────────────────────
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function createUser(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...form,
        role: form.role ? parseInt(form.role) : null,
        division: form.division || null,
        antenne: form.antenne || null,
      };

      await apiRequest(CONFIG.API_CREATE_USER, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSuccess(`✅ Utilisateur "${form.username}" créé avec succès !`);
      setForm({
        username: "",
        password: "",
        password_confirm: "",
        first_name: "",
        last_name: "",
        email: "",
        role: "",
        division: "",
        antenne: "",
      });
      setShowForm(false);

      loadData();
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  }

  // ─────────────────────────────
  // Gestion accès pages
  // ─────────────────────────────
  async function loadAccess(userId) {
    setSelectedUser(userId);
    const data = await apiRequest(`${CONFIG.API_USER_SUMMARY}?user=${userId}`);

    const map = {};
    data.pages.forEach((p) => {
      map[p.page_id] = p.effective;
    });

    setAccess(map);
  }

  function toggleAccess(pageId) {
    setAccess((prev) => ({ ...prev, [pageId]: !prev[pageId] }));
  }

  async function saveAccess() {
    try {
      const accesses = Object.entries(access).map(([page, is_allowed]) => ({
        page_id: parseInt(page),
        is_allowed,
      }));

      await apiRequest(CONFIG.API_BULK_SET_ACCESS, {
        method: "POST",
        body: JSON.stringify({ user_id: selectedUser, accesses }),
      });

      setSuccess("✅ Accès sauvegardés avec succès !");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  }

  // ─────────────────────────────
  // Helpers
  // ─────────────────────────────
  function roleName(id) {
    const r = roles.find((r) => r.id === id);
    return r ? r.name : "";
  }

  function divisionName(code) {
    if (!code) return "—";
    const d = constants.divisions.find((d) => d.code === code);
    return d ? d.nom : code;
  }

  function antenneName(code) {
    if (!code) return "—";
    const a = constants.antennes.find((a) => a.code === code);
    return a ? a.nom : code;
  }

  // Afficher champs supplémentaires selon rôle
  const selectedRole = roles.find((r) => r.id === parseInt(form.role));
  const showDivision = selectedRole && selectedRole.level <= 70; // Chef division, section, conseiller
  const showAntenne = selectedRole && selectedRole.level === 50; // Chef antenne
  const isDGorDGA = selectedRole && selectedRole.level >= 90;

  // ─────────────────────────────
  // UI
  // ─────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* EN-TÊTE */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-purple-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Gestion des Utilisateurs
                </h1>
                <p className="text-gray-600 mt-1">
                  Créer et gérer les accès des utilisateurs ONFPP
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-semibold"
            >
              {showForm ? (
                <>
                  <X className="w-5 h-5" />
                  Annuler
                </>
              ) : (
                <>
                  <PlusCircle className="w-5 h-5" />
                  Nouvel Utilisateur
                </>
              )}
            </button>
          </div>
        </div>

        {/* MESSAGES */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-lg flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-green-700 font-medium">{success}</p>
          </div>
        )}

        {/* FORMULAIRE */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-purple-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-purple-600" />
              Créer un Utilisateur
            </h2>
            
            <form onSubmit={createUser} className="space-y-6">
              
              {/* Informations de base */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom d'utilisateur *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Nom d'utilisateur unique"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mot de passe *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Minimum 8 caractères"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirmer le mot de passe *
                  </label>
                  <input
                    type="password"
                    name="password_confirm"
                    value={form.password_confirm}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Confirmer le mot de passe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Prénom"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Nom de famille"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              {/* Rôle et permissions */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  Rôle et Permissions
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Rôle *
                    </label>
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="">Sélectionner un rôle</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} (Niveau {r.level})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Division */}
                  {showDivision && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Division *
                      </label>
                      <select
                        name="division"
                        value={form.division}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      >
                        <option value="">Sélectionner une division</option>
                        {constants.divisions.map((d) => (
                          <option key={d.code} value={d.code}>
                            {d.code} - {d.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Antenne */}
                  {showAntenne && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Antenne *
                      </label>
                      <select
                        name="antenne"
                        value={form.antenne}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      >
                        <option value="">Sélectionner une antenne</option>
                        {constants.antennes.map((a) => (
                          <option key={a.code} value={a.code}>
                            {a.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {/* DG/DGA info */}
                  {isDGorDGA && (
                    <div className="md:col-span-2">
                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                        <p className="text-purple-700 font-medium">
                          ℹ️ DG/DGA ont accès à toutes les divisions et antennes
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Boutons */}
              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Créer l'Utilisateur
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* LISTE UTILISATEURS */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            Utilisateurs ({users.length})
          </h2>
          
          {users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-purple-100">
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Utilisateur</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Rôle</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Division</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Antenne</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-purple-50 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-semibold text-gray-800">{user.username}</p>
                          <p className="text-sm text-gray-500">
                            {user.first_name} {user.last_name}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          {roleName(user.role)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-700">
                        {divisionName(user.division)}
                      </td>
                      <td className="py-4 px-4 text-gray-700">
                        {antenneName(user.antenne)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => loadAccess(user.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Gérer Accès
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* GESTION ACCÈS PAGES */}
        {selectedUser && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mt-8 border border-purple-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Shield className="w-6 h-6 text-purple-600" />
                Accès aux Pages
              </h2>
              
              <div className="flex gap-3">
                <button
                  onClick={saveAccess}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Sauvegarder
                </button>
                
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Fermer
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pages.map((p) => {
                const isActive = access[p.id] || false;
                
                return (
                  <div
                    key={p.id}
                    onClick={() => toggleAccess(p.id)}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      isActive
                        ? "border-green-500 bg-green-50"
                        : "border-gray-300 bg-gray-50 hover:border-purple-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{p.label}</h3>
                        {p.description && (
                          <p className="text-xs text-gray-500 mt-1">{p.description}</p>
                        )}
                      </div>
                      
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-3 ${
                          isActive
                            ? "bg-green-500 border-green-600"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        {isActive && (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}