export const admin = {
  fullAccess: true,
  'modules:accounting': true, // Для отображения вкладки "Учет"

  'order:showReturnCheckbox': true,
  'order:readFinalPrices': true,
  'order:writeFinalPrices': true,
  'document:readList': true,
  'document:readItem': true,
  'document:write': true,
  'document:delete': true,
  'worker:userAdmin': true,

  'fine:readList': true,
  'fine:readItem': true,
  'fine:write': true,
  'order:setDocs': true,
  'order:readDocs': true,
  'order:showDocDates': true,
  'order:writeDocDates': true,
  'order:readPaymentToDriver': true,
  'order:writePaymentToDriver': true,
  'order:printForms': true,
  'salaryTariff:readList': true,
  'salaryTariff:readItem': true,
  'salaryTariff:write': true,
  'salaryTariff:delete': true,

  'docsRegistry:readList': true,
  'docsRegistry:readItem': true,
  'docsRegistry:write': true,
  'docsRegistry:delete': true,

  'paymentInvoice:readList': true,
  'paymentInvoice:readItem': true,
  'paymentInvoice:write': true,
  'paymentInvoice:delete': true,

  'incomingInvoice:readList': true,
  'incomingInvoice:readItem': true,
  'incomingInvoice:write': true,
  'incomingInvoice:delete': true,

  'tariffContract:readList': true,
  'tariffContract:readItem': true,
  'tariffContract:write': true,
  'tariffContract:delete': true,
}

export const outsourceCarriersManager = {
  'modules:accounting': true,
  'order:readPaymentToDriver': true,
  'order:writePaymentToDriver': true,
  'order:printForms': true,

  'agreement:readList': true,
  'agreement:readItem': true,

  'carrierAgreement:readList': true,
  'carrierAgreement:readItem': true,
  'carrierAgreement:write': true,
  'carrierAgreement:delete': true,

  'carrier:readList': true,
  'carrier:readItem': true,
  'carrier:write': true,
  'carrier:delete': true,
  'order:create': true,
  'order:daysForReadOutsourceCosts': -1,
  'order:daysForWriteOutsourceCosts': -1,
  'order:daysForWrite': -1,
  'order:readFinalPrices': true,
  'order:readDocs': true,

  'paymentInvoice:readList': true,
  'paymentInvoice:readItem': true,
  'paymentInvoice:write': true,
  'paymentInvoice:delete': true,

  'incomingInvoice:readList': true,
  'incomingInvoice:readItem': true,
  'incomingInvoice:write': true,
  'incomingInvoice:delete': true,

  'docsRegistry:readList': true,
  'docsRegistry:readItem': true,
  'docsRegistry:write': true,
  'docsRegistry:delete': true,
}

export const director = {
  'salaryTariff:readList': true,
  'salaryTariff:readItem': true,
  'order:readPaymentToDriver': true,
  'order:writePaymentToDriver': true,
  'modules:accounting': true,
  'fine:readList': true,
  'fine:readItem': true,
  'fine:isWithheldRead': true,
  'worker:readList': true,
  'worker:readItem': true,
  'order:read': true,
  'order:daysForRead': -1,
  'order:daysForReadPrice': -1,
  'order:daysForReadOutsourceCosts': -1,
  'order:readFinalPrices': true,
  'order:printForms': true,
  'agreement:readList': true,
  'agreement:readItem': true,

  'report:daysControl': true,
  'report:inProgressOrders': true,
  'report:truckStateOnDate': true,
  'report:driversGrades': true,
  'report:orderDocs': true,
  'report:ordersWOInvoice': true,
  'report:grossProfit': true,
  'report:crew_diagram': true,

  'carrierAgreement:readList': true,
  'carrierAgreement:readItem': true,
  'carrier:readList': true,
  'carrier:readItem': true,
  'address:readList': true,
  'address:readItem': true,
  'zone:readList': true,
  'zone:readItem': true,
  'downtime:readList': true,
  'downtime:readItem': true,
  'scheduleNote:readList': true,
  'scheduleNote:readItem': true,
  'partner:readList': true,
  'partner:readItem': true,
  'crew:readList': true,
  'crew:readItem': true,
  'truck:readList': true,
  'truck:readItem': true,
  'driver:readList': true,
  'driver:readItem': true,
  'orderTemplate:readList': true,
  'orderTemplate:readItem': true,
  orderListForAccountant: true,

  'tariff:readList': true,
  'tariff:readItem': true,
  'document:readList': true,
  'document:readItem': true,
  'region:readList': true,
  'region:readItem': true,
  'city:readList': true,
  'city:readItem': true,
  'order:showDocDates': true,
  'docsRegistry:readList': true,
  'docsRegistry:readItem': true,

  'paymentInvoice:readList': true,
  'paymentInvoice:readItem': true,

  'incomingInvoice:readList': true,
  'incomingInvoice:readItem': true,

  'tariffContract:readList': true,
  'tariffContract:readItem': true,
}

