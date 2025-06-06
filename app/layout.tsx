import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import "./globals-fix.css" // Import our fix for pointer events
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Voice Search AI - AI-Powered Voice Search Assistant",
  description:
    "Transform your voice into intelligent search queries with AI-powered keyword extraction and seamless Google search integration.",
  keywords: ["voice search", "AI", "speech recognition", "search assistant", "voice assistant"],
  authors: [{ name: "Voice Search AI" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          // Fix for pointer events and interactivity
          document.addEventListener('DOMContentLoaded', function() {
            console.log('Applying interactivity fixes');
            // Force pointer events on all elements
            const style = document.createElement('style');
            style.textContent = '* { pointer-events: auto !important; }';
            document.head.appendChild(style);
          });
        `}} />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
