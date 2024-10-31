'use client'

export default function ProtectedPage() {
  const safeKey = process.env.NEXT_PUBLIC_SAFE_KEY

  return (
    <section>
      <h1>Эта страница является защищенной</h1>
      <p>Безопасный ключ: {safeKey}</p>
      <p>
        Эта переменная окружения доступна в браузере благодаря префиксу{' '}
        <code>NEXT_PUBLIC_</code>.
      </p>
    </section>
  )
}
