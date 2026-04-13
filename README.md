# TRANS-PROP Local Setup Guide

This project runs with 3 local services:

- React frontend: `frontend`
- Express middleware: `express-server`
- FastAPI ML backend: `LLM-Prop/models_deployment`

Flow:

`React -> Express -> FastAPI -> Express -> React`

## How Crystal Description Flows Through ML Layer

When you enter a crystal/material description on the `/predict` page, this is what happens:

1. React sends your text to Express as a JSON request:

```json
{
  "text": "your crystal description"
}
```

2. Express forwards that request to FastAPI (`/predict`) without changing the ML logic.
3. FastAPI calls the existing prediction pipeline in `LLM-Prop/models_deployment/predict_all.py`.
4. The ML layer runs the trained property-specific predictors and computes outputs.
5. FastAPI returns a unified JSON response to Express.
6. Express returns the same response to React.
7. React renders those predicted values on the UI.

Displayed prediction fields:

- `is_gap_direct`
- `energy_per_atom`
- `formation_energy_per_atom`
- `band_gap`
- `e_above_hull`
- `volume`

## 1. Prerequisites

Install these first:

- Python `3.10+`
- Node.js `18+`
- npm `9+`

Check versions:

```bash
python --version
node --version
npm --version
```

## 2. Clone Repository

```bash
git clone <your-repo-url>
cd <repo-folder-name>
```

## 3. Create and Activate Python Virtual Environment

Create venv:

```bash
python -m venv .venv
```

Activate on Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Activate on Windows CMD:

```bat
.venv\Scripts\activate.bat
```

Activate on macOS/Linux:

```bash
source .venv/bin/activate
```

## 4. Install Dependencies

Python dependencies:

```bash
pip install -r LLM-Prop/requirements.txt
pip install fastapi uvicorn
```

Node dependencies:

```bash
cd express-server
npm install
cd ..

cd frontend
npm install
cd ..
```

## 5. Run Locally (Open 3 Terminals)

Use three separate terminals and run one command set in each.

Terminal A: FastAPI backend (port 8000)

```bash
cd LLM-Prop/models_deployment
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Terminal B: Express middleware (port 5000)

```bash
cd express-server
npm run dev
```

Terminal C: React frontend (port 8080)

```bash
cd frontend
npm run dev
```

Open in browser:

`http://localhost:8080/predict`

## 6. Health Checks

FastAPI:

```bash
curl http://127.0.0.1:8000/health
```

Express:

```bash
curl http://127.0.0.1:5000/health
```

## 7. Optional API Test

Run a prediction through Express:

```bash
curl -X POST http://127.0.0.1:5000/api/predict \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"Rb2NaPrCl6 is perovskite-derived and crystallizes in the cubic Fm-3m space group.\"}"
```

## Troubleshooting

- `Failed to fetch` in frontend:
  - Confirm FastAPI (`8000`) and Express (`5000`) are both running.
- Port already in use:
  - Stop old process on that port, then restart services.
- PowerShell blocks virtual environment activation:
  - Run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`
  - Then run `.\.venv\Scripts\Activate.ps1` again.
- `npm run dev` fails:
  - Re-run `npm install` in both `express-server` and `frontend`.

## Notes

- Keep local artifacts out of git (`.venv`, editor folders, large datasets, checkpoints).
