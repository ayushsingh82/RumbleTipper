import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import { GeistPixelGrid } from 'geist/font/pixel'
import { ThemeProvider } from '@/components/theme-provider'

import './globals.css'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'RumbleTipper — Tip Rumble creators via AI agent',
  description:
    'RumbleTipper finds high-potential Rumble creators early and tips them. Deposit USD₮, let the agent analyze engagement and send tips via Rumble’s native wallet. Hackathon Galáctica Tipping Bot track.',
  keywords: [
    'RumbleTipper',
    'Rumble',
    'tipping',
    'creator',
    'USD₮',
    'WDK',
    'Tether',
    'Hackathon Galáctica',
    'Tipping Bot',
    'AI agent',
  ],
  authors: [{ name: 'RumbleTipper' }],
  creator: 'RumbleTipper',
  publisher: 'RumbleTipper',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'RumbleTipper — Tip Rumble creators via AI agent',
    description:
      'Find rising Rumble creators early. Deposit USD₮, agent analyzes engagement and tips via Rumble’s native wallet. Tipping Bot track · Hackathon Galáctica WDK Edition 1.',
    siteName: 'RumbleTipper',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RumbleTipper — Tip Rumble creators via AI agent',
    description:
      'AI agent that finds high-potential Rumble creators and tips them. USD₮, WDK, Rumble native wallet. Hackathon Galáctica Tipping Bot.',
    creator: '@rumbletip',
  },
  category: 'technology',
}

export const viewport: Viewport = {
  themeColor: '#F2F1EA',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${GeistPixelGrid.variable}`} suppressHydrationWarning>
      <body className="font-mono antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
