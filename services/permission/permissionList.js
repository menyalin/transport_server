export const admin = {
  fullAccess: true
}

export const orderPermissions = {
  'order:read': true,
  'order:write': true,
  'order:delete': true,
  'order:readPrice': true,
  'order:writePrice': true,
  'order:daysForRead': 10,
  'order:daysForWrite': 10,
  'order:daysForReadPrice': 10,
  'order:daysForWritePrice': 10
}

export const director = {
  'order:read': true,

  'order:daysForRead': -1,
  'order:readPrice': true,

  'agreement:readList': true,
  'agreement:readItem': true,

  'tkName:readList': true,
  'tkName:readItem': true,

  'address:readList': true,
  'address:readItem': true,

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
  'orderTemplate:readItem': true
}

export const dispatcher = {
  'tkName:readList': true,
  'tkName:readItem': true,
  'order:daysForRead': 30,
  'address:readList': true,
  'address:readItem': true,

  'downtime:readList': true,
  'downtime:readItem': true,
  'downtime:write': true,
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
  'orderTemplate:readItem': true
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
  'order:daysForRead': 60
}

export const checkman = {
  'order:daysForRead': 10,

  'tkName:readList': true,
  'tkName:readItem': true,

  'address:readList': true,
  'address:readItem': false,

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
  'orderTemplate:readItem': true
}

export const accountant = {
  ...checkman,
  'order:daysForRead': -1,
  'agreement:readList': true,
  'agreement:readItem': true,
  'partner:write': true
}

export const mechanic = {
  'order:daysForRead': 10,
  'address:readList': true,
  'address:readItem': true,

  'downtime:readList': true,
  'downtime:readItem': true,

  'scheduleNote:readList': true,
  'scheduleNote:readItem': true,

  'crew:readList': true,
  'crew:readItem': true,

  'truck:readList': true,
  'truck:readItem': true,
  'driver:readList': true,
  'driver:readItem': true
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
      { value: 'accountant',  text: 'Бухгалтер' }
*/
