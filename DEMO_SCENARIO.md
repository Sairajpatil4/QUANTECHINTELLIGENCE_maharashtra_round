Next: **`DEMO_SCENARIO.md`**.

This is important because we should build toward a **single strong judge demonstration**, rather than four disconnected features.

Open `DEMO_SCENARIO.md`, replace everything with this:

````markdown
# TRUSTLAYER — DEMO SCENARIO

## 1. Demo Objective

The goal of the demo is to show that TrustLayer is not simply an AI-generated-content detector.

TrustLayer demonstrates an evidence-driven authenticity investigation.

The demo should communicate:

```text
Evidence
   ↓
Analysis
   ↓
Signals
   ↓
Evidence Fusion
   ↓
Cross-Modal Reasoning
   ↓
Trust Assessment
   ↓
Explanation
   ↓
Evidence Graph
````

The demo should be understandable to a judge within a few minutes.

---

# 2. Demo Story

Scenario:

A potentially manipulated piece of digital content is circulating online.

The investigator wants to determine:

* What evidence is available?
* Does the media show manipulation signals?
* Does the accompanying claim match the evidence?
* Are different evidence sources consistent?
* What does TrustLayer actually know?
* What remains uncertain?

TrustLayer acts as an investigation workspace.

---

# 3. Recommended Demo Case

Use a fictional/social-media-style incident.

Example:

> A photograph is circulating with the claim that it was captured at a specific location and date.

The investigator has:

```text
Evidence 1 → Image
Evidence 2 → Text claim
Evidence 3 → Optional video
```

The demo does NOT require all modalities.

---

# 4. Demo Opening

Start on the TrustLayer landing/investigation screen.

Show:

```text
TRUSTLAYER

AI-Powered Digital Authenticity & Trust

Analyze digital evidence.
Understand manipulation signals.
Compare independent evidence.
See why the system reached its assessment.
```

Primary action:

```text
Start Investigation
```

---

# 5. Create Investigation

Click:

```text
Start Investigation
```

Enter:

```text
Title:
Social Media Incident

Description:
Verify the authenticity and context of a circulating image.
```

Click:

```text
Create Investigation
```

---

# 6. Add Evidence

Show the Add Evidence interface.

The UI should communicate:

```text
Upload whatever evidence you have.

TrustLayer works with individual evidence
and becomes more powerful when additional
independent evidence is available.
```

Possible evidence cards:

```text
┌───────────────┐
│ IMAGE         │
│ Upload Image  │
└───────────────┘

┌───────────────┐
│ VIDEO         │
│ Upload Video  │
└───────────────┘

┌───────────────┐
│ TEXT          │
│ Add Claim     │
└───────────────┘

┌───────────────┐
│ AUDIO         │
│ Upload Audio  │
└───────────────┘
```

The user can add one or more.

---

# 7. Primary Demo Flow

For the main demo, use:

```text
Image + Text
```

This creates an easy-to-understand cross-modal investigation.

Example:

Image:

```text
incident.jpg
```

Text claim:

```text
"This photograph was taken in Mumbai
on October 2, 2026."
```

Then click:

```text
Analyze Evidence
```

---

# 8. Analysis Screen

Display an analysis progress sequence.

Example:

```text
✓ Evidence received

✓ Image metadata analyzed

✓ Image forensic signals analyzed

✓ Visual context extracted

✓ Text claim analyzed

✓ Evidence fused

✓ Cross-modal relationships evaluated

✓ Trust assessment generated
```

Avoid fake-looking excessive loading animations.

The purpose is to show the analysis pipeline clearly.

---

# 9. Individual Evidence Results

After processing, show the evidence items.

Example:

```text
IMAGE

File:
incident.jpg

Signals detected:

AI-generation likelihood
82%

Compression inconsistency
78%

Metadata availability
Limited
```

Important:

These are signals, not verdicts.

---

# 10. Evidence Explanation

Clicking a signal should show an explanation.

Example:

```text
AI-generation likelihood

Confidence: 82%

The detector identified visual patterns
associated with AI-generated imagery.

