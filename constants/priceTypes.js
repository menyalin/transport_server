const types = [
  {
    value: 'base',
    text: 'Тариф',
  },
  {
    value: 'loadingDowntime',
    text: 'Простой на погрузке',
  },
  {
    value: 'unloadingDowntime',
    text: 'Простой на выгрузке',
  },
  {
    value: 'return',
    text: 'Возврат продукции',
  },
]

export const ORDER_PRICE_TYPES = types
export const ORDER_PRICE_TYPES_ENUM = types.map((m) => m.value)
