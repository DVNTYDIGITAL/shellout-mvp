"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBox({ large = false }: { large?: boolean }) {
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = address.trim();
    if (!trimmed) {
      setError("Please enter a wallet address");
      return;
    }
    if (trimmed.length < 32 || trimmed.length > 44) {
      setError("Invalid wallet address length");
      return;
    }
    if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(trimmed)) {
      setError("Invalid wallet address characters");
      return;
    }
    setError("");
    router.push(`/wallet/${trimmed}`);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className={`flex items-center rounded-xl border-2 border-gray-200 bg-white shadow-sm transition-all focus-within:border-primary focus-within:shadow-md ${large ? "px-4 py-3 sm:px-6 sm:py-4" : "px-3 py-2"}`}>
        <input
          type="text"
          value={address}
          onChange={(e) => { setAddress(e.target.value); setError(""); }}
          placeholder="Enter Solana wallet address..."
          className={`flex-1 outline-none bg-transparent text-text-primary placeholder-gray-400 ${large ? "text-base sm:text-lg" : "text-sm"}`}
        />
        <button
          type="submit"
          className={`ml-2 flex-shrink-0 rounded-lg bg-primary text-white font-medium transition-colors hover:bg-primary-dark ${large ? "px-5 py-2.5 text-base" : "px-4 py-2 text-sm"}`}
        >
          Search
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-score-bad">{error}</p>}
    </form>
  );
}
