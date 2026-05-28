# Рефакторинг блока IdleTruckNotification

## Важность блока

Этот функционал отправляет email-уведомления внешним партнерам о простое грузовиков. Ошибка может привести к:
- Лишним уведомлениям → недовольство партнеров
- Пропущенным уведомлениям → финансовые потери

**Правило:** Каждый этап сопровождается тестами. Интеграционные тесты пишутся ДО начала рефакторинга.

---

## Текущая архитектура

### Сущности

```
domain/partner/
├── idleTruckNotification.ts          # Настройка/правило уведомления
├── helpers/
│   ├── isNeedCreateIdleTruckNotification.ts
│   ├── isNeedCreateIdleTruckNotificationByPoint.ts
│   ├── isNeedCreateIdleTruckNotificationByOrder.ts
│   └── setIdleTruckNotifications.ts
└── partner.domain.ts                 # Содержит notificationsByOrder()

domain/notifications/
├── idleTruckNotificationMessage.ts  # Сообщение к отправке
├── utils/
│   └── getIdleTruckNotifMessageSendDate.ts
└── interfaces.ts

services/notification/
├── notification.service.ts          # Обработка событий
├── events/
│   └── idleTruckNotifications.ts     # toCreateIdleTruckNotificationEvent
└── utils/
    └── isNeedUpdateNotificationMessage.ts

services/scheduler/tasks/
└── sendIdleTruckNotificationMessages.ts

repositories/notification/
├── notification.repository.ts
└── models/
    └── idleTruckNotificationMessage.ts
```

### Поток данных

```
1. OrderUpdatedEvent → PartnerService.createIdleTruckNotification()
2. Partner.notificationsByOrder() → фильтрует правила по заказу
3. toCreateIdleTruckNotificationEvent → NotificationService
4. IdleTruckNotificationMessage.create() → расчёт sendDate
5. NotificationRepository.updateIdleTruckNotificationMessage()
6. Планировщик → sendIdleTruckNotificationMessages()
7. toSendIdleTruckNotificationMessageEvent → отправка email
```

---

## Проблемы архитектуры

### 1. Размывание слоёв
`IdleTruckNotification` находится в `domain/partner/`, хотя это самостоятельная сущность.

### 2. Partner знает слишком много о заказах
```ts
notificationsByOrder(order: Order): INotificationsByRouteRes[] {
  order.route.activePoints.forEach(...) // Partner не должен знать о маршруте
}
```

### 3. Дублирование событий
События разбросаны по разным модулям.

### 4. Непонятные имена
- `IdleTruckNotification` — это правило, а не уведомление
- `IdleTruckNotificationMessage` — это сообщение

### 5. Сложная логика в утилитах
Три функции `isNeedCreateNotification*` с неочевидной разницей.

### 6. Magic в конструкторе
```ts
this.status = p.sendDate !== null ? p.status : MESSAGE_STATUS_ENUM.canceled
```

### 7. Race condition
```ts
const existed = await repo.getByKey(key)
if (isNeedUpdate(new, existed))
  await repo.update(new) // Между get и update — race condition
```

### 8. Repository работает как UseCase
```ts
getCreatedIdleTruckNotificationMessages(sendDate: Date) // Бизнес-логика в репозитории
```

---

## План рефакторинга

### ЭТАП 0: Интеграционные тесты (ДО начала рефакторинга)

**Цель:** Создать "оракул" — если тесты проходят после рефакторинга, логика цела.

**Файл:** `src/services/notification/__tests__/idleTruckNotification.flow.spec.ts`

