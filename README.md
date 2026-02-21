# NERVE — Medical Referral Command : A real-time, AI‑assisted medical referral platform that helps triage patients, identify optimal facilities, and provide transparent clinical reasoning—fast.

## Highlights
- **AI‑Powered Verdicts** with explainable reasoning  
- **Hospital Capacity Awareness** (ICU/bed availability)  
- **Routing & ETA Insights** for faster decisions  
- **Clinician‑Friendly UI** with clear decision summaries  
- **Modular Backend** (triage, referral, hospitals)

## What It Does
NERVE ingests patient vitals and symptoms, evaluates urgency and specialty needs, and recommends the most appropriate facility. It presents:
- Decision summary (severity, specialty, facility, confidence)  
- Key factors considered  
- Facility comparison with rationale  
- Clinical guidance for care teams  

## Tech Stack
**Frontend**  
- React + Vite  
- TailwindCSS  
- Lucide Icons  

**Backend**  
- Node.js + Express  
- MongoDB (Mongoose)  
- External services for AI and routing  

## Project Structure
```
Project/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── services/
└── nerve/
    ├── src/
    │   ├── components/
    │   ├── services/
    │   └── data/
```
## Setup

### 1) Backend
```bash
cd backend
npm install
npm run dev
```
### 2) Frontend
```bash
cd nerve
npm install
npm run dev
```

