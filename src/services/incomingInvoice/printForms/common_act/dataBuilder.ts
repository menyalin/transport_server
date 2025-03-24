import { BadRequestError } from '@/helpers/errors'
import { ICommonActIncomingInvoiceData } from './interfaces'
import { IncomingInvoiceRepository } from '@/repositories'
import { moneyFormatter } from '@/utils/moneyFormatter'

export const incomingInvoiceDataBuilder = async (
  invoiceId: string
): Promise<ICommonActIncomingInvoiceData> => {
  const invoice = await IncomingInvoiceRepository.getById(invoiceId)
  if (!invoice) throw new BadRequestError('Invoice not found')

  return {
    signatories: {},
    titleData: {
      number: invoice.number,
      date: invoice.date,
    },
    headerTable: {
      executor:
        'ООО "ТЭК "СТГ", ИНН 9717069235, 129164, Город Москва, ул Маломосковская, д. 21, к. 4, кв. 162, тел.: +7 (915) 4117121, р/с 40702810200000188998, в банке БАНК ГПБ (АО), БИК 044525823, к/с 30101810200000000823',
      customer:
        'ООО "АЛЬТ-ПАК", ИНН 5029096223, 141007, Московская область, г. Мытищи, ул. Хлебозаводская, владение 4А, строение 1, офис 301-327',
      basis: 'Основной договор',
    },
    mainTable: {
      rows: [
        {
          title:
            'Транспортные услуги по маршруту  МО г.Мытищи,ул.Хлебозаводская,влд.4А,стр.1  - г.Москва,км МКАД 43-й,терминал Е,ворота 70; водитель Калинин Д.И.   а/м маз  у927ум190   07.03.2025г.',
          count: '1',
          measurementUnit: 'шт',
          price: moneyFormatter(19000),
          sum: moneyFormatter(19000),
        },
        {
          title:
            'Транспортные услуги по маршруту  МО г.Мытищи,ул.Хлебозаводская,влд.4А,стр.1  - г.Москва,км МКАД 43-й,терминал Е,ворота 70; водитель Калинин Д.И.   а/м маз  у927ум190   07.03.2025г.',
          count: '1',
          measurementUnit: 'шт',
          price: moneyFormatter(19000),
          sum: moneyFormatter(19000),
        },
        {
          title:
            'Транспортные услуги по маршруту  МО г.Мытищи,ул.Хлебозаводская,влд.4А,стр.1  - г.Москва,км МКАД 43-й,терминал Е,ворота 70; водитель Калинин Д.И.   а/м маз  у927ум190   07.03.2025г.',
          count: '1',
          measurementUnit: 'шт',
          price: moneyFormatter(19000),
          sum: moneyFormatter(19000),
        },
      ],
    },
    resultTable: {
      priceWithVat: 19000,
      priceWOVat: 17000,
      ordersCount: 1,
      vatRate: 20,
    },
    description:
      'Вышеперечисленные услуги выполнены полностью и в срок. Заказчик претензий по объему, качеству и срокам оказания услуг не имеет.',
  }
}
