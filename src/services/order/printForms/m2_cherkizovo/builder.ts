import { Order } from '@/domain/order/order.domain'
import { IM2Cherkizovo } from './interfaces'
import { PrintFormsService } from '@/services'
import { IOrderPrintFormBuilder } from '../interfaces'

export const m2CherkizovoBuilder: IOrderPrintFormBuilder = async (
  order: Order
) => {
  if (!order) throw Error('order is undefined')

  const data: IM2Cherkizovo = {
    num: 'М2-123456',
    issueDate: '07.05.2026',
    expiredAtDate: '07.06.2026',
    person: {
      name: 'Иванов Иван Иванович',
      position: 'водитель',
    },
    truckInfo: 'А123БВ777 | Volvo FH16',
    shipper: {
      name: 'ООО "Черкизово"',
      contract: '№ 123/2024 от 15.01.2024',
    },
    recipient: {
      position: 'уполномоченный представитель',
      fullName: 'Петров Петр Петрович',
      passportSeria: '45 12',
      passportNumber: '345678',
      passportIssuer: 'УВД г. Москва',
      passportIssueDate: '10.03.2020',
    },
    company: {
      fullData: 'ООО "Транспорт-Логистик" ИНН 7701234567 КПП 770101001',
      fullName: 'ООО "Транспорт-Логистик"',
      inn: '7701234567',
      kpp: '770101001',
      bankAccountInfo:
        'р/с 40702810200000012345 в ПАО СБЕРБАНК г. Москва БИК 044525225',
      address: 'г. Москва, ул. Ленина, д. 1, офис 101',
      isLegalEntity: true,
      directorName: 'Сидоров Сидор Сидорович',
      accountantName: 'Кузнецова Мария Петровна',
    },
    goods: [
      { good: 'Мясо куриное охлажденное', measure: 'кг', amount: '5000' },
      { good: 'Продукты полуфабрикаты', measure: 'кг', amount: '3000' },
      { good: 'Колбаса вареная', measure: 'кг', amount: '2000' },
    ],
  }

  return {
    filename: 'm2.pdf',
    buffer: await PrintFormsService.generatePdf('m2_cherkizovo', data),
    filetype: 'pdf',
  }
}
