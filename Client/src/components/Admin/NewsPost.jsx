import { useEffect, useState } from "react";
import CONFIG from "../../config/config.js";
import {
  PlusCircle,
  Image as ImageIcon,
  Loader2,
  Edit2,
  Trash2,
  X,
  Eye,
  Sparkles,
  Save,
  RefreshCw,
  List,
  FileText,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle
} from "lucide-react";

const NewsPost = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);

  // FORM STATES
  const [title_fr, setTitleFr] = useState("");
  const [title_en, setTitleEn] = useState("");
  const [content_fr, setContentFr] = useState("");
  const [content_en, setContentEn] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [isActive, setIsActive] = useState(true);

  const [editingId, setEditingId] = useState(null);

  // UI STATES
  const [showForm, setShowForm] = useState(false);
  const [showList, setShowList] = useState(true);

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // FETCH NEWS LIST
  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${CONFIG.BASE_URL}/api/news/`);
      const data = await res.json();
      setNewsList(data);
    } catch (error) {
      console.error("FETCH ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // CLOUDINARY UPLOAD
  const uploadImageToCloudinary = async () => {
    if (!imageFile) return null;

    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", CONFIG.CLOUDINARY_UPLOAD_PRESET);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${CONFIG.CLOUDINARY_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const uploaded = await uploadRes.json();
    if (uploaded.secure_url) return uploaded.secure_url;

    console.error("Cloudinary upload failed:", uploaded);
    return null;
  };

  // CREATE OR UPDATE NEWS
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let image_url = selectedNews?.image_url || null;
    if (imageFile) {
      image_url = await uploadImageToCloudinary();
    }

    const payload = {
      title_fr,
      title_en,
      content_fr,
      content_en,
      image: image_url,
      is_active: isActive,
    };

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${CONFIG.BASE_URL}/api/news/${editingId}/`
        : `${CONFIG.BASE_URL}/api/news/`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      await res.json();
      await fetchNews();
      resetForm();
      setShowForm(false);
      setShowList(true);
    } catch (error) {
      console.error("SAVE ERROR:", error);
    }

    setLoading(false);
  };

  // DELETE
  const deleteNews = async (id) => {
    if (!window.confirm("Supprimer cette actualité ?")) return;

    try {
      await fetch(`${CONFIG.BASE_URL}/api/news/${id}/`, {
        method: "DELETE",
      });
      await fetchNews();
      setSelectedNews(null);
    } catch (error) {
      console.error("DELETE ERROR:", error);
    }
  };

  // EDIT
  const editNews = (news) => {
    setEditingId(news.id);
    setTitleFr(news.title_fr);
    setTitleEn(news.title_en);
    setContentFr(news.content_fr);
    setContentEn(news.content_en);
    setIsActive(news.is_active !== undefined ? news.is_active : news.isActive);
    setShowForm(true);
    setShowList(false);
  };

  // RESET FORM
  const resetForm = () => {
    setEditingId(null);
    setTitleFr("");
    setTitleEn("");
    setContentFr("");
    setContentEn("");
    setImageFile(null);
    setIsActive(true);
  };

  // PAGINATION LOGIC
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = newsList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(newsList.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER MODERNE */}
        <div className="mb-8">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 md:p-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FDB71A] via-[#F47920] to-[#E84E1B] opacity-0 group-hover:opacity-20 blur-xl transition-opacity rounded-2xl"></div>
                  <div className="relative w-14 h-14 bg-gradient-to-br from-[#FDB71A] via-[#F47920] to-[#E84E1B] rounded-2xl flex items-center justify-center shadow-lg">
                    <Sparkles className="text-white w-7 h-7" />
                  </div>
                </div>

                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-gray-900">
                    Gestion des Actualités
                  </h1>
                  <p className="text-gray-500 font-medium mt-1">Créez et gérez vos publications</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={fetchNews}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:border-gray-300 hover:shadow-md transition-all duration-200 disabled:opacity-50"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                  Actualiser
                </button>

                <button
                  onClick={() => {
                    setShowForm(!showForm);
                    if (!showForm) {
                      resetForm();
                      setShowList(false);
                    } else {
                      setShowList(true);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#FDB71A] via-[#F47920] to-[#E84E1B] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  {showForm ? (
                    <>
                      <X className="w-5 h-5" />
                      Fermer
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5" />
                      Nouveau Post
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FORMULAIRE */}
        {showForm && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 md:p-8 mb-8">
            <form onSubmit={handleSubmit}>
              {/* En-tête du formulaire */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
                <div className="w-1 h-8 bg-gradient-to-b from-[#FDB71A] to-[#E84E1B] rounded-full"></div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingId ? "Modifier l'actualité" : "Nouvelle actualité"}
                </h3>
              </div>

              {/* Grille des champs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="font-semibold text-gray-700 text-sm">
                    Titre (FR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#F47920] focus:ring-2 focus:ring-[#F47920]/20 transition-all bg-white font-medium"
                    value={title_fr}
                    onChange={(e) => setTitleFr(e.target.value)}
                    placeholder="Entrez le titre en français..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-semibold text-gray-700 text-sm">
                    Title (EN)
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#F47920] focus:ring-2 focus:ring-[#F47920]/20 transition-all bg-white font-medium"
                    value={title_en}
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder="Enter title in English..."
                  />
                </div>
              </div>

              {/* Contenus */}
              <div className="space-y-6 mb-6">
                <div className="space-y-2">
                  <label className="font-semibold text-gray-700 text-sm">
                    Contenu (FR) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#F47920] focus:ring-2 focus:ring-[#F47920]/20 transition-all bg-white font-medium resize-none"
                    rows="5"
                    value={content_fr}
                    onChange={(e) => setContentFr(e.target.value)}
                    placeholder="Rédigez votre contenu en français..."
                    required
                  ></textarea>
                </div>

                <div className="space-y-2">
                  <label className="font-semibold text-gray-700 text-sm">
                    Content (EN)
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#F47920] focus:ring-2 focus:ring-[#F47920]/20 transition-all bg-white font-medium resize-none"
                    rows="5"
                    value={content_en}
                    onChange={(e) => setContentEn(e.target.value)}
                    placeholder="Write your content in English..."
                  ></textarea>
                </div>
              </div>

              {/* Image et statut */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <label className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#F47920]" />
                    Image
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-gradient-to-r file:from-[#FDB71A] file:to-[#F47920] file:text-white hover:file:scale-105 file:transition-all file:cursor-pointer focus:border-[#F47920]"
                      onChange={(e) => setImageFile(e.target.files[0])}
                      accept="image/*"
                    />
                  </div>
                  {imageFile && (
                    <p className="text-sm text-[#F47920] font-medium">
                      ✓ {imageFile.name}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="font-semibold text-gray-700 text-sm">Statut de publication</label>
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-300">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={isActive}
                      onChange={() => setIsActive(!isActive)}
                      className="w-5 h-5 rounded accent-[#FDB71A] cursor-pointer"
                    />
                    <label htmlFor="isActive" className="font-semibold text-gray-700 cursor-pointer flex items-center gap-2">
                      {isActive ? (
                        <>
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Actualité active
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                          Actualité inactive
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-[#FDB71A] via-[#F47920] to-[#E84E1B] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {editingId ? "Mettre à jour" : "Créer l'actualité"}
                    </>
                  )}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setShowForm(false);
                      setShowList(true);
                    }}
                    className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:shadow-md transition-all duration-200 flex items-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* LISTE DES ACTUALITÉS */}
        {showList && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
            {/* En-tête */}
            <div className="p-6 md:p-8 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-[#FDB71A] to-[#E84E1B] rounded-full"></div>
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    Liste des actualités
                    <span className="bg-gradient-to-r from-[#FDB71A] to-[#F47920] text-white px-3 py-1 rounded-full font-semibold text-sm">
                      {newsList.length}
                    </span>
                  </h3>
                </div>
              </div>
            </div>

            {/* Contenu */}
            <div className="p-6 md:p-8">
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 text-[#F47920] animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">Chargement...</p>
                </div>
              ) : newsList.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Aucune actualité pour le moment</p>
                  <p className="text-gray-400 text-sm mt-1">Créez votre première actualité</p>
                </div>
              ) : (
                <>
                  {/* Grille */}
                  <div className="grid gap-6 mb-6">
                    {currentItems.map((item) => {
                      const itemIsActive = item.is_active !== undefined ? item.is_active : item.isActive;
                      
                      return (
                        <div
                          key={item.id}
                          className="group relative bg-white/60 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-orange-400/30 transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-[#FDB71A]/50"
                        >
                          <div className="flex flex-col md:flex-row gap-4 p-4">
                            {/* Image */}
                            {item.image_url && (
                              <div className="relative w-full md:w-48 h-48 flex-shrink-0 overflow-hidden rounded-xl">
                                <img
                                  src={item.image_url}
                                  alt=""
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                                <div className="absolute top-2 right-2">
                                  {itemIsActive ? (
                                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                                      <Check className="w-3 h-3" />
                                      Actif
                                    </span>
                                  ) : (
                                    <span className="bg-gray-400 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                                      Inactif
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Contenu */}
                            <div className="flex-1 flex flex-col justify-between min-w-0">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="text-xl font-black text-gray-800 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#E84E1B] group-hover:via-[#F47920] group-hover:to-[#FDB71A] transition-all">
                                    {item.title_fr}
                                  </h4>
                                  {!itemIsActive && (
                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-semibold">
                                      Masqué
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed mb-2">
                                  {item.content_fr}
                                </p>
                                {item.created_at && (
                                  <p className="text-xs text-gray-400 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(item.created_at).toLocaleDateString('fr-FR')}
                                  </p>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex flex-wrap gap-3 mt-4">
                                <button
                                  onClick={() => setSelectedNews(item)}
                                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold rounded-xl hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
                                >
                                  <Eye size={16} />
                                  Voir
                                </button>

                                <button
                                  onClick={() => {
                                    editNews(item);
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                  }}
                                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FDB71A] to-[#F47920] text-white text-sm font-bold rounded-xl hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
                                >
                                  <Edit2 size={16} />
                                  Modifier
                                </button>

                                <button
                                  onClick={() => deleteNews(item.id)}
                                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold rounded-xl hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
                                >
                                  <Trash2 size={16} />
                                  Supprimer
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-6 border-t border-gray-200">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                              currentPage === pageNumber
                                ? "bg-gradient-to-r from-[#FDB71A] to-[#F47920] text-white"
                                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL DÉTAIL */}
      {selectedNews && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 z-50"
          onClick={() => setSelectedNews(null)}
        >
          <div 
            className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête modal */}
            <div className="bg-gradient-to-r from-[#FDB71A] via-[#F47920] to-[#E84E1B] p-6 relative">
              <button
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
                onClick={() => setSelectedNews(null)}
              >
                <X className="w-5 h-5 text-white" />
              </button>

              <h2 className="text-2xl font-bold text-white pr-12">
                {selectedNews.title_fr}
              </h2>
              {selectedNews.title_en && (
                <p className="text-white/80 text-sm mt-1">
                  {selectedNews.title_en}
                </p>
              )}
            </div>

            {/* Contenu modal */}
            <div className="p-6 overflow-y-auto flex-1">
              {selectedNews.image_url && (
                <img
                  src={selectedNews.image_url}
                  className="w-full h-80 object-cover rounded-xl mb-6"
                  alt=""
                />
              )}

              <div className="space-y-4">
                <div className="bg-orange-50 p-4 rounded-xl border-l-4 border-[#FDB71A]">
                  <h3 className="font-semibold text-gray-700 mb-2 text-sm">Français</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedNews.content_fr}
                  </p>
                </div>

                {selectedNews.content_en && (
                  <div className="bg-red-50 p-4 rounded-xl border-l-4 border-[#F47920]">
                    <h3 className="font-semibold text-gray-700 mb-2 text-sm">English</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedNews.content_en}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions modal */}
            <div className="bg-gray-50 p-6 flex justify-end gap-3 border-t border-gray-200">
              <button
                className="px-4 py-2 bg-gradient-to-r from-[#FDB71A] to-[#F47920] text-white rounded-lg font-semibold hover:shadow-md transition-all flex items-center gap-2"
                onClick={() => {
                  editNews(selectedNews);
                  setSelectedNews(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <Edit2 className="w-4 h-4" />
                Modifier
              </button>

              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center gap-2"
                onClick={() => deleteNews(selectedNews.id)}
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>

              <button
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
                onClick={() => setSelectedNews(null)}
              >
                <X className="w-4 h-4" />
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsPost;