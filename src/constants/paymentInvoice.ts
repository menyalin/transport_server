// @ts-nocheck
const statuses = [
  { text: 'Подготовка', value: 'inProcess' },
  { text: 'Готов к отправке', value: 'prepared' },
  { text: 'Отправлен', value: 'sended' },
  { text: 'Принят', value: 'accepted' },
]

export const PAIMENT_INVOICE_STATUSES = statuses
export const PAIMENT_INVOICE_STATUSES_ENUM = statuses.map((i) => i.value)
