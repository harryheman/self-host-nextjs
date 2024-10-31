import type { NextConfig } from 'next'
// import path from 'path';

const nextConfig: NextConfig = {
  // Опционально: собственный обработчик кэша
  // cacheHandler: path.resolve('./cache-handler.mjs'),
  // cacheMaxMemorySize: 0, // отключаем дефолтное кэширование
  images: {
    // Опционально: сторонний сервис оптимизации изображений
    // loader: 'custom',
    // loaderFile: './image-loader.ts',
    //
    // По умолчанию изображения оптимизируются с помощью
    // Sharp, который встроен в `next start`
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
        search: '',
      },
    ],
  },
  // Nginx выполняет сжатие gzip. Мы отключаем
  // сжатие здесь для предотвращения буферизации
  // потоковых данных
  compress: false,
  // Опционально: перезапись дефолтного заголовка `stale-while-revalidate`,
  // определяющего период актуальности статических страниц (по умолчанию 1 год)
  // swrDelta: 3600 // секунды
}

export default nextConfig
