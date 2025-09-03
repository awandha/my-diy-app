"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function HomePage() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) console.error(error);
      else setCategories(data);
    };
    fetchCategories();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-green-500 to-blue-700 text-white text-center py-6 shadow-lg">
        <h1 className="text-3xl font-bold tracking-wide">Utak-Atik</h1>
        <p className="mt-1 text-sm text-green-100">
          DIY Made Simple with AI + Shopping Links
        </p>
      </header>

      {/* Hero section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Need help with your DIY project?
        </h2>

        <Link
          href="/chat"
          className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-green-500 hover:to-blue-500 text-white px-6 py-3 rounded-full text-lg font-semibold shadow-md transition-colors"
        >
          🤖 Ask AI
        </Link>

        {/* Categories grid */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 w-full max-w-4xl">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="flex flex-col items-center bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-transform hover:-translate-y-1 border border-blue-100"
            >
              <div className="text-4xl mb-3">{cat.icon}</div>
              <span className="font-medium text-gray-700">{cat.name}</span>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-gray-500 text-sm border-t border-gray-200">
        © {new Date().getFullYear()} Utak-Atik. All rights reserved.
      </footer>
    </div>
  );
}
