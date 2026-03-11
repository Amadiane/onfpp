from django.db import models

# Create your models here.
# models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError

# models.py — ONFPP · version complète avec gestion des accès par rôle
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models


from django.db import models
from django.conf import settings


from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.core.exceptions import ValidationError
from django.conf import settings



# ══════════════════════════════════════════════════════════════════
#  CONSTANTES PARTAGÉES
# ══════════════════════════════════════════════════════════════════

# ─────────────────────────────────────────────
#  CONSTANTES MÉTIER
# ─────────────────────────────────────────────


ANTENNES_CHOICES = [
    ("conakry",    "Conakry"),
    ("forecariah", "Forecariah"),
    ("boke",       "Boké"),
    ("kindia",     "Kindia"),
    ("labe",       "Labé"),
    ("mamou",      "Mamou"),
    ("faranah",    "Faranah"),
    ("kankan",     "Kankan"),
    ("siguiri",    "Siguiri"),
    ("nzerekore",  "N'Zérékoré"),
]


ANTENNE_CODES = {
    "conakry":    "CKY",
    "forecariah": "FRC",
    "boke":       "BOK",
    "kindia":     "KND",
    "labe":       "LBE",
    "mamou":      "MMU",
    "faranah":    "FRN",
    "kankan":     "KNK",
    "siguiri":    "SGR",
    "nzerekore":  "NZR",
}

DIVISIONS_CHOICES = [
    ("DAP",  "Division Apprentissage et Projets Collectifs"),
    ("DSE",  "Division Suivi Évaluation"),
    ("DFC",  "Division Formation Continue"),
    ("DPL",  "Division Planification"),
]
# Niveaux d'accès
NIVEAUX_ACCES = [
    (100, "Directeur Général"),
    (90, "Directeur Général Adjoint"),
    (70, "Chef de Division"),
    (60, "Chef de Section"),
    (50, "Chef d'Antenne"),
    (30, "Conseiller"),
]


# ── Note mapping (TU AS DÉJÀ) ─────────────────────────────────────
NOTE_MAPPING = {
    1: 25,
    2: 50,
    3: 75,
}





