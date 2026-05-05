const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());

const DEFAULT_LAT = "22.6203536";
const DEFAULT_LNG = "77.7580826";

app.get("/api/restaurants", async (req, res) => {
  const lat = req.query.lat || DEFAULT_LAT;
  const lng = req.query.lng || DEFAULT_LNG;

  try {
    const response = await axios.get(
      `https://www.swiggy.com/dapi/restaurants/list/v5?lat=${lat}&lng=${lng}&is-seo-homepage-enabled=true&page_type=DESKTOP_WEB_LISTING`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Referer": "https://www.swiggy.com/",
          "Accept": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Swiggy restaurants API failed" });
  }
});

app.get("/api/menu", async (req, res) => {
  const { resId } = req.query;
  const lat = req.query.lat || DEFAULT_LAT;
  const lng = req.query.lng || DEFAULT_LNG;

  if (!resId) {
    return res.status(400).json({ error: "resId is required" });
  }

  try {
    const response = await axios.get(
      `https://www.swiggy.com/mapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=${lat}&lng=${lng}&restaurantId=${resId}&submitAction=ENTER`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Referer": "https://www.swiggy.com/",
          "Accept": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Swiggy API failed" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("✅ Server running on port", PORT);
});