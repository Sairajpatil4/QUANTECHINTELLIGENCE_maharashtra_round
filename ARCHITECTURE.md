
# TRUSTLAYER — SYSTEM ARCHITECTURE

## 1. Purpose

TrustLayer is an AI-powered digital authenticity and trust investigation system.

The system analyzes available evidence across multiple modalities:

- Image
- Video
- Text
- Audio

Users are NOT required to provide every modality.

TrustLayer should analyze whatever evidence is available and become more powerful when additional independent evidence is provided.

The system does not treat any single detector as a final truth oracle.

Instead:

Evidence → Signals → Evidence Fusion → Cross-Modal Reasoning → Trust Assessment → Explanation

---

# 2. High-Level Architecture

```text
                         USER
                          │
                          ▼
                ┌──────────────────┐
                │    FRONTEND      │
                │ React + Vite     │
                │ Tailwind         │
                │ React Flow       │
                └────────┬─────────┘
                         │ REST API
                         ▼
                ┌──────────────────┐
                │     FASTAPI      │
                │     BACKEND      │
                └────────┬─────────┘
                         │
             ┌───────────┼───────────┐
             │           │           │
             ▼           ▼           ▼
        Image        Video         Text
       Analyzer     Analyzer      Analyzer
             │           │           │
             └───────────┼───────────┘
                         │
                         ▼
                ┌──────────────────┐
                │ STRUCTURED       │
                │ EVIDENCE         │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │ EVIDENCE FUSION  │
                └────────┬─────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │ CROSS-MODAL         │
              │ REASONING           │
              └──────────┬──────────┘
                         │
                         ▼
                ┌──────────────────┐
                │ TRUST ASSESSMENT │
                └────────┬─────────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
       ┌──────────────┐      ┌───────────────┐
       │ EXPLANATION  │      │ EVIDENCE GRAPH│
       └──────────────┘      └───────────────┘
              │                     │
              └──────────┬──────────┘
                         ▼
                ┌──────────────────┐
                │ FRONTEND RESULTS │
                └──────────────────┘
````

---

# 3. Core Design Principle

TrustLayer is an evidence reasoning system, not simply a collection of AI detectors.

Individual models produce signals.

The reasoning layer combines those signals.

The final assessment is generated from the combined evidence.

Therefore:

```text
Detector ≠ Verdict
Signal ≠ Proof
Confidence ≠ Certainty
```

---

# 4. Frontend Layer

Technology:

* React
* Vite
* Tailwind CSS
* React Flow
* Axios
* Lucide React
* Optional Recharts

Responsibilities:

1. Create investigation
2. Add evidence
3. Upload files
4. Display evidence items
5. Trigger analysis
6. Display trust assessment
7. Display confidence
8. Display findings
9. Display limitations
10. Display evidence relationships
11. Display evidence graph

The frontend must not implement AI/ML logic.

The frontend consumes structured API responses.

---

# 5. Backend Layer

Technology:

* Python
* FastAPI
* Pydantic
* SQLite
* Uvicorn
* python-multipart

Responsibilities:

* API routing
* File uploads
* Investigation management
* Evidence management
* Calling modality analyzers
* Calling evidence fusion
* Returning structured results
* Persisting investigation state

The backend should coordinate components rather than contain large ML implementations.

---

# 6. Investigation

An investigation represents one authenticity/trust analysis session.

Example:

```text
Investigation
│
├── Evidence 1 → Image
├── Evidence 2 → Video
├── Evidence 3 → Text
└── Analysis Result
```

Example investigation:

```json
{
  "investigation_id": "inv_001",
  "title": "Social Media Incident",
  "description": "Verify authenticity of submitted evidence",
  "status": "analyzed"
}
```

---

# 7. Evidence Model

Every uploaded item becomes an evidence object.

Example:

```json
{
  "evidence_id": "ev_001",
  "type": "image",
  "filename": "photo.jpg",
  "status": "analyzed"
}
```

After analysis, the evidence contains structured signals.

```json
{
  "evidence_id": "ev_001",
  "type": "image",
  "metadata": {},
  "signals": [],
  "semantic_context": {},
  "limitations": []
}
```

---

# 8. Image Analysis Pipeline

For an image:

```text
Image
 │
 ├── Metadata Analysis
 │
 ├── Image Forensics
 │
 ├── Compression / Resampling Analysis
 │
 ├── Manipulation Indicators
 │
 ├── AI-Generated Image Detection
 │
 └── Visual / Semantic Analysis
 │
 ▼
