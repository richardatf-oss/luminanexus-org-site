// /chavruta/chavruta.js

document.addEventListener('DOMContentLoaded', () => {
  const chatLog = document.querySelector('.chavruta-chat-history');
  const input = document.getElementById('chavruta-input');

  // Buttons inside the chavruta-actions bar
  const sendBtn = document.querySelector(
    '.chavruta-actions .btn.btn-primary'
  );
  const clearBtn = document.querySelector(
    '.chavruta-actions .btn.btn-ghost'
  );

  const status = document.getElementById('chavruta-status');
  const history = [];

  function setStatus(text) {
    if (status) status.textContent = text;
  }

  function appendMessage(role, text) {
    if (!chatLog) return null;

    const bubble = document.createElement('div');
    bubble.classList.add('chat-bubble');

    if (role === 'assistant') {
      bubble.classList.add('chat-bubble-system');
    } else if (role === 'user') {
      bubble.classList.add('chat-bubble-user');
    }

    bubble.textContent = text;
    chatLog.appendChild(bubble);
    chatLog.scrollTop = chatLog.scrollHeight;

    if (role === 'assistant' || role === 'user') {
      history.push({ role, content: text });
    }

    return bubble;
  }

  function setLoading(bubble, isLoading) {
    if (!bubble) return;
    bubble.classList.toggle('chat-bubble--loading', isLoading);
    if (isLoading) {
      bubble.textContent = 'Thinking…';
    }
  }

  async function sendToChavruta(userText) {
    const loadingBubble = appendMessage('assistant', 'Thinking…');
    setLoading(loadingBubble, true);
    setStatus('Sending question to ChavrutaGPT…');

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

      setLoading(loadingBubble, false);
      loadingBubble.textContent =
        reply ||
        "I'm not sure how to respond just now. Let's try another way to ask that.";

      if (reply) {
        history.push({ role: 'assistant', content: reply });
      }

      setStatus('Response received from ChavrutaGPT.');
    } catch (err) {
      console.error('Chavruta client error:', err);
      setLoading(loadingBubble, false);
      loadingBubble.textContent =
        'Sorry, something went wrong talking to ChavrutaGPT. Please try again.';
      setStatus('Error talking to ChavrutaGPT. See console for details.');
    }
  }

  // Wire up buttons
  if (sendBtn) {
    sendBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const text = (input.value || '').trim();
      if (!text) return;

      appendMessage('user', text);
      input.value = '';
      sendToChavruta(text);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (chatLog) chatLog.innerHTML = '';
      history.length = 0;
      appendMessage(
        'assistant',
        "Shalom, haver. I’m ChavrutaGPT—your learning partner. What would you like to explore today?"
      );
      setStatus('Conversation cleared.');
    });
  }

  setStatus('ChavrutaGPT ready.');
});
