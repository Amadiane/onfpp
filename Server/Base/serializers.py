# serializers.py
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Role, Region, Centre

# ------------------ LOGIN JWT ------------------
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role.name if user.role else None
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data.update({
            "role": self.user.role.name if self.user.role else None,
            "username": self.user.username,
        })
        return data


from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Role, Region, Centre


# ── JWT Login ────────────────────────────────────────────────
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"]   = user.role.name   if user.role   else None
        token["niveau"] = user.role.level  if user.role   else 0
        token["region"] = user.region.name if user.region else None
        token["centre"] = user.centre.name if user.centre else None
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data.update({
            "username": self.user.username,
            "role":     self.user.role.name   if self.user.role   else None,
            "niveau":   self.user.role.level  if self.user.role   else 0,
            "region":   self.user.region.name if self.user.region else None,
            "centre":   self.user.centre.name if self.user.centre else None,
        })
        return data


# ── User Create ──────────────────────────────────────────────
class UserCreateSerializer(serializers.ModelSerializer):
    password    = serializers.CharField(write_only=True)
    role        = serializers.PrimaryKeyRelatedField(
                    queryset=Role.objects.all(),
                    required=False, allow_null=True
                  )
    role_name   = serializers.CharField(
                    required=False, allow_blank=True, write_only=True
                  )
    region_name = serializers.CharField(required=False, allow_blank=True, write_only=True)
    centre_name = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model  = User
        fields = [
            "username", "email", "password",
            "first_name", "last_name",
            "role", "role_name",
            "region_name", "centre_name",
        ]

    def validate(self, data):
        role      = data.get("role")
        role_name = data.pop("role_name", "").strip()

        if not role and role_name:
            try:
                data["role"] = Role.objects.get(name__iexact=role_name)
            except Role.DoesNotExist:
                data["role"], _ = Role.objects.get_or_create(
                    name=role_name,
                    defaults={"level": 1}
                )
        elif not role:
            raise serializers.ValidationError({"role": "Ce champ est obligatoire."})

        return data

    def create(self, validated_data):
        password    = validated_data.pop("password")
        region_name = validated_data.pop("region_name", "").strip()
        centre_name = validated_data.pop("centre_name", "").strip()

        region = None
        if region_name:
            region, _ = Region.objects.get_or_create(name=region_name)

        centre = None
        if centre_name:
            if region:
                centre, _ = Centre.objects.get_or_create(
                    name=centre_name, defaults={"region": region}
                )
            else:
                centre = Centre.objects.filter(name=centre_name).first()
                if not centre:
                    default_region, _ = Region.objects.get_or_create(name="Non défini")
                    centre, _ = Centre.objects.get_or_create(
                        name=centre_name, defaults={"region": default_region}
                    )

        user = User(**validated_data, region=region, centre=centre)
        user.set_password(password)
        user.save()
        return user


# ── Role / Region / Centre ───────────────────────────────────
class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Role
        fields = ["id", "name", "level"]


class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Region
        fields = ["id", "name"]


class CentreSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Centre
        fields = ["id", "name", "region"]














# serializers.py

from rest_framework import serializers
from .models import *

class CritereSerializer(serializers.ModelSerializer):
    class Meta:
        model = Critere
        fields = "__all__"


class ApprenantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Apprenant
        fields = "__all__"


class EvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evaluation
        fields = "__all__"


class EvaluationSessionSerializer(serializers.ModelSerializer):

    class Meta:
        model = EvaluationSession
        fields = "__all__"


class ApprenantResultSerializer(serializers.Serializer):
    apprenant = serializers.CharField()
    total_points = serializers.IntegerField()
    percentage = serializers.FloatField()



























# serializers.py
# serializers.py
from rest_framework import serializers
from .models import Candidat, Formation, ANTENNE_CODES, ANTENNES_CHOICES


# ══════════════════════════════════════════════════════════════════
#  SERIALIZER FORMATION
# ══════════════════════════════════════════════════════════════════

class FormationSerializer(serializers.ModelSerializer):

    antenne_display        = serializers.CharField(source="get_antenne_display",        read_only=True)
    type_formation_display = serializers.CharField(source="get_type_formation_display", read_only=True)
    division               = serializers.CharField(read_only=True)
    division_label         = serializers.CharField(read_only=True)
    identifiant_formation  = serializers.CharField(read_only=True)
    nb_candidats           = serializers.SerializerMethodField()
    created_by_nom         = serializers.SerializerMethodField()

    class Meta:
        model  = Formation
        fields = [
            "id",
            "identifiant_formation",
            "nom_formation",
            "organisme_formation",
            "nom_formateur",
            "date_debut",
            "date_fin",
            "type_formation",
            "type_formation_display",
            "division",
            "division_label",
            "entreprise_formation",
            "antenne",
            "antenne_display",
            "nb_candidats",
            "created_by",
            "created_by_nom",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "identifiant_formation",
            "type_formation_display",
            "division",
            "division_label",
            "antenne_display",
            "nb_candidats",
            "created_by",
            "created_by_nom",
            "created_at",
            "updated_at",
        ]

    def get_nb_candidats(self, obj):
        return getattr(obj, "_nb_candidats", obj.candidats.count())

    def get_created_by_nom(self, obj):
        if obj.created_by:
            return (
                f"{obj.created_by.first_name} {obj.created_by.last_name}".strip()
                or obj.created_by.username
            )
        return None

    def validate(self, data):
        type_f = data.get("type_formation") or getattr(self.instance, "type_formation", None)
        if type_f == "continue" and not (
            data.get("entreprise_formation") or
            getattr(self.instance, "entreprise_formation", None)
        ):
            raise serializers.ValidationError(
                {"entreprise_formation": "Une formation continue (DFC) nécessite une entreprise."}
            )
        return data


# ══════════════════════════════════════════════════════════════════
#  SERIALIZER CANDIDAT — VERSION LÉGÈRE (liste apprenants / formation)
# ══════════════════════════════════════════════════════════════════

class CandidatLightSerializer(serializers.ModelSerializer):
    situation_label      = serializers.CharField(read_only=True)
    domaine_label        = serializers.CharField(read_only=True)
    antenne_label        = serializers.CharField(read_only=True)
    type_contrat_label   = serializers.CharField(read_only=True)
    statut_emploi_label  = serializers.CharField(read_only=True)
    antenne_display      = serializers.SerializerMethodField()

    class Meta:
        model  = Candidat
        fields = [
            "id",
            "identifiant_unique",
            "nom",
            "prenom",
            "sexe",
            "telephone",
            "email",
            "situation",
            "situation_label",
            "domaine",
            "domaine_label",
            "formation_ciblee",
            "antenne",
            "antenne_display",
            "antenne_label",
            "statut_fiche",
            # Insertion
            "insere",
            "entreprise_insertion",
            "poste_occupe",
            "type_contrat",
            "type_contrat_label",
            "statut_emploi_actuel",
            "statut_emploi_label",
            "date_insertion",
            "created_at",
        ]

    def get_antenne_display(self, obj):
        src = obj.formation.antenne if obj.formation and obj.formation.antenne else obj.antenne
        return dict(ANTENNES_CHOICES).get(src, src) if src else None


# ══════════════════════════════════════════════════════════════════
#  SERIALIZER CANDIDAT — VERSION COMPLÈTE
# ══════════════════════════════════════════════════════════════════

