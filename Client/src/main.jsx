import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import i18next from './i18n.js';
import './index.css';

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Navigate,
} from 'react-router-dom';

// Layout principal
import App from './Layout.jsx';

// Pages publiques
import Home from './components/HeaderSection/Home.jsx';
import Categories from './components/Categories/Categories.jsx';
import Createpost from './components/Createpost/Createpost.jsx';
import Login from './components/Login/Login.jsx';
import Forgetpassword from './components/Forgotpassword/Forgotpassword.jsx';
import Blogdetail from './components/Blogdetail/Blogdetail.jsx';

// Admin et routes protégées
import PrivateRoute from './components/Routes/PrivateRoute.jsx';
import DashboardAdmin from './components/Admin/DashboardAdmin.jsx';

// Footer / Header / Sections
import Quisommesnous from './components/Footer/Quisommesnous.jsx';
import Contacternous from './components/Footer/Contacternous.jsx';
import NousRejoindre from './components/Footer/Nousrejoindre.jsx';
import MotPresident from './components/HeaderSection/MotPresident.jsx';
import Fondation from './components/HeaderSection/Fondation.jsx';
import NosValeurs from './components/HeaderSection/NosValeurs.jsx';
import NosMissions from './components/HeaderSection/NosMissions.jsx';
import NotreEquipe from './components/HeaderSection/NotreEquipe.jsx';
import Programs from './components/HeaderSection/Programs.jsx';
import Community from './components/HeaderSection/Community.jsx';
import Partner from './components/HeaderSection/Partner.jsx';
import Plateforms from './components/HeaderSection/Plateforms.jsx';
import Videotheque from './components/HeaderSection/Videotheque.jsx';
import Phototheque from './components/HeaderSection/Phototheque.jsx';
import Document from './components/HeaderSection/Document.jsx';
import Actualites from './components/HeaderSection/Actualites.jsx';
import NousRejoindreHeader from './components/HeaderSection/NousRejoindreHeader.jsx';
import Activities from './components/HeaderSection/Activities.jsx';
import ProfessionalArea from './components/HeaderSection/ProfessionalArea.jsx';
import Portfolio from './components/HeaderSection/Portfolio.jsx';
import ThonRecipes from './components/HeaderSection/ThonRecipes.jsx';
import Services from './components/HeaderSection/Services.jsx';
import ThonProduct from './components/HeaderSection/ThonProduct.jsx';

// Admin posts
import TeamMessage from './components/Admin/TeamPost.jsx';
import Formation from './components/Admin/Formation.jsx';
import ListeRejoindre from './components/Admin/ListeRejoindre.jsx';
import ListeContacts from './components/Admin/ListeContacts.jsx';
import ListePostulantsCommunity from './components/Admin/ListeCommunity.jsx';
import ListPartners from './components/Admin/ListePartner.jsx';
import ListeAbonnement from './components/Admin/ListeAbonnement.jsx';
import Inscription from './components/Admin/Inscription.jsx';
import ValeurPost from './components/Admin/ValeurPost.jsx';
import Entreprise from './components/Admin/Entreprise.jsx';
import MotPresidentPost from './components/Admin/MotPresidentPost.jsx';
import VideoPost from './components/Admin/VideoPost.jsx';
import ListeApprenants from './components/Admin/ListeApprenants.jsx';
import DocumentPost from './components/Admin/DocumentPost.jsx';
import ProgramPost from './components/Admin/ProgramPost.jsx';
import ActivitiesPost from './components/Admin/ActivitiesPost.jsx';
import PartnerPost from './components/Admin/PartnerPost.jsx';
import NewsPost from './components/Admin/NewsPost.jsx';
import ProfessionalAreaPost from './components/Admin/ProfessionalAreaPost.jsx';
import PortfolioPost from './components/Admin/PortfolioPost.jsx';
import ThonRecipesPost from './components/Admin/ThonRecipesPost.jsx';
import ServicePost from './components/Admin/ServicePost.jsx';
import ThonProductPost from './components/Admin/ThonProductPost.jsx';
import AddUser from './components/Admin/AddUser.jsx';
import SuiviEvaluation from './components/Admin/SuiviEvaluation.jsx';
import Formateurs from './components/Admin/Formateurs.jsx';
import FormationContinue from './components/Admin/FormationContinue.jsx';



