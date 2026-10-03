from contextlib import closing
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter

from app.database import get_connection
from app.errors import APIError
from app.schemas.investigation import (
	InvestigationCreate,
	InvestigationDetailResponse,
	InvestigationResponse,
)


router = APIRouter(prefix="/investigations", tags=["Investigations"])


@router.post("", response_model=InvestigationResponse)
def create_investigation(
	investigation: InvestigationCreate,
) -> InvestigationResponse:
	investigation_id = f"inv_{uuid4().hex}"
	created_at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
	status = "created"

	with closing(get_connection()) as connection:
		connection.execute(
			"""
			INSERT INTO investigations (
				investigation_id, title, description, status, created_at
			) VALUES (?, ?, ?, ?, ?)
			""",
			(
				investigation_id,
				investigation.title,
				investigation.description,
				status,
				created_at,
			),
		)
		connection.commit()

	return InvestigationResponse(
		investigation_id=investigation_id,
		title=investigation.title,
		description=investigation.description,
		status=status,
	)


@router.get("/{investigation_id}", response_model=InvestigationDetailResponse)
def get_investigation(investigation_id: str) -> InvestigationDetailResponse:
	with closing(get_connection()) as connection:
		investigation = connection.execute(
			"""
			SELECT i.investigation_id, i.title, i.description, i.status,
				COUNT(e.evidence_id) AS evidence_count
			FROM investigations AS i
			LEFT JOIN evidence AS e ON e.investigation_id = i.investigation_id
			WHERE i.investigation_id = ?
			GROUP BY i.investigation_id
			""",
			(investigation_id,),
		).fetchone()

	if investigation is None:
		raise APIError(404, "invalid_investigation", "Investigation not found.")

	return InvestigationDetailResponse(
		investigation_id=investigation["investigation_id"],
		title=investigation["title"],
		description=investigation["description"],
		status=investigation["status"],
		evidence_count=investigation["evidence_count"],
	)
