import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shell Out - Reputation for the Agent Economy",
  description:
    "Check wallet reputation before you transact. Shell Out provides transaction history and trust scores for the AI agent economy.",
  metadataBase: new URL("https://shellout.ai"),
  openGraph: {
    title: "Shell Out - Reputation for the Agent Economy",
    description:
      "Check wallet reputation before you transact. Shell Out provides transaction history and trust scores for the AI agent economy.",
    url: "https://shellout.ai",
    siteName: "Shell Out",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shell Out - Reputation for the Agent Economy",
    description:
      "Check wallet reputation before you transact. Shell Out provides transaction history and trust scores for the AI agent economy.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-screen flex-col bg-white">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