class Region(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Centre(models.Model):
    name = models.CharField(max_length=100)
    region = models.ForeignKey(Region, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

# ─────────────────────────────────────────────
#  ROLE
# ─────────────────────────────────────────────
class Role(models.Model):
    name  = models.CharField(max_length=80, unique=True)
    level = models.IntegerField(
        default=1,
        help_text="100=DG · 90=DGA · 70=Chef Div · 60=Chef Section · 50=Chef Antenne · 30=Conseiller"
    )

    class Meta:
        ordering = ["-level"]

    def __str__(self):
        return f"{self.name} (niveau {self.level})"

# ─────────────────────────────────────────────
#  PAGE (permissions d'affichage)
# ─────────────────────────────────────────────
class Page(models.Model):
    """
    Chaque entrée représente une page/module de la plateforme.
    L'admin peut activer/désactiver l'accès à une page pour un utilisateur
    via UserPageAccess.
    """
    key         = models.CharField(max_length=80, unique=True,
                                   help_text="Identifiant technique : ex 'formations_dap'")
    label       = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    # Niveau minimum par défaut pour accéder à cette page
    niveau_min  = models.IntegerField(default=30)
    # Divisions autorisées (vide = toutes)
    divisions   = models.CharField(
        max_length=50, blank=True,
        help_text="Codes séparés par virgule ex: DAP,DFC — vide = toutes"
    )
    is_active   = models.BooleanField(default=True,
                                      help_text="Page disponible globalement sur la plateforme")

    class Meta:
        ordering = ["label"]

    def __str__(self):
        return f"[{self.key}] {self.label}"




from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

# ─────────────────────────────────────────────
#  USER
# ─────────────────────────────────────────────
class User(AbstractUser):
    role    = models.ForeignKey(Role,   on_delete=models.SET_NULL, null=True, blank=True)
    region  = models.ForeignKey(Region, on_delete=models.SET_NULL, null=True, blank=True)
    centre  = models.ForeignKey(Centre, on_delete=models.SET_NULL, null=True, blank=True)

    # ── Champs spécifiques ONFPP ─────────────────────
    division = models.CharField(
        max_length=10, choices=DIVISIONS_CHOICES, blank=True, null=True,
        help_text="Obligatoire pour Chef de Division, Chef de Section, Conseiller"
    )
    antenne  = models.CharField(
        max_length=20, choices=ANTENNES_CHOICES, blank=True, null=True,
        help_text="Obligatoire pour Chef d'Antenne"
    )

    # Résoudre les conflits AbstractUser
    groups = models.ManyToManyField(
        Group,
        related_name="custom_user_set",
        blank=True,
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name="custom_user_permissions_set",
        blank=True,
    )

    class Meta:
        ordering = ["-date_joined"]

    def __str__(self):
        return f"{self.username} ({self.role})"

    @property
    def niveau(self):
        return self.role.level if self.role else 0

    @property
    def is_dg(self):
        return self.niveau >= NIVEAU_DG

    @property
    def is_dga_or_above(self):
        return self.niveau >= NIVEAU_DGA

    @property
    def is_chef_division(self):
        return self.niveau == NIVEAU_CHEF_DIV

    @property
    def is_chef_antenne(self):
        return self.niveau == NIVEAU_CHEF_ANT

    @property
    def is_conseiller(self):
        return self.niveau == NIVEAU_CONSEILLER


# ─────────────────────────────────────────────
#  ACCÈS INDIVIDUELS PAR PAGE
# ─────────────────────────────────────────────
class UserPageAccess(models.Model):
    """
    Surcharge individuelle des permissions de page.
    L'admin peut activer ou désactiver une page pour UN utilisateur précis,
    indépendamment de son rôle.
    """
    user       = models.ForeignKey(User, on_delete=models.CASCADE,
                                   related_name="page_accesses")
    page       = models.ForeignKey(Page, on_delete=models.CASCADE,
                                   related_name="user_accesses")
    is_allowed = models.BooleanField(default=True)
    note       = models.CharField(max_length=255, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="page_access_updates"
    )

    class Meta:
        unique_together = ("user", "page")
        ordering        = ["user__username", "page__key"]

    def __str__(self):
        status = "✓" if self.is_allowed else "✗"
        return f"{status} {self.user.username} → {self.page.key}"



class EvaluationSession(models.Model):
    theme = models.CharField(max_length=255)
    periode_debut = models.DateField()
    periode_fin = models.DateField()
    lieu = models.CharField(max_length=255)
    organisme = models.CharField(max_length=255)
    formateur = models.CharField(max_length=255)  # garde le nom texte
    # NOUVEAU : lien FK optionnel vers Formateur
    formateur_ref = models.ForeignKey(
        "Formateur",
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="sessions_evaluation",
        verbose_name="Formateur (référence)",
    )
    structure_beneficiaire = models.CharField(max_length=255, blank=True, null=True)
    commentaire_final = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    # ... méthodes inchangées


    def total_points_apprenant(self, apprenant):
        evaluations = self.evaluation_set.filter(apprenant=apprenant)
        return sum([NOTE_MAPPING.get(e.note, 0) for e in evaluations])

    def percentage_apprenant(self, apprenant):
        total = self.total_points_apprenant(apprenant)
        nb_criteres = Critere.objects.count()
        max_total = nb_criteres * 75

        if max_total == 0:
            return 0

        return round((total / max_total) * 100, 2)


class Critere(models.Model):
    nom = models.CharField(max_length=255)

    def __str__(self):
        return self.nom


class Apprenant(models.Model):
    nom = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)


class Evaluation(models.Model):

    NOTE_CHOICES = (
        (1, "Pas satisfait"),
        (2, "Satisfait"),
        (3, "Très satisfait"),
    )

    session = models.ForeignKey(EvaluationSession, on_delete=models.CASCADE)
    apprenant = models.ForeignKey(Apprenant, on_delete=models.CASCADE)
    critere = models.ForeignKey(Critere, on_delete=models.CASCADE)
    note = models.IntegerField(choices=NOTE_CHOICES)
    commentaire = models.TextField(blank=True, null=True)






































# models.py
# models.py
# models.py


#//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

# ══════════════════════════════════════════════════════════════════
#  MODÈLE FORMATION
# ══════════════════════════════════════════════════════════════════

class Formation(models.Model):

    TYPE_FORMATION = [
        ("continue",      "Formation Continue"),
        ("apprentissage", "Apprentissage"),
    ]

    # ── Identification ─────────────────────────────────────────────
    nom_formation       = models.CharField(max_length=200, verbose_name="Titre de la formation")
    organisme_formation = models.CharField(max_length=200, blank=True, null=True, verbose_name="Organisme")
    nom_formateur       = models.CharField(max_length=200, blank=True, null=True, verbose_name="Formateur")

    # ── Période ────────────────────────────────────────────────────
    date_debut = models.DateField(blank=True, null=True, verbose_name="Date de début")
    date_fin   = models.DateField(blank=True, null=True, verbose_name="Date de fin")

    # ── Classification ─────────────────────────────────────────────
    type_formation = models.CharField(
        max_length=20, choices=TYPE_FORMATION,
        blank=True, null=True,
        verbose_name="Type de formation",
    )
    entreprise_formation = models.CharField(
        max_length=200, blank=True, null=True,
        verbose_name="Entreprise de formation",
        help_text="Obligatoire pour une formation continue (DFC)",
    )

    # ── Antenne ONFPP ──────────────────────────────────────────────
    antenne = models.CharField(
        max_length=50, choices=ANTENNES_CHOICES,
        verbose_name="Antenne ONFPP",
    )

    # ── Traçabilité ────────────────────────────────────────────────
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="formations_creees",
        verbose_name="Créé par",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True,     verbose_name="Modifié le")

    class Meta:
        ordering            = ["-created_at"]
        verbose_name        = "Formation"
        verbose_name_plural = "Formations"

    def __str__(self):
        return f"{self.nom_formation} — {self.get_antenne_display()}"

    @property
    def division(self):
        return {"apprentissage": "DAP", "continue": "DFC"}.get(self.type_formation)

    @property
    def division_label(self):
        return {
            "apprentissage": "DAP — Direction Apprentissage Professionnel",
            "continue":      "DFC — Direction Formation Continue",
        }.get(self.type_formation, "—")

    @property
    def identifiant_formation(self):
        div  = self.division or "XX"
        code = ANTENNE_CODES.get(self.antenne, "GN")
        year = (
            self.date_debut.year if self.date_debut
            else self.created_at.year if self.created_at
            else 2026
        )
        count = (
            Formation.objects
            .filter(
                created_at__year=year,
                antenne=self.antenne,
                type_formation=self.type_formation,
            )
            .filter(pk__lte=self.pk)
            .count()
        ) if self.pk else 1
        return f"ONFPP-{div}-{code}-{year}-{count:03d}"


