from rest_framework import serializers
from .models import MathProblem, MathAttempt


class MathProblemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MathProblem
        fields = ["id", "topic", "statement", "difficulty"]


class MathAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = MathAttempt
        fields = ["id", "problem", "session", "user_answer", "is_correct", "time_spent_seconds", "created_at"]
        read_only_fields = ["id", "is_correct", "created_at"]