```typescript
describe('IdleTruckNotification Flow', () => {
  describe('Создание сообщения для заказа', () => {
    it('должен создать сообщение для активного правила', async () => {
      // Setup
      const partner = await createPartnerWithNotification({
        isActive: true,
        addresses: [addressId],
        idleHoursBeforeNotify: 2,
      })
      const order = await createOrder({
        clientId: partner.id,
        route: { activePoints: [{ address: addressId, plannedDate }] }
      })

      // Action
      await PartnerService.createIdleTruckNotification(order)

      // Assert
      const messages = await NotificationRepository.getByOrderId(order.id)
      expect(messages).toHaveLength(1)
      expect(messages[0].status).toBe(MESSAGE_STATUS_ENUM.created)
      expect(messages[0].sendDate).toEqual(addHours(plannedDate, 2))
    })

    it('не должен создавать сообщение для неактивного правила', async () => {
      const partner = await createPartnerWithNotification({ isActive: false })
      const order = await createOrder({ clientId: partner.id })

      await PartnerService.createIdleTruckNotification(order)

      const messages = await NotificationRepository.getByOrderId(order.id)
      expect(messages).toHaveLength(0)
    })
  })

  describe('Расчёт sendDate', () => {
    it('usePlannedDate=true: берём plannedDate + idleHours', async () => {
      const partner = await createPartnerWithNotification({
        usePlannedDate: true,
        idleHoursBeforeNotify: 5,
      })
      const plannedDate = new Date('2024-01-01T10:00:00')
      const order = await createOrder({
        clientId: partner.id,
        route: { activePoints: [{ plannedDate }] }
      })

      await PartnerService.createIdleTruckNotification(order)

      const messages = await NotificationRepository.getByOrderId(order.id)
      expect(messages[0].sendDate).toEqual(new Date('2024-01-01T15:00:00'))
    })

    it('usePlannedDate=false: берём max(plannedDate, arrivalDate) + idleHours', async () => {
      const partner = await createPartnerWithNotification({
        usePlannedDate: false,
        idleHoursBeforeNotify: 3,
      })
      const order = await createOrder({
        route: {
          activePoints: [{
            plannedDate: new Date('2024-01-01T10:00'),
            arrivalDate: new Date('2024-01-01T12:00'), // Опоздание
          }]
        }
      })

      await PartnerService.createIdleTruckNotification(order)

      const messages = await NotificationRepository.getByOrderId(order.id)
      expect(messages[0].sendDate).toEqual(new Date('2024-01-01T15:00:00')) // 12:00 + 3h
    })

    it('нет дат — sendDate = null, status = canceled', async () => {
      const partner = await createPartnerWithNotification()
      const order = await createOrder({
        route: { activePoints: [{ plannedDate: null, arrivalDate: null }] }
      })

      await PartnerService.createIdleTruckNotification(order)

      const messages = await NotificationRepository.getByOrderId(order.id)
      expect(messages[0].sendDate).toBeNull()
      expect(messages[0].status).toBe(MESSAGE_STATUS_ENUM.canceled)
    })
  })

  describe('Смена грузовика', () => {
    it('должен удалить сообщения при смене грузовика', async () => {
      const order = await createOrder()
      await PartnerService.createIdleTruckNotification(order)

      bus.publish(OrderTruckChanged({ orderId: order.id }))

      const messages = await NotificationRepository.getByOrderId(order.id)
      expect(messages[0].status).toBe(MESSAGE_STATUS_ENUM.deleted)
    })
  })

  describe('Деактивация правила', () => {
    it('должен отменить ожидающие сообщения', async () => {
      const partner = await createPartnerWithNotification({ isActive: true })
      const order = await createOrder({ clientId: partner.id })
      await PartnerService.createIdleTruckNotification(order)

      await PartnerService.updateIdleTruckNotify(partner.id, notificationId, { isActive: false })

      const messages = await NotificationRepository.getByOrderId(order.id)
      expect(messages[0].status).toBe(MESSAGE_STATUS_ENUM.canceled)
    })
  })

  describe('Планировщик', () => {
    it('должен отправить сообщения у которых sendDate <= now', async () => {
      const pastDate = new Date(Date.now() - 1000)
      const message = await createIdleTruckNotificationMessage({
        sendDate: pastDate,
        status: MESSAGE_STATUS_ENUM.created
      })

      await sendIdleTruckNotificationMessages(new Date())

      const updated = await NotificationRepository.getByKey(message.key)
      expect(updated.status).toBe(MESSAGE_STATUS_ENUM.sended)
    })

    it('не должен отправлять сообщения с sendDate в будущем', async () => {
      const futureDate = new Date(Date.now() + 100000)
      await createIdleTruckNotificationMessage({
        sendDate: futureDate,
        status: MESSAGE_STATUS_ENUM.created
      })

      await sendIdleTruckNotificationMessages(new Date())

      // Сообщение осталось в статусе created
    })
  })

  describe('Race condition', () => {
    it('не должен дублировать сообщения при параллельном создании', async () => {
      const order = await createOrder()

      // Параллельно создаём два одинаковых сообщения
      await Promise.all([
        PartnerService.createIdleTruckNotification(order),
        PartnerService.createIdleTruckNotification(order),
      ])

      const messages = await NotificationRepository.getByOrderId(order.id)
      expect(messages).toHaveLength(1) // Должно быть одно, а не два
    })
  })
})
```

