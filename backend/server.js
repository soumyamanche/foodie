const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

const swiggyHeaders = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://www.swiggy.com/",
  Origin: "https://www.swiggy.com",
  Cookie: process.env.SWIGGY_COOKIE || "",
};

const fetchJson = async (url) => {
  const response = await fetch(url, { headers: swiggyHeaders });
  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    throw new Error(`Swiggy responded with ${response.status}`);
  }

  if (!contentType.includes("application/json")) {
    throw new Error("Swiggy did not return JSON");
  }

  return response.json();
};

const getMenu = async (resId) => {
  const url = `https://www.swiggy.com/mapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=17.3426876&lng=78.3135288&restaurantId=${resId}`;
  return fetchJson(url);
};

app.get("/", (req, res) => {
  res.send("Foodie Backend is Live");
});

app.get(["/api/restaurants", "/restaurants"], async (req, res) => {
  try {
    const data = await fetchJson(
      "https://www.swiggy.com/dapi/restaurants/list/v5?lat=17.3426876&lng=78.3135288&page_type=DESKTOP_WEB_LISTING"
    );

    res.json(data);
  } catch (err) {
    console.warn("Restaurant proxy error:", err.message);
    res.status(502).json({
      error: "Failed to fetch restaurants",
      details: err.message,
    });
  }
});

app.get(
  ["/menu/:resId", "/api/menu/:resId", "/restaurantMenu/:resId", "/api/restaurantMenu/:resId"],
  async (req, res) => {
    try {
      const data = await getMenu(req.params.resId);
      res.json(data);
    } catch (err) {
      console.warn("Menu proxy error:", err.message);
      res.status(502).json({
        error: "Failed to fetch menu",
        details: err.message,
      });
    }
  }
);

const distPath = path.join(__dirname, "../frontend/dist");
const buildPath = path.join(__dirname, "../frontend/build");
const frontendBuildPath = fs.existsSync(distPath) ? distPath : buildPath;

if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
}

app.use((req, res) => {
  const indexPath = path.join(frontendBuildPath, "index.html");

  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }

  return res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

