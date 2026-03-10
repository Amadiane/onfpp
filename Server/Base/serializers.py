# serializers.py
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Role, Region, Centre




from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Role, Region, Centre


from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Role, Region, Centre, Page, UserPageAccess, DIVISIONS_CHOICES, ANTENNES_CHOICES

NIVEAU_DG       = 100
NIVEAU_DGA      = 90
NIVEAU_CHEF_DIV = 70
NIVEAU_CHEF_SEC = 60
NIVEAU_CHEF_ANT = 50
NIVEAU_CONS     = 30


# ── JWT LOGIN ────────────────────────────────────────────────
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"]     = user.role.name   if user.role   else None
        token["niveau"]   = user.niveau
        token["division"] = user.division    or None
        token["antenne"]  = user.antenne     or None
        token["region"]   = user.region.name if user.region else None
        token["centre"]   = user.centre.name if user.centre else None
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        u = self.user
        data.update({
            "username":   u.username,
            "first_name": u.first_name,
            "last_name":  u.last_name,
            "role":       u.role.name   if u.role   else None,
            "niveau":     u.niveau,
            "division":   u.division    or None,
            "antenne":    u.antenne     or None,
            "region":     u.region.name if u.region else None,
            "centre":     u.centre.name if u.centre else None,
        })
        return data



# serializers.py — VERSION CORRIGÉE (ordre des classes)
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from .models import (
    User, Role, Region, Centre, Page, UserPageAccess,
    EvaluationSession, Critere, Apprenant, Evaluation,
    Formation, Candidat, Formateur, EntrepriseFormation, ModulePlanFormation,
    DIVISIONS_CHOICES, ANTENNES_CHOICES, NIVEAUX_ACCES
)


# ═══════════════════════════════════════════════════════════
#  1. SERIALIZERS DE BASE (doivent être définis EN PREMIER)
# ═══════════════════════════════════════════════════════════

class RoleSerializer(serializers.ModelSerializer):
    niveau_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Role
        fields = ['id', 'name', 'level', 'niveau_display']
    
    def get_niveau_display(self, obj):
        return dict(NIVEAUX_ACCES).get(obj.level, f"Niveau {obj.level}")


class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = ['id', 'name']


class CentreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Centre
        fields = ['id', 'name', 'region']


# ═══════════════════════════════════════════════════════════
#  2. AUTH & JWT (utilisent RoleSerializer défini au-dessus)
# ═══════════════════════════════════════════════════════════

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role.name if user.role else None
        token["niveau"] = user.role.level if user.role else 0
        token["division"] = user.division
        token["antenne"] = user.antenne_onfpp
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data.update({
            "username": self.user.username,
            "role": self.user.role.name if self.user.role else None,
            "niveau": self.user.role.level if self.user.role else 0,
            "region": self.user.region.name if self.user.region else None,
            "centre": self.user.centre.name if self.user.centre else None,
            "division": self.user.division,
            "antenne": self.user.antenne_onfpp,
        })
        
        # Pages autorisées (avec overrides)
        pages_autorisees = []
        for page in Page.objects.filter(is_active=True):
            override = UserPageAccess.objects.filter(user=self.user, page=page).first()
            if override:
                has_access = override.is_allowed
            else:
                has_access = page.user_has_base_access(self.user)
            
            if has_access:
                pages_autorisees.append({
                    'code': page.code,
                    'nom': page.nom,
                })
        
        data['pages'] = pages_autorisees
        return data


