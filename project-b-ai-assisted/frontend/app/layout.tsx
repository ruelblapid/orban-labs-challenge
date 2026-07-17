import type { Metadata } from "next";
import Link from "next/link";

import "./globals.css";

export const metadata: Metadata = {
  title: "URL Shortener",
  description: "Shorten a URL and track how many times it's been clicked.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <nav className="site-nav">
            <Link href="/" className="brand">
              URL Shortener
            </Link>
            <div className="site-nav-links">
              <Link href="/">Shorten</Link>
              <Link href="/dashboard">Dashboard</Link>
            </div>
          </nav>
        </header>
        <main className="site-main">{children}</main>
      </body>
    </html>
  );
}
