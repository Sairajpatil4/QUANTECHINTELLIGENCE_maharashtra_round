"""Descriptive acoustic measurements for audio evidence."""

from typing import Any, Dict, List

import numpy as np


SAMPLE_RATE = 16_000
FRAME_SECONDS = 0.025
FRAME_HOP_SECONDS = 0.010
PITCH_FRAME_SECONDS = 0.040
PITCH_HOP_SECONDS = 0.020
MIN_PITCH_HZ = 60.0
MAX_PITCH_HZ = 400.0
PITCH_PERIODICITY_THRESHOLD = 0.35


def _frame_audio(audio: np.ndarray, frame_size: int, hop_size: int) -> np.ndarray:
	if audio.size < frame_size:
		audio = np.pad(audio, (0, frame_size - audio.size))
	return np.lib.stride_tricks.sliding_window_view(audio, frame_size)[::hop_size]


def _pitch_measurements(audio: np.ndarray) -> Dict[str, Any]:
	frame_size = round(PITCH_FRAME_SECONDS * SAMPLE_RATE)
	hop_size = round(PITCH_HOP_SECONDS * SAMPLE_RATE)
	frames = _frame_audio(audio, frame_size, hop_size).astype(np.float64)
	frames -= np.mean(frames, axis=1, keepdims=True)
	frames *= np.hanning(frame_size)

	fft_size = 1 << (2 * frame_size - 1).bit_length()
	spectrum = np.fft.rfft(frames, n=fft_size, axis=1)
	correlation = np.fft.irfft(
		spectrum * np.conjugate(spectrum),
		n=fft_size,
		axis=1,
	)[:, :frame_size]
	zero_lag = correlation[:, :1]
	normalized = np.divide(
		correlation,
		zero_lag,
		out=np.zeros_like(correlation),
		where=zero_lag > 1e-12,
	)

	min_lag = round(SAMPLE_RATE / MAX_PITCH_HZ)
	max_lag = min(round(SAMPLE_RATE / MIN_PITCH_HZ), frame_size - 1)
	candidate_range = normalized[:, min_lag : max_lag + 1]
	best_offsets = np.argmax(candidate_range, axis=1)
	best_lags = best_offsets + min_lag
	periodicity = candidate_range[np.arange(candidate_range.shape[0]), best_offsets]
	voiced = periodicity >= PITCH_PERIODICITY_THRESHOLD
	pitches = SAMPLE_RATE / best_lags[voiced] if np.any(voiced) else np.array([])

	return {
		"estimated_pitch_median_hz": (
			round(float(np.median(pitches)), 2) if pitches.size else None
		),
		"estimated_pitch_std_hz": (
			round(float(np.std(pitches)), 2) if pitches.size else None
		),
		"voiced_frame_fraction": round(float(np.mean(voiced)), 4),
	}


def extract_acoustic_features(
	audio: np.ndarray,
	*,
	start_seconds: float = 0.0,
) -> Dict[str, Any]:
	"""Summarize signal energy, spectrum, zero crossings, and rough pitch."""
	if audio.ndim != 1 or audio.size == 0:
		raise ValueError("Acoustic analysis requires non-empty mono audio.")

	frame_size = round(FRAME_SECONDS * SAMPLE_RATE)
	hop_size = round(FRAME_HOP_SECONDS * SAMPLE_RATE)
	frames = _frame_audio(audio, frame_size, hop_size).astype(np.float64)
	window = np.hanning(frame_size)
	windowed = frames * window
	rms = np.sqrt(np.mean(np.square(frames), axis=1))
	zero_crossings = np.mean(
		(frames[:, 1:] * frames[:, :-1]) < 0,
		axis=1,
	)

	fft_size = 1 << (frame_size - 1).bit_length()
	spectrum = np.abs(np.fft.rfft(windowed, n=fft_size, axis=1)) ** 2
	frequencies = np.fft.rfftfreq(fft_size, d=1 / SAMPLE_RATE)
	non_dc = spectrum[:, 1:]
	non_dc_frequencies = frequencies[1:]
	spectral_energy = np.sum(non_dc, axis=1)
	centroid = np.divide(
		np.sum(non_dc * non_dc_frequencies, axis=1),
		spectral_energy,
		out=np.zeros_like(spectral_energy),
		where=spectral_energy > 1e-12,
	)
	flatness = np.zeros_like(spectral_energy)
	active = spectral_energy > 1e-12
	if np.any(active):
		active_spectrum = non_dc[active]
		flatness[active] = np.exp(
			np.mean(np.log(active_spectrum + 1e-12), axis=1)
		) / (np.mean(active_spectrum, axis=1) + 1e-12)

	cumulative_energy = np.cumsum(non_dc, axis=1)
	rolloff_indices = np.argmax(
		cumulative_energy >= spectral_energy[:, None] * 0.85,
		axis=1,
	)
	rolloff = non_dc_frequencies[rolloff_indices]
	pitch = _pitch_measurements(audio)

	return {
		"start_seconds": round(start_seconds, 3),
		"duration_seconds": round(audio.size / SAMPLE_RATE, 3),
		"rms_mean": round(float(np.mean(rms)), 6),
		"zero_crossing_rate_mean": round(float(np.mean(zero_crossings)), 6),
		"spectral_centroid_median_hz": round(float(np.median(centroid)), 2),
		"spectral_flatness_median": round(float(np.median(flatness)), 6),
		"spectral_rolloff_85_median_hz": round(float(np.median(rolloff)), 2),
		**pitch,
	}


def analyze_acoustic_chunks(
	audio: np.ndarray,
	*,
	chunk_seconds: int = 10,
) -> List[Dict[str, Any]]:
	"""Extract descriptive measurements for each audio analysis chunk."""
	if audio.ndim != 1 or audio.size == 0:
		raise ValueError("Acoustic analysis requires non-empty mono audio.")
	if chunk_seconds <= 0:
		raise ValueError("Chunk duration must be positive.")

	chunk_size = chunk_seconds * SAMPLE_RATE
	return [
		extract_acoustic_features(
			audio[start : start + chunk_size],
			start_seconds=start / SAMPLE_RATE,
		)
		for start in range(0, audio.size, chunk_size)
	]