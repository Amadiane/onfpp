import React, { useEffect, useState } from 'react';

const ActivitiesPost = () => {
  // États pour les champs multilingues
  const [titleFr, setTitleFr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [commentFr, setCommentFr] = useState("");
  const [commentEn, setCommentEn] = useState("");
  const [commentAr, setCommentAr] = useState("");
  
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [activeLanguage, setActiveLanguage] = useState('fr'); // Langue active pour l'affichage
  const apiUrl = import.meta.env.VITE_API_BACKEND;

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchActivities = async () => {
    try {
      const res = await fetch(apiUrl + "/api/activities/");
      const data = await res.json();
      setActivities(data);
    } catch (err) {
      console.error("Erreur lors du chargement des activités:", err);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const resetForm = () => {
    setTitleFr("");
    setTitleEn("");
    setTitleAr("");
    setCommentFr("");
    setCommentEn("");
    setCommentAr("");
    setCoverPhoto(null);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append('title_fr', titleFr);
    formData.append('title_en', titleEn);
    formData.append('title_ar', titleAr);
    formData.append('comment_fr', commentFr);
    formData.append('comment_en', commentEn);
    formData.append('comment_ar', commentAr);
    if (coverPhoto) formData.append('cover_photo', coverPhoto);

    const method = editingId ? 'PATCH' : 'POST';
    const url = editingId 
      ? `${apiUrl}/api/activities/${editingId}/`
      : `${apiUrl}/api/activities/`;

    try {
      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) throw new Error("Erreur HTTP: " + response.status);

      setMessage(editingId ? "✅ Activité modifiée avec succès!" : "✅ Activité ajoutée avec succès!");
      resetForm();
      fetchActivities();
      setShowForm(false);
    } catch (error) {
      setMessage("❌ Erreur: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (activity) => {
    setTitleFr(activity.title_fr || "");
    setTitleEn(activity.title_en || "");
    setTitleAr(activity.title_ar || "");
    setCommentFr(activity.comment_fr || "");
    setCommentEn(activity.comment_en || "");
    setCommentAr(activity.comment_ar || "");
    setEditingId(activity.id);
    setCoverPhoto(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette activité ?")) return;

    try {
      await fetch(`${apiUrl}/api/activities/${id}/`, {
        method: 'DELETE'
      });
      fetchActivities();
      setMessage("✅ Activité supprimée avec succès!");
    } catch (err) {
      setMessage("❌ Erreur lors de la suppression: " + err.message);
    }
  };

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  // Fonction pour obtenir le contenu dans la langue active
  const getLocalizedContent = (activity, field) => {
    const content = activity[`${field}_${activeLanguage}`];
    return content || activity[`${field}_fr`] || activity[`${field}_en`] || activity[`${field}_ar`] || "";
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = activities.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(activities.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Styles
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
    languageSelector: {
      display: 'flex',
      gap: '10px',
      marginBottom: '20px',
      alignItems: 'center',
    },
    languageButton: {
      padding: '5px 12px',
      border: '1px solid #ddd',
      borderRadius: '5px',
      backgroundColor: '#fff',
      cursor: 'pointer',
      fontSize: '14px',
    },
    activeLanguageButton: {
      backgroundColor: '#1C1C47',
      color: 'white',
      border: '1px solid #1C1C47',
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
      direction: 'ltr',
    },
    textareaAr: {
      direction: 'rtl',
      textAlign: 'right',
    },
    inputAr: {
      direction: 'rtl',
      textAlign: 'right',
    },
    multilingualSection: {
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '10px',
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '10px',
      color: '#333',
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
    message: {
      marginTop: '15px',
      padding: '10px',
      borderRadius: '5px',
    },
    activitiesList: {
      display: 'grid',
      gap: '15px',
    },
    activityCard: {
      border: '1px solid #eaeaea',
      borderRadius: '8px',
      overflow: 'hidden',
      transition: 'box-shadow 0.3s',
      backgroundColor: '#fff',
    },
    activityHeader: {
      padding: '15px',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
    },
    activityTitle: {
      margin: 0,
      fontSize: '18px',
      fontWeight: '500',
      direction: activeLanguage === 'ar' ? 'rtl' : 'ltr',
      textAlign: activeLanguage === 'ar' ? 'right' : 'left',
    },
    activityContent: {
      padding: '15px',
    },
    activityInfo: {
      margin: '8px 0',
      direction: activeLanguage === 'ar' ? 'rtl' : 'ltr',
      textAlign: activeLanguage === 'ar' ? 'right' : 'left',
    },
    activityActions: {
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
    coverPhoto: {
      width: '100%',
      borderRadius: '5px',
      marginTop: '10px',
      marginBottom: '10px',
      maxHeight: '300px',
      objectFit: 'cover',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Gestion des activités</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          style={styles.addButton}
        >
          {showForm ? 'Fermer le formulaire' : 'Ajouter une activité'}
        </button>
      </div>

      {/* Sélecteur de langue pour l'affichage */}
      <div style={styles.languageSelector}>
        <span style={{ fontWeight: '500' }}>Langue d'affichage:</span>
        {[
          { code: 'fr', label: 'Français' },
          { code: 'en', label: 'English' },
          { code: 'ar', label: 'العربية' }
        ].map(lang => (
          <button
            key={lang.code}
            onClick={() => setActiveLanguage(lang.code)}
            style={{
              ...styles.languageButton,
              ...(activeLanguage === lang.code ? styles.activeLanguageButton : {})
            }}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {showForm && (
        <section style={styles.formContainer}>
          <h2 style={styles.title}>{editingId ? 'Modifier une activité' : 'Publier une nouvelle activité'}</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            
            {/* Section Titres */}
            <div style={styles.multilingualSection}>
              <div style={styles.sectionTitle}>Titres</div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Titre (Français) *</label>
                <input 
                  type="text" 
                  value={titleFr} 
                  onChange={(e) => setTitleFr(e.target.value)} 
                  required 
                  style={styles.input} 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Title (English)</label>
                <input 
                  type="text" 
                  value={titleEn} 
                  onChange={(e) => setTitleEn(e.target.value)} 
                  style={styles.input} 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>العنوان (العربية)</label>
                <input 
                  type="text" 
                  value={titleAr} 
                  onChange={(e) => setTitleAr(e.target.value)} 
                  style={{...styles.input, ...styles.inputAr}} 
                />
              </div>
            </div>

            {/* Section Commentaires */}
            <div style={styles.multilingualSection}>
              <div style={styles.sectionTitle}>Commentaires</div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Commentaire (Français) *</label>
                <textarea 
                  value={commentFr} 
                  onChange={(e) => setCommentFr(e.target.value)} 
                  required 
                  style={styles.textarea} 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Comment (English)</label>
                <textarea 
                  value={commentEn} 
                  onChange={(e) => setCommentEn(e.target.value)} 
                  style={styles.textarea} 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>التعليق (العربية)</label>
                <textarea 
                  value={commentAr} 
                  onChange={(e) => setCommentAr(e.target.value)} 
                  style={{...styles.textarea, ...styles.textareaAr}} 
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Photo de couverture {!editingId ? '' : '(laissez vide pour conserver l\'actuelle)'}</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setCoverPhoto(e.target.files[0])} 
                style={styles.input} 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              style={styles.submitButton}
            >
              {loading ? "Envoi en cours..." : (editingId ? "Modifier" : "Ajouter")}
            </button>
          </form>

          {message && (
            <div style={{
              ...styles.message,
              backgroundColor: message.includes('❌') ? '#ffebee' : '#e8f5e9',
              color: message.includes('❌') ? '#c62828' : '#2e7d32',
            }}>
              {message}
            </div>
          )}
        </section>
      )}

      {!showForm && message && (
        <div style={{
          ...styles.message,
          backgroundColor: message.includes('❌') ? '#ffebee' : '#e8f5e9',
          color: message.includes('❌') ? '#c62828' : '#2e7d32',
          marginBottom: '20px',
        }}>
          {message}
        </div>
      )}

      <h2 style={styles.title}>Liste des activités</h2>
      
      <div style={styles.activitiesList}>
        {currentItems.length === 0 ? (
          <p>Aucune activité publiée pour le moment.</p>
        ) : (
          currentItems.map((activity) => (
            <div key={activity.id} style={styles.activityCard}>
              <div
                onClick={() => toggleExpand(activity.id)}
                style={styles.activityHeader}
              >
                <h3 style={styles.activityTitle}>
                  {getLocalizedContent(activity, 'title')}
                </h3>
                <span>{expanded === activity.id ? '−' : '+'}</span>
              </div>

              {expanded === activity.id && (
                <div style={styles.activityContent}>
                  {activity.cover_photo && (
                    <img 
                      src={`${apiUrl}${activity.cover_photo}`} 
                      alt={getLocalizedContent(activity, 'title')} 
                      style={styles.coverPhoto} 
                    />
                  )}
                  <p style={styles.activityInfo}>
                    <strong>Commentaire:</strong> {getLocalizedContent(activity, 'comment')}
                  </p>
                  <p style={styles.activityInfo}>
                    <strong>Créé le:</strong> {new Date(activity.created_at).toLocaleDateString('fr-FR')}
                  </p>
                  
                  {/* Affichage des autres langues disponibles */}
                  <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                    <strong>Langues disponibles:</strong>{' '}
                    {['fr', 'en', 'ar'].filter(lang => 
                      activity[`title_${lang}`] && activity[`title_${lang}`].trim()
                    ).map(lang => (
                      <span key={lang} style={{ marginRight: '10px' }}>
                        {lang === 'fr' ? '🇫🇷 FR' : lang === 'en' ? '🇬🇧 EN' : '🇸🇦 AR'}
                      </span>
                    ))}
                  </div>

                  <div style={styles.activityActions}>
                    <button 
                      onClick={() => handleEdit(activity)} 
                      style={{...styles.actionButton, ...styles.editButton}}
                    >
                      ✏️ Éditer
                    </button>
                    <button 
                      onClick={() => handleDelete(activity.id)} 
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
      {activities.length > itemsPerPage && (
        <div style={styles.paginationContainer}>
          <button 
            onClick={() => paginate(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            style={styles.pageButton}
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
            style={styles.pageButton}
          >
            &raquo;
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivitiesPost;