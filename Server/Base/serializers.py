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
# serializers.py
from rest_framework import serializers
from .models import Candidat, Formation, ANTENNE_CODES, ANTENNES_CHOICES


# ══════════════════════════════════════════════════════════════════
#  SERIALIZER FORMATION
# ══════════════════════════════════════════════════════════════════

class FormationSerializer(serializers.ModelSerializer):
    """
    Sérialise une session de Formation ONFPP.
    """

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

    def get_created_by_nom(self, obj):
        if obj.created_by:
            fn   = getattr(obj.created_by, "first_name", "") or ""
            ln   = getattr(obj.created_by, "last_name",  "") or ""
            full = f"{fn} {ln}".strip()
            return full or obj.created_by.username
        return None

    def get_nb_candidats(self, obj):
        return obj.candidats.count()

    def validate(self, data):
        type_f     = data.get("type_formation",      getattr(self.instance, "type_formation",      None))
        entreprise = data.get("entreprise_formation", getattr(self.instance, "entreprise_formation", None))
        date_debut = data.get("date_debut",           getattr(self.instance, "date_debut",           None))
        date_fin   = data.get("date_fin",             getattr(self.instance, "date_fin",             None))

        if type_f == "continue" and not entreprise:
            raise serializers.ValidationError({
                "entreprise_formation": "Ce champ est obligatoire pour une formation continue (DFC)."
            })

        if date_debut and date_fin and date_fin < date_debut:
            raise serializers.ValidationError({
                "date_fin": "La date de fin doit être postérieure à la date de début."
            })

        if type_f == "apprentissage":
            data["entreprise_formation"] = None

        return data


# ══════════════════════════════════════════════════════════════════
#  SERIALIZER CANDIDAT — VERSION LÉGÈRE (liste apprenants)
# ══════════════════════════════════════════════════════════════════

class CandidatLightSerializer(serializers.ModelSerializer):
    """
    Version allégée pour GET /formations/{id}/candidats/
    """
    situation_label = serializers.CharField(read_only=True)
    domaine_label   = serializers.CharField(read_only=True)
    antenne_label   = serializers.CharField(read_only=True)
    antenne_display = serializers.SerializerMethodField()

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
            "metier_actuel",
            "niveau_etude",
            "domaine",
            "domaine_label",
            "formation_ciblee",
            "antenne",
            "antenne_display",
            "antenne_label",
            "conseiller",
            "statut_fiche",
            "created_at",
        ]

    def get_antenne_display(self, obj):
        return dict(ANTENNES_CHOICES).get(obj.antenne, obj.antenne) if obj.antenne else None


# ══════════════════════════════════════════════════════════════════
#  SERIALIZER CANDIDAT — VERSION COMPLÈTE
# ══════════════════════════════════════════════════════════════════

