import './globals.css'
import type { ReactNode } from 'react'

export const metadata = {
  title: 'Unified Inbox',
  description: 'Unified Inbox for multi-channel outreach'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
