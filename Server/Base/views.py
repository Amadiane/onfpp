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

    def post(self, request, *args, **kwargs):
        print("LOGIN DATA:", request.data)
        return super().post(request, *args, **kwargs)


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
# views.py — VERSION PROPRE (zéro matplotlib/numpy/seaborn)
# views.py — VERSION PROPRE (zéro matplotlib/numpy/seaborn)

# views.py — VERSION PROPRE (zéro matplotlib/numpy/seaborn)
# views.py — VERSION PROPRE (zéro matplotlib/numpy/seaborn)
# views.py — VERSION PROPRE (zéro matplotlib/numpy/seaborn)
# views.py — VERSION PROPRE (zéro matplotlib/numpy/seaborn)

import io

from django.http import HttpResponse
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response

from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_CENTER
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter

from .models import EvaluationSession, Apprenant, Critere, Evaluation, NOTE_MAPPING
from .serializers import (
    EvaluationSessionSerializer,
    CritereSerializer,
    ApprenantSerializer,
    EvaluationSerializer,
)

# ─── Couleurs ONFPP ───────────────────────────────────────
NAVY   = colors.HexColor("#0D1B5E")
BLUE   = colors.HexColor("#1A3BD4")
ICE    = colors.HexColor("#C8D9FF")
GREEN  = colors.HexColor("#0BA376")
ORANGE = colors.HexColor("#F5A800")
RED    = colors.HexColor("#E53935")
WHITE  = colors.white
LIGHT  = colors.HexColor("#EEF2FF")

def score_color(pct):
    if pct >= 75: return GREEN
    if pct >= 50: return ORANGE
    return RED

def score_label(pct):
    if pct >= 75: return "Très satisfaisant"
    if pct >= 50: return "Satisfaisant"
    return "Insuffisant"


# ─── CRUD simples ─────────────────────────────────────────
class CritereViewSet(ModelViewSet):
    queryset = Critere.objects.all()
    serializer_class = CritereSerializer

class ApprenantViewSet(ModelViewSet):
    queryset = Apprenant.objects.all()
    serializer_class = ApprenantSerializer

class EvaluationViewSet(ModelViewSet):
    queryset = Evaluation.objects.all()
    serializer_class = EvaluationSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        sid = self.request.query_params.get("session")
        if sid:
            qs = qs.filter(session_id=sid)
        return qs

    @action(detail=True, methods=["patch"], url_path="update-commentaire")
    def update_commentaire(self, request, pk=None):
        ev = self.get_object()
        commentaire = request.data.get("commentaire", "")
        ev.commentaire = commentaire
        ev.save(update_fields=["commentaire"])
        return Response({"id": ev.id, "commentaire": ev.commentaire})


