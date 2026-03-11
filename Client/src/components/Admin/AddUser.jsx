// src/components/Admin/AddUser.jsx
import { useState, useEffect } from "react";
import CONFIG from "../../config/config.js";
import { apiRequest, apiPublic } from "../../endpoints/api";

export default function AddUser() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [pages, setPages] = useState([]);
  const [constants, setConstants] = useState({ divisions: [], antennes: [] });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    const accesses = Object.entries(access).map(([page, is_allowed]) => ({
      page_id: parseInt(page),
      is_allowed,
    }));

    await apiRequest(CONFIG.API_BULK_SET_ACCESS, {
      method: "POST",
      body: JSON.stringify({ user_id: selectedUser, accesses }),
    });

    alert("Accès sauvegardés !");
  }

  // ─────────────────────────────
  // Helpers
  // ─────────────────────────────
  function roleName(id) {
    const r = roles.find((r) => r.id === id);
    return r ? r.name : "";
  }

  // Afficher champs supplémentaires selon rôle
  const selectedRole = roles.find((r) => r.id === parseInt(form.role));

  const showDivision = selectedRole && selectedRole.level <= 70; // Chef division, section, conseiller
  const showAntenne = selectedRole && selectedRole.level === 50; // Chef antenne

  // ─────────────────────────────
  // UI
  // ─────────────────────────────
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Gestion utilisateurs</h1>

      {error && <div className="bg-red-100 p-3 mb-4">{error}</div>}

      {/* FORMULAIRE */}
      <form onSubmit={createUser} className="grid grid-cols-2 gap-4 mb-8">
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />
        <input
          name="password_confirm"
          type="password"
          placeholder="Confirm password"
          value={form.password_confirm}
          onChange={handleChange}
        />
        <input
          name="first_name"
          placeholder="Prénom"
          value={form.first_name}
          onChange={handleChange}
        />
        <input
          name="last_name"
          placeholder="Nom"
          value={form.last_name}
          onChange={handleChange}
        />
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />

        {/* Role */}
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="">Role</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} (niveau {r.level})
            </option>
          ))}
        </select>

        {/* Division (si rôle approprié) */}
        {showDivision && (
          <select name="division" value={form.division} onChange={handleChange}>
            <option value="">Division</option>
            {constants.divisions.map((d) => (
              <option key={d.code} value={d.code}>
                {d.nom}
              </option>
            ))}
          </select>
        )}

        {/* Antenne (si rôle approprié) */}
        {showAntenne && (
          <select name="antenne" value={form.antenne} onChange={handleChange}>
            <option value="">Antenne</option>
            {constants.antennes.map((a) => (
              <option key={a.code} value={a.code}>
                {a.nom}
              </option>
            ))}
          </select>
        )}

        <button disabled={loading}>Créer utilisateur</button>
      </form>

      {/* USERS */}
      <table className="w-full border">
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{roleName(user.role)}</td>
              <td>
                <button onClick={() => loadAccess(user.id)}>Accès pages</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ACCESS */}
      {selectedUser && (
        <div className="mt-8">
          <h2>Pages</h2>
          {pages.map((p) => (
            <label key={p.id} className="block">
              <input
                type="checkbox"
                checked={access[p.id] || false}
                onChange={() => toggleAccess(p.id)}
              />
              {p.label}
            </label>
          ))}
          <button onClick={saveAccess}>Sauvegarder accès</button>
        </div>
      )}
    </div>
  );
}