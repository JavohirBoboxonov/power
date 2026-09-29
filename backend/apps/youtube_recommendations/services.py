"""AI + YouTube tavsiya mantiqi.

Oqim (TZ'dagi "AI tavsiya algoritmi"ga mos):
1. Dars/mashq/test yakunlanadi (LearningSession yoki MathAttempt orqali).
2. AI natijani baholaydi — qaysi mavzu/daraja qiyin kelganini aniqlaydi
   (statistics.SubjectStats past ball, yoki math_practice zaif MathTopic).
3. YouTube Data API v3 orqali shu mavzu + til + daraja bo'yicha video izlanadi.
4. Natijalar YoutubeVideo jadvaliga keshlanadi, eng mos 5 tasi tanlanadi.
5. RecommendedVideo yozuvlari yaratiladi va foydalanuvchiga qaytariladi.
"""
from django.conf import settings

YOUTUBE_SEARCH_ENDPOINT = "https://www.googleapis.com/youtube/v3/search"
MAX_RECOMMENDATIONS = 5


def determine_weak_topic(user, subject):
    """Foydalanuvchining shu fandagi eng past ballini beruvchi mavzuni topadi."""
    from apps.math_practice.models import MathAttempt
    from django.db.models import Avg, Count

    weakest = (
        MathAttempt.objects.filter(user=user, problem__topic__isnull=False)
        .values("problem__topic__name")
        .annotate(accuracy=Avg("is_correct"), attempts=Count("id"))
        .filter(attempts__gte=3)
        .order_by("accuracy")
        .first()
    )
    return weakest["problem__topic__name"] if weakest else None


def search_youtube(query: str, language: str = "en", max_results: int = MAX_RECOMMENDATIONS):
    """YouTube Data API v3 'search' chaqiruvi. API kaliti .env dagi YOUTUBE_API_KEY dan olinadi."""
    import requests

    params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": max_results,
        "relevanceLanguage": language,
        "videoDuration": "medium",
        "key": settings.YOUTUBE_API_KEY,
        "safeSearch": "strict",
    }
    try:
        resp = requests.get(YOUTUBE_SEARCH_ENDPOINT, params=params, timeout=8)
        resp.raise_for_status()
    except (requests.exceptions.ConnectionError, requests.exceptions.Timeout, requests.exceptions.HTTPError):
        return []  # internet/YouTube yo'q — offline: bo'sh natija, xato chiqarilmaydi
    return resp.json().get("items", [])


def upsert_videos_from_search(items, subject=None, difficulty="beginner"):
    from .models import YoutubeVideo

    videos = []
    for item in items:
        vid = item["id"]["videoId"]
        snippet = item["snippet"]
        video, _ = YoutubeVideo.objects.update_or_create(
            youtube_id=vid,
            defaults={
                "title": snippet["title"],
                "channel_title": snippet.get("channelTitle", ""),
                "thumbnail_url": snippet["thumbnails"]["high"]["url"],
                "language": snippet.get("defaultLanguage", "en"),
                "subject": subject,
                "difficulty": difficulty,
            },
        )
        videos.append(video)
    return videos


def recommend_videos_for_session(user, session):
    """Dars/sessiya tugagach chaqiriladi (signals.py orqali). RecommendedVideo yozuvlarini yaratadi."""
    from .models import RecommendedVideo

    subject = session.subject
    weak_topic = determine_weak_topic(user, subject) if subject.kind == "math" else None
    query = f"{weak_topic or subject.name} tutorial {session.user.ui_language}"

    try:
        items = search_youtube(query, language=session.user.ui_language)
        videos = upsert_videos_from_search(items, subject=subject)
    except Exception:
        videos = []

    RecommendedVideo.objects.filter(user=user, session=session).delete()
    reason = RecommendedVideo.Reason.WEAK_TOPIC if weak_topic else RecommendedVideo.Reason.POST_LESSON
    return [
        RecommendedVideo.objects.create(user=user, video=v, session=session, reason=reason, rank=i + 1)
        for i, v in enumerate(videos[:MAX_RECOMMENDATIONS])
    ]
