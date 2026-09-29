from rest_framework import viewsets, permissions, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import RecommendedVideo, SavedVideo, WatchHistory, VideoRating, YoutubeVideo
from .serializers import (
    RecommendedVideoSerializer, SavedVideoSerializer, WatchHistorySerializer, VideoRatingSerializer,
    YoutubeVideoSerializer,
)


class RecommendedVideoViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """GET /youtube/recommendations/?session=<id> — AI tomonidan tavsiya qilingan videolar."""
    serializer_class = RecommendedVideoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = RecommendedVideo.objects.filter(user=self.request.user).select_related("video")
        session_id = self.request.query_params.get("session")
        return qs.filter(session_id=session_id) if session_id else qs

    @action(detail=True, methods=["post"])
    def click(self, request, pk=None):
        """POST /youtube/recommendations/{id}/click/ — tavsiya bosilganini belgilaydi (statistikaga)."""
        rec = self.get_object()
        rec.was_clicked = True
        rec.save()
        return Response(RecommendedVideoSerializer(rec).data)


class SavedVideoViewSet(viewsets.ModelViewSet):
    """Sevimli videolar — GET/POST/DELETE /youtube/saved/"""
    serializer_class = SavedVideoSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "delete", "head"]

    def get_queryset(self):
        return SavedVideo.objects.filter(user=self.request.user).select_related("video")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class WatchHistoryViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
    """Ko'rilgan videolar tarixi — GET/POST /youtube/history/"""
    serializer_class = WatchHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WatchHistory.objects.filter(user=self.request.user).select_related("video")

    def perform_create(self, serializer):
        history = serializer.save(user=self.request.user)
        video = history.video
        video.view_count = video.view_count + 1
        video.save(update_fields=["view_count"])


class VideoRatingViewSet(mixins.CreateModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    """Video baholash — POST /youtube/ratings/ (signal orqali YoutubeVideo.avg_rating yangilanadi)."""
    serializer_class = VideoRatingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return VideoRating.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AdminYoutubeVideoViewSet(viewsets.ReadOnlyModelViewSet):
    """GET /youtube/admin/videos/ — barcha keshlangan videolar (admin video kutubxonasi)."""
    queryset = YoutubeVideo.objects.select_related("subject").all()
    serializer_class = YoutubeVideoSerializer
    permission_classes = [permissions.IsAdminUser]
