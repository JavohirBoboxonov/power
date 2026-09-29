from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import LearningSession


@receiver(post_save, sender=LearningSession)
def update_stats_on_completion(sender, instance, created, **kwargs):
    """Sessiya COMPLETED bo'lganda statistics app'idagi hisoblarni yangilaydi (Celery task orqali)."""
    if instance.status == LearningSession.Status.COMPLETED:
        from apps.statistics.tasks import recompute_subject_stats
        from apps.youtube_recommendations.tasks import generate_video_recommendations
        recompute_subject_stats.delay(str(instance.user_id), str(instance.subject_id))
        generate_video_recommendations.delay(str(instance.user_id), str(instance.id))
