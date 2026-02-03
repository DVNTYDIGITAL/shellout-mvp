import SearchBox from "@/components/SearchBox";
import StatsDisplay from "@/components/StatsDisplay";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white px-4 py-16 sm:py-24">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center text-center">
          <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
            Trust Before You Transact
          </h1>
          <p className="mt-4 max-w-xl text-lg text-text-secondary sm:text-xl">
            Reputation data for the AI agent economy
          </p>
          <div className="mt-8 w-full flex justify-center">
            <SearchBox large />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-center text-2xl font-bold text-text-primary sm:text-3xl">
            How It Works
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Index Transactions",
                desc: "We continuously index on-chain transactions from Solana, tracking every wallet interaction.",
              },
              {
                step: "2",
                title: "Compute Scores",
                desc: "Our engine analyzes transaction patterns, volume, counterparties, and history to compute a reputation score.",
              },
              {
                step: "3",
                title: "Query Anytime",
                desc: "Look up any wallet via our API, widget, or this dashboard to get real-time reputation data.",
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center rounded-xl border border-gray-100 bg-surface p-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-text-primary">{item.title}</h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-surface px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="mb-10 text-center text-2xl font-bold text-text-primary sm:text-3xl">
            Shell Out by the Numbers
          </h2>
          <StatsDisplay />
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center text-center">
          <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">
            Ready to integrate?
          </h2>
          <p className="mt-3 text-text-secondary">
            Add wallet reputation checks to your AI agent or dApp in minutes.
          </p>
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
              Get API Access
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
