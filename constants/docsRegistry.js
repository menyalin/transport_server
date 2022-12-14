const statuses = [
  { text: 'Подготовка', value: 'inProcess' },
  { text: 'Готов к отправке', value: 'prepared' },
  { text: 'Отправлен', value: 'sended' },
  { text: 'Принят', value: 'accepted' },
]

export const DOCS_REGISTRY_STATUSES = statuses
export const DOCS_REGISTRY_STATUSES_ENUM = statuses.map((i) => i.value)
