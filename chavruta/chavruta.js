// /chavruta/chavruta.js

document.addEventListener('DOMContentLoaded', () => {
  const chatLog = document.getElementById('chat-log');
  const input = document.getElementById('chavruta-input');
  const sendBtn = document.getElementById('chavruta-send');
  const clearBtn = document.getElementById('chavruta-clear');
  const statusEl = document.getElementById('chavruta-status');

  const history = [];

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  function addBubble(role, text) {
    if (!chatLog) return null;
    const div = document.createElement('div');
    div.classList.add('chat-bubble');
    if (role === 'assistant') {
      div.classList.add('chat-bubble-system');
    } else {
      div.classList.add('chat-bubble-user');
    }
    div.textContent = text;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;

    if (role === 'assistant' || role === 'user') {
      history.push({ role, content: text });
    }

    return div;
  }

  async function sendToChavruta(userText) {
    const thinkingBubble = addBubble('assistant', 'Thinking…');
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
        const msg = `HTTP error ${res.status}`;
        console.error('Chavruta function error:', msg);
        if (thinkingBubble) {
          thinkingBubble.textContent =
            'Sorry, there was a problem talking to ChavrutaGPT. Please try again.';
        }
        setStatus(msg);
        return;
      }

      const data = await res.json();
      const reply = (data.reply || '').trim();

      if (thinkingBubble) {
        thinkingBubble.textContent =
          reply ||
          "I'm not sure how to respond just now. Let's try asking in a different way.";
      }

      if (reply) {
        history.push({ role: 'assistant', content: reply });
      }

      setStatus('Response received from ChavrutaGPT.');
    } catch (err) {
      console.error('Chavruta client error:', err);
      if (thinkingBubble) {
        thinkingBubble.textContent =
          'Sorry, there was a network error talking to ChavrutaGPT.';
      }
      setStatus('Network error. See console for details.');
    }
  }

  function handleSend() {
    if (!input) return;
    const text = (input.value || '').trim();
    if (!text) return;

    addBubble('user', text);
    input.value = '';
    sendToChavruta(text);
  }

  // Wire up buttons and keyboard
  if (sendBtn) {
    sendBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleSend();
    });
  }

  if (input) {
    input.addEventListener('keydown', (e) => {
      // Ctrl+Enter / Cmd+Enter sends
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSend();
      }
    });
  }

  if (clearBtn && chatLog) {
    clearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      chatLog.innerHTML = '';
      history.length = 0;
      addBubble(
        'assistant',
        'Shalom, haver. I’m ChavrutaGPT—your learning partner. What would you like to explore today?'
      );
      setStatus('Conversation cleared.');
    });
  }

  setStatus('ChavrutaGPT ready.');
});
