// /chavruta/chavruta.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('user-input');
  const chatLog = document.getElementById('chat-log');
  const clearButton = document.getElementById('clear-button');

  // Simple in-page history (user + assistant only)
  const history = [];

  function appendMessage(role, text) {
    const wrapper = document.createElement('div');
    wrapper.className = `chat-message chat-message--${role}`;

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.textContent = text;

    wrapper.appendChild(bubble);
    chatLog.appendChild(wrapper);
    chatLog.scrollTop = chatLog.scrollHeight;

    if (role === 'user' || role === 'assistant') {
      history.push({ role, content: text });
    }

    return bubble;
  }

  function setLoading(bubble, isLoading) {
    if (!bubble) return;
    bubble.classList.toggle('chat-bubble--loading', isLoading);
  }

  async function sendToChavruta(userText) {
    const loadingBubble = appendMessage('assistant', 'Thinking…');
    setLoading(loadingBubble, true);

    try {
      const res = await fetch('/.netlify/functions/chavruta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latestUserText: userText,
          history,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const reply = (data.reply || '').trim();

      loadingBubble.textContent = reply || 'Sorry, no response came back.';
      setLoading(loadingBubble, false);

      if (reply) {
        history.push({ role: 'assistant', content: reply });
      }
    } catch (err) {
      console.error('Chavruta client error:', err);
      loadingBubble.textContent =
        'Sorry, something went wrong talking to ChavrutaGPT. Please try again.';
      setLoading(loadingBubble, false);
    }
  }

  // Handle form submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    appendMessage('user', text);
    input.value = '';
    sendToChavruta(text);
  });

  // Clear button
  if (clearButton) {
    clearButton.addEventListener('click', () => {
      chatLog.innerHTML = '';
      history.length = 0;
      appendMessage(
        'assistant',
        "Shalom, haver. I'm ChavrutaGPT—your learning partner. What would you like to explore today?"
      );
    });
  }

  // Initial greeting if log is empty
  if (!chatLog.hasChildNodes()) {
    appendMessage(
      'assistant',
      "Shalom, haver. I'm ChavrutaGPT—your learning partner. What would you like to explore today?"
    );
  }
});
