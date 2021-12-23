import mongoose from 'mongoose'
import { BadRequestError } from '../../helpers/errors.js'
import { Order, Downtime } from '../../models/index.js'

const _getPipeline = ({ dates, body, id }) => {
  const sDate = new Date(dates[0])
  const matcher = {
    $match: {
      company: mongoose.Types.ObjectId(body.company),
      'confirmedCrew.truck': mongoose.Types.ObjectId(body.confirmedCrew.truck),
      $expr: {
        $or: [
          {
            // Начало нового рейса внутри существующего
            $and: [
              {
                $lte: [
                  {
                    $getField: {
                      field: 'arrivalDate',
                      input: { $first: '$route' }
                    }
                  },
                  sDate
                ]
              },
              {
                $gte: [
                  {
                    $getField: {
                      field: 'departureDate',
                      input: { $last: '$route' }
                    }
                  },
                  sDate
                ]
              }
            ]
          }
        ]
      }
    }
  }

  if (dates.length >= 2) {
    const eDate = new Date(dates[dates.length - 1])
    // пересечение по последней дате нового рейса
    matcher.$match.$expr.$or.push({
      $and: [
        {
          $lte: [
            {
              $getField: {
                field: 'arrivalDate',
                input: { $first: '$route' }
              }
            },
            eDate
          ]
        },
        {
          $gte: [
            {
              $getField: {
                field: 'departureDate',
                input: { $last: '$route' }
              }
            },
            eDate
          ]
        }
      ]
    })

    // перекрытие рейса
    matcher.$match.$expr.$or.push({
      $and: [
        {
          $gte: [
            {
              $getField: {
                field: 'arrivalDate',
                input: { $first: '$route' }
              }
            },
            sDate
          ]
        },
        {
          $lte: [
            {
              $getField: {
                field: 'departureDate',
                input: { $last: '$route' }
              }
            },
            eDate
          ]
        }
      ]
    })
  }
  if (id) matcher.$match._id = { $ne: mongoose.Types.ObjectId(id) }
  return [matcher]
}

const _checkUnfinishedOrder = async ({ body, id }) => {
  const matcher = {
    $match: {
      'confirmedCrew.truck': mongoose.Types.ObjectId(body.confirmedCrew.truck),
      $expr: {
        $and: [
          {
            $getField: {
              field: 'arrivalDate',
              input: { $first: '$route' }
            }
          },
          {
            $not: [
              {
                $getField: {
                  field: 'departureDate',
                  input: { $last: '$route' }
                }
              }
            ]
          }
        ]
      }
    }
  }
  if (id) matcher.$match._id = { $ne: mongoose.Types.ObjectId(id) }
  const orders = await Order.aggregate([matcher])
  if (orders.length > 0)
    throw new BadRequestError('У грузовика есть незавершенные рейсы')
}

const _checkSequenceOfDates = (dates) => {
  if (dates.length >= 2) {
    for (let i = 1; i < dates.length; i++) {
      if (dates[i] < dates[i - 1])
        throw new BadRequestError(
          'Не правильная последовательность дат в маршруте'
        )
    }
  }
}

const _checkCrossDowntimes = async ({ body, dates }) => {
  const sDate = new Date(dates[0])
  const matcher = {
    $match: {
      company: mongoose.Types.ObjectId(body.company),
      truck: mongoose.Types.ObjectId(body.confirmedCrew.truck),
      $expr: {
        $or: [
          {
            // Начало нового рейса внутри Downtime
            $and: [
              { $lte: ['$startPositionDate', sDate] },
              { $gte: ['$endPositionDate', sDate] }
            ]
          }
        ]
      }
    }
  }
  if (dates.length >= 2) {
    const eDate = new Date(dates[dates.length - 1])
    // пересечение по последней дате нового рейса
    matcher.$match.$expr.$or.push({
      $and: [
        { $lte: ['$startPositionDate', eDate] },
        { $gte: ['$endPositionDate', eDate] }
      ]
    })

    // перекрытие рейса
    matcher.$match.$expr.$or.push({
      $and: [
        { $gte: ['$startPositionDate', sDate] },
        { $lte: ['$endPositionDate', eDate] }
      ]
    })
  }
  const res = await Downtime.aggregate([matcher])
  if (res.length)
    throw new BadRequestError(
      'Сохранение не возможно! Имеется пересечение с "сервисом"'
    )
  return null
}

export default async ({ body, id }) => {
  const dates = []
  body.route.forEach((point) => {
    if (point.arrivalDate) dates.push(new Date(point.arrivalDate))
    if (point.departureDate) dates.push(new Date(point.departureDate))
  })
  if (dates.length === 0) return null
  if (!body.confirmedCrew.truck) return null

  _checkSequenceOfDates(dates)
  await _checkUnfinishedOrder({ body, id })
  await _checkCrossDowntimes({ body, dates })

  const orders = await Order.aggregate(_getPipeline({ dates, body, id }))
  if (orders.length > 0)
    throw new BadRequestError(
      'Сохранение невозможно! Имеется пересечение с другими рейсами'
    )

  return null
}
