// AI Search — calls Groq directly from browser (no backend needed)
// Falls back to basic text search if Groq key missing or API fail
import RestaurantCard, { withPromotedLabel } from "./RestaurantCard";
import { useState, useEffect, useRef, startTransition } from "react";
import Shimmer from "./Shimmer";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../utils/constants";
import useOnlineStatus from "../utils/useOnlineStatus";

const GROQ_KEY = process.env.REACT_APP_GROQ_API_KEY;

const RestaurantCardPromoted = withPromotedLabel(RestaurantCard);

const AI_SUGGESTIONS = [
  "Show me top rated restaurants",
  "Best biryani places",
  "Pizza with discounts",
  "Fast food nearby",
  "Burger joints",
  "Chinese food",
];

// Cuisine / food keyword → what to look for in restaurant data
const CUISINE_ALIASES = {
  noodles:     ["chinese", "noodle", "asian", "thai", "wok", "pan asian", "tibetan", "indo chinese"],
  pasta:       ["italian", "pasta", "pizza"],
  biryani:     ["biryani", "mughlai", "hyderabadi", "lucknowi", "dum"],
  "fast food": ["burger", "fast food", "kfc", "mcdonald", "american", "fries", "snacks"],
  burger:      ["burger", "american", "fast food", "grill"],
  "burger joints": ["burger", "american", "fast food", "grill"],
  pizza:       ["pizza", "italian"],
  chinese:     ["chinese", "asian", "pan asian", "tibetan", "indo chinese", "noodle"],
  healthy:     ["salad", "healthy", "diet", "fitness", "bowl", "organic", "vegan"],
  dessert:     ["dessert", "ice cream", "cake", "bakery", "sweet"],
  coffee:      ["cafe", "coffee", "bakery"],
  south:       ["south indian", "dosa", "idli", "kerala", "tamil"],
  north:       ["north indian", "punjabi", "mughlai", "dhaba"],
  seafood:     ["seafood", "fish", "coastal", "mangalorean", "kerala"],
  kebab:       ["kebab", "tikka", "mughlai", "afghani", "bbq"],
  sandwich:    ["sandwich", "wrap", "subway", "cafe"],
  sushi:       ["japanese", "sushi", "asian"],
  tacos:       ["mexican", "taco", "burrito"],
};

// Extract all searchable text from a restaurant object
function getRestaurantSearchText(r) {
  const info = r?.info || {};
  const parts = [
    info.name || "",
    ...(info.cuisines || []),
    info.locality || "",
    info.areaName || "",
    info.aggregatedDiscountInfoV3?.header || "",
    info.aggregatedDiscountInfoV3?.subHeader || "",
    ...(info.labels?.map((l) => l?.title || "") || []),
  ];
  return parts.join(" ").toLowerCase();
}

// Groq call => parse natural language into search filters
async function parseQueryWithGroq(query, restaurantNames) {
  if (!GROQ_KEY) {
    return { nameFilter: query.toLowerCase(), minRating: 0, tags: [], cuisines: [], intent: "" };
  }

  const prompt = `You are a food search assistant. User searched: "${query}"

Available restaurants: ${restaurantNames.slice(0, 40).join(", ")}

Return ONLY valid JSON, no markdown, no explanation:
{"nameFilter":"main food/restaurant keyword or empty string","minRating":0,"cuisines":["list of cuisine types like Chinese, Biryani, Burger, Fast Food, South Indian etc"],"tags":["other keywords"],"intent":"one short sentence what user wants","isNearby":false}

Rules:
- minRating = 4 if user says top rated / best / highly rated, else 0
- nameFilter = main food or restaurant keyword (e.g. "biryani", "burger", "noodles")
- cuisines = list of cuisine categories that match the query (IMPORTANT — always fill this)
- isNearby = true if user says "near me" or "nearby"
- intent = plain english summary

Examples:
- "noodles" → cuisines: ["Chinese","Indo Chinese","Asian","Tibetan"]
- "fast food nearby" → cuisines: ["Burger","Fast Food","American"], isNearby: true
- "best biryani" → cuisines: ["Biryani","Mughlai","Hyderabadi"], minRating: 4
- "burger joints" → cuisines: ["Burger","American","Fast Food","Grill"]`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 200,
      }),
    });

    if (!res.ok) {
      return { nameFilter: query.toLowerCase(), minRating: 0, cuisines: [], tags: [], intent: "" };
    }

    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content || "{}";
    const clean = raw.replace(/```json|```/gi, "").trim();
    const parsed = JSON.parse(clean);
    return parsed;
  } catch (err) {
    console.warn("Groq parse error:", err);
    return { nameFilter: query.toLowerCase(), minRating: 0, cuisines: [], tags: [], intent: "" };
  }
}

