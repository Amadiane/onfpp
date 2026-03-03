import React, { useEffect, useState } from "react";
import { Image, Loader2, Trash2, PlusCircle, Edit2, X, FolderOpen, Camera } from "lucide-react";
import CONFIG from "../../config/config.js";

const PhotoPost = () => {
  const [albums, setAlbums] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showAlbumForm, setShowAlbumForm] = useState(false);
  const [showPhotoForm, setShowPhotoForm] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const [newAlbum, setNewAlbum] = useState({
    title_fr: "",
    title_en: "",
    description_fr: "",
    description_en: "",
    image: null,
  });

  const [newPhoto, setNewPhoto] = useState({
    album: "",
    title_fr: "",
    title_en: "",
    comment_fr: "",
    comment_en: "",
    image: null,
  });

  const [albumPreview, setAlbumPreview] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // 🔄 Charger albums & photos
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setFetchLoading(true);
    try {
      await Promise.all([fetchAlbums(), fetchPhotos()]);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des données");
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchAlbums = async () => {
    try {
      const res = await fetch(CONFIG.API_ALBUM_LIST);
      if (!res.ok) throw new Error("Erreur de chargement des albums");
      const data = await res.json();
      setAlbums(data);
    } catch (err) {
      console.error("Erreur albums:", err);
      throw err;
    }
  };

  const fetchPhotos = async () => {
    try {
      const res = await fetch(CONFIG.API_PHOTO_LIST);
      if (!res.ok) throw new Error("Erreur de chargement des photos");
      const data = await res.json();
      setPhotos(data);
    } catch (err) {
      console.error("Erreur photos:", err);
      throw err;
    }
  };

  // 🔼 Upload vers Cloudinary
  const uploadToCloudinary = async (file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CONFIG.CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CONFIG.CLOUDINARY_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      return data.secure_url;
    } catch (err) {
      console.error("Erreur upload Cloudinary:", err);
      return null;
    }
  };

  // ✅ Créer un album
  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let imageUrl = null;
      if (newAlbum.image) imageUrl = await uploadToCloudinary(newAlbum.image);

      const payload = {
        title_fr: newAlbum.title_fr,
        title_en: newAlbum.title_en,
        description_fr: newAlbum.description_fr,
        description_en: newAlbum.description_en,
        image: imageUrl,
      };

      const res = await fetch(CONFIG.API_ALBUM_LIST, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erreur lors de la création de l'album");

      setSuccessMessage("Album créé avec succès !");
      setNewAlbum({
        title_fr: "",
        title_en: "",
        description_fr: "",
        description_en: "",
        image: null,
      });
      setAlbumPreview(null);
      setShowAlbumForm(false);
      await fetchAlbums();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Créer une photo
  const handleCreatePhoto = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let imageUrl = null;
      if (newPhoto.image) imageUrl = await uploadToCloudinary(newPhoto.image);

      const payload = {
        album: newPhoto.album,
        title_fr: newPhoto.title_fr,
        title_en: newPhoto.title_en,
        comment_fr: newPhoto.comment_fr,
        comment_en: newPhoto.comment_en,
        image: imageUrl,
      };

      const res = await fetch(CONFIG.API_PHOTO_LIST, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erreur lors de l'envoi de la photo");

      setSuccessMessage("Photo ajoutée avec succès !");
      setNewPhoto({
        album: "",
        title_fr: "",
        title_en: "",
        comment_fr: "",
        comment_en: "",
        image: null,
      });
      setPhotoPreview(null);
      setShowPhotoForm(false);
      await fetchPhotos();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ Supprimer un album
  const handleDeleteAlbum = async (id) => {
    if (!window.confirm("Supprimer cet album et toutes ses photos ?")) return;
    try {
      const res = await fetch(`${CONFIG.API_ALBUM_LIST}${id}/`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erreur de suppression");
      setSuccessMessage("Album supprimé avec succès !");
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  // 🗑️ Supprimer une photo
  const handleDeletePhoto = async (id) => {
    if (!window.confirm("Supprimer cette photo ?")) return;
    try {
      const res = await fetch(`${CONFIG.API_PHOTO_LIST}${id}/`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erreur de suppression");
      setSuccessMessage("Photo supprimée avec succès !");
      await fetchPhotos();
    } catch (err) {
      setError(err.message);
    }
  };

  // 📸 Photos par album
  const getPhotosByAlbum = (albumId) =>
    photos.filter((photo) => photo.album === albumId);

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin inline-block text-orange-500" size={40} />
          <p className="mt-4 text-gray-300 text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e27] relative overflow-hidden">
      {/* Effets de fond lumineux */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 w-64 md:w-96 h-64 md:h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Grille de fond */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

      <div className="relative max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500/30 blur-xl rounded-lg"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-xl">
                <Image className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              Gestion des Albums & Photos
            </h1>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => {
                setShowAlbumForm(!showAlbumForm);
                setShowPhotoForm(false);
              }}
              className="relative group flex-1 md:flex-none"
            >
              <div className="absolute inset-0 bg-orange-500/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
              <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2.5 rounded-lg hover:shadow-xl hover:shadow-orange-500/50 transition-all flex items-center justify-center gap-2 font-semibold text-sm">
                <FolderOpen size={16} /> Album
              </div>
            </button>
            <button
              onClick={() => {
                setShowPhotoForm(!showPhotoForm);
                setShowAlbumForm(false);
              }}
              className="relative group flex-1 md:flex-none"
            >
              <div className="absolute inset-0 bg-blue-500/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
              <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2.5 rounded-lg hover:shadow-xl hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2 font-semibold text-sm">
                <Camera size={16} /> Photo
              </div>
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-500/20 border-2 border-red-500/50 text-red-300 p-4 mb-6 rounded-xl backdrop-blur-sm">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-500/20 border-2 border-green-500/50 text-green-300 p-4 mb-6 rounded-xl backdrop-blur-sm">
            {successMessage}
          </div>
        )}

        {/* 🧾 FORMULAIRE ALBUM */}
        {showAlbumForm && (
          <div className="relative mb-8">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-blue-500 to-purple-500 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-[#0f1729]/90 backdrop-blur-xl shadow-2xl p-6 md:p-8 rounded-2xl border-2 border-orange-500/30">
              <h2 className="text-xl font-bold text-white mb-6">📁 Créer un Album</h2>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-300 mb-2">Titre (FR) *</label>
                    <input
                      type="text"
                      value={newAlbum.title_fr}
                      onChange={(e) => setNewAlbum({ ...newAlbum, title_fr: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border-2 border-orange-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-300 mb-2">Title (EN) *</label>
                    <input
                      type="text"
                      value={newAlbum.title_en}
                      onChange={(e) => setNewAlbum({ ...newAlbum, title_en: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border-2 border-blue-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-300 mb-2">Description (FR) *</label>
                    <textarea
                      value={newAlbum.description_fr}
                      onChange={(e) => setNewAlbum({ ...newAlbum, description_fr: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border-2 border-orange-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-all"
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-300 mb-2">Description (EN) *</label>
                    <textarea
                      value={newAlbum.description_en}
                      onChange={(e) => setNewAlbum({ ...newAlbum, description_en: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border-2 border-blue-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
                      rows={3}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-300 mb-2">🖼️ Image de couverture *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      setNewAlbum({ ...newAlbum, image: e.target.files[0] });
                      setAlbumPreview(URL.createObjectURL(e.target.files[0]));
                    }}
                    className="block w-full px-4 py-3 bg-white/10 border-2 border-purple-500/30 rounded-lg text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-500 file:text-white hover:file:bg-purple-600 transition-all"
                    required
                  />
                  {albumPreview && (
                    <div className="mt-4 relative inline-block">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-purple-500 rounded-xl blur opacity-50"></div>
                      <img src={albumPreview} alt="Aperçu" className="relative w-full max-w-md h-48 object-cover rounded-xl border-2 border-white/20 shadow-xl" />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCreateAlbum}
                    disabled={loading}
                    className="relative group overflow-hidden flex-1"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:shadow-2xl hover:shadow-orange-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          Création...
                        </>
                      ) : (
                        "Créer l'album"
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setShowAlbumForm(false);
                      setNewAlbum({
                        title_fr: "",
                        title_en: "",
                        description_fr: "",
                        description_en: "",
                        image: null,
                      });
                      setAlbumPreview(null);
                    }}
                    className="bg-gray-600/30 border-2 border-gray-500/50 text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-600/50 transition-all font-semibold"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🧾 FORMULAIRE PHOTO */}
        {showPhotoForm && (
          <div className="relative mb-8">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-[#0f1729]/90 backdrop-blur-xl shadow-2xl p-6 md:p-8 rounded-2xl border-2 border-blue-500/30">
              <h2 className="text-xl font-bold text-white mb-6">📷 Ajouter une Photo</h2>
              
              <div className="space-y-4">
                <div>
  <label className="block font-semibold text-gray-300 mb-2">Album *</label>
  <select
    value={newPhoto.album}
    onChange={(e) => setNewPhoto({ ...newPhoto, album: e.target.value })}
    className="w-full px-4 py-3 bg-black/70 border-2 border-orange-500 rounded-lg text-white focus:outline-none focus:border-orange-400 transition-all"
    required
  >
    <option value="">-- Choisir un album --</option>
    {albums.map((a) => (
      <option key={a.id} value={a.id}>
        {a.title_fr}
      </option>
    ))}
  </select>
</div>


                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-300 mb-2">Titre (FR) *</label>
                    <input
                      type="text"
                      value={newPhoto.title_fr}
                      onChange={(e) => setNewPhoto({ ...newPhoto, title_fr: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border-2 border-orange-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-300 mb-2">Title (EN) *</label>
                    <input
                      type="text"
                      value={newPhoto.title_en}
                      onChange={(e) => setNewPhoto({ ...newPhoto, title_en: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border-2 border-blue-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-300 mb-2">Commentaire (FR)</label>
                    <textarea
                      value={newPhoto.comment_fr}
                      onChange={(e) => setNewPhoto({ ...newPhoto, comment_fr: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border-2 border-orange-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-all"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-300 mb-2">Comment (EN)</label>
                    <textarea
                      value={newPhoto.comment_en}
                      onChange={(e) => setNewPhoto({ ...newPhoto, comment_en: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border-2 border-blue-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
                      rows={2}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-300 mb-2">📸 Image *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      setNewPhoto({ ...newPhoto, image: e.target.files[0] });
                      setPhotoPreview(URL.createObjectURL(e.target.files[0]));
                    }}
                    className="block w-full px-4 py-3 bg-white/10 border-2 border-purple-500/30 rounded-lg text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-500 file:text-white hover:file:bg-purple-600 transition-all"
                    required
                  />
                  {photoPreview && (
                    <div className="mt-4 relative inline-block">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-pink-500 rounded-xl blur opacity-50"></div>
                      <img src={photoPreview} alt="Aperçu" className="relative w-full max-w-md h-48 object-cover rounded-xl border-2 border-white/20 shadow-xl" />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCreatePhoto}
                    disabled={loading}
                    className="relative group overflow-hidden flex-1"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:shadow-2xl hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          Upload...
                        </>
                      ) : (
                        "Ajouter la photo"
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setShowPhotoForm(false);
                      setNewPhoto({
                        album: "",
                        title_fr: "",
                        title_en: "",
                        comment_fr: "",
                        comment_en: "",
                        image: null,
                      });
                      setPhotoPreview(null);
                    }}
                    className="bg-gray-600/30 border-2 border-gray-500/50 text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-600/50 transition-all font-semibold"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🖼️ GRID DES ALBUMS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {albums.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FolderOpen size={64} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 text-lg">Aucun album pour le moment</p>
            </div>
          ) : (
            albums.map((album) => {
              const albumPhotos = getPhotosByAlbum(album.id);
              return (
                <div key={album.id} className="relative group cursor-pointer" onClick={() => setSelectedAlbum(album)}>
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-blue-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-40 transition duration-500"></div>
                  <div className="relative bg-[#0f1729]/90 backdrop-blur-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all overflow-hidden border-2 border-white/10 group-hover:border-orange-500/50 h-full flex flex-col">
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f1729] via-transparent to-transparent z-10"></div>
                      <div className="absolute top-3 right-3 z-20 bg-orange-500/80 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-bold">
                        {albumPhotos.length} 📸
                      </div>
                      {album.image ? (
                        <img
                          src={album.image?.startsWith("http") ? album.image : `${CONFIG.MEDIA_URL}${album.image}`}
                          alt={album.title_fr}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="h-full bg-gradient-to-br from-orange-500/20 to-purple-500/20 flex items-center justify-center">
                          <FolderOpen size={48} className="text-white/30" />
                        </div>
                      )}
                    </div>
                    
                    {/* Contenu */}
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-orange-400 transition-colors">
                        {album.title_fr}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2 flex-1">
                        {album.description_fr || "Aucune description"}
                      </p>
                      
                      {/* Actions */}
                      <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAlbum(album);
                          }}
                          className="flex-1 bg-blue-500/20 border border-blue-500/50 text-blue-300 px-3 py-2 rounded-lg hover:bg-blue-500/30 transition-all text-sm font-semibold"
                        >
                          👁️ Voir
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAlbum(album.id);
                          }}
                          className="flex-1 bg-red-500/20 border border-red-500/50 text-red-300 px-3 py-2 rounded-lg hover:bg-red-500/30 transition-all text-sm font-semibold"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 🔍 MODAL ALBUM DÉTAILS */}
        {selectedAlbum && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
            onClick={() => setSelectedAlbum(null)}
          >
            <div 
              className="relative max-w-6xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-blue-500 to-purple-500 rounded-3xl blur-xl opacity-50"></div>
              <div className="relative bg-[#0a0e27] rounded-3xl shadow-2xl border-2 border-orange-500/30 overflow-hidden">
                {/* Header avec image */}
                {selectedAlbum.image && (
                  <div className="relative h-64 md:h-80 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e27] via-transparent to-transparent z-10"></div>
                    <img
                      src={selectedAlbum.image?.startsWith("http") ? selectedAlbum.image : `${CONFIG.MEDIA_URL}${selectedAlbum.image}`}
                      alt={selectedAlbum.title_fr}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Contenu */}
                <div className="p-6 md:p-8">
                  <div className="flex justify-between items-start gap-4 mb-6">
                    <div className="flex-1">
                      <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
                        {selectedAlbum.title_fr}
                      </h2>
                      {selectedAlbum.title_en && (
                        <p className="text-lg text-blue-400 font-semibold mb-4">
                          🇬🇧 {selectedAlbum.title_en}
                        </p>
                      )}
                      <div className="flex gap-2 text-sm text-gray-400">
                        <span className="bg-orange-500/20 px-3 py-1 rounded-full border border-orange-500/30">
                          📸 {getPhotosByAlbum(selectedAlbum.id).length} photos
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedAlbum(null)}
                      className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-all"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Descriptions */}
                  <div className="space-y-4 mb-6">
                    {selectedAlbum.description_fr && (
                      <div className="bg-white/5 p-4 rounded-xl border border-orange-500/30">
                        <p className="text-xs font-bold text-orange-400 mb-2">🇫🇷 FRANÇAIS</p>
                        <p className="text-gray-300 leading-relaxed">{selectedAlbum.description_fr}</p>
                      </div>
                    )}
                    {selectedAlbum.description_en && (
                      <div className="bg-white/5 p-4 rounded-xl border border-blue-500/30">
                        <p className="text-xs font-bold text-blue-400 mb-2">🇬🇧 ENGLISH</p>
                        <p className="text-gray-300 leading-relaxed">{selectedAlbum.description_en}</p>
                      </div>
                    )}
                  </div>

                  {/* Photos de l'album */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-4">📷 Photos de l'album</h3>
                    {getPhotosByAlbum(selectedAlbum.id).length === 0 ? (
                      <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10">
                        <Camera size={48} className="mx-auto text-gray-600 mb-2" />
                        <p className="text-gray-400">Aucune photo dans cet album</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {getPhotosByAlbum(selectedAlbum.id).map((photo) => (
                          <div
                            key={photo.id}
                            className="relative group cursor-pointer"
                            onClick={() => setSelectedPhoto(photo)}
                          >
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-0 group-hover:opacity-50 transition"></div>
                            <div className="relative aspect-square overflow-hidden rounded-lg border-2 border-white/10 group-hover:border-blue-500/50 transition">
                              <img
                                src={photo.image?.startsWith("http") ? photo.image : `${CONFIG.MEDIA_URL}${photo.image}`}
                                alt={photo.title_fr}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-2">
                                <p className="text-white text-xs font-semibold line-clamp-2">
                                  {photo.title_fr}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        setShowPhotoForm(true);
                        setNewPhoto({ ...newPhoto, album: selectedAlbum.id });
                        setSelectedAlbum(null);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-xl hover:shadow-blue-500/50 transition-all font-bold flex items-center justify-center gap-2"
                    >
                      <Camera size={18} /> Ajouter une photo
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteAlbum(selectedAlbum.id);
                        setSelectedAlbum(null);
                      }}
                      className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:shadow-xl hover:shadow-red-500/50 transition-all font-bold flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} /> Supprimer l'album
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🔍 MODAL PHOTO DÉTAILS */}
        {selectedPhoto && (
          <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
            onClick={() => setSelectedPhoto(null)}
          >
            <div 
              className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-50"></div>
              <div className="relative bg-[#0a0e27] rounded-3xl shadow-2xl border-2 border-blue-500/30 overflow-hidden">
                {/* Image principale */}
                {selectedPhoto.image && (
                  <div className="relative">
                    <img
                      src={selectedPhoto.image?.startsWith("http") ? selectedPhoto.image : `${CONFIG.MEDIA_URL}${selectedPhoto.image}`}
                      alt={selectedPhoto.title_fr}
                      className="w-full max-h-[60vh] object-contain bg-black/50"
                    />
                  </div>
                )}
                
                {/* Contenu */}
                <div className="p-6 md:p-8">
                  <div className="flex justify-between items-start gap-4 mb-6">
                    <div className="flex-1">
                      <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
                        {selectedPhoto.title_fr}
                      </h2>
                      {selectedPhoto.title_en && (
                        <p className="text-lg text-blue-400 font-semibold">
                          🇬🇧 {selectedPhoto.title_en}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedPhoto(null)}
                      className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-all"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Commentaires */}
                  {(selectedPhoto.comment_fr || selectedPhoto.comment_en) && (
                    <div className="space-y-4 mb-6">
                      {selectedPhoto.comment_fr && (
                        <div className="bg-white/5 p-4 rounded-xl border border-orange-500/30">
                          <p className="text-xs font-bold text-orange-400 mb-2">🇫🇷 FRANÇAIS</p>
                          <p className="text-gray-300 leading-relaxed">{selectedPhoto.comment_fr}</p>
                        </div>
                      )}
                      {selectedPhoto.comment_en && (
                        <div className="bg-white/5 p-4 rounded-xl border border-blue-500/30">
                          <p className="text-xs font-bold text-blue-400 mb-2">🇬🇧 ENGLISH</p>
                          <p className="text-gray-300 leading-relaxed">{selectedPhoto.comment_en}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <button
                    onClick={() => {
                      handleDeletePhoto(selectedPhoto.id);
                      setSelectedPhoto(null);
                    }}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:shadow-xl hover:shadow-red-500/50 transition-all font-bold flex items-center justify-center gap-2"
                  >
                    <Trash2 size={18} /> Supprimer cette photo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoPost;