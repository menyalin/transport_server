# API создания PDF файлов

## Обзор

Сервис `printFormsService` предоставляет API для генерации PDF документов из HTML-шаблонов.

## Эндпоинт генерации PDF

### POST `{API_PREFIX}/pdf/{templateName}`

Генерирует PDF файл на основе указанного шаблона и переданных данных.

### Параметры пути

| Параметр     | Тип   | Обязательный | Описание                           |
|--------------|--------|--------------|-------------------------------------|
| templateName | string | Да          | Имя шаблона (например: `tn`, `invoice`) |

### Тело запроса

JSON-объект с данными для заполнения шаблона.

#### Общие поля

| Поле  | Тип   | Обязательный | Описание          |
|--------|--------|--------------|-------------------|
| number | string | Нет          | Номер документа   |
| date   | string | Нет          | Дата документа    |
| *      | any    | Нет          | Другие поля согласно шаблону |

### Пример запроса (TypeScript)

```typescript
interface PdfRequest {
  number?: string
  date?: string
  [key: string]: unknown
}

async function generatePdf<T = PdfRequest>(
  templateName: string,
  data: T
): Promise<Blob> {
  const response = await fetch(`${API_URL}/pdf/${templateName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to generate PDF')
  }

  return await response.blob()
}

// Использование
const pdfBlob = await generatePdf('tn', {
  number: 'ТН-001',
  date: new Date().toLocaleDateString('ru-RU'),
})

// Открытие PDF в новой вкладке
const pdfUrl = URL.createObjectURL(pdfBlob)
window.open(pdfUrl, '_blank')

// Или скачивание
const a = document.createElement('a')
a.href = pdfUrl
a.download = 'document.pdf'
a.click()
```

### Ответ

#### Успешный ответ

PDF файл с заголовками:

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="{templateName}.pdf"
```

#### Ошибка (400-500)

```typescript
interface ErrorResponse {
  error: string
  message: string
  stack?: string
}
```

## Доступные шаблоны

| Имя шаблона | Описание              |
|---------------|-----------------------|
| `tn`          | Транспортная накладная  |

## Примечания

- Параметр `API_PREFIX` настраивается через переменную окружения `API_PREFIX`
- При отсутствии обязательных полей шаблон будет заполнен пустыми значениями
- PDF генерируется в формате A4 с учётом CSS стилей печати
- Фоновые цвета и изображения включаются в PDF
