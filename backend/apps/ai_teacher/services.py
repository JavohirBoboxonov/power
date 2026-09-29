"""AI Teacher xizmatlari: Speech Recognition, Pronunciation/Accent tahlili, Lesson Generator, AI Chat.

Tashqi provayderlar (prod muhitda ulanadi):
 - STT: Whisper (self-hosted) yoki xizmat ko'rsatuvchi API
 - Pronunciation/Accent: forced-alignment + phoneme scoring modeli
 - Lesson/Chat: Anthropic Claude API
"""
from django.conf import settings


def transcribe_audio(audio_url: str) -> dict:
    """Whisper orqali audio -> matn. Qaytaradi: {"text": str, "confidence": float}."""
    # TODO: real Whisper/STT xizmatiga ulash (self-hosted yoki API)
    return {"text": "", "confidence": 0.0}


def analyze_pronunciation_and_accent(audio_url: str, expected_text: str) -> dict:
    """Talaffuz balli, aksent turi va fonema darajasidagi xatolarni qaytaradi."""
    # TODO: forced-alignment modeliga ulash
    return {
        "pronunciation_score": 0.0,
        "accent_similarity": 0.0,
        "detected_accent": "unknown",
        "phoneme_errors": [],
    }


def run_speech_analysis(transcript):
    """Transcript yaratilgach chaqiriladi (signal orqali) — SpeechAnalysis yozuvini to'ldiradi."""
    from .models import SpeechAnalysis

    stt_result = transcribe_audio(transcript.audio_url)
    scoring = analyze_pronunciation_and_accent(transcript.audio_url, transcript.text)
    return SpeechAnalysis.objects.update_or_create(
        transcript=transcript,
        defaults={
            "recognized_text": stt_result["text"],
            "confidence": stt_result["confidence"],
            **scoring,
        },
    )[0]


OFFLINE_FALLBACK_REPLY = (
    "Hozircha internet aloqasi yo'q (yoki AI xizmati javob bermadi), shuning uchun offline rejimda "
    "javob beryapman: davom eting, savolingizni internet tiklangach yana yuborsangiz to'liq AI javobini olasiz."
)


def call_ai(prompt: str, system: str = "") -> str:
    """AI chaqiruvi (lesson generation va AI chat uchun umumiy). Groq API (bepul tier, Llama) ishlatiladi.
    Internet/servis mavjud bo'lmasa xatoga chiqarmasdan offline fallback javob qaytaradi —
    ilova internet bilan ham, internetsiz ham ishlayveradi."""
    import requests

    if not settings.GROQ_API_KEY:
        return OFFLINE_FALLBACK_REPLY

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    try:
        resp = requests.post(url, headers=headers, json={"model": "llama-3.3-70b-versatile", "messages": messages}, timeout=10)
    except (requests.exceptions.ConnectionError, requests.exceptions.Timeout):
        return OFFLINE_FALLBACK_REPLY

    if resp.status_code == 429:
        return "AI so'rovlar chegarasiga yetdi. Bir necha daqiqadan so'ng qayta urinib ko'ring."
    if resp.status_code == 401:
        return OFFLINE_FALLBACK_REPLY
    try:
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]
    except (requests.exceptions.HTTPError, KeyError, IndexError, ValueError):
        return OFFLINE_FALLBACK_REPLY


def _extract_json(raw: str) -> dict:
    """Gemini javobi ko'pincha ```json ... ``` bilan o'ralgan bo'ladi — shu qobiqni tozalab JSON qilib o'qiydi."""
    import json
    import re

    cleaned = re.sub(r"^```(?:json)?|```$", "", raw.strip(), flags=re.MULTILINE).strip()
    return json.loads(cleaned)


def generate_lesson(user, subject, cefr_level=None):
    """Lesson Generator: foydalanuvchi darajasiga mos dars tuzadi (vocab/grammar/exercise bloklari)."""
    from .models import GeneratedLesson
    import json

    system = (
        "Sen tajribali til/matematika o'qituvchisisan. Foydalanuvchi darajasiga mos, "
        "JSON formatida struktura qaytar: {title, objective, content_blocks: [{type, data}]}."
    )
    prompt = f"Fan: {subject.name}, daraja: {cefr_level.code if cefr_level else 'boshlang\'ich'}. Yangi dars tuzib ber."
    raw = call_ai(prompt, system=system)
    try:
        parsed = _extract_json(raw)
    except (ValueError, TypeError):
        parsed = {"title": f"{subject.name} darsi", "objective": "", "content_blocks": []}

    return GeneratedLesson.objects.create(
        user=user, subject=subject, cefr_level=cefr_level,
        title=parsed.get("title", f"{subject.name} darsi"),
        objective=parsed.get("objective", ""),
        content_blocks=parsed.get("content_blocks", []),
    )


def chat_with_ai(thread, user_message: str) -> "AIChatMessage":
    """AI Chat: xabar tarixini kontekst sifatida yuborib, Claude javobini saqlaydi."""
    from .models import AIChatMessage

    AIChatMessage.objects.create(thread=thread, role=AIChatMessage.Role.USER, content=user_message)
    history = thread.messages.order_by("created_at").values("role", "content")
    prompt = "\n".join(f"{m['role']}: {m['content']}" for m in history)
    reply_text = call_ai(prompt, system="Sen SuperTutor AI repetitorisan. Qisqa, aniq va rag'batlantiruvchi javob ber.")
    return AIChatMessage.objects.create(thread=thread, role=AIChatMessage.Role.ASSISTANT, content=reply_text)
