from django.utils import timezone
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Quiz, FlashcardReview
from .serializers import QuizSerializer, FlashcardReviewSerializer


class QuizViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Quiz.objects.prefetch_related("questions").all()
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated]


class FlashcardReviewViewSet(viewsets.ModelViewSet):
    serializer_class = FlashcardReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "head"]

    def get_queryset(self):
        return FlashcardReview.objects.filter(user=self.request.user).select_related("flashcard")

    @action(detail=False, methods=["get"])
    def due(self, request):
        due = self.get_queryset().filter(next_review_at__lte=timezone.now())
        return Response(FlashcardReviewSerializer(due, many=True).data)

    @action(detail=True, methods=["post"])
    def grade(self, request, pk=None):
        review = self.get_object()
        quality = int(request.data.get("quality", 3))
        review.ease_factor = max(1.3, review.ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
        review.repetitions = review.repetitions + 1 if quality >= 3 else 0
        review.interval_days = 1 if review.repetitions <= 1 else round(review.interval_days * review.ease_factor)
        review.next_review_at = timezone.now() + timezone.timedelta(days=review.interval_days)
        review.save()
        return Response(FlashcardReviewSerializer(review).data)
