export const director = {
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
  'orderTemplate:delete': true
}

export const checkman = {
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
  'agreement:readList': true,
  'agreement:readItem': true
}

export const mechanic = {
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