**Критерий выхода:** Все тесты проходят.

---

### ЭТАП 1: Вынести IdleTruckNotification из partner

**Цель:** Разделить сущности Partner и IdleTruckNotification.

**Действия:**

1. Переименовать:
   ```
   domain/partner/idleTruckNotification.ts
   → domain/notifications/idleTruckNotifyRule.ts
   ```

2. Обновить класс:
   ```typescript
   // domain/notifications/idleTruckNotifyRule.ts
   export class IdleTruckNotifyRule {
     // Было: IdleTruckNotification
     // Стало: IdleTruckNotifyRule (более понятное имя)

     matches(order: Order, point: RoutePoint): boolean {
       // Объединить логику из isNeedCreateNotification*
       if (!this.includeAddress(point.address)) return false
       if (!this.isActive) return false

       const agreementMatches = this.allowedAgreement(order.client.agreement?.toString())
       if (!agreementMatches) return false

       if (this.usePlannedDate && point.plannedDate) return true
       if (point.plannedDate && point.isStarted) return true

       return false
     }

     calculateSendDate(point: RoutePoint): Date | null {
       // Логика из getIdleTruckNotificationMessageSendDate
       return getIdleTruckNotificationMessageSendDate(this, point)
     }
   }
   ```

3. Удалить хелперы:
   ```
   domain/partner/helpers/isNeedCreateIdleTruckNotification.ts
   domain/partner/helpers/isNeedCreateIdleTruckNotificationByPoint.ts
   domain/partner/helpers/isNeedCreateIdleTruckNotificationByOrder.ts
   ```
   Логика переносится в метод `matches()`.

4. Обновить импорты во всех файлах.

**Тесты:**

```typescript
// domain/notifications/__tests__/idleTruckNotifyRule.spec.ts
describe('IdleTruckNotifyRule', () => {
  describe('matches', () => {
    it('возвращает true если адрес совпадает и правило активно', () => {
      const rule = new IdleTruckNotifyRule({
        addresses: ['addr1'],
        isActive: true,
        // ... остальные поля
      })
      const point = new RoutePoint({ address: 'addr1' })

      expect(rule.matches(order, point)).toBe(true)
    })

    it('возвращает false если правило неактивно', () => {
      const rule = new IdleTruckNotifyRule({ isActive: true })
      expect(rule.matches(order, point)).toBe(false)
    })

    it('возвращает false если адрес не совпадает', () => {
      const rule = new IdleTruckNotifyRule({ addresses: ['addr1'] })
      const point = new RoutePoint({ address: 'addr2' })
      expect(rule.matches(order, point)).toBe(false)
    })
  })

  describe('calculateSendDate', () => {
    it('usePlannedDate=true: использует plannedDate', () => {
      const rule = new IdleTruckNotifyRule({
        usePlannedDate: true,
        idleHoursBeforeNotify: 5,
      })
      const point = new RoutePoint({
        plannedDate: new Date('2024-01-01T10:00')
      })

      expect(rule.calculateSendDate(point)).toEqual(new Date('2024-01-01T15:00'))
    })

    // ... остальные кейсы из существующего теста
  })
}
```

