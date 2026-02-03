import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-surface">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-8">
        <p className="text-sm text-text-secondary">
          &copy; {new Date().getFullYear()} Shell Out
        </p>
        <nav className="flex gap-6">
          <Link href="/about" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            About
          </Link>
          <a href="https://docs.shellout.ai" target="_blank" rel="noopener noreferrer" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            Docs
          </a>
          <a href="https://github.com/shellout-ai" target="_blank" rel="noopener noreferrer" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            GitHub
          </a>
          <a href="https://twitter.com/shellout_ai" target="_blank" rel="noopener noreferrer" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            Twitter
          </a>
        </nav>
      </div>
    </footer>
  );
}
