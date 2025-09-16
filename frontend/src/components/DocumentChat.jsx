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
    <div className="border rounded p-4 bg-white shadow max-w-xl mx-auto">
      <h2 className="text-lg font-bold mb-2">Contract Chatbot</h2>
      <div className="overflow-y-auto h-64 mb-2 bg-gray-50 p-2 rounded">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 flex ${
              msg.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg text-sm break-words whitespace-pre-line ${
                msg.type === "user" ? "bg-blue-200" : "bg-gray-200"
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
        className="flex gap-2"
      >
        <Input
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Type your question..."
          disabled={chatLoading}
        />
        <Button size="sm" type="submit" disabled={chatLoading}>
          {chatLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
      {chatLoading && (
        <div className="text-gray-500 mt-2">Assistant is typing...</div>
      )}
    </div>
  );
};

export default DocumentChat;