**Критерий выхода:**
- Все старые тесты проходят (импорты обновлены)
- Новые unit тесты для `IdleTruckNotifyRule` проходят
- Интеграционные тесты из Этапа 0 проходят

---

### ЭТАП 2: Создать NotificationMatcherService

**Цель:** Убрать логику из Partner.notificationsByOrder().

**Действия:**

1. Создать сервис:
   ```typescript
   // services/notification/NotificationMatcher.service.ts
   class NotificationMatcherService {
     findMatches(
       order: Order,
       rules: IdleTruckNotifyRule[]
     ): INotificationMatch[] {
       const matches: INotificationMatch[] = []

       for (const rule of rules.filter(r => r.isActive)) {
         for (const point of order.route.activePoints) {
           if (rule.matches(order, point)) {
             matches.push({ rule, point })
           }
         }
       }

       return matches
     }
   }

   interface INotificationMatch {
     rule: IdleTruckNotifyRule
     point: RoutePoint
   }
   ```

2. Обновить Partner:
   ```typescript
   // domain/partner/partner.domain.ts
   // УБРАТЬ метод notificationsByOrder()
   ```

3. Обновить PartnerService:
   ```typescript
   // services/partner/index.ts
   private async createIdleTruckNotification(order: OrderDomain): Promise<void> {
     if (order.isInProgress || order.isCompleted) {
       const partner = await PartnerRepository.getById(order.clientId)
       const rules = partner.idleTruckNotifications

       // Было: partner.notificationsByOrder(order)
       // Стало:
       const matches = NotificationMatcherService.findMatches(order, rules)

       for (const { rule, point } of matches) {
         bus.publish(toCreateIdleTruckNotificationEvent({ order, rule, point }))
       }
     }
   }
   ```

**Тесты:**

```typescript
// services/notification/__tests__/NotificationMatcher.spec.ts
describe('NotificationMatcherService', () => {
  it('находит матчи для активных правил', () => {
    const rule = new IdleTruckNotifyRule({
      addresses: ['addr1'],
      isActive: true,
      idleHoursBeforeNotify: 2,
    })
    const point = new RoutePoint({ address: 'addr1' })
    const order = new Order({
      route: { activePoints: [point] }
    })

    const matches = NotificationMatcherService.findMatches(order, [rule])

    expect(matches).toHaveLength(1)
    expect(matches[0].rule).toEqual(rule)
    expect(matches[0].point).toEqual(point)
  })

  it('не находит матчи для неактивных правил', () => {
    const rule = new IdleTruckNotifyRule({ isActive: false })
    const matches = NotificationMatcherService.findMatches(order, [rule])
    expect(matches).toHaveLength(0)
  })

  it('проверяет все точки маршрута', () => {
    const rule = new IdleTruckNotifyRule({
      addresses: ['addr1', 'addr2'],
      isActive: true,
    })
    const order = new Order({
      route: {
        activePoints: [
          new RoutePoint({ address: 'addr1' }),
          new RoutePoint({ address: 'addr2' }),
          new RoutePoint({ address: 'addr3' }), // Не совпадает
        ]
      }
    })

    const matches = NotificationMatcherService.findMatches(order, [rule])

    expect(matches).toHaveLength(2)
  })
})
```

**Критерий выхода:**
- Unit тесты для NotificationMatcherService проходят
- Интеграционные тесты из Этапа 0 проходят

---

### ЭТАП 3: Исправить race condition

**Цель:** Атомарное создание/обновление сообщения.

**Проблема:**
```typescript
// ТАК НЕЛЬЗЯ:
const existed = await repo.getByKey(key)
if (isNeedUpdate(new, existed))
  await repo.update(new)
```

**Решение:**

