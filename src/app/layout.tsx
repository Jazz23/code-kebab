import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Nav } from "@/components/nav";
import SessionProvider from "@/components/SessionProvider";
import { WebGLBackground } from "@/components/webgl-background";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "code-kebab",
  description: "Find projects. Build together.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <head>
        <script
          src="https://rybbit.hazycloud.io/api/script.js"
          data-site-id="53c4c43ef566"
          defer
        />
      </head>
      <body className="min-h-full">
        <WebGLBackground />
        <SessionProvider>
          <div className="relative z-10 flex min-h-screen flex-col">
            <Nav />
            {children}
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
