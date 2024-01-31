use('transport_dev')
const orderDateFragment = {
  $getField: {
    field: 'plannedDate',
    input: {
      $first: '$route',
    },
  },
}

const join = (array, sep = ', ') => ({
  $trim: {
    chars: sep,
    input: {
      $reduce: {
        initialValue: '',
        input: array,
        in: { $concat: ['$$value', '$$this', sep] },
      },
    },
  },
})

const firstMatcher = {
  $match: {
    'state.status': 'completed',
    company: ObjectId('61a4644dcc7fa64eb12ae1c4'),
    $expr: {
      $and: [
        { $gte: [orderDateFragment, new Date('2023-12-01')] },
        { $lt: [orderDateFragment, new Date('2024-01-10')] },
      ],
    },
  },
}
const clientLookup = [
  {
    $lookup: {
      from: 'partners',
      localField: 'client.client',
      foreignField: '_id',
      as: '_partner',
    },
  },
  {
    $addFields: {
      clientName: {
        $getField: {
          field: 'name',
          input: {
            $first: '$_partner',
          },
        },
      },
    },
  },
  {
    $unset: ['_partner'],
  },
]
const agreementLookup = [
  {
    $lookup: {
      from: 'agreements',
      localField: 'client.agreement',
      foreignField: '_id',
      as: '_agreement',
    },
  },
  {
    $addFields: {
      agreementName: {
        $getField: {
          field: 'name',
          input: {
            $first: '$_agreement',
          },
        },
      },
    },
  },
  { $unset: ['_agreement'] },
]
const truckLookup = [
  {
    $lookup: {
      from: 'trucks',
      localField: 'confirmedCrew.truck',
      foreignField: '_id',
      as: '_truck',
    },
  },
  {
    $addFields: {
      truckNum: {
        $getField: {
          field: 'regNum',
          input: { $first: '$_truck' },
        },
      },
    },
  },
  { $unset: ['_truck'] },
]
const trailerLookup = [
  {
    $lookup: {
      from: 'trucks',
      localField: 'confirmedCrew.trailer',
      foreignField: '_id',
      as: '_trailer',
    },
  },
  {
    $addFields: {
      trailerNum: {
        $getField: {
          field: 'regNum',
          input: { $first: '$_trailer' },
        },
      },
    },
  },
  { $unset: ['_trailer'] },
]
const driverLookup = [
  {
    $lookup: {
      from: 'drivers',
      localField: 'confirmedCrew.driver',
      foreignField: '_id',
      as: 'driver',
    },
  },
  {
    $addFields: {
      driver: { $first: '$driver' },
    },
  },
  {
    $addFields: {
      driverName: {
        $trim: {
          input: {
            $concat: [
              '$driver.surname',
              ' ',
              '$driver.name',
              ' ',
              '$driver.patronymic',
            ],
          },
        },
      },
    },
  },
  { $unset: ['driver'] },
]
const carrierLookup = [
  {
    $lookup: {
      from: 'tknames',
      localField: 'confirmedCrew.tkName',
      foreignField: '_id',
      as: 'carrier',
    },
  },
  {
    $addFields: {
      carrierName: {
        $getField: { input: { $first: '$carrier' }, field: 'name' },
      },
    },
  },
  { $unset: ['carrier'] },
]
const addressLookup = [
  {
    $addFields: {
      loadingPointIds: {
        $map: {
          in: '$$item.address',
          as: 'item',
          input: {
            $filter: {
              input: '$route',
              as: 'point',
              cond: { $eq: ['$$point.type', 'loading'] },
            },
          },
        },
      },
      unloadingPointIds: {
        $map: {
          in: '$$item.address',
          as: 'item',
          input: {
            $filter: {
              input: '$route',
              as: 'point',
              cond: { $eq: ['$$point.type', 'unloading'] },
            },
          },
        },
      },
    },
  },
  {
    $lookup: {
      from: 'addresses',
      localField: 'loadingPointIds',
      foreignField: '_id',
      as: 'loadingAddresses',
    },
  },
  {
    $lookup: {
      from: 'addresses',
      localField: 'unloadingPointIds',
      foreignField: '_id',
      as: 'unloadingAddresses',
    },
  },

  {
    $addFields: {
      loadingZoneIds: {
        $reduce: {
          initialValue: [],
          input: '$loadingAddresses',
          in: { $concatArrays: ['$$value', '$$this.zones'] },
        },
      },
      unloadingZoneIds: {
        $reduce: {
          initialValue: [],
          input: '$unloadingAddresses',
          in: { $concatArrays: ['$$value', '$$this.zones'] },
        },
      },
      loadingRegionIds: {
        $map: {
          input: '$loadingAddresses',
          in: '$$this.region',
        },
      },
      unloadingRegionIds: {
        $map: {
          input: '$unloadingAddresses',
          in: '$$this.region',
        },
      },
      unloadingPartnerIds: {
        $map: {
          input: '$unloadingAddresses',
          in: '$$this.partner',
        },
      },
      loadingCityIds: {
        $map: {
          input: '$loadingAddresses',
          in: '$$this.city',
        },
      },
      unloadingCityIds: {
        $map: {
          input: '$unloadingAddresses',
          in: '$$this.city',
        },
      },
    },
  },
  {
    $lookup: {
      from: 'partners',
      localField: 'unloadingPartnerIds',
      foreignField: '_id',
      as: 'unloadingPartners',
    },
  },
  {
    $lookup: {
      from: 'regions',
      localField: 'loadingRegionIds',
      foreignField: '_id',
      as: 'loadingRegions',
    },
  },
  {
    $lookup: {
      from: 'regions',
      localField: 'unloadingRegionIds',
      foreignField: '_id',
      as: 'unloadingRegions',
    },
  },
  {
    $lookup: {
      from: 'zones',
      localField: 'loadingZoneIds',
      foreignField: '_id',
      as: 'loadingZones',
    },
  },
  {
    $lookup: {
      from: 'zones',
      localField: 'unloadingZoneIds',
      foreignField: '_id',
      as: 'unloadingZones',
    },
  },
  {
    $lookup: {
      from: 'cities',
      localField: 'loadingCityIds',
      foreignField: '_id',
      as: 'loadingCities',
    },
  },
  {
    $lookup: {
      from: 'cities',
      localField: 'unloadingCityIds',
      foreignField: '_id',
      as: 'unloadingCities',
    },
  },
  {
    $unset: [
      'loadingPointIds',
      'unloadingPointIds',
      'unloadingPartnerIds',
      'loadingRegionIds',
      'unloadingRegionIds',
      'loadingZoneIds',
      'unloadingZoneIds',
      'loadingCityIds',
      'unloadingCityIds',
    ],
  },
]
const orderInInvoiceLookup = [
  {
    $lookup: {
      from: 'ordersInPaymentInvoices',
      localField: '_id',
      foreignField: 'order',
      as: 'orderInInvoice',
    },
  },
  {
    $addFields: {
      orderInInvoice: { $first: '$orderInInvoice' },
    },
  },
]