# ─── Session ──────────────────────────────────────────────
class EvaluationSessionViewSet(ModelViewSet):
    queryset = EvaluationSession.objects.all()
    serializer_class = EvaluationSessionSerializer

    @action(detail=True, methods=["patch"], url_path="update-commentaire-final")
    def update_commentaire_final(self, request, pk=None):
        session = self.get_object()
        commentaire_final = request.data.get("commentaire_final", "")
        session.commentaire_final = commentaire_final
        session.save(update_fields=["commentaire_final"])
        return Response({"id": session.id, "commentaire_final": session.commentaire_final})

    # ── JSON résultats ──────────────────────────────────
    @action(detail=True, methods=["get"])
    def results(self, request, pk=None):
        session = self.get_object()
        apprenants = Apprenant.objects.filter(
            id__in=session.evaluation_set.values_list("apprenant", flat=True).distinct()
        )
        data = []
        for a in apprenants:
            total   = session.total_points_apprenant(a)
            percent = session.percentage_apprenant(a)
            data.append({
                "apprenant_id": a.id,
                "apprenant":    a.nom,
                "total_points": total,
                "percentage":   percent,
            })
        return Response(data)

    # ── JSON pour graphiques frontend ───────────────────
    @action(detail=True, methods=["get"], url_path="graph")
    def graph(self, request, pk=None):
        session = self.get_object()
        apprenants = Apprenant.objects.filter(
            id__in=session.evaluation_set.values_list("apprenant", flat=True).distinct()
        )
        criteres = Critere.objects.all()

        # Scores par apprenant
        scores = []
        for a in apprenants:
            total   = session.total_points_apprenant(a)
            percent = session.percentage_apprenant(a)
            scores.append({"apprenant": a.nom, "pourcentage": percent, "total": total})

        # Comptage notes globales (pour camembert satisfaction)
        notes_counter = {1: 0, 2: 0, 3: 0}
        for ev in session.evaluation_set.all():
            if ev.note in notes_counter:
                notes_counter[ev.note] += 1

        # Scores par critère
        critere_data = []
        nb_app = apprenants.count()
        for c in criteres:
            evs = session.evaluation_set.filter(critere=c)
            pts = sum(NOTE_MAPPING.get(e.note, 0) for e in evs)
            pct = round(pts / (nb_app * 75) * 100, 1) if nb_app else 0
            critere_data.append({"nom": c.nom, "total": pts, "pourcentage": pct})

        return Response({
            "scores":          scores,
            "notes_counter":   notes_counter,
            "critere_data":    critere_data,
        })

    # ── Export Excel ────────────────────────────────────
    @action(detail=True, methods=["get"])
    def export_excel(self, request, pk=None):
        session   = self.get_object()
        apprenants = Apprenant.objects.filter(
            id__in=session.evaluation_set.values_list("apprenant", flat=True).distinct()
        )
        criteres  = Critere.objects.all()

        wb = Workbook()
        ws = wb.active
        ws.title = "Résultats"

        hdr_font = Font(bold=True, color="FFFFFF", size=11)
        hdr_fill = PatternFill("solid", fgColor="0D1B5E")
        c_align  = Alignment(horizontal="center", vertical="center", wrap_text=True)

        headers = (["#", "Apprenant"] +
                   [c.nom for c in criteres] +
                   ["Total pts", "Max pts", "%", "Appréciation"])
        for col, h in enumerate(headers, 1):
            cell = ws.cell(row=1, column=col, value=h)
            cell.font = hdr_font; cell.fill = hdr_fill; cell.alignment = c_align
            ws.column_dimensions[get_column_letter(col)].width = max(12, len(h) + 2)

        nb_crit = criteres.count()
        max_pts = nb_crit * 75
        ri = 2
        for i, a in enumerate(apprenants, 1):
            evals   = session.evaluation_set.filter(apprenant=a)
            total   = session.total_points_apprenant(a)
            percent = session.percentage_apprenant(a)
            appreci = score_label(percent)

            alt = PatternFill("solid", fgColor="EEF2FF" if i % 2 == 0 else "FFFFFF")
            row_data = [i, a.nom]
            for c in criteres:
                ev = evals.filter(critere=c).first()
                row_data.append(NOTE_MAPPING.get(ev.note, 0) if ev else 0)
            row_data += [total, max_pts, f"{percent}%", appreci]
            for col, val in enumerate(row_data, 1):
                cell = ws.cell(row=ri, column=col, value=val)
                cell.fill = alt; cell.alignment = c_align
            ri += 1

        # Ligne totaux
        nb_app      = apprenants.count()
        total_glob  = sum(session.total_points_apprenant(a) for a in apprenants)
        max_glob    = nb_crit * 75 * nb_app
        pct_glob    = round(total_glob / max_glob * 100, 2) if max_glob else 0
        tc = len(headers) - 3
        ws.cell(row=ri, column=2, value="TOTAL SESSION")
        ws.cell(row=ri, column=tc,   value=total_glob)
        ws.cell(row=ri, column=tc+1, value=max_glob)
        ws.cell(row=ri, column=tc+2, value=f"{pct_glob}%")
        for col in range(1, len(headers)+1):
            cell = ws.cell(row=ri, column=col)
            cell.font = Font(bold=True, color="FFFFFF")
            cell.fill = PatternFill("solid", fgColor="1A3BD4")
            cell.alignment = c_align

        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response["Content-Disposition"] = (
            f'attachment; filename="resultats_session_{session.id}.xlsx"'
        )
        wb.save(response)
        return response

    # ── PDF Global (sans graphiques, propre) ────────────
    @action(detail=True, methods=["get", "post"], url_path="pdf-global")
    def pdf_global(self, request, pk=None):
        session   = self.get_object()
        apprenants = Apprenant.objects.filter(
            id__in=session.evaluation_set.values_list("apprenant", flat=True).distinct()
        )
        criteres  = Critere.objects.all()
        nb_crit   = criteres.count()

        # Calculs
        data_app = []
        total_glob = 0
        for a in apprenants:
            total   = session.total_points_apprenant(a)
            percent = session.percentage_apprenant(a)
            total_glob += total
            data_app.append({"nom": a.nom, "total": total, "percent": percent})

        nb_app   = apprenants.count()
        max_glob = nb_crit * 75 * nb_app
        pct_glob = round(total_glob / max_glob * 100, 2) if max_glob else 0

        # PDF
        buf = io.BytesIO()
        doc = SimpleDocTemplate(
            buf, pagesize=A4,
            leftMargin=1.8*cm, rightMargin=1.8*cm,
            topMargin=2*cm,    bottomMargin=2*cm,
        )
        st = getSampleStyleSheet()
        el = []

        s_title = ParagraphStyle("T", parent=st["Title"],
                                 textColor=NAVY, fontSize=18,
                                 alignment=TA_CENTER, spaceAfter=4)
        s_sub   = ParagraphStyle("S", parent=st["Normal"],
                                 textColor=BLUE, fontSize=12,
                                 alignment=TA_CENTER, spaceAfter=10)
        s_h2    = ParagraphStyle("H2", parent=st["Heading2"],
                                 textColor=NAVY, fontSize=12,
                                 spaceBefore=14, spaceAfter=6)

        fd = lambda d: d.strftime("%d/%m/%Y") if d else "—"

        # En-tête
        el.append(Paragraph("RAPPORT D'ÉVALUATION DE FORMATION", s_title))
        el.append(Paragraph(session.theme, s_sub))
        el.append(Paragraph(
            f"Formateur : <b>{session.formateur}</b> &nbsp;·&nbsp; "
            f"Lieu : <b>{session.lieu}</b> &nbsp;·&nbsp; "
            f"Période : <b>{fd(session.periode_debut)} → {fd(session.periode_fin)}</b>",
            ParagraphStyle("meta", parent=st["Normal"],
                           alignment=TA_CENTER, fontSize=9,
                           textColor=NAVY, spaceAfter=10)
        ))
        el.append(HRFlowable(width="100%", thickness=3, color=NAVY))
        el.append(Spacer(1, 0.4*cm))

        # Résumé global
        appreci_g = score_label(pct_glob)
        sc_g = score_color(pct_glob)
        rt = Table([
            ["Apprenants évalués", str(nb_app),
             "Total points", str(total_glob)],
            ["Rubriques évaluées", str(nb_crit),
             "Points maximum",     str(max_glob)],
            ["Pourcentage global", f"{pct_glob} %",
             "Appréciation",       appreci_g],
        ], colWidths=[4.5*cm, 3*cm, 4.5*cm, 4.5*cm])
        rt.setStyle(TableStyle([
            ("BACKGROUND",   (0,0), (0,-1), ICE),
            ("BACKGROUND",   (2,0), (2,-1), ICE),
            ("FONTNAME",     (0,0), (-1,-1), "Helvetica-Bold"),
            ("FONTSIZE",     (0,0), (-1,-1), 9),
            ("TEXTCOLOR",    (1,2), (1,2),   sc_g),
            ("TEXTCOLOR",    (3,2), (3,2),   sc_g),
            ("GRID",         (0,0), (-1,-1), 0.5, ICE),
            ("PADDING",      (0,0), (-1,-1), 8),
            ("ROWBACKGROUNDS", (0,0), (-1,-1),
             [LIGHT, WHITE, colors.HexColor("#F0FFF8")]),
        ]))
        el.append(rt)
        el.append(Spacer(1, 0.6*cm))

        # Tableau apprenants trié par score
        el.append(Paragraph("Résultats par apprenant", s_h2))
        el.append(HRFlowable(width="100%", thickness=1, color=ICE))
        el.append(Spacer(1, 0.3*cm))

        rows = [["#", "Apprenant", "Taux (%)", "Appréciation"]]
        for i, d in enumerate(sorted(data_app, key=lambda x: -x["percent"]), 1):
            rows.append([str(i), d["nom"], f"{d['percent']} %", score_label(d["percent"])])
        rows.append(["—", "TOTAL SESSION", f"{pct_glob} %", appreci_g])

        at = Table(rows, colWidths=[1*cm, 7*cm, 3*cm, 5.5*cm])
        ts = [
            ("BACKGROUND", (0,0), (-1,0), NAVY),
            ("TEXTCOLOR",  (0,0), (-1,0), WHITE),
            ("FONTNAME",   (0,0), (-1,0), "Helvetica-Bold"),
            ("FONTSIZE",   (0,0), (-1,-1), 9),
            ("ALIGN",      (0,0), (-1,-1), "CENTER"),
            ("ALIGN",      (1,1), (1,-1),  "LEFT"),
            ("GRID",       (0,0), (-1,-1), 0.5, ICE),
            ("PADDING",    (0,0), (-1,-1), 7),
            ("BACKGROUND", (0,-1), (-1,-1), BLUE),
            ("TEXTCOLOR",  (0,-1), (-1,-1), WHITE),
            ("FONTNAME",   (0,-1), (-1,-1), "Helvetica-Bold"),
        ]
        for ri2, d in enumerate(sorted(data_app, key=lambda x: -x["percent"]), 1):
            sc = score_color(d["percent"])
            bg = ("#F0FDF4" if d["percent"] >= 75
                  else "#FFFBEB" if d["percent"] >= 50
                  else "#FFF1F2")
            ts += [
                ("TEXTCOLOR",  (2, ri2), (3, ri2), sc),
                ("BACKGROUND", (2, ri2), (3, ri2), colors.HexColor(bg)),
            ]
        at.setStyle(TableStyle(ts))
        el.append(at)

        # ── Graphiques + Analyses ──────────────────────────────
        import base64
        from reportlab.platypus import Image as RLImage

        chart_bars = chart_crit = chart_pie = None
        if request.method == "POST":
            body       = request.data
            chart_bars = body.get("chart_bars")
            chart_crit = body.get("chart_crit")
            chart_pie  = body.get("chart_pie")

        def b64_img(data_url, w_cm, h_cm):
            if not data_url:
                return None
            _, b64 = data_url.split(",", 1)
            return RLImage(io.BytesIO(base64.b64decode(b64)),
                           width=w_cm*cm, height=h_cm*cm)

        s_chart_title = ParagraphStyle(
            "ChartTitle", parent=st["Normal"],
            fontSize=11, fontName="Helvetica-Bold",
            textColor=NAVY, spaceBefore=10, spaceAfter=4,
        )
        s_analysis = ParagraphStyle(
            "AnalysisText", parent=st["Normal"],
            fontSize=9, textColor=colors.HexColor("#4A5A8A"),
            leading=14, spaceBefore=6, spaceAfter=4,
            leftIndent=10, borderPad=4,
        )

        def analysis_text(pct):
            """Génère un commentaire analytique selon le score global."""
            if pct >= 80:
                return (f"✅ <b>Excellente performance</b> — Le taux global de {pct:.1f}% reflète une "
                        "maîtrise solide des compétences évaluées. Les résultats dépassent "
                        "les seuils d'excellence fixés à 75%, ce qui témoigne de l'efficacité "
                        "pédagogique de la formation.")
            elif pct >= 65:
                return (f"✔ <b>Performance satisfaisante</b> — Avec un taux de {pct:.1f}%, "
                        "la formation atteint globalement ses objectifs. Quelques points "
                        "d'amélioration restent identifiables pour les rubriques en deçà du seuil.")
            elif pct >= 50:
                return (f"⚠ <b>Performance passable</b> — Le taux de {pct:.1f}% indique que "
                        "la moitié des apprenants ont atteint le niveau satisfaisant. "
                        "Un renforcement ciblé sur les rubriques faibles est recommandé.")
            else:
                return (f"🔴 <b>Performance insuffisante</b> — Le taux de {pct:.1f}% est en deçà "
                        "des seuils attendus. Une révision du contenu et des méthodes "
                        "pédagogiques est fortement recommandée.")

        def crit_analysis(critere_data):
            """Analyse des rubriques les plus fortes et les plus faibles."""
            if not critere_data:
                return "Aucune donnée de rubrique disponible."
            srt = sorted(critere_data, key=lambda x: x["pourcentage"], reverse=True)
            best  = srt[0]  if len(srt) >= 1 else None
            worst = srt[-1] if len(srt) >= 2 else None
            txt = ""
            if best:
                txt += (f"📊 <b>Rubrique la mieux maîtrisée</b> : « {best['nom']} » avec "
                        f"{best['pourcentage']:.1f}%. ")
            if worst and worst["nom"] != best["nom"]:
                txt += (f"La rubrique nécessitant le plus d'attention est "
                        f"« {worst['nom']} » ({worst['pourcentage']:.1f}%). ")
            below = [c for c in srt if c["pourcentage"] < 50]
            if below:
                noms = ", ".join(f'« {c["nom"]} »' for c in below[:3])
                txt += f"Les rubriques en dessous du seuil minimal (50%) sont : {noms}."
            else:
                txt += "Toutes les rubriques dépassent le seuil minimal de 50%."
            return txt

        def pie_analysis(notes_counter):
            total = sum(notes_counter.values())
            if not total:
                return "Aucune évaluation enregistrée."
            tres = notes_counter.get(3, 0)
            sat  = notes_counter.get(2, 0)
            pas  = notes_counter.get(1, 0)
            p_tres = round(tres/total*100)
            p_sat  = round(sat/total*100)
            p_pas  = round(pas/total*100)
            return (f"📈 <b>{p_tres}% de Très satisfaisant</b>, {p_sat}% de Satisfaisant, "
                    f"{p_pas}% de Pas satisfaisant sur {total} évaluations au total. "
                    + ("Le niveau général est jugé très satisfaisant." if p_tres >= 50
                       else "Une amélioration du niveau général reste possible." if p_sat >= 40
                       else "Des efforts significatifs sont nécessaires pour améliorer le niveau général."))

        # Récupérer les données critères pour l'analyse textuelle
        critere_data_list = []
        for c in criteres:
            evs = session.evaluation_set.filter(critere=c)
            pts = sum(NOTE_MAPPING.get(e.note, 0) for e in evs)
            pct = round(pts / (nb_app * 75) * 100, 1) if nb_app else 0
            critere_data_list.append({"nom": c.nom, "pourcentage": pct})

        notes_counter_dict = {1:0, 2:0, 3:0}
        for ev in session.evaluation_set.all():
            if ev.note in notes_counter_dict:
                notes_counter_dict[ev.note] += 1

        if chart_bars or chart_crit or chart_pie:
            el.append(Spacer(1, 0.8*cm))
            el.append(HRFlowable(width="100%", thickness=2, color=BLUE))
            el.append(Spacer(1, 0.3*cm))
            el.append(Paragraph("Analyses graphiques", s_h2))
            el.append(Spacer(1, 0.3*cm))

        # ── Graphe 1 : Scores apprenants ──
        if chart_bars:
            img = b64_img(chart_bars, 15.5, max(6, nb_app * 0.55 + 2))
            if img:
                el.append(Paragraph("① Scores individuels par apprenant", s_chart_title))
                el.append(HRFlowable(width="100%", thickness=0.5, color=ICE))
                el.append(Spacer(1, 0.2*cm))
                el.append(img)
                el.append(Paragraph(
                    analysis_text(pct_glob),
                    s_analysis
                ))
                el.append(Spacer(1, 0.5*cm))

        # ── Graphe 2 : Scores rubriques ──
        if chart_crit:
            img = b64_img(chart_crit, 15.5, 7.5)
            if img:
                el.append(Paragraph("② Performance par rubrique d'évaluation", s_chart_title))
                el.append(HRFlowable(width="100%", thickness=0.5, color=ICE))
                el.append(Spacer(1, 0.2*cm))
                el.append(img)
                el.append(Paragraph(
                    crit_analysis(critere_data_list),
                    s_analysis
                ))
                el.append(Spacer(1, 0.5*cm))

        # ── Graphe 3 : Satisfaction ──
        if chart_pie:
            img = b64_img(chart_pie, 14, 6.5)
            if img:
                el.append(Paragraph("③ Répartition des niveaux de satisfaction", s_chart_title))
                el.append(HRFlowable(width="100%", thickness=0.5, color=ICE))
                el.append(Spacer(1, 0.2*cm))
                el.append(img)
                el.append(Paragraph(
                    pie_analysis(notes_counter_dict),
                    s_analysis
                ))

        # ── Commentaires individuels (depuis le frontend — filtrés par l'utilisateur) ──
        commentaires_app = []
        if request.method == "POST":
            for item in request.data.get("commentaires_apprenants", []):
                nom = item.get("nom","").strip()
                txt = item.get("commentaire","").strip()
                if nom and txt:
                    commentaires_app.append((nom, txt))

        if commentaires_app:
            el.append(Spacer(1, 0.8*cm))
            el.append(HRFlowable(width="100%", thickness=2, color=BLUE))
            el.append(Spacer(1, 0.3*cm))
            el.append(Paragraph("Commentaires des apprenants", s_h2))
            el.append(Spacer(1, 0.2*cm))
            s_comment_name = ParagraphStyle(
                "CommentName", parent=st["Normal"],
                fontSize=10, fontName="Helvetica-Bold",
                textColor=NAVY, spaceBefore=6, spaceAfter=2,
            )
            s_comment_body = ParagraphStyle(
                "CommentBody", parent=st["Normal"],
                fontSize=9, textColor=colors.HexColor("#4A5A8A"),
                leading=14, leftIndent=12, spaceAfter=6,
                borderPad=4,
            )
            for nom, comment in commentaires_app:
                el.append(Paragraph(f"▸ {nom}", s_comment_name))
                el.append(Paragraph(comment, s_comment_body))
                el.append(HRFlowable(width="90%", thickness=0.5, color=ICE))

        # ── Commentaire final de session ──────────────────────
        commentaire_final = ""
        if request.method == "POST":
            commentaire_final = request.data.get("commentaire_final", "").strip()
        if not commentaire_final:
            try:
                commentaire_final = session.commentaire_final or ""
            except Exception:
                commentaire_final = ""
        if commentaire_final:
            el.append(Spacer(1, 0.8*cm))
            el.append(HRFlowable(width="100%", thickness=2, color=BLUE))
            el.append(Spacer(1, 0.3*cm))
            el.append(Paragraph("Commentaire final", s_h2))
            el.append(Spacer(1, 0.2*cm))
            s_final = ParagraphStyle(
                "CommentFinal", parent=st["Normal"],
                fontSize=10, textColor=colors.HexColor("#0D1B5E"),
                leading=16, leftIndent=10, spaceAfter=8,
                backColor=colors.HexColor("#F0F4FF"),
                borderPad=10, borderRadius=4,
            )
            el.append(Paragraph(commentaire_final, s_final))

        doc.build(el)
        buf.seek(0)
        return HttpResponse(buf, content_type="application/pdf")