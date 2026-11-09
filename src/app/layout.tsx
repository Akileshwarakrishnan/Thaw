import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thaw — Early-Warning & Cash-Flow Shield for PayPal Sellers",
  description:
    "Know before PayPal freezes your money. Deterministic hold-risk scoring, plain-language AI explanation, approval-gated actions, and cash-flow forecasting.",
  icons: {
    icon: "/thaw-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <link rel="icon" href="/thaw-logo.png" sizes="any" />
      </head>
      <body className="font-sans antialiased text-[#1f2328] bg-[#f6f6f6] selection:bg-[#accfff] selection:text-[#0b3679]">
        {children}
      </body>
    </html>
  );
}
