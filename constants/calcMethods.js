const calcMethods = [
  {
    value: 'fixed',
    text: 'Фиксированная ставка',
    description: 'Цена определяется на основании аукциона или заявки'
  },
  {
    value: 'matrix',
    text: 'Матрица значений',
    description: 'Цена устанавливается для маршрута и типа транспорта'
  },
  {
    value: 'distanceZones',
    text: 'Интервалы расстояний (зоны)',
    description: 'Цена определяется по зоне дальней точки в маршруте'
  }
]

export const CALC_METHODS = calcMethods
export const CALC_METHODS_ENUM = calcMethods.map((m) => m.value)
