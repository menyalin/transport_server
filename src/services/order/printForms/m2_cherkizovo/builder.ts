import { Order } from '@/domain/order/order.domain'
import { IM2Cherkizovo } from './interfaces'
import { PrintFormsService } from '@/services'
import { IOrderPrintFormBuilder } from '../interfaces'
import { sanitizeFilename } from '@/utils/sanitizeFilename'
import dayjs from 'dayjs'
import { BadRequestError } from '@/helpers/errors'
import { AddressRepository, AgreementRepository, CarrierRepository, DriverRepository, PartnerRepository, VehicleRepository } from '@/repositories'
import { Vehicle } from '@/domain/vehicle'

export const m2CherkizovoBuilder: IOrderPrintFormBuilder = async (
  order: Order
) => {
  if (!order) throw Error('order is undefined')
  const dateFormat = 'DD.MM.YYYY'
  if (!order.clientId || !order.clientAgreementId) 
    throw new BadRequestError('В рейсе отсутствует клиент или соглашение с клиентом')
  
  if (!order.confirmedCrew?.driver)
    throw new BadRequestError('В рейсе не указан водитель')

  if (!order.confirmedCrew.truck)
    throw new BadRequestError('В рейсе не указан грузовик')

  const driver = await DriverRepository.getById(
    order.confirmedCrew.driver.toString()
  )
  if (!driver) throw new BadRequestError('Водитель не найден')
  const client = await PartnerRepository.getById(order.clientId)
  if (!client) throw new BadRequestError('Клиент не найден')
  const clientAgreement = await AgreementRepository.getById(order.clientAgreementId)
  if (!clientAgreement) throw new BadRequestError('Соглашение с клиентом не найдено')
  if (!clientAgreement.executor) 
    throw new BadRequestError('В соглашении с клиентом не указан исполнитель')
  
  const carrier = await CarrierRepository.getById(clientAgreement.executor)
  if (!carrier) throw new BadRequestError('Перевозчик не найден')
  if (!carrier.companyInfo?.legalForm) throw new BadRequestError('Перевозчик не указан тип (ИП, Юр.лицо)')
  
    const truck = await VehicleRepository.getById(    order.confirmedCrew.truck.toString()  )
  
  if (!truck) throw new BadRequestError('Грузовик не найден')
  
    let trailer: Vehicle | null = null
  
  if (order.confirmedCrew?.trailer)
    trailer = await VehicleRepository.getById(order.confirmedCrew.trailer.toString())

  const carrierName = carrier.companyInfo?.fullName || carrier.name

  const loadingAddress = await AddressRepository.getById(order.route.mainLoadingPoint.address)


  const data: IM2Cherkizovo = {
    num: 'Б/Н',
    issueDate: dayjs(order.orderDate).format(dateFormat),
    expiredAtDate: dayjs(order.orderDate).add(9, 'day').format(dateFormat),

    truckInfo:  ((truck.brand ? truck.brand : '') + ' ' + truck.regNum + (trailer ? ` ПП ${trailer?.regNum}` : '')).trim(),

    shipper: {
      name: client.fullName || client.name,
      contract: clientAgreement.contract || '',
    },

    recipient: {
      position: 'водитель',
      fullName: driver.fullName,
      passportSeria: driver.passportSeria,
      passportNumber: driver.passportNumber,
      passportIssuer: driver.passportIssued || ' ',
      passportIssueDate: driver.passportDate
        ? dayjs(driver.passportDate).format(dateFormat)
        : '',
    },
    company: {
      fullData: carrierName + ' ИНН ' + (carrier.companyInfo?.inn || '') + ' КПП ' + (carrier.companyInfo?.kpp || '') + carrier.companyInfo?.legalAddress || '',
      fullName: carrierName,
      inn: carrier.companyInfo?.inn || '',
      kpp: carrier.companyInfo?.kpp || '',
      okpo: carrier.companyInfo?.okpo || '',
      bankAccountInfo:
        carrier.bankAccountInfo?.getFullDataString() || '', 
      address: carrier.companyInfo?.legalAddress || '',
      isLegalEntity: carrier.companyInfo.isLegalEntity,
      directorName: carrier.companyInfo.director?.name || '',
      accountantName: carrier.companyInfo.accountant?.name || carrier.companyInfo.director?.name || '',
    },

    goods: [
      {
        good: 'Получение и транспортировка ТМЦ',
        measure: 'кг',
        amount: 'Без ограничений',
      },
    ],
  }

  // Наименование: Дата погрузки (день, месяц, год) + Сокращенный маршрут (Тамбов-Э Радумля) + ФИО водителя
  const orderDateStr = dayjs(order.orderDate).format('DD_MM_YYYY')
  const loadingAddressStr = loadingAddress?.shortName || ''
  const driverStr = driver.surname 
  return {
    filename: sanitizeFilename(`Доверенность от ${orderDateStr} ${loadingAddressStr} ${driverStr}.pdf`),
    buffer: await PrintFormsService.generatePdf('m2_cherkizovo', data),
    filetype: 'application/pdf',
  }
}
