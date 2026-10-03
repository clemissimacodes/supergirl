import type { Metadata } from "next";
import { EB_Garamond } from "next/font/google";
import "./globals.css";

const garamond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-book",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Chirper — Clementine Kay Shao",
  description: "the better twitter — ask anything anonymously.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={garamond.variable}>
      <body>
        <header className="site-masthead">
          <a className="site-anchor" href="https://clemissima.com">
            Clementine Kay Shao
          </a>
        </header>
        {children}
      </body>
    </html>
  );
}
