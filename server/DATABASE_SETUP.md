# Настройка базы данных PostgreSQL

## Шаги для настройки

### 1. Создание базы данных

Вы уже создали базу данных `calculator_db`. Если нет, выполните:

```sql
CREATE DATABASE calculator_db;
```

### 2. Настройка файла .env

Файл `.env` уже создан с вашими настройками:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=calculator_db
DB_USER=postgres
DB_PASSWORD=postgres
```

### 3. Установка зависимостей

Из папки `server`:

```bash
npm install
```

### 4. Запуск миграции базы данных

Это создаст все необходимые таблицы и индексы:

```bash
npm run migrate
```

Вы должны увидеть:
```
🔄 Starting database migration...
✅ Users table created
✅ Calculations table created
✅ Indexes created
✅ Triggers created
🎉 Database migration completed successfully!
```

### 5. Запуск сервера

**Режим разработки (с автоперезагрузкой):**
```bash
npm run dev
```

**Продакшн режим:**
```bash
npm start
```

Сервер запустится на порту 3000 (или другом, указанном в .env).

### 6. Проверка подключения

Откройте в браузере или Postman:
```
http://localhost:3000/health
```

Должен вернуть:
```json
{
  "status": "ok",
  "message": "Server is running",
  "database": "connected"
}
```

## Структура базы данных

### Таблица users
- `id` - SERIAL PRIMARY KEY
- `email` - VARCHAR(255) UNIQUE NOT NULL
- `password_hash` - VARCHAR(255) NOT NULL
- `name` - VARCHAR(255)
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP (автоматически обновляется)

### Таблица calculations
- `id` - SERIAL PRIMARY KEY
- `user_id` - INTEGER (nullable для гостевого режима)
- `glucose_volume` - DECIMAL(10, 2)
- `glucose_concentration` - DECIMAL(10, 2)
- `amino_acids_volume` - DECIMAL(10, 2)
- `amino_acids_concentration` - DECIMAL(10, 2)
- `lipids_volume` - DECIMAL(10, 2)
- `lipids_concentration` - DECIMAL(10, 2)
- `glucose_grams` - DECIMAL(10, 2)
- `glucose_calories` - DECIMAL(10, 2)
- `amino_acids_grams` - DECIMAL(10, 2)
- `amino_acids_calories` - DECIMAL(10, 2)
- `lipids_grams` - DECIMAL(10, 2)
- `lipids_calories` - DECIMAL(10, 2)
- `total_calories` - DECIMAL(10, 2)
- `total_volume` - DECIMAL(10, 2)
- `created_at` - TIMESTAMP

## API Endpoints

### Аутентификация (опциональна)

**Регистрация:**
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "Имя Пользователя"
}
```

**Вход:**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Профиль (требует токен):**
```
GET /api/auth/profile
Authorization: Bearer <token>
```

### Расчеты

**Создать расчет (работает без токена):**
```
POST /api/calculations
Content-Type: application/json

{
  "glucose_volume": 500,
  "glucose_concentration": 10,
  ...
}
```

**Получить историю (без токена вернет пустой массив):**
```
GET /api/calculations
```

**Получить историю (с токеном вернет все расчеты пользователя):**
```
GET /api/calculations
Authorization: Bearer <token>
```

## Гостевой режим

Приложение поддерживает работу без регистрации:
- ✅ Расчеты выполняются
- ✅ Результаты отображаются
- ❌ История НЕ сохраняется
- ❌ Синхронизация между устройствами недоступна

Для сохранения истории пользователь должен зарегистрироваться и войти в систему.

## Проверка таблиц

Подключитесь к PostgreSQL:
```bash
psql -U postgres -d calculator_db
```

Посмотрите таблицы:
```sql
\dt
```

Посмотрите структуру:
```sql
\d users
\d calculations
```

Посмотрите данные:
```sql
SELECT * FROM users;
SELECT * FROM calculations;
```

## Troubleshooting

**Ошибка подключения к БД:**
- Проверьте, что PostgreSQL запущен
- Проверьте данные в `.env`
- Проверьте, что БД `calculator_db` существует

**Таблицы не создаются:**
- Запустите `npm run migrate` еще раз
- Проверьте логи на ошибки
- Убедитесь, что у пользователя `postgres` есть права

**Порт занят:**
- Измените `PORT` в `.env`
- Или остановите процесс на порту 3000