This signal alone does not establish
that the image is fabricated.
```

This demonstrates explainability.

---

# 11. Text Claim Analysis

Display:

```text
TEXT CLAIM

"The photograph was taken in Mumbai
on October 2, 2026."
```

Extracted information:

```text
Location:
Mumbai

Date:
October 2, 2026
```

The extracted claim becomes structured evidence.

---

# 12. Cross-Modal Reasoning

Now compare the image and text.

Example:

```text
IMAGE
  │
  │ location evidence
  ▼
Possible mismatch
  ▲
  │ claimed location
  │
TEXT
```

If the image analysis produces a different location hint:

```text
Image context:
Delhi-like urban environment

Text claim:
Mumbai
```

TrustLayer generates:

```text
LOCATION CONFLICT
Confidence: 76%
```

Explanation:

```text
The supplied text claims that the image
was captured in Mumbai, while visual/contextual
evidence suggests a different location.

This does not prove the image is fabricated,
but it creates an inconsistency requiring
further verification.
```

---

# 13. Final Trust Assessment

Display a prominent result card.

Example:

```text
┌─────────────────────────────────────┐
│       POTENTIAL CONCERN             │
│                                     │
│       Confidence: 82%               │
│                                     │
│ Multiple evidence signals indicate  │
│ potential inconsistency.            │
└─────────────────────────────────────┘
```

The UI should clearly distinguish:

```text
Assessment
```

from:

```text
Evidence supporting the assessment
```

---

# 14. Key Findings

Show findings underneath.

Example:

```text
KEY FINDINGS

01  AI-generation signal
    Confidence: 82%

02  Compression inconsistency
    Confidence: 78%

03  Location conflict
    Confidence: 76%
```

Each finding should be clickable.

Clicking a finding should reveal:

* Relevant evidence
* Confidence
* Explanation
* Limitations

---

# 15. Evidence Graph

Open the Evidence Graph.

Example:

```text
             ┌──────────────┐
             │    IMAGE     │
             └──────┬───────┘
                    │
          location conflict
                    │
                    ▼
             ┌──────────────┐
             │     TEXT     │
             └──────────────┘
```

If video is included:

```text
                 IMAGE
                /     \
               /       \
 visual_similarity     location conflict
             /           \
            ▼             ▼
         VIDEO           TEXT
```

The graph should make the relationships visually understandable.

---

# 16. Limitations Panel

Always show limitations.

Example:

```text
LIMITATIONS

• No original source file was available.
• Metadata was incomplete.
• AI-generation detection can produce false positives
  and false negatives.
• Cross-modal verification is limited by the evidence
  provided.
```

This demonstrates uncertainty awareness.

---

# 17. Single-Image Demo Fallback

If the cross-modal demo fails during the hackathon:

Use an image-only investigation.

Flow:

```text
Upload Image
      ↓
Metadata
      ↓
Forensic Analysis
      ↓
AI-Generation Signal
      ↓
Visual Analysis
      ↓
Evidence Fusion
      ↓
Trust Assessment
      ↓
Explanation
```

Final result example:

```text
POTENTIAL CONCERN

Confidence: 82%

Multiple image-level signals indicate
potential manipulation or AI-generation.

Cross-modal verification was unavailable
because only one evidence source was provided.
```

This is the mandatory fallback.

---

# 18. Video Demo Fallback

If image analysis works but video is not stable:

Do NOT make the entire demo depend on video.

The image + text flow remains the primary demo.

Video can be presented as an additional capability.

If video works:

```text
Upload Video
      ↓
Metadata
      ↓
Frame Sampling
      ↓
Frame Analysis
      ↓
Temporal Consistency
      ↓
Evidence Fusion
      ↓
