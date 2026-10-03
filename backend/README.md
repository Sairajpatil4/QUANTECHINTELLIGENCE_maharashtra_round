# TrustLayer Backend

## Run locally

From the repository root, activate the virtual environment, install the backend dependencies, and start the API:

```powershell
.\venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt
python -m uvicorn app.main:app --app-dir backend --reload
```

The API is available at `http://localhost:8000`, with Swagger UI at `http://localhost:8000/docs`.

SQLite is initialized automatically at `backend/trustlayer.db`. Uploaded evidence is stored under `backend/uploads/{investigation_id}/` and is excluded from Git.

## Analysis integrations

Register implementations of `AnalyzerIntegration` and `FusionIntegration` from `app.services.integrations` during application startup. Until configured, analysis is recorded as failed/incomplete with explicit limitations; no authenticity assessment is fabricated.
