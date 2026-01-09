# Руководство по настройке приложения с PostgreSQL

## Шаг 1: Установка и настройка PostgreSQL

### Windows:
1. Скачайте PostgreSQL с официального сайта: https://www.postgresql.org/download/windows/
2. Установите PostgreSQL (запомните пароль для пользователя postgres)
3. Убедитесь, что PostgreSQL запущен

### macOS:
```bash
brew install postgresql
brew services start postgresql
```

### Linux:
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Создание базы данных:
```bash
# Войдите в PostgreSQL
psql -U postgres

# Создайте базу данных
CREATE DATABASE parenteral_calculator;

# Выйдите
\q
```

## Шаг 2: Настройка Backend сервера

1. Перейдите в папку server:
```bash
cd server
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env` из примера:
```bash
# Windows
copy env.example .env

# macOS/Linux
cp env.example .env
```

4. Отредактируйте `.env` файл:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=parenteral_calculator
DB_USER=postgres
DB_PASSWORD=ваш_пароль_postgres
PORT=3000
NODE_ENV=development
JWT_SECRET=ваш_случайный_секретный_ключ_минимум_32_символа
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:8081
```

5. Запустите миграции для создания таблиц:
```bash
npm run migrate
```

6. Запустите сервер:
```bash
# Для разработки (с автоперезагрузкой)
npm run dev

# Для продакшена
npm start
```

Сервер должен запуститься на `http://localhost:3000`

## Шаг 3: Настройка мобильного приложения

1. Откройте файл `utils/api.ts`

2. Обновите `API_BASE_URL`:
```typescript
const API_BASE_URL = __DEV__
  ? 'http://YOUR_COMPUTER_IP:3000/api'  // Замените на IP вашего компьютера
  : 'https://your-production-server.com/api';
```

**Как узнать IP адрес:**
- Windows: `ipconfig` в командной строке (ищите IPv4 адрес)
- macOS/Linux: `ifconfig` или `ip addr` (ищите inet адрес)

**Важно для Android эмулятора:**
- Используйте `10.0.2.2` вместо localhost
- Или используйте IP адрес вашего компьютера

**Важно для физического устройства:**
- Убедитесь, что телефон и компьютер в одной Wi-Fi сети
- Используйте IP адрес вашего компьютера, не localhost

3. Запустите мобильное приложение:
```bash
npm start
```

## Шаг 4: Проверка работы

1. Запустите backend сервер (должен быть на порту 3000)
2. Запустите мобильное приложение
3. При первом запуске вы увидите экран логина
4. Зарегистрируйте нового пользователя
5. После регистрации вы автоматически войдете в систему
6. Попробуйте создать расчет - он должен сохраниться в PostgreSQL

## Структура базы данных

### Таблица `users`:
- `id` - уникальный идентификатор
- `email` - email пользователя (уникальный)
- `password_hash` - хеш пароля (bcrypt)
- `name` - имя пользователя (опционально)
- `created_at` - дата создания
- `updated_at` - дата обновления

### Таблица `calculations`:
- `id` - уникальный идентификатор
- `user_id` - связь с пользователем (foreign key)
- Все поля для входных данных и результатов
- `created_at` - дата создания

## API Endpoints

### Аутентификация:
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/profile` - Профиль (требует токен)

### Расчеты (требуют токен):
- `POST /api/calculations` - Создать расчет
- `GET /api/calculations` - Получить все расчеты
- `DELETE /api/calculations/:id` - Удалить расчет
- `DELETE /api/calculations` - Удалить все расчеты

## Устранение проблем

### Ошибка подключения к БД:
- Проверьте, что PostgreSQL запущен
- Проверьте правильность данных в `.env`
- Убедитесь, что база данных создана

### Ошибка CORS:
- Проверьте `CORS_ORIGIN` в `.env`
- Убедитесь, что URL приложения совпадает

### Ошибка подключения с телефона:
- Убедитесь, что телефон и компьютер в одной сети
- Проверьте, что IP адрес правильный
- Проверьте, что брандмауэр не блокирует порт 3000

### Токен истек:
- Приложение автоматически перенаправит на экран логина
- Войдите снова

## Безопасность

⚠️ **Важно для продакшена:**
- Измените `JWT_SECRET` на случайную строку (минимум 32 символа)
- Используйте HTTPS
- Настройте правильный CORS
- Используйте переменные окружения для секретов
- Не коммитьте `.env` файл в git
