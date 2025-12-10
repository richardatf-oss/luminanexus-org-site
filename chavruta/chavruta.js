document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");
  const log = document.getElementById("chat-log");
  const clearBtn = document.getElementById("clear-chat");
  const statusEl = document.getElementById("chat-status");

  if (!form || !input || !log) {
    console.warn("Chavruta chat elements not found.");
    return;
  }

  // Simple in-memory history for this page load
  const history = [];

  function appendMessage(role, content) {
    const wrapper = document.createElement("div");
    wrapper.className = `chat-message chat-message-${role}`;

    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    bubble.textContent = content;

    wrapper.appendChild(bubble);
    log.appendChild(wrapper);

    history.push({ role, content });
    log.scrollTop = log.scrollHeight;
  }

  async function sendToChavruta(message) {
    // UI: show "thinking"
    statusEl.textContent = "Thinking…";
    input.disabled = true;
    form.querySelector("button[type='submit']").disabled = true;

    try {
      const res = await fetch("/.netlify/functions/chavruta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const reply =
        data.reply ||
        data.answer ||
        data.message ||
        "I couldn’t understand the response from the chavruta function.";

      appendMessage("assistant", reply);
    } catch (err) {
      console.error(err);
      appendMessage(
        "assistant",
        "There was a problem reaching the chavruta function. Please try again in a moment."
      );
    } finally {
      statusEl.textContent = "";
      input.disabled = false;
      form.querySelector("button[type='submit']").disabled = false;
      input.focus();
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    appendMessage("user", message);
    input.value = "";
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
