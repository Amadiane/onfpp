import React, { useState } from "react";
import CONFIG from "../../config/config.js";
import axios from "axios";

const Inscription = () => {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    sexe: "",
    date_naissance: "",
    telephone: "",
    email: "",
    adresse: "",
    niveau_etude: "",
    metier_souhaite: "",
    antenne: null
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.post(
        `${CONFIG.BASE_URL}${CONFIG.API_CANDIDATS}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      setMessage("Candidat inscrit avec succès !");
      setFormData({
        nom: "",
        prenom: "",
        sexe: "",
        date_naissance: "",
        telephone: "",
        email: "",
        adresse: "",
        niveau_etude: "",
        metier_souhaite: "",
        antenne: null
      });
    } catch (error) {
      console.error(error);
      setMessage("Erreur lors de l'inscription du candidat.");
    }
  };

  // Styles inline simples pour centrer et espacer le formulaire
  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    padding: "20px"
  };

  const formStyle = {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  };

  const inputStyle = {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "16px"
  };

  const buttonStyle = {
    padding: "12px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer"
  };

  return (
    <div style={containerStyle}>
      <form style={formStyle} onSubmit={handleSubmit}>
        <h2 style={{ textAlign: "center" }}>Inscription Candidat</h2>
        {message && <p style={{ textAlign: "center" }}>{message}</p>}

        <input
          style={inputStyle}
          type="text"
          name="nom"
          value={formData.nom}
          onChange={handleChange}
          placeholder="Nom"
          required
        />
        <input
          style={inputStyle}
          type="text"
          name="prenom"
          value={formData.prenom}
          onChange={handleChange}
          placeholder="Prénom"
          required
        />
        <select
          style={inputStyle}
          name="sexe"
          value={formData.sexe}
          onChange={handleChange}
          required
        >
          <option value="">Sexe</option>
          <option value="H">Homme</option>
          <option value="F">Femme</option>
        </select>
        <input
          style={inputStyle}
          type="date"
          name="date_naissance"
          value={formData.date_naissance}
          onChange={handleChange}
        />
        <input
          style={inputStyle}
          type="tel"
          name="telephone"
          value={formData.telephone}
          onChange={handleChange}
          placeholder="Téléphone"
        />
        <input
          style={inputStyle}
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
        />
        <input
          style={inputStyle}
          type="text"
          name="adresse"
          value={formData.adresse}
          onChange={handleChange}
          placeholder="Adresse"
        />
        <input
          style={inputStyle}
          type="text"
          name="niveau_etude"
          value={formData.niveau_etude}
          onChange={handleChange}
          placeholder="Niveau d'étude"
        />
        <input
          style={inputStyle}
          type="text"
          name="metier_souhaite"
          value={formData.metier_souhaite}
          onChange={handleChange}
          placeholder="Métier souhaité"
        />
        <button style={buttonStyle} type="submit">
          Inscrire
        </button>
      </form>
    </div>
  );
};

export default Inscription;