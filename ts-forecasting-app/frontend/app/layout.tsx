import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";

export const metadata: Metadata = {
  title: "Time Series Forecasting App",
  description: "Complete time series forecasting with EDA, modeling, and export",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
            {children}
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