Structured Image Evidence
```

Possible signals:

* EXIF information
* Camera information
* Software information
* Timestamp
* Compression inconsistencies
* Noise inconsistencies
* Resampling indicators
* Copy-move indicators
* Editing indicators
* AI-generation likelihood
* Object/scene information
* Location hints
* Timestamp hints

Metadata must never automatically be treated as proof of authenticity.

---

# 9. Video Analysis Pipeline

For a video:

```text
Video
 │
 ├── Video Metadata
 │
 ├── Frame Sampling
 │       │
 │       └── Image Analysis
 │
 ├── Temporal Consistency
 │
 ├── Frame-to-Frame Analysis
 │
 ├── Optional Audio Extraction
 │
 └── Semantic Analysis
 │
 ▼
Structured Video Evidence
```

The system does not need to analyze every frame.

Representative frame sampling can be used for the MVP.

Example:

```text
Video
 ↓
Extract metadata
 ↓
Sample frames
 ↓
Analyze representative frames
 ↓
Compare temporal consistency
 ↓
Generate structured evidence
```

---

# 10. Text Analysis Pipeline

Text evidence can be:

* A written claim
* News text
* Social media post
* Caption
* Description
* Transcript
* User-provided context

Pipeline:

```text
Text
 │
 ├── Entity Extraction
 │
 ├── Location Extraction
 │
 ├── Date/Time Extraction
 │
 ├── Claim Extraction
 │
 └── Semantic Analysis
 │
 ▼
Structured Text Evidence
```

Example:

```json
{
  "claims": [
    {
      "text": "The image was taken in Mumbai on Monday.",
      "location": "Mumbai",
      "timestamp_hint": "Monday"
    }
  ]
}
```

---

# 11. Audio Analysis Pipeline

Audio is optional for the first implementation.

Potential pipeline:

```text
Audio
 │
 ├── Metadata
 ├── Speech Detection
 ├── Transcription
 ├── Speaker/Voice Signals
 └── Temporal Analysis
 │
 ▼
Structured Audio Evidence
```

Audio should not block the main MVP.

---

# 12. Structured Evidence Layer

All modality analyzers must produce a common evidence structure.

Example:

```json
{
  "evidence_id": "ev_001",
  "type": "image",
  "metadata": {},
  "signals": [
    {
      "name": "compression_inconsistency",
      "severity": "medium",
      "confidence": 0.78
    }
  ],
  "semantic_context": {
    "objects": [],
    "scene": "",
    "location_hint": null,
    "timestamp_hint": null
  },
  "limitations": []
}
```

This common format allows different analyzers to communicate with the fusion layer.

---

# 13. Evidence Fusion

Evidence Fusion is responsible for combining signals from different analyzers.

Input:

```text
Image Evidence
Video Evidence
Text Evidence
Audio Evidence
```

Output:

```text
Unified Evidence State
```

Example:

```text
Image:
AI-generation likelihood = 0.82

Image:
Compression inconsistency = 0.78

Text:
Claimed location = Mumbai

Image:
Location hint = Delhi

        ↓

Evidence Fusion

        ↓

Potential cross-modal inconsistency
```

Fusion must preserve the original evidence.

It should not destroy the source signals.

---

# 14. Cross-Modal Reasoning

Cross-modal reasoning compares evidence items.

Examples:

```text
Image ↔ Text
Location conflict
```

```text
Image ↔ Video
Visual similarity
```

```text
Video ↔ Text
Timestamp conflict
```

```text
Audio ↔ Video
Audio/video synchronization inconsistency
```

Relationships should contain:

* Source evidence
* Target evidence
* Relationship type
* Confidence
* Explanation

Example:

```json
{
  "source": "img_01",
  "target": "txt_01",
  "relationship": "location_conflict",
  "confidence": 0.76,
  "explanation": "Image visual context suggests a different location than the supplied claim."
}
```

---

# 15. Trust Assessment

The final assessment is produced after evidence fusion and reasoning.

Possible assessment categories:

```text
potential_concern
inconclusive
no_significant_manipulation_signals
high_concern
```

The system must not claim absolute certainty.

Example:

```json
{
  "assessment": "potential_concern",
  "confidence": 0.82,
  "summary": "Multiple evidence signals indicate potential inconsistency."
}
```

---

# 16. Confidence

Confidence represents the system's confidence in its assessment based on available evidence.

It is NOT:

```text
Probability that the content is definitely fake.
```

Instead it represents:

```text
How strongly the available evidence supports the assessment.
```

The system should expose uncertainty when evidence is:

* Missing
* Conflicting
* Weak
* Incomplete
* Low quality

---

# 17. Limitations

Every analysis should communicate relevant limitations.

Examples:

```text
No independent cross-source evidence was provided.
```

```text
Metadata was unavailable.
```

```text
Only sampled video frames were analyzed.
```

```text
AI-generation detectors can produce false positives and false negatives.
```

```text
Visual similarity does not prove that two media files originated from the same source.
```

Limitations are part of the result, not an afterthought.

---

# 18. Evidence Graph

The Evidence Graph represents relationships between evidence items.

Example:

```text
        ┌─────────────┐
        │   IMAGE     │
        └──────┬──────┘
               │
       visual_similarity
               │
               ▼
        ┌─────────────┐
        │   VIDEO     │
        └─────────────┘

        IMAGE
          │
    location_conflict
          │
          ▼
        TEXT
