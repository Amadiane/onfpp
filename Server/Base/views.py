# # views.py
# from rest_framework import generics, viewsets
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.exceptions import PermissionDenied
# from rest_framework_simplejwt.views import TokenObtainPairView
# from rest_framework import permissions

# from .models import User, Role, Region, Centre
# from .serializers import UserCreateSerializer, CustomTokenObtainPairSerializer, RoleSerializer, RegionSerializer, CentreSerializer
# from .permissions import IsHighLevelUser

# # ------------------ LOGIN ------------------
# class CustomLoginView(TokenObtainPairView):
#     serializer_class = CustomTokenObtainPairSerializer

# # ------------------ CREATE USER ------------------
# from rest_framework.permissions import AllowAny
# class UserCreateView(generics.CreateAPIView):
#     serializer_class = UserCreateSerializer
#     # permission_classes = [IsHighLevelUser]
#     permission_classes = [AllowAny]  # 👈 juste pour tester

# # ------------------ CONNECTED USER ------------------
# class MeView(APIView):
#     permission_classes = [permissions.IsAuthenticated]

#     def get(self, request):
#         user = request.user
#         return Response({
#             "username": user.username,
#             "role": user.role.name if user.role else None,
#             "region": user.region.id if user.region else None,
#             "centre": user.centre.id if user.centre else None,
#         })

# # ------------------ ROLE / REGION / CENTRE ------------------
# class RoleViewSet(viewsets.ReadOnlyModelViewSet):
#     queryset = Role.objects.all()
#     serializer_class = RoleSerializer
#     permission_classes = [permissions.IsAuthenticated]

# class RegionViewSet(viewsets.ReadOnlyModelViewSet):
#     queryset = Region.objects.all()
#     serializer_class = RegionSerializer
#     permission_classes = [permissions.IsAuthenticated]

# class CentreViewSet(viewsets.ReadOnlyModelViewSet):
#     queryset = Centre.objects.all()
#     serializer_class = CentreSerializer
#     permission_classes = [permissions.IsAuthenticated]



# views.py — fichier COMPLET

from rest_framework import generics, viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User, Role, Region, Centre
from .serializers import (
    UserCreateSerializer, CustomTokenObtainPairSerializer,
    RoleSerializer, RegionSerializer, CentreSerializer,
)


# ── Login JWT ────────────────────────────────────────────────
class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


# ── Utilisateur connecté ─────────────────────────────────────
class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id":         user.id,
            "username":   user.username,
            "first_name": user.first_name,
            "last_name":  user.last_name,
            "email":      user.email,
            "role":       user.role.name   if user.role   else None,
            "niveau":     user.role.level  if user.role   else 0,
            "region":     user.region.name if user.region else None,
            "centre":     user.centre.name if user.centre else None,
        })


# ── Créer un utilisateur ─────────────────────────────────────
class UserCreateView(generics.CreateAPIView):
    serializer_class   = UserCreateSerializer
    permission_classes = [AllowAny]   # ← remplacez par IsAuthenticated en prod


# ── Roles / Régions / Centres (lecture seule) ────────────────
class RoleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset           = Role.objects.all()
    serializer_class   = RoleSerializer
    permission_classes = [IsAuthenticated]


class RegionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset           = Region.objects.all()
    serializer_class   = RegionSerializer
    permission_classes = [IsAuthenticated]


class CentreViewSet(viewsets.ReadOnlyModelViewSet):
    queryset           = Centre.objects.all()
    serializer_class   = CentreSerializer
    permission_classes = [IsAuthenticated]






# views.py — fichier COMPLET

from rest_framework import generics, viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User, Role, Region, Centre
from .serializers import (
    UserCreateSerializer, CustomTokenObtainPairSerializer,
    RoleSerializer, RegionSerializer, CentreSerializer,
)


# ── Login JWT ────────────────────────────────────────────────
class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


# ── Utilisateur connecté ─────────────────────────────────────
class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id":         user.id,
            "username":   user.username,
            "first_name": user.first_name,
            "last_name":  user.last_name,
            "email":      user.email,
            "role":       user.role.name   if user.role   else None,
            "niveau":     user.role.level  if user.role   else 0,
            "region":     user.region.name if user.region else None,
            "centre":     user.centre.name if user.centre else None,
        })


# ── Créer un utilisateur ─────────────────────────────────────
class UserCreateView(generics.CreateAPIView):
    serializer_class   = UserCreateSerializer
    permission_classes = [AllowAny]   # ← remplacez par IsAuthenticated en prod


# ── Roles / Régions / Centres (lecture seule) ────────────────
class RoleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset           = Role.objects.all()
    serializer_class   = RoleSerializer
    # permission_classes = [IsAuthenticated]
    permission_classes = [AllowAny]  


class RegionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset           = Region.objects.all()
    serializer_class   = RegionSerializer
    permission_classes = [IsAuthenticated]


class CentreViewSet(viewsets.ReadOnlyModelViewSet):
    queryset           = Centre.objects.all()
    serializer_class   = CentreSerializer
    permission_classes = [IsAuthenticated]


# ── Liste des utilisateurs (GET /api/users/) ─────────────────
from rest_framework import serializers as drf_serializers

class UserListSerializer(drf_serializers.ModelSerializer):
    role   = RoleSerializer(read_only=True)
    region = RegionSerializer(read_only=True)
    centre = CentreSerializer(read_only=True)

    class Meta:
        model  = User
        fields = [
            "id", "username", "first_name", "last_name",
            "email", "is_active", "date_joined",
            "role", "region", "centre",
        ]

class UserListView(generics.ListAPIView):
    queryset           = User.objects.select_related("role","region","centre").all().order_by("-date_joined")
    serializer_class   = UserListSerializer
    permission_classes = [IsAuthenticated]


# ── Liste des utilisateurs ───────────────────────────────────
from rest_framework import serializers as drf_serializers

class UserListSerializer(drf_serializers.ModelSerializer):
    role   = RoleSerializer(read_only=True)
    region = RegionSerializer(read_only=True)
    centre = CentreSerializer(read_only=True)

    class Meta:
        model  = User
        fields = [
            "id", "username", "first_name", "last_name",
            "email", "is_active", "role", "region", "centre",
        ]

class UserListView(generics.ListAPIView):
    queryset           = User.objects.select_related("role","region","centre").all()
    serializer_class   = UserListSerializer
    # permission_classes = [IsAuthenticated]
    permission_classes = [AllowAny]  