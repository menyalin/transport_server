export const admin = {
  fullAccess: true,
  'report:drivers_grades': true,
  'order:readFinalPrices': true,
  'order:writeFinalPrices': true,
  'document:readList': true,
  'document:readItem': true,
  'document:write': true,
  'document:delete': true,
  'report:gross_profit': true,
  'worker:userAdmin': true,

  'fine:readList': true,
  'fine:readItem': true,
  'fine:write': true,
}

export const outsourceCarriersManager = {
  'agreement:readList': true,
  'agreement:readItem': true,
  'agreement:write': true,
  'agreement:delete': true,
  'tkName:readList': true,
  'tkName:readItem': true,
  'tkName:write': true,
  'tkName:delete': true,
  'order:daysForReadOutsourceCosts': -1,
  'order:daysForWriteOutsourceCosts': -1,
  'order:daysForWrite': -1,
  'order:readFinalPrices': true,
  'order:writeFinalPrices': false,
  'tariff:readList': true,
  'tariff:readItem': true,
  'tariff:write': true,
  'tariff:delete': true,
}

export const director = {
  'fine:readList': true,
  'fine:readItem': true,
  'worker:readList': true,
  'worker:readItem': true,
  'order:read': true,
  'order:daysForRead': -1,
  'order:daysForReadPrice': -1,
  'order:daysForReadOutsourceCosts': -1,
  'order:readFinalPrices': true,
  'agreement:readList': true,
  'agreement:readItem': true,
  'tkName:readList': true,
  'tkName:readItem': true,
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
  'report:drivers_grades': true,
  'report:gross_profit': true,
  'tariff:readList': true,
  'tariff:readItem': true,
  'document:readList': true,
  'document:readItem': true,
  'region:readList': true,
  'region:readItem': true,
  'city:readList': true,
  'city:readItem': true,
}

export const dispatcher = {
  'tkName:readList': true,
  'tkName:readItem': true,
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
  'order:daysForRead': 30,
  'order:daysForWrite': 4,
  'order:daysForReadPrice': 4,
  'order:daysForWritePrice': 4,
  'order:groupCreate': true,
}

export const seniorDispatcher = {
  ...dispatcher,
  'tkName:write': true,
  'tkName:delete': true,
  'address:write': true,
  'address:delete': true,

  'partner:write': true,
  'partner:delete': true,
  'truck:write': true,
  'truck:delete': true,
  'driver:write': true,
  'driver:delete': true,
  'orderTemplate:write': true,
  'orderTemplate:delete': true,
  'order:delete': true,
  'order:daysForRead': 60,
  'order:daysForWrite': 15,
  'order:daysForReadPrice': 15,
  'order:daysForWritePrice': 15,
  'downtime:daysForWrite': 30,
}

export const checkman = {
  'fine:readList': true,
  'fine:readItem': true,
  'fine:write': true,
  orderListForAccountant: true,
  'order:daysForRead': -1,
  'order:daysForWrite': 14,
  'order:daysForReadPrice': 14,
  'tkName:readList': true,
  'tkName:readItem': true,
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
}

export const accountant = {
  ...checkman,
  'order:daysForRead': -1,
  'order:daysForWrite': -1,
  'order:daysForReadPrice': -1,
  'order:daysForWritePrice': -1,
  'order:readFinalPrices': true,
  'order:writeFinalPrices': true,

  'agreement:readList': true,
  'agreement:readItem': true,
  'agreement:write': true,
  'partner:write': true,
  'tariff:readList': true,
  'tariff:readItem': true,
  'tariff:write': true,
  'tariff:delete': true,
  'document:readList': true,
  'document:readItem': true,
  'document:write': true,
  'document:delete': true,
}

export const mechanic = {
  'order:daysForRead': 10,
  'address:readList': true,
  'address:readItem': true,
  'fine:readList': true,
  'fine:readItem': true,
  'fine:write': true,

  'region:readList': true,
  'region:readItem': true,

  'city:readList': true,
  'city:readItem': true,

  'zone:readList': true,
  'zone:readItem': true,
  'downtime:readList': true,
  'downtime:readItem': true,
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
  'worker:delete': false,
  'worker:userAdmin': true,
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
      { value: 'userAdmin', text: 'Администратор пользователей'}
*/
