import React, { useEffect, useState } from 'react';

const FondationPost = () => {
  const [fondations, setFondations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newFondation, setNewFondation] = useState({
    title_fr: "",
    title_en: "",
    title_ar: "",
    description_fr: "",
    description_en: "",
    description_ar: "",
    image: null
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const apiUrl = import.meta.env.VITE_API_BACKEND;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const API_URL = apiUrl + "/api/fondationtamkine/";

  useEffect(() => {
    fetchFondations();
  }, []);

  useEffect(() => {
    const totalPages = Math.ceil(fondations.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [fondations, currentPage, itemsPerPage]);

  const fetchFondations = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Erreur lors du chargement des fondations");
      const data = await response.json();
      setFondations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFondation((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewFondation((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}${editingId}/` : API_URL;

    try {
      setLoading(true);
      const formData = new FormData();
      Object.keys(newFondation).forEach(key => {
        if (newFondation[key] !== null) {
          formData.append(key, newFondation[key]);
        }
      });

      const response = await fetch(url, {
        method,
        body: formData
      });

      if (!response.ok) throw new Error("Erreur lors de l'enregistrement");
      await fetchFondations();
      setNotification(editingId ? "Fondation mise à jour avec succès !" : "Nouvelle fondation ajoutée avec succès !");

      setNewFondation({
        title_fr: "",
        title_en: "",
        title_ar: "",
        description_fr: "",
        description_en: "",
        description_ar: "",
        image: null
      });
      setImagePreview(null);
      setEditingId(null);
      setShowForm(false);
      setError(null);

      setTimeout(() => setNotification(null), 5000);
      if (!editingId) {
        setTimeout(() => {
          setCurrentPage(Math.ceil((fondations.length + 1) / itemsPerPage));
        }, 100);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (fondation) => {
    setNewFondation({
      title_fr: fondation.title_fr,
      title_en: fondation.title_en,
      title_ar: fondation.title_ar,
      description_fr: fondation.description_fr,
      description_en: fondation.description_en,
      description_ar: fondation.description_ar,
      image: null
    });
    setImagePreview(fondation.image ? `${apiUrl}${fondation.image}` : null);
    setEditingId(fondation.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette fondation ?")) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}${id}/`, { method: 'DELETE' });
      if (!response.ok) throw new Error("Erreur lors de la suppression");

      setFondations(prev => prev.filter(f => f.id !== id));
      setNotification("Fondation supprimée avec succès !");
      setTimeout(() => setNotification(null), 5000);

      const newTotalPages = Math.ceil((fondations.length - 1) / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = fondations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(fondations.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Styles pour le design responsive, inspirés du composant ValeurPost
  const styles = {
    container: {
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      marginBottom: '20px',
    },
    title: {
      fontSize: '24px',
      margin: '10px 0',
    },
    addButton: {
      padding: '10px 15px',
      backgroundColor: '#1C1C47',
      color: 'white',
      fontSize: '16px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
    },
    formContainer: {
      backgroundColor: '#f9f9f9',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
      marginBottom: '30px',
      width: '100%',
    },
    form: {
      display: 'grid',
      gap: '15px',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
    },
    label: {
      marginBottom: '5px',
      fontWeight: '500',
    },
    input: {
      padding: '10px',
      borderRadius: '5px',
      border: '1px solid #ddd',
      fontSize: '16px',
    },
    textarea: {
      padding: '10px',
      borderRadius: '5px',
      border: '1px solid #ddd',
      minHeight: '100px',
      fontSize: '16px',
      fontFamily: 'inherit',
      resize: 'vertical',
    },
    submitButton: {
      padding: '12px',
      backgroundColor: '#1C1C47',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      fontSize: '16px',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
    },
    fondationsList: {
      display: 'grid',
      gap: '15px',
    },
    fondationCard: {
      border: '1px solid #eaeaea',
      borderRadius: '8px',
      overflow: 'hidden',
      transition: 'box-shadow 0.3s',
      backgroundColor: '#fff',
    },
    fondationHeader: {
      padding: '15px',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
    },
    fondationTitle: {
      margin: 0,
      fontSize: '18px',
      fontWeight: '500',
    },
    fondationContent: {
      padding: '15px',
    },
    fondationInfo: {
      margin: '8px 0',
    },
    fondationActions: {
      display: 'flex',
      gap: '10px',
      marginTop: '15px',
    },
    actionButton: {
      padding: '8px 12px',
      borderRadius: '5px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
    },
    editButton: {
      backgroundColor: '#e0e0e0',
    },
    deleteButton: {
      backgroundColor: '#ffebee',
      color: '#c62828',
    },
    paginationContainer: {
      display: 'flex',
      justifyContent: 'center',
      gap: '5px',
      marginTop: '20px',
    },
    pageButton: {
      padding: '8px 12px',
      border: '1px solid #ddd',
      borderRadius: '5px',
      backgroundColor: '#fff',
      cursor: 'pointer',
    },
    activePageButton: {
      backgroundColor: '#1C1C47',
      color: 'white',
      border: '1px solid #1C1C47',
    },
    errorMessage: {
      padding: '10px',
      borderRadius: '5px',
      backgroundColor: '#ffebee',
      color: '#c62828',
      marginBottom: '15px',
    },
    notificationMessage: {
      padding: '10px',
      borderRadius: '5px',
      backgroundColor: '#e8f5e9',
      color: '#2e7d32',
      marginBottom: '15px',
    },
    languageSection: {
      marginTop: '10px',
      padding: '10px',
      borderTop: '1px solid #eee',
    },
    languageTitle: {
      fontSize: '16px',
      fontWeight: '500',
      marginBottom: '8px',
    },
    imagePreview: {
      marginTop: '10px',
      maxWidth: '200px',
      maxHeight: '200px',
      objectFit: 'contain',
      borderRadius: '5px',
      border: '1px solid #ddd',
    },
    imageContainer: {
      marginTop: '15px',
    },
    fileInput: {
      marginTop: '5px',
    },
    infoItem: {
      marginBottom: '8px'
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh'
    },
    loadingText: {
      fontSize: '18px',
      fontWeight: '500',
      color: '#666'
    }
  };

  if (loading && fondations.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingText}>
          Chargement...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Gestion des Fondations</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          style={styles.addButton}
        >
          {showForm ? 'Fermer le formulaire' : 'Ajouter une fondation'}
        </button>
      </div>

      {error && (
        <div style={styles.errorMessage}>
          Erreur: {error}
        </div>
      )}

      {notification && (
        <div style={styles.notificationMessage}>
          {notification}
        </div>
      )}

      {/* Formulaire d'ajout de fondation */}
      {showForm && (
        <section style={styles.formContainer}>
          <h2 style={styles.title}>{editingId ? 'Modifier la fondation' : 'Nouvelle fondation'}</h2>
          <form onSubmit={handleSubmit} style={styles.form} encType="multipart/form-data">
            {/* Champs titre */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Titre en Français</label>
              <input
                type="text"
                id="title_fr"
                name="title_fr"
                style={styles.input}
                value={newFondation.title_fr}
                onChange={handleInputChange}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Title in English</label>
              <input
                type="text"
                id="title_en"
                name="title_en"
                style={styles.input}
                value={newFondation.title_en}
                onChange={handleInputChange}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>العنوان بالعربية</label>
              <input
                type="text"
                id="title_ar"
                name="title_ar"
                style={{...styles.input, textAlign: 'right'}}
                value={newFondation.title_ar}
                onChange={handleInputChange}
                dir="rtl"
                required
              />
            </div>

            {/* Champs description */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Description en Français</label>
              <textarea
                id="description_fr"
                name="description_fr"
                rows="3"
                style={styles.textarea}
                value={newFondation.description_fr}
                onChange={handleInputChange}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Description en Anglais</label>
              <textarea
                id="description_en"
                name="description_en"
                rows="3"
                style={styles.textarea}
                value={newFondation.description_en}
                onChange={handleInputChange}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Description en Arabe</label>
              <textarea
                id="description_ar"
                name="description_ar"
                rows="3"
                style={{...styles.textarea, textAlign: 'right'}}
                value={newFondation.description_ar}
                onChange={handleInputChange}
                dir="rtl"
                required
              />
            </div>

            {/* Champ image */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Image</label>
              <input 
                type="file" 
                onChange={handleImageChange}
                style={styles.fileInput}
                accept="image/*"
              />
              {imagePreview && (
                <div style={styles.imageContainer}>
                  <h4 style={styles.languageTitle}>Prévisualisation de l'image:</h4>
                  <img 
                    src={imagePreview} 
                    alt="Image prévisualisée" 
                    style={styles.imagePreview}
                  />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                style={{
                  padding: '12px',
                  backgroundColor: '#e0e0e0',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                Annuler
              </button>
              <button type="submit" style={styles.submitButton}>
                {editingId ? 'Mettre à jour' : 'Ajouter'}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Liste des fondations */}
      <h2 style={styles.title}>Liste des fondations</h2>
      
      {loading && fondations.length > 0 && (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          Chargement...
        </div>
      )}
      
      <div style={styles.fondationsList}>
        {!loading && currentItems.length === 0 ? (
          <p>Aucune fondation à afficher.</p>
        ) : (
          currentItems.map((fondation) => (
            <div key={fondation.id} style={styles.fondationCard}>
              <div
                onClick={() => toggleExpand(fondation.id)}
                style={styles.fondationHeader}
              >
                <h3 style={styles.fondationTitle}>{fondation.title_fr}</h3>
                <span>{expanded === fondation.id ? '−' : '+'}</span>
              </div>

              {expanded === fondation.id && (
                <div style={styles.fondationContent}>
                  {/* Ordre de présentation réorganisé */}
                  <div style={styles.infoItem}>
                    <strong>Titre (FR):</strong> {fondation.title_fr}
                  </div>
                  <div style={styles.infoItem}>
                    <strong>Title (EN):</strong> {fondation.title_en}
                  </div>
                  <div style={{...styles.infoItem, textAlign: 'right'}} dir="rtl">
                    <strong>العنوان (AR):</strong> {fondation.title_ar}
                  </div>
                  
                  <div style={styles.infoItem}>
                    <strong>Description (FR):</strong> {fondation.description_fr}
                  </div>
                  <div style={styles.infoItem}>
                    <strong>Description (EN):</strong> {fondation.description_en}
                  </div>
                  <div style={{...styles.infoItem, textAlign: 'right'}} dir="rtl">
                    <strong>الوصف (AR):</strong> {fondation.description_ar}
                  </div>
                  
                  {/* Image avec gestion d'erreur */}
                  {fondation.image && (
                    <div style={styles.languageSection}>
                      <div style={styles.languageTitle}>Image</div>
                      <img 
                        src={`http://127.0.0.1:8000${fondation.image}`}
                        alt={fondation.title_fr} 
                        style={{
                          maxWidth: '200px',
                          maxHeight: '200px',
                          objectFit: 'contain',
                          borderRadius: '5px',
                        }}
                        onError={(e) => {
                          // En cas d'erreur de chargement d'image, afficher une image par défaut
                          e.target.onerror = null; 
                          e.target.src = '/placeholder-image.png'; // Remplacez par votre image par défaut
                          console.log("Erreur de chargement de l'image:", fondation.image);
                        }}
                      />
                    </div>
                  )}
                  
                  <div style={styles.fondationActions}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(fondation);
                      }}
                      style={{...styles.actionButton, ...styles.editButton}}
                    >
                      ✏️ Modifier
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(fondation.id);
                      }}
                      style={{...styles.actionButton, ...styles.deleteButton}}
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* Pagination */}
      {fondations.length > itemsPerPage && (
        <div style={styles.paginationContainer}>
          <button 
            onClick={() => paginate(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            style={{
              ...styles.pageButton,
              opacity: currentPage === 1 ? 0.5 : 1,
              cursor: currentPage === 1 ? 'default' : 'pointer'
            }}
          >
            &laquo;
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
            <button
              key={number}
              onClick={() => paginate(number)}
              style={{
                ...styles.pageButton,
                ...(currentPage === number ? styles.activePageButton : {})
              }}
            >
              {number}
            </button>
          ))}
          
          <button 
            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            style={{
              ...styles.pageButton,
              opacity: currentPage === totalPages ? 0.5 : 1,
              cursor: currentPage === totalPages ? 'default' : 'pointer'
            }}
          >
            &raquo;
          </button>
        </div>
      )}
    </div>
  );
};

export default FondationPost;