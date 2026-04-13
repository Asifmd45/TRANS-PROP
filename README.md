# TRANS-PROP Local Setup Guide

TRANS-PROP runs as a 3-layer local stack:

- React frontend: `frontend`
- Express middleware: `express-server`
- FastAPI ML backend: `LLM-Prop/models_deployment`

Request flow:

`React -> Express -> FastAPI -> Express -> React`

## Quick Start Checklist

1. Install prerequisites.
2. Clone repository.
3. Download required ML assets (data + checkpoints).
4. Create and activate Python virtual environment.
5. Install Python and Node dependencies.
6. Start 3 services (FastAPI, Express, React).
7. Open `http://localhost:8080/predict`.

## 1. Prerequisites

- Python `3.10+`
- Node.js `18+`
- npm `9+`

Verify versions:

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

## 3. Download Required ML Assets (Data + Checkpoints)

These files are required for inference output and are not stored in this GitHub repository.

- Data folder (Google Drive):
  - https://drive.google.com/drive/folders/1DA2osXEhV0gcONDXE2-E-gqGWMqNsJ84?usp=drive_link
- Checkpoints folder (Google Drive, classification + regression):
  - https://drive.google.com/drive/folders/1jruYBaxGfU7MpgVQRCHr9OolkBDIMgAx?usp=drive_link

Place files exactly at these paths:

- `LLM-Prop/data/samples/train_data.csv`
- `LLM-Prop/checkpoints/samples/classification/best_checkpoint_for_is_gap_direct.pt`
- `LLM-Prop/checkpoints/samples/regression/best_checkpoint_for_energy_per_atom.pt`
- `LLM-Prop/checkpoints/samples/regression/best_checkpoint_for_fepa.pt`
- `LLM-Prop/checkpoints/samples/regression/best_checkpoint_for_band_gap.pt`
- `LLM-Prop/checkpoints/samples/regression/best_checkpoint_for_e_above_hull.pt`
- `LLM-Prop/checkpoints/samples/regression/best_checkpoint_for_volume.pt`

Quick check on Windows PowerShell:

```powershell
Test-Path "LLM-Prop/data/samples/train_data.csv"
Test-Path "LLM-Prop/checkpoints/samples/classification/best_checkpoint_for_is_gap_direct.pt"
Test-Path "LLM-Prop/checkpoints/samples/regression/best_checkpoint_for_energy_per_atom.pt"
Test-Path "LLM-Prop/checkpoints/samples/regression/best_checkpoint_for_fepa.pt"
Test-Path "LLM-Prop/checkpoints/samples/regression/best_checkpoint_for_band_gap.pt"
Test-Path "LLM-Prop/checkpoints/samples/regression/best_checkpoint_for_e_above_hull.pt"
Test-Path "LLM-Prop/checkpoints/samples/regression/best_checkpoint_for_volume.pt"
```

## 4. Create and Activate Python Virtual Environment

Create:

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

## 5. Install Dependencies

Install Python packages:

```bash
pip install -r LLM-Prop/requirements.txt
pip install fastapi uvicorn
```

Install Node packages:

```bash
cd express-server
npm install
cd ..

cd frontend
npm install
cd ..
```

## 6. Run Locally (Open 3 Terminals)

Run each service in a separate terminal.

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

Open:

`http://localhost:8080/predict`

## 7. Health Checks

FastAPI:

```bash
curl http://127.0.0.1:8000/health
```

Express:

```bash
curl http://127.0.0.1:5000/health
```

## 8. Optional API Test

Test prediction through Express:

```bash
curl -X POST http://127.0.0.1:5000/api/predict \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"Rb2NaPrCl6 is perovskite-derived and crystallizes in the cubic Fm-3m space group.\"}"
```

## How Crystal Description Flows Through the ML Layer

When you enter a crystal/material description on `/predict`, the request path is:

1. React sends JSON to Express:

```json
{
  "text": "your crystal description"
}
```

2. Express forwards the request to FastAPI (`/predict`) without changing ML logic.
3. FastAPI calls the existing inference pipeline in `LLM-Prop/models_deployment/predict_all.py`.
4. Predictor modules load model checkpoints/tokenizer/data and compute outputs.
5. FastAPI returns a unified response to Express.
6. Express returns the response to React.
7. React displays prediction values in the UI.

Displayed output fields:

- `is_gap_direct`
- `energy_per_atom`
- `formation_energy_per_atom`
- `band_gap`
- `e_above_hull`
- `volume`

## Troubleshooting

- `Failed to fetch` in frontend:
  - Confirm FastAPI (`8000`) and Express (`5000`) are running.
- Port already in use:
  - Stop existing process on that port, then restart services.
- PowerShell blocks virtual environment activation:
  - Run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`
  - Then run `.\.venv\Scripts\Activate.ps1` again.
- `npm run dev` fails:
  - Re-run `npm install` in both `express-server` and `frontend`.

## Notes

- Do not commit local runtime artifacts such as `.venv`, editor folders, large datasets, or checkpoints.
