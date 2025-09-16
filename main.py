"""
Legal Document Analysis Pipeline
A comprehensive system for analyzing legal contracts using AI and NLP techniques.

Dependencies:
pip install pdfplumber spacy google-generativeai openai python-dotenv
python -m spacy download en_core_web_sm
"""

import os
import re
import json
import logging
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
from datetime import datetime
import pdfplumber
import spacy
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class Entity:
    """Structured entity representation"""
    text: str
    label: str
    start: int
    end: int

@dataclass
class Clause:
    """Structured clause representation"""
    type: str
    original: str
    summary: str
    risk: str
    entities: List[Entity]

@dataclass
class ContractSchema:
    """Main contract structure"""
    parties: List[str]
    dates: Dict[str, Any]
    financial_obligations: Dict[str, Any]
    clauses: List[Clause]
    metadata: Dict[str, Any]

class LegalDocumentAnalyzer:
    """Main pipeline class for legal document analysis"""
    
    def __init__(self, gemini_api_key: Optional[str] = None, openai_api_key: Optional[str] = None):
        """
        Initialize the analyzer with API keys
        
        Args:
            gemini_api_key: Google Gemini API key
            openai_api_key: OpenAI API key (alternative to Gemini)
        """
        self.gemini_api_key = gemini_api_key or os.getenv('GEMINI_API_KEY')
        self.openai_api_key = openai_api_key or os.getenv('OPENAI_API_KEY')
        
        # Initialize Gemini if key available
        if self.gemini_api_key:
            genai.configure(api_key=self.gemini_api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Initialize spaCy for NER
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            logger.error("spaCy model not found. Install with: python -m spacy download en_core_web_sm")
            raise
        
        # Define clause keywords for detection
        self.clause_keywords = {
            "termination": ["termination", "terminate", "end", "expiry", "expire"],
            "liability": ["liability", "liable", "responsible", "damages"],
            "penalty": ["penalty", "fine", "fee", "charge", "forfeit"],
            "payment": ["payment", "pay", "rent", "fee", "cost", "price"],
            "confidentiality": ["confidential", "non-disclosure", "nda", "secret"],
            "indemnification": ["indemnify", "indemnification", "hold harmless"],
            "intellectual_property": ["intellectual property", "copyright", "trademark", "patent"],
            "force_majeure": ["force majeure", "act of god", "unforeseeable"],
        }

    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """
        Extract and clean text from PDF using pdfplumber
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            Cleaned text string
        """
        try:
            text = ""
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            
            # Clean and normalize text
            text = self._clean_text(text)
            logger.info(f"Successfully extracted {len(text)} characters from PDF")
            return text
            
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            raise

    def _clean_text(self, text: str) -> str:
        """Clean and normalize extracted text"""
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters but keep punctuation
        text = re.sub(r'[^\w\s.,;:!?()\-\'"$%]', '', text)
        # Normalize quotes
        text = re.sub(r'["""]', '"', text)
        text = re.sub(r"[']+", "'", text)
        return text.strip()

    def split_into_clauses(self, text: str) -> Dict[str, List[str]]:
        """
        Split document text into clauses based on keywords and structure
        
        Args:
            text: Full document text
            
        Returns:
            Dictionary mapping clause types to text segments
        """
        clauses = {}
        
        # Split text into sentences for better processing
        sentences = re.split(r'(?<=[.!?])\s+', text)
        
        for clause_type, keywords in self.clause_keywords.items():
            matching_segments = []
            
            # Look for sections containing keywords
            for i, sentence in enumerate(sentences):
                sentence_lower = sentence.lower()
                
                if any(keyword in sentence_lower for keyword in keywords):
                    # Include context (previous and next sentences)
                    start_idx = max(0, i-1)
                    end_idx = min(len(sentences), i+3)
                    segment = " ".join(sentences[start_idx:end_idx])
                    
                    if len(segment) > 50:  # Filter out very short matches
                        matching_segments.append(segment)
            
            if matching_segments:
                clauses[clause_type] = matching_segments
        
        # Add a general clause for unmatched content
        if not clauses:
            clauses["general"] = [text[:1000]]  # First 1000 chars as fallback
        
        logger.info(f"Identified {len(clauses)} clause types")
        return clauses

    def summarize_clause_with_llm(self, clause_text: str, clause_type: str) -> Tuple[str, str]:
        """
        Use LLM to summarize clause and assess risk
        
        Args:
            clause_text: Original clause text
            clause_type: Type of clause (termination, payment, etc.)
            
        Returns:
            Tuple of (summary, risk_assessment)
        """
        try:
            prompt = f"""
            Analyze this {clause_type} clause from a legal contract:
            
            "{clause_text}"
            
            Please provide:
            1. A clear, plain-English summary (2-3 sentences)
            2. Risk assessment: "High Risk", "Medium Risk", "Low Risk", or "Safe"
            
            Focus on:
            - Key obligations and responsibilities
            - Potential penalties or consequences
            - Rights and restrictions
            - Financial implications
            
            Format your response as:
            SUMMARY: [your summary]
            RISK: [risk level]
            """
            
            if self.gemini_api_key:
                response = self.model.generate_content(prompt)
                result = response.text
            else:
                # Fallback to simple rule-based analysis if no API key
                result = self._fallback_analysis(clause_text, clause_type)
            
            # Parse response
            summary, risk = self._parse_llm_response(result)
            return summary, risk
            
        except Exception as e:
            logger.error(f"Error in LLM analysis: {str(e)}")
            return self._fallback_analysis(clause_text, clause_type)

    def _fallback_analysis(self, clause_text: str, clause_type: str) -> Tuple[str, str]:
        """Fallback analysis when LLM is unavailable"""
        summary = f"This is a {clause_type} clause containing standard legal terms."
        
        # Simple risk assessment based on keywords
        high_risk_words = ["penalty", "forfeit", "terminate", "breach", "damages", "liable"]
        risk_count = sum(1 for word in high_risk_words if word in clause_text.lower())
        
        if risk_count >= 3:
            risk = "High Risk"
        elif risk_count >= 1:
            risk = "Medium Risk"
        else:
            risk = "Safe"
            
        return summary, risk

    def _parse_llm_response(self, response: str) -> Tuple[str, str]:
        """Parse LLM response to extract summary and risk"""
        try:
            summary_match = re.search(r'SUMMARY:\s*(.+?)(?=RISK:|$)', response, re.DOTALL)
            risk_match = re.search(r'RISK:\s*(.+?)$', response, re.DOTALL)
            
            summary = summary_match.group(1).strip() if summary_match else "Summary not available"
            risk = risk_match.group(1).strip() if risk_match else "Safe"
            
            return summary, risk
        except Exception:
            return "Analysis not available", "Safe"

    def extract_entities(self, text: str) -> Dict[str, List[Entity]]:
        """
        Extract entities using spaCy NER
        
        Args:
            text: Text to analyze
            
        Returns:
            Dictionary of entity categories and their instances
        """
        doc = self.nlp(text)
        entities = {
            "parties": [],
            "dates": [],
            "money": [],
            "organizations": [],
            "persons": []
        }
        
        for ent in doc.ents:
            entity = Entity(
                text=ent.text,
                label=ent.label_,
                start=ent.start_char,
                end=ent.end_char
            )
            
            if ent.label_ in ["ORG"]:
                entities["organizations"].append(entity)
                entities["parties"].append(entity)  # Organizations are often parties
            elif ent.label_ in ["PERSON"]:
                entities["persons"].append(entity)
                entities["parties"].append(entity)  # Persons can be parties
            elif ent.label_ in ["DATE"]:
                entities["dates"].append(entity)
            elif ent.label_ in ["MONEY"]:
                entities["money"].append(entity)
        
        # Custom pattern matching for legal terms
        parties_patterns = [
            r'\b(lessor|lessee|landlord|tenant|buyer|seller|contractor|client)\b',
            r'\b(party|parties)\s+(?:of\s+)?(?:the\s+)?(?:first|second|third)\s+part\b'
        ]
        
        for pattern in parties_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                entity = Entity(
                    text=match.group(),
                    label="PARTY",
                    start=match.start(),
                    end=match.end()
                )
                entities["parties"].append(entity)
        
        logger.info(f"Extracted entities: {sum(len(v) for v in entities.values())} total")
        return entities

    def build_contract_schema(self, text: str, clauses: Dict[str, List[str]]) -> ContractSchema:
        """
        Build structured contract representation
        
        Args:
            text: Full document text
            clauses: Extracted clauses by type
            
        Returns:
            ContractSchema object
        """
        # Extract entities from full text
        entities = self.extract_entities(text)
        
        # Process each clause
        processed_clauses = []
        for clause_type, clause_texts in clauses.items():
            for clause_text in clause_texts:
                summary, risk = self.summarize_clause_with_llm(clause_text, clause_type)
                clause_entities = self.extract_entities(clause_text)
                
                clause = Clause(
                    type=clause_type,
                    original=clause_text,
                    summary=summary,
                    risk=risk,
                    entities=[e for entity_list in clause_entities.values() for e in entity_list]
                )
                processed_clauses.append(clause)
        
        # Build structured schema
        schema = ContractSchema(
            parties=[e.text for e in entities["parties"]],
            dates={
                "mentioned_dates": [e.text for e in entities["dates"]],
                "extracted_at": datetime.now().isoformat()
            },
            financial_obligations={
                "monetary_amounts": [e.text for e in entities["money"]],
                "payment_clauses": [c for c in processed_clauses if c.type == "payment"]
            },
            clauses=processed_clauses,
            metadata={
                "total_clauses": len(processed_clauses),
                "high_risk_clauses": len([c for c in processed_clauses if "High Risk" in c.risk]),
                "processing_date": datetime.now().isoformat()
            }
        )
        
        return schema

    def simulate_scenarios(self, schema: ContractSchema) -> Dict[str, str]:
        """
        Rule-based simulation engine for contract scenarios
        
        Args:
            schema: Processed contract schema
            
        Returns:
            Dictionary of scenarios and their explanations
        """
        scenarios = {}
        
        # Rule 1: Early termination scenario
        termination_clauses = [c for c in schema.clauses if c.type == "termination"]
        if termination_clauses:
            penalty_info = self._extract_penalty_info(termination_clauses)
            scenario_text = f"Early Termination Scenario: {penalty_info}"
            scenarios["early_termination"] = self._explain_scenario_with_llm(scenario_text)
        
        # Rule 2: Late payment scenario
        payment_clauses = [c for c in schema.clauses if c.type == "payment"]
        if payment_clauses:
            payment_info = self._extract_payment_consequences(payment_clauses)
            scenario_text = f"Late Payment Scenario: {payment_info}"
            scenarios["late_payment"] = self._explain_scenario_with_llm(scenario_text)
        
        # Rule 3: Liability scenario
        liability_clauses = [c for c in schema.clauses if c.type == "liability"]
        if liability_clauses:
            liability_info = self._extract_liability_info(liability_clauses)
            scenario_text = f"Liability Scenario: {liability_info}"
            scenarios["liability_event"] = self._explain_scenario_with_llm(scenario_text)
        
        # Rule 4: Confidentiality breach
        confidentiality_clauses = [c for c in schema.clauses if c.type == "confidentiality"]
        if confidentiality_clauses:
            confidentiality_info = self._extract_confidentiality_consequences(confidentiality_clauses)
            scenario_text = f"Confidentiality Breach: {confidentiality_info}"
            scenarios["confidentiality_breach"] = self._explain_scenario_with_llm(scenario_text)
        
        logger.info(f"Generated {len(scenarios)} scenario simulations")
        return scenarios

    def _extract_penalty_info(self, clauses: List[Clause]) -> str:
        """Extract penalty information from termination clauses"""
        for clause in clauses:
            # Look for monetary penalties
            money_pattern = r'\$[\d,]+|\d+\s*(?:months?|days?)\s*(?:rent|payment|fee)'
            matches = re.findall(money_pattern, clause.original, re.IGNORECASE)
            if matches:
                return f"Penalty may include {', '.join(matches)}"
        return "Standard termination procedures apply"

    def _extract_payment_consequences(self, clauses: List[Clause]) -> str:
        """Extract consequences for late payments"""
        for clause in clauses:
            if any(word in clause.original.lower() for word in ["late", "overdue", "default"]):
                # Look for interest rates or fees
                rate_pattern = r'\d+(?:\.\d+)?%|\$\d+(?:,\d{3})*(?:\.\d{2})?'
                matches = re.findall(rate_pattern, clause.original)
                if matches:
                    return f"Late payment may result in additional charges: {', '.join(matches)}"
        return "Late payment fees may apply"

    def _extract_liability_info(self, clauses: List[Clause]) -> str:
        """Extract liability information"""
        return "Liability terms apply as specified in the contract"

    def _extract_confidentiality_consequences(self, clauses: List[Clause]) -> str:
        """Extract confidentiality breach consequences"""
        return "Confidentiality breach may result in legal action and damages"

    def _explain_scenario_with_llm(self, scenario_text: str) -> str:
        """Use LLM to provide plain-English explanation of scenario"""
        try:
            if self.gemini_api_key:
                prompt = f"""
                Explain this contract scenario in plain, simple English:
                "{scenario_text}"
                
                Make it easy to understand for someone without legal background.
                Be specific about consequences and actions required.
                """
                response = self.model.generate_content(prompt)
                return response.text.strip()
            else:
                return f"Scenario: {scenario_text}"
                
        except Exception as e:
            logger.error(f"Error explaining scenario: {str(e)}")
            return f"Scenario: {scenario_text}"

    def analyze_document(self, pdf_path: str) -> Dict[str, Any]:
        """
        Main pipeline function - analyze complete document
        
        Args:
            pdf_path: Path to PDF file
            
        Returns:
            Complete analysis as JSON-serializable dictionary
        """
        try:
            logger.info(f"Starting analysis of {pdf_path}")
            
            # Step 1: Extract text
            text = self.extract_text_from_pdf(pdf_path)
            
            # Step 2: Split into clauses
            clauses = self.split_into_clauses(text)
            
            # Step 3-5: Build structured schema (includes summarization and entity extraction)
            schema = self.build_contract_schema(text, clauses)
            
            # Step 6: Generate scenarios
            scenarios = self.simulate_scenarios(schema)
            
            # Convert to JSON-serializable format
            result = {
                "document_info": {
                    "source": pdf_path,
                    "processed_at": datetime.now().isoformat(),
                    "text_length": len(text)
                },
                "parties": schema.parties,
                "dates": schema.dates,
                "financial_obligations": {
                    "monetary_amounts": schema.financial_obligations["monetary_amounts"],
                    "payment_clauses_count": len(schema.financial_obligations["payment_clauses"])
                },
                "clauses": [
                    {
                        "type": clause.type,
                        "original": clause.original[:500] + "..." if len(clause.original) > 500 else clause.original,
                        "summary": clause.summary,
                        "risk": clause.risk,
                        "entity_count": len(clause.entities)
                    }
                    for clause in schema.clauses
                ],
                "scenarios": scenarios,
                "metadata": schema.metadata
            }
            
            logger.info("Document analysis completed successfully")
            return result
            
        except Exception as e:
            logger.error(f"Error in document analysis: {str(e)}")
            return {
                "error": str(e),
                "document_info": {"source": pdf_path, "processed_at": datetime.now().isoformat()},
                "parties": [],
                "dates": {},
                "financial_obligations": {"monetary_amounts": [], "payment_clauses_count": 0},
                "clauses": [],
                "scenarios": {},
                "metadata": {"error": True}
            }

def main():
    """
    Example usage of the Legal Document Analyzer
    """
    # Initialize analyzer (API keys should be in .env file)
    analyzer = LegalDocumentAnalyzer()
    
    # Example usage
    pdf_path = "Contract.pdf"  # Replace with actual PDF path
    
    try:
        # Analyze document
        result = analyzer.analyze_document(pdf_path)
        
        # Pretty print results
        print(json.dumps(result, indent=2, default=str))
        
        # Save to file
        with open("contract_analysis.json", "w") as f:
            json.dump(result, f, indent=2, default=str)
        
        print("\nAnalysis completed! Results saved to contract_analysis.json")
        
    except FileNotFoundError:
        print(f"PDF file not found: {pdf_path}")
        print("Please provide a valid PDF file path")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    main()