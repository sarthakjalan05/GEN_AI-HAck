// Mock data for legal document demystification app

export const mockDocuments = [
  {
    id: "1",
    name: "Employment Contract - Software Engineer",
    type: "contract",
    uploadDate: "2024-01-15",
    status: "analyzed",
    summary: "This employment contract outlines the terms and conditions for a software engineer position including compensation, benefits, responsibilities, and termination clauses.",
    complexity: "medium",
    keyTerms: [
      {
        term: "At-Will Employment",
        definition: "Either you or the company can end the employment relationship at any time, for any reason (as long as it's legal), with or without notice.",
        importance: "high",
        location: "Section 2.1"
      },
      {
        term: "Confidentiality Agreement",
        definition: "You agree not to share company secrets, customer information, or proprietary technology with anyone outside the company.",
        importance: "high",
        location: "Section 5.2"
      },
      {
        term: "Non-Compete Clause",
        definition: "For 12 months after leaving, you cannot work for direct competitors or start a competing business in the same market.",
        importance: "medium",
        location: "Section 6.1"
      }
    ],
    redFlags: [
      {
        issue: "Broad Non-Compete Clause",
        explanation: "The non-compete clause covers a wide geographic area and industry scope, which might limit your future job opportunities.",
        severity: "medium"
      }
    ],
    simplifiedSections: [
      {
        title: "Your Job & Pay",
        content: "You'll work as a Software Engineer for $85,000/year plus benefits. You'll work standard business hours but may need to work extra hours during busy periods."
      },
      {
        title: "What You Can't Do",
        content: "You can't share company secrets, work for competitors for 1 year after leaving, or use company resources for personal projects."
      },
      {
        title: "How Employment Can End",
        content: "Either you or the company can end your job anytime. If the company fires you without cause, you get 2 weeks severance pay."
      }
    ]
  },
  {
    id: "2",
    name: "Rental Lease Agreement",
    type: "lease",
    uploadDate: "2024-01-10",
    status: "analyzing",
    summary: "Standard residential lease agreement for apartment rental with terms, conditions, and tenant responsibilities.",
    complexity: "low"
  }
];

export const mockAnalysisResult = {
  documentId: "1",
  overallScore: 7.2,
  readabilityScore: 4.5,
  fairnessScore: 8.1,
  riskLevel: "medium",
  estimatedReadTime: "15 minutes",
  topConcerns: [
    "Non-compete clause may be overly restrictive",
    "Overtime compensation terms are vague",
    "Intellectual property ownership needs clarification"
  ],
  recommendations: [
    "Request clarification on overtime pay structure",
    "Negotiate the geographic scope of non-compete clause",
    "Ask for explicit definition of 'proprietary information'"
  ]
};

export const mockChat = [
  {
    id: "1",
    type: "user",
    message: "What does the non-compete clause mean for my career?",
    timestamp: "2024-01-15T10:30:00Z"
  },
  {
    id: "2",
    type: "assistant",
    message: "The non-compete clause means that for 12 months after you leave this job, you cannot work for direct competitors or start a competing business. This could limit your job opportunities in the same industry. You might want to negotiate to reduce the time period or narrow the scope of what's considered 'competing'.",
    timestamp: "2024-01-15T10:30:15Z"
  },
  {
    id: "3",
    type: "user",
    message: "Is this clause enforceable?",
    timestamp: "2024-01-15T10:32:00Z"
  },
  {
    id: "4",
    type: "assistant",
    message: "Non-compete enforceability varies by state. In California, they're generally unenforceable. In other states, courts look at whether the clause is reasonable in time, geographic scope, and industry scope. Since this clause is 12 months and covers a broad area, a court might find it partially enforceable. I recommend consulting with an employment lawyer in your state for specific advice.",
    timestamp: "2024-01-15T10:32:30Z"
  }
];

export const documentTypes = [
  { value: "contract", label: "Employment Contract", icon: "FileText" },
  { value: "lease", label: "Lease Agreement", icon: "Home" },
  { value: "loan", label: "Loan Agreement", icon: "CreditCard" },
  { value: "nda", label: "Non-Disclosure Agreement", icon: "Shield" },
  { value: "terms", label: "Terms of Service", icon: "Scroll" },
  { value: "other", label: "Other Legal Document", icon: "File" }
];