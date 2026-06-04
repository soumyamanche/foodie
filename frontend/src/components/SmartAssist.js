// Conversational food recommender — chat with Groq AI (Llama 3)
// Calls Groq API directly from browser (no backend needed)
// Cart integration via Redux

import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addItem } from "../store/cartSlice";

const GROQ_KEY = process.env.REACT_APP_GROQ_API_KEY;

const SYSTEM_PROMPT = `You are a fun, friendly food recommendation assistant for a food delivery app.
Your job is to help users decide what to eat based on their mood, cravings, diet, time, or budget.
Keep replies short (3-5 sentences max). Suggest specific food types or cuisines. Be enthusiastic and warm.
If asked something unrelated to food, gently steer back to food topics.
Always end with a follow-up question to narrow down their choice.

IMPORTANT: When the user clearly confirms their order (says "done", "confirm", "yes order it", "add to cart", "ok finalize", "confirm order"), 
you MUST append this exact tag at the very end of your reply on a new line:
ORDER_CONFIRMED:{"name":"item name here","price":199,"id":"ai-item-1","description":"short description"}

Rules for ORDER_CONFIRMED:
- Use a realistic price in rupees
- Give a unique id like "ai-burger-1" or "ai-chicken-1"
- Only append when user clearly confirms, not just says "ok" mid conversation
- Keep the JSON on one line with no extra spaces`;

const STARTERS = [
  "I'm feeling lazy, what's quick?",
  "Something healthy and filling",
  "Spicy food cravings!",
  "Best dinner for under ₹200",
  "I want something different today",
  "What's good for late night?",
];

//  Food emoji based on item name 
function getFoodEmoji(name = "") {
  const n = name.toLowerCase();
  if (n.includes("pizza"))          return "🍕";
  if (n.includes("burger"))         return "🍔";
  if (n.includes("biryani"))        return "🍛";
  if (n.includes("chicken"))        return "🍗";
  if (n.includes("noodle") || n.includes("pasta")) return "🍝";
  if (n.includes("sandwich"))       return "🥪";
  if (n.includes("taco"))           return "🌮";
  if (n.includes("salad"))          return "🥗";
  if (n.includes("coffee"))         return "☕";
  if (n.includes("cake"))           return "🎂";
  if (n.includes("ice cream"))      return "🍦";
  if (n.includes("fries"))          return "🍟";
  if (n.includes("rice") || n.includes("bibimbap")) return "🍚";
  if (n.includes("fish"))           return "🐟";
  if (n.includes("sushi"))          return "🍱";
  if (n.includes("wrap"))           return "🌯";
  if (n.includes("soup"))           return "🍜";
  if (n.includes("paneer"))         return "🧀";
  if (n.includes("dosa"))           return "🫓";
  if (n.includes("idli"))           return "🍥";
  if (n.includes("kebab") || n.includes("tikka")) return "🍢";
  if (n.includes("roll"))           return "🌯";
  if (n.includes("momos") || n.includes("dumpling")) return "🥟";
  if (n.includes("steak"))          return "🥩";
  if (n.includes("egg"))            return "🍳";
  if (n.includes("waffle") || n.includes("pancake")) return "🧇";
  return "🍽️";
}

// Call Groq with full conversation history 
async function callGroq(messages) {
  if (!GROQ_KEY) {
    return "⚠️ Groq API key not found. Please add REACT_APP_GROQ_API_KEY=gsk_... in your .env file and restart.";
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
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn("Groq error:", err);
      if (res.status === 429) return "⚠️ Too many requests. Please wait a moment and try again.";
      return `⚠️ API error ${res.status}. Check your REACT_APP_GROQ_API_KEY in .env`;
    }

    const data = await res.json();
    return (
      data?.choices?.[0]?.message?.content ||
      "Hmm, I couldn't think of anything. Try asking again!"
    );
  } catch (err) {
    console.error("SmartAssist fetch error:", err);
    return "Connection error. Check your internet and try again.";
  }
}

const Bubble = ({ msg }) => (
  <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} mb-3`}>
    {msg.role === "assistant" && (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-0.5 shadow-sm">
        ✦
      </div>
    )}
    <div
      className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
        msg.role === "user"
          ? "bg-orange-500 text-white rounded-br-sm shadow-sm"
          : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm"
      }`}
    >
      {msg.content}
    </div>
    {msg.role === "user" && (
      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs ml-2 flex-shrink-0 mt-0.5">
        👤
      </div>
    )}
  </div>
);

// Cart added toast notification 
const CartToast = ({ item, onClose }) => (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-green-200 shadow-xl rounded-2xl px-5 py-3 flex items-center gap-3">
    <span className="text-2xl">{getFoodEmoji(item.name)}</span>
    <div>
      <p className="text-sm font-bold text-gray-800">{item.name}</p>
      <p className="text-xs text-green-600">✅ Added to cart · ₹{item.price}</p>
    </div>
    <Link
      to="/cart"
      className="ml-2 px-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-full hover:bg-orange-600 transition"
    >
      View Cart
    </Link>
    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xs ml-1">✕</button>
  </div>
);

