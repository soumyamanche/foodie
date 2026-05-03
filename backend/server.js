const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());

app.get('/menu/:resId', async (req, res) => {
  const { resId } = req.params;
  try {
    const data = await fetch(
      'https://www.swiggy.com/dapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=17.3426876&lng=78.3135288&restaurantId=' + resId,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.swiggy.com/',
        }
      }
    );
    console.log("Status:", data.status);
    const text = await data.text();
    console.log("Raw response:", text.slice(0, 200));
    res.send(text);
  } catch (err) {
    console.log("Swiggy error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log('Server running on port 3001'));