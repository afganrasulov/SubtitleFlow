import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SubtitleFlow | YouTube Transcript to AI Content",
  description: "Extract YouTube subtitles and transform them into LinkedIn posts, SEO blogs, and more using AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="glass-nav">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '100px' }}></div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.025em' }}>SubtitleFlow</span>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
