
# TRUSTLAYER — MASTER PROJECT CONTEXT

## 1. Project Identity

**Project Name:** TrustLayer  
**Hackathon Track:** AI/ML  
**Problem Statement:** PS1 — AI-Powered Digital Authenticity and Trust  
**Team Size:** 4  
**Project Type:** Multimodal digital authenticity and evidence investigation system

TrustLayer is an evidence-adaptive AI investigation workspace that analyzes digital content and determines whether the available evidence contains signals of manipulation, inconsistency, or authenticity concerns.

The system does NOT treat a single AI model as an absolute truth oracle.

Instead, it:

- extracts evidence from uploaded content
- analyzes modality-specific signals
- combines heterogeneous evidence
- identifies conflicts and inconsistencies
- provides an uncertainty-aware assessment
- explains why the assessment was produced
- explicitly communicates limitations and missing evidence

---

## 2. Core Product Philosophy

### "Upload whatever evidence you have."

Users do NOT have to upload every modality.

Supported evidence types:

- Image
- Video
- Text
- Audio

Examples:

### Single Image

TrustLayer can perform:

- Metadata/EXIF analysis
- Image forensic analysis
- Compression/resampling analysis
- Pixel-level manipulation indicators
- AI-generation detection
- Visual/semantic analysis

It then produces an uncertainty-aware assessment.

The system must NOT say:

> "This image is definitely fake."

Instead, it should communicate findings such as:

> "Potential manipulation concern detected."

along with:

- confidence
- supporting signals
- explanation
- limitations

---

### Single Video

TrustLayer can analyze:

- Video metadata
- Sampled frames
- Frame-level visual signals
- Temporal consistency
- Scene consistency
- Optional audio/transcript information

The system produces evidence and an uncertainty-aware assessment.

---

### Image + Text

TrustLayer can compare:

- visual content
- textual claims
- location hints
- timestamps
- entities
- semantic descriptions

Example:

Image indicates one location while accompanying text claims another.

This becomes a cross-modal conflict.

---

### Multiple Evidence Items

TrustLayer combines evidence from multiple independent sources.

Example:

Image + Video + Text

The system can determine relationships such as:

- visual similarity
- timestamp conflict
- location conflict
- semantic agreement
- semantic contradiction

---

# 3. Important Concept: Evidence ≠ Verdict

Individual analyzers must NOT directly decide whether content is fake.

BAD:

```json
{
  "fake": true
}
````

GOOD:

```json
{
  "signals": [
    {
      "name": "compression_inconsistency",
      "severity": "medium",
      "confidence": 0.78
    }
  ]
}
```

Analyzers produce structured evidence.

The Evidence Fusion layer combines those signals.

The final Trust Assessment layer produces the overall assessment.

---

# 4. Authenticity vs Claim Verification

These are different concepts.

### Authenticity

Question:

> "Does the digital content show signs of manipulation or synthetic generation?"

### Claim Verification

Question:

> "Does the content support the claim being made about it?"

An authentic photograph can still be used with misleading text or context.

Therefore, TrustLayer must distinguish between:

* manipulation evidence
* synthetic-generation evidence
* metadata evidence
* semantic evidence
* cross-modal conflicts
* contextual limitations

---

# 5. Core Architecture

```text
                    FRONTEND
          React + Vite + Tailwind
                    |
                    | REST API
                    v
                  FASTAPI
                    |
        +-----------+-----------+
        |           |           |
        v           v           v
      IMAGE       VIDEO       TEXT
     ANALYZER    ANALYZER    ANALYZER
        |           |           |
        +-----------+-----------+
                    |
                    v
              STRUCTURED
                EVIDENCE
                    |
                    v
             EVIDENCE FUSION
                    |
                    v
          CROSS-MODAL REASONING
                    |
                    v
             TRUST ASSESSMENT
                    |
          +---------+---------+
          |                   |
          v                   v
     EXPLANATION         EVIDENCE GRAPH
          |                   |
          +---------+---------+
                    |
                    v
                 FRONTEND
