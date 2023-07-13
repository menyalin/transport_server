// @ts-nocheck
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
      const point = template.route[i]
      if (point.fixedTime && point.offsetDays >= 0) {
        point.plannedDate = moment(date)
          .add(template.route[i].fixedTime, 'h')
          .add(template.route[i].offsetDays, 'd')
          .format()
      }
      tmpRoute.push({ ...point })
    }
  }
  return tmpRoute
}

export default getRouteFromTemplate