const invoiceLookup = [
  {
    $lookup: {
      from: 'paymentInvoices',
      localField: 'orderInInvoice.paymentInvoice',
      foreignField: '_id',
      as: 'invoice',
    },
  },
  {
    $addFields: { invoice: { $first: '$invoice' } },
  },
]
const convertPrices = (field) => ({
  $arrayToObject: {
    $map: {
      input: field,
      in: {
        k: '$$this.type',
        v: {
          priceWOVat: '$$this.priceWOVat',
          price: '$$this.price',
        },
      },
    },
  },
})

const convertedPrices = [
  {
    $addFields: {
      prePricesObj: convertPrices('$prePrices'),
      pricesObj: convertPrices('$prices'),
    },
  },
  {
    $addFields: {
      prePricesTotalWOVat: {
        $reduce: {
          input: '$prePrices',
          initialValue: 0,
          in: { $add: ['$$this.priceWOVat', '$$value'] },
        },
      },
      pricesTotalWOVat: {
        $reduce: {
          input: '$prices',
          initialValue: 0,
          in: { $add: ['$$this.priceWOVat', '$$value'] },
        },
      },
    },
  },
]
const finalProject = {
  //   $addFields: {
  $project: {
    Дата: {
      $dateToString: {
        format: '%Y-%m-%d %H:%M:%S',
        date: orderDateFragment,
        timezone: 'Europe/Moscow',
      },
    },
    Клиент: '$clientName',
    Соглашение: '$agreementName',
    Тягач: '$truckNum',
    Прицеп: '$trailerNum',
    Водитель: '$driverName',
    ТК: '$carrierName',
    'Тип рейса': '$analytics.type',
    Грузополучатели: join({
      $map: {
        input: '$unloadingPartners',
        in: '$$this.name',
      },
    }),
    'Типы грузополучателей': join({
      $map: {
        input: '$unloadingPartners',
        in: '$$this.group',
      },
    }),
    'Регионы погрузки': join({
      $map: {
        input: '$loadingRegions',
        in: '$$this.name',
      },
    }),
    'Зоны погрузки': join({
      $map: {
        input: '$loadingZones',
        in: '$$this.name',
      },
    }),
    'Города погрузки': join({
      $map: {
        input: '$loadingCities',
        in: '$$this.name',
      },
    }),
    'Адреса погрузки': join({
      $map: {
        input: '$loadingAddresses',
        in: '$$this.shortName',
      },
    }),
    'Регионы разгрузки': join({
      $map: {
        input: '$unloadingRegions',
        in: '$$this.name',
      },
    }),
    'Зоны разгрузки': join({
      $map: {
        input: '$unloadingZones',
        in: '$$this.name',
      },
    }),
    'Города разгрузки': join({
      $map: {
        input: '$unloadingCities',
        in: '$$this.name',
      },
    }),
    'Адреса разгрузки': join({
      $map: {
        input: '$unloadingAddresses',
        in: '$$this.shortName',
      },
    }),
    'Тип ТС': '$reqTransport.liftCapacity',
    'Вид ТС': '$reqTransport.kind',
    'Т-Режим': '$cargoParams.tRegime',

    Примечание: '$note',
    'Цена без НДС(в акте)': '$orderInInvoice.total.priceWOVat',
    'Цена c НДС(в акте)': '$orderInInvoice.total.price',
    'Номер акта': '$invoice.number',
    'Дата акта': {
      $dateToString: {
        format: '%Y-%m-%d',
        date: '$invoice.sendDate',
        timezone: 'Europe/Moscow',
      },
    },
    'Номер реестра клиента': '$invoice.numberByClient',
    'Статус акта': '$invoice.status',
    'Оценка водителя': '$grade.grade',
    'Комментарий к оценке': '$grade.note',

    'Предв: Тариф без НДС': { $ifNull: ['$prePricesObj.base.priceWOVat', 0] },
    'Предв: Допточки без НДС': {
      $ifNull: ['$prePricesObj.additionalPoints.priceWOVat', 0],
    },
    'Предв: Простой на погрузке без НДС': {
      $ifNull: ['$prePricesObj.loadingDowntime.priceWOVat', 0],
    },
    'Предв: Простой на выгрузке без НДС': {
      $ifNull: ['$prePricesObj.unloadingDowntime.priceWOVat', 0],
    },
    'Предв: Возврат без НДС': {
      $ifNull: ['$prePricesObj.return.priceWOVat', 0],
    },
    'Предв: Прочее без НДС': { $ifNull: ['$prePricesObj.other.priceWOVat', 0] },
    'Предв: Итого без НДС': { $ifNull: ['$prePricesTotalWOVat', 0] },

    'Аукцион: Тариф без НДС': { $ifNull: ['$pricesObj.base.priceWOVat', 0] },
    'Аукцион: Допточки без НДС': {
      $ifNull: ['$pricesObj.additionalPoints.priceWOVat', 0],
    },
    'Аукцион: Простой на погрузке без НДС': {
      $ifNull: ['$pricesObj.loadingDowntime.priceWOVat', 0],
    },
    'Аукцион: Простой на выгрузке без НДС': {
      $ifNull: ['$pricesObj.unloadingDowntime.priceWOVat', 0],
    },
    'Аукцион: Возврат без НДС': {
      $ifNull: ['$pricesObj.return.priceWOVat', 0],
    },
    'Аукцион: Прочее без НДС': { $ifNull: ['$pricesObj.other.priceWOVat', 0] },
    'Аукцион: Итого без НДС': { $ifNull: ['$pricesTotalWOVat', 0] },

    'Акт: Допточки без НДС': {
      $ifNull: ['$orderInInvoice.totalByTypes.additionalPoints.priceWOVat', 0],
    },
    'Акт: Простой на погрузке без НДС': {
      $ifNull: ['$orderInInvoice.totalByTypes.loadingDowntime.priceWOVat', 0],
    },
    'Акт: Простой на выгрузке без НДС': {
      $ifNull: ['$orderInInvoice.totalByTypes.unloadingDowntime.priceWOVat', 0],
    },
    'Акт: Возврат без НДС': {
      $ifNull: ['$orderInInvoice.totalByTypes.return.priceWOVat', 0],
    },
    'Акт: Прочее без НДС': {
      $ifNull: ['$orderInInvoice.totalByTypes.other.priceWOVat', 0],
    },
    'Акт: Итого без НДС': { $ifNull: ['$orderInInvoice.total.priceWOVat', 0] },
  },
}

db.getCollection('orders').aggregate([
  firstMatcher,
  ...clientLookup,
  ...agreementLookup,
  ...truckLookup,
  ...trailerLookup,
  ...driverLookup,
  ...carrierLookup,
  ...addressLookup,
  ...orderInInvoiceLookup,
  ...invoiceLookup,
  ...convertedPrices,
  finalProject,
  { $limit: 10 },
])
