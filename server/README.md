# Backend Server для Калькулятора парентерального питания

## Установка и настройка

### 1. Установите PostgreSQL

Убедитесь, что PostgreSQL установлен и запущен на вашем компьютере.

### 2. Создайте базу данных

```sql
CREATE DATABASE parenteral_calculator;
```

### 3. Установите зависимости

```bash
cd server
npm install
```

### 4. Настройте переменные окружения

Скопируйте `.env.example` в `.env` и заполните значения:

```bash
cp .env.example .env
```

Отредактируйте `.env`:
- `DB_HOST` - хост PostgreSQL (обычно localhost)
- `DB_PORT` - порт PostgreSQL (обычно 5432)
- `DB_NAME` - имя базы данных (parenteral_calculator)
- `DB_USER` - пользователь PostgreSQL
- `DB_PASSWORD` - пароль PostgreSQL
- `JWT_SECRET` - секретный ключ для JWT (используйте случайную строку)
- `PORT` - порт сервера (по умолчанию 3000)
- `CORS_ORIGIN` - URL вашего мобильного приложения

### 5. Запустите миграции

```bash
npm run migrate
```

Это создаст таблицы `users` и `calculations` в базе данных.

### 6. Запустите сервер

Для разработки (с автоперезагрузкой):
```bash
npm run dev
```

Для продакшена:
```bash
npm start
```

## API Endpoints

### Аутентификация

- `POST /api/auth/register` - Регистрация нового пользователя
- `POST /api/auth/login` - Вход в систему
- `GET /api/auth/profile` - Получить профиль пользователя (требует токен)

### Расчеты

Все endpoints для расчетов требуют аутентификации (Bearer token в заголовке Authorization).

- `POST /api/calculations` - Создать новый расчет
- `GET /api/calculations` - Получить все расчеты пользователя
- `DELETE /api/calculations/:id` - Удалить расчет по ID
- `DELETE /api/calculations` - Удалить все расчеты пользователя

## Структура базы данных

### Таблица `users`
- `id` - SERIAL PRIMARY KEY
- `email` - VARCHAR(255) UNIQUE NOT NULL
- `password_hash` - VARCHAR(255) NOT NULL
- `name` - VARCHAR(255)
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP

### Таблица `calculations`
- `id` - SERIAL PRIMARY KEY
- `user_id` - INTEGER REFERENCES users(id)
- Все поля для входных данных и результатов расчета
- `created_at` - TIMESTAMP

## Примеры запросов

### Регистрация
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

### Логин
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Создание расчета (с токеном)
```bash
curl -X POST http://localhost:3000/api/calculations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "glucose_volume": 500,
    "glucose_concentration": 10,
    ...
  }'
```
