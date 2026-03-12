# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomLoginView, UserCreateView, MeView, RoleViewSet, RegionViewSet, CentreViewSet, UserListView, CandidatViewSet, FormationViewSet, EntrepriseFormationViewSet, ModulePlanFormationViewSet, FormateurViewSet, ConstantsView, UserDetailView, PageViewSet, dashboard_view
from .views import (
    EvaluationSessionViewSet,
    CritereViewSet,
    ApprenantViewSet,
    EvaluationViewSet
    
    
)

router = DefaultRouter()
router.register(r'roles', RoleViewSet)
router.register(r'regions', RegionViewSet)
router.register(r'centres', CentreViewSet)
router.register(r'sessions', EvaluationSessionViewSet)
router.register(r'criteres', CritereViewSet)
router.register(r'apprenants', ApprenantViewSet)
router.register(r'evaluations', EvaluationViewSet)
router.register(r"formations",  FormationViewSet, basename="formation")
router.register(r"candidats",   CandidatViewSet,  basename="candidat")
router.register(r"entreprise-formations", EntrepriseFormationViewSet, basename="entreprise-formation")
router.register(r"modules-formation",     ModulePlanFormationViewSet, basename="module-formation")
router.register(r"formateurs", FormateurViewSet, basename="formateur")
router.register(r'pages', PageViewSet, basename='page')



urlpatterns = [
    path("login/", CustomLoginView.as_view(), name="login"),
    path("me/", MeView.as_view(), name="me"),
    path("users/create/", UserCreateView.as_view(), name="user-create"),
    path("users/",        UserListView.as_view(),      name="user-list"),   # ← NOUVEAU
    path("users/<int:pk>/", UserDetailView.as_view(), name="user-detail"), 
    path("constants/", ConstantsView.as_view(), name="constants"),  
    path("dashboard/", dashboard_view),
    path("", include(router.urls)),
]