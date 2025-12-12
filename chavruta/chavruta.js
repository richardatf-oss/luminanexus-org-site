// chavruta/chavruta.js
// Front-end script for ChavrutaGPT on LuminaNexus.org
// Talks to the Netlify function at /.netlify/functions/chavruta

(function () {
  const historyEl = document.getElementById("chavruta-history");
  const inputEl = document.getElementById("chavruta-input");
  const sendBtn = document.getElementById("chavruta-send");
  const clearBtn = document.getElementById("chavruta-clear");
  const statusEl = document.getElementById("chavruta-status");

  if (!historyEl || !inputEl || !sendBtn) {
    console.error(
      "Chavruta script: missing one of chavruta-history, chavruta-input, chavruta-send in the HTML."
    );
    return;
  }

  // Simple in-memory history we send to the Netlify function
  let convoHistory = [];

  function setStatus(message) {
    if (statusEl) statusEl.textContent = message;
  }

  function createBubble(role, text) {
    const bubble = document.createElement("div");
    bubble.className =
      "chavruta-bubble " +
      (role === "assistant" ? "chavruta-bubble-assistant" : "chavruta-bubble-user");
    bubble.textContent = text;
    historyEl.appendChild(bubble);
    historyEl.scrollTop = historyEl.scrollHeight;
    return bubble;
  }

  function clearConversation() {
    convoHistory = [];
    historyEl.innerHTML = "";

    // Optional: reset with a friendly greeting
    createBubble(
      "assistant",
      "Shalom, haver. I’m ChavrutaGPT—an AI learning partner created through LuminaNexus. What would you like to explore today?"
    );
    createBubble(
      "assistant",
      "You can ask about a pasuk, a sugya, a sefer from the Library, or a question that weaves Torah and physics."
    );
    setStatus("ChavrutaGPT ready.");
  }

  async function sendToChavruta() {
    const text = (inputEl.value || "").trim();
    if (!text) {
      setStatus("Please type a question or comment first.");
      inputEl.focus();
      return;
    }

    // Add the user's message locally
    createBubble("user", text);
    convoHistory.push({ role: "user", content: text });

    // Keep only the last few exchanges so the prompt doesn't explode
    if (convoHistory.length > 12) {
      convoHistory = convoHistory.slice(convoHistory.length - 12);
    }

    // Clear the input box
    inputEl.value = "";

    // Show "thinking…" bubble
    const thinkingBubble = createBubble("assistant", "Thinking together…");

    // Disable while sending
    sendBtn.disabled = true;
    if (clearBtn) clearBtn.disabled = true;
    setStatus("Sending question to ChavrutaGPT…");

    try {
      const res = await fetch("/.netlify/functions/chavruta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latestUserText: text,
          history: convoHistory,
        }),
      });

      if (!res.ok) {
        const details = await res.text();
        console.error("Chavruta function HTTP error:", res.status, details);
        thinkingBubble.textContent =
          "Sorry, something went wrong talking to the server (status " +
          res.status +
          ").";
        setStatus("Server error while contacting ChavrutaGPT.");
        return;
      }

      const data = await res.json();

      if (data.error) {
        console.error("Chavruta function returned error:", data);
        thinkingBubble.textContent =
          "Sorry, there was a problem on the server: " + data.error;
        setStatus("Server error: " + (data.error || "Unknown error"));
        return;
      }

      const reply = (data.reply || "").trim();

      if (reply) {
        thinkingBubble.textContent = reply;
        convoHistory.push({ role: "assistant", content: reply });
        setStatus("Response received from ChavrutaGPT.");
      } else {
        thinkingBubble.textContent =
          "I'm not sure how to respond just now. Let's try asking in a different way.";
        setStatus("ChavrutaGPT could not generate a reply.");
      }
    } catch (err) {
      console.error("Network or function error talking to ChavrutaGPT:", err);
      thinkingBubble.textContent =
        "Sorry, there was a network error while trying to reach ChavrutaGPT.";
      setStatus("Network error contacting ChavrutaGPT.");
    } finally {
      sendBtn.disabled = false;
      if (clearBtn) clearBtn.disabled = false;
      historyEl.scrollTop = historyEl.scrollHeight;
    }
  }

  // Wire up buttons & enter key
  sendBtn.addEventListener("click", (e) => {
    e.preventDefault();
    sendToChavruta();
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", (e) => {
      e.preventDefault();
      clearConversation();
    });
  }

  // Allow Ctrl+Enter to send from the textarea
  inputEl.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      sendToChavruta();
    }
  });

  // Initial greeting
  clearConversation();
})();