export const dispatcher = {
  'carrier:readList': true,
  'carrier:readItem': true,
  'address:readList': true,
  'address:readItem': true,
  'zone:readList': true,
  'zone:readItem': true,
  'region:readList': true,
  'region:readItem': true,
  'city:readList': true,
  'city:readItem': true,

  'carrierAgreement:readList': true,
  'carrierAgreement:readItem': true,

  'downtime:readList': true,
  'downtime:readItem': true,
  'downtime:write': true,
  'downtime:daysForWrite': 4,
  'downtime:delete': true,
  'scheduleNote:readList': true,
  'scheduleNote:readItem': true,
  'scheduleNote:write': true,
  'scheduleNote:delete': true,
  'partner:readList': true,
  'partner:readItem': true,
  'crew:readList': true,
  'crew:readItem': true,
  'crew:write': true,
  'crew:delete': true,
  'truck:readList': true,
  'truck:readItem': true,
  'driver:readList': true,
  'driver:readItem': true,
  'orderTemplate:readList': true,
  'orderTemplate:readItem': true,
  'order:move': true,
  'order:create': true,
  'order:daysForRead': 30,
  'order:daysForWrite': 4,
  'order:daysForReadPrice': 4,
  'order:daysForWritePrice': 4,
  'order:groupCreate': true,
  'order:readDocs': true,
}

export const seniorDispatcher = {
  ...dispatcher,
  'carrier:write': true,
  'carrier:delete': true,
  'address:write': true,
  'address:delete': true,
  'partner:write': true,
  'partner:delete': true,
  'truck:write': true,
  'driver:write': true,
  'orderTemplate:write': true,
  'orderTemplate:delete': true,
  'order:delete': true,
  'order:daysForRead': 180,
  'order:daysForWrite': 15,
  'order:daysForReadPrice': 15,
  'order:daysForWritePrice': 15,
  'downtime:daysForWrite': 30,
  'order:readPaymentToDriver': true,
  'order:writePaymentToDriver': true,
  'order:showReturnCheckbox': true,
  'docsRegistry:readList': true,
  'docsRegistry:readItem': true,
  'carrierAgreement:readList': true,
  'carrierAgreement:readItem': true,
  'carrierAgreement:write': true,
  'carrierAgreement:delete': true,
  'tariffContract:readList': true,
  'tariffContract:readItem': true,
}

export const checkman = {
  'fine:readList': true,
  'fine:readItem': true,
  'fine:write': true,
  orderListForAccountant: true,
  'order:daysForRead': -1,
  'order:daysForWrite': 14,
  'order:daysForReadPrice': 14,
  'carrier:readList': true,
  'carrier:readItem': true,
  'address:readList': true,
  'address:readItem': true,
  'zone:readList': true,
  'zone:readItem': true,

  'region:readList': true,
  'region:readItem': true,

  'city:readList': true,
  'city:readItem': true,

  'downtime:readList': true,
  'downtime:readItem': true,
  'scheduleNote:readList': true,
  'scheduleNote:readItem': true,
  'partner:readList': true,
  'partner:readItem': true,
  'crew:readList': true,
  'crew:readItem': true,
  'truck:readList': true,
  'truck:readItem': true,
  'truck:write': true,
  'driver:readList': true,
  'driver:readItem': true,
  'driver:write': true,
  'orderTemplate:readList': true,
  'orderTemplate:readItem': true,
  'order:readDocs': true,
}

