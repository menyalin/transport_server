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
  { value: 'accepted', text: 'Принят' },
  { value: 'needFix', text: 'Доработка' },
  { value: 'missing', text: 'Не принят' },
]

export const DOCUMENT_TYPES = _docTypes
export const DOCUMENT_TYPES_ENUM = _docTypes.map((t) => t.value)

export const DOCUMENT_STATUSES = _docStatuses
export const DOCUMENT_STATUSES_ENUM = _docStatuses.map((t) => t.value)
