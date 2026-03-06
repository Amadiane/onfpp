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

from rest_framework import serializers
from .models import Candidat


class CandidatSerializer(serializers.ModelSerializer):

    # Affiche le nom du centre en lecture (sans casser le FK en écriture)
    antenne_nom = serializers.CharField(
        source="antenne.nom",
        read_only=True,
        default=None,
    )

    # Affiche le nom complet du créateur
    created_by_nom = serializers.SerializerMethodField()

    class Meta:
        model  = Candidat
        fields = [
            # Identité
            "id",
            "nom",
            "prenom",
            "sexe",
            "date_naissance",
            "telephone",
            "email",
            "adresse",
            # Formation
            "niveau_etude",
            "metier_souhaite",
            # Antenne
            "antenne",
            "antenne_nom",
            # Gestion fiche
            "statut_fiche",
            "identifiant_unique",
            # Traçabilité
            "created_by",
            "created_by_nom",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "statut_fiche",        # géré par workflow de validation
            "identifiant_unique",  # généré automatiquement après validation
            "created_by",          # défini dans perform_create
            "created_by_nom",
            "created_at",
            "updated_at",
            "antenne_nom",
        ]

    def get_created_by_nom(self, obj):
        if obj.created_by:
            fn = getattr(obj.created_by, "first_name", "") or ""
            ln = getattr(obj.created_by, "last_name",  "") or ""
            full = f"{fn} {ln}".strip()
            return full or obj.created_by.username
        return None

    def validate_email(self, value):
        """Accepte null/vide, vérifie l'unicité si fourni."""
        if not value:
            return None
        qs = Candidat.objects.filter(email=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Un candidat avec cet email existe déjà.")
        return value

    def validate_telephone(self, value):
        if not value:
            return None
        return value

    def validate(self, data):
        # Convertit les chaînes vides en None pour les champs optionnels
        optional_fields = [
            "sexe", "date_naissance", "telephone", "email",
            "adresse", "niveau_etude", "metier_souhaite",
        ]
        for field in optional_fields:
            if field in data and data[field] == "":
                data[field] = None
        return data