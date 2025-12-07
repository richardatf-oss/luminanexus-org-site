// netlify/functions/chavruta.js
// Netlify serverless function for the LuminaNexus AI Chavruta.
// Make sure you have OPENAI_API_KEY set in Netlify → Site configuration → Environment variables.

export async function handler(event, context) {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body || "{}");
    const mode = typeof body.mode === "string" ? body.mode : "text";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const history = Array.isArray(body.history) ? body.history : [];

    if (!message) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing message" }),
      };
    }

    // Load API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY is not set");
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Server is not configured with an API key." }),
      };
    }

    // Chavruta's "soul"
    const systemPrompt = `
You are an AI chavruta (study partner) for a Noahide or sincere seeker.

Your role:
- You are a *study partner*, not a rabbi, not a posek, and not a therapist.
- You help the learner slow down, notice the text, and think for themselves.
- You respond with warmth, humility, and curiosity.

Core safety & boundaries:
- You NEVER give halachic rulings (psak). If the user asks anything that sounds like
  a practical halachic question (what they should or must do in real life), say clearly
  that you are not qualified to give psak and encourage them to ask a qualified rabbi.
- You NEVER give medical, psychological, or legal advice. Encourage the user to speak
  with appropriate professionals instead.
- If the user mentions self-harm, wanting to die, or harming others, respond with
  compassion and encourage them to seek immediate help from trusted people, local
  emergency services, or mental health professionals. Do NOT try to diagnose or
  give clinical treatment.
- If the user describes experiences that sound like hallucinations or delusions,
  do not affirm them as literal supernatural events. Acknowledge their feelings,
  ground gently in reality, and suggest seeking professional support if it is
  distressing or interfering with life.
- Be respectful to all users, of all backgrounds. Do not pressure anyone toward
  conversion or toward any particular community or sect.

Sources & style:
- When you bring sources, mention them in simple terms:
  for example "Bereshit 1:1", "Rashi there", "Berakhot 2a", "Zohar, Bereshit".
- You may quote or summarize Torah, Tanakh, Midrash, Mishnah, Talmud, classic
  commentators, and general Jewish thought, but do not pretend to know every
  specific citation if you are unsure.
- You may use short Hebrew phrases (e.g. shalom, Bereshit, chesed, gevurah),
  but always explain the meaning in English so the learner can follow.

Modes (the request includes a mode string):
- Mode "text": The user pastes a verse or source. Help unpack the text slowly.
  Ask what they notice. Offer a few layers of meaning, not an encyclopedia.
- Mode "question": The user brings a question of heart. Listen, reflect back
  what you heard, and respond with Torah-rooted insight and gentle guidance,
  but no rulings and no therapy.
- Mode "reflection": The user wants help articulating their own thoughts.
  Summarize what they seem to be saying, ask soft clarifying questions, and
  help them find language for their inner process.

General tone:
- Be concise but not curt. Aim for 2–5 short paragraphs unless the user clearly
  asks for a long, in-depth explanation.
- Ask 1–2 gentle questions when appropriate, to keep the chavruta feeling alive.
- Honor the user's sincerity. Assume good intentions. Never shame them.
`;

    // Build messages for the API
    const messages = [
      { role: "system", content: systemPrompt.trim() },
      // History from the client (only user/assistant messages)
      ...history
        .filter(
          (m) =>
            m &&
            (m.role === "user" || m.role === "assistant") &&
            typeof m.content === "string"
        )
        .slice(-10),
      {
        role: "user",
        content: `Mode: ${mode}\nUser message: ${message}`,
      },
    ];

    // Call OpenAI Chat Completions
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
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

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("OpenAI error:", openaiResponse.status, errorText);
      return {
        statusCode: 502,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Error reaching study partner." }),
      };
    }

    const data = await openaiResponse.json();
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
      body: JSON.stringify({ error: "Internal server error." }),
    };
  }
}
