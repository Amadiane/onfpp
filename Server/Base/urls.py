# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomLoginView, UserCreateView, MeView, RoleViewSet, RegionViewSet, CentreViewSet, UserListView, CandidatViewSet
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
router.register(r"candidats", CandidatViewSet, basename="candidat")



urlpatterns = [
    path("login/", CustomLoginView.as_view(), name="login"),
    path("me/", MeView.as_view(), name="me"),
    path("users/create/", UserCreateView.as_view(), name="user-create"),
    path("users/",        UserListView.as_view(),      name="user-list"),   # ← NOUVEAU
    path("", include(router.urls)),
]