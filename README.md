Приложение, помогающее ухаживать за комнатными растениями - следить за поливом и получать подсказки по уходу.

Пример .env для server, в DATABASE_URL должа быть строка подключение к изначально пустой бд

```
PORT=5000
DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/plant_care"
JWT_SECRET="plant-care-secret-key"
```

Пример .env для client. На месте <some_token> должен располагаться токен для подключения к open.plantbook.io.
Для его получения нужно зарегестрироваться на [open.plantbook.io ](https://open.plantbook.io/)

```
VITE_PLANTBOOK_TOKEN="Token <some_token>"
```

Все команды запускать из корневой папки
Установка зависимостей

```
npm install
npm install --workspaces
```

Генерация клиента для prisma

```
npm run prisma:generate
```

Миграция бд из схемы

```
npm run prisma:migrate --name init_migration
```

Билд

```
npm run build
```

Запуск тестов

```
npm run dev
```

Запуск проверок линтера и форматера

```
npm run lint
npm run format:check
```

Запуск приложения в dev режиме

```
npm run dev
```

При добавлении растения его вид лучше искать на английском языке, на русском будет меньший выбор.
Так же для корректной работы с open.plantbook.io лучше включит впн.
