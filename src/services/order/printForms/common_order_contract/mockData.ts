import { POINT_TYPES_ENUM } from '@/constants/enums'
import { ICarreierPFData } from '@/domain/carrier/interfaces'
import { IRoutePointPFData } from '@/domain/order/route/interfaces'
import { ICargoInfoProps } from './interfaces'

export const notes = [
  `Оплата услуг «Перевозчика» производится по договору со дня предоставления оригиналов ТТН с подписями, расшифровками подписей
и печатями грузополучателя/грузоотправителя (указанных в ТТН); путевого листа с временными отметками о погрузке/разгрузке; акта
о выполнение работ; счета; счета-фактуры с приложением доверенности на получение товара грузополучателем (если данная
доверенность необходима для осуществления перевозки и указана в заявке). Оригиналы указанных документов предоставляются
«Перевозчиком» в междугородних перевозках в срок не позднее 5 дней при дальности маршрута до 200 км, 14 дней при дальности
маршрута до 2000 км, 21 дня при дальности маршрута свыше 2000 км.`,

  `За отказ от заявки «Перевозчика» позже 16:00 рабочего дня, предшествующего дню доставки, «Заказчик» вправе потребовать
компенсацию, в размере 20% от ставки минимального заказа.`,

  `В случае неподачи ТС на загрузку в соответствии с принятой Перевозчиком заявкой Перевозчик обязан оплатить неустойку, в размере
20% (двадцать процентов) от стоимости перевозки. Стоимость перевозки подтверждается на основании принятой Перевозчиком
заявки.`,

  `Расчет за выполненную перевозку производится Заказчиком в течение от 15-ти банковских дней до 30-ти банковских дней с момента
предоставления оригиналов документов: подписанный Перевозчиком договор, акт об оказанных услугах, счет на оказанные услуги,
оригинал товарно-транспортной накладной с отметкой о вручении груза Грузополучателю, счет-фактура (если Перевозчик применяет
ОСНО), и оригинальные квитанции за возникшие дополнительные расходы Перевозчика, письменно согласованные Сторонами в процессе
перевозки, путевой лист с отметкой времени прибытия и убытия, заверенный подписями, расшифровки подписей и печати
Грузоотправителя/Грузополучателя.`,
]

export const mockExecutor: ICarreierPFData = {
  fullDataString: '',
  fullName: 'ООО "Перевозчик"',
  legalAddress: 'г. Москва, ул. Пушкина, д. 15',
  inn: '1234567890',
  kpp: '123456789',
  ogrn: '123456789',
  signatoryPosition: 'Генеральный директор',
  signatoryName: 'Иванов Иван Иванович',
  bankInfo: {
    getFullDataString: () => '',
    bankName: 'Сбербанк',
    accountNumber: '1234567890',
    correspondentAccount: '1234567890',
    bankCode: '123456789',
  },
}

export const mockRoute: IRoutePointPFData[] = [
  {
    address: 'г Саранск, ул Промышленная 2-я, д 7',
    pointType: POINT_TYPES_ENUM.loading,
    useInterval: true,
    note: 'Какое-то важное замечание',
    plannedDateTime: '22.11.2024 09:00',
    intervalEndDate: '22.11.2024 12:00',
    partnerName: 'ООО "ЛВЗ Саранский"',
  },
  {
    address: 'г. Москва, ул. Пушкина, д. 15',
    pointType: POINT_TYPES_ENUM.unloading,
    useInterval: false,
    note: 'Какое-то важное замечание',
    plannedDateTime: '23.11.2024 10:00',
    partnerName: 'ООО "Черкизово"',
  },
  {
    address: 'г. Москва, ул. Пушкина, д. 15',
    pointType: POINT_TYPES_ENUM.unloading,
    useInterval: false,
    note: 'Какое-то важное замечание',
    partnerName: 'Тандер',
  },
]

export const mockCargoInfo: ICargoInfoProps = {
  description: 'Алкогольная продукция',
  weight: 20,
  plt: 33,
  volume: 80,
  note: 'Важное примечание, касающееся груза',
  truckType: '20т Реф',
  tRegime: '+5 - +10°C',
}
