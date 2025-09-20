from fastapi import (
    FastAPI,
    APIRouter,
    File,
    UploadFile,
    Form,
    HTTPException,
    BackgroundTasks,
)
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from typing import List, Optional
import uuid
from datetime import datetime
import asyncio
import firebase_admin
from firebase_admin import credentials, firestore

# Import our custom modules
from models import (
    Document,
    DocumentResponse,
    DocumentCreate,
    DocumentAnalysis,
    ChatMessage,
    ChatMessageCreate,
    ChatResponse,
    AnalysisResponse,
)
from document_processor import DocumentProcessor
from analysis_engine import AnalysisEngine

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR.parent / ".env")

# Firebase Admin / Firestore initialization
cred_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
if not firebase_admin._apps:
    if cred_path and os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    else:
        # Attempt to initialize with default credentials (ADC)
        firebase_admin.initialize_app()

fs = firestore.client()

# Initialize processors
doc_processor = DocumentProcessor()
analysis_engine = AnalysisEngine()

# Create the main app without a prefix
app = FastAPI(title="LegalClear API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Firestore helpers
def fs_set(collection: str, doc_id: str, data: dict):
    fs.collection(collection).document(doc_id).set(data)


def fs_update(collection: str, doc_id: str, data: dict):
    fs.collection(collection).document(doc_id).update(data)


def fs_get_doc(collection: str, doc_id: str):
    return fs.collection(collection).document(doc_id).get()


def fs_delete(collection: str, doc_id: str):
    fs.collection(collection).document(doc_id).delete()


# Background task for document analysis
async def analyze_document_task(document_id: str, text: str, document_type: str):
    """Background task to analyze document"""
    try:
        # Update status to analyzing
        fs_update("documents", document_id, {"status": "analyzing"})

        # Simulate some processing time
        await asyncio.sleep(2)

        # Perform analysis
        analysis = analysis_engine.analyze_document(text, document_type, document_id)

        # Save analysis to Firestore
        fs_set("analyses", analysis.id, analysis.dict())

        # Update document status
        fs_update("documents", document_id, {"status": "analyzed"})

        # If the document has user_notes, create a first chat message and answer
        document_snap = fs_get_doc("documents", document_id)
        document = document_snap.to_dict() if document_snap.exists else None
        notes = document.get("user_notes", "").strip() if document else ""
        if notes:
            import uuid
            from models import ChatMessage

            # Use a default session ID for notes-based chat so frontend can find it
            notes_session_id = "notes_session"

            # Create user message
            user_message = ChatMessage(
                document_id=document_id,
                session_id=notes_session_id,
                message_type="user",
                message=notes,
            )
            fs_set("chat_messages", user_message.id, user_message.dict())

            # Generate LLM answer
            from chat_engine import LegalDocumentAnalyzer

            chat_engine = LegalDocumentAnalyzer()
            ai_response_text = chat_engine.answer_question(text, [], notes)
            ai_message = ChatMessage(
                document_id=document_id,
                session_id=notes_session_id,
                message_type="assistant",
                message=ai_response_text,
            )
            fs_set("chat_messages", ai_message.id, ai_message.dict())

        print(f"Analysis completed for document {document_id}")
    except Exception as e:
        print(f"Analysis failed for document {document_id}: {str(e)}")
        fs_update("documents", document_id, {"status": "error"})


# Routes
@app.get("/")
async def base_root():
    return {
        "message": "LegalClear API is running",
        "docs_url": "/docs",
        "api_base": "/api/",
    }


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}


@api_router.get("/")
async def root():
    return {"message": "LegalClear API is running"}


# Document endpoints
@api_router.post("/documents/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    document_name: str = Form(...),
    document_type: str = Form(...),
    notes: str = Form(""),
):
    """Upload and process a legal document"""
    try:
        # Validate file type
        allowed_types = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
        ]

        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Only PDF, DOC, DOCX, and TXT files are supported.",
            )

        # Validate file size (10MB limit)
        file_content = await file.read()
        if len(file_content) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=400, detail="File too large. Maximum size is 10MB."
            )

        # Save file
        file_path = doc_processor.save_file(file_content, file.filename)

        # Extract text
        text_content = doc_processor.extract_text(file_path)

        # Create document record
        document = Document(
            name=document_name,
            original_filename=file.filename,
            file_path=file_path,
            document_type=document_type,
            user_notes=notes,
            file_size=len(file_content),
            content_text=text_content,
            status="uploaded",
        )

        # Save to Firestore (use our UUID as the document ID)
        fs_set("documents", document.id, document.dict())

        # Start background analysis
        background_tasks.add_task(
            analyze_document_task, document.id, text_content, document_type
        )

        return {
            "document_id": document.id,
            "status": "uploaded",
            "message": "Document uploaded successfully and analysis started",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@api_router.get("/documents", response_model=List[DocumentResponse])
async def get_documents():
    """Get all documents"""
    try:
        docs_stream = fs.collection("documents").stream()
        result: List[DocumentResponse] = []
        for snap in docs_stream:
            doc = snap.to_dict() or {}
            # Add summary and complexity from processor
            if doc.get("content_text"):
                complexity = doc_processor.analyze_complexity(doc["content_text"])
                summary = doc_processor.generate_summary(
                    doc["content_text"], doc["document_type"]
                )
            else:
                complexity = "low"
                summary = "Document uploaded successfully. Analysis pending."

            doc_response = DocumentResponse(
                id=doc.get("id", snap.id),
                name=doc.get("name", ""),
                original_filename=doc.get("original_filename", ""),
                document_type=doc.get("document_type", ""),
                upload_date=doc.get("upload_date", datetime.utcnow()),
                status=doc.get("status", "uploaded"),
                user_notes=doc.get("user_notes", ""),
                file_size=doc.get("file_size", 0),
                summary=summary,
                complexity=complexity,
            )
            result.append(doc_response)

        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch documents: {str(e)}"
        )


