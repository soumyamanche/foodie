const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors()); 

app.use(express.json());


app.get("/", (req, res) => {
  res.send("🚀 Foodie Backend is Live");
});


const swiggyHeaders = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://www.swiggy.com/",
  Origin: "https://www.swiggy.com",
  Cookie: process.env.SWIGGY_COOKIE || "",
};

//res api
app.get("/api/restaurants", async (req, res) => {
  try {
    const response = await fetch(
      "https://www.swiggy.com/dapi/restaurants/list/v5?lat=17.3426876&lng=78.3135288&page_type=DESKTOP_WEB_LISTING",
      { headers: swiggyHeaders }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch restaurants" });
  }
});
//menu
app.get("/menu/:resId", async (req, res) => {
  try {
    const { resId } = req.params;

    const url = `https://www.swiggy.com/mapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=17.3426876&lng=78.3135288&restaurantId=${resId}`;

    const response = await fetch(url, { headers: swiggyHeaders });
    const data = await response.json();

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch menu" });
  }
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
