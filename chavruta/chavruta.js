// Simple front-end client for the Chavruta Netlify function

const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatLog = document.getElementById("chat-log");
const chatMode = document.getElementById("chat-mode");
const chatSend = document.getElementById("chat-send");
const chatStatus = document.getElementById("chat-status");

let history = []; // we’ll send a short history to the function

function appendMessage(role, text) {
  const wrapper = document.createElement("div");
  wrapper.className = `chat-message ${role}`;

  const bubble = document.createElement("div");
  bubble.className = "chat-bubble";
  bubble.textContent = text;

  wrapper.appendChild(bubble);
  chatLog.appendChild(wrapper);
  chatLog.scrollTop = chatLog.scrollHeight;

  // Track history sent to backend (user & assistant only)
  if (role === "user" || role === "assistant") {
    history.push({ role, content: text });
    if (history.length > 10) {
      history = history.slice(-10);
    }
  }
}

function setLoading(isLoading) {
  if (isLoading) {
    chatSend.disabled = true;
    chatInput.disabled = true;
    chatStatus.textContent = "Listening…";
  } else {
    chatSend.disabled = false;
    chatInput.disabled = false;
    chatStatus.textContent = "Ready";
  }
}

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;

  appendMessage("user", message);
  chatInput.value = "";
  setLoading(true);

  try {
    const response = await fetch("/.netlify/functions/chavruta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: chatMode.value,
        message,
        history,
      }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    const reply = data.reply || "I am sorry, I could not form a response right now.";
    appendMessage("assistant", reply);
  } catch (err) {
    console.error(err);
    appendMessage(
      "system",
      "Something went wrong while reaching the chavruta. Please try again in a moment."
    );
  } finally {
    setLoading(false);
  }
});
