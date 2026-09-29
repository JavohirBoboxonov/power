from datetime import timedelta
from django.db import models
from django.utils import timezone
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import SubjectStats, DailyActivity, WeeklyReport
from .serializers import SubjectStatsSerializer, DailyActivitySerializer, WeeklyReportSerializer


class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        since = timezone.now().date() - timedelta(days=90)
        stats = SubjectStats.objects.filter(user=user).select_related("subject")
        heatmap = DailyActivity.objects.filter(user=user, date__gte=since)
        latest_report = WeeklyReport.objects.filter(user=user).order_by("-week_start").first()

        return Response({
            "total_minutes": sum(s.total_minutes for s in stats),
            "total_sessions": sum(s.sessions_completed for s in stats),
            "subjects": SubjectStatsSerializer(stats, many=True).data,
            "heatmap": DailyActivitySerializer(heatmap, many=True).data,
            "latest_weekly_report": WeeklyReportSerializer(latest_report).data if latest_report else None,
        })


class AdminStatsView(APIView):
    """GET /statistics/admin/overview/ — butun platforma bo'yicha umumiy ko'rsatkichlar."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from django.contrib.auth import get_user_model
        from django.utils import timezone
        from apps.session.models import LearningSession
        User = get_user_model()

        total_users = User.objects.count()
        premium_users = User.objects.filter(is_premium=True).count()
        today_sessions = LearningSession.objects.filter(started_at__date=timezone.now().date()).count()
        avg_streak = SubjectStats.objects.aggregate(avg=models.Avg("current_streak_days"))["avg"] or 0

        return Response({
            "total_users": total_users,
            "premium_users": premium_users,
            "today_sessions": today_sessions,
            "avg_streak_days": round(avg_streak, 1),
        })
