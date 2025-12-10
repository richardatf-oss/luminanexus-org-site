document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");
  const log = document.getElementById("chat-log");
  const clearBtn = document.getElementById("clear-chat");
  const statusEl = document.getElementById("chat-status");

  if (!form || !input || !log) {
    console.warn("Chavruta chat elements not found on this page.");
    return;
  }

  // Conversation history we send to the Netlify function
  const history = [];

  function appendMessage(role, content) {
    const wrapper = document.createElement("div");
    wrapper.className = `chat-message chat-message-${role}`;

    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    bubble.textContent = content;

    wrapper.appendChild(bubble);
    log.appendChild(wrapper);

    // Track in history for context
    history.push({ role, content });

    // Scroll to bottom
    log.scrollTop = log.scrollHeight;
  }

  async function sendToChavruta(message) {
    // Show UI as “thinking”
    input.disabled = true;
    form.querySelector("button[type='submit']").disabled = true;
    if (statusEl) statusEl.textContent = "Thinking…";

    try {
      const response = await fetch("/.netlify/functions/chavruta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          history,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      const reply =
        data.reply ||
        data.answer ||
        data.message ||
        data.text ||
        "I couldn’t understand the response from the chavruta function.";

      appendMessage("assistant", reply);
    } catch (error) {
      console.error("Chavruta function error:", error);
      appendMessage(
        "assistant",
        "There was a problem reaching the chavruta function. Please try again in a moment."
      );
    } finally {
      input.disabled = false;
      form.querySelector("button[type='submit']").disabled = false;
      if (statusEl) statusEl.textContent = "";
      input.focus();
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const message = input.value.trim();
    if (!message) return;

    appendMessage("user", message);
    input.value = "";

    // Send to Netlify function
    sendToChavruta(message);
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      log.innerHTML = "";
      history.length = 0;

      appendMessage(
        "assistant",
        "Chat cleared. What would you like to explore next?"
      );
    });
  }
});
