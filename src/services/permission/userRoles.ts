export default [
  {
    value: 'admin',
    text: 'АДМИНИСТРАТОР',
    note: 'Полный доступ к данным компании',
  },
  {
    value: 'director',
    text: 'Директор',
    note: 'Возможен просмотр всех данных, правка запрещена',
  },
  {
    value: 'seniorDispatcher',
    text: 'Руководитель логистики',
    note: 'Описание...',
  },
  {
    value: 'dispatcher',
    text: 'Логист',
    note: 'Создание рейсов, адресов...',
  },
  { value: 'juniorDispatcher', text: 'Диспетчер', note: 'Описание...' },
  { value: 'mechanic', text: 'Механик', note: 'Описание...' },
  { value: 'checkman', text: 'Учетчик', note: 'Описание...' },
  { value: 'brigadier', text: 'Бригадир', note: 'Описание...' },
  { value: 'trainee', text: 'Стажер', note: 'Описание...' },
  {
    value: 'accountant',
    text: 'Бухгалтер',
  },
  {
    value: 'seniorAccountant',
    text: 'Старший бухгалтер',
  },
  {
    value: 'outsourceCarriersManager',
    text: 'Менеджер по работе с привлеченными ТК',
  },
  { value: 'userAdmin', text: 'Администратор пользователей' },
  { value: 'hr', text: 'Кадровик' },
  {
    value: 'autoFillRouteDates',
    text: '(Функция) Быстрое заполнение временных меток в рейсах',
  },
  {
    value: 'withheldFineSum',
    text: '(Функиця) Редактирование реквизита штрафа: "Удержано"',
  },
  // Отчеты
  {
    value: 'report_daysControl',
    text: 'Отчет: Контроль сроков',
  },

  {
    value: 'report_driversGrades',
    text: 'Отчет: Оценки водителей',
  },

  { value: 'report_orderDocs', text: 'Отчет: Отчет по документам' },
  {
    value: 'report_ordersWOInvoice',
    text: ' Отчет: Рейсы, не включенные в акты',
  },
  { value: 'report_grossProfit', text: ' Отчет: Валовая прибыль свод' },
  {
    value: 'report_crew_diagram',
    text: 'Отчет: Использование транспорта (будет удален)',
  },
  {
    value: 'report_inProgressOrders',
    text: 'Отчет: Простой транспорта (будет удален)',
  },
  {
    value: 'report_truckStateOnDate',
    text: 'Отчет: Статус транспорта на дату (будет удален)',
  },
]