# ══════════════════════════════════════════════════════════════════
#  MODÈLE CANDIDAT / APPRENANT
#
#  Nouveaux champs ajoutés pour le suivi insertion :
#  ─ type_contrat          : CDI, CDD, Stage, Freelance, Sans contrat
#  ─ poste_occupe          : intitulé du poste obtenu
#  ─ salaire_insertion     : salaire mensuel brut (GNF)
#  ─ secteur_activite      : secteur de l'entreprise d'accueil
#  ─ duree_recherche_emploi: nb de mois entre fin formation et emploi
#  ─ formation_complementaire : a-t-il suivi d'autres formations ?
#  ─ satisfaction_formation: note 1-5 sur la formation reçue
#  ─ statut_emploi_actuel  : en_poste | chomage | independant | etudes | autre
#  ─ commentaire_insertion : notes libres du conseiller insertion
#  ─ date_suivi_insertion  : date du dernier contact de suivi
#  ─ suivi_par             : conseiller qui a fait le suivi insertion
# ══════════════════════════════════════════════════════════════════

class Candidat(models.Model):

    STATUT_FICHE = [
        ("en_attente", "En attente"),
        ("valide",     "Validé"),
        ("rejete",     "Rejeté"),
    ]

    SEXE_CHOICES = [
        ("H", "Homme"),
        ("F", "Femme"),
    ]

    SITUATION_CHOICES = [
        ("chomeur",      "Chômeur(se)"),
        ("actif",        "Actif(ve)"),
        ("diplome",      "Diplômé(e) sans emploi"),
        ("etudiant",     "Étudiant(e)"),
        ("reconversion", "En reconversion professionnelle"),
        ("independant",  "Travailleur indépendant"),
        ("autre",        "Autre"),
    ]

    NIVEAU_ETUDE_CHOICES = [
        ("CEP",          "CEP"),
        ("BEPC",         "BEPC"),
        ("BAC",          "BAC"),
        ("BTS",          "BTS"),
        ("Licence",      "Licence"),
        ("Master",       "Master"),
        ("Doctorat",     "Doctorat"),
        ("sans_diplome", "Sans diplôme"),
        ("autre",        "Autre"),
    ]

    DOMAINE_CHOICES = [
        ("informatique",     "Informatique & Numérique"),
        ("electrotechnique", "Électrotechnique"),
        ("btp",              "Bâtiment & Travaux Publics"),
        ("mecanique",        "Mécanique & Auto"),
        ("agriculture",      "Agriculture & Élevage"),
        ("commerce",         "Commerce & Gestion"),
        ("sante",            "Santé & Social"),
        ("couture",          "Couture & Textile"),
        ("hotellerie",       "Hôtellerie & Restauration"),
        ("artisanat",        "Artisanat"),
        ("energie",          "Énergie solaire"),
        ("transport",        "Transport & Logistique"),
        ("peche",            "Pêche & Aquaculture"),
        ("autre",            "Autre"),
    ]

    # ── NOUVEAUX : Type contrat & statut emploi ────────────────────
    TYPE_CONTRAT_CHOICES = [
        ("cdi",       "CDI — Contrat à durée indéterminée"),
        ("cdd",       "CDD — Contrat à durée déterminée"),
        ("stage",     "Stage / Apprentissage"),
        ("freelance", "Freelance / Auto-entrepreneur"),
        ("informel",  "Emploi informel"),
        ("sans",      "Sans contrat formalisé"),
    ]

    STATUT_EMPLOI_CHOICES = [
        ("en_poste",    "En poste"),
        ("chomage",     "Au chômage"),
        ("independant", "Indépendant / Auto-entrepreneur"),
        ("etudes",      "Poursuite d'études"),
        ("autre",       "Autre"),
    ]

    SATISFACTION_CHOICES = [
        (1, "1 — Très insatisfait"),
        (2, "2 — Insatisfait"),
        (3, "3 — Neutre"),
        (4, "4 — Satisfait"),
        (5, "5 — Très satisfait"),
    ]

    # ── 1. Informations personnelles ───────────────────────────────
    nom            = models.CharField(max_length=100, verbose_name="Nom")
    prenom         = models.CharField(max_length=100, verbose_name="Prénom")
    sexe           = models.CharField(max_length=10,  choices=SEXE_CHOICES,         blank=True, null=True)
    date_naissance = models.DateField(blank=True, null=True)
    telephone      = models.CharField(max_length=20,  blank=True, null=True)
    email          = models.EmailField(blank=True, null=True)
    adresse        = models.TextField(blank=True, null=True)

    # ── 2. Situation professionnelle avant formation ───────────────
    situation     = models.CharField(max_length=20, choices=SITUATION_CHOICES, blank=True, null=True,
                                     verbose_name="Situation avant formation")
    metier_actuel = models.CharField(max_length=150, blank=True, null=True, verbose_name="Métier avant formation")

    # ── 3. Profil académique & formation ciblée ────────────────────
    niveau_etude     = models.CharField(max_length=20, choices=NIVEAU_ETUDE_CHOICES, blank=True, null=True)
    domaine          = models.CharField(max_length=30, choices=DOMAINE_CHOICES,      blank=True, null=True)
    formation_ciblee = models.CharField(max_length=200, blank=True, null=True, verbose_name="Formation ciblée")

    # ── 4. Session de formation ONFPP (FK) ─────────────────────────
    formation = models.ForeignKey(
        Formation,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="candidats",
        verbose_name="Session de formation",
    )

    # ── 5. Antenne de rattachement ─────────────────────────────────
    antenne = models.CharField(
        max_length=50, choices=ANTENNES_CHOICES,
        blank=True, null=True,
        verbose_name="Antenne ONFPP",
    )

    # ── 6. Suivi ───────────────────────────────────────────────────
    conseiller = models.CharField(max_length=150, blank=True, null=True, verbose_name="Conseiller responsable")

    # ── 7. Compléments ─────────────────────────────────────────────
    motivation  = models.TextField(blank=True, null=True)
    observation = models.TextField(blank=True, null=True)

    # ══════════════════════════════════════════════════════════════
    #  BLOC INSERTION PROFESSIONNELLE (enrichi)
    # ══════════════════════════════════════════════════════════════

    # Statut principal d'insertion
    insere = models.BooleanField(
        null=True, blank=True,
        verbose_name="Inséré en entreprise",
        help_text="True = apprenant inséré dans une entreprise après la formation",
    )

    # Détails emploi obtenu
    entreprise_insertion = models.CharField(max_length=200, blank=True, null=True,
                                             verbose_name="Entreprise d'insertion")
    poste_occupe         = models.CharField(max_length=200, blank=True, null=True,
                                             verbose_name="Poste / Intitulé du métier occupé")
    type_contrat         = models.CharField(max_length=20,  blank=True, null=True,
                                             choices=TYPE_CONTRAT_CHOICES,
                                             verbose_name="Type de contrat")
    salaire_insertion    = models.PositiveIntegerField(blank=True, null=True,
                                                       verbose_name="Salaire mensuel brut (GNF)")
    secteur_activite     = models.CharField(max_length=200, blank=True, null=True,
                                             verbose_name="Secteur d'activité de l'entreprise")
    date_insertion       = models.DateField(blank=True, null=True,
                                             verbose_name="Date de prise de poste")

    # Délai & parcours post-formation
    duree_recherche_emploi = models.PositiveSmallIntegerField(
        blank=True, null=True,
        verbose_name="Durée de recherche d'emploi (mois)",
        help_text="Nombre de mois entre la fin de la formation et l'obtention du poste",
    )
    formation_complementaire = models.BooleanField(
        null=True, blank=True,
        verbose_name="Formation complémentaire suivie",
        help_text="L'apprenant a-t-il suivi une autre formation après l'ONFPP ?",
    )

    # Qualité & satisfaction
    satisfaction_formation = models.PositiveSmallIntegerField(
        blank=True, null=True,
        choices=SATISFACTION_CHOICES,
        verbose_name="Satisfaction formation (1-5)",
    )

    # Statut emploi actuel (suivi continu)
    statut_emploi_actuel = models.CharField(
        max_length=20, blank=True, null=True,
        choices=STATUT_EMPLOI_CHOICES,
        verbose_name="Statut emploi actuel",
    )

    # Notes libres du conseiller insertion
    commentaire_insertion = models.TextField(blank=True, null=True,
                                              verbose_name="Commentaire insertion (conseiller)")

    # Dates de suivi
    date_suivi_insertion = models.DateField(blank=True, null=True,
                                             verbose_name="Date du dernier suivi insertion")
    suivi_par            = models.CharField(max_length=150, blank=True, null=True,
                                             verbose_name="Suivi insertion par")

    # ══════════════════════════════════════════════════════════════

    # ── 8. Gestion de la fiche ─────────────────────────────────────
    statut_fiche = models.CharField(
        max_length=20, choices=STATUT_FICHE,
        default="en_attente",
        verbose_name="Statut de la fiche",
    )
    identifiant_unique = models.CharField(
        max_length=50, blank=True, null=True,
        unique=True,
        verbose_name="Identifiant unique",
    )

    # ── 9. Traçabilité ─────────────────────────────────────────────
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="candidats_crees",
        verbose_name="Créé par",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering            = ["-created_at"]
        verbose_name        = "Candidat / Apprenant"
        verbose_name_plural = "Candidats / Apprenants"

    def __str__(self):
        uid = f" [{self.identifiant_unique}]" if self.identifiant_unique else ""
        return f"{self.nom} {self.prenom}{uid}"

    # ── Propriétés calculées ───────────────────────────────────────

    @property
    def antenne_label(self):
        if self.formation and self.formation.antenne:
            return dict(ANTENNES_CHOICES).get(self.formation.antenne, self.formation.antenne)
        if self.antenne:
            return dict(ANTENNES_CHOICES).get(self.antenne, self.antenne)
        return None

    @property
    def situation_label(self):
        return dict(self.SITUATION_CHOICES).get(self.situation, self.situation)

    @property
    def domaine_label(self):
        return dict(self.DOMAINE_CHOICES).get(self.domaine, self.domaine)

    @property
    def type_contrat_label(self):
        return dict(self.TYPE_CONTRAT_CHOICES).get(self.type_contrat, self.type_contrat)

    @property
    def statut_emploi_label(self):
        return dict(self.STATUT_EMPLOI_CHOICES).get(self.statut_emploi_actuel, self.statut_emploi_actuel)

    @property
    def taux_insertion(self):
        """Booléen calculé : True si inséré ET en poste actuel."""
        return bool(self.insere and self.statut_emploi_actuel == "en_poste")

    # ── Génération de l'identifiant unique ────────────────────────

    def generate_identifiant(self):
        from django.utils import timezone
        annee = (self.created_at or timezone.now()).year
        code = "GN"
        if self.formation and self.formation.antenne:
            code = ANTENNE_CODES.get(self.formation.antenne, "GN")
        elif self.antenne:
            code = ANTENNE_CODES.get(self.antenne, "GN")
        count = (
            Candidat.objects
            .filter(created_at__year=annee)
            .exclude(identifiant_unique__isnull=True)
            .exclude(identifiant_unique__exact="")
            .count()
        ) + 1
        return f"ONFPP-{annee}-{code}-{count:04d}"
