// Smart filter using cuisines + name + rating
function smartFilter(allRestaurants, parsed, topRated) {
  const getRating = (r) => {
    const raw = r?.info?.avgRating ?? r?.info?.avgRatingString ?? "0";
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : 0;
  };

  const queryTerms = [
    ...(parsed.cuisines || []).map((c) => c.toLowerCase()),
    ...(parsed.tags || []).map((t) => t.toLowerCase()),
  ];

  const nameFilter = (parsed.nameFilter || "").toLowerCase();

  // Expand via local aliases for nameFilter
  if (nameFilter && CUISINE_ALIASES[nameFilter]) {
    queryTerms.push(...CUISINE_ALIASES[nameFilter]);
  }

  // Check if any alias key matches existing query terms
  Object.entries(CUISINE_ALIASES).forEach(([key, vals]) => {
    if (queryTerms.some((t) => t.includes(key) || key.includes(t))) {
      queryTerms.push(...vals);
    }
  });

  const uniqueTerms = [...new Set(queryTerms)].filter(Boolean);

  return allRestaurants.filter((r) => {
    const searchText = getRestaurantSearchText(r);
    const rating = getRating(r);

    const ratingOk = parsed.minRating ? rating >= parsed.minRating : true;
    const topOk = topRated ? rating >= 4 : true;

    const cuisineOk =
      uniqueTerms.length === 0 ||
      uniqueTerms.some((term) => searchText.includes(term));

    const nameOk =
      !nameFilter ||
      searchText.includes(nameFilter) ||
      cuisineOk;

    return (cuisineOk || nameOk) && ratingOk && topOk;
  });
}

