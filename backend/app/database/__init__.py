import sqlite3
from contextlib import closing
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[2]
DATABASE_PATH = BACKEND_DIR / "trustlayer.db"
UPLOADS_DIR = BACKEND_DIR / "uploads"


def get_connection() -> sqlite3.Connection:
	connection = sqlite3.connect(DATABASE_PATH, timeout=30)
	connection.row_factory = sqlite3.Row
	connection.execute("PRAGMA foreign_keys = ON")
	return connection


def initialize_database() -> None:
	UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
	with closing(get_connection()) as connection:
		connection.executescript(
			"""
			CREATE TABLE IF NOT EXISTS investigations (
				investigation_id TEXT PRIMARY KEY,
				title TEXT NOT NULL,
				description TEXT,
				status TEXT NOT NULL CHECK (
					status IN ('created', 'processing', 'completed', 'failed')
				),
				created_at TEXT NOT NULL
			);

			CREATE TABLE IF NOT EXISTS evidence (
				evidence_id TEXT PRIMARY KEY,
				investigation_id TEXT NOT NULL,
				type TEXT NOT NULL CHECK (type IN ('image', 'video', 'text', 'audio')),
				filename TEXT NOT NULL,
				file_path TEXT NOT NULL,
				status TEXT NOT NULL CHECK (
					status IN ('uploaded', 'processing', 'completed', 'failed')
				),
				created_at TEXT NOT NULL,
				file_size INTEGER NOT NULL,
				content_type TEXT,
				FOREIGN KEY (investigation_id)
					REFERENCES investigations (investigation_id) ON DELETE CASCADE
			);

			CREATE INDEX IF NOT EXISTS idx_evidence_investigation
				ON evidence (investigation_id);

			CREATE TABLE IF NOT EXISTS analysis_results (
				investigation_id TEXT PRIMARY KEY,
				status TEXT NOT NULL CHECK (status IN ('completed', 'failed')),
				result_json TEXT NOT NULL,
				created_at TEXT NOT NULL,
				updated_at TEXT NOT NULL,
				FOREIGN KEY (investigation_id)
					REFERENCES investigations (investigation_id) ON DELETE CASCADE
			);
			"""
		)
		connection.commit()