```

Audio is supported by the architecture but is a lower implementation priority than Image, Video and Text.

---

# 6. Team Responsibilities

## Deven

### Role:

AI/ML + Evidence Fusion + System Integration

Responsibilities:

* Evidence schema
* Evidence Fusion engine
* Cross-modal reasoning
* Trust Assessment logic
* Confidence/uncertainty handling
* Explanation structure
* Evidence Graph data structure
* Integration between analyzers and backend
* Overall AI architecture
* Final AI pipeline integration

Deven's layer consumes structured evidence from other analyzers.

Deven should NOT unnecessarily duplicate modality-specific forensic work.

---

## Jackson

### Role:

Frontend + UX

Responsibilities:

* React application
* Upload interface
* Evidence cards
* Investigation workspace
* Results dashboard
* Trust assessment visualization
* Evidence Graph visualization
* Explanation UI
* Confidence/uncertainty display
* Loading/error states
* Demo experience

Jackson should use mock JSON while backend APIs are being developed.

Frontend development should NOT wait for backend completion.

---

## Sairaj

### Role:

Image/Video Forensics + ML Analysis

Responsibilities:

### Image

* Metadata extraction
* Image forensic signals
* Compression analysis
* Manipulation indicators
* AI-generation detection
* Visual analysis

### Video

* Metadata
* Frame extraction
* Frame-level analysis
* Temporal consistency
* Visual manipulation indicators

Sairaj produces structured evidence.

Sairaj does NOT produce the final system verdict.

---

## Ayush

### Role:

Backend + API + Database

Responsibilities:

* FastAPI application
* File uploads
* Investigation management
* Evidence management
* Analysis endpoints
* Database
* File storage
* API validation
* Backend integration

Ayush owns the REST interface between frontend and AI pipeline.

---

# 7. Technology Stack

## Frontend

* React
* Vite
* Tailwind CSS
* React Flow
* Axios
* Lucide React
* Optional Recharts

## Backend

* Python
* FastAPI
* Pydantic
* SQLite
* Uvicorn
* python-multipart

## AI / ML

* Python
* PyTorch
* OpenCV
* Pillow
* Hugging Face Transformers
* FFmpeg

Optional:

* LLM/VLM for reasoning and explanation

LLMs/VLMs should support reasoning and explanation.

They should NOT be treated as the sole authenticity detector.

---

# 8. Evidence Flow

The general flow is:

```text
UPLOAD
   ↓
IDENTIFY MODALITY
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
LIMITATIONS
   ↓
EVIDENCE GRAPH
   ↓
FRONTEND
```

---

# 9. Evidence Schema

A modality analyzer should produce evidence approximately in this format:

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

The exact schema may evolve, but changes must be documented in `API_CONTRACT.md`.

---

# 10. Trust Assessment

TrustLayer should use uncertainty-aware categories.

Possible assessment values:

```text
no_significant_signals
inconclusive
potential_concern
high_concern
```

These are assessment categories, NOT absolute truth labels.

Every assessment should ideally contain:

* assessment
* confidence
* summary
* findings
* supporting evidence
* limitations

Example:

```json
{
  "assessment": "potential_concern",
  "confidence": 0.82,
  "summary": "Multiple evidence signals indicate potential inconsistency.",
  "findings": [
    {
      "type": "cross_modal_conflict",
      "evidence": ["img_01", "text_01"],
      "explanation": "The image content and textual location claim are inconsistent.",
      "confidence": 0.76
    }
  ],
  "limitations": [
    "No independent external source was provided."
  ]
}
```

---

# 11. Evidence Graph

The Evidence Graph is a major visualization feature.

It represents:

### Nodes

```text
Image
Video
Audio
Text
Finding
Signal
Claim
```

### Edges

Examples:

```text
visual_similarity
semantic_agreement
semantic_conflict
location_conflict
timestamp_conflict
supports
contradicts
derived_from
```

Example:

```json
{
  "nodes": [
    {
      "id": "img1",
      "type": "image"
    },
    {
      "id": "txt1",
      "type": "text"
    }
  ],
  "edges": [
    {
      "source": "img1",
      "target": "txt1",
      "relationship": "location_conflict",
      "confidence": 0.76
    }
  ]
}
```

The graph should help judges understand WHY the system reached its assessment.

---

# 12. Uncertainty Rules

TrustLayer must explicitly represent uncertainty.

Important rules:

1. Detector confidence is NOT absolute truth.
2. Metadata alone is NOT proof of authenticity.
3. Absence of manipulation signals does NOT guarantee authenticity.
4. AI-generation detectors can produce false positives and false negatives.
5. Missing evidence must be communicated.
6. Conflicting evidence must be surfaced.
7. Cross-modal conclusions should identify which evidence supports them.
8. The system should never hide uncertainty to make the demo look more impressive.

Example:

```text
Assessment:
Potential Concern

Confidence:
82%

Supporting signals:
- Compression inconsistency
- AI-generation detector signal
- Metadata anomaly

Limitations:
- Original source file unavailable
- No independent reference image
```

---

# 13. Investigation Workspace

The UI should follow this conceptual flow:

```text
CREATE INVESTIGATION
        ↓
ADD EVIDENCE
        ↓
UPLOAD ANY AVAILABLE MODALITY
        ↓
ANALYZE EVIDENCE
        ↓
VIEW INDIVIDUAL ANALYSIS
        ↓
VIEW CROSS-MODAL FINDINGS
        ↓
VIEW EVIDENCE GRAPH
        ↓
VIEW FINAL TRUST ASSESSMENT
        ↓
VIEW EXPLANATION + LIMITATIONS
```

Users should NOT be forced to upload all four modalities.

---

# 14. MVP Priority

## P0 — MUST WORK

* Image upload
* Image analysis
* Video upload
* Video analysis
* Structured evidence
* Evidence Fusion
* Trust Assessment
* Explanation
* Frontend results
* Basic investigation workflow

## P1 — IMPORTANT

* Text evidence
* Cross-modal conflicts
* Evidence Graph
* Confidence visualization
* Limitations
* Investigation history

## P2 — ONLY IF TIME REMAINS

* Audio analysis
* Advanced metadata
* Advanced visualizations
* Deployment polish
* Additional detectors

---

# 15. What We Should NOT Build

Unless there is a strong technical reason, do NOT introduce:

* Kubernetes
* Microservices
* Vector databases
* Blockchain
* Agent swarms
* Complex RAG systems
* Complex authentication
* Custom deepfake model training
* Large-scale model fine-tuning
* Multiple unnecessary databases
* Complex cloud infrastructure

The goal is a working, explainable vertical slice.

---

# 16. First Vertical Slice

The first working version should be:

```text
ONE IMAGE
   ↓
