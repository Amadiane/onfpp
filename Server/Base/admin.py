# admin.py
from django.contrib import admin
from .models import Candidat, Formation


# ══════════════════════════════════════════════════════════════════
#  ADMIN FORMATION
# ══════════════════════════════════════════════════════════════════

@admin.register(Formation)
class FormationAdmin(admin.ModelAdmin):
    list_display  = ("nom_formation", "type_formation", "antenne", "date_debut", "date_fin", "created_by", "created_at")
    list_filter   = ("type_formation", "antenne")
    search_fields = ("nom_formation", "organisme_formation", "nom_formateur")
    readonly_fields = ("created_at", "updated_at", "created_by", "identifiant_formation", "division", "division_label")
    ordering      = ("-created_at",)

    fieldsets = (
        ("Identification", {
            "fields": ("nom_formation", "organisme_formation", "nom_formateur", "identifiant_formation"),
        }),
        ("Période", {
            "fields": ("date_debut", "date_fin"),
        }),
        ("Classification", {
            "fields": ("type_formation", "entreprise_formation", "division", "division_label"),
        }),
        ("Antenne", {
            "fields": ("antenne",),
        }),
        ("Traçabilité", {
            "fields": ("created_by", "created_at", "updated_at"),
            "classes": ("collapse",),
        }),
    )

    def identifiant_formation(self, obj):
        return obj.identifiant_formation
    identifiant_formation.short_description = "Identifiant"

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


# ══════════════════════════════════════════════════════════════════
#  INLINE CANDIDATS dans Formation
# ══════════════════════════════════════════════════════════════════

class CandidatInline(admin.TabularInline):
    model  = Candidat
    fields = ("nom", "prenom", "sexe", "telephone", "statut_fiche", "identifiant_unique")
    extra  = 0
    readonly_fields = ("identifiant_unique",)
    show_change_link = True


@admin.register(Candidat)
class CandidatAdmin(admin.ModelAdmin):
    list_display   = (
        "nom", "prenom", "sexe", "telephone", "email",
        "antenne", "statut_fiche", "identifiant_unique",
        "formation", "created_at",
    )
    list_filter    = ("statut_fiche", "antenne", "sexe", "situation", "domaine")
    search_fields  = (
        "nom", "prenom", "email", "telephone",
        "identifiant_unique", "formation__nom_formation",
    )
    readonly_fields = ("identifiant_unique", "created_at", "updated_at", "created_by")
    ordering       = ("-created_at",)
    list_select_related = ("formation", "created_by")

    fieldsets = (
        ("Identité personnelle", {
            "fields": (
                ("nom", "prenom"),
                ("sexe", "date_naissance"),
                ("telephone", "email"),
                "adresse",
            ),
        }),
        ("Situation professionnelle", {
            "fields": ("situation", "metier_actuel"),
        }),
        ("Profil académique", {
            "fields": ("niveau_etude", "domaine", "formation_ciblee"),
        }),
        ("Session de formation ONFPP", {
            "fields": ("formation",),
        }),
        ("Antenne & Suivi", {
            "fields": ("antenne", "conseiller"),
        }),
        ("Compléments", {
            "fields": ("motivation", "observation"),
            "classes": ("collapse",),
        }),
        ("Gestion de la fiche", {
            "fields": ("statut_fiche", "identifiant_unique"),
        }),
        ("Traçabilité", {
            "fields": ("created_by", "created_at", "updated_at"),
            "classes": ("collapse",),
        }),
    )

    actions = ["valider_fiches", "rejeter_fiches"]

    def valider_fiches(self, request, queryset):
        count = 0
        for candidat in queryset.filter(statut_fiche="en_attente"):
            candidat.statut_fiche = "valide"
            if not candidat.identifiant_unique:
                candidat.identifiant_unique = candidat.generate_identifiant()
            candidat.save()
            count += 1
        self.message_user(request, f"{count} fiche(s) validée(s).")
    valider_fiches.short_description = "✅ Valider les fiches sélectionnées"

    def rejeter_fiches(self, request, queryset):
        count = queryset.exclude(statut_fiche="rejete").update(statut_fiche="rejete")
        self.message_user(request, f"{count} fiche(s) rejetée(s).")
    rejeter_fiches.short_description = "❌ Rejeter les fiches sélectionnées"

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)