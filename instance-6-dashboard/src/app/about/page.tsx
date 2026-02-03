import type { Metadata } from "next";
import Link from "next/link";
import SearchBox from "@/components/SearchBox";

export const metadata: Metadata = {
  title: "About - Shell Out",
  description:
    "Learn how Shell Out provides reputation data for the AI agent economy. Understand our scoring system and how to integrate.",
};

const faqs = [
  {
    q: "What is a reputation score?",
    a: "A reputation score is a number from 0 to 100 that reflects a wallet's on-chain transaction history. Higher scores indicate more established wallets with consistent, diverse transaction patterns.",
  },
  {
    q: "How is the score calculated?",
    a: "We analyze multiple factors: transaction count, volume, number of unique counterparties, account age, recent activity, and behavioral patterns. These are combined into a single score weighted by their importance.",
  },
  {
    q: "What does a low score mean?",
    a: "A low score doesn't necessarily mean a wallet is untrustworthy. It may simply mean the wallet is new, has few transactions, or hasn't been active recently. The score reflects observable history, not intent.",
  },
  {
    q: "How often is data updated?",
    a: "We continuously index new transactions from the Solana blockchain. Reputation data is typically updated within minutes of new on-chain activity.",
  },
  {
    q: "Can I integrate Shell Out into my app?",
    a: "Yes! We offer a REST API for programmatic access and an embeddable widget you can drop into any webpage. Check our documentation for details.",
  },
  {
    q: "Is Shell Out free?",
    a: "We offer a free tier for basic lookups. For higher volumes and API access, check our documentation for pricing details.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-[800px] text-center">
          <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            About Shell Out
          </h1>
          <p className="mt-4 text-lg text-text-secondary">
            Reputation infrastructure for the AI agent economy.
          </p>
        </div>
      </section>

      {/* What is Shell Out */}
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-[800px]">
          <h2 className="text-2xl font-bold text-text-primary">What is Shell Out?</h2>
          <div className="mt-6 space-y-4 text-text-secondary leading-relaxed">
            <p>
              AI agents are increasingly transacting with each other using cryptocurrency. As this economy grows, a fundamental question emerges: <strong className="text-text-primary">how do you know if the wallet on the other side of a transaction is trustworthy?</strong>
            </p>
            <p>
              Shell Out answers that question. We index on-chain transaction data from Solana, analyze behavioral patterns, and compute a reputation score for every wallet we observe. Before you transact, you can check if a wallet has a track record of legitimate activity.
            </p>
            <p>
              Think of it as a credit score for the AI agent economy &mdash; but built on transparent, on-chain data that anyone can verify.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-surface px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-[800px]">
          <h2 className="text-2xl font-bold text-text-primary">How It Works</h2>
          <div className="mt-8 space-y-6">
            {[
              {
                title: "1. Continuous Indexing",
                text: "We monitor the Solana blockchain and index every transaction. Each wallet's complete transaction history is stored and kept up to date.",
              },
              {
                title: "2. Pattern Analysis",
                text: "Our scoring engine analyzes multiple dimensions: how many transactions, with how many different counterparties, over what time period, at what volumes, and how recently.",
              },
              {
                title: "3. Score Computation",
                text: "These metrics are combined into a single reputation score (0-100) using a weighted algorithm. Wallets with more diverse, consistent, and recent activity score higher.",
              },
              {
                title: "4. Real-Time Queries",
                text: "Anyone can query a wallet's reputation via our API, embed our widget, or use this dashboard. Data is returned in real time.",
              },
            ].map((step) => (
              <div key={step.title} className="rounded-xl border border-gray-100 bg-white p-6">
                <h3 className="font-semibold text-text-primary">{step.title}</h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-[800px]">
          <h2 className="text-2xl font-bold text-text-primary">Frequently Asked Questions</h2>
          <div className="mt-8 space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q} className="border-b border-gray-100 pb-6 last:border-0">
                <h3 className="font-semibold text-text-primary">{faq.q}</h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration CTA */}
      <section className="bg-surface px-4 py-12 sm:py-16">
        <div className="mx-auto flex max-w-[800px] flex-col items-center text-center">
          <h2 className="text-2xl font-bold text-text-primary">Start Using Shell Out</h2>
          <p className="mt-3 text-text-secondary">
            Look up a wallet now, or integrate reputation checks into your app.
          </p>
          <div className="mt-6 w-full max-w-lg flex justify-center">
            <SearchBox />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <a
              href="https://docs.shellout.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
            >
              View Documentation
            </a>
            <a
              href="https://docs.shellout.ai/api"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-gray-50"
            >
              API Reference
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
