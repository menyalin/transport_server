const types = [
  { value: 'truck', text: 'Грузовик' },
  { value: 'trailer', text: 'Прицеп' },
]
const kinds = [
  { value: 'refD', text: 'Реф - 2 яруса' },
  { value: 'ref', text: 'Реф' },
  { value: 'isoterm', text: 'Изотерм' },
  { value: 'tent', text: 'Тент' },
]
const loadDirection = [
  { value: 'rear', text: 'Задняя' },
  { value: 'side', text: 'Боковая' },
  { value: 'top', text: 'Верхняя' },
]

export const TRUCK_LIFT_CAPACITY_TYPES = [20, 10, 5, 3.5, 1.5]

export const TRUCK_KINDS = kinds
export const TRUCK_KINDS_ENUM = kinds.map((i) => i.value)

export const TRUCK_TYPES = types
export const TRUCK_TYPES_ENUM = types.map((i) => i.value)

export const LOAD_DIRECTION = loadDirection
export const LOAD_DIRECTION_ENUM = loadDirection.map((i) => i.value)