// ✅ Router
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      
      {/* Redirection par défaut vers login */}
      <Route index element={<Navigate to="/login" replace />} />

      {/* Routes publiques */}
      <Route path="login" element={<Login />} />
      <Route path="forgotpassword" element={<Forgetpassword />} />
      <Route path="home" element={<Home />} />
      <Route path="categories" element={<Categories />} />
      <Route path="createpost" element={<Createpost />} />
      <Route path="blogdetail/:blogid" element={<Blogdetail />} />
      <Route path="qui-sommes-nous-" element={<Quisommesnous />} />
      <Route path="contacternous" element={<Contacternous />} />
      <Route path="nous-rejoindre" element={<NousRejoindre />} />
      <Route path="motPresident" element={<MotPresident />} />
      <Route path="fondation" element={<Fondation />} />
      <Route path="nosValeurs" element={<NosValeurs />} />
      <Route path="nosMissions" element={<NosMissions />} />
      <Route path="notreEquipe" element={<NotreEquipe />} />
      <Route path="programs" element={<Programs />} />
      <Route path="community" element={<Community />} />
      <Route path="partner" element={<Partner />} />
      <Route path="plateforms" element={<Plateforms />} />
      <Route path="videotheque" element={<Videotheque />} />
      <Route path="phototheque" element={<Phototheque />} />
      <Route path="document" element={<Document />} />
      <Route path="actualites" element={<Actualites />} />
      <Route path="nousRejoindreHeader" element={<NousRejoindreHeader />} />
      <Route path="activities" element={<Activities />} />
      <Route path="professionalArea" element={<ProfessionalArea />} />
      <Route path="portfolio" element={<Portfolio />} />
      <Route path="thonRecipes" element={<ThonRecipes />} />
      <Route path="services" element={<Services />} />
      <Route path="thonProduct" element={<ThonProduct />} />

      {/* Routes admin protégées */}
      <Route element={<PrivateRoute />}>
        <Route path="dashboardAdmin" element={<DashboardAdmin />} />
        <Route path="teamMessage" element={<TeamMessage />} />
        <Route path="formation" element={<Formation />} />
        <Route path="listeRejoindre" element={<ListeRejoindre />} />
        <Route path="listeContacts" element={<ListeContacts />} />
        <Route path="listePostulantsCommunity" element={<ListePostulantsCommunity />} />
        <Route path="listPartners" element={<ListPartners />} />
        <Route path="listeAbonnement" element={<ListeAbonnement />} />
        <Route path="inscription" element={<Inscription />} />
        <Route path="valeurPost" element={<ValeurPost />} />
        <Route path="entreprise" element={<Entreprise />} />
        <Route path="motPresidentPost" element={<MotPresidentPost />} />
        <Route path="videoPost" element={<VideoPost />} />
        <Route path="listeApprenants" element={<ListeApprenants />} />
        <Route path="documentPost" element={<DocumentPost />} />
        <Route path="programPost" element={<ProgramPost />} />
        <Route path="activitiesPost" element={<ActivitiesPost />} />
        <Route path="partnerPost" element={<PartnerPost />} />
        <Route path="newsPost" element={<NewsPost />} />
        <Route path="professionalAreaPost" element={<ProfessionalAreaPost />} />
        <Route path="thonRecipesPost" element={<ThonRecipesPost />} />
        <Route path="portfolioPost" element={<PortfolioPost />} />
        <Route path="servicePost" element={<ServicePost />} />
        <Route path="thonProductPost" element={<ThonProductPost />} />
        <Route path="addUser" element={<AddUser />} />
        <Route path="suiviEvaluation" element={<SuiviEvaluation />} />
        <Route path="formateurs" element={<Formateurs />} />
        <Route path="formationContinue" element={<FormationContinue />} />
      </Route>

    </Route>
  )
);

// ✅ Point d’entrée de l’app
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <I18nextProvider i18n={i18next}>
      <RouterProvider router={router} />
    </I18nextProvider>
  </StrictMode>
);
