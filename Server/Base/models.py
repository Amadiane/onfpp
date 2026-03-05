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