@api_router.get("/documents/{document_id}")
async def get_document(document_id: str):
    """Get a specific document with analysis if available"""
    try:
        # Find document
        snap = fs_get_doc("documents", document_id)
        if not snap.exists:
            raise HTTPException(status_code=404, detail="Document not found")
        document = snap.to_dict() or {}

        # Find analysis
        analysis = None
        analysis_stream = (
            fs.collection("analyses")
            .where("document_id", "==", document_id)
            .limit(1)
            .stream()
        )
        for a in analysis_stream:
            analysis = a.to_dict() or None
            break

        # Add summary and complexity
        if document.get("content_text"):
            complexity = doc_processor.analyze_complexity(document["content_text"])
            summary = doc_processor.generate_summary(
                document["content_text"], document["document_type"]
            )
        else:
            complexity = "low"
            summary = "Document uploaded successfully. Analysis pending."

        result = {**document, "summary": summary, "complexity": complexity}

        if analysis:
            result["analysis"] = analysis

        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch document: {str(e)}"
        )


@api_router.get("/documents/{document_id}/analysis")
async def get_analysis(document_id: str):
    """Get analysis for a specific document"""
    try:
        analysis = None
        analysis_stream = (
            fs.collection("analyses")
            .where("document_id", "==", document_id)
            .limit(1)
            .stream()
        )
        for a in analysis_stream:
            analysis = a.to_dict() or None
            break
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")

        return analysis
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch analysis: {str(e)}"
        )


@api_router.delete("/documents/{document_id}")
async def delete_document(document_id: str):
    """Delete a document and its analysis"""
    try:
        # Delete document
        snap = fs_get_doc("documents", document_id)
        if not snap.exists:
            raise HTTPException(status_code=404, detail="Document not found")
        fs_delete("documents", document_id)

        # Delete associated analyses
        for a in (
            fs.collection("analyses").where("document_id", "==", document_id).stream()
        ):
            fs_delete("analyses", a.id)

        # Delete chat messages
        for m in (
            fs.collection("chat_messages")
            .where("document_id", "==", document_id)
            .stream()
        ):
            fs_delete("chat_messages", m.id)

        return {"success": True, "message": "Document deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to delete document: {str(e)}"
        )


# Chat endpoints
from chat_engine import LegalDocumentAnalyzer

chat_engine = LegalDocumentAnalyzer()


@api_router.post("/documents/{document_id}/chat")
async def send_chat_message(document_id: str, message_data: ChatMessageCreate):
    """Send a chat message and get AI response"""
    try:
        # Verify document exists
        doc_snap = fs_get_doc("documents", document_id)
        if not doc_snap.exists:
            raise HTTPException(status_code=404, detail="Document not found")
        document = doc_snap.to_dict() or {}

        # Generate session ID if not provided
        session_id = message_data.session_id or str(uuid.uuid4())

        # Save user message
        user_message = ChatMessage(
            document_id=document_id,
            session_id=session_id,
            message_type="user",
            message=message_data.message,
        )
        fs_set("chat_messages", user_message.id, user_message.dict())

        # Fetch recent chat history for context
        chat_history = []
        for msg in (
            fs.collection("chat_messages")
            .where("document_id", "==", document_id)
            .where("session_id", "==", session_id)
            .stream()
        ):
            chat_history.append(msg.to_dict())
        chat_history.sort(key=lambda m: m.get("timestamp"))

        # Get document text
        document_text = document.get("content_text", "")
        if not document_text:
            ai_response_text = (
                "Document analysis is still in progress. Please try again later."
            )
        else:
            # Generate AI response using chat_engine
            history_for_engine = [
                {"type": msg["message_type"], "message": msg["message"]}
                for msg in chat_history
            ]
            ai_response_text = chat_engine.answer_question(
                document_text, history_for_engine, message_data.message
            )

        # Save AI response
        ai_message = ChatMessage(
            document_id=document_id,
            session_id=session_id,
            message_type="assistant",
            message=ai_response_text,
        )
        fs_set("chat_messages", ai_message.id, ai_message.dict())

        return ChatResponse(
            id=ai_message.id,
            type="assistant",
            message=ai_response_text,
            timestamp=ai_message.timestamp,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


@api_router.get("/documents/{document_id}/chat")
async def get_chat_history(document_id: str, session_id: Optional[str] = None):
    """Get chat history for a document"""
    try:
        # Build Firestore query
        col = fs.collection("chat_messages")
        msgs: List[dict] = []
        if session_id:
            # Fetch current session
            for snap in (
                col.where("document_id", "==", document_id)
                .where("session_id", "==", session_id)
                .stream()
            ):
                msgs.append(snap.to_dict() or {})
            # Fetch notes session
            for snap in (
                col.where("document_id", "==", document_id)
                .where("session_id", "==", "notes_session")
                .stream()
            ):
                msgs.append(snap.to_dict() or {})
        else:
            for snap in col.where("document_id", "==", document_id).stream():
                msgs.append(snap.to_dict() or {})

        # Sort by timestamp client-side to avoid composite index requirement
        msgs.sort(key=lambda m: m.get("timestamp"))

        result: List[ChatResponse] = []
        for msg in msgs:
            result.append(
                ChatResponse(
                    id=msg.get("id", ""),
                    type=msg.get("message_type", "assistant"),
                    message=msg.get("message", ""),
                    timestamp=msg.get("timestamp", datetime.utcnow()),
                )
            )

        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch chat history: {str(e)}"
        )


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    # No explicit shutdown needed for Firestore client
    return
