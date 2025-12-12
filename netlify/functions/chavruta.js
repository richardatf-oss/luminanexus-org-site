// netlify/functions/chavruta.js
// Simple Netlify function that calls the OpenAI Chat Completions API
// using the OPENAI_API_KEY environment variable configured in Netlify.

exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("Missing OPENAI_API_KEY env var");
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Server misconfigured: no API key" }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (err) {
    console.error("Error parsing JSON body:", err);
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid JSON" }),
    };
  }

  const latestUserText = (payload.latestUserText || "").trim();
  const history = Array.isArray(payload.history) ? payload.history : [];

  if (!latestUserText) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "No user text provided" }),
    };
  }

  // Build messages array from history + latest user message
  const messages = [
    {
      role: "system",
      content:
        "You are ChavrutaGPT, a gentle, curious chavruta for LuminaNexus.org. " +
        "Help the user explore Torah, Chazal, Kabbalah, and modern physics in a careful, non-psak way. " +
        "Always remind them to check primary texts and real teachers for halacha.",
    },
  ];

  for (const item of history) {
    if (!item || !item.content) continue;
    const role = item.role === "assistant" ? "assistant" : "user";
    messages.push({ role, content: String(item.content) });
  }

  messages.push({ role: "user", content: latestUserText });

  try {
    // Use the Chat Completions endpoint directly with fetch
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini", // or "gpt-4o-mini" if you prefer
        messages,
        temperature: 0.35,
        max_tokens: 700,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("OpenAI API error:", response.status, text);
      return {
        statusCode: response.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "OpenAI API error",
          status: response.status,
          details: text.slice(0, 500),
        }),
      };
    }

    const data = await response.json();
    const reply =
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content
        ? data.choices[0].message.content
        : "";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error("Netlify function error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Server error contacting ChavrutaGPT",
        details: String(err),
      }),
    };
  }
};
