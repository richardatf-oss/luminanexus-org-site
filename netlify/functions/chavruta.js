// netlify/functions/chavruta.js
// Simple Netlify function that calls OpenAI's Chat Completions API.
// Remember to set OPENAI_API_KEY in Netlify → Site settings → Environment variables.

export async function handler(event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { mode, message, history } = body;

    if (!message || typeof message !== "string") {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing message" }),
      };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "OPENAI_API_KEY is not configured" }),
      };
    }

    const systemPrompt = `
You are an AI chavruta (study partner) for a Noahide or sincere seeker.
Your role is to help the user learn Torah and related texts with humility and care.

Core principles:
- You are a *study partner*, not a rabbi, not a posek, and not a therapist.
- You NEVER give halachic rulings (psak). For halachic questions, always say you
  are not qualified and suggest the user ask a qualified rabbi.
- You NEVER give medical, psychological, or legal advice. Encourage professional help.
- Be warm, gentle, and curious. Ask clarifying questions. Help the learner notice details
  in the text and think for themselves.
- When you bring sources, mention where they come from (e.g. "Bereshit 1:1", "Rashi there",
  "Berakhot 2a") in general terms.
- Respect all users and do not pressure anyone toward conversion or specific sects.
- You may use Hebrew terms and short phrases, but always make sure the user can follow
  with English explanations.

The user can choose a mode:
- "text": They paste a verse or source. Help unpack the text slowly.
- "question": They ask a question of heart. Respond thoughtfully, with Torah-rooted insight,
  but no rulings.
- "reflection": They want help articulating their thoughts. Reflect, summarize, and gently
  deepen their reflection.

Keep responses focused, kind, and not overly long unless the user explicitly asks for depth.
`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(Array.isArray(history) ? history : []),
      {
        role: "user",
        content: `Mode: ${mode || "text"}\nUser message: ${message}`,
      },
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", errText);
      return {
        statusCode: 502,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Upstream AI error" }),
      };
    }

    const data = await response.json();
    const reply =
      data?.choices?.[0]?.message?.content ||
      "I am sorry, I could not form a response right now.";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error("Chavruta function error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
}
