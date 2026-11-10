# NoteSpace — Full-Stack Note-Taking App

A learning-focused reference implementation of the internship assignment:
- User registration and login
- JWT authentication
- Private, per-user notes
- Create, read, update and delete notes
- Request validation and consistent API errors
- Responsive React interface

## Stack
- Frontend: React, Vite, React Router, Axios, Tailwind-style custom CSS
- Backend: Python, FastAPI, Pydantic
- Database: MongoDB (PyMongo async client)
- Authentication: JWT access tokens + Argon2 password hashing

> Learning use: study this implementation, then rebuild it independently. Do not submit it as work you personally authored without understanding and rewriting it.

## Project structure

```text
notespace-learning-project/
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   └── notes.py
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── dependencies.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── security.py
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   └── package.json
├── docker-compose.yml
└── .gitignore
```

## Run on macOS

### 1. Requirements
Install:
- Python 3.10+
- Node.js 20+
- Docker Desktop (recommended for MongoDB), or a local MongoDB server

Check:
```bash
python3 --version
node --version
npm --version
docker --version
```

### 2. Start MongoDB
From the project root:
```bash
docker compose up -d
```
MongoDB will be available at `mongodb://localhost:27017`.

### 3. Start the backend
Open a terminal:
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Open `backend/.env` and replace `CHANGE_THIS_WITH_A_LONG_RANDOM_SECRET` with a long random secret.

Start the API:
```bash
uvicorn app.main:app --reload
```
API: http://127.0.0.1:8000  
Interactive API docs: http://127.0.0.1:8000/docs

### 4. Start the frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the local URL printed by Vite (normally http://localhost:5173).

## How to test the assignment requirements
1. Register with a name, email and password.
2. Log out and log back in.
3. Create two notes.
4. Edit one note and delete the other.
5. Register a second account in a private/incognito browser.
6. Confirm the second account cannot see the first account's notes.
7. Try invalid input using the API docs and observe validation errors.

## API overview

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Create account | No |
| POST | `/api/auth/login` | Log in | No |
| GET | `/api/auth/me` | Current user | Yes |
| GET | `/api/notes` | List own notes | Yes |
| POST | `/api/notes` | Create note | Yes |
| GET | `/api/notes/{note_id}` | Read one own note | Yes |
| PATCH | `/api/notes/{note_id}` | Update own note | Yes |
| DELETE | `/api/notes/{note_id}` | Delete own note | Yes |
| GET | `/health` | Health check | No |

## Important implementation concepts
- Passwords are never stored in plain text. Argon2 stores password hashes.
- The API returns a signed JWT after login.
- The frontend sends the token as `Authorization: Bearer <token>`.
- Every note query filters by both `_id` and `owner_id`. This is the key ownership boundary.
- Pydantic models validate request bodies before route logic runs.
- The frontend is a separate application from the backend; Axios connects them over HTTP.

## Production improvements to study next
This is a local learning baseline, not a production security audit. Before production, consider refresh-token rotation, secure HttpOnly cookies, rate limiting, email verification, password reset, stricter CORS, structured logging, automated tests, backups, HTTPS, and deployment secrets management.
