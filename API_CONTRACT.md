Next: **`API_CONTRACT.md`**. This is the most important coordination file after the architecture because it defines exactly what **Ayush's backend, Sairaj's analyzers, your fusion layer, and Jackson's frontend** exchange.

Open `API_CONTRACT.md`, replace everything, and paste this:

````markdown
# TRUSTLAYER — API CONTRACT

## 1. Purpose

This document defines the communication contract between:

- Frontend
- FastAPI Backend
- Modality Analyzers
- Evidence Fusion
- Cross-Modal Reasoning
- Trust Assessment
- Evidence Graph

All team members must follow these schemas.

Do not independently rename fields or change response structures without updating this document.

---

# 2. Base API

Development base URL:

```text
http://localhost:8000
````

API prefix:

```text
/api
```

Example:

```text
http://localhost:8000/api/investigations
```

---

# 3. Standard Response Principles

Successful responses should return JSON.

Errors should return:

```json
{
  "error": "error_code",
  "message": "Human-readable explanation"
}
```

Do not return raw Python exceptions to the frontend.

---

# 4. Investigation Object

An investigation represents one authenticity analysis session.

Example:

```json
{
  "investigation_id": "inv_001",
  "title": "Social Media Incident",
  "description": "Verify authenticity of submitted evidence",
  "status": "created",
  "created_at": "2026-10-03T12:00:00Z"
}
```

Fields:

| Field            | Type        | Required |
| ---------------- | ----------- | -------- |
| investigation_id | string      | yes      |
| title            | string      | yes      |
| description      | string/null | no       |
| status           | string      | yes      |
| created_at       | string      | yes      |

Possible status values:

```text
created
processing
completed
failed
```

---

# 5. Create Investigation

## Endpoint

```http
POST /api/investigations
```

## Request

```json
{
  "title": "Social Media Incident",
  "description": "Verify authenticity of submitted evidence"
}
```

## Response

```json
{
  "investigation_id": "inv_001",
  "title": "Social Media Incident",
  "description": "Verify authenticity of submitted evidence",
  "status": "created"
}
```

---

# 6. Upload Evidence

## Endpoint

```http
POST /api/investigations/{investigation_id}/evidence
```

Use `multipart/form-data`.

Fields:

```text
file
type
```

Example:

```text
file = image.jpg
type = image
```

Supported types:

```text
image
video
text
audio
```

---

# 7. Upload Evidence Response

Example:

```json
{
  "evidence_id": "ev_001",
  "investigation_id": "inv_001",
  "type": "image",
  "filename": "image.jpg",
  "status": "uploaded"
}
```

Possible evidence statuses:

```text
uploaded
processing
completed
failed
```

---

# 8. Evidence Object

Every uploaded item must eventually be represented using a common structure.

```json
{
  "evidence_id": "ev_001",
  "type": "image",
  "filename": "image.jpg",
  "metadata": {},
  "signals": [],
  "semantic_context": {},
  "limitations": []
}
```

---

# 9. Evidence Types

Allowed values:

```text
image
video
text
audio
```

Do not introduce alternative values such as:

```text
img
vid
txt
sound
```

Use the standard values.

---

# 10. Evidence Metadata

Metadata is optional.

Example:

```json
{
  "filename": "image.jpg",
  "format": "JPEG",
  "width": 1920,
  "height": 1080,
  "file_size": 245678,
  "created_at": null,
  "camera_make": null,
  "camera_model": null,
  "software": null
}
```

Metadata must not automatically be interpreted as proof of authenticity.

---

# 11. Evidence Signals

All modality analyzers produce signals.

Schema:

```json
{
  "name": "compression_inconsistency",
  "severity": "medium",
  "confidence": 0.78,
  "description": "Local compression characteristics differ from surrounding regions."
}
```

Required fields:

```text
name
severity
confidence
```

Optional:

```text
description
```

---

# 12. Signal Severity

Allowed values:

```text
low
medium
high
```

Severity describes the strength/relevance of a signal.

It is NOT the final authenticity verdict.

---

# 13. Signal Confidence

Confidence must be represented as a decimal between:

```text
0.0
```

and

```text
1.0
```

Example:

```json
{
  "confidence": 0.82
}
```

Do not send:

```json
{
  "confidence": 82
}
```

unless the API contract is explicitly changed to percentages.

---

# 14. Semantic Context

Semantic analysis can populate:

```json
{
  "objects": [
    "car",
    "building",
    "person"
  ],
  "scene": "urban street",
  "location_hint": "Mumbai",
  "timestamp_hint": null,
  "entities": []
}
```

All fields are optional.

---

# 15. Limitations

Each analyzer should report limitations.

Example:

```json
{
  "limitations": [
    "Metadata was unavailable.",
    "Only sampled video frames were analyzed."
  ]
}
```

Limitations should be human-readable.

---

# 16. Complete Image Evidence Example

```json
{
  "evidence_id": "ev_img_001",
  "type": "image",
  "filename": "photo.jpg",
  "metadata": {
    "format": "JPEG",
    "width": 1920,
    "height": 1080,
    "software": "Unknown"
  },
  "signals": [
    {
      "name": "compression_inconsistency",
      "severity": "medium",
      "confidence": 0.78,
      "description": "Local compression characteristics differ from surrounding regions."
    },
    {
      "name": "ai_generation_likelihood",
      "severity": "high",
      "confidence": 0.82,
      "description": "The detector identified patterns associated with AI-generated imagery."
    }
  ],
  "semantic_context": {
    "objects": [
      "person",
      "vehicle"
    ],
    "scene": "urban street",
    "location_hint": null,
    "timestamp_hint": null,
    "entities": []
  },
  "limitations": [
    "No independent source image was provided."
  ]
}
```

---

# 17. Complete Video Evidence Example

```json
{
  "evidence_id": "ev_vid_001",
  "type": "video",
  "filename": "incident.mp4",
  "metadata": {
    "format": "MP4",
    "duration_seconds": 24.5,
    "width": 1920,
    "height": 1080,
    "fps": 30
  },
  "signals": [
    {
      "name": "temporal_inconsistency",
      "severity": "medium",
      "confidence": 0.71,
      "description": "Some sampled frames show temporal inconsistencies."
    }
  ],
  "semantic_context": {
    "objects": [
      "person",
      "vehicle"
    ],
    "scene": "road",
    "location_hint": null,
    "timestamp_hint": null,
    "entities": []
  },
  "limitations": [
    "Analysis was performed on sampled frames rather than every frame."
  ]
}
```

---

# 18. Complete Text Evidence Example

```json
{
  "evidence_id": "ev_txt_001",
  "type": "text",
  "filename": null,
  "metadata": {},
  "signals": [],
  "semantic_context": {
    "objects": [],
    "scene": "",
    "location_hint": "Mumbai",
    "timestamp_hint": "2026-10-02",
    "entities": [
      "Mumbai"
    ],
    "claims": [
      {
        "text": "The image was taken in Mumbai on October 2.",
        "location": "Mumbai",
        "timestamp": "2026-10-02"
      }
    ]
  },
  "limitations": []
}
```

---

# 19. Analyze Investigation

## Endpoint

```http
POST /api/investigations/{investigation_id}/analyze
```

The backend should:

1. Retrieve investigation evidence.
2. Identify available modalities.
3. Run relevant analyzers.
4. Collect structured evidence.
5. Run evidence fusion.
6. Run cross-modal reasoning when possible.
7. Generate trust assessment.
8. Generate explanations.
9. Generate evidence graph.
10. Return the final result.

---

# 20. Analysis Response

Example:

```json
{
  "investigation_id": "inv_001",
  "status": "completed",
  "assessment": {
    "label": "potential_concern",
    "confidence": 0.82,
    "summary": "Multiple evidence signals indicate potential inconsistency."
  },
  "evidence": [],
  "findings": [],
  "limitations": [],
  "evidence_graph": {
    "nodes": [],
    "edges": []
  }
}
```

---

# 21. Trust Assessment

The assessment object:

```json
{
  "label": "potential_concern",
  "confidence": 0.82,
  "summary": "Multiple evidence signals indicate potential inconsistency."
}
```

Allowed labels:

```text
potential_concern
inconclusive
no_significant_manipulation_signals
high_concern
```

The system should not use:

```text
definitely_fake
definitely_real
100_percent_fake
100_percent_real
```

---

# 22. Findings

Findings explain why the system reached an assessment.

Example:

```json
{
  "type": "cross_modal_conflict",
  "evidence": [
    "ev_img_001",
    "ev_txt_001"
  ],
  "explanation": "The image context and supplied location claim are inconsistent.",
  "confidence": 0.76
}
```

Possible finding types:

```text
manipulation_signal
metadata_anomaly
ai_generation_signal
cross_modal_conflict
visual_similarity
temporal_inconsistency
semantic_conflict
```

Additional types may be added when required.

---

# 23. Cross-Modal Finding

Cross-modal findings must reference the evidence involved.

Example:

```json
{
  "type": "cross_modal_conflict",
  "evidence": [
    "ev_img_001",
    "ev_txt_001"
  ],
  "explanation": "The visual location context conflicts with the location stated in the text evidence.",
  "confidence": 0.76
}
```

This allows the frontend to highlight the relevant evidence items.

---

# 24. Evidence Graph Contract

Graph structure:

```json
{
  "nodes": [
    {
      "id": "ev_img_001",
      "type": "image",
      "label": "photo.jpg"
    },
    {
      "id": "ev_txt_001",
      "type": "text",
      "label": "Claim"
    }
  ],
  "edges": [
    {
      "source": "ev_img_001",
      "target": "ev_txt_001",
      "relationship": "location_conflict",
      "confidence": 0.76,
      "explanation": "The evidence suggests different locations."
    }
  ]
}
```

---

# 25. Evidence Graph Relationships

Initial supported relationships:

```text
visual_similarity
location_conflict
timestamp_conflict
semantic_conflict
audio_video_inconsistency
supports
contradicts
```

Do not create relationships without evidence supporting them.

---

# 26. Single Evidence Behavior

If only one evidence item exists:

```text
Image
```

The system must still analyze it.

Example flow:

```text
Image
 ↓