class CandidatSerializer(serializers.ModelSerializer):

    # Champs calculés en lecture
    antenne_display      = serializers.SerializerMethodField()
    antenne_label        = serializers.CharField(read_only=True)
    formation_detail     = FormationSerializer(source="formation", read_only=True)
    situation_label      = serializers.CharField(read_only=True)
    domaine_label        = serializers.CharField(read_only=True)
    type_contrat_label   = serializers.CharField(read_only=True)
    statut_emploi_label  = serializers.CharField(read_only=True)
    taux_insertion       = serializers.BooleanField(read_only=True)
    created_by_nom       = serializers.SerializerMethodField()

    # Écriture formation imbriquée (optionnel)
    formation_data = serializers.JSONField(write_only=True, required=False, allow_null=True)

    class Meta:
        model  = Candidat
        fields = [
            # Identité
            "id",
            "identifiant_unique",
            "nom",
            "prenom",
            "sexe",
            "date_naissance",
            "telephone",
            "email",
            "adresse",
            # Situation avant formation
            "situation",
            "situation_label",
            "metier_actuel",
            # Profil académique
            "niveau_etude",
            "domaine",
            "domaine_label",
            "formation_ciblee",
            # Session de formation ONFPP
            "formation",
            "formation_detail",
            "formation_data",
            # Antenne
            "antenne",
            "antenne_display",
            "antenne_label",
            # Suivi pédagogique
            "conseiller",
            "motivation",
            "observation",
            # Gestion fiche
            "statut_fiche",
            # ── BLOC INSERTION ──────────────────────────────────
            "insere",
            "entreprise_insertion",
            "poste_occupe",
            "type_contrat",
            "type_contrat_label",
            "salaire_insertion",
            "secteur_activite",
            "date_insertion",
            "duree_recherche_emploi",
            "formation_complementaire",
            "satisfaction_formation",
            "statut_emploi_actuel",
            "statut_emploi_label",
            "taux_insertion",
            "commentaire_insertion",
            "date_suivi_insertion",
            "suivi_par",
            # ────────────────────────────────────────────────────
            "created_by",
            "created_by_nom",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "identifiant_unique",
            "formation_detail",
            "antenne_display",
            "antenne_label",
            "situation_label",
            "domaine_label",
            "type_contrat_label",
            "statut_emploi_label",
            "taux_insertion",
            "created_by",
            "created_by_nom",
            "created_at",
            "updated_at",
        ]
        extra_kwargs = {
            "antenne":                   {"required": False, "allow_null": True, "allow_blank": True},
            "formation":                 {"required": False, "allow_null": True},
            "insere":                    {"required": False, "allow_null": True},
            "entreprise_insertion":      {"required": False, "allow_null": True, "allow_blank": True},
            "poste_occupe":              {"required": False, "allow_null": True, "allow_blank": True},
            "type_contrat":              {"required": False, "allow_null": True, "allow_blank": True},
            "salaire_insertion":         {"required": False, "allow_null": True},
            "secteur_activite":          {"required": False, "allow_null": True, "allow_blank": True},
            "date_insertion":            {"required": False, "allow_null": True},
            "duree_recherche_emploi":    {"required": False, "allow_null": True},
            "formation_complementaire":  {"required": False, "allow_null": True},
            "satisfaction_formation":    {"required": False, "allow_null": True},
            "statut_emploi_actuel":      {"required": False, "allow_null": True, "allow_blank": True},
            "commentaire_insertion":     {"required": False, "allow_null": True, "allow_blank": True},
            "date_suivi_insertion":      {"required": False, "allow_null": True},
            "suivi_par":                 {"required": False, "allow_null": True, "allow_blank": True},
            "statut_fiche":              {"required": False},
        }

    # ── Champs calculés ───────────────────────────────────────────

    def get_antenne_display(self, obj):
        src = obj.formation.antenne if obj.formation and obj.formation.antenne else obj.antenne
        return dict(ANTENNES_CHOICES).get(src, src) if src else None

    def get_created_by_nom(self, obj):
        if obj.created_by:
            return (
                f"{obj.created_by.first_name} {obj.created_by.last_name}".strip()
                or obj.created_by.username
            )
        return None

    # ── Création avec formation imbriquée ─────────────────────────

    def create(self, validated_data):
        formation_data = validated_data.pop("formation_data", None)

        # Créer ou réutiliser la formation
        if formation_data and isinstance(formation_data, dict):
            f_id = formation_data.get("id")
            if f_id:
                try:
                    formation = Formation.objects.get(pk=f_id)
                except Formation.DoesNotExist:
                    formation = None
            else:
                formation_data.pop("created_by", None)
                formation = Formation.objects.create(
                    created_by=self.context["request"].user,
                    **{k: v for k, v in formation_data.items() if k != "id"},
                )
            validated_data["formation"] = formation

        # Hériter antenne de la formation si absente
        if not validated_data.get("antenne") and validated_data.get("formation"):
            validated_data["antenne"] = validated_data["formation"].antenne

        return Candidat.objects.create(**validated_data)

    def update(self, instance, validated_data):
        validated_data.pop("formation_data", None)
        # Hériter antenne de la formation si absente
        if not validated_data.get("antenne") and instance.formation:
            validated_data["antenne"] = instance.formation.antenne
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

    def validate(self, data):
        optional_fields = [
            "nom", "prenom", "sexe", "date_naissance",
            "telephone", "email", "adresse",
            "situation", "metier_actuel",
            "niveau_etude", "domaine", "formation_ciblee",
            "formation", "antenne", "conseiller",
            "motivation", "observation",
            "insere", "entreprise_insertion", "poste_occupe",
            "type_contrat", "salaire_insertion", "secteur_activite",
            "date_insertion", "duree_recherche_emploi",
            "formation_complementaire", "satisfaction_formation",
            "statut_emploi_actuel", "commentaire_insertion",
            "date_suivi_insertion", "suivi_par",
        ]
        if self.instance:
            for field in optional_fields:
                if field not in data:
                    data[field] = getattr(self.instance, field)
        return data






