export const accountant = {
  ...checkman,
  'salaryTariff:readList': true,
  'salaryTariff:readItem': true,
  'salaryTariff:write': true,

  'modules:accounting': true,
  'order:daysForRead': -1,
  'order:daysForWrite': -1,
  'order:daysForReadPrice': -1,
  'order:daysForWritePrice': -1,
  'order:readFinalPrices': true,
  'order:writeFinalPrices': true,
  'order:readPaymentToDriver': true,
  'order:writePaymentToDriver': true,

  'agreement:readList': true,
  'agreement:readItem': true,
  'agreement:write': true,

  'carrierAgreement:readList': true,
  'carrierAgreement:readItem': true,
  'carrierAgreement:write': true,

  'partner:write': true,
  'tariff:readList': true,
  'tariff:readItem': true,
  'tariff:write': true,
  'tariff:delete': true,
  'document:readList': true,
  'document:readItem': true,
  'document:write': true,
  'document:delete': true,
  'order:setDocs': true,
  'order:readDocs': true,
  'order:showDocDates': true,
  'order:writeDocDates': true,

  'docsRegistry:readList': true,
  'docsRegistry:readItem': true,
  'docsRegistry:write': true,

  'paymentInvoice:readList': true,
  'paymentInvoice:readItem': true,
  'paymentInvoice:write': true,
  'paymentInvoice:delete': true,

  'incomingInvoice:readList': true,
  'incomingInvoice:readItem': true,
  'incomingInvoice:write': true,
  'incomingInvoice:delete': true,

  'tariffContract:readList': true,
  'tariffContract:readItem': true,
  'tariffContract:write': true,
}

export const seniorAccountant = {
  ...accountant,
  'modules:accounting': true,
  changeIncomingInvoiceStatus: true,
}

export const mechanic = {
  'modules:accounting': true,
  'order:daysForRead': 65,
  'address:readList': true,
  'address:readItem': true,
  'fine:readList': true,
  'fine:readItem': true,
  'fine:write': true,
  'order:readPaymentToDriver': true,
  'order:writePaymentToDriver': true,
  'order:readDocs': true,
  'salaryTariff:readList': true,
  'salaryTariff:readItem': true,

  'region:readList': true,
  'region:readItem': true,

  'city:readList': true,
  'city:readItem': true,

  'zone:readList': true,
  'zone:readItem': true,

  'downtime:readList': true,
  'downtime:readItem': true,
  'downtime:write': true,
  'downtime:daysForWrite': 65,

  'scheduleNote:readList': true,
  'scheduleNote:readItem': true,
  'crew:readList': true,
  'crew:readItem': true,
  'truck:readList': true,
  'truck:readItem': true,
  'driver:readList': true,
  'driver:readItem': true,
}

export const userAdmin = {
  'worker:readList': true,
  'worker:readItem': true,
  'worker:write': true,
  'worker:userAdmin': true,
}

export const hr = {
  'salaryTariff:readList': true,
  'salaryTariff:readItem': true,
  'salaryTariff:write': true,
  'salaryTariff:delete': true,
}
export const autoFillRouteDates = {
  'order:autoFillRouteDates': true,
}

export const withheldFineSum = {
  'fine:isWithheldRead': true,
  'fine:isWithheldWrite': true,
  'fine:readList': true,
  'fine:readItem': true,
  'fine:write': true,
}

export const report_daysControl = {
  'report:daysControl': true,
}
export const report_inProgressOrders = {
  'report:inProgressOrders': true,
}
export const report_truckStateOnDate = {
  'report:truckStateOnDate': true,
}
export const report_driversGrades = {
  'report:driversGrades': true,
}
export const report_orderDocs = {
  'report:orderDocs': true,
}
export const report_ordersWOInvoice = {
  'report:ordersWOInvoice': true,
}
export const report_grossProfit = {
  'report:grossProfit': true,
}
export const report_crew_diagram = {
  'report:crew_diagram': true,
}

/*
      { value: 'admin' text: 'ТОП' },
      { value: 'director', text: 'Директор'},
      { value: 'seniorDispatcher', text: 'Руководитель логистики'},
      { value: 'dispatcher', text: 'Логист'},
      { value: 'juniorDispatcher', text: 'Диспетчер', note: 'Описание...' },
      { value: 'mechanic', text: 'Механик', note: 'Описание...' },
      { value: 'checkman', text: 'Учетчик', note: 'Описание...' },
      { value: 'brigadier', text: 'Бригадир', note: 'Описание...' },
      { value: 'trainee', text: 'Стажер', note: 'Описание...' },
      { value: 'accountant',  text: 'Бухгалтер' },
      { value: 'userAdmin', text: 'Администратор пользователей'},
      { value: 'hr', text: 'Кадровик' },
*/
