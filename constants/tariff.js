const types = [
  { value: 'points', text: 'Адреса (!?)', disabled: false },
  { value: 'waiting', text: 'Простой', disabled: true },
  { value: 'additionalPoints', text: 'Дополнительные точки', disabled: false },
  { value: 'return', text: 'Возврат', disabled: true },
]

export const TARIFF_TYPES = types
export const TARIFF_TYPES_ENUM = types.map((i) => i.value)
