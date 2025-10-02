import React, { useEffect, useRef, useState } from "react";

/**
 * ChatWindow
 * - props:
 *    activeBot: { id, name, avatar, ... }
 *    chatHistories: { [botId]: [ {from, text}, ... ] }
 *    addMessage(botId, message) -> append message to parent history
 *
 * Behavior:
 *  - Adds user message immediately
 *  - Shows typing dots for the active bot while waiting for reply
 *  - Tries non-streaming /api/chat first and adds full reply at once
 *  - Falls back to /api/chat/stream if needed (accumulates then adds final reply)
 *  - Keeps typing/loading state per-bot so other chats remain usable
 */
const ChatWindow = ({ activeBot, chatHistories, addMessage }) => {
  const [input, setInput] = useState("");
  const [typingBots, setTypingBots] = useState({});   // boolean per bot id
  const [loadingBots, setLoadingBots] = useState({}); // boolean per bot id (fetching)
  const contentRef = useRef(null);

  useEffect(() => {
    // autoscroll when history changes or typing state changes
    const el = contentRef.current;
    if (el) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }, [chatHistories, typingBots, loadingBots]);

  if (!activeBot) {
    return (
      <div className="chat">
        <div className="content empty">
          <div className="container">
            <div className="col-md-12">
              <div className="no-messages">
                <i className="material-icons md-48">forum</i>
                <p>Select a contact to start chatting</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const messages = chatHistories[activeBot.id] || [];

  // helper to toggle per-bot flags
  const setTyping = (botId, value) =>
    setTypingBots((prev) => ({ ...prev, [botId]: !!value }));
  const setLoading = (botId, value) =>
    setLoadingBots((prev) => ({ ...prev, [botId]: !!value }));

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const botId = activeBot.id;
    // If this bot is already loading, prevent duplicate send to same bot
    if (loadingBots[botId]) return;

    const text = input.trim();
    setInput("");

    // Add user's message immediately
    addMessage(botId, { from: "me", text });

    // show typing dots for this bot and set loading
    setTyping(botId, true);
    setLoading(botId, true);

    // Helper to cleanup flags
    const cleanup = () => {
      setTyping(botId, false);
      setLoading(botId, false);
    };

    try {
      // Try non-streaming endpoint first
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

      let res;
      try {
        res = await fetch("http://localhost:8080/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ botId, message: text }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      // If res ok and looks like JSON with "reply", use it
      if (res && res.ok) {
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          // most common case: backend returns {"reply":"..."}
          let json;
          try {
            json = await res.json();
          } catch (err) {
            json = null;
          }

          if (json && typeof json.reply === "string" && json.reply.trim().length > 0) {
            // hide typing and add final reply at once
            setTyping(botId, false);
            addMessage(botId, { from: activeBot.name, text: json.reply });
            cleanup();
            return;
          }
        }

        // If content-type wasn't JSON or didn't contain reply, attempt to read body as text
        // and treat as final reply (fallback)
        try {
          const textBody = await res.text();
          if (textBody && textBody.trim().length > 0) {
            setTyping(botId, false);
            addMessage(botId, { from: activeBot.name, text: textBody.trim() });
            cleanup();
            return;
          }
        } catch (err) {
          // continue to fallback to streaming approach below
        }
      }

      // If we reached here, non-streaming approach failed (non-ok or no usable body).
      // Try streaming endpoint as a fallback, accumulating tokens and only adding final reply.
      try {
        const streamRes = await fetch("http://localhost:8080/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ botId, message: text }),
        });

        if (!streamRes.ok || !streamRes.body) {
          // streaming fallback not available, throw to outer catch
          throw new Error("No usable response from server (non-stream and stream failed).");
        }

        // Keep typing visible while we accumulate (you asked not to display token-by-token)
        const reader = streamRes.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let firstChunk = true;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const raw = decoder.decode(value, { stream: true });

          // Ollama / streaming services often send newline-separated JSON lines.
          // Try to parse each newline-chunk as JSON; if parse succeeds and has "response",
          // append that; otherwise append raw.
          const parts = raw.split(/\r?\n/).filter(Boolean);
          for (const part of parts) {
            let chunk = part;
            try {
              const parsed = JSON.parse(part);
              if (parsed && typeof parsed === "object" && "response" in parsed) {
                chunk = parsed.response ?? "";
              }
            } catch {
              // not json, use raw chunk
              chunk = part;
            }
            buffer += chunk;
            if (firstChunk) {
              // Keep typing dots visible until we have the whole reply
              firstChunk = false;
            }
          }
        }

        // Add final accumulated reply once stream completes
        const final = buffer.trim();
        if (final.length > 0) {
          setTyping(botId, false);
          addMessage(botId, { from: activeBot.name, text: final });
          cleanup();
          return;
        } else {
          throw new Error("Streaming returned empty reply");
        }
      } catch (streamErr) {
        // streaming fallback failed as well — let outer catch handle it
        throw streamErr;
      }
    } catch (err) {
      // final fallback — show a friendly error message in chat
      console.error("Chat send/receive error:", err);
      addMessage(botId, {
        from: activeBot.name,
        text: "⚠️ Bot failed to respond. Please try again.",
      });
    } finally {
      cleanup();
    }
  };

  return (
    <div className="chat">
      <style>{`
        .typing-dots {
          display: flex;
          gap: 6px;
          align-items: center;
          height: 16px;
        }
        .typing-dots span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #666;
          opacity: 0.4;
          animation: typing-dot 1.2s infinite ease-in-out;
        }
        .typing-dots span:nth-child(2) { animation-delay: 0.18s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.36s; }

        @keyframes typing-dot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }

        /* message bubbles */
        .message:not(.me) .text {
          background: #f1f0f0;
          color: #000;
          border-radius: 18px 18px 18px 0;
          padding: 8px 12px;
          max-width: 70%;
        }
        .message.me .text {
          background: #0084ff !important;
          color: #fff !important;
          border-radius: 18px 18px 0 18px;
          padding: 8px 12px;
          max-width: 70%;
          margin-left: auto;
        }

        .form-control {
          background: #fff;
          color: #111 !important;
          border: 1px solid #ddd;
          border-radius: 20px;
          padding: 10px 14px;
          font-size: 14px;
          font-weight: 500;
        }
        .form-control::placeholder {
          color: rgba(0, 0, 0, 0.4);
        }
      `}</style>

      {/* Chat Header */}
      <div className="top">
        <div className="container">
          <div className="col-md-12">
            <div className="inside">
              <img className="avatar-md" src={activeBot.avatar} alt="avatar" />
              <div className="data">
                <h5>{activeBot.name}</h5>
                <span>Active now</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Content */}
      <div className="content" id="content" ref={contentRef}>
        <div className="container">
          <div className="col-md-12">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.from === "me" ? "me" : ""}`}>
                {msg.from !== "me" && (
                  <img className="avatar-md" src={activeBot.avatar} alt="avatar" />
                )}
                <div className="text-main">
                  <div className="text-group">
                    <div className="text">
                      <p>{msg.text}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* typing indicator only for this active bot */}
            {typingBots[activeBot.id] && (
              <div className="message">
                <img className="avatar-md" src={activeBot.avatar} alt="avatar" />
                <div className="text-main">
                  <div className="text-group">
                    <div className="text">
                      <div className="typing-dots">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Input */}
      <div className="container">
        <div className="col-md-12">
          <div className="bottom">
            <form className="position-relative w-100" onSubmit={sendMessage}>
              <textarea
                className="form-control"
                placeholder="Start typing for reply..."
                rows="1"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                // input remains usable while other bots are loading;
                // only disable this bot's send when it's already loading:
                disabled={!!loadingBots[activeBot.id]}
              />
              <button
                type="submit"
                className="btn send"
                disabled={!!loadingBots[activeBot.id]}
              >
                <i className="material-icons">send</i>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
