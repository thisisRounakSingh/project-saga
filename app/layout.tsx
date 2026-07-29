import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CustomCursor } from "./components/CustomCursor";
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
  title: "Saga - The Codebase You Inherited",
  description: "Codex reads a repo's entire git history and visualizes it.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedTheme = localStorage.getItem("theme") || "auto";
                  if (savedTheme === "auto") {
                    var systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                    if (systemDark) document.documentElement.classList.add("dark");
                  } else if (savedTheme === "dark") {
                    document.documentElement.classList.add("dark");
                  } else if (savedTheme === "dim") {
                    document.documentElement.classList.add("dim");
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <CustomCursor />
      </body>
    </html>
  );
}