Assessment
```

---

# 19. What Judges Should Notice

The demo should make these concepts obvious:

### 1. Multimodal

TrustLayer can process different evidence types.

### 2. Evidence-aware

The system works with whatever evidence is available.

### 3. Explainable

The system explains why a signal or finding exists.

### 4. Uncertainty-aware

The system does not claim absolute certainty.

### 5. Cross-modal

Different evidence sources can support or contradict each other.

### 6. Generalizable

The architecture is based on evidence signals and reasoning rather than a single hard-coded manipulation detector.

### 7. Investigation-oriented

The output is more useful than a simple:

```text
REAL / FAKE
```

---

# 20. What NOT to Say During the Demo

Do NOT say:

```text
"The AI knows this image is fake."
```

Instead say:

```text
"The available evidence produces a potential
manipulation concern with this confidence."
```

Do NOT say:

```text
"The model is 82% sure that it is fake."
```

Instead say:

```text
"The evidence supports a potential-concern
assessment with 82% confidence."
```

Do NOT say:

```text
"The metadata proves the image is real."
```

Instead say:

```text
"Metadata provides additional provenance evidence,
but it is not independently sufficient to establish
authenticity."
```

---

# 21. Judge Narrative

Recommended explanation:

> "TrustLayer is designed around a simple problem: authenticity cannot always be determined from a single detector. An investigator may only have an image, or they may have an image, a video, and a claim. Our system analyzes each available evidence source independently, converts the outputs into structured evidence, and then reasons across those sources. The final assessment includes confidence, supporting findings, and limitations so the investigator can understand not just what the system concluded, but why."

---

# 22. Demo Sequence

The complete presentation should follow:

```text
1. Problem
      ↓
2. Start Investigation
      ↓
3. Add Evidence
      ↓
4. Analyze
      ↓
5. Individual Evidence Signals
      ↓
6. Cross-Modal Finding
      ↓
7. Trust Assessment
      ↓
8. Explanation
      ↓
9. Evidence Graph
      ↓
10. Limitations
```

---

# 23. Problem Statement

Keep the problem explanation short.

Example:

> Digital content can be manipulated, AI-generated, taken out of context, or paired with misleading claims. Existing approaches often focus on detecting one type of manipulation. TrustLayer approaches authenticity as an evidence reasoning problem.

---

# 24. Solution Statement

Example:

> TrustLayer is an evidence-adaptive multimodal investigation workspace that analyzes images, videos, text, and audio, combines heterogeneous signals, identifies cross-modal inconsistencies, and produces explainable, uncertainty-aware trust assessments.

---

# 25. Technical Explanation

If judges ask:

"How does it work?"

Answer:

```text
Each modality has a specialized analyzer.

The analyzers produce structured evidence
rather than final verdicts.

The Evidence Fusion layer combines those signals.

Cross-Modal Reasoning identifies relationships,
supporting evidence, and conflicts.

The Trust Assessment layer converts the available
evidence into an uncertainty-aware assessment.

The frontend then visualizes the evidence,
reasoning, explanation, and relationships.
```

---

# 26. Why Not Just Use One AI Detector?

Recommended answer:

> "A single detector only observes one signal. Authenticity can also depend on metadata, compression artifacts, temporal consistency, semantic context, provenance, and agreement between independent evidence sources. TrustLayer therefore treats individual models as evidence generators rather than truth oracles."

---

# 27. Why Does Confidence Matter?

Recommended answer:

> "Authenticity analysis often operates under incomplete evidence. Confidence allows the system to communicate how strongly the available evidence supports an assessment instead of presenting a binary answer that hides uncertainty."

---

# 28. What If Only One Evidence Type Is Available?

Recommended answer:

> "TrustLayer still performs modality-specific analysis. However, it explicitly reports that cross-modal verification was unavailable. The system becomes stronger when independent evidence is added."

---

# 29. What Makes the System Generalizable?

Recommended answer:

> "The architecture separates modality-specific analysis from evidence reasoning. New manipulation detectors can be added as signal generators without redesigning the entire reasoning layer."

---

# 30. Final Demo Principle

The strongest demo is not:

```text
Upload → Fake
```

It is:

```text
Upload
   ↓
Analyze
   ↓
Understand Evidence
   ↓
Compare Evidence
   ↓
Identify Conflicts
   ↓
Explain Findings
   ↓
Communicate Uncertainty
```

The judge should leave understanding that TrustLayer is an investigation system, not just another binary AI detector.

````

