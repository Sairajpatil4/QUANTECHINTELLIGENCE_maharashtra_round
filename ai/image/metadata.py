"""Image file metadata extraction helpers."""

from pathlib import Path
from typing import Any, Dict, Optional
from datetime import datetime

from PIL import ExifTags, Image


def _text_value(value: Any) -> Optional[str]:
	if value is None:
		return None
	if isinstance(value, bytes):
		return value.decode("utf-8", errors="replace").strip("\x00 ")
	return str(value)


def _gps_coordinate(values: Any, reference: Any) -> Optional[float]:
	if not isinstance(values, (tuple, list)) or len(values) != 3:
		return None
	try:
		degrees, minutes, seconds = (float(value) for value in values)
	except (TypeError, ValueError, ZeroDivisionError):
		return None
	coordinate = degrees + minutes / 60 + seconds / 3600
	if reference in ("S", "W"):
		coordinate = -coordinate
	return round(coordinate, 6)


def _normalize_datetime(value: Any) -> Optional[str]:
	text = _text_value(value)
	if not text:
		return None
	try:
		return datetime.strptime(text, "%Y:%m:%d %H:%M:%S").isoformat()
	except ValueError:
		return text


def extract_image_metadata(image_path: str) -> Dict[str, Any]:
	"""Extract basic image properties and commonly available EXIF fields."""
	path = Path(image_path)
	file_size = path.stat().st_size

	with Image.open(path) as image:
		exif = image.getexif()
		exif_values = {
			ExifTags.TAGS.get(tag_id, str(tag_id)): value
			for tag_id, value in exif.items()
		}
		exif_ifd = exif.get_ifd(34665)
		exif_details = {
			ExifTags.TAGS.get(tag_id, str(tag_id)): value
			for tag_id, value in exif_ifd.items()
		}
		gps_ifd = exif.get_ifd(34853)
		gps_details = {
			ExifTags.GPSTAGS.get(tag_id, str(tag_id)): value
			for tag_id, value in gps_ifd.items()
		}
		created_at = (
			exif_details.get("DateTimeOriginal")
			or exif_details.get("DateTimeDigitized")
			or exif_values.get("DateTime")
		)

		return {
			"format": image.format,
			"width": image.width,
			"height": image.height,
			"file_size": file_size,
			"created_at": _normalize_datetime(created_at),
			"camera_make": _text_value(exif_values.get("Make")),
			"camera_model": _text_value(exif_values.get("Model")),
			"software": _text_value(exif_values.get("Software")),
			"gps_latitude": _gps_coordinate(
				gps_details.get("GPSLatitude"),
				gps_details.get("GPSLatitudeRef"),
			),
			"gps_longitude": _gps_coordinate(
				gps_details.get("GPSLongitude"),
				gps_details.get("GPSLongitudeRef"),
			),
		}