"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import FooterNav from "@/components/FooterNav";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function CategoryPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ useCallback for fetchProducts
  const fetchProducts = useCallback(
    async (keyword = "") => {
      if (!slug) return;

      // 1️⃣ get category by slug
      const { data: catData, error: catError } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .single();

      if (catError) {
        console.error(catError);
        return;
      }
      setCategory(catData);

      // 2️⃣ get products with optional search
      let query = supabase
        .from("affiliate_products")
        .select("*")
        .eq("category_id", catData.id);

      if (keyword.trim() !== "") {
        query = query.or(
          `name.ilike.%${keyword}%,description.ilike.%${keyword}%`
        );
      }

      const { data: prodData, error: prodError } = await query;
      if (prodError) console.error(prodError);
      else setProducts(prodData);
    },
    [slug]
  );

  // ✅ no more ESLint error
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (!category) return <p className="p-6">Loading...</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-green-500 to-blue-700 text-white text-center py-6 shadow-lg">
        <h1 className="text-3xl font-bold tracking-wide">Utak-Atik 🛠️</h1>
        <p className="mt-1 text-sm text-green-100">
          Browse Products in {category.name}
        </p>
      </header>

      {/* Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 className="text-2xl font-bold text-blue-800 flex items-center gap-2">
            {category.icon?.startsWith("http") ? (
              <Image
                src={category.icon}
                alt={category.name}
                width={32}
                height={32}
              />
            ) : (
              <span className="text-2xl">{category.icon}</span>
            )}
            {category.name}
          </h2>

          <Link
            href="/"
            className="text-sm text-blue-600 hover:underline transition"
          >
            ← Back to Categories
          </Link>
        </div>

        {/* 🔍 Search Box */}
        <div className="mb-6 flex items-center gap-2 w-full">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              fetchProducts(e.target.value); // 🔥 real-time search
            }}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 
                       focus:ring-2 focus:ring-blue-400 outline-none text-black 
                       placeholder-gray-400"
          />
          <button
            onClick={() => fetchProducts(searchTerm)}
            className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-2 rounded-lg shadow hover:from-green-500 hover:to-blue-500 transition"
          >
            Search
          </button>
        </div>

        {products.length === 0 ? (
          <p className="text-gray-500">No products found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="flex flex-col bg-white rounded-2xl p-4 shadow-md hover:shadow-xl transition-transform hover:-translate-y-1 border border-gray-100"
              >
                <Image
                  src={
                    prod.image_url && prod.image_url.trim() !== ""
                      ? prod.image_url
                      : "/placeholder.png"
                  }
                  alt={prod.name}
                  width={400}
                  height={200}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
                <h3 className="font-semibold text-gray-800 truncate">
                  {prod.name}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {prod.description}
                </p>

                {/* Shop Now button (✅ with Link) */}
                <Link
                  href={prod.affiliate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-center bg-gradient-to-r from-blue-500 to-green-500 text-white font-medium px-4 py-2 rounded-full shadow-md hover:from-green-500 hover:to-blue-500 transition-colors"
                >
                  🛒 Shop Now
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <FooterNav />
    </div>
  );
}