Image Analysis
 ↓
Evidence Fusion
 ↓
Trust Assessment
 ↓
Explanation
```

The result should mention that cross-modal verification was unavailable.

Example limitation:

```text
Cross-modal verification was unavailable because only one evidence source was provided.
```

---

# 27. Multiple Evidence Behavior

If multiple evidence items exist:

```text
Image
Video
Text
```

The system should perform:

```text
Individual Analysis
        ↓
Evidence Fusion
        ↓
Cross-Modal Reasoning
        ↓
Relationships
        ↓
Trust Assessment
```

---

# 28. Get Investigation

## Endpoint

```http
GET /api/investigations/{investigation_id}
```

Response:

```json
{
  "investigation_id": "inv_001",
  "title": "Social Media Incident",
  "description": "Verify authenticity of submitted evidence",
  "status": "completed",
  "evidence_count": 2
}
```

---

# 29. Get Results

## Endpoint

```http
GET /api/investigations/{investigation_id}/results
```

Response:

```json
{
  "investigation_id": "inv_001",
  "status": "completed",
  "assessment": {},
  "evidence": [],
  "findings": [],
  "limitations": [],
  "evidence_graph": {
    "nodes": [],
    "edges": []
  }
}
```

---

# 30. Frontend → Backend Contract

The frontend is responsible for:

```text
Create Investigation
Upload Evidence
Trigger Analysis
Retrieve Results
Display Results
```

The frontend should NOT:

* Run ML models
* Calculate authenticity scores
* Modify evidence signals
* Generate final assessments
* Invent confidence values

The frontend displays backend results.

---

# 31. Backend → Analyzer Contract

The backend provides an analyzer with:

```text
evidence_id
file_path
evidence_type
```

Example conceptual call:

```python
analyze_image(
    evidence_id="ev_001",
    file_path="uploads/photo.jpg"
)
```

The analyzer returns:

```text
Structured Evidence
```

---

# 32. Analyzer → Fusion Contract

Every analyzer must return the common Evidence schema.

Example:

```text
Image Analyzer
      ↓