1. Обновить Repository:
   ```typescript
   // repositories/notification/notification.repository.ts
   async upsertMessage(
     message: IdleTruckNotificationMessage
   ): Promise<{ created: boolean; message: IdleTruckNotificationMessage }> {
     const doc = await IdleTruckNotificationModel.findOneAndUpdate(
       { key: message.key },
       {
         $set: message,
         $setOnInsert: { createdAt: new Date() }
       },
       { upsert: true, new: true }
     ).lean()

     const wasCreated = !doc || doc.status === MESSAGE_STATUS_ENUM.canceled

     return {
       created: wasCreated,
       message: new IdleTruckNotificationMessage(doc)
     }
   }
   ```

2. Обновить NotificationService:
   ```typescript
   async createIdleTruckNotificationMessage(...) {
     const message = IdleTruckNotificationMessage.create(...)

     // Было: getByKey + isNeedUpdate + update
     // Стало:
     const result = await NotificationRepository.upsertMessage(message)

     if (result.created) {
       // Опционально: логируем создание
     }
   }
   ```

**Тесты:**

```typescript
// repositories/notification/__tests__/notification.repository.spec.ts
describe('upsertMessage', () => {
  it('создаёт новое сообщение если ключа нет', async () => {
    const message = new IdleTruckNotificationMessage({
      key: 'new-key',
      status: MESSAGE_STATUS_ENUM.created,
      // ...
    })

    const result = await repo.upsertMessage(message)

    expect(result.created).toBe(true)
  })

  it('обновляет существующее сообщение', async () => {
    const existing = await repo.upsertMessage(message)
    existing.sendDate = new Date()

    const result = await repo.upsertMessage(existing)

    expect(result.created).toBe(false)
    expect(result.message.sendDate).toEqual(existing.sendDate)
  })

  it('атомарен при параллельном создании', async () => {
    const message = new IdleTruckNotificationMessage({ key: 'same-key' })

    const results = await Promise.all([
      repo.upsertMessage(message),
      repo.upsertMessage(message),
    ])

    const docs = await IdleTruckNotificationModel.find({ key: 'same-key' })
    expect(docs).toHaveLength(1) // Только один документ в БД
  })
})
```

**Критерий выхода:**
- Unit тесты для upsert проходят
- Тест на race condition проходит
- Интеграционные тесты из Этапа 0 проходят

---

### ЭТАП 4: Разделить Repository и Scheduler

**Цель:** Разделить доступ к данным и бизнес-логику.

**Действия:**

1. Очистить NotificationRepository:
   ```typescript
   // repositories/notification/notification.repository.ts
   class NotificationRepository {
     async upsertMessage(message: IdleTruckNotificationMessage): Promise<void>
     async getByKey(key: string): Promise<IdleTruckNotificationMessage | null>
     async getByOrderId(orderId: string): Promise<IdleTruckNotificationMessage[]>
     async updateStatus(key: string, status: MESSAGE_STATUS_ENUM): Promise<void>

     // УБРАТЬ: getCreatedIdleTruckNotificationMessages()
   }
   ```

2. Создать Scheduler:
   ```typescript
   // services/notification/NotificationScheduler.ts
   class NotificationScheduler {
     async getPendingMessages(now: Date): Promise<IdleTruckNotificationMessage[]> {
       const docs = await IdleTruckNotificationModel.find({
         status: MESSAGE_STATUS_ENUM.created,
         sendDate: { $lte: now, $ne: null }
       }).lean()

       return docs.map(d => new IdleTruckNotificationMessage(d))
     }
   }
   ```

3. Обновить задачу планировщика:
   ```typescript
   // services/scheduler/tasks/sendIdleTruckNotificationMessages.ts
   export const sendIdleTruckNotificationMessages = async (date: Date) => {
     const messages = await NotificationScheduler.getPendingMessages(date)
     // ... остальная логика
   }
   ```

**Тесты:**

