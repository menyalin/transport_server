import { Order } from '@/domain/order/order.domain'
import { Partner } from '@/domain/partner'
import { TransportWaybill, TnDataDTO } from '@/domain/transportWaybill'
import { BadRequestError } from '@/helpers/errors'
import {
  AddressRepository,
  DriverRepository,
  OrderRepository,
  PartnerRepository,
} from '@/repositories'

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export const dataBuilder = async (
  waybill: TransportWaybill
): Promise<TnDataDTO> => {
  const order: Order = await OrderRepository.getById(waybill.orderId)
  if (!order) throw new BadRequestError('order not found')
  if (!order.confirmedCrew?.driver)
    throw new BadRequestError('в рейсе отсутствует водитель')

  const client: Partner = await PartnerRepository.getById(order.clientId)
  if (!client) throw new BadRequestError('client not found')

  const loadingAddress = await AddressRepository.getById(
    waybill.shipperAddressId
  )
  const unloadingAddress = await AddressRepository.getById(
    waybill.consigneeAddressId
  )
  if (!loadingAddress || !unloadingAddress)
    throw new BadRequestError('invalid address ids')

  if (!unloadingAddress.partner)
    throw new BadRequestError('у адреса выгрузке не указан партнер ')

  const consignee = await PartnerRepository.getById(
    unloadingAddress.partner.toString()
  )
  const driver = await DriverRepository.getById(
    order.confirmedCrew.driver.toString()
  )

  return {
    num: waybill.number,
    date: formatDate(waybill.date),
    orderNum: order.client.num || '',
    orderDate: formatDate(order.orderDate),
    docsDescription: waybill.docsDescription,
    cargoDescription: client.cargoDescription || '',
    shipper: {
      name: client.companyInfo?.fullName || client.name || '',
      inn: client.companyInfo?.inn || '',
      address: client.companyInfo?.legalAddress || '',
      loadingAddress: (loadingAddress.name || '') as string,
    },
    consignee: {
      name: consignee.companyInfo?.fullName || consignee.name || '',
      inn: consignee.companyInfo?.inn || '',
      address: consignee.companyInfo?.legalAddress || '',
      unloadingAddress: unloadingAddress.name?.toString() || '',
    },
    driver: {
      name: driver?.fullName || '',
    },
    carrier: {
      name: '',
      address: '',
      inn: '',
    },
    vehicle: {
      model: '',
      truckNum: '',
      trailerNum: '',
    },
  }
}
