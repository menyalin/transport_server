import { TotalPrice } from '@/domain/commonInterfaces'
import { FullOrderDataDTO } from '@/domain/order/dto/fullOrderData.dto'
import { IMainTableRowFragmentProps } from './interfaces'
import { moneyFormatter } from '@/utils/moneyFormatter'

export const mainTableRowBuilder = (
  orderData: FullOrderDataDTO,
  totalPrice: TotalPrice
): IMainTableRowFragmentProps => {
  const rowPrefix = 'Транспортные услуги по маршруту'
  const routeAdresses: string = orderData.fullAddressesRouteString

  return {
    title: `${rowPrefix} ${routeAdresses}; водитель ${orderData.shortDriverName} а/м ${orderData.truckBrand} ${orderData.truckNum} ${orderData.plannedDate.slice(0, 10)}`,
    measurementUnit: 'шт.',
    count: '1',
    price: moneyFormatter(totalPrice.price),
    sum: moneyFormatter(totalPrice.price),
  }
}
