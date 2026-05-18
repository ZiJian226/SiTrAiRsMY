import type { Metadata } from "next";
import { Poppins, Space_Grotesk } from "next/font/google";
import "@/app/globals.css";
import FloatingPoffu from "@/components/FloatingPoffu";
import { AuthProvider } from "@/contexts/AuthContext";
import { AudioProvider } from "@/contexts/AudioContext";

// Primary UI font
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Heading font (starry/space theme)
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

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
    <html
      lang="en"
      data-theme="starmy"
      className={`${poppins.variable} ${spaceGrotesk.variable}`}
    >
      <body className="antialiased font-poppins" style={{ cursor: "auto" }} suppressHydrationWarning>
        <AudioProvider>
          <AuthProvider>
            {children}
            <FloatingPoffu />
          </AuthProvider>
        </AudioProvider>
      </body>
    </html>
  );
}
