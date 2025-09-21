import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import DocumentAnalysis from "./components/DocumentAnalysis";
import UploadDocument from "./components/UploadDocument";
import LandingPage from "./components/LandingPage";
import Footer from "./components/Footer";
import LoginPage from "./components/LoginPage"; // Import the new Login Page
import SignupPage from "./components/SignupPage"; // Import the new Signup Page
import DemoHelpPage from "./components/DemoHelpPage"; // Import the new Demo/Help Page

function App() {
  return (
    <div className="App min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <BrowserRouter>
        <Header />
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<UploadDocument />} />
            <Route path="/document/:id" element={<DocumentAnalysis />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/demo" element={<DemoHelpPage />} />
            <Route path="/help" element={<DemoHelpPage />} />
          </Routes>
        </main>
        <Footer />
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;
