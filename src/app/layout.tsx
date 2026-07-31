import type { Metadata, Viewport } from "next"

import { themeInitScript } from "@/components/theme/theme-provider"
import { APP_DESCRIPTION_TH, APP_NAME } from "@/constants/app"
import { lineSeedSansTH } from "@/lib/fonts"
import { Providers } from "./providers"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — ${APP_DESCRIPTION_TH}`,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION_TH,
  applicationName: APP_NAME,
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#171717" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="th"
      className={`${lineSeedSansTH.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* ตั้งค่าธีมตามระบบก่อน paint แรก เพื่อไม่ให้หน้าจอกระพริบ */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
