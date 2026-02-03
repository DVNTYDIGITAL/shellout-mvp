"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-text-primary">
          <span className="text-2xl">🛡️</span>
          <span>Shell Out</span>
        </Link>
        <button
          className="sm:hidden rounded p-2 hover:bg-gray-100"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        <nav className={`${menuOpen ? "flex" : "hidden"} absolute top-16 left-0 right-0 flex-col gap-4 border-b border-gray-200 bg-white px-4 py-4 sm:static sm:flex sm:flex-row sm:items-center sm:gap-6 sm:border-0 sm:p-0`}>
          <Link href="/about" className="text-sm text-text-secondary hover:text-text-primary transition-colors" onClick={() => setMenuOpen(false)}>
            About
          </Link>
          <a href="https://docs.shellout.ai" target="_blank" rel="noopener noreferrer" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            Docs
          </a>
          <a href="https://github.com/shellout-ai" target="_blank" rel="noopener noreferrer" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
