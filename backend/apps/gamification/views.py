from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import LeaderboardEntry
from .serializers import LeaderboardEntrySerializer


class LeaderboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        scope = request.query_params.get("scope", "global_anon")
        entries = LeaderboardEntry.objects.filter(scope=scope).order_by("rank")[:50]
        return Response(LeaderboardEntrySerializer(entries, many=True).data)
