import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Демо самостоятельно разворачиваемого приложения Next.js',
  description:
    'Приложение разворачивается на Ubuntu Linux с Nginx в качестве обратного прокси.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <head>
        <link
          rel='stylesheet'
          href='https://cdn.jsdelivr.net/npm/@exampledev/new.css@1.1.2/new.min.css'
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
