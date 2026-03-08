# admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import Formation, Candidat


# ══════════════════════════════════════════════════════════════════
#  ADMIN FORMATION
# ══════════════════════════════════════════════════════════════════

@admin.register(Formation)
class FormationAdmin(admin.ModelAdmin):
    list_display  = ["identifiant_formation", "nom_formation", "division", "antenne",
                     "nom_formateur", "date_debut", "date_fin", "nb_candidats_display"]
    list_filter   = ["type_formation", "antenne"]
    search_fields = ["nom_formation", "organisme_formation", "nom_formateur"]
    ordering      = ["-created_at"]
    readonly_fields = ["identifiant_formation", "created_at", "updated_at"]

    fieldsets = [
        ("Identification", {"fields": ["nom_formation", "organisme_formation", "nom_formateur", "identifiant_formation"]}),
        ("Période",        {"fields": ["date_debut", "date_fin"]}),
        ("Classification", {"fields": ["type_formation", "entreprise_formation", "antenne"]}),
        ("Traçabilité",    {"fields": ["created_by", "created_at", "updated_at"], "classes": ["collapse"]}),
    ]

    def save_model(self, request, obj, form, change):
        if not obj.created_by_id:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

    def nb_candidats_display(self, obj):
        return obj.candidats.count()
    nb_candidats_display.short_description = "Apprenants"


# ══════════════════════════════════════════════════════════════════
#  INLINE CANDIDAT dans Formation
# ══════════════════════════════════════════════════════════════════

class CandidatInline(admin.TabularInline):
    model  = Candidat
    extra  = 0
    fields = ["nom", "prenom", "sexe", "domaine", "statut_fiche", "insere", "statut_emploi_actuel"]
    readonly_fields = ["nom", "prenom", "sexe"]
    show_change_link = True


# ══════════════════════════════════════════════════════════════════
#  ADMIN CANDIDAT
# ══════════════════════════════════════════════════════════════════

@admin.register(Candidat)
class CandidatAdmin(admin.ModelAdmin):
    list_display = [
        "identifiant_unique", "nom", "prenom", "sexe", "domaine",
        "antenne", "statut_fiche", "insere_display",
        "statut_emploi_actuel", "entreprise_insertion",
    ]
    list_filter  = [
        "statut_fiche", "insere", "sexe", "domaine",
        "antenne", "statut_emploi_actuel", "type_contrat",
        "formation_complementaire",
    ]
    search_fields = [
        "nom", "prenom", "telephone", "email",
        "identifiant_unique", "entreprise_insertion", "poste_occupe",
    ]
    ordering       = ["-created_at"]
    readonly_fields = ["identifiant_unique", "created_at", "updated_at", "antenne_label"]
    list_per_page  = 50

    fieldsets = [
        ("Identité", {
            "fields": ["nom", "prenom", "sexe", "date_naissance", "telephone", "email", "adresse"]
        }),
        ("Formation", {
            "fields": ["formation", "domaine", "formation_ciblee", "niveau_etude", "antenne", "antenne_label"]
        }),
        ("Situation avant formation", {
            "fields": ["situation", "metier_actuel"]
        }),
        ("Gestion de la fiche", {
            "fields": ["statut_fiche", "identifiant_unique", "conseiller"]
        }),
        ("── INSERTION PROFESSIONNELLE ──", {
            "fields": [
                "insere",
                "statut_emploi_actuel",
                "entreprise_insertion",
                "poste_occupe",
                "type_contrat",
                "salaire_insertion",
                "secteur_activite",
                "date_insertion",
                "duree_recherche_emploi",
                "formation_complementaire",
                "satisfaction_formation",
                "commentaire_insertion",
                "date_suivi_insertion",
                "suivi_par",
            ]
        }),
        ("Notes", {
            "fields": ["motivation", "observation"],
            "classes": ["collapse"]
        }),
        ("Traçabilité", {
            "fields": ["created_by", "created_at", "updated_at"],
            "classes": ["collapse"]
        }),
    ]

    actions = ["valider_fiches", "rejeter_fiches", "marquer_inseres"]

    @admin.action(description="✅ Valider les fiches sélectionnées")
    def valider_fiches(self, request, queryset):
        count = 0
        for c in queryset.filter(statut_fiche__in=["en_attente", "rejete"]):
            c.statut_fiche = "valide"
            if not c.identifiant_unique:
                c.identifiant_unique = c.generate_identifiant()
            c.save()
            count += 1
        self.message_user(request, f"{count} fiche(s) validée(s).")

    @admin.action(description="❌ Rejeter les fiches sélectionnées")
    def rejeter_fiches(self, request, queryset):
        updated = queryset.exclude(statut_fiche="rejete").update(statut_fiche="rejete")
        self.message_user(request, f"{updated} fiche(s) rejetée(s).")

    @admin.action(description="🏢 Marquer comme insérés en entreprise")
    def marquer_inseres(self, request, queryset):
        updated = queryset.filter(statut_fiche="valide").update(
            insere=True, statut_emploi_actuel="en_poste"
        )
        self.message_user(request, f"{updated} apprenant(s) marqué(s) comme insérés.")

    def insere_display(self, obj):
        if obj.insere is True:
            return format_html('<span style="color:green;font-weight:bold">✓ Inséré</span>')
        elif obj.insere is False:
            return format_html('<span style="color:gray">✗ Non</span>')
        return "—"
    insere_display.short_description = "Inséré"