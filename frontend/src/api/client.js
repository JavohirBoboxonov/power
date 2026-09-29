const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

function authHeaders() {
  const token = localStorage.getItem("st_access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function refreshAccessToken() {
  const refresh = localStorage.getItem("st_refresh_token");
  if (!refresh) return false;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    
    if (!res.ok) {
      // Refresh token o'tmay qolsa, saqlangan tokenlarni o'chirib yuboramiz
      localStorage.removeItem("st_access_token");
      localStorage.removeItem("st_refresh_token");
      return false;
    }

    const data = await res.json();
    localStorage.setItem("st_access_token", data.access);
    if (data.refresh) localStorage.setItem("st_refresh_token", data.refresh);
    return true;
  } catch {
    return false;
  }
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const doFetch = () =>
    fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(auth ? authHeaders() : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

  let res = await doFetch();

  // Agar Token o'tmagan (401) bo'lsa, qayta refresh qilib ko'ramiz
  if (res.status === 401 && auth) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      res = await doFetch();
    } else {
      // Login sahifasiga yo'naltirish yoki xato berish
      console.warn("Sessiya muddati tugadi. Qayta avtorizatsiyadan o'ting.");
    }
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${detail || res.statusText}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ---- Auth ----
export const loginRequest = (username, password) =>
  request("/auth/login/", { method: "POST", body: { username, password }, auth: false });

export const registerRequest = (payload) =>
  request("/auth/register/", { method: "POST", body: payload, auth: false });

export const fetchMe = () => request("/auth/me/");
export const updateProfile = (payload) => request("/auth/me/", { method: "PATCH", body: payload });

// ---- Statistics ----
export const fetchDashboard = () => request("/statistics/dashboard/");

// ---- Subjects / Avatars ----
export const fetchSubjects = () => request("/subjects/", { auth: false });
export const fetchAvatars = () => request("/avatars/");

// ---- Sessions (avatar chat) ----
export const createSession = (subjectId, avatarId) =>
  request("/sessions/", { method: "POST", body: { subject: subjectId, avatar: avatarId } });
export const addSessionTurn = (sessionId, payload) =>
  request(`/sessions/${sessionId}/add_turn/`, { method: "POST", body: payload });
export const endSession = (sessionId) =>
  request(`/sessions/${sessionId}/end/`, { method: "POST" });

// ---- Math ----
export const fetchMathProblems = () => request("/math/problems/");
export const submitMathAnswer = (problemId, payload) =>
  request(`/math/problems/${problemId}/submit/`, { method: "POST", body: payload });

// ---- Flashcards ----
export const fetchDueFlashcards = () => request("/flashcards/reviews/due/");
export const gradeFlashcard = (reviewId, quality) =>
  request(`/flashcards/reviews/${reviewId}/grade/`, { method: "POST", body: { quality } });

// ---- Leaderboard ----
export const fetchLeaderboard = (scope = "global_anon") => request(`/leaderboard/?scope=${scope}`);

// ---- YouTube AI Recommendations ----
export const fetchRecommendedVideos = (sessionId) =>
  request(`/youtube/recommendations/${sessionId ? "?session=" + sessionId : ""}`);
export const markVideoClicked = (recId) => request(`/youtube/recommendations/${recId}/click/`, { method: "POST" });
export const fetchSavedVideos = () => request("/youtube/saved/");
export const saveVideo = (videoId) => request("/youtube/saved/", { method: "POST", body: { video_id: videoId } });
export const rateVideo = (videoId, stars) => request("/youtube/ratings/", { method: "POST", body: { video: videoId, stars } });

// ---- AI Teacher: Lesson Generator + AI Chat ----
export const generateLesson = (subjectId, cefrLevelId) =>
  request("/ai-teacher/lessons/generate/", { method: "POST", body: { subject: subjectId, cefr_level: cefrLevelId } });
export const fetchLessons = () => request("/ai-teacher/lessons/");
export const fetchChatThreads = () => request("/ai-teacher/chat/");
export const createChatThread = (subjectId) => request("/ai-teacher/chat/", { method: "POST", body: { subject: subjectId } });
export const sendChatMessage = (threadId, message) =>
  request(`/ai-teacher/chat/${threadId}/send/`, { method: "POST", body: { message } });

// ---- Personalized Learning Path ----
export const fetchLearningPath = (subjectCode) => request(`/learning-path/${subjectCode ? "?subject=" + subjectCode : ""}`);
export const generateLearningPath = (subjectId) => request("/learning-path/generate/", { method: "POST", body: { subject: subjectId } });

// ---- Payments ----
export const fetchTransactions = () => request("/payments/transactions/");
export const createPayment = (planId, provider) =>
  request("/payments/transactions/", { method: "POST", body: { plan: planId, provider } });

// ---- Admin ----
export const fetchAdminUsers = () => request("/auth/admin/users/");
export const fetchAdminPayments = () => request("/payments/admin/transactions/");
export const fetchAdminVideos = () => request("/youtube/admin/videos/");
export const fetchAdminOverview = () => request("/statistics/admin/overview/");
export const createAdminUser = (payload) => request("/auth/admin/users/", { method: "POST", body: payload });
export const fetchPlans = () => request("/auth/plans/");
export const createSubject = (payload) => request("/subjects/", { method: "POST", body: payload });
export const createAvatarAdmin = (payload) => request("/avatars/", { method: "POST", body: payload });
export const createMathProblem = (payload) => request("/math/problems/", { method: "POST", body: payload });

// ---- Integrations ----
export const fetchExternalCourses = (source) => request(`/integrations/courses/${source ? "?source=" + source : ""}`);
export const fetchSavedExternalCourses = () => request("/integrations/saved/");
export const saveExternalCourse = (courseId) => request("/integrations/saved/", { method: "POST", body: { course_id: courseId } });