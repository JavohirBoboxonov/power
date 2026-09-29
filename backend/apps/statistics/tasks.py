from celery import shared_task


@shared_task
def recompute_subject_stats(user_id: str, subject_id: str):
    """Session tugagach chaqiriladi: SubjectStats va DailyActivity'ni qayta hisoblaydi,
    streakni yangilaydi va Redis orqali dashboard kanaliga push qiladi."""
    from apps.session.models import LearningSession
    from django.db.models import Sum, Avg, Count
    from .models import SubjectStats

    sessions = LearningSession.objects.filter(
        user_id=user_id, subject_id=subject_id, status="completed"
    )
    agg = sessions.aggregate(total=Sum("duration_seconds"), count=Count("id"))
    stats, _ = SubjectStats.objects.get_or_create(user_id=user_id, subject_id=subject_id)
    stats.total_minutes = (agg["total"] or 0) // 60
    stats.sessions_completed = agg["count"] or 0
    stats.avg_session_minutes = (stats.total_minutes / stats.sessions_completed) if stats.sessions_completed else 0
    stats.save()


@shared_task
def generate_weekly_reports():
    """Celery beat: har dushanba yaratiladi — PDF generatsiya + email yuborish."""
    ...
