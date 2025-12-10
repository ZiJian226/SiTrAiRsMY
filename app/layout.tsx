import type { Metadata } from "next";
import "@/app/globals.css";
import FloatingPoffu from "@/components/FloatingPoffu";

export const metadata: Metadata = {
  title: "StarMy - VTuber & Artist Community",
  description: "Connect with your favorite VTubers and artists, explore their content, and commission amazing work",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="starmy">
      <body className="antialiased">
        {children}
        <FloatingPoffu />
      </body>
    </html>
  );
}
