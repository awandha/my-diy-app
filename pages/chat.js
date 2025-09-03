import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Lightbulb, Mic } from "lucide-react";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const sendMessage = async (text) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const newMessages = [...messages, { role: "user", content: messageText }];
    setMessages(newMessages);
    setInput("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages }),
    });

    const data = await res.json();
    setMessages([...newMessages, { role: "assistant", content: data.reply }]);
  };

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("❌ Your browser does not support speech recognition.");
      return;
    }

    if (!recognitionRef.current) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US"; // 👉 change to "id-ID" if you want Indonesian
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        // 🚀 Auto send right after user finishes speaking
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
        <a href="/">
            <h1 className="text-2xl font-bold tracking-wide">Utak-Atik</h1>
        </a>
      </header>

      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-2xl max-w-[80%] ${
              msg.role === "user"
                ? "ml-auto bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-md"
                : "mr-auto bg-gradient-to-r from-green-300 to-green-500 text-white shadow-md"
            }`}
          >
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        ))}
      </div>

      {/* Floating Input Bar */}
      <div className="sticky bottom-0 p-4 bg-transparent">
        <div className="flex items-center gap-2 bg-white rounded-full shadow-lg p-2 border border-blue-200">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2 px-4 rounded-full text-black focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="Type your message..."
          />
          <button
            onClick={() => sendMessage()}
            className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-green-500 hover:to-blue-500 transition-colors text-white px-4 py-2 rounded-full shadow-md"
          >
            Send
          </button>
          <button
            onClick={startListening}
            className={`p-2 rounded-full transition-colors ${
              listening ? "bg-red-100" : "hover:bg-gray-100"
            }`}
            title="Voice input"
          >
            <Mic className={`w-5 h-5 ${listening ? "text-red-500" : "text-blue-600"}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
