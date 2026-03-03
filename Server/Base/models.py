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