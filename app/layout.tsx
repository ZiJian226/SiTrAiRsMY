import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" data-theme="mytheme">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
