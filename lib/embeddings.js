// /lib/embeddings.js
import { pipeline } from "@xenova/transformers";

// Cache the model across hot reloads
let extractorPromise = null;

async function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return extractorPromise;
}

// mean-pooling + L2 normalize -> Float32Array(384)
export async function embedText(text) {
  const extractor = await getExtractor();
  const output = await extractor(text, { normalize: true }); // returns Tensor
  // output.data is Float32Array of shape [tokens, 384] flattened
  const dims = 384;
  const arr = output.data;
  const tokens = arr.length / dims;

  const mean = new Float32Array(dims);
  for (let i = 0; i < tokens; i++) {
    for (let j = 0; j < dims; j++) {
      mean[j] += arr[i * dims + j];
    }
  }
  for (let j = 0; j < dims; j++) {
    mean[j] /= tokens;
  }

  // L2 normalize
  let norm = 0;
  for (let j = 0; j < dims; j++) norm += mean[j] * mean[j];
  norm = Math.sqrt(norm) || 1;
  for (let j = 0; j < dims; j++) mean[j] /= norm;

  return Array.from(mean); // Supabase needs plain array
}
