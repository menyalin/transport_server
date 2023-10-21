import { POINT_TYPES_ENUM } from '../../../constants/enums'
import { RoutePoint } from '../../../values/order/routePoint'

export const getCurrentPointStatusString = (point: RoutePoint): string => {
  if (!point.isStarted) return ''
  if (point.type === POINT_TYPES_ENUM.loading && !point.waitsForWaybills)
    return 'Не загружен'
  if (point.type === POINT_TYPES_ENUM.loading && point.waitsForWaybills)
    return 'Загружен, ожидает документы'
  if (point.type === POINT_TYPES_ENUM.unloading && !point.waitsForWaybills)
    return 'Не выгружен'
  if (point.type === POINT_TYPES_ENUM.unloading && point.waitsForWaybills)
    return 'Выгружен, ожидает документы'
  return ''
}
