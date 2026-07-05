# 🏥 Doctor Helper — AI-Powered Clinical Decision Support System

> A full-stack AI-powered Electronic Medical Record (EMR) and Clinical Decision Support System (CDSS) built for modern medical practice.

![Python](https://img.shields.io/badge/Python-3.10+-blue?style=flat-square&logo=python)
![Django](https://img.shields.io/badge/Django-5.x-green?style=flat-square&logo=django)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=flat-square&logo=postgresql)
![XGBoost](https://img.shields.io/badge/XGBoost-83.75%25_Accuracy-orange?style=flat-square)
![Llama3](https://img.shields.io/badge/Llama3-Local_AI-purple?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 📸 Overview

Doctor Helper is a full-stack clinical decision support system that helps doctors:
- Predict diseases from symptoms using AI
- Analyze lab reports automatically
- Manage patient records and EMR
- Generate professional discharge summaries
- Ask an AI medical assistant powered by Llama 3

---

## ✨ Features

| Module | Description |
|--------|-------------|
| 🔐 **Authentication** | JWT-based login, registration, role-based access control |
| 👥 **Patient Management** | Full CRUD, demographics, search, timeline view |
| 📋 **EMR** | Encounters, vitals, prescriptions, allergies |
| 🤖 **AI Disease Prediction** | XGBoost · 754 diseases · 83.75% accuracy · Feature importance |
| 🧪 **Lab Report Analyzer** | 35+ parameters · Clinical significance detection · AI interpretation |
| 💬 **AI Medical Assistant** | Llama 3 + FAISS RAG · 773 disease knowledge documents |
| 📄 **Discharge Summaries** | AI-generated narrative + Professional PDF export |
| 📊 **Dashboard & Analytics** | Real-time stats, area charts, disease trends, alerts |
| 🔔 **Notifications** | Critical lab alerts, follow-up reminders, patient status |

---

## 🛠️ Tech Stack

### Backend
- **Django 5** + **Django REST Framework**
- **PostgreSQL** — primary database
- **JWT Authentication** — via SimpleJWT
- **XGBoost** — disease prediction model
- **FAISS** + **Sentence Transformers** — vector search for RAG
- **Ollama (Llama 3)** — local AI text generation (free, no API cost)
- **ReportLab** — professional PDF generation

### Frontend
- **React 18** + **React Router v6**
- **Tailwind CSS** — utility-first styling
- **Recharts** — data visualization and charts
- **Axios** — API communication with JWT interceptors

### AI & ML
- **XGBoost** classifier trained on 246,926 patient records
- **FAISS** vector database with 773 medical knowledge documents
- **Sentence Transformers** (all-MiniLM-L6-v2) for embeddings
- **Llama 3** via Ollama for local AI generation

---

## 📊 ML Model Performance

| Metric | Value |
|--------|-------|
| Training samples | 197,540 |
| Test samples | 49,386 |
| Diseases covered | **754** |
| Symptoms tracked | **377** |
| Model accuracy | **83.75%** |

---

## 📁 Project Structure
doctor_helper/
├── backend/                    # Django REST API
│   ├── accounts/               # JWT auth & user management
│   ├── doctors/                # Doctor profiles & specializations
│   ├── patients/               # Patient records & demographics
│   ├── emr/                    # Electronic Medical Records
│   ├── predictions/            # XGBoost disease prediction
│   ├── reports/                # Lab report analysis
│   ├── rag/                    # Llama 3 + FAISS AI assistant
│   ├── discharge_summary/      # AI discharge documents & PDF
│   ├── dashboard/              # Analytics, stats & notifications
│   └── core/                   # Django settings & main URLs
├── frontend/                   # React application
│   └── src/
│       ├── pages/              # All page components
│       ├── components/common/  # Reusable UI components
│       ├── layouts/            # App layout & sidebar
│       ├── services/           # Axios API service layer
│       └── contexts/           # React Auth context
├── models/                     # Trained ML model files (not tracked)
└── vector_db/                  # FAISS index files (not tracked)


---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 15+
- [Ollama](https://ollama.ai) with Llama 3 pulled (`ollama pull llama3`)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/josin-joseph/doctor-helper.git
cd doctor-helper
```

### 2. Backend setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file inside `backend/` (use `.env.example` as reference):

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=doctor_helper_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
OLLAMA_BASE_URL=http://localhost:11434
```

Create the PostgreSQL database:

```sql
CREATE DATABASE doctor_helper_db;
```

Run migrations and create superuser:

```bash
python manage.py migrate
python manage.py createsuperuser
```

### 3. Train the ML model

Place the disease dataset CSV (`Final_Augmented_dataset_Diseases_and_Symptoms.csv`) inside `backend/predictions/` then:

```bash
python predictions/train_model.py
```

Training takes 5–10 minutes. Expected output:
Model accuracy: 0.8375 (83.75%)
All model files saved to models/ folder!

### 4. Build the FAISS index

Place the `medical_knowledge/` folder inside `backend/rag/` then:

```bash
python -c "import django; import os; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings'); django.setup(); from rag.rag_engine import build_faiss_index; build_faiss_index()"
```

### 5. Start the backend

```bash
python manage.py runserver
```

Backend runs at **http://127.0.0.1:8000**

### 6. Frontend setup

```bash
cd ../frontend
npm install
npm start
```

Frontend runs at **http://localhost:3000** 🎉

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login/` | Doctor login — returns JWT tokens |
| POST | `/api/auth/register/` | Doctor registration |
| GET/POST | `/api/patients/` | List or create patients |
| GET | `/api/patients/{id}/timeline/` | Full patient timeline |
| GET | `/api/patients/stats/` | Patient statistics |
| POST | `/api/emr/patients/{id}/encounters/` | Add encounter |
| POST | `/api/emr/patients/{id}/vitals/` | Record vitals |
| POST | `/api/predictions/predict/{id}/` | AI disease prediction |
| GET | `/api/predictions/history/{id}/` | Prediction history |
| POST | `/api/reports/` | Create and analyze lab report |
| POST | `/api/rag/ask/` | Ask AI medical assistant |
| POST | `/api/discharge/` | Generate discharge summary |
| GET | `/api/discharge/{id}/pdf/` | Export summary as PDF |
| GET | `/api/dashboard/stats/` | Dashboard statistics |
| GET | `/api/dashboard/notifications/` | Alerts and notifications |
| GET | `/api/health/` | API health check |

---

## ⚙️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | — |
| `DEBUG` | Debug mode | `True` |
| `DB_NAME` | PostgreSQL database name | `doctor_helper_db` |
| `DB_USER` | PostgreSQL username | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | — |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `OLLAMA_BASE_URL` | Ollama API base URL | `http://localhost:11434` |

---

## 🗺️ Roadmap

- [ ] Phase 11 — Appointment scheduling & calendar
- [ ] Prescription generator with printable pad
- [ ] Patient portal — patients view own records
- [ ] WhatsApp/SMS follow-up reminders via Twilio
- [ ] Voice dictation for clinical notes
- [ ] HL7/FHIR interoperability
- [ ] Mobile app (React Native)
- [ ] Multi-hospital / multi-doctor support

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Josin Joseph**

Built with ❤️ as a full-stack AI healthcare project.

[![GitHub](https://img.shields.io/badge/GitHub-josin--joseph-black?style=flat-square&logo=github)](https://github.com/josin-joseph)

---

> ⚠️ **Disclaimer:** Doctor Helper is a decision support tool and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare professionals for medical decisions.