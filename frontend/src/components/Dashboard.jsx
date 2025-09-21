import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { useToast } from "../hooks/use-toast";
import {
  Upload,
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  Eye,
  Download,
  Loader2,
} from "lucide-react";
import api from "../services/api";

// NEW: Firestore imports
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await api.documents.getDocuments();
      setDocuments(data);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      toast({
        title: "Error",
        description: "Failed to load documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // NEW: Function to download summary from Firebase
  const handleDownload = async (documentId, documentName) => {
    try {
      // Create a reference to the summary document in Firestore using the document ID
      const summaryDocRef = doc(db, "summaries", documentId);
      const summaryDoc = await getDoc(summaryDocRef);

      if (!summaryDoc.exists()) {
        toast({
          title: "Download Failed",
          description: "Summary not found in the database.",
          variant: "destructive",
        });
        return;
      }

      const summaryData = summaryDoc.data();

      let exportContent = `# Document Analysis Report\n\n`;
      exportContent += `**Document:** ${documentName}\n`;
      exportContent += `**Overall Score:** ${summaryData.overall_score}/10\n`;
      exportContent += `**Readability:** ${summaryData.readability_score}/10\n`;
      exportContent += `**Fairness:** ${summaryData.fairness_score}/10\n\n`;

      if (summaryData.summary) {
        exportContent += `## Summary\n`;
        exportContent += `${summaryData.summary}\n\n`;
      }

      // Create a Blob from the content
      const blob = new Blob([exportContent], {
        type: "text/plain;charset=utf-8",
      });
      const href = URL.createObjectURL(blob);

      // The fix is here: use window.document to access the global object
      const link = window.document.createElement("a");
      link.href = href;
      link.download = `${documentName}_summary.md`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(href);

      toast({
        title: "Download Successful",
        description: `Summary for '${documentName}' has been downloaded.`,
      });
    } catch (error) {
      console.error("Error downloading summary:", error);
      toast({
        title: "Download Error",
        description: "An unexpected error occurred during the download.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "analyzed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "analyzing":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "analyzed":
        return "bg-green-100 text-green-800";
      case "analyzing":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-purple-900 dark:to-violet-900 transition-all duration-500">
      {/* Hero Section */}
      <section className="relative text-center space-y-6 pt-24 pb-20 px-4 overflow-x-hidden overflow-y-visible">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm font-medium mb-6">
            🚀 AI-Powered Legal Analysis
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 mb-6 tracking-tight leading-[1.15] md:leading-[1.15] pb-1 md:pb-2">
            Demystify Legal Documents
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
            Transform complex legal jargon into{" "}
            <span className="text-blue-600 font-semibold">plain English</span>{" "}
            with AI-powered analysis, risk assessment, and actionable insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/upload">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-xl px-8 py-4 rounded-full transform hover:scale-105 transition-all duration-200"
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload Your First Document
              </Button>
            </Link>
            <Link to="/demo">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 px-8 py-4 rounded-full"
              >
                Watch Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 px-6 pb-8 max-w-7xl mx-auto">
        <Card className="border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Total Documents
            </CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {documents.length}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Documents processed
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Analysis Complete
            </CardTitle>
            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {documents.filter((doc) => doc.status === "analyzed").length}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Ready to review
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Processing
            </CardTitle>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
              <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {documents.filter((doc) => doc.status === "analyzing").length}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Currently analyzing
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Avg Complexity
            </CardTitle>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
              <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {documents.length > 0
                ? (() => {
                    const complexityScores = documents
                      .filter((d) => d.complexity)
                      .map((d) => {
                        switch (d.complexity) {
                          case "high":
                            return 3;
                          case "medium":
                            return 2;
                          case "low":
                            return 1;
                          default:
                            return 1;
                        }
                      });

                    if (complexityScores.length === 0) return "0";

                    const avgScore =
                      complexityScores.reduce((a, b) => a + b, 0) /
                      complexityScores.length;
                    return avgScore.toFixed(1);
                  })()
                : "0"}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Average complexity (1-3 scale)
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Recent Documents */}
      <section className="space-y-6 px-6 pb-12 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Your Documents
          </h2>
          <Link to="/upload">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Upload New
            </Button>
          </Link>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
              <span className="text-lg text-gray-600 dark:text-gray-300">
                Loading your documents...
              </span>
            </div>
          </div>
        ) : documents.length === 0 ? (
          <Card className="border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm shadow-xl">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                Ready to analyze your first document?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                Upload any legal document and get instant AI-powered insights,
                risk assessments, and plain-English explanations.
              </p>
              <Link to="/upload">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full">
                  <Upload className="h-5 w-5 mr-2" />
                  Upload Your First Document
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {documents.map((doc) => (
              <Card
                key={doc.id}
                className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                            {getStatusIcon(doc.status)}
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            {doc.name}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={`${getStatusColor(
                              doc.status
                            )} rounded-full px-3 py-1`}
                          >
                            {doc.status}
                          </Badge>
                          {doc.complexity && (
                            <Badge
                              variant="outline"
                              className={`${getComplexityColor(
                                doc.complexity
                              )} rounded-full px-3 py-1 border-2`}
                            >
                              {doc.complexity} complexity
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {doc.summary ||
                          "Document uploaded successfully. Our AI is analyzing your document to provide comprehensive insights and plain-English explanations."}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400 flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Uploaded on{" "}
                          {new Date(doc.upload_date).toLocaleDateString()}
                        </span>
                        {doc.status === "analyzing" && (
                          <div className="flex items-center space-x-3">
                            <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                              Analyzing...
                            </span>
                            <Progress value={65} className="w-24 h-2" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 ml-6">
                      {doc.status === "analyzed" && (
                        <Link to={`/document/${doc.id}`}>
                          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-6">
                            <Eye className="h-4 w-4 mr-2" />
                            View Analysis
                          </Button>
                        </Link>
                      )}
                      <Button variant="outline" className="rounded-full p-3">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