class UserCreateSerializer(serializers.ModelSerializer):
    """Création utilisateur avec validation règles métier"""
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    # Champs compatibles avec ton code existant
    role_name = serializers.CharField(
        required=False,
        allow_blank=True,
        write_only=True
    )
    region_name = serializers.CharField(
        required=False,
        allow_blank=True,
        write_only=True
    )
    centre_name = serializers.CharField(
        required=False,
        allow_blank=True,
        write_only=True
    )
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name',
            'role', 'role_name',
            'division', 'antenne_onfpp',
            'region', 'region_name',
            'centre', 'centre_name',
            'is_active', 'is_staff'
        ]
        read_only_fields = ['id']
    
    def validate(self, attrs):
        # Vérif mot de passe
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password": "Les mots de passe ne correspondent pas"
            })
        
        # Gestion role_name → role
        role = attrs.get('role')
        role_name = attrs.pop('role_name', '').strip()
        
        if not role and role_name:
            try:
                attrs['role'] = Role.objects.get(name__iexact=role_name)
            except Role.DoesNotExist:
                attrs['role'], _ = Role.objects.get_or_create(
                    name=role_name,
                    defaults={'level': 30}
                )
        elif not role:
            raise serializers.ValidationError({
                "role": "Le rôle est obligatoire"
            })
        
        # Validation règles métier selon niveau
        niveau = attrs['role'].level
        division = attrs.get('division')
        antenne = attrs.get('antenne_onfpp')
        
        # Chef Div/Sect/Conseiller → division obligatoire
        if niveau in [70, 60, 30]:
            if not division or division == "NONE":
                raise serializers.ValidationError({
                    "division": f"Division obligatoire pour {attrs['role'].name}"
                })
        
        # Chef d'Antenne → antenne obligatoire
        if niveau == 50:
            if not antenne:
                raise serializers.ValidationError({
                    "antenne_onfpp": f"Antenne obligatoire pour {attrs['role'].name}"
                })
        
        # DG/DGA → réinitialiser division/antenne
        if niveau >= 90:
            attrs['division'] = None
            attrs['antenne_onfpp'] = None
        
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        # Gestion region_name / centre_name
        region_name = validated_data.pop('region_name', '').strip()
        centre_name = validated_data.pop('centre_name', '').strip()
        
        region = validated_data.get('region')
        if not region and region_name:
            region, _ = Region.objects.get_or_create(name=region_name)
            validated_data['region'] = region
        
        centre = validated_data.get('centre')
        if not centre and centre_name:
            if region:
                centre, _ = Centre.objects.get_or_create(
                    name=centre_name,
                    defaults={'region': region}
                )
            else:
                centre = Centre.objects.filter(name=centre_name).first()
                if not centre:
                    default_region, _ = Region.objects.get_or_create(name="Non défini")
                    centre, _ = Centre.objects.get_or_create(
                        name=centre_name,
                        defaults={'region': default_region}
                    )
            validated_data['centre'] = centre
        
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserListSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)
    region = RegionSerializer(read_only=True)
    centre = CentreSerializer(read_only=True)
    
    # Champs calculés
    niveau_acces = serializers.IntegerField(read_only=True)
    role_display = serializers.CharField(read_only=True)
    division_display = serializers.SerializerMethodField()
    antenne_display = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name',
            'email', 'is_active', 'date_joined',
            'role', 'niveau_acces', 'role_display',
            'division', 'division_display',
            'antenne_onfpp', 'antenne_display',  # ← PAS 'antenne'
            'region', 'centre',
        ]
    
    def get_division_display(self, obj):
        if not obj.division:
            return None
        return dict(DIVISIONS_CHOICES).get(obj.division, obj.division)
    
    def get_antenne_display(self, obj):
        if not obj.antenne_onfpp:  # ← PAS 'antenne'
            return None
        return dict(ANTENNES_CHOICES).get(obj.antenne_onfpp, obj.antenne_onfpp)


# ═══════════════════════════════════════════════════════════
#  3. PAGES & ACCESS
# ═══════════════════════════════════════════════════════════

class PageSerializer(serializers.ModelSerializer):
    niveau_min_display = serializers.CharField(
        source='get_niveau_min_display',
        read_only=True
    )
    
    class Meta:
        model = Page
        fields = [
            'id', 'key', 'label', 'description',
            'niveau_min', 'niveau_min_display',
            'divisions_autorisees', 'antennes_autorisees',
            'is_active', 'ordre'
        ]


class UserPageAccessSerializer(serializers.ModelSerializer):
    page_nom = serializers.CharField(source='page.nom', read_only=True)
    page_code = serializers.CharField(source='page.code', read_only=True)
    user_nom = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = UserPageAccess
        fields = [
            'id', 'user', 'user_nom',
            'page', 'page_nom', 'page_code',
            'is_allowed', 'note',
            'updated_at'
        ]
        read_only_fields = ['updated_at']


