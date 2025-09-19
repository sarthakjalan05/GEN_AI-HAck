"""
Chat Engine for Legal Document Chatbot
Refactored from main.py for backend integration.
"""

import os
import re
import logging
import pdfplumber
import spacy
import google.generativeai as genai
from dotenv import load_dotenv
from datetime import datetime
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass

# Load environment variables
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class Entity:
    text: str
    label: str
    start: int
    end: int


@dataclass
class Clause:
    type: str
    original: str
    summary: str
    risk: str
    entities: List[Entity]


class LegalDocumentAnalyzer:
    def __init__(
        self, gemini_api_key: Optional[str] = None, openai_api_key: Optional[str] = None
    ):
        self.gemini_api_key = gemini_api_key or os.getenv("GEMINI_API_KEY")
        self.openai_api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        if self.gemini_api_key:
            genai.configure(api_key=self.gemini_api_key)
            self.model = genai.GenerativeModel("gemini-2.0-flash")
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            logger.error(
                "spaCy model not found. Install with: python -m spacy download en_core_web_sm"
            )
            raise
        self.clause_keywords = {
            "termination": ["termination", "terminate", "end", "expiry", "expire"],
            "liability": ["liability", "liable", "responsible", "damages"],
            "penalty": ["penalty", "fine", "fee", "charge", "forfeit"],
            "payment": ["payment", "pay", "rent", "fee", "cost", "price"],
            "confidentiality": ["confidential", "non-disclosure", "nda", "secret"],
            "indemnification": ["indemnify", "indemnification", "hold harmless"],
            "intellectual_property": [
                "intellectual property",
                "copyright",
                "trademark",
                "patent",
            ],
            "force_majeure": ["force majeure", "act of god", "unforeseeable"],
        }

    def answer_question(
        self, document_text: str, chat_history: List[Dict[str, Any]], user_message: str
    ) -> str:
        """
        Generate chatbot answer based on document and chat history.
        Args:
            document_text: The full text of the legal document.
            chat_history: List of previous chat messages (dicts with 'type' and 'message').
            user_message: The user's current question.
        Returns:
            Assistant's answer string.
        """
        # Build context prompt
        history_str = "\n".join(
            [
                f"{msg['type'].capitalize()}: {msg['message']}"
                for msg in chat_history[-10:]
            ]
        )
        prompt = f"""
        You are a legal contract analysis assistant. Use the following document and chat history to answer the user's question.
        
        - If the user asks about a legal term, always provide a clear definition and explain its meaning in simple language.
        - If the user asks about a legal concept or clause, explain it in plain English and provide context or examples if possible.
        - If the user asks about the document, summarize relevant legal sections and explain what they mean.
        
        Document:
        """
        prompt += document_text[:4000]  # Cap context for LLM
        prompt += (
            f"\n\nChat History:\n{history_str}\n\nUser Question: {user_message}\n\n"
        )
        prompt += (
            "Reply in clear, plain English. Reference relevant sections if possible."
        )
        try:
            if self.gemini_api_key:
                response = self.model.generate_content(prompt)
                return response.text.strip()
            else:
                # Fallback: simple rule-based answer
                return f"Based on the document, here's what I found: {user_message}"
        except Exception as e:
            logger.error(f"Error generating answer: {str(e)}")
            return "Sorry, I couldn't process your question due to an internal error."
