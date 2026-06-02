import React, { useEffect, useRef, useState } from 'react';
import { MessageSquare, Send, Sparkles, X, Loader2 } from 'lucide-react';

export const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'assistant-welcome',
      role: 'assistant',
      text: 'Hi there! Ask me about your spending and I can summarize it for you.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (isOpen && endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const appendMessage = (message) => {
    setMessages((prev) => [...prev, { ...message, id: `${message.role}-${Date.now()}` }]);
  };

  const handleSend = async () => {
    const question = input.trim();
    if (!question) return;

    appendMessage({ role: 'user', text: question });
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/assistant/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Assistant request failed');
      }

      appendMessage({ role: 'assistant', text: json.answer });
    } catch (error) {
      appendMessage({
        role: 'assistant',
        text: 'Sorry, I could not fetch the assistant response. Please try again.'
      });
      console.error('Assistant error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const resetConversation = () => {
    setMessages([
      {
        id: 'assistant-welcome',
        role: 'assistant',
        text: 'Hi there! Ask me about your spending and I can summarize it for you.'
      }
    ]);
    setInput('');
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end space-y-3">
      {isOpen && (
        <div className="w-[360px] max-h-[520px] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl ring-1 ring-slate-200 transition-all duration-300">
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-slate-950 text-white rounded-t-3xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/95 text-white shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Budget Chat Assistant</p>
                <p className="text-xs text-slate-300">Ask about your spending history.</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/90 text-slate-200 hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-3xl p-3 text-sm leading-6 ${
                  message.role === 'assistant'
                    ? 'bg-slate-900 text-slate-100 self-start'
                    : 'bg-indigo-50 text-slate-800 self-end'
                }`}
              >
                {message.text}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="border-t border-slate-200 px-4 py-3 bg-white">
            <div className="flex items-center gap-2">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask: How much did I spend on transport this week?"
                className="min-h-[44px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-2xl bg-indigo-600 px-3 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
              <span>Powered by Groq LLM and your local expense data.</span>
              <button onClick={resetConversation} className="font-semibold text-indigo-600 hover:text-indigo-700">
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-2xl shadow-indigo-500/20 transition hover:bg-indigo-700"
      >
        <MessageSquare className="h-4 w-4" />
        <span>{isOpen ? 'Close Assistant' : 'Budget Chat'}</span>
      </button>
    </div>
  );
};