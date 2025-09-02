export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/Mistral-7B-Instruct-v0.2:featherless-ai",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: req.body.question },
        ],
        stream: true, // 👈 enable streaming
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    // Set headers for streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });

      // HuggingFace sends data as "data: {...}\n\n"
      const lines = chunk.split("\n").filter(line => line.trim() !== "");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = JSON.parse(line.replace(/^data: /, ""));
          const content = data.choices?.[0]?.delta?.content;
          if (content) {
            res.write(content); // send chunk to client
          }
        }
      }
    }

    res.end();
  } catch (error) {
    console.error("Streaming API Error:", error);
    res.status(500).json({ error: "Failed to stream AI response" });
  }
}
