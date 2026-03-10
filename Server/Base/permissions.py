# permissions.py
from rest_framework import permissions

class IsHighLevelUser(permissions.BasePermission):
    """
    Autorise uniquement les utilisateurs avec un niveau >= X
    Exemple: DG, DG adjoint, CD
    """
    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False
        # Niveau minimal pour créer un utilisateur
        return user.role and user.role.level >= 3