class BulkSetAccessSerializer(serializers.Serializer):
    """Sauvegarde en masse des accès utilisateur"""
    user_id = serializers.IntegerField()
    accesses = serializers.ListField(
        child=serializers.DictField()
    )
    
    def validate_accesses(self, value):
        for access in value:
            if 'page_id' not in access or 'is_allowed' not in access:
                raise serializers.ValidationError(
                    "Chaque accès doit contenir 'page_id' et 'is_allowed'"
                )
        return value


class UserAccessSummarySerializer(serializers.Serializer):
    """Résumé accès calculé pour un user"""
    page_id = serializers.IntegerField()
    page_code = serializers.CharField()
    page_nom = serializers.CharField()
    base_access = serializers.BooleanField()
    override = serializers.BooleanField()
    final_access = serializers.BooleanField()
    note = serializers.CharField(allow_blank=True)


# ═══════════════════════════════════════════════════════════
#  4. ÉVALUATION (TES SERIALIZERS EXISTANTS - INCHANGÉS)
# ═══════════════════════════════════════════════════════════

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
    formateur_nom = serializers.SerializerMethodField()
    
    class Meta:
        model = EvaluationSession
        fields = "__all__"
    
    def get_formateur_nom(self, obj):
        if obj.formateur_ref:
            return f"{obj.formateur_ref.prenom} {obj.formateur_ref.nom}"
        return obj.formateur


class ApprenantResultSerializer(serializers.Serializer):
    apprenant = serializers.CharField()
    total_points = serializers.IntegerField()
    percentage = serializers.FloatField()


# ═══════════════════════════════════════════════════════════
#  5. FORMATIONS (TES SERIALIZERS EXISTANTS - INCHANGÉS)
# ═══════════════════════════════════════════════════════════

class FormationSerializer(serializers.ModelSerializer):
    antenne_display = serializers.CharField(source="get_antenne_display", read_only=True)
    type_formation_display = serializers.CharField(source="get_type_formation_display", read_only=True)
    division = serializers.CharField(read_only=True)
    division_label = serializers.CharField(read_only=True)
    identifiant_formation = serializers.CharField(read_only=True)
    nb_candidats = serializers.SerializerMethodField()
    created_by_nom = serializers.SerializerMethodField()

    class Meta:
        model = Formation
        fields = [
            "id", "identifiant_formation", "nom_formation", "organisme_formation",
            "nom_formateur", "date_debut", "date_fin", "type_formation",
            "type_formation_display", "division", "division_label",
            "entreprise_formation", "antenne", "antenne_display",
            "nb_candidats", "created_by", "created_by_nom",
            "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "identifiant_formation", "type_formation_display",
            "division", "division_label", "antenne_display",
            "nb_candidats", "created_by", "created_by_nom",
            "created_at", "updated_at",
        ]

    def get_nb_candidats(self, obj):
        return getattr(obj, "_nb_candidats", obj.candidats.count())

    def get_created_by_nom(self, obj):
        if obj.created_by:
            return f"{obj.created_by.first_name} {obj.created_by.last_name}".strip() or obj.created_by.username
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


class CandidatLightSerializer(serializers.ModelSerializer):
    situation_label = serializers.CharField(read_only=True)
    domaine_label = serializers.CharField(read_only=True)
    antenne_label = serializers.CharField(read_only=True)
    type_contrat_label = serializers.CharField(read_only=True)
    statut_emploi_label = serializers.CharField(read_only=True)
    antenne_display = serializers.SerializerMethodField()

    class Meta:
        model = Candidat
        fields = [
            "id", "identifiant_unique", "nom", "prenom", "sexe",
            "telephone", "email", "situation", "situation_label",
            "domaine", "domaine_label", "formation_ciblee",
            "antenne", "antenne_display", "antenne_label",
            "statut_fiche", "insere", "entreprise_insertion",
            "poste_occupe", "type_contrat", "type_contrat_label",
            "statut_emploi_actuel", "statut_emploi_label",
            "date_insertion", "created_at",
        ]

    def get_antenne_display(self, obj):
        from .models import ANTENNES_CHOICES
        src = obj.formation.antenne if obj.formation and obj.formation.antenne else obj.antenne
        return dict(ANTENNES_CHOICES).get(src, src) if src else None


