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
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional
import uuid
from datetime import datetime
import asyncio

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
load_dotenv(ROOT_DIR / ".env")

# MongoDB connection
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

# Initialize processors
doc_processor = DocumentProcessor()
analysis_engine = AnalysisEngine()

# Create the main app without a prefix
app = FastAPI(title="LegalClear API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Helper function to convert MongoDB documents
def convert_mongo_document(doc):
    if doc and "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc


# Background task for document analysis
async def analyze_document_task(document_id: str, text: str, document_type: str):
    """Background task to analyze document"""
    try:
        # Update status to analyzing
        await db.documents.update_one(
            {"id": document_id}, {"$set": {"status": "analyzing"}}
        )

        # Simulate some processing time
        await asyncio.sleep(2)

        # Perform analysis
        analysis = analysis_engine.analyze_document(text, document_type, document_id)

        # Save analysis to database
        await db.analyses.insert_one(analysis.dict())

        # Update document status
        await db.documents.update_one(
            {"id": document_id}, {"$set": {"status": "analyzed"}}
        )

        print(f"Analysis completed for document {document_id}")
    except Exception as e:
        print(f"Analysis failed for document {document_id}: {str(e)}")
        await db.documents.update_one(
            {"id": document_id}, {"$set": {"status": "error"}}
        )


# Routes
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

        # Save to database
        await db.documents.insert_one(document.dict())

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
        documents = await db.documents.find().to_list(1000)
        result = []

        for doc in documents:
            # Convert MongoDB document
            doc = convert_mongo_document(doc)

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
                **doc, summary=summary, complexity=complexity
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
        document = await db.documents.find_one({"id": document_id})
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        document = convert_mongo_document(document)

        # Find analysis
        analysis = await db.analyses.find_one({"document_id": document_id})
        if analysis:
            analysis = convert_mongo_document(analysis)

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
        analysis = await db.analyses.find_one({"document_id": document_id})
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")

        return convert_mongo_document(analysis)
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
        result = await db.documents.delete_one({"id": document_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Document not found")

        # Delete associated analysis
        await db.analyses.delete_many({"document_id": document_id})

        # Delete chat messages
        await db.chat_messages.delete_many({"document_id": document_id})

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
        document = await db.documents.find_one({"id": document_id})
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        # Generate session ID if not provided
        session_id = message_data.session_id or str(uuid.uuid4())

        # Save user message
        user_message = ChatMessage(
            document_id=document_id,
            session_id=session_id,
            message_type="user",
            message=message_data.message,
        )
        await db.chat_messages.insert_one(user_message.dict())

        # Fetch recent chat history for context
        chat_history_cursor = db.chat_messages.find(
            {"document_id": document_id, "session_id": session_id}
        ).sort("timestamp", 1)
        chat_history = await chat_history_cursor.to_list(20)

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
        await db.chat_messages.insert_one(ai_message.dict())

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
        query = {"document_id": document_id}
        if session_id:
            query["session_id"] = session_id

        messages = await db.chat_messages.find(query).sort("timestamp", 1).to_list(1000)

        result = []
        for msg in messages:
            msg = convert_mongo_document(msg)
            result.append(
                ChatResponse(
                    id=msg["id"],
                    type=msg["message_type"],
                    message=msg["message"],
                    timestamp=msg["timestamp"],
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
    client.close()
