import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "Wishlist - Create & Share Wishlists with Referral Links",
  description: "Create beautiful wishlists, share them with friends, and earn rewards when they make purchases through your referral links.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  )
}