```

Graph nodes represent evidence.

Graph edges represent relationships.

Example:

```json
{
  "nodes": [
    {
      "id": "img1",
      "type": "image"
    },
    {
      "id": "vid1",
      "type": "video"
    },
    {
      "id": "txt1",
      "type": "text"
    }
  ],
  "edges": [
    {
      "source": "img1",
      "target": "vid1",
      "relationship": "visual_similarity",
      "confidence": 0.89
    },
    {
      "source": "img1",
      "target": "txt1",
      "relationship": "location_conflict",
      "confidence": 0.76
    }
  ]
}
```

React Flow will visualize this graph.

---

# 19. End-to-End Request Flow

## Step 1 — Create Investigation

```http
POST /investigations
```

Backend creates:

```text
investigation_id
```

---

## Step 2 — Upload Evidence

```http
POST /investigations/{id}/evidence
```

Example:

```text
Image uploaded
        ↓
Evidence ID created
        ↓
File stored
```

---

## Step 3 — Analyze Investigation

```http
POST /investigations/{id}/analyze
```

Backend determines available evidence types.

Example:

```text
Image available
Video available
Text unavailable
Audio unavailable
```

Only available analyzers are executed.

---

# 20. Partial Evidence Principle

The system must work even when only one modality is provided.

Example:

```text
IMAGE ONLY
```

The system performs:

```text
Metadata
↓
Forensics
↓
AI-generation analysis
↓
Semantic analysis
↓
Evidence Fusion
↓
Trust Assessment
```

Then explicitly states:

```text
Cross-modal verification unavailable because only one evidence source was provided.
```

This is an important product behavior.

---

# 21. Multi-Evidence Flow

If multiple evidence types exist:

```text
                 ┌── Image Analyzer ──┐
                 │                    │
                 ├── Video Analyzer ──┤
                 │                    │
Evidence ────────┼── Text Analyzer ───┼──→ Evidence Fusion
                 │                    │
                 └── Audio Analyzer ──┘
                                          │
                                          ▼
                                 Cross-Modal Reasoning
                                          │
                                          ▼
                                    Trust Assessment
                                          │
                           ┌──────────────┴──────────────┐
                           ▼                             ▼
                      Explanation                  Evidence Graph
```

---

# 22. API Architecture

Core endpoints:

```text
POST   /investigations
POST   /investigations/{id}/evidence
POST   /investigations/{id}/analyze
GET    /investigations/{id}
GET    /investigations/{id}/results
```

Additional endpoints may be added only when required.

Avoid unnecessary API complexity.

---

# 23. Database Architecture

MVP database:

```text
SQLite
```

Possible tables:

```text
investigations
evidence
analysis_results
```

Conceptual relationships:

```text
investigations
      │
      ├── evidence
      │      │
      │      └── analysis signals
      │
      └── final analysis result
```

A separate vector database is NOT required for the MVP.

---

# 24. File Storage

Uploaded files are stored locally during development.

Example:

```text
backend/
└── uploads/
    ├── investigation_001/
    │   ├── image_001.jpg
    │   └── video_001.mp4
