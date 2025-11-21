// src/api/aiClient.js
// Frontend client for tarot AI calls. We default to hitting a local API
// route (/api/ai) that should proxy Hugging Face to dodge browser CORS.
// If the proxy is unavailable, we fall back to a direct HF call.

const HF_ENDPOINT = "https://api-inference.huggingface.co/v1/chat/completions";
const HF_MODEL = "mistralai/Mistral-Nemo-Instruct-2407";
const PROXY_URL = import.meta?.env?.VITE_AI_PROXY || "/api/ai";
const ALLOW_DIRECT = import.meta?.env?.VITE_ALLOW_DIRECT_HF === "true";

async function callProxy(prompt) {
  try {
    const res = await fetch(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: HF_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.65,
        max_tokens: 260,
        presence_penalty: 0.55,
        frequency_penalty: 0.55,
      }),
    });
    if (!res.ok) return "";
    const data = await res.json();
    const text =
      data?.choices?.[0]?.message?.content?.trim?.() ||
      data?.text?.trim?.() ||
      "";
    return text;
  } catch (err) {
    console.warn("Proxy AI call failed, will try direct:", err?.message);
    return "";
  }
}

async function callDirect(prompt) {
  const token = import.meta?.env?.VITE_HF_TOKEN;
  if (!token) return "";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(HF_ENDPOINT, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: HF_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 260,
        presence_penalty: 0.55,
        frequency_penalty: 0.55,
      }),
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.error("HF API error:", res.status);
      return "";
    }

    const data = await res.json();
    return data?.choices?.[0]?.message?.content?.trim?.() || "";
  } catch (err) {
    console.error("HF API fetch failed:", err);
    return "";
  }
}

export async function askAI(prompt) {
  const viaProxy = await callProxy(prompt);
  if (viaProxy) return viaProxy;
  if (!ALLOW_DIRECT) return "";
  return callDirect(prompt);
}