class CandidatSerializer(serializers.ModelSerializer):
    antenne_display = serializers.SerializerMethodField()
    antenne_label = serializers.CharField(read_only=True)
    formation_detail = FormationSerializer(source="formation", read_only=True)
    situation_label = serializers.CharField(read_only=True)
    domaine_label = serializers.CharField(read_only=True)
    type_contrat_label = serializers.CharField(read_only=True)
    statut_emploi_label = serializers.CharField(read_only=True)
    taux_insertion = serializers.BooleanField(read_only=True)
    created_by_nom = serializers.SerializerMethodField()
    formation_data = serializers.JSONField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Candidat
        fields = [
            "id", "identifiant_unique", "nom", "prenom", "sexe",
            "date_naissance", "telephone", "email", "adresse",
            "situation", "situation_label", "metier_actuel",
            "niveau_etude", "domaine", "domaine_label", "formation_ciblee",
            "formation", "formation_detail", "formation_data",
            "antenne", "antenne_display", "antenne_label",
            "conseiller", "motivation", "observation", "statut_fiche",
            "insere", "entreprise_insertion", "poste_occupe",
            "type_contrat", "type_contrat_label", "salaire_insertion",
            "secteur_activite", "date_insertion", "duree_recherche_emploi",
            "formation_complementaire", "satisfaction_formation",
            "statut_emploi_actuel", "statut_emploi_label", "taux_insertion",
            "commentaire_insertion", "date_suivi_insertion", "suivi_par",
            "created_by", "created_by_nom", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "identifiant_unique", "formation_detail",
            "antenne_display", "antenne_label", "situation_label",
            "domaine_label", "type_contrat_label", "statut_emploi_label",
            "taux_insertion", "created_by", "created_by_nom",
            "created_at", "updated_at",
        ]

    def get_antenne_display(self, obj):
        from .models import ANTENNES_CHOICES
        src = obj.formation.antenne if obj.formation and obj.formation.antenne else obj.antenne
        return dict(ANTENNES_CHOICES).get(src, src) if src else None

    def get_created_by_nom(self, obj):
        if obj.created_by:
            return f"{obj.created_by.first_name} {obj.created_by.last_name}".strip() or obj.created_by.username
        return None

    def create(self, validated_data):
        formation_data = validated_data.pop("formation_data", None)
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
        if not validated_data.get("antenne") and validated_data.get("formation"):
            validated_data["antenne"] = validated_data["formation"].antenne
        return Candidat.objects.create(**validated_data)

    def update(self, instance, validated_data):
        validated_data.pop("formation_data", None)
        if not validated_data.get("antenne") and instance.formation:
            validated_data["antenne"] = instance.formation.antenne
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class ModulePlanFormationSerializer(serializers.ModelSerializer):
    statut_display = serializers.CharField(source="get_statut_display", read_only=True)
    nb_total_module = serializers.IntegerField(read_only=True)

    class Meta:
        model = ModulePlanFormation
        fields = [
            "id", "intitule_module", "contenu", "duree_heures",
            "formateur", "lieu", "date_debut_prevue", "date_fin_prevue",
            "date_realisation", "statut", "statut_display",
            "nb_hommes_module", "nb_femmes_module", "nb_total_module",
            "observations", "ordre",
        ]


