import moment from 'moment'

const getRouteFromTemplate = ({ template, date }) => {
  let tmpRoute = []
  if (!template.fixedTimeSlots) {
    tmpRoute = template.route
    tmpRoute[0].plannedDate = date
    return tmpRoute
  }

  for (let i = 0; i < template.route.length; i++) {
    if (i === 0) {
      tmpRoute.push({
        ...template.route[i],
        plannedDate: moment(date)
          .add(template.route[i].fixedTime, 'h')
          .format(),
      })
    } else {
      // Добавить проверку на отсутвие времени выгрузки
      tmpRoute.push({
        ...template.route[i],
        plannedDate: moment(date)
          .add(template.route[i].fixedTime, 'h')
          .add(template.route[i].offsetDays, 'd')
          .format(),
      })
    }
  }
  return tmpRoute
}

export default getRouteFromTemplate
