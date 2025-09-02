import { supabase } from "../lib/supabase"

export default function Products({ products }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">DIY Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((p) => (
          <a key={p.id} href={p.affiliate_url} target="_blank" rel="noreferrer">
            <div className="border p-4 rounded-lg shadow hover:shadow-lg transition">
              <h2 className="text-lg font-semibold">{p.name}</h2>
              <p className="text-sm text-gray-600">{p.description}</p>
              <span className="text-blue-500 text-sm">{p.category}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

export async function getServerSideProps() {
  const { data } = await supabase.from("affiliate_products").select("*")
  return { props: { products: data ?? [] } }
}
