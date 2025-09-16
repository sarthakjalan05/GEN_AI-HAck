import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { ScrollArea } from "./ui/scroll-area";
import { useToast } from "../hooks/use-toast";
import {
  AlertTriangle,
  CheckCircle2,
  MessageCircle,
  Send,
  Download,
  Bookmark,
  Share2,
  TrendingUp,
  Clock,
  Eye,
  AlertCircle,
  Loader2,
} from "lucide-react";
import api from "../services/api";
import DocumentChat from "./DocumentChat";

// Utility function to parse markdown-style formatting
const parseMarkdown = (text) => {
  if (!text) return text;

  // Convert **text** to bold
  let formatted = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // Convert *text* to italic
  formatted = formatted.replace(
    /(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g,
    "<em>$1</em>"
  );

  // Convert line breaks
  formatted = formatted.replace(/\n/g, "<br />");

  return formatted;
};

// Component to render formatted messages
const FormattedMessage = ({ content }) => {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
      className="formatted-message"
    />
  );
};

const DocumentAnalysis = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [document, setDocument] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);

  // Generate session ID for chat
  const [sessionId] = useState(() => {
    const key = `chat_session_${id}`;
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const newId = Math.random().toString(36).slice(2);
    localStorage.setItem(key, newId);
    return newId;
  });

  // Initial data fetch
  useEffect(() => {
    fetchDocumentData();
    fetchChatHistory();
  }, [id]);

  // Polling effect - separate from initial fetch
  useEffect(() => {
    let pollInterval;

    // Only start polling if document exists but analysis is not complete
    if (document && document.status !== "analyzed" && !analysis) {
      setIsPolling(true);

      const pollForAnalysis = async () => {
        try {
          const docData = await api.documents.getDocument(id);
          setDocument(docData);

          if (docData.status === "analyzed") {
            try {
              const analysisData = await api.documents.getAnalysis(id);
              setAnalysis(analysisData);
              setIsPolling(false);

              // Show success toast when analysis completes
              toast({
                title: "Analysis Complete",
                description: "Your document has been analyzed successfully.",
              });

              // Stop polling
              if (pollInterval) {
                clearInterval(pollInterval);
              }
            } catch (error) {
              console.log("Analysis not yet available, continuing to poll");
            }
          }
        } catch (error) {
          console.error("Polling error:", error);
        }
      };

      // Start polling immediately
      pollForAnalysis();

      // Set up interval for subsequent polls
      pollInterval = setInterval(pollForAnalysis, 3000);
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [document, analysis, id, toast]);

  const fetchDocumentData = async () => {
    try {
      setLoading(true);
      const docData = await api.documents.getDocument(id);
      setDocument(docData);

      // Try to fetch analysis if document is analyzed
      if (docData.status === "analyzed") {
        try {
          const analysisData = await api.documents.getAnalysis(id);
          setAnalysis(analysisData);
        } catch (error) {
          console.log("Analysis not yet available");
        }
      }
    } catch (error) {
      console.error("Failed to fetch document:", error);
      toast({
        title: "Error",
        description: "Failed to load document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const chatData = await api.chat.getChatHistory(id, sessionId);
      setChatMessages(chatData);
    } catch (error) {
      console.log("No chat history available");
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      type: "user",
      message: chatInput,
      timestamp: new Date().toISOString(),
    };

    // Add user message immediately
    setChatMessages((prev) => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput("");
    setChatLoading(true);

    try {
      const response = await api.chat.sendMessage(id, currentInput, sessionId);
      setChatMessages((prev) => [...prev, response]);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Chat error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      // Remove user message on error
      setChatMessages((prev) => prev.slice(0, -1));
      setChatInput(currentInput); // Restore input
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
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

  const getImportanceColor = (importance) => {
    switch (importance) {
      case "high":
        return "border-red-200 bg-red-50";
      case "medium":
        return "border-yellow-200 bg-yellow-50";
      case "low":
        return "border-green-200 bg-green-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Loading document analysis...</span>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Document not found
        </h3>
        <p className="text-gray-600">
          The requested document could not be found.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">{document.name}</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>
              Uploaded {new Date(document.upload_date).toLocaleDateString()}
            </span>
            <span>•</span>
            <span>
              {document.status === "analyzed"
                ? "15 min read time"
                : "Analysis in progress"}
            </span>
            <span>•</span>
            <Badge className={getRiskColor(analysis?.risk_level || "medium")}>
              {analysis?.risk_level || "pending"} risk
            </Badge>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Bookmark className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Analysis Overview */}
      {analysis ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Overall Score</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {analysis.overall_score}/10
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Readability</p>
                  <p className="text-2xl font-bold text-green-600">
                    {analysis.readability_score}/10
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Fairness</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {analysis.fairness_score}/10
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Read Time</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {analysis.estimated_read_time.split(" ")[0]}
                    <span className="text-sm font-normal">min</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Analysis in Progress
            </h3>
            <p className="text-gray-600">
              Your document is being analyzed. This usually takes a few minutes.
            </p>
            {isPolling && (
              <p className="text-sm text-gray-500 mt-2">
                Checking for updates every 3 seconds...
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="terms">Key Terms</TabsTrigger>
              <TabsTrigger value="risks">Risks</TabsTrigger>
              <TabsTrigger value="simplified">Simplified</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Document Summary</CardTitle>
                  <CardDescription>
                    An overview of your document's main points and implications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    {document.summary ||
                      "Document uploaded successfully. Analysis in progress..."}
                  </p>

                  {analysis && (
                    <>
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900">
                          Top Concerns:
                        </h4>
                        <ul className="space-y-2">
                          {analysis.top_concerns?.map((concern, index) => (
                            <li
                              key={index}
                              className="flex items-start space-x-2"
                            >
                              <AlertTriangle className="h-4 w-4 text-orange-500 mt-1 flex-shrink-0" />
                              <span className="text-sm text-gray-700">
                                {concern}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900">
                          Recommendations:
                        </h4>
                        <ul className="space-y-2">
                          {analysis.recommendations?.map((rec, index) => (
                            <li
                              key={index}
                              className="flex items-start space-x-2"
                            >
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                              <span className="text-sm text-gray-700">
                                {rec}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="terms" className="space-y-4">
              {analysis?.key_terms ? (
                <div className="space-y-4">
                  {analysis.key_terms.map((term, index) => (
                    <Card
                      key={index}
                      className={`border-l-4 ${getImportanceColor(
                        term.importance
                      )}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {term.term}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant="outline"
                              className={getRiskColor(term.importance)}
                            >
                              {term.importance} priority
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {term.location}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {term.definition}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-600">
                      Key terms will appear here once analysis is complete.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="risks" className="space-y-4">
              {analysis?.red_flags ? (
                <div className="space-y-4">
                  {analysis.red_flags.map((flag, index) => (
                    <Card
                      key={index}
                      className="border-l-4 border-red-200 bg-red-50"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-red-900">
                            {flag.issue}
                          </h4>
                          <Badge className={getRiskColor(flag.severity)}>
                            {flag.severity} risk
                          </Badge>
                        </div>
                        <p className="text-sm text-red-800 leading-relaxed">
                          {flag.explanation}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-600">
                      Risk analysis will appear here once document analysis is
                      complete.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="simplified" className="space-y-4">
              {analysis?.simplified_sections ? (
                <div className="space-y-4">
                  {analysis.simplified_sections.map((section, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {section.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-gray-700 leading-relaxed">
                          <FormattedMessage content={section.content} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-600">
                      Simplified explanations will appear here once analysis is
                      complete.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Chat Sidebar */}
        <div className="space-y-6">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5" />
                <span>Ask Questions</span>
              </CardTitle>
              <CardDescription>
                Get instant answers about your document
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.type === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-lg text-sm ${
                          msg.type === "user"
                            ? "bg-slate-900 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                        style={{
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                          hyphens: "auto",
                        }}
                      >
                        {msg.type === "user" ? (
                          msg.message
                        ) : (
                          <FormattedMessage content={msg.message} />
                        )}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-900 p-3 rounded-lg text-sm flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Assistant is typing...</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="flex space-x-2 pt-2 border-t">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about your document..."
                  onKeyPress={handleKeyPress}
                  disabled={chatLoading}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={chatLoading || !chatInput.trim()}
                >
                  {chatLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full text-left justify-start"
                onClick={() => setChatInput("Explain non-compete clause")}
              >
                Explain non-compete clause
              </Button>
              <Button
                variant="outline"
                className="w-full text-left justify-start"
                onClick={() => setChatInput("Check termination terms")}
              >
                Check termination terms
              </Button>
              <Button
                variant="outline"
                className="w-full text-left justify-start"
                onClick={() => setChatInput("Review payment clauses")}
              >
                Review payment clauses
              </Button>
              <Button
                variant="outline"
                className="w-full text-left justify-start"
                onClick={() => setChatInput("Identify unfair terms")}
              >
                Identify unfair terms
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DocumentAnalysis;
