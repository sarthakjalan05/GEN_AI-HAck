import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import DocumentAnalysis from "./components/DocumentAnalysis";
import UploadDocument from "./components/UploadDocument";

function App() {
  return (
    <div className="App min-h-screen bg-gray-50 dark:bg-gray-900">
      <BrowserRouter>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<UploadDocument />} />
            <Route path="/document/:id" element={<DocumentAnalysis />} />
          </Routes>
        </main>
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;
