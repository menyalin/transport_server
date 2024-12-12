import { numbering, styles } from '@/shared/printForms'
import { Packer, Document } from 'docx'
import { driverInfo } from './fragments/driverInfo'
import { paymentInfo } from './fragments/paymentInfo'
import { noteInfo } from './fragments/noteInfo'
import { signatoriesInfo } from './fragments/signatoriesInfo'
import { routeInfo } from './fragments/route/routeInfo'
import { cargoInfo } from './fragments/cargoInfo'
import { headerInfo } from './fragments/headerInfo'
import { ICommonOrderContractProps } from './interfaces'
import { Order } from '@/domain/order/order.domain'
import {
  AgreementRepository,
  CarrierRepository,
  OrderRepository,
  PartnerRepository,
  DriverRepository,
  VehicleRepository,
  CompanyRepository,
} from '@/repositories'
import { BadRequestError } from '@/helpers/errors'

export const commonOrderContractBuilder = async (
  order: Order
): Promise<Buffer> => {
  const carrierId = order.confirmedCrew.tkName
    ? order.confirmedCrew.tkName.toString()
    : null
  const driverId = order.confirmedCrew?.driver
    ? order.confirmedCrew.driver.toString()
    : null

  if (!driverId) throw new BadRequestError('Водитель не определен')

  if (!carrierId) throw new BadRequestError('Перевозчик не определен')
  const carrierAgreementId = order.confirmedCrew.outsourceAgreement
    ? order?.confirmedCrew?.outsourceAgreement.toString()
    : null
  const clientAgreementId = order.client.agreement
    ? order.client.agreement
    : null
  if (!carrierAgreementId || !clientAgreementId)
    throw new BadRequestError('Соглашение не найдено')
  const carrier = await CarrierRepository.getById(carrierId)
  if (!carrier) throw new BadRequestError('Перевозчик не найден')
  const clientAgreement = await AgreementRepository.getById(
    clientAgreementId.toString()
  )
  if (!clientAgreement)
    throw new BadRequestError('Соглашение с клиентом не найдено')
  if (!clientAgreement.executor)
    throw new BadRequestError('Основной исполнитель не указан')

  const customer = await CarrierRepository.getById(clientAgreement.executor)
  if (!customer) throw new BadRequestError('Заказчик не найден')
  const shipper = await PartnerRepository.getById(order.client.client)
  const routePFData = await OrderRepository.getRoutePointPFData(order)
  if (!routePFData) throw new BadRequestError('Маршрут не определен')

  const driver = await DriverRepository.getById(driverId)
  if (!driver) throw new BadRequestError('Водитель не найден')

  const truck = order.confirmedCrew.truck
    ? await VehicleRepository.getById(order.confirmedCrew.truck?.toString())
    : null

  const trailer = order.confirmedCrew?.trailer
    ? await VehicleRepository.getById(order.confirmedCrew.trailer.toString())
    : null

  const carrierAgreement = await AgreementRepository.getById(
    carrierAgreementId.toString()
  )
  const companySettings = await CompanyRepository.getCompanySettings(
    order.company
  )

  const data: ICommonOrderContractProps = {
    headerInfo: {
      num: order.client.num || 'б/н',
      date: order.orderDate.toLocaleDateString('ru-Ru'),
      customer: customer?.companyInfo?.fullName || 'empty',
      carrier: carrier?.companyInfo?.fullName || 'empty',
    },
    cargoInfo: {
      description:
        order.cargoParams?.description ||
        shipper?.cargoDescription ||
        'Не указан',
      weight: order.cargoParams.weight,
      plt: order.cargoParams.plt,
      volume: order.cargoParams.volume,
      note: order.cargoParams.note,
      tRegime: order.cargoParams.tRegime,
      truckType: order.reqTransport?.truckTypeDescription,
    },
    driverInfo: {
      fullName: driver.fullName,
      passport: driver.passportInfo,
      phone: [driver.phone, driver.phone2].join(' ').trim(),
      tsRegNum:
        (truck?.regNum ? `${truck.regNum}` : '') +
        (trailer?.regNum ? `, ${trailer.regNum}` : ''),
    },
    paymentInfo: {
      paymentSum: order.totalOutsourceCosts.price,
      paymentDescription: carrierAgreement?.paymentDescription || '',
    },
    notes:
      companySettings?.commonOrderContractNote.split('\n').filter(Boolean) ||
      null,
    route: routePFData,
    customer: customer?.getPFdata,
    carrier: carrier?.getPFdata,
  }

  const doc = new Document({
    numbering: numbering.mainNumbering(),
    styles: {
      default: {
        ...styles.defaultDocStyles,
        document: { run: { size: '8pt', font: 'Times New Roman' } },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 500,
              left: 600,
              right: 500,
              bottom: 500,
            },
          },
        },
        children: [
          ...headerInfo(data.headerInfo),
          cargoInfo(data.cargoInfo),
          routeInfo(data.route),
          driverInfo(data.driverInfo),
          paymentInfo(data.paymentInfo),
          ...noteInfo(data.notes),
          ...signatoriesInfo(data.customer, data.carrier),
        ],
      },
    ],
  })
  return await Packer.toBuffer(doc)
}
