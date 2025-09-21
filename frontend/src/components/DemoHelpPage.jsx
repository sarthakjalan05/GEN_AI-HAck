import React from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Play,
  FileText,
  Search,
  MessageCircle,
  Download,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  HelpCircle,
  BookOpen,
  Video,
  Mail,
  Phone,
  MessageSquare,
} from "lucide-react";
import { Link } from "react-router-dom";

const DemoHelpPage = () => {
  const features = [
    {
      icon: <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />,
      title: "Document Upload",
      description:
        "Securely upload PDF, DOC, DOCX, and TXT files for instant analysis",
      steps: [
        "Click 'Upload Document'",
        "Select your file",
        "Choose document type",
        "Add optional notes",
      ],
    },
    {
      icon: <Search className="h-8 w-8 text-green-600 dark:text-green-400" />,
      title: "AI Analysis",
      description:
        "Get comprehensive analysis including key terms, risks, and recommendations",
      steps: [
        "Document is processed automatically",
        "AI extracts key information",
        "Risk assessment is generated",
        "Summary is created",
      ],
    },
    {
      icon: (
        <MessageCircle className="h-8 w-8 text-purple-600 dark:text-purple-400" />
      ),
      title: "Interactive Chat",
      description:
        "Ask questions about your document and get instant AI-powered answers",
      steps: [
        "Open any analyzed document",
        "Use the chat panel",
        "Ask specific questions",
        "Get detailed explanations",
      ],
    },
    {
      icon: (
        <Download className="h-8 w-8 text-orange-600 dark:text-orange-400" />
      ),
      title: "Export Results",
      description: "Download analysis reports as PDF for sharing and archiving",
      steps: [
        "Complete document analysis",
        "Click 'Export PDF'",
        "Choose sections to include",
        "Download formatted report",
      ],
    },
  ];

  const faqs = [
    {
      question: "What file types are supported?",
      answer:
        "LegalClear supports PDF, Microsoft Word (.doc, .docx), and plain text (.txt) files up to 10MB in size.",
    },
    {
      question: "How accurate is the AI analysis?",
      answer:
        "Our AI is trained on legal documents and provides highly accurate analysis. However, always consult with legal professionals for critical decisions.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes! All documents are processed securely and stored with enterprise-grade encryption. We never share your data with third parties.",
    },
    {
      question: "Can I delete my documents?",
      answer:
        "Absolutely. You have full control over your documents and can delete them at any time from your dashboard.",
    },
    {
      question: "How long does analysis take?",
      answer:
        "Most documents are analyzed within 30-60 seconds, depending on length and complexity.",
    },
    {
      question: "Can I share analysis results?",
      answer:
        "Yes, you can export analysis results as PDF reports that can be easily shared with colleagues or clients.",
    },
  ];

  const contactOptions = [
    {
      icon: <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      title: "Email Support",
      description: "Get detailed help via email",
      contact: "support@legalclear.ai",
      action: "Send Email",
    },
    {
      icon: (
        <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
      ),
      title: "Live Chat",
      description: "Chat with our support team",
      contact: "Available 9 AM - 6 PM PST",
      action: "Start Chat",
    },
    {
      icon: <Phone className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
      title: "Phone Support",
      description: "Speak directly with our team",
      contact: "+1 (555) 123-4567",
      action: "Call Now",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-800 dark:text-blue-200 text-sm font-semibold mb-6">
            <Video className="h-4 w-4 mr-2" />
            Demo & Help Center
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Learn How to Use{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LegalClear
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
            Watch our comprehensive demo and get help to make the most of our
            AI-powered legal document analysis platform.
          </p>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="text-center pb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Play className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Watch the Complete Demo
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
                See LegalClear in action with a full walkthrough of all features
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Video Container with Google Drive Embed */}
              <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden shadow-lg">
                <iframe
                  src="https://drive.google.com/file/d/1RRmuF7PnOLKA_h885mYpH1aT3zEIN7KJ/preview"
                  width="100%"
                  height="100%"
                  allow="autoplay"
                  className="rounded-xl"
                  title="LegalClear Demo Video"
                ></iframe>
              </div>

              {/* Video Details */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center p-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-3">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Complete Walkthrough
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Full feature demonstration from upload to export
                  </p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-3">
                    <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Quick Start Guide
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Get up and running in just 5 minutes
                  </p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-3">
                    <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Best Practices
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Tips for optimal document analysis results
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Guide */}
      <section className="py-16 px-6 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Master every feature with our step-by-step guide
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
                      {feature.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl text-gray-900 dark:text-white">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-300">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {feature.steps.map((step, stepIndex) => (
                      <div
                        key={stepIndex}
                        className="flex items-center space-x-3"
                      >
                        <Badge
                          variant="outline"
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                        >
                          {stepIndex + 1}
                        </Badge>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-yellow-800 dark:text-yellow-200 text-sm font-semibold mb-6">
              <HelpCircle className="h-4 w-4 mr-2" />
              Frequently Asked Questions
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Got Questions?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Find answers to common questions about LegalClear
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
              >
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 px-6 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Need More Help?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Our support team is here to assist you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactOptions.map((option, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-8">
                  <div className="inline-flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-6">
                    {option.icon}
                  </div>
                  <h3 className="font-semibold text-xl text-gray-900 dark:text-white mb-3">
                    {option.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {option.description}
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-6">
                    {option.contact}
                  </p>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    {option.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="border-0 shadow-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white overflow-hidden">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-xl text-blue-100 mb-8">
                Join thousands of professionals using LegalClear for smarter
                document analysis
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/upload">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3"
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    Upload Your First Document
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3"
                  >
                    <ArrowRight className="h-5 w-5 mr-2" />
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default DemoHelpPage;
