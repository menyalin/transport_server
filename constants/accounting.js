const _docTypes = [
  { value: 'ttn', text: 'ТТН' },
  { value: 'trn', text: 'ТрН' },
  { value: 'torg', text: 'ТОРГ-12' },
  { value: 'waybill', text: 'Путевой лист' },
  { value: 'shippingReceipt', text: 'Экспедиторская расписка' },
  { value: 'returnAct', text: 'Акт возврата' },
]

const _docStatuses = [
  { value: 'accepted', text: 'Принят' },
  { value: 'needFix', text: 'Требуется исправление' },
  { value: 'missing', text: 'Отсутсвует' },
]

export const DOCUMENT_TYPES = _docTypes
export const DOCUMENT_TYPES_ENUM = _docTypes.map((t) => t.value)

export const DOCUMENT_STATUSES = _docStatuses
export const DOCUMENT_STATUSES_ENUM = _docStatuses.map((t) => t.value)
