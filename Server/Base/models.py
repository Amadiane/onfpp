from django.db import models

# Create your models here.
# models.py
from django.db import models
from django.contrib.auth.models import AbstractUser

class Region(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Centre(models.Model):
    name = models.CharField(max_length=100)
    region = models.ForeignKey(Region, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)
    level = models.IntegerField(help_text="Plus le niveau est élevé, plus l'accès est haut")

    def __str__(self):
        return self.name

from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

class User(AbstractUser):
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True)
    region = models.ForeignKey(Region, on_delete=models.SET_NULL, null=True, blank=True)
    centre = models.ForeignKey(Centre, on_delete=models.SET_NULL, null=True, blank=True)

    # Résoudre les conflits avec AbstractUser
    groups = models.ManyToManyField(
        Group,
        related_name="custom_user_set",  # <-- changer le reverse accessor
        blank=True,
        help_text="Les groupes auxquels appartient l'utilisateur"
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name="custom_user_permissions_set",  # <-- changer le reverse accessor
        blank=True,
        help_text="Permissions spécifiques de l'utilisateur"
    )

    def __str__(self):
        return self.username



# models.py

from django.db import models

NOTE_MAPPING = {
    1: 25,
    2: 50,
    3: 75,
}

class EvaluationSession(models.Model):
    theme = models.CharField(max_length=255)
    periode_debut = models.DateField()
    periode_fin = models.DateField()
    lieu = models.CharField(max_length=255)
    organisme = models.CharField(max_length=255)
    formateur = models.CharField(max_length=255)
    structure_beneficiaire = models.CharField(max_length=255, blank=True, null=True)
    commentaire_final = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)


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
from django.db import models
from django.conf import settings


# ══════════════════════════════════════════════════════════════════
#  CONSTANTES PARTAGÉES
# ══════════════════════════════════════════════════════════════════

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
        mapping = {"apprentissage": "DAP", "continue": "DFC"}
        return mapping.get(self.type_formation)

    @property
    def division_label(self):
        mapping = {
            "apprentissage": "DAP — Direction Apprentissage Professionnel",
            "continue":      "DFC — Direction Formation Continue",
        }
        return mapping.get(self.type_formation, "—")

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
#  MODÈLE CANDIDAT
#  - La FK vers Centre est supprimée.
#  - L'antenne est uniquement gérée via `antenne` (CharField avec choices),
#    aligné avec Formation.antenne.
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

    # ── 1. Informations personnelles ───────────────────────────────
    nom            = models.CharField(max_length=100, verbose_name="Nom")
    prenom         = models.CharField(max_length=100, verbose_name="Prénom")
    sexe           = models.CharField(max_length=10, choices=SEXE_CHOICES, blank=True, null=True, verbose_name="Sexe")
    date_naissance = models.DateField(blank=True, null=True, verbose_name="Date de naissance")
    telephone      = models.CharField(max_length=20, blank=True, null=True, verbose_name="Téléphone")
    email          = models.EmailField(blank=True, null=True, verbose_name="Email")
    adresse        = models.TextField(blank=True, null=True, verbose_name="Adresse")

    # ── 2. Situation professionnelle ───────────────────────────────
    situation     = models.CharField(
        max_length=20, choices=SITUATION_CHOICES,
        blank=True, null=True,
        verbose_name="Situation actuelle",
    )
    metier_actuel = models.CharField(
        max_length=150, blank=True, null=True,
        verbose_name="Métier actuel",
    )

    # ── 3. Profil académique & formation ciblée ────────────────────
    niveau_etude     = models.CharField(
        max_length=20, choices=NIVEAU_ETUDE_CHOICES,
        blank=True, null=True,
        verbose_name="Niveau d'étude",
    )
    domaine          = models.CharField(
        max_length=30, choices=DOMAINE_CHOICES,
        blank=True, null=True,
        verbose_name="Domaine",
    )
    formation_ciblee = models.CharField(
        max_length=200, blank=True, null=True,
        verbose_name="Formation ciblée",
    )

    # ── 4. Session de formation ONFPP (FK) ─────────────────────────
    formation = models.ForeignKey(
        Formation,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="candidats",
        verbose_name="Session de formation",
    )

    # ── 5. Antenne de rattachement (CharField — remplace la FK Centre) ──
    antenne = models.CharField(
        max_length=50,
        choices=ANTENNES_CHOICES,
        blank=True, null=True,
        verbose_name="Antenne ONFPP",
        help_text="Code antenne du candidat (conakry, kankan, labe…)",
    )

    # ── 6. Suivi ───────────────────────────────────────────────────
    conseiller = models.CharField(
        max_length=150, blank=True, null=True,
        verbose_name="Conseiller responsable",
    )

    # ── 7. Compléments ─────────────────────────────────────────────
    motivation  = models.TextField(blank=True, null=True, verbose_name="Motivation")
    observation = models.TextField(blank=True, null=True, verbose_name="Observation")

    # ── 8. Gestion de la fiche ─────────────────────────────────────
    statut_fiche = models.CharField(
        max_length=20,
        choices=STATUT_FICHE,
        default="en_attente",
        verbose_name="Statut de la fiche",
    )
    identifiant_unique = models.CharField(
        max_length=50,
        blank=True, null=True,
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
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True,     verbose_name="Modifié le")

    class Meta:
        ordering            = ["-created_at"]
        verbose_name        = "Candidat"
        verbose_name_plural = "Candidats"

    def __str__(self):
        uid = f" [{self.identifiant_unique}]" if self.identifiant_unique else ""
        return f"{self.nom} {self.prenom}{uid}"

    # ── Propriétés calculées ───────────────────────────────────────

    @property
    def antenne_label(self):
        """Libellé lisible de l'antenne."""
        # Priorité : antenne de la formation liée, sinon antenne du candidat
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

    # ── Génération de l'identifiant unique ────────────────────────

    def generate_identifiant(self):
        """
        Génère un identifiant unique de type ONFPP-ANNEE-CODE-XXXX.
        Exemple : ONFPP-2026-CKY-0001
        """
        from django.utils import timezone

        annee = (self.created_at or timezone.now()).year

        # Code antenne : priorité formation > candidat > défaut GN
        code = "GN"
        if self.formation and self.formation.antenne:
            code = ANTENNE_CODES.get(self.formation.antenne, "GN")
        elif self.antenne:
            code = ANTENNE_CODES.get(self.antenne, "GN")

        # Numéro séquentiel parmi les candidats validés de l'année
        count = (
            Candidat.objects
            .filter(created_at__year=annee)
            .exclude(identifiant_unique__isnull=True)
            .exclude(identifiant_unique__exact="")
            .count()
        ) + 1

        return f"ONFPP-{annee}-{code}-{count:04d}"