import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

const GROQ_KEY = process.env.REACT_APP_GROQ_API_KEY;

const FAQ_CATEGORIES = [
  {
    icon: "🛒",
    title: "Orders",
    questions: [
      "How do I track my order?",
      "Can I cancel my order after placing it?",
      "What if my order is late?",
    ],
  },
  {
    icon: "💳",
    title: "Payments",
    questions: [
      "What payment methods are accepted?",
      "Why was my payment declined?",
      "How do I get a refund?",
    ],
  },
  {
    icon: "🍽️",
    title: "Restaurants",
    questions: [
      "How do I find top rated restaurants?",
      "What does the Promoted label mean?",
      "Can I filter by cuisine?",
    ],
  },
  {
    icon: "👤",
    title: "Account",
    questions: [
      "How do I change my password?",
      "How do I delete my account?",
      "I forgot my password — what do I do?",
    ],
  },
];

const SYSTEM_PROMPT = `You are a helpful support assistant for a food delivery app (like Swiggy/Zomato).
Answer questions about: placing orders, payments, refunds, restaurant browsing, account settings, app features.
Keep answers short (2-4 sentences). Be friendly and clear. If you don't know something, say so honestly.
Never invent policies. Always be helpful.`;

async function askGroq(messages) {
  if (!GROQ_KEY) {
    return "⚠️ Groq API key not found. Add REACT_APP_GROQ_API_KEY=gsk_... in your .env file and restart.";
  }

  const groqMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    })),
  ];

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: groqMessages,
        temperature: 0.4,
        max_tokens: 300,
      }),
    });

    if (!res.ok) {
      if (res.status === 429) return "⚠️ Too many requests. Please wait a moment and try again.";
      return `⚠️ API error ${res.status}. Check your REACT_APP_GROQ_API_KEY in .env`;
    }

    const data = await res.json();
    return (
      data?.choices?.[0]?.message?.content ||
      "Sorry, I couldn't get an answer. Please try again."
    );
  } catch (err) {
    return "Connection error. Please check your internet and try again.";
  }
}

const Bubble = ({ msg }) => (
  <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} mb-3`}>
    {msg.role === "assistant" && (
      <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-0.5">
        ✦
      </div>
    )}
    <div
      className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
        msg.role === "user"
          ? "bg-orange-500 text-white rounded-br-sm"
          : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm"
      }`}
    >
      {msg.content}
    </div>
  </div>
);

const HelpCenter = () => {
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Hi! 👋 I'm the Help assistant. Ask me anything about orders, payments, or your account.",
  }]);
  const [input, setInput]                   = useState("");
  const [loading, setLoading]               = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput("");

    const updated = [...messages, { role: "user", content }];
    setMessages(updated);
    setLoading(true);

    const reply = await askGroq(updated);
    setMessages([...updated, { role: "assistant", content: reply }]);
    setLoading(false);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-black dark:text-white transition-colors duration-300">
      <div className="bg-white border-b border-gray-100 px-4 py-6 text-center">
        <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-500 text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-widest">
          Help Center
        </span>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">How can we help?</h1>
        <p className="text-gray-500 text-sm mt-1">Browse FAQs or chat with our AI</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-5 gap-6">
        {/* Left: FAQ */}
        <div className="md:col-span-2 space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Browse Topics</p>

          {FAQ_CATEGORIES.map((cat) => (
            <div key={cat.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-orange-50 transition"
                onClick={() => setActiveCategory(activeCategory === cat.title ? null : cat.title)}
              >
                <span className="flex items-center gap-2.5 font-semibold text-gray-800 text-sm">
                  <span>{cat.icon}</span>
                  {cat.title}
                </span>
                <span className={`text-gray-400 text-xs transition-transform duration-200 ${activeCategory === cat.title ? "rotate-180" : ""}`}>
                  ▼
                </span>
              </button>

              {activeCategory === cat.title && (
                <div className="border-t border-gray-50 px-4 py-2 space-y-0.5">
                  {cat.questions.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="w-full text-left text-sm text-gray-600 hover:text-orange-500 py-2 border-b border-gray-50 last:border-0 transition flex items-start gap-2"
                    >
                      <span className="text-orange-300 text-xs mt-0.5">→</span>
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="bg-orange-500 rounded-2xl p-4 text-white">
            <p className="font-semibold text-sm mb-1">Looking for food ideas?</p>
            <p className="text-orange-100 text-xs mb-3">Try Smart Assist for recommendations.</p>
            <Link
              to="/smart-assist"
              className="inline-flex items-center gap-1.5 bg-white text-orange-500 text-xs font-bold px-4 py-2 rounded-full hover:bg-orange-50 transition"
            >
              ✦ Open Smart Assist
            </Link>
          </div>
        </div>

        {/* Right: Chat */}
        <div
          className="md:col-span-3 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          style={{ height: "540px" }}
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-orange-50/50">
            <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold">✦</div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Support AI</p>
              <p className="text-xs text-green-500 font-medium">● Online · powered by Groq</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50/30">
            {messages.map((msg, i) => <Bubble key={i} msg={msg} />)}

            {loading && (
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs flex-shrink-0">✦</div>
                <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm flex gap-1.5 items-center">
                  {[0, 1, 2].map((n) => (
                    <span key={n} className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: `${n * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-gray-100 p-3 bg-white">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100 focus-within:border-orange-300 focus-within:ring-1 focus-within:ring-orange-200 transition">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
                disabled={loading}
                placeholder="Ask about your order, payment, account..."
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="w-8 h-8 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-200 text-white rounded-lg flex items-center justify-center transition"
              >
                ↑
              </button>
            </div>
            <p className="text-center text-[10px] text-gray-400 mt-2">Powered by Groq (Llama 3)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;