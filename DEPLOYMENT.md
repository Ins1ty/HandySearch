# Деплой на Railway + Vercel

## Требования
- Аккаунт GitHub
- Аккаунт Railway
- Аккаунт Vercel

---

## Часть 1: Railway (Backend)

### Шаг 1: Создание проекта на Railway

1. Зайди на [railway.app](https://railway.app) и войди через GitHub
2. Нажми **"New Project"**
3. Выбери **"Empty Project"**
4. Назови проект, например `handysearch-api`

### Шаг 2: Подключение репозитория

1. В проекте нажми **"GitHub"** → **"Add GitHub Repo"**
2. Выбери репозиторий `HandySearch`
3. Нажми **"Add Repository"**

### Шаг 3: Создание базы данных MySQL

1. Нажми **"+ New"** → **"Database"** → **"MySQL"**
2. Подожди пока создастся (обычно 1-2 минуты)
3. После создания появится строка подключения в формате:
   ```
   mysql://username:password@hostname:port/databasename
   ```

### Шаг 4: Настройка переменных окружения

1. Нажми **"Variables"** на панели проекта
2. Добавь следующие переменные:

```
APP_ENV=production
APP_DEBUG=false
APP_URL=https://твой-проект.up.railway.app
APP_KEY=base64:твой-ключ-здесь

DB_CONNECTION=mysql
DB_HOST=получи-из-credentials
DB_PORT=3306
DB_DATABASE=получи-из-credentials
DB_USERNAME=получи-из-credentials
DB_PASSWORD=получи-из-credentials

SANCTUM_STATEFUL_DOMAINS=твой-домен.vercel.app
```

### Шаг 5: Генерация APP_KEY

1. Открой терминал в папке backend:
   ```bash
   cd backend
   php artisan key:generate --show
   ```
2. Скопируй полученный ключ и добавь в переменные окружения как `APP_KEY`

### Шаг 6: Деплой

1. Нажми **"Deploy"** на главной странице проекта
2. Дождись завершения (может занять 2-5 минут)
3. После деплоя получишь URL типа: `https://твой-проект.up.railway.app`

---

## Часть 2: Vercel (Frontend)

### Шаг 1: Импорт проекта

1. Зайди на [vercel.com](https://vercel.com) и войди через GitHub
2. Нажми **"Add New..."** → **"Project"**
3. Выбери репозиторий `HandySearch`
4. Нажми **"Import"**

### Шаг 2: Настройка проекта

Настройки по умолчанию должны подойти:
- Framework Preset: **Next.js**
- Build Command: `next build` (или оставить пустым)
- Output Directory: `.next` (или оставить пустым)

### Шаг 3: Настройка переменных окружения

Добавь переменную:
- Key: `NEXT_PUBLIC_API_URL`
- Value: `https://твой-проект.up.railway.app/api`

### Шаг 4: Деплой

1. Нажми **"Deploy"**
2. Дождись завершения (1-2 минуты)
3. Получишь URL типа: `https://handysearch.vercel.app`

---

## Часть 3: Финальная настройка

### Обновление CORS на Railway

После получения URL Vercel, нужно обновить CORS:

1. На Railway в переменных окружения добавь:
   ```
   SANCTUM_STATEFUL_DOMAINS=твой-домен.vercel.app
   CORS_ALLOWED_ORIGINS=https://твой-домен.vercel.app
   ```

2. Перезапусти деплой на Railway

### Проверка работы

1. Открой Vercel URL в браузере
2. Попробуй залогиниться
3. Если есть ошибки CORS - проверь переменные окружения

---

## Устранение проблем

### Ошибка "419 CSRF token mismatch"
- Проверь что `SANCTUM_STATEFUL_DOMAINS` содержит твой Vercel домен

### Ошибка подключения к базе данных
- Проверь правильность `DB_*` переменных
- Убедись что MySQL addon активен

### Ошибка 500 на Railway
- Проверь `APP_DEBUG=true` временно для просмотра ошибок
- Проверь логи в Railway Dashboard

---

## Стоимость

- **Railway**: ~$5/мес (минимальный план с MySQL)
- **Vercel**: бесплатно (для личного использования)

---

## Обновление кода

После изменений в коде:
1. Запушь изменения в GitHub
2. Railway и Vercel автоматически передеплоятся

