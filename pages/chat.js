"use client";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Lightbulb, Mic } from "lucide-react";
import FooterNav from "@/components/FooterNav";
import Link from "next/link";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  // auto-scroll when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    const messageText = (text ?? input).trim();
    if (!messageText) return;

    // add user's message to state
    const userMsg = { role: "user", content: messageText };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      const data = await res.json();

      if (res.ok) {
        const assistantMsg = {
          role: "assistant",
          content: data.reply || "No response received.",
          sources: data.sources || [],
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        // server responded with an error payload
        const errText = data?.error || "Server error";
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `⚠️ Error: ${errText}`, sources: [] },
        ]);
      }
    } catch (err) {
      console.error("Chat send error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Network error.", sources: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // keyboard: enter to send (shift+enter newline)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading) sendMessage();
    }
  };

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("❌ Your browser does not support speech recognition.");
      return;
    }

    if (!recognitionRef.current) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US"; // change to "id-ID" if prefer Indonesian
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        // auto-send after finishing speaking
        sendMessage(transcript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event);
        setListening(false);
      };

      recognition.onend = () => setListening(false);

      recognitionRef.current = recognition;
    }

    if (!listening) {
      recognitionRef.current.start();
      setListening(true);
    } else {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-green-500 to-blue-700 text-white text-center py-4 shadow-lg sticky top-0 z-10 flex items-center justify-center gap-2">
        <Lightbulb className="w-6 h-6 text-yellow-300" />
        <Link href="/">
          <h1 className="text-2xl font-bold tracking-wide">Utak-Atik</h1>
        </Link>
      </header>

      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[85%] ${msg.role === "user" ? "ml-auto" : "mr-auto"}`}
          >
            <div
              className={`p-3 rounded-2xl ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-md"
                  : "bg-gradient-to-r from-green-300 to-green-500 text-white shadow-md"
              }`}
            >
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>

            {/* RAG sources (only for assistant messages) */}
            {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
              <div className="mt-3 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                <div className="mb-2 text-sm font-semibold text-gray-700">Recommended products</div>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {msg.sources.map((m) => {
                    const image = m.image_url || m.image || "/placeholder.png";
                    const url = m.url || m.affiliate_url || m.link || "#";
                    const sim = typeof m.similarity === "number" ? `${Math.round(m.similarity * 100)}%` : null;

                    return (
                      <a
                        key={m.id || url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-start bg-gray-50 p-2 rounded-lg hover:shadow-md transition"
                      >
                        <img
                          src={image}
                          alt={m.name}
                          className="w-full h-24 object-cover rounded-md mb-2"
                          onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
                        />
                        <div className="text-sm font-medium text-gray-800 line-clamp-2 w-full">{m.name}</div>
                        <div className="flex items-center justify-between w-full mt-2">
                          <span className="text-xs text-gray-500">{sim}</span>
                          <span className="text-xs">
                            <button className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-3 py-1 rounded-full text-xs shadow-sm">
                              🛒 Shop
                            </button>
                          </span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Input Bar */}
      <div className="sticky bottom-0 p-4 bg-transparent">
        <div className="flex items-center gap-2 bg-white rounded-full shadow-lg p-2 border border-blue-200">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 resize-none border-0 px-4 py-2 rounded-full text-black focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder={loading ? "Waiting for response..." : "Type your message..."}
            rows={1}
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-green-500 disabled:opacity-60 text-white px-4 py-2 rounded-full shadow-md hover:from-green-500 hover:to-blue-500 transition-colors"
          >
            Send
          </button>
          <button
            onClick={startListening}
            className={`p-2 rounded-full transition-colors ${listening ? "bg-red-100" : "hover:bg-gray-100"}`}
            title="Voice input"
          >
            <Mic className={`w-5 h-5 ${listening ? "text-red-500" : "text-blue-600"}`} />
          </button>
        </div>
      </div>

      {/* Footer */}
      <FooterNav />
    </div>
  );
}
