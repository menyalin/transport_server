const types = [
  { value: 'city', text: 'Город' },
  { value: 'region', text: 'Регион' },
]

const statuses = [
  { value: 'needGet', text: 'Надо получить' },
  { value: 'getted', text: 'Получен' },
  { value: 'inProgress', text: 'В работе' },
  { value: 'completed', text: 'Выполнен' },
  { value: 'weRefused', text: 'Мы отказались' },
  { value: 'clientRefused', text: 'Клиент снял заказ' },
  { value: 'notСonfirmedByClient', text: 'Клиент не подтвердил заказ' },
]

export const ORDER_STATUSES_ENUM = statuses.map((item) => item.value)
export const ORDER_STATUSES = statuses

export const ORDER_ANALYTIC_TYPES_ENUM = types.map((item) => item.value)
export const ORDER_ANALYTIC_TYPES = types
