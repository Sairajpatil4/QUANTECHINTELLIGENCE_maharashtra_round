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

During analysis, `MediaAnalyzerIntegration` dispatches image, video, text, and audio evidence to their existing analyzers. The image forensics helper uses the pinned Apache-2.0 `dima806/ai_vs_human_generated_image_detection` ViT checkpoint as an AI-generation screening signal. Its model card warns of concept drift; it does not detect localized edits, splicing, or copy-move manipulation, and its score is not calibrated. Text uploads must be UTF-8; PDF and office document extraction is not configured and returns an explicit limitation. The video detector is scoped to face manipulation, and the audio detector to AI-generated/cloned speech; neither claims to detect fully generated video or all audio. See the [video](../ai/video/README.md) and [audio](../ai/audio/README.md) analyzer setup and limitations.

Install the backend requirements, then install and start Ollama with the `gemma3:4b` vision model for image/video context:

```powershell
python -m pip install -r backend\requirements.txt
ollama pull gemma3:4b
ollama serve
```

Ollama must be reachable at `http://localhost:11434` by default. Image, video, and text context analysis default to `gemma3:4b`. Set `TRUSTLAYER_OLLAMA_URL` if Ollama uses another host or port. Set `TRUSTLAYER_IMAGE_MODEL` to select a different vision model already installed in Ollama; `TRUSTLAYER_TEXT_MODEL` selects the text model. If Ollama is unavailable, modality analyzers still return their available metadata with explicit limitations.

The image AI-generation classifier is configured in `ai/image/forensics.py` and downloads its pinned Hugging Face weights the first time it runs. Install `backend/requirements.txt` and allow access to Hugging Face for that initial download. A failed download or model load is reported as a classifier runtime limitation. The classifier only screens for AI-generated imagery and cannot establish that an image is real or detect every kind of edit.

The backend registers `MediaAnalyzerIntegration` and `TrustLayerFusionAdapter` during application import.
