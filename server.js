const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); // Import the CORS middleware

const app = express();
const PORT = 3000;
const API_KEY = "AIzaSyB4tMC8eww1IC8pHBjzt9JvrrJ5e8sjHGg";

// Enable CORS for all origins
app.use(cors());

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Route to handle image analysis
app.post("/analyze", async (req, res) => {
  const { base64Image } = req.body;

  if (!base64Image) {
    return res.status(400).json({ error: "Base64 image is required" });
  }

  try {
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requests: [
            {
              image: { content: base64Image },
              features: [{ type: "LABEL_DETECTION", maxResults: 5 }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Vision API Error:", errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error during Vision API call:", error);
    res.status(500).json({ error: "Failed to analyze the image" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