```typescript
// services/notification/__tests__/NotificationScheduler.spec.ts
describe('NotificationScheduler', () => {
  it('возвращает сообщения с sendDate <= now и статусом created', async () => {
    const now = new Date('2024-01-01T12:00')
    await createMessage({ sendDate: new Date('2024-01-01T11:00'), status: MESSAGE_STATUS_ENUM.created })
    await createMessage({ sendDate: new Date('2024-01-01T13:00'), status: MESSAGE_STATUS_ENUM.created })
    await createMessage({ sendDate: new Date('2024-01-01T11:00'), status: MESSAGE_STATUS_ENUM.sended })

    const messages = await NotificationScheduler.getPendingMessages(now)

    expect(messages).toHaveLength(1)
  })
})
```

**Критерий выхода:**
- Unit тесты для Scheduler проходят
- Интеграционные тесты из Этапа 0 проходят

---

### ЭТАП 5: Исправить конструктор IdleTruckNotificationMessage

**Цель:** Убрать магию со статусом.

**Проблема:**
```typescript
// КОНСТРУКТОР НЕ ДОЛЖЕН ВЫЧИСЛЯТЬ СТАТУС!
this.status = p.sendDate !== null ? p.status : MESSAGE_STATUS_ENUM.canceled
```

**Решение:**

1. Обновить класс:
   ```typescript
   // domain/notifications/idleTruckNotificationMessage.ts
   export class IdleTruckNotificationMessage {
     status: MESSAGE_STATUS_ENUM
     sendDate: Date | null

     constructor(p: IIdleTruckNotificationMessageProps) {
       this.status = p.status  // Просто присваиваем
       this.sendDate = p.sendDate
       // ...
     }

     static create(order, rule, point): IdleTruckNotificationMessage {
       const sendDate = rule.calculateSendDate(point)
       const status = point.isCompleted
         ? MESSAGE_STATUS_ENUM.canceled
         : (sendDate ? MESSAGE_STATUS_ENUM.created : MESSAGE_STATUS_ENUM.canceled)

       return new IdleTruckNotificationMessage({
         // ...
         status,
         sendDate,
       })
     }

     static canceled(order, rule, point): IdleTruckNotificationMessage {
       return new IdleTruckNotificationMessage({
         // ...
         status: MESSAGE_STATUS_ENUM.canceled,
         sendDate: null,
       })
     }
   }
   ```

**Тесты:**

```typescript
// domain/notifications/__tests__/idleTruckNotificationMessage.spec.ts
describe('IdleTruckNotificationMessage', () => {
  describe('create factory', () => {
    it('создаёт сообщение со статусом created если есть sendDate', () => {
      const point = new RoutePoint({
        plannedDate: new Date('2024-01-01'),
        isCompleted: false
      })
      const rule = new IdleTruckNotifyRule({ idleHoursBeforeNotify: 2 })

      const message = IdleTruckNotificationMessage.create(order, rule, point)

      expect(message.status).toBe(MESSAGE_STATUS_ENUM.created)
      expect(message.sendDate).toEqual(new Date('2024-01-01T02:00'))
    })

    it('создаёт сообщение со статусом canceled если точка завершена', () => {
      const point = new RoutePoint({
        plannedDate: new Date('2024-01-01'),
        isCompleted: true
      })

      const message = IdleTruckNotificationMessage.create(order, rule, point)

      expect(message.status).toBe(MESSAGE_STATUS_ENUM.canceled)
    })

    it('создаёт сообщение со статусом canceled если нет sendDate', () => {
      const point = new RoutePoint({ plannedDate: null, arrivalDate: null })

      const message = IdleTruckNotificationMessage.create(order, rule, point)

      expect(message.status).toBe(MESSAGE_STATUS_ENUM.canceled)
      expect(message.sendDate).toBeNull()
    })
  })
})
```

**Критерий выхода:**
- Unit тесты для factory методов проходят
- Интеграционные тесты из Этапа 0 проходят

---

### ЭТАП 6: Объединить события

**Цель:** Все события в одном месте.

**Действия:**

