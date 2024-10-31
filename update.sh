#!/bin/bash

# Переменные окружения для скриптов
REPO_URL="https://github.com/harryheman/self-host-nextjs.git"
APP_DIR=~/myapp

# Извлекаем последние изменения из репозитория Git
if [ -d "$APP_DIR" ]; then
  echo "Извлечение последних изменений из репозитория..."
  cd $APP_DIR
  git pull origin main
else
  echo "Клонирование репозитория из $REPO_URL..."
  git clone $REPO_URL $APP_DIR
  cd $APP_DIR
fi

# Повторно собираем и перезапускаем контейнеры Docker из директории приложения (~/myapp)
echo "Повторная сборка и перезапуск контейнеров Docker..."
sudo docker-compose down
sudo docker-compose up --build -d

# Проверяем запуск Docker Compose
if ! sudo docker-compose ps | grep "Up"; then
  echo "Провал запуска контейнеров Docker. Проверьте логи с помощью 'docker-compose logs'."
  exit 1
fi

# Выводим финальное сообщение
echo "Обновление завершено. Приложение Next.js развернуто с последними изменениями."
