from rest_framework import viewsets, permissions
from .models import Subject
from .serializers import SubjectSerializer


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.prefetch_related("levels").all()
    serializer_class = SubjectSerializer
    http_method_names = ["get", "post", "head"]

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]
