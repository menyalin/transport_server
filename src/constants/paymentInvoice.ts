// @ts-nocheck
const statuses = [
  { text: 'Подготовка', value: 'inProcess' },
  { text: 'Готов к отправке', value: 'prepared' },
  { text: 'Отправлен', value: 'sended' },
  { text: 'Принят', value: 'accepted' },
]
export enum PAIMENT_INVOICE_STATUSES_ENUM {
  inProcess = 'inProcess',
  prepared = 'prepared',
  sended = 'sended',
  accepted = 'accepted',
}

export const PAIMENT_INVOICE_STATUSES = statuses
export const PAIMENT_INVOICE_STATUSES_ENUM_VALUES = statuses.map((i) => i.value)
