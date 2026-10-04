## Video analysis

`ai.video.analyzer3.analyze_video(evidence_id=..., file_path=...)` returns the shared `ai.fusion.schemas.Evidence` model. It extracts basic video metadata, samples up to three representative frames for optional visual context through Ollama (`gemma3:4b`), and runs a local face-manipulation detector on faces found in those frames.

Install backend dependencies and have Ollama running with its vision model for visual context:

```powershell
python -m pip install -r backend\requirements.txt
ollama pull gemma3:4b
ollama serve
```

The face detector lazily downloads `HoopitAI/video-deepfake-detection-GenD_CLIP_L_14_FF` on first use (about 1.2 GB, plus its CLIP backbone). It is pinned to revision `8d227ed2ef40f8014dbac19aed9dbf7892ee1a7a`. The model repository supplies custom Transformers model code, which Transformers executes when loading this pinned model (`trust_remote_code=True`); review that code before enabling the detector in a sensitive environment. It was trained on FaceForensics++ face manipulations, uses face crops, and is not a detector for fully AI-generated text-to-video. The implementation uses OpenCV Haar face crops, not the landmark-aligned crops expected by the model, so its scores may be less reliable. Treat scores as exploratory detector signals, not calibrated authenticity probabilities.

If the model dependencies or model are unavailable, the analyzer returns empty `signals` and an explicit limitation while preserving video metadata and any visual context it could extract. No faces in the sampled frames also means face manipulation could not be assessed; it is not a finding that the video is authentic.