# À ajouter dans serializers.py

from rest_framework import serializers
# from .models import EntrepriseFormation, ModulePlanFormation  # décommenter selon votre structure


class ModulePlanFormationSerializer(serializers.ModelSerializer):
    statut_display = serializers.CharField(source="get_statut_display", read_only=True)
    nb_total_module = serializers.IntegerField(read_only=True)

    class Meta:
        model = ModulePlanFormation
        fields = [
            "id",
            "intitule_module",
            "contenu",
            "duree_heures",
            "formateur",
            "lieu",
            "date_debut_prevue",
            "date_fin_prevue",
            "date_realisation",
            "statut",
            "statut_display",
            "nb_hommes_module",
            "nb_femmes_module",
            "nb_total_module",
            "observations",
            "ordre",
        ]
        extra_kwargs = {
            "contenu":           {"required": False, "allow_null": True, "allow_blank": True},
            "duree_heures":      {"required": False, "allow_null": True},
            "formateur":         {"required": False, "allow_null": True, "allow_blank": True},
            "lieu":              {"required": False, "allow_null": True, "allow_blank": True},
            "date_debut_prevue": {"required": False, "allow_null": True},
            "date_fin_prevue":   {"required": False, "allow_null": True},
            "date_realisation":  {"required": False, "allow_null": True},
            "observations":      {"required": False, "allow_null": True, "allow_blank": True},
        }


class EntrepriseFormationSerializer(serializers.ModelSerializer):
    modules             = ModulePlanFormationSerializer(many=True, read_only=True)
    statut_display      = serializers.CharField(source="get_statut_realisation_display", read_only=True)
    antenne_display     = serializers.CharField(source="get_antenne_display", read_only=True)
    nb_total_employes   = serializers.IntegerField(read_only=True)
    created_by_nom      = serializers.SerializerMethodField()
    nb_modules          = serializers.SerializerMethodField()
    nb_modules_realises = serializers.SerializerMethodField()
    nb_formes_total     = serializers.SerializerMethodField()

    class Meta:
        model = EntrepriseFormation
        fields = [
            "id",
            "identifiant_unique",
            "nom_entreprise",
            "secteur_activite",
            "adresse_entreprise",
            "contact_rh",
            "telephone_entreprise",
            "email_entreprise",
            "intitule_formation",
            "objectifs",
            "antenne",
            "antenne_display",
            "nb_hommes",
            "nb_femmes",
            "nb_total_employes",
            "date_soumission",
            "date_debut_prevue",
            "date_fin_prevue",
            "date_realisation",
            "statut_realisation",
            "statut_display",
            "plan_formation_fichier",
            "plan_formation_url",
            "plan_formation_nom",
            "nb_formes_hommes",
            "nb_formes_femmes",
            "nb_formes_total",
            "rapport_final",
            "session_evaluation",
            "modules",
            "nb_modules",
            "nb_modules_realises",
            "created_by",
            "created_by_nom",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "identifiant_unique",
            "date_soumission",
            "nb_total_employes",
            "statut_display",
            "antenne_display",
            "modules",
            "nb_modules",
            "nb_modules_realises",
            "nb_formes_total",
            "created_by",
            "created_by_nom",
            "created_at",
            "updated_at",
        ]
        extra_kwargs = {
            "secteur_activite":        {"required": False, "allow_null": True, "allow_blank": True},
            "adresse_entreprise":      {"required": False, "allow_null": True, "allow_blank": True},
            "contact_rh":              {"required": False, "allow_null": True, "allow_blank": True},
            "telephone_entreprise":    {"required": False, "allow_null": True, "allow_blank": True},
            "email_entreprise":        {"required": False, "allow_null": True},
            "objectifs":               {"required": False, "allow_null": True, "allow_blank": True},
            "date_debut_prevue":       {"required": False, "allow_null": True},
            "date_fin_prevue":         {"required": False, "allow_null": True},
            "date_realisation":        {"required": False, "allow_null": True},
            "plan_formation_fichier":  {"required": False, "allow_null": True},
            "plan_formation_url":      {"required": False, "allow_null": True, "allow_blank": True},
            "plan_formation_nom":      {"required": False, "allow_null": True, "allow_blank": True},
            "nb_formes_hommes":        {"required": False},
            "nb_formes_femmes":        {"required": False},
            "rapport_final":           {"required": False, "allow_null": True, "allow_blank": True},
            "session_evaluation":      {"required": False, "allow_null": True},
        }

    def get_created_by_nom(self, obj):
        if obj.created_by:
            return (
                f"{obj.created_by.first_name} {obj.created_by.last_name}".strip()
                or obj.created_by.username
            )
        return None

    def get_nb_modules(self, obj):
        return obj.modules.count()

    def get_nb_modules_realises(self, obj):
        return obj.modules.filter(statut="realisee").count()

    def get_nb_formes_total(self, obj):
        return obj.nb_formes_hommes + obj.nb_formes_femmes


