// chavruta/chavruta.js
// Simple chat UI + voice input/output for ChavrutaGPT

const API_ENDPOINT = "/api/chavruta"; // adjust if your backend lives elsewhere

document.addEventListener("DOMContentLoaded", () => {
  const chatLog = document.getElementById("chat-log");
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");
  const clearChatBtn = document.getElementById("clear-chat");
  const statusEl = document.getElementById("chat-status");
  const voiceInputBtn = document.getElementById("voice-input-toggle");
  const voiceOutputBtn = document.getElementById("voice-output-toggle");

  let voiceOutputEnabled = false;
  let recognition = null;
  let recognizing = false;

  // Helper: append message
  function appendMessage(role, text) {
    const wrapper = document.createElement("div");
    wrapper.className =
      role === "assistant"
        ? "chat-message chat-message-assistant"
        : "chat-message chat-message-user";

    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    bubble.textContent = text;

    wrapper.appendChild(bubble);
    chatLog.appendChild(wrapper);
    chatLog.scrollTop = chatLog.scrollHeight;

    if (role === "assistant") {
      speak(text);
    }
  }

  // Helper: set status text
  function setStatus(message) {
    if (!statusEl) return;
    statusEl.textContent = message || "";
  }

  // Voice output (text-to-speech)
  function speak(text) {
    if (!voiceOutputEnabled) return;
    if (!("speechSynthesis" in window)) {
      console.warn("SpeechSynthesis not supported in this browser.");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  // Toggle voice output
  if (voiceOutputBtn) {
    voiceOutputBtn.addEventListener("click", () => {
      voiceOutputEnabled = !voiceOutputEnabled;
      voiceOutputBtn.textContent = voiceOutputEnabled ? "🔊 Voice on" : "🔊 Voice off";
    });
  }

  // Voice input (speech-to-text)
  function initRecognition() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("SpeechRecognition not supported in this browser.");
      setStatus("Voice input not supported in this browser.");
      return null;
    }
    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    return rec;
  }

  if (voiceInputBtn) {
    voiceInputBtn.addEventListener("click", () => {
      if (!recognition) {
        recognition = initRecognition();
        if (!recognition) return;

        recognition.addEventListener("result", (event) => {
          const transcript = Array.from(event.results)
            .map((r) => r[0].transcript)
            .join(" ");
          if (transcript) {
            chatInput.value = transcript;
            chatInput.focus();
          }
        });

        recognition.addEventListener("start", () => {
          recognizing = true;
          setStatus("Listening…");
          voiceInputBtn.textContent = "🎙️ Stop listening";
        });

        recognition.addEventListener("end", () => {
          recognizing = false;
          setStatus("");
          voiceInputBtn.textContent = "🎙️ Voice input";
        });

        recognition.addEventListener("error", (e) => {
          console.error("Voice error:", e);
          recognizing = false;
          setStatus("Voice input error.");
          voiceInputBtn.textContent = "🎙️ Voice input";
        });
      }

      if (!recognizing) {
        try {
          recognition.start();
        } catch (e) {
          console.error(e);
        }
      } else {
        recognition.stop();
      }
    });
  }

  // Handle form submit
  if (chatForm) {
    chatForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const message = (chatInput.value || "").trim();
      if (!message) return;

      appendMessage("user", message);
      chatInput.value = "";
      setStatus("Asking ChavrutaGPT…");

      try {
        const response = await fetch(API_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        const answer = data.answer || data.message || "[No answer received]";
        appendMessage("assistant", answer);
        setStatus("");
      } catch (error) {
        console.error(error);
        appendMessage(
          "assistant",
          "There was a problem reaching the Chavruta backend. Please try again later."
        );
        setStatus("Error talking to backend.");
      }
    });
  }

  // Clear chat
  if (clearChatBtn) {
    clearChatBtn.addEventListener("click", () => {
      chatLog.innerHTML = "";
      appendMessage(
        "assistant",
        "Chat cleared. What would you like to explore now?"
      );
    });
  }
});
