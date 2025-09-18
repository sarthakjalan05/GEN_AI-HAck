from chat_engine import LegalDocumentAnalyzer
import re
import random
from typing import List, Dict, Tuple
from models import KeyTerm, RedFlag, SimplifiedSection, DocumentAnalysis


class AnalysisEngine:
    def __init__(self):
        self.llm = LegalDocumentAnalyzer()
        # Common legal terms and their definitions
        self.legal_terms_db = {
            "at-will employment": "Either party can terminate the employment relationship at any time, for any reason, with or without notice.",
            "confidentiality agreement": "A legal agreement that prohibits sharing sensitive business information with unauthorized parties.",
            "non-compete clause": "A restriction preventing an employee from working for competitors or starting a competing business for a specified period.",
            "intellectual property": "Creations of the mind, such as inventions, literary works, designs, and symbols used in commerce.",
            "force majeure": "Unforeseeable circumstances that prevent a party from fulfilling a contract, such as natural disasters or war.",
            "indemnification": "Protection against legal liability, where one party agrees to compensate another for losses or damages.",
            "liquidated damages": "A predetermined amount of compensation agreed upon in advance for specific contract breaches.",
            "arbitration": "A method of dispute resolution outside the courts, where an arbitrator makes a binding decision.",
            "jurisdiction": "The authority of a court to hear and decide a case, typically based on geographic location.",
            "severability": "If one part of a contract is invalid, the rest of the contract remains enforceable.",
            "warranty": "A promise or guarantee about the quality, condition, or performance of a product or service.",
            "breach of contract": "Failure to perform any duty or obligation specified in a contract without legal excuse.",
        }

        # Risk patterns to identify
        self.risk_patterns = {
            "overly broad non-compete": [
                "non-compete",
                "compete",
                "competitor",
                "indefinite",
                "unlimited",
            ],
            "vague compensation terms": [
                "bonus",
                "commission",
                "discretionary",
                "variable pay",
                "may receive",
            ],
            "unfair termination clauses": [
                "immediate termination",
                "without cause",
                "at company discretion",
            ],
            "excessive liability": [
                "unlimited liability",
                "personal guarantee",
                "hold harmless",
            ],
            "unclear intellectual property": [
                "work product",
                "inventions",
                "intellectual property",
                "unclear ownership",
            ],
        }

    def analyze_document(
        self, text: str, document_type: str, document_id: str
    ) -> DocumentAnalysis:
        """Perform comprehensive document analysis using LLM for summary, key terms, and risks"""

        # Calculate scores
        readability_score = self._calculate_readability_score(text)
        fairness_score = self._calculate_fairness_score(text, document_type)
        overall_score = (readability_score + fairness_score) / 2

        # Determine risk level
        risk_level = self._assess_risk_level(overall_score)
        complexity = self._determine_complexity(text)

        # --- LLM-Generated Summary ---
        try:
            summary_prompt = (
                "Summarize the main points and implications of the following legal document in plain English. Use markdown for formatting where appropriate.\n\nDocument:\n"
                + text[:4000]
            )
            summary = self.llm.model.generate_content(summary_prompt).text.strip()
        except Exception:
            summary = "Summary not available."

        # --- LLM-Generated Key Terms ---
        key_terms_markdown = ""
        try:
            key_terms_prompt = (
                "Extract and list the 3-5 most important legal terms or concepts from the following document. For each, provide:\n- term\n- definition (plain English)\n- importance (high, medium, low)\n- location (if possible)\nReturn as a JSON array of objects.\n\nDocument:\n"
                + text[:4000]
            )
            key_terms_raw = self.llm.model.generate_content(
                key_terms_prompt
            ).text.strip()
            import json

            key_terms_list = json.loads(key_terms_raw)
            from models import KeyTerm

            key_terms = [KeyTerm(**kt) for kt in key_terms_list]

            # Generate markdown version for key terms
            key_terms_markdown_prompt = (
                "Extract and explain the 3-5 most important legal terms from the following document. "
                "Format as markdown with headers, bullet points, and emphasis. Make it easy to read and understand.\n\nDocument:\n"
                + text[:4000]
            )
            key_terms_markdown = self.llm.model.generate_content(
                key_terms_markdown_prompt
            ).text.strip()
        except Exception:
            key_terms = self._extract_key_terms(text)

        # --- LLM-Generated Red Flags/Risks ---
        risks_markdown = ""
        try:
            risks_prompt = (
                "Identify up to 3 key risks, red flags, or problematic clauses in the following document. For each, provide:\n- issue (short title)\n- explanation (plain English)\n- severity (high, medium, low)\nReturn as a JSON array of objects.\n\nDocument:\n"
                + text[:4000]
            )
            risks_raw = self.llm.model.generate_content(risks_prompt).text.strip()
            import json

            risks_list = json.loads(risks_raw)
            from models import RedFlag

            red_flags = [RedFlag(**rf) for rf in risks_list]

            # Generate markdown version for risks
            risks_markdown_prompt = (
                "Analyze and explain the key risks and red flags in the following legal document. "
                "Format as markdown with clear headers, bullet points, and emphasis. Highlight severity levels and provide actionable advice.\n\nDocument:\n"
                + text[:4000]
            )
            risks_markdown = self.llm.model.generate_content(
                risks_markdown_prompt
            ).text.strip()
        except Exception:
            red_flags = self._identify_red_flags(text)

        # Generate simplified sections (already LLM-powered)
        simplified_sections = self._generate_simplified_sections(text, document_type)

        # Generate concerns and recommendations
        top_concerns = self._generate_concerns(red_flags, text)
        recommendations = self._generate_recommendations(red_flags, document_type)

        # Estimate read time
        estimated_read_time = self._estimate_read_time(text)

        return DocumentAnalysis(
            document_id=document_id,
            overall_score=round(overall_score, 1),
            readability_score=round(readability_score, 1),
            fairness_score=round(fairness_score, 1),
            risk_level=risk_level,
            complexity=complexity,
            estimated_read_time=estimated_read_time,
            top_concerns=top_concerns,
            recommendations=recommendations,
            key_terms=key_terms,
            red_flags=red_flags,
            simplified_sections=simplified_sections,
            summary=summary,
            key_terms_markdown=key_terms_markdown,
            risks_markdown=risks_markdown,
        )

    def _calculate_readability_score(self, text: str) -> float:
        """Calculate readability score (simplified version)"""
        if not text:
            return 5.0

        words = text.split()
        word_count = len(words)
        sentence_count = len(re.findall(r"[.!?]+", text))

        if sentence_count == 0:
            return 5.0

        avg_sentence_length = word_count / sentence_count
        avg_word_length = sum(len(word) for word in words) / word_count

        # Simple scoring algorithm (inverse relationship with complexity)
        base_score = 10.0
        sentence_penalty = max(0, (avg_sentence_length - 15) * 0.1)
        word_penalty = max(0, (avg_word_length - 5) * 0.3)

        score = max(1.0, base_score - sentence_penalty - word_penalty)
        return min(10.0, score)

    def _calculate_fairness_score(self, text: str, document_type: str) -> float:
        """Calculate fairness score based on document type"""
        if not text:
            return 7.0

        text_lower = text.lower()
        unfair_indicators = [
            "at company discretion",
            "sole discretion",
            "unlimited liability",
            "without notice",
            "immediate termination",
            "forfeiture",
            "waive all rights",
            "indemnify company",
            "hold harmless",
        ]

        unfair_count = sum(
            1 for indicator in unfair_indicators if indicator in text_lower
        )

        # Base fairness score
        base_score = 9.0

        # Reduce score based on unfair terms
        penalty = unfair_count * 0.5

        return max(1.0, base_score - penalty)

    def _assess_risk_level(self, overall_score: float) -> str:
        """Determine risk level based on overall score"""
        if overall_score >= 8.0:
            return "low"
        elif overall_score >= 6.0:
            return "medium"
        else:
            return "high"

    def _determine_complexity(self, text: str) -> str:
        """Determine document complexity"""
        if not text:
            return "low"

        word_count = len(text.split())
        legal_term_count = sum(
            1 for term in self.legal_terms_db.keys() if term in text.lower()
        )

        if word_count > 5000 or legal_term_count > 10:
            return "high"
        elif word_count > 2000 or legal_term_count > 5:
            return "medium"
        else:
            return "low"

    def _extract_key_terms(self, text: str) -> List[KeyTerm]:
        """Extract and define key legal terms"""
        text_lower = text.lower()
        found_terms = []

        for term, definition in self.legal_terms_db.items():
            if term in text_lower:
                # Determine importance based on term frequency and type
                importance = (
                    "high"
                    if term in ["non-compete", "confidentiality", "termination"]
                    else "medium"
                )

                found_terms.append(
                    KeyTerm(
                        term=term.title(),
                        definition=definition,
                        importance=importance,
                        location=f"Section {random.randint(1, 10)}.{random.randint(1, 5)}",
                    )
                )

        # If no specific terms found, add generic ones
        if not found_terms:
            found_terms.append(
                KeyTerm(
                    term="Legal Obligations",
                    definition="Duties and responsibilities that must be performed as specified in this document.",
                    importance="medium",
                    location="Various sections",
                )
            )

        return found_terms[:5]  # Limit to top 5 terms

    def _identify_red_flags(self, text: str) -> List[RedFlag]:
        """Identify potential issues or red flags"""
        text_lower = text.lower()
        flags = []

        for risk_type, keywords in self.risk_patterns.items():
            if any(keyword in text_lower for keyword in keywords):
                flag_details = {
                    "overly broad non-compete": {
                        "issue": "Broad Non-Compete Clause",
                        "explanation": "The non-compete restrictions appear extensive and may limit future employment opportunities.",
                        "severity": "medium",
                    },
                    "vague compensation terms": {
                        "issue": "Unclear Compensation Structure",
                        "explanation": "Payment terms lack specificity, which could lead to disputes over compensation.",
                        "severity": "medium",
                    },
                    "unfair termination clauses": {
                        "issue": "Unfavorable Termination Terms",
                        "explanation": "Termination conditions appear to heavily favor one party over the other.",
                        "severity": "high",
                    },
                    "excessive liability": {
                        "issue": "Excessive Liability Exposure",
                        "explanation": "The document may expose you to significant financial liability beyond reasonable limits.",
                        "severity": "high",
                    },
                    "unclear intellectual property": {
                        "issue": "Ambiguous IP Ownership",
                        "explanation": "Intellectual property ownership rights are not clearly defined, which could cause future disputes.",
                        "severity": "medium",
                    },
                }

                if risk_type in flag_details:
                    flags.append(RedFlag(**flag_details[risk_type]))

        return flags[:3]  # Limit to top 3 red flags

    def _generate_simplified_sections(
        self, text: str, document_type: str
    ) -> List[SimplifiedSection]:
        """Generate simplified explanations of document sections using LLM"""
        section_templates = []
        if document_type == "contract":
            section_templates = [
                (
                    "Your Job & Pay",
                    "Summarize the section(s) about job duties, pay, and benefits in plain English.",
                ),
                (
                    "Rules & Restrictions",
                    "Summarize the section(s) about rules, restrictions, and non-compete clauses in plain English.",
                ),
                (
                    "How Employment Can End",
                    "Summarize the section(s) about termination, notice, and what happens when employment ends in plain English.",
                ),
            ]
        elif document_type == "lease":
            section_templates = [
                (
                    "Rent & Payments",
                    "Summarize the section(s) about rent, payment schedule, and fees in plain English.",
                ),
                (
                    "Your Responsibilities",
                    "Summarize the section(s) about tenant responsibilities and property care in plain English.",
                ),
                (
                    "Ending the Lease",
                    "Summarize the section(s) about ending the lease, notice, and penalties in plain English.",
                ),
            ]
        else:
            section_templates = [
                (
                    "Main Terms",
                    "Summarize the main requirements and obligations in this document in plain English.",
                ),
                (
                    "Rights & Restrictions",
                    "Summarize the rights and restrictions for both parties in plain English.",
                ),
                (
                    "Legal Consequences",
                    "Summarize what happens if someone breaks the agreement, including penalties or legal actions, in plain English.",
                ),
            ]

        sections = []
        for idx, (title, prompt) in enumerate(section_templates, 1):
            llm_prompt = f"{prompt}\n\nDocument:\n{text[:4000]}"
            try:
                content = self.llm.model.generate_content(llm_prompt).text.strip()
            except Exception:
                content = "Summary not available."
            sections.append(SimplifiedSection(title=title, content=content, order=idx))
        return sections

    def _generate_concerns(self, red_flags: List[RedFlag], text: str) -> List[str]:
        """Generate top concerns based on analysis"""
        concerns = [flag.issue for flag in red_flags]

        # Add general concerns if not enough specific ones
        if len(concerns) < 3:
            general_concerns = [
                "Document complexity may require legal review",
                "Some terms may benefit from clarification",
                "Consider professional legal advice for important decisions",
            ]
            concerns.extend(general_concerns[: 3 - len(concerns)])

        return concerns[:3]

    def _generate_recommendations(
        self, red_flags: List[RedFlag], document_type: str
    ) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []

        for flag in red_flags:
            if "non-compete" in flag.issue.lower():
                recommendations.append(
                    "Negotiate to reduce the scope or duration of non-compete restrictions"
                )
            elif "compensation" in flag.issue.lower():
                recommendations.append(
                    "Request more specific details about payment terms and calculation methods"
                )
            elif "termination" in flag.issue.lower():
                recommendations.append(
                    "Seek to add more balanced termination provisions"
                )
            elif "liability" in flag.issue.lower():
                recommendations.append(
                    "Consider requesting liability caps or insurance provisions"
                )
            elif "intellectual property" in flag.issue.lower():
                recommendations.append(
                    "Clarify ownership rights for intellectual property created"
                )

        # Add general recommendations
        if len(recommendations) < 3:
            general_recommendations = [
                "Consider consulting with a legal professional for complex terms",
                "Document any verbal agreements or understandings in writing",
                "Keep copies of all signed documents for your records",
            ]
            recommendations.extend(general_recommendations[: 3 - len(recommendations)])

        return recommendations[:3]

    def _estimate_read_time(self, text: str) -> str:
        """Estimate reading time"""
        word_count = len(text.split()) if text else 0
        minutes = max(1, word_count // 200)  # Average 200 words per minute
        return f"{minutes} minutes"
