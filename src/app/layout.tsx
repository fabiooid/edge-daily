import type { Metadata } from 'next'
import { site, siteUrl } from '../../config/site'
import SiteFooter from '@/components/site-footer'
import SiteHeader from '@/components/site-header'
import './globals.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${site.name}: ${site.subtitle}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  openGraph: {
    title: `${site.name}: ${site.subtitle}`,
    description: site.description,
    type: 'website',
    locale: 'en_HK',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name}: ${site.subtitle}`,
    description: site.description,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-svh flex-col bg-background text-foreground">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  )
}
