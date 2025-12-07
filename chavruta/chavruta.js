// chavruta/chavruta.js
// Front-end client for the Chavruta Netlify function
// with voice input, spoken replies, and quick-start examples.

const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatLog = document.getElementById("chat-log");
const chatMode = document.getElementById("chat-mode");
const chatSend = document.getElementById("chat-send");
const chatStatus = document.getElementById("chat-status");
const chatMic = document.getElementById("chat-mic");
const chatSpeakToggle = document.getElementById("chat-speak");
const exampleButtons = document.querySelectorAll(".example-btn");

let history = []; // short chat history sent to backend

const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;

// Convert references like "1:1" to "chapter 1 verse 1" for speech
function prepareSpeechText(text) {
  if (typeof text !== "string") return text;

  // Generic pattern: number:number → "chapter X verse Y"
  return text.replace(/\b(\d+):(\d+)\b/g, (_match, chap, verse) => {
    return `chapter ${chap} verse ${verse}`;
  });
}

function appendMessage(role, text) {
  const wrapper = document.createElement("div");
  wrapper.className = `chat-message ${role}`;

  const bubble = document.createElement("div");
  bubble.className = "chat-bubble";
  bubble.textContent = text;

  wrapper.appendChild(bubble);
  chatLog.appendChild(wrapper);
  chatLog.scrollTop = chatLog.scrollHeight;

  // Track history for backend
  if (role === "user" || role === "assistant") {
    history.push({ role, content: text });
    if (history.length > 10) {
      history = history.slice(-10);
    }
  }

  // Optional: speak assistant replies aloud
  if (
    role === "assistant" &&
    canSpeak &&
    chatSpeakToggle &&
    chatSpeakToggle.checked
  ) {
    try {
      const spokenText = prepareSpeechText(text);
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Speech synthesis error:", err);
    }
  }
}

let micSupported = false;
let recognition = null;
let listening = false;

function setLoading(isLoading, statusText) {
  if (isLoading) {
    chatSend.disabled = true;
    chatInput.disabled = true;
    if (chatMic) chatMic.disabled = true;
    chatStatus.textContent = statusText || "Listening…";
  } else {
    chatSend.disabled = false;
    chatInput.disabled = false;
    if (chatMic && micSupported) chatMic.disabled = false;
    chatStatus.textContent = "Ready";
  }
}

// ---- Speech recognition (mic) ----

function setupSpeech() {
  if (typeof window === "undefined") return;

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition || !chatMic) {
    if (chatMic) {
      chatMic.disabled = true;
      chatMic.title = "Voice input not supported in this browser.";
    }
    return;
  }

  micSupported = true;
  recognition = new SpeechRecognition();
  recognition.lang = "en-US"; // can be adjusted later
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  chatMic.addEventListener("click", () => {
    if (!listening) {
      listening = true;
      chatStatus.textContent = "Listening (mic)…";
      chatMic.textContent = "⏹ Stop";
      recognition.start();
    } else {
      listening = false;
      chatMic.textContent = "🎙 Speak";
      chatStatus.textContent = "Ready";
      recognition.stop();
    }
  });

  recognition.onresult = (event) => {
    listening = false;
    chatMic.textContent = "🎙 Speak";
    chatStatus.textContent = "Ready";

    const transcript = event.results[0][0].transcript;
    // append to textarea so user can edit before sending
    chatInput.value = (chatInput.value ? chatInput.value + " " : "") + transcript;
    chatInput.focus();
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    listening = false;
    chatMic.textContent = "🎙 Speak";
    chatStatus.textContent = "Ready";
  };

  recognition.onend = () => {
    if (listening) {
      recognition.start();
    } else {
      chatMic.textContent = "🎙 Speak";
      chatStatus.textContent = "Ready";
    }
  };
}

setupSpeech();

// ---- Quick-start example buttons ----

if (exampleButtons.length) {
  exampleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const text = btn.getAttribute("data-text") || "";
      const mode = btn.getAttribute("data-mode") || "text";

      if (text) {
        chatInput.value = text;
        chatInput.focus();
      }
      if (mode && chatMode) {
        chatMode.value = mode;
      }
    });
  });
}

// ---- Form submit ----

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;

  appendMessage("user", message);
  chatInput.value = "";
  setLoading(true, "Asking chavruta…");

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
