import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thaw — Early-Warning & Cash-Flow Shield for PayPal Sellers",
  description:
    "Know before PayPal freezes your money. Deterministic hold-risk scoring, plain-language AI explanation, approval-gated actions, and cash-flow forecasting.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased selection:bg-[#84bbe3] selection:text-[#1c346c] text-[#0c0c14] bg-[#F0F5F7]">
        {children}
      </body>
    </html>
  );
}
