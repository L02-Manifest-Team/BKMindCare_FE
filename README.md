# BKMindCare - Mental Health Support Application

BKMindCare is a comprehensive mobile application designed to support mental health for students and connect them with psychological experts (doctors/psychologists). The app features a dual-interface system serving two distinct user roles: **Students (Patients)** and **Doctors**.

## 🚀 Tech Stack

- **Frontend:** React Native (Expo), TypeScript, React Navigation, Gifted Chat
- **Backend:** Python (FastAPI), WebSockets
- **Database:** SQLite / PostgreSQL (via SQLAlchemy)
- **Communication:** Real-time Chat (Socket.IO/WebSocket), RESTful APIs

## ✨ Key Features

### 👤 For Students (Patients)

**1. Mental Health Tracking**
- **Mood Check-in:** Daily emotional status tracking with emoji selectors and notes.
- **Mood History:** Visual calendar and statistics of emotional trends over time.
- **Journaling:** Personal diary to record thoughts and feelings.
- **Mental Health Tests:** Self-assessment tests to evaluate mental state (`MentalHealthTest`).

**2. Consultation & Appointments**
- **Find Doctors:** Browse list of available psychologists with detailed profiles and specializations.
- **Book Appointments:** Schedule online (video call) or in-person consultations.
- **Appointment Management:** View upcoming, pending, and past appointments; reschedule or cancel as needed.

**3. Communication**
- **Real-time Chat:** Direct messaging with connected doctors.
- **Notification System:** Updates on appointment status and new messages.

**4. Account Management**
- **Profile:** Manage personal information.
- **Settings & Support:** Customization options and FAQ support.

---

### 👨‍⚕️ For Doctors

**1. Professional Dashboard**
- **Overview Stats:** At-a-glance view of total patients, today's appointments, and message counts.
- **Upcoming Appointments:** Quick access to the next 3 scheduled consultations.
- **Reviews & Ratings:** View patient feedback and star ratings.

**2. Appointment Management**
- **Calendar View:** Manage schedule via a calendar interface (`DoctorCalendar`).
- **Request Approval:** Review, accept, or reject pending appointment requests from students.
- **Appointment Details:** Access detailed patient info and session notes.

**3. Patient Management**
- **Patient Stats:** Track patient interaction statistics.
- **Chat:** Communicate with patients securely.
- **History:** Review past consultations.

**4. Personal Profile**
- **Professional Info:** Update specialization, bio, and availability.
- **Settings:** Configure app preferences.

## 🛠️ Installation & Setup

### Prerequisites
- Node.js & npm/yarn
- Python 3.8+
- Expo Go (for mobile testing)

### Backend Setup
1. Navigate to `BE` directory:
   ```bash
   cd BE/BKMindCare_BE
   ```
2. Create virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```
3. Run the server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   *Server will start at `http://localhost:8000`*

### Frontend Setup
1. Navigate to `FE` directory:
   ```bash
   cd FE/BKMindCare_FE
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Expo app:
   ```bash
   npx expo start
   ```
4. Scan the QR code with **Expo Go** on your Android/iOS device.

## 📝 Recent Updates (Walkthrough)

- **Cross-Account Fixes:** Resolved token conflict issues when switching between User and Doctor accounts.
- **Navigation:** Implemented secure logout with navigation stack reset.
- **Chat System:** Unified Chat UI, fixed critical race conditions, and infinite loading loops.
- **Doctor Dashboard:** Added "Upcoming Appointments" section and translated UI to Vietnamese.

## 👥 Authors

- **Huynh Minh Tien** - *Developer*
- **Dang Thi Thuy Vi** - *Developer*
- **Nguyen Ngoc Truc Quynh** - *Developer*
- **Tran Nguyen Phu Nghia** - *Developer*