class EntrepriseFormationLightSerializer(serializers.ModelSerializer):
    """Sérialiseur léger pour la liste principale."""
    statut_display    = serializers.CharField(source="get_statut_realisation_display", read_only=True)
    antenne_display   = serializers.CharField(source="get_antenne_display", read_only=True)
    nb_total_employes = serializers.IntegerField(read_only=True)
    nb_modules        = serializers.SerializerMethodField()
    nb_formes_total   = serializers.SerializerMethodField()

    class Meta:
        model = EntrepriseFormation
        fields = [
            "id",
            "identifiant_unique",
            "nom_entreprise",
            "secteur_activite",
            "intitule_formation",
            "antenne",
            "antenne_display",
            "nb_hommes",
            "nb_femmes",
            "nb_total_employes",
            "date_soumission",
            "date_debut_prevue",
            "date_fin_prevue",
            "date_realisation",
            "statut_realisation",
            "statut_display",
            "plan_formation_nom",
            "plan_formation_url",
            "session_evaluation",
            "nb_modules",
            "nb_formes_total",
            "created_at",
        ]

    def get_nb_modules(self, obj):
        return obj.modules.count()

    def get_nb_formes_total(self, obj):
        return obj.nb_formes_hommes + obj.nb_formes_femmes




















from rest_framework import serializers
# from .models import Formateur   # déjà importé dans votre fichier


class FormateurSerializer(serializers.ModelSerializer):

    # Champs calculés en lecture seule
    antenne_display  = serializers.SerializerMethodField(read_only=True)
    type_display     = serializers.SerializerMethodField(read_only=True)
    domaine_display  = serializers.SerializerMethodField(read_only=True)
    note_finale = serializers.FloatField(read_only=True)
    created_by_nom   = serializers.SerializerMethodField(read_only=True)
    photo_url        = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model  = Formateur
        fields = [
            "id", "identifiant_unique",
            # Identité
            "nom", "prenom", "photo", "photo_url",
            # Contact
            "telephone", "email", "adresse", "antenne", "antenne_display",
            # Type
            "type", "type_display", "nom_cabinet", "site_web",
            # Domaine
            "domaine", "domaine_display", "specialite", "domaine_autre",
            # Compétences
            "experience_annees", "diplome", "certifications", "langues", "bio",
            # Disponibilité
            "disponible",
            # Évaluation
            "note_manuelle", "note_evaluation", "nb_evaluations",
            "detail_evaluation", "note_finale",
            # Méta
            "created_by", "created_by_nom", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "identifiant_unique", "note_evaluation",
            "nb_evaluations", "detail_evaluation",
            "created_by", "created_by_nom", "created_at", "updated_at",
        ]

    def get_antenne_display(self, obj):
        return obj.get_antenne_display() if obj.antenne else None

    def get_type_display(self, obj):
        return obj.get_type_display()

    def get_domaine_display(self, obj):
        return obj.get_domaine_display() if obj.domaine else None

    def get_created_by_nom(self, obj):
        if obj.created_by:
            return f"{obj.created_by.first_name} {obj.created_by.last_name}".strip() or obj.created_by.username
        return None

    def get_photo_url(self, obj):
        if obj.photo:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.photo.url)
            return obj.photo.url
        return None

    def validate(self, attrs):
        # Si type=organisme, nom_cabinet obligatoire
        if attrs.get("type") == "organisme" and not attrs.get("nom_cabinet", "").strip():
            raise serializers.ValidationError({"nom_cabinet": "Obligatoire pour un organisme."})
        # Si domaine=autres, domaine_autre obligatoire
        if attrs.get("domaine") == "autres" and not attrs.get("domaine_autre", "").strip():
            raise serializers.ValidationError({"domaine_autre": "Précisez le domaine."})
        # note_manuelle dans [0,5]
        note = attrs.get("note_manuelle")
        if note is not None and not (0 <= note <= 5):
            raise serializers.ValidationError({"note_manuelle": "La note doit être entre 0 et 5."})
        return attrs
