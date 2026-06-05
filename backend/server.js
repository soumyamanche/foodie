const express = require("express");
const cors = require("cors");

const app = express();


app.use(
  cors({
    origin(origin, callback) {
      const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin || "");
      const isRender = /^https:\/\/.*\.onrender\.com$/.test(origin || "");
      if (!origin || isLocalhost || isRender) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
  })
);

app.use(express.json());



const swiggyHeaders = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://www.swiggy.com/",
  Origin: "https://www.swiggy.com",
  Cookie: process.env.SWIGGY_COOKIE || "",
};

// Fetch with timeout + safe JSON parse
async function swiggyFetch(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const response = await fetch(url, {
      headers: swiggyHeaders,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const body = await response.text();

    console.log(`[${new Date().toISOString()}] ${url}`);
    console.log(`Status: ${response.status} | Preview: ${body.slice(0, 200)}`);

    if (!body.trim()) {
      throw new Error(`Empty response from Swiggy (status ${response.status})`);
    }

    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      throw new Error(`Swiggy returned non-JSON (status ${response.status}): ${body.slice(0, 200)}`);
    }

    return { ok: response.ok, status: response.status, data: parsed };
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}


app.get("/", (req, res) => {
  res.send("🚀 Foodie Backend is Live");
});

// RESTAURANTS LIST
app.get("/api/restaurants", async (req, res) => {
  try {
    const { ok, status, data } = await swiggyFetch(
      "https://www.swiggy.com/dapi/restaurants/list/v5?lat=17.3426876&lng=78.3135288&page_type=DESKTOP_WEB_LISTING"
    );

    if (!ok) {
      return res.status(status).json({ error: "Swiggy rejected the request", swiggyStatus: status });
    }

    res.json(data);
  } catch (err) {
    console.error("Restaurants error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// MENU — supports both /menu/:resId and /api/menu?resId=
async function getMenu(req, res) {
  const resId = req.params.resId || req.query.resId;

  if (!resId) {
    return res.status(400).json({ error: "Restaurant ID is required" });
  }

  try {
    const url = `https://www.swiggy.com/mapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=17.3426876&lng=78.3135288&restaurantId=${resId}`;
    const { ok, status, data } = await swiggyFetch(url);

    if (!ok) {
      return res.status(status).json({ error: "Swiggy rejected the menu request", swiggyStatus: status });
    }

    res.json(data);
  } catch (err) {
    console.error("Menu error:", err.message);
    res.status(500).json({ error: err.message });
  }
}

app.get("/menu/:resId", getMenu);
app.get("/api/menu", getMenu);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on http://localhost:${PORT}");
});
