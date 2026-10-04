## Audio analysis

`ai.audio.analyzer1.analyze_audio(file_path, evidence_id)` returns the shared `ai.fusion.schemas.Evidence` model. It extracts file metadata and descriptive acoustic features for ten-second chunks (up to the first 60 seconds): RMS energy, zero-crossing rate, spectral centroid, spectral flatness, 85% spectral rolloff, and rough autocorrelation-based pitch statistics. These measurements describe the signal; they are not AI-origin indicators.

The analyzer also uses the local Wav2Vec2 audio classifier `Hemgg/Deepfake-audio-detection` to score ten-second speech chunks. The model is pinned to revision `0d75271368ef2c7efd14831dc503c431f6aab0eb`; its weights are approximately 378 MB and download from Hugging Face on first use.

Install the backend requirements with `python -m pip install -r backend\requirements.txt`. The analyzer reads formats supported by SoundFile/libsndfile. No API key or environment variable is required.

The detector card describes training on a multi-ethnic English voice dataset, but its evaluation accuracy is unverified and it is not validated for music, non-speech audio, or every language. Its scores are uncalibrated indicators, not proof that audio was generated or recorded by a person. Until the model loads and runs, evidence has empty `signals` and an explicit detector-unavailable limitation.