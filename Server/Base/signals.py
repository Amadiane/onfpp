# signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import EvaluationSession, Formateur   # adaptez les imports

@receiver(post_save, sender=EvaluationSession)
def recalculate_formateur_note(sender, instance, **kwargs):
    \"\"\"
    Après chaque sauvegarde d'une EvaluationSession,
    recalculer la note moyenne du formateur concerné.
    \"\"\"
    formateur = instance.formateur   # adaptez le champ FK
    if not formateur:
        return

    sessions = EvaluationSession.objects.filter(
        formateur=formateur,
        note_globale__isnull=False
    )
    if sessions.exists():
        notes  = [s.note_globale for s in sessions]
        moyenne = sum(notes) / len(notes)
        formateur.note_evaluation = round(moyenne, 2)
        formateur.nb_evaluations  = len(notes)

        # Détail par critère (si vos sessions ont des sous-notes)
        # detail = {}
        # for critere in Critere.objects.all():
        #     vals = [s.notes.get(critere.nom, 0) for s in sessions]
        #     detail[critere.nom] = round(sum(vals)/len(vals), 1)
        # formateur.detail_evaluation = detail

        formateur.save(update_fields=["note_evaluation","nb_evaluations"])
"""