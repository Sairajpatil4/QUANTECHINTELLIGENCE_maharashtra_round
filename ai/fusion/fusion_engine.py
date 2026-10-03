from typing import List

from .schemas import (
    Evidence,
    EvidenceRelationship,
    EvidenceSufficiency,
    Finding,
    FusionResult,
    TrustAssessment,
)


class FusionEngine:
    """
    Combines structured evidence from multiple modality analyzers.

    Important design principles:
    - Analyzer outputs are evidence, not final verdicts.
    - Missing detectors do not imply authenticity.
    - Assessment confidence is confidence in the assessment,
      NOT probability that content is fake.
    - Cross-modal verification requires an actual relationship/comparison.
    """

    # Relationship types that represent an actual comparison
    # between evidence items.
    _COMPARISON_RELATIONSHIPS = {
        "corroborates",
        "contradicts",
        "visual_similarity",
        "semantic_conflict",
        "location_conflict",
        "temporal_conflict",
        "timestamp_conflict",
    }

    # Relationship types that indicate a conflict.
    _CONFLICT_RELATIONSHIPS = {
        "contradicts",
        "semantic_conflict",
        "location_conflict",
        "temporal_conflict",
        "timestamp_conflict",
    }

    # Keywords used to recognize when an analyzer explicitly says
    # that an important detector was unavailable.
    _UNAVAILABLE_KEYWORDS = {
        "not configured",
        "not available",
        "unavailable",
        "not implemented",
        "not performed",
        "could not",
        "unable to",
        "missing detector",
        "no dedicated",
    }

    # Categories/names that can represent direct manipulation evidence.
    _DIRECT_SIGNAL_KEYWORDS = {
        "manipulation",
        "manipulated",
        "synthetic",
        "generation",
        "generated",
        "deepfake",
        "face_swap",
        "faceswap",
        "splicing",
        "copy_move",
        "forensic",
        "ai_generated",
        "ai-generation",
        "voice_manipulation",
        "audio_manipulation",
        "temporal_manipulation",
    }

    def fuse(self, evidence: List[Evidence]) -> FusionResult:
        """
        Fuse all available evidence into an investigation result.
        """

        relationships = self._find_relationships(evidence)

        sufficiency = self._assess_sufficiency(
            evidence=evidence,
            relationships=relationships,
        )

        findings = self._generate_findings(
            evidence=evidence,
            relationships=relationships,
        )

        assessment = self._build_assessment(
            evidence=evidence,
            relationships=relationships,
            findings=findings,
            sufficiency=sufficiency,
        )

        return FusionResult(
            evidence=evidence,
            relationships=relationships,
            assessment=assessment,
        )

    # ------------------------------------------------------------------
    # RELATIONSHIP ANALYSIS
    # ------------------------------------------------------------------

    def _find_relationships(
        self,
        evidence: List[Evidence],
    ) -> List[EvidenceRelationship]:
        """
        Compare evidence items pairwise.

        The MVP currently supports:
        - location conflicts
        - timestamp conflicts

        Future analyzers can add richer relationships such as:
        - visual similarity
        - corroboration
        - semantic contradiction
        """

        relationships: List[EvidenceRelationship] = []

        for i in range(len(evidence)):
            for j in range(i + 1, len(evidence)):
                source = evidence[i]
                target = evidence[j]

                relationships.extend(
                    self._compare_evidence(
                        source=source,
                        target=target,
                    )
                )

        return relationships

    def _compare_evidence(
        self,
        source: Evidence,
        target: Evidence,
    ) -> List[EvidenceRelationship]:
        """
        Compare two evidence items using information that is
        explicitly available in their structured evidence.

        Do not invent relationships that analyzers did not establish.
        """

        relationships: List[EvidenceRelationship] = []

        source_location = source.semantic_context.location_hint
        target_location = target.semantic_context.location_hint

        if (
            source_location
            and target_location
            and self._values_meaningfully_different(
                source_location,
                target_location,
            )
        ):
            relationships.append(
                EvidenceRelationship(
                    relationship_id=(
                        f"rel_location_"
                        f"{source.evidence_id}_"
                        f"{target.evidence_id}"
                    ),
                    source_evidence_id=source.evidence_id,
                    target_evidence_id=target.evidence_id,
                    relationship="location_conflict",
                    confidence=0.75,
                    explanation=(
                        "The evidence items contain different "
                        f"location hints: '{source_location}' "
                        f"versus '{target_location}'."
                    ),
                )
            )

        source_time = source.semantic_context.timestamp_hint
        target_time = target.semantic_context.timestamp_hint

        if (
            source_time
            and target_time
            and self._values_meaningfully_different(
                source_time,
                target_time,
            )
        ):
            relationships.append(
                EvidenceRelationship(
                    relationship_id=(
                        f"rel_timestamp_"
                        f"{source.evidence_id}_"
                        f"{target.evidence_id}"
                    ),
                    source_evidence_id=source.evidence_id,
                    target_evidence_id=target.evidence_id,
                    relationship="timestamp_conflict",
                    confidence=0.70,
                    explanation=(
                        "The evidence items contain different "
                        f"timestamp hints: '{source_time}' "
                        f"versus '{target_time}'."
                    ),
                )
            )

        return relationships

    @staticmethod
    def _values_meaningfully_different(
        first: str,
        second: str,
    ) -> bool:
        """
        Basic normalization before comparing textual hints.

        This avoids treating differences such as capitalization
        or surrounding whitespace as contradictions.
        """

        first_normalized = " ".join(first.lower().split())
        second_normalized = " ".join(second.lower().split())

        return first_normalized != second_normalized

    # ------------------------------------------------------------------
    # EVIDENCE SUFFICIENCY
    # ------------------------------------------------------------------

    def _assess_sufficiency(
        self,
        evidence: List[Evidence],
        relationships: List[EvidenceRelationship],
    ) -> EvidenceSufficiency:
        """
        Determine how much evidence is available for reasoning.

        Important:
        Multiple modalities alone do NOT mean that cross-modal
        verification actually occurred.
        """

        modalities = list(
            dict.fromkeys(
                item.type
                for item in evidence
            )
        )

        evidence_count = len(evidence)

        meaningful_comparisons = [
            relationship
            for relationship in relationships
            if relationship.relationship
            in self._COMPARISON_RELATIONSHIPS
        ]

        cross_modal = (
            len(modalities) >= 2
            and bool(meaningful_comparisons)
        )

        detector_available = any(
            self._has_meaningful_analysis(item)
            for item in evidence
        )

        if evidence_count == 0:
            level = "limited"

            reason = (
                "No evidence was provided for analysis."
            )

        elif evidence_count == 1:
            level = "limited"

            if detector_available:
                reason = (
                    "One evidence item was analyzed, but "
                    "cross-modal verification is not possible."
                )
            else:
                reason = (
                    "Only one evidence item is available and "
                    "the relevant authenticity detector is not "
                    "configured or available."
                )

        elif cross_modal:
            level = "moderate"

            reason = (
        "Multiple evidence modalities are available and "
        "an explicit relationship between evidence items "
        "can be evaluated. The relationship provides "
        "cross-modal reasoning, but does not by itself "
        "establish authenticity or manipulation."
            )

        elif detector_available:
            level = "moderate"

            reason = (
                "Multiple evidence items are available and "
                "at least one analyzer produced usable evidence, "
                "but meaningful cross-modal verification was limited."
            )

        else:
            level = "limited"

            reason = (
                "Multiple evidence items are available, but "
                "the available analyzers do not provide enough "
                "authenticity evidence for strong verification."
            )

        return EvidenceSufficiency(
            level=level,
            evidence_count=evidence_count,
            available_modalities=modalities,
            cross_modal_verification=cross_modal,
            reason=reason,
        )

    # ------------------------------------------------------------------
    # FINDINGS
    # ------------------------------------------------------------------

    def _generate_findings(
        self,
        evidence: List[Evidence],
        relationships: List[EvidenceRelationship],
    ) -> List[Finding]:
        """
        Convert analyzer signals and cross-evidence relationships
        into traceable findings.

        A finding always points back to the evidence that produced it.
        """

        findings: List[Finding] = []

        for item in evidence:
            for signal in item.signals:
                if signal.severity not in {"medium", "high"}:
                    continue

                if self._is_direct_manipulation_signal(signal):
                    finding_type = "manipulation_signal"
                else:
                    finding_type = "contextual_anomaly"

                explanation = (
                    signal.description
                    or f"{signal.name}: {signal.value}"
                )

                findings.append(
                    Finding(
                        type=finding_type,
                        evidence=[item.evidence_id],
                        explanation=explanation,
                        confidence=signal.confidence,
                    )
                )

        for relationship in relationships:
            if relationship.relationship not in self._CONFLICT_RELATIONSHIPS:
                continue

            findings.append(
                Finding(
                    type=relationship.relationship,
                    evidence=[
                        relationship.source_evidence_id,
                        relationship.target_evidence_id,
                    ],
                    explanation=relationship.explanation,
                    confidence=relationship.confidence,
                    relationship_ids=[
                        relationship.relationship_id
                    ],
                )
            )

        return findings

    def _is_direct_manipulation_signal(
        self,
        signal,
    ) -> bool:
        """
        Determine whether a signal is directly related to
        manipulation/authenticity detection.

        This intentionally does NOT treat every high-severity
        signal as proof of manipulation.
        """

        text = " ".join(
            [
                str(signal.name or ""),
                str(signal.category or ""),
                str(signal.description or ""),
            ]
        ).lower()

        return any(
            keyword in text
            for keyword in self._DIRECT_SIGNAL_KEYWORDS
        )

    # ------------------------------------------------------------------
    # FINAL ASSESSMENT
    # ------------------------------------------------------------------

    def _build_assessment(
        self,
        evidence: List[Evidence],
        relationships: List[EvidenceRelationship],
        findings: List[Finding],
        sufficiency: EvidenceSufficiency,
    ) -> TrustAssessment:
        """
        Build an uncertainty-aware trust assessment.

        Assessment meanings:

        inconclusive:
            Not enough authenticity evidence to make a meaningful
            manipulation assessment.

        no_significant_manipulation_signals:
            Relevant analysis actually ran and did not identify
            significant manipulation signals.

        potential_concern:
            At least one meaningful manipulation signal or
            significant conflict requires attention.

        high_concern:
            Multiple independent strong manipulation signals or
            strong manipulation evidence combined with significant
            cross-evidence conflicts.

        These are assessment categories, NOT probabilities that
        the content is fake.
        """

        limitations = self._collect_limitations(evidence)

        # --------------------------------------------------------------
        # No evidence
        # --------------------------------------------------------------

        if not evidence:
            return TrustAssessment(
                assessment="inconclusive",
                confidence=0.0,
                summary=(
                    "No evidence was provided, so authenticity "
                    "cannot be assessed."
                ),
                findings=[],
                limitations=limitations,
                evidence_sufficiency=sufficiency,
            )

        # --------------------------------------------------------------
        # Identify meaningful findings
        # --------------------------------------------------------------

        direct_findings = [
            finding
            for finding in findings
            if finding.type == "manipulation_signal"
        ]

        contextual_findings = [
            finding
            for finding in findings
            if finding.type == "contextual_anomaly"
        ]

        conflict_findings = [
            finding
            for finding in findings
            if finding.type in self._CONFLICT_RELATIONSHIPS
        ]

        detector_unavailable = any(
            self._detector_unavailable(item)
            for item in evidence
        )

        meaningful_analysis_exists = any(
            self._has_meaningful_analysis(item)
            for item in evidence
        )

        # --------------------------------------------------------------
        # Direct manipulation evidence
        # --------------------------------------------------------------

        strong_direct_findings = [
            finding
            for finding in direct_findings
            if finding.confidence >= 0.75
        ]

        medium_direct_findings = [
            finding
            for finding in direct_findings
            if 0.50 <= finding.confidence < 0.75
        ]

        # Multiple strong direct signals provide stronger support
        # than one isolated signal.
        if len(strong_direct_findings) >= 2:
            confidence = self._clamp_confidence(
                0.80 + min(
                    0.10,
                    0.03 * (len(strong_direct_findings) - 2),
                )
            )

            return TrustAssessment(
                assessment="high_concern",
                confidence=confidence,
                summary=(
                    "Multiple strong manipulation-related signals "
                    "were identified across the available evidence. "
                    "The evidence warrants a high level of concern, "
                    "but this is not a definitive authenticity verdict."
                ),
                findings=findings,
                limitations=limitations,
                evidence_sufficiency=sufficiency,
            )

        if strong_direct_findings:
            confidence = self._clamp_confidence(
                0.60 + 0.20 * strong_direct_findings[0].confidence
            )

            return TrustAssessment(
                assessment="potential_concern",
                confidence=confidence,
                summary=(
                    "A significant manipulation-related signal was "
                    "identified. Further independent evidence would "
                    "help determine whether the signal reflects actual "
                    "content manipulation."
                ),
                findings=findings,
                limitations=limitations,
                evidence_sufficiency=sufficiency,
            )

        if medium_direct_findings:
            confidence = self._clamp_confidence(
                0.50 + 0.20 * medium_direct_findings[0].confidence
            )

            return TrustAssessment(
                assessment="potential_concern",
                confidence=confidence,
                summary=(
                    "A manipulation-related signal was identified, "
                    "but the available evidence is not sufficient "
                    "for a strong authenticity conclusion."
                ),
                findings=findings,
                limitations=limitations,
                evidence_sufficiency=sufficiency,
            )

        # --------------------------------------------------------------
        # Cross-evidence conflicts without direct manipulation signals
        # --------------------------------------------------------------

        if len(conflict_findings) >= 2:
            return TrustAssessment(
                assessment="potential_concern",
                confidence=0.65,
                summary=(
                    "Multiple inconsistencies were identified "
                    "between the available evidence items. These "
                    "inconsistencies require further investigation "
                    "but do not independently prove manipulation."
                ),
                findings=findings,
                limitations=limitations,
                evidence_sufficiency=sufficiency,
            )

        if conflict_findings:
            return TrustAssessment(
                assessment="potential_concern",
                confidence=0.55,
                summary=(
                    "An inconsistency was identified between "
                    "evidence items. This may require further "
                    "verification and does not independently prove "
                    "manipulation."
                ),
                findings=findings,
                limitations=limitations,
                evidence_sufficiency=sufficiency,
            )

        # --------------------------------------------------------------
        # Detector unavailable / insufficient authenticity analysis
        # --------------------------------------------------------------

        if detector_unavailable:
            return TrustAssessment(
                assessment="inconclusive",
                confidence=0.25,
                summary=(
                    "The available evidence could be analyzed "
                    "semantically, but a dedicated authenticity or "
                    "manipulation detector was not available. "
                    "No authenticity conclusion can therefore be made."
                ),
                findings=findings,
                limitations=limitations,
                evidence_sufficiency=sufficiency,
            )

        # --------------------------------------------------------------
        # Analyzer ran and found no significant manipulation signals
        # --------------------------------------------------------------

        if meaningful_analysis_exists:
            return TrustAssessment(
                assessment="no_significant_manipulation_signals",
                confidence=0.65,
                summary=(
                    "The available authenticity-related analysis "
                    "did not identify significant manipulation signals. "
                    "This does not guarantee that the content is authentic."
                ),
                findings=findings,
                limitations=limitations,
                evidence_sufficiency=sufficiency,
            )

        # --------------------------------------------------------------
        # Safe fallback
        # --------------------------------------------------------------

        return TrustAssessment(
            assessment="inconclusive",
            confidence=0.25,
            summary=(
                "The available evidence does not contain enough "
                "authenticity-related information to reach a reliable "
                "assessment."
            ),
            findings=findings,
            limitations=limitations,
            evidence_sufficiency=sufficiency,
        )

    # ------------------------------------------------------------------
    # HELPERS
    # ------------------------------------------------------------------

    def _has_meaningful_analysis(
        self,
        evidence: Evidence,
    ) -> bool:
        """
        Return True when the evidence contains either:
        - actual signals, or
        - an analyzer limitation set that does not indicate
          the relevant detector was unavailable.

        Semantic descriptions alone are not treated as authenticity
        analysis.
        """

        if evidence.signals:
            return True

        if self._detector_unavailable(evidence):
            return False

        # If an analyzer returned structured Evidence without saying
        # the detector was unavailable, assume that analysis completed.
        return True

    def _detector_unavailable(
        self,
        evidence: Evidence,
    ) -> bool:
        """
        Detect explicit analyzer statements indicating that the
        relevant authenticity detector was unavailable.

        This is intentionally conservative and only uses limitation
        text; it does not infer detector availability from an empty
        signals list alone.
        """

        for limitation in evidence.limitations:
            text = limitation.lower()

            if any(
                keyword in text
                for keyword in self._UNAVAILABLE_KEYWORDS
            ):
                return True

        return False

    def _collect_limitations(
        self,
        evidence: List[Evidence],
    ) -> List[str]:
        """
        Collect unique limitations from all evidence items while
        preserving their original wording.
        """

        limitations: List[str] = []

        for item in evidence:
            for limitation in item.limitations:
                if limitation not in limitations:
                    limitations.append(limitation)

        return limitations

    @staticmethod
    def _clamp_confidence(
        value: float,
    ) -> float:
        """
        Keep assessment confidence inside the schema's [0, 1] range.
        """

        return max(0.0, min(1.0, round(value, 3)))