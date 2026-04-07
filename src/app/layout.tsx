import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'Coffee Shop Inventory',
  description: 'Manage your coffee shop stock',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-amber-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
