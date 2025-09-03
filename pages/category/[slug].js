"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { Home, Bot, FolderOpen } from "lucide-react"; // icons

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function CategoryPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
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

      // 2️⃣ get products for that category
      const { data: prodData, error: prodError } = await supabase
        .from("affiliate_products")
        .select("*")
        .eq("category_id", catData.id);

      if (prodError) console.error(prodError);
      else setProducts(prodData);
    };

    fetchData();
  }, [slug]);

  if (!category) return <p className="p-6">Loading...</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 bg-gradient-to-r from-blue-600 via-green-500 to-blue-700 text-white text-center py-4 shadow-md">
        <h1 className="text-xl sm:text-2xl font-bold tracking-wide">
          Utak-Atik 🛠️
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-green-100">
          Browse Products in {category.name}
        </p>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-2xl font-bold text-blue-800 flex items-center gap-2">
            {category.icon?.startsWith("http") ? (
              <Image
                src={category.icon}
                alt={category.name}
                width={28}
                height={28}
              />
            ) : (
              <span className="text-xl sm:text-2xl">{category.icon}</span>
            )}
            {category.name}
          </h2>
          <Link
            href="/"
            className="text-xs sm:text-sm text-blue-600 hover:underline transition"
          >
            ← Back to Categories
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="text-gray-500">No products yet in this category.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="flex flex-col justify-between bg-white rounded-2xl p-3 sm:p-5 shadow-md hover:shadow-xl transition-transform hover:-translate-y-1 border border-gray-100"
              >
                <Image
                  src={
                    prod.image_url && prod.image_url.trim() !== ""
                      ? prod.image_url
                      : "/placeholder.png"
                  }
                  alt={prod.name}
                  width={500}
                  height={250}
                  className="w-full h-32 sm:h-48 object-cover rounded-lg mb-3"
                />
                <div className="flex-1 flex flex-col">
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1 truncate">
                    {prod.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 flex-1">
                    {prod.description}
                  </p>
                </div>
                <a
                  href={prod.affiliate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-center bg-gradient-to-r from-blue-500 to-green-500 text-white font-medium px-3 py-2 sm:px-4 sm:py-2 rounded-full shadow-md hover:from-green-500 hover:to-blue-500 transition-colors text-xs sm:text-sm"
                >
                  🛒 Shop Now
                </a>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Sticky Footer Nav */}
      <footer className="sticky bottom-0 z-20 bg-white border-t border-gray-200 py-2 sm:py-3 shadow-md">
        <div className="flex justify-around items-center">
          <Link
            href="/"
            className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition"
          >
            <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500 text-white mb-1">
              <Home className="w-5 h-5" />
            </div>
            <span className="text-xs">Home</span>
          </Link>

          <Link
            href="/chat"
            className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition"
          >
            <div className="p-2 rounded-full bg-gradient-to-r from-green-500 to-blue-500 text-white mb-1">
              <Bot className="w-5 h-5" />
            </div>
            <span className="text-xs">AI Chat</span>
          </Link>

          <Link
            href="/"
            className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition"
          >
            <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white mb-1">
              <FolderOpen className="w-5 h-5" />
            </div>
            <span className="text-xs">Categories</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