Evidence Object

Video Analyzer
      ↓
Evidence Object

Text Analyzer
      ↓
Evidence Object

Audio Analyzer
      ↓
Evidence Object
```

The fusion engine should not depend on internal model implementation.

---

# 33. Fusion → Assessment Contract

Fusion produces:

```json
{
  "evidence": [],
  "cross_modal_findings": [],
  "conflicts": [],
  "supporting_signals": []
}
```

Assessment consumes this structured information.

Assessment produces:

```json
{
  "label": "potential_concern",
  "confidence": 0.82,
  "summary": "Multiple evidence signals indicate potential inconsistency."
}
```

---

# 34. Assessment → Explanation Contract

The explanation layer receives:

```text
Assessment
Evidence
Signals
Findings
Limitations
```

It produces human-readable explanations.

Example:

```json
{
  "summary": "Several signals require further verification.",
  "key_reasons": [
    "Compression inconsistency detected.",
    "AI-generation detector reported elevated likelihood.",
    "No independent source was provided."
  ]
}
```

---

# 35. Do Not Break the Contract

Before changing:

* Field names
* Data types
* Endpoint names
* Assessment labels
* Evidence types
* Signal structure

the developer must update:

```text
API_CONTRACT.md
```

and notify the team.

---

# 36. Mock Data Requirement

Frontend development must NOT wait for the backend.

Jackson can use mock responses matching this contract.

Example:

```json
{
  "investigation_id": "inv_demo",
  "status": "completed",
  "assessment": {
    "label": "potential_concern",
    "confidence": 0.82,
    "summary": "Multiple evidence signals indicate potential inconsistency."
  },
  "evidence": [
    {
      "evidence_id": "ev_img_001",
      "type": "image",
      "filename": "incident.jpg"
    }
  ],
  "findings": [],
  "limitations": [
    "No independent source image was provided."
  ],
  "evidence_graph": {
    "nodes": [],
    "edges": []
  }
}
```

This allows frontend and backend development to happen in parallel.

---

# 37. Contract Ownership

### Ayush — Backend

Owns:

* API endpoints
* Request validation
* File uploads
* Investigation persistence
* API responses
* Backend integration

### Sairaj — Image/Video Analysis

Owns:

* Image analyzer
* Video analyzer
* Model outputs
* Structured evidence generation

Must return the agreed Evidence schema.

### Deven — Fusion & Reasoning

Owns:

* Evidence Fusion
* Cross-modal reasoning
* Trust Assessment
* Findings
* Evidence Graph data
* Final result structure

### Jackson — Frontend

Owns:

* Upload UI
* Investigation UI
* Results UI
* Evidence cards
* Trust assessment display
* Evidence graph visualization

Frontend follows this API contract.

---

# 38. Golden Rule

The system must always preserve this flow:

```text
RAW EVIDENCE
     ↓
MODALITY ANALYSIS
     ↓
STRUCTURED EVIDENCE
     ↓
EVIDENCE FUSION
     ↓
CROSS-MODAL REASONING
     ↓
TRUST ASSESSMENT
     ↓
EXPLANATION
     ↓
EVIDENCE GRAPH
```

No component should skip directly from raw input to an unsupported final verdict.

````

