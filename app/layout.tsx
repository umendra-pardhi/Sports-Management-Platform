import type React from "react"
// ... existing code ...
import "./globals.css"
import { Geist, Geist_Mono } from "next/font/google"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

// <CHANGE> Add metadata for sports platform
export const metadata = {
  title: "Sports Management Platform",
  description: "Manage sports events, teams, and live scores",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* ... existing code ... */}
      <body className={`font-sans antialiased`}>{children}</body>
    </html>
  )
}
