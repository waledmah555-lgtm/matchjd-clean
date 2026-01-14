"use client";

import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";

export default function Page() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");

  async function send() {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: prompt })
    });

    const data = await res.json();
    setMessages(prev => [
      ...prev,
      { role: "user", content: prompt },
      { role: "assistant", content: data.reply }
    ]);

    setPrompt("");
  }

  function optimize() {
    setPrompt(
      "Rewrite this prompt to be clearer and more structured:\n\n" + prompt
    );
  }

  return (
    <main style={{
      display: "flex",
      height: "100vh",
      fontFamily: "Inter, system-ui"
    }}>
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        onNew={() => {
          setMessages([]);
          setActiveId(null);
        }}
      />

      <ChatWindow
        messages={messages}
        prompt={prompt}
        setPrompt={setPrompt}
        onSend={send}
        onOptimize={optimize}
      />

      {/* Right panel placeholder */}
      <aside style={{
        width: 260,
        background: "#020617",
        borderLeft: "1px solid #1e293b",
        padding: 16,
        color: "#64748b"
      }}>
        Tokens & Cost (Phase 3)
      </aside>
    </main>
  );
}
