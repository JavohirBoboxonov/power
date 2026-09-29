from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile, SubscriptionPlan

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "phone", "ui_language", "is_premium", "is_staff"]
        read_only_fields = ["id", "is_premium", "is_staff"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["username", "email", "phone", "password", "ui_language"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = [
            "user", "avatar_preference", "daily_goal_minutes", "timezone",
            "onboarding_goal", "onboarding_role", "onboarding_completed",
        ]


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = ["id", "name", "price_usd", "voice_cloning_enabled", "max_sessions_per_day"]
