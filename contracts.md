# Backend Implementation Contracts - LegalClear

## API Contracts

### 1. Document Upload & Management
```
POST /api/documents/upload
- Form data: file, document_name, document_type, notes
- Response: { document_id, status, message }

GET /api/documents
- Response: Array of document objects with basic info

GET /api/documents/{id}
- Response: Full document object with analysis

DELETE /api/documents/{id}
- Response: { success, message }
```

### 2. Document Analysis
```
GET /api/documents/{id}/analysis
- Response: Analysis result object with scores, terms, risks, etc.

POST /api/documents/{id}/analyze
- Trigger analysis for uploaded document
- Response: { status, estimated_time }
```

### 3. Chat/Questions
```
POST /api/documents/{id}/chat
- Body: { message, session_id }
- Response: { response, message_id, timestamp }

GET /api/documents/{id}/chat
- Response: Array of chat messages for document
```

## Mock Data to Replace

### From mock.js:
1. **mockDocuments** → Replace with MongoDB document collection
   - Document metadata (name, type, upload date, status)
   - Analysis status and complexity
   - Summary text

2. **mockAnalysisResult** → Replace with actual analysis engine
   - Overall, readability, fairness scores
   - Risk level assessment
   - Top concerns and recommendations
   - Key terms with definitions
   - Red flags identification

3. **mockChat** → Replace with real chat system
   - User questions and AI responses
   - Chat history persistence
   - Session management

## Backend Implementation Plan

### 1. MongoDB Models
```python
# Document model
class Document:
    - id: ObjectId
    - name: str
    - original_filename: str
    - file_path: str
    - document_type: str
    - upload_date: datetime
    - status: str (uploaded, analyzing, analyzed, error)
    - user_notes: str
    - file_size: int
    - content_text: str (extracted text)

# Analysis model
class DocumentAnalysis:
    - document_id: ObjectId
    - overall_score: float
    - readability_score: float
    - fairness_score: float
    - risk_level: str
    - complexity: str
    - estimated_read_time: str
    - top_concerns: List[str]
    - recommendations: List[str]
    - analysis_date: datetime

# Key Terms model
class KeyTerm:
    - document_id: ObjectId
    - term: str
    - definition: str
    - importance: str
    - location: str

# Red Flags model
class RedFlag:
    - document_id: ObjectId
    - issue: str
    - explanation: str
    - severity: str

# Simplified Sections model
class SimplifiedSection:
    - document_id: ObjectId
    - title: str
    - content: str
    - order: int

# Chat model
class ChatMessage:
    - document_id: ObjectId
    - session_id: str
    - message_type: str (user, assistant)
    - message: str
    - timestamp: datetime
```

### 2. Core Backend Features

#### File Upload & Processing
- Handle multipart file uploads
- Extract text from PDF/DOC files
- Store files securely with unique paths
- Validate file types and sizes

#### Document Analysis Engine
- Text complexity analysis
- Legal term identification
- Risk assessment algorithms
- Plain-English translation
- Scoring mechanisms

#### AI Chat Integration
- Document-specific Q&A system
- Context-aware responses
- Chat history management
- Session tracking

### 3. External Dependencies
- **Text Extraction**: PyPDF2 or pdfplumber for PDFs, python-docx for Word docs
- **AI Analysis**: Integration with LLM for document analysis and chat
- **File Storage**: Local file system with organized directory structure

## Frontend-Backend Integration

### 1. Replace Mock Imports
```javascript
// Remove mock imports
import { mockDocuments, mockAnalysisResult, mockChat } from '../mock';

// Replace with API calls
import api from '../services/api';
```

### 2. API Service Layer
Create `/frontend/src/services/api.js` with:
- Document upload functionality
- Analysis fetching
- Chat message handling
- Error handling and loading states

### 3. Component Updates
- **Dashboard**: Fetch real documents from API
- **UploadDocument**: Implement real file upload with progress
- **DocumentAnalysis**: Fetch analysis data from backend
- **Chat**: Connect to real chat API with session management

### 4. State Management
- Loading states for API calls
- Error handling for failed requests
- Real-time updates for analysis progress
- Optimistic updates for better UX

## Implementation Priority
1. Basic document upload and storage
2. Text extraction and basic analysis
3. Frontend integration with real APIs
4. Advanced analysis features
5. AI chat functionality
6. Polish and error handling

This contract ensures seamless integration between frontend mock data and backend implementation.