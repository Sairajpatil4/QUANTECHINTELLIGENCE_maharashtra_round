from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


InvestigationStatus = Literal["created", "processing", "completed", "failed"]


class InvestigationCreate(BaseModel):
	model_config = ConfigDict(str_strip_whitespace=True)

	title: str = Field(min_length=1, max_length=200)
	description: str | None = Field(default=None, max_length=5000)

	@field_validator("title")
	@classmethod
	def title_must_not_be_blank(cls, value: str) -> str:
		if not value:
			raise ValueError("Title must not be blank.")
		return value


class InvestigationResponse(BaseModel):
	investigation_id: str
	title: str
	description: str | None
	status: InvestigationStatus


class InvestigationDetailResponse(InvestigationResponse):
	evidence_count: int
