# NERVE Backend

Backend API for NERVE (Neural Emergency Response & Verdict Engine) - AI-powered medical triage and hospital referral system.

## System Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Patient Data   │────▶│   Fetch Hospitals │────▶│   Gemini LLM    │
│   (Uploaded)    │     │   from MongoDB    │     │   Processing    │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                         ┌────────────────────────────────┘
                         ▼
              ┌─────────────────────┐
              │  Best Hospital      │
              │  Recommendation     │
              └─────────────────────┘
```

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **AI**: Google Gemini API (gemini-1.5-flash)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your credentials:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nerve
GEMINI_API_KEY=your_gemini_api_key_here
```

4. Seed the database with hospitals:
```bash
npm run seed
```

5. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |

### Referral (Main Flow)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/referral` | Process patient & find best hospital |
| POST | `/api/referral/quick` | Quick referral without saving |
| GET | `/api/referral/patient/:id` | Get patient's referral info |

### Hospitals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hospitals` | Get all hospitals |
| GET | `/api/hospitals/available` | Get hospitals accepting patients |
| POST | `/api/hospitals` | Add new hospital |
| PUT | `/api/hospitals/:id` | Update hospital |
| PATCH | `/api/hospitals/:id/status` | Update hospital status |
| DELETE | `/api/hospitals/:id` | Delete hospital |

### Triage (Standalone)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/triage` | Create patient with triage |
| GET | `/api/triage` | Get all patients |
| POST | `/api/triage/quick` | Quick triage |
| POST | `/api/triage/telemetry` | Analyze telemetry data |

## Request Examples

### Process Referral (Main API)
```json
POST /api/referral
{
  "name": "John Doe",
  "age": 45,
  "gender": "male",
  "chiefComplaint": "Chest pain",
  "symptoms": ["shortness of breath", "sweating"],
  "vitals": {
    "heartRate": 110,
    "bloodPressure": { "systolic": 160, "diastolic": 95 },
    "temperature": 98.6,
    "oxygenSaturation": 94,
    "respiratoryRate": 22
  },
  "medicalHistory": "Hypertension, Type 2 Diabetes",
  "allergies": ["Penicillin"],
  "currentMedications": ["Metformin", "Lisinopril"]
}
```

### Response
```json
{
  "success": true,
  "data": {
    "patient": { "id": "...", "name": "John Doe" },
    "triage": {
      "severity": "critical",
      "requiredSpecializations": ["cardiology"],
      "reasoning": "Patient presents with classic cardiac symptoms..."
    },
    "recommendedHospital": {
      "hospitalId": "...",
      "hospitalName": "Heart Care Institute",
      "matchScore": 95,
      "reasons": ["Specialized cardiology center", "Low wait time"]
    },
    "alternativeHospitals": [...],
    "urgentTransfer": true
  }
}
```
