import Image from 'next/image'
import { connection } from 'next/server'

async function getPokemon() {
  await connection()

  const randomId = Math.floor(Math.random() * 151) + 1
  const res = await fetch(`https://api.vercel.app/pokemon/${randomId}`, {
    next: { revalidate: 10 },
  })
  return res.json()
}

export default async function Home() {
  const secretKey = process.env.SECRET_KEY
  const pokemon = await getPokemon()

  return (
    <section>
      <h1>Демо самостоятельно разворачиваемого приложения Next.js</h1>
      <p>
        Это демо приложения Next.js, развернутого на Ubuntu Linux. Оно также
        включает базу данных Postgres и прокси Nginx.{' '}
        <a
          href='https://github.com/harryheman/self-host-nextjs'
          target='_blank'
        >
          Смотрите код
        </a>
        .
      </p>

      <h3>Получение данных</h3>
      <p>Произвольный покемон: {pokemon.name}</p>
      <p>
        Это значение получено с помощью <code>fetch</code> из API. Эта страница
        обрабатывается динамически, получение произвольного покемона выполняется
        при каждом запросе. Перезагрузите страницу для того, чтобы увидеть
        нового покемона.
      </p>

      <h3>Оптимизация изображений</h3>
      <Image
        src='https://images.unsplash.com/photo-1488590528505-98d2b5aba04b'
        width={480 / 2}
        height={320 / 2}
        alt='Кодирование'
      />
      <p>
        Next.js поддерживает оптимизацию изображений из коробки с помощью{' '}
        <code>next start</code>. Изображение выше оптимизировано сервером
        Next.js.
      </p>
      <p>
        В Next.js 15 больше не нужно вручную устанавливать <code>sharp</code>{' '}
        для оптимизации изображений, локальных или внешних.
      </p>
      <p>
        Для оптимизации изображений с помощью сторонних сервисов можно создать
        собственный загрузчик (loader) изображений. Пример можно найти{' '}
        <a
          href='https://github.com/harryheman/self-host-nextjs/blob/main/image-loader.ts'
          target='_blank'
        >
          здесь
        </a>
        , а включить загрузчик нужно в{' '}
        <a
          href='https://github.com/harryheman/self-host-nextjs/blob/main/next.config.ts'
          target='_blank'
        >
          <code>next.config.ts</code>
        </a>
        .
      </p>
      <p>
        <a href='https://nextjs.org/docs/app/building-your-application/deploying#image-optimization'>
          Читайте документацию
        </a>
      </p>

      <h3>Потоки</h3>
      <p>
        Роутер приложения Next.js поддерживает потоки. В этом демо используется{' '}
        <code>Suspense</code> с <code>async</code> компонентом для стриминга
        разных компонентов с задержкой. Мы позволяем Nginx обрабатывать сжатие
        для нашего приложения, а затем отключаем буферизацию прокси для
        включения потоковых ответов.
      </p>
      <p>
        <a href='/streaming'>Смотрите демо</a>
      </p>
      <p>
        <a href='https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming'>
          Читайте документацию
        </a>
      </p>

      <h3>База данных Postgres</h3>
      <p>
        Этот роут читает и пишет в базу данных
        [Postgres](https://www.postgresql.org/), которая находится в собственном
        контейнере Docker. Она использует [Prisma](https://www.prisma.io/) в
        качестве ORM. Также существует задача cron, которая очищает данные
        каждые 10 минут. Конечная точка, которую использует cron для отправки
        запроса <code>POST</code> в{' '}
        <a href='https://nextselfhost.ru/db/clear'>
          <code>/db/clear</code>
        </a>{' '}
        доступна публично.
      </p>
      <p>
        <a href='/db'>Смотрите демо</a>
      </p>

      <h3>Кэширование / инкрементальная статическая регенерация</h3>
      <p>
        Пол умолчанию Next.js ISR использует <code>lru-cache</code> и хранит
        кэшированные сущности в памяти. Это работает из коробки, как для
        кэширования данных как таковых, так и для ISR, как в новом роутере
        (приложения), так и в старом (страниц).
      </p>
      <p>
        Можно хранить сущности в чем-то вроде [Redis](https://redis.io/). Это
        рекомендуется делать для приложений, работающих в нескольких
        контейнерах. Наше приложение работает в одном контейнере, поэтому в этом
        нет необходимости.
      </p>
      <p>
        У нас есть роут, который получает данные из API с помощью{' '}
        <code>fetch</code> с настройкой <code>revalidate</code> со значением в
        10 секунд. Это означает, что данные будут &quot;свежими&quot; максимум в
        течение этого времени. Смотрите заголовок ответа{' '}
        <code>s-maxage=10, stale-while-revalidate=31536000</code>.
      </p>
      <p>
        По умолчанию время <code>stale-while-revalidate</code> для статических
        страниц, которые не определяют время <code>revalidate</code>, составляет
        1 год, однако, это можно{' '}
        <a href='https://nextjs.org/docs/canary/app/api-reference/next-config-js/swrDelta'>
          изменить
        </a>{' '}
        с помощью <code>swrDelta</code> в <code>next.config.ts</code>.
      </p>
      <p>
        <a href='/isr'>Смотрите демо</a>
      </p>
      <p>
        <a href='https://nextjs.org/docs/app/building-your-application/deploying#caching-and-isr'>
          Читайте документацию
        </a>
      </p>

      <h3>Посредник</h3>
      <p>
        Роут <code>/protected</code> защищен куки. Вы будете перенаправляться
        обратно на <code>/</code>. Для того, чтобы увидеть роут, нужно добавить
        куки <code>protected=1</code> в браузере.
      </p>
      <p>
        Посредник не имеет доступа ко всем API Node.js. Он предназначен для
        запуска перед всеми роутами приложения. Однако планируется поддержка
        всей среды Node.js, что может быть необходимым при использовании
        некоторых сторонних библиотек.
      </p>
      <p>
        В посреднике не рекомендуется выполнять проверки, такие как получение
        данных пользователя из базы. Эти проверки должны выполняться перед
        запросами и мутациями. Одним из{' '}
        <a href='https://nextjs.org/docs/app/building-your-application/authentication#protecting-routes-with-middleware'>
          популярных паттернов
        </a>{' '}
        является проверка в посреднике куки аутентификации.
      </p>
      <p>
        <a href='/protected'>Смотрите демо</a>
      </p>
      <p>
        <a href='https://nextjs.org/docs/app/building-your-application/deploying#middleware'>
          Читайте документацию
        </a>
      </p>

      <h3>Запуск сервера</h3>
      <p>
        Next.js включает файл <code>instrumentation</code>, который выполняет
        некоторый код при запуске сервера.
      </p>
      <p>
        Этот файл стабилизирован в Next.js 15. Он предназначен для чтения
        секретов из удаленных локаций, таких как Vault или 1Password. Вы можете
        протестировать эту возможность путем установки переменных для Vault в
        файле <code>.env</code>, хотя для демо это не нужно.
      </p>
      <p>
        <a href='https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation'>
          Читайте документацию
        </a>
      </p>

      <h3>Переменные окружения</h3>
      <p>
        Next.js поддерживает загрузку переменных из файлов <code>.env</code>.
      </p>
      <p>
        В серверных компонентах переменные окружения динамически читаются каждый
        раз. Для контейнеризованных приложений обычной практикой является
        передача разных переменных в зависимости от среды выполнения.
      </p>
      <p>
        Это значение читается из <code>process.env</code>:{' '}
        <code>{secretKey}</code>
      </p>
      <p>
        <a href='https://nextjs.org/docs/app/building-your-application/deploying#environment-variables'>
          Читайте документацию
        </a>
      </p>
    </section>
  )
}