class EntrepriseFormationSerializer(serializers.ModelSerializer):
    modules = ModulePlanFormationSerializer(many=True, read_only=True)
    statut_display = serializers.CharField(source="get_statut_realisation_display", read_only=True)
    antenne_display = serializers.CharField(source="get_antenne_display", read_only=True)
    nb_total_employes = serializers.IntegerField(read_only=True)
    created_by_nom = serializers.SerializerMethodField()
    nb_modules = serializers.SerializerMethodField()
    nb_modules_realises = serializers.SerializerMethodField()
    nb_formes_total = serializers.SerializerMethodField()

    class Meta:
        model = EntrepriseFormation
        fields = [
            "id", "identifiant_unique", "nom_entreprise", "secteur_activite",
            "adresse_entreprise", "contact_rh", "telephone_entreprise",
            "email_entreprise", "intitule_formation", "objectifs",
            "antenne", "antenne_display", "nb_hommes", "nb_femmes",
            "nb_total_employes", "date_soumission", "date_debut_prevue",
            "date_fin_prevue", "date_realisation", "statut_realisation",
            "statut_display", "plan_formation_fichier", "plan_formation_url",
            "plan_formation_nom", "nb_formes_hommes", "nb_formes_femmes",
            "nb_formes_total", "rapport_final", "session_evaluation",
            "modules", "nb_modules", "nb_modules_realises",
            "created_by", "created_by_nom", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "identifiant_unique", "date_soumission",
            "nb_total_employes", "statut_display", "antenne_display",
            "modules", "nb_modules", "nb_modules_realises",
            "nb_formes_total", "created_by", "created_by_nom",
            "created_at", "updated_at",
        ]

    def get_created_by_nom(self, obj):
        if obj.created_by:
            return f"{obj.created_by.first_name} {obj.created_by.last_name}".strip() or obj.created_by.username
        return None

    def get_nb_modules(self, obj):
        return obj.modules.count()

    def get_nb_modules_realises(self, obj):
        return obj.modules.filter(statut="realisee").count()

    def get_nb_formes_total(self, obj):
        return obj.nb_formes_hommes + obj.nb_formes_femmes


