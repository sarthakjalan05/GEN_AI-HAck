import axios from "axios";

// Normalize base URL to avoid double slashes regardless of trailing slash in env
const rawBackendUrl = process.env.REACT_APP_BACKEND_URL || "";
const BACKEND_URL = rawBackendUrl.endsWith("/")
  ? rawBackendUrl.slice(0, -1)
  : rawBackendUrl;
const API = `${BACKEND_URL}/api`;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API,
  timeout: 30000, // 30 second timeout
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("API Response Error:", error.response?.data || error.message);

    // Handle specific error cases
    if (error.response?.status === 404) {
      throw new Error("Resource not found");
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data?.detail || "Bad request");
    } else if (error.response?.status >= 500) {
      throw new Error("Server error. Please try again later.");
    }

    throw error;
  }
);

// Document API functions
export const documentAPI = {
  // Upload a document
  uploadDocument: async (file, documentName, documentType, notes = "") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_name", documentName);
    formData.append("document_type", documentType);
    formData.append("notes", notes);

    const response = await apiClient.post("/documents/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000, // 60 seconds for file upload
    });

    return response.data;
  },

  // Get all documents
  getDocuments: async () => {
    const response = await apiClient.get("/documents");
    return response.data;
  },

  // Get specific document
  getDocument: async (documentId) => {
    const response = await apiClient.get(`/documents/${documentId}`);
    return response.data;
  },

  // Get document analysis
  getAnalysis: async (documentId) => {
    const response = await apiClient.get(`/documents/${documentId}/analysis`);
    return response.data;
  },

  // Delete document
  deleteDocument: async (documentId) => {
    const response = await apiClient.delete(`/documents/${documentId}`);
    return response.data;
  },
};

// Chat API functions
export const chatAPI = {
  // Send chat message
  sendMessage: async (documentId, message, sessionId = null) => {
    const response = await apiClient.post(`/documents/${documentId}/chat`, {
      message,
      session_id: sessionId,
    });
    return response.data;
  },

  // Get chat history
  getChatHistory: async (documentId, sessionId = null) => {
    const params = sessionId ? { session_id: sessionId } : {};
    const response = await apiClient.get(`/documents/${documentId}/chat`, {
      params,
    });
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    // Our backend exposes /healthz at the root; since baseURL already includes /api,
    // call the absolute path to bypass the /api prefix for health checks.
    const response = await axios.get(`${BACKEND_URL}/healthz`, {
      timeout: 10000,
    });
    return response.data;
  },
};

// Export default API object
const api = {
  documents: documentAPI,
  chat: chatAPI,
  health: healthAPI,
};

export default api;
