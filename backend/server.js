const express = require("express");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      //Browsers block requests when frontend and backend are on different domains.
      const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin || "");
      const isRender = /^https:\/\/.*\.onrender\.com$/.test(origin || "");

      if (!origin || isLocalhost || isRender) { //if req from localhost it allows else blocks
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
  })
);


const swiggyHeaders = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  "Referer": "https://www.swiggy.com/",
  "Origin": "https://www.swiggy.com",
  "Cookie": process.env.SWIGGY_COOKIE || "", // set this in Render environment variables
};

// RESTAURANTS LIST
app.get("/api/restaurants", async (req, res) => {
  try {
    const response = await fetch(
      "https://www.swiggy.com/dapi/restaurants/list/v5?lat=17.3426876&lng=78.3135288&page_type=DESKTOP_WEB_LISTING",
      { headers: swiggyHeaders }
    );

    const body = await response.text();
    console.log("Restaurants status:", response.status);
    console.log("Restaurants preview:", body.slice(0, 300)); // check Render logs

    res.json(JSON.parse(body));
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

// MENU
const getMenu = async (req, res) => {
  const resId = req.params.resId || req.query.resId;

  if (!resId) {
    return res.status(400).json({ error: "Restaurant id is required" });
  }

  try {
    const menuUrl = `https://www.swiggy.com/mapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=17.3426876&lng=78.3135288&restaurantId=${resId}`;

    let response = await fetch(menuUrl, { headers: swiggyHeaders });
    let body = await response.text();

    console.log("Menu status:", response.status);
    console.log("Menu preview:", body.slice(0, 300)); // check Render logs

    if (response.ok && !body.trim()) {
      response = await fetch(menuUrl, { headers: swiggyHeaders });
      body = await response.text();
    }

    if (!response.ok || !body.trim()) {
      return res.status(response.status >= 400 ? response.status : 502).json({
        error: "Failed to fetch menu from Swiggy",
      });
    }

    res.json(JSON.parse(body));
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

app.get("/menu/:resId", getMenu);
app.get("/api/menu", getMenu);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
