export enum ORDER_PRICE_TYPES_ENUM {
  base = 'base',
  additionalPoints = 'additionalPoints',
  loadingDowntime = 'loadingDowntime',
  unloadingDowntime = 'unloadingDowntime',
  returnDowntime = 'returnDowntime',
  return = 'return',
  other = 'other',
}

const types = [
  {
    value: ORDER_PRICE_TYPES_ENUM.base,
    text: 'Тариф',
  },
  {
    value: ORDER_PRICE_TYPES_ENUM.additionalPoints,
    text: 'Дополнительные точки',
  },
  {
    value: ORDER_PRICE_TYPES_ENUM.loadingDowntime,
    text: 'Простой на погрузке',
  },
  {
    value: ORDER_PRICE_TYPES_ENUM.unloadingDowntime,
    text: 'Простой на выгрузке',
  },
  {
    value: ORDER_PRICE_TYPES_ENUM.returnDowntime,
    text: 'Простой при возврате',
    disabled: true,
  },
  {
    value: ORDER_PRICE_TYPES_ENUM.return,
    text: 'Возврат продукции',
  },
  {
    value: ORDER_PRICE_TYPES_ENUM.other,
    text: 'Прочее',
  },
]

export const ORDER_PRICE_TYPES = types
export const ORDER_PRICE_TYPES_ENUM_VALUES = types.map((m) => m.value)