# À ajouter dans models.py

from django.db import models
from django.conf import settings

# ══════════════════════════════════════════════════════════════════
#  CONSTANTES
# ══════════════════════════════════════════════════════════════════

STATUT_REALISATION_CHOICES = [
    ("planifiee",    "Planifiée"),
    ("en_cours",     "En cours de traitement"),
    ("realisee",     "Réalisée"),
    ("annulee",      "Annulée"),
    ("reportee",     "Reportée"),
]

ANTENNES_CHOICES = [
    ("conakry",    "Conakry"),
    ("forecariah", "Forecariah"),
    ("boke",       "Boké"),
    ("kindia",     "Kindia"),
    ("labe",       "Labé"),
    ("mamou",      "Mamou"),
    ("faranah",    "Faranah"),
    ("kankan",     "Kankan"),
    ("siguiri",    "Siguiri"),
    ("nzerekore",  "N'Zérékoré"),
]

ANTENNE_CODES = {
    "conakry": "CKY", "forecariah": "FRC", "boke": "BOK",
    "kindia": "KND", "labe": "LBE", "mamou": "MMU",
    "faranah": "FRN", "kankan": "KNK", "siguiri": "SGR", "nzerekore": "NZR",
}


# ══════════════════════════════════════════════════════════════════
#  PLAN DE FORMATION DFC — Entreprise
# ══════════════════════════════════════════════════════════════════

