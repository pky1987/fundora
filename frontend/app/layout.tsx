import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Fundora",
  description: "Secure, transparent, and decentralized crowdfunding platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${outfit.variable} antialiased font-outfit bg-[#09090b] text-white selection:bg-indigo-500/30`}
      >
        <Providers>
          <div className="relative min-h-screen">
            {/* Background glow effects */}
            <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none" />

            <main className="relative z-10 px-6 py-10 max-w-7xl mx-auto">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
