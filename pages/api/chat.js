// /pages/api/chat.js
import { createClient } from "@supabase/supabase-js";
import { embedText } from "@/lib/embeddings";
// If you still use addAffiliateLinks, keep it:
import { addAffiliateLinks } from "@/utils/affiliate";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // read-only ok if policy allows rpc select
);

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { messages } = req.body;
    const lastUserMsg =
      [...(messages || [])].reverse().find((m) => m.role === "user")?.content ||
      "Help me find products";

    // 1) embed the query
    const queryEmbedding = await embedText(lastUserMsg);

    // 2) similar products from Supabase
    const { data: matches, error: matchErr } = await supabase.rpc(
      "match_affiliate_products",
      {
        query_embedding: queryEmbedding,
        match_count: 6,
        min_similarity: 0.25,
      }
    );

    if (matchErr) {
      console.error("match rpc error:", matchErr);
    }

    // 3) build context for the LLM
    const contextLines = (matches || []).map((m, i) => {
      const oneLine = [
        `#${i + 1}: ${m.name}`,
        m.description ? `- ${m.description}` : "",
        m.affiliate_url ? `- Link: ${m.affiliate_url}` : "",
      ]
        .filter(Boolean)
        .join("\n");
      return oneLine;
    });

    const contextBlock =
      contextLines.length > 0
        ? `You are a helpful DIY shopping assistant. Answer the user's question using ONLY the products in the CONTEXT below. If unsure, say so briefly.\n\nCONTEXT:\n${contextLines.join(
            "\n\n"
          )}\n\nRules:\n- Prefer concise answers.\n- Show relevant product names with markdown links when possible.\n- Do not invent products or links.\n`
        : `No product context available. Give a brief, generic suggestion and ask the user to try a different query.`;

    // 4) call OpenRouter
    const payload = {
      model: "mistralai/mistral-7b-instruct", // free/cheap model; you can swap
      messages: [
        { role: "system", content: contextBlock },
        ...messages,
      ],
      stream: false,
      temperature: 0.3,
    };

    const openrouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Utak-Atik",
      },
      body: JSON.stringify(payload),
    });

    if (!openrouterRes.ok) {
      const t = await openrouterRes.text();
      return res.status(openrouterRes.status).json({ error: t });
    }

    const data = await openrouterRes.json();
    let reply = data?.choices?.[0]?.message?.content || "No response";

    // Optional: postprocess to add Shopee affiliate tags
    reply = addAffiliateLinks ? addAffiliateLinks(reply) : reply;

    // You can also return the matched products as "sources"
    return res.status(200).json({
      reply,
      sources: (matches || []).map((m) => ({
        id: m.id,
        name: m.name,
        url: m.affiliate_url,
        similarity: m.similarity,
        image_url: m.image_url,
      })),
    });
  } catch (e) {
    console.error("RAG chat error:", e);
    return res.status(500).json({ error: "Failed to fetch AI response" });
  }
}
