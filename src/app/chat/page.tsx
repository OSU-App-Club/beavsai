"use client";

import { useState } from "react";

export default function ChatPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAskQuestion = async () => {
    setLoading(true);
    setAnswer("");

    // Fetch relevant document(s) based on the question
    const response = await fetch(
      `/api/embeddings?text=${encodeURIComponent(question)}`,
    );
    const relevantDoc = await response.json();

    if (relevantDoc && relevantDoc.matches[0].score > 0.5) {
      // Adjust threshold as needed
      const chatResponse = await fetch("/api/chatgpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          context: relevantDoc.matches[0].metadata.text,
        }),
      });

      const reader = chatResponse.body?.getReader();
      if (!reader) {
        setAnswer("Error: Unable to read response stream.");
        setLoading(false);
        return;
      }

      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value || new Uint8Array());
        setAnswer((prev) => prev + chunk); // Append the chunk to the answer state
      }
    } else {
      setAnswer("No relevant documents found.");
    }

    setLoading(false);
  };

  return (
    <div>
      <h1>Chat with Relevant Documents</h1>
      <textarea
        placeholder="Ask your question here..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <button onClick={handleAskQuestion} disabled={loading}>
        Ask
      </button>
      <div>
        <h2>Answer:</h2>
        <p>{loading ? "Loading..." : answer}</p>
      </div>
    </div>
  );
}