1. Создать единый файл:
   ```typescript
   // domain/notifications/domainEvents.ts
   import { createEventDefinition } from 'ts-bus'
   import { IdleTruckNotifyRule } from './idleTruckNotifyRule'
   import { RoutePoint } from '../order/route/routePoint'
   import { Order } from '../order/order.domain'
   import { IdleTruckNotificationMessage } from './idleTruckNotificationMessage'

   export enum NOTIFICATION_DOMAIN_EVENTS {
     toCreate = 'notification:toCreate',
     toSend = 'notification:toSend',
     toCancel = 'notification:toCancel',
   }

   export const toCreateNotificationMessageEvent = createEventDefinition<{
     order: Order
     rule: IdleTruckNotifyRule
     point: RoutePoint
   }>()(NOTIFICATION_DOMAIN_EVENTS.toCreate)

   export const toSendNotificationMessageEvent = createEventDefinition<{
     message: IdleTruckNotificationMessage
   }>()(NOTIFICATION_DOMAIN_EVENTS.toSend)

   export const toCancelNotificationMessagesEvent = createEventDefinition<{
     ruleId: string
   }>()(NOTIFICATION_DOMAIN_EVENTS.toCancel)
   ```

2. Удалить старые файлы:
   ```
   services/notification/events/idleTruckNotifications.ts
   domain/partner/domainEvents.ts (события уведомлений)
   ```

3. Обновить импорты везде.

**Тесты:**

```typescript
// domain/notifications/__tests__/domainEvents.spec.ts
describe('Notification domain events', () => {
  it('публикует событие создания', () => {
    const event = toCreateNotificationMessageEvent({
      order: mockOrder,
      rule: mockRule,
      point: mockPoint
    })

    expect(event.type).toBe(NOTIFICATION_DOMAIN_EVENTS.toCreate)
  })

  it('подписчики получают событие', (done) => {
    bus.subscribe(toCreateNotificationMessageEvent, ({ payload }) => {
      expect(payload.order).toBeDefined()
      expect(payload.rule).toBeDefined()
      expect(payload.point).toBeDefined()
      done()
    })

    bus.publish(toCreateNotificationMessageEvent({ ... }))
  })
})
```

**Критерий выхода:**
- Unit тесты для событий проходят
- Интеграционные тесты из Этапа 0 проходят

---

## Итоговая структура

```
domain/
├── notifications/
│   ├── idleTruckNotifyRule.ts         # Бывший idleTruckNotification
│   ├── idleTruckNotificationMessage.ts
│   ├── domainEvents.ts                # Все события в одном месте
│   ├── interfaces.ts
│   └── __tests__/
│       ├── idleTruckNotifyRule.spec.ts
│       ├── idleTruckNotificationMessage.spec.ts
│       └── domainEvents.spec.ts
└── order/
    └── ...

services/
├── notification/
│   ├── NotificationMatcher.service.ts # Бывшая логика из Partner
│   ├── NotificationScheduler.ts       # Бывшая логика из Repository
│   ├── notification.service.ts
│   └── __tests__/
│       ├── NotificationMatcher.spec.ts
│       ├── NotificationScheduler.spec.ts
│       └── idleTruckNotification.flow.spec.ts
└── scheduler/tasks/
    └── sendIdleTruckNotificationMessages.ts

repositories/
└── notification/
    └── notification.repository.ts     # Только CRUD
```

---

## Проверка перед каждым этапом

1. Запустить интеграционные тесты из Этапа 0
2. Убедиться что все проходят
3. Выполнить изменения этапа
4. Запустить все тесты
5. Если что-то сломалось — откатить изменения и исправить

```bash
npm test -- idleTruckNotification.flow.spec.ts
```

---

## Чек-лист завершения

- [ ] Все интеграционные тесты из Этапа 0 проходят
- [ ] Все unit тесты для новых классов проходят
- [ ] Нет дублирования кода
- [ ] События в одном файле
- [ ] Repository не содержит бизнес-логики
- [ ] Нет race conditions
- [ ] Конструкторы не содержат магии
- [ ] Partner не зависит от структуры Order
- [ ] Все импорты обновлены
- [ ] Документация обновлена
