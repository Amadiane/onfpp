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