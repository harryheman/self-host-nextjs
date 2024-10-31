# Пример самостоятельного разворачивания приложения Next.js

Этот репозиторий содержит пример деплоя приложения Next.js и базы данных PostgreSQL на сервере Ubuntu Linux с помощью Docker и Nginx. В приложении используется несколько возможностей Next.js, таких как кэширование, ISR, переменные окружения и др.

[**📹 Смотрите туториал (45 мин)**](https://www.youtube.com/watch?v=sIVL4JMqRfc)

[![Self Hosting Video Thumbnail](https://img.youtube.com/vi/sIVL4JMqRfc/0.jpg)](https://www.youtube.com/watch?v=sIVL4JMqRfc)

## Подготовка

1. Купите название домена.
2. Купите сервер Linux Ubuntu.
3. Создайте запись DNS `A`, указывающую на адрес IPv4 вашего сервера.

## Быстрый запуск

1. **Подключаемся к серверу по SSH**:

```bash
ssh root@your_server_ip
```

2. **Загружаем скрипт для деплоя**:

```bash
curl -o ~/deploy.sh https://raw.githubusercontent.com/leerob/next-self-host/main/deploy.sh
```

Укажите свои данные в переменных `DOMAIN_NAME` и `EMAIL` в файле `deploy.sh`.

3. **Запускаем скрипт для деплоя**:

```bash
chmod +x ~/deploy.sh
./deploy.sh
```

## Поддерживаемые возможности

В этом демо используется много разных возможностей Next.js:

- оптимизация изображений
- потоковая передача данных
- взаимодействие с БД Postgres
- кэширование
- инкрементальная статическая регенерация
- чтение переменных окружения
- использование посредника
- выполнение кода при запуске сервера
- задача cron, взаимодействующая с обработчиком роута

Смотрите [демо](https://nextselfhost.ru) для получения более полной информации.

## Скрипт для деплоя

Репозиторий содержит скрипт Bash, который включает следующее:

1. Установка всех необходимых серверу зависимостей.
2. Установка Docker, Docker Compose и Nginx.
3. Клонирование репозитория.
4. Генерация сертификата SSL.
5. Сборка приложения Next.js с помощью Dockerfile.
6. Настройка Nginx с HTTPS и ограничением количества запросов.
7. Настройка cron, очищающего БД каждые 10 мин.
8. Создание файла `.env` с данными для работы с Postgres.

После завершения деплоя, приложение будет доступно по адресу:

```
http://your-provided-domain.com
```

Приложение Next.js и БД PostgreSQL поднимаются и запускаются в контейнерах. Для настройки БД можно использовать `psql`:

```bash
docker exec -it myapp-db-1 sh
apk add --no-cache postgresql-client
psql -U myuser -d mydatabase -c '
CREATE TABLE IF NOT EXISTS "todos" (
  "id" serial PRIMARY KEY NOT NULL,
  "content" varchar(255) NOT NULL,
  "completed" boolean DEFAULT false,
  "created_at" timestamp DEFAULT now()
);'
```

Для последующих обновлений предназначен скрипт `update.sh`.

## Локальный запуск

Для локального запуска проекта с помощью Docker нужно сделать следующее:

```bash
docker-compose up -d
```

Эта команда запустит оба сервиса и сделает приложение доступным по адресу: `http://localhost:3000` с БД, запущенной в фоновом режиме. Мы также создаем сеть, чтобы контейнеры могли общаться между собой.

Для просмотра содержимого локальной БД можно использовать Prisma Studio:

```bash
npx prisma studio
```

## Полезные команды

- `docker-compose ps` - проверка статуса контейнеров Docker
- `docker-compose logs web` - отображение логов Next.js
- `docker-compose logs cron` - отображение логов cron
- `docker-compose down` - остановка контейнеров Docker
- `docker-compose up -d` - запуск контейнеров в фоновом режиме
- `sudo systemctl restart nginx` - перезапуск Nginx
- `docker exec -it myapp-web-1 sh` - подключение к контейнеру Next.js
- `docker exec -it myapp-db-1 psql -U postgres -d mydb` - подключение к Postgres

## Полезные ресурсы

- [Пример Kubernetes](https://github.com/ezeparziale/nextjs-k8s)
- [Адаптер кэша Redis для Next.js](https://github.com/vercel/next.js/tree/canary/examples/cache-handler-redis)
- [ipx - библиотека оптимизации изображений](https://github.com/unjs/ipx)
- [OrbStack - быстрый десктопный клиент Docker](https://orbstack.dev/)
