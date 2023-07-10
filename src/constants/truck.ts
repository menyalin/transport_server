// Типы транспорта
export const TRUCK_LIFT_CAPACITY_TYPES = [20, 10, 5, 3.5, 1.5]

export enum TRUCK_TYPES_ENUM {
  truck = 'truck',
  trailer = 'trailer',
}
export const TRUCK_TYPES_ENUM_VALUES = Object.values(TRUCK_TYPES_ENUM)
export const TRUCK_TYPES = [
  { value: TRUCK_TYPES_ENUM.truck, text: 'Грузовик' },
  { value: TRUCK_TYPES_ENUM.trailer, text: 'Прицеп' },
]

// Виды транспорта
export enum TRUCK_KINDS_ENUM {
  refPodves = 'refPodves',
  refD = 'refD',
  ref = 'ref',
  isoterm = 'isoterm',
  tent = 'tent',
}
export const TRUCK_KINDS_ENUM_VALUES = Object.values(TRUCK_KINDS_ENUM)
export const TRUCK_KINDS = [
  { value: TRUCK_KINDS_ENUM.refPodves, text: 'Реф - Подвес' },
  { value: TRUCK_KINDS_ENUM.refD, text: 'Реф - 2 яруса' },
  { value: TRUCK_KINDS_ENUM.ref, text: 'Реф' },
  { value: TRUCK_KINDS_ENUM.isoterm, text: 'Изотерм' },
  { value: TRUCK_KINDS_ENUM.tent, text: 'Тент' },
]

// Тип погрузки
export enum LOAD_DIRECTION_ENUM {
  rear = 'rear',
  side = 'side',
  top = 'top',
}
export const LOAD_DIRECTION_ENUM_VALUES = Object.values(LOAD_DIRECTION_ENUM)
export const LOAD_DIRECTION = [
  { value: LOAD_DIRECTION_ENUM.rear, text: 'Задняя' },
  { value: LOAD_DIRECTION_ENUM.side, text: 'Боковая' },
  { value: LOAD_DIRECTION_ENUM.top, text: 'Верхняя' },
]
