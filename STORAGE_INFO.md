# Информация о хранении данных

## База данных

В этом приложении **не используется традиционная база данных** (SQLite, PostgreSQL и т.д.). Вместо этого используется **AsyncStorage** - это локальное хранилище ключ-значение (key-value storage) для React Native.

## AsyncStorage

**AsyncStorage** - это асинхронное, персистентное хранилище данных, которое работает как простой словарь (key-value store).

### Характеристики:

1. **Тип хранилища**: Key-Value Storage (не реляционная БД)
2. **Формат данных**: JSON (данные сериализуются в JSON строку)
3. **Расположение**: Локально на устройстве пользователя
4. **Синхронность**: Асинхронные операции (async/await)
5. **Ограничения**: 
   - На iOS: ~6MB данных
   - На Android: ~10MB данных

### Где сохраняются данные:

#### iOS:
- Путь: `Library/Application Support/[BundleID]/RCTAsyncLocalStorage_V1/`
- Файл: SQLite база данных (AsyncStorage использует SQLite под капотом на iOS)

#### Android:
- Путь: `/data/data/[package_name]/databases/`
- Файл: SQLite база данных (AsyncStorage использует SQLite под капотом на Android)

#### Web:
- Использует `localStorage` браузера

### Структура данных в приложении:

**Ключ хранения**: `@parenteral_nutrition_history`

**Формат данных**: JSON массив объектов `CalculationHistory`:

```json
[
  {
    "id": "1234567890",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "input": {
      "glucose": { "volume": 500, "concentration": 10 },
      "aminoAcids": { "volume": 250, "concentration": 10 },
      "lipids": { "volume": 200, "concentration": 20 }
    },
    "result": {
      "glucose": { "grams": 50, "calories": 200 },
      "aminoAcids": { "grams": 25, "calories": 100 },
      "lipids": { "grams": 40, "calories": 360 },
      "total": { "calories": 660, "volume": 950 }
    }
  }
]
```

### Операции с данными:

1. **Сохранение** (`saveCalculation`):
   - Загружает текущую историю
   - Добавляет новый расчет в начало массива
   - Ограничивает историю 50 записями
   - Сохраняет обратно в AsyncStorage

2. **Загрузка** (`getHistory`):
   - Читает данные из AsyncStorage
   - Парсит JSON
   - Преобразует строки дат обратно в объекты Date

3. **Удаление** (`deleteCalculation`):
   - Загружает историю
   - Фильтрует массив, удаляя запись по ID
   - Сохраняет обновленный массив

4. **Очистка** (`clearHistory`):
   - Удаляет весь ключ из AsyncStorage

### Преимущества AsyncStorage:

✅ Простота использования  
✅ Не требует настройки БД  
✅ Автоматическая синхронизация  
✅ Работает офлайн  
✅ Быстрый доступ к данным  

### Недостатки:

❌ Ограниченный размер данных  
❌ Нет сложных запросов (как в SQL)  
❌ Нет отношений между данными  
❌ Все данные хранятся в одном ключе  

### Альтернативы (если понадобится в будущем):

- **SQLite** (через `react-native-sqlite-storage`) - для сложных запросов
- **Realm** - объектная база данных
- **WatermelonDB** - реактивная БД для React Native
- **Firebase Realtime Database** - облачное хранилище
- **Supabase** - PostgreSQL в облаке
