import mongoose from 'mongoose'
import { BadRequestError } from '../../helpers/errors.js'
import { Order, Downtime } from '../../models/index.js'

const _getDatesFromBody = ({ body }) => {
  const tmpDates = []
  if (body.type) {
    tmpDates.push(new Date(body.startPositionDate))
    tmpDates.push(new Date(body.endPositionDate))
  } else {
    body.route.forEach((point) => {
      if (point.arrivalDate) tmpDates.push(new Date(point.arrivalDate))
      if (point.departureDate) tmpDates.push(new Date(point.departureDate))
    })
  }
  return tmpDates
}

const _checkUnfinishedOrder = async ({ body, id }) => {
  const truckId = mongoose.Types.ObjectId(
    body.confirmedCrew?.truck || body.truck,
  )
  const matcher = {
    $match: {
      isActive: true,
      'confirmedCrew.truck': truckId,
      $expr: {
        $and: [
          {
            $getField: {
              field: 'arrivalDate',
              input: { $first: '$route' },
            },
          },
          {
            $not: [
              {
                $getField: {
                  field: 'departureDate',
                  input: { $last: '$route' },
                },
              },
            ],
          },
        ],
      },
    },
  }
  if (id && !body.type)
    matcher.$match._id = { $ne: mongoose.Types.ObjectId(id) }
  const orders = await Order.aggregate([matcher])
  if (orders.length > 0)
    throw new BadRequestError('У грузовика есть незавершенные рейсы')
}

const _checkSequenceOfDates = (dates) => {
  if (dates.length >= 2) {
    for (let i = 1; i < dates.length; i++) {
      if (dates[i] < dates[i - 1])
        throw new BadRequestError(
          'Не правильная последовательность дат в маршруте',
        )
    }
  }
}

const _checkCrossDowntimes = async ({ body, dates, id }) => {
  const sDate = new Date(dates[0])
  const truckId = mongoose.Types.ObjectId(
    body.confirmedCrew?.truck || body.truck,
  )
  const matcher = {
    $match: {
      isActive: true,
      company: mongoose.Types.ObjectId(body.company),
      truck: truckId,
      $expr: {
        $or: [
          {
            // Начало нового рейса внутри Downtime
            $and: [
              { $lte: ['$startPositionDate', sDate] },
              { $gte: ['$endPositionDate', sDate] },
            ],
          },
        ],
      },
    },
  }
  if (id) matcher.$match._id = { $ne: mongoose.Types.ObjectId(id) }

  if (dates.length >= 2) {
    const eDate = new Date(dates[dates.length - 1])
    // пересечение по последней дате нового рейса
    matcher.$match.$expr.$or.push({
      $and: [
        { $lte: ['$startPositionDate', eDate] },
        { $gte: ['$endPositionDate', eDate] },
      ],
    })
    // перекрытие рейса
    matcher.$match.$expr.$or.push({
      $and: [
        { $gte: ['$startPositionDate', sDate] },
        { $lte: ['$endPositionDate', eDate] },
      ],
    })
  }

  // При сохранении рейса исключить Downtime с inOrderTime: true
  if (!body.type) matcher.$match.inOrderTime = { $ne: true }

  const res = await Downtime.aggregate([matcher])
  if (res.length)
    throw new BadRequestError(
      'Сохранение не возможно! Имеется пересечение с "сервисом"',
    )
  return null
}

const _checkCrossOrders = async ({ body, dates, id }) => {
  const sDate = new Date(dates[0])
  const truckId = mongoose.Types.ObjectId(
    body.confirmedCrew?.truck || body.truck,
  )
  const matcher = {
    $match: {
      isActive: true,
      company: mongoose.Types.ObjectId(body.company),
      'confirmedCrew.truck': truckId,
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
                      input: { $first: '$route' },
                    },
                  },
                  sDate,
                ],
              },
              {
                $gte: [
                  {
                    $getField: {
                      field: 'departureDate',
                      input: { $last: '$route' },
                    },
                  },
                  sDate,
                ],
              },
            ],
          },
        ],
      },
    },
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
                input: { $first: '$route' },
              },
            },
            eDate,
          ],
        },
        {
          $gte: [
            {
              $getField: {
                field: 'departureDate',
                input: { $last: '$route' },
              },
            },
            eDate,
          ],
        },
      ],
    })

    // перекрытие рейса
    matcher.$match.$expr.$or.push({
      $and: [
        {
          $gte: [
            {
              $getField: {
                field: 'arrivalDate',
                input: { $first: '$route' },
              },
            },
            sDate,
          ],
        },
        {
          $lte: [
            {
              $getField: {
                field: 'departureDate',
                input: { $last: '$route' },
              },
            },
            eDate,
          ],
        },
      ],
    })
  }
  if (id) matcher.$match._id = { $ne: mongoose.Types.ObjectId(id) }

  const orders = await Order.aggregate([matcher])
  if (orders.length > 0)
    throw new BadRequestError(
      'Сохранение невозможно! Имеется пересечение с рейсами',
    )
}

export default async ({ body, id }) => {
  if (!!body.type && !body.truck)
    throw new BadRequestError('Запрос не корректен')
  if (!body.type && !body.confirmedCrew?.truck) return null
  const dates = _getDatesFromBody({ body })
  if (dates.length === 0) return null

  _checkSequenceOfDates(dates)
  if (!body.type) await _checkUnfinishedOrder({ body, id })
  await _checkCrossDowntimes({ body, dates, id })
  if (!body.type) await _checkCrossOrders({ body, dates, id })

  return null
}
