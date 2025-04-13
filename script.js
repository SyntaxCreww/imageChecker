const API_KEY = 'AIzaSyC-ZpcXXFCTGFRWMN5WS1cs5MBHQoiTOpY'; // Replace with your actual Google Cloud Vision API key
const proxyUrl = "https://corsproxy.io/?"; // CORS bypass for browser-based testing

const fileInput = document.getElementById('imageInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const chatbox = document.getElementById('chatBox');

function addBotMessage(message) {
  const div = document.createElement('div');
  div.className = 'p-2 border rounded my-1 bg-white';
  div.textContent = `🤖 ${message}`;
  chatbox.appendChild(div);
}

analyzeBtn.addEventListener('click', async () => {
  const file = fileInput.files[0];

  if (!file) {
    addBotMessage("Please upload an image first.");
    return;
  }

  addBotMessage("📤 Uploading and analyzing image...");

  const reader = new FileReader();

  reader.onload = async function () {
    const base64Image = reader.result.split(',')[1]; // Get only base64 part

    try {
      const response = await fetch(proxyUrl + `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [{
            image: { content: base64Image },
            features: [{ type: "LABEL_DETECTION", maxResults: 5 }]
          }]
        })
      });

      const json = await response.json();

      // Error check
      if (!json.responses || !json.responses[0].labelAnnotations) {
        throw new Error("Invalid response from Vision API");
      }

      const labels = json.responses[0].labelAnnotations.map(label =>
        `${label.description} (${(label.score * 100).toFixed(1)}%)`
      );

      addBotMessage(`🧠 I see: ${labels.join(', ')}`);

    } catch (error) {
      addBotMessage("❌ Failed to analyze the image. Please check your API key and try again.");
      console.error("Error during Vision API call:", error);
    }
  };

  reader.readAsDataURL(file);
});