UPLOAD
   ↓
IMAGE ANALYSIS
   ↓
STRUCTURED EVIDENCE
   ↓
EVIDENCE FUSION
   ↓
TRUST ASSESSMENT
   ↓
EXPLANATION
   ↓
FRONTEND RESULT
```

Once this works end-to-end:

```text
IMAGE
   ↓
VIDEO
   ↓
TEXT
   ↓
CROSS-MODAL ANALYSIS
   ↓
EVIDENCE GRAPH
   ↓
POLISH
```

Do NOT attempt to build every feature simultaneously.

---

# 17. Demo Philosophy

The strongest demonstration should feel like an investigation rather than a simple file classifier.

Example:

```text
Investigation
     ↓
Context / Claim
     ↓
Evidence
     ↓
Modality Analysis
     ↓
Evidence Signals
     ↓
Cross-Modal Comparison
     ↓
Conflict / Agreement
     ↓
Evidence Graph
     ↓
Trust Assessment
     ↓
Explanation
     ↓
Limitations
```

The demo should show that TrustLayer can reason over evidence rather than simply saying:

> "Fake: 94%"

---

# 18. Development Rules

### Rule 1

The GitHub repository is the project source of truth.

### Rule 2

Shared architecture changes must be documented.

### Rule 3

API contracts must be agreed before dependent modules are integrated.

### Rule 4

Every analyzer returns structured evidence.

### Rule 5

No analyzer directly owns the final verdict.

### Rule 6

The Evidence Fusion layer combines evidence.

### Rule 7

Frontend should use mock data and develop independently.

### Rule 8

Every member commits frequently.

### Rule 9

Do not overwrite another member's work without coordination.

### Rule 10

Do not add technologies just because they sound impressive.

---

# 19. Git Rules

Use feature branches.

Example:

```text
main
│
├── feature/frontend
├── feature/backend
├── feature/image-video-analysis
└── feature/evidence-fusion
```

Each member works primarily on their assigned branch.

Changes should eventually be merged into `main`.

Before starting work:

```bash
git pull
```

After completing a meaningful change:

```bash
git add .
git commit -m "clear description"
git push
```

---

# 20. Team Communication Format

When reporting progress, use:

```text
DONE:
-

CURRENT:
-

BLOCKED:
-

CHANGES TO API/SCHEMA:
-
```

This prevents duplicated work and keeps integration predictable.

---

# 21. GPT / AI Assistant Rules

Each team member may use their own AI assistant.

However, all AI assistants MUST treat this repository documentation as the source of truth.

Before generating significant code, the assistant should understand:

* MASTER_CONTEXT.md
* ARCHITECTURE.md
* API_CONTRACT.md
* the developer's assigned responsibility

AI assistants must NOT independently redesign the project architecture.

Do not introduce a new framework, database, model, agent architecture, or infrastructure component without team agreement.

If a proposed change affects another member's module, flag it before implementing it.

---

# 22. Current Status

## Repository Setup

* [x] Folder structure created
* [x] Shared documentation files created
* [x] Backend structure created
* [x] AI module structure created
* [x] Audio structure created
* [x] Sample-data structure created
* [ ] Documentation finalized
* [ ] Git initialized / synchronized
* [ ] Team members cloned repository
* [ ] Frontend initialized
* [ ] Backend running
* [ ] Image analyzer implemented
* [ ] Video analyzer implemented
* [ ] Evidence Fusion implemented
* [ ] Cross-modal reasoning implemented
* [ ] Evidence Graph implemented
* [ ] End-to-end demo working

---

# 23. Current Immediate Goal

Before building advanced AI functionality:

1. Finalize project documentation.
2. Push the repository to GitHub.
3. Get all four team members synchronized.
4. Initialize frontend.
5. Implement backend health/API skeleton.
6. Implement image analysis.
7. Build the first end-to-end vertical slice.
8. Expand to video.
9. Add text and cross-modal reasoning.
10. Add Evidence Graph.
11. Polish the demo.

---

# 24. Core Principle

## TrustLayer does not simply ask:

> "Is this fake?"

It asks:

> "What evidence do we have, what does that evidence indicate, how strongly does it support the finding, what conflicts exist, and what limitations remain?"

That principle should guide every technical and product decision in this project.

```

### Your action right now

1. Open `MASTER_CONTEXT.md`
2. **Ctrl + A**
3. Delete everything
4. Paste the entire block above
5. **Ctrl + S**

Then tell me **"done"**.

We'll move to `ARCHITECTURE.md` next.
```
