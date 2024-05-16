export enum TARIFF_TYPES_ENUM {
  points = 'points',
  zones = 'zones',
  directDistanceZones = 'directDistanceZones',
  waiting = 'waiting',
  additionalPoints = 'additionalPoints',
  return = 'return',
  // waitingOnReturn = 'waitingOnReturn',
}
export const TARIFF_TYPES_ENUM_VALUES = Object.values(TARIFF_TYPES_ENUM)

const types = [
  {
    value: TARIFF_TYPES_ENUM.points,
    text: 'Маршрут, адреса',
    disabled: false,
    tariffType: 'base',
  },
  {
    value: TARIFF_TYPES_ENUM.zones,
    text: 'Маршрут, зоны',
    disabled: false,
    tariffType: 'base',
  },
  {
    value: TARIFF_TYPES_ENUM.directDistanceZones,
    text: 'Зоны, по линейке',
    disabled: false,
    tariffType: 'base',
  },
  { value: TARIFF_TYPES_ENUM.waiting, text: 'Простой', disabled: false },
  {
    value: TARIFF_TYPES_ENUM.additionalPoints,
    text: 'Дополнительные точки',
    disabled: false,
  },
  { value: TARIFF_TYPES_ENUM.return, text: 'Возврат', disabled: false },
]

export enum IdleTimeRoundingIntervalEnum {
  Minute = 'minute',
  HalfHour = 'halfHour',
  Hour = 'hour',
  TwelveHours = 'twelveHours',
  Day = 'day',
}

const roundingIntervals = [
  {
    value: IdleTimeRoundingIntervalEnum.Minute,
    text: '1 минута',
    disabled: false,
  },
  {
    value: IdleTimeRoundingIntervalEnum.HalfHour,
    text: '30 минут',
    disabled: false,
  },
  { value: IdleTimeRoundingIntervalEnum.Hour, text: '1 час', disabled: false },
  {
    value: IdleTimeRoundingIntervalEnum.TwelveHours,
    text: '12 часов',
    disabled: false,
  },
  { value: IdleTimeRoundingIntervalEnum.Day, text: '24 часа', disabled: false },
]

export const IDLE_TIME_ROUNDING_INTERVALS = roundingIntervals

export const BASE_PRICE_TARIFF_TYPES = types
  .filter((t) => t.tariffType === 'base')
  .map((i) => i.value)

export const TARIFF_TYPES = types

export enum WAITING_TARIFF_BY {
  day = 'day',
  hour = 'hour',
}

// TODO: Удалить после перехода на новые тарифы
const roundByHours = [
  { value: 0.01666666, text: '1 минута', disabled: false },
  { value: 0.5, text: '30 минут', disabled: false },
  { value: 1, text: '1 час', disabled: false },
  { value: 12, text: '12 часов', disabled: false },
  { value: 24, text: '24 часа', disabled: false },
]
export const TARIFF_ROUND_BY_HOURS = roundByHours
export const TARIFF_ROUND_BY_HOURS_ENUM = roundByHours.map((i) => i.value)
