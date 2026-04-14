import { Order } from '@/domain/order/order.domain'
import { Partner } from '@/domain/partner'
import { TransportWaybill, TnDataDTO } from '@/domain/transportWaybill'
import { Vehicle } from '@/domain/vehicle'
import { BadRequestError } from '@/helpers/errors'

import {
  AddressRepository,
  AgreementRepository,
  CarrierRepository,
  DriverRepository,
  OrderRepository,
  PartnerRepository,
  VehicleRepository,
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

  if (!order.clientAgreementId)
    throw new BadRequestError('в рейсе отсутствует соглашение с клиентом')

  if (!order.confirmedCrew.truck)
    throw new BadRequestError('в рейсе отсутствует грузовик')

  const client: Partner = await PartnerRepository.getById(order.clientId)

  if (!client) throw new BadRequestError('client not found')

  const clientAgreement = await AgreementRepository.getById(
    order.clientAgreementId
  )
  if (!clientAgreement?.executor)
    throw new BadRequestError('в соглашении с клиентом отсутсвует исполнитель')

  const carrier = await CarrierRepository.getById(clientAgreement.executor)
  if (!carrier)
    throw new BadRequestError('Указанный в соглашении перевозчик не найден')

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

  const truck = await VehicleRepository.getById(
    order.confirmedCrew.truck.toString()
  )
  if (!truck) throw new BadRequestError('Грузовик, указанный в рейсе не найден')
  let trailer: Vehicle | null = null

  if (order.confirmedCrew.trailer)
    trailer = await VehicleRepository.getById(
      order.confirmedCrew.trailer.toString()
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
      name: carrier.companyInfo?.fullName || carrier.name,
      address: carrier.companyInfo?.legalAddress || '',
      inn: carrier.companyInfo?.inn || '',
    },
    vehicle: {
      model: truck?.model || '',
      truckNum: truck.regNum,
      trailerNum: trailer?.regNum,
    },
  }
}
