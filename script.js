const fileInput = document.getElementById("imageInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const chatbox = document.getElementById("chatBox");

//here add bot message function is getting declared
function addBotMessage(message) {
  const div = document.createElement("div");
  div.className = "p-2 border rounded my-1 bg-white";
  div.textContent = `🤖 ${message}`;
  chatbox.appendChild(div);
  chatbox.scrollTop = chatbox.scrollHeight; // auto scroll
}

analyzeBtn.addEventListener("click", async () => {
  const file = fileInput.files[0];

  if (!file) {
    addBotMessage("Please upload an image first.");
    return;
  }

  addBotMessage("📤 Uploading and analyzing image...");

  const reader = new FileReader();

  reader.onload = async function () {
    const base64Image = reader.result.split(",")[1]; // Get only base64 part

    try {
      const response = await fetch("http://localhost:3000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ base64Image }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        addBotMessage(
          `❌ Server request failed with status ${response.status}.`
        );
        console.error("Server Error Response:", errorText);
        return;
      }

      const json = await response.json();

      if (
        json.responses &&
        json.responses[0] &&
        json.responses[0].labelAnnotations
      ) {
        const labels = json.responses[0].labelAnnotations.map(
          (label) => `${label.description} (${(label.score * 100).toFixed(1)}%)`
        );
        addBotMessage(`🧠 I see: ${labels.join(", ")}`);
      } else if (json.responses && json.responses[0].error) {
        addBotMessage(`❌ API Error: ${json.responses[0].error.message}`);
        console.error("API Error:", json.responses[0].error);
      } else {
        addBotMessage("⚠️ No labels detected. Try another image.");
        console.error("Invalid response:", json);
      }
    } catch (error) {
      addBotMessage(
        "❌ Failed to analyze the image. Please check your server and network."
      );
      console.error("Error during server call:", error);
    }
  };

  reader.readAsDataURL(file);
});