```

Do not commit uploaded evidence to Git.

---

# 25. Error Handling

The API should return structured errors.

Example:

```json
{
  "error": "unsupported_file_type",
  "message": "The uploaded file type is not supported."
}
```

Possible errors:

```text
unsupported_file_type
file_too_large
invalid_investigation
analysis_failed
missing_file
invalid_request
```

The frontend should display useful human-readable messages.

---

# 26. Processing Status

Long-running analysis should expose status.

Possible states:

```text
uploaded
queued
processing
completed
failed
```

Example:

```json
{
  "evidence_id": "ev_001",
  "status": "processing"
}
```

The UI can display:

```text
Analyzing evidence...
```

and then show results after completion.

---

# 27. LLM / VLM Usage

LLMs or VLMs may be used for:

* Semantic interpretation
* Explanation generation
* Claim extraction
* Cross-modal reasoning
* Natural-language reporting

They should NOT be treated as the sole authenticity detector.

Preferred architecture:

```text
Specialized Analysis
        ↓
Structured Evidence
        ↓
Reasoning Model
        ↓
Explanation
```

Not:

```text
File
 ↓
LLM
 ↓
"Fake"
```

---

# 28. Model-Agnostic Design

The architecture must allow models to be replaced.

For example:

```text
Image Analyzer
     ↓
Model A
```

can later become:

```text
Image Analyzer
     ↓
Model B
```

without changing the entire application.

Therefore analyzers should expose stable structured outputs.

---

# 29. Security Considerations

For the hackathon MVP:

* Validate file types
* Restrict file size
* Sanitize filenames
* Never execute uploaded files
* Store uploads outside frontend source
* Do not commit secrets
* Do not expose API keys
* Validate API inputs

Authentication is not required for the MVP unless specifically needed.

---

# 30. Performance Strategy

Prioritize:

```text
Correctness
↓
Working vertical slice
↓
Reasonable response time
↓
UI polish
```

Do not prematurely optimize.

For videos:

* Sample frames
* Avoid processing every frame
* Use bounded file sizes
* Run expensive models only when needed

---

# 31. MVP Architecture Boundary

The MVP includes:

```text
React frontend
FastAPI backend
SQLite
Image analysis
Video analysis
Text analysis
Evidence fusion
Cross-modal reasoning
Trust assessment
Explanation
Evidence graph
```

Optional:

```text
Audio analysis
Advanced metadata
Deployment
Advanced visualizations
```

---

# 32. Things We Are Explicitly NOT Building

Do not introduce these unless there is a clear hackathon-critical reason:

* Kubernetes
* Microservice architecture
* Blockchain
* Vector database
* Complex authentication
* Agent swarm
* Multi-agent orchestration
* Custom foundation model
* Large-scale model training
* Complex RAG pipeline
* Distributed message queues
* Enterprise cloud architecture

The goal is a working, demonstrable system.

---

# 33. Development Sequence

The team should implement in this order:

```text
1. Shared contracts
        ↓
2. Backend skeleton
        ↓
3. Frontend skeleton
        ↓
4. Image analysis
        ↓
5. Image end-to-end flow
        ↓
6. Video analysis
        ↓
7. Text analysis
        ↓
8. Evidence fusion
        ↓
9. Cross-modal reasoning
        ↓
10. Evidence graph
        ↓
11. UI polish
        ↓
12. Demo preparation
```

The first milestone is NOT "build every detector."

The first milestone is:

```text
Upload Image
      ↓
Analyze
      ↓
Structured Evidence
      ↓
Assessment
      ↓
Explanation
      ↓
Display Result
```

---

# 34. Definition of Done

The MVP is considered functional when:

* User can create an investigation
* User can upload an image
* User can upload a video
* User can provide text evidence
* Evidence receives an ID
* Analysis can be triggered
* Structured evidence is produced
* Evidence signals are displayed
* Trust assessment is displayed
* Confidence is displayed
* Limitations are displayed
* Cross-modal relationships can be shown
* Evidence Graph can be displayed
* The complete flow can be demonstrated without manually editing database records

---

# 35. Architecture Principle

The most important architecture principle is:

```text
ANALYZE → STRUCTURE → FUSE → REASON → EXPLAIN
```

Not:

```text
UPLOAD → BLACK BOX → FAKE/REAL
```

TrustLayer should demonstrate that digital authenticity is an evidence reasoning problem rather than a single-model classification problem.

````

### 2. Save it

In VS Code:

**Ctrl + S**

Then don't modify anything else in this file yet.

### 3. Your documentation stack is now

You should have:

```text
MASTER_CONTEXT.md    ← What the project is + team rules
ARCHITECTURE.md      ← How the system works
API_CONTRACT.md      ← How components communicate
DEMO_SCENARIO.md     ← What we show judges
README.md            ← Public project overview
````