class EntrepriseFormation(models.Model):
    """
    Représente un plan de formation soumis par une entreprise dans le cadre
    de la Division Formation Continue (DFC) de l'ONFPP.
    """

    # ── Identification ─────────────────────────────────────────────
    identifiant_unique = models.CharField(
        max_length=60, blank=True, null=True, unique=True,
        verbose_name="Identifiant unique",
    )
    nom_entreprise = models.CharField(max_length=255, verbose_name="Nom de l'entreprise")
    secteur_activite = models.CharField(max_length=200, blank=True, null=True, verbose_name="Secteur d'activité")
    adresse_entreprise = models.TextField(blank=True, null=True, verbose_name="Adresse de l'entreprise")
    contact_rh = models.CharField(max_length=150, blank=True, null=True, verbose_name="Contact RH / Responsable formation")
    telephone_entreprise = models.CharField(max_length=30, blank=True, null=True)
    email_entreprise = models.EmailField(blank=True, null=True)

    # ── Intitulé & description de la formation ─────────────────────
    intitule_formation = models.CharField(max_length=255, verbose_name="Intitulé de la formation")
    objectifs = models.TextField(blank=True, null=True, verbose_name="Objectifs de la formation")
    antenne = models.CharField(max_length=50, choices=ANTENNES_CHOICES, verbose_name="Antenne ONFPP")

    # ── Effectifs ──────────────────────────────────────────────────
    nb_hommes = models.PositiveIntegerField(default=0, verbose_name="Nombre d'hommes")
    nb_femmes = models.PositiveIntegerField(default=0, verbose_name="Nombre de femmes")

    @property
    def nb_total_employes(self):
        return self.nb_hommes + self.nb_femmes

    # ── Dates ──────────────────────────────────────────────────────
    date_soumission = models.DateField(auto_now_add=True, verbose_name="Date de soumission")
    date_debut_prevue = models.DateField(blank=True, null=True, verbose_name="Date de début prévue")
    date_fin_prevue = models.DateField(blank=True, null=True, verbose_name="Date de fin prévue")
    date_realisation = models.DateField(blank=True, null=True, verbose_name="Date de réalisation effective")

    # ── Statut ─────────────────────────────────────────────────────
    statut_realisation = models.CharField(
        max_length=20,
        choices=STATUT_REALISATION_CHOICES,
        default="planifiee",
        verbose_name="Statut de réalisation",
    )

    # ── Plan de formation (fichier joint) ──────────────────────────
    plan_formation_fichier = models.FileField(
        upload_to="plans_formation/",
        blank=True, null=True,
        verbose_name="Plan de formation (fichier)",
        help_text="PDF, Word, Excel acceptés",
    )
    plan_formation_url = models.URLField(
        blank=True, null=True,
        verbose_name="Lien vers le plan de formation",
    )
    plan_formation_nom = models.CharField(
        max_length=255, blank=True, null=True,
        verbose_name="Nom du fichier plan de formation",
    )

    # ── Résultats / rapport ────────────────────────────────────────
    nb_formes_hommes = models.PositiveIntegerField(
        default=0, verbose_name="Nombre d'hommes formés (réalisé)",
    )
    nb_formes_femmes = models.PositiveIntegerField(
        default=0, verbose_name="Nombre de femmes formées (réalisé)",
    )
    rapport_final = models.TextField(blank=True, null=True, verbose_name="Rapport / Observations finales")

    # ── Lien vers session d'évaluation ────────────────────────────
    session_evaluation = models.ForeignKey(
        "EvaluationSession",
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="entreprise_formations",
        verbose_name="Session d'évaluation liée",
    )

    # ── Traçabilité ────────────────────────────────────────────────
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="entreprise_formations_creees",
        verbose_name="Créé par",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Plan de formation entreprise (DFC)"
        verbose_name_plural = "Plans de formation entreprises (DFC)"

    def __str__(self):
        return f"{self.nom_entreprise} — {self.intitule_formation} [{self.identifiant_unique or '—'}]"

    def generate_identifiant(self):
        from django.utils import timezone
        annee = (self.created_at or timezone.now()).year
        code = ANTENNE_CODES.get(self.antenne, "GN")
        count = (
            EntrepriseFormation.objects
            .filter(created_at__year=annee)
            .exclude(identifiant_unique__isnull=True)
            .exclude(identifiant_unique__exact="")
            .count()
        ) + 1
        return f"DFC-ENT-{code}-{annee}-{count:04d}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if not self.identifiant_unique:
            self.identifiant_unique = self.generate_identifiant()
            EntrepriseFormation.objects.filter(pk=self.pk).update(
                identifiant_unique=self.identifiant_unique
            )


