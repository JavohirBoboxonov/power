from rest_framework import serializers
from .models import Quiz, QuizQuestion, FlashcardReview


class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = ["id", "text", "choices"]   # correct_index yashirin


class QuizSerializer(serializers.ModelSerializer):
    questions = QuizQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ["id", "subject", "cefr_level", "title", "questions"]


class FlashcardReviewSerializer(serializers.ModelSerializer):
    front_text = serializers.CharField(source="flashcard.front_text", read_only=True)
    back_text = serializers.CharField(source="flashcard.back_text", read_only=True)

    class Meta:
        model = FlashcardReview
        fields = ["id", "flashcard", "front_text", "back_text", "ease_factor", "interval_days", "next_review_at"]
        read_only_fields = ["ease_factor", "interval_days", "next_review_at"]
