import os
import PyPDF2
import docx
from typing import Tuple, Optional
import re
import random


class DocumentProcessor:
    def __init__(self):
        # Use a writable directory compatible with serverless platforms
        # Prefer UPLOAD_DIR env, fallback to /tmp/uploads (GAE/Cloud Run writable)
        self.upload_dir = os.environ.get("UPLOAD_DIR", "/tmp/uploads")
        os.makedirs(self.upload_dir, exist_ok=True)

    def save_file(self, file_content: bytes, filename: str) -> str:
        """Save uploaded file and return file path"""
        # Create unique filename to avoid conflicts
        name, ext = os.path.splitext(filename)
        unique_filename = f"{name}_{random.randint(1000, 9999)}{ext}"
        file_path = os.path.join(self.upload_dir, unique_filename)

        with open(file_path, "wb") as f:
            f.write(file_content)

        return file_path

    def extract_text(self, file_path: str) -> str:
        """Extract text from various file formats"""
        try:
            if file_path.lower().endswith(".pdf"):
                return self._extract_from_pdf(file_path)
            elif file_path.lower().endswith((".doc", ".docx")):
                return self._extract_from_docx(file_path)
            elif file_path.lower().endswith(".txt"):
                return self._extract_from_txt(file_path)
            else:
                raise ValueError("Unsupported file format")
        except Exception as e:
            print(f"Error extracting text: {str(e)}")
            return ""

    def _extract_from_pdf(self, file_path: str) -> str:
        """Extract text from Pnpm install -g firebase-toolsDF file"""
        text = ""
        try:
            with open(file_path, "rb") as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
        except Exception as e:
            print(f"Error reading PDF: {str(e)}")
        return text

    def _extract_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX file"""
        text = ""
        try:
            doc = docx.Document(file_path)
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
        except Exception as e:
            print(f"Error reading DOCX: {str(e)}")
        return text

    def _extract_from_txt(self, file_path: str) -> str:
        """Extract text from TXT file"""
        try:
            with open(file_path, "r", encoding="utf-8") as file:
                return file.read()
        except Exception as e:
            print(f"Error reading TXT: {str(e)}")
            return ""

    def analyze_complexity(self, text: str) -> str:
        """Simple complexity analysis based on text characteristics"""
        if not text:
            return "low"

        word_count = len(text.split())
        avg_word_length = (
            sum(len(word) for word in text.split()) / word_count
            if word_count > 0
            else 0
        )
        sentence_count = len(re.findall(r"[.!?]+", text))
        avg_sentence_length = word_count / sentence_count if sentence_count > 0 else 0

        # Simple heuristic for complexity
        if avg_word_length > 6 and avg_sentence_length > 25:
            return "high"
        elif avg_word_length > 5 and avg_sentence_length > 15:
            return "medium"
        else:
            return "low"

    def estimate_read_time(self, text: str) -> str:
        """Estimate reading time (average 200 words per minute)"""
        word_count = len(text.split()) if text else 0
        minutes = max(1, word_count // 200)
        return f"{minutes} minutes"

    def generate_summary(self, text: str, doc_type: str) -> str:
        """Generate a basic summary based on document type"""
        if not text:
            return "Document uploaded successfully. Analysis pending."

        word_count = len(text.split())

        summaries = {
            "contract": f"This contract contains {word_count} words covering terms, conditions, responsibilities, and legal obligations. Key areas include compensation, duties, termination, and compliance requirements.",
            "lease": f"This lease agreement spans {word_count} words detailing rental terms, tenant responsibilities, property conditions, and legal obligations for both parties.",
            "loan": f"This loan agreement contains {word_count} words outlining borrowing terms, repayment schedules, interest rates, and default conditions.",
            "nda": f"This non-disclosure agreement has {word_count} words covering confidentiality obligations, permitted disclosures, and legal consequences of breaches.",
            "terms": f"These terms of service contain {word_count} words governing platform usage, user rights, service limitations, and legal compliance requirements.",
            "other": f"This legal document contains {word_count} words covering various legal provisions, rights, obligations, and procedural requirements.",
        }

        return summaries.get(doc_type, summaries["other"])
