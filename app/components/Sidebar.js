"use client";

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew
}) {
  return (
    <aside style={{
      width: 260,
      background: "#0f172a",
      color: "#e5e7eb",
      padding: "16px",
      borderRight: "1px solid #1e293b"
    }}>
      <button
        onClick={onNew}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: 16,
          background: "#1d4ed8",
          border: "none",
          color: "#fff",
          borderRadius: 6,
          cursor: "pointer"
        }}
      >
        + New Conversation
      </button>

      {conversations.map(c => (
        <div
          key={c.id}
          onClick={() => onSelect(c.id)}
          style={{
            padding: "10px",
            borderRadius: 6,
            cursor: "pointer",
            marginBottom: 6,
            background:
              c.id === activeId ? "#1e293b" : "transparent"
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 500 }}>
            {c.title || "Untitled"}
          </div>
        </div>
      ))}
    </aside>
  );
}
