import React, { useState, useEffect, useRef } from "react";
import { Loader2, Send } from "lucide-react";
import { chatAPI } from "../services/api";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const DocumentChat = ({ documentId }) => {
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
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
                  : "bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100 border border-gray-200/50 dark:border-gray-600/50"
              }`}
              style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
            >
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
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
      {chatLoading && (
        <div className="text-gray-500 dark:text-gray-400 mt-3 text-center animate-pulse">
          Assistant is typing...
        </div>
      )}
    </div>
  );
};

export default DocumentChat;
