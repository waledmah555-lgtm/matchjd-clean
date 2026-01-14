"use client";

export default function ChatWindow({
  messages,
  prompt,
  setPrompt,
  onSend,
  onOptimize
}) {
  return (
    <section style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      background: "#020617"
    }}>
      <div style={{
        flex: 1,
        padding: 24,
        overflowY: "auto"
      }}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              marginBottom: 16,
              color: m.role === "user" ? "#e5e7eb" : "#93c5fd"
            }}
          >
            <strong>
              {m.role === "user" ? "You" : "AI"}
            </strong>
            <div style={{ marginTop: 4 }}>
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        padding: 16,
        borderTop: "1px solid #1e293b"
      }}>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Ask anything…"
          style={{
            width: "100%",
            height: 90,
            background: "#020617",
            color: "#e5e7eb",
            border: "1px solid #1e293b",
            borderRadius: 8,
            padding: 12,
            resize: "none"
          }}
        />

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 8
        }}>
          <button
            onClick={onOptimize}
            style={{
              background: "transparent",
              color: "#93c5fd",
              border: "none",
              cursor: "pointer"
            }}
          >
            ✨ Optimize prompt
          </button>

          <button
            onClick={onSend}
            style={{
              background: "#2563eb",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: 6,
              cursor: "pointer"
            }}
          >
            Send
          </button>
        </div>
      </div>
    </section>
  );
}