# ══════════════════════════════════════════════════════════════════
#  MODULE DU PLAN DE FORMATION
# ══════════════════════════════════════════════════════════════════

class ModulePlanFormation(models.Model):
    """
    Contenu détaillé du plan de formation : chaque module/thème
    prévu dans le plan soumis par l'entreprise.
    """

    entreprise_formation = models.ForeignKey(
        EntrepriseFormation,
        on_delete=models.CASCADE,
        related_name="modules",
        verbose_name="Plan de formation",
    )

    # ── Contenu ────────────────────────────────────────────────────
    intitule_module = models.CharField(max_length=255, verbose_name="Intitulé du module")
    contenu = models.TextField(blank=True, null=True, verbose_name="Contenu / Programme")
    duree_heures = models.PositiveSmallIntegerField(
        blank=True, null=True, verbose_name="Durée (heures)",
    )
    formateur = models.CharField(max_length=200, blank=True, null=True, verbose_name="Formateur prévu")
    lieu = models.CharField(max_length=200, blank=True, null=True, verbose_name="Lieu de formation")

    # ── Planification ──────────────────────────────────────────────
    date_debut_prevue = models.DateField(blank=True, null=True, verbose_name="Début prévu")
    date_fin_prevue = models.DateField(blank=True, null=True, verbose_name="Fin prévue")

    # ── Réalisation ────────────────────────────────────────────────
    date_realisation = models.DateField(blank=True, null=True, verbose_name="Date de réalisation")
    statut = models.CharField(
        max_length=20,
        choices=STATUT_REALISATION_CHOICES,
        default="planifiee",
        verbose_name="Statut",
    )

    # ── Effectifs module ───────────────────────────────────────────
    nb_hommes_module = models.PositiveSmallIntegerField(default=0, verbose_name="Hommes (module)")
    nb_femmes_module = models.PositiveSmallIntegerField(default=0, verbose_name="Femmes (module)")

    @property
    def nb_total_module(self):
        return self.nb_hommes_module + self.nb_femmes_module

    observations = models.TextField(blank=True, null=True)
    ordre = models.PositiveSmallIntegerField(default=0, verbose_name="Ordre d'affichage")

    class Meta:
        ordering = ["ordre", "date_debut_prevue"]
        verbose_name = "Module du plan de formation"
        verbose_name_plural = "Modules du plan de formation"

    def __str__(self):
        return f"{self.entreprise_formation.nom_entreprise} — Module: {self.intitule_module}"






























