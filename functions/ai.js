// Cloudflare Pages Function: Hugging Face proxy to avoid browser CORS
// Configure env var HF_TOKEN in Pages project settings (or secrets).

const HF_ENDPOINT = "https://api-inference.huggingface.co/v1/chat/completions";
const HF_MODEL = "mistralai/Mistral-Nemo-Instruct-2407";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders });

export function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function onRequestPost({ request, env }) {
  try {
    const token = env.HF_TOKEN || env.VITE_HF_TOKEN;
    if (!token) return json({ text: "", error: "Missing HF_TOKEN" }, 500);

    const { prompt } = (await request.json()) || {};
    if (!prompt) return json({ text: "", error: "Prompt required" }, 400);

    const res = await fetch(HF_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: HF_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.65,
        max_tokens: 280,
      }),
    });

    if (!res.ok) {
      const errTxt = await res.text();
      console.error("HF proxy error", res.status, errTxt);
      return json({ text: "", error: "Upstream error" }, res.status);
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content?.trim?.() || "";
    return json({ text });
  } catch (e) {
    console.error("HF proxy exception", e);
    return json({ text: "", error: "Unexpected server error" }, 500);
  }
}
