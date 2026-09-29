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
