// /pages/api/embed-one.js
import { createClient } from "@supabase/supabase-js";
import { embedText } from "@/lib/embeddings";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE // server-only to allow updates
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { id, name, description } = req.body || {};
  if (!id || !name) return res.status(400).json({ error: "id and name required" });

  try {
    const text = [name, description].filter(Boolean).join(" • ");
    const embedding = await embedText(text);
    const { error } = await supabase
      .from("affiliate_products")
      .update({ embedding })
      .eq("id", id);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "embed-one failed" });
  }
}
