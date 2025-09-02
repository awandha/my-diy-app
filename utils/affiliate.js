import { productMap } from "./productMapper";

export function addAffiliateLinks(answer) {
  let links = [];

  for (const category in productMap) {
    productMap[category].forEach(keyword => {
      if (answer.toLowerCase().includes(keyword.toLowerCase())) {
        const url = `https://shope.ee/your-affiliate-id?keyword=${encodeURIComponent(keyword)}`;
        links.push(`👉 ${keyword}: [Shopee Link](${url})`);
      }
    });
  }

  if (links.length > 0) {
    answer += `\n\n🔗 Related products:\n${links.join("\n")}`;
  }

  return answer;
}
