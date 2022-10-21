const _docTypes = [
  { value: 'routeCard', text: 'Маршрутная карта' },
  { value: 'trn', text: 'ТрН' },
  { value: 'ttn', text: 'ТТН' },
  { value: 'torg', text: 'ТОРГ-12/13' },
  { value: 'upd', text: 'УПД' },
  { value: 'goodsTrn', text: 'Товарный раздел ТРН' },
  { value: 'invoice', text: 'Счет Фактура' },
  { value: 'shippingReceipt', text: 'Экспедиторская расписка' },
  { value: 'goodsAcceptAct', text: 'Акт приемки товаров' },
  { value: 'discrepancyAct', text: 'Акт расхождений' },
  { value: 'returnAct', text: 'Акт возврата' },
  { value: 'waybill', text: 'Путевой лист' },
]

const _docStatuses = [
  { value: 'accepted', text: 'Принято' },
  { value: 'needFix', text: 'На исправлении' },
]

const _salaryTariffTypes = [
  {
    value: 'points',
    text: 'Маршрут, адреса',
    disabled: false,
    tariffType: 'base',
  },
  {
    value: 'zones',
    text: 'Маршрут, зоны',
    disabled: false,
    tariffType: 'base',
  },
  {
    value: 'regions',
    text: 'Маршрут, регионы',
    disabled: false,
    tariffType: 'base',
  },

  { value: 'waiting', text: 'Простой', disabled: true },
  { value: 'additionalPoints', text: 'Дополнительные точки', disabled: true },
  { value: 'return', text: 'Возврат', disabled: true },
]

export const DOCUMENT_TYPES = _docTypes
export const DOCUMENT_TYPES_ENUM = _docTypes.map((t) => t.value)

export const DOCUMENT_STATUSES = _docStatuses
export const DOCUMENT_STATUSES_ENUM = _docStatuses.map((t) => t.value)

export const SALARY_TARIFF_TYPES = _salaryTariffTypes
export const SALARY_TARIFF_TYPES_ENUM = _salaryTariffTypes.map((t) => t.value)