from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Formateur(models.Model):

    # ── Type ──────────────────────────────────────────────────────────
    TYPE_CHOICES = [
        ("individuel", "Formateur individuel"),
        ("organisme",  "Organisme / Cabinet de formation"),
    ]

    # ── Domaines — en miroir du frontend ──────────────────────────────
    DOMAINE_CHOICES = [
        ("btp",         "BTP — Bâtiment & Travaux Publics"),
        ("agriculture", "Agriculture & Élevage"),
        ("numerique",   "Numérique & Technologies"),
        ("sante",       "Santé & Social"),
        ("commerce",    "Commerce & Gestion"),
        ("artisanat",   "Artisanat & Textile"),
        ("tourisme",    "Tourisme & Hôtellerie"),
        ("autres",      "Autre domaine"),
    ]

    # ── Antennes ──────────────────────────────────────────────────────
    ANTENNE_CHOICES = [
        ("conakry",    "Conakry"),
        ("forecariah", "Forecariah"),
        ("boke",       "Boké"),
        ("kindia",     "Kindia"),
        ("labe",       "Labé"),
        ("mamou",      "Mamou"),
        ("faranah",    "Faranah"),
        ("kankan",     "Kankan"),
        ("siguiri",    "Siguiri"),
        ("nzerekore",  "N'Zérékoré"),
    ]

    # ── Identité ──────────────────────────────────────────────────────
    identifiant_unique  = models.CharField(max_length=30, unique=True, blank=True)
    nom                 = models.CharField(max_length=150)
    prenom              = models.CharField(max_length=150)
    photo               = models.ImageField(upload_to="formateurs/photos/", blank=True, null=True)

    # ── Contact ───────────────────────────────────────────────────────
    telephone           = models.CharField(max_length=30)
    email               = models.EmailField(blank=True, null=True)
    adresse             = models.CharField(max_length=250, blank=True, null=True)
    antenne             = models.CharField(max_length=20, choices=ANTENNE_CHOICES, blank=True, null=True)

    # ── Type individuel / organisme ───────────────────────────────────
    type                = models.CharField(max_length=15, choices=TYPE_CHOICES, default="individuel")
    nom_cabinet         = models.CharField(max_length=200, blank=True, null=True,
                            help_text="Nom du cabinet si organisme")
    site_web            = models.URLField(blank=True, null=True)

    # ── Domaine & Spécialité ──────────────────────────────────────────
    domaine             = models.CharField(max_length=20, choices=DOMAINE_CHOICES, blank=True, null=True)
    specialite          = models.CharField(max_length=150, blank=True, null=True,
                            help_text="Métier choisi dans la liste du domaine")
    domaine_autre       = models.CharField(max_length=150, blank=True, null=True,
                            help_text="Saisie libre si domaine = 'autres'")

    # ── Compétences ───────────────────────────────────────────────────
    experience_annees   = models.PositiveSmallIntegerField(blank=True, null=True)
    diplome             = models.CharField(max_length=200, blank=True, null=True)
    certifications      = models.CharField(max_length=300, blank=True, null=True)
    langues             = models.CharField(max_length=150, blank=True, null=True)
    bio                 = models.TextField(blank=True, null=True)

    # ── Types de formation enseignée ──────────────────────────────────
    #  Stocké en JSON : ["continue"], ["apprentissage"] ou les deux
    types_formation    = models.JSONField(
                            default=list,
                            help_text="Liste: 'continue' (DFC) et/ou 'apprentissage' (DAP)")

    # ── Disponibilité ─────────────────────────────────────────────────
    disponible          = models.BooleanField(default=True)

    # ── Évaluation ────────────────────────────────────────────────────
    # note_evaluation   → calculée automatiquement depuis SuiviEvaluation (via signal ou méthode)
    # note_manuelle     → saisie par l'administration
    note_manuelle       = models.FloatField(
                            blank=True, null=True,
                            validators=[MinValueValidator(0), MaxValueValidator(5)],
                            help_text="Note 0-5 saisie manuellement")
    note_evaluation     = models.FloatField(
                            blank=True, null=True,
                            validators=[MinValueValidator(0), MaxValueValidator(5)],
                            help_text="Moyenne calculée depuis les évaluations de sessions")
    nb_evaluations      = models.PositiveIntegerField(default=0,
                            help_text="Nombre d'évaluations de sessions ayant alimenté note_evaluation")
    detail_evaluation   = models.JSONField(blank=True, null=True,
                            help_text="Détail note par critère {critere: moyenne}")

    # ── Méta ──────────────────────────────────────────────────────────
    created_by          = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                            null=True, blank=True, related_name="formateurs_crees")
    created_at          = models.DateTimeField(auto_now_add=True)
    updated_at          = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["nom", "prenom"]
        verbose_name = "Formateur"
        verbose_name_plural = "Formateurs"

    def __str__(self):
        return f"{self.prenom} {self.nom}"

    # ── Génération identifiant ─────────────────────────────────────────
    def generate_identifiant(self):
        from datetime import date
        ANTENNE_CODES = {
            "conakry":"CKY","forecariah":"FRC","boke":"BOK","kindia":"KND",
            "labe":"LBE","mamou":"MMU","faranah":"FRN","kankan":"KNK",
            "siguiri":"SGR","nzerekore":"NZR",
        }
        div  = "ORG" if self.type == "organisme" else "IND"
        ant  = ANTENNE_CODES.get(self.antenne, "GN")
        year = date.today().year
        last = Formateur.objects.filter(
            identifiant_unique__startswith=f"FORM-{div}-{ant}-{year}"
        ).count()
        return f"FORM-{div}-{ant}-{year}-{str(last + 1).zfill(4)}"

    def save(self, *args, **kwargs):
        if not self.identifiant_unique:
            self.identifiant_unique = self.generate_identifiant()
        super().save(*args, **kwargs)

    # ── Note finale (pour le serializer) ──────────────────────────────
    @property
    def note_finale(self):
        """Retourne note_evaluation si disponible, sinon note_manuelle."""
        if self.note_evaluation is not None:
            return round(self.note_evaluation, 1)
        if self.note_manuelle is not None:
            return round(self.note_manuelle, 1)
        return None
