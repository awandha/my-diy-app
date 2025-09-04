// /pages/api/reindex.js
import { createClient } from "@supabase/supabase-js";
import { embedText } from "@/lib/embeddings";

// Use SERVICE ROLE key here (server-only!)
// Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE in your .env.local
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    // fetch rows without embeddings
    const { data: rows, error } = await supabase
      .from("affiliate_products")
      .select("id, name, description, image_url")
      .is("embedding", null)
      .limit(5000);
    if (error) return res.status(500).json({ error: error.message });

    let updated = 0;
    for (const r of rows) {
      const text = [r.name, r.description].filter(Boolean).join(" • ");
      const embedding = await embedText(text);
      const { error: upErr } = await supabase
        .from("affiliate_products")
        .update({ embedding })
        .eq("id", r.id);
      if (upErr) {
        console.error("Update error:", upErr);
        continue;
      }
      updated++;
    }

    return res.status(200).json({ updated, total: rows.length });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "reindex failed" });
  }
}
