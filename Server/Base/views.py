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

# views.py
import io
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from collections import Counter

from django.http import HttpResponse
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response

from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, Image
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from openpyxl import Workbook

from .models import EvaluationSession, Apprenant, Critere, Evaluation, NOTE_MAPPING
from .serializers import EvaluationSessionSerializer


class EvaluationSessionViewSet(ModelViewSet):
    queryset = EvaluationSession.objects.all()
    serializer_class = EvaluationSessionSerializer

    # -------------------------
    # Résultats JSON par apprenant
    # -------------------------
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

    # -------------------------
    # Export Excel
    # -------------------------
    @action(detail=True, methods=['get'])
    def export_excel(self, request, pk=None):
        session = self.get_object()
        apprenants = Apprenant.objects.all()

        wb = Workbook()
        ws = wb.active
        ws.title = "Résultats"
        ws.append(["Apprenant", "Total Points", "%"])

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

    # -------------------------
    # PDF Ultime Global
    # -------------------------
    @action(detail=True, methods=['get'], url_path='pdf-global-ultimate')
    def pdf_global_ultimate(self, request, pk=None):
        session = self.get_object()
        apprenants = Apprenant.objects.all()
        criteres = Critere.objects.all()
        nb_criteres = criteres.count()

        # -------------------------
        # Calculs généraux
        # -------------------------
        total_points_global = 0
        total_max_global = nb_criteres * 75 * apprenants.count()
        data_apprenants = []
        notes_counter = {1:0,2:0,3:0}
        heatmap_matrix = []

        for apprenant in apprenants:
            total_apprenant = session.total_points_apprenant(apprenant)
            percent_apprenant = session.percentage_apprenant(apprenant)
            total_points_global += total_apprenant
            data_apprenants.append((apprenant.nom, total_apprenant, percent_apprenant))

            row = []
            for critere in criteres:
                eval_obj = session.evaluation_set.filter(apprenant=apprenant, critere=critere).first()
                note = eval_obj.note if eval_obj else 0
                row.append(NOTE_MAPPING.get(note,0))
                if note in notes_counter:
                    notes_counter[note] += 1
            heatmap_matrix.append(row)

        pourcentage_global = round(total_points_global / total_max_global * 100, 2) if total_max_global else 0

        # -------------------------
        # Création PDF
        # -------------------------
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []
        styles = getSampleStyleSheet()

        elements.append(Paragraph(f"Rapport Global Ultime - Session : {session.theme}", styles['Title']))
        elements.append(Spacer(1,12))
        elements.append(Paragraph(f"Total Points Global : {total_points_global}", styles['Normal']))
        elements.append(Paragraph(f"Pourcentage Global : {pourcentage_global}%", styles['Normal']))
        elements.append(Spacer(1,12))

        # Tableau par apprenant
        table_data = [["Apprenant", "Total Points", "Pourcentage"]]
        for nom, total, percent in data_apprenants:
            table_data.append([nom, total, percent])
        elements.append(Table(table_data))
        elements.append(Spacer(1,12))

        # Graphique 1 : Bar chart % par apprenant
        plt.figure(figsize=(8,4))
        noms = [x[0] for x in data_apprenants]
        pourcentages = [x[2] for x in data_apprenants]
        plt.bar(noms, pourcentages, color='skyblue')
        plt.title("Pourcentage par Apprenant")
        plt.ylabel("Pourcentage (%)")
        plt.xticks(rotation=45, ha='right')
        plt.tight_layout()
        buf1 = io.BytesIO()
        plt.savefig(buf1, format='png')
        plt.close()
        buf1.seek(0)
        elements.append(Image(buf1, width=450, height=200))
        elements.append(Spacer(1,12))

        # Graphique 2 : Camembert taux de satisfaction
        labels = ["Pas satisfait", "Satisfait", "Très satisfait"]
        sizes = [notes_counter[1], notes_counter[2], notes_counter[3]]
        plt.figure(figsize=(4,4))
        plt.pie(sizes, labels=labels, autopct='%1.1f%%', colors=['red','yellow','green'])
        plt.title("Taux de Satisfaction")
        buf2 = io.BytesIO()
        plt.savefig(buf2, format='png')
        plt.close()
        buf2.seek(0)
        elements.append(Image(buf2, width=300, height=300))
        elements.append(Spacer(1,12))

        # Graphique 3 : Histogramme points par critère
        critere_scores = []
        for critere in criteres:
            total_crit = sum([NOTE_MAPPING.get(e.note,0) for e in session.evaluation_set.filter(critere=critere)])
            critere_scores.append(total_crit)
        plt.figure(figsize=(8,4))
        plt.bar([c.nom for c in criteres], critere_scores, color='orange')
        plt.title("Total Points par Critère")
        plt.xticks(rotation=45, ha='right')
        plt.tight_layout()
        buf3 = io.BytesIO()
        plt.savefig(buf3, format='png')
        plt.close()
        buf3.seek(0)
        elements.append(Image(buf3, width=450, height=200))
        elements.append(Spacer(1,12))

        # Graphique 4 : Heatmap (Apprenant x Critère)
        plt.figure(figsize=(10,6))
        sns.heatmap(np.array(heatmap_matrix), annot=True, fmt='d',
                    yticklabels=[a.nom for a in apprenants],
                    xticklabels=[c.nom for c in criteres],
                    cmap='YlGnBu')
        plt.title("Heatmap : Points par Apprenant / Critère")
        plt.tight_layout()
        buf4 = io.BytesIO()
        plt.savefig(buf4, format='png')
        plt.close()
        buf4.seek(0)
        elements.append(Image(buf4, width=450, height=300))
        elements.append(Spacer(1,12))

        # Graphique 5 : Boxplot distribution notes par critère
        box_data = []
        for critere in criteres:
            critere_notes = [NOTE_MAPPING.get(e.note,0) for e in session.evaluation_set.filter(critere=critere)]
            box_data.append(critere_notes)
        plt.figure(figsize=(8,4))
        plt.boxplot(box_data, labels=[c.nom for c in criteres])
        plt.title("Distribution des Points par Critère (Boxplot)")
        plt.ylabel("Points")
        plt.xticks(rotation=45, ha='right')
        plt.tight_layout()
        buf5 = io.BytesIO()
        plt.savefig(buf5, format='png')
        plt.close()
        buf5.seek(0)
        elements.append(Image(buf5, width=450, height=200))

        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        return HttpResponse(buffer, content_type='application/pdf')