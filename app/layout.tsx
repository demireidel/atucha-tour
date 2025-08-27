import type React from "react"
import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-display",
  display: "swap",
})

const dmSansBody = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Atucha II — Premium Virtual Tours",
  description: "Explore the engineering marvel of Atucha II nuclear power plant through premium guided virtual tours",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-body ${dmSans.variable} ${dmSansBody.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
