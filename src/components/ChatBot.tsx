import React, { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

const INITIAL_MESSAGE: Message = {
  role: 'ai',
  text: "Hi there! I'm Christian's AI Assistant. Ask me about his projects, skills, experience, or anything you'd like to know!"
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200);
      setUnreadCount(0);
    }
  }, [isOpen]);

  const toggleChat = () => setIsOpen(v => !v);

  const startNewChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setInput('');
    inputRef.current?.focus();
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const userMsg: Message = { role: 'user', text: userText };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: updatedMessages.slice(0, -1).map(m => ({
            role: m.role,
            text: m.text
          }))
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Server error ${response.status}`);
      }

      // Streaming response from Groq
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let fullText = '';

      // Add empty AI message that we'll fill as chunks arrive
      setMessages(prev => [...prev, { role: 'ai', text: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        // Update the last AI message in-place
        setMessages(prev => {
          const next = [...prev];
          next[next.length - 1] = { role: 'ai', text: fullText };
          return next;
        });
      }

      if (!isOpen) setUnreadCount(c => c + 1);
    } catch (err: any) {
      const msg = err.message || '';
      const isConfigError = msg.includes('API key') || msg.includes('not configured') || msg.includes('Server error 500');
      setMessages(prev => [...prev, {
        role: 'ai',
        text: isConfigError
          ? 'System misconfiguration detected. Please contact Christian to fix the AI backend.'
          : 'Connection error. Please try again in a moment.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {isOpen && (
        <div className="chatbot-backdrop" onClick={toggleChat} />
      )}

      <button
        onClick={toggleChat}
        className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/>
          </svg>
        )}

        {!isOpen && unreadCount > 0 && (
          <span className="chatbot-badge">{unreadCount}</span>
        )}

        {!isOpen && unreadCount === 0 && (
          <span className="chatbot-pulse" />
        )}
      </button>

      <div className={`chatbot-window ${isOpen ? 'visible' : 'hidden'}`}>
        <div className="chatbot-header">
          <div className="chatbot-header-row">
            <div className="chatbot-header-left">
              <div className="chatbot-avatar-wrap">
                <div className="chatbot-avatar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>
                  </svg>
                </div>
                <span className="chatbot-avatar-dot" />
              </div>
              <div>
                <span className="chatbot-header-title">Atillo AI Assistant</span>
                <span className="chatbot-header-subtitle">
                  <span />
                  Atillo-Flash • Online
                </span>
              </div>
            </div>
            <div className="chatbot-header-actions">
              <button
                onClick={startNewChat}
                className="chatbot-header-btn"
                title="New conversation"
                aria-label="New conversation"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div ref={scrollRef} className="chatbot-messages">
          {messages.map((m, i) => (
            <div key={i} className={`chatbot-msg-row ${m.role}`}>
              <div className={`chatbot-msg-avatar ${m.role}`}>
                {m.role === 'user' ? 'Y' : 'AI'}
              </div>
              <div className={`chatbot-bubble ${m.role}`}>
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="chatbot-typing">
              <div className="chatbot-msg-avatar ai">AI</div>
              <div className="chatbot-typing-dots">
                <span /><span /><span />
              </div>
            </div>
          )}
        </div>

        <div className="chatbot-input-area">
          <div className="chatbot-input-row">
            <input
              ref={inputRef}
              type="text"
              className="chatbot-input"
              placeholder="Ask me about Christian..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="chatbot-send-btn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            </button>
          </div>
          <div className="chatbot-footer-text">Powered by Ʌ T \ L L O</div>
        </div>
      </div>
    </>
  );
}