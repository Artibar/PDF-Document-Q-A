import { useState, useRef, useEffect } from 'react';
import { Send, Loader, Trash2 } from 'lucide-react';

const API_URL = "https://pdf-document-q-a.onrender.com";

const SUGGESTIONS = [
  { icon: '📋', text: 'What are the main topics covered?' },
  { icon: '📊', text: 'Summarize the key findings' },
  { icon: '💡', text: 'What are the conclusions?' },
];

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:          '#ffffff',
  surface:     '#f8fafc',
  border:      '#e2e8f0',
  borderHover: '#cbd5e1',
  text:        '#0f172a',
  textSec:     '#475569',
  textMuted:   '#94a3b8',
  blue:        '#2563eb',
  blueHover:   '#1d4ed8',
  blueLight:   '#eff6ff',
  gradStart:   '#22d3ee',
  gradEnd:     '#3b82f6',
  purple:      '#a855f7',
};

const S = {
  // Layout
  root: {
    display: 'flex', flexDirection: 'column',
    height: '100dvh', background: C.bg,
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
    color: C.text,
  },

  // Header
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 24px', background: C.bg,
    borderBottom: `1px solid ${C.border}`, flexShrink: 0,
  },
  headerLeft:  { display: 'flex', alignItems: 'center', gap: 12 },
  headerIcon: {
    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
    background: 'linear-gradient(135deg, #22d3ee, #3b82f6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(59,130,246,0.30)',
  },
  headerTitle: { fontSize: 14, fontWeight: 600, color: C.text, lineHeight: 1.3, margin: 0 },
  headerSub:   { fontSize: 12, color: C.textMuted, margin: '2px 0 0' },
  docBadge: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 12px', borderRadius: 8,
    background: C.surface, border: `1px solid ${C.border}`,
    fontSize: 12, color: C.textSec, flexShrink: 0,
  },

  // Main
  main: { flex: 1, overflowY: 'auto', background: C.surface },

  // Empty state
  emptyState: {
    minHeight: '100%', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: 14, padding: '48px 24px', textAlign: 'center',
  },
  emptyIconWrap: { position: 'relative', width: 64, height: 64, marginBottom: 8 },
  emptyIcon: {
    width: 64, height: 64, borderRadius: '50%',
    background: 'linear-gradient(135deg, #22d3ee, #2563eb)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(59,130,246,0.30)',
  },
  emptyDot: {
    position: 'absolute', bottom: -2, right: -2,
    width: 16, height: 16, borderRadius: '50%',
    background: C.purple, border: `2.5px solid ${C.surface}`,
  },
  emptyTitle: { fontSize: 24, fontWeight: 700, color: C.text, margin: 0 },
  emptyDesc:  { fontSize: 14, color: C.textSec, maxWidth: 320, lineHeight: 1.65, margin: 0 },

  // Suggestions
  suggestions: { display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 360, marginTop: 8 },
  suggBtn: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 16px', borderRadius: 12,
    background: C.bg, border: `1px solid ${C.border}`,
    fontSize: 14, color: C.textSec, textAlign: 'left', cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'all 0.15s',
  },

  // Message list
  msgList: {
    display: 'flex', flexDirection: 'column', gap: 16,
    padding: 20, maxWidth: 768, margin: '0 auto', width: '100%',
  },
  msgRow:     { display: 'flex', alignItems: 'flex-end', gap: 8 },
  msgRowUser: { display: 'flex', alignItems: 'flex-end', gap: 8, justifyContent: 'flex-end' },

  // Bot avatar
  botAvatar: {
    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
    background: 'linear-gradient(135deg, #22d3ee, #3b82f6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(59,130,246,0.25)',
  },

  // Bubbles
  bubbleUser: {
    maxWidth: '72%', padding: '10px 14px',
    borderRadius: 18, borderBottomRightRadius: 4,
    background: C.blue, color: '#fff',
    fontSize: 14, lineHeight: 1.65,
    boxShadow: '0 2px 8px rgba(37,99,235,0.20)',
  },
  bubbleBot: {
    maxWidth: '72%', padding: '10px 14px',
    borderRadius: 18, borderBottomLeftRadius: 4,
    background: C.bg, color: C.text,
    border: `1px solid ${C.border}`,
    fontSize: 14, lineHeight: 1.65,
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  bubbleError: {
    maxWidth: '72%', padding: '10px 14px',
    borderRadius: 18, borderBottomLeftRadius: 4,
    background: '#fef2f2', color: '#dc2626',
    border: '1px solid #fecaca',
    fontSize: 14, lineHeight: 1.65,
  },
  bubbleText:     { margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
  bubbleTime:     { margin: '5px 0 0', fontSize: 11, color: C.textMuted },
  bubbleTimeUser: { margin: '5px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.6)' },

  // Typing
  typingBubble: {
    padding: '12px 16px', borderRadius: 18, borderBottomLeftRadius: 4,
    background: C.bg, border: `1px solid ${C.border}`,
    display: 'flex', gap: 5, alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },

  // Input area
  inputArea: {
    background: C.bg, borderTop: `1px solid ${C.border}`,
    padding: '12px 16px 14px', flexShrink: 0,
  },
  inputRow: { display: 'flex', gap: 8, alignItems: 'flex-end', maxWidth: 768, margin: '0 auto' },
  textarea: {
    flex: 1, resize: 'none',
    padding: '10px 16px', borderRadius: 22,
    border: `1px solid ${C.border}`, background: C.surface,
    color: C.text, fontSize: 14, lineHeight: 1.5,
    overflowY: 'auto', fontFamily: 'inherit',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    outline: 'none',
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: '50%',
    background: C.blue, border: 'none', cursor: 'pointer',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, transition: 'background 0.15s, transform 0.1s',
    boxShadow: '0 4px 12px rgba(37,99,235,0.30)',
  },
  sendBtnDisabled: {
    width: 40, height: 40, borderRadius: '50%',
    background: C.blue, border: 'none', cursor: 'not-allowed',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, opacity: 0.4,
    boxShadow: '0 4px 12px rgba(37,99,235,0.30)',
  },
  inputFooter: {
    display: 'flex', justifyContent: 'flex-end',
    marginTop: 8, maxWidth: 768, marginLeft: 'auto', marginRight: 'auto',
  },
  clearBtn: {
    display: 'flex', alignItems: 'center', gap: 4,
    fontSize: 12, color: C.textMuted,
    background: 'none', border: 'none', cursor: 'pointer',
  },
};

// Typing dot animation via <style> tag
const dotCSS = `
  @keyframes dotBounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.35; }
    40%           { transform: translateY(-5px); opacity: 1; }
  }
  .typing-dot {
    display: inline-block;
    width: 7px; height: 7px; border-radius: 50%;
    background: #94a3b8;
    animation: dotBounce 1.2s ease-in-out infinite;
  }
  .input-textarea:focus {
    border-color: #93c5fd !important;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.12) !important;
  }
  .input-textarea::placeholder { color: #94a3b8; }
  .sugg-btn:hover {
    background: #f8fafc !important;
    border-color: #cbd5e1 !important;
    color: #0f172a !important;
  }
  .send-btn-el:hover:not(:disabled) { background: #1d4ed8 !important; }
  .send-btn-el:active:not(:disabled) { transform: scale(0.93) !important; }
  .clear-btn-el:hover { color: #475569 !important; }
`;

export default function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, [inputValue]);

  const createMessage = (content, type) => ({
    id: Date.now() + Math.random(),
    content, type, timestamp: new Date(),
  });

  const handleSendMessage = async (text) => {
    const question = (text ?? inputValue).trim();
    if (!question || loading) return;

    setInputValue('');
    setMessages((prev) => [...prev, createMessage(question, 'user')]);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMessages((prev) => [...prev, createMessage(data.answer || 'Sorry, I could not generate a response.', 'bot')]);
    } catch (error) {
      setMessages((prev) => [...prev, createMessage(`Error: ${error.message}`, 'error')]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  const handleClearChat = () => { setMessages([]); setInputValue(''); };

  const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
      fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );

  return (
    <div style={S.root}>
      <style>{dotCSS}</style>

      {/* ── Header ── */}
      <header style={S.header}>
        <div style={S.headerLeft}>
          <div style={S.headerIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div>
            <p style={S.headerTitle}>PDF Document Q&amp;A</p>
            <p style={S.headerSub}>Ask questions about the indexed document</p>
          </div>
        </div>
        <div style={S.docBadge}>
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <span>document.pdf</span>
        </div>
      </header>

      {/* ── Messages ── */}
      <main style={S.main}>
        {messages.length === 0 ? (
          <div style={S.emptyState}>
            <div style={S.emptyIconWrap}>
              <div style={S.emptyIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
                  fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <div style={S.emptyDot} />
            </div>
            <h2 style={S.emptyTitle}>Ask about your document</h2>
            <p style={S.emptyDesc}>
              The PDF is loaded and indexed. Ask anything and<br />I'll search for the answer.
            </p>
            <div style={S.suggestions}>
              {SUGGESTIONS.map((s) => (
                <button key={s.text} className="sugg-btn" style={S.suggBtn}
                  onClick={() => handleSendMessage(s.text)}>
                  <span style={{ fontSize: 16 }}>{s.icon}</span>
                  <span>{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={S.msgList}>
            {messages.map((msg) => (
              <div key={msg.id} style={msg.type === 'user' ? S.msgRowUser : S.msgRow}>
                {msg.type !== 'user' && (
                  <div style={S.botAvatar}><SearchIcon /></div>
                )}
                <div style={msg.type === 'user' ? S.bubbleUser : msg.type === 'error' ? S.bubbleError : S.bubbleBot}>
                  <p style={S.bubbleText}>{msg.content}</p>
                  <p style={msg.type === 'user' ? S.bubbleTimeUser : S.bubbleTime}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div style={S.msgRow}>
                <div style={S.botAvatar}><SearchIcon /></div>
                <div style={S.typingBubble}>
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="typing-dot"
                      style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* ── Input ── */}
      <div style={S.inputArea}>
        <div style={S.inputRow}>
          <textarea
            ref={textareaRef}
            className="input-textarea"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about the document…"
            disabled={loading}
            rows={1}
            style={{ ...S.textarea, minHeight: 44, maxHeight: 120 }}
          />
          <button
            className="send-btn-el"
            onClick={() => handleSendMessage()}
            disabled={loading || !inputValue.trim()}
            aria-label="Send message"
            style={loading || !inputValue.trim() ? S.sendBtnDisabled : S.sendBtn}
          >
            {loading ? <Loader size={16} /> : <Send size={16} />}
          </button>
        </div>
        <div style={S.inputFooter}>
          <button className="clear-btn-el" onClick={handleClearChat} style={S.clearBtn}>
            <Trash2 size={11} />
            Clear chat
          </button>
        </div>
      </div>
    </div>
  );
}