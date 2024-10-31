import { Suspense } from 'react'

// Скоро Next.js будет автоматически определять динамичность
// такой страницы из промиса, поэтому нам не нужна будет эта настройка
export const dynamic = 'force-dynamic'

async function fetchData(id: number) {
  await new Promise((resolve) => setTimeout(resolve, id * 1000))
  return `Данные загружены спустя ${id} секунд${id > 1 ? '' : 'у'}`
}

async function AsyncDataComponent({ id }: { id: number }) {
  const data = await fetchData(id)
  return (
    <div>
      <h2>Контент {id}</h2>
      <p>{data}</p>
    </div>
  )
}

function LoadingCard({ id }: { id: number }) {
  return (
    <div>
      <h2>Контент {id}</h2>
      <p>Загрузка...</p>
    </div>
  )
}

export default function Streaming() {
  return (
    <div>
      <h1>Потоковая передача данных с помощью серверных компонентов</h1>

      <Suspense fallback={<LoadingCard id={1} />}>
        <AsyncDataComponent id={1} />
        <Suspense fallback={<LoadingCard id={2} />}>
          <AsyncDataComponent id={2} />
          <Suspense fallback={<LoadingCard id={3} />}>
            <AsyncDataComponent id={3} />
            <Suspense fallback={<LoadingCard id={4} />}>
              <AsyncDataComponent id={4} />
              <Suspense fallback={<LoadingCard id={5} />}>
                <AsyncDataComponent id={5} />
              </Suspense>
            </Suspense>
          </Suspense>
        </Suspense>
      </Suspense>
    </div>
  )
}
