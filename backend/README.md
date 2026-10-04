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

Image evidence is analyzed by `ai.image.analyzer2.analyze_image`, video evidence by `ai.video.analyzer3.analyze_video`, and audio evidence by `ai.audio.analyzer1.analyze_audio` during the investigation analysis request. They extract modality-specific metadata and analysis with explicit limitations where detector coverage is unavailable. The video detector is scoped to face manipulation, and the audio detector to AI-generated/cloned speech; neither claims to detect fully generated video or all audio. See the [video](../ai/video/README.md) and [audio](../ai/audio/README.md) analyzer setup and limitations. Other modalities remain unconfigured until their analyzers are registered.

Install the backend requirements, then install and start Ollama with the `gemma3:4b` vision model for image/video context:

```powershell
python -m pip install -r backend\requirements.txt
ollama pull gemma3:4b
ollama serve
```

Ollama must be reachable at `http://localhost:11434` by default. The image analyzer uses this URL and model unless its optional overrides are supplied. If Ollama is unavailable, image metadata is still returned with a visual-context limitation. Register implementations of `AnalyzerIntegration` and `FusionIntegration` from `app.services.integrations` during application startup for other integrations.
