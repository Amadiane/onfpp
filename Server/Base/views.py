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



























# views.py

import io
import matplotlib.pyplot as plt

from django.http import HttpResponse
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response

from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import A4

from openpyxl import Workbook

from .models import *
from .serializers import *


# views.py

import io
import matplotlib.pyplot as plt

from django.http import HttpResponse
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response

from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import A4
from openpyxl import Workbook

from .models import *
from .serializers import *

# ViewSets CRUD pour les autres modèles
class CritereViewSet(ModelViewSet):
    queryset = Critere.objects.all()
    serializer_class = CritereSerializer

class ApprenantViewSet(ModelViewSet):
    queryset = Apprenant.objects.all()
    serializer_class = ApprenantSerializer

class EvaluationViewSet(ModelViewSet):
    queryset = Evaluation.objects.all()
    serializer_class = EvaluationSerializer


# ViewSet principal pour EvaluationSession
class EvaluationSessionViewSet(ModelViewSet):
    queryset = EvaluationSession.objects.all()
    serializer_class = EvaluationSessionSerializer

    # 🔹 Résultats JSON par session
    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        session = self.get_object()
        apprenants = Apprenant.objects.all()

        data = []
        for apprenant in apprenants:
            total = session.total_points_apprenant(apprenant)
            percent = session.percentage_apprenant(apprenant)
            data.append({
                "apprenant": apprenant.nom,
                "total_points": total,
                "percentage": percent
            })

        return Response(data)

    # 🔹 PDF par apprenant
    @action(detail=True, methods=['get'], url_path='pdf-apprenant/(?P<apprenant_id>[^/.]+)')
    def pdf_apprenant(self, request, pk=None, apprenant_id=None):
        session = self.get_object()
        apprenant = Apprenant.objects.get(id=apprenant_id)

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []
        styles = getSampleStyleSheet()

        elements.append(Paragraph(f"Rapport Evaluation - {apprenant.nom}", styles['Title']))
        elements.append(Spacer(1, 12))

        total = session.total_points_apprenant(apprenant)
        percent = session.percentage_apprenant(apprenant)

        data = [
            ["Total Points", total],
            ["Pourcentage", f"{percent}%"]
        ]
        table = Table(data)
        elements.append(table)

        doc.build(elements)
        buffer.seek(0)
        return HttpResponse(buffer, content_type='application/pdf')

    # 🔹 PDF global session
    @action(detail=True, methods=['get'])
    def pdf_global(self, request, pk=None):
        session = self.get_object()
        apprenants = Apprenant.objects.all()

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []
        styles = getSampleStyleSheet()

        elements.append(Paragraph("Rapport Global Session", styles['Title']))
        elements.append(Spacer(1, 12))

        data = [["Apprenant", "Total", "%"]]
        for apprenant in apprenants:
            total = session.total_points_apprenant(apprenant)
            percent = session.percentage_apprenant(apprenant)
            data.append([apprenant.nom, total, percent])

        table = Table(data)
        elements.append(table)

        doc.build(elements)
        buffer.seek(0)
        return HttpResponse(buffer, content_type='application/pdf')

    # 🔹 Export Excel
    @action(detail=True, methods=['get'])
    def export_excel(self, request, pk=None):
        session = self.get_object()
        apprenants = Apprenant.objects.all()

        wb = Workbook()
        ws = wb.active
        ws.title = "Résultats"
        ws.append(["Apprenant", "Total", "%"])

        for apprenant in apprenants:
            total = session.total_points_apprenant(apprenant)
            percent = session.percentage_apprenant(apprenant)
            ws.append([apprenant.nom, total, percent])

        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response["Content-Disposition"] = "attachment; filename=resultats.xlsx"
        wb.save(response)
        return response

    # 🔹 Graphique statistique
    @action(detail=True, methods=['get'])
    def graph(self, request, pk=None):
        session = self.get_object()
        apprenants = Apprenant.objects.all()

        names = [a.nom for a in apprenants]
        percentages = [session.percentage_apprenant(a) for a in apprenants]

        plt.figure(figsize=(10,5))
        plt.bar(names, percentages, color='skyblue')
        plt.xlabel("Apprenants")
        plt.ylabel("Pourcentage")
        plt.title("Résultats Session")
        plt.xticks(rotation=45)

        buffer = io.BytesIO()
        plt.tight_layout()
        plt.savefig(buffer, format='png')
        plt.close()
        buffer.seek(0)

        return HttpResponse(buffer, content_type='image/png')