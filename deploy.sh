#!/bin/bash

# Переменные окружения
POSTGRES_USER="postgres" # замените на свое
POSTGRES_PASSWORD="postgres" # замените на свой
POSTGRES_DB="mydb"

SECRET_KEY="my-secret" # для демо приложения
NEXT_PUBLIC_SAFE_KEY="safe-key" # для демо приложения

DOMAIN_NAME="nextselfhost.ru" # замените на свой
EMAIL="aio350@mail.ru" # замените на свой

# Переменные для скриптов
REPO_URL="https://github.com/harryheman/self-host-nextjs.git"
APP_DIR=~/myapp
SWAP_SIZE="1G"  # область подкачки в 1 Гб

# Обновляем список пакетов и обновляем существующие пакеты
sudo apt update && sudo apt upgrade -y

# Добавляем область подкачки
# https://wiki.astralinux.ru/pages/viewpage.action?pageId=48759505
echo "Добавление области подкачки..."
sudo fallocate -l $SWAP_SIZE /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Делаем область подкачки постоянной
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Устанавливаем Docker
sudo apt install apt-transport-https ca-certificates curl software-properties-common -y
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" -y
sudo apt update
sudo apt install docker-ce -y

# Устанавливаем Docker Compose
sudo rm -f /usr/local/bin/docker-compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Ждем полной загрузки файла
if [ ! -f /usr/local/bin/docker-compose ]; then
  echo "Провал загрузки Docker Compose. Завершение работы."
  exit 1
fi

sudo chmod +x /usr/local/bin/docker-compose

# Проверяем, что Docker Compose является исполняемым и существует в path
sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# Проверяем установку Docker Compose
docker-compose --version
if [ $? -ne 0 ]; then
  echo "Провал установки Docker Compose. Завершение работы."
  exit 1
fi

# Проверяем, что Docker запускается при запуске системы и запускаем сервис Docker
sudo systemctl enable docker
sudo systemctl start docker

# Клонируем репозиторий Git
if [ -d "$APP_DIR" ]; then
  echo "Директория $APP_DIR уже существует. Извлечение последних изменений..."
  cd $APP_DIR && git pull
else
  echo "Клонирование репозитория из $REPO_URL..."
  git clone $REPO_URL $APP_DIR
  cd $APP_DIR
fi

# Для внутренней коммуникации Docker ("db" - название контейнера Postgres)
DATABASE_URL="postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@db:5432/$POSTGRES_DB?schema=public"

# Создаем файл .env в директории приложения (~/myapp/.env)
echo "POSTGRES_USER=$POSTGRES_USER" > "$APP_DIR/.env"
echo "POSTGRES_PASSWORD=$POSTGRES_PASSWORD" >> "$APP_DIR/.env"
echo "POSTGRES_DB=$POSTGRES_DB" >> "$APP_DIR/.env"
echo "DATABASE_URL=$DATABASE_URL" >> "$APP_DIR/.env"

# Переменные для демонстрации
echo "SECRET_KEY=$SECRET_KEY" >> "$APP_DIR/.env"
echo "NEXT_PUBLIC_SAFE_KEY=$NEXT_PUBLIC_SAFE_KEY" >> "$APP_DIR/.env"

# Устанавливаем Nginx
sudo apt install nginx -y

# Удаляем старые настройки Nginx (при наличии)
sudo rm -f /etc/nginx/sites-available/myapp
sudo rm -f /etc/nginx/sites-enabled/myapp

# Временно останавливаем Nginx для запуска Certbot в автономном режиме
sudo systemctl stop nginx

# Получаем сертификат SSL с помощью Certbot
sudo apt install certbot -y
sudo certbot certonly --standalone -d $DOMAIN_NAME --non-interactive --agree-tos -m $EMAIL

# Проверяем наличие файлов SSL или генерируем их
if [ ! -f /etc/letsencrypt/options-ssl-nginx.conf ]; then
  sudo wget https://raw.githubusercontent.com/certbot/certbot/main/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf -P /etc/letsencrypt/
fi

if [ ! -f /etc/letsencrypt/ssl-dhparams.pem ]; then
  sudo openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048
fi

# Создаем настройки Nginx с обратным прокси, поддержкой SSL,
# ограничением количества запросов и поддержкой потоковой передачи данных
sudo cat > /etc/nginx/sites-available/myapp <<EOL
limit_req_zone \$binary_remote_addr zone=mylimit:10m rate=10r/s;

server {
    listen 80;
    server_name $DOMAIN_NAME;

    # Перенаправляем все запросы HTTP на HTTPS
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name $DOMAIN_NAME;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Включаем ограничение количества запросов
    limit_req zone=mylimit burst=20 nodelay;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;

        # Отключаем буферизацию для поддержки потоков
        proxy_buffering off;
        proxy_set_header X-Accel-Buffering no;
    }
}
EOL

# Создаем символическую ссылку при отсутствии
sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/myapp

# Перезапускаем Nginx для применения новых настроек
sudo systemctl restart nginx

# Собираем и запускаем контейнеры Docker из директории приложения (~/myapp)
cd $APP_DIR
sudo docker-compose up -d

# Проверяем запуск Docker Compose
if ! sudo docker-compose ps | grep "Up"; then
  echo "Провал запуска контейнеров Docker. Проверьте логи с помощью 'docker-compose logs'"
  exit 1
fi

# Выводим финальное сообщение
echo "Деплой завершен. Приложение Next.js и база данных PostgreSQL запущены.
Приложение доступно по адресу: https://$DOMAIN_NAME, база данных - из веб-сервиса.

Файл .env был создан и содержит следующие значения:
- POSTGRES_USER
- POSTGRES_PASSWORD (произвольно сгенерированный)
- POSTGRES_DB
- DATABASE_URL
- SECRET_KEY
- NEXT_PUBLIC_SAFE_KEY"