class CandidatSerializer(serializers.ModelSerializer):
    """
    Sérialise un Candidat / Apprenant ONFPP.

    Notes importantes :
      - `antenne` est maintenant un simple CharField (plus de FK Centre).
      - `formation_data` permet de créer/lier une Formation en une seule requête.
    """

    # Lecture enrichie
    antenne_display  = serializers.SerializerMethodField()
    antenne_label    = serializers.CharField(read_only=True)
    formation_detail = FormationSerializer(source="formation", read_only=True)
    situation_label  = serializers.CharField(read_only=True)
    domaine_label    = serializers.CharField(read_only=True)
    created_by_nom   = serializers.SerializerMethodField()

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
            # Situation professionnelle
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
            # Antenne (CharField simple)
            "antenne",
            "antenne_display",
            "antenne_label",
            # Suivi
            "conseiller",
            # Compléments
            "motivation",
            "observation",
            # Gestion fiche
            "statut_fiche",
            # Traçabilité
            "created_by",
            "created_by_nom",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "identifiant_unique",
            "statut_fiche",
            "formation_detail",
            "antenne_display",
            "antenne_label",
            "situation_label",
            "domaine_label",
            "created_by",
            "created_by_nom",
            "created_at",
            "updated_at",
        ]
        extra_kwargs = {
            "antenne":  {"required": False, "allow_null": True, "allow_blank": True},
            "formation": {"required": False, "allow_null": True},
        }

    # ── Champs calculés ────────────────────────────────────────────

    def get_antenne_display(self, obj):
        return dict(ANTENNES_CHOICES).get(obj.antenne, obj.antenne) if obj.antenne else None

    def get_created_by_nom(self, obj):
        if obj.created_by:
            fn   = getattr(obj.created_by, "first_name", "") or ""
            ln   = getattr(obj.created_by, "last_name",  "") or ""
            full = f"{fn} {ln}".strip()
            return full or obj.created_by.username
        return None

    # ── Validations ────────────────────────────────────────────────

    def validate_email(self, value):
        if not value:
            return None
        qs = Candidat.objects.filter(email=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Un candidat avec cet email existe déjà.")
        return value

    def validate(self, data):
        # Convertit chaînes vides → None pour tous les champs optionnels
        optional_fields = [
            "sexe", "date_naissance", "telephone", "email", "adresse",
            "situation", "metier_actuel", "niveau_etude", "domaine",
            "formation_ciblee", "antenne", "conseiller",
            "motivation", "observation",
        ]
        for field in optional_fields:
            if field in data and data[field] == "":
                data[field] = None

        # Validation des données formation imbriquées
        fd = data.get("formation_data")
        if fd and isinstance(fd, dict):
            if fd.get("type_formation") == "continue" and not fd.get("entreprise_formation"):
                raise serializers.ValidationError({
                    "formation_data": "entreprise_formation est obligatoire pour une formation continue."
                })
            d1 = fd.get("date_debut")
            d2 = fd.get("date_fin")
            if d1 and d2 and str(d2) < str(d1):
                raise serializers.ValidationError({
                    "formation_data": "La date de fin doit être postérieure à la date de début."
                })

        return data

    # ── Helpers ────────────────────────────────────────────────────

    def _build_formation(self, fd, created_by=None):
        """
        Crée une nouvelle instance Formation depuis un dict formation_data.
        Retourne l'instance sauvegardée, ou None si nom_formation manquant.
        """
        if not fd or not fd.get("nom_formation"):
            return None

        if fd.get("type_formation") == "apprentissage":
            fd["entreprise_formation"] = None

        formation = Formation(
            nom_formation        = fd.get("nom_formation", "").strip(),
            organisme_formation  = fd.get("organisme_formation")  or None,
            nom_formateur        = fd.get("nom_formateur")         or None,
            date_debut           = fd.get("date_debut")            or None,
            date_fin             = fd.get("date_fin")              or None,
            type_formation       = fd.get("type_formation")        or None,
            entreprise_formation = fd.get("entreprise_formation")  or None,
            antenne              = fd.get("antenne", "conakry"),
            created_by           = created_by,
        )
        formation.save()
        return formation

    # ── Create / Update ────────────────────────────────────────────

    def create(self, validated_data):
        fd         = validated_data.pop("formation_data", None)
        created_by = validated_data.get("created_by")

        if fd:
            nouvelle_formation = self._build_formation(fd, created_by)
            if nouvelle_formation:
                validated_data["formation"] = nouvelle_formation
                # Si l'antenne n'est pas renseignée sur le candidat,
                # on hérite de celle de la formation
                if not validated_data.get("antenne"):
                    validated_data["antenne"] = nouvelle_formation.antenne

        return super().create(validated_data)

    def update(self, instance, validated_data):
        fd = validated_data.pop("formation_data", None)

        if fd:
            nouvelle_formation = self._build_formation(fd)
            if nouvelle_formation:
                validated_data["formation"] = nouvelle_formation
                if not validated_data.get("antenne"):
                    validated_data["antenne"] = nouvelle_formation.antenne

        return super().update(instance, validated_data)