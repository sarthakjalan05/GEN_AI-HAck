import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useToast } from "../hooks/use-toast";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
  Home,
  CreditCard,
  Shield,
  Scroll,
  File,
} from "lucide-react";
import api from "../services/api";

const UploadDocument = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [documentName, setDocumentName] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Document types configuration
  const documentTypes = [
    { value: "contract", label: "Employment Contract", icon: "FileText" },
    { value: "lease", label: "Lease Agreement", icon: "Home" },
    { value: "loan", label: "Loan Agreement", icon: "CreditCard" },
    { value: "nda", label: "Non-Disclosure Agreement", icon: "Shield" },
    { value: "terms", label: "Terms of Service", icon: "Scroll" },
    { value: "other", label: "Other Legal Document", icon: "File" },
  ];

  const getTypeIcon = (type) => {
    const icons = {
      FileText: FileText,
      Home: Home,
      CreditCard: CreditCard,
      Shield: Shield,
      Scroll: Scroll,
      File: File,
    };
    const IconComponent = icons[type] || FileText;
    return <IconComponent className="h-5 w-5" />;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, DOC, DOCX, or TXT file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setFile(file);
    if (!documentName) {
      setDocumentName(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const removeFile = () => {
    setFile(null);
    setDocumentName("");
  };

  const validateForm = () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a document to upload.",
        variant: "destructive",
      });
      return false;
    }
    if (!documentName.trim()) {
      toast({
        title: "Document name required",
        description: "Please enter a name for your document.",
        variant: "destructive",
      });
      return false;
    }
    if (!documentType) {
      toast({
        title: "Document type required",
        description: "Please select the type of document.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const simulateProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
    return interval;
  };

  const handleUpload = async () => {
    if (!validateForm()) return;

    setIsUploading(true);
    const progressInterval = simulateProgress();

    try {
      const result = await api.documents.uploadDocument(
        file,
        documentName,
        documentType,
        notes
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        toast({
          title: "Upload successful!",
          description:
            "Your document is being analyzed. You'll be redirected shortly.",
        });

        // Navigate to the document analysis page
        navigate(`/document/${result.document_id}`);
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      setIsUploading(false);

      toast({
        title: "Upload failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const getFileIcon = (file) => {
    if (!file) return <FileText className="h-8 w-8 text-gray-400" />;

    if (file.type === "application/pdf") {
      return <FileText className="h-8 w-8 text-red-500" />;
    } else if (
      file.type === "application/msword" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return <FileText className="h-8 w-8 text-blue-500" />;
    } else {
      return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Upload Legal Document
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Upload your legal document and get instant AI-powered analysis,
          plain-English explanations, and risk assessments.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* File Upload Area */}
          <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 transition-colors">
            <CardContent className="p-8">
              <div
                className={`text-center space-y-4 ${
                  dragActive ? "bg-blue-50 dark:bg-blue-900/20" : ""
                } p-6 rounded-lg transition-colors`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {!file ? (
                  <>
                    <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                      <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Drop your document here
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        or click to browse files
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Supports PDF, DOC, DOCX, TXT (max 10MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      onChange={handleFileInput}
                      accept=".pdf,.doc,.docx,.txt"
                      className="hidden"
                      id="file-upload"
                      disabled={isUploading}
                    />
                    <label htmlFor="file-upload">
                      <Button
                        variant="outline"
                        className="cursor-pointer"
                        disabled={isUploading}
                        asChild
                      >
                        <span>Browse Files</span>
                      </Button>
                    </label>
                  </>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file)}
                      <div className="text-left">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {file.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Document Details Form */}
          <Card>
            <CardHeader>
              <CardTitle>Document Information</CardTitle>
              <CardDescription>
                Provide details about your document for better analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="document-name">Document Name</Label>
                <Input
                  id="document-name"
                  placeholder="e.g., Employment Contract - John Doe"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  disabled={isUploading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="document-type">Document Type</Label>
                <Select
                  value={documentType}
                  onValueChange={setDocumentType}
                  disabled={isUploading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(type.icon)}
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any specific concerns or questions about this document..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isUploading}
                  rows={3}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Your notes will be used as the first question for the AI
                  assistant
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Upload Progress */}
          {isUploading && (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Uploading document...
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {Math.round(uploadProgress)}%
                    </span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Your document will be analyzed automatically after upload
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Button */}
          <Button
            size="lg"
            onClick={handleUpload}
            disabled={!file || !documentName || !documentType || isUploading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg"
          >
            {isUploading ? (
              <>
                <Upload className="h-5 w-5 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 mr-2" />
                Upload & Analyze Document
              </>
            )}
          </Button>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span>What You'll Get</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium">📊 Comprehensive Analysis</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Risk assessment, readability scores, and complexity ratings
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">🔍 Key Terms Explained</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Plain-English definitions of legal jargon and important
                  clauses
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">⚠️ Risk Identification</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Potential red flags and unfavorable terms highlighted
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">💬 AI Chat Assistant</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ask questions and get instant answers about your document
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <span>Privacy & Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                All analyses are encrypted and automatically deleted after 30
                days unless you choose to save them.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UploadDocument;
