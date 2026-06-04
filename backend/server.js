const express = require("express");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      //Browsers block requests when frontend and backend are on different domains.
      const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(
        origin || ""
      );

      if (!origin || isLocalhost) { //if req from localhost it allows else blocks
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
  })
);

 //RESTAURANTS LIST

app.get("/api/restaurants", async (req, res) => {
  try {
    const response = await fetch(//api proxying
      "https://www.swiggy.com/dapi/restaurants/list/v5?lat=17.3426876&lng=78.3135288&page_type=DESKTOP_WEB_LISTING",
      {
        headers: {
          "User-Agent": "Mozilla/5.0", //User-Agent header tells the server:=>which client making req chrome,firfox
        },
      }
    );

    const json = await response.json();

    res.json(json);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: error.message,
    });
  }
});

//MENU 

const getMenu = async (req, res) => {
  const resId = req.params.resId || req.query.resId;

  if (!resId) {
    return res.status(400).json({
      error: "Restaurant id is required",
    });
  }

  try {
    const menuUrl = `https://www.swiggy.com/mapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=17.3426876&lng=78.3135288&restaurantId=${resId}`;
    const requestOptions = {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/json, text/plain, */*",
        Referer: "https://www.swiggy.com/",
      },
    };

    let response = await fetch(menuUrl, requestOptions);
    let body = await response.text();

    if (response.ok && !body.trim()) {
      response = await fetch(menuUrl, requestOptions);
      body = await response.text();
    }

    if (!response.ok || !body.trim()) {
      return res.status(response.status >= 400 ? response.status : 502).json({
        error: "Failed to fetch menu from Swiggy",
      });
    }

    const json = JSON.parse(body);

    res.json(json);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: error.message,
    });
  }
};

app.get("/menu/:resId", getMenu);
app.get("/api/menu", getMenu);

// ANY PORT SUPPORT

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
