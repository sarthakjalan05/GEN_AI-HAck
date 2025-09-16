from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

# Document Models
class DocumentCreate(BaseModel):
    name: str
    document_type: str
    notes: Optional[str] = ""

class Document(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    original_filename: str
    file_path: str
    document_type: str
    upload_date: datetime = Field(default_factory=datetime.utcnow)
    status: str = "uploaded"  # uploaded, analyzing, analyzed, error
    user_notes: str = ""
    file_size: int
    content_text: str = ""

class DocumentResponse(BaseModel):
    id: str
    name: str
    original_filename: str
    document_type: str
    upload_date: datetime
    status: str
    user_notes: str
    file_size: int
    summary: Optional[str] = ""
    complexity: Optional[str] = ""

# Analysis Models
class KeyTerm(BaseModel):
    term: str
    definition: str
    importance: str  # high, medium, low
    location: str

class RedFlag(BaseModel):
    issue: str
    explanation: str
    severity: str  # high, medium, low

class SimplifiedSection(BaseModel):
    title: str
    content: str
    order: int = 0

class DocumentAnalysis(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    document_id: str
    overall_score: float
    readability_score: float
    fairness_score: float
    risk_level: str  # high, medium, low
    complexity: str  # high, medium, low
    estimated_read_time: str
    top_concerns: List[str]
    recommendations: List[str]
    key_terms: List[KeyTerm]
    red_flags: List[RedFlag]
    simplified_sections: List[SimplifiedSection]
    analysis_date: datetime = Field(default_factory=datetime.utcnow)

class AnalysisResponse(BaseModel):
    document_id: str
    overall_score: float
    readability_score: float
    fairness_score: float
    risk_level: str
    estimated_read_time: str
    top_concerns: List[str]
    recommendations: List[str]

# Chat Models
class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    document_id: str
    session_id: str
    message_type: str  # user, assistant
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatMessageCreate(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    id: str
    type: str
    message: str
    timestamp: datetime