class FormateurSerializer(serializers.ModelSerializer):
    antenne_display = serializers.SerializerMethodField(read_only=True)
    type_display = serializers.SerializerMethodField(read_only=True)
    domaine_display = serializers.SerializerMethodField(read_only=True)
    note_finale = serializers.FloatField(read_only=True)
    created_by_nom = serializers.SerializerMethodField(read_only=True)
    photo_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Formateur
        fields = [
            "id", "identifiant_unique", "nom", "prenom", "photo", "photo_url",
            "telephone", "email", "adresse", "antenne", "antenne_display",
            "type", "type_display", "nom_cabinet", "site_web",
            "domaine", "domaine_display", "specialite", "domaine_autre",
            "experience_annees", "diplome", "certifications", "langues",
            "bio", "types_formation", "disponible", "note_manuelle",
            "note_evaluation", "nb_evaluations", "detail_evaluation",
            "note_finale", "created_by", "created_by_nom",
            "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "identifiant_unique", "note_evaluation",
            "nb_evaluations", "detail_evaluation", "created_by",
            "created_by_nom", "created_at", "updated_at",
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
        if attrs.get("type") == "organisme" and not attrs.get("nom_cabinet", "").strip():
            raise serializers.ValidationError({"nom_cabinet": "Obligatoire pour un organisme."})
        if attrs.get("domaine") == "autres" and not attrs.get("domaine_autre", "").strip():
            raise serializers.ValidationError({"domaine_autre": "Précisez le domaine."})
        note = attrs.get("note_manuelle")
        if note is not None and not (0 <= note <= 5):
            raise serializers.ValidationError({"note_manuelle": "La note doit être entre 0 et 5."})
        return attrs
# ── User Create ──────────────────────────────────────────────
# ── USER CREATE ──────────────────────────────────────────────



# ── USER UPDATE (PATCH) ──────────────────────────────────────
class UserUpdateSerializer(serializers.ModelSerializer):
    password    = serializers.CharField(write_only=True, required=False, min_length=6)
    role        = serializers.PrimaryKeyRelatedField(
                    queryset=Role.objects.all(), required=False, allow_null=True)
    region_name = serializers.CharField(required=False, allow_blank=True, write_only=True)
    centre_name = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model  = User
        fields = [
            "username", "email", "password",
            "first_name", "last_name",
            "role", "division", "antenne",
            "region_name", "centre_name",
            "is_active",
        ]

    def update(self, instance, validated_data):
        password    = validated_data.pop("password",    None)
        region_name = validated_data.pop("region_name", "").strip()
        centre_name = validated_data.pop("centre_name", "").strip()

        if region_name:
            region, _ = Region.objects.get_or_create(name=region_name)
            validated_data["region"] = region
        if centre_name:
            region = validated_data.get("region") or instance.region
            if not region:
                region, _ = Region.objects.get_or_create(name="Non défini")
            centre, _ = Centre.objects.get_or_create(
                name=centre_name, defaults={"region": region})
            validated_data["centre"] = centre

        for attr, val in validated_data.items():
            setattr(instance, attr, val)

        if password:
            instance.set_password(password)

        instance.save()
        return instance


from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from .models import (
    User, Role, Region, Centre, Page, UserPageAccess,
    EvaluationSession, Critere, Apprenant, Evaluation,
    Formation, Candidat, Formateur, EntrepriseFormation, ModulePlanFormation,
    DIVISIONS_CHOICES, ANTENNES_CHOICES, NIVEAUX_ACCES
)

# ── USER LIST ────────────────────────────────────────────────



# ── ME (profil connecté) ─────────────────────────────────────
class MeSerializer(serializers.ModelSerializer):
    """Serializer pour le profil utilisateur connecté"""
    role = RoleSerializer(read_only=True)
    region = RegionSerializer(read_only=True)
    centre = CentreSerializer(read_only=True)
    
    niveau_acces = serializers.IntegerField(read_only=True)
    role_display = serializers.CharField(read_only=True)
    division_display = serializers.SerializerMethodField()
    antenne_display = serializers.SerializerMethodField()
    
    # ── Pages accessibles ──────────────────────────────────────────
    pages = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name', 'email',
            'role', 'niveau_acces', 'role_display',
            'division', 'division_display',
            'antenne_onfpp', 'antenne_display',  # ← CHANGE 'antenne' → 'antenne_onfpp'
            'region', 'centre',
            'is_staff', 'is_active',
            'pages'  # Liste des pages accessibles
        ]
    
    def get_division_display(self, obj):
        if not obj.division:
            return None
        return dict(DIVISIONS_CHOICES).get(obj.division, obj.division)
    
    def get_antenne_display(self, obj):
        if not obj.antenne_onfpp:  # ← CHANGE 'antenne' → 'antenne_onfpp'
            return None
        return dict(ANTENNES_CHOICES).get(obj.antenne_onfpp, obj.antenne_onfpp)
    
    def get_pages(self, obj):
        """Retourne les pages accessibles avec overrides"""
        pages_autorisees = []
        
        for page in Page.objects.filter(is_active=True):
            # Vérif override
            override = UserPageAccess.objects.filter(
                user=obj,
                page=page
            ).first()
            
            if override:
                has_access = override.is_allowed
            else:
                has_access = page.user_has_base_access(obj)
            
            if has_access:
                pages_autorisees.append({
                    'key': page.key,
                    'label': page.label,
                })
        
        return pages_autorisees



















































































































































































































































# ── Role / Region / Centre ───────────────────────────────────








# ── USER PAGE ACCESS ─────────────────────────────────────────


#//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////










# serializers.py

# from rest_framework import serializers
# from .models import *






    
#     def get_formateur_nom(self, obj):
#         if obj.formateur_ref:
#             return f"{obj.formateur_ref.prenom} {obj.formateur_ref.nom}"
#         return obj.formateur



























# serializers.py
# serializers.py
from rest_framework import serializers
from .models import Candidat, Formation, ANTENNE_CODES, ANTENNES_CHOICES


# ══════════════════════════════════════════════════════════════════
#  SERIALIZER FORMATION
# ══════════════════════════════════════════════════════════════════



# ══════════════════════════════════════════════════════════════════
#  SERIALIZER CANDIDAT — VERSION LÉGÈRE (liste apprenants / formation)
# ══════════════════════════════════════════════════════════════════


# ══════════════════════════════════════════════════════════════════
#  SERIALIZER CANDIDAT — VERSION COMPLÈTE
# ══════════════════════════════════════════════════════════════════



































# À ajouter dans serializers.py



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




















