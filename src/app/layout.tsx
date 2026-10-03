import type { Metadata } from "next";
import { EB_Garamond } from "next/font/google";
import { AskFrame } from "@/components/AskFrame";
import "./globals.css";

const garamond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-book",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Clementine Kay Shao",
  description: "i welcome all questions, thoughts, & well wishes",
};

export const dynamic = "force-dynamic";

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
        <AskFrame />
      </body>
    </html>
  );
}
