"use client";
import { useState } from "react";

export default function AskPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e) => {
    e.preventDefault();
    setAnswer("");
    setLoading(true);

    const response = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    if (!response.body) {
      setAnswer("No response received.");
      setLoading(false);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      setAnswer((prev) => prev + decoder.decode(value, { stream: true }));
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <form onSubmit={handleAsk} className="mb-4">
        <input
          type="text"
          className="border rounded p-2 w-full"
          placeholder="Ask something..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
          disabled={loading}
        >
          {loading ? "Thinking..." : "Ask"}
        </button>
      </form>
      <div className="border p-4 rounded bg-gray-50 whitespace-pre-wrap">
        {answer || "No answer yet."}
      </div>
    </div>
  );
}
