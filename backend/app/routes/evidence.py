import re
from contextlib import closing
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath, PureWindowsPath
from uuid import uuid4

from fastapi import APIRouter, File, Form, UploadFile

from app.database import UPLOADS_DIR, get_connection
from app.errors import APIError
from app.schemas.evidence import EvidenceUploadResponse


router = APIRouter(prefix="/investigations", tags=["Evidence"])
MAX_UPLOAD_SIZE = 25 * 1024 * 1024
ALLOWED_EVIDENCE_TYPES = {"image", "video", "text", "audio"}


def _safe_filename(filename: str) -> str:
	name = PureWindowsPath(PurePosixPath(filename.replace("\\", "/")).name).name
	name = re.sub(r"[^A-Za-z0-9._-]", "_", name).lstrip(".")
	return name[:180] or "upload.bin"


@router.post(
	"/{investigation_id}/evidence",
	response_model=EvidenceUploadResponse,
	status_code=201,
)
async def upload_evidence(
	investigation_id: str,
	file: UploadFile = File(...),
	evidence_type: str = Form(..., alias="type"),
) -> EvidenceUploadResponse:
	if not file.filename:
		raise APIError(400, "missing_file", "A file must be selected for upload.")
	if evidence_type not in {"image", "video", "text", "audio"}:
		raise APIError(
			400,
			"unsupported_file_type",
			"Evidence type must be image, video, text, or audio.",
		)

	with closing(get_connection()) as connection:
		investigation = connection.execute(
			"SELECT 1 FROM investigations WHERE investigation_id = ?",
			(investigation_id,),
		).fetchone()
	if investigation is None:
		raise APIError(404, "invalid_investigation", "Investigation not found.")

	evidence_id = f"ev_{uuid4().hex}"
	filename = _safe_filename(file.filename)
	storage_root = UPLOADS_DIR.resolve()
	investigation_dir = (storage_root / investigation_id).resolve()
	try:
		investigation_dir.relative_to(storage_root)
	except ValueError as exception:
		raise APIError(400, "invalid_request", "Invalid investigation identifier.") from exception

	try:
		investigation_dir.mkdir(parents=True, exist_ok=True)
		stored_path = (investigation_dir / f"{evidence_id}_{filename}").resolve()
		stored_path.relative_to(investigation_dir)
	except (OSError, ValueError) as exception:
		raise APIError(500, "internal_error", "The uploaded file could not be stored.") from exception

	file_size = 0
	too_large = False
	try:
		with stored_path.open("wb") as destination:
			while chunk := await file.read(1024 * 1024):
				file_size += len(chunk)
				if file_size > MAX_UPLOAD_SIZE:
					too_large = True
					break
				destination.write(chunk)
		if too_large:
			stored_path.unlink(missing_ok=True)
			raise APIError(
				413,
				"file_too_large",
				"Uploaded files must be 25 MB or smaller.",
			)
	except APIError:
		raise
	except OSError as exception:
		stored_path.unlink(missing_ok=True)
		raise APIError(500, "internal_error", "The uploaded file could not be stored.") from exception
	finally:
		await file.close()

	created_at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
	try:
		with closing(get_connection()) as connection:
			connection.execute(
				"""
				INSERT INTO evidence (
					evidence_id, investigation_id, type, filename, file_path,
					status, created_at, file_size, content_type
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
				""",
				(
					evidence_id,
					investigation_id,
					evidence_type,
					filename,
					str(stored_path),
					"uploaded",
					created_at,
					file_size,
					file.content_type,
				),
			)
			connection.commit()
	except Exception as exception:
		stored_path.unlink(missing_ok=True)
		raise APIError(500, "internal_error", "The uploaded file could not be recorded.") from exception

	return EvidenceUploadResponse(
		evidence_id=evidence_id,
		investigation_id=investigation_id,
		type=evidence_type,
		filename=filename,
		status="uploaded",
	)
