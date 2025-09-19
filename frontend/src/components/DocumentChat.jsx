import React, { useState, useEffect, useRef } from "react";
// Check for browser support of SpeechRecognition
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition || null;
import { Loader2, Send, Mic } from "lucide-react";
import { chatAPI } from "../services/api";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const DocumentChat = ({ documentId }) => {
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  // Initialize SpeechRecognition instance
  useEffect(() => {
    if (SpeechRecognition && !recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setChatInput((prev) => {
          const newInput = prev + (prev ? " " : "") + transcript;
          // If user was not typing, send immediately
          if (!prev.trim()) {
            setTimeout(() => {
              // Use setTimeout to ensure chatInput is updated before sending
              handleSendMessageWithText(newInput);
            }, 0);
          }
          return newInput;
        });
        setListening(false);
      };
      // Helper to send a message with provided text (used for voice input)
      const handleSendMessageWithText = async (text) => {
        if (!text.trim()) return;
        setChatLoading(true);
        try {
          const response = await chatAPI.sendMessage(
            documentId,
            text,
            sessionId
          );
          const userMessage = {
            id: Date.now().toString(),
            type: "user",
            message: text,
            timestamp: new Date().toISOString(),
          };
          setChatMessages((prev) => [...prev, userMessage, response]);
          setChatInput("");
        } catch (error) {
          // Optionally handle error
        } finally {
          setChatLoading(false);
        }
      };
      recognition.onerror = (event) => {
        setListening(false);
        // Optionally handle error
      };
      recognition.onend = () => {
        setListening(false);
      };
      recognitionRef.current = recognition;
    }
  }, []);
  // Start or stop listening for voice input
  const handleMicClick = () => {
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch (e) {
        setListening(false);
      }
    }
  };
  const [sessionId] = useState(() => {
    const key = `chat_session_${documentId}`;
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const newId = Math.random().toString(36).slice(2);
    localStorage.setItem(key, newId);
    return newId;
  });
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatAPI
      .getChatHistory(documentId, sessionId)
      .then(setChatMessages)
      .catch(() => {});
  }, [documentId, sessionId]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    setChatLoading(true);
    try {
      const response = await chatAPI.sendMessage(
        documentId,
        chatInput,
        sessionId
      );
      const userMessage = {
        id: Date.now().toString(),
        type: "user",
        message: chatInput,
        timestamp: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, userMessage, response]);
      setChatInput("");
    } catch (error) {
      // Optionally handle error
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="border-0 rounded-2xl p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Contract Chatbot
      </h2>
      <div className="overflow-y-auto h-64 mb-4 bg-gray-50/50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-3 flex ${
              msg.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl text-sm break-words whitespace-pre-line shadow-md transition-all duration-300 hover:shadow-lg ${
                msg.type === "user"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  : "bg-white/80 dark:bg-gray-800/95 text-gray-900 dark:text-white border border-gray-200/50 dark:border-gray-600/50"
              }`}
              style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
            >
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      {!SpeechRecognition && (
        <div className="w-full mb-3 p-3 rounded-lg bg-yellow-100 text-yellow-900 text-center font-semibold border border-yellow-300 dark:bg-yellow-900/40 dark:text-yellow-200 dark:border-yellow-700">
          Voice input is not supported in this browser.
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex gap-3"
      >
        <Input
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Type your question..."
          disabled={chatLoading}
          className="flex-1 rounded-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
        />
        {/* Microphone Button for Voice Input */}
        <Button
          type="button"
          size="sm"
          disabled={chatLoading || listening}
          onClick={handleMicClick}
          className={`rounded-full px-3 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center ${
            listening ? "animate-pulse" : ""
          }`}
          style={{ minWidth: 44 }}
          aria-label={listening ? "Listening..." : "Start voice input"}
        >
          <Mic className="h-5 w-5" />
          <span className="sr-only">Mic</span>
        </Button>
        <Button
          size="sm"
          type="submit"
          disabled={chatLoading}
          className="rounded-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          {chatLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
      {listening && (
        <div className="text-green-600 dark:text-green-400 mt-3 text-center animate-pulse">
          Listening... Speak now.
        </div>
      )}
      {chatLoading && (
        <div className="text-gray-500 dark:text-gray-400 mt-3 text-center animate-pulse">
          Assistant is typing...
        </div>
      )}
    </div>
  );
};

export default DocumentChat;