const SmartAssist = () => {
  const dispatch   = useDispatch();
  const cartItems  = useSelector((state) => state.cart.items);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hey! 👋 I'm your food buddy. Tell me what you're in the mood for — I'll help you decide what to order!",
    },
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState(null);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auto hide toast after 4 seconds
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const send = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput("");

    const updated = [...messages, { role: "user", content }];
    setMessages(updated);
    setLoading(true);

    const reply = await callGroq(updated);
    console.log("AI raw reply:", reply);

    const orderMatch = reply.match(/ORDER_CONFIRMED:\s*(\{[\s\S]*?\})/);

    if (orderMatch) {
      try {
        const item = JSON.parse(orderMatch[1]);

        // Remove ORDER_CONFIRMED tag from displayed message
        const cleanReply = reply
          .replace(/ORDER_CONFIRMED:\s*\{[\s\S]*?\}/, "")
          .trim();

        // Dispatch to Redux cart with emoji
        dispatch(addItem({
          id: item.id || `ai-item-${Date.now()}`,
          name: item.name,
          price: Number(item.price) || 199,
          description: item.description || "",
          isVeg: false,
          img: getFoodEmoji(item.name),
          restaurant: "Smart Assist",
        }));

        // Show toast
        setToast(item);

        // Show clean message + confirmation in chat
        setMessages([
          ...updated,
          {
            role: "assistant",
            content: cleanReply
              ? cleanReply + `\n\n🛒 "${item.name}" ${getFoodEmoji(item.name)} added to your cart!`
              : `🛒 "${item.name}" ${getFoodEmoji(item.name)} has been added to your cart! Tap View Cart to checkout.`,
          },
        ]);

      } catch (err) {
        console.warn("Order JSON parse error:", err);
        // Show reply without the broken tag
        setMessages([...updated, {
          role: "assistant",
          content: reply.replace(/ORDER_CONFIRMED:.*/, "").trim() + "\n\n(Could not add to cart — please try again.)",
        }]);
      }
    } else {
      setMessages([...updated, { role: "assistant", content: reply }]);
    }

    setLoading(false);
    inputRef.current?.focus();
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const resetChat = () => {
    setMessages([{
      role: "assistant",
      content: "Hey! 👋 I'm your food buddy. Tell me what you're in the mood for — I'll help you decide what to order!",
    }]);
    setInput("");
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white transition-colors duration-300">

      {/* Toast notification */}
      {toast && <CartToast item={toast} onClose={() => setToast(null)} />}

      <div className="bg-white border-b border-gray-100 px-4 py-5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold shadow-sm">
              ✦
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Smart Assist</h1>
              <p className="text-xs text-green-500 font-medium">● AI food recommender</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Cart count badge */}
            <Link
              to="/cart"
              className="relative text-xs text-gray-500 hover:text-orange-500 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition border border-gray-100 flex items-center gap-1"
            >
              🛒
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartItems.reduce((acc, i) => acc + i.qty, 0)}
                </span>
              )}
            </Link>
            <button
              onClick={resetChat}
              className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition border border-gray-100"
            >
              New chat
            </button>
            <Link
              to="/help"
              className="text-xs text-orange-500 hover:text-orange-600 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition border border-orange-100"
            >
              Help ?
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {messages.length === 1 && (
          <div className="mb-6">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">
              Try asking…
            </p>
            <div className="flex flex-wrap gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-sm px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-full hover:border-orange-400 hover:text-orange-600 transition shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* How to confirm order hint */}
        <div className="mb-4 bg-orange-50 border border-orange-100 rounded-xl px-4 py-2.5 text-xs text-orange-700 flex items-center gap-2">
          <span>💡</span>
          <span>When ready to order, say <strong>"confirm order"</strong> or <strong>"add to cart"</strong> — it will be added automatically!</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col" style={{ minHeight: "460px", maxHeight: "560px" }}>
          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1 bg-gray-50/30">
            {messages.map((msg, i) => (
              <Bubble key={i} msg={msg} />
            ))}

            {loading && (
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs mr-0 flex-shrink-0">
                  ✦
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex gap-1.5 items-center">
                  {[0, 1, 2].map((n) => (
                    <span
                      key={n}
                      className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${n * 0.15}s` }}
                    />
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
                onKeyDown={onKey}
                disabled={loading}
                placeholder='What are you craving? Say "confirm order" to add to cart'
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
              />
              <button
                onClick={() => send()}
                disabled={loading || !input.trim()}
                className="w-8 h-8 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-200 text-white rounded-lg flex items-center justify-center transition flex-shrink-0"
                aria-label="Send"
              >
                ↑
              </button>
            </div>
            <p className="text-center text-[10px] text-gray-400 mt-2">
              Powered by Groq (Llama 3) — say "confirm order" to add items to cart
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartAssist;