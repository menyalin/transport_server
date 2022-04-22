const types = [
  { value: 'points', text: 'Маршрут', disabled: false },
  { value: 'directDistanceZones', text: 'Зоны, по линейке', disabled: false },
  { value: 'waiting', text: 'Простой', disabled: false },
  { value: 'additionalPoints', text: 'Дополнительные точки', disabled: false },
  { value: 'return', text: 'Возврат', disabled: false },
]

const roundByHours = [
  { value: 0.5, text: '30 минут', disabled: false },
  { value: 1, text: '1 час', disabled: false },
  { value: 12, text: '12 часов', disabled: false },
  { value: 24, text: '24 часа', disabled: false },
]

export const TARIFF_TYPES = types
export const TARIFF_TYPES_ENUM = types.map((i) => i.value)

export const TARIFF_ROUND_BY_HOURS = roundByHours
export const TARIFF_ROUND_BY_HOURS_ENUM = roundByHours.map((i) => i.value)
