import mongoose from 'mongoose'
import { ORDER_PRICE_TYPES_ENUM_VALUES } from '../../../constants/priceTypes'
import routePointsNameBuilder from './fragments/routePointsNameBuilder'
import truckKindTextBuilder from './fragments/truckKindText'
import docsNumbersByTypesBuilder from './fragments/docsNumbersByTypes'
import { IDriversGradesXlsxReportProps } from '..'
import { orderDocsStatusBuilder } from '@/shared/pipelineFragments/orderDocsStatusBuilder'
import { ORDER_DOC_STATUSES_ENUM } from '@/constants/orderDocsStatus'
import { INCOMING_INVOICE_STATUSES_ENUM } from '../../../constants/incomingInvoice'
import { PAIMENT_INVOICE_STATUSES_ENUM } from '@/constants/paymentInvoice'

export default ({
  dateRange,
  company,
}: IDriversGradesXlsxReportProps): unknown[] => {
  const firstPlannedDate = {
    $getField: {
      field: 'plannedDate',
      input: { $first: '$route' },
    },
  }

  const firstMatcher = {
    $match: {
      company: new mongoose.Types.ObjectId(company),

      isActive: true,
      $expr: {
        $and: [
          { $eq: ['$state.status', 'completed'] },
          { $gte: [firstPlannedDate, dateRange.start] },
          { $lt: [firstPlannedDate, dateRange.end] },
        ],
      },
    },
  }

  const unwindRoute = {
    $unwind: '$route',
  }

  const lookupAddresses = [
    {
      $lookup: {
        from: 'addresses',
        localField: 'route.address',
        foreignField: '_id',
        as: 'route.address',
      },
    },
    {
      $addFields: {
        'route.address': {
          $first: '$route.address',
        },
      },
    },
  ]

  const groupRoute = {
    $group: {
      _id: '$_id',
      grade: { $first: '$grade' },
      route: { $push: '$route' },
      client: { $first: '$client' },
      confirmedCrew: { $first: '$confirmedCrew' },
      reqTransport: { $first: '$reqTransport' },
      cargoParams: { $first: '$cargoParams' },
      docs: { $first: '$docs' },
      docsState: { $first: '$docsState' },
      prePrices: { $first: '$prePrices' },
      prices: { $first: '$prices' },
      finalPrices: { $first: '$finalPrices' },
      outsourceCosts: { $first: '$outsourceCosts' },
      analytics: { $first: '$analytics' },
    },
  }

  const lookupDriver = {
    $lookup: {
      from: 'drivers',
      localField: 'confirmedCrew.driver',
      foreignField: '_id',
      as: 'driver',
    },
  }

  const lookupTkName = {
    $lookup: {
      from: 'tknames',
      localField: 'confirmedCrew.tkName',
      foreignField: '_id',
      as: 'tkName',
    },
  }

  const lookupClientAgreement = [
    {
      $lookup: {
        from: 'agreements',
        localField: 'client.agreement',
        foreignField: '_id',
        as: 'clientAgreement',
      },
    },
    {
      $addFields: {
        clientAgreement: { $first: '$clientAgreement' },
      },
    },
    {
      $lookup: {
        from: 'tknames',
        localField: 'clientAgreement.executor',
        foreignField: '_id',
        as: 'clientExecutorCarrier',
      },
    },
    {
      $addFields: {
        clientExecutorCarrier: { $first: '$clientExecutorCarrier' },
      },
    },
  ]
  const lookupCarrierAgreement = [
    {
      $lookup: {
        from: 'carrierAgreements',
        localField: 'confirmedCrew.outsourceAgreement',
        foreignField: '_id',
        as: 'carrierAgreement',
      },
    },
    {
      $addFields: {
        carrierAgreement: { $first: '$carrierAgreement' },
      },
    },
  ]

  const lookupTruck = {
    $lookup: {
      from: 'trucks',
      localField: 'confirmedCrew.truck',
      foreignField: '_id',
      as: 'truck',
    },
  }

  const lookupTrailer = {
    $lookup: {
      from: 'trucks',
      localField: 'confirmedCrew.trailer',
      foreignField: '_id',
      as: 'trailer',
    },
  }

  const lookupClient = [
    {
      $lookup: {
        from: 'partners',
        localField: 'client.client',
        foreignField: '_id',
        as: 'clientDoc',
      },
    },
    {
      $addFields: {
        clientDoc: { $first: '$clientDoc' },
      },
    },
  ]

  const incomingInvoiceLookup = [
    {
      $lookup: {
        from: 'incomingInvoiceOrders',
        localField: '_id',
        foreignField: 'order',
        as: 'incomingInvoiceOrder',
      },
    },
    {
      $addFields: {
        incomingInvoiceOrder: { $first: '$incomingInvoiceOrder' },
      },
    },
    {
      $lookup: {
        from: 'incomingInvoices',
        localField: 'incomingInvoiceOrder.incomingInvoice',
        foreignField: '_id',
        as: 'incomingInvoice',
      },
    },
    {
      $addFields: {
        incomingInvoice: { $first: '$incomingInvoice' },
        incomingInvoicePrices: {
          $ifNull: ['$incomingInvoiceOrder.total', { price: 0, priceWOVat: 0 }],
        },
      },
    },
  ]

  const paymentInvoiceLookup = [
    {
      $lookup: {
        from: 'ordersInPaymentInvoices',
        localField: '_id',
        foreignField: 'order',
        as: 'paymentInvoiceOrder',
      },
    },
    {
      $addFields: {
        paymentInvoiceOrder: { $first: '$paymentInvoiceOrder' },
      },
    },
    {
      $lookup: {
        from: 'paymentInvoices',
        localField: 'paymentInvoiceOrder.paymentInvoice',
        foreignField: '_id',
        as: 'paymentInvoice',
      },
    },
    {
      $addFields: {
        paymentInvoice: { $first: '$paymentInvoice' },
        paymentInvoicePrices: {
          $ifNull: ['$paymentInvoiceOrder.total', { price: 0, priceWOVat: 0 }],
        },
      },
    },
  ]

  const priceArraysToObjects = {
    $addFields: {
      prices: {
        $arrayToObject: {
          $map: {
            input: '$prices',
            in: { k: '$$this.type', v: '$$this' },
          },
        },
      },
      prePrices: {
        $arrayToObject: {
          $map: {
            input: '$prePrices',
            in: { k: '$$this.type', v: '$$this' },
          },
        },
      },
      finalPrices: {
        $arrayToObject: {
          $map: {
            input: '$finalPrices',
            in: { k: '$$this.type', v: '$$this' },
          },
        },
      },
    },
  }
  const addTmpFields = {
    $addFields: {
      _firstArrivalDate: {
        $getField: {
          field: 'arrivalDateDoc',
          input: { $first: '$route' },
        },
      },
      _lastDepartureDate: {
        $getField: {
          field: 'departureDateDoc',
          input: { $last: '$route' },
        },
      },
    },
  }
  const addPriceTypeFieldsBuilder = (priceTypes: string[]) => {
    let res = {}
    priceTypes.forEach((type) => {
      res = Object.assign(res, {
        [type]: {
          $ifNull: [
            '$finalPrices.' + type,
            '$prices.' + type,
            '$prePrices.' + type,
          ],
        },
      })
    })
    return { $addFields: { ...res } }
  }

  const sortByPlannedDate = [
    { $addFields: { firstPlannedDate } },
    { $sort: { firstPlannedDate: 1 } },
  ]

  const getTotalPrice = (priceTypes: string[], withVat = true) => ({
    $add: priceTypes.map((type) => ({
      $ifNull: [`$${type}.${withVat ? 'price' : 'priceWOVat'}`, 0],
    })),
  })
  const formattedDate = (fieldName: string | object) => {
    return {
      $dateToString: {
        format: '%d.%m.%Y %H:%M:%S',
        date: fieldName,
        timezone: '+03',
      },
    }
  }

  const finalProject = {
    $project: {
      'Плановая дата погрузки': formattedDate('$firstPlannedDate'),
      Погрузка: routePointsNameBuilder('loading'),
      Выгрузка: routePointsNameBuilder('unloading'),
      ТК: {
        $getField: { field: 'name', input: { $first: '$tkName' } },
      },
      'Соглашение с перевозчиком': '$carrierAgreement.name',
      Грузовик: {
        $getField: {
          field: 'regNum',
          input: {
            $first: '$truck',
          },
        },
      },
      Прицеп: {
        $getField: {
          field: 'regNum',
          input: {
            $first: '$trailer',
          },
        },
      },
      Водитель: {
        $trim: {
          input: {
            $concat: [
              { $getField: { field: 'surname', input: { $first: '$driver' } } },
              ' ',
              { $getField: { field: 'name', input: { $first: '$driver' } } },
              ' ',
              {
                $getField: {
                  field: 'patronymic',
                  input: { $first: '$driver' },
                },
              },
              ' ',
            ],
          },
        },
      },
      Оценка: '$grade.grade',
      'Комментарий к оценке': '$grade.note',
      'Стоимость с НДС': getTotalPrice(ORDER_PRICE_TYPES_ENUM_VALUES, true),
      'Стоимость без НДС': getTotalPrice(ORDER_PRICE_TYPES_ENUM_VALUES, false),
      'Затраты привлеченный с НДС': {
        $reduce: {
          input: '$outsourceCosts',
          initialValue: 0,
          in: { $add: ['$$value', { $ifNull: ['$$this.price', 0] }] },
        },
      },
      'Затраты привлеченный без НДС': {
        $reduce: {
          input: '$outsourceCosts',
          initialValue: 0,
          in: { $add: ['$$value', { $ifNull: ['$$this.priceWOVat', 0] }] },
        },
      },
      Клиент: '$clientDoc.name',
      'Соглашение с клиентом': '$clientAgreement.name',
      'Исполнитель для клиента': '$clientExecutorCarrier.name',
      'Тип ТС': {
        $concat: [
          { $toString: '$reqTransport.liftCapacity' },
          ' ',
          truckKindTextBuilder('$reqTransport.kind'),
        ],
      },

      Гидроборт: '$reqTransport.tailLift',
      'Тип груза': {
        $getField: { field: 'description', input: '$cargoParams' },
      },
      'Вес груза': '$cargoParams.weight',
      'Количество паллет': '$cargoParams.plt',
      'Температурный режим': '$cargoParams.tRegime',
      'Тип рейса': {
        $switch: {
          branches: [
            { case: { $eq: ['$analytics.type', 'city'] }, then: 'Город' },
            { case: { $eq: ['$analytics.type', 'region'] }, then: 'Регион' },
          ],
          default: '',
        },
      },
      'Номер рейса': '$client.num',
      'Номер аукциона': '$client.auctionNum',
      ТТН: docsNumbersByTypesBuilder('ttn'),
      ТрН: docsNumbersByTypesBuilder('trn'),
      'Торг-12': docsNumbersByTypesBuilder('torg'),
      'Путевой лист': docsNumbersByTypesBuilder('waybill'),
      'Экспедиторская расписка': docsNumbersByTypesBuilder('shippingReceipt'),
      'Акт возврата': docsNumbersByTypesBuilder('returnAct'),
      УПД: docsNumbersByTypesBuilder('upd'),
      'Факт прибытия в первую точку': formattedDate('$_firstArrivalDate'),
      'Факт убытия из последней точки': formattedDate('$_lastDepartureDate'),
      'Время работы': {
        $round: [
          {
            $divide: [
              {
                $dateDiff: {
                  startDate: '$_firstArrivalDate',
                  endDate: '$_lastDepartureDate',
                  unit: 'minute',
                },
              },
              60,
            ],
          },
          1, // Округление до одного десятичного знака
        ],
      },
      'Статус документов': {
        $switch: {
          branches: [
            {
              case: {
                $eq: ['$docsStatus', ORDER_DOC_STATUSES_ENUM.missing],
              },
              then: 'Не получены',
            },
            {
              case: { $eq: ['$docsStatus', ORDER_DOC_STATUSES_ENUM.onCheck] },
              then: 'На проверке',
            },
            {
              case: { $eq: ['$docsStatus', ORDER_DOC_STATUSES_ENUM.needFix] },
              then: 'На исправлении',
            },
            {
              case: { $eq: ['$docsStatus', ORDER_DOC_STATUSES_ENUM.accepted] },
              then: 'Приняты',
            },
          ],
          default: '',
        },
      },
      'Статус входящего акта': {
        $switch: {
          branches: [
            {
              case: {
                $eq: [
                  '$incomingInvoice.status',
                  INCOMING_INVOICE_STATUSES_ENUM.preparing,
                ],
              },
              then: 'Подготовка',
            },
            {
              case: {
                $eq: [
                  '$incomingInvoice.status',
                  INCOMING_INVOICE_STATUSES_ENUM.toPay,
                ],
              },
              then: 'К оплате',
            },
            {
              case: {
                $eq: [
                  '$incomingInvoice.status',
                  INCOMING_INVOICE_STATUSES_ENUM.paid,
                ],
              },
              then: 'Оплачен',
            },
          ],
          default: '',
        },
      },
      'Номер входящего акта': { $ifNull: ['$incomingInvoice.number', ''] },
      'Дата входящего акта': formattedDate('$incomingInvoice.date'),
      'План дата оплаты вх акта': formattedDate(
        '$incomingInvoice.plannedPayDate'
      ),
      'Факт дата оплаты вх акта': formattedDate('$incomingInvoice.payDate'),
      'Стоимость вх акт без НДС': '$incomingInvoicePrices.priceWOVat',
      'Стоимость вх акт с НДС': '$incomingInvoicePrices.price',
      'Статус исходящего акта': {
        $switch: {
          branches: [
            {
              case: {
                $eq: [
                  '$paymentInvoice.status',
                  PAIMENT_INVOICE_STATUSES_ENUM.accepted,
                ],
              },
              then: 'Принят',
            },
            {
              case: {
                $eq: [
                  '$paymentInvoice.status',
                  PAIMENT_INVOICE_STATUSES_ENUM.inProcess,
                ],
              },
              then: 'Подготовка',
            },
            {
              case: {
                $eq: [
                  '$paymentInvoice.status',
                  PAIMENT_INVOICE_STATUSES_ENUM.paid,
                ],
              },
              then: 'Оплачен',
            },
            {
              case: {
                $eq: [
                  '$paymentInvoice.status',
                  PAIMENT_INVOICE_STATUSES_ENUM.prepared,
                ],
              },
              then: 'Готов к отправке',
            },
            {
              case: {
                $eq: [
                  '$paymentInvoice.status',
                  PAIMENT_INVOICE_STATUSES_ENUM.sended,
                ],
              },
              then: 'Отправлен',
            },
          ],
          default: '',
        },
      },
      'Номер исходящего акта': { $ifNull: ['$paymentInvoice.number', ''] },
      'Номер реестра клиента': {
        $ifNull: ['$paymentInvoice.numberByClient', ''],
      },
      'Дата исходящего акта': formattedDate('$paymentInvoice.date'),
      'План дата оплаты исх акта': formattedDate(
        '$paymentInvoice.plannedPayDate'
      ),
      'Факт дата оплаты исх акта': formattedDate('$paymentInvoice.payDate'),
      'Стоимость исх акт без НДС': '$paymentInvoicePrices.priceWOVat',
      'Стоимость исх акт с НДС': '$paymentInvoicePrices.price',
    },
  }

  return [
    firstMatcher,
    unwindRoute,
    ...lookupAddresses,
    groupRoute,
    addTmpFields,
    ...orderDocsStatusBuilder(),
    ...lookupClientAgreement,
    ...lookupCarrierAgreement,
    ...incomingInvoiceLookup,
    ...paymentInvoiceLookup,
    lookupDriver,
    lookupTruck,
    lookupTkName,
    ...lookupClient,
    lookupTrailer,
    priceArraysToObjects,
    addPriceTypeFieldsBuilder(ORDER_PRICE_TYPES_ENUM_VALUES),
    ...sortByPlannedDate,
    finalProject,
  ]
}
