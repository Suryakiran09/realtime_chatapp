from rest_framework import permissions

class IsRoomCreatorOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff or obj.created_by == request.user:
            return True
        return False