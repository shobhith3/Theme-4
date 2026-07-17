import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProcureIQ — AI-Powered Procurement Intelligence",
  description:
    "Intelligent procurement decision platform for multi-location SMEs. Demand forecasting, stockout prediction, supplier intelligence, and automated purchasing recommendations.",
  keywords: ["procurement", "inventory", "forecasting", "AI", "ERP", "supply chain", "SME"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
