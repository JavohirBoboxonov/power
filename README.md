# SuperTutor AI — Backend

Django + DRF backend. MVP scope: English + Math, full statistics dashboard, single avatar.

## Setup
```
pip install -r requirements/base.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

Apps: accounts, subjects, sessions, statistics, math_practice, avatars, gamification, learning_path, practice_tools.

# SuperTutor AI — Full Stack

Bitta papkada backend (Django) va frontend (React) birga.

## Struktura
- `backend/` — Django REST API (supertutor_ai)
- `frontend/` — React (Vite) ilova

## Ishga tushirish

### 1. Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate       # Windows
pip install -r requirements/base.txt
copy .env.example .env
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```
Backend: http://localhost:8000

### 2. Frontend (alohida terminalda)
```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```
Frontend: http://localhost:5173

Ikkalasi ham bir vaqtda ishlab turishi kerak (backend 8000-portda, frontend 5173-portda).