const Body = () => {
  const [allRestaurants, setAllRestaurants]           = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [isLoading, setIsLoading]                     = useState(true);
  const [fetchError, setFetchError]                   = useState("");
  const [topRated, setTopRated]                       = useState(false);
  const [searchText, setSearchText]                   = useState("");
  const [aiSearching, setAiSearching]                 = useState(false);
  const [aiIntent, setAiIntent]                       = useState("");
  const [aiMode, setAiMode]                           = useState(false);
  const [showSuggestions, setShowSuggestions]         = useState(false);
  const inputRef = useRef(null);
  const cacheRef = useRef({});


  const navigate = useNavigate();

  const getRating = (r) => {
    const raw = r?.info?.avgRating ?? r?.info?.avgRatingString ?? "0";
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : 0;
  };

  const getId = (r) => r?.info?.id;

  const isPromoted = (r) =>
    Boolean(
      r?.info?.promoted ||
      r?.info?.aggregatedDiscountInfoV3 ||
      r?.info?.aggregatedDiscountInfo
    );

  const basicFilter = (list, text) => {
    const q = text.toLowerCase().trim();
    if (!q) return topRated ? list.filter((r) => getRating(r) >= 4) : list;

    const aliasTerms = CUISINE_ALIASES[q] || [];

    return list.filter((r) => {
      const st = getRestaurantSearchText(r);
      const matchRating = topRated ? getRating(r) >= 4 : true;
      const matchText =
        q === "" ||
        st.includes(q) ||
        aliasTerms.some((t) => st.includes(t));
      return matchText && matchRating;
    });
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setFetchError("");
      const res = await fetch(`${API_BASE_URL}/api/restaurants`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      const list =
        json?.data?.cards?.flatMap(
          (c) => c?.card?.card?.gridElements?.infoWithStyle?.restaurants || []
        ) || [];
      const valid = list.filter((r) => getId(r));
      setAllRestaurants(valid);
      setFilteredRestaurants(valid);
    } catch (err) {
      console.error("Fetch error:", err);
      setFetchError(
        "Could not load restaurants. Make sure your backend is running at " + API_BASE_URL
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (!aiMode) {
      setFilteredRestaurants(basicFilter(allRestaurants, searchText));
    }
  }, [searchText, allRestaurants, topRated, aiMode]);

  // Core AI search: accepts query string directly (fixes async state bug)
  const triggerAiSearch = async (query) => {
    const q = query.trim();

    // Update the input box to show what was clicked
    setSearchText(query);

    if (!q) {
      setAiMode(false);
      setAiIntent("");
      setFilteredRestaurants(
        topRated ? allRestaurants.filter((r) => getRating(r) >= 4) : allRestaurants
      );
      return;
    }

    const cacheKey = q + (topRated ? "_top" : "");
    if (cacheRef.current[cacheKey]) {
      const cached = cacheRef.current[cacheKey];
      setFilteredRestaurants(cached.results);
      setAiIntent(cached.intent);
      setAiMode(true);
      return;
    }

    setAiSearching(true);
    setAiIntent("Searching...");
    setShowSuggestions(false);
    setAiMode(true);

    const names  = allRestaurants.map((r) => r?.info?.name || "");
    const parsed = await parseQueryWithGroq(q, names);

    let results = smartFilter(allRestaurants, parsed, topRated);

    // Fallback: basic text/alias search if AI returns nothing
    if (results.length === 0) {
      results = basicFilter(allRestaurants, q);
    }

    // Sort by rating when user asks for "best" / "top"
    if (parsed.minRating > 0 || /best|top|highly/i.test(q)) {
      results = [...results].sort((a, b) => getRating(b) - getRating(a));
    }

    const intent = parsed.intent || `Showing results for "${q}"`;

    cacheRef.current[cacheKey] = { results, intent };
    setFilteredRestaurants(results);
    setAiIntent(intent);
    setAiSearching(false);
  };

  // Button click — reads current searchText via closure (fine here since user typed it)
  const handleAiSearch = () => triggerAiSearch(searchText);

  const handleBasicSearch = () => {
    setAiMode(false);
    setAiIntent("");
    setFilteredRestaurants(basicFilter(allRestaurants, searchText));
  };

  const clearSearch = () => {
    setSearchText("");
    setAiMode(false);
    setAiIntent("");
    cacheRef.current = {};
    setFilteredRestaurants(
      topRated ? allRestaurants.filter((r) => getRating(r) >= 4) : allRestaurants
    );
    inputRef.current?.focus();
  };

  const onlineStatus = useOnlineStatus();

  if (onlineStatus === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <p className="text-5xl mb-4">📡</p>
        <h1 className="text-xl font-semibold text-gray-800">
          You are offline. Please check your internet.
        </h1>
      </div>
    );
  }

  if (isLoading) return <Shimmer />;

  if (fetchError) {
    return (
      <div className="max-w-lg mx-auto mt-16 px-6 text-center space-y-3">
        <p className="text-4xl">⚠️</p>
        <p className="text-red-600 font-medium">{fetchError}</p>
        <button
          onClick={fetchData}
          className="mt-2 px-5 py-2 bg-orange-500 text-white rounded-full text-sm font-semibold hover:bg-orange-600 transition"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <section className="pb-16 bg-white dark:bg-black text-black dark:text-white">
      <div className="relative bg-gradient-to-br from-orange-50 via-amber-50 to-white pt-10 pb-10 px-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100 rounded-full -translate-y-1/2 translate-x-1/3 opacity-40 blur-3xl pointer-events-none" />
        <div className="relative max-w-2xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full mb-3 tracking-widest uppercase">
            ✦ AI-Powered Search
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            What are you craving?
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Type anything — <em>"best biryani"</em>, <em>"top rated pizza"</em>,{" "}
            <em>"cheap burgers"</em>
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-5 relative z-10">
  <div className="relative">
    <div className="flex items-center w-full bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden focus-within:ring-2 focus-within:ring-orange-300 transition-all">
      <span className="pl-4 text-orange-400 text-base select-none flex-shrink-0">
        ✦
      </span>

      <input
        ref={inputRef}
        type="text"
        className="flex-1 min-w-0 px-2 md:px-3 py-3.5 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
        placeholder="Try: best biryani, fast food nearby, noodles..."
        value={searchText}
        onChange={(e) => {
          setSearchText(e.target.value);
          setAiMode(false);
          setAiIntent("");
          setShowSuggestions(e.target.value.length === 0);
        }}
        onFocus={() => {
          if (searchText.length === 0) setShowSuggestions(true);
        }}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 160)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleAiSearch();
        }}
      />

      {searchText && (
        <button
          onClick={clearSearch}
          className="px-2 text-gray-400 hover:text-gray-600 transition text-sm flex-shrink-0"
        >
          ✕
        </button>
      )}

      <button
        onClick={handleBasicSearch}
        className="flex-shrink-0 px-2 md:px-3 py-2 m-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] md:text-xs font-semibold rounded-lg transition whitespace-nowrap"
      >
        <span className="hidden sm:inline">Search</span>
        <span className="sm:hidden">🔍</span>
      </button>

      <button
        onClick={handleAiSearch}
        disabled={aiSearching}
        className="flex-shrink-0 px-2 md:px-4 py-2 m-1 bg-orange-500 hover:bg-orange-600 text-white text-[10px] md:text-xs font-bold rounded-lg transition flex items-center gap-1 whitespace-nowrap"
      >
        {aiSearching ? (
          <>
            <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            <span className="hidden sm:inline">Thinking…</span>
          </>
        ) : (
          <>
            <span>✦</span>
            <span className="hidden sm:inline">AI</span>
          </>
        )}
      </button>
    </div>

    {/* Suggestions dropdown remains below this */}
  </div>
