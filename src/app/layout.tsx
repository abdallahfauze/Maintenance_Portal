import type { Metadata } from "next";
import "./globals.css";
import { FeedbackWidget } from "@/components/feedback-widget";

export const metadata: Metadata = {
  title: "Maintenance Portal",
  description: "Book vetted electrical, plumbing, HVAC & repair technicians in Jeddah.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <FeedbackWidget />
      </body>
    </html>
  );
}
