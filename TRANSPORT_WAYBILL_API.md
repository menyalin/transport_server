# API Транспортных накладных

## Базовый путь
```
/api/transport_waybills
```

## Аутентификация
Все endpoints требуют JWT-токен в заголовке запроса:
```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Получить список транспортных накладных

**GET** `/api/transport_waybills`

**Query параметры:**
| Параметр | Тип   | Обязательный | Описание          |
|-----------|-------|--------------|-------------------|
| orderId   | string | Нет          | ID заказа для фильтрации |

**Пример запроса:**
```http
GET /api/transport_waybills?orderId=507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

**Ответ (200 OK):**
```json
[
  {
    "number": "ТТН-001",
    "date": "2026-03-17T10:00:00.000Z",
    "orderId": "507f1f77bcf86cd799439011",
    "note": "Примечание к накладной",
    "createdAt": "2026-03-17T10:00:00.000Z",
    "updatedAt": "2026-03-17T10:00:00.000Z"
  }
]
```

---

### 2. Получить транспортную накладную по ID

**GET** `/api/transport_waybills/:id`

**Параметры пути:**
| Параметр | Тип   | Описание   |
|-----------|-------|------------|
| id        | string | ID накладной |

**Пример запроса:**
```http
GET /api/transport_waybills/507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

**Ответ (200 OK):**
```json
{
  "number": "ТТН-001",
  "date": "2026-03-17T10:00:00.000Z",
  "orderId": "507f1f77bcf86cd799439011",
  "note": "Примечание к накладной",
  "createdAt": "2026-03-17T10:00:00.000Z",
  "updatedAt": "2026-03-17T10:00:00.000Z"
}
```

**Ошибка (404):**
```json
{
  "message": "TransportWaybillRepository : getById : waybill 507f1f77bcf86cd799439011 not found"
}
```

---

### 3. Получить транспортные накладные по ID заказа

**GET** `/api/transport_waybills/order/:orderId`

**Параметры пути:**
| Параметр | Тип   | Описание    |
|-----------|-------|-------------|
| orderId   | string | ID заказа |

**Пример запроса:**
```http
GET /api/transport_waybills/order/507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

**Ответ (200 OK):**
```json
[
  {
    "number": "ТТН-001",
    "date": "2026-03-17T10:00:00.000Z",
    "orderId": "507f1f77bcf86cd799439011",
    "note": "Примечание к накладной"
  },
  {
    "number": "ТТН-002",
    "date": "2026-03-17T11:00:00.000Z",
    "orderId": "507f1f77bcf86cd799439011",
    "note": "Вторая накладная"
  }
]
```

---

### 4. Создать транспортную накладную

**POST** `/api/transport_waybills`

**Тело запроса:**
```json
{
  "number": "ТТН-001",
  "date": "2026-03-17T10:00:00.000Z",
  "orderId": "507f1f77bcf86cd799439011",
  "note": "Примечание к накладной"
}
```

| Поле    | Тип   | Обязательный | Описание            |
|---------|-------|--------------|---------------------|
| number  | string | Да          | Номер накладной      |
| date    | string | Да          | Дата накладной (ISO)  |
| orderId | string | Да          | ID связанного заказа  |
| note    | string | Нет          | Примечание          |

**Пример запроса:**
```http
POST /api/transport_waybills
Authorization: Bearer <token>
Content-Type: application/json

{
  "number": "ТТН-001",
  "date": "2026-03-17T10:00:00.000Z",
  "orderId": "507f1f77bcf86cd799439011",
  "note": "Примечание к накладной"
}
```

**Ответ (201 Created):**
```json
{
  "number": "ТТН-001",
  "date": "2026-03-17T10:00:00.000Z",
  "orderId": "507f1f77bcf86cd799439011",
  "note": "Примечание к накладной",
  "createdAt": "2026-03-17T10:00:00.000Z",
  "updatedAt": "2026-03-17T10:00:00.000Z"
}
```

**Socket.io событие:** `transport-waybill:created` — отправляется в комнату `orderId`

---

### 5. Обновить транспортную накладную

**PUT** `/api/transport_waybills/:id`

**Параметры пути:**
| Параметр | Тип   | Описание   |
|-----------|-------|------------|
| id        | string | ID накладной |

**Тело запроса:**
```json
{
  "number": "ТТН-001-ИЗМ",
  "date": "2026-03-17T10:00:00.000Z",
  "note": "Обновленное примечание"
}
```

| Поле   | Тип   | Обязательный | Описание               |
|--------|-------|--------------|------------------------|
| number | string | Нет          | Номер накладной         |
| date   | string | Нет          | Дата накладной (ISO)     |
| note   | string | Нет          | Примечание             |

**Пример запроса:**
```http
PUT /api/transport_waybills/507f1f77bcf86cd799439011
Authorization: Bearer <token>
Content-Type: application/json

{
  "number": "ТТН-001-ИЗМ",
  "note": "Обновленное примечание"
}
```

**Ответ (200 OK):**
```json
{
  "number": "ТТН-001-ИЗМ",
  "date": "2026-03-17T10:00:00.000Z",
  "orderId": "507f1f77bcf86cd799439011",
  "note": "Обновленное примечание",
  "createdAt": "2026-03-17T10:00:00.000Z",
  "updatedAt": "2026-03-17T12:00:00.000Z"
}
```

**Socket.io событие:** `transport-waybill:updated` — отправляется в комнату `orderId`

---

### 6. Удалить транспортную накладную

**DELETE** `/api/transport_waybills/:id`

**Параметры пути:**
| Параметр | Тип   | Описание   |
|-----------|-------|------------|
| id        | string | ID накладной |

**Пример запроса:**
```http
DELETE /api/transport_waybills/507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

**Ответ (200 OK):**
```json
null
```

**Ошибка (404):**
```json
{
  "message": "TransportWaybillRepository : deleteById : waybill 507f1f77bcf86cd799439011 not found"
}
```

**Socket.io событие:** `transport-waybill:deleted` — отправляется в комнату `orderId` с ID удаленной накладной

---

## Socket.io события

Все события отправляются в комнаты по `orderId` связанного заказа.

| Событие                    | Данные                            | Когда отправляется       |
|----------------------------|-----------------------------------|------------------------|
| `transport-waybill:created`   | Объект накладной                 | При создании            |
| `transport-waybill:updated`   | Объект накладной                 | При обновлении          |
| `transport-waybill:deleted`   | ID удаленной накладной            | При удалении           |

---

## Коды ответов

| Код | Описание                     |
|-----|------------------------------|
| 200 | Успешное выполнение операции    |
| 201 | Ресурс успешно создан          |
| 404 | Ресурс не найден              |
| 500 | Внутренняя ошибка сервера      |

---

## Модель данных

### TransportWaybill

```typescript
interface TransportWaybill {
  number: string          // Номер транспортной накладной
  date: Date             // Дата накладной
  orderId: string        // ID связанного заказа
  note: string          // Примечание (опционально)
  createdAt: Date       // Дата создания (автоматически)
  updatedAt: Date       // Дата обновления (автоматически)
}
```