</div>

          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-40">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 pt-3 pb-1">
                Try asking…
              </p>
              {AI_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition flex items-center gap-2"
                  onMouseDown={() => {
                    setShowSuggestions(false);
                    triggerAiSearch(s);
                  }}
                >
                  <span className="text-orange-300 text-xs">✦</span> {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {aiIntent && aiIntent !== "Searching..." && (
          <div className="mt-2.5 flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-4 py-2 text-sm text-orange-700">
            <span>✦</span>
            <span>
              <strong>AI:</strong> {aiIntent}
            </span>
            <button
              onClick={clearSearch}
              className="ml-auto text-orange-400 hover:text-orange-600 text-xs"
            >
              Clear
            </button>
          </div>
        )}

        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <button
            onClick={() => {
              setTopRated((p) => !p);
              setAiMode(false);
              cacheRef.current = {};
            }}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              topRated
                ? "bg-orange-500 text-white"
                : "bg-white border border-gray-200 text-gray-700 hover:border-orange-400"
            }`}
          >
            {topRated ? "⭐ Top Rated ON" : "Top Rated"}
          </button>

          {aiMode && !aiSearching && (
            <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full">
              {filteredRestaurants.length} results
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-w-7xl mx-auto px-4 md:px-6 mt-8">
        {filteredRestaurants.length === 0 ? (
          <div className="col-span-full flex flex-col items-center py-16 text-center">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="text-gray-500 font-medium">No restaurants found.</p>
            <button onClick={clearSearch} className="mt-3 text-orange-500 text-sm underline">
              Show all
            </button>
          </div>
        ) : (
          filteredRestaurants.map((restaurant, i) => (
            //  FIX: replaced <Link> with <div> + startTransition to fix React error
            // Suspense boundaries don't allow synchronous navigation triggers.
            // Wrapping navigate() in startTransition marks it as non-urgent,
            // which React allows inside Suspense.
            <div
              key={`${getId(restaurant)}-${i}`}
              onClick={() => {
                startTransition(() => {
                  navigate("/restaurants/" + getId(restaurant));
                });
              }}
              className="block cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded-lg"
            >
              {isPromoted(restaurant) ? (
                <RestaurantCardPromoted resData={restaurant} />
              ) : (
                <RestaurantCard resData={restaurant} />
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default Body;
