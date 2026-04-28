# Playto Pay — Payout Engine

A full-stack payout engine built with **Django REST Framework** (backend) and **React + Vite** (frontend).

**Live Demo:** [https://playto-pay-1.onrender.com/login](https://playto-pay-1.onrender.com/login)

---

## Temporary Demo Credentials

| Field    | Value                  |
|----------|------------------------|
| Email    | `rishabh@example.com`  |
| Password | `abcd1234`             |

---

## Project Structure

```
playto-pay/
├── backend/       # Django REST API
├── frontend/      # React + Vite SPA
└── README.md
```

---

## Backend Setup

### 1. Create & activate virtual environment

```bash
# Navigate to the backend folder
cd backend

# Create venv
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS / Linux)
source venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Run migrations

```bash
python manage.py migrate
```

### 4. Start the backend server

```bash
python manage.py runserver
```

The API will be available at **http://127.0.0.1:8000/**

---

## Frontend Setup

### 1. Install dependencies

```bash
# Navigate to the frontend folder
cd frontend

npm install
```

### 2. Start the dev server

```bash
npm run dev
```

The app will be available at **http://localhost:5173/**

---

## Quick Start (both together)

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd backend
venv\Scripts\activate
python manage.py runserver
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

---

## Tech Stack

| Layer    | Tech                              |
|----------|-----------------------------------|
| Frontend | React, Vite, React Router, Axios  |
| Backend  | Django, DRF, SimpleJWT            |
| Database | PostgreSQL (prod) / SQLite (dev)  |
