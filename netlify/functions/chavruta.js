// netlify/functions/chavruta.js

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // later you can lock this to https://luminanexus.org
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  if (!OPENAI_API_KEY) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Missing OPENAI_API_KEY' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const history = Array.isArray(body.history) ? body.history : [];
    const latestUserText = body.latestUserText || '';

    if (!latestUserText.trim()) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'No user text provided' }),
      };
    }

    const messages = [
      {
        role: 'system',
        content:
          "You are ChavrutaGPT, a warm, thoughtful Torah study partner created for LuminaNexus.org. " +
          "You are not a posek and never give halachic rulings. " +
          "You help users explore texts and ideas in clear, gentle language, " +
          "cite classic sources when possible, and often suggest asking real-world teachers or rabbanim.",
      },
      ...history.map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: String(m.content || ''),
      })),
      { role: 'user', content: latestUserText },
    ];

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini', // you can swap to gpt-4o-mini if you like
        messages,
        temperature: 0.6,
        max_tokens: 800,
      }),
    });

    if (!openaiRes.ok) {
      const errorText = await openaiRes.text();
      console.error('OpenAI error:', openaiRes.status, errorText);
      return {
        statusCode: 502,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Error from OpenAI', detail: errorText }),
      };
    }

    const data = await openaiRes.json();
    const reply =
      data.choices?.[0]?.message?.content?.trim() ||
      "I'm not sure how to respond just now. Let's try another way to ask that.";

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error('Chavruta function error:', err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Server error', detail: String(err) }),
    };
  }